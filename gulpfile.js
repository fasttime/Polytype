/* eslint-env node */

'use strict';

const gulp = require('gulp');

gulp.task(
    'lint',
    () =>
    {
        const lint = require('gulp-fasttime-lint');
        
        const src = ['*.js', 'lib/**/*.js', 'test/**/*.js'];
        const options =
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
                'prefer-const':             'error',
                'prefer-numeric-literals':  'error',
                'prefer-spread':            'error',
                'prefer-template':          'error',
                'rest-spread-spacing':      'error',
                'template-curly-spacing':   'error',
            },
            parserOptions: { ecmaVersion: 6 }
        };
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
        
        runSequence('lint', 'test', callback);
    }
);
