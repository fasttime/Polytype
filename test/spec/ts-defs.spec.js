/* eslint-env mocha, node */
/* global maybeIt, polytypeMode */

'use strict';

const switchByTypeScriptVersion =
(versionRange, messageTrue, messageFalse) =>
{
    const { satisfies } = require('semver');
    const { version }   = require('typescript/package.json');

    const message = satisfies(version, versionRange) ? messageTrue : messageFalse;
    return message;
};

const testCases =
[
    {
        title: 'SuperConstructorInvokeInfo (module version)',
        polytypeMode: 'module',
        code:
        `
import { SuperConstructorInvokeInfo } from '.';
        `,
    },
    {
        title: 'SuperConstructorInvokeInfo (global version)',
        polytypeMode: 'global',
        code:
        `
import { SuperConstructorInvokeInfo } from './global';
        `,
    },
    {
        title: 'classes global is read-only',
        polytypeMode: 'global',
        code:
        `
classes = classes;
        `,
        expectedMessage: 'Cannot assign to \'classes\' because it is not a variable.',
    },
    {
        title: 'Object.getPrototypeListOf',
        polytypeMode: 'global',
        code:
        `
void Object.getPrototypeListOf;
        `,
    },
    {
        title: 'Ordinary multiple inheritance',
        code:
        `
class A
{
    constructor(a: object)
    { }

    a(): void
    { }

    protected _a(): void
    { }

    static sa(): void
    { }

    protected static _sa(): void
    { }
}

class B
{
    constructor(b: object)
    { }

    b(): void
    { }

    protected _b(): void
    { }

    static sb(): void
    { }

    protected static _sb(): void
    { }
}

void
class extends classes(A, B)
{
    constructor()
    {
        super();
    }
};

void
class extends classes(A, B)
{
    constructor()
    {
        const args1 = [{ }] as const;
        super(args1);
    }
};

void
class extends classes(A, B)
{
    constructor()
    {
        const args1 = [{ }] as const;
        super(undefined, args1);
    }
};

void
class extends classes(A, B)
{
    constructor()
    {
        const args1 = { super: A, arguments: [{ }] } as const;
        super(args1);
    }
};

class C extends classes(A, B)
{
    c()
    {
        this.a();
        this.b();
        super.a();
        super.b();
        super.class(A).a();
        super.class(B).b();
    }

    protected _c()
    {
        this._a();
        this._b();
        super._a();
        super._b();
    }

    static sc()
    {
        C.sa();
        C.sb();
        this.sa();
        this.sb();
        super.sa();
        super.sb();
        super.class(A).sa();
        super.class(B).sb();
    }

    protected static _sc()
    {
        super.class(A)._sa();
        super.class(B)._sb();
    }
}

void (C.prototype as A);
void (C.prototype as B);
        `,
    },
    {
        title: 'Hyperinheritance',
        code:
        `
class T1 { static st1(): void { } }
class T2 { static st2(): void { } }
class T3 { static st3(): void { } }
class T4 { static st4(): void { } }
class T5 { static st5(): void { } }
class T6 { static st6(): void { } }
class T7 { static st7(): void { } }
class T8 { static st8(): void { } }
class T9 { static st9(): void { } }
class T10 { static st10(): void { } }
class T11 { static st11(): void { } }

class U extends classes(T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11)
{
    static st()
    {
        this.st1();
        this.st11();
        super.st1();
        super.st11();
        super.class(T1).st1();
        super.class(T11).st11();
    }
}

void (U.prototype as T1);
void (U.prototype as T11);
void (U as typeof T1);
void (U as typeof T11);
        `,
    },
    {
        title: 'super constructor argument referencing indirect superclass',
        code:
        `
class A
{ }

class B extends A
{
    b(): void
    { }
}

void
class extends classes(B)
{
    constructor()
    {
        super({ super: A });
    }
};
        `,
        expectedMessage:
        switchByTypeScriptVersion
        (
            '<3.6.0',
            // TypeScript before 3.6
            'Argument of type \'{ super: typeof A; }\' is not assignable to parameter of type ' +
            '\'readonly []\'.\n' +
            '  Object literal may only specify known properties, and \'super\' does not exist in ' +
            'type \'readonly []\'.',
            // TypeScript 3.6 or later
            'No overload matches this call.\n' +
            '  Overload 1 of 2, \'(args_0?: readonly [] | undefined): ' +
            'ClusteredPrototype<[typeof B]>\', gave the following error.\n' +
            '    Argument of type \'{ super: typeof A; }\' is not assignable to parameter of ' +
            'type \'readonly []\'.\n' +
            '      Object literal may only specify known properties, and \'super\' does not ' +
            'exist in type \'readonly []\'.\n' +
            '  Overload 2 of 2, \'(...args: Readonly<SuperConstructorInvokeInfo<typeof B>>[]): ' +
            'ClusteredPrototype<[typeof B]>\', gave the following error.\n' +
            '    Type \'typeof A\' is not assignable to type \'typeof B\'.\n' +
            '      Property \'b\' is missing in type \'A\' but required in type \'B\'.',
        ),
    },
    {
        title: 'super.class in nonstatic context with indirect superclass',
        code:
        `
class A
{ }

class B extends A
{
    b(): void
    { }
}

void
class extends classes(B)
{
    c()
    {
        super.class(A);
    }
};
        `,
        expectedMessage:
        'Argument of type \'typeof A\' is not assignable to parameter of type \'typeof B\'.\n  ' +
        'Property \'b\' is missing in type \'A\' but required in type \'B\'.',
    },
    {
        title: 'super.class in static context with indirect superclass',
        code:
        `
class A
{ }

class B extends A
{
    static b(): void
    { }
}

void
class extends classes(B)
{
    static c()
    {
        super.class(A);
    }
};
        `,
        expectedMessage:
        'Argument of type \'typeof A\' is not assignable to parameter of type \'typeof B\'.\n  ' +
        'Property \'b\' is missing in type \'typeof A\' but required in type \'typeof B\'.',
    },
    {
        title: 'classes without arguments',
        code: 'classes();',
        expectedMessage: 'Expected at least 1 arguments, but got 0.',
    },
    {
        title: 'classes with an undefined argument',
        code: 'classes(undefined);',
        expectedMessage:
        'Argument of type \'undefined\' is not assignable to parameter of type ' +
        '\'SuperConstructor\'.',
    },
    {
        title: 'classes with a null argument',
        code: 'classes(null);',
        expectedMessage:
        'Argument of type \'null\' is not assignable to parameter of type \'SuperConstructor\'.',
    },
    {
        title: 'Assignment to property \'prototype\' of a clustered constuctor',
        code: 'classes(Object).prototype = null;',
        expectedMessage: 'Cannot assign to \'prototype\' because it is a read-only property.',
    },
    {
        title: 'Type of property \'prototype\' of a clustered constuctor',
        code:
        `
interface Test
{
    new(): Test;
    readonly prototype: { };
}

const prototype: Test = classes(<Test>{ }).prototype;
        `,
        expectedMessage:
        'Property \'prototype\' is missing in type \'{}\' but required in type \'Test\'.',
    },
    {
        title: 'Hidden static overload',
        code:
        `
class A
{
    static x(x: any): void
    { }
}

class B
{
    static x(): void
    { }
}

class C extends classes(A, B)
{ }

C.x();
        `,
        expectedMessage: 'Expected 1 arguments, but got 0.',
    },
    {
        title: 'Union superclass',
        code:
        `
class A
{ }

class B
{ }

void
(
    (C: typeof A | typeof B) =>
    class extends classes(C)
    { }
);
        `,
        expectedMessage:
        'Base constructor return type \'ClusteredPrototype<[typeof A | typeof B]>\' is not an ' +
        'object type or intersection of object types with statically known members.',
    },
    {
        title: 'base class selector in nonstatic context out of class body',
        code:
        `
class Test extends classes(Object)
{ }

(new Test).class(Object).valueOf();
        `,
        expectedMessage:
        'Property \'class\' is protected and only accessible within class ' +
        '\'SuperPrototypeSelector<T>\' and its subclasses.',
    },
    {
        title: 'base class selector in static context out of class body',
        code:
        `
class Test extends classes(Object)
{ }

Test.class(Object).create(null);
        `,
        expectedMessage:
        'Property \'class\' is protected and only accessible within class ' +
        '\'SuperConstructorSelector<T>\' and its subclasses.',
    },
];

