/* eslint-env mocha */
/* global assert, classes, document, maybeIt, newRealm */

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

        before(() => classes(Object));

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
            assert.throwsTypeError
            (() => new Object.prototype.isPrototypeOf(), /\bis not a constructor\b/),
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

                class D
                { }

                class E extends classes(C, D)
                { }

                assert.isTrue(A.isPrototypeOf(C));
                assert.isTrue(B.isPrototypeOf(C));
                assert.isFalse(C.isPrototypeOf(C));
                assert.isFalse(D.isPrototypeOf(C));
                assert.isFalse(E.isPrototypeOf(C));
                assert(Function.prototype.isPrototypeOf(C));
                assert(Object.prototype.isPrototypeOf(C));
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

                class D
                { }

                class E extends classes(C, D)
                { }

                const c = new C();
                assert.isTrue(A.prototype.isPrototypeOf(c));
                assert.isTrue(B.prototype.isPrototypeOf(c));
                assert.isTrue(C.prototype.isPrototypeOf(c));
                assert.isFalse(D.prototype.isPrototypeOf(c));
                assert.isFalse(E.prototype.isPrototypeOf(c));
                assert.isTrue(Object.prototype.isPrototypeOf(c));
            },
        );

        it
        (
            'is defined on Object.prototype',
            async () =>
            {
                const { Function: Functionʼ, Object: Objectʼ } = await newRealm();
                Object.defineProperty
                (
                    Objectʼ.prototype,
                    'isPrototypeOf',
                    {
                        configurable: true,
                        enumerable: true,
                        value: Objectʼ.prototype.isPrototypeOf,
                        writable: false,
                    },
                );
                const A = Function();
                const Aʼ = Functionʼ();
                const emptyObj = { __proto__: null };
                const B = Function();
                Object.setPrototypeOf(B.prototype, emptyObj);
                classes(A, Aʼ, B);
                assert.hasOwnPropertyDescriptors
                (
                    Object.prototype,
                    {
                        isPrototypeOf:
                        {
                            configurable: true,
                            enumerable: false,
                            value: Object.prototype.isPrototypeOf,
                            writable: true,
                        },
                    },
                );
                assert.hasOwnPropertyDescriptors
                (
                    Objectʼ.prototype,
                    {
                        isPrototypeOf:
                        {
                            configurable: true,
                            enumerable: true,
                            value: Object.prototype.isPrototypeOf,
                            writable: false,
                        },
                    },
                );
                assert.notOwnProperty(emptyObj, 'isPrototypeOf');
            },
        );
    },
);
