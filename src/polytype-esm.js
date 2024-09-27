(
    constructor =>
    {
        try
        {
            constructor();
        }
        catch
        {
            return;
        }
        throw Error('Polytype cannot be transpiled to ES5 or earlier code.');
    }
)
(
    class
    { },
);

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
    setPrototypeOf:             _Object_setPrototypeOf,
} =
_Object;
const _Proxy                = Proxy;
const _Reflect              = Reflect;
const
{
    apply:      _Reflect_apply,
    construct:  _Reflect_construct,
    get:        _Reflect_get,
    set:        _Reflect_set,
} =
_Reflect;
const _Set                  = Set;
const _String               = String;
const _Symbol_hasInstance   = Symbol.hasInstance;
const _TypeError            = TypeError;

const BIND_HANDLER =
{
    apply(target, thisArg, args)
    {
        if (isCallable(thisArg))
        {
            const [bindThis] = args;
            const thisSupplier =
            isObject(bindThis) && doThisSupplierInquiry(_Object_getPrototypeOf(bindThis));
            if (thisSupplier)
            {
                const handler = createLateBindHandler(bindThis, thisSupplier);
                thisArg = new _Proxy(thisArg, handler);
                delete args[0];
            }
        }
        const boundFn = _Function_prototype_bind_call(thisArg, ...args);
        return boundFn;
    },
};

const COMMON_HANDLER_PROTOTYPE = { setPrototypeOf: () => false };

const CONSTRUCTOR_HANDLER_PROTOTYPE =
{
    __proto__: COMMON_HANDLER_PROTOTYPE,
    apply()
    {
        throw _TypeError('Constructor cannot be invoked without \'new\'');
    },
};

const EMPTY_ARRAY = [];

const EMPTY_OBJECT = _Object_freeze({ __proto__: null });

const INQUIRY_RESULT_KEY = 'result';

const INQUIRY_TARGET_KEY = 'target';

const IS_PROTOTYPE_OF_HANDLER =
{
    apply(dummyTarget, thisArg, [obj])
    {
        if (isObject(obj))
        {
            const target = _Object_prototype_valueOf_call(thisArg);
            if (isInPrototypeTree(target, obj))
                return true;
        }
        return false;
    },
};

const OBJECT_OR_NULL_OR_UNDEFINED_TYPES = ['function', 'object', 'undefined'];

const PROTOTYPES_INQUIRY_KEY = Symbol.for('Polytype inquiry: prototypes');

const THIS_SUPPLIER_INQUIRY_KEY = Symbol.for('Polytype inquiry: this supplier');

let _Function_prototype_call = _Function_prototype.call;
let bindCall = callable => _Function_prototype_call.bind(callable);

const _Function_prototype_bind_call         = bindCall(_Function_prototype.bind);
const _Function_prototype_hasInstance_call  = bindCall(_Function_prototype[_Symbol_hasInstance]);
const _Function_prototype_toString_call     = bindCall(_Function_prototype.toString);
const _Object_prototype_valueOf_call        = bindCall(_Object.prototype.valueOf);

bindCall = null; // eslint-disable-line no-useless-assignment
_Function_prototype_call = null;

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

function createConstructorProxy(typeSet, prototypeSet)
{
    const superTypeSelector = createSuperTypeSelector(typeSet);
    const getConstructorName = createGetConstructorName(typeSet);
    const superPrototypeSelector = createSuperPrototypeSelector(prototypeSet);
    const constructorTarget = createConstructorTarget(typeSet);
    const constructorProxy =
    createUnionProxy(constructorTarget, typeSet, CONSTRUCTOR_HANDLER_PROTOTYPE);
    const prototypeTarget =
    _Object_create
    (
        null,
        {
            constructor:    describeDataProperty(constructorProxy, true),
            class:          describeDataProperty(superPrototypeSelector),
        },
    );
    const prototypeProxy =
    createUnionProxy(prototypeTarget, prototypeSet, COMMON_HANDLER_PROTOTYPE);
    const constructorProperties =
    {
        class:      describeDataProperty(superTypeSelector),
        name:       { get: getConstructorName },
        prototype:  describeDataProperty(prototypeProxy),
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
        const descriptorMapObjList = [];
        const thisReference = createReference();
        {
            const typeToSuperArgsMap = createTypeToSuperArgsMap(typeSet, args);
            const superNewTarget = createSuperNewTarget(thisReference.get, new.target);
            for (const type of typeSet)
            {
                const superArgs = typeToSuperArgsMap.get(type) ?? EMPTY_ARRAY;
                const newObj = _Reflect_construct(type, superArgs, superNewTarget);
                const descriptorMapObj = _Object_getOwnPropertyDescriptors(newObj);
                descriptorMapObjList.push(descriptorMapObj);
            }
        }
        thisReference.set(this);
        for (const descriptorMapObj of descriptorMapObjList)
            _Object_defineProperties(this, descriptorMapObj);
        for (let descriptorMapObj; descriptorMapObj = descriptorMapObjList.pop();)
            _Object_defineProperties(this, descriptorMapObj);
    };
    _Object_setPrototypeOf(constructorTarget, null);
    return constructorTarget;
};

