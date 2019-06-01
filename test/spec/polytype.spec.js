/* eslint-env mocha */
/*
global
assert,
classes,
createNullPrototypeFunction,
document,
exactRegExp,
global,
loadPolytype,
maybeDescribe,
self,
setupTestData,
*/

'use strict';

describe
(
    'Polytype',
    () =>
    {
        describe
        (
            'is loaded only once',
            () =>
            {
                const globalThis = typeof self === 'undefined' ? global : self;
                const descriptorMapObj =
                {
                    self: Object.getOwnPropertyDescriptor(globalThis, 'self'),
                    global: Object.getOwnPropertyDescriptor(globalThis, 'global'),
                };
                afterEach
                (
                    () =>
                    {
                        for (const [key, descriptor] of Object.entries(descriptorMapObj))
                        {
                            if (descriptor)
                                Object.defineProperty(globalThis, key, descriptor);
                            else
                                delete globalThis.key;
                        }
                    },
                );
                it
                (
                    'in self',
                    async () =>
                    {
                        const expectedClasses = Function();
                        const self = { classes: expectedClasses };
                        Object.defineProperties
                        (
                            globalThis,
                            {
                                self: { value: self, configurable: true },
                                global: { value: undefined, configurable: true },
                            },
                        );
                        await loadPolytype();
                        assert.strictEqual(self.classes, expectedClasses);
                    },
                );
                it
                (
                    'in global',
                    async () =>
                    {
                        const expectedClasses = Function();
                        const global = { classes: expectedClasses };
                        Object.defineProperties
                        (
                            globalThis,
                            {
                                self: { value: undefined, configurable: true },
                                global: { value: global, configurable: true },
                            },
                        );
                        await loadPolytype();
                        assert.strictEqual(global.classes, expectedClasses);
                    },
                );
            },
        );

        describe
        (
            'provides instance level inheritance for',
            () =>
            {
                it
                (
                    'the in operator',
                    () =>
                    {
                        const { C } = setupTestData(classes);
                        const c = new C();
                        assert.property(c, 'aMethod');
                        assert.property(c, 'bMethod');
                    },
                );
                it
                (
                    'methods',
                    () =>
                    {
                        const { A, B, C } = setupTestData(classes);
                        const c = new C();
                        assert.strictEqual(c.aMethod, A.prototype.aMethod);
                        assert.strictEqual(c.bMethod, B.prototype.bMethod);
                    },
                );
                it
                (
                    'ungettable properties',
                    () =>
                    {
                        const { C } = setupTestData(classes);
                        const c = new C();
                        assert.strictEqual(c.aSetOnly, undefined);
                    },
                );
                it
                (
                    'direct superclass getters',
                    () =>
                    {
                        const { C, callData } = setupTestData(classes);
                        const c = new C();
                        const actual = c.aGetOnly;
                        assert.deepEqual
                        (callData.A, { args: [], getter: 'aGetOnly', this: c, value: actual });
                    },
                );
                it
                (
                    'indirect superclass getters',
                    () =>
                    {
                        const { E, callData } = setupTestData(classes);
                        const e = new E();
                        const actual = e.aGetOnly;
                        assert.deepEqual
                        (callData.A, { args: [], getter: 'aGetOnly', this: e, value: actual });
                    },
                );
                it
                (
                    'value overwriting',
                    () =>
                    {
                        const { A, C } = setupTestData(classes);
                        A.prototype.a = 13;
                        const c = new C();
                        c.a = 42;
                        assert.deepEqual
                        (
                            Object.getOwnPropertyDescriptor(c, 'a'),
                            {
                                configurable: true,
                                enumerable: true,
                                value: 42,
                                writable: true,
                            },
                        );
                    },
                );
                it
                (
                    'unsettable properties',
                    () =>
                    {
                        class A
                        { }

                        class B extends classes(A)
                        { }

                        Object.defineProperty(A.prototype, 'a', { value: 13 });
                        const b = new B();
                        assert.throws
                        (
                            () =>
                            {
                                b.a = 42;
                            },
                            TypeError,
                        );
                    },
                );
                it
                (
                    'direct superclass setters',
                    () =>
                    {
                        const { C, callData } = setupTestData(classes);
                        const c = new C();
                        c.aSetOnly = 42;
                        assert.deepEqual
                        (callData.A, { args: [42], setter: 'aSetOnly', this: c });
                    },
                );
                it
                (
                    'indirect superclass setters',
                    () =>
                    {
                        const { E, callData } = setupTestData(classes);
                        const e = new E();
                        e.aSetOnly = 42;
                        assert.deepEqual
                        (callData.A, { args: [42], setter: 'aSetOnly', this: e });
                    },
                );
            },
        );

        it
        (
            'allows adding new properties to an instance',
            () =>
            {
                const { C } = setupTestData(classes);
                const c = new C();
                c.cNewProp = 42;
                assert.deepEqual
                (
                    Object.getOwnPropertyDescriptor(c, 'cNewProp'),
                    {
                        configurable: true,
                        enumerable: true,
                        value: 42,
                        writable: true,
                    },
                );
            },
        );
        it
        (
            'allows getting undefined properties from an instance',
            () =>
            {
                class A extends classes(Function())
                { }

                const a = new A();
                assert.isUndefined(a.unknown);
            },
        );

        describe
        (
            'provides class level inheritance for',
            () =>
            {
                it
                (
                    'the in operator',
                    () =>
                    {
                        const { C } = setupTestData(classes);
                        assert.property(C, 'aStatic');
                        assert.property(C, 'bStatic');
                    },
                );
                it
                (
                    'methods',
                    () =>
                    {
                        const { A, B, C } = setupTestData(classes);
                        assert.strictEqual(C.aStatic, A.aStatic);
                        assert.strictEqual(C.bStatic, B.bStatic);
                    },
                );
                it
                (
                    'ungettable properties',
                    () =>
                    {
                        const { C } = setupTestData(classes);
                        assert.strictEqual(C.aStaticSet, undefined);
                    },
                );
                it
                (
                    'direct superclass getters',
                    () =>
                    {
                        const { C, callData } = setupTestData(classes);
                        const actual = C.aStaticGet;
                        assert.deepEqual
                        (callData.A, { args: [], getter: 'aStaticGet', this: C, value: actual });
                    },
                );
                it
                (
                    'indirect superclass getters',
                    () =>
                    {
                        const { E, callData } = setupTestData(classes);
                        const actual = E.aStaticGet;
                        assert.deepEqual
                        (callData.A, { args: [], getter: 'aStaticGet', this: E, value: actual });
                    },
                );
                it
                (
                    'value overwriting',
                    () =>
                    {
                        const { A, C } = setupTestData(classes);
                        A.aProp = 'A';
                        C.aProp = 'C';
                        assert.deepEqual
                        (
                            Object.getOwnPropertyDescriptor(C, 'aProp'),
                            {
                                configurable: true,
                                enumerable: true,
                                value: 'C',
                                writable: true,
                            },
                        );
                    },
                );
                it
                (
                    'unsettable properties',
                    () =>
                    {
                        class A
                        { }

                        class B extends classes(A)
                        { }

                        Object.defineProperty(A, 'aProp', { value: 'A' });
                        assert.throws
                        (
                            () =>
                            {
                                B.aProp = 'B';
                            },
                            TypeError,
                        );
                    },
                );
                it
                (
                    'direct superclass setters',
                    () =>
                    {
                        const { C, callData } = setupTestData(classes);
                        C.aStaticSet = 42;
                        assert.deepEqual(callData.A, { args: [42], setter: 'aStaticSet', this: C });
                    },
                );
                it
                (
                    'indirect superclass setters',
                    () =>
                    {
                        const { E, callData } = setupTestData(classes);
                        E.aStaticSet = 42;
                        assert.deepEqual(callData.A, { args: [42], setter: 'aStaticSet', this: E });
                    },
                );
            },
        );

        it
        (
            'allows adding new properties to a class',
            () =>
            {
                const { C } = setupTestData(classes);
                C.cNewProp = 42;
                assert.deepEqual
                (
                    Object.getOwnPropertyDescriptor(C, 'cNewProp'),
                    {
                        configurable: true,
                        enumerable: true,
                        value: 42,
                        writable: true,
                    },
                );
            },
        );
        it
        (
            'allows getting undefined properties from a class',
            () =>
            {
                const { E } = setupTestData(classes);
                assert.isUndefined(E.unknown);
            },
        );

        maybeDescribe
        (
            typeof document !== 'undefined',
            'works well when document.all is in the prototype chain',
            () =>
            {
                let bar;
                let foo;
                beforeEach
                (
                    () =>
                    {
                        const Foo = Function();
                        Foo.prototype = document.all;
                        const Bar =
                        class extends classes(Foo)
                        {
                            getFromFoo(prop)
                            {
                                return super.class(Foo)[prop];
                            }
                        };
                        bar = new Bar();
                        foo = undefined;
                        Object.defineProperty
                        (
                            document.all,
                            'foo',
                            {
                                configurable: true,
                                get: () => undefined,
                                set: value =>
                                {
                                    foo = value;
                                },
                            },
                        );
                    },
                );
                afterEach(() => delete document.all.foo);
                it('with getters', () => assert.strictEqual(bar[0], document.all[0]));
                it
                (
                    'with setters',
                    () =>
                    {
                        bar.foo = 42;
                        assert.strictEqual(foo, 42);
                    },
                );
                it
                (
                    'with super',
                    () =>
                    {
                        const actual = bar.getFromFoo(0);
                        const [expected] = document.all;
                        assert.strictEqual(actual, expected);
                    },
                );
            },
        );

        describe
        (
            'super in constructor',
            () =>
            {
                it
                (
                    'works with array-like arguments',
                    () =>
                    {
                        const { C, callData } = setupTestData(classes);
                        new C([42], ['foo', 'bar']);
                        assert.deepEqual(callData.A.args, [42]);
                        assert.strictEqual(callData.A.newTarget, C);
                        assert.instanceOf(callData.A.this, C);
                        assert.deepEqual(callData.B.args, ['foo', 'bar']);
                        assert.strictEqual(callData.B.newTarget, C);
                        assert.instanceOf(callData.B.this, C);
                    },
                );
                it
                (
                    'works with super-referencing arguments',
                    () =>
                    {
                        const { A, B, C, callData } = setupTestData(classes);
                        new C({ super: B, arguments: [1, 2, 3] }, { super: A });
                        assert.deepEqual(callData.A.args, []);
                        assert.strictEqual(callData.A.newTarget, C);
                        assert.instanceOf(callData.A.this, C);
                        assert.deepEqual(callData.B.args, [1, 2, 3]);
                        assert.strictEqual(callData.B.newTarget, C);
                        assert.instanceOf(callData.B.this, C);
                    },
                );
                it
                (
                    'does not iterate over super-referencing arguments',
                    () =>
                    {
                        const { A, C, callData } = setupTestData(classes);
                        new C({ super: A, arguments: [1, 2, 3][Symbol.iterator]() });
                        assert.deepEqual(callData.A.args, []);
                    },
                );
                it
                (
                    'sets but does not overwrite own properties on this',
                    () =>
                    {
                        function A()
                        {
                            this.foo = 'bar';
                        }

                        function B()
                        {
                            this.foo = 'baz';
                            this[Symbol.species] = B;
                        }

                        function C()
                        {
                            this[Symbol.species] = C;
                        }

                        class D extends classes(A, B, C)
                        { }

                        const d = new D();
                        assert.strictEqual(d.foo, 'bar');
                        assert.strictEqual(d[Symbol.species], B);
                    },
                );

                describe
                (
                    'throws a TypeError',
                    () =>
                    {
                        it
                        (
                            'with wrong arguments',
                            () =>
                            {
                                const { C } = setupTestData(classes);
                                assert.throws
                                (() => new C(0), TypeError, exactRegExp('Invalid arguments'));
                            },
                        );
                        it
                        (
                            'with wrong arguments in a super-referencing construct',
                            () =>
                            {
                                class Foo extends classes(Object)
                                { }

                                assert.throws
                                (
                                    () => new Foo({ super: Object, arguments: false }),
                                    TypeError,
                                    exactRegExp('Invalid arguments for superclass Object'),
                                );
                            },
                        );
                        it
                        (
                            'with mixed argument styles',
                            () =>
                            {
                                const { A, C } = setupTestData(classes);
                                assert.throws
                                (
                                    () => new C([], { super: A }),
                                    TypeError,
                                    exactRegExp('Mixed argument styles'),
                                );
                            },
                        );
                        it
                        (
                            'with a repeated argument',
                            () =>
                            {
                                class Foo extends classes(Number)
                                { }

                                assert.throws
                                (
                                    () => new Foo({ super: Number }, { super: Number }),
                                    TypeError,
                                    exactRegExp('Duplicate superclass Number'),
                                );
                            },
                        );
                        it
                        (
                            'with an invalid superclass',
                            () =>
                            {
                                const { A, C } = setupTestData(classes);
                                const Foo = _ => [] <= _;
                                Object.defineProperty(Foo, 'name', { value: '' });
                                assert.throws
                                (
                                    () => new C({ super: A }, { super: Foo }),
                                    TypeError,
                                    exactRegExp('_ => [] <= _ is not a direct superclass'),
                                );
                            },
                        );
                    },
                );
            },
        );

        describe
        (
            'superclass with property \'prototype\' null works with',
            () =>
            {
                let bar;
                beforeEach
                (
                    () =>
                    {
                        const Foo = createNullPrototypeFunction('Foo');

                        class Bar extends classes(Foo)
                        {
                            get bar()
                            {
                                return this.foo;
                            }
                            in()
                            {
                                return 'foo' in this;
                            }
                            set bar(value)
                            {
                                this.foo = value;
                            }
                        }

                        bar = new Bar();
                    },
                );
                it
                (
                    'get',
                    () =>
                    {
                        const foo = 42;
                        bar.foo = foo;
                        assert.strictEqual(bar.bar, foo);
                    },
                );
                it
                (
                    'in',
                    () =>
                    {
                        const foo = 43;
                        bar.foo = foo;
                        assert.isTrue(bar.in());
                    },
                );
                it
                (
                    'set',
                    () =>
                    {
                        const foo = 44;
                        bar.bar = foo;
                        assert.strictEqual(bar.foo, foo);
                    },
                );
            },
        );

        describe
        (
            'instanceof',
            () =>
            {
                it
                (
                    'works with all base types',
                    () =>
                    {
                        const A = createNullPrototypeFunction('A');
                        const B =
                        () =>
                        { };
                        B.prototype = { };
                        const C = Object.create(B);
                        C.prototype = Object.create(B.prototype);
                        const D =
                        function ()
                        { };
                        Object.setPrototypeOf(D, C);
                        D.prototype = Object.create(C.prototype);
                        const _AD = classes(A, D);
                        const E =
                        class extends _AD
                        { };
                        const e = new E();
                        assert.instanceOf(e, B);
                        assert.instanceOf(e, D);
                        assert.instanceOf(e, _AD);
                        assert.instanceOf(e, E);
                        assert.instanceOf(e, Object);
                    },
                );
                it
                (
                    'works with bound types',
                    () =>
                    {
                        const A =
                        function ()
                        { };
                        Object.setPrototypeOf(A, Object);
                        const Aʼʼ = A.bind().bind();
                        A.prototype = Object.create(null);
                        const B =
                        class extends A
                        { };
                        const Bʼʼ = B.bind().bind();
                        const a = new A();
                        assert.instanceOf(a, Aʼʼ);
                        assert.notInstanceOf(a, Bʼʼ);
                    },
                );
            },
        );
    },
);