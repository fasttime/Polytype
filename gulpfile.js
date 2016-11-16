/* eslint-env node */

'use strict';

const gulp = require('gulp');

const lintOptions =
{
    envs: ['es6'],
    eslintRules:
    {
        'arrow-body-style':         ['error'],
        'arrow-parens':             ['error', 'as-needed'],
        'arrow-spacing':            'error',
        'constructor-super':        'error',
        'no-class-assign':          'error',
        'no-confusing-arrow':       ['error', { allowParens: true }],
        'no-dupe-class-members':    'error',
        'no-new-symbol':            'error',
        'no-this-before-super':     'error',
        'no-useless-computed-key':  'error',
        'no-useless-constructor':   'error',
        'no-useless-rename':        'error',
        'no-var':                   'error',
        'object-shorthand':         'error',
        'prefer-arrow-callback':    'error',
        'prefer-numeric-literals':  'error',
        'prefer-spread':            'error',
        'prefer-template':          'error',
        'rest-spread-spacing':      'error',
        'template-curly-spacing':   'error',
    },
    parserOptions: { ecmaVersion: 6 }
};

gulp.task(
    'lint:lib',
    () =>
    {
        const lint = require('gulp-fasttime-lint');
        
        const options = Object.assign({ globals: ['global', 'self'] }, lintOptions);
        const stream = gulp.src('lib/**/*.js').pipe(lint(options));
        return stream;
    }
);

gulp.task(
    'lint:other',
    () =>
    {
        const lint = require('gulp-fasttime-lint');
        
        const src = ['*.js', 'test/**/*.js'];
        const stream = gulp.src(src).pipe(lint(lintOptions));
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
        
        runSequence('lint:lib', 'lint:other', 'test', callback);
    }
);
