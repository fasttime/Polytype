/* eslint no-alert: off */
/* eslint-env mocha, shared-node-browser */
/* global __dirname, alert, chai, document, location, process, reimport, require */

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
    if (typeof module !== 'undefined')
    {
        const { readFile }                                      = require('fs/promises');
        const { resolve }                                       = require('path');
        const { SourceTextModule, createContext, runInContext } = require('vm');

        function loadPolytypeBase()
        {
            const path = require.resolve(polytypePath);
            delete require.cache[path];
            const returnValue = require(path);
            return returnValue;
        }

        const polytypePath =
        getPolytypePath(process.argv[2], ['.cjs', '.js', '.min.js', '.mjs', '.min.mjs']);
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
                const { wrap } = require('module');

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
            {
                const postrequire = require('postrequire');

                const modulePath = resolve(__dirname, polytypePath);
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

        const urlParams = new URLSearchParams(location.search);
        const extname = urlParams.get('extname');
        let loadPolytypeInIFrame;
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
            loadPolytype = () => loadScript(document, polytypePath);
            loadPolytypeInIFrame = loadScript;
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
