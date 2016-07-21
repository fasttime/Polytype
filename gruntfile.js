/* eslint-env node */

'use strict';

module.exports =
    grunt =>
    {
        // Project configuration.
        grunt.initConfig(
            {
                fasttime_lint:
                {
                    default: ['*.js', 'lib/**/*.js', 'test/**/*.js'],
                    options: { envs: ['es6'], parserOptions: { ecmaVersion: 6 } }
                },
                mocha_istanbul: { default: 'test/**/*.spec.js' },
                node_version: { options: { nvm: false } }
            }
        );
        
        // These plugins provide necessary tasks.
        grunt.loadNpmTasks('grunt-fasttime-lint');
        grunt.loadNpmTasks('grunt-mocha-istanbul');
        grunt.loadNpmTasks('grunt-node-version');
        
        // Default task.
        grunt.registerTask('default', ['node_version', 'fasttime_lint', 'mocha_istanbul']);
    };
