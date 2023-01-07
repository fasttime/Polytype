#!/usr/bin/env node

/* eslint-env node */

(async () => {
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
    if (process.config.variables.node_module_version < 88)
        addMissingFlag('--harmony-top-level-await');
    if (childExecArgv.length > execArgv.length)
    {
        const { fork } = await import('child_process');

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
    const
    [
        ,
        { default: Mocha },
        { url },
        { default: glob },
        { promisify },
        { fileURLToPath },
    ] =
    await
    Promise.all
    (
        [
            import('./spec-helper.js'),
            import('mocha'),
            import('inspector'),
            import('glob'),
            import('util'),
            import('url'),
        ],
    );

    {
        const inspectorUrl = url();
        if (inspectorUrl)
            Mocha.Runnable.prototype.timeout = (...args) => args.length ? undefined : 0;
    }
    const mocha = new Mocha({ checkLeaks: true });
    mocha.addFile(fileURLToPath(new URL('./init-spec.js', import.meta.url)));
    {
        const asyncGlob = promisify(glob);
        const __dirname = fileURLToPath(new URL('.', import.meta.url));
        const filenames =
        await asyncGlob('spec/**/*.spec.{js,mjs}', { absolute: true, cwd: __dirname });
        for (const filename of filenames)
            mocha.addFile(filename);
    }
    await mocha.loadFilesAsync();
    mocha.run
    (
        failures =>
        {
            process.exitCode = failures ? 1 : 0;
        },
    );
})();
