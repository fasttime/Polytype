/* eslint-env node */

'use strict';

const { parallel, series, src, task }   = require('gulp');
const syncReadable                      = require('sync-readable');

async function bundle(inputPath, format, outputPath, outputPathMin)
{
    const { homepage, version } = require('./package.json');
    const { rollup }            = require('rollup');
    const cleanup               = require('rollup-plugin-cleanup');

    function addOutput(file, compact, plugins)
    {
        const outputOptions =
        {
            banner:     `// Polytype ${version} – ${homepage}\n`,
            compact,
            esModule:   false,
            file,
            format,
            plugins,
        };
        const promise = bundle.write(outputOptions);
        outputPromises.push(promise);
    }

    const cleanupPlugin = cleanup({ maxEmptyLines: -1 });
    const inputOptions = { input: inputPath, plugins: [cleanupPlugin] };
    const bundle = await rollup(inputOptions);
    const outputPromises = [];
    addOutput(outputPath);
    if (outputPathMin != null)
    {
        const { terser } = require('rollup-plugin-terser');

        const minifyOpts =
        { compress: { passes: 2 }, output: { comments: (node, comment) => comment.pos === 0 } };
        const terserPlugin = terser(minifyOpts);
        addOutput(outputPathMin, true, [terserPlugin]);
    }
    await Promise.all(outputPromises);
}

function readFileAsString(inputPath)
{
    const { readFile } = require('node:fs/promises');

    const promise = readFile(inputPath, 'utf8');
    return promise;
}

task
(
    'clean',
    async () =>
    {
        const { rm } = require('node:fs/promises');

        const paths = ['coverage', 'lib', 'readme.md', 'test/spec-runner.html'];
        const options = { force: true, recursive: true };
        await Promise.all(paths.map(path => rm(path, options)));
    },
);

task
(
    'make-ts-defs',
    async () =>
    {
        const { mkdir, writeFile }  = require('node:fs/promises');
        const { version }           = require('./package.json');
        const Handlebars            = require('handlebars');

        async function writeOutput(outputPath, asModule)
        {
            const output = template({ asModule, version });
            await writeFile(outputPath, output);
        }

        const mkdirPromise = mkdir('lib', { recursive: true });
        const input = await readFileAsString('src/polytype.d.ts.hbs');
        const template = Handlebars.compile(input, { noEscape: true });
        await mkdirPromise;
        const promises =
        [
            writeOutput('lib/polytype-global.d.ts', false),
            writeOutput('lib/polytype-module.d.ts', true),
        ];
        await Promise.all(promises);
    },
);

task
(
    'lint',
    syncReadable
    (
        async () =>
        {
            const
            [
                { processor: tsTestProcessor },
                { createConfig },
                { EslintEnvProcessor },
                { default: globals },
                { default: gulpESLintNew },
            ] =
            await Promise.all
            (
                [
                    import('#eslint-plugin-tstest'),
                    import('@origin-1/eslint-config'),
                    import('eslint-plugin-eslint-env'),
                    import('globals'),
                    import('gulp-eslint-new'),
                ],
            );
            const JS_EXAMPLE_RULES =
            {
                '@stylistic/comma-dangle':
                [
                    'error',
                    {
                        'arrays':       'always-multiline',
                        'objects':      'always-multiline',
                        'imports':      'always-multiline',
                        'exports':      'always-multiline',
                        'functions':    'only-multiline',
                    },
                ],
                'no-unused-vars':
                [
                    'error',
                    {
                        args:               'none',
                        caughtErrors:       'all',
                        ignoreRestSiblings: true,
                        vars:               'local',
                        varsIgnorePattern:  '^(?:Green|WhiteUnit)Circle$',
                    },
                ],
                '@stylistic/quotes': ['error', 'double'],
            };
            const { 'no-unused-vars': noUnusedVars, ...TS_EXAMPLE_RULES } = JS_EXAMPLE_RULES;
            TS_EXAMPLE_RULES['@typescript-eslint/no-unused-vars'] = noUnusedVars;
            const overrideConfig =
            await createConfig
            (
                { processor: new EslintEnvProcessor() },
                {
                    files:              ['**/*.js'],
                    ignores:            ['src/**/*.js'],
                    jsVersion:          2022,
                    languageOptions:    { sourceType: 'commonjs' },
                },
                {
                    files:      ['src/**/*.js'],
                    jsVersion:  2020,
                },
                {
                    files:      ['**/*.mjs'],
                    jsVersion:  2022,
                },
                {
                    files:      ['**/*.ts', '**/*.tstest'],
                    tsVersion:  '4.7.0',
                    languageOptions:
                    {
                        parserOptions:
                        { extraFileExtensions: ['.tstest'], project: 'tsconfig.json' },
                    },
                },
                {
                    files:              ['example/**/*.js'],
                    languageOptions:    { globals: { ...globals.node } },
                    rules:              JS_EXAMPLE_RULES,
                },
                {
                    files:              ['example/**/*.ts'],
                    languageOptions:    { globals: { ...globals.node } },
                    rules:              TS_EXAMPLE_RULES,
                },
                {
                    files:      ['lib/**/*.d.ts'],
                    rules:      { '@stylistic/max-len': 'off' },
                },
                {
                    files:      ['**/*.tstest'],
                    processor:  tsTestProcessor,
                    rules:
                    {
                        '@stylistic/spaced-comment':                    'off',
                        '@typescript-eslint/no-extraneous-class':       'off',
                        '@typescript-eslint/no-misused-new':            'off',
                        '@typescript-eslint/no-unused-vars':            'off',
                        '@typescript-eslint/no-useless-constructor':    'off',
                        'no-duplicate-imports':                         'off',
                    },
                },
            );
            const stream =
            src
            (
                [
                    '*.js',
                    'example/**/*.{js,ts}',
                    'lib/**/*.d.ts',
                    'src/**/*.js',
                    'test/**/*.{js,mjs,tstest}',
                ],
            )
            .pipe
            (
                gulpESLintNew
                (
                    {
                        configType:         'flat',
                        overrideConfig,
                        overrideConfigFile: true,
                        warnIgnored:        true,
                    },
                ),
            )
            .pipe(gulpESLintNew.format('compact'))
            .pipe(gulpESLintNew.failAfterError());
            return stream;
        },
    ),
);

