/* eslint-env mocha */
/* global BigInt, assert, classes, createFunctionWithGetPrototypeCount, exactRegExp, maybeIt */

'use strict';

describe
(
    'classes',
    () =>
    {
        it
        (
            'has expected own properties',
            () =>
            {
                assert.hasOwnPropertyDescriptors
                (
                    classes,
                    {
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
                            value: 'classes',
                            writable: false,
                        },
                    },
                );
                assert.isEmpty(Object.getOwnPropertySymbols(classes));
            },
        );
        it
        (
            'cannot be called with new',
            () =>
            assert.throws
            (
                () => new classes(), // eslint-disable-line new-cap
                TypeError,
                /\bis not a constructor\b/,
            ),
        );
        it
        (
            'works with a function that is not an instance of Function',
            () =>
            {
                const foo = Function();
                Object.setPrototypeOf(foo, { });
                assert.doesNotThrow(() => classes(foo));
            },
        );
        it
        (
            'gets property \'prototype\' only once',
            () =>
            {
                const Foo = createFunctionWithGetPrototypeCount();
                classes(Foo);
                assert.equal(Foo.getPrototypeCount, 1);
            },
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
                    (() => classes(), TypeError, exactRegExp('No superclasses specified')),
                );
                it
                (
                    'with a null argument',
                    () =>
                    assert.throws
                    (() => classes(null), TypeError, exactRegExp('null is not a constructor')),
                );
                maybeIt
                (
                    typeof BigInt === 'function',
                    'with a bigint argument',
                    () =>
                    assert.throws
                    (() => classes(BigInt(42)), TypeError, exactRegExp('42 is not a constructor')),
                );
                it
                (
                    'with a symbol argument',
                    () =>
                    assert.throws
                    (
                        () => classes(Symbol()),
                        TypeError,
                        exactRegExp('Symbol() is not a constructor'),
                    ),
                );
                it
                (
                    'with a non-callable object argument',
                    () =>
                    assert.throws
                    (
                        () => classes({ }),
                        TypeError,
                        exactRegExp('[object Object] is not a constructor'),
                    ),
                );
                it
                (
                    'with a non-constructor callable argument',
                    () =>
                    {
                        const foo = () => -0;
                        Object.defineProperties
                        (foo, { name: { value: undefined }, prototype: { value: { } } });
                        assert.throws
                        (
                            () => classes(foo),
                            TypeError,
                            exactRegExp('() => -0 is not a constructor'),
                        );
                    },
                );
                it
                (
                    'with a bound function',
                    () => assert.throws
                    (
                        () => classes(Array.bind()),
                        TypeError,
                        exactRegExp
                        ('Property \'prototype\' of bound Array is not an object or null'),
                    ),
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
                            ('Property \'prototype\' of anonymous is not an object or null'),
                        );
                    },
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
                            exactRegExp('Duplicate superclass String'),
                        );
                    },
                );
            },
        );
    },
);
