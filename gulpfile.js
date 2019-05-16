/* eslint-env node */

'use strict';

const { dest, parallel, series, src, task } = require('gulp');

task
(
    'clean',
    async () =>
    {
        const del = require('del');

        await del(['.nyc_output', 'coverage', 'lib/**/*.min.js', 'readme.md']);
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
                src: 'lib/polytype.js',
                globals: ['global', 'self'],
                parserOptions: { ecmaVersion: 7 },
            },
            {
                src: 'lib/polytype.d.ts',
                parserOptions: { project: 'tsconfig.json' },
            },
            {
                src: ['*.js', 'test/**/*.js'],
                parserOptions: { ecmaVersion: 9 },
            },
            {
                src: 'example/**/*.{js,ts}',
                globals: ['classes', 'console'],
                parserOptions: { ecmaVersion: 7, project: 'tsconfig.json', sourceType: 'module' },
                rules:
                {
                    '@typescript-eslint/unbound-method':    'off',
                    'brace-style':                          'off',
                    'no-unused-vars':
                    ['error', { varsIgnorePattern: '^(?:Green|WhiteUnit)Circle$' }],
                    'quotes':                               ['error', 'double'],
                },
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
        src('lib/polytype.js')
        .pipe(terser(minifyOpts))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(dest('lib'));
        return stream;
    },
);

task
(
    'make-toc',
    async () =>
    {
        const Handlebars = require('handlebars');
        const { readFile, writeFile } = require('fs').promises;
        const toc = require('markdown-toc');

        const input = String(await readFile('readme.md.hbs'));
        const { content } = toc(input, { firsth1: false });
        const template = Handlebars.compile(input, { noEscape: true });
        const output = template({ toc: content });
        const promise = writeFile('readme.md', output);
        return promise;
    },
);

task('default', series(parallel('clean', 'lint'), 'test', parallel('minify', 'make-toc')));
