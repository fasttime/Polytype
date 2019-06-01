/* eslint-env mocha */
/* global chai, document, global, require, self */

'use strict';

(global =>
{
    function createFunctionWithGetPrototypeCount(name)
    {
        const fn = Function();
        if (name !== undefined)
            Object.defineProperty(fn, 'name', { value: name });
        Object.defineProperty(fn, 'getPrototypeCount', { value: 0, writable: true });
        const get =
        (target, prop, receiver) =>
        {
            if (prop === 'prototype')
                ++target.getPrototypeCount;
            const value = Reflect.get(target, prop, receiver);
            return value;
        };
        const proxy = new Proxy(fn, { get });
        return proxy;
    }

    function createNullPrototypeFunction(name)
    {
        const fn = Function();
        if (name !== undefined)
            Object.defineProperty(fn, 'name', { value: name });
        fn.prototype = null;
        return fn;
    }

    function exactRegExp(...strs)
    {
        const patterns = strs.map(str => `${str.replace(/[.()[]/g, '\\$&')}`);
        const pattern = patterns.length > 1 ? `(?:${patterns.join('|')})` : patterns[0];
        const regExp = RegExp(`^${pattern}$`);
        return regExp;
    }

    const maybeDescribe = (condition, ...args) => (condition ? describe : describe.skip)(...args);

    const maybeIt = (condition, ...args) => (condition ? it : it.skip)(...args);

    function setupTestData(classes)
    {
        const callData = { };

        class A
        {
            constructor()
            {
                callData.A =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    newTarget: new.target,
                    this: this,
                };
            }
            aMethod()
            { }
            get aGetOnly()
            {
                const value = Symbol();
                callData.A =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    getter: 'aGetOnly',
                    this: this,
                    value,
                };
                return value;
            }
            set aSetOnly(arg)
            {
                callData.A =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    setter: 'aSetOnly',
                    this: this,
                };
            }
            static aStatic()
            { }
            static get aStaticGet()
            {
                const value = Symbol();
                callData.A =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    getter: 'aStaticGet',
                    this: this,
                    value,
                };
                return value;
            }
            static set aStaticSet(arg)
            {
                callData.A =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    setter: 'aStaticSet',
                    this: this,
                };
            }
            someMethod()
            {
                return this.aProp;
            }
            static someStaticMethod()
            {
                return this.aProp;
            }
        }

        class B
        {
            constructor()
            {
                callData.B =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    newTarget: new.target,
                    this: this,
                };
            }
            bMethod()
            { }
            get bGetOnly()
            {
                const value = Symbol();
                callData.B =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    getter: 'bGetOnly',
                    this: this,
                    value,
                };
                return value;
            }
            set bSetOnly(arg)
            {
                callData.B =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    setter: 'bSetOnly',
                    this: this,
                };
            }
            static bStatic()
            { }
            static get bStaticGet()
            {
                const value = Symbol();
                callData.B =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    getter: 'bStaticGet',
                    this: this,
                    value,
                };
                return value;
            }
            static set bStaticSet(arg)
            {
                callData.B =
                {
                    args: [...arguments], // eslint-disable-line prefer-rest-params
                    setter: 'bStaticSet',
                    this: this,
                };
            }
            someMethod()
            {
                return this.bProp;
            }
            static someStaticMethod()
            {
                return this.bProp;
            }
        }

        class C extends classes(A, B)
        {
            getSuper(type)
            {
                return super.class(type);
            }
            static getStaticSuper(type)
            {
                return super.class(type);
            }
            static newStaticSuper(type)
            {
                const superClass = super.class;
                new superClass(type); // eslint-disable-line new-cap
            }
            newSuper(type)
            {
                const superClass = super.class;
                new superClass(type); // eslint-disable-line new-cap
            }
        }

        class D
        { }

        class E extends classes(C, D)
        {
            getSuper(type)
            {
                return super.class(type);
            }
            static getStaticSuper(type)
            {
                return super.class(type);
            }
        }

        const result = { A, B, C, E, callData };
        return result;
    }

    const { Assertion, assert } = typeof chai !== 'undefined' ? chai : require('chai');
    assert.hasOwnPropertyDescriptors =
    (obj, expDescs, msg) =>
    {
        const keys = Reflect.ownKeys(expDescs);
        for (const key of keys)
        {
            new Assertion(obj, msg, assert.hasOwnPropertyDescriptors, true)
            .ownPropertyDescriptor(key, expDescs[key]);
        }
    };

    let loadPolytype;
    {
        const POLYTYPE_PATH = '../lib/polytype.js';

        if (typeof module !== 'undefined')
        {
            loadPolytype =
            () =>
            {
                const path = require.resolve(POLYTYPE_PATH);
                delete require.cache[path];
                require(path);
            };
        }
        else
        {
            loadPolytype =
            () =>
            {
                const promise =
                new Promise
                (
                    resolve =>
                    {
                        {
                            const script =
                            document.querySelector(`script[src="${POLYTYPE_PATH}"]`);
                            if (script)
                                script.parentNode.removeChild(script);
                        }
                        {
                            const script = document.createElement('script');
                            script.onload = resolve;
                            script.src = POLYTYPE_PATH;
                            document.head.appendChild(script);
                        }
                    },
                );
                return promise;
            };
        }
    }
    loadPolytype();

    Object.assign
    (
        global,
        {
            assert,
            createFunctionWithGetPrototypeCount,
            createNullPrototypeFunction,
            exactRegExp,
            loadPolytype,
            maybeDescribe,
            maybeIt,
            setupTestData,
        },
    );
}
)(typeof self === 'undefined' ? global : self);
