/* eslint-env mocha */
/* global assert, classes, global, self */

(function (global)
{
    'use strict';
    
    function isInPrototypeChainOf(obj1, obj2)
    {
        let Temp = Function();
        Temp.prototype = obj1;
        let result = obj2 instanceof Temp;
        return result;
    }
    
    function init()
    {
        let A;
        let B;
        let X;
        let C;
        let D;
        let E;
        let callData;
        
        beforeEach(
            () =>
            {
                A =
                    class A
                    {
                        constructor(a)
                        {
                            if (a !== void 0)
                            {
                                (callData || (callData = { })).A =
                                {
                                    args: Array.from(arguments),
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
                            let value = Symbol();
                            (callData || (callData = { })).A =
                            {
                                args: Array.from(arguments),
                                getter: 'aGetOnly',
                                this: this,
                                value
                            };
                            return value;
                        }
                        set aSetOnly(arg) // eslint-disable-line no-unused-vars
                        {
                            (callData || (callData = { })).A =
                            { args: Array.from(arguments), setter: 'aSetOnly', this: this };
                        }
                        static aStatic()
                        { }
                        static get aStaticGet()
                        {
                            let value = Symbol();
                            (callData || (callData = { })).A =
                            {
                                args: Array.from(arguments),
                                getter: 'aStaticGet',
                                this: this,
                                value
                            };
                            return value;
                        }
                        static set aStaticSet(arg) // eslint-disable-line no-unused-vars
                        {
                            (callData || (callData = { })).A =
                            { args: Array.from(arguments), setter: 'aStaticSet', this: this };
                        }
                        someMethod()
                        {
                            return this.aProp;
                        }
                        static someStaticMethod()
                        {
                            return this.aProp;
                        }
                        static get staticGS()
                        {
                            let value = Symbol();
                            (callData || (callData = { })).A =
                            {
                                args: Array.from(arguments),
                                getter: 'staticGS',
                                this: this,
                                value
                            };
                            return value;
                        }
                    };
                B =
                    class B
                    {
                        constructor(b1, b2)
                        {
                            if (b1 !== void 0 || b2 !== void 0)
                            {
                                (callData || (callData = { })).B =
                                {
                                    args: Array.from(arguments),
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
                            let value = Symbol();
                            (callData || (callData = { })).B =
                            {
                                args: Array.from(arguments),
                                getter: 'bGetOnly',
                                this: this,
                                value
                            };
                            return value;
                        }
                        set bSetOnly(arg) // eslint-disable-line no-unused-vars
                        {
                            (callData || (callData = { })).B =
                            { args: Array.from(arguments), setter: 'bSetOnly', this: this };
                        }
                        static bStatic()
                        { }
                        static get bStaticGet()
                        {
                            let value = Symbol();
                            (callData || (callData = { })).B =
                            {
                                args: Array.from(arguments),
                                getter: 'bStaticGet',
                                this: this,
                                value
                            };
                            return value;
                        }
                        static set bStaticSet(arg) // eslint-disable-line no-unused-vars
                        {
                            (callData || (callData = { })).B =
                            { args: Array.from(arguments), setter: 'bStaticSet', this: this };
                        }
                        someMethod()
                        {
                            return this.bProp;
                        }
                        static someStaticMethod()
                        {
                            return this.bProp;
                        }
                        static get staticGS()
                        {
                            let value = Symbol();
                            (callData || (callData = { })).B =
                            {
                                args: Array.from(arguments),
                                getter: 'staticGS',
                                this: this,
                                value
                            };
                            return value;
                        }
                    };
                X = classes(A, B);
                C =
                    class C extends X
                    {
                        constructor(...args) // eslint-disable-line no-useless-constructor
                        {
                            super(...args);
                        }
                        getSuper(type)
                        {
                            return super.class(type);
                        }
                        static getStaticSuper(type)
                        {
                            return super.class(type);
                        }
                    };
                D = class D { };
                E =
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
                    };
                callData = null;
            }
        );
        
        describe(
            'classes',
            () =>
            {
                describe(
                    'provides instance level inheritance for',
                    () =>
                    {
                        it(
                            'the in operator',
                            () =>
                            {
                                let c = new C();
                                assert.ok('aMethod' in c);
                                assert.ok('bMethod' in c);
                            }
                        );
                        it(
                            'methods',
                            () =>
                            {
                                let c = new C();
                                assert.strictEqual(c.aMethod, A.prototype.aMethod);
                                assert.strictEqual(c.bMethod, B.prototype.bMethod);
                            }
                        );
                        it(
                            'ungettable properties',
                            () =>
                            {
                                let c = new C();
                                assert.strictEqual(c.aSetOnly, void 0);
                            }
                        );
                        it(
                            'direct base class getters',
                            () =>
                            {
                                let c = new C();
                                let actual = c.aGetOnly;
                                assert.deepStrictEqual(
                                    callData.A,
                                    { args: [], getter: 'aGetOnly', this: c, value: actual }
                                );
                            }
                        );
                        it(
                            'indirect base class getters',
                            () =>
                            {
                                let e = new E();
                                let actual = e.aGetOnly;
                                assert.deepStrictEqual(
                                    callData.A,
                                    { args: [], getter: 'aGetOnly', this: e, value: actual }
                                );
                            }
                        );
                        it(
                            'value overwriting',
                            () =>
                            {
                                A.prototype.a = 13;
                                let c = new C();
                                c.a = 42;
                                assert.deepStrictEqual(
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
                                Object.defineProperty(A.prototype, 'a', { value: 13 });
                                let c = new C();
                                assert.throws(
                                    () =>
                                    {
                                        c.a = 42;
                                    },
                                    TypeError
                                );
                            }
                        );
                        it(
                            'direct base class setters',
                            () =>
                            {
                                let c = new C();
                                c.aSetOnly = 42;
                                assert.deepStrictEqual(
                                    callData.A,
                                    { args: [42], setter: 'aSetOnly', this: c }
                                );
                            }
                        );
                        it(
                            'indirect base class setters',
                            () =>
                            {
                                let e = new E();
                                e.aSetOnly = 42;
                                assert.deepStrictEqual(
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
                        let c = new C();
                        c.cNewProp = 42;
                        assert.ok('cNewProp' in c);
                        assert.deepStrictEqual(
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
                describe(
                    'provides class level inheritance for',
                    () =>
                    {
                        it(
                            'the in operator',
                            () =>
                            {
                                assert.ok('aStatic' in C);
                                assert.ok('bStatic' in C);
                            }
                        );
                        it(
                            'methods',
                            () =>
                            {
                                assert.strictEqual(C.aStatic, A.aStatic);
                                assert.strictEqual(C.bStatic, B.bStatic);
                            }
                        );
                        it(
                            'ungettable properties',
                            () =>
                            {
                                assert.strictEqual(C.aStaticSet, void 0);
                            }
                        );
                        it(
                            'direct base class getters',
                            () =>
                            {
                                let actual = C.aStaticGet;
                                assert.deepStrictEqual(
                                    callData.A,
                                    { args: [], getter: 'aStaticGet', this: C, value: actual }
                                );
                            }
                        );
                        it(
                            'indirect base class getters',
                            () =>
                            {
                                let actual = E.aStaticGet;
                                assert.deepStrictEqual(
                                    callData.A,
                                    { args: [], getter: 'aStaticGet', this: E, value: actual }
                                );
                            }
                        );
                        it(
                            'value overwriting',
                            () =>
                            {
                                A.aProp = 'A';
                                C.aProp = 'C';
                                assert.deepStrictEqual(
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
                                Object.defineProperty(A, 'aProp', { value: 'A' });
                                assert.throws(
                                    () =>
                                    {
                                        C.aProp = 'C';
                                    },
                                    TypeError
                                );
                            }
                        );
                        it(
                            'direct base class setters',
                            () =>
                            {
                                C.aStaticSet = 42;
                                assert.deepStrictEqual(
                                    callData.A,
                                    { args: [42], setter: 'aStaticSet', this: C }
                                );
                            }
                        );
                        it(
                            'indirect base class setters',
                            () =>
                            {
                                E.aStaticSet = 42;
                                assert.deepStrictEqual(
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
                        C.cNewProp = 42;
                        assert.deepStrictEqual(
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
                    'without arguments evaluates to null',
                    () =>
                    {
                        assert.strictEqual(classes(), null);
                    }
                );
                it(
                    'with invalid arguments throws a TypeError',
                    () =>
                    {
                        assert.throws(
                            () =>
                            {
                                classes({ });
                            },
                            TypeError
                        );
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
                                let yDescriptor = Object.getOwnPropertyDescriptor(A, 'prototype');
                                yDescriptor.value = X.prototype;
                                let xDescriptor = Object.getOwnPropertyDescriptor(X, 'prototype');
                                assert.deepStrictEqual(xDescriptor, yDescriptor);
                            }
                        );
                        it(
                            'length',
                            () =>
                            {
                                let yDescriptor = Object.getOwnPropertyDescriptor(A, 'length');
                                yDescriptor.value = X.length;
                                let xDescriptor = Object.getOwnPropertyDescriptor(X, 'length');
                                assert.deepStrictEqual(xDescriptor, yDescriptor);
                            }
                        );
                        it(
                            'constructor',
                            () =>
                            {
                                let yDescriptor =
                                    Object.getOwnPropertyDescriptor(A.prototype, 'constructor');
                                yDescriptor.value = X;
                                let xDescriptor =
                                    Object.getOwnPropertyDescriptor(X.prototype, 'constructor');
                                assert.deepStrictEqual(xDescriptor, yDescriptor);
                            }
                        );
                    }
                );
                it(
                    'constructor must be called with \'new\'',
                    () =>
                    {
                        assert.throws(
                            X,
                            RegExp(
                                '^TypeError: Class constructor \\(A,B\\) cannot be invoked ' +
                                'without \'new\'$'
                            )
                        );
                    }
                );
                it(
                    'instance prototype cannot be modified',
                    () =>
                    {
                        assert.throws(
                            () =>
                            {
                                Object.setPrototypeOf(X.prototype, { });
                            },
                            TypeError
                        );
                    }
                );
                it(
                    'class prototype cannot be modified',
                    () =>
                    {
                        assert.throws(
                            () =>
                            {
                                Object.setPrototypeOf(X, { });
                            },
                            TypeError
                        );
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
                                new C([42], ['foo', 'bar']);
                                assert.deepStrictEqual(callData.A.args, [42]);
                                assert.strictEqual(callData.A.newTarget, C);
                                assert.ok(callData.A.this instanceof C);
                                assert.deepStrictEqual(callData.B.args, ['foo', 'bar']);
                                assert.strictEqual(callData.B.newTarget, C);
                                assert.ok(callData.B.this instanceof C);
                            }
                        );
                        it(
                            'throws a TypeError for wrong argument',
                            () =>
                            {
                                assert.throws(() => new C(0), TypeError);
                            }
                        );
                        it(
                            'sets own properties on this',
                            () =>
                            {
                                let c = new C(void 0, ['foo', 'bar']);
                                assert.strictEqual(c.foo, 'bar');
                            }
                        );
                        it(
                            'does not overwrite own properties on this',
                            () =>
                            {
                                let c = new C([42], ['aProp', 13]);
                                assert.strictEqual(c.aProp, 42);
                            }
                        );
                    }
                );
                describe(
                    'super.class in nonstatic context',
                    () =>
                    {
                        it(
                            'returns a proxy for any superclass argument',
                            () =>
                            {
                                let c = new C();
                                assert.ok(c.getSuper(A) instanceof C);
                            }
                        );
                        it(
                            'throws a TypeError for wrong argument',
                            () =>
                            {
                                let e = new E();
                                assert.throws(
                                    () => e.getSuper(A),
                                    /^TypeError: Argument is not a direct superclass$/
                                );
                            }
                        );
                        it(
                            'invokes a direct superclass method',
                            () =>
                            {
                                let c = new C();
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
                                let e = new E();
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
                                let c = new C();
                                {
                                    let actual = c.getSuper(A).aGetOnly;
                                    assert.deepEqual(callData.A.args, []);
                                    assert.strictEqual(callData.A.getter, 'aGetOnly');
                                    assert.strictEqual(callData.A.this, c);
                                    assert.strictEqual(callData.A.value, actual);
                                }
                                {
                                    let actual = c.getSuper(B).bGetOnly;
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
                                let e = new E();
                                {
                                    let actual = e.getSuper(C).getSuper(A).aGetOnly;
                                    assert.deepEqual(callData.A.args, []);
                                    assert.strictEqual(callData.A.getter, 'aGetOnly');
                                    assert.ok(isInPrototypeChainOf(e, callData.A.this));
                                    assert.strictEqual(callData.A.value, actual);
                                }
                                {
                                    let actual = e.getSuper(C).getSuper(B).bGetOnly;
                                    assert.deepEqual(callData.B.args, []);
                                    assert.strictEqual(callData.B.getter, 'bGetOnly');
                                    assert.ok(isInPrototypeChainOf(e, callData.B.this));
                                    assert.strictEqual(callData.B.value, actual);
                                }
                            }
                        );
                        it(
                            'does not invoke a getter in a different superclass',
                            () =>
                            {
                                let c = new C();
                                {
                                    let actual = c.getSuper(A).bGetOnly;
                                    assert.strictEqual(actual, void 0);
                                    assert.strictEqual(callData, null);
                                }
                                {
                                    let actual = c.getSuper(B).aGetOnly;
                                    assert.strictEqual(actual, void 0);
                                    assert.strictEqual(callData, null);
                                }
                            }
                        );
                        it(
                            'invokes a direct superclass setter',
                            () =>
                            {
                                let c = new C();
                                
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
                                let e = new E();
                                
                                e.getSuper(C).getSuper(A).aSetOnly = 42;
                                assert.deepEqual(callData.A.args, [42]);
                                assert.strictEqual(callData.A.setter, 'aSetOnly');
                                assert.ok(isInPrototypeChainOf(e, callData.A.this));
                                
                                e.getSuper(C).getSuper(B).bSetOnly = 'foo';
                                assert.deepEqual(callData.B.args, ['foo']);
                                assert.strictEqual(callData.B.setter, 'bSetOnly');
                                assert.ok(isInPrototypeChainOf(e, callData.B.this));
                            }
                        );
                        it(
                            'does not invoke a setter in a different superclass',
                            () =>
                            {
                                let c = new C();
                                c.getSuper(A).bSetOnly = 42;
                                c.getSuper(B).aSetOnly = 13;
                                assert.ok(c.hasOwnProperty('aSetOnly'));
                                assert.ok(c.hasOwnProperty('bSetOnly'));
                                assert.strictEqual(callData, null);
                            }
                        );
                    }
                );
                describe(
                    'super.class in static context',
                    () =>
                    {
                        it(
                            'returns a proxy for any superclass argument',
                            () =>
                            {
                                assert.notEqual(C.getStaticSuper(A), null);
                            }
                        );
                        it(
                            'throws a TypeError for wrong argument',
                            () =>
                            {
                                assert.throws(
                                    () => E.getStaticSuper(A),
                                    /^TypeError: Argument is not a direct superclass$/
                                );
                            }
                        );
                        it(
                            'invokes a direct superclass method',
                            () =>
                            {
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
                                {
                                    let actual = C.getStaticSuper(A).staticGS;
                                    assert.deepEqual(callData.A.args, []);
                                    assert.strictEqual(callData.A.getter, 'staticGS');
                                    assert.strictEqual(callData.A.this, C);
                                    assert.strictEqual(callData.A.value, actual);
                                }
                                {
                                    let actual = C.getStaticSuper(B).staticGS;
                                    assert.deepEqual(callData.B.args, []);
                                    assert.strictEqual(callData.B.getter, 'staticGS');
                                    assert.strictEqual(callData.B.this, C);
                                    assert.strictEqual(callData.B.value, actual);
                                }
                            }
                        );
                        it(
                            'does not invoke a getter in a different superclass',
                            () =>
                            {
                                {
                                    let actual = C.getStaticSuper(A).bStaticGet;
                                    assert.strictEqual(actual, void 0);
                                    assert.strictEqual(callData, null);
                                }
                                {
                                    let actual = C.getStaticSuper(B).aStaticGet;
                                    assert.strictEqual(actual, void 0);
                                    assert.strictEqual(callData, null);
                                }
                            }
                        );
                        it(
                            'invokes a direct superclass setter',
                            () =>
                            {
                                C.getStaticSuper(A).aStaticSet = 42;
                                assert.deepStrictEqual(callData.A.args, [42]);
                                assert.strictEqual(callData.A.setter, 'aStaticSet');
                                assert.strictEqual(callData.A.this.name, 'C');
                                C.getStaticSuper(B).bStaticSet = 42;
                                assert.deepStrictEqual(callData.B.args, [42]);
                                assert.strictEqual(callData.B.setter, 'bStaticSet');
                                assert.strictEqual(callData.B.this.name, 'C');
                            }
                        );
                        it(
                            'does not invoke a setter in a different superclass',
                            () =>
                            {
                                E.getStaticSuper(C).getStaticSuper(A).bStaticSet = 42;
                                E.getStaticSuper(C).getStaticSuper(B).aStaticSet = 13;
                                assert.strictEqual(callData, null);
                            }
                        );
                    }
                );
                it(
                    'name',
                    () =>
                    {
                        class ぁ1 { }
                        class ぁ2 { }
                        class ぁ3 { }
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
                                    class Bar extends classes(Foo)
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
                        it(
                            'in prototype proxy',
                            () =>
                            {
                                assert.strictEqual(bar.foo, 42);
                            }
                        );
                        it(
                            'in super proxy',
                            () =>
                            {
                                assert.strictEqual(bar.bar(), 42);
                            }
                        );
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
                                Foo =
                                    function ()
                                    { };
                                Foo.prototype = null;
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
                                        assert.strictEqual(bar.bar, void 0);
                                    }
                                );
                                it(
                                    'in',
                                    () =>
                                    {
                                        assert.strictEqual(bar.in(), false);
                                    }
                                );
                                it(
                                    'set',
                                    () =>
                                    {
                                        assert.strictEqual(bar.foo, void 0);
                                    }
                                );
                            }
                        );
                        describe(
                            'in super works with',
                            () =>
                            {
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
                                        assert.strictEqual(bar.bar, void 0);
                                    }
                                );
                                it(
                                    'set',
                                    () =>
                                    {
                                        assert.strictEqual(bar.foo, void 0);
                                    }
                                );
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
                    'returns an empty array if an object has null prototype',
                    () =>
                    {
                        assert.deepStrictEqual(Object.getPrototypeListOf(Object.create(null)), []);
                    }
                );
                it(
                    'returns a one element array if an object has a non-null prototype',
                    () =>
                    {
                        assert.deepStrictEqual(Object.getPrototypeListOf({ }), [Object.prototype]);
                    }
                );
                it(
                    'returns the prototype of a multiple inheritance class',
                    () =>
                    {
                        let actual = Object.getPrototypeListOf(C);
                        assert.deepStrictEqual(actual, [Object.getPrototypeOf(C)]);
                    }
                );
                it(
                    'returns the prototype of a multiple inheritance object',
                    () =>
                    {
                        let actual = Object.getPrototypeListOf(new C());
                        assert.deepStrictEqual(actual, [C.prototype]);
                    }
                );
                it(
                    'returns all prototypes of a clustered constructor',
                    () =>
                    {
                        let actual = Object.getPrototypeListOf(X);
                        assert.deepStrictEqual(actual, [A, B]);
                    }
                );
                it(
                    'returns all prototypes of a clustered prototype',
                    () =>
                    {
                        let actual = Object.getPrototypeListOf(X.prototype);
                        assert.deepStrictEqual(actual, [A.prototype, B.prototype]);
                    }
                );
            }
        );
    }
    
    let TestSuite = { init };
    global.TestSuite = TestSuite;
}
)(typeof self === 'undefined' ? global : self);
