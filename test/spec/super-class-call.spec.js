/* eslint-env mocha */
/* global assert, classes, setupTestData */

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
                    'invokes a direct superclass method',
                    () =>
                    {
                        const { A, B, C } = setupTestData(classes);
                        const c = new C();
                        c.aProp = 'A';
                        c.bProp = 'B';
                        assert.strictEqual(c.getSuper(A).someMethod(), 'A');
                        const Bʼ = Function();
                        Bʼ.prototype = B.prototype;
                        assert.strictEqual(c.getSuper(Bʼ).someMethod(), 'B');
                    },
                );
                it
                (
                    'invokes an indirect superclass method',
                    () =>
                    {
                        const { A, B, C, E } = setupTestData(classes);
                        const e = new E();
                        e.aProp = 'A';
                        e.bProp = 'B';
                        assert.strictEqual(e.getSuper(C).getSuper(A).someMethod(), 'A');
                        assert.strictEqual(e.getSuper(C).getSuper(B).someMethod(), 'B');
                    },
                );
                it
                (
                    'invokes a direct superclass getter',
                    () =>
                    {
                        const { A, B, C, callData } = setupTestData(classes);
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
                    },
                );
                it
                (
                    'invokes an indirect superclass getter',
                    () =>
                    {
                        const { A, B, C, E, callData } = setupTestData(classes);
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
                    },
                );
                it
                (
                    'does not invoke a getter in a different superclass',
                    () =>
                    {
                        const { A, B, C, callData } = setupTestData(classes);
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
                    },
                );
                it
                (
                    'invokes a direct superclass setter',
                    () =>
                    {
                        const { A, B, C, callData } = setupTestData(classes);
                        const c = new C();

                        c.getSuper(A).aSetOnly = 42;
                        assert.deepEqual(callData.A.args, [42]);
                        assert.strictEqual(callData.A.setter, 'aSetOnly');
                        assert.strictEqual(callData.A.this, c);

                        c.getSuper(B).bSetOnly = 'foo';
                        assert.deepEqual(callData.B.args, ['foo']);
                        assert.strictEqual(callData.B.setter, 'bSetOnly');
                        assert.strictEqual(callData.B.this, c);
                    },
                );
                it
                (
                    'invokes an indirect superclass setter',
                    () =>
                    {
                        const { A, B, C, E, callData } = setupTestData(classes);
                        const e = new E();

                        e.getSuper(C).getSuper(A).aSetOnly = 42;
                        assert.deepEqual(callData.A.args, [42]);
                        assert.strictEqual(callData.A.setter, 'aSetOnly');
                        assert(e.isPrototypeOf(callData.A.this));

                        e.getSuper(C).getSuper(B).bSetOnly = 'foo';
                        assert.deepEqual(callData.B.args, ['foo']);
                        assert.strictEqual(callData.B.setter, 'bSetOnly');
                        assert(e.isPrototypeOf(callData.B.this));
                    },
                );
                it
                (
                    'does not invoke a setter in a different superclass',
                    () =>
                    {
                        const { A, B, C, callData } = setupTestData(classes);
                        const c = new C();
                        delete callData.A;
                        delete callData.B;
                        c.getSuper(A).bSetOnly = 42;
                        c.getSuper(B).aSetOnly = 13;
                        assert.ownProperty(c, 'aSetOnly');
                        assert.ownProperty(c, 'bSetOnly');
                        assert.isEmpty(callData);
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
                    'invokes a direct superclass method',
                    () =>
                    {
                        const { A, B, C } = setupTestData(classes);
                        A.aProp = Symbol();
                        B.bProp = Symbol();
                        assert.strictEqual(C.getStaticSuper(A).someStaticMethod(), A.aProp);
                        assert.strictEqual(C.getStaticSuper(B).someStaticMethod(), B.bProp);
                    },
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
                    },
                );
                it
                (
                    'does not invoke a getter in a different superclass',
                    () =>
                    {
                        const { A, B, C, callData } = setupTestData(classes);
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
                    },
                );
                it
                (
                    'invokes a direct superclass setter',
                    () =>
                    {
                        const { A, B, C, callData } = setupTestData(classes);
                        C.getStaticSuper(A).aStaticSet = 42;
                        assert.deepEqual(callData.A.args, [42]);
                        assert.strictEqual(callData.A.setter, 'aStaticSet');
                        assert.strictEqual(callData.A.this.name, 'C');
                        C.getStaticSuper(B).bStaticSet = 42;
                        assert.deepEqual(callData.B.args, [42]);
                        assert.strictEqual(callData.B.setter, 'bStaticSet');
                        assert.strictEqual(callData.B.this.name, 'C');
                    },
                );
                it
                (
                    'does not invoke a setter in a different superclass',
                    () =>
                    {
                        const { A, B, C, E, callData } = setupTestData(classes);
                        E.getStaticSuper(C).getStaticSuper(A).bStaticSet = 42;
                        E.getStaticSuper(C).getStaticSuper(B).aStaticSet = 13;
                        assert.isEmpty(callData);
                    },
                );
            },
        );
    },
);
