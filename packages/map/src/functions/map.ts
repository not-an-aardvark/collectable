import {HashMap, HashMapImpl} from '../internals/HashMap';
import {empty} from './empty';
import {reduce} from './reduce';
import {set} from './set';

export type MapPredicate<K, V, R> = (value: V, key?: K) => R;

export function map<K, V, R>(f: MapPredicate<K, V, R>, hashmap: HashMap<K, V>): HashMap<K, R> {
  return reduce(
    function (newMap: HashMapImpl<K, R>, value: V, key: K) {
      return set(key, f(value, key), newMap);
    },
    empty<K, R>(),
    hashmap,
  );
};
