/* eslint-env node */

'use strict';

const { createRequire } = require('module');

const IGNORED_LINE =
'        throw Error(\'Polytype cannot be transpiled to ES5 or earlier code.\');\n';

const c8Require = createRequire(require.resolve('c8'));
const { prototype: covSourcePrototype } = c8Require('v8-to-istanbul/lib/source');
const { _parseIgnore } = covSourcePrototype;
covSourcePrototype._parseIgnore =
function (lineStr)
{
    let ignoreToken = _parseIgnore.call(this, lineStr);
    if (ignoreToken)
        return ignoreToken;
    if (lineStr === IGNORED_LINE)
    {
        ignoreToken = { count: 0 };
        return ignoreToken;
    }
};
