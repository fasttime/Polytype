/* eslint no-alert: off */
/* eslint-env mocha, shared-node-browser */
/* global __dirname, alert, chai, document, global, location, process, reimport, require, self */

'use strict';

(global =>
{
    function backupGlobals()
    {
        const descriptorMapObj =
        {
            self: Object.getOwnPropertyDescriptor(global, 'self'),
            global: Object.getOwnPropertyDescriptor(global, 'global'),
        };
        let classesDescriptor;
        let getPrototypeListOfDescriptor;
        let fnHasInstanceDescriptor;
        let objHasInstanceDescriptor;
        let isPrototypeOfDescriptor;
        before
        (
            () =>
            {
                classesDescriptor =
                Object.getOwnPropertyDescriptor(global, 'classes');
                getPrototypeListOfDescriptor =
                Object.getOwnPropertyDescriptor(Object, 'getPrototypeListOf');
                fnHasInstanceDescriptor =
                Object.getOwnPropertyDescriptor(Function, Symbol.hasInstance);
                objHasInstanceDescriptor =
                Object.getOwnPropertyDescriptor(Object, Symbol.hasInstance);
                isPrototypeOfDescriptor =
                Object.getOwnPropertyDescriptor(Object.prototype, 'isPrototypeOf');
            },
        );
        afterEach
        (
            () =>
            {
                for (const [key, descriptor] of Object.entries(descriptorMapObj))
                {
                    if (descriptor)
                        Object.defineProperty(global, key, descriptor);
                    else
                        delete global[key];
                }
                Object.defineProperty(global, 'classes', classesDescriptor);
                Object.defineProperties
                (
                    Function,
                    {
                        [Symbol.hasInstance]: fnHasInstanceDescriptor,
                    },
                );
                Object.defineProperties
                (
                    Object,
                    {
                        getPrototypeListOf: getPrototypeListOfDescriptor,
                        [Symbol.hasInstance]: objHasInstanceDescriptor,
                    },
                );
                // eslint-disable-next-line no-extend-native
                Object.defineProperty(Object.prototype, 'isPrototypeOf', isPrototypeOfDescriptor);
            },
        );
        return global;
    }

    function createFunctionFromConstructor(Function)
    {
        const fn = Function();
        // Workaround for a bug in Safari.
        Object.setPrototypeOf(fn.prototype, Object.getPrototypeOf(Function.prototype));
        return fn;
    }

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

    function getExtension(path)
    {
        const extension = path.replace(/.*(?=\..*$)/, '');
        return extension;
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
            set aSetOnly(arg) // eslint-disable-line accessor-pairs
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
            static set aStaticSet(arg) // eslint-disable-line accessor-pairs
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
            set bSetOnly(arg) // eslint-disable-line accessor-pairs
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
            static set bStaticSet(arg) // eslint-disable-line accessor-pairs
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
    let newRealm;
    let polytypeMode;
    if (typeof module !== 'undefined')
    {
        const path                  = require('path');
        const { runInNewContext }   = require('vm');

        function loadPolytypeBase()
        {
            const path = require.resolve(polytypePath);
            delete require.cache[path];
            const returnValue = require(path);
            return returnValue;
        }

        newRealm = () => runInNewContext('this');
        const polytypePath =
        getPolytypePath(process.argv[2], ['.cjs', '.js', '.min.js', '.mjs', '.min.mjs']);
        const extension = getExtension(polytypePath);
        switch (extension)
        {
        case '.js':
            loadPolytype = loadPolytypeBase;
            polytypeMode = 'global';
            break;
        case '.cjs':
            loadPolytype =
            () =>
            {
                const { defineGlobally } = loadPolytypeBase();
                defineGlobally();
                return defineGlobally;
            };
            polytypeMode = 'module';
            break;
        case '.mjs':
            {
                const postrequire = require('postrequire');

                const modulePath = path.resolve(__dirname, '../lib/polytype.mjs');
                loadPolytype =
                async () =>
                {
                    const reimport = postrequire('./reimport');

                    const { defineGlobally } = await reimport(modulePath);
                    defineGlobally();
                    return defineGlobally;
                };
            }
            polytypeMode = 'module';
            break;
        }
    }
    else
    {
        const ALLOWED_EXTENSIONS = ['.js', '.min.js', '.mjs', '.min.mjs'];

        newRealm =
        () =>
        new Promise
        (
            (resolve, reject) =>
            {
                const iframe = document.createElement('iframe');
                iframe.onerror =
                ({ message }) =>
                {
                    reject(message);
                    iframe.remove();
                };
                iframe.onload =
                () =>
                {
                    const { contentWindow: { Function, Object } } = iframe;
                    resolve({ Function, Object });
                    iframe.remove();
                };
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            },
        );
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
        const extension = getExtension(polytypePath);
        switch (extension)
        {
        case '.js':
            loadPolytype =
            () =>
            new Promise
            (
                (resolve, reject) =>
                {
                    const script = document.createElement('script');
                    script.onerror =
                    ({ message }) =>
                    {
                        reject(message);
                        script.remove();
                    };
                    script.onload =
                    () =>
                    {
                        resolve();
                        script.remove();
                    };
                    script.src = polytypePath;
                    document.head.appendChild(script);
                },
            );
            break;
        case '.mjs':
            {
                let counter = 0;
                loadPolytype =
                async () =>
                {
                    const url = `${polytypePath}?${++counter}`;
                    const { defineGlobally } = await reimport(url);
                    defineGlobally();
                    return defineGlobally;
                };
            }
            break;
        }
    }

    Object.assign
    (
        global,
        {
            assert,
            backupGlobals,
            createFunctionFromConstructor,
            createFunctionWithGetPrototypeCount,
            createNullPrototypeFunction,
            exactRegExp,
            loadPolytype,
            maybeDescribe,
            maybeIt,
            newRealm,
            polytypeMode,
            setupTestData,
        },
    );
}
)(typeof self === 'undefined' ? global : self);