const actualize =
() =>
{
    function doCreateProgram()
    {
        const { dirname } = require('path');

        const cwd = process.cwd();
        {
            const directory = dirname(dirname(__dirname));
            process.chdir(directory);
        }
        try
        {
            const program = createProgram(fileNames, options, host);
            return program;
        }
        finally
        {
            process.chdir(cwd);
        }
    }

    const
    {
        convertCompilerOptionsFromJson,
        createCompilerHost,
        createProgram,
        createSourceFile,
        flattenDiagnosticMessageText,
        getPreEmitDiagnostics,
    } =
    require('typescript');

    const { compilerOptions } = require('../../tsconfig.json');
    const { options } = convertCompilerOptionsFromJson(compilerOptions);
    let pkgPath;
    let header;
    switch (polytypeMode)
    {
    case 'global':
        pkgPath = '.';
        header = 'import { classes } from \'.\';\n';
        break;
    case 'module':
        pkgPath = './global';
        header = 'export { };\n';
        break;
    }
    options.types = [pkgPath];
    const fileNames = [];
    testCases.forEach
    (
        (testCase, index) =>
        {
            testCase.actualMessages = [];
            fileNames.push(`:${index}`);
        },
    );
    const sourceFiles = [];
    const host = createCompilerHost({ });
    {
        const { getSourceFile } = host;
        host.getSourceFile =
        (fileName, languageVersion, onError) =>
        {
            let sourceFile;
            const match = /^:(?<baseName>\d+)\.ts$/.exec(fileName);
            if (match)
            {
                const testCase = testCases[match.groups.baseName];
                const sourceText = `${header}${testCase.code}`;
                sourceFile = createSourceFile(fileName, sourceText);
                sourceFile.testCase = testCase;
                sourceFiles.push(sourceFile);
            }
            else
                sourceFile = getSourceFile(fileName, languageVersion, onError);
            return sourceFile;
        };
    }
    const program = doCreateProgram();
    for (const sourceFile of sourceFiles)
    {
        const { actualMessages } = sourceFile.testCase;
        getPreEmitDiagnostics(program, sourceFile).forEach
        (
            ({ messageText }) =>
            {
                const message = flattenDiagnosticMessageText(messageText, '\n');
                actualMessages.push(message);
            },
        );
    }
};

describe
(
    'TypeScript definitions',
    () =>
    {
        const assert = require('assert');

        before
        (
            function ()
            {
                this.timeout(10000);
                actualize();
            },
        );

        testCases.forEach
        (
            testCase =>
            {
                const { expectedMessage, polytypeMode: currentPolytypeMode } = testCase;
                const expectedMessages = expectedMessage === undefined ? [] : [expectedMessage];

                maybeIt
                (
                    currentPolytypeMode === undefined || currentPolytypeMode === polytypeMode,
                    testCase.title,
                    () => assert.deepEqual(testCase.actualMessages, expectedMessages),
                );
            },
        );
    },
);
