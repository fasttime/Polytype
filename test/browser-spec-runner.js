/* eslint-env browser */
/* global Matrix, mocha */

'use strict';

mocha.setup({ ignoreLeaks: false, reporter: Matrix, ui: 'bdd' });
addEventListener('load', () => mocha.run());
