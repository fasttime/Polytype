/* eslint-env mocha */
/* global assert, classes, createNullPrototypeFunction, exactRegExp, setupTestData */

'use strict';

describe
(
    'super.class',
    ()  =>
    {
        describe
        (
            'in nonstatic context',
            () =>
            {
                it
                (
                    'has expected own properties',
                    () =>
                    {
                        const classValue = classes(Function()).prototype.class;
                        assert.hasOwnPropertyDescriptors
                        (
                            classValue,
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
                                    value: 'class',
                                    writable: false,
                                },
                            },
                        );
                        assert.isEmpty(Object.getOwnPropertySymbols(classValue));
                    },
                );

                it
                (
                    'has name "class" in second instances',
                    () =>
                    {
                        void classes(Object).prototype.class.name;
                        assert.strictEqual(classes(Object).prototype.class.name, 'class');
                    },
                );

                it
                (
                    'cannot be called with new',
                    () =>
                    {
                        const { A, C } = setupTestData(classes);
                        const c = new C();
                        assert.throws(() => c.newSuper(A), TypeError, /\bis not a constructor\b/);
                    },
                );

                it
                (
                    'returns a proxy for any superclass argument',
                    () =>
                    {
                        const { A, C } = setupTestData(classes);
                        const c = new C();
                        assert.instanceOf(c.getSuper(A), C);
                    },
                );

                it
                (
                    'throws a TypeError with an invalid argument',
                    () =>
                    {
                        const { E } = setupTestData(classes);
                        const e = new E();
                        assert.throws
                        (
                            () => e.getSuper({ }),
                            TypeError,
                            exactRegExp('Argument is not a function'),
                        );
                    },
                );

                it
                (
                    'throws a TypeError with an invalid superclass',
                    () =>
                    {
                        const { A, E } = setupTestData(classes);
                        const e = new E();
                        assert.throws
                        (
                            () => e.getSuper(A),
                            TypeError,
                            exactRegExp
                            (
                                'Property \'prototype\' of argument does not match any ' +
                                'direct superclass',
                            ),
                        );
                    },
                );

                it
                (
                    'throws a TypeError with a superclass with property \'prototype\' null',
                    () =>
                    {
                        const Foo = createNullPrototypeFunction('Foo');

                        class Bar extends classes(Foo)
                        {
                            bar()
                            {
                                super.class(Foo);
                            }
                        }

                        const bar = new Bar();
                        assert.throws
                        (
                            () => bar.bar(),
                            TypeError,
                            exactRegExp
                            (
                                'Property \'prototype\' of argument is not an object',
                                'undefined is not an object (evaluating \'super.class\')',
                            ),
                        );
                    },
                );
            },
        );

        describe
        (
            'in static context',
            () =>
            {
                it
                (
                    'has expected own properties',
                    () =>
                    {
                        const classValue = classes(Function()).class;
                        assert.hasOwnPropertyDescriptors
                        (
                            classValue,
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
                                    value: 'class',
                                    writable: false,
                                },
                            },
                        );
                        assert.isEmpty(Object.getOwnPropertySymbols(classValue));
                    },
                );

                it
                (
                    'has name "class" in second instances',
                    () =>
                    {
                        void classes(Object).class.name;
                        assert.strictEqual(classes(Object).class.name, 'class');
                    },
                );

                it
                (
                    'cannot be called with new',
                    () =>
                    {
                        const { A, C } = setupTestData(classes);
                        assert.throws
                        (() => C.newStaticSuper(A), TypeError, /\bis not a constructor\b/);
                    },
                );

                it
                (
                    'returns a proxy for any superclass argument',
                    () =>
                    {
                        const { A, C } = setupTestData(classes);
                        const CConstructor =
                        function ()
                        { };
                        CConstructor.prototype = Object.getPrototypeOf(C);
                        assert.instanceOf(C.getStaticSuper(A), CConstructor);
                    },
                );

                it
                (
                    'throws a TypeError with an invalid argument',
                    () =>
                    {
                        const { E } = setupTestData(classes);
                        assert.throws
                        (
                            () => E.getStaticSuper({ }),
                            TypeError,
                            exactRegExp('Argument is not a function'),
                        );
                    },
                );

                it
                (
                    'throws a TypeError with an invalid superclass',
                    () =>
                    {
                        const { A, E } = setupTestData(classes);
                        assert.throws
                        (
                            () => E.getStaticSuper(A),
                            TypeError,
                            exactRegExp('Argument is not a direct superclass'),
                        );
                    },
                );
            },
        );
    },
);
