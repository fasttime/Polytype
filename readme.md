# Polytype · [![npm version][npm badge]][npm url]

**Dynamic multiple inheritance for JavaScript and TypeScript. Without mixins.**

**Polytype** is a library that adds support for dynamic
[multiple inheritance](https://en.wikipedia.org/wiki/Multiple_inheritance) to JavaScript and
TypeScript with a simple syntax.
“Dynamic” means that changes to base classes at runtime are reflected immediately in all derived
classes just as programmers would expect when working with single prototype inheritance.

As of today, Polytype runs in **current versions of all major browsers** and in
**Node.js**<sup>([*](#compatibility))</sup>.

## Contents

- [Contents](#contents)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
  * [In Node.js](#in-nodejs)
  * [In the browser](#in-the-browser)
- [Usage](#usage)
  * [Inheriting from multiple base classes](#inheriting-from-multiple-base-classes)
  * [Using methods and properties from multiple base classes](#using-methods-and-properties-from-multiple-base-classes)
  * [Static methods and properties](#static-methods-and-properties)
  * [Invoking multiple base constructors](#invoking-multiple-base-constructors)
  * [`instanceof`](#instanceof)
  * [`in`](#in)
  * [`isPrototypeOf`](#isprototypeof)
  * [Finding the base classes](#finding-the-base-classes)
  * [Dispatching invocations to multiple base classes](#dispatching-invocations-to-multiple-base-classes)
  * [Dynamic base class changes](#dynamic-base-class-changes)
- [TypeScript support](#typescript-support)
- [Caveats](#caveats)
  * [`for...in` iterations](#forin-iterations)
  * [Member resolution order](#member-resolution-order)
  * [Ambiguous protected instance members](#ambiguous-protected-instance-members)
- [Compatibility](#compatibility)

## Features

* Python style multiple inheritance
* Works in Node.js and in most browsers
* Full TypeScript support
* Zero dependencies
* Qualified or unqualified access to all base class features
  * constructors
  * methods, getters and setters – both static and nonstatic
  * value properties on base classes and base instance prototypes
  * public [class fields](https://github.com/tc39/proposal-class-fields) (in engines that support
    them)
* `in`, `instanceof` and `isPrototypeOf` integration

## Setup Instructions

Polytytpe is available in two flavors: a module build (comprising CommonJS and ECMAScript modules)
with exported definitions and a script build where all definitions are accessible through global
objects.
Apart from this, both builds provide the same features and are available in the standard package.

### In Node.js

If you are using Node.js, you can install Polytype with [npm](https://www.npmjs.org).

```console
npm install polytype
```

Then you can import it in your code like any module.

```js
const { classes } = require("polytype"); // CommonJS syntax
```
or
```js
import { classes } from "polytype"; // ECMAScript module syntax
```

In TypeScript you can also import certain types where necessary.

```ts
import { SuperConstructorInvokeInfo } from "polytype";
```

Alternatively, you can import the script build at the start of your application and access Polytype
definitions through global objects.

```js
require("polytype/global"); // CommonJS syntax
```
or
```js
import "polytype/global"; // ECMAScript module syntax
```

### In the browser

In an HTML‐based application, the script build of Polytype can be simply embedded.
Just download
[polytype.min.js](https://cdn.jsdelivr.net/npm/polytype@0.9.2/lib/polytype.min.js) and include
it in your HTML file.

```html
<script src="polytype.min.js"></script>
```

Alternatively, you can hotlink the script from the latest release package using a CDN of your
choice.

```html
<script src="https://cdn.jsdelivr.net/npm/polytype@0.9.2/lib/polytype.min.js"></script>
```

If your browser application already uses ECMAScript modules, you can also import the module build
(“.mjs”) in contexts where Polytype specific definitions like `classes` are required.
This has the advantage to avoid possible naming conflicts on global objects.

```js
import { classes } from "https://cdn.jsdelivr.net/npm/polytype@0.9.2/lib/polytype.min.mjs";
```

## Usage

### Inheriting from multiple base classes

For example, declare a derived class `ColoredCircle` that inherits from both base classes `Circle`
and `ColoredObject`.

```js
class Circle
{
    constructor(centerX, centerY, radius)
    {
        this.moveTo(centerX, centerY);
        this.radius = radius;
    }
    get diameter() { return this.radius * 2; }
    set diameter(diameter) { this.radius = diameter / 2; }
    moveTo(centerX, centerY)
    {
        this.centerX = centerX;
        this.centerY = centerY;
    }
    reset()
    {
        this.moveTo(0, 0);
        this.radius = 1;
    }
    toString()
    {
        return `circle with center (${this.centerX}, ${this.centerY}) and radius ${this.radius}`;
    }
}

class ColoredObject
{
    constructor(color) { this.color = color; }
    static areSameColor(obj1, obj2) { return obj1.color === obj2.color; }
    paint() { console.log(`painting in ${this.color}`); }
    reset() { this.color = "white"; }
    toString() { return `${this.color} object`; }
}

class ColoredCircle
extends classes(Circle, ColoredObject) // Base classes as comma‐separated params
{
    // Add methods here.
}
```

### Using methods and properties from multiple base classes

```js
const c = new ColoredCircle();

c.moveTo(42, 31);
c.radius = 1;
c.color = "red";
console.log(c.centerX, c.centerY);  // 42, 31
console.log(c.diameter);            // 2
c.paint();                          // "painting in red"
```

As usual, the keyword `super` invokes a base class method or property accessor when used inside a
derived class.

```js
class ColoredCircle
extends classes(Circle, ColoredObject)
{
    paint()
    {
        super.paint(); // Using method paint from some base class
    }
}
```

If different base classes include a member with the same name, the syntax
```js
super.class(DirectBaseClass).member
```
can be used to make the member access unambiguous.

```js
class ColoredCircle
extends classes(Circle, ColoredObject)
{
    toString()
    {
        // Using method toString from base class Circle
        const circleString = super.class(Circle).toString();
        return `${circleString} in ${this.color}`;
    }
}
```

More generally, `super.class(DirectBaseClass)[propertyKey]` can be used to reference a (possibly
inherited) property of a particular direct base class in the body of a derived class.

**Note:**
In TypeScript, the syntax described here cannot be used to access protected instance members, so it
is currently not possible to disambiguate between protected instance members having the same name,
the same index or the same symbol in different base classes.

### Static methods and properties

Static methods and property accessors are inherited, too.

```js
ColoredCircle.areSameColor(c1, c2)
```
same as
```js
ColoredObject.areSameColor(c1, c2)
```

### Invoking multiple base constructors

In the constructor of a derived class, use arrays to group together parameters to be passed to the
constructors of each direct base class.

```js
class ColoredCircle
extends classes(Circle, ColoredObject)
{
    constructor(centerX, centerY, radius, color)
    {
        super
        (
            [centerX, centerY, radius], // Circle constructor params
            [color]                     // ColoredObject constructor params
        );
    }
}
```

If you prefer to keep parameter lists associated to their base classes explicitly without relying on
order, there is an alternative syntax.

```js
class GreenCircle
extends classes(Circle, ColoredObject)
{
    constructor(centerX, centerY, radius)
    {
        super
        (
            { super: ColoredObject, arguments: ["green"] },
            { super: Circle, arguments: [centerX, centerY, radius] }
        );
    }
}
```

There is no need to specify an array of parameters for each direct base constructor.
If the parameter arrays are omitted, the base constructors will still be invoked without parameters.

```js
class WhiteUnitCircle
extends classes(Circle, ColoredObject)
{
    constructor()
    {
        super(); // Base constructors invoked without parameters
        this.centerX    = 0;
        this.centerY    = 0;
        this.radius     = 1;
        this.color      = "white";
    }
}
```

### `instanceof`

The `instanceof` operator works just as it should.

```js
const c = new ColoredCircle();

console.log(c instanceof Circle);           // true
console.log(c instanceof ColoredObject);    // true
console.log(c instanceof ColoredCircle);    // true
console.log(c instanceof Object);           // true
console.log(c instanceof Array);            // false
```

In pure JavaScript, the expression
```js
B.prototype instanceof A
```
determines if `A` is a base class of class `B`.

Polytype takes care that this test still works well with multiple inheritance.

```js
console.log(ColoredCircle.prototype instanceof Circle);         // true
console.log(ColoredCircle.prototype instanceof ColoredObject);  // true
console.log(ColoredCircle.prototype instanceof ColoredCircle);  // false
console.log(ColoredCircle.prototype instanceof Object);         // true
console.log(Circle.prototype instanceof ColoredObject);         // false
```

### `in`

The `in` operator determines whether a property is in an object or in its prototype chain.
In the case of multiple inheritance, the prototype “chain” looks more like a directed graph, yet the
function of the `in` operator is the same.

```js
const c = new ColoredCircle();

console.log("moveTo" in c); // true
console.log("paint" in c);  // true
```

```js
console.log("areSameColor" in ColoredCircle);   // true
console.log("areSameColor" in Circle);          // false
console.log("areSameColor" in ColoredObject);   // true
```

### `isPrototypeOf`

`isPrototypeOf` works fine, too.

```js
const c = new ColoredCircle();

console.log(Circle.prototype.isPrototypeOf(c));         // true
console.log(ColoredObject.prototype.isPrototypeOf(c));  // true
console.log(ColoredCircle.prototype.isPrototypeOf(c));  // true
console.log(Object.prototype.isPrototypeOf(c));         // true
console.log(Array.prototype.isPrototypeOf(c));          // false
```

```js
console.log(Circle.isPrototypeOf(ColoredCircle));               // true
console.log(ColoredObject.isPrototypeOf(ColoredCircle));        // true
console.log(ColoredCircle.isPrototypeOf(ColoredCircle));        // false
console.log(Object.isPrototypeOf(ColoredCircle));               // false
console.log(Function.prototype.isPrototypeOf(ColoredCircle));   // true
```

### Finding the base classes

In single inheritance JavaScript, the direct base class of a derived class is obtained with
`Object.getPrototypeOf`.

```js
const DirectBaseClass = Object.getPrototypeOf(DerivedClass);
```

If a class has no explicit `extends` clause, `Object.getPrototypeOf` returns `Function.prototype`,
the ancestor of all classes.

Of course this method cannot work with multiple inheritance, since there is no way to return
multiple classes without packing them in some kind of structure.
For this and other use cases, Polytype exports the function `getPrototypeListOf`, which can be used
to get an array of direct base classes given a derived class.

```js
const { getPrototypeListOf } = require("polytype"); // Or some other kind of import.

function getBaseNames(derivedClass)
{
    return getPrototypeListOf(derivedClass).map(({ name }) => name);
}

console.log(getBaseNames(ColoredCircle));   // ["Circle", "ColoredObject"]
console.log(getBaseNames(Int8Array));       // ["TypedArray"]
console.log(getBaseNames(Circle));          // [""] i.e. [Function.prototype.name]
```

When the the script build of Polytype is used, no functions will be exported.
Instead, `getPrototypeListOf` will be defined globally as `Object.getPrototypeListOf`.

### Dispatching invocations to multiple base classes

Sometimes it is useful to have a method or setter invocation dispatched to all direct base classes
rather than just to one of them.
Common examples are event handlers and Angular lifecycle hooks implemented in multiple base classes.

Polytype has no dedicated syntax for this use case: simply override the method or setter in the
derived class and invoke the base implementations from there.

```js
class ColoredCircle
extends classes(Circle, ColoredObject)
{
    reset()
    {
        super.class(Circle).reset();
        super.class(ColoredObject).reset();
    }
}
```

This can also be done with an iteration instead of referencing the base classes one by one.

```js
class ColoredCircle
extends classes(Circle, ColoredObject)
{
    reset()
    {
        for (const baseClass of getPrototypeListOf(ColoredCircle))
            baseClass.reset();
    }
}
```

### Dynamic base class changes

If a property in a base class is added, removed or modified at runtime, the changes are immediately
reflected in all derived classes.

```js
const c = new ColoredCircle();

Circle.prototype.sayHello = () => console.log("Hello!");
c.sayHello(); // "Hello!"
```

## TypeScript support

Polytype has built‐in TypeScript support: you can take advantage of type checking while working with
multiple inheritance without installing any additional packages.
If you are using an IDE that supports TypeScript code completion like Visual Studio Code, you will
get multiple inheritance sensitive suggestions as you type.
A TypeScript version of the `ColoredCircle` sample code above can be found in
[ColoredCircle.ts](https://github.com/fasttime/Polytype/blob/0.9.2/example/ColoredCircle.ts)
in the example folder.

## Caveats

Neither JavaScript nor TypeScript offer native support for multiple inheritance of any kind.
Polytype strives to make up for this deficiency, but some important limitations remain.

### `for...in` iterations

Following previous work made in TypeScript and other transpilers, some newer JavaScript engines have
implemented support for
[static fields](https://github.com/tc39/proposal-static-class-features#static-public-fields).
Static fields are only one way of defining
[enumerable properties][Enumerability and ownership of properties] on a class constructor.

When only single inheritance is used, a `for...in` iteration over a class constructor enumerates not
only names of enumerable properties defined on the constructor of that class, but also names of
enumerable properties defined on all constructors in its prototype chain.

```js
class FooClass
{
    static foo = "foo";
}

class BarClass extends FooClass
{
    static bar = "bar";
}

for (const name in BarClass)
    console.log(name); // Prints "bar" and "foo".
```

As it happens, this behavior no longer holds with Polytype multiple inheritance.
The effect is that names of static fields and other enumerable properties defined on a base
constructor are not enumerated by `for...in` statements when the inheritance line crosses a class
listed in some `extends classes(...)` clause.

```js
class BazClass extends classes(FooClass)
{
    static baz = "baz";
}

for (const name in BazClass)
    console.log(name); // Prints just "baz".
```

For this reason, and because generally [better alternatives exist][Why Use for...in?], iterating
over Polytype classes and their derived classes with `for...in` is not recommended.

### Member resolution order

Multiple base classes may expose members with the same name, the same index or the same symbol.
When this happens, any unqualified access to one of those members will have to determine the
implementation to be used.
The approach taken by Polytype is to pick the implementation found in the first direct base class
that contains the (possibly inherited) member.

```js
class A
{ }

class B
{
    whoAmI() { console.log("B"); }
}

class C
{
    whoAmI() { console.log("C"); }
}

class ABC extends classes(A, B, C)
{ }

const abc = new ABC();
abc.whoAmI(); // Prints "B".
```

This is similar to the depth‐first search algorithm of old‐style classes in Python 2, but it is
different from the behavior of several other programming languages that support multiple
inheritance, and it may not match your expectations if you come from a C++ background.

### Ambiguous protected instance members

When a derived class inherits from multiple base classes, it is possible for inherited members in
different base classes to share the same property key, i.e. the same name, the same index or the
same symbol.
For these cases, Polytype provides the syntax `super.class(DirectBaseClass)[propertyKey]` to specify
the direct base class containing the member to be accessed.
This works all the time in JavaScript and works in TypeScript for any public or static member, but
results in a compiler error when applied to a
[protected](https://www.typescriptlang.org/docs/handbook/classes.html#understanding-protected)
instance member.

```ts
class RecordLeft
{
    protected id: number;
}

class RecordRight
{
    protected id: string;
}

class Record extends classes(RecordLeft, RecordRight)
{
    public printRightId(): void
    {
        // error TS2446: Property 'id' is protected…
        console.log(super.class(RecordRight).id.padStart(10, ' '));
    }
}
```

As a type‐safe workaround, use an intermediate class to expose the inherited member using a
different name without making it public.

```ts
class RecordRightProxy extends RecordRight
{
    protected get rightId(): string
    {
        return super.id;
    }
}

class Record extends classes(RecordLeft, RecordRightProxy)
{
    public printRightId(): void
    {
        console.log(super.rightId.padStart(10, ' ')); // OK
    }
}
```

## Compatibility

Polytype was successfully tested in the following browsers/JavaScript engines.

* Chrome 71+
* Safari 13+
* Edge 79+
* Firefox 67+
* Opera 58+
* Node.js 13.2+

The minimum supported TypeScript version is 3.5.

Bundlers and other tools that process uncompressed Polytype source files are required to parse
ECMAScript 2020 or higher syntax.

[npm badge]: https://badge.fury.io/js/polytype.svg
[npm url]: https://www.npmjs.com/package/polytype
[Why Use for...in?]:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in#Why_Use_for...in
[Enumerability and ownership of properties]:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties
