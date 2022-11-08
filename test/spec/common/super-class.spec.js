/* eslint-env mocha */
/* global assert, classes, createNullPrototypeFunction */

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
                                    configurable:   true,
                                    enumerable:     false,
                                    value:          1,
                                    writable:       false,
                                },
                                name:
                                {
                                    configurable:   true,
                                    enumerable:     false,
                                    value:          'class',
                                    writable:       false,
                                },
                            },
                        );
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
                        class Foo extends classes(Object)
                        {
                            newSuper(type)
                            {
                                const superClass = super.class;
                                new superClass(type); // eslint-disable-line new-cap
                            }
                        }

                        const foo = new Foo();
                        assert.throwsTypeError
                        (() => foo.newSuper(Object), /\bis not a constructor\b/);
                    },
                );

                it
                (
                    'returns a distinct proxy for any object and superclass argument',
                    () =>
                    {
                        class Foo
                        { }

                        class Bar
                        { }

                        class FooBar extends classes(Foo, Bar)
                        {
                            getSuperClass(superType)
                            {
                                return super.class(superType);
                            }
                        }

                        const fooBar = new FooBar();
                        const superFoo = fooBar.getSuperClass(Foo);
                        assert.isObject(superFoo);
                        assert.notStrictEqual(superFoo, fooBar.getSuperClass(Bar));
                        assert.notStrictEqual(superFoo, new FooBar().getSuperClass(Foo));
                    },
                );

                it
                (
                    'throws a TypeError with an invalid argument',
                    () =>
                    {
                        class Foo extends classes(Object)
                        {
                            callSuper()
                            {
                                super.class({ });
                            }
                        }

                        const foo = new Foo();
                        assert.throwsTypeError
                        (() => foo.callSuper({ }), 'Argument is not a function');
                    },
                );

                it
                (
                    'throws a TypeError with an indirect superclass',
                    () =>
                    {
                        class A
                        { }

                        class B extends classes(A)
                        { }

                        class C extends classes(B)
                        {
                            callSuper()
                            {
                                super.class(A);
                            }
                        }

                        class D extends A
                        { }

                        class E extends classes(D)
                        {
                            callSuper()
                            {
                                super.class(A);
                            }
                        }

                        const expectedMessage =
                        'Property \'prototype\' of argument does not match any direct superclass';
                        {
                            const c = new C();
                            assert.throwsTypeError(() => c.callSuper(), expectedMessage);
                        }
                        {
                            const e = new E();
                            assert.throwsTypeError(() => e.callSuper(), expectedMessage);
                        }
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
                        assert.throwsTypeError
                        (
                            () => bar.bar(),
                            [
                                'Property \'prototype\' of argument is not an object',
                                'undefined is not an object (evaluating \'super.class\')',
                            ],
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
                                    configurable:   true,
                                    enumerable:     false,
                                    value:          1,
                                    writable:       false,
                                },
                                name:
                                {
                                    configurable:   true,
                                    enumerable:     false,
                                    value:          'class',
                                    writable:       false,
                                },
                            },
                        );
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
                        class Foo extends classes(Object)
                        {
                            static newSuper(type)
                            {
                                const superClass = super.class;
                                new superClass(type); // eslint-disable-line new-cap
                            }
                        }

                        assert.throwsTypeError
                        (() => Foo.newSuper(Object), /\bis not a constructor\b/);
                    },
                );

                it
                (
                    'returns a distinct proxy for any object and superclass argument',
                    () =>
                    {
                        class Foo
                        { }

                        class Bar
                        { }

                        class FooBar extends classes(Foo, Bar)
                        {
                            static getSuperClass(superType)
                            {
                                return super.class(superType);
                            }
                        }

                        const superFoo = FooBar.getSuperClass(Foo);
                        assert.isObject(superFoo);
                        assert.notStrictEqual(superFoo, FooBar.getSuperClass(Bar));
                        assert.notStrictEqual(superFoo, { __proto__: FooBar }.getSuperClass(Foo));
                    },
                );

                it
                (
                    'throws a TypeError with an invalid argument',
                    () =>
                    {
                        class Foo extends classes(Object)
                        {
                            static callSuper()
                            {
                                super.class({ });
                            }
                        }

                        assert.throwsTypeError
                        (() => Foo.callSuper({ }), 'Argument is not a function');
                    },
                );

                it
                (
                    'throws a TypeError with an indirect superclass',
                    () =>
                    {
                        class A
                        { }

                        class B extends classes(A)
                        { }

                        class C extends classes(B)
                        {
                            static callSuper()
                            {
                                super.class(A);
                            }
                        }

                        class D extends A
                        { }

                        class E extends classes(D)
                        {
                            static callSuper()
                            {
                                super.class(A);
                            }
                        }

                        const expectedMessage = 'Argument is not a direct superclass';
                        assert.throwsTypeError(() => C.callSuper(), expectedMessage);
                        assert.throwsTypeError(() => E.callSuper(), expectedMessage);
                    },
                );
            },
        );
    },
);
