#!/usr/bin/env node

/* eslint-env node */

'use strict';

const { fork } = require('child_process');

const mochaPath = require.resolve('mocha/bin/_mocha');
const [,, extname] = process.argv;
const env = extname == null ? null : { extname };
const execArgv = ['--no-warnings'];
if (extname === '.mjs')
    execArgv.push('--experimental-modules');
const childProcess =
fork
(
    mochaPath,
    ['--color', '--require=test/spec-helper.js', 'test/init-spec.js', 'test/spec/**/*.spec.js'],
    { env, execArgv },
);
childProcess.on
(
    'exit',
    code =>
    {
        process.exitCode = code;
    },
);
