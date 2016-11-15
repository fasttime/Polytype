/* global global, self */

(global =>
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
    const symbol_hasInstance                = Symbol.hasInstance;
    
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
            if (types.some(type => !isConstructor(type)))
                throw new TypeError('Argument is not a constructor');
            const constructorProxy = createConstructorProxy(types);
            installHasInstance(types);
            return constructorProxy;
        }
        return null;
    }
    
    function copyProperties(getOwnProperties, src, dest)
    {
        const props = getOwnProperties(src);
        for (const prop of props)
        {
            if (!hasOwnProperty(dest, prop))
            {
                const descriptor = object_getOwnPropertyDescriptor(src, prop);
                object_defineProperty(dest, prop, descriptor);
            }
        }
    }
    
    function createConstructorProxy(types)
    {
        const constructorTarget =
            function (...args)
            {
                if (new.target == null)
                {
                    const name = constructorTarget.name;
                    const message = `Class constructor ${name} cannot be invoked without 'new'`;
                    throw new TypeError(message);
                }
                types.forEach(
                    (type, index) =>
                    {
                        let superArgs = args[index];
                        if (superArgs === void 0)
                            superArgs = [];
                        const newThis = reflect_construct(type, superArgs, new.target);
                        copyProperties(object_getOwnPropertyNames, newThis, this);
                        copyProperties(object_getOwnPropertySymbols, newThis, this);
                    }
                );
            };
        object_setPrototypeOf(constructorTarget, null);
        const constructorProxy = createProxy(constructorTarget, types);
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
        const typeToPrototypeMap = new Map(types.map(type => [type, type.prototype]));
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
    
    function createProxy(target, prototypeList)
    {
        object_freeze(prototypeList);
        defineDataProperty(target, prototypeListSymbol, prototypeList);
        const objs = [target, ...prototypeList];
        const handler =
        {
            get(_, prop, receiver)
            {
                const obj = objs.find(propFilter(prop));
                if (obj !== void 0)
                {
                    const value = reflect_get(obj, prop, receiver);
                    return value;
                }
            },
            has: (_, prop) => objs.some(propFilter(prop)),
            set(_, prop, value, receiver)
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
    
    function hasInstance(value)
    {
        if (isCallable(this) && !isPrimitive(value))
        {
            const target = this.prototype;
            if (target === null)
            {
                throw new TypeError(
                    'Function has non-object prototype \'null\' in instanceof check'
                );
            }
            const obj = object_getPrototypeOf(value);
            if (isInPrototypeChain(target, obj))
                return true;
        }
        return false;
    }
    
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
        if (value !== null)
        {
            try
            {
                void class extends value
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
        for (; obj !== null; obj = object_getPrototypeOf(obj))
        {
            if (obj === target)
                return true;
            if (hasOwnProperty(obj, prototypeListSymbol))
            {
                const prototypeList = obj[prototypeListSymbol];
                if (prototypeList.some(prototype => isInPrototypeChain(target, prototype)))
                    return true;
                break;
            }
        }
        return false;
    }
    
    const isPrimitive =
        value => primitiveTypes.includes(typeof value) || value === void 0 || value === null;
    
    const primitiveTypes = ['boolean', 'number', 'string', 'symbol'];
    
    const propFilter = prop => obj => prop in obj;
    
    defineDataProperty(global, 'classes', classes, true, false, true);
    defineDataProperty(Object, 'getPrototypeListOf', getPrototypeListOf, true, false, true);
    defineHasInstanceProperty(Object);
}
)(typeof self === 'undefined' ? global : /* istanbul ignore next */ self);
