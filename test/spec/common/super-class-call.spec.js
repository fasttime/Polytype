/* eslint-env mocha */
/* global assert classes */

'use strict';

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
                    'is not extensible',
                    () =>
                    {
                        class A extends classes(Object)
                        {
                            getSuper()
                            {
                                const returnValue = super.class(Object);
                                return returnValue;
                            }
                        }

                        const superObj = new A().getSuper();
                        assert.isNotExtensible(superObj);
                    },
                );

                describe
                (
                    'invokes a superclass method',
                    () =>
                    {
                        let A;
                        let C;
                        let C2;
                        let D;
                        let d;

                        before
                        (
                            () =>
                            {
                                A =
                                class
                                {
                                    someMethod(...args)
                                    {
                                        const returnValue = { this: this, args, name: 'A' };
                                        return returnValue;
                                    }
                                };

                                class B
                                {
                                    someMethod(...args)
                                    {
                                        const returnValue = { this: this, args, name: 'B' };
                                        return returnValue;
                                    }
                                }

                                Object.setPrototypeOf(B.prototype.someMethod, null);

                                C =
                                class extends classes(B)
                                { };

                                C2 = Function();
                                C2.prototype = C.prototype;

                                D =
                                class extends classes(A, C)
                                {
                                    callSomeMethodInSuperClass(superType, ...args)
                                    {
                                        const returnValue =
                                        super.class(superType).someMethod(...args);
                                        return returnValue;
                                    }

                                    getSomeMethodInSuperClass(superType)
                                    {
                                        const { someMethod } = super.class(superType);
                                        return someMethod;
                                    }
                                };

                                d = new D();
                            },
                        );

                        it
                        (
                            'from direct superclass',
                            () =>
                            {
                                const { this: that, args, name } =
                                d.callSomeMethodInSuperClass(A, 1, 2);
                                assert.strictEqual(that, d);
                                assert.deepEqual(args, [1, 2]);
                                assert.strictEqual(name, 'A');
                            },
                        );

                        it
                        (
                            'from direct superclass as a bound function',
                            () =>
                            {
                                const someBoundMethod =
                                new D().getSomeMethodInSuperClass(A).bind(d);
                                const { this: that, args, name } = someBoundMethod(1, 2, 3);
                                assert.strictEqual(that, d);
                                assert.deepEqual(args, [1, 2, 3]);
                                assert.strictEqual(name, 'A');
                            },
                        );

                        it
                        (
                            'from direct superclass as an unbound function',
                            () =>
                            {
                                const someUnboundMethod = new D().getSomeMethodInSuperClass(A);
                                someUnboundMethod.foo = 'bar';
                                assert.strictEqual(A.prototype.someMethod.foo, 'bar');
                                delete someUnboundMethod.foo;
                                assert.notProperty(A.prototype.someMethod, 'foo');
                                const { this: that, args, name } = someUnboundMethod(1, 2, 3, 4);
                                assert.isUndefined(that);
                                assert.deepEqual(args, [1, 2, 3, 4]);
                                assert.strictEqual(name, 'A');
                            },
                        );

                        it
                        (
                            'with null prototype from indirect superclass',
                            () =>
                            {
                                const { this: that, args, name } =
                                d.callSomeMethodInSuperClass(C, 3, 4);
                                assert.strictEqual(that, d);
                                assert.deepEqual(args, [3, 4]);
                                assert.strictEqual(name, 'B');
                            },
                        );

                        it
                        (
                            'unconventionally inherited',
                            () =>
                            {
                                const { this: that, args, name } =
                                d.callSomeMethodInSuperClass(C2, 5, 6);
                                assert.strictEqual(that, d);
                                assert.deepEqual(args, [5, 6]);
                                assert.strictEqual(name, 'B');
                            },
                        );
                    },
                );

                it
                (
                    'does not invoke a method in a different superclass',
                    () =>
                    {
                        class A
                        {
                            someMethod()
                            { }
                        }

                        class B
                        { }

                        class C extends classes(A, B)
                        {
                            callSomeMethodInSuperClass(superType, ...args)
                            {
                                const returnValue = super.class(superType).someMethod(...args);
                                return returnValue;
                            }
                        }

                        const c = new C();
                        assert.throwsTypeError(() => c.callSomeMethodInSuperClass(B));
                    },
                );

                describe
                (
                    'invokes a superclass getter',
                    () =>
                    {
                        let A;
                        let C;
                        let C2;
                        let d;

                        before
                        (
                            () =>
                            {
                                A =
                                class
                                {
                                    get someProperty()
                                    {
                                        // eslint-disable-next-line prefer-rest-params
                                        const value = { this: this, arguments, name: 'A' };
                                        return value;
                                    }
                                };

                                class B
                                {
                                    get someProperty()
                                    {
                                        // eslint-disable-next-line prefer-rest-params
                                        const value = { this: this, arguments, name: 'B' };
                                        return value;
                                    }
                                }

                                C =
                                class extends classes(B)
                                { };

                                C2 = Function();
                                C2.prototype = C.prototype;

                                class D extends classes(A, C)
                                {
                                    getSomePropertyInSuperClass(superType)
                                    {
                                        const value = super.class(superType).someProperty;
                                        return value;
                                    }
                                }

                                d = new D();
                                Object.defineProperty(d, 'someProperty', { });
                            },
                        );

                        it
                        (
                            'from direct superclass',
                            () =>
                            {
                                const { arguments: args, this: that, name } =
                                d.getSomePropertyInSuperClass(A);
                                assert.strictEqual(that, d);
                                assert.isEmpty(args);
                                assert.strictEqual(name, 'A');
                            },
                        );

                        it
                        (
                            'from indirect superclass',
                            () =>
                            {
                                const { arguments: args, this: that, name } =
                                d.getSomePropertyInSuperClass(C);
                                assert.strictEqual(that, d);
                                assert.isEmpty(args);
                                assert.strictEqual(name, 'B');
                            },
                        );

                        it
                        (
                            'unconventionally inherited',
                            () =>
                            {
                                const { arguments: args, this: that, name } =
                                d.getSomePropertyInSuperClass(C2);
                                assert.strictEqual(that, d);
                                assert.isEmpty(args);
                                assert.strictEqual(name, 'B');
                            },
                        );
                    },
                );

                it
                (
                    'does not invoke a getter in a different superclass',
                    () =>
                    {
                        class A
                        {
                            get someProperty()
                            {
                                return 'foo';
                            }
                        }

                        class B
                        { }

                        class C extends classes(A, B)
                        {
                            getSomePropertyInSuperClass(superType)
                            {
                                const value = super.class(superType).someProperty;
                                return value;
                            }
                        }

                        const c = new C();
                        assert.isUndefined(c.getSomePropertyInSuperClass(B));
                    },
                );

                describe
                (
                    'invokes a superclass setter',
                    () =>
                    {
                        let A;
                        let C;
                        let C2;
                        let d;
                        let callData = null;

                        before
                        (
                            () =>
                            {
                                A =
                                class
                                {
                                    set someProperty(value) // eslint-disable-line accessor-pairs
                                    {
                                        Object.assign
                                        // eslint-disable-next-line prefer-rest-params
                                        (callData, { this: this, arguments, name: 'A' });
                                    }
                                };

                                class B
                                {
                                    set someProperty(value) // eslint-disable-line accessor-pairs
                                    {
                                        Object.assign
                                        // eslint-disable-next-line prefer-rest-params
                                        (callData, { this: this, arguments, name: 'B' });
                                    }
                                }

                                C =
                                class extends classes(B)
                                { };

                                C2 = Function();
                                C2.prototype = C.prototype;

                                class D extends classes(A, C)
                                {
                                    setSomePropertyInSuperClass(superType, value)
                                    {
                                        const returnValue = callData = { };
                                        super.class(superType).someProperty = value;
                                        callData = null;
                                        return returnValue;
                                    }
                                }

                                d = new D();
                            },
                        );

                        it
                        (
                            'from direct superclass',
                            () =>
                            {
                                const { arguments: args, this: that, name } =
                                d.setSomePropertyInSuperClass(A, 'foo');
                                assert.strictEqual(that, d);
                                assert.deepEqual([...args], ['foo']);
                                assert.strictEqual(name, 'A');
                            },
                        );

                        it
                        (
                            'from indirect superclass',
                            () =>
                            {
                                const { arguments: args, this: that, name } =
                                d.setSomePropertyInSuperClass(C, 'bar');
                                assert.strictEqual(that, d);
                                assert.deepEqual([...args], ['bar']);
                                assert.strictEqual(name, 'B');
                            },
                        );

                        it
                        (
                            'unconventionally inherited',
                            () =>
                            {
                                const { arguments: args, this: that, name } =
                                d.setSomePropertyInSuperClass(C2, 'baz');
                                assert.strictEqual(that, d);
                                assert.deepEqual([...args], ['baz']);
                                assert.strictEqual(name, 'B');
                            },
                        );
                    },
                );

                it
                (
                    'does not invoke a setter in a different superclass',
                    () =>
                    {
                        class A
                        {
                            set someProperty(value) // eslint-disable-line accessor-pairs
                            { }
                        }

                        class B
                        { }

                        class C extends classes(A, B)
                        {
                            setSomePropertyInSuperClass(superType, value)
                            {
                                super.class(superType).someProperty = value;
                            }
                        }

                        const c = new C();
                        c.setSomePropertyInSuperClass(B, 42);
                        assert.ownProperty(c, 'someProperty');
                    },
                );

                it
                (
                    'invokes a superclass getter/setter pair',
                    () =>
                    {
                        class A
                        {
                            get someProperty()
                            {
                                return this.foo;
                            }

                            set someProperty(value)
                            {
                                this.foo = value;
                            }
                        }

                        class B extends classes(A)
                        {
                            get someProperty()
                            {
                                return this.bar;
                            }

                            set someProperty(value)
                            {
                                this.bar = value;
                            }

                            increaseSomePropertyInSuperClass(superType)
                            {
                                super.class(superType).someProperty++;
                            }
                        }

                        const b = new B();
                        b.foo = 10;
                        b.bar = 20;
                        b.increaseSomePropertyInSuperClass(A);

                        assert.strictEqual(b.foo, 11);
                    },
                );
            },
        );

        describe
        (
            'in static context',
            () =>
            {
                it
                (
                    'is not extensible',
                    () =>
                    {
                        class A extends classes(Object)
                        {
                            static getSuper()
                            {
                                const returnValue = super.class(Object);
                                return returnValue;
                            }
                        }

                        const superObj = A.getSuper();
                        assert.isNotExtensible(superObj);
                    },
                );

                describe
                (
                    'invokes a superclass method',
                    () =>
                    {
                        let A;
                        let C;
                        let D;

                        before
                        (
                            () =>
                            {
                                A =
                                class
                                {
                                    static someMethod(...args)
                                    {
                                        const returnValue = { this: this, args, name: 'A' };
                                        return returnValue;
                                    }
                                };

                                class B
                                {
                                    static someMethod(...args)
                                    {
                                        const returnValue = { this: this, args, name: 'B' };
                                        return returnValue;
                                    }
                                }

                                Object.setPrototypeOf(B.someMethod, null);

                                C =
                                class extends classes(B)
                                { };

                                D =
                                class extends classes(A, C)
                                {
                                    static callSomeMethodInSuperClass(superType, ...args)
                                    {
                                        const returnValue =
                                        super.class(superType).someMethod(...args);
                                        return returnValue;
                                    }

                                    static getSomeMethodInSuperClass(superType)
                                    {
                                        const { someMethod } = super.class(superType);
                                        return someMethod;
                                    }
                                };
                            },
                        );

                        it
                        (
                            'from direct superclass',
                            () =>
                            {
                                const { this: that, args, name } =
                                D.callSomeMethodInSuperClass(A, 1, 2);
                                assert.strictEqual(that, D);
                                assert.deepEqual(args, [1, 2]);
                                assert.strictEqual(name, 'A');
                            },
                        );

                        it
                        (
                            'from direct superclass as a bound function',
                            () =>
                            {
                                const someBoundMethod =
                                { __proto__: D }.getSomeMethodInSuperClass(A).bind(D);
                                const { this: that, args, name } = someBoundMethod(1, 2, 3);
                                assert.strictEqual(that, D);
                                assert.deepEqual(args, [1, 2, 3]);
                                assert.strictEqual(name, 'A');
                            },
                        );

                        it
                        (
                            'from direct superclass as an unbound function',
                            () =>
                            {
                                const someUnboundMethod =
                                { __proto__: D }.getSomeMethodInSuperClass(A);
                                someUnboundMethod.foo = 'bar';
                                assert.strictEqual(A.someMethod.foo, 'bar');
                                delete someUnboundMethod.foo;
                                assert.notProperty(A.someMethod, 'foo');
                                const { this: that, args, name } = someUnboundMethod(1, 2, 3, 4);
                                assert.isUndefined(that);
                                assert.deepEqual(args, [1, 2, 3, 4]);
                                assert.strictEqual(name, 'A');
                            },
                        );

                        it
                        (
                            'with null prototype from indirect superclass',
                            () =>
                            {
                                const { this: that, args, name } =
                                D.callSomeMethodInSuperClass(C, 3, 4);
                                assert.strictEqual(that, D);
                                assert.deepEqual(args, [3, 4]);
                                assert.strictEqual(name, 'B');
                            },
                        );
                    },
                );

                it
                (
                    'does not invoke a method in a different superclass',
                    () =>
                    {
                        class A
                        {
                            static someMethod()
                            { }
                        }

                        class B
                        { }

                        class C extends classes(A, B)
                        {
                            static callSomeMethodInSuperClass(superType, ...args)
                            {
                                const returnValue = super.class(superType).someMethod(...args);
                                return returnValue;
                            }
                        }

                        assert.throwsTypeError(() => C.callSomeMethodInSuperClass(B));
                    },
                );

                describe
                (
                    'invokes a superclass getter',
                    () =>
                    {
                        let A;
                        let C;
                        let D;

                        before
                        (
                            () =>
                            {
                                A =
                                class
                                {
                                    static get someProperty()
                                    {
                                        // eslint-disable-next-line prefer-rest-params
                                        const value = { this: this, arguments, name: 'A' };
                                        return value;
                                    }
                                };

                                class B
                                {
                                    static get someProperty()
                                    {
                                        // eslint-disable-next-line prefer-rest-params
                                        const value = { this: this, arguments, name: 'B' };
                                        return value;
                                    }
                                }

                                C =
                                class extends classes(B)
                                { };

                                D =
                                class extends classes(A, C)
                                {
                                    static getSomePropertyInSuperClass(superType)
                                    {
                                        const value = super.class(superType).someProperty;
                                        return value;
                                    }
                                };
                                Object.defineProperty(D, 'someProperty', { });
                            },
                        );

                        it
                        (
                            'from direct superclass',
                            () =>
                            {
                                const { this: that, arguments: args, name } =
                                D.getSomePropertyInSuperClass(A);
                                assert.strictEqual(that, D);
                                assert.isEmpty(args);
                                assert.strictEqual(name, 'A');
                            },
                        );

                        it
                        (
                            'from indirect superclass',
                            () =>
                            {
                                const { this: that, arguments: args, name } =
                                D.getSomePropertyInSuperClass(C);
                                assert.strictEqual(that, D);
                                assert.isEmpty(args);
                                assert.strictEqual(name, 'B');
                            },
                        );
                    },
                );

                it
                (
                    'does not invoke a getter in a different superclass',
                    () =>
                    {
                        class A
                        {
                            static get someProperty()
                            {
                                return 'foo';
                            }
                        }

                        class B
                        { }

                        class C extends classes(A, B)
                        {
                            static getSomePropertyInSuperClass(superType)
                            {
                                const value = super.class(superType).someProperty;
                                return value;
                            }
                        }

                        assert.isUndefined(C.getSomePropertyInSuperClass(B));
                    },
                );

                describe
                (
                    'invokes a superclass setter',
                    () =>
                    {
                        let A;
                        let C;
                        let D;
                        let callData = null;

                        before
                        (
                            () =>
                            {
                                A =
                                class
                                {
                                    // eslint-disable-next-line accessor-pairs
                                    static set someProperty(value)
                                    {
                                        Object.assign
                                        // eslint-disable-next-line prefer-rest-params
                                        (callData, { this: this, arguments, name: 'A' });
                                    }
                                };

                                class B
                                {
                                    // eslint-disable-next-line accessor-pairs
                                    static set someProperty(value)
                                    {
                                        Object.assign
                                        // eslint-disable-next-line prefer-rest-params
                                        (callData, { this: this, arguments, name: 'B' });
                                    }
                                }

                                C =
                                class extends classes(B)
                                { };

                                D =
                                class extends classes(A, C)
                                {
                                    static setSomePropertyInSuperClass(superType, value)
                                    {
                                        const returnValue = callData = { };
                                        super.class(superType).someProperty = value;
                                        callData = null;
                                        return returnValue;
                                    }
                                };
                            },
                        );

                        it
                        (
                            'from direct superclass',
                            () =>
                            {
                                const { arguments: args, this: that, name } =
                                D.setSomePropertyInSuperClass(A, 'foo');
                                assert.strictEqual(that, D);
                                assert.deepEqual([...args], ['foo']);
                                assert.strictEqual(name, 'A');
                            },
                        );

                        it
                        (
                            'from indirect superclass',
                            () =>
                            {
                                const { arguments: args, this: that, name } =
                                D.setSomePropertyInSuperClass(C, 'bar');
                                assert.strictEqual(that, D);
                                assert.deepEqual([...args], ['bar']);
                                assert.strictEqual(name, 'B');
                            },
                        );
                    },
                );

                it
                (
                    'does not invoke a setter in a different superclass',
                    () =>
                    {
                        class A
                        {
                            static set someProperty(value) // eslint-disable-line accessor-pairs
                            { }
                        }

                        class B
                        { }

                        class C extends classes(A, B)
                        {
                            static setSomePropertyInSuperClass(superType, value)
                            {
                                super.class(superType).someProperty = value;
                            }
                        }

                        C.setSomePropertyInSuperClass(B, 42);
                        assert.ownProperty(C, 'someProperty');
                    },
                );

                it
                (
                    'invokes a superclass getter/setter pair',
                    () =>
                    {
                        class A
                        {
                            static get someProperty()
                            {
                                return this.foo;
                            }

                            static set someProperty(value)
                            {
                                this.foo = value;
                            }
                        }

                        class B extends classes(A)
                        {
                            static get someProperty()
                            {
                                return this.bar;
                            }

                            static set someProperty(value)
                            {
                                this.bar = value;
                            }

                            static increaseSomePropertyInSuperClass(superType)
                            {
                                super.class(superType).someProperty++;
                            }
                        }

                        B.foo = 10;
                        B.bar = 20;
                        B.increaseSomePropertyInSuperClass(A);

                        assert.strictEqual(B.foo, 11);
                    },
                );
            },
        );
    },
);
