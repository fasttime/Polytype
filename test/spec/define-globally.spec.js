/* eslint-env mocha */
/* global assert, backupGlobals, loadPolytype, maybeDescribe, polytypeMode */

'use strict';

maybeDescribe
(
    polytypeMode === 'module',
    'defineGlobally',
    () =>
    {
        const globalThis = backupGlobals();
        it
        (
            'returns true',
            async () =>
            {
                const defineGlobally = await loadPolytype();
                delete globalThis.classes;
                assert.strictEqual(defineGlobally(), true);
            },
        );
        it
        (
            'returns false',
            async () =>
            {
                const defineGlobally = await loadPolytype();
                assert.strictEqual(defineGlobally(), false);
            },
        );
    },
);
