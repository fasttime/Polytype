'use strict';

{
    const reimport = path => import(path);
    if (typeof module !== 'undefined')
        module.exports = reimport;
    else
        self.reimport = reimport;
}
