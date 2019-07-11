#!/usr/bin/env node

/* eslint-env node */

'use strict';

function testExecArgv(regExp)
{
    const returnValue = execArgv.some(arg => regExp.test(arg));
    return returnValue;
}

const { execArgv } = process;

if (!testExecArgv(/^--experimental-modules(?![^=])/))
{
    const { fork } = require('child_process');

    const [, modulePath, ...args] = process.argv;
    execArgv.push('--experimental-modules', '--no-warnings');
    const childProcess = fork(modulePath, args, { execArgv });
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
    const mocha = new Mocha({ ignoreLeaks: false, globals: ['__coverage__'] });
    mocha.addFile(require.resolve('./init-spec.js'));
    const filenames = await promisify(glob)(TEST_PATTERN, { absolute: true, cwd: __dirname });
    for (const filename of filenames)
        mocha.addFile(filename);
    {
        const debug = testExecArgv(/^--inspect-brk(?![^=])/);
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
