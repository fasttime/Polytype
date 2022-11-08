/* eslint-env mocha */
/* global assert, classes, createFunctionWithGetPrototypeCount */

'use strict';

describe
(
    'Clustered constructor [classes(...?)]',
    () =>
    {
        it
        (
            'has unsettable prototype',
            () => assert.throwsTypeError(() => Object.setPrototypeOf(classes(Function()), { })),
        );

        it
        (
            'has expected own properties',
            () =>
            {
                const constructor = classes(Function());
                const { get } = Object.getOwnPropertyDescriptor(constructor, 'name');
                assert.hasOwnPropertyDescriptors
                (
                    constructor,
                    {
                        class:
                        {
                            configurable:   false,
                            enumerable:     false,
                            value:          constructor.class,
                            writable:       false,
                        },
                        length:
                        {
                            configurable:   true,
                            enumerable:     false,
                            value:          0,
                            writable:       false,
                        },
                        name:
                        {
                            configurable:   true,
                            enumerable:     false,
                            get,
                            set:            undefined,
                        },
                        prototype:
                        {
                            configurable:   false,
                            enumerable:     false,
                            value:          { },
                            writable:       false,
                        },
                    },
                );
            },
        );

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
            },
        );

        it
        (
            'cannot be called without new',
            () =>
            assert.throwsTypeError
            (classes(Function()), 'Constructor cannot be invoked without \'new\''),
        );

        it
        (
            'does not get property \'prototype\' of superclasses when called with new',
            () =>
            {
                const A = createFunctionWithGetPrototypeCount('A');
                const _A = classes(A);
                A.getPrototypeCount = 0;
                void new _A();
                assert.equal(A.getPrototypeCount, 0);
            },
        );

        it
        (
            'invokes superconstructors in order',
            () =>
            {
                const constructors = [];

                class A
                {
                    constructor()
                    {
                        constructors.push(A);
                    }
                }

                class B
                {
                    constructor()
                    {
                        constructors.push(B);
                    }
                }

                class C extends classes(A, B)
                { }

                new C();
                assert.deepEqual(constructors, [A, B]);
            },
        );

        it
        (
            'invokes inherited nonstatic field initializers in order',
            () =>
            {
                const values = [];

                class A
                {
                    a = values.push('A');
                }

                class B
                {
                    b = values.push('B');
                }

                class C extends classes(A, B)
                { }

                new C();

                assert.deepEqual(values, ['A', 'B']);
            },
        );

        it
        (
            'defines own properties on this in order',
            () =>
            {
                function A()
                {
                    this.foo = 'foo';
                    Object.defineProperty(this, 'bar', { value: 'bar' });
                    this.baz = 'A';
                }

                class B
                {
                    baz = 'B';
                    [Symbol.species] = B;
                }

                function C()
                {
                    this[Symbol.species] = C;
                }

                class D extends classes(A, B, C)
                { }

                const d = new D();
                assert.strictEqual(d.foo, 'foo');
                assert.strictEqual(d.bar, 'bar');
                assert.strictEqual(d.baz, 'A');
                assert.strictEqual(d[Symbol.species], B);
                assert.deepEqual(Reflect.ownKeys(d), ['foo', 'bar', 'baz', Symbol.species]);
            },
        );

        describe
        (
            'fails when a non-configurable own property is redefined',
            () =>
            {
                it
                (
                    'as configurable',
                    () =>
                    {
                        const constructors = [];

                        class A
                        {
                            constructor()
                            {
                                Object.defineProperty(this, 'foo', { configurable: false });
                                constructors.push(A);
                            }
                        }

                        class B
                        {
                            constructor()
                            {
                                Object.defineProperty(this, 'foo', { configurable: true });
                                constructors.push(B);
                            }
                        }

                        class C
                        {
                            constructor()
                            {
                                constructors.push(C);
                            }
                        }

                        class D extends classes(A, B, C)
                        { }

                        assert.throwsTypeError
                        (
                            () =>
                            {
                                new D();
                            },
                            [
                                'Cannot redefine property: foo',
                                'can\'t redefine non-configurable property "foo"',
                                'Attempting to change configurable attribute of unconfigurable ' +
                                'property.',
                            ],
                        );
                        assert.deepEqual(constructors, [A, B, C]);
                    },
                );

                it
                (
                    'with a different access machanism',
                    () =>
                    {
                        const constructors = [];

                        class A
                        {
                            constructor()
                            {
                                Object.defineProperty
                                (this, Symbol.split, { value: A, writable: true });
                                constructors.push(A);
                            }
                        }

                        class B
                        {
                            constructor()
                            {
                                Object.defineProperty
                                (this, Symbol.split, { get: Function() });
                                constructors.push(B);
                            }
                        }

                        class C
                        {
                            constructor()
                            {
                                Object.defineProperty
                                (this, Symbol.split, { value: C, writable: true });
                                constructors.push(C);
                            }
                        }

                        class D extends classes(A, B, C)
                        { }

                        assert.throwsTypeError
                        (
                            () =>
                            {
                                new D();
                            },
                            [
                                'Cannot redefine property: Symbol(Symbol.split)',
                                'can\'t redefine non-configurable property Symbol.split',
                                'Attempting to change access mechanism for an unconfigurable ' +
                                'property.',
                            ],
                        );
                        assert.deepEqual(constructors, [A, B, C]);
                    },
                );
            },
        );
    },
);
