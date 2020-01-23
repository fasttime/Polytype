const EMPTY_ARRAY = [];

const _Function_prototype   = Function.prototype;
const _Map                  = Map;
const _Object               = Object;
const
{
    create:                     _Object_create,
    defineProperties:           _Object_defineProperties,
    defineProperty:             _Object_defineProperty,
    freeze:                     _Object_freeze,
    getOwnPropertyDescriptor:   _Object_getOwnPropertyDescriptor,
    getOwnPropertyDescriptors:  _Object_getOwnPropertyDescriptors,
    getPrototypeOf:             _Object_getPrototypeOf,
    prototype:                  _Object_prototype,
    setPrototypeOf:             _Object_setPrototypeOf,
} =
_Object;
const _Proxy                = Proxy;
const _Reflect              = Reflect;
const
{
    construct:  _Reflect_construct,
    get:        _Reflect_get,
    ownKeys:    _Reflect_ownKeys,
    set:        _Reflect_set,
} =
_Reflect;
const _Set                  = Set;
const _String               = String;
const _Symbol               = Symbol;
const _Symbol_hasInstance   = _Symbol.hasInstance;
const _TypeError            = TypeError;

const bindCall = callable => _Function_prototype.call.bind(callable);

const _Function_prototype_bind_call         = bindCall(_Function_prototype.bind);
const _Function_prototype_hasInstance_call  = bindCall(_Function_prototype[_Symbol_hasInstance]);
const _Function_prototype_toString_call     = bindCall(_Function_prototype.toString);
const _Object_prototype_hasOwnProperty_call = bindCall(_Object_prototype.hasOwnProperty);
const _Object_prototype_valueOf_call        = bindCall(_Object_prototype.valueOf);

const checkDuplicateSuperType =
(typeSet, type) =>
{
    if (typeSet.has(type))
    {
        const message = `Duplicate superclass ${nameOfType(type)}`;
        throw _TypeError(message);
    }
};

const checkNonCallableArgument =
type =>
{
    if (!isCallable(type))
        throw _TypeError('Argument is not a function');
};

const { classes } =
{
    classes(...types)
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
        installAncestorProperties(typeSet, prototypeSet);
        return constructorProxy;
    },
};

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
    const constructorProxy = createProxy(constructorTarget, typeSet, constructorHandlerPrototype);
    const prototypeTarget =
    _Object_create
    (
        null,
        {
            constructor: describeDataProperty(constructorProxy, true),
            class: describeDataProperty(superPrototypeSelector),
        },
    );
    const prototypeProxy = createProxy(prototypeTarget, prototypeSet, commonHandlerPrototype);
    const constructorProperties =
    {
        class: describeDataProperty(superTypeSelector),
        name: { get: getConstructorName },
        prototype: describeDataProperty(prototypeProxy),
    };
    _Object_defineProperties(constructorTarget, constructorProperties);
    return constructorProxy;
}