task('bundle:cjs', () => bundle('src/polytype-esm.js', 'cjs', 'lib/polytype.cjs'));

task
(
    'bundle:esm',
    () => bundle('src/polytype-esm.js', 'esm', 'lib/polytype.mjs', 'lib/polytype.min.mjs'),
);

task
(
    'bundle:global',
    () => bundle('src/polytype-global.js', 'iife', 'lib/polytype.js', 'lib/polytype.min.js'),
);

task
(
    'test',
    async () =>
    {
        const [{ default: c8js }] =
        await Promise.all([import('c8js'), import('./test/patch-cov-source.mjs')]);
        await c8js
        (
            'test/node-spec-runner.mjs',
            { reporter: ['html', 'text-summary'], useC8Config: false },
        );
    },
);

task
(
    'make-spec-runner',
    async () =>
    {
        const { readdir, writeFile }    = require('node:fs/promises');
        const { extname }               = require('node:path');
        const Handlebars                = require('handlebars');

        async function getSpecs()
        {
            const filenames = await readdir('test/spec/common');
            const specs = filenames.filter(filename => extname(filename) === '.js').sort();
            return specs;
        }

        async function getTemplate()
        {
            const input = await readFileAsString('src/spec-runner.html.hbs');
            const template = Handlebars.compile(input);
            return template;
        }

        const promises = [getTemplate(), getSpecs()];
        const [template, specs] = await Promise.all(promises);
        const output = template({ specs });
        await writeFile('test/spec-runner.html', output);
    },
);

task
(
    'make-toc',
    async () =>
    {
        const { chmod, writeFile }  = require('node:fs/promises');
        const { version }           = require('./package.json');
        const Handlebars            = require('handlebars');
        const toc                   = require('markdown-toc');

        const promises =
        [
            readFileAsString('src/readme.md.hbs'),
            chmod('readme.md', 0o666)
            .catch
            (
                reason =>
                {
                    if (reason.code !== 'ENOENT')
                        throw reason;
                },
            ),
        ];
        const [input] = await Promise.all(promises);
        const { content } = toc(input, { firsth1: false });
        const template = Handlebars.compile(input, { noEscape: true });
        const output = template({ toc: content, version });
        await writeFile('readme.md', output, { mode: 0o444 });
    },
);

task
(
    'default',
    series
    (
        'clean',
        'make-ts-defs',
        'lint',
        parallel('bundle:cjs', 'bundle:esm', 'bundle:global'),
        'test',
        parallel('make-spec-runner', 'make-toc'),
    ),
);

task
(
    'build',
    series
    (
        'make-ts-defs',
        parallel('bundle:cjs', 'bundle:esm', 'bundle:global'),
        parallel('make-spec-runner', 'make-toc'),
    ),
);
