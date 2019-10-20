/* eslint-env mocha */
/* global assert, classes, createFunctionWithGetPrototypeCount, exactRegExp */

'use strict';

describe
(
    'Clustered constructor [classes(...?)]',
    () =>
    {
        it
        (
            'has unsettable prototype',
            () => assert.throws(() => Object.setPrototypeOf(classes(Function()), { }), TypeError),
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
                            configurable: false,
                            enumerable: false,
                            value: constructor.class,
                            writable: false,
                        },
                        length:
                        {
                            configurable: true,
                            enumerable: false,
                            value: 0,
                            writable: false,
                        },
                        name:
                        {
                            configurable: true,
                            enumerable: false,
                            get,
                            set: undefined,
                        },
                        prototype:
                        {
                            configurable: false,
                            enumerable: false,
                            value: { },
                            writable: false,
                        },
                    },
                );
                assert.isEmpty(Object.getOwnPropertySymbols(constructor));
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
            assert.throws
            (
                classes(Function()),
                TypeError,
                exactRegExp('Constructor cannot be invoked without \'new\''),
            ),
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
    },
);
