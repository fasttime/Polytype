#!/usr/bin/env node --experimental-modules --no-warnings

/* eslint-env node */

'use strict';

require('./spec-helper');

const glob          = require('glob');
const Mocha         = require('mocha');
const { promisify } = require('util');

const TEST_PATTERN = 'spec/**/*.spec.js';

(async () =>
{
    const mocha = new Mocha();
    mocha.addFile(require.resolve('./init-spec.js'));
    const filenames = await promisify(glob)(TEST_PATTERN, { absolute: true, cwd: __dirname });
    for (const filename of filenames)
        mocha.addFile(filename);
    {
        const debug = process.execArgv.some(arg => arg.startsWith('--inspect-brk='));
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
