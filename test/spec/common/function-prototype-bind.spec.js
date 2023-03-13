/* eslint-env mocha */
/* global assert classes createDeceptiveObject maybeIt newRealm */

'use strict';

describe
(
    'Function.prototype.bind',
    () =>
    {
        before(() => classes(Object));

        maybeIt
        (
            newRealm,
            'preserves the original enumerable and writable attributes',
            async () =>
            {
                const { Function: Functionʼ } = await newRealm();
                const { Function: Functionʼʼ } = await newRealm();
                Object.defineProperty
                (
                    Functionʼ.prototype,
                    'bind',
                    {
                        configurable:   true,
                        enumerable:     true,
                        value:          Functionʼ.prototype.bind,
                        writable:       false,
                    },
                );
                Object.defineProperty
                (
                    Functionʼʼ.prototype,
                    'bind',
                    {
                        configurable:   true,
                        enumerable:     false,
                        value:          Functionʼʼ.prototype.bind,
                        writable:       true,
                    },
                );
                const Aʼ = Functionʼ();
                const Aʼʼ = Functionʼʼ();
                classes(Aʼ, Aʼʼ);
                assert.hasOwnPropertyDescriptor
                (
                    Functionʼ.prototype,
                    'bind',
                    {
                        configurable:   true,
                        enumerable:     true,
                        value:          Functionʼ.prototype.bind,
                        writable:       false,
                    },
                );
                assert.hasOwnPropertyDescriptor
                (
                    Functionʼʼ.prototype,
                    'bind',
                    {
                        configurable:   true,
                        enumerable:     false,
                        value:          Functionʼʼ.prototype.bind,
                        writable:       true,
                    },
                );
            },
        );

        it
        (
            'is not defined if a constructor prototype cannot be determined',
            () =>
            {
                const emptyObj = { __proto__: null };
                const Foo = Function();
                Foo.constructor = { __proto__: emptyObj };
                classes(Foo);
                assert.notOwnProperty(emptyObj, 'bind');
            },
        );

        it
        (
            'has expected own properties',
            () =>
            assert.hasOwnPropertyDescriptors
            (
                Function.prototype.bind,
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
                        value:          'bind',
                        writable:       false,
                    },
                },
            ),
        );

        it
        (
            'has expected prototype',
            () =>
            assert.strictEqual(Object.getPrototypeOf(Function.prototype.bind), Function.prototype),
        );

        it
        (
            'looks like a native function',
            () =>
            {
                const str = Function.prototype.toString.call(Function.prototype.bind);
                assert.match(str, /^function (?!bind\b)\w*\(\) {\s+\[native code]\s+}$/);
            },
        );

        it
        (
            'cannot be called with new',
            () =>
            // eslint-disable-next-line new-cap
            assert.throwsTypeError(() => new Function.prototype.bind(), /\bis not a constructor\b/),
        );

        it
        (
            'throws a TypeError if this is not a function',
            () =>
            assert.throwsTypeError
            (
                () => Function.prototype.bind.call({ }),
                [
                    'Bind must be called on a function',
                    'Function.prototype.bind called on incompatible target',
                    '|this| is not a function inside Function.prototype.bind',
                ],
            ),
        );

        it
        (
            'throws a TypeError with a deceptive object',
            ()  =>
            {
                const obj = createDeceptiveObject();
                assert.throwsTypeError
                (() => Object.bind(obj), 'Corrupt inquiry result');
            },
        );
    },
);
