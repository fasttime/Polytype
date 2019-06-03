#!/usr/bin/env node

/* eslint-env node */

'use strict';

const { fork } = require('child_process');

const mochaPath = require.resolve('mocha/bin/_mocha');
const [,, extname] = process.argv;
const childProcess =
fork
(
    mochaPath,
    ['--color', '--require=test/spec-helper.js', 'test/init-spec.js', 'test/spec/**/*.spec.js'],
    { env: { extname }, execArgv: ['--experimental-modules', '--no-warnings'] },
);
childProcess.on
(
    'exit',
    code =>
    {
        process.exitCode = code;
    },
);
