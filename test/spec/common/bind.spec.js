/* eslint-env mocha */
/* global assert, createDeceptiveObject */

'use strict';

describe
(
    'bind',
    () =>
    {
        it
        (
            'has expected attributes',
            () =>
            assert.include
            (
                Object.getOwnPropertyDescriptor(Function.prototype, 'bind'),
                { configurable: true, enumerable: false, writable: true },
            ),
        );

        it
        (
            'has expected own properties',
            () =>
            {
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
                );
                assert.isEmpty(Object.getOwnPropertySymbols(Function.prototype.bind));
            },
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
                assert.match(str, /^function \w*\(\) {\s+\[native code]\s+}$/);
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
