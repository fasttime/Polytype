/* eslint-env mocha */
/* global assert, classes */

'use strict';

describe
(
    'Clustered prototype [classes(...?).prototype]',
    () =>
    {
        it
        (
            'has unsettable prototype',
            () =>
            assert.throwsTypeError(() => Object.setPrototypeOf(classes(Function()).prototype, { })),
        );

        it
        (
            'has expected own properties',
            () =>
            {
                const constructor = classes(Function());
                const { prototype } = constructor;
                assert.hasOwnPropertyDescriptors
                (
                    prototype,
                    {
                        class:
                        {
                            configurable: false,
                            enumerable: false,
                            value: prototype.class,
                            writable: false,
                        },
                        constructor:
                        {
                            configurable: true,
                            enumerable: false,
                            value: constructor,
                            writable: true,
                        },
                    },
                );
            },
        );
    },
);
