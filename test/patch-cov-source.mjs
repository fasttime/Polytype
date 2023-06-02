/* eslint-env node */

import { createRequire } from 'node:module';

const IGNORED_LINE =
'        throw Error(\'Polytype cannot be transpiled to ES5 or earlier code.\');\n';

const require = createRequire(import.meta.url);
const c8jsRequire = createRequire(require.resolve('c8js'));
const c8Require = createRequire(c8jsRequire.resolve('c8'));
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
