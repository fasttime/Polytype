declare namespace Proxymi
{
    type Enrich<T, U> = T & Pick<U, Exclude<keyof U, keyof T>>;

    type ProtoType<T> = T extends { prototype: infer U } ? U : never;

    type ReadonlyConstructorParameters<T extends new (...args: unknown[]) => unknown> =
    Readonly<ConstructorParameters<T>>;

    type SuperConstructor =
    {
        new (...args: unknown[]): unknown;
        readonly prototype: object | null;
    };

    type ClusteredConstructor<T extends SuperConstructor> =
    {
        /**
         * Allows accessing a property or calling a method in a specified base class, eliminating
         * ambiguity when multiple base classes share a property with the same key.
         *
         * @param type
         * The referenced base class.
         */
        class<U extends T>(type: U): U;
    };

    type ClusteredPrototype<T extends SuperConstructor> =
    {
        /**
         * Allows accessing a property or calling a method in a specified base class, eliminating
         * ambiguity when multiple base classes share a property with the same key.
         *
         * @param type
         * The referenced base class.
         */
        class<U extends T>(type: U): InstanceType<U>;
    };

    type SuperConstructorInvokeInfo<T extends SuperConstructor> =
    {
        super: T;
        arguments?: ReadonlyConstructorParameters<T>;
    };
}

interface ObjectConstructor
{
    /**
     * Returns the list of prototypes of an object.
     *
     * @param o
     * The object that references the prototypes.
     */
    getPrototypeListOf(o: any): any[];
}

/**
 * Allows defining a derived class that inherits from multiple base classes.
 */
declare function classes
<
    T1 extends Proxymi.SuperConstructor,
>
(
    type1: T1,
):
{
    new
    (
        args1?: Proxymi.ReadonlyConstructorParameters<T1>,
    ):
    & InstanceType<T1>
    & Proxymi.ClusteredPrototype<T1>;

    new
    (
        ...args:
        (
            | Proxymi.SuperConstructorInvokeInfo<T1>
        )[]
    ):
    & InstanceType<T1>
    & Proxymi.ClusteredPrototype<T1>;

    readonly prototype: Proxymi.ProtoType<T1>;
}
&
Proxymi.Enrich<
Proxymi.ClusteredConstructor<T1>,
T1>;

/**
 * Allows defining a derived class that inherits from multiple base classes.
 */
declare function classes
<
    T1 extends Proxymi.SuperConstructor,
    T2 extends Proxymi.SuperConstructor,
