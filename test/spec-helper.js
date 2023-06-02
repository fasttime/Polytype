/* eslint no-alert: off */
/* eslint-env mocha, shared-node-browser */
/* global Deno alert chai document location process require */

'use strict';

{
    function backupGlobals()
    {
        const globalThisDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'globalThis');

        let bindDescriptor;
        let classesDescriptor;
        let fnHasInstanceDescriptor;
        let getPrototypeListOfDescriptor;
        let isPrototypeOfDescriptor;
        let objHasInstanceDescriptor;

        before
        (
            () =>
            {
                classesDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'classes');
                fnHasInstanceDescriptor =
                Object.getOwnPropertyDescriptor(Function, Symbol.hasInstance);
                bindDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, 'bind');
                getPrototypeListOfDescriptor =
                Object.getOwnPropertyDescriptor(Object, 'getPrototypeListOf');
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
                setPropertyDescriptor(globalThis, 'globalThis', globalThisDescriptor);
                Object.defineProperty(globalThis, 'classes', classesDescriptor);
                setPropertyDescriptor(Function, Symbol.hasInstance, fnHasInstanceDescriptor);
                // eslint-disable-next-line no-extend-native
                Object.defineProperty(Function.prototype, 'bind', bindDescriptor);
                setPropertyDescriptor(Object, 'getPrototypeListOf', getPrototypeListOfDescriptor);
                setPropertyDescriptor(Object, Symbol.hasInstance, objHasInstanceDescriptor);
                // eslint-disable-next-line no-extend-native
                Object.defineProperty(Object.prototype, 'isPrototypeOf', isPrototypeOfDescriptor);
            },
        );
    }

    function createDeceptiveObject(result = [42])
    {
        const prototypesInquirySymbol = Symbol.for('Polytype inquiry: prototypes');
        const thisSupplierInquirySymbol = Symbol.for('Polytype inquiry: this supplier');
        const obj =
        {
            __proto__:
            {
                get [prototypesInquirySymbol]()
                {
                    this.result = result;
                    return undefined;
                },
                get [thisSupplierInquirySymbol]()
                {
                    this.result = result;
                    return undefined;
                },
            },
        };
        return obj;
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
        const patterns = strs.map(str => `${str.replace(/[.()[|]/g, '\\$&')}`);
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

    async function reloadPolytypeESM(polytypeURL)
    {
        const { default: reimport } = await import('./reimport.mjs');
        const { defineGlobally } = await reimport(polytypeURL);
        defineGlobally();
        return defineGlobally;
    }

    function setPropertyDescriptor(obj, key, descriptor)
    {
        if (descriptor)
            Object.defineProperty(obj, key, descriptor);
        else
            delete obj[key];
    }

    const { Assertion, assert } = typeof chai !== 'undefined' ? chai : require('chai');
    assert.hasOwnPropertyDescriptor =
    (obj, key, expectedDescriptor, msg) =>
    {
        new Assertion(obj, msg, assert.hasOwnPropertyDescriptor, true)
        .ownPropertyDescriptor(key, expectedDescriptor);
    };
    assert.hasOwnPropertyDescriptors =
    (obj, expectedDescriptors, msg) =>
    {
        const actualKeys = Reflect.ownKeys(obj);
        const expectedKeys = Reflect.ownKeys(expectedDescriptors);
        assert.sameMembers(actualKeys, expectedKeys);
        for (const key of expectedKeys)
        {
            new Assertion(obj, msg, assert.hasOwnPropertyDescriptors, true)
            .ownPropertyDescriptor(key, expectedDescriptors[key]);
        }
    };
    assert.throwsTypeError =
    (fn, expErrorMsg, msg) =>
    {
        const expected =
        typeof expErrorMsg === 'string' ?
        exactRegExp(expErrorMsg) :
        Array.isArray(expErrorMsg) ? exactRegExp(...expErrorMsg) : expErrorMsg;
        new Assertion(fn, msg, assert.throwsTypeError, true).throws(TypeError, expected);
    };

    let loadPolytype;
    let newRealm;
    let polytypeMode;
    if (typeof Deno !== 'undefined')
    {
        const [extname] = Deno.args;
        const polytypeURL = getPolytypePath(extname, ['.js', '.min.js', '.mjs', '.min.mjs']);
        const extension = getExtension(polytypeURL);
        switch (extension)
        {
        case '.js':
            loadPolytype = () => import(polytypeURL);
            break;
        case '.mjs':
            loadPolytype = () => reloadPolytypeESM(polytypeURL);
            break;
        }
    }
    else if (typeof module !== 'undefined')
    {
        const { readFile }                                      = require('node:fs/promises');
        const { SourceTextModule, createContext, runInContext } = require('node:vm');

        function loadPolytypeBase()
        {
            const path = require.resolve(polytypePath);
            delete require.cache[path];
            const returnValue = require(path);
            return returnValue;
        }

        const [,, extname] = process.argv;
        const polytypePath =
        getPolytypePath(extname, ['.cjs', '.js', '.min.js', '.mjs', '.min.mjs']);
        const extension = getExtension(polytypePath);
        {
            const path = require.resolve(polytypePath);
            const codePromise = readFile(path, 'utf8');
            newRealm =
            async includePolytype =>
            {
                const context = createContext();
                if (includePolytype)
                    await runInVM(await codePromise, context);
                const globalThat = runInContext('this', context);
                return globalThat;
            };
        }
        let runInVM;
        switch (extension)
        {
        case '.js':
            loadPolytype = loadPolytypeBase;
            polytypeMode = 'global';
            runInVM = runInContext;
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
            {
                const { wrap } = require('node:module');

                runInVM =
                (code, context) =>
                {
                    const wrappedCode = wrap(code);
                    const exports = { };
                    runInContext(wrappedCode, context)(exports);
                    exports.defineGlobally();
                };
            }
            break;
        case '.mjs':
            loadPolytype = () => reloadPolytypeESM(polytypePath);
            polytypeMode = 'module';
            runInVM =
            async (code, context) =>
            {
                const sourceTextModule = new SourceTextModule(code, { context });
                await sourceTextModule.link(() => null);
                await sourceTextModule.evaluate();
                sourceTextModule.namespace.defineGlobally();
            };
            break;
        }
    }
    else
    {
        const ALLOWED_EXTENSIONS = ['.js', '.min.js', '.mjs', '.min.mjs'];

        const loadIFrame =
        iFrame =>
        new Promise
        (
            (resolve, reject) =>
            {
                iFrame.onerror = reject;
                iFrame.onload = () => resolve(iFrame.contentWindow);
                iFrame.style.display = 'none';
                document.body.appendChild(iFrame);
            },
        );

        const loadESModule =
        (document, src) =>
        new Promise
        (
            (resolve, reject) =>
            {
                const script = document.createElement('script');
                document.reject =
                ({ message }) =>
                {
                    reject(message);
                    script.remove();
                };
                document.resolve =
                () =>
                {
                    resolve();
                    script.remove();
                };
                script.type = 'module';
                script.innerText =
                `
                (async () =>
                {
                    try
                    {
                        const { defineGlobally } = await import(${JSON.stringify(src)});
                        defineGlobally();
                        document.resolve();
                    }
                    catch ({ message })
                    {
                        document.reject(message);
                    }
                }
                )();
                `;
                document.head.appendChild(script);
            },
        );

        const loadScript =
        (document, src) =>
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
                script.src = src;
                document.head.appendChild(script);
            },
        );

        newRealm =
        async includePolytype =>
        {
            const iFrame = document.createElement('iframe');
            try
            {
                const window = await loadIFrame(iFrame);
                if (includePolytype)
                    await loadPolytypeInIFrame(window.document, polytypePath);
                return window;
            }
            finally
            {
                setTimeout(() => iFrame.remove());
            }
        };

        let polytypePath;
        const urlParams = new URLSearchParams(location.search);
        const extname = urlParams.get('extname');
        try
        {
            polytypePath = getPolytypePath(extname, ALLOWED_EXTENSIONS);
        }
        catch ({ message })
        {
            polytypePath = getPolytypePath(null, ALLOWED_EXTENSIONS);
            alert(message);
        }
        let loadPolytypeInIFrame;
        const extension = getExtension(polytypePath);
        switch (extension)
        {
        case '.js':
            loadPolytype = () => loadScript(document, polytypePath);
            loadPolytypeInIFrame = loadScript;
            break;
        case '.mjs':
            loadPolytype = () => reloadPolytypeESM(polytypePath);
            loadPolytypeInIFrame = loadESModule;
            break;
        }
    }

    Object.assign
    (
        globalThis,
        {
            assert,
            backupGlobals,
            createDeceptiveObject,
            createFunctionFromConstructor,
            createFunctionWithGetPrototypeCount,
            createNullPrototypeFunction,
            loadPolytype,
            maybeDescribe,
            maybeIt,
            newRealm,
            polytypeMode,
        },
    );
}
