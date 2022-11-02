
import {LRUMap} from './js-lru/lru'

// unorthodox, but the author of the module recommends copy/pasting
// the source into your project instead of node_modules.

export type BridgedLRUMap<K, V> = LRUMap<K, V>;
export function BridgedLRUMap() {
    return LRUMap;
}

