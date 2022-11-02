
import {LRUMap} from './js-lru/lru'

export type BridgedLRUMap<K, V> = LRUMap<K, V>;
export function BridgedLRUMap() {
    return LRUMap;
}

