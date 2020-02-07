/* eslint-env mocha */
/* global assert, classes, createFunctionFromConstructor, createNullPrototypeFunction, newRealm */

'use strict';

describe
(
    'instanceof',
    () =>
    {
        beforeEach
        (
            () =>
            {
                delete Function[Symbol.hasInstance];
                delete Object[Symbol.hasInstance];
            },
        );

        describe
        (
            'works at instance level',
            () =>
            {
                it
                (
                    'with all base types',
                    async () =>
                    {
                        const { Function: Functionʼ, Object: Objectʼ } = await newRealm();
                        const A = createNullPrototypeFunction('A');
                        const B =
                        class
                        { };
                        const C = { __proto__: B, prototype: { __proto__: B.prototype } };
                        const D = Function();
                        Object.setPrototypeOf(D, C);
                        D.prototype = { __proto__: C.prototype };
                        const E = createFunctionFromConstructor(Functionʼ);
                        const _ADE = classes(A, D, E);
                        const F =
                        class extends _ADE
                        { };
                        const f = new F();
                        assert.instanceOf(f, B);
                        assert.instanceOf(f, D);
                        assert.instanceOf(f, E);
                        assert.instanceOf(f, _ADE);
                        assert.instanceOf(f, F);
                        assert.instanceOf(f, Object);
                        assert.instanceOf(f, Objectʼ);
                    },
                );

                it
                (
                    'with bound types',
                    () =>
                    {
                        const A = Function();
                        const Aˀ = A.bind();
                        A.prototype = { __proto__: null };
                        const B =
                        class extends A
                        { };
                        const Bˀ = B.bind();
                        classes(B);
                        const a = new A();
                        assert.instanceOf(a, Aˀ);
                        assert.notInstanceOf(a, Bˀ);
                    },
                );
            },
        );

        describe
        (
            'works at class level',
            () =>
            {
                it
                (
                    'across realms',
                    async () =>
                    {
                        const { Function: Functionʼ } = await newRealm();
                        const A = Function();
                        const Aʼ = createFunctionFromConstructor(Functionʼ);
                        const B =
                        class extends classes(A, Aʼ)
                        { };
                        assert.instanceOf(A, Function);
                        assert.notInstanceOf(A, Functionʼ);
                        assert.notInstanceOf(Aʼ, Function);
                        assert.instanceOf(Aʼ, Functionʼ);
                        assert.instanceOf(B, Function);
                        assert.instanceOf(B, Functionʼ);
                    },
                );
            },
        );
    },
);
