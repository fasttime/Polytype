/* eslint-env node */

'use strict';

global.assert = require('assert');
require('../lib/proxymi.js');
require('./test-suite.js');
global.TestSuite.init();
