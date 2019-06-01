/* eslint-env mocha */
/* global assert, classes, createNullPrototypeFunction, document, maybeIt */

'use strict';

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
                'Multiple invocations of Object.getPrototypeListOf should not return the same ' +
                'object.',
            );
        }

        it
        (
            'has expected own properties',
            () =>
            {
                assert.hasOwnPropertyDescriptors
                (
                    Object.getPrototypeListOf,
                    {
                        length:
                        {
                            configurable: true,
                            enumerable: false,
                            value: 1,
                            writable: false,
                        },
                        name:
                        {
                            configurable: true,
                            enumerable: false,
                            value: 'getPrototypeListOf',
                            writable: false,
                        },
                    },
                );
                assert.isEmpty(Object.getOwnPropertySymbols(Object.getPrototypeListOf));
            },
        );
        it
        (
            'cannot be called with new',
            () =>
            assert.throws
            (
                () => new Object.getPrototypeListOf(), // eslint-disable-line new-cap
                TypeError,
                /\bis not a constructor\b/,
            ),
        );
        it
        (
            'returns a new empty array if an object has null prototype',
            () => testGetPrototypeListOf(Object.create(null), []),
        );
        it
        (
            'returns a one element array if an object has a non-null prototype',
            () => testGetPrototypeListOf({ }, [Object.prototype]),
        );
        it
        (
            'returns the prototype of a multiple inheritance class',
            () =>
            {
                class A
                { }

                class B
                { }

                class C extends classes(A, B)
                { }

                testGetPrototypeListOf(C, [Object.getPrototypeOf(C)]);
            },
        );
        it
        (
            'returns the prototype of a multiple inheritance instance',
            () =>
            {
                class A
                { }

                class B
                { }

                class C extends classes(A, B)
                { }

                testGetPrototypeListOf(new C(), [C.prototype]);
            },
        );
        it
        (
            'returns all prototypes of a clustered constructor',
            () =>
            {
                const A =
                class
                { };
                const B =
                class
                { };
                const _AB = classes(A, B);
                testGetPrototypeListOf(_AB, [A, B]);
            },
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
            },
        );
        maybeIt
        (
            typeof document !== 'undefined',
            'returns a one element array if an object has document.all for prototype',
            () => testGetPrototypeListOf(Object.create(document.all), [document.all]),
        );
    },
);
