/* eslint-env browser */
/* global Matrix, mocha */

(function ()
{
    'use strict';
    
    function handleLoad()
    {
        mocha.run();
    }
    
    mocha.setup({ ui: 'bdd', reporter: Matrix });
    mocha.checkLeaks();
    addEventListener('load', handleLoad);
}
)();
