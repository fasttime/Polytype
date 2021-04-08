/* eslint-env mocha */
/* global assert, classes, console, createFunctionWithGetPrototypeCount, maybeIt */

'use strict';

describe
(
    'classes',
    () =>
    {
        const imitateFunctionPrototype =
        console.Console &&
        console._stdout &&
        console.timeLog &&
        // Returns an object that fulfills all of the following requirements in Node.js 12:
        // * It is a non-constructor function.
        // * It has the same string representation as Function.prototype.
        // * It has no own properties.
        function ()
        {
            const fn = new console.Console(console._stdout).timeLog;
            for (const key of Reflect.ownKeys(fn))
                delete fn[key];
            return fn;
        };

        it
        (
            'has expected own properties',
            () =>
            {
                assert.hasOwnPropertyDescriptors
                (
                    classes,
                    {
                        length:
                        {
                            configurable: true,
                            enumerable: false,
                            value: 0,
                            writable: false,
                        },
                        name:
                        {
                            configurable: true,
                            enumerable: false,
                            value: 'classes',
                            writable: false,
                        },
                    },
                );
                assert.isEmpty(Object.getOwnPropertySymbols(classes));
            },
        );

        it
        (
            'has expected prototype',
            () => assert.strictEqual(Object.getPrototypeOf(classes), Function.prototype),
        );

        it
        (
            'cannot be called with new',
            // eslint-disable-next-line new-cap
            () => assert.throwsTypeError(() => new classes(), /\bis not a constructor\b/),
        );

        it
        (
            'works with a function that is not an instance of Function',
            () =>
            {
                const Type = Function();
                Object.setPrototypeOf(Type, { });
                assert.doesNotThrow(() => classes(Type));
            },
        );

        maybeIt
        (
            imitateFunctionPrototype,
            'works with a function with a non-constructor function in the prototype chain',
            () =>
            {
                const SuperType = imitateFunctionPrototype();
                const Type = Function();
                Object.setPrototypeOf(Type, SuperType);
                assert.doesNotThrow(() => classes(Type));
            },
        );

        it
        (
            'gets property \'prototype\' only once',
            () =>
            {
                const Foo = createFunctionWithGetPrototypeCount();
                classes(Foo);
                assert.equal(Foo.getPrototypeCount, 1);
            },
        );

        it
        (
            'does not invoke its arguments',
            () =>
            {
                function Foo()
                {
                    superInvoked = true;
                }

                let superInvoked = false;
                classes(Foo);
                assert.isFalse(superInvoked);
            },
        );

        it
        (
            'does not invoke field initializers',
            () =>
            {
                const Foo =
                eval
                (
                    `
                    (
                        class
                        {
                            foo = (superInvoked = true);

                            constructor()
                            { }
                        }
                    )`,
                );
                // eslint-disable-next-line prefer-const
                let superInvoked = false;
                classes(Foo);
                assert.isFalse(superInvoked);
            },
        );

        describe
        (
            'throws a TypeError',
            () =>
            {
                const { isPrototypeOf } = Object.prototype;

                it
                (
                    'without arguments',
                    () => assert.throwsTypeError(() => classes(), 'No superclasses specified'),
                );

                it
                (
                    'with a null argument',
                    () => assert.throwsTypeError(() => classes(null), 'null is not a constructor'),
                );

                it
                (
                    'with a bigint argument',
                    () =>
                    assert.throwsTypeError(() => classes(BigInt(42)), '42 is not a constructor'),
                );

                it
                (
                    'with a symbol argument',
                    () =>
                    assert.throwsTypeError
                    (() => classes(Symbol()), 'Symbol() is not a constructor'),
                );

                it
                (
                    'with a non-callable object argument',
                    () =>
                    assert.throwsTypeError
                    (() => classes({ }), '[object Object] is not a constructor'),
                );

                it
                (
                    'with a non-constructor callable argument',
                    () =>
                    {
                        const foo = () => -0;
                        Object.defineProperties
                        (foo, { name: { value: undefined }, prototype: { value: { } } });
                        assert.throwsTypeError(() => classes(foo), '() => -0 is not a constructor');
                    },
                );

                it
                (
                    'with a bound function',
                    () =>
                    assert.throwsTypeError
                    (
                        () => classes(Array.bind()),
                        'Property \'prototype\' of bound Array is not an object or null',
                    ),
                );

                it
                (
                    'with a function with a non-object property \'prototype\' value',
                    () =>
                    {
                        const foo = Function();
                        Object.defineProperty(foo, 'prototype', { value: 42 });
                        assert.throwsTypeError
                        (
                            () => classes(foo),
                            'Property \'prototype\' of anonymous is not an object or null',
                        );
                    },
                );

                it
                (
                    'with a repeated argument',
                    () =>
                    {
                        assert.throwsTypeError
                        (() => classes(String, Array, String), 'Duplicate superclass String');
                    },
                );

                maybeIt
                (
                    imitateFunctionPrototype,
                    'when property Symbol.hasInstance cannot be installed',
                    () =>
                    {
                        const SuperType = imitateFunctionPrototype();
                        Object.defineProperty(SuperType, Symbol.hasInstance, { value: Function() });
                        const Type = Function();
                        Object.setPrototypeOf(Type, SuperType);
                        assert.throwsTypeError(() => classes(Type));
                    },
                );

                it
                (
                    'when property \'isPrototypeOf\' cannot be installed',
                    () =>
                    {
                        const Type = Function();
                        Type.prototype = { __proto__: null, isPrototypeOf };
                        Object.freeze(Type.prototype);
                        assert.throwsTypeError(() => classes(Type));
                    },
                );
            },
        );
    },
);
