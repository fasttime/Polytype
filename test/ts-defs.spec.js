/* eslint-env mocha, node */

'use strict';

const testCases =
[
    {
        title: 'Ordinary multiple inheritance',
        code:
        `
class A
{
    constructor(a: any)
    { }

    a(): void
    { }

    static sa(): void
    { }
}

class B
{
    constructor(b: any)
    { }

    b(): void
    { }

    static sb(): void
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
        const args1 = ['foo'] as const;
        super(args1);
    }
};

void
class extends classes(A, B)
{
    constructor()
    {
        const args1 = ['foo'] as const;
        super(undefined, args1);
    }
};

void
class extends classes(A, B)
{
    constructor()
    {
        const args1 = { super: A, arguments: ['foo'] } as const;
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

    static sc()
    {
        this.sa();
        this.sb();
        super.sa();
        super.sb();
        super.class(A).sa();
        super.class(B).sb();
    }
}

void (C.prototype as A);
void (C.prototype as B);
void (C as typeof A);
void (C as typeof B);
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
        'Argument of type \'{ super: typeof A; }\' is not assignable to parameter of type ' +
        '\'readonly []\'.\n' +
        '  Object literal may only specify known properties, and \'super\' does not exist in ' +
        'type \'readonly []\'.',
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
        expectedMessage:
        'Argument of type \'[]\' is not assignable to parameter of type \'never\'.',
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
];

const actualize =
() =>
{
    const { compilerOptions } = require('../tsconfig.json');
    const
    {
        createCompilerHost,
        createProgram,
        createSourceFile,
        flattenDiagnosticMessageText,
        getPreEmitDiagnostics,
    } =
    require('typescript');

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
            const match = /(?<=^:)\d+(?=\.ts$)/.exec(fileName);
            if (match)
            {
                const testCase = testCases[match[0]];
                const sourceText = `export { };\n${testCase.code}`;
                sourceFile = createSourceFile(fileName, sourceText);
                sourceFile.testCase = testCase;
                sourceFiles.push(sourceFile);
            }
            else
                sourceFile = getSourceFile(fileName, languageVersion, onError);
            return sourceFile;
        };
    }
    const program = createProgram(fileNames, compilerOptions, host);
    for (const sourceFile of sourceFiles)
    {
        const { actualMessages } = sourceFile.testCase;
        getPreEmitDiagnostics(program, sourceFile)
        .forEach
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
                const { expectedMessage } = testCase;
                const expectedMessages = expectedMessage === undefined ? [] : [expectedMessage];
                it
                (testCase.title, () => assert.deepEqual(testCase.actualMessages, expectedMessages));
            },
        );
    },
);
