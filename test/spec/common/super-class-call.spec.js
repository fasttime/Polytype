/* eslint-env mocha */
/* global assert, classes */

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
                    'invokes a superclass method',
                    () =>
                    {
                        class A
                        {
                            someMethod(...args)
                            {
                                const returnValue = { this: this, args, name: 'A' };
                                return returnValue;
                            }
                        }

                        class B
                        {
                            someMethod(...args)
                            {
                                const returnValue = { this: this, args, name: 'B' };
                                return returnValue;
                            }
                        }

                        Object.setPrototypeOf(B.prototype.someMethod, null);

                        class C extends classes(B)
                        { }

                        const C2 = Function();
                        C2.prototype = C.prototype;

                        class D extends classes(A, C)
                        {
                            callSomeMethodInSuperClass(superType, ...args)
                            {
                                const returnValue = super.class(superType).someMethod(...args);
                                return returnValue;
                            }
                        }

                        const d = new D();
                        {
                            const { this: that, args, name } =
                            d.callSomeMethodInSuperClass(A, 1, 2);
                            assert.strictEqual(that, d);
                            assert.deepEqual(args, [1, 2]);
                            assert.strictEqual(name, 'A');
                        }
                        {
                            const { this: that, args, name } =
                            d.callSomeMethodInSuperClass(C, 3, 4);
                            assert.strictEqual(that, d);
                            assert.deepEqual(args, [3, 4]);
                            assert.strictEqual(name, 'B');
                        }
                        {
                            const { this: that, args, name } =
                            d.callSomeMethodInSuperClass(C2, 5, 6);
                            assert.strictEqual(that, d);
                            assert.deepEqual(args, [5, 6]);
                            assert.strictEqual(name, 'B');
                        }
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

                it
                (
                    'invokes a superclass getter',
                    () =>
                    {
                        class A
                        {
                            get someProperty()
                            {
                                // eslint-disable-next-line prefer-rest-params
                                const value = { this: this, arguments, name: 'A' };
                                return value;
                            }
                        }

                        class B
                        {
                            get someProperty()
                            {
                                // eslint-disable-next-line prefer-rest-params
                                const value = { this: this, arguments, name: 'B' };
                                return value;
                            }
                        }

                        class C extends classes(B)
                        { }

                        class D extends classes(A, C)
                        {
                            getSomePropertyInSuperClass(superType)
                            {
                                const value = super.class(superType).someProperty;
                                return value;
                            }
                        }

                        const d = new D();
                        {
                            const { arguments: args, this: that, name } =
                            d.getSomePropertyInSuperClass(A);
                            assert.strictEqual(that, d);
                            assert.isEmpty(args);
                            assert.strictEqual(name, 'A');
                        }
                        {
                            const { arguments: args, this: that, name } =
                            d.getSomePropertyInSuperClass(C);
                            assert.strictEqual(that, d);
                            assert.isEmpty(args);
                            assert.strictEqual(name, 'B');
                        }
                        const C2 = Function();
                        C2.prototype = C.prototype;
                        {
                            const { arguments: args, this: that, name } =
                            d.getSomePropertyInSuperClass(C2);
                            assert.strictEqual(that, d);
                            assert.isEmpty(args);
                            assert.strictEqual(name, 'B');
                        }
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

                it
                (
                    'invokes a superclass setter',
                    () =>
                    {
                        let callData = null;

                        class A
                        {
                            set someProperty(value) // eslint-disable-line accessor-pairs
                            {
                                // eslint-disable-next-line prefer-rest-params
                                Object.assign(callData, { this: this, arguments, name: 'A' });
                            }
                        }

                        class B
                        {
                            set someProperty(value) // eslint-disable-line accessor-pairs
                            {
                                // eslint-disable-next-line prefer-rest-params
                                Object.assign(callData, { this: this, arguments, name: 'B' });
                            }
                        }

                        class C extends classes(B)
                        { }

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

                        const d = new D();
                        {
                            const { arguments: args, this: that, name } =
                            d.setSomePropertyInSuperClass(A, 'foo');
                            assert.strictEqual(that, d);
                            assert.deepEqual([...args], ['foo']);
                            assert.strictEqual(name, 'A');
                        }
                        {
                            const { arguments: args, this: that, name } =
                            d.setSomePropertyInSuperClass(C, 'bar');
                            assert.strictEqual(that, d);
                            assert.deepEqual([...args], ['bar']);
                            assert.strictEqual(name, 'B');
                        }
                        const C2 = Function();
                        C2.prototype = C.prototype;
                        {
                            const { arguments: args, this: that, name } =
                            d.setSomePropertyInSuperClass(C2, 'baz');
                            assert.strictEqual(that, d);
                            assert.deepEqual([...args], ['baz']);
                            assert.strictEqual(name, 'B');
                        }
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
            },
        );

        describe
        (
            'in static context',
            () =>
            {
                it
                (
                    'invokes a superclass method',
                    () =>
                    {
                        class A
                        {
                            static someMethod(...args)
                            {
                                const returnValue = { this: this, args, name: 'A' };
                                return returnValue;
                            }
                        }

                        class B
                        {
                            static someMethod(...args)
                            {
                                const returnValue = { this: this, args, name: 'B' };
                                return returnValue;
                            }
                        }

                        Object.setPrototypeOf(B.someMethod, null);

                        class C extends classes(B)
                        { }

                        class D extends classes(A, C)
                        {
                            static callSomeMethodInSuperClass(superType, ...args)
                            {
                                const returnValue = super.class(superType).someMethod(...args);
                                return returnValue;
                            }
                        }

                        {
                            const { this: that, args, name } =
                            D.callSomeMethodInSuperClass(A, 1, 2);
                            assert.strictEqual(that, D);
                            assert.deepEqual(args, [1, 2]);
                            assert.strictEqual(name, 'A');
                        }
                        {
                            const { this: that, args, name } =
                            D.callSomeMethodInSuperClass(C, 3, 4);
                            assert.strictEqual(that, D);
                            assert.deepEqual(args, [3, 4]);
                            assert.strictEqual(name, 'B');
                        }
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

                it
                (
                    'invokes a superclass getter',
                    () =>
                    {
                        class A
                        {
                            static get someProperty()
                            {
                                // eslint-disable-next-line prefer-rest-params
                                const value = { this: this, arguments, name: 'A' };
                                return value;
                            }
                        }

                        class B
                        {
                            static get someProperty()
                            {
                                // eslint-disable-next-line prefer-rest-params
                                const value = { this: this, arguments, name: 'B' };
                                return value;
                            }
                        }

                        class C extends classes(B)
                        { }

                        class D extends classes(A, C)
                        {
                            static getSomePropertyInSuperClass(superType)
                            {
                                const value = super.class(superType).someProperty;
                                return value;
                            }
                        }

                        {
                            const { this: that, arguments: args, name } =
                            D.getSomePropertyInSuperClass(A);
                            assert.strictEqual(that, D);
                            assert.isEmpty(args);
                            assert.strictEqual(name, 'A');
                        }
                        {
                            const { this: that, arguments: args, name } =
                            D.getSomePropertyInSuperClass(C);
                            assert.strictEqual(that, D);
                            assert.isEmpty(args);
                            assert.strictEqual(name, 'B');
                        }
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

                it
                (
                    'invokes a superclass setter',
                    () =>
                    {
                        let callData = null;

                        class A
                        {
                            static set someProperty(value) // eslint-disable-line accessor-pairs
                            {
                                // eslint-disable-next-line prefer-rest-params
                                Object.assign(callData, { this: this, arguments, name: 'A' });
                            }
                        }

                        class B
                        {
                            static set someProperty(value) // eslint-disable-line accessor-pairs
                            {
                                // eslint-disable-next-line prefer-rest-params
                                Object.assign(callData, { this: this, arguments, name: 'B' });
                            }
                        }

                        class C extends classes(B)
                        { }

                        class D extends classes(A, C)
                        {
                            static setSomePropertyInSuperClass(superType, value)
                            {
                                const returnValue = callData = { };
                                super.class(superType).someProperty = value;
                                callData = null;
                                return returnValue;
                            }
                        }

                        {
                            const { arguments: args, this: that, name } =
                            D.setSomePropertyInSuperClass(A, 'foo');
                            assert.strictEqual(that, D);
                            assert.deepEqual([...args], ['foo']);
                            assert.strictEqual(name, 'A');
                        }
                        {
                            const { arguments: args, this: that, name } =
                            D.setSomePropertyInSuperClass(C, 'bar');
                            assert.strictEqual(that, D);
                            assert.deepEqual([...args], ['bar']);
                            assert.strictEqual(name, 'B');
                        }
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
            },
        );
    },
);
