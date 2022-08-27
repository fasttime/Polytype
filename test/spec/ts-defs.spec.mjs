/* eslint-env mocha, node */
/* global maybeIt, polytypeMode */

import assert               from 'assert';
import { readFile }         from 'fs/promises';
import glob                 from 'glob';
import { createRequire }    from 'module';
import { dirname, join }    from 'path';
import { fileURLToPath }    from 'url';
import { promisify }        from 'util';

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
                        assert.strictEqual
                        (
                            actualErrorCount,
                            0,
                            `expected no compiler errors, but got ${actualErrorCount}:` +
                            `${actualMessagesString}`,
                        );
                    }
                    else
                    {
                        assert.strictEqual
                        (
                            actualErrorCount,
                            1,
                            `expected exactly 1 compiler error, but got ${actualErrorCount}:` +
                            `${actualMessagesString}`,
                        );
                        const [actualMessage] = testCase.actualMessages;
                        if (expectedMessage instanceof RegExp)
                            assert.ok(expectedMessage.test(actualMessage));
                        else
                            assert.strictEqual(actualMessage, expectedMessage);
                    }
                },
            );
        },
    );
}

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCases =
await (async () =>
{
    async function loadTestCase(path)
    {
        const code = await readFile(path, 'utf-8');
        const match = code.match(/^\s*\/\*!TESTDATA\b(?<testData>.*?)\*\//ms);
        const functionBody = `return(${match.groups.testData})`;
        const testCase = Function(functionBody)();
        testCase.code = code;
        return testCase;
    }

    const pattern = join(__dirname, 'ts-defs', '*.tstest');
    const paths = await promisify(glob)(pattern);
    const promises = paths.map(loadTestCase);
    const testCases = await Promise.all(promises);
    return testCases;
}
)();

const compilerOptions =
(() =>
{
    const require = createRequire(import.meta.url);
    const { compilerOptions } = require('../../tsconfig.json');
    return compilerOptions;
}
)();

describe
(
    'TypeScript definitions',
    () =>
    {
        describe('TypeScript 4.2', () => defineTests('typescript_4.2'));
        describe('TypeScript 4.3', () => defineTests('typescript_4.3'));
        describe('TypeScript 4.4', () => defineTests('typescript_4.4'));
        describe('TypeScript 4.5', () => defineTests('typescript_4.5'));
        describe('TypeScript 4.6', () => defineTests('typescript_4.6'));
        describe('TypeScript 4.7', () => defineTests('typescript_4.7'));
        describe('TypeScript 4.8', () => defineTests('typescript_4.8'));
    },
);
