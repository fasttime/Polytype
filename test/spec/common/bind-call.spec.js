/* eslint-env mocha */
/* global assert classes maybeIt newRealm */

'use strict';

describe
(
    '?.bind(?)',
    () =>
    {
        function getThisAndArguments(...args)
        {
            const thisAndArguments = { this: this, arguments: args };
            return thisAndArguments;
        }

        before(() => classes(Object));

        describe
        (
            'with a regular this value',
            () =>
            {
                it
                (
                    'has expected own properties',
                    () =>
                    {
                        function πολύς(a, b, c, d, e) // eslint-disable-line no-unused-vars
                        { }

                        const bound_πολύς = πολύς.bind(0, 1, 2);
                        assert.hasOwnPropertyDescriptors
                        (
                            bound_πολύς,
                            {
                                length:
                                {
                                    configurable:   true,
                                    enumerable:     false,
                                    value:          3,
                                    writable:       false,
                                },
                                name:
                                {
                                    configurable:   true,
                                    enumerable:     false,
                                    value:          'bound πολύς',
                                    writable:       false,
                                },
                            },
                        );
                    },
                );

                it
                (
                    'has expected prototype',
                    () =>
                    {
                        async function foo()
                        { }

                        const boundFoo = foo.bind();
                        assert.strictEqual
                        (
                            Object.getPrototypeOf(boundFoo),
                            Object.getPrototypeOf(foo),
                        );
                    },
                );

                it
                (
                    'cannot be called with new',
                    () =>
                    {
                        const foo = () => undefined;
                        const boundFoo = foo.bind();
                        // eslint-disable-next-line new-cap
                        assert.throwsTypeError(() => new boundFoo(), /\bis not a constructor\b/);
                    },
                );

                it
                (
                    'works with new',
                    () =>
                    {
                        function Foo(a, b)
                        {
                            this.a = a;
                            this.b = b;
                        }

                        const BoundFoo = Foo.bind(41, 42);
                        const actual = new BoundFoo(43);
                        assert.deepStrictEqual(actual, { a: 42, b: 43 });
                        assert.instanceOf(actual, Foo);
                    },
                );

                it
                (
                    'works without new',
                    () =>
                    {
                        const thisValue = 42;
                        const getBoundThisAndArguments = getThisAndArguments.bind(thisValue, 1);
                        const actual = getBoundThisAndArguments(2, 3);
                        assert.strictEqual(actual.this, thisValue);
                        assert.deepStrictEqual(actual.arguments, [1, 2, 3]);
                    },
                );
            },
        );

        describe
        (
            'with a substitute this value',
            () =>
            {
                it
                (
                    'has expected own properties',
                    () =>
                    {
                        let boundFoo;

                        class A
                        {
                            constructor()
                            {
                                boundFoo = this.foo.bind(this, 'I', 'II', 'III', 'IV');
                            }

                            // eslint-disable-next-line no-unused-vars
                            foo(_1, _2, _3, _4, _5, _6, _7, _8)
                            { }
                        }

                        class B extends classes(A)
                        { }

                        new B();
                        assert.hasOwnPropertyDescriptors
                        (
                            boundFoo,
                            {
                                length:
                                {
                                    configurable:   true,
                                    enumerable:     false,
                                    value:          4,
                                    writable:       false,
                                },
                                name:
                                {
                                    configurable:   true,
                                    enumerable:     false,
                                    value:          'bound foo',
                                    writable:       false,
                                },
                            },
                        );
                    },
                );

                it
                (
                    'has expected prototype',
                    () =>
                    {
                        let boundFoo;

                        class A
                        {
                            constructor()
                            {
                                boundFoo = this.foo.bind(this);
                            }

                            async * foo()
                            { }
                        }

                        class B extends classes(A)
                        { }

                        new B();
                        assert.strictEqual
                        (
                            Object.getPrototypeOf(boundFoo),
                            Object.getPrototypeOf(A.prototype.foo),
                        );
                    },
                );

                it
                (
                    'has consistent string representation',
                    () =>
                    {
                        const fns =
                        [
                            function foo() // eslint-disable-line func-names
                            { },
                            function ()
                            { },
                            async function * bar() // eslint-disable-line func-names
                            { },
                            () => 42,
                            async () => 42, // eslint-disable-line require-await
                            class baz
                            { },
                            class
                            { },
                            Function(),
                            {
                                foo()
                                { },
                            }
                            .foo,
                            class
                            {
                                bar()
                                { }
                            }
                            .prototype.bar,
                            class
                            {
                                static baz()
                                { }
                            }
                            .baz,
                            Object,
                            Function.prototype,
                        ];

                        const boundFnMap = new Map();

                        class A
                        {
                            constructor()
                            {
                                for (const fn of fns)
                                {
                                    const boundFn = fn.bind(this);
                                    boundFnMap.set(fn, boundFn);
                                }
                            }
                        }

                        class B extends classes(A)
                        { }

                        new B();
                        for (const fn of fns)
                        {
                            const actual = Function.prototype.toString.call(boundFnMap.get(fn));
                            const expected = Function.prototype.toString.call(fn.bind(null));
                            const message =
                            `expected '${actual}' to equal '${expected}' in the bound form of ` +
                            `'${fn}'`;
                            assert.strictEqual(actual, expected, message);
                        }
                    },
                );

                it
                (
                    'cannot be called with new',
                    () =>
                    {
                        let boundFoo;

                        class A
                        {
                            constructor()
                            {
                                boundFoo = this.foo.bind(this);
                            }

                            foo()
                            { }
                        }

                        class B extends classes(A)
                        { }

                        new B();
                        // eslint-disable-next-line new-cap
                        assert.throwsTypeError(() => new boundFoo(), /\bis not a constructor\b/);
                    },
                );

                it
                (
                    'works with new',
                    () =>
                    {
                        function Foo(a, b)
                        {
                            this.a = a;
                            this.b = b;
                        }

                        let Bar;

                        class A
                        {
                            constructor()
                            {
                                Bar = Foo.bind(this, 'A');
                            }
                        }

                        class B extends classes(A)
                        { }

                        new B();
                        const actual = new Bar('B');
                        assert.deepStrictEqual(actual, { a: 'A', b: 'B' });
                        assert.instanceOf(actual, Foo);
                    },
                );

                describe
                (
                    'retargets this value',
                    () =>
                    {
                        function test(classes)
                        {
                            let getBoundThisAndArguments;

                            class A
                            {
                                constructor()
                                {
                                    getBoundThisAndArguments =
                                    getThisAndArguments.bind(this, 'foo', 'bar');
                                }
                            }

                            class B extends classes(A)
                            { }

                            const thisValue = new B();
                            const actual = getBoundThisAndArguments();
                            assert.strictEqual(actual.this, thisValue);
                            assert.deepStrictEqual(actual.arguments, ['foo', 'bar']);
                        }

                        it('in the same realm', () => test(classes));

                        maybeIt
                        (
                            newRealm,
                            'in another realm',
                            async () =>
                            {
                                const { classes: classesʼ } = await newRealm(true);
                                test(classesʼ);
                            },
                        );
                    },
                );

                it
                (
                    'does not retarget this value while a superconstructor is running',
                    () =>
                    {
                        let actual;
                        let thisValue;
                        let getBoundThisAndArguments;

                        class A
                        {
                            constructor()
                            {
                                thisValue = this;
                                getBoundThisAndArguments = getThisAndArguments.bind(this, 42);
                            }
                        }

                        class B
                        {
                            constructor()
                            {
                                actual = getBoundThisAndArguments();
                            }
                        }

                        class C extends classes(A, B)
                        { }

                        new C();
                        assert.strictEqual(actual.this, thisValue);
                        assert.deepStrictEqual(actual.arguments, [42]);
                    },
                );

                it
                (
                    'does not retarget this value if a superconstructor throws',
                    () =>
                    {
                        let thisValue;
                        let getBoundThisAndArguments;

                        class A
                        {
                            constructor()
                            {
                                thisValue = this;
                                getBoundThisAndArguments = getThisAndArguments.bind(this);
                            }
                        }

                        class B
                        {
                            constructor()
                            {
                                throw Error();
                            }
                        }

                        class C extends classes(A, B)
                        { }

                        try
                        {
                            new C();
                        }
                        catch
                        { }
                        const actual = getBoundThisAndArguments();
                        assert.strictEqual(actual.this, thisValue);
                        assert.deepStrictEqual(actual.arguments, []);
                    },
                );
            },
        );
    },
);
