declare namespace Proxymi
{
    // Helpers /////////////////////////////////////////////////////////////////////////////////////

    type Enrich<T, U> = T & Pick<U, Exclude<keyof U, keyof T>>;

    type EnrichTimes
    <
        T,
        U1 = never,
        U2 = never,
        U3 = never,
        U4 = never,
        U5 = never,
        U6 = never,
        U7 = never,
        U8 = never,
        U9 = never,
        U10 = never,
    >
    =
    Enrich<Enrich<Enrich<Enrich<Enrich<Enrich<Enrich<Enrich<Enrich<Enrich<
    T,
    U1>, U2>, U3>, U4>, U5>, U6>, U7>, U8>, U9>, U10>;

    type IntersectionOf<T extends unknown[]> =
    UnboxedIntersectionOf<{ [key in keyof T]: [T[key]]; }> extends [infer U] ? U : never;

    type ProtoType<T> = T extends { prototype: infer U; } ? U : never;

    type ReadonlyConstructorParameters<T extends new (...args: unknown[]) => unknown> =
    Readonly<ConstructorParameters<T>>;

    type RequireNonEmpty<T> = T extends [] ? never : T;

    type UnboxedIntersectionOf<T extends unknown[]> =
    UnionOf<T> extends infer U ?
    (U extends unknown ? (arg: U) => unknown : never) extends (arg: infer V) => unknown ?
    V : never :
    never;

    type UnionOf<T extends unknown[]> = T[number];

    // Implementation related //////////////////////////////////////////////////////////////////////

    type AsSuperConstructor<T> = T extends SuperConstructor ? T : never;

    type ClusteredConstructor<T extends SuperConstructor[]> =
    {
        new (...args: MapTupleTypesToOptionalReadonlyConstructorParameters<T>):
        ClusteredPrototype<T>;

        new (...args: UnionOf<MapTupleTypesToSuperConstructorInvokeInfo<T>>[]):
        ClusteredPrototype<T>

        readonly prototype: ProtoType<IntersectionOf<T>>;
    }
    &
    (
    T extends
    [
        SuperConstructor,
        SuperConstructor,
        SuperConstructor,
        SuperConstructor,
        SuperConstructor,
        SuperConstructor,
        SuperConstructor,
        SuperConstructor,
        SuperConstructor,
        SuperConstructor,
        SuperConstructor,
        ...SuperConstructor[]
    ]
    ?
    Enrich<SuperConstructorSelector<UnionOf<T>>, SuperConstructor>
    :
    EnrichTimes<
        SuperConstructorSelector<UnionOf<T>>,
        T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7], T[8], T[9]
    >
    );

    type ClusteredPrototype<T extends SuperConstructor[]> =
    SuperPrototypeSelector<UnionOf<T>> &
    UnboxedIntersectionOf<{ [key in keyof T]: InstanceType<AsSuperConstructor<T[key]>>; }>;

    type MapTupleTypesToOptionalReadonlyConstructorParameters<T extends SuperConstructor[]> =
    { [key in keyof T]?: ReadonlyConstructorParameters<AsSuperConstructor<T[key]>>; };

    type MapTupleTypesToSuperConstructorInvokeInfo<T extends SuperConstructor[]> =
    { [key in keyof T]: SuperConstructorInvokeInfo<AsSuperConstructor<T[key]>>; };

    type SuperConstructor =
    {
        new (...args: unknown[]): unknown;
        readonly prototype: object | null;
    };

    interface SuperConstructorInvokeInfo<T extends SuperConstructor>
    {
        super: T;
        arguments?: ReadonlyConstructorParameters<T>;
    }

    type SuperConstructorSelector<T extends SuperConstructor> =
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

    type SuperPrototypeSelector<T extends SuperConstructor> =
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
<T extends Proxymi.SuperConstructor[]>(...types: Proxymi.RequireNonEmpty<T>):
Proxymi.ClusteredConstructor<T>;
