/***************************************************************************************************

Run with:

deno run --allow-env --allow-read test/deno-spec-runner.mjs

***************************************************************************************************/

/* eslint-env browser, mocha */
/* global Deno */

import { expandGlob } from                      'https://deno.land/std/fs/expand_glob.ts';
import { dirname, fromFileUrl, toFileUrl } from 'https://deno.land/std/path/mod.ts';
import chai from                                'https://esm.sh/chai';
import                                          'https://esm.sh/mocha/mocha.js';

globalThis.chai = chai;
await import('./spec-helper.js');
window.location = new URL('about:blank'); // Browser based Mocha expects `window.location` to exist.
mocha.setup({ checkLeaks: true, reporter: 'spec', ui: 'bdd' });
await import('./init-spec.js');
{
    const __dirname = dirname(fromFileUrl(import.meta.url));
    const asyncFiles = await expandGlob('spec/common/**/*.spec.{js,mjs}', { root: __dirname });
    for await (const { path } of asyncFiles)
    {
        const fileUrl = toFileUrl(path);
        await import(fileUrl);
    }
}
mocha.run
(
    failures =>
    {
        if (failures)
            Deno.exit(1);
    },
);
