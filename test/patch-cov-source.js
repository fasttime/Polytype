/* eslint-env node */

'use strict';

const { createRequire } = require('module');

const IGNORED_LINE =
'        throw Error(\'Polytype cannot be transpiled to ES5 or earlier code.\');\n';

const c8Require = createRequire(require.resolve('c8'));
const CovLine = c8Require('v8-to-istanbul/lib/line');
const CovSource = c8Require('v8-to-istanbul/lib/source');
CovSource.prototype._buildLines =
function (source)
{
    const { lines } = this;
    let position = 0;
    for (const [index, lineStr] of source.split(/(?<=\r?\n)/).entries())
    {
        const line = new CovLine(index + 1, position, lineStr);
        if (lineStr === IGNORED_LINE)
        {
            lines[index - 1].ignore = true;
            line.ignore = true;
        }
        lines.push(line);
        position += lineStr.length;
    }
};
