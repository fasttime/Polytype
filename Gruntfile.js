/* jshint node: true */

'use strict';

const JSCS_OPTIONS =
{
    disallowEmptyBlocks: true,
    // Encourage use of abbreviations: "char", "obj", "str".
    disallowIdentifierNames: ['character', 'object', 'string'],
    disallowMultipleLineBreaks: true,
    disallowMultipleVarDecl: true,
    disallowNamedUnassignedFunctions: true,
    disallowSpaceAfterObjectKeys: true,
    disallowSpaceAfterPrefixUnaryOperators: true,
    disallowSpaceBeforeComma: { allExcept: ['sparseArrays'] },
    disallowSpaceBeforePostfixUnaryOperators: true,
    disallowSpaceBeforeSemicolon: true,
    disallowSpacesInCallExpression: true,
    disallowSpacesInFunctionDeclaration: { beforeOpeningRoundBrace: true },
    disallowSpacesInNamedFunctionExpression: { beforeOpeningRoundBrace: true },
    disallowSpacesInsideBrackets: true,
    disallowSpacesInsideParentheses: true,
    disallowTabs: true,
    disallowTrailingWhitespace: 'ignoreEmptyLines',
    disallowYodaConditions: true,
    requireAlignedMultilineParams: true,
    requireBlocksOnNewline: true,
    requireEarlyReturn: true,
    requireKeywordsOnNewLine:
    [
        'break',
        'case',
        'catch',
        'continue',
        'default',
        'do',
        'else',
        'finally',
        'for',
        'return',
        'switch',
        'throw',
        'try',
        'while'
    ],
    requireLineBreakAfterVariableAssignment: true,
    requireLineFeedAtFileEnd: true,
    requireNewlineBeforeBlockStatements: true,
    requireObjectKeysOnNewLine: { allExcept: ['sameLine'] },
    requirePaddingNewLinesAfterUseStrict: true,
    requireSpaceAfterBinaryOperators: true,
    requireSpaceAfterComma: true,
    requireSpaceAfterKeywords: true,
    requireSpaceAfterLineComment: true,
    requireSpaceBeforeBinaryOperators: true,
    requireSpaceBeforeBlockStatements: true,
    requireSpaceBeforeKeywords: ['delete', 'if', 'in', 'instanceof'],
    requireSpaceBeforeObjectValues: true,
    requireSpacesInConditionalExpression: true,
    requireSpacesInForStatement: true,
    requireSpacesInsideObjectBrackets: 'all',
    validateAlignedFunctionParameters: true,
    validateIndentation: { includeEmptyLines: true, value: 4 }
};

const JSHINT_OPTIONS =
{
    // Enforcing options
    eqeqeq: true,
    esversion: 6,
    immed: true,
    maxlen: 100,
    newcap: false,
    noarg: true,
    noempty: true,
    quotmark: true,
    singleGroups: true,
    strict: true,
    trailing: true,
    undef: true,
    unused: true,
    
    // Relaxing options
    boss: true,
    elision: true,
    eqnull: true,
    evil: true,
    validthis: true,
    '-W018': true,
    '-W078': true
};

module.exports =
    grunt =>
    {
        // Project configuration.
        grunt.initConfig(
            {
                jscs:
                {
                    default: ['*.js', 'lib/**/*.js', 'test/**/*.js'],
                    options: JSCS_OPTIONS
                },
                jshint:
                {
                    default: ['*.js', 'lib/**/*.js', 'test/**/*.js'],
                    options: JSHINT_OPTIONS
                },
                mocha_istanbul: { default: 'test/**/*.spec.js' },
                node_version: { options: { nvm: false } }
            }
        );
        
        // These plugins provide necessary tasks.
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-jscs');
        grunt.loadNpmTasks('grunt-mocha-istanbul');
        grunt.loadNpmTasks('grunt-node-version');
        
        // Default task.
        grunt.registerTask('default', ['node_version', 'jshint', 'jscs', 'mocha_istanbul']);
    };
