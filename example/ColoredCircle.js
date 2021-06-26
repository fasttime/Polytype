"use strict";

const { classes, getPrototypeListOf } = require("..");

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
    constructor(centerX, centerY, radius, color)
    {
        super
        (
            [centerX, centerY, radius], // Circle constructor params
            [color]                     // ColoredObject constructor params
        );
    }
    paint()
    {
        super.paint(); // Using method paint from some base class
    }
    reset()
    {
        for (const baseClass of getPrototypeListOf(ColoredCircle))
            baseClass.reset();
    }
    toString()
    {
        // Using method toString from base class Circle
        const circleString = super.class(Circle).toString();
        return `${circleString} in ${this.color}`;
    }
}

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

const c = new ColoredCircle();

c.moveTo(42, 31);
c.radius = 1;
c.color = "red";
console.log(c.centerX, c.centerY);  // 42, 31
console.log(c.diameter);            // 2
c.paint();                          // "painting in red"

console.log(c instanceof Circle);           // true
console.log(c instanceof ColoredObject);    // true
console.log(c instanceof ColoredCircle);    // true
console.log(c instanceof Object);           // true
console.log(c instanceof Array);            // false

console.log(ColoredCircle.prototype instanceof Circle);         // true
console.log(ColoredCircle.prototype instanceof ColoredObject);  // true
console.log(ColoredCircle.prototype instanceof ColoredCircle);  // false
console.log(ColoredCircle.prototype instanceof Object);         // true
console.log(Circle.prototype instanceof ColoredObject);         // false

console.log("moveTo" in c); // true
console.log("paint" in c);  // true

console.log("areSameColor" in ColoredCircle);   // true
console.log("areSameColor" in Circle);          // false
console.log("areSameColor" in ColoredObject);   // true

console.log(Circle.prototype.isPrototypeOf(c));         // true
console.log(ColoredObject.prototype.isPrototypeOf(c));  // true
console.log(ColoredCircle.prototype.isPrototypeOf(c));  // true
console.log(Object.prototype.isPrototypeOf(c));         // true
console.log(Array.prototype.isPrototypeOf(c));          // false

console.log(Circle.isPrototypeOf(ColoredCircle));               // true
console.log(ColoredObject.isPrototypeOf(ColoredCircle));        // true
console.log(ColoredCircle.isPrototypeOf(ColoredCircle));        // false
console.log(Object.isPrototypeOf(ColoredCircle));               // false
console.log(Function.prototype.isPrototypeOf(ColoredCircle));   // true

function getBaseNames(derivedClass)
{
    return getPrototypeListOf(derivedClass).map(({ name }) => name);
}

console.log(getBaseNames(ColoredCircle));   // ["Circle", "ColoredObject"]
console.log(getBaseNames(Int8Array));       // ["TypedArray"]
console.log(getBaseNames(Circle));          // [""] i.e. [Function.prototype.name]

Circle.prototype.sayHello = () => console.log("Hello!");
c.sayHello(); // "Hello!"
