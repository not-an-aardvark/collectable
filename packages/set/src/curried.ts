import {curry2} from '@typed/curry';
import {HashSet} from './internals';
import {
  FilterPredicate,
  ForEachPredicate,
  UpdateSetCallback,
  add as _add,
  filter as _filter,
  forEach as _forEach,
  has as _has,
  intersect as _intersect,
  isEqual as _isEqual,
  remove as _remove,
  subtract as _subtract,
  union as _union,
  unwrap as _unwrap,
  update as _update
} from './functions';

export {
  FilterPredicate,
  ForEachPredicate,
  UpdateSetCallback,
  clone,
  empty,
  isSet,
  freeze,
  isFrozen,
  fromArray,
  fromIterable,
  fromNativeSet,
  map,
  reduce,
  size,
  isEmpty,
  thaw,
  isThawed,
  toArray,
  toNativeSet,
} from './functions';

export interface AddFn {
  <T>(value: T): (set: HashSet<T>) => HashSet<T>;
  <T>(value: T, set: HashSet<T>): HashSet<T>;
}
export const add: AddFn = curry2(_add);

export interface FilterFn {
  <T>(fn: FilterPredicate<T>): (set: HashSet<T>) => HashSet<T>;
  <T>(fn: FilterPredicate<T>, set: HashSet<T>): HashSet<T>;
}
export const filter: FilterFn = curry2(_filter);

export interface ForEachFn {
  <T>(f: ForEachPredicate<T>): (set: HashSet<T>) => HashSet<T>;
  <T>(f: ForEachPredicate<T>, set: HashSet<T>): HashSet<T>;
}
export const forEach: ForEachFn = curry2(_forEach);

export interface HasFn {
  <T>(value: T): (set: HashSet<T>) => boolean;
  <T>(value: T, set: HashSet<T>): boolean;
}
export const has: HasFn = curry2(_has);

export interface IntersectFn {
  <T>(other: HashSet<T>|T[]|Iterable<T>): (main: HashSet<T>) => HashSet<T>;
  <T>(other: HashSet<T>|T[]|Iterable<T>, main: HashSet<T>): HashSet<T>;
}
export const intersect: IntersectFn = curry2(_intersect);

export interface IsEqualFn {
  <T>(set: HashSet<T>): (other: HashSet<T>) => boolean;
  <T>(set: HashSet<T>, other: HashSet<T>): boolean;
}
export const isEqual: IsEqualFn = curry2(_isEqual);

export interface RemoveFn {
  <T>(value: T): (set: HashSet<T>) => HashSet<T>;
  <T>(value: T, set: HashSet<T>): HashSet<T>;
}
export const remove: RemoveFn = curry2(_remove);

export interface SubtractFn {
  <T>(other: HashSet<T>|T[]|Iterable<T>): (main: HashSet<T>) => HashSet<T>;
  <T>(other: HashSet<T>|T[]|Iterable<T>, main: HashSet<T>): HashSet<T>;
}
export const subtract: SubtractFn = curry2(_subtract);

export interface UnionFn {
  <T>(other: HashSet<T>|T[]|Iterable<T>): (main: HashSet<T>) => HashSet<T>;
  <T>(other: HashSet<T>|T[]|Iterable<T>, main: HashSet<T>): HashSet<T>;
}
export const union: UnionFn = curry2(_union);

export interface UnwrapFn {
  <T>(deep: boolean): (set: HashSet<T>) => T[];
  <T>(deep: boolean, set: HashSet<T>): T[];
}
export const unwrap: UnwrapFn = curry2(_unwrap);

export interface UpdateFn {
  <T>(callback: UpdateSetCallback<T>): (set: HashSet<T>) => HashSet<T>;
  <T>(callback: UpdateSetCallback<T>, set: HashSet<T>): HashSet<T>;
}
export const update: UpdateFn = curry2(_update);

