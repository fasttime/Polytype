// Proxymi – https://github.com/fasttime/Proxymi

'use strict';

(global =>
{
    if (global.hasOwnProperty('classes'))
        return;

    const _Function_prototype               = Function.prototype;
    const _Map                              = Map;
    const _Object                           = Object;
    const _Object_create                    = _Object.create;
    const _Object_defineProperties          = _Object.defineProperties;
    const _Object_defineProperty            = _Object.defineProperty;
    const _Object_getOwnPropertyDescriptors = _Object.getOwnPropertyDescriptors;
    const _Object_getPrototypeOf            = _Object.getPrototypeOf;
    const _Object_keys                      = _Object.keys;
    const _Object_prototype                 = _Object.prototype;
    const _Object_setPrototypeOf            = _Object.setPrototypeOf;
    const _Proxy                            = Proxy;
    const _Reflect                          = Reflect;
    const _Reflect_construct                = _Reflect.construct;
    const _Reflect_get                      = _Reflect.get;
    const _Reflect_set                      = _Reflect.set;
    const _Set                              = Set;
    const _String                           = String;
    const _Symbol_hasInstance               = Symbol.hasInstance;
    const _TypeError                        = TypeError;

    const bindCall = callable => _Function_prototype.call.bind(callable);

    const _Function_prototype_bind_call =
    bindCall(_Function_prototype.bind);

    const _Function_prototype_hasInstance_call =
    bindCall(_Function_prototype[_Symbol_hasInstance]);

    const _Object_prototype_hasOwnProperty_call =
    bindCall(_Object_prototype.hasOwnProperty);

    const _Object_prototype_valueOf_call =
    bindCall(_Object_prototype.valueOf);

    function checkDuplicateSuperType(typeSet, type)
    {
        if (typeSet.has(type))
        {
            const message = `Duplicate superclass ${nameOfType(type)}`;
            throw _TypeError(message);
        }
    }

    function checkNonCallableArgument(type)
    {
        if (!isCallable(type))
            throw _TypeError('Argument is not a function');
    }

    const { classes } = { classes: (...types) => classesImpl(types) };

    function classesImpl(types)
    {
        if (!types.length)
            throw _TypeError('No superclasses specified');
        const typeSet = new _Set();
        const prototypeSet = new _Set();
        for (const type of types)
        {
            checkDuplicateSuperType(typeSet, type);
            if (!isConstructor(type))
            {
                const message = `${nameOfType(type)} is not a constructor`;
                throw _TypeError(message);
            }
            const { prototype } = type;
            if (isNonNullPrimitive(prototype))
            {
                const message =
                `Property 'prototype' of ${nameOfType(type)} is not an object or null`;
                throw _TypeError(message);
            }
            typeSet.add(type);
            if (prototype !== null)
                prototypeSet.add(prototype);
        }
        const constructorProxy = createConstructorProxy(typeSet, prototypeSet);
        installHasInstance(types);
        return constructorProxy;
    }

    const commonHandlerPrototype = { setPrototypeOf: () => false };

    const constructorHandlerPrototype =
    {
        __proto__: commonHandlerPrototype,
        apply:
        () =>
        {
            throw _TypeError('Constructor cannot be invoked without \'new\'');
        },
    };

    function createConstructorProxy(typeSet, prototypeSet)
    {
        const superTypeSelector = createSuperTypeSelector(typeSet);
        const getConstructorName = createGetConstructorName(typeSet);
        const superPrototypeSelector = createSuperPrototypeSelector(prototypeSet);
        const constructorTarget = createConstructorTarget(typeSet);
        const constructorProxy =
        createProxy(constructorTarget, typeSet, constructorHandlerPrototype);
        const prototypeTarget =
        _Object_create
        (
            null,
            {
                class: describeDataProperty(superPrototypeSelector),
                constructor: describeDataProperty(constructorProxy, true, false, true),
            }
        );
        const prototypeProxy = createProxy(prototypeTarget, prototypeSet, commonHandlerPrototype);
        const constructorProperties =
        {
            class: describeDataProperty(superTypeSelector),
            name: { get: getConstructorName, configurable: true },
            prototype: describeDataProperty(prototypeProxy),
        };
        _Object_defineProperties(constructorTarget, constructorProperties);
        return constructorProxy;
    }

    function createConstructorTarget(typeSet)
    {
        const constructorTarget =
        function (...args)
        {
            const typeToSuperArgsMap = createTypeToSuperArgsMap(typeSet, args);
            const newTarget = new.target;
            for (const type of typeSet)
            {
                let superArgs = typeToSuperArgsMap.get(type);
                if (superArgs === undefined)
                    superArgs = emptyArray;
                const newThis = _Reflect_construct(type, superArgs, newTarget);
                const descriptorMapObj = _Object_getOwnPropertyDescriptors(newThis);
                const props = _Object_keys(descriptorMapObj);
                for (const prop of props)
                {
                    if (_Object_prototype_hasOwnProperty_call(this, prop))
                        delete descriptorMapObj[prop];
                }
                _Object_defineProperties(this, descriptorMapObj);
            }
        };
        _Object_setPrototypeOf(constructorTarget, null);
        return constructorTarget;
    }

    const createGetConstructorName =
    typeSet => () => `(${[...typeSet].map(({ name }) => _String(name))})`;

    function createHandler(objs, handlerPrototype)
    {
        const handler =
        {
            __proto__: handlerPrototype,
            get(target, prop, receiver)
            {
                const obj = objs.find(propFilter(prop));
                if (obj !== undefined)
                {
                    const value = _Reflect_get(obj, prop, receiver);
                    return value;
                }
            },
            has: (target, prop) => objs.some(propFilter(prop)),
            set(target, prop, value, receiver)
            {
                const obj = objs.find(propFilter(prop));
                if (obj !== undefined)
                {
                    const success = _Reflect_set(obj, prop, value, receiver);
                    return success;
                }
                defineDataProperty(receiver, prop, value, true, true, true);
                return true;
            },
        };
        return handler;
    }

    function createListFromArrayLike(arrayLike)
    {
        // eslint-disable-next-line prefer-spread
        const list = ((...args) => args).apply(null, arrayLike);
        return list;
    }

    function createProxy(target, prototypeSet, handlerPrototype)
    {
        const handler = createHandler([target, ...prototypeSet], handlerPrototype);
        const proxy = new _Proxy(target, handler);
        prototypeSetMap.set(proxy, prototypeSet);
        return proxy;
    }

    function createSuper(obj, superTarget)
    {
        function resolve(reflectCall)
        {
            const result = reflectCall();
            _Object_setPrototypeOf(superObj, superTarget);
            return result;
        }

        const superHandler =
        {
            get: (target, prop) => resolve(() => _Reflect_get(obj, prop, superTarget)),
            set:
            (target, prop, value) => resolve(() => _Reflect_set(obj, prop, value, superTarget)),
        };
        const superProxy = new _Proxy(superTarget, superHandler);
        const superObj = _Object_create(superProxy);
        return superObj;
    }

    function createSuperPrototypeSelector(prototypeSet)
    {
        const { class: superPrototypeSelector } =
        class
        {
            static class(type)
            {
                checkNonCallableArgument(type);
                const { prototype } = type;
                if (!prototypeSet.has(prototype))
                {
                    const message =
                    isObject(prototype) ?
                    'Property \'prototype\' of argument does not match any direct superclass' :
                    'Property \'prototype\' of argument is not an object';
                    throw _TypeError(message);
                }
                const superObj = createSuper(prototype, this);
                return superObj;
            }
        };
        return superPrototypeSelector;
    }

    function createSuperTypeSelector(typeSet)
    {
        const { class: superTypeSelector } =
        class
        {
            static class(type)
            {
                if (!typeSet.has(type))
                {
                    checkNonCallableArgument(type);
                    throw _TypeError('Argument is not a direct superclass');
                }
                const superObj = createSuper(type, this);
                return superObj;
            }
        };
        return superTypeSelector;
    }

    function createTypeToSuperArgsMap(typeSet, args)
    {
        const typeToSuperArgsMap = new _Map();
        let usingPlainObjects;
        let typeIterator;
        const usePlainObjects =
        value =>
        {
            if (usingPlainObjects === !value)
                throw _TypeError('Mixed argument styles');
            usingPlainObjects = value;
        };
        for (const arg of args)
        {
            if (isNonUndefinedPrimitive(arg))
                throw _TypeError('Invalid arguments');
            let type;
            let superArgsSrc;
            if (arg !== undefined && isObject(type = arg.super))
            {
                usePlainObjects(true);
                checkDuplicateSuperType(typeToSuperArgsMap, type);
                if (!typeSet.has(type))
                {
                    const message = `${nameOfType(type)} is not a direct superclass`;
                    throw _TypeError(message);
                }
                superArgsSrc = arg.arguments;
                if (isNonUndefinedPrimitive(superArgsSrc))
                {
                    const message = `Invalid arguments for superclass ${nameOfType(type)}`;
                    throw _TypeError(message);
                }
            }
            else
            {
                usePlainObjects(false);
                if (!typeIterator)
                    typeIterator = typeSet.values();
                type = typeIterator.next().value;
                superArgsSrc = arg;
            }
            const superArgs =
            superArgsSrc !== undefined ? createListFromArrayLike(superArgsSrc) : undefined;
            typeToSuperArgsMap.set(type, superArgs);
        }
        return typeToSuperArgsMap;
    }

    const defineDataProperty =
    (obj, prop, value, writable, enumerable, configurable) =>
    _Object_defineProperty
    (obj, prop, describeDataProperty(value, writable, enumerable, configurable));

    const defineHasInstanceProperty =
    type => defineDataProperty(type, _Symbol_hasInstance, hasInstance, true, false, true);

    const describeDataProperty =
    (value, writable, enumerable, configurable) => ({ value, writable, enumerable, configurable });

    const emptyArray = [];

    const { getPrototypeListOf } = { getPrototypeListOf: obj => getPrototypesOf(obj, true) };

    function getPrototypesOf(obj, asNewArray)
    {
        let prototypes = prototypeSetMap.get(obj);
        if (prototypes)
        {
            if (asNewArray)
                prototypes = [...prototypes];
        }
        else
        {
            const prototype = _Object_getPrototypeOf(obj);
            prototypes = prototype === null ? [] : [prototype];
        }
        return prototypes;
    }

    const { [_Symbol_hasInstance]: hasInstance } =
    class
    {
        static [_Symbol_hasInstance](obj)
        {
            hasInstancePending = true;
            try
            {
                if (isCallable(this))
                {
                    const result = _Function_prototype_hasInstance_call(this, obj);
                    if (!hasInstancePending)
                        return result;
                    if (result || isObject(obj) && isInPrototypeTree(this.prototype, obj))
                        return true;
                }
                return false;
            }
            finally
            {
                hasInstancePending = false;
            }
        }
    };

    let hasInstancePending = false;

    function installHasInstance(types)
    {
        let installed = false;
        for (const type of types)
        {
            if (type !== _Function_prototype && isObject(type))
            {
                installed = true;
                const superTypes = getPrototypesOf(type);
                if (!installHasInstance(superTypes))
                    defineHasInstanceProperty(type);
            }
        }
        return installed;
    }

    const isCallable = obj => typeof obj === 'function';

    function isConstructor(obj)
    {
        if (isCallable(obj))
        {
            const boundFn = _Function_prototype_bind_call(obj);
            defineDataProperty(boundFn, 'prototype', null);
            try
            {
                // A standalone class expression would be stripped off by uglify-es.
                // The IIFE preserves the class expression along with its side effects.
                (
                    () =>
                    class extends boundFn
                    { }
                )
                ();
                return true;
            }
            catch (error)
            { }
        }
        return false;
    }

    function isInPrototypeTree(target, obj)
    {
        const prototypes = getPrototypesOf(obj);
        for (const prototype of prototypes)
        {
            if (prototype === target || isInPrototypeTree(target, prototype))
                return true;
        }
        return false;
    }

    const isNonNullOrUndefinedPrimitive = obj => !objOrNullOrUndefinedTypes.includes(typeof obj);

    const isNonNullPrimitive = obj => obj === undefined || isNonNullOrUndefinedPrimitive(obj);

    const isNonUndefinedPrimitive = obj => obj === null || isNonNullOrUndefinedPrimitive(obj);

    const isObject = obj => obj !== null && !isNonNullPrimitive(obj);

    const { isPrototypeOf } =
    class
    {
        static isPrototypeOf(obj)
        {
            if (isObject(obj))
            {
                const target = _Object_prototype_valueOf_call(this);
                if (isInPrototypeTree(target, obj))
                    return true;
            }
            return false;
        }
    };

    const nameOfType =
    type =>
    {
        let name;
        if (isCallable(type))
        {
            ({ name } = type);
            if (name !== undefined && name !== null)
            {
                name = _String(name);
                if (name)
                    return name;
            }
        }
        name = _String(type);
        return name;
    };

    const objOrNullOrUndefinedTypes = ['function', 'object', 'undefined'];

    const propFilter = prop => obj => prop in obj;

    const prototypeSetMap = new WeakMap();

    defineDataProperty(global, 'classes', classes, true, false, true);
    defineDataProperty(_Object, 'getPrototypeListOf', getPrototypeListOf, true, false, true);
    defineHasInstanceProperty(_Object);
    defineDataProperty(_Object_prototype, 'isPrototypeOf', isPrototypeOf, true, false, true);
}
)(typeof self === 'undefined' ? global : /* istanbul ignore next */ self);
