/* eslint-env mocha */
/*
global
assert
classes
createDeceptiveObject
createFunctionFromConstructor
createNullPrototypeFunction
document
maybeIt
newRealm
*/

'use strict';

describe
(
    '[Symbol.hasInstance]',
    () =>
    {
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
            assert.hasOwnPropertyDescriptors
            (
                hasInstance,
                {
                    length:
                    {
                        configurable:   true,
                        enumerable:     false,
                        value:          1,
                        writable:       false,
                    },
                    name:
                    {
                        configurable:   true,
                        enumerable:     false,
                        value:          '[Symbol.hasInstance]',
                        writable:       false,
                    },
                },
            ),
        );

        it
        (
            'has expected prototype',
            () => assert.strictEqual(Object.getPrototypeOf(hasInstance), Function.prototype),
        );

        it
        (
            'cannot be called with new',
            // eslint-disable-next-line new-cap
            () => assert.throwsTypeError(() => new hasInstance(), /\bis not a constructor\b/),
        );

        describe
        (
            'is defined only on superclasses',
            () =>
            {
                it
                (
                    'in the same realm',
                    () =>
                    {
                        const A = Function();
                        A.prototype.constructor = null;
                        const B = () => { };
                        B.prototype = { constructor: B };
                        const C = { __proto__: B };
                        C.prototype = { __proto__: B.prototype };
                        C.prototype.constructor = C;
                        const D = Function();
                        Object.setPrototypeOf(D, C);
                        D.prototype = { __proto__: C.prototype };
                        D.prototype.constructor = D;
                        const _AD = classes(A, D);
                        const hasInstanceDescriptor =
                        {
                            enumerable:     false,
                            configurable:   true,
                            value:          hasInstance,
                            writable:       true,
                        };
                        assert.notOwnProperty(A, Symbol.hasInstance);
                        assert.hasOwnPropertyDescriptor
                        (B, Symbol.hasInstance, hasInstanceDescriptor);
                        assert.notOwnProperty(C, Symbol.hasInstance);
                        assert.notOwnProperty(D, Symbol.hasInstance);
                        assert.notOwnProperty(_AD, Symbol.hasInstance);
                    },
                );

                maybeIt
                (
                    newRealm,
                    'across realms',
                    async () =>
                    {
                        const { Function: Functionʼ, Object: Objectʼ, classes: classesʼ } =
                        await newRealm(true);
                        const E = createFunctionFromConstructor(Functionʼ);
                        const F = class extends E { };
                        const G = class { };
                        const H = class extends classesʼ(G) { };
                        const _FH = classes(F, H);
                        const hasInstanceDescriptor =
                        {
                            enumerable:     false,
                            configurable:   true,
                            value:          hasInstance,
                            writable:       true,
                        };
                        assert.hasOwnPropertyDescriptor
                        (E, Symbol.hasInstance, hasInstanceDescriptor);
                        assert.notOwnProperty(F, Symbol.hasInstance);
                        assert.hasOwnPropertyDescriptor
                        (G, Symbol.hasInstance, hasInstanceDescriptor);
                        assert.notOwnProperty(H, Symbol.hasInstance);
                        assert.notOwnProperty(_FH, Symbol.hasInstance);
                        assert.hasOwnPropertyDescriptor
                        (Objectʼ, Symbol.hasInstance, hasInstanceDescriptor);
                        assert.hasOwnPropertyDescriptor
                        (Functionʼ, Symbol.hasInstance, hasInstanceDescriptor);
                    },
                );
            },
        );

        it
        (
            'returns false when this is not callable',
            () =>
            {
                const actual = hasInstance.call({ prototype: Object.prototype }, { });
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false when this is null',
            () =>
            {
                const actual = hasInstance.call(null, { }); // eslint-disable-line no-useless-call
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false when this has null prototype',
            () =>
            {
                const actual = hasInstance.call({ __proto__: null }, { });
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false with null argument',
            () =>
            {
                const actual = hasInstance.call(Object, null);
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false with undefined argument',
            () =>
            {
                const actual = hasInstance.call(Object, undefined);
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false with boolean type argument',
            () =>
            {
                const actual = hasInstance.call(Boolean, true);
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false with number type argument',
            () =>
            {
                const actual = hasInstance.call(Number, 1);
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false with bigint type argument',
            () =>
            {
                const actual = hasInstance.call(Boolean, BigInt(1));
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false with string type argument',
            () =>
            {
                const actual = hasInstance.call(String, 'foo');
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false with symbol type argument',
            () =>
            {
                const actual = hasInstance.call(Symbol, Symbol.iterator);
                assert.isFalse(actual);
            },
        );

        maybeIt
        (
            typeof document !== 'undefined',
            'returns true with document.all',
            () =>
            {
                const actual = hasInstance.call(Object, document.all);
                assert.isTrue(actual);
            },
        );

        it
        (
            'returns false when the argument is the prototype of this',
            () =>
            {
                const actual = hasInstance.call(Symbol, Symbol.prototype);
                assert.isFalse(actual);
            },
        );

        describe
        (
            'when this is a function with property \'prototype\' null',
            () =>
            {
                it
                (
                    'returns false with a primitive argument',
                    () =>
                    {
                        const actual = hasInstance.call(createNullPrototypeFunction(), 1);
                        assert.isFalse(actual);
                    },
                );

                it
                (
                    'throws a TypeError with an object argument',
                    () =>
                    {
                        const fn = hasInstance.bind(createNullPrototypeFunction(), { });
                        assert.throwsTypeError(fn);
                    },
                );
            },
        );

        it
        (
            'throws a TypeError with a deceptive object',
            ()  =>
            {
                const fn = Function();
                {
                    const obj = createDeceptiveObject();
                    assert.throwsTypeError
                    (() => hasInstance.call(fn, obj), 'Corrupt inquiry result');
                }
                {
                    const obj = createDeceptiveObject(null);
                    assert.throwsTypeError(() => hasInstance.call(fn, obj));
                }
            },
        );
    },
);
