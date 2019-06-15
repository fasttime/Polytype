/* eslint-env mocha */
/* global BigInt, assert, classes, document, maybeIt */

'use strict';

describe
(
    'Object.prototype.isPrototypeOf',
    () =>
    {
        function test(argDescription, thisValue, arg, expectedResult)
        {
            let description;
            let fn;
            if (typeof expectedResult === 'boolean')
            {
                description = `returns ${expectedResult} ${argDescription}`;
                fn =
                () =>
                {
                    assert.strictEqual
                    (Object.prototype.isPrototypeOf.call(thisValue, arg), expectedResult);
                };
            }
            else
            {
                description = `throws ${expectedResult.name} ${argDescription}`;
                fn =
                () =>
                {
                    assert.throws
                    (Object.prototype.isPrototypeOf.bind(thisValue, arg), expectedResult);
                };
            }
            it(description, fn);
        }

        it
        (
            'has expected own properties',
            () =>
            {
                assert.hasOwnPropertyDescriptors
                (
                    Object.prototype.isPrototypeOf,
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
                            value: 'isPrototypeOf',
                            writable: false,
                        },
                    },
                );
                assert.isEmpty(Object.getOwnPropertySymbols(Object.prototype.isPrototypeOf));
            },
        );
        it
        (
            'cannot be called with new',
            () =>
            assert.throws
            (() => new Object.prototype.isPrototypeOf(), TypeError, /\bis not a constructor\b/),
        );
        test('with null argument', undefined, null, false);
        test('with undefined argument', null, undefined, false);
        test('with boolean type argument', Boolean.prototype, true, false);
        test('with number type argument', Number.prototype, 1, false);
        maybeIt
        (
            typeof BigInt === 'function',
            'returns false with bigint type argument',
            () =>
            {
                const expected = BigInt.prototype.isPrototypeOf(BigInt(1));
                assert.isFalse(expected);
            },
        );
        test('with string type argument', String.prototype, 'foo', false);
        test('with symbol type argument', Symbol.prototype, Symbol.iterator, false);
        test('when this is null', null, { }, TypeError);
        test('when this is undefined', undefined, { }, TypeError);
        test('when this and the argument are the same object', Object, Object, false);
        test('when this is the argument prototype', Function.prototype, Object, true);
        test('when this is in the argument prototype chain', Object.prototype, Object, true);
        maybeIt
        (
            typeof document !== 'undefined',
            'returns true with document.all',
            () =>
            {
                const expected = Object.prototype.isPrototypeOf(document.all);
                assert.isTrue(expected);
            },
        );
        it
        (
            'works with derived types',
            () =>
            {
                class A
                { }

                class B
                { }

                class C extends classes(A, B)
                { }

                class D extends C
                { }

                assert(A.isPrototypeOf(D));
                assert(B.isPrototypeOf(D));
                assert(C.isPrototypeOf(D));
                assert(Function.prototype.isPrototypeOf(D));
            },
        );
        it
        (
            'works with derived prototypes',
            () =>
            {
                class A
                { }

                class B
                { }

                class C extends classes(A, B)
                { }

                class D extends C
                { }

                const d = new D();
                assert(A.prototype.isPrototypeOf(d));
                assert(B.prototype.isPrototypeOf(d));
                assert(C.prototype.isPrototypeOf(d));
                assert(D.prototype.isPrototypeOf(d));
                assert(Object.prototype.isPrototypeOf(d));
            },
        );
    },
);
