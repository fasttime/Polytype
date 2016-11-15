# Proxymi

[![NPM](https://nodei.co/npm/proxymi.png?compact=true)](https://nodei.co/npm/proxymi/)

**Proxy-based multiple inheritance for ES6. Without mixins.**

**Proxymi** is a JavaScript library that adds dynamic multiple inheritance to JavaScript with a
simple syntax.
“Dynamic” means that runtime changes to base classes are reflected immediately in all derived
classes just like programmers would expect when working with single prototype inheritance.
So easy.

Proxymi uses
[proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
along with other new features introduced by ECMAScript 6 to provide multiple inheritance.
Some of these features are not yet widely supported.
As of today, Proxymi works in **current versions of Chrome, Firefox, Opera and in Node.js 6 or
later**.
As ES6 support in other browsers will improve, Proxymi will start to run in those browsers, too.

## Setup Instructions

### In the Browser

To use Proxymi in your project, download
[proxymi.js](https://github.com/fasttime/Proxymi/blob/master/lib/proxymi.js) from GitHub and
include it in your HTML file.

```html
<script src="proxymi.js"></script>
```

Alternatively, you can hotlink the online file.

```html
<script src="https://rawgithub.com/fasttime/Proxymi/master/lib/proxymi.js"></script>
```

### In Node.js

If you are using Node.js 6 or later, you can install Proxymi with [npm](https://www.npmjs.org).

```
npm install proxymi
```

Then you can use it in your code.

```js
require("proxymi");
```

## Usage

#### Inherit from more than one base class

For example, declare a derived class `ColoredCircle` that inherits from both base classes `Circle`
and `ColoredObject`.

```js
class Circle
{
    constructor(centerX, centerY, radius)
    {
        this.centerX    = centerX;
        this.centerY    = centerY;
        this.radius     = radius;
    }
    get diameter() { return this.radius * 2; }
    set diameter(diameter) { this.radius = diameter / 2; }
    moveTo(centerX, centerY)
    {
        this.centerX    = centerX;
        this.centerY    = centerY;
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
}
```

#### Use methods and accessors from all base classes

```js
let c = new ColoredCircle();
c.moveTo(42, 31);
c.radius = 1;
c.color = 'red';
console.log(c.centerX, c.centerY);  // 42, 31
console.log(c.diameter);            // 2
c.paint();                          // "painting in red"
```

#### `instanceof` works just like it should

```js
let c = new ColoredCircle();
console.log(c instanceof Circle);           // true
console.log(c instanceof ColoredObject);    // true
console.log(c instanceof ColoredCircle);    // true
console.log(c instanceof Object);           // true
console.log(c instanceof Array);            // false
```

#### Invoke multiple base constructors

Use arrays to group together parameters for each base constructor in the derived class constructor.

```js
class ColoredCircle
extends classes(Circle and ColoredObject)
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

#### Use methods and accessors from a specific base class

If different base classes declare a method or accessor with the same name, the syntax
`super.class(BaseClass).methodOrAccessor` can be used to make the invocation unambiguous.

```js
class ColoredCircle
extends classes(Circle, ColoredObject)
{
    toString()
    {
        // Use method toString from base class Circle
        let circleString = super.class(Circle).toString();
        return `${circleString} in ${this.color}`;
    }
}
```

#### Static methods and accessors are inherited, too

```js
ColoredCircle.areSameColor(c1, c2)
```

same as

```js
ColoredObject.areSameColor(c1, c2)
```

#### Dynamic base class changes

If a property in a base class is added, removed or modified at runtime, the changes are immediately
reflected in all derived classes. This is the magic of proxies.

```js
let c = new ColoredCircle();

Circle.prototype.foo = () => console.log("foo");

c.foo(); // print "foo"
```