>
(
    type1: T1,
    type2: T2,
):
{
    new
    (
        args1?: Proxymi.ReadonlyConstructorParameters<T1>,
        args2?: Proxymi.ReadonlyConstructorParameters<T2>,
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & Proxymi.ClusteredPrototype<T1 | T2>;

    new
    (
        ...args:
        (
            | Proxymi.SuperConstructorInvokeInfo<T1>
            | Proxymi.SuperConstructorInvokeInfo<T2>
        )[]
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & Proxymi.ClusteredPrototype<T1 | T2>;

    readonly prototype: Proxymi.ProtoType<T1 & T2>;
}
&
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.ClusteredConstructor<T1 | T2>,
T1>, T2>;

/**
 * Allows defining a derived class that inherits from multiple base classes.
 */
declare function classes
<
    T1 extends Proxymi.SuperConstructor,
    T2 extends Proxymi.SuperConstructor,
    T3 extends Proxymi.SuperConstructor,
>
(
    type1: T1,
    type2: T2,
    type3: T3,
):
{
    new
    (
        args1?: Proxymi.ReadonlyConstructorParameters<T1>,
        args2?: Proxymi.ReadonlyConstructorParameters<T2>,
        args3?: Proxymi.ReadonlyConstructorParameters<T3>,
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3>;

    new
    (
        ...args:
        (
            | Proxymi.SuperConstructorInvokeInfo<T1>
            | Proxymi.SuperConstructorInvokeInfo<T2>
            | Proxymi.SuperConstructorInvokeInfo<T3>
        )[]
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3>;

    readonly prototype: Proxymi.ProtoType<T1 & T2 & T3>;
}
&
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.ClusteredConstructor<T1 | T2 | T3>,
T1>, T2>, T3>;

/**
 * Allows defining a derived class that inherits from multiple base classes.
 */
declare function classes
<
    T1 extends Proxymi.SuperConstructor,
    T2 extends Proxymi.SuperConstructor,
    T3 extends Proxymi.SuperConstructor,
    T4 extends Proxymi.SuperConstructor,
>
(
    type1: T1,
    type2: T2,
    type3: T3,
    type4: T4,
):
{
    new
    (
        args1?: Proxymi.ReadonlyConstructorParameters<T1>,
        args2?: Proxymi.ReadonlyConstructorParameters<T2>,
        args3?: Proxymi.ReadonlyConstructorParameters<T3>,
        args4?: Proxymi.ReadonlyConstructorParameters<T4>,
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & InstanceType<T4>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3 | T4>;

    new
    (
        ...args:
        (
            | Proxymi.SuperConstructorInvokeInfo<T1>
            | Proxymi.SuperConstructorInvokeInfo<T2>
            | Proxymi.SuperConstructorInvokeInfo<T3>
            | Proxymi.SuperConstructorInvokeInfo<T4>
        )[]
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & InstanceType<T4>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3 | T4>;

    readonly prototype: Proxymi.ProtoType<T1 & T2 & T3 & T4>;
}
&
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.ClusteredConstructor<T1 | T2 | T3 | T4>,
T1>, T2>, T3>, T4>;

/**
 * Allows defining a derived class that inherits from multiple base classes.
 */
declare function classes
<
    T1 extends Proxymi.SuperConstructor,
    T2 extends Proxymi.SuperConstructor,
    T3 extends Proxymi.SuperConstructor,
    T4 extends Proxymi.SuperConstructor,
    T5 extends Proxymi.SuperConstructor,
>
(
    type1: T1,
    type2: T2,
    type3: T3,
    type4: T4,
    type5: T5,
):
{
    new
    (
        args1?: Proxymi.ReadonlyConstructorParameters<T1>,
        args2?: Proxymi.ReadonlyConstructorParameters<T2>,
        args3?: Proxymi.ReadonlyConstructorParameters<T3>,
        args4?: Proxymi.ReadonlyConstructorParameters<T4>,
        args5?: Proxymi.ReadonlyConstructorParameters<T5>,
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & InstanceType<T4>
    & InstanceType<T5>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3 | T4 | T5>;

    new
    (
        ...args:
        (
            | Proxymi.SuperConstructorInvokeInfo<T1>
            | Proxymi.SuperConstructorInvokeInfo<T2>
            | Proxymi.SuperConstructorInvokeInfo<T3>
            | Proxymi.SuperConstructorInvokeInfo<T4>
            | Proxymi.SuperConstructorInvokeInfo<T5>
        )[]
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & InstanceType<T4>
    & InstanceType<T5>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3 | T4 | T5>;

    readonly prototype: Proxymi.ProtoType<T1 & T2 & T3 & T4 & T5>;
}
&
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.ClusteredConstructor<T1 | T2 | T3 | T4 | T5>,
T1>, T2>, T3>, T4>, T5>;

/**
 * Allows defining a derived class that inherits from multiple base classes.
 */
declare function classes
<
    T1 extends Proxymi.SuperConstructor,
    T2 extends Proxymi.SuperConstructor,
    T3 extends Proxymi.SuperConstructor,
    T4 extends Proxymi.SuperConstructor,
    T5 extends Proxymi.SuperConstructor,
    T6 extends Proxymi.SuperConstructor,
>
(
    type1: T1,
    type2: T2,
    type3: T3,
    type4: T4,
    type5: T5,
    type6: T6,
):
{
    new
    (
        args1?: Proxymi.ReadonlyConstructorParameters<T1>,
        args2?: Proxymi.ReadonlyConstructorParameters<T2>,
        args3?: Proxymi.ReadonlyConstructorParameters<T3>,
        args4?: Proxymi.ReadonlyConstructorParameters<T4>,
        args5?: Proxymi.ReadonlyConstructorParameters<T5>,
        args6?: Proxymi.ReadonlyConstructorParameters<T6>,
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & InstanceType<T4>
    & InstanceType<T5>
    & InstanceType<T6>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3 | T4 | T5 | T6>;

    new
    (
        ...args:
        (
            | Proxymi.SuperConstructorInvokeInfo<T1>
            | Proxymi.SuperConstructorInvokeInfo<T2>
            | Proxymi.SuperConstructorInvokeInfo<T3>
            | Proxymi.SuperConstructorInvokeInfo<T4>
            | Proxymi.SuperConstructorInvokeInfo<T5>
            | Proxymi.SuperConstructorInvokeInfo<T6>
        )[]
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & InstanceType<T4>
    & InstanceType<T5>
    & InstanceType<T6>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3 | T4 | T5 | T6>;

    readonly prototype: Proxymi.ProtoType<T1 & T2 & T3 & T4 & T5 & T6>;
}
&
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.ClusteredConstructor<T1 | T2 | T3 | T4 | T5 | T6>,
T1>, T2>, T3>, T4>, T5>, T6>;

/**
 * Allows defining a derived class that inherits from multiple base classes.
 */
declare function classes
<
    T1 extends Proxymi.SuperConstructor,
    T2 extends Proxymi.SuperConstructor,
    T3 extends Proxymi.SuperConstructor,
    T4 extends Proxymi.SuperConstructor,
    T5 extends Proxymi.SuperConstructor,
    T6 extends Proxymi.SuperConstructor,
    T7 extends Proxymi.SuperConstructor,
>
(
    type1: T1,
    type2: T2,
    type3: T3,
    type4: T4,
    type5: T5,
    type6: T6,
    type7: T7,
):
{
    new
    (
        args1?: Proxymi.ReadonlyConstructorParameters<T1>,
        args2?: Proxymi.ReadonlyConstructorParameters<T2>,
        args3?: Proxymi.ReadonlyConstructorParameters<T3>,
        args4?: Proxymi.ReadonlyConstructorParameters<T4>,
        args5?: Proxymi.ReadonlyConstructorParameters<T5>,
        args6?: Proxymi.ReadonlyConstructorParameters<T6>,
        args7?: Proxymi.ReadonlyConstructorParameters<T7>,
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & InstanceType<T4>
    & InstanceType<T5>
    & InstanceType<T6>
    & InstanceType<T7>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3 | T4 | T5 | T6 | T7>;

    new
    (
        ...args:
        (
            | Proxymi.SuperConstructorInvokeInfo<T1>
            | Proxymi.SuperConstructorInvokeInfo<T2>
            | Proxymi.SuperConstructorInvokeInfo<T3>
            | Proxymi.SuperConstructorInvokeInfo<T4>
            | Proxymi.SuperConstructorInvokeInfo<T5>
            | Proxymi.SuperConstructorInvokeInfo<T6>
            | Proxymi.SuperConstructorInvokeInfo<T7>
        )[]
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & InstanceType<T4>
    & InstanceType<T5>
    & InstanceType<T6>
    & InstanceType<T7>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3 | T4 | T5 | T6 | T7>;

    readonly prototype: Proxymi.ProtoType<T1 & T2 & T3 & T4 & T5 & T6 & T7>;
}
&
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.ClusteredConstructor<T1 | T2 | T3 | T4 | T5 | T6 | T7>,
T1>, T2>, T3>, T4>, T5>, T6>, T7>;

/**
 * Allows defining a derived class that inherits from multiple base classes.
 */
declare function classes
<
    T1 extends Proxymi.SuperConstructor,
    T2 extends Proxymi.SuperConstructor,
    T3 extends Proxymi.SuperConstructor,
    T4 extends Proxymi.SuperConstructor,
    T5 extends Proxymi.SuperConstructor,
    T6 extends Proxymi.SuperConstructor,
    T7 extends Proxymi.SuperConstructor,
    T8 extends Proxymi.SuperConstructor,
>
(
    type1: T1,
    type2: T2,
    type3: T3,
    type4: T4,
    type5: T5,
    type6: T6,
    type7: T7,
    type8: T8,
):
{
    new
    (
        args1?: Proxymi.ReadonlyConstructorParameters<T1>,
        args2?: Proxymi.ReadonlyConstructorParameters<T2>,
        args3?: Proxymi.ReadonlyConstructorParameters<T3>,
        args4?: Proxymi.ReadonlyConstructorParameters<T4>,
        args5?: Proxymi.ReadonlyConstructorParameters<T5>,
        args6?: Proxymi.ReadonlyConstructorParameters<T6>,
        args7?: Proxymi.ReadonlyConstructorParameters<T7>,
        args8?: Proxymi.ReadonlyConstructorParameters<T8>,
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & InstanceType<T4>
    & InstanceType<T5>
    & InstanceType<T6>
    & InstanceType<T7>
    & InstanceType<T8>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8>;

    new
    (
        ...args:
        (
            | Proxymi.SuperConstructorInvokeInfo<T1>
            | Proxymi.SuperConstructorInvokeInfo<T2>
            | Proxymi.SuperConstructorInvokeInfo<T3>
            | Proxymi.SuperConstructorInvokeInfo<T4>
            | Proxymi.SuperConstructorInvokeInfo<T5>
            | Proxymi.SuperConstructorInvokeInfo<T6>
            | Proxymi.SuperConstructorInvokeInfo<T7>
            | Proxymi.SuperConstructorInvokeInfo<T8>
        )[]
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & InstanceType<T4>
    & InstanceType<T5>
    & InstanceType<T6>
    & InstanceType<T7>
    & InstanceType<T8>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8>;

    readonly prototype: Proxymi.ProtoType<T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8>;
}
&
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.ClusteredConstructor<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8>,
T1>, T2>, T3>, T4>, T5>, T6>, T7>, T8>;

/**
 * Allows defining a derived class that inherits from multiple base classes.
 */
declare function classes
<
    T1 extends Proxymi.SuperConstructor,
    T2 extends Proxymi.SuperConstructor,
    T3 extends Proxymi.SuperConstructor,
    T4 extends Proxymi.SuperConstructor,
    T5 extends Proxymi.SuperConstructor,
    T6 extends Proxymi.SuperConstructor,
    T7 extends Proxymi.SuperConstructor,
    T8 extends Proxymi.SuperConstructor,
    T9 extends Proxymi.SuperConstructor,
>
(
    type1: T1,
    type2: T2,
    type3: T3,
    type4: T4,
    type5: T5,
    type6: T6,
    type7: T7,
    type8: T8,
    type9: T9,
):
{
    new
    (
        args1?: Proxymi.ReadonlyConstructorParameters<T1>,
        args2?: Proxymi.ReadonlyConstructorParameters<T2>,
        args3?: Proxymi.ReadonlyConstructorParameters<T3>,
        args4?: Proxymi.ReadonlyConstructorParameters<T4>,
        args5?: Proxymi.ReadonlyConstructorParameters<T5>,
        args6?: Proxymi.ReadonlyConstructorParameters<T6>,
        args7?: Proxymi.ReadonlyConstructorParameters<T7>,
        args8?: Proxymi.ReadonlyConstructorParameters<T8>,
        args9?: Proxymi.ReadonlyConstructorParameters<T9>,
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & InstanceType<T4>
    & InstanceType<T5>
    & InstanceType<T6>
    & InstanceType<T7>
    & InstanceType<T8>
    & InstanceType<T9>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;

    new
    (
        ...args:
        (
            | Proxymi.SuperConstructorInvokeInfo<T1>
            | Proxymi.SuperConstructorInvokeInfo<T2>
            | Proxymi.SuperConstructorInvokeInfo<T3>
            | Proxymi.SuperConstructorInvokeInfo<T4>
            | Proxymi.SuperConstructorInvokeInfo<T5>
            | Proxymi.SuperConstructorInvokeInfo<T6>
            | Proxymi.SuperConstructorInvokeInfo<T7>
            | Proxymi.SuperConstructorInvokeInfo<T8>
            | Proxymi.SuperConstructorInvokeInfo<T9>
        )[]
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & InstanceType<T4>
    & InstanceType<T5>
    & InstanceType<T6>
    & InstanceType<T7>
    & InstanceType<T8>
    & InstanceType<T9>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;

    readonly prototype: Proxymi.ProtoType<T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9>;
}
&
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.ClusteredConstructor<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>,
T1>, T2>, T3>, T4>, T5>, T6>, T7>, T8>, T9>;

/**
 * Allows defining a derived class that inherits from multiple base classes.
 */
declare function classes
<
    T1 extends Proxymi.SuperConstructor,
    T2 extends Proxymi.SuperConstructor,
    T3 extends Proxymi.SuperConstructor,
    T4 extends Proxymi.SuperConstructor,
    T5 extends Proxymi.SuperConstructor,
    T6 extends Proxymi.SuperConstructor,
    T7 extends Proxymi.SuperConstructor,
    T8 extends Proxymi.SuperConstructor,
    T9 extends Proxymi.SuperConstructor,
    T10 extends Proxymi.SuperConstructor,
>
(
    type1: T1,
    type2: T2,
    type3: T3,
    type4: T4,
    type5: T5,
    type6: T6,
    type7: T7,
    type8: T8,
    type9: T9,
    type10: T10,
):
{
    new
    (
        args1?: Proxymi.ReadonlyConstructorParameters<T1>,
        args2?: Proxymi.ReadonlyConstructorParameters<T2>,
        args3?: Proxymi.ReadonlyConstructorParameters<T3>,
        args4?: Proxymi.ReadonlyConstructorParameters<T4>,
        args5?: Proxymi.ReadonlyConstructorParameters<T5>,
        args6?: Proxymi.ReadonlyConstructorParameters<T6>,
        args7?: Proxymi.ReadonlyConstructorParameters<T7>,
        args8?: Proxymi.ReadonlyConstructorParameters<T8>,
        args9?: Proxymi.ReadonlyConstructorParameters<T9>,
        args10?: Proxymi.ReadonlyConstructorParameters<T10>,
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & InstanceType<T4>
    & InstanceType<T5>
    & InstanceType<T6>
    & InstanceType<T7>
    & InstanceType<T8>
    & InstanceType<T9>
    & InstanceType<T10>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10>;

    new
    (
        ...args:
        (
            | Proxymi.SuperConstructorInvokeInfo<T1>
            | Proxymi.SuperConstructorInvokeInfo<T2>
            | Proxymi.SuperConstructorInvokeInfo<T3>
            | Proxymi.SuperConstructorInvokeInfo<T4>
            | Proxymi.SuperConstructorInvokeInfo<T5>
            | Proxymi.SuperConstructorInvokeInfo<T6>
            | Proxymi.SuperConstructorInvokeInfo<T7>
            | Proxymi.SuperConstructorInvokeInfo<T8>
            | Proxymi.SuperConstructorInvokeInfo<T9>
            | Proxymi.SuperConstructorInvokeInfo<T10>
        )[]
    ):
    & InstanceType<T1>
    & InstanceType<T2>
    & InstanceType<T3>
    & InstanceType<T4>
    & InstanceType<T5>
    & InstanceType<T6>
    & InstanceType<T7>
    & InstanceType<T8>
    & InstanceType<T9>
    & InstanceType<T10>
    & Proxymi.ClusteredPrototype<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10>;

    readonly prototype: Proxymi.ProtoType<T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10>;
}
&
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.Enrich<
Proxymi.ClusteredConstructor<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10>,
T1>, T2>, T3>, T4>, T5>, T6>, T7>, T8>, T9>, T10>;

/**
 * Allows defining a derived class that inherits from multiple base classes.
 */
declare function classes(type1: Proxymi.SuperConstructor, ...types: Proxymi.SuperConstructor[]):
{
    new (args: unknown): Proxymi.ClusteredPrototype<Proxymi.SuperConstructor>;

    readonly prototype: object | null;
}
&
Proxymi.Enrich<Proxymi.ClusteredConstructor<Proxymi.SuperConstructor>, Proxymi.SuperConstructor>;
