/**
 * Polytype TypeScript example code for Node.js.
 *
 * Requires Node.js >= 16, TypeScript >= 4.7.
 *
 * Run from command line with:
 *      npx ts-node example/ColoredCircle.js
 */

import { classes, getPrototypeListOf } from "polytype";

class Circle
{
    public centerX: number | undefined;
    public centerY: number | undefined;
    public constructor(centerX?: number, centerY?: number, public radius = 1)
    {
        this.moveTo(centerX, centerY);
    }
    public get diameter(): number { return this.radius * 2; }
    public set diameter(diameter: number) { this.radius = diameter / 2; }
    public moveTo(centerX?: number, centerY?: number): void
    {
        this.centerX = centerX;
        this.centerY = centerY;
    }
    public reset(): void
    {
        this.moveTo(0, 0);
        this.radius = 1;
    }
    public toString(): string
    {
        return `circle with center (${this.centerX}, ${this.centerY}) and radius ${this.radius}`;
    }
}

class ColoredObject
{
    public constructor(public color?: string) { }
    public static areSameColor(obj1: ColoredObject, obj2: ColoredObject): boolean
    {
        return obj1.color === obj2.color;
    }
    public paint(): void { console.log(`painting in ${this.color}`); }
    public reset(): void { this.color = "white"; }
    public toString(): string { return `${this.color} object`; }
}

class ColoredCircle
extends classes(Circle, ColoredObject) // Base classes as comma‐separated params
{
    public constructor(centerX?: number, centerY?: number, radius?: number, color?: string)
    {
        super
        (
            [centerX, centerY, radius], // Circle constructor params
            [color],                    // ColoredObject constructor params
        );
    }
    public paint(): void
    {
        super.paint(); // Using method paint from some base class
    }
    public reset(): void
    {
        for (const baseClass of getPrototypeListOf(ColoredCircle) as { reset(): void; }[])
            baseClass.reset();
    }
    public toString(): string
    {
        // Using method toString from base class Circle
        const circleString = super.class(Circle).toString();
        return `${circleString} in ${this.color}`;
    }
}

class GreenCircle
extends classes(Circle, ColoredObject)
{
    public constructor(centerX: number, centerY: number, radius: number)
    {
        super
        (
            { super: ColoredObject, arguments: ["green"] },
            { super: Circle, arguments: [centerX, centerY, radius] },
        );
    }
}

class WhiteUnitCircle
extends classes(Circle, ColoredObject)
{
    public constructor()
    {
        super(); // Base constructors invoked without parameters
        this.centerX    = 0;
        this.centerY    = 0;
        // The radius has been already set to 1 by the Circle constructor.
        this.color      = "white";
    }
}

const c = new ColoredCircle();

c.moveTo(42, 31);
c.radius = 2;
c.color = "red";
console.log(c.centerX, c.centerY);  // 42, 31
console.log(c.diameter);            // 4
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

function getBaseNames(derivedClass: Function): string[]
{
    return getPrototypeListOf(derivedClass).map(({ name }: { name: string; }): string => name);
}

console.log(getBaseNames(ColoredCircle));   // ["Circle", "ColoredObject"]
console.log(getBaseNames(Int8Array));       // ["TypedArray"]
console.log(getBaseNames(Circle));          // [""] i.e. [Function.prototype.name]

type Hello<T> = T & { sayHello(): void; };
(Circle.prototype as Hello<Circle>).sayHello = (): void => console.log("Hello!");
(c as Hello<ColoredCircle>).sayHello(); // "Hello!"
