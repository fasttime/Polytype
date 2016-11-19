// Proxymi – https://github.com/fasttime/proxymi
(global =>
{
    'use strict';
    
    const function_prototype_bind           = Function.prototype.bind;
    const object_create                     = Object.create;
    const object_defineProperties           = Object.defineProperties;
    const object_defineProperty             = Object.defineProperty;
    const object_freeze                     = Object.freeze;
    const object_getOwnPropertyDescriptor   = Object.getOwnPropertyDescriptor;
    const object_getOwnPropertyNames        = Object.getOwnPropertyNames;
    const object_getOwnPropertySymbols      = Object.getOwnPropertySymbols;
    const object_getPrototypeOf             = Object.getPrototypeOf;
    const object_preventExtensions          = Object.preventExtensions;
    const object_prototype_hasOwnProperty   = Object.prototype.hasOwnProperty;
    const object_setPrototypeOf             = Object.setPrototypeOf;
    const reflect_construct                 = Reflect.construct;
    const reflect_get                       = Reflect.get;
    const reflect_set                       = Reflect.set;
    const symbol_hasInstance                = Symbol.hasInstance;
    const function_hasInstance              = Function[symbol_hasInstance];
    
    function checkSuperType(typeToPrototypeMap, type)
    {
        if (!typeToPrototypeMap.has(type))
            throw new TypeError('Argument is not a direct superclass');
    }
    
    const classes = (...types) => classesImpl(types);
    
    function classesImpl(types)
    {
        if (types.length)
        {
            const typeToPrototypeMap = new Map();
            for (let type of types)
            {
                if (!isConstructor(type))
                    throw new TypeError(`${String(type)} is not a constructor`);
                const prototype = type.prototype;
                if (isNonNullPrimitive(prototype))
                {
                    throw new TypeError(
                        `Property prototype of ${type.name} is not an object or null`
                    );
                }
                typeToPrototypeMap.set(type, prototype);
            }
            const constructorProxy = createConstructorProxy(types, typeToPrototypeMap);
            installHasInstance(types);
            return constructorProxy;
        }
        return null;
    }
    
    function constructorApplyTrap(target)
    {
        const name = String(target.name);
        const message = `Class constructor ${name} cannot be invoked without 'new'`;
        throw new TypeError(message);
    }
    
    function copyProperties(getOwnProperties, src, dest)
    {
        const props = getOwnProperties(src);
        for (let prop of props)
        {
            if (!hasOwnProperty(dest, prop))
            {
                const descriptor = object_getOwnPropertyDescriptor(src, prop);
                object_defineProperty(dest, prop, descriptor);
            }
        }
    }
    
    function createConstructorProxy(types, typeToPrototypeMap)
    {
        const constructorTarget =
            function (...args)
            {
                const newTarget = new.target;
                types.forEach(
                    (type, index) =>
                    {
                        let superArgs = args[index];
                        if (superArgs === void 0)
                            superArgs = [];
                        const newThis = reflect_construct(type, superArgs, newTarget);
                        copyProperties(object_getOwnPropertyNames, newThis, this);
                        copyProperties(object_getOwnPropertySymbols, newThis, this);
                    }
                );
            };
        object_setPrototypeOf(constructorTarget, null);
        const constructorProxy = createProxy(constructorTarget, types, constructorApplyTrap);
        const getSuperPrototype =
            function ()
            {
                const superPrototypeCall = createSuperPrototypeCall(this, typeToPrototypeMap);
                return superPrototypeCall;
            };
        const prototypeTarget =
            object_create(
                null,
                {
                    class: describeAccessorProperty(getSuperPrototype, void 0, false, true),
                    constructor: describeDataProperty(constructorProxy, true, false, true)
                }
            );
        const getSuperType =
            function ()
            {
                const superTypeCall = createSuperTypeCall(this, typeToPrototypeMap);
                return superTypeCall;
            };
        const prototypes = [...typeToPrototypeMap.values()].filter(prototype => prototype !== null);
        const prototypeProxy = createProxy(prototypeTarget, prototypes);
        const constructorProperties =
        {
            class: describeAccessorProperty(getSuperType, void 0, false, true),
            name: describeAccessorProperty(() => `(${types.map(type => type.name)})`),
            prototype: describeDataProperty(prototypeProxy)
        };
        object_defineProperties(constructorTarget, constructorProperties);
        object_preventExtensions(constructorTarget);
        object_preventExtensions(prototypeTarget);
        return constructorProxy;
    }
    
    function createHandler(objs)
    {
        const handler =
        {
            get(target, prop, receiver)
            {
                const obj = objs.find(propFilter(prop));
                if (obj !== void 0)
                {
                    const value = reflect_get(obj, prop, receiver);
                    return value;
                }
            },
            has: (target, prop) => objs.some(propFilter(prop)),
            set(target, prop, value, receiver)
            {
                const obj = objs.find(propFilter(prop));
                if (obj !== void 0)
                {
                    const success = reflect_set(obj, prop, value, receiver);
                    return success;
                }
                defineDataProperty(receiver, prop, value, true, true, true);
                return true;
            }
        };
        return handler;
    }
    
    function createProxy(target, prototypeList, apply)
    {
        object_freeze(prototypeList);
        defineDataProperty(target, prototypeListSymbol, prototypeList);
        const handler = createHandler([target, ...prototypeList]);
        handler.apply = apply;
        const proxy = new Proxy(target, handler);
        return proxy;
    }
    
    function createSuper(obj, superTarget)
    {
        function resolve(reflectCall)
        {
            const result = reflectCall();
            object_setPrototypeOf(superObj, superTarget);
            return result;
        }
        
        const superHandler =
        {
            get: (target, prop) => resolve(() => reflect_get(obj, prop, superTarget)),
            set: (target, prop, value) => resolve(() => reflect_set(obj, prop, value, superTarget))
        };
        const superProxy = new Proxy(superTarget, superHandler);
        const superObj = object_create(superProxy);
        return superObj;
    }
    
    function createSuperPrototypeCall(superPrototypeTarget, typeToPrototypeMap)
    {
        const superPrototypeCall =
            type =>
            {
                checkSuperType(typeToPrototypeMap, type);
                let prototype = typeToPrototypeMap.get(type);
                if (prototype === null)
                    prototype = emptyObj;
                const superObj = createSuper(prototype, superPrototypeTarget);
                return superObj;
            };
        return superPrototypeCall;
    }
    
    function createSuperTypeCall(superTypeTarget, typeToPrototypeMap)
    {
        const superTypeCall =
            type =>
            {
                checkSuperType(typeToPrototypeMap, type);
                const superObj = createSuper(type, superTypeTarget);
                return superObj;
            };
        return superTypeCall;
    }
    
    const defineDataProperty =
        (obj, prop, value, writable, enumerable, configurable) =>
        object_defineProperty(
            obj,
            prop,
            describeDataProperty(value, writable, enumerable, configurable)
        );
    
    const defineHasInstanceProperty =
        type => defineDataProperty(type, symbol_hasInstance, hasInstance, true, false, true);
    
    const describeAccessorProperty =
        (get, set, enumerable, configurable) => ({ get, set, enumerable, configurable });
    
    const describeDataProperty =
        (value, writable, enumerable, configurable) =>
        ({ value, writable, enumerable, configurable });
    
    const emptyObj = object_freeze(object_create(null));
    
    const getPrototypeListOf = obj => getPrototypeListOfImpl(obj, true);
    
    function getPrototypeListOfImpl(obj, copyElements)
    {
        let prototypeList;
        if (hasOwnProperty(obj, prototypeListSymbol))
        {
            prototypeList = obj[prototypeListSymbol];
            if (copyElements)
                prototypeList = [...prototypeList];
        }
        else
        {
            const prototype = object_getPrototypeOf(obj);
            prototypeList = prototype === null ? [] : [prototype];
        }
        return prototypeList;
    }
    
    const hasInstance =
    {
        hasInstance(value)
        {
            const result =
                isCallable(this) &&
                !isPrimitive(value) &&
                (
                    function_hasInstance.call(this, value) ||
                    isInPrototypeChain(this.prototype, value)
                );
            return result;
        }
    }.hasInstance;
    
    const hasOwnProperty = (obj, prop) => object_prototype_hasOwnProperty.call(obj, prop);
    
    function installHasInstance(types)
    {
        let installed = false;
        for (let type of types)
        {
            if (isConstructor(type))
            {
                installed = true;
                const superTypes = getPrototypeListOfImpl(type);
                if (!installHasInstance(superTypes))
                    defineHasInstanceProperty(type);
            }
        }
        return installed;
    }
    
    const isCallable = value => typeof value === 'function';
    
    function isConstructor(value)
    {
        if (isCallable(value))
        {
            const boundFn = function_prototype_bind.call(value);
            defineDataProperty(boundFn, 'prototype', null);
            try
            {
                void class extends boundFn
                { };
                return true;
            }
            catch (error)
            { }
        }
        return false;
    }
    
    function isInPrototypeChain(target, obj)
    {
        const prototypeList = getPrototypeListOfImpl(obj);
        const result =
            prototypeList.some(
                prototype => prototype === target || isInPrototypeChain(target, prototype)
            );
        return result;
    }
    
    const isNonNullPrimitive = value => value === void 0 || primitiveTypes.includes(typeof value);
    
    const isPrimitive = value => value === null || isNonNullPrimitive(value);
    
    const primitiveTypes = ['boolean', 'number', 'string', 'symbol'];
    
    const propFilter = prop => obj => prop in obj;
    
    const prototypeListSymbol = Symbol.for('prototypeList');
    
    defineDataProperty(global, 'classes', classes, true, false, true);
    defineDataProperty(Object, 'getPrototypeListOf', getPrototypeListOf, true, false, true);
    defineHasInstanceProperty(Object);
}
)(typeof self === 'undefined' ? global : /* istanbul ignore next */ self);
