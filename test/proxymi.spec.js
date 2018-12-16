/* eslint-env mocha */
/* global BigInt, classes, document, require, self */

'use strict';

(() =>
{
    function createFunctionWithGetPrototypeCount(name)
    {
        const fn = Function();
        if (name !== undefined)
            Object.defineProperty(fn, 'name', { value: name });
        Object.defineProperty(fn, 'getPrototypeCount', { value: 0, writable: true });
        const get =
        (target, prop, receiver) =>
        {
            if (prop === 'prototype')
                ++target.getPrototypeCount;
            const value = Reflect.get(target, prop, receiver);
            return value;
        };
        const proxy = new Proxy(fn, { get });
        return proxy;
    }

    function createNullPrototypeFunction(name)
    {
        const fn = Function();
        if (name !== undefined)
            Object.defineProperty(fn, 'name', { value: name });
        fn.prototype = null;
        return fn;
    }

    function exactRegExp(...strs)
    {
        const patterns = strs.map(str => `${str.replace(/[.()[]/g, '\\$&')}`);
        const pattern = patterns.length > 1 ? `(?:${patterns.join('|')})` : patterns[0];
        const regExp = RegExp(`^${pattern}$`);
        return regExp;
    }

    function init()
    {
        describe
        (
            'Proxymi',
            () =>
            {
                it
                (
                    'is loaded only once',
                    async () =>
                    {
                        const expectedClasses = classes;
                        await loadProxymi();
                        assert.strictEqual(classes, expectedClasses);
                    }
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
                                const { C } = setupTestData();
                                const c = new C();
                                assert.property(c, 'aMethod');
                                assert.property(c, 'bMethod');
                            }
                        );
                        it
                        (
                            'methods',
                            () =>
                            {
                                const { A, B, C } = setupTestData();
                                const c = new C();
                                assert.strictEqual(c.aMethod, A.prototype.aMethod);
                                assert.strictEqual(c.bMethod, B.prototype.bMethod);
                            }
                        );
                        it
                        (
                            'ungettable properties',
                            () =>
                            {
                                const { C } = setupTestData();
                                const c = new C();
                                assert.strictEqual(c.aSetOnly, undefined);
                            }
                        );
                        it
                        (
                            'direct superclass getters',
                            () =>
                            {
                                const { C, callData } = setupTestData();
                                const c = new C();
                                const actual = c.aGetOnly;
                                assert.deepEqual
                                (
                                    callData.A,
                                    { args: [], getter: 'aGetOnly', this: c, value: actual }
                                );
                            }
                        );
                        it
                        (
                            'indirect superclass getters',
                            () =>
                            {
                                const { E, callData } = setupTestData();
                                const e = new E();
                                const actual = e.aGetOnly;
                                assert.deepEqual
                                (
                                    callData.A,
                                    { args: [], getter: 'aGetOnly', this: e, value: actual }
                                );
                            }
                        );
                        it
                        (
                            'value overwriting',
                            () =>
                            {
                                const { A, C } = setupTestData();
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
                                    }
                                );
                            }
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
                                    TypeError
                                );
                            }
                        );
                        it
                        (
                            'direct superclass setters',
                            () =>
                            {
                                const { C, callData } = setupTestData();
                                const c = new C();
                                c.aSetOnly = 42;
                                assert.deepEqual
                                (callData.A, { args: [42], setter: 'aSetOnly', this: c });
                            }
                        );
                        it
                        (
                            'indirect superclass setters',
                            () =>
                            {
                                const { E, callData } = setupTestData();
                                const e = new E();
                                e.aSetOnly = 42;
                                assert.deepEqual
                                (callData.A, { args: [42], setter: 'aSetOnly', this: e });
                            }
                        );
                    }
                );

                it
                (
                    'allows adding new properties to an instance',
                    () =>
                    {
                        const { C } = setupTestData();
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
                            }
                        );
                    }
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
                    }
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
                                const { C } = setupTestData();
                                assert.property(C, 'aStatic');
                                assert.property(C, 'bStatic');
                            }
                        );
                        it
                        (
                            'methods',
                            () =>
                            {
                                const { A, B, C } = setupTestData();
                                assert.strictEqual(C.aStatic, A.aStatic);
                                assert.strictEqual(C.bStatic, B.bStatic);
                            }
                        );
                        it
                        (
                            'ungettable properties',
                            () =>
                            {
                                const { C } = setupTestData();
                                assert.strictEqual(C.aStaticSet, undefined);
                            }
                        );
                        it
                        (
                            'direct superclass getters',
                            () =>
                            {
                                const { C, callData } = setupTestData();
                                const actual = C.aStaticGet;
                                assert.deepEqual
                                (
                                    callData.A,
                                    { args: [], getter: 'aStaticGet', this: C, value: actual }
                                );
                            }
                        );
                        it
                        (
                            'indirect superclass getters',
                            () =>
                            {
                                const { E, callData } = setupTestData();
                                const actual = E.aStaticGet;
                                assert.deepEqual
                                (
                                    callData.A,
                                    { args: [], getter: 'aStaticGet', this: E, value: actual }
                                );
                            }
                        );
                        it
                        (
                            'value overwriting',
                            () =>
                            {
                                const { A, C } = setupTestData();
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
                                    }
                                );
                            }
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
                                    TypeError
                                );
                            }
                        );
                        it
                        (
                            'direct superclass setters',
                            () =>
                            {
                                const { C, callData } = setupTestData();
                                C.aStaticSet = 42;
                                assert.deepEqual
                                (callData.A, { args: [42], setter: 'aStaticSet', this: C });
                            }
                        );
                        it
                        (
                            'indirect superclass setters',
                            () =>
                            {
                                const { E, callData } = setupTestData();
                                E.aStaticSet = 42;
                                assert.deepEqual
                                (callData.A, { args: [42], setter: 'aStaticSet', this: E });
                            }
                        );
                    }
                );

                it
                (
                    'allows adding new properties to a class',
                    () =>
                    {
                        const { C } = setupTestData();
                        C.cNewProp = 42;
                        assert.deepEqual
                        (
                            Object.getOwnPropertyDescriptor(C, 'cNewProp'),
                            {
                                configurable: true,
                                enumerable: true,
                                value: 42,
                                writable: true,
                            }
                        );
                    }
                );
                it
                (
                    'allows getting undefined properties from a class',
                    () =>
                    {
                        const { E } = setupTestData();
                        assert.isUndefined(E.unknown);
                    }
                );

                usingDocumentAll
                (
                    () =>
                    describe
                    (
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
                                        }
                                    );
                                }
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
                                }
                            );
                            it
                            (
                                'with super',
                                () =>
                                {
                                    const actual = bar.getFromFoo(0);
                                    const [expected] = document.all;
                                    assert.strictEqual(actual, expected);
                                }
                            );
                        }
                    )
                );

                it
                (
                    'clustered prototype has unsettable prototype',
                    () => assert.throws
                    (() => Object.setPrototypeOf(classes(Function()).prototype, { }), TypeError)
                );
                it
                (
                    'clustered prototype has property \'constructor\'',
                    () =>
                    {
                        const constructor = classes(Function());
                        const actualDescriptor =
                        Object.getOwnPropertyDescriptor(constructor.prototype, 'constructor');
                        const expectedDescriptor =
                        {
                            configurable: true,
                            enumerable: false,
                            value: constructor,
                            writable: true,
                        };
                        assert.deepEqual(actualDescriptor, expectedDescriptor);
                    }
                );
                it
                (
                    'clustered constructor has unsettable prototype',
                    () => assert.throws
                    (() => Object.setPrototypeOf(classes(Function()), { }), TypeError)
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
                                const { C, callData } = setupTestData();
                                new C([42], ['foo', 'bar']);
                                assert.deepEqual(callData.A.args, [42]);
                                assert.strictEqual(callData.A.newTarget, C);
                                assert.instanceOf(callData.A.this, C);
                                assert.deepEqual(callData.B.args, ['foo', 'bar']);
                                assert.strictEqual(callData.B.newTarget, C);
                                assert.instanceOf(callData.B.this, C);
                            }
                        );
                        it
                        (
                            'works with super-referencing arguments',
                            () =>
                            {
                                const { A, B, C, callData } = setupTestData();
                                new C({ super: B, arguments: [1, 2, 3] }, { super: A });
                                assert.deepEqual(callData.A.args, []);
                                assert.strictEqual(callData.A.newTarget, C);
                                assert.instanceOf(callData.A.this, C);
                                assert.deepEqual(callData.B.args, [1, 2, 3]);
                                assert.strictEqual(callData.B.newTarget, C);
                                assert.instanceOf(callData.B.this, C);
                            }
                        );
                        it
                        (
                            'sets own properties on this',
                            () =>
                            {
                                const { C } = setupTestData();
                                const c = new C(undefined, ['foo', 'bar']);
                                assert.strictEqual(c.foo, 'bar');
                            }
                        );
                        it
                        (
                            'does not overwrite own properties on this',
                            () =>
                            {
                                const { C } = setupTestData();
                                const c = new C([42], ['aProp', 13]);
                                assert.strictEqual(c.aProp, 42);
                            }
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
                                        const { C } = setupTestData();
                                        assert.throws
                                        (
                                            () => new C(0),
                                            TypeError,
                                            exactRegExp('Invalid arguments')
                                        );
                                    }
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
                                            exactRegExp('Invalid arguments for superclass Object')
                                        );
                                    }
                                );
                                it
                                (
                                    'with mixed argument styles',
                                    () =>
                                    {
                                        const { A, C } = setupTestData();
                                        assert.throws
                                        (
                                            () => new C([], { super: A }),
                                            TypeError,
                                            exactRegExp('Mixed argument styles')
                                        );
                                    }
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
                                            exactRegExp('Duplicate superclass Number')
                                        );
                                    }
                                );
                                it
                                (
                                    'with an invalid superclass',
                                    () =>
                                    {
                                        const { A, C } = setupTestData();
                                        const Foo = _ => [] <= _;
                                        Object.defineProperty(Foo, 'name', { value: '' });
                                        assert.throws
                                        (
                                            () => new C({ super: A }, { super: Foo }),
                                            TypeError,
                                            exactRegExp('_ => [] <= _ is not a direct superclass')
                                        );
                                    }
                                );
                            }
                        );
                    }
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
                            }
                        );
                        it
                        (
                            'get',
                            () =>
                            {
                                const foo = 42;
                                bar.foo = foo;
                                assert.strictEqual(bar.bar, foo);
                            }
                        );
                        it
                        (
                            'in',
                            () =>
                            {
                                const foo = 43;
                                bar.foo = foo;
                                assert.isTrue(bar.in());
                            }
                        );
                        it
                        (
                            'set',
                            () =>
                            {
                                const foo = 44;
                                bar.bar = foo;
                                assert.strictEqual(bar.foo, foo);
                            }
                        );
                    }
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
                            }
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
                            }
                        );
                    }
                );
            }
        );

        describe
        (
            'classes',
            () =>
            {
                it
                (
                    'has name \'classes\'',
                    () => assert.strictEqual(classes.name, 'classes')
                );
                it('has length 0', () => assert.strictEqual(classes.length, 0));
                it
                (
                    'cannot be called with new',
                    () =>
                    assert.throws
                    (
                        () => new classes(), // eslint-disable-line new-cap
                        TypeError,
                        /\bis not a constructor\b/
                    )
                );
                it
                (
                    'works with a function that is not an instance of Function',
                    () =>
                    {
                        const foo = Function();
                        Object.setPrototypeOf(foo, { });
                        assert.doesNotThrow(() => classes(foo));
                    }
                );
                it
                (
                    'gets property \'prototype\' only once',
                    () =>
                    {
                        const Foo = createFunctionWithGetPrototypeCount();
                        classes(Foo);
                        assert.equal(Foo.getPrototypeCount, 1);
                    }
                );

                describe
                (
                    'throws a TypeError',
                    () =>
                    {
                        it
                        (
                            'without arguments',
                            () =>
                            assert.throws
                            (() => classes(), TypeError, exactRegExp('No superclasses specified'))
                        );
                        it
                        (
                            'with a null argument',
                            () =>
                            assert.throws
                            (
                                () => classes(null),
                                TypeError,
                                exactRegExp('null is not a constructor')
                            )
                        );
                        usingBigInt
                        (
                            () =>
                            it
                            (
                                'with a bigint argument',
                                () =>
                                assert.throws
                                (
                                    () => classes(BigInt(42)),
                                    TypeError,
                                    exactRegExp('42 is not a constructor')
                                )
                            )
                        );
                        it
                        (
                            'with a symbol argument',
                            () =>
                            assert.throws
                            (
                                () => classes(Symbol()),
                                TypeError,
                                exactRegExp('Symbol() is not a constructor')
                            )
                        );
                        it
                        (
                            'with a non-callable object argument',
                            () =>
                            assert.throws
                            (
                                () => classes({ }),
                                TypeError,
                                exactRegExp('[object Object] is not a constructor')
                            )
                        );
                        it
                        (
                            'with a non-constructor callable argument',
                            () =>
                            {
                                const foo = () => -0;
                                Object.defineProperty(foo, 'name', { value: undefined });
                                assert.throws
                                (
                                    () => classes(foo),
                                    TypeError,
                                    exactRegExp('() => -0 is not a constructor')
                                );
                            }
                        );
                        it
                        (
                            'with a bound function',
                            () => assert.throws
                            (
                                () => classes(Array.bind()),
                                TypeError,
                                exactRegExp
                                ('Property \'prototype\' of bound Array is not an object or null')
                            )
                        );
                        it
                        (
                            'with a function with a non-object property \'prototype\' value',
                            () =>
                            {
                                const foo = Function();
                                Object.defineProperty(foo, 'prototype', { value: 42 });
                                assert.throws
                                (
                                    () => classes(foo),
                                    TypeError,
                                    exactRegExp
                                    ('Property \'prototype\' of anonymous is not an object or null')
                                );
                            }
                        );
                        it
                        (
                            'with a repeated argument',
                            () =>
                            {
                                assert.throws
                                (
                                    () => classes(String, Array, String),
                                    TypeError,
                                    exactRegExp('Duplicate superclass String')
                                );
                            }
                        );
                    }
                );
            }
        );

        describe
        (
            'classes(...?)',
            ()  =>
            {
                it
                (
                    'has expected name',
                    () =>
                    {
                        class ぁ
                        { }

                        class A
                        { }

                        class B
                        { }

                        class C
                        { }

                        Object.defineProperty(A, 'name', { value: undefined });
                        Object.defineProperty(B, 'name', { value: null });
                        Object.defineProperty(C, 'name', { value: '' });
                        assert.strictEqual(classes(ぁ, A, B, C).name, '(ぁ,undefined,null,)');
                    }
                );
                it('has length 0', () => assert.strictEqual(classes(Function()).length, 0));
                it
                (
                    'has property \'prototype\'',
                    () =>
                    {
                        const actualDescriptor =
                        Object.getOwnPropertyDescriptor(classes(Function()), 'prototype');
                        const expectedDescriptor =
                        {
                            configurable: false,
                            enumerable: false,
                            value: { },
                            writable: false,
                        };
                        assert.deepEqual(actualDescriptor, expectedDescriptor);
                    }
                );
                it
                (
                    'cannot be called without new',
                    () =>
                    assert.throws
                    (
                        classes(Function()),
                        TypeError,
                        exactRegExp('Constructor cannot be invoked without \'new\'')
                    )
                );
                it
                (
                    'does not get property \'prototype\' of superclasses',
                    () =>
                    {
                        const A = createFunctionWithGetPrototypeCount('A');
                        const _A = classes(A);
                        A.getPrototypeCount = 0;
                        void new _A();
                        assert.equal(A.getPrototypeCount, 0);
                    }
                );
            }
        );

        describe
        (
            'super.class',
            ()  =>
            {
                describe
                (
                    'in nonstatic context',
                    () =>
                    {
                        it
                        (
                            'has name \'class\'',
                            () =>
                            assert.strictEqual(classes(Function()).prototype.class.name, 'class')
                        );
                        it
                        (
                            'has length 1',
                            () => assert.strictEqual(classes(Function()).prototype.class.length, 1)
                        );
                        it
                        (
                            'cannot be called with new',
                            () =>
                            {
                                const { A, C } = setupTestData();
                                const c = new C();
                                assert.throws
                                (() => c.newSuper(A), TypeError, /\bis not a constructor\b/);
                            }
                        );
                        it
                        (
                            'returns a proxy for any superclass argument',
                            () =>
                            {
                                const { A, C } = setupTestData();
                                const c = new C();
                                assert.instanceOf(c.getSuper(A), C);
                            }
                        );
                        it
                        (
                            'throws a TypeError with an invalid argument',
                            () =>
                            {
                                const { E } = setupTestData();
                                const e = new E();
                                assert.throws
                                (
                                    () => e.getSuper({ }),
                                    TypeError,
                                    exactRegExp('Argument is not a function')
                                );
                            }
                        );
                        it
                        (
                            'throws a TypeError with an invalid superclass',
                            () =>
                            {
                                const { A, E } = setupTestData();
                                const e = new E();
                                assert.throws
                                (
                                    () => e.getSuper(A),
                                    TypeError,
                                    exactRegExp
                                    (
                                        'Property \'prototype\' of argument does not match any ' +
                                        'direct superclass'
                                    )
                                );
                            }
                        );
                        it
                        (
                            'throws a TypeError with a superclass with property \'prototype\' null',
                            () =>
                            {
                                const Foo = createNullPrototypeFunction('Foo');

                                class Bar extends classes(Foo)
                                {
                                    bar()
                                    {
                                        super.class(Foo);
                                    }
                                }

                                const bar = new Bar();
                                assert.throws
                                (
                                    () => bar.bar(),
                                    TypeError,
                                    exactRegExp
                                    (
                                        'Property \'prototype\' of argument is not an object',
                                        'undefined is not an object (evaluating \'super.class\')'
                                    )
                                );
                            }
                        );
                    }
                );

                describe
                (
                    'in static context',
                    () =>
                    {
                        it
                        (
                            'has name \'class\'',
                            () => assert.strictEqual(classes(Function()).class.name, 'class')
                        );
                        it
                        (
                            'has length 1',
                            () => assert.strictEqual(classes(Function()).class.length, 1)
                        );
                        it
                        (
                            'cannot be called with new',
                            () =>
                            {
                                const { A, C } = setupTestData();
                                assert.throws
                                (() => C.newStaticSuper(A), TypeError, /\bis not a constructor\b/);
                            }
                        );
                        it
                        (
                            'returns a proxy for any superclass argument',
                            () =>
                            {
                                const { A, C } = setupTestData();
                                assert.isNotNull(C.getStaticSuper(A));
                            }
                        );
                        it
                        (
                            'throws a TypeError with an invalid argument',
                            () =>
                            {
                                const { E } = setupTestData();
                                assert.throws
                                (
                                    () => E.getStaticSuper({ }),
                                    TypeError,
                                    exactRegExp('Argument is not a function')
                                );
                            }
                        );
                        it
                        (
                            'throws a TypeError with an invalid superclass',
                            () =>
                            {
                                const { A, E } = setupTestData();
                                assert.throws
                                (
                                    () => E.getStaticSuper(A),
                                    TypeError,
                                    exactRegExp('Argument is not a direct superclass')
                                );
                            }
                        );
                    }
                );
            }
        );

        describe
        (
            'super.class(?)',
            ()  =>
            {
                describe
                (
                    'in nonstatic context',
                    () =>
                    {
                        it
                        (
                            'invokes a direct superclass method',
                            () =>
                            {
                                const { A, B, C } = setupTestData();
                                const c = new C();
                                c.aProp = 'A';
                                c.bProp = 'B';
                                assert.strictEqual(c.getSuper(A).someMethod(), 'A');
                                const Bʼ = Function();
                                Bʼ.prototype = B.prototype;
                                assert.strictEqual(c.getSuper(Bʼ).someMethod(), 'B');
                            }
                        );
                        it
                        (
                            'invokes an indirect superclass method',
                            () =>
                            {
                                const { A, B, C, E } = setupTestData();
                                const e = new E();
                                e.aProp = 'A';
                                e.bProp = 'B';
                                assert.strictEqual(e.getSuper(C).getSuper(A).someMethod(), 'A');
                                assert.strictEqual(e.getSuper(C).getSuper(B).someMethod(), 'B');
                            }
                        );
                        it
                        (
                            'invokes a direct superclass getter',
                            () =>
                            {
                                const { A, B, C, callData } = setupTestData();
                                const c = new C();
                                {
                                    const actual = c.getSuper(A).aGetOnly;
                                    assert.deepEqual(callData.A.args, []);
                                    assert.strictEqual(callData.A.getter, 'aGetOnly');
                                    assert.strictEqual(callData.A.this, c);
                                    assert.strictEqual(callData.A.value, actual);
                                }
                                {
                                    const actual = c.getSuper(B).bGetOnly;
                                    assert.deepEqual(callData.B.args, []);
                                    assert.strictEqual(callData.B.getter, 'bGetOnly');
                                    assert.strictEqual(callData.B.this, c);
                                    assert.strictEqual(callData.B.value, actual);
                                }
                            }
                        );
                        it
                        (
                            'invokes an indirect superclass getter',
                            () =>
                            {
                                const { A, B, C, E, callData } = setupTestData();
                                const e = new E();
                                {
                                    const actual = e.getSuper(C).getSuper(A).aGetOnly;
                                    assert.deepEqual(callData.A.args, []);
                                    assert.strictEqual(callData.A.getter, 'aGetOnly');
                                    assert(e.isPrototypeOf(callData.A.this));
                                    assert.strictEqual(callData.A.value, actual);
                                }
                                {
                                    const actual = e.getSuper(C).getSuper(B).bGetOnly;
                                    assert.deepEqual(callData.B.args, []);
                                    assert.strictEqual(callData.B.getter, 'bGetOnly');
                                    assert(e.isPrototypeOf(callData.B.this));
                                    assert.strictEqual(callData.B.value, actual);
                                }
                            }
                        );
                        it
                        (
                            'does not invoke a getter in a different superclass',
                            () =>
                            {
                                const { A, B, C, callData } = setupTestData();
                                const c = new C();
                                delete callData.A;
                                delete callData.B;
                                {
                                    const actual = c.getSuper(A).bGetOnly;
                                    assert.strictEqual(actual, undefined);
                                    assert.isEmpty(callData);
                                }
                                {
                                    const actual = c.getSuper(B).aGetOnly;
                                    assert.strictEqual(actual, undefined);
                                    assert.isEmpty(callData);
                                }
                            }
                        );
                        it
                        (
                            'invokes a direct superclass setter',
                            () =>
                            {
                                const { A, B, C, callData } = setupTestData();
                                const c = new C();

                                c.getSuper(A).aSetOnly = 42;
                                assert.deepEqual(callData.A.args, [42]);
                                assert.strictEqual(callData.A.setter, 'aSetOnly');
                                assert.strictEqual(callData.A.this, c);

                                c.getSuper(B).bSetOnly = 'foo';
                                assert.deepEqual(callData.B.args, ['foo']);
                                assert.strictEqual(callData.B.setter, 'bSetOnly');
                                assert.strictEqual(callData.B.this, c);
                            }
                        );
                        it
                        (
                            'invokes an indirect superclass setter',
                            () =>
                            {
                                const { A, B, C, E, callData } = setupTestData();
                                const e = new E();

                                e.getSuper(C).getSuper(A).aSetOnly = 42;
                                assert.deepEqual(callData.A.args, [42]);
                                assert.strictEqual(callData.A.setter, 'aSetOnly');
                                assert(e.isPrototypeOf(callData.A.this));

                                e.getSuper(C).getSuper(B).bSetOnly = 'foo';
                                assert.deepEqual(callData.B.args, ['foo']);
                                assert.strictEqual(callData.B.setter, 'bSetOnly');
                                assert(e.isPrototypeOf(callData.B.this));
                            }
                        );
                        it
                        (
                            'does not invoke a setter in a different superclass',
                            () =>
                            {
                                const { A, B, C, callData } = setupTestData();
                                const c = new C();
                                delete callData.A;
                                delete callData.B;
                                c.getSuper(A).bSetOnly = 42;
                                c.getSuper(B).aSetOnly = 13;
                                assert.ownProperty(c, 'aSetOnly');
                                assert.ownProperty(c, 'bSetOnly');
                                assert.isEmpty(callData);
                            }
                        );
                    }
                );

                describe
                (
                    'in static context',
                    () =>
                    {
                        it
                        (
                            'invokes a direct superclass method',
                            () =>
                            {
                                const { A, B, C } = setupTestData();
                                A.aProp = Symbol();
                                B.bProp = Symbol();
                                assert.strictEqual(C.getStaticSuper(A).someStaticMethod(), A.aProp);
                                assert.strictEqual(C.getStaticSuper(B).someStaticMethod(), B.bProp);
                            }
                        );
                        it
                        (
                            'invokes a direct superclass getter',
                            () =>
                            {
                                function createCallData(args, className, target)
                                {
                                    const callData = { args: [...args], className, this: target };
                                    return callData;
                                }

                                class A
                                {
                                    static get staticCallData()
                                    {
                                        // eslint-disable-next-line prefer-rest-params
                                        const callData = createCallData(arguments, 'A', this);
                                        return callData;
                                    }
                                }

                                class B
                                {
                                    static get staticCallData()
                                    {
                                        // eslint-disable-next-line prefer-rest-params
                                        const callData = createCallData(arguments, 'B', this);
                                        return callData;
                                    }
                                }

                                class C extends classes(A, B)
                                {
                                    static getStaticCallData(type)
                                    {
                                        return super.class(type).staticCallData;
                                    }
                                }

                                {
                                    const actual = C.getStaticCallData(A);
                                    const expected = { args: [], className: 'A', this: C };
                                    assert.deepEqual(actual, expected);
                                }
                                {
                                    const actual = C.getStaticCallData(B);
                                    const expected = { args: [], className: 'B', this: C };
                                    assert.deepEqual(actual, expected);
                                }
                            }
                        );
                        it
                        (
                            'does not invoke a getter in a different superclass',
                            () =>
                            {
                                const { A, B, C, callData } = setupTestData();
                                {
                                    const actual = C.getStaticSuper(A).bStaticGet;
                                    assert.strictEqual(actual, undefined);
                                    assert.isEmpty(callData);
                                }
                                {
                                    const actual = C.getStaticSuper(B).aStaticGet;
                                    assert.strictEqual(actual, undefined);
                                    assert.isEmpty(callData);
                                }
                            }
                        );
                        it
                        (
                            'invokes a direct superclass setter',
                            () =>
                            {
                                const { A, B, C, callData } = setupTestData();
                                C.getStaticSuper(A).aStaticSet = 42;
                                assert.deepEqual(callData.A.args, [42]);
                                assert.strictEqual(callData.A.setter, 'aStaticSet');
                                assert.strictEqual(callData.A.this.name, 'C');
                                C.getStaticSuper(B).bStaticSet = 42;
                                assert.deepEqual(callData.B.args, [42]);
                                assert.strictEqual(callData.B.setter, 'bStaticSet');
                                assert.strictEqual(callData.B.this.name, 'C');
                            }
                        );
                        it
                        (
                            'does not invoke a setter in a different superclass',
                            () =>
                            {
                                const { A, B, C, E, callData } = setupTestData();
                                E.getStaticSuper(C).getStaticSuper(A).bStaticSet = 42;
                                E.getStaticSuper(C).getStaticSuper(B).aStaticSet = 13;
                                assert.isEmpty(callData);
                            }
                        );
                    }
                );
            }
        );

        describe
        (
            'Object.getPrototypeListOf',
            () =>
            {
                function testGetPrototypeListOf(obj, expected)
                {
                    const actual = Object.getPrototypeListOf(obj);
                    assert.deepEqual(actual, expected);
                    assert.notStrictEqual
                    (
                        Object.getPrototypeListOf(obj),
                        actual,
                        'Multiple invocations of Object.getPrototypeListOf should not return ' +
                        'the same object.'
                    );
                }

                it
                (
                    'has name \'getPrototypeListOf\'',
                    () => assert.strictEqual(Object.getPrototypeListOf.name, 'getPrototypeListOf')
                );
                it('has length 1', () => assert.strictEqual(Object.getPrototypeListOf.length, 1));
                it
                (
                    'cannot be called with new',
                    () =>
                    assert.throws
                    (
                        () => new Object.getPrototypeListOf(), // eslint-disable-line new-cap
                        TypeError,
                        /\bis not a constructor\b/
                    )
                );
                it
                (
                    'returns a new empty array if an object has null prototype',
                    () => testGetPrototypeListOf(Object.create(null), [])
                );
                it
                (
                    'returns a one element array if an object has a non-null prototype',
                    () => testGetPrototypeListOf({ }, [Object.prototype])
                );
                it
                (
                    'returns the prototype of a multiple inheritance class',
                    () =>
                    {
                        const { C } = setupTestData();
                        testGetPrototypeListOf(C, [Object.getPrototypeOf(C)]);
                    }
                );
                it
                (
                    'returns the prototype of a multiple inheritance object',
                    () =>
                    {
                        const { C } = setupTestData();
                        testGetPrototypeListOf(new C(), [C.prototype]);
                    }
                );
                it
                (
                    'returns all prototypes of a clustered constructor',
                    () =>
                    {
                        const { A, B, _AB } = setupTestData();
                        testGetPrototypeListOf(_AB, [A, B]);
                    }
                );
                it
                (
                    'returns all prototypes of a clustered prototype excluding null and duplicates',
                    () =>
                    {
                        const A =
                        class
                        { };
                        const B = createNullPrototypeFunction();
                        const C =
                        class
                        { };
                        const D =
                        function ()
                        { };
                        D.prototype = A.prototype;
                        const _ABCD = classes(A, B, C, D);
                        testGetPrototypeListOf(_ABCD.prototype, [A.prototype, C.prototype]);
                    }
                );
                usingDocumentAll
                (
                    () =>
                    it
                    (
                        'returns a one element array if an object has document.all for prototype',
                        () => testGetPrototypeListOf(Object.create(document.all), [document.all])
                    )
                );
            }
        );

        describe
        (
            'Object.prototype.isPrototypeOf',
            () =>
            {
                function test(argDescription, thisValue, arg, expectedResult)
                {
                    let description;
                    let fn;
                    if (typeof expectedResult === 'boolean')
                    {
                        description = `returns ${expectedResult} ${argDescription}`;
                        fn =
                        () =>
                        {
                            assert.strictEqual
                            (Object.prototype.isPrototypeOf.call(thisValue, arg), expectedResult);
                        };
                    }
                    else
                    {
                        description = `throws ${expectedResult.name} ${argDescription}`;
                        fn =
                        () =>
                        {
                            assert.throws
                            (Object.prototype.isPrototypeOf.bind(thisValue, arg), expectedResult);
                        };
                    }
                    it(description, fn);
                }

                it
                (
                    'has name \'isPrototypeOf\'',
                    () => assert.strictEqual(Object.prototype.isPrototypeOf.name, 'isPrototypeOf')
                );
                it
                (
                    'has length 1',
                    () => assert.strictEqual(Object.prototype.isPrototypeOf.length, 1)
                );
                it
                (
                    'cannot be called with new',
                    () =>
                    assert.throws
                    (
                        () => new Object.prototype.isPrototypeOf(),
                        TypeError,
                        /\bis not a constructor\b/
                    )
                );
                test('with null argument', undefined, null, false);
                test('with undefined argument', null, undefined, false);
                test('with boolean type argument', Boolean.prototype, true, false);
                test('with number type argument', Number.prototype, 1, false);
                usingBigInt
                (() => test('with bigint type argument', BigInt.prototype, BigInt(1), false));
                test('with string type argument', String.prototype, 'foo', false);
                test('with symbol type argument', Symbol.prototype, Symbol.iterator, false);
                test('when this is null', null, { }, TypeError);
                test('when this is undefined', undefined, { }, TypeError);
                test('when this and the argument are the same object', Object, Object, false);
                test('when this is the argument prototype', Function.prototype, Object, true);
                test
                (
                    'when this is in the argument prototype chain',
                    Object.prototype,
                    Object,
                    true
                );
                usingDocumentAll
                (() => test('with document.all', Object.prototype, document.all, true));
                it
                (
                    'works with derived types',
                    () =>
                    {
                        class A
                        { }

                        class B
                        { }

                        class C extends classes(A, B)
                        { }

                        class D extends C
                        { }

                        assert(A.isPrototypeOf(D));
                        assert(B.isPrototypeOf(D));
                        assert(C.isPrototypeOf(D));
                        assert(Function.prototype.isPrototypeOf(D));
                    }
                );
                it
                (
                    'works with derived prototypes',
                    () =>
                    {
                        class A
                        { }

                        class B
                        { }

                        class C extends classes(A, B)
                        { }

                        class D extends C
                        { }

                        const d = new D();
                        assert(A.prototype.isPrototypeOf(d));
                        assert(B.prototype.isPrototypeOf(d));
                        assert(C.prototype.isPrototypeOf(d));
                        assert(D.prototype.isPrototypeOf(d));
                        assert(Object.prototype.isPrototypeOf(d));
                    }
                );
            }
        );

        describe
        (
            '[Symbol.hasInstance]',
            () =>
            {
                function test(argDescription, type, arg, expectedResult)
                {
                    const description = `returns ${expectedResult} ${argDescription}`;
                    it
                    (
                        description,
                        () =>
                        {
                            assert.strictEqual
                            (Object[Symbol.hasInstance].call(type, arg), expectedResult);
                        }
                    );
                }

                it
                (
                    'has name \'[Symbol.hasInstance]\'',
                    () =>
                    assert.strictEqual(Object[Symbol.hasInstance].name, '[Symbol.hasInstance]')
                );
                it('has length 1', () => assert.strictEqual(Object[Symbol.hasInstance].length, 1));
                it
                (
                    'cannot be called with new',
                    () =>
                    assert.throws
                    (() => new Object[Symbol.hasInstance](), TypeError, /\bis not a constructor\b/)
                );
                it
                (
                    'is set only on superclasses',
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
                        assert.ownProperty(A, Symbol.hasInstance);
                        assert.ownProperty(B, Symbol.hasInstance);
                        assert.notOwnProperty(C, Symbol.hasInstance);
                        assert.notOwnProperty(D, Symbol.hasInstance);
                        assert.notOwnProperty(_AD, Symbol.hasInstance);
                    }
                );
                test('when this is not callable', { prototype: Object.prototype }, { }, false);
                test('when this is null', null, { }, false);
                test('when this has null prototype', Object.create(null), { }, false);
                test('with null argument', Object, null, false);
                test('with undefined argument', Object, undefined, false);
                test('with boolean type argument', Boolean, true, false);
                test('with number type argument', Number, 1, false);
                usingBigInt(() => test('with bigint type argument', BigInt, BigInt(1), false));
                test('with string type argument', String, 'foo', false);
                test('with symbol type argument', Symbol, Symbol.iterator, false);
                usingDocumentAll
                (() => test('with document.all argument', Object, document.all, true));
                test('when the argument is the prototype of this', Symbol, Symbol.prototype, false);

                describe
                (
                    'when this is a function with property \'prototype\' null',
                    () =>
                    {
                        test('with a primitive argument', createNullPrototypeFunction(), 1, false);
                        it
                        (
                            'throws a TypeError with an object argument',
                            () =>
                            {
                                const fn =
                                Object[Symbol.hasInstance].bind(createNullPrototypeFunction(), { });
                                assert.throws(fn, TypeError);
                            }
                        );
                    }
                );
            }
        );
    }

    function setupTestData()
    {
        const callData = { };

        class A
        {
            constructor(a)
            {
                callData.A =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    newTarget: new.target,
                    this: this,
                };
                if (a !== undefined)
                    this.aProp = a;
            }
            aMethod()
            { }
            get aGetOnly()
            {
                const value = Symbol();
                callData.A =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    getter: 'aGetOnly',
                    this: this,
                    value,
                };
                return value;
            }
            set aSetOnly(arg)
            {
                callData.A =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    setter: 'aSetOnly',
                    this: this,
                };
            }
            static aStatic()
            { }
            static get aStaticGet()
            {
                const value = Symbol();
                callData.A =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    getter: 'aStaticGet',
                    this: this,
                    value,
                };
                return value;
            }
            static set aStaticSet(arg)
            {
                callData.A =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    setter: 'aStaticSet',
                    this: this,
                };
            }
            someMethod()
            {
                return this.aProp;
            }
            static someStaticMethod()
            {
                return this.aProp;
            }
        }

        class B
        {
            constructor(b1, b2)
            {
                callData.B =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    newTarget: new.target,
                    this: this,
                };
                if (b1 !== undefined || b2 !== undefined)
                    this[b1] = b2;
            }
            bMethod()
            { }
            get bGetOnly()
            {
                const value = Symbol();
                callData.B =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    getter: 'bGetOnly',
                    this: this,
                    value,
                };
                return value;
            }
            set bSetOnly(arg)
            {
                callData.B =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    setter: 'bSetOnly',
                    this: this,
                };
            }
            static bStatic()
            { }
            static get bStaticGet()
            {
                const value = Symbol();
                callData.B =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    getter: 'bStaticGet',
                    this: this,
                    value,
                };
                return value;
            }
            static set bStaticSet(arg)
            {
                callData.B =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    setter: 'bStaticSet',
                    this: this,
                };
            }
            someMethod()
            {
                return this.bProp;
            }
            static someStaticMethod()
            {
                return this.bProp;
            }
        }

        const _AB = classes(A, B);

        class C extends _AB
        {
            getSuper(type)
            {
                return super.class(type);
            }
            static getStaticSuper(type)
            {
                return super.class(type);
            }
            static newStaticSuper(type)
            {
                const superClass = super.class;
                new superClass(type); // eslint-disable-line new-cap
            }
            newSuper(type)
            {
                const superClass = super.class;
                new superClass(type); // eslint-disable-line new-cap
            }
        }

        class D
        { }

        class E extends classes(C, D)
        {
            getSuper(type)
            {
                return super.class(type);
            }
            static getStaticSuper(type)
            {
                return super.class(type);
            }
        }

        const result = { A, B, _AB, C, D, E, callData };
        return result;
    }

    function usingBigInt(fn)
    {
        if (typeof BigInt === 'function')
            fn();
    }

    function usingDocumentAll(fn)
    {
        if (typeof document !== 'undefined')
            fn();
    }

    let assert;
    let loadProxymi;
    {
        const PROXYMI_PATH = '../lib/proxymi.js';

        let chai;
        if (typeof module !== 'undefined')
        {
            chai = require('chai');

            loadProxymi =
            () =>
            {
                const path = require.resolve(PROXYMI_PATH);
                delete require.cache[path];
                require(path);
            };
        }
        else
        {
            ({ chai } = self);
            loadProxymi =
            () =>
            {
                const promise =
                new Promise
                (
                    resolve =>
                    {
                        {
                            const script = document.querySelector(`script[src="${PROXYMI_PATH}"]`);
                            if (script)
                                script.parentNode.removeChild(script);
                        }
                        {
                            const script = document.createElement('script');
                            script.onload = resolve;
                            script.src = PROXYMI_PATH;
                            document.head.appendChild(script);
                        }
                    }
                );
                return promise;
            };
        }
        ({ assert } = chai);
    }
    loadProxymi();
    init();
}
)();
