#!/usr/bin/env node

/* eslint-env node */

'use strict';

{
    function addMissingFlag(flag)
    {
        const regExp = RegExp(`${flag}(?![^=])`);
        const flagFound = execArgv.some(arg => regExp.test(arg));
        if (!flagFound)
            childExecArgv.push(flag);
    }

    const { execArgv } = process;
    const childExecArgv = [...execArgv];
    addMissingFlag('--experimental-vm-modules');
    addMissingFlag('--harmony-top-level-await');
    if (childExecArgv.length > execArgv.length)
    {
        const { fork } = require('child_process');

        const [, modulePath, ...args] = process.argv;
        addMissingFlag('--no-warnings');
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
}

(async () =>
{
    require('./spec-helper');
    const Mocha = require('mocha');

    {
        const { url } = require('inspector');

        const inspectorUrl = url();
        if (inspectorUrl)
            Mocha.Runnable.prototype.timeout = (...args) => args.length ? undefined : 0;
    }
    const mocha = new Mocha({ checkLeaks: true });
    mocha.addFile(require.resolve('./init-spec.js'));
    const asyncGlob =
    (() =>
    {
        const glob          = require('glob');
        const { promisify } = require('util');

        const asyncGlob = promisify(glob);
        return asyncGlob;
    })();
    const filenames =
    await asyncGlob('spec/**/*.spec.{js,mjs}', { absolute: true, cwd: __dirname });
    for (const filename of filenames)
        mocha.addFile(filename);
    await mocha.loadFilesAsync();
    mocha.run
    (
        failures =>
        {
            process.exitCode = failures ? 1 : 0;
        },
    );
}
)();
