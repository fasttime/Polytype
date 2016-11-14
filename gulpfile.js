/* eslint-env node */

'use strict';

var gulp = require('gulp');

gulp.task(
    'lint',
    function ()
    {
        var lint = require('gulp-fasttime-lint');
        
        var SRC = ['*.js', 'lib/**/*.js', 'test/**/*.js'];
        var stream = gulp.src(SRC).pipe(lint({ envs: ['es6'], parserOptions: { ecmaVersion: 6 } }));
        return stream;
    }
);

gulp.task(
    'test',
    function ()
    {
        var mocha = require('gulp-spawn-mocha');
        
        var stream = gulp.src('test/**/*.spec.js').pipe(mocha({ istanbul: true }));
        return stream;
    }
);

gulp.task(
    'default',
    function (callback)
    {
        var runSequence = require('run-sequence');
        
        runSequence('lint', 'test', callback);
    }
);