const createGetConstructorName =
typeSet => () => `(${[...typeSet].map(({ name }) => _String(name))})`;

const createLateBindHandler =
(thisArg, thisSupplier) =>
{
    const handler =
    {
        apply(target, dummyThisArg, args)
        {
            thisArg = thisSupplier() ?? thisArg;
            const returnValue = _Reflect_apply(target, thisArg, args);
            return returnValue;
        },
    };
    return handler;
};

const createListFromArrayLike = _Function_prototype.apply.bind((...args) => args, null);

function createReference()
{
    let value;
    const get = () => value;
    const set =
    newValue =>
    {
        value = newValue;
    };
    const reference = { get, set };
    return reference;
}

const createSubstitutePrototypeProxy =
(thisSupplier, prototype) =>
{
    const target = _Object_create(prototype);
    const handler =
    {
        get(target, prop, receiver)
        {
            if (!thisSupplier())
            {
                if (prop === THIS_SUPPLIER_INQUIRY_KEY && isInquiryReceiverFor(receiver, proxy))
                    receiver[INQUIRY_RESULT_KEY] = thisSupplier;
            }
            const value = _Reflect_get(target, prop, receiver);
            return value;
        },
    };
    const proxy = new _Proxy(target, handler);
    return proxy;
};

const createSuper =
(obj, superTarget) =>
{
    const superHandler =
    {
        get(target, prop)
        {
            let value = _Reflect_get(obj, prop, superTarget);
            if (isCallable(value))
            {
                const superMethodHandler = createSuperMethodHandler(superTarget, superProxy);
                value = new _Proxy(value, superMethodHandler);
            }
            return value;
        },
        set: (target, prop, value) => _Reflect_set(obj, prop, value, superTarget),
    };
    const superProxy = new _Proxy(EMPTY_OBJECT, superHandler);
    return superProxy;
};

const createSuperMethodHandler =
(superTarget, superProxy) =>
{
    const handler =
    {
        apply(target, thisArg, args)
        {
            if (thisArg === superProxy)
                thisArg = superTarget;
            const returnValue = _Reflect_apply(target, thisArg, args);
            return returnValue;
        },
    };
    return handler;
};

function createSuperNewTarget(thisSupplier, newTarget)
{
    function superNewTarget()
    {
        throw _TypeError('Operation not supported');
    }

    delete superNewTarget.length;
    delete superNewTarget.name;
    superNewTarget.prototype = createSubstitutePrototypeProxy(thisSupplier, newTarget.prototype);
    _Object_setPrototypeOf(superNewTarget, newTarget);
    _Object_freeze(superNewTarget);
    return superNewTarget;
}

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

