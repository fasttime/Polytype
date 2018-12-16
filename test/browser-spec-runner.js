/* eslint-env browser */
/* global MochaBar, mocha */

'use strict';

mocha.setup({ ignoreLeaks: false, reporter: MochaBar, ui: 'bdd' });
addEventListener('load', () => mocha.run());
