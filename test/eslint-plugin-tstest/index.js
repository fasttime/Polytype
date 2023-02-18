/* eslint-env node */

'use strict';

function getImportStatement(polytypeMode)
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

function getTestData(code)
{
    const match = code.match(/^\s*?\/\*!TESTDATA\b(?<testData>.*?)\*\//ms);
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

function processTestCase({ testData, before, after }, importStatement)
{
    const processedCode = `${before}${importStatement}/* TESTDATA${testData}*/${after}`;
    return processedCode;
}

function preprocess(text)
{
    const testCase = getTestData(text);
    if (!testCase)
        return [{ text, filename: '/..' }];
    const polytypeMode = testCase.polytypeMode ?? 'global';
    const importStatement = getImportStatement(polytypeMode);
    const processedCode = processTestCase(testCase, importStatement);
    return [{ text: processedCode, filename: '/..' }];
}

function postprocess(messageLists)
{
    return messageLists[0];
}

module.exports =
{
    getImportStatement,
    getTestData,
    processTestCase,
    processors: { '.tstest': { preprocess, postprocess } },
};
