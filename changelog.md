<a name="0.16.2"></a>
## [0.16.2](https://github.com/fasttime/Polytype/releases/tag/0.16.2) (2023-02-21)

* Fixed exports for `"polytype/lib/polytype.js"` and `"polytype/lib/polytype.min.js"` in
package.json.

<a name="0.16.1"></a>
## [0.16.1](https://github.com/fasttime/Polytype/releases/tag/0.16.1) (2023-01-12)

* Restored compatibility with TypeScript module resolution `"node"`.

<a name="0.16.0"></a>
## [0.16.0](https://github.com/fasttime/Polytype/releases/tag/0.16.0) (2023-01-09)

* Fixed support for base classes with parameterized types.
* Improved setup instructions for TypeScript.
* Added header comments to code example files.

<a name="0.15.0"></a>
## [0.15.0](https://github.com/fasttime/Polytype/releases/tag/0.15.0) (2022-11-17)

* Using Node.js module resolution throughout the code.
* Dropped support for TypeScript &lt; 4.7.
* Extended the documentation with a notice about private instance members in base classes.
* Fixed the TypeScript code example.

<a name="0.14.1"></a>
## [0.14.1](https://github.com/fasttime/Polytype/releases/tag/0.14.1) (2022-04-17)

* Update type definitions for usage with TypeScript option `exactOptionalPropertyTypes` enabled.

<a name="0.14.0"></a>
## [0.14.0](https://github.com/fasttime/Polytype/releases/tag/0.14.0) (2021-07-04)

* Stricter type definitions: only types with an object constructor signature are now allowed as base
classes.
* Dropped support for TypeScript &lt; 4.2.
* Clarified parts of the code examples and the documentation.

<a name="0.13.2"></a>
## [0.13.2](https://github.com/fasttime/Polytype/releases/tag/0.13.2) (2021-04-18)

* Late binding base constructor substitutes.
* Dropped support for Firefox &lt; 74.
* Improved documentation:
  * Explaining value of `this` in base constructors.
  * Updated links.

<a name="0.12.0"></a>
## [0.12.0](https://github.com/fasttime/Polytype/releases/tag/0.12.0) (2021-03-02)

* Adapted type definitions to allow extending abstract classes.
* Improved typing of static members in classes derived from more than ten base types.
* Dropped support for TypeScript &lt; 4.0.

<a name="0.11.0"></a>
## [0.11.0](https://github.com/fasttime/Polytype/releases/tag/0.11.0) (2020-09-23)

* Stricter own property transfer logic in class instantiation: all own properties with the same key
defined by different base constructors or field initializers must be mutually redefinable now, or
else a `TypeError` is thrown.
This change prohibits combining configurable and unconfigurable definitions, or supplying different
unconfigurable definitions unless they have the same enumerability and are all writable.
Other constraints are unchanged:
  * If different own property definitions with the same key are found, the first definition in base
class order is applied.
  * Own property definition order respects base class order.
* Dropped support for older engines.
* Updated documentation.

<a name="0.10.0"></a>
## [0.10.0](https://github.com/fasttime/Polytype/releases/tag/0.10.0) (2020-07-11)

* Fail‐fast detection of transpilation to ES5 or earlier code.
* Dropped support for Node.js &lt; 13.7.

<a name="0.9.4"></a>
## [0.9.4](https://github.com/fasttime/Polytype/releases/tag/0.9.4) (2020-05-26)

* Fixed inconsistent typing of `classes` in TypeScript 3.9.
This change also improves the error message reported by the compiler when a call to `classes`
without arguments is encountered.

<a name="0.9.3"></a>
## [0.9.3](https://github.com/fasttime/Polytype/releases/tag/0.9.3) (2020-05-08)

* Updated documentation:
  * Referring to public class fields.
  * Using Material Design browser icons.
* Some minor optimizations.

<a name="0.9.2"></a>
## [0.9.2](https://github.com/fasttime/Polytype/releases/tag/0.9.2) (2020-03-20)

* Replaced a dead link in the documentation.
* Minor stylistic update to the code examples.

<a name="0.9.1"></a>
## [0.9.1](https://github.com/fasttime/Polytype/releases/tag/0.9.1) (2020-03-01)

* Fixed a bug with `super.class(...)` target resolution due to flawed caching.

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
