
/* eslint-env mocha */
/* global BigInt, assert, classes, createNullPrototypeFunction, document, maybeIt */

'use strict';

describe
(
    '[Symbol.hasInstance]',
    () =>
    {
        function test(argDescription, type, arg, expectedResult)
        {
            const description = `returns ${expectedResult} ${argDescription}`;
            it
            (
                description,
                () =>
                {
                    assert.strictEqual(Object[Symbol.hasInstance].call(type, arg), expectedResult);
                },
            );
        }

        it
        (
            'has expected own properties',
            () =>
            {
                assert.hasOwnPropertyDescriptors
                (
                    Object[Symbol.hasInstance],
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
                            value: '[Symbol.hasInstance]',
                            writable: false,
                        },
                    },
                );
                assert.isEmpty(Object.getOwnPropertySymbols(Object[Symbol.hasInstance]));
            },
        );
        it
        (
            'cannot be called with new',
            () =>
            assert.throws
            (() => new Object[Symbol.hasInstance](), TypeError, /\bis not a constructor\b/),
        );
        it
        (
            'is set only on superclasses',
            () =>
            {
                const A = createNullPrototypeFunction('A');
                const B =
                () =>
                { };
                B.prototype = { };
                const C = Object.create(B);
                C.prototype = Object.create(B.prototype);
                const D =
                function ()
                { };
                Object.setPrototypeOf(D, C);
                D.prototype = Object.create(C.prototype);
                const _AD = classes(A, D);
                assert.ownProperty(A, Symbol.hasInstance);
                assert.ownProperty(B, Symbol.hasInstance);
                assert.notOwnProperty(C, Symbol.hasInstance);
                assert.notOwnProperty(D, Symbol.hasInstance);
                assert.notOwnProperty(_AD, Symbol.hasInstance);
            },
        );
        test('when this is not callable', { prototype: Object.prototype }, { }, false);
        test('when this is null', null, { }, false);
        test('when this has null prototype', Object.create(null), { }, false);
        test('with null argument', Object, null, false);
        test('with undefined argument', Object, undefined, false);
        test('with boolean type argument', Boolean, true, false);
        test('with number type argument', Number, 1, false);
        maybeIt
        (
            typeof BigInt === 'function',
            'returns false with bigint type argument',
            () =>
            {
                const expected = Boolean[Symbol.hasInstance](BigInt(1));
                assert.isFalse(expected);
            },
        );
        test('with string type argument', String, 'foo', false);
        test('with symbol type argument', Symbol, Symbol.iterator, false);
        maybeIt
        (
            typeof document !== 'undefined',
            'returns true with document.all',
            () =>
            {
                const expected = Object[Symbol.hasInstance](document.all);
                assert.isTrue(expected);
            },
        );
        test('when the argument is the prototype of this', Symbol, Symbol.prototype, false);

        describe
        (
            'when this is a function with property \'prototype\' null',
            () =>
            {
                test('with a primitive argument', createNullPrototypeFunction(), 1, false);
                it
                (
                    'throws a TypeError with an object argument',
                    () =>
                    {
                        const fn =
                        Object[Symbol.hasInstance].bind(createNullPrototypeFunction(), { });
                        assert.throws(fn, TypeError);
                    },
                );
            },
        );
    },
);
