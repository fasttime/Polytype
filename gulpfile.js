/* eslint-env node */

'use strict';

const { dest, parallel, series, src, task } = require('gulp');

task
(
    'clean',
    async () =>
    {
        const del = require('del');

        await del(['.nyc_output', 'coverage', 'lib/**/*.min.js']);
    },
);

task
(
    'lint',
    () =>
    {
        const lint = require('gulp-fasttime-lint');

        const stream =
        lint
        (
            {
                src: 'lib/proxymi.js',
                globals: ['global', 'self'],
                parserOptions: { ecmaVersion: 7 },
            },
            {
                src: 'lib/proxymi.d.ts',
                parserOptions: { project: 'tsconfig.json' },
            },
            {
                src: ['*.js', 'test/**/*.js'],
                parserOptions: { ecmaVersion: 9 },
            },
        );
        return stream;
    },
);

task
(
    'test',
    callback =>
    {
        const { fork } = require('child_process');

        const { resolve } = require;
        const nycPath = resolve('nyc/bin/nyc');
        const mochaPath = resolve('mocha/bin/mocha');
        const cmd =
        fork
        (
            nycPath,
            ['--reporter=html', '--reporter=text-summary', '--', mochaPath, 'test/**/*.spec.js'],
        );
        cmd.on('exit', code => callback(code && 'Test failed'));
    },
);

task
(
    'minify',
    () =>
    {
        const rename = require('gulp-rename');
        const terser = require('gulp-terser');

        const minifyOpts =
        {
            compress: { hoist_funs: true, passes: 2 },
            output: { comments: (node, comment) => comment.pos === 0 },
        };
        const stream =
        src('lib/proxymi.js')
        .pipe(terser(minifyOpts))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(dest('lib'));
        return stream;
    },
);

task('default', series(parallel('clean', 'lint'), 'test', 'minify'));
