/* eslint-env browser */
/* global Matrix, TestSuite, mocha */

(function ()
{
    'use strict';
    
    function handleLoad()
    {
        mocha.run();
    }
    
    mocha.setup({ ui: 'bdd', reporter: Matrix });
    mocha.checkLeaks();
    TestSuite.init();
    addEventListener('load', handleLoad);
}
)();
