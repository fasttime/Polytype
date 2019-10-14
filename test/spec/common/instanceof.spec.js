/* eslint-env mocha */
/* global assert, classes, createNullPrototypeFunction, global, newRealm, setupTestData */

'use strict';

describe
(
    'instanceof',
    () =>
    {
        describe
        (
            'works at instance level',
            () =>
            {
                it
                (
                    'with all base types',
                    () =>
                    {
                        const A = createNullPrototypeFunction('A');
                        const B =
                        function ()
                        { };
                        B.prototype = { constructor: B };
                        const C = Object.create(B);
                        C.prototype = Object.create(B.prototype);
                        const D =
                        function ()
                        { };
                        Object.setPrototypeOf(D, C);
                        D.prototype = Object.create(C.prototype);
                        const _AD = classes(A, D);
                        const E =
                        class extends _AD
                        { };
                        const e = new E();
                        assert.instanceOf(e, B);
                        assert.instanceOf(e, D);
                        assert.instanceOf(e, _AD);
                        assert.instanceOf(e, E);
                        assert.instanceOf(e, Object);
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
                        const Aʼ = Functionʼ();
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
