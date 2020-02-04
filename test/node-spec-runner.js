#!/usr/bin/env node

/* eslint-env node */

'use strict';

const INSPECT_BRK_REG_EXP = /^--inspect-brk(?![^=])/;

function testExecArgv(regExp)
{
    const returnValue = execArgv.some(arg => regExp.test(arg));
    return returnValue;
}

const { execArgv } = process;

if (!testExecArgv(/^--experimental-vm-modules(?![^=])/))
{
    const { fork } = require('child_process');

    const [, modulePath, ...args] = process.argv;
    const childExecArgv = execArgv.filter(execArg => !INSPECT_BRK_REG_EXP.test(execArg));
    if (childExecArgv.length < execArgv.length)
        childExecArgv.unshift('inspect');
    childExecArgv.push('--experimental-vm-modules', '--no-warnings');
    const childProcess = fork(modulePath, args, { execArgv: childExecArgv });
    childProcess.on
    (
        'exit',
        (code, signal) =>
        {
            process.exitCode = code != null ? code : 128 + signal;
        },
    );
    return;
}

require('./spec-helper');

const glob          = require('glob');
const Mocha         = require('mocha');
const { promisify } = require('util');

const TEST_PATTERN = 'spec/**/*.spec.js';

(async () =>
{
    const mocha = new Mocha({ checkLeaks: true, global: ['__coverage__'] });
    mocha.addFile(require.resolve('./init-spec.js'));
    const filenames = await promisify(glob)(TEST_PATTERN, { absolute: true, cwd: __dirname });
    for (const filename of filenames)
        mocha.addFile(filename);
    {
        const debug = testExecArgv(INSPECT_BRK_REG_EXP);
        mocha.enableTimeouts(!debug);
    }
    mocha.run
    (
        failures =>
        {
            process.exitCode = failures ? 1 : 0;
        },
    );
}
)();
