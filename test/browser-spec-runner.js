/* eslint-env browser */
/* global MochaBar, mocha */

'use strict';

mocha.setup({ reporter: MochaBar, ui: 'bdd' });
mocha.checkLeaks();
addEventListener
(
    'DOMContentLoaded',
    () =>
    {
        mocha.run();
        const extnameField = document.getElementById('extname');
        const urlParams = new URLSearchParams(location.search);
        const extname = urlParams.get('extname');
        extnameField.value = extname;
        if (!extnameField.value)
            extnameField.options[0].selected = true;
        extnameField.addEventListener
        (
            'change',
            () =>
            {
                const extname = extnameField.value;
                const url = new URL(location);
                url.searchParams.set('extname', extname);
                location.assign(url);
            },
        );
    },
);
