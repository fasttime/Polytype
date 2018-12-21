# Proxymi

[![NPM](https://nodei.co/npm/proxymi.png?compact=true)](https://nodei.co/npm/proxymi/)

**Proxy-based multiple inheritance for JavaScript. Without mixins.**

**Proxymi** is a library that adds support for dynamic
[multiple inheritance](https://en.wikipedia.org/wiki/Multiple_inheritance) to JavaScript with a
simple syntax.
“Dynamic” means that changes to base classes at runtime are reflected immediately in all derived
classes just like programmers would expect when working with single prototype inheritance.
So easy.

Proxymi uses
[proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
along with other relatively new language features to provide multiple inheritance.
Some of these features are not yet well supported in all browsers.
As of today, Proxymi runs in **current versions of Chrome, Firefox,
Safari<sup>[[notes](#compatibility "Safari is only partially supported. See the Compatibility
section for details.")]</sup>, Opera and in Node.js**.
As JavaScript support in other browsers improves, Proxymi will start to run in those browsers, too.

## Features

* C++ style multiple inheritance
* Works in Node.js and in most browsers
* Zero dependencies
* Qualified or unqualified access to all base class features
  * constructors
  * methods, getters and setters – both static and nonstatic
  * value properties on base classes and base instance prototypes
* `in`, `instanceof` and `isPrototypeOf` integration

## Setup Instructions

### In the Browser

To use Proxymi in your project, download
[proxymi.js](https://raw.githubusercontent.com/fasttime/Proxymi/master/lib/proxymi.js) or
[proxymi.min.js](https://raw.githubusercontent.com/fasttime/Proxymi/master/lib/proxymi.min.js) from
GitHub and include it in your HTML file.

```html
<script src="proxymi.js"></script>
```

Alternatively, you can hotlink the current stable version using a CDN of your choice.

```html
<script src="https://gitcdn.xyz/repo/fasttime/Proxymi/master/lib/proxymi.min.js"></script>
```

### In Node.js

If you are using Node.js 8 or later, you can install Proxymi with [npm](https://www.npmjs.org).

```console
npm install proxymi
```

Then you can use it in your code.

```js
require("proxymi");
```

## Usage

### Inherit from more than one base class

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
    toString()
    {
        return `circle with center (${this.centerX}, ${this.centerY}) and radius ${this.radius}`;
    }
}

class ColoredObject
{
    static areSameColor(obj1, obj2) { return obj1.color === obj2.color; }
    constructor(color) { this.color = color; }
    paint() { console.log(`painting in ${this.color}`); }
    toString() { return `${this.color} object`; }
}

class ColoredCircle
extends classes(Circle, ColoredObject) // Base classes in a comma-separated list
{
    // Add methods here.
}
```

### Use methods and accessors from all base classes

```js
const c = new ColoredCircle();

c.moveTo(42, 31);
c.radius = 1;
c.color = 'red';
console.log(c.centerX, c.centerY);  // 42, 31
console.log(c.diameter);            // 2
c.paint();                          // "painting in red"
```

### `instanceof` works just like it should

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

Proxymi takes care that this test still works well with multiple inheritance.

```js
console.log(ColoredCircle.prototype instanceof Circle);         // true
console.log(ColoredCircle.prototype instanceof ColoredObject);  // true
console.log(ColoredCircle.prototype instanceof ColoredCircle);  // false
console.log(ColoredCircle.prototype instanceof Object);         // true
console.log(Circle.prototype instanceof ColoredObject);         // false
```

### `isPrototypeOf` works fine, too

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

### Invoke multiple base constructors

Use arrays to group together parameters for each base constructor in the derived class constructor.

```js
class ColoredCircle
extends classes(Circle, ColoredObject)
{
    constructor(centerX, centerY, radius, color)
    {
        super(
            [centerX, centerY, radius], // Circle constructor params
            [color]                     // ColoredObject constructor params
        );
    }
}
```

If you prefer to keep parameter lists associated to their base classes explicitly without relying on
order, there is an alternative syntax.

```js
class ColoredCircle
extends classes(Circle, ColoredObject)
{
    constructor(centerX, centerY, radius, color)
    {
        super(
            { super: ColoredObject, arguments: [color] },
            { super: Circle, arguments: [centerX, centerY, radius] }
        );
    }
}
```

There is no need to specify an array of parameters for each base constructor.
If the parameter arrays are omitted, the base constructors will still be invoked without parameters.

```js
class ColoredCircle
extends classes(Circle, ColoredObject)
{
    constructor()
    {
        super(); // Base constructors invoked without parameters
        this.centerX    = 0;
        this.centerY    = 0;
        this.radius     = 1;
        this.color      = 'white';
    }
}
```

### Use base class methods and accessors

As usual, the keyword `super` invokes a base class method or accessor when used inside a derived
class.

```js
class ColoredCircle
extends classes(Circle, ColoredObject)
{
    paint()
    {
        console.log("Using method paint of some base class");
        super.paint();
    }
}
```

If different base classes include a method or accessor with the same name, the syntax
```js
super.class(DirectBaseClass).methodOrAccessor
```
can be used to make the invocation unambiguous.

```js
class ColoredCircle
extends classes(Circle, ColoredObject)
{
    toString()
    {
        // Using method toString of base class Circle
        const circleString = super.class(Circle).toString();
        return `${circleString} in ${this.color}`;
    }
}
```

### Static methods and accessors are inherited, too

```js
ColoredCircle.areSameColor(c1, c2)
```
same as
```js
ColoredObject.areSameColor(c1, c2)
```

### Dynamic base class changes

If a property in a base class is added, removed or modified at runtime, the changes are immediately
reflected in all derived classes. This is the magic of proxies.

```js
const c = new ColoredCircle();

Circle.prototype.foo = () => console.log("foo");
c.foo(); // print "foo"
```

## Compatibility

Proxymi was successfully tested in the following browsers / JavaScript engines.

* Chrome 54+
* Firefox 51+
* Safari 12 *(Partial support. See notes below.)*
* Opera 41+
* Node.js 8+

Because of poor ECMAScript compliance, Safari accepts non-constructor functions (such as arrow
functions, generators, etc.) as arguments to `classes`, although it does not allow instantiating
classes derived from such functions.
Also, Safari does not throw a `TypeError` when attempting to assign to a read-only property of a
Proxymi class or object in strict mode.

In the current version of Edge, the JavaScript engine Chakra has
[a serious bug](https://github.com/Microsoft/ChakraCore/issues/5883) that can produce incorrect
results when the `instanceof` operator is used with bound functions after Proxymi has been loaded.
For this reason it is recommended not to use Proxymi in Edge as long as this issue persists.
