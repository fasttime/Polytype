
/* eslint-env mocha */
/*
global
assert,
classes,
createFunctionFromConstructor,
createNullPrototypeFunction,
document,
maybeIt,
newRealm,
*/

'use strict';

describe
(
    '[Symbol.hasInstance]',
    () =>
    {
        function test(argDescription, type, arg, expectedResult)
        {
            const description = `returns ${expectedResult} ${argDescription}`;

            it(description, () => assert.strictEqual(hasInstance.call(type, arg), expectedResult));
        }

        let hasInstance;

        before
        (
            () =>
            {
                classes(Object);
                hasInstance = Object[Symbol.hasInstance];
                delete Function[Symbol.hasInstance];
                delete Object[Symbol.hasInstance];
            },
        );

        after
        (
            () =>
            {
                hasInstance = null;
            },
        );

        it
        (
            'has expected own properties',
            () =>
            {
                assert.hasOwnPropertyDescriptors
                (
                    hasInstance,
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
                assert.isEmpty(Object.getOwnPropertySymbols(hasInstance));
            },
        );

        it
        (
            'cannot be called with new',
            () => // eslint-disable-next-line new-cap
            assert.throws(() => new hasInstance(), TypeError, /\bis not a constructor\b/),
        );

        it
        (
            'is defined only on superclasses',
            async () =>
            {
                const { Function: Functionʼ, Object: Objectʼ } = await newRealm();
                const A =
                function ()
                { };
                A.prototype.constructor = null;
                const B =
                () =>
                { };
                B.prototype = { constructor: B };
                const C = { __proto__: B };
                C.prototype = { __proto__: B.prototype };
                C.prototype.constructor = C;
                const D =
                function ()
                { };
                Object.setPrototypeOf(D, C);
                D.prototype = { __proto__: C.prototype };
                D.prototype.constructor = D;
                const E = createFunctionFromConstructor(Functionʼ);
                const F =
                class extends E
                { };
                const _ADF = classes(A, D, F);
                const hasInstanceDescriptorMapObj =
                {
                    [Symbol.hasInstance]:
                    {
                        enumerable: false,
                        configurable: true,
                        value: hasInstance,
                        writable: true,
                    },
                };
                assert.notOwnProperty(A, Symbol.hasInstance);
                assert.hasOwnPropertyDescriptors(B, hasInstanceDescriptorMapObj);
                assert.notOwnProperty(C, Symbol.hasInstance);
                assert.notOwnProperty(D, Symbol.hasInstance);
                assert.hasOwnPropertyDescriptors(E, hasInstanceDescriptorMapObj);
                assert.notOwnProperty(F, Symbol.hasInstance);
                assert.notOwnProperty(_ADF, Symbol.hasInstance);
                assert.hasOwnPropertyDescriptors(Objectʼ, hasInstanceDescriptorMapObj);
                assert.hasOwnPropertyDescriptors(Functionʼ, hasInstanceDescriptorMapObj);
            },
        );

        test('when this is not callable', { prototype: Object.prototype }, { }, false);

        test('when this is null', null, { }, false);

        test('when this has null prototype', { __proto__: null }, { }, false);

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
                const expected = hasInstance.call(Boolean, BigInt(1));
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
                const expected = hasInstance.call(Object, document.all);
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
                        const fn = hasInstance.bind(createNullPrototypeFunction(), { });
                        assert.throws(fn, TypeError);
                    },
                );
            },
        );
    },
);
