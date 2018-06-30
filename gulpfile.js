/* eslint-env node */

'use strict';

const gulp = require('gulp');

gulp.task(
    'lint:lib',
    () =>
    {
        const lint = require('gulp-fasttime-lint');

        const src = 'lib/**/*.js';
        const options = { globals: ['global', 'self'], parserOptions: { ecmaVersion: 6 } };
        const stream = gulp.src(src).pipe(lint(options));
        return stream;
    }
);

gulp.task(
    'lint:other',
    () =>
    {
        const lint = require('gulp-fasttime-lint');

        const src = ['*.js', 'test/**/*.js'];
        const options =
        { parserOptions: { ecmaVersion: 6 }, rules: { strict: ['error', 'global'] } };
        const stream = gulp.src(src).pipe(lint(options));
        return stream;
    }
);

gulp.task(
    'test',
    () =>
    {
        const mocha = require('gulp-spawn-mocha');

        const stream = gulp.src('test/**/*.spec.js').pipe(mocha({ istanbul: true }));
        return stream;
    }
);

gulp.task(
    'default',
    callback =>
    {
        const runSequence = require('run-sequence');

        runSequence(['lint:lib', 'lint:other'], 'test', callback);
    }
);
