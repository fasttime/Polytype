/* eslint-env node */

'use strict';

const { dest, parallel, series, src, task } = require('gulp');

task
(
    'clean',
    () =>
    {
        const del = require('del');

        const stream = del(['coverage', 'lib/**/*.min.js']);
        return stream;
    }
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
                parserOptions: { ecmaVersion: 8 },
            },
            {
                src: ['*.js', 'test/**/*.js'],
                parserOptions: { ecmaVersion: 8 },
            }
        );
        return stream;
    }
);

task
(
    'test',
    () =>
    {
        const mocha = require('gulp-spawn-mocha');

        const stream = src('test/**/*.spec.js').pipe(mocha({ istanbul: true }));
        return stream;
    }
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
    }
);

task('default', series(parallel('clean', 'lint'), 'test', 'uglify'));
