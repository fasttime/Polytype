/* eslint-env node */

'use strict';

const gulp = require('gulp');

gulp.task
(
    'clean',
    () =>
    {
        const del = require('del');

        const stream = del(['coverage', 'lib/**/*.min.js']);
        return stream;
    }
);

gulp.task
(
    'lint:lib',
    () =>
    {
        const lint = require('gulp-fasttime-lint');

        const stream =
        gulp
        .src('lib/proxymi.js')
        .pipe(lint({ globals: ['global', 'self'], parserOptions: { ecmaVersion: 8 } }));
        return stream;
    }
);

gulp.task
(
    'lint:other',
    () =>
    {
        const lint = require('gulp-fasttime-lint');

        const stream =
        gulp.src(['*.js', 'test/**/*.js']).pipe(lint({ parserOptions: { ecmaVersion: 8 } }));
        return stream;
    }
);

gulp.task
(
    'test',
    () =>
    {
        const mocha = require('gulp-spawn-mocha');

        const stream = gulp.src('test/**/*.spec.js').pipe(mocha({ istanbul: true }));
        return stream;
    }
);

gulp.task
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
        gulp
        .src('lib/proxymi.js')
        .pipe(minify(minifyOpts))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('lib'));
        return stream;
    }
);

gulp.task
(
    'default',
    callback =>
    {
        const runSequence = require('run-sequence');

        runSequence(['clean', 'lint:lib', 'lint:other'], 'test', 'uglify', callback);
    }
);
