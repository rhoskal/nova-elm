/*
 * Types
 */

export type Nil = null | undefined;
export type Nullable<A> = A | null;
export type Falsy = null | undefined | false | "" | 0;

/*
 * Guards
 */

export const isNull = (x: unknown): x is null => x === null;

export const isUndefined = (x: unknown): x is undefined => x === undefined;

export const isNil = (x: unknown): x is Nil => isNull(x) || isUndefined(x);

export const isNotNil = <T>(x: T | Nil): x is T => !isNil(x);

export const isFalse = (x: unknown): x is false => typeof x === "boolean" && !x;

export const isTrue = (x: unknown): x is true => typeof x === "boolean" && x;
