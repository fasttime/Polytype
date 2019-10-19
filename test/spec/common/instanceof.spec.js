/* eslint-env mocha */
/*
global
assert,
classes,
createFunctionFromConstructor,
createNullPrototypeFunction,
global,
newRealm,
setupTestData,
*/

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
                        const C =
                        Object.create(B, { prototype: { value: Object.create(B.prototype) } });
                        const D =
                        function ()
                        { };
                        Object.setPrototypeOf(D, C);
                        D.prototype = Object.create(C.prototype);
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
                        const A =
                        function ()
                        { };
                        Object.setPrototypeOf(A, Object);
                        const Aʼʼ = A.bind().bind();
                        A.prototype = Object.create(null);
                        const B =
                        class extends A
                        { };
                        const Bʼʼ = B.bind().bind();
                        classes(A, B);
                        const a = new A();
                        assert.instanceOf(a, Aʼʼ);
                        assert.notInstanceOf(a, Bʼʼ);
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
