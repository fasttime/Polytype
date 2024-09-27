/* eslint-env mocha, node */
/* global maybeIt polytypeMode */

import assert                                               from 'node:assert/strict';
import { readFile }                                         from 'node:fs/promises';
import { createRequire }                                    from 'node:module';
import { dirname, join }                                    from 'node:path';
import { fileURLToPath }                                    from 'node:url';
import { getImportStatement, getTestCase, processTestCase } from '#eslint-plugin-tstest';
import { glob }                                             from 'glob';

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
        const importStatement = getImportStatement(polytypeMode);
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
                    const sourceText = processTestCase(testCase, importStatement);
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
                        assert.equal
                        (
                            actualErrorCount,
                            0,
                            `expected no compiler errors, but got ${actualErrorCount}:` +
                            `${actualMessagesString}`,
                        );
                    }
                    else if (Array.isArray(expectedMessage))
                    {
                        assert.equal
                        (
                            actualErrorCount,
                            1,
                            `expected exactly 1 compiler error, but got ${actualErrorCount}:` +
                            `${actualMessagesString}`,
                        );
                        const [actualMessage] = testCase.actualMessages;
                        assert
                        (
                            expectedMessage.includes(actualMessage),
                            `Actual message:\n${actualMessage}`,
                        );
                    }
                    else
                    {
                        assert.equal
                        (
                            actualErrorCount,
                            1,
                            `expected exactly 1 compiler error, but got ${actualErrorCount}:` +
                            `${actualMessagesString}`,
                        );
                        const [actualMessage] = testCase.actualMessages;
                        assert.equal(actualMessage, expectedMessage);
                    }
                },
            );
        },
    );
}

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCases =
await
(async () =>
{
    async function loadTestCase(path)
    {
        const code = await readFile(path, 'utf-8');
        const testCase = getTestCase(code);
        return testCase;
    }

    const pattern = join(__dirname, 'ts-defs', '*.tstest');
    const paths = await glob(pattern);
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
        const typescriptPkgNames =
        (() =>
        {
            const require = createRequire(import.meta.url);
            const { devDependencies } = require('../../package.json');
            const typescriptPkgNames =
            Object
            .keys(devDependencies)
            .filter(devDependency => /^typescript_\d+\.\d+$/.test(devDependency));
            return typescriptPkgNames;
        }
        )();
        for (const typescriptPkgName of typescriptPkgNames)
        {
            const title = typescriptPkgName.replace(/^typescript_/, 'TypeScript ');
            describe(title, () => defineTests(typescriptPkgName));
        }
    },
);
