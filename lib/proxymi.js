/* global global, self */

(function (global)
{
    'use strict';
    
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
    const prototypeListSymbol               = Symbol.for('prototypeList');
    const reflect_construct                 = Reflect.construct;
    const reflect_get                       = Reflect.get;
    const reflect_set                       = Reflect.set;
    
    const emptyObj = object_freeze(object_create(null));
    
    const hasOwnProperty = (obj, prop) => object_prototype_hasOwnProperty.call(obj, prop);
    
    function checkSuperType(typeToPrototypeMap, type)
    {
        if (!typeToPrototypeMap.has(type))
            throw new TypeError('Argument is not a direct superclass');
    }
    
    function classes(...types)
    {
        if (types.length)
        {
            for (let type of types)
            {
                if (typeof type !== 'function')
                    throw new TypeError('Argument is not a function');
            }
            let constructorProxy = createConstructorProxy(types);
            return constructorProxy;
        }
        return null;
    }
    
    function copyProperties(getOwnProperties, src, dest)
    {
        let props = getOwnProperties(src);
        for (let prop of props)
        {
            if (!hasOwnProperty(dest, prop))
            {
                let descriptor = object_getOwnPropertyDescriptor(src, prop);
                object_defineProperty(dest, prop, descriptor);
            }
        }
    }
    
    function createConstructorProxy(types)
    {
        let constructorTarget =
            function (...args)
            {
                if (new.target == null)
                {
                    let name = constructorTarget.name;
                    let message = `Class constructor ${name} cannot be invoked without 'new'`;
                    throw new TypeError(message);
                }
                types.forEach(
                    (type, index) =>
                    {
                        let superArgs = args[index];
                        if (superArgs === void 0)
                            superArgs = [];
                        let newThis = reflect_construct(type, superArgs, new.target);
                        copyProperties(object_getOwnPropertyNames, newThis, this);
                        copyProperties(object_getOwnPropertySymbols, newThis, this);
                    }
                );
            };
        object_setPrototypeOf(constructorTarget, null);
        let constructorProxy = createProxy(constructorTarget, types);
        let getSuperPrototype =
            function ()
            {
                let superPrototypeCall = createSuperPrototypeCall(this, typeToPrototypeMap);
                return superPrototypeCall;
            };
        let prototypeTarget =
            object_create(
                null,
                {
                    class: { configurable: true, get: getSuperPrototype },
                    constructor: { configurable: true, value: constructorProxy, writable: true }
                }
            );
        let typeToPrototypeMap = new Map(types.map(type => [type, type.prototype]));
        let getSuperType =
            function ()
            {
                let superTypeCall = createSuperTypeCall(this, typeToPrototypeMap);
                return superTypeCall;
            };
        let prototypes = [...typeToPrototypeMap.values()].filter(prototype => prototype != null);
        let prototypeProxy = createProxy(prototypeTarget, prototypes);
        let constructorProperties =
        {
            class: { configurable: true, get: getSuperType },
            name: { get: () => `(${types.map(type => type.name)})` },
            prototype: { value: prototypeProxy, writable: false }
        };
        object_defineProperties(constructorTarget, constructorProperties);
        object_preventExtensions(constructorTarget);
        object_preventExtensions(prototypeTarget);
        return constructorProxy;
    }
    
    function createProxy(target, prototypeList)
    {
        object_freeze(prototypeList);
        object_defineProperty(target, prototypeListSymbol, { value: prototypeList });
        let objs = [target, ...prototypeList];
        let handler =
        {
            get(_, propKey, receiver)
            {
                let obj = objs.find(propKeyFilter(propKey));
                if (obj != null)
                {
                    let value = reflect_get(obj, propKey, receiver);
                    return value;
                }
            },
            has: (_, propKey) => objs.some(propKeyFilter(propKey)),
            set(_, propKey, value, receiver)
            {
                let obj = objs.find(propKeyFilter(propKey));
                if (obj != null)
                {
                    let success = reflect_set(obj, propKey, value, receiver);
                    return success;
                }
                object_defineProperty(
                    receiver,
                    propKey,
                    { configurable: true, enumerable: true, value, writable: true }
                );
                return true;
            }
        };
        let proxy = new Proxy(target, handler);
        return proxy;
    }
    
    function createSuper(obj, superTarget)
    {
        function resolve(reflectCall)
        {
            let result = reflectCall();
            object_setPrototypeOf(superObj, superTarget);
            return result;
        }
        
        let superHandler =
        {
            get: (target, propKey) =>
                resolve(() => reflect_get(obj, propKey, superTarget)),
            set: (target, propKey, value) =>
                resolve(() => reflect_set(obj, propKey, value, superTarget))
        };
        let superProxy = new Proxy(superTarget, superHandler);
        let superObj = object_create(superProxy);
        return superObj;
    }
    
    function createSuperPrototypeCall(superPrototypeTarget, typeToPrototypeMap)
    {
        let superPrototypeCall =
            type =>
            {
                checkSuperType(typeToPrototypeMap, type);
                let prototype = typeToPrototypeMap.get(type);
                let superObj = createSuper(prototype || emptyObj, superPrototypeTarget);
                return superObj;
            };
        return superPrototypeCall;
    }
    
    function createSuperTypeCall(superTypeTarget, typeToPrototypeMap)
    {
        let superTypeCall =
            type =>
            {
                checkSuperType(typeToPrototypeMap, type);
                let superObj = createSuper(type, superTypeTarget);
                return superObj;
            };
        return superTypeCall;
    }
    
    function getPrototypeListOf(obj)
    {
        let prototypeList;
        if (hasOwnProperty(obj, prototypeListSymbol))
            prototypeList = [...obj[prototypeListSymbol]];
        else
        {
            let prototype = object_getPrototypeOf(obj);
            prototypeList = prototype === null ? [] : [prototype];
        }
        return prototypeList;
    }
    
    function propKeyFilter(propKey)
    {
        let result = obj => propKey in obj;
        return result;
    }
    
    object_defineProperty(
        global,
        'classes',
        { configurable: true, value: classes, writable: true }
    );
    object_defineProperty(
        Object,
        'getPrototypeListOf',
        { configurable: true, value: getPrototypeListOf, writable: true }
    );
}
)(typeof self === 'undefined' ? global : /* istanbul ignore next */ self);
