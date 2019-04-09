/* eslint-env node */

'use strict';

const { dest, parallel, series, src, task } = require('gulp');

task
(
    'clean',
    async () =>
    {
        const del = require('del');

        await del(['.nyc_output', 'coverage', 'lib/**/*.{d.ts,min.js}']);
    },
);

task
(
    'create-ts-defs',
    () =>
    {
        const hb = require('gulp-hb');
        const rename = require('gulp-rename');

        const indexesList = [];
        {
            let indexes = [];
            for (let index = 1; index <= 10; ++index)
            {
                indexes = [...indexes, index];
                indexesList.push(indexes);
            }
        }

        const joinTs = (indexes, separator) => indexes.map(index => `T${index}`).join(separator);

        const stream =
        src('src/*.hbs')
        .pipe(hb({ compileOptions: { noEscape: true } }).data({ indexesList }).helpers({ joinTs }))
        .pipe(rename({ extname: '' }))
        .pipe(dest('lib'));
        return stream;
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
        const cmd = fork(nycPath, [mochaPath, 'test/**/*.spec.js']);
        cmd.on('exit', code => callback(code && 'Test failed'));
    },
);

task
(
    'coverage',
    callback =>
    {
        const NYC = require('nyc');

        const argv = { cwd: __dirname, reporter: 'lcov' };
        const nyc = new NYC(argv);
        nyc.report();
        callback();
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

task
(
    'default',
    series
    (parallel(series('clean', 'create-ts-defs'), 'lint'), 'test', parallel('coverage', 'minify')),
);
