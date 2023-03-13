/* eslint-env mocha */
/* global assert classes createDeceptiveObject maybeIt newRealm */

'use strict';

describe
(
    'Object.prototype.isPrototypeOf',
    () =>
    {
        before(() => classes(Object));

        maybeIt
        (
            newRealm,
            'preserves the original enumerable and writable attributes',
            async () =>
            {
                const { Function: Functionʼ, Object: Objectʼ } = await newRealm();
                const { Function: Functionʼʼ, Object: Objectʼʼ } = await newRealm();
                Object.defineProperty
                (
                    Objectʼ.prototype,
                    'isPrototypeOf',
                    {
                        configurable:   true,
                        enumerable:     true,
                        value:          Objectʼ.prototype.isPrototypeOf,
                        writable:       false,
                    },
                );
                Object.defineProperty
                (
                    Objectʼʼ.prototype,
                    'isPrototypeOf',
                    {
                        configurable:   true,
                        enumerable:     false,
                        value:          Objectʼʼ.prototype.isPrototypeOf,
                        writable:       true,
                    },
                );
                const Aʼ = Functionʼ();
                const Aʼʼ = Functionʼʼ();
                classes(Aʼ, Aʼʼ);
                assert.hasOwnPropertyDescriptor
                (
                    Objectʼ.prototype,
                    'isPrototypeOf',
                    {
                        configurable:   true,
                        enumerable:     true,
                        value:          Objectʼ.prototype.isPrototypeOf,
                        writable:       false,
                    },
                );
                assert.hasOwnPropertyDescriptor
                (
                    Objectʼʼ.prototype,
                    'isPrototypeOf',
                    {
                        configurable:   true,
                        enumerable:     false,
                        value:          Objectʼʼ.prototype.isPrototypeOf,
                        writable:       true,
                    },
                );
            },
        );

        it
        (
            'is not defined if a root prototype cannot be determined',
            () =>
            {
                const emptyObj = { __proto__: null };
                const Foo = Function();
                Object.setPrototypeOf(Foo, emptyObj);
                classes(Foo);
                assert.notOwnProperty(emptyObj, 'isPrototypeOf');
            },
        );

        it
        (
            'has expected own properties',
            () =>
            assert.hasOwnPropertyDescriptors
            (
                Object.prototype.isPrototypeOf,
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
                        value:          'isPrototypeOf',
                        writable:       false,
                    },
                },
            ),
        );

        it
        (
            'has expected prototype',
            () =>
            assert.strictEqual
            (Object.getPrototypeOf(Object.prototype.isPrototypeOf), Function.prototype),
        );

        it
        (
            'looks like a native function',
            () =>
            {
                const str = Function.prototype.toString.call(Object.prototype.isPrototypeOf);
                assert.match(str, /^function (?!isPrototypeOf\b)\w*\(\) {\s+\[native code]\s+}$/);
            },
        );

        it
        (
            'cannot be called with new',
            () =>
            assert.throwsTypeError
            (() => new Object.prototype.isPrototypeOf(), /\bis not a constructor\b/),
        );

        it
        (
            'throws a TypeError if this is null',
            () =>
            {
                const fn = Object.prototype.isPrototypeOf.bind(null, { });
                assert.throwsTypeError(fn);
            },
        );

        it
        (
            'throws a TypeError if this is undefined',
            () =>
            {
                const fn = Object.prototype.isPrototypeOf.bind(undefined, { });
                assert.throwsTypeError(fn);
            },
        );

        it
        (
            'throws a TypeError with a deceptive object',
            ()  =>
            {
                {
                    const obj = createDeceptiveObject();
                    assert.throwsTypeError
                    (() => Object.isPrototypeOf(obj), 'Corrupt inquiry result');
                }
                {
                    const obj = createDeceptiveObject(null);
                    assert.throwsTypeError(() => Object.isPrototypeOf(obj));
                }
            },
        );
    },
);
