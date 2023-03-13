/* eslint-env mocha */
/* global assert classes document maybeIt newRealm */

'use strict';

describe
(
    '?.isPrototypeOf(?)',
    () =>
    {
        before(() => classes(Object));

        it
        (
            'returns false with null argument',
            () =>
            {
                const actual = Object.prototype.isPrototypeOf.call(undefined, null);
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false with undefined argument',
            () =>
            {
                const actual = Object.prototype.isPrototypeOf.call(null, undefined);
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false with boolean type argument',
            () =>
            {
                const actual = Boolean.prototype.isPrototypeOf(true);
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false with number type argument',
            () =>
            {
                const actual = Number.prototype.isPrototypeOf(1);
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false with bigint type argument',
            () =>
            {
                const actual = BigInt.prototype.isPrototypeOf(BigInt(1));
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false with string type argument',
            () =>
            {
                const actual = String.prototype.isPrototypeOf('foo');
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false with Symbol type argument',
            () =>
            {
                const actual = Symbol.prototype.isPrototypeOf(Symbol.iterator);
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns false when this and the argument are the same object',
            () =>
            {
                const obj = { };
                const actual = obj.isPrototypeOf(obj);
                assert.isFalse(actual);
            },
        );

        it
        (
            'returns true when this is the argument prototype',
            () =>
            {
                const actual = Function.prototype.isPrototypeOf(Object);
                assert.isTrue(actual);
            },
        );

        it
        (
            'returns true when this is in the argument prototype chain',
            () =>
            {
                const actual = Object.prototype.isPrototypeOf(Object);
                assert.isTrue(actual);
            },
        );

        maybeIt
        (
            typeof document !== 'undefined',
            'returns true with document.all',
            () =>
            {
                const actual = Object.prototype.isPrototypeOf(document.all);
                assert.isTrue(actual);
            },
        );

        describe
        (
            'works with subtypes',
            () =>
            {
                function test(classes)
                {
                    class A
                    { }

                    class B
                    { }

                    class C extends classes(A, B)
                    { }

                    class D
                    { }

                    class E extends classes(C, D)
                    { }

                    assert.isTrue(A.isPrototypeOf(C));
                    assert.isTrue(B.isPrototypeOf(C));
                    assert.isFalse(C.isPrototypeOf(C));
                    assert.isFalse(D.isPrototypeOf(C));
                    assert.isFalse(E.isPrototypeOf(C));
                    assert(Function.prototype.isPrototypeOf(C));
                    assert(Object.prototype.isPrototypeOf(C));
                }

                it('in the same realm', () => test(classes));

                maybeIt
                (
                    newRealm,
                    'in another realm',
                    async () =>
                    {
                        const { classes: classesʼ } = await newRealm(true);
                        test(classesʼ);
                    },
                );
            },
        );

        describe
        (
            'works with subprototypes',
            () =>
            {
                function test(classes)
                {
                    class A
                    { }

                    class B
                    { }

                    class C extends classes(A, B)
                    { }

                    class D
                    { }

                    class E extends classes(C, D)
                    { }

                    const c = new C();
                    assert.isTrue(A.prototype.isPrototypeOf(c));
                    assert.isTrue(B.prototype.isPrototypeOf(c));
                    assert.isTrue(C.prototype.isPrototypeOf(c));
                    assert.isFalse(D.prototype.isPrototypeOf(c));
                    assert.isFalse(E.prototype.isPrototypeOf(c));
                    assert.isTrue(Object.prototype.isPrototypeOf(c));
                }

                it('in the same realm', () => test(classes));

                maybeIt
                (
                    newRealm,
                    'in another realm',
                    async () =>
                    {
                        const { classes: classesʼ } = await newRealm(true);
                        test(classesʼ);
                    },
                );
            },
        );
    },
);
