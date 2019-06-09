/* eslint no-alert: off, no-process-env: off */
/* eslint-env mocha, shared-node-browser */
/* global __dirname, alert, chai, document, global, location, process, require, self */

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

    function getPolytypePath(extname, allowedExtnames)
    {
        if (extname == null)
            [extname] = allowedExtnames;
        else
        {
            if (!allowedExtnames.includes(extname))
                throw Error(`Unsupported extension ${JSON.stringify(extname)}`);
        }
        const polytypePath = `../lib/polytype${extname}`;
        return polytypePath;
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
    let polytypeMode;
    if (typeof module !== 'undefined')
    {
        const path = require('path');

        function loadPolytypeBase()
        {
            const path = require.resolve(polytypePath);
            delete require.cache[path];
            const returnValue = require(path);
            return returnValue;
        }

        const polytypePath =
        getPolytypePath(process.env.extname, ['.cjs', '.js', '.min.js', '.mjs', '.min.mjs']);
        if (polytypePath.endsWith('.js'))
        {
            loadPolytype = loadPolytypeBase;
            polytypeMode = 'global';
        }
        else if (polytypePath.endsWith('.cjs'))
        {
            loadPolytype =
            () =>
            {
                const { defineGlobally } = loadPolytypeBase();
                defineGlobally();
            };
            polytypeMode = 'module';
        }
        else if (polytypePath.endsWith('.mjs'))
        {
            const subrequire = require('subrequire');

            const modulePath = path.resolve(__dirname, '../lib/polytype.mjs');
            loadPolytype =
            async () =>
            {
                const reimport = subrequire('./reimport.cjs');

                const { defineGlobally } = await reimport(modulePath);
                defineGlobally();
            };
            polytypeMode = 'module';
        }
    }
    else
    {
        const ALLOWED_EXTENSIONS = ['.js', '.min.js'];
        const urlParams = new URLSearchParams(location.search);
        const extname = urlParams.get('extname');
        let polytypePath;
        try
        {
            polytypePath = getPolytypePath(extname, ALLOWED_EXTENSIONS);
        }
        catch ({ message })
        {
            polytypePath = getPolytypePath(null, ALLOWED_EXTENSIONS);
            alert(message);
        }
        loadPolytype =
        () =>
        new Promise
        (
            (resolve, reject) =>
            {
                {
                    const script = document.querySelector(`script[src="${polytypePath}"]`);
                    if (script)
                        script.parentNode.removeChild(script);
                }
                {
                    const script = document.createElement('script');
                    script.onerror = reject;
                    script.onload = resolve;
                    script.src = polytypePath;
                    document.head.appendChild(script);
                }
            },
        );
    }

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
            polytypeMode,
            setupTestData,
        },
    );
}
)(typeof self === 'undefined' ? global : self);
