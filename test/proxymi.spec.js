/* eslint-env mocha */
/* global classes, document, require, self */

(function ()
{
    'use strict';
    
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
        const regExp = new RegExp(`^${pattern}$`);
        return regExp;
    }
    
    function init()
    {
        describe(
            'classes',
            () =>
            {
                it(
                    'cannot be called with new',
                    () =>
                    assert.throws(
                        () => new classes(), // eslint-disable-line new-cap
                        TypeError,
                        /\bis not a constructor\b/
                    )
                );
                it(
                    'without arguments throws a TypeError',
                    () => assert.throws(() => classes(), TypeError, 'No superclasses specified')
                );
                it(
                    'works with a function that is not an instance of Function',
                    () =>
                    {
                        const foo = Function();
                        Object.setPrototypeOf(foo, { });
                        assert.doesNotThrow(() => classes(foo));
                    }
                );
                
                describe(
                    'provides instance level inheritance for',
                    () =>
                    {
                        it(
                            'the in operator',
                            () =>
                            {
                                const { C } = setupTestData();
                                const c = new C();
                                assert.property(c, 'aMethod');
                                assert.property(c, 'bMethod');
                            }
                        );
                        it(
                            'methods',
                            () =>
                            {
                                const { A, B, C } = setupTestData();
                                const c = new C();
                                assert.strictEqual(c.aMethod, A.prototype.aMethod);
                                assert.strictEqual(c.bMethod, B.prototype.bMethod);
                            }
                        );
                        it(
                            'ungettable properties',
                            () =>
                            {
                                const { C } = setupTestData();
                                const c = new C();
                                assert.strictEqual(c.aSetOnly, undefined);
                            }
                        );
                        it(
                            'direct base class getters',
                            () =>
                            {
                                const { C, callData } = setupTestData();
                                const c = new C();
                                const actual = c.aGetOnly;
                                assert.deepEqual(
                                    callData.A,
                                    { args: [], getter: 'aGetOnly', this: c, value: actual }
                                );
                            }
                        );
                        it(
                            'indirect base class getters',
                            () =>
                            {
                                const { E, callData } = setupTestData();
                                const e = new E();
                                const actual = e.aGetOnly;
                                assert.deepEqual(
                                    callData.A,
                                    { args: [], getter: 'aGetOnly', this: e, value: actual }
                                );
                            }
                        );
                        it(
                            'value overwriting',
                            () =>
                            {
                                const { A, C } = setupTestData();
                                A.prototype.a = 13;
                                const c = new C();
                                c.a = 42;
                                assert.deepEqual(
                                    Object.getOwnPropertyDescriptor(c, 'a'),
                                    {
                                        configurable: true,
                                        enumerable: true,
                                        value: 42,
                                        writable: true
                                    }
                                );
                            }
                        );
                        it(
                            'unsettable properties',
                            () =>
                            {
                                class A
                                { }
                                Object.defineProperty(A.prototype, 'a', { value: 13 });
                                class B extends classes(A)
                                { }
                                const b = new B();
                                assert.throws(
                                    () =>
                                    {
                                        b.a = 42;
                                    },
                                    TypeError
                                );
                            }
                        );
                        it(
                            'direct base class setters',
                            () =>
                            {
                                const { C, callData } = setupTestData();
                                const c = new C();
                                c.aSetOnly = 42;
                                assert.deepEqual(
                                    callData.A,
                                    { args: [42], setter: 'aSetOnly', this: c }
                                );
                            }
                        );
                        it(
                            'indirect base class setters',
                            () =>
                            {
                                const { E, callData } = setupTestData();
                                const e = new E();
                                e.aSetOnly = 42;
                                assert.deepEqual(
                                    callData.A,
                                    { args: [42], setter: 'aSetOnly', this: e }
                                );
                            }
                        );
                    }
                );
                
                it(
                    'allows adding new properties to an instance',
                    () =>
                    {
                        const { C } = setupTestData();
                        const c = new C();
                        c.cNewProp = 42;
                        assert.deepEqual(
                            Object.getOwnPropertyDescriptor(c, 'cNewProp'),
                            {
                                configurable: true,
                                enumerable: true,
                                value: 42,
                                writable: true
                            }
                        );
                    }
                );
                it(
                    'allows getting undefined properties from an instance',
                    () =>
                    {
                        const { E } = setupTestData();
                        const e = new E();
                        assert.isUndefined(e.unknown);
                    }
                );
                
                describe(
                    'provides class level inheritance for',
                    () =>
                    {
                        it(
                            'the in operator',
                            () =>
                            {
                                const { C } = setupTestData();
                                assert.property(C, 'aStatic');
                                assert.property(C, 'bStatic');
                            }
                        );
                        it(
                            'methods',
                            () =>
                            {
                                const { A, B, C } = setupTestData();
                                assert.strictEqual(C.aStatic, A.aStatic);
                                assert.strictEqual(C.bStatic, B.bStatic);
                            }
                        );
                        it(
                            'ungettable properties',
                            () =>
                            {
                                const { C } = setupTestData();
                                assert.strictEqual(C.aStaticSet, undefined);
                            }
                        );
                        it(
                            'direct base class getters',
                            () =>
                            {
                                const { C, callData } = setupTestData();
                                const actual = C.aStaticGet;
                                assert.deepEqual(
                                    callData.A,
                                    { args: [], getter: 'aStaticGet', this: C, value: actual }
                                );
                            }
                        );
                        it(
                            'indirect base class getters',
                            () =>
                            {
                                const { E, callData } = setupTestData();
                                const actual = E.aStaticGet;
                                assert.deepEqual(
                                    callData.A,
                                    { args: [], getter: 'aStaticGet', this: E, value: actual }
                                );
                            }
                        );
                        it(
                            'value overwriting',
                            () =>
                            {
                                const { A, C } = setupTestData();
                                A.aProp = 'A';
                                C.aProp = 'C';
                                assert.deepEqual(
                                    Object.getOwnPropertyDescriptor(C, 'aProp'),
                                    {
                                        configurable: true,
                                        enumerable: true,
                                        value: 'C',
                                        writable: true
                                    }
                                );
                            }
                        );
                        it(
                            'unsettable properties',
                            () =>
                            {
                                class A
                                { }
                                Object.defineProperty(A, 'aProp', { value: 'A' });
                                class B extends classes(A)
                                { }
                                assert.throws(
                                    () =>
                                    {
                                        B.aProp = 'B';
                                    },
                                    TypeError
                                );
                            }
                        );
                        it(
                            'direct base class setters',
                            () =>
                            {
                                const { C, callData } = setupTestData();
                                C.aStaticSet = 42;
                                assert.deepEqual(
                                    callData.A,
                                    { args: [42], setter: 'aStaticSet', this: C }
                                );
                            }
                        );
                        it(
                            'indirect base class setters',
                            () =>
                            {
                                const { E, callData } = setupTestData();
                                E.aStaticSet = 42;
                                assert.deepEqual(
                                    callData.A,
                                    { args: [42], setter: 'aStaticSet', this: E }
                                );
                            }
                        );
                    }
                );
                
                it(
                    'allows adding new properties to a class',
                    () =>
                    {
                        const { C } = setupTestData();
                        C.cNewProp = 42;
                        assert.deepEqual(
                            Object.getOwnPropertyDescriptor(C, 'cNewProp'),
                            {
                                configurable: true,
                                enumerable: true,
                                value: 42,
                                writable: true
                            }
                        );
                    }
                );
                it(
                    'allows getting undefined properties from a class',
                    () =>
                    {
                        const { E } = setupTestData();
                        assert.isUndefined(E.unknown);
                    }
                );
                
                usingDocumentAll(
                    () =>
                    describe(
                        'works well when document.all is in the prototype chain',
                        () =>
                        {
                            let Bar;
                            let Foo;
                            let bar;
                            let foo;
                            
                            beforeEach(
                                () =>
                                {
                                    Foo = Function();
                                    Foo.prototype = document.all;
                                    Bar =
                                        class extends classes(Foo)
                                        {
                                            getFromFoo(prop)
                                            {
                                                return super.class(Foo)[prop];
                                            }
                                        };
                                    bar = new Bar();
                                    foo = undefined;
                                    Object.defineProperty(
                                        document.all,
                                        'foo',
                                        {
                                            configurable: true,
                                            get: () => undefined,
                                            set: value =>
                                            {
                                                foo = value;
                                            }
                                        }
                                    );
                                }
                            );
                            
                            afterEach(() => delete document.all.foo);
                            
                            it('with getters', () => assert.strictEqual(bar[0], document.all[0]));
                            it(
                                'with setters',
                                () =>
                                {
                                    bar.foo = 42;
                                    assert.strictEqual(foo, 42);
                                }
                            );
                            it(
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
                
                describe(
                    'throws a TypeError',
                    () =>
                    {
                        it(
                            'with a null argument',
                            () =>
                            assert.throws(
                                () => classes(null),
                                TypeError,
                                exactRegExp('null is not a constructor')
                            )
                        );
                        it(
                            'with a symbol argument',
                            () =>
                            assert.throws(
                                () => classes(Symbol()),
                                TypeError,
                                exactRegExp('Symbol() is not a constructor')
                            )
                        );
                        it(
                            'with a non-callable object argument',
                            () =>
                            assert.throws(
                                () => classes({ }),
                                TypeError,
                                exactRegExp('[object Object] is not a constructor')
                            )
                        );
                        it(
                            'with a non-constructor callable argument',
                            () => assert.throws(
                                () => classes(() => undefined),
                                TypeError,
                                exactRegExp('() => undefined is not a constructor')
                            )
                        );
                        it(
                            'with a bound function',
                            () => assert.throws(
                                () => classes(Array.bind()),
                                TypeError,
                                exactRegExp(
                                    'Property \'prototype\' of bound Array is not an object or null'
                                )
                            )
                        );
                        it(
                            'with a function with a non-object property \'prototype\' value',
                            () =>
                            {
                                const foo = Function();
                                Object.defineProperty(foo, 'prototype', { value: 42 });
                                assert.throws(
                                    () => classes(foo),
                                    TypeError,
                                    exactRegExp(
                                        'Property \'prototype\' of anonymous is not an object or ' +
                                        'null'
                                    )
                                );
                            }
                        );
                        it(
                            'with a repeated argument',
                            () =>
                            {
                                const { A, B } = setupTestData();
                                assert.throws(
                                    () => classes(A, B, A),
                                    TypeError,
                                    exactRegExp('Duplicate superclass A')
                                );
                            }
                        );
                    }
                );
                
                it(
                    'gets property \'prototype\' only once',
                    () =>
                    {
                        function getPrototype()
                        {
                            ++getCount;
                            return null;
                        }
                        
                        let getCount = 0;
                        const foo = Function().bind();
                        Object.defineProperty(foo, 'prototype', { get: getPrototype });
                        classes(foo);
                        assert.equal(getCount, 1);
                    }
                );
                
                describe(
                    'exposes class property',
                    () =>
                    {
                        it(
                            'prototype',
                            () =>
                            {
                                const { A, _AB } = setupTestData();
                                const yDescriptor = Object.getOwnPropertyDescriptor(A, 'prototype');
                                yDescriptor.value = _AB.prototype;
                                const xDescriptor =
                                    Object.getOwnPropertyDescriptor(_AB, 'prototype');
                                assert.deepEqual(xDescriptor, yDescriptor);
                            }
                        );
                        it(
                            'length',
                            () =>
                            {
                                const { A, _AB } = setupTestData();
                                const yDescriptor = Object.getOwnPropertyDescriptor(A, 'length');
                                yDescriptor.value = _AB.length;
                                const xDescriptor = Object.getOwnPropertyDescriptor(_AB, 'length');
                                assert.deepEqual(xDescriptor, yDescriptor);
                            }
                        );
                        it(
                            'constructor',
                            () =>
                            {
                                const { A, _AB } = setupTestData();
                                const yDescriptor =
                                    Object.getOwnPropertyDescriptor(A.prototype, 'constructor');
                                yDescriptor.value = _AB;
                                const xDescriptor =
                                    Object.getOwnPropertyDescriptor(_AB.prototype, 'constructor');
                                assert.deepEqual(xDescriptor, yDescriptor);
                            }
                        );
                    }
                );
                
                it(
                    'constructor must be called with new',
                    () =>
                    {
                        const { _AB } = setupTestData();
                        assert.throws(
                            () => _AB(),
                            TypeError,
                            exactRegExp('Class constructor (A,B) cannot be invoked without \'new\'')
                        );
                    }
                );
                it(
                    'instance prototype cannot be modified',
                    () =>
                    {
                        const { _AB } = setupTestData();
                        assert.throws(() => Object.setPrototypeOf(_AB.prototype, { }), TypeError);
                    }
                );
                it(
                    'class prototype cannot be modified',
                    () =>
                    {
                        const { _AB } = setupTestData();
                        assert.throws(() => Object.setPrototypeOf(_AB, { }), TypeError);
                    }
                );
                
                describe(
                    'super in constructor',
                    () =>
                    {
                        it(
                            'invokes a direct super constructor',
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
                        it(
                            'throws a TypeError for wrong argument',
                            () =>
                            {
                                const { C } = setupTestData();
                                assert.throws(() => new C(0), TypeError);
                            }
                        );
                        it(
                            'sets own properties on this',
                            () =>
                            {
                                const { C } = setupTestData();
                                const c = new C(undefined, ['foo', 'bar']);
                                assert.strictEqual(c.foo, 'bar');
                            }
                        );
                        it(
                            'does not overwrite own properties on this',
                            () =>
                            {
                                const { C } = setupTestData();
                                const c = new C([42], ['aProp', 13]);
                                assert.strictEqual(c.aProp, 42);
                            }
                        );
                    }
                );
                
                it(
                    'name',
                    () =>
                    {
                        class ぁ1
                        { }
                        class ぁ2
                        { }
                        class ぁ3
                        { }
                        assert.strictEqual(classes(ぁ1, ぁ2, ぁ3).name, '(ぁ1,ぁ2,ぁ3)');
                    }
                );
                
                describe(
                    'superclass prototype is treated as immutable',
                    () =>
                    {
                        let Foo;
                        let Bar;
                        let bar;
                        beforeEach(
                            () =>
                            {
                                Foo =
                                    function ()
                                    { };
                                Foo.prototype.foo = 42;
                                Bar =
                                    class extends classes(Foo)
                                    {
                                        bar()
                                        {
                                            return super.class(Foo).foo;
                                        }
                                    };
                                Foo.prototype = { };
                                bar = new Bar();
                            }
                        );
                        it('in prototype proxy', () => assert.strictEqual(bar.foo, 42));
                        it('in super proxy', () => assert.strictEqual(bar.bar(), 42));
                    }
                );
                
                describe(
                    'null prototype',
                    () =>
                    {
                        let Foo;
                        let bar;
                        beforeEach(
                            () =>
                            {
                                Foo = createNullPrototypeFunction('Foo');
                            }
                        );
                        describe(
                            'in this works with',
                            () =>
                            {
                                beforeEach(
                                    () =>
                                    {
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
                                it(
                                    'get',
                                    () =>
                                    {
                                        const foo = 42;
                                        bar.foo = foo;
                                        assert.strictEqual(bar.bar, foo);
                                    }
                                );
                                it(
                                    'in',
                                    () =>
                                    {
                                        const foo = 43;
                                        bar.foo = foo;
                                        assert.isTrue(bar.in());
                                    }
                                );
                                it(
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
                        describe(
                            'in super throws a TypeError with',
                            () =>
                            {
                                const unprototypedSuperclassErrorRegExp =
                                    exactRegExp(
                                        'Property \'prototype\' of superclass is null',
                                        'undefined is not an object (evaluating \'super.class\')'
                                    );
                                beforeEach(
                                    () =>
                                    {
                                        class Bar extends classes(Foo)
                                        {
                                            get bar()
                                            {
                                                return super.class(Foo).foo;
                                            }
                                            set bar(value)
                                            {
                                                super.class(Foo).foo = value;
                                            }
                                        }
                                        bar = new Bar();
                                    }
                                );
                                it(
                                    'get',
                                    () =>
                                    {
                                        assert.throws(
                                            () => void bar.bar,
                                            TypeError,
                                            unprototypedSuperclassErrorRegExp
                                        );
                                    }
                                );
                                it(
                                    'set',
                                    () =>
                                    {
                                        assert.throws(
                                            () =>
                                            {
                                                bar.bar = undefined;
                                            },
                                            TypeError,
                                            unprototypedSuperclassErrorRegExp
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
        
        describe(
            'super.class',
            ()  =>
            {
                describe(
                    'in nonstatic context',
                    () =>
                    {
                        it(
                            'cannot be called with new',
                            () =>
                            {
                                const { A, C } = setupTestData();
                                const c = new C();
                                assert.throws(
                                    () => c.newSuper(A),
                                    TypeError,
                                    /\bis not a constructor\b/
                                );
                            }
                        );
                        it(
                            'returns a proxy for any superclass argument',
                            () =>
                            {
                                const { A, C } = setupTestData();
                                const c = new C();
                                assert.instanceOf(c.getSuper(A), C);
                            }
                        );
                        it(
                            'throws a TypeError for wrong argument',
                            () =>
                            {
                                const { A, E } = setupTestData();
                                const e = new E();
                                assert.throws(
                                    () => e.getSuper(A),
                                    TypeError,
                                    exactRegExp('Argument is not a direct superclass')
                                );
                            }
                        );
                        it(
                            'invokes a direct superclass method',
                            () =>
                            {
                                const { A, B, C } = setupTestData();
                                const c = new C();
                                c.aProp = 'A';
                                c.bProp = 'B';
                                assert.strictEqual(c.getSuper(A).someMethod(), 'A');
                                assert.strictEqual(c.getSuper(B).someMethod(), 'B');
                            }
                        );
                        it(
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
                        it(
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
                        it(
                            'invokes an indirect superclass getter',
                            () =>
                            {
                                const { A, B, C, E, callData } = setupTestData();
                                const e = new E();
                                {
                                    const actual = e.getSuper(C).getSuper(A).aGetOnly;
                                    assert.deepEqual(callData.A.args, []);
                                    assert.strictEqual(callData.A.getter, 'aGetOnly');
                                    assert(isInPrototypeChainOf(e, callData.A.this));
                                    assert.strictEqual(callData.A.value, actual);
                                }
                                {
                                    const actual = e.getSuper(C).getSuper(B).bGetOnly;
                                    assert.deepEqual(callData.B.args, []);
                                    assert.strictEqual(callData.B.getter, 'bGetOnly');
                                    assert(isInPrototypeChainOf(e, callData.B.this));
                                    assert.strictEqual(callData.B.value, actual);
                                }
                            }
                        );
                        it(
                            'does not invoke a getter in a different superclass',
                            () =>
                            {
                                const { A, B, C, callData } = setupTestData();
                                const c = new C();
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
                        it(
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
                        it(
                            'invokes an indirect superclass setter',
                            () =>
                            {
                                const { A, B, C, E, callData } = setupTestData();
                                const e = new E();
                                
                                e.getSuper(C).getSuper(A).aSetOnly = 42;
                                assert.deepEqual(callData.A.args, [42]);
                                assert.strictEqual(callData.A.setter, 'aSetOnly');
                                assert(isInPrototypeChainOf(e, callData.A.this));
                                
                                e.getSuper(C).getSuper(B).bSetOnly = 'foo';
                                assert.deepEqual(callData.B.args, ['foo']);
                                assert.strictEqual(callData.B.setter, 'bSetOnly');
                                assert(isInPrototypeChainOf(e, callData.B.this));
                            }
                        );
                        it(
                            'does not invoke a setter in a different superclass',
                            () =>
                            {
                                const { A, B, C, callData } = setupTestData();
                                const c = new C();
                                c.getSuper(A).bSetOnly = 42;
                                c.getSuper(B).aSetOnly = 13;
                                assert(c.hasOwnProperty('aSetOnly'));
                                assert(c.hasOwnProperty('bSetOnly'));
                                assert.isEmpty(callData);
                            }
                        );
                    }
                );
                
                describe(
                    'in static context',
                    () =>
                    {
                        it(
                            'cannot be called with new',
                            () =>
                            {
                                const { A, C } = setupTestData();
                                assert.throws(
                                    () => C.newStaticSuper(A),
                                    TypeError,
                                    /\bis not a constructor\b/
                                );
                            }
                        );
                        it(
                            'returns a proxy for any superclass argument',
                            () =>
                            {
                                const { A, C } = setupTestData();
                                assert.isNotNull(C.getStaticSuper(A));
                            }
                        );
                        it(
                            'throws a TypeError for wrong argument',
                            () =>
                            {
                                const { A, E } = setupTestData();
                                assert.throws(
                                    () => E.getStaticSuper(A),
                                    TypeError,
                                    exactRegExp('Argument is not a direct superclass')
                                );
                            }
                        );
                        it(
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
                        it(
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
                        it(
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
                        it(
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
                        it(
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
        
        describe(
            'Object.getPrototypeListOf',
            () =>
            {
                it(
                    'cannot be called with new',
                    () =>
                    assert.throws(
                        () => new Object.getPrototypeListOf(), // eslint-disable-line new-cap
                        TypeError,
                        /\bis not a constructor\b/
                    )
                );
                it(
                    'returns an empty array if an object has null prototype',
                    () => assert.deepEqual(Object.getPrototypeListOf(Object.create(null)), [])
                );
                it(
                    'returns a one element array if an object has a non-null prototype',
                    () => assert.deepEqual(Object.getPrototypeListOf({ }), [Object.prototype])
                );
                it(
                    'returns the prototype of a multiple inheritance class',
                    () =>
                    {
                        const { C } = setupTestData();
                        const actual = Object.getPrototypeListOf(C);
                        assert.deepEqual(actual, [Object.getPrototypeOf(C)]);
                    }
                );
                it(
                    'returns the prototype of a multiple inheritance object',
                    () =>
                    {
                        const { C } = setupTestData();
                        const actual = Object.getPrototypeListOf(new C());
                        assert.deepEqual(actual, [C.prototype]);
                    }
                );
                it(
                    'returns all prototypes of a clustered constructor',
                    () =>
                    {
                        const { A, B, _AB } = setupTestData();
                        const actual = Object.getPrototypeListOf(_AB);
                        assert.deepEqual(actual, [A, B]);
                    }
                );
                it(
                    'returns all prototypes of a clustered prototype excluding null and duplicates',
                    () =>
                    {
                        class A
                        { }
                        const B = createNullPrototypeFunction();
                        class C
                        { }
                        function D()
                        { }
                        D.prototype = A.prototype;
                        const _ABCD = classes(A, B, C, D);
                        const actual = Object.getPrototypeListOf(_ABCD.prototype);
                        assert.deepEqual(actual, [A.prototype, C.prototype]);
                    }
                );
                usingDocumentAll(
                    () =>
                    it(
                        'returns a one element array if an object has document.all for prototype',
                        () =>
                        {
                            assert.deepEqual(
                                Object.getPrototypeListOf(Object.create(document.all)),
                                [document.all]
                            );
                        }
                    )
                );
            }
        );
        
        describe(
            'instanceof',
            () =>
            {
                it(
                    'works with all base types',
                    () =>
                    {
                        const A = createNullPrototypeFunction('A');
                        class B
                        { }
                        class C
                        { }
                        const _BC = classes(B, C);
                        class D extends _BC
                        { }
                        class E extends classes(A, D)
                        { }
                        const e = new E();
                        assert.instanceOf(e, B);
                        assert.instanceOf(e, _BC);
                        assert.instanceOf(e, C);
                        assert.instanceOf(e, D);
                        assert.instanceOf(e, Object);
                    }
                );
                it(
                    'works with bound types',
                    () =>
                    {
                        class A
                        { }
                        const Aʼʼ = A.bind(1).bind(2);
                        class B extends classes(A)
                        { }
                        class C extends B
                        { }
                        const Cʼʼ = C.bind(3).bind(4);
                        assert.instanceOf(new Cʼʼ(), Aʼʼ);
                    }
                );
                it(
                    'works with subclasses of bound types',
                    () =>
                    {
                        class A
                        { }
                        const Aʼʼ = A.bind().bind();
                        class B extends classes(A)
                        { }
                        const Bʼʼ = B.bind().bind();
                        class C extends classes(Bʼʼ)
                        { }
                        const Cʼʼ = C.bind().bind();
                        assert.instanceOf(new Cʼʼ(), Aʼʼ);
                    }
                );
            }
        );
        
        describe(
            '[Symbol.hasInstance]',
            () =>
            {
                function test(argDescription, type, arg, expectedResult)
                {
                    const description = `returns ${expectedResult} ${argDescription}`;
                    it(
                        description,
                        () =>
                        {
                            assert.equal(
                                Object[Symbol.hasInstance].call(type, arg),
                                expectedResult
                            );
                        }
                    );
                }
                
                it(
                    'cannot be called with new',
                    () =>
                    assert.throws(
                        () => new Object[Symbol.hasInstance](),
                        TypeError,
                        /\bis not a constructor\b/
                    )
                );
                it(
                    'has name \'[Symbol.hasInstance]\'',
                    () =>
                    {
                        assert.strictEqual(Object[Symbol.hasInstance].name, '[Symbol.hasInstance]');
                    }
                );
                it(
                    'is set on base classes',
                    () =>
                    {
                        class A
                        { }
                        class B
                        { }
                        classes(A, B);
                        class D
                        { }
                        class E extends D
                        { }
                        classes(E);
                        assert(A.hasOwnProperty(Symbol.hasInstance));
                        assert(B.hasOwnProperty(Symbol.hasInstance));
                        assert(D.hasOwnProperty(Symbol.hasInstance));
                    }
                );
                it(
                    'is not set on derived classes',
                    () =>
                    {
                        class A
                        { }
                        const _A = classes(A);
                        class B extends _A
                        { }
                        class C extends B
                        { }
                        class D extends classes(C)
                        { }
                        assert(!_A.hasOwnProperty(Symbol.hasInstance));
                        assert(!B.hasOwnProperty(Symbol.hasInstance));
                        assert(!C.hasOwnProperty(Symbol.hasInstance));
                        assert(!D.hasOwnProperty(Symbol.hasInstance));
                    }
                );
                test('when this is not callable', { prototype: Object.prototype }, { }, false);
                test('when this is null', null, { }, false);
                test('with null argument', Object, null, false);
                test('with undefined argument', Object, undefined, false);
                test('with boolean type argument', Boolean, true, false);
                test('with number type argument', Number, 1, false);
                test('with string type argument', String, 'foo', false);
                test('with symbol type argument', Symbol, Symbol.iterator, false);
                usingDocumentAll(
                    () => test('with document.all argument', Object, document.all, true)
                );
                test('when the argument is the prototype of this', Symbol, Symbol.prototype, false);
                it(
                    'throws a TypeError when this has null prototype',
                    () =>
                    {
                        const arg = Object.create(null);
                        const fn =
                            Object[Symbol.hasInstance].bind(createNullPrototypeFunction(), arg);
                        assert.throws(fn, TypeError);
                    }
                );
                test(
                    'with a primitive argument when this has null prototype',
                    createNullPrototypeFunction(),
                    1,
                    false
                );
            }
        );
    }
    
    function isInPrototypeChainOf(obj1, obj2)
    {
        const Temp = Function();
        Temp.prototype = obj1;
        const result = obj2 instanceof Temp;
        return result;
    }
    
    function setupTestData()
    {
        const callData = { };
        class A
        {
            constructor(a)
            {
                if (a !== undefined)
                {
                    callData.A =
                    {
                        args: [...arguments], // eslint-disable-line prefer-rest-params
                        newTarget: new.target,
                        this: this
                    };
                    this.aProp = a;
                }
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
                    value
                };
                return value;
            }
            set aSetOnly(arg)
            {
                callData.A =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    setter: 'aSetOnly',
                    this: this
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
                    value
                };
                return value;
            }
            static set aStaticSet(arg)
            {
                callData.A =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    setter: 'aStaticSet',
                    this: this
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
                if (b1 !== undefined || b2 !== undefined)
                {
                    callData.B =
                    {
                        args: [...arguments], // eslint-disable-line prefer-rest-params
                        newTarget: new.target,
                        this: this
                    };
                    this[b1] = b2;
                }
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
                    value
                };
                return value;
            }
            set bSetOnly(arg)
            {
                callData.B =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    setter: 'bSetOnly',
                    this: this
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
                    value
                };
                return value;
            }
            static set bStaticSet(arg)
            {
                callData.B =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    setter: 'bStaticSet',
                    this: this
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
    
    function usingDocumentAll(fn)
    {
        if (typeof document !== 'undefined')
            fn();
    }
    
    let assert;
    {
        let chai;
        if (typeof module !== 'undefined')
        {
            chai = require('chai');
            require('../lib/proxymi.js');
        }
        else
            ({ chai } = self);
        ({ assert } = chai);
    }
    init();
}
)();