const createUnionProxy =
(target, prototypeSet, handlerPrototype) =>
{
    const objs = [target, ...prototypeSet];
    const handler =
    {
        __proto__:  handlerPrototype,
        get(target, prop, receiver)
        {
            if (prop === PROTOTYPES_INQUIRY_KEY && isInquiryReceiverFor(receiver, proxy))
                receiver[INQUIRY_RESULT_KEY] = prototypeSet.values();
            const obj = objs.find(propFilter(prop));
            if (obj !== undefined)
            {
                const value = _Reflect_get(obj, prop, receiver);
                return value;
            }
        },
        has:        (target, prop) => objs.some(propFilter(prop)),
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

const defineGlobally =
undo =>
{
    if (globalThis.hasOwnProperty('classes') === !undo)
        return false;
    if (undo)
    {
        delete globalThis.classes;
        delete _Object.getPrototypeListOf;
    }
    else
    {
        defineMutableDataProperty(globalThis, 'classes', classes);
        defineMutableDataProperty(_Object, 'getPrototypeListOf', getPrototypeListOf);
    }
    return true;
};

const defineHasInstanceProperty =
type => defineMutableDataProperty(type, _Symbol_hasInstance, hasInstance);

const defineMutableDataProperty =
(obj, prop, value, enumerable = false) =>
_Object_defineProperty(obj, prop, describeDataProperty(value, true, enumerable));

const describeDataProperty =
(value, mutable, enumerable) => ({ value, writable: mutable, enumerable, configurable: mutable });

const doPrototypesInquiry =
obj =>
{
    const prototypeIterable = inquire(obj, PROTOTYPES_INQUIRY_KEY);
    if (prototypeIterable !== undefined)
    {
        const prototypes = [...prototypeIterable];
        for (const prototype of prototypes)
        {
            if (!isObject(prototype))
                handleCorruptInquiryResult();
        }
        return prototypes;
    }
};

const doThisSupplierInquiry =
obj =>
{
    const thisSupplier = inquire(obj, THIS_SUPPLIER_INQUIRY_KEY);
    if (thisSupplier !== undefined && !isCallable(thisSupplier))
        handleCorruptInquiryResult();
    return thisSupplier;
};

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
                prototypes = doPrototypesInquiry(prototype);
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
    let prototypes = doPrototypesInquiry(obj);
    if (!prototypes)
    {
        const prototype = _Object_getPrototypeOf(obj);
        prototypes = prototype !== null ? [prototype] : EMPTY_ARRAY;
    }
    return prototypes;
};

const handleCorruptInquiryResult =
() =>
{
    throw _TypeError('Corrupt inquiry result');
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

const inquire =
(obj, key) =>
{
    const receiver = { __proto__: null, [INQUIRY_TARGET_KEY]: obj };
    _Reflect_get(obj, key, receiver);
    const value = receiver[INQUIRY_RESULT_KEY];
    return value;
};

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
                        installHasInstanceAndBind(constructor, installedSet);
                }
                {
                    const prototype = _Object_getPrototypeOf(obj);
                    if (prototype === null)
                    {
                        installStub(obj, 'isPrototypeOf', IS_PROTOTYPE_OF_HANDLER);
                        break;
                    }
                    obj = prototype;
                }
            }
        }
    }
}

const installHasInstanceAndBind =
(obj, installedSet) =>
{
    if (!installedSet.has(obj))
    {
        installedSet.add(obj);
        const prototypes = getPrototypesOf(obj);
        let installed = false;
        for (const prototype of prototypes)
        {
            if (isFunctionPrototype(prototype))
                installStub(prototype, 'bind', BIND_HANDLER);
            else
            {
                installHasInstanceAndBind(prototype, installedSet);
                installed = true;
            }
        }
        if (!installed)
            defineHasInstanceProperty(obj);
    }
};

const installStub =
(obj, prop, handler) =>
{
    const descriptor = _Object_getOwnPropertyDescriptor(obj, prop);
    const value = descriptor?.value;
    if (value && isNonConstructorNativeFunction(value, prop))
    {
        descriptor.value = new _Proxy(value, handler);
        _Object_defineProperty(obj, prop, descriptor);
    }
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
    if (isNonConstructorNativeFunction(obj, ''))
    {
        const descriptor = _Object_getOwnPropertyDescriptor(obj, _Symbol_hasInstance);
        if
        (
            descriptor &&
            !descriptor.writable &&
            !descriptor.enumerable &&
            !descriptor.configurable &&
            isNonConstructorNativeFunction(descriptor.value, '[Symbol.hasInstance]')
        )
            return true;
    }
    return false;
};

const isInPrototypeTree =
(target, obj) =>
getPrototypesOf(obj)
.some(prototype => prototype === target || isInPrototypeTree(target, prototype));

const isInquiryReceiverFor =
(receiver, proxy) =>
isObject(receiver) &&
_Object_getPrototypeOf(receiver) === null &&
receiver !== proxy &&
receiver[INQUIRY_TARGET_KEY] === proxy;

const isNonConstructorNativeFunction =
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
    const groups = /^function (.*)\(\) {\s+\[native code]\s}$/.exec(str);
    const returnValue = groups != null && groups[1] === name && !isConstructor(obj);
    return returnValue;
};

const isNonNullPrimitive = obj => obj === undefined || isNonNullishPrimitive(obj);

const isNonNullishPrimitive = obj => !OBJECT_OR_NULL_OR_UNDEFINED_TYPES.includes(typeof obj);

const isNonUndefinedPrimitive = obj => obj === null || isNonNullishPrimitive(obj);

const isObject = obj => obj !== null && !isNonNullPrimitive(obj);

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

const propFilter = prop => obj => prop in obj;

export { classes, defineGlobally, getPrototypeListOf };
