/* eslint-env mocha */
/*
global
assert
classes
createFunctionFromConstructor
createNullPrototypeFunction
maybeIt
newRealm
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
                    'with all supertypes',
                    () =>
                    {
                        const A = createNullPrototypeFunction('A');
                        const B = class { };
                        const C = { __proto__: B, prototype: { __proto__: B.prototype } };
                        const D = Function();
                        Object.setPrototypeOf(D, C);
                        D.prototype = { __proto__: C.prototype };
                        const _AD = classes(A, D);
                        const E = class extends _AD { };
                        const e = new E();
                        assert.instanceOf(e, B);
                        assert.instanceOf(e, D);
                        assert.instanceOf(e, _AD);
                        assert.instanceOf(e, E);
                        assert.instanceOf(e, Object);
                    },
                );

                maybeIt
                (
                    newRealm,
                    'across realms',
                    async () =>
                    {
                        const { Function: Functionʼ, Object: Objectʼ } = await newRealm();
                        const Foo = createFunctionFromConstructor(Functionʼ);
                        const Bar = class { };
                        const FooBar = class extends classes(Foo, Bar) { };
                        const foobar = new FooBar();
                        assert.instanceOf(foobar, Object);
                        assert.instanceOf(foobar, Objectʼ);
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
                        const B = class extends A { };
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
                    'in the same realm',
                    () =>
                    {
                        const A = Function();
                        const B = class extends classes(A) { };
                        assert.instanceOf(A, Function);
                        assert.instanceOf(B, Function);
                    },
                );

                maybeIt
                (
                    newRealm,
                    'across realms',
                    async () =>
                    {
                        const { Function: Functionʼ } = await newRealm();
                        const A = Function();
                        const Aʼ = createFunctionFromConstructor(Functionʼ);
                        const B = class extends classes(A, Aʼ) { };
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
