/* eslint-env mocha, node */
/* global maybeIt, polytypeMode */

import { ok, strictEqual }          from 'assert';
import { promises as fsPromises }   from 'fs';
import glob                         from 'glob';
import { createRequire }            from 'module';
import { dirname, join }            from 'path';
import { fileURLToPath }            from 'url';
import { promisify }                from 'util';

export default async function ()
{
    const pattern = join(__dirname, 'ts-defs', '*.tstest');
    const paths = await promisify(glob)(pattern);
    const promises = paths.map(loadTestCase);
    testCases = await Promise.all(promises);

    const require = createRequire(import.meta.url);
    ({ compilerOptions } = require('../../tsconfig.json'));

    describe
    (
        'TypeScript definitions',
        () =>
        {
            describe('TypeScript 4.2', () => defineTests('typescript_4.2'));
            describe('TypeScript 4.3', () => defineTests('typescript_4.3'));
        },
    );
}

function defineTests(typescriptPkgName)
{
    const actualize =
    async () =>
    {
        function doCreateProgram()
        {
            const cwd = process.cwd();
            {
                const directory = dirname(dirname(__dirname));
                process.chdir(directory);
            }
            try
            {
                const program = createProgram(fileNames, options, host);
                return program;
            }
            finally
            {
                process.chdir(cwd);
            }
        }

        const
        {
            default:
            {
                convertCompilerOptionsFromJson,
                createCompilerHost,
                createProgram,
                createSourceFile,
                flattenDiagnosticMessageText,
                getPreEmitDiagnostics,
            },
        } =
        await import(typescriptPkgName);
        const { options } = convertCompilerOptionsFromJson(compilerOptions);
        let pkgPath;
        let footer;
        switch (polytypeMode)
        {
        case 'global':
            pkgPath = '.';
            footer = 'import { classes } from \'.\';\n';
            break;
        case 'module':
            pkgPath = './global';
            footer = 'export { };\n';
            break;
        }
        options.types = [pkgPath];
        const fileNames = [];
        testCases.forEach
        (
            (testCase, index) =>
            {
                testCase.actualMessages = [];
                fileNames.push(`:${index}`);
            },
        );
        const sourceFiles = [];
        const host = createCompilerHost({ });
        {
            const { getSourceFile } = host;
            host.getSourceFile =
            (fileName, languageVersion, onError) =>
            {
                let sourceFile;
                const match = /^:(?<baseName>\d+)\.ts$/.exec(fileName);
                if (match)
                {
                    const testCase = testCases[match.groups.baseName];
                    const sourceText = `${testCase.code}${footer}`;
                    sourceFile = createSourceFile(fileName, sourceText);
                    sourceFile.testCase = testCase;
                    sourceFiles.push(sourceFile);
                }
                else
                    sourceFile = getSourceFile(fileName, languageVersion, onError);
                return sourceFile;
            };
        }
        const program = doCreateProgram();
        for (const sourceFile of sourceFiles)
        {
            const { actualMessages } = sourceFile.testCase;
            getPreEmitDiagnostics(program, sourceFile).forEach
            (
                ({ messageText }) =>
                {
                    const message = flattenDiagnosticMessageText(messageText, '\n');
                    actualMessages.push(message);
                },
            );
        }
    };

    before
    (
        async function ()
        {
            this.timeout(10000);
            await actualize();
        },
    );

    testCases.forEach
    (
        testCase =>
        {
            const { expectedMessage, polytypeMode: currentPolytypeMode } = testCase;

            maybeIt
            (
                currentPolytypeMode === undefined || currentPolytypeMode === polytypeMode,
                testCase.title,
                () =>
                {
                    const { actualMessages } = testCase;
                    const actualErrorCount = testCase.actualMessages.length;
                    const actualMessagesString =
                    actualMessages.map(message => `\n${message}`).join('');
                    if (expectedMessage === undefined)
                    {
                        strictEqual
                        (
                            actualErrorCount,
                            0,
                            `expected no compiler errors, but got ${actualErrorCount}:` +
                            `${actualMessagesString}`,
                        );
                    }
                    else
                    {
                        strictEqual
                        (
                            actualErrorCount,
                            1,
                            `expected exactly 1 compiler error, but got ${actualErrorCount}:` +
                            `${actualMessagesString}`,
                        );
                        const [actualMessage] = testCase.actualMessages;
                        if (expectedMessage instanceof RegExp)
                            ok(expectedMessage.test(actualMessage));
                        else
                            strictEqual(actualMessage, expectedMessage);
                    }
                },
            );
        },
    );
}

async function loadTestCase(path)
{
    const { readFile } = fsPromises;
    const code = await readFile(path, 'utf-8');
    const match = code.match(/^\s*\/\*!TESTDATA\b(?<testData>.*?)\*\//ms);
    const functionBody = `return(${match.groups.testData})`;
    const testCase = Function(functionBody)();
    testCase.code = code;
    return testCase;
}

const __dirname = dirname(fileURLToPath(import.meta.url));

let compilerOptions;
let testCases;
