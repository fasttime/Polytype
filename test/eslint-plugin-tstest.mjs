/* eslint-env node */

export function getImportStatement(polytypeMode)
{
    switch (polytypeMode)
    {
    case 'global':
        return 'import \'polytype/global\';';
    case 'module':
        return 'import { classes } from \'polytype\';';
    default:
        throw Error(`Unknown mode ${polytypeMode}`);
    }
}

export function getTestCase(code)
{
    const match =
    code.match(/(?<=^|\u2028|\u2029)[^\S\r\n\u2028\u2029]?\/\*!TESTDATA\b(?<testData>.*?)\*\//msu);
    if (!match)
        return;
    const matchIndex = match.index;
    const before = code.slice(0, matchIndex);
    const after = code.slice(matchIndex + match[0].length);
    const { testData } = match.groups;
    const functionBody = `return(${testData})`;
    const testCase = Function(functionBody)();
    testCase.testData = testData;
    testCase.before = before;
    testCase.after = after;
    return testCase;
}

function postprocess(messageLists, filename)
{
    const [messages, testDataMessages] = messageLists;
    if (testDataMessages)
    {
        const testCase = fileNameToTestCaseMap.get(filename);
        fileNameToTestCaseMap.delete(filename);
        const rowDiff = (testCase.before.match(/\r\n|[\r\n\u2028\u2029]/gu)?.length || 0) - 1;
        for (const message of testDataMessages)
        {
            message.filename = filename;
            const { line, endLine } = message;
            message.line = line + rowDiff;
            if (endLine != null)
                message.endLine = endLine + rowDiff;
        }
        messages.push(...testDataMessages);
    }
    return messages;
}

function preprocess(text, filename)
{
    const testCase = getTestCase(text);
    if (!testCase)
        return [{ text, filename: '/..' }];
    fileNameToTestCaseMap.set(filename, testCase);
    const polytypeMode = testCase.polytypeMode ?? 'global';
    const importStatement = getImportStatement(polytypeMode);
    const testDataText =
    `void\n${testCase.testData}\n; // eslint-disable-line @stylistic/semi-style\n`;
    const processedCode = processTestCase(testCase, importStatement);
    const returnValue =
    [{ text: processedCode, filename: '/..' }, { text: testDataText, filename: '/test-data.mjs' }];
    return returnValue;
}

export function processTestCase({ testData, before, after }, importStatement)
{
    const processedCode = `${before}${importStatement}/* TESTDATA${testData}*/${after}`;
    return processedCode;
}

const fileNameToTestCaseMap = new Map();

export const processor = { preprocess, postprocess };
