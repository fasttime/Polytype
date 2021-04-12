/* eslint-env mocha */
/* global assert, classes, createDeceptiveObject, newRealm */

'use strict';

describe
(
    'Function.prototype.bind',
    () =>
    {
        before(() => classes(Object));

        it
        (
            'is defined on Function.prototype',
            async () =>
            {
                const { Function: Functionʼ } = await newRealm();
                Object.defineProperty
                (
                    Functionʼ.prototype,
                    'bind',
                    {
                        configurable: true,
                        enumerable: true,
                        value: Functionʼ.prototype.bind,
                        writable: false,
                    },
                );
                const A = Function();
                const Aʼ = Functionʼ();
                const emptyObj = { __proto__: null };
                const B = Function();
                Object.setPrototypeOf(B.prototype, emptyObj);
                classes(A, Aʼ, B);
                assert.include
                (
                    Object.getOwnPropertyDescriptor(Function.prototype, 'bind'),
                    { configurable: true, enumerable: false, writable: true },
                );
                assert.include
                (
                    Object.getOwnPropertyDescriptor(Functionʼ.prototype, 'bind'),
                    { configurable: true, enumerable: true, writable: false },
                );
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
                        configurable: true,
                        enumerable: false,
                        value: 1,
                        writable: false,
                    },
                    name:
                    {
                        configurable: true,
                        enumerable: false,
                        value: 'bind',
                        writable: false,
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
