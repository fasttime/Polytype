/* eslint-env mocha */
/* global assert, classes */

'use strict';

describe
(
    'new.target in superconstructor',
    ()  =>
    {
        let _superNewTarget;
        let _SubClass;

        beforeEach
        (
            () =>
            {
                class SuperClass
                {
                    constructor()
                    {
                        _superNewTarget = new.target;
                    }
                }

                class InterClass extends classes(SuperClass)
                { }

                _SubClass =
                class extends classes(InterClass)
                { };
                new _SubClass();
                return _superNewTarget;
            },
        );

        afterEach
        (
            () =>
            {
                _superNewTarget = _SubClass = undefined;
            },
        );

        it
        (
            'has expected own properties',
            () =>
            assert.hasOwnPropertyDescriptors
            (
                _superNewTarget,
                {
                    prototype:
                    {
                        configurable: false,
                        enumerable: false,
                        value: _superNewTarget.prototype,
                        writable: false,
                    },
                },
            ),
        );

        it
        (
            'has expected property \'prototype\'',
            () => assert.instanceOf(_superNewTarget.prototype, _SubClass),
        );

        it
        (
            'has expected prototype',
            () => assert(_SubClass.isPrototypeOf(_superNewTarget)),
        );

        it('is not extensible', () => assert.isNotExtensible(_superNewTarget));

        it
        (
            'cannot be called',
            () =>
            {
                assert.throwsTypeError(_superNewTarget, 'Operation not supported');
                // eslint-disable-next-line new-cap
                assert.throwsTypeError(() => new _superNewTarget(), 'Operation not supported');
            },
        );
    },
);
