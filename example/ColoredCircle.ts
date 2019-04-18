import "proxymi";

class Circle
{
    public centerX?: number;
    public centerY?: number;
    public constructor(centerX?: number, centerY?: number, public radius?: number)
    {
        this.moveTo(centerX, centerY);
    }
    public get diameter(): number { return this.radius as number * 2; }
    public set diameter(diameter: number) { this.radius = diameter / 2; }
    public moveTo(centerX?: number, centerY?: number): void
    {
        this.centerX = centerX;
        this.centerY = centerY;
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
    public toString(): string { return `${this.color} object`; }
}

class ColoredCircle
extends classes(Circle, ColoredObject) // Base classes as comma-separated params
{
    public constructor(centerX?: number, centerY?: number, radius?: number, color?: string)
    {
        super
        (
            [centerX, centerY, radius], // Circle constructor params
            [color]                     // ColoredObject constructor params
        );
    }
    public paint(): void
    {
        super.paint(); // Using method paint from some base class
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
            { super: Circle, arguments: [centerX, centerY, radius] }
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

type Hello<T> = T & { sayHello(): void; };
(Circle.prototype as Hello<Circle>).sayHello = (): void => console.log("Hello!");
(c as Hello<ColoredCircle>).sayHello(); // "Hello!"
