/* eslint-env node */

'use strict';

const gulp = require('gulp');

gulp.task
(
    'clean',
    () =>
    {
        const del = require('del');

        const patterns = ['coverage', 'lib/**/*.min.js'];
        const stream = del(patterns);
        return stream;
    }
);

gulp.task
(
    'lint:lib',
    () =>
    {
        const lint = require('gulp-fasttime-lint');

        const src = ['lib/**/*.js', '!lib/**/*.min.js'];
        const options = { globals: ['global', 'self'], parserOptions: { ecmaVersion: 8 } };
        const stream = gulp.src(src).pipe(lint(options));
        return stream;
    }
);

gulp.task
(
    'lint:other',
    () =>
    {
        const lint = require('gulp-fasttime-lint');

        const src = ['*.js', 'test/**/*.js'];
        const options =
        { parserOptions: { ecmaVersion: 8 }, rules: { strict: ['error', 'global'] } };
        const stream = gulp.src(src).pipe(lint(options));
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
        const options = { compress: { hoist_funs: true, passes: 2 } };
        const stream =
        gulp
        .src('lib/proxymi.js')
        .pipe(minify(options))
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
