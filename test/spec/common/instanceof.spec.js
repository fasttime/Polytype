/* eslint-env mocha */
/* global assert, classes, createNullPrototypeFunction, global, setupTestData */

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
                    'with a function that is an instance of Function',
                    () =>
                    {
                        const A =
                        function ()
                        { };
                        const B =
                        class extends classes(A)
                        { };
                        assert.instanceOf(B, Function);
                    },
                );
                it
                (
                    'with a function that is not an instance of Function',
                    () =>
                    {
                        const A =
                        function ()
                        { };
                        const B =
                        class extends classes(A)
                        { };
                        Object.setPrototypeOf(A, null);
                        assert.notInstanceOf(B, Function);
                    },
                );
            },
        );
    },
);
