// Proxymi – https://github.com/fasttime/proxymi
(global =>
{
    'use strict';
    
    const function_prototype                = Function.prototype;
    const function_prototype_bind           = function_prototype.bind;
    const object_create                     = Object.create;
    const object_defineProperties           = Object.defineProperties;
    const object_defineProperty             = Object.defineProperty;
    const object_freeze                     = Object.freeze;
    const object_getOwnPropertyDescriptors  = Object.getOwnPropertyDescriptors;
    const object_getPrototypeOf             = Object.getPrototypeOf;
    const object_keys                       = Object.keys;
    const object_preventExtensions          = Object.preventExtensions;
    const object_prototype_hasOwnProperty   = Object.prototype.hasOwnProperty;
    const object_setPrototypeOf             = Object.setPrototypeOf;
    const reflect_construct                 = Reflect.construct;
    const reflect_get                       = Reflect.get;
    const reflect_set                       = Reflect.set;
    const symbol_hasInstance                = Symbol.hasInstance;
    const function_prototype_hasInstance    = function_prototype[symbol_hasInstance];
    
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
            for (const type of types)
            {
                if (!isConstructor(type))
                {
                    const message = `${String(type)} is not a constructor`;
                    throw new TypeError(message);
                }
                const { prototype } = type;
                if (isNonNullPrimitive(prototype))
                {
                    const message = `Property 'prototype' of ${type.name} is not an object or null`;
                    throw new TypeError(message);
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
                        if (superArgs === undefined)
                            superArgs = [];
                        const newThis = reflect_construct(type, superArgs, newTarget);
                        const descriptorMapObj = object_getOwnPropertyDescriptors(newThis);
                        const props = object_keys(descriptorMapObj);
                        for (const prop of props)
                        {
                            if (hasOwnProperty(this, prop))
                                delete descriptorMapObj[prop];
                        }
                        object_defineProperties(this, descriptorMapObj);
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
                    class: describeAccessorProperty(getSuperPrototype, undefined, false, true),
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
            class: describeAccessorProperty(getSuperType, undefined, false, true),
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
                if (obj !== undefined)
                {
                    const value = reflect_get(obj, prop, receiver);
                    return value;
                }
            },
            has: (target, prop) => objs.some(propFilter(prop)),
            set(target, prop, value, receiver)
            {
                const obj = objs.find(propFilter(prop));
                if (obj !== undefined)
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
                const prototype = typeToPrototypeMap.get(type);
                if (prototype === null)
                    throw new TypeError('Property \'prototype\' of superclass is null');
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
    
    const { hasInstance } =
    {
        hasInstance(value)
        {
            const result =
                isCallable(this) &&
                !isPrimitive(value) &&
                (
                    function_prototype_hasInstance.call(this, value) ||
                    isInPrototypeChain(this.prototype, value)
                );
            return result;
        }
    };
    
    const hasOwnProperty = (obj, prop) => object_prototype_hasOwnProperty.call(obj, prop);
    
    function installHasInstance(types)
    {
        let installed = false;
        for (const type of types)
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
        if (value !== function_prototype && isCallable(value))
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
    
    const isNonNullPrimitive =
        value => value === undefined || primitiveTypes.includes(typeof value);
    
    const isPrimitive = value => value === null || isNonNullPrimitive(value);
    
    const primitiveTypes = ['boolean', 'number', 'string', 'symbol'];
    
    const propFilter = prop => obj => prop in obj;
    
    const prototypeListSymbol = Symbol.for('prototypeList');
    
    defineDataProperty(global, 'classes', classes, true, false, true);
    defineDataProperty(Object, 'getPrototypeListOf', getPrototypeListOf, true, false, true);
    defineHasInstanceProperty(Object);
}
)(typeof self === 'undefined' ? global : /* istanbul ignore next */ self);
