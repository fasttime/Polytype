/* eslint-env node */

'use strict';

const { dest, parallel, series, src, task } = require('gulp');

task
(
    'clean',
    async () =>
    {
        const del = require('del');

        await del(['coverage', 'lib/**/*.{d.ts,min.js}']);
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
                parserOptions: { ecmaVersion: 8 },
            },
        );
        return stream;
    },
);

task
(
    'test',
    () =>
    {
        const mocha = require('gulp-spawn-mocha');

        const stream = src('test/**/*.spec.js').pipe(mocha({ istanbul: true }));
        return stream;
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

        const joinTs =
        (indexes, operator) => indexes.map(index => `T${index}`).join(` ${operator} `);

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
    'uglify',
    () =>
    {
        const composer = require('gulp-uglify/composer');
        const rename = require('gulp-rename');
        const uglifyjs = require('uglify-es');

        const minify = composer(uglifyjs, console);
        const minifyOpts =
        {
            compress: { hoist_funs: true, passes: 2 },
            output: { comments: (node, comment) => comment.pos === 0 },
        };
        const stream =
        src('lib/proxymi.js')
        .pipe(minify(minifyOpts))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(dest('lib'));
        return stream;
    },
);

task('default', series(parallel('clean', 'lint'), 'test', parallel('create-ts-defs', 'uglify')));
