<a name="0.9.0"></a>
## [0.9.0](https://github.com/fasttime/Polytype/releases/tag/0.9.0) (2020-02-29)

* Fixes and breaking changes in the way `super.class(...)` works:
  * Inside of methods called with `super.class(...).methodName(...)` or
`super.class(...)[methodKey](...)`, the value of `this` is now the same as in the calling context.
  * Increments, decrements and compound assignments on properties of a `super.class(...)` target
work as intended.
  * Getting a property from a `super.class(...)` target no longer throws a `TypeError` in some
special cases where the current object (`this`) has a non‐configurable own property with the same
key.
  * Getting a property with function value from a `super.class(...)` target no longer retrieves the
original function, but a proxy of it.
This is a side effect of other changes.
* New in documentation and code examples: *Dispatching invocations to multiple base classes*.
* Minor improvements to the documentation.

<a name="0.8.1"></a>
## [0.8.1](https://github.com/fasttime/Polytype/releases/tag/0.8.1) (2020-02-21)

* Fixed and clarified parts of the documentation.

<a name="0.8.0"></a>
## [0.8.0](https://github.com/fasttime/Polytype/releases/tag/0.8.0) (2020-02-08)

* It is now safe to load Polytype multiple times even from mixed sources and in different realms.
* Dropped support for Node.js &lt; 13.2.

<a name="0.7.0"></a>
## [0.7.0](https://github.com/fasttime/Polytype/releases/tag/0.7.0) (2020-01-20)

* Edge 79+ compatibility.
* Dropped support for older engines and tools.
* Updated package.json keywords.

<a name="0.6.1"></a>
## [0.6.1](https://github.com/fasttime/Polytype/releases/tag/0.6.1) (2019-10-20)

* Fixed behavior of method `isPrototypOf` with cross‐realm types.

<a name="0.6.0"></a>
## [0.6.0](https://github.com/fasttime/Polytype/releases/tag/0.6.0) (2019-10-19)

* Fixed issues with cross‐realm types.
* Improved documentation.

<a name="0.5.0"></a>
## [0.5.0](https://github.com/fasttime/Polytype/releases/tag/0.5.0) (2019-10-11)

* Clustered constructors can now be recognized as instances by the `Function` constructor.
This change addresses a compatibility issue with Angular.

<a name="0.4.0"></a>
## [0.4.0](https://github.com/fasttime/Polytype/releases/tag/0.4.0) (2019-09-22)

* Full Safari 13 compatibility – dropped support for older versions of Safari.
* Dropped support for Node.js &lt; 10.6.
* Updated code examples.

<a name="0.3.1"></a>
## [0.3.1](https://github.com/fasttime/Polytype/releases/tag/0.3.1) (2019-07-24)

* Fixed some issues with the documentation.

<a name="0.3.0"></a>
## [0.3.0](https://github.com/fasttime/Polytype/releases/tag/0.3.0) (2019-07-18)

* Changed and documented use of `getPrototypeListOf` with class constructors.
* Extended and improved documentation.

<a name="0.2.0"></a>
## [0.2.0](https://github.com/fasttime/Polytype/releases/tag/0.2.0) (2019-07-06)

* Improved documentation.
* Dropped support for older browsers and TypeScript &lt; 3.5.

<a name="0.1.0"></a>
## [0.1.0](https://github.com/fasttime/Polytype/releases/tag/0.1.0) (2019-06-09)

* The functions `classes` and `getPrototypeListOf` are now exported by default and no longer defined
on globals.
The global definitions can still be used by importing the “global” subdirectory package or by
invoking the function `defineGlobally` exported by the main module.
* Dropped compatibility with some obsolete versions of Chrome/Chromium and Firefox.

<a name="0.0.1"></a>
## [0.0.1](https://github.com/fasttime/Polytype/releases/tag/0.0.1) (2019-05-18)

* Fixed merge priority of symbol own properties in constructructor targets.
* Fixed an issue with function names in Edge.

<a name="0.0.0"></a>
## [0.0.0](https://github.com/fasttime/Polytype/releases/tag/0.0.0) (2019-05-10)

First release derived from the Proxymi project.
