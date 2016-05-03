/* global Matrix, TestSuite, mocha */
/* jshint browser: true */

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
