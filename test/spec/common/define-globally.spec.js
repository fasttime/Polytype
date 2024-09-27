/* eslint-env mocha */
/* global assert backupGlobals loadPolytype maybeDescribe polytypeMode */

'use strict';

maybeDescribe
(
    polytypeMode === 'module',
    'defineGlobally',
    () =>
    {
        let defineGlobally;

        before
        (async () => { defineGlobally = await loadPolytype(); });

        after
        (() => { defineGlobally = null; });

        backupGlobals();

        describe
        (
            'with a falsy argument',
            () =>
            {
                it
                (
                    'returns true',
                    () =>
                    {
                        delete globalThis.classes;
                        assert.strictEqual(defineGlobally(), true);
                        assert.isFunction(globalThis.classes);
                        assert.isFunction(Object.getPrototypeListOf);
                    },
                );

                it
                (
                    'returns false',
                    () =>
                    {
                        assert.strictEqual(defineGlobally(), false);
                    },
                );
            },
        );

        describe
        (
            'with a truthy argument',
            () =>
            {
                it
                (
                    'returns true',
                    () =>
                    {
                        assert.strictEqual(defineGlobally(true), true);
                        assert.isNotFunction(globalThis.classes);
                        assert.isNotFunction(Object.getPrototypeListOf);
                    },
                );

                it
                (
                    'returns false',
                    () =>
                    {
                        delete globalThis.classes;
                        assert.strictEqual(defineGlobally(true), false);
                    },
                );
            },
        );
    },
);
