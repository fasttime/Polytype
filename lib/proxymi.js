// Proxymi – https://github.com/fasttime/proxymi
(global =>
{
    'use strict';
    
    if (global.hasOwnProperty('classes'))
        return;
    
    const _Function_prototype               = Function.prototype;
    const _Function_prototype_bind          = _Function_prototype.bind;
    const _Object_create                    = Object.create;
    const _Object_defineProperties          = Object.defineProperties;
    const _Object_defineProperty            = Object.defineProperty;
    const _Object_getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;
    const _Object_getPrototypeOf            = Object.getPrototypeOf;
    const _Object_keys                      = Object.keys;
    const _Object_preventExtensions         = Object.preventExtensions;
    const _Object_prototype_hasOwnProperty  = Object.prototype.hasOwnProperty;
    const _Object_setPrototypeOf            = Object.setPrototypeOf;
    const _Reflect_construct                = Reflect.construct;
    const _Reflect_get                      = Reflect.get;
    const _Reflect_set                      = Reflect.set;
    const _Symbol_hasInstance               = Symbol.hasInstance;
    const _Function_prototype_hasInstance   = _Function_prototype[_Symbol_hasInstance];
    
    function checkSuperType(typeToPrototypeMap, type)
    {
        if (!typeToPrototypeMap.has(type))
            throw new TypeError('Argument is not a direct superclass');
    }
    
    const classes = (...types) => classesImpl(types);
    
    function classesImpl(types)
    {
        if (!types.length)
            throw new TypeError('No superclasses specified');
        const typeToPrototypeMap = new Map();
        for (const type of types)
        {
            if (typeToPrototypeMap.has(type))
            {
                const message = `Duplicate superclass ${type.name}`;
                throw new TypeError(message);
            }
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
                        const newThis = _Reflect_construct(type, superArgs, newTarget);
                        const descriptorMapObj = _Object_getOwnPropertyDescriptors(newThis);
                        const props = _Object_keys(descriptorMapObj);
                        for (const prop of props)
                        {
                            if (hasOwnProperty(this, prop))
                                delete descriptorMapObj[prop];
                        }
                        _Object_defineProperties(this, descriptorMapObj);
                    }
                );
            };
        _Object_setPrototypeOf(constructorTarget, null);
        const constructorProxy = createProxy(constructorTarget, types, constructorApplyTrap);
        const getSuperPrototype =
            function ()
            {
                const superPrototypeCall = createSuperPrototypeCall(this, typeToPrototypeMap);
                return superPrototypeCall;
            };
        const prototypeTarget =
            _Object_create(
                null,
                {
                    class: describeGetter(getSuperPrototype),
                    constructor: describeDataProperty(constructorProxy, true, false, true),
                }
            );
        const getSuperType =
            function ()
            {
                const superTypeCall = createSuperTypeCall(this, typeToPrototypeMap);
                return superTypeCall;
            };
        const prototypes =
            [...new Set(typeToPrototypeMap.values())].filter(prototype => prototype !== null);
        const prototypeProxy = createProxy(prototypeTarget, prototypes);
        const constructorProperties =
        {
            class: describeGetter(getSuperType),
            name: describeGetter(() => `(${types.map(type => type.name)})`),
            prototype: describeDataProperty(prototypeProxy),
        };
        _Object_defineProperties(constructorTarget, constructorProperties);
        _Object_preventExtensions(constructorTarget);
        _Object_preventExtensions(prototypeTarget);
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
            }
        };
        return handler;
    }
    
    function createProxy(target, prototypeList, apply)
    {
        const handler = createHandler([target, ...prototypeList]);
        handler.apply = apply;
        const proxy = new Proxy(target, handler);
        prototypeListMap.set(proxy, prototypeList);
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
        const superProxy = new Proxy(superTarget, superHandler);
        const superObj = _Object_create(superProxy);
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
        _Object_defineProperty(
            obj,
            prop,
            describeDataProperty(value, writable, enumerable, configurable)
        );
    
    const defineHasInstanceProperty =
        type => defineDataProperty(type, _Symbol_hasInstance, hasInstance, true, false, true);
    
    const describeDataProperty =
        (value, writable, enumerable, configurable) =>
        ({ value, writable, enumerable, configurable });
    
    const describeGetter = get => ({ get, configurable: true });
    
    const getPrototypeListOf = obj => getPrototypeListOfImpl(obj, true);
    
    function getPrototypeListOfImpl(obj, copyElements)
    {
        let prototypeList = prototypeListMap.get(obj);
        if (prototypeList)
        {
            if (copyElements)
                prototypeList = [...prototypeList];
        }
        else
        {
            const prototype = _Object_getPrototypeOf(obj);
            prototypeList = prototype === null ? [] : [prototype];
        }
        return prototypeList;
    }
    
    const { [_Symbol_hasInstance]: hasInstance } =
    {
        [_Symbol_hasInstance](value)
        {
            const result =
                isCallable(this) &&
                !isPrimitive(value) &&
                (
                    _Function_prototype_hasInstance.call(this, value) ||
                    isInPrototypeChain(this.prototype, value)
                );
            return result;
        }
    };
    
    const hasOwnProperty = (obj, prop) => _Object_prototype_hasOwnProperty.call(obj, prop);
    
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
        if (value !== _Function_prototype && isCallable(value))
        {
            const boundFn = _Function_prototype_bind.call(value);
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
    
    const prototypeListMap = new WeakMap();
    
    defineDataProperty(global, 'classes', classes, true, false, true);
    defineDataProperty(Object, 'getPrototypeListOf', getPrototypeListOf, true, false, true);
    defineHasInstanceProperty(Object);
}
)(typeof self === 'undefined' ? global : /* istanbul ignore next */ self);