const createConstructorTarget =
typeSet =>
{
    const constructorTarget =
    function (...args)
    {
        const typeToSuperArgsMap = createTypeToSuperArgsMap(typeSet, args);
        const newTarget = new.target;
        for (const type of typeSet)
        {
            const superArgs = typeToSuperArgsMap.get(type);
            const descriptorMapObj = getNewObjectPropertyDescriptors(type, superArgs, newTarget);
            const props = _Reflect_ownKeys(descriptorMapObj);
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
};

const createGetConstructorName =
typeSet => () => `(${[...typeSet].map(({ name }) => _String(name))})`;

const createListFromArrayLike = _Function_prototype.apply.bind((...args) => args, null);

const createProxy =
(target, prototypeSet, handlerPrototype) =>
{
    const prototypeList = _Object_freeze([...prototypeSet]);
    const objs = [target, ...prototypeList];
    const handler =
    {
        __proto__: handlerPrototype,
        get(target, prop, receiver)
        {
            if (prop === prototypesLookupSymbol && isObject(receiver))
            {
                const descriptor =
                _Object_getOwnPropertyDescriptor(receiver, prototypesLookupSymbol);
                if (descriptor && descriptor.value === proxy)
                    receiver.prototypeList = prototypeList;
            }
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
            defineMutableDataProperty(receiver, prop, value, true);
            return true;
        },
    };
    const proxy = new _Proxy(target, handler);
    return proxy;
};

const createSuper =
(obj, superTarget) =>
{
    const resolve =
    reflectCall =>
    {
        const returnValue = reflectCall();
        _Object_setPrototypeOf(superObj, superTarget);
        return returnValue;
    };

    const superHandler =
    {
        get: (target, prop) => resolve(() => _Reflect_get(obj, prop, superTarget)),
        set: (target, prop, value) => resolve(() => _Reflect_set(obj, prop, value, superTarget)),
    };

    const superProxy = new _Proxy(superTarget, superHandler);
    const superObj = { __proto__: superProxy };
    return superObj;
};

const createSuperPrototypeSelector =
prototypeSet =>
{
    const { class: superPrototypeSelector } =
    {
        class(type)
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
        },
    };
    return superPrototypeSelector;
};

const createSuperTypeSelector =
typeSet =>
{
    const { class: superTypeSelector } =
    {
        class(type)
        {
            if (!typeSet.has(type))
            {
                checkNonCallableArgument(type);
                throw _TypeError('Argument is not a direct superclass');
            }
            const superObj = createSuper(type, this);
            return superObj;
        },
    };
    return superTypeSelector;
};

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

const defineGlobally =
() =>
{
    if (globalThis.hasOwnProperty('classes'))
        return false;
    defineMutableDataProperty(globalThis, 'classes', classes);
    defineMutableDataProperty(_Object, 'getPrototypeListOf', getPrototypeListOf);
    return true;
};

const defineHasInstanceProperty =
type => defineMutableDataProperty(type, _Symbol_hasInstance, hasInstance);

const defineMutableDataProperty =
(obj, prop, value, enumerable = false) =>
_Object_defineProperty(obj, prop, describeDataProperty(value, true, enumerable));

const describeDataProperty =
(value, mutable, enumerable) => ({ value, writable: mutable, enumerable, configurable: mutable });

const doPrototypesLookup =
obj =>
{
    const receiver = { [prototypesLookupSymbol]: obj };
    _Reflect_get(obj, prototypesLookupSymbol, receiver);
    const { prototypeList } = receiver;
    if (prototypeList !== undefined)
    {
        const prototypes = [...prototypeList];
        for (const prototype of prototypes)
        {
            if (!isObject(prototype))
                throw _TypeError('Corrupt prototype list');
        }
        return prototypes;
    }
};

const getNewObjectPropertyDescriptors =
(type, args = EMPTY_ARRAY, newTarget) =>
_Object_getOwnPropertyDescriptors(_Reflect_construct(type, args, newTarget));

const { getPrototypeListOf } =
{
    getPrototypeListOf:
    obj =>
    {
        let prototypes;
        {
            const prototype = _Object_getPrototypeOf(obj);
            if (prototype !== null)
            {
                prototypes = doPrototypesLookup(prototype);
                if (!prototypes)
                    prototypes = [prototype];
            }
            else
                prototypes = [];
        }
        return prototypes;
    },
};

const getPrototypesOf =
obj =>
{
    let prototypes = doPrototypesLookup(obj);
    if (!prototypes)
    {
        const prototype = _Object_getPrototypeOf(obj);
        prototypes = prototype !== null ? [prototype] : EMPTY_ARRAY;
    }
    return prototypes;
};

const { [_Symbol_hasInstance]: hasInstance } =
{
    [_Symbol_hasInstance](obj)
    {
        hasInstancePending = true;
        try
        {
            if (isCallable(this))
            {
                const isInstance = _Function_prototype_hasInstance_call(this, obj);
                if (!hasInstancePending)
                    return isInstance;
                if (isInstance || isObject(obj) && isInPrototypeTree(this.prototype, obj))
                    return true;
            }
            return false;
        }
        finally
        {
            hasInstancePending = false;
        }
    },
};

let hasInstancePending = false;

function installAncestorProperties(...objSets)
{
    const visitedObjSet = new _Set();
    const installedSet = new _Set();
    for (const objSet of objSets)
    {
        for (let obj of objSet)
        {
            while (!visitedObjSet.has(obj))
            {
                visitedObjSet.add(obj);
                {
                    const { constructor } = obj;
                    if (isConstructor(constructor))
                        installHasInstance(constructor, installedSet);
                }
                {
                    const prototype = _Object_getPrototypeOf(obj);
                    if (prototype === null)
                    {
                        const descriptor = _Object_getOwnPropertyDescriptor(obj, 'isPrototypeOf');
                        if (descriptor && isNativeFunction(descriptor.value, 'isPrototypeOf'))
                        {
                            descriptor.value = isPrototypeOf;
                            _Object_defineProperty(obj, 'isPrototypeOf', descriptor);
                        }
                        break;
                    }
                    obj = prototype;
                }
            }
        }
    }
}

const installHasInstance =
(obj, installedSet) =>
{
    if (isFunctionPrototype(obj))
        return false;
    if (!installedSet.has(obj))
    {
        installedSet.add(obj);
        const prototypes = getPrototypesOf(obj);
        let installed = false;
        for (const prototype of prototypes)
        {
            if (prototype !== null && installHasInstance(prototype, installedSet))
                installed = true;
        }
        if (!installed)
            defineHasInstanceProperty(obj);
    }
    return true;
};

const isCallable = obj => typeof obj === 'function';

const isConstructor =
obj =>
{
    if (isCallable(obj))
    {
        const boundFn = _Function_prototype_bind_call(obj);
        defineMutableDataProperty(boundFn, 'prototype', null);
        const proxy = new _Proxy(boundFn, isConstructorArgumentHandler);
        try
        {
            new
            class extends proxy
            { }
            ();
            return true;
        }
        catch
        { }
    }
    return false;
};

const isConstructorArgumentHandler =
{
    construct()
    {
        return this;
    },
};

const isFunctionPrototype =
obj =>
{
    if (isNativeFunction(obj, ''))
    {
        const descriptor = _Object_getOwnPropertyDescriptor(obj, _Symbol_hasInstance);
        if
        (
            descriptor &&
            !descriptor.writable &&
            !descriptor.enumerable &&
            !descriptor.configurable &&
            isNativeFunction(descriptor.value, '[Symbol.hasInstance]')
        )
            return true;
    }
    return false;
};

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

const isNativeFunction =
(obj, name) =>
{
    let str;
    try
    {
        str = _Function_prototype_toString_call(obj);
    }
    catch
    {
        return false;
    }
    const groups = /^function ?(.*)\(\) {\s+\[native code]\s+}$/.exec(str);
    const returnValue = groups && groups[1] === name && !isConstructor(obj);
    return returnValue;
};

const isNonNullOrUndefinedPrimitive = obj => !objOrNullOrUndefinedTypes.includes(typeof obj);

const isNonNullPrimitive = obj => obj === undefined || isNonNullOrUndefinedPrimitive(obj);

const isNonUndefinedPrimitive = obj => obj === null || isNonNullOrUndefinedPrimitive(obj);

const isObject = obj => obj !== null && !isNonNullPrimitive(obj);

const { isPrototypeOf } =
{
    isPrototypeOf(obj)
    {
        if (isObject(obj))
        {
            const target = _Object_prototype_valueOf_call(this);
            if (isInPrototypeTree(target, obj))
                return true;
        }
        return false;
    },
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

const prototypesLookupSymbol = _Symbol.for('Polytype prototypes lookup');

export { classes, defineGlobally, getPrototypeListOf };
