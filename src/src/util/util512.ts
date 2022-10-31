
/* auto */ import { O, tostring } from './util512Base';
/* auto */ import { assertTrue, assertWarn, checkThrow512, ensureDefined, make512Error } from './util512Assert';
import { TypedJSON } from 'typedjson';
import { map, isArray, isObject, isPlainObject, mapValues } from 'lodash'

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

/**
 * typescript utilities
 */
export const Util512 = /* static class */ {
    /**
     * checks for NaN and Infinity
     */
    isValidNumber(value: unknown) {
        return typeof value === 'number' && Number.isFinite(value);
    },

    /**
     * like Python's range()
     */
    range(start: number, end: O<number>, inc = 1) {
        if (end === undefined || end === null) {
            end = start;
            start = 0;
        }

        if ((inc > 0 && start >= end) || (inc < 0 && start <= end)) {
            return [];
        }

        let ret: number[] = [];
        for (let i = start; inc > 0 ? i < end : i > end; i += inc) {
            ret.push(i);
        }

        return ret;
    },

    /**
     * like Python's [x] * y
     */
    repeat<T>(amount: number, item: T) {
        let ret: T[] = [];
        for (let i = 0; i < amount; i++) {
            ret.push(item);
        }

        return ret;
    },

    /**
     * sets an element, expands array if necessary
     */
    setarr<T>(ar: O<T>[], index: number, val: T, fill: T) {
        assertTrue(index >= 0, 'Oy|must be >= 0');
        if (index >= ar.length) {
            for (let i = ar.length; i <= index; i++) {
                ar.push(fill);
            }
        }

        ar[index] = val;
    },

    /**
     * as distinct from Array.concat which returns a new object
     * don't use splice+apply, might run into issues with max-args-pased
     */
    extendArray<T>(ar: T[], added: T[]) {
        for (let i = 0; i < added.length; i++) {
            ar.push(added[i]);
        }
    },

    /*
     * plain parseInt allows trailing text
     */
    parseIntStrict(s: O<string>): O<number> {
        if (!s) {
            return undefined;
        }

        s = s.trim();
        if (s.match(/^\d+$/)) {
            return this.parseInt(s);
        } else {
            return undefined;
        }
    },

    /*
     * use this, not parseInt where you might forget to specify base 10
     */
    parseInt(s: O<string>): O<number> {
        let ret = 0;
        if (s) {
            /* ok to use, we remembered to say base 10 */
            /* eslint-disable-next-line ban/ban */
            ret = parseInt(s, 10);
        } else {
            ret = NaN;
        }

        return Number.isFinite(ret) ? ret : undefined;
    },

    /**
     * ensure that the string is <= maxLen
     */
    truncateWithEllipsis(s: string, maxLen: number) {
        if (s.length <= maxLen) {
            return s;
        } else {
            const ellipsis = '...';
            if (maxLen < ellipsis.length) {
                return s.slice(0, maxLen);
            } else {
                return s.slice(0, maxLen - ellipsis.length) + ellipsis;
            }
        }
    },

    /**
     * for unused-variable warnings
     */
    unused(..._args: unknown[]) {},

    /**
     * useful for map/reduce
     */
    add(n1: number, n2: number) {
        return n1 + n2;
    },

    /**
     * is map empty
     */
    isMapEmpty<U>(map: Record<string, U>) {
        for (let key in map) {
            if (map.hasOwnProperty(key)) {
                return false;
            }
        }

        return true;
    },

    /**
     * shallow clone of an object
     */
    shallowClone<T extends unknown>(o: unknown): T {
        return Object.assign({}, o) as T;
    },

    /**
     * freeze a property on an object
     */
    freezeProperty(o: any, propName: string) {
        Object.freeze(o[propName]);
        Object.defineProperty(o, propName, { configurable: false, writable: false });
    },

    /**
     * https://github.com/substack/deep-freeze
     * public domain
     */
    freezeRecurse(o: any) {
        Object.freeze(o);
        for (let prop in o) {
            if (
                Object.prototype.hasOwnProperty.call(o, prop) &&
                o[prop] !== null &&
                o[prop] !== undefined &&
                (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
                !Object.isFrozen(o[prop])
            ) {
                Util512.freezeRecurse(o[prop]);
            }
        }
    },

    /**
     * like Python's re.escape.
     */
    escapeForRegex(s: string) {
        return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    },

    /**
     * make the first character uppercase.
     */
    capitalizeFirst(s: string) {
        return s.substr(0, 1).toLocaleUpperCase() + s.substr(1);
    },

    /**
     * instead of a switch() or a map string->function,
     * use the class itself. (we'll need to tell js minifiers not to minify method names).
     * example:
     * class MyClass {
     *      goAbc() {
     *      }
     * }
     *
     * let inst = new MyClass()
     * let method = 'goAbc'
     * callAsMethodOnClass(MyClass.name, inst, method, [], true)
     */
    callAsMethodOnClass(
        clsname: string,
        me: any,
        s: string,
        args: unknown[],
        okIfNotExists: boolean,
        returnIfNotExists = '',
        okIfOnParentClass = false
    ): unknown {
        checkThrow512(
            s.match(/^[a-zA-Z][0-9a-zA-Z_]+$/),
            'K@|callAsMethodOnClass requires alphanumeric no spaces',
            s
        );

        let method = me[s];
        assertTrue(args === undefined || Array.isArray(args), '4I|args not an array');
        if (method && typeof method === 'function') {
            assertTrue(
                okIfOnParentClass ||
                    me.hasOwnProperty(s) ||
                    me.__proto__.hasOwnProperty(s),
                '4H|cannot use parent classes',
                clsname,
                s
            );

            assertTrue(args.length < 100, 'Ox|too many args', clsname, s);
            return method.apply(me, args); /* warn-apply-ok */
        } else if (okIfNotExists) {
            return returnIfNotExists ? returnIfNotExists : undefined;
        } else {
            checkThrow512(false, `4G|callAsMethodOnClass ${clsname} could not find ${s}`);
        }
    },

    /**
     * for use with callAsMethodOnClass
     */
    isMethodOnClass(me: any, s: string) {
        return me[s] !== undefined && typeof me[s] === 'function' ? me[s] : undefined;
    },

    /**
     * returns list of keys.
     */
    getMapKeys(map: any): string[] {
        let ret: string[] = [];
        for (let key in map) {
            if (Object.prototype.hasOwnProperty.call(map, key)) {
                ret.push(key);
            }
        }

        return ret;
    },

    /**
     * returns list of vals.
     */
    getMapVals<T>(map: Record<string, T>): T[] {
        let ret: T[] = [];
        for (let key in map) {
            if (Object.prototype.hasOwnProperty.call(map, key)) {
                ret.push(map[key]);
            }
        }

        return ret;
    },

    /**
     * padStart, from reference implementation on mozilla.org
     * from 1 to 001.
     */
    padStart(sIn: string | number, targetLength: number, padString: string) {
        let s = tostring(sIn);
        padString = typeof padString !== 'undefined' ? padString : ' ';
        if (s.length > targetLength) {
            return s;
        } else {
            targetLength = targetLength - s.length;
            if (targetLength > padString.length) {
                /* append to original to ensure we are longer than needed */
                padString += padString.repeat(targetLength / padString.length);
            }

            return padString.slice(0, targetLength) + s;
        }
    },

    /**
     * to base64 with / and + characters
     */
    arrayToBase64(b: number[] | Uint8Array) {
        let s = '';
        for (let i = 0, len = b.length; i < len; i++) {
            s += String.fromCharCode(b[i]);
        }

        return btoa(s);
    },

    /**
     * to base64 with _ and - characters.
     * note: strips off final = padding
     */
    toBase64UrlSafe(s: string) {
        return btoa(s).replace(/\//g, '_').replace(/\+/g, '-').replace(/=+$/, '');
    },

    /**
     * from base64 with _ and - characters.
     * re-adds final = padding if needed.
     */
    fromBase64UrlSafe(s: string) {
        if (s.length % 4 !== 0) {
            s += '==='.slice(0, 4 - (s.length % 4));
        }
        return atob(s.replace(/_/g, '/').replace(/-/g, '+'));
    },

    /**
     * split by character. decided not to use the
     * Array.prototype.map.call trick.
     */
    stringToCharArray(s: string) {
        let ar: string[] = [];
        for (let i = 0; i < s.length; i++) {
            ar.push(s[i]);
        }

        return ar;
    },

    /**
     * split to bytes. decided not to use the
     * Array.prototype.map.call trick.
     */
    stringToByteArray(s: string) {
        let ar: number[] = [];
        for (let i = 0; i < s.length; i++) {
            ar.push(s.charCodeAt(i));
        }

        return ar;
    },

    /**
     * javascript's default sort is dangerous because it's
     * always a string sort, but we can use this for cases where
     * we know we are sorting strings. our util512 sort is
     * usually better though because it checks types at runtime.
     */
    sortStringArray(arr: string[]) {
        /* eslint-disable-next-line @typescript-eslint/require-array-sort-compare */
        arr.sort();
    },

    /**
     * use the function to provide sort order
     * like Python's sort(key=fn)
     * often more efficient than passing a comparison function.
     */
    sortDecorated<T>(ar: T[], fn: (a: T) => unknown): T[] {
        /* 1) decorate */
        let decorated = ar.map(val => [fn(val), val] as [unknown, T]);
        /* 2) sort */
        decorated.sort((a, b) => util512Sort(a[0], b[0]));
        /* 3) undecorate */
        return decorated.map(val => val[1]);
    },

    /**
     * normalize newlines to \n
     */
    normalizeNewlines(s: string) {
        return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    },

    /**
     * filter a list, keeping only unique values.
     */
    keepOnlyUnique(ar: string[]) {
        let ret: string[] = [];
        let seen: Record<string, boolean> = {};
        for (let i = 0; i < ar.length; i++) {
            if (!seen[ar[i]]) {
                seen[ar[i]] = true;
                ret.push(ar[i]);
            }
        }

        return ret;
    },

    /**
     * array that can be locked
     */
    LockableArr: class<T> {
        protected vals: T[] = [];
        protected locked = false;
        constructor(vals: T[] = []) {
            this.vals = vals;
        }
        lock() {
            this.locked = true;
        }
        push(v: T) {
            checkThrowEq(false, this.locked, 'Ow|locked');
            this.vals.push(v);
        }
        set(i: number, v: T) {
            checkThrowEq(false, this.locked, '4A|locked');
            this.vals[i] = v;
        }
        len() {
            return this.vals.length;
        }
        at(i: number) {
            return this.vals[i];
        }
        getUnlockedCopy() {
            let other = new Util512.LockableArr<T>();
            other.locked = false;
            other.vals = this.vals.slice(0);
            return other;
        }
    },

    /**
     * map-values-deep, applies mapping recursively to an object.
     * © Kiko Beats, released under the MIT License.
     * https://www.npmjs.com/package/map-values-deep
     */
    mapValuesDeep(
        obj: any,
        fn: (o: any, k?: string | number) => any,
        key?: string | number
    ): any {
        return isArray(obj)
            ? map(obj, (innerObj, idx) => Util512.mapValuesDeep(innerObj, fn, idx))
            : isPlainObject(obj)
            ? mapValues(obj, (val, key) => Util512.mapValuesDeep(val, fn, key))
            : isObject(obj)
            ? obj
            : fn(obj, key);
    }
};

/**
 * polyfill for String.includes, from http://developer.mozilla.org
 * /en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
 */
if (!String.prototype.includes) {
    /* eslint-disable-next-line no-extend-native */
    String.prototype.includes = function (search: string | RegExp, start?: number) {
        if (search instanceof RegExp) {
            throw TypeError('first argument must not be a RegExp');
        }
        if (start === undefined) {
            start = 0;
        }

        /* eslint-disable-next-line @typescript-eslint/prefer-includes */
        return this.indexOf(search, start) !== -1;
    };
}

/**
 * polyfill for String.startsWith, from http://developer.mozilla.org
 * /en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
 */
if (!String.prototype.startsWith) {
    /* eslint-disable-next-line no-extend-native */
    Object.defineProperty(String.prototype, 'startsWith', {
        value: function (search: string, rawPos: number) {
            let pos = rawPos > 0 ? rawPos | 0 : 0;
            return this.substring(pos, pos + search.length) === search;
        }
    });
}

/**
 * polyfill for String.endsWith, from https://developer.mozilla.org
 * /en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
 */
if (!String.prototype.endsWith) {
    /* eslint-disable-next-line no-extend-native */
    String.prototype.endsWith = function (search: string, this_len?: number) {
        if (this_len === undefined || this_len > this.length) {
            this_len = this.length;
        }
        return this.substring(this_len - search.length, this_len) === search;
    };
}

/**
 * holds a value. useful for out-parameters.
 */
export class ValHolder<T> {
    constructor(public val: T) {}
}

/**
 * indicates that the value is a plain JS object
 */
export type AnyUnshapedJson = any;
export type NoParameterCtor<T> = { new (): T };
export type AnyParameterCtor<T> = { new (...args: unknown[]): T };

/**
 * by jcalz, stackoverflow
 */
export type TypeLikeAnEnum<E> = Record<keyof E, number | string> & Record<number, string>;

/**
 * list enum vals
 */
export function listEnumValsIncludingAlternates<T>(Enm: T) {
    let ret: string[] = [];
    for (let enumMember in Enm) {
        /* show possible values */
        if (
            typeof enumMember === 'string' &&
            !'0123456789'.includes(enumMember[0].toString())
        ) {
            let s = enumMember.toString();
            if (s.startsWith('__AlternateForm__')) {
                s = s.substr('__AlternateForm__'.length);
            }

            ret.push(s);
        }
    }

    return ret;
}

/**
 * list enum vals
 */
export function listEnumVals<T>(Enm: T, makeLowercase: boolean) {
    let s = '';
    for (let enumMember in Enm) {
        /* show possible values */
        if (
            typeof enumMember === 'string' &&
            !enumMember.startsWith('__') &&
            !enumMember.startsWith('__AlternateForm__') &&
            !'0123456789'.includes(enumMember[0].toString())
        ) {
            s += ', ' + (makeLowercase ? enumMember.toLowerCase() : enumMember);
        }
    }

    return s;
}

/**
 * string to enum.
 * accepts synonyms ("alternate forms") if enum contains __isUI512Enum
 */
export function findStrToEnum<T>(Enm: any, s: string): O<T> {
    assertTrue(
        Enm['__isUI512Enum'] !== undefined,
        '4F|must provide an enum type with __isUI512Enum defined.'
    );
    if (s.startsWith('__')) {
        return undefined;
    } else if (s.startsWith('AlternateForm')) {
        return undefined;
    } else if (s.startsWith('__AlternateForm__')) {
        return undefined;
    } else {
        if (Enm['__UI512EnumCapitalize'] !== undefined) {
            s = Util512.capitalizeFirst(s);
        }

        let found = Enm[s];
        if (found) {
            return found;
        } else {
            return Enm['__AlternateForm__' + s];
        }
    }
}

/**
 * same as findStrToEnum, but throws if not found, showing possible values.
 */
export function getStrToEnum<T>(Enm: any, msgContext: string, s: string): T {
    let found = findStrToEnum<T>(Enm, s);
    if (found !== undefined) {
        return found;
    } else {
        msgContext = msgContext
            ? `Not a valid choice of ${msgContext}. `
            : `Not a valid choice for this value. `;
        if (Enm['__isUI512Enum'] !== undefined) {
            let makeLowercase = Enm['__UI512EnumCapitalize'] !== undefined;
            msgContext += 'try one of' + listEnumVals(Enm, makeLowercase);
        }

        checkThrow512(false, msgContext, '4E|');
    }
}

/**
 * enum to string.
 * checks that the primary string is returned, not a synonym ('alternate form')
 */
export function findEnumToStr<E>(Enm: TypeLikeAnEnum<E>, n: number): O<string> {
    assertTrue(
        Enm['__isUI512Enum' as any] !== undefined,
        '4D|must provide an enum type with __isUI512Enum defined.'
    );

    /* using e[n] would work, but it's fragile if enum implementation changes. */
    for (let enumMember in Enm) {
        if (
            (Enm[enumMember] as unknown) === n &&
            !enumMember.startsWith('__') &&
            !enumMember.startsWith('__AlternateForm__')
        ) {
            let makeLowercase = Enm['__UI512EnumCapitalize' as any] !== undefined;
            return makeLowercase
                ? enumMember.toString().toLowerCase()
                : enumMember.toString();
        }
    }

    return undefined;
}

/**
 * findEnumToStr, but returns a fallback value.
 */
export function getEnumToStrOrFallback<E>(
    Enm: TypeLikeAnEnum<E>,
    n: number,
    fallback = 'Unknown'
): string {
    return findEnumToStr(Enm, n) ?? fallback;
}

/**
 * length of a string, or 0 if null
 */
export function slength(s: string | null | undefined) {
    return !s ? 0 : s.length;
}

/**
 * safe cast, throws if cast would fail.
 * ts inference lets us type simply
 * let myObj = cast(MyClass, o)

 * instanceof is a little slow, so at one point I used a
 * class Foo {
 *  isFoo = true
 * }
 * and could type check by doing (obj as Foo).isFoo,
 * but it looked clumsy, and didn't type-guard.
 */
export function cast<T>(
    ctor: AnyParameterCtor<T>,
    instance: unknown,
    context?: string
): T {
    if (instance instanceof ctor) {
        return instance;
    }

    checkThrow512(false, 'J7|type cast exception', context);
}

/**
 * safe cast, throws if cast would fail.
 */
export function castVerifyIsNum(instance: unknown, context?: string): number {
    if (typeof instance === 'number') {
        return instance;
    }

    throw make512Error('J7|type cast exception', context);
}

/**
 * safe cast, throws if cast would fail.
 */
export function castVerifyIsStr(instance: unknown, context?: string): string {
    if (typeof instance === 'string') {
        return instance;
    }

    throw make512Error('J7|type cast exception', context);
}

/**
 * fit n into the boundaries.
 */
export function fitIntoInclusive(n: number, min: number, max: number) {
    n = Math.min(n, max);
    n = Math.max(n, min);
    return n;
}

/**
 * compare two objects.
 * confirms that types match.
 * works on arbitrarily nested array structures.
 * can be used in .sort() or just to compare values.
 */
export function util512Sort(a: unknown, b: unknown, silent?: boolean): number {
    if (a === undefined && b === undefined) {
        return 0;
    } else if (a === null && b === null) {
        return 0;
    } else if (typeof a === 'string' && typeof b === 'string') {
        return a < b ? -1 : a > b ? 1 : 0;
    } else if (typeof a === 'number' && typeof b === 'number') {
        return a < b ? -1 : a > b ? 1 : 0;
    } else if (typeof a === 'boolean' && typeof b === 'boolean') {
        return a < b ? -1 : a > b ? 1 : 0;
    } else if (a instanceof Array && b instanceof Array) {
        if (a.length < b.length) {
            return -1;
        }
        if (a.length > b.length) {
            return 1;
        }
        let howManyElementsToSort = a.length;
        for (let i = 0; i < howManyElementsToSort; i++) {
            let cmp = util512Sort(a[i], b[i]);
            if (cmp !== 0) {
                return cmp;
            }
        }
        return 0;
    } else {
        if (silent) {
            return 1;
        } else {
            checkThrow512(false, `4B|could not compare types ${a} and ${b}`);
        }
    }
}

/**
 * a map from string to object that preserves insertion order.
 * like Python's OrderedDict
 */
export class OrderedHash<TValue> {
    protected keys: string[] = [];
    protected vals: Record<string, TValue> = Object.create(null);

    deleteAll() {
        this.keys = [];
        this.vals = Object.create(null);
    }

    insertNew(k: string, v: TValue) {
        assertTrue(k !== null && k !== undefined, '48|invalid key');
        assertTrue(v !== undefined, '47|invalid val');
        assertTrue(this.vals[k] === undefined, `46|key ${k} already exists`);
        this.keys.push(k);
        this.vals[k] = v;
    }

    insertAt(k: string, v: TValue, n: number) {
        assertTrue(k !== null && k !== undefined, '45|invalid key');
        assertTrue(v !== undefined, '44|invalid val');
        assertTrue(this.vals[k] === undefined, `43|key ${k} already exists`);
        this.keys.splice(n, 0, k);
        this.vals[k] = v;
    }

    getIndex(k: string) {
        let ret = this.keys.indexOf(k);
        assertTrue(ret !== -1, `42|could not find ${k}`);
        return ret;
    }

    atIndex(n: number): O<TValue> {
        if (n >= 0 && n < this.keys.length) {
            return this.vals[this.keys[n]];
        } else {
            return undefined;
        }
    }

    find(k: string): O<TValue> {
        return this.vals[k];
    }

    get(k: string): TValue {
        return ensureDefined(this.find(k), '41|could not find ', k);
    }

    delete(k: string): boolean {
        assertTrue(k !== null && k !== undefined, '40|invalid key');
        let index = this.keys.indexOf(k);
        if (index !== -1) {
            this.keys.splice(index, 1);
            delete this.vals[k];
            return true;
        } else {
            return false;
        }
    }

    length() {
        return this.keys.length;
    }

    *iterKeys() {
        for (let i = 0, len = this.keys.length; i < len; i++) {
            yield this.keys[i];
        }
    }

    *iter() {
        for (let i = 0, len = this.keys.length; i < len; i++) {
            let key = this.keys[i];
            yield this.vals[key];
        }
    }

    *iterReversed() {
        for (let i = this.keys.length - 1; i >= 0; i--) {
            yield this.vals[this.keys[i]];
        }
    }
}

/**
 * dump ordered hash to a string
 */
export function orderedHashSummary<T>(hash: OrderedHash<T>) {
    let ret = '';
    for (let k of hash.iterKeys()) {
        ret += k;
        ret += ':';
        ret += hash.get(k);
        ret += '\n';
    }

    return ret;
}

/**
 * map a key to object, does not allow setting a value twice.
 */
export class MapKeyToObject<T> {
    protected objects: Record<string, T> = Object.create(null);
    exists(key: string) {
        return Object.prototype.hasOwnProperty.call(this.objects, key);
    }

    get(key: string) {
        return ensureDefined(this.objects[key], '3_|id not found', key);
    }

    getOrFallback(key: string, fallback: T) {
        let found = this.objects[key];
        return found ?? fallback;
    }

    find(key: O<string>): O<T> {
        if (key) {
            return this.objects[key];
        } else {
            return undefined;
        }
    }

    add(key: string, obj: T) {
        assertTrue(slength(key) > 0, `3^|invalid id ${key}`);
        checkThrow512(
            this.objects[key] === undefined,
            `3]|duplicate key, ${key} already exists`
        );

        this.objects[key] = obj;
    }

    freeze() {
        Object.freeze(this.objects);
    }

    remove(key: string) {
        delete this.objects[key];
    }

    getVals(): T[] {
        return Util512.getMapVals(this.objects);
    }

    getKeys(): string[] {
        return Util512.getMapKeys(this.objects);
    }
}

/**
 * map a key to object, does allow setting a value twice.
 */
export class MapKeyToObjectCanSet<T> extends MapKeyToObject<T> {
    set(key: string, obj: T) {
        assertTrue(slength(key) > 0, `3[|invalid id ${key}`);
        this.objects[key] = obj;
    }
}

/**
 * a quick way to trigger assertion if value is not what was expected.
 * 'hard' assert, does not let execution continue.
 */
export function assertEq<T>(
    expected: T,
    got: unknown,
    msg: string,
    c1?: unknown,
    c2?: unknown
): asserts got is T {
    if (expected !== got && util512Sort(expected, got, true) !== 0) {
        let msgEq = ` expected '${expected}' but got '${got}'.`;
        assertTrue(false, msg + msgEq, c1, c2);
    }
}

/**
 * if expected and msg are not the same, assertWarn.
 */
export function assertWarnEq(
    expected: unknown,
    got: unknown,
    msg: string,
    c1?: unknown,
    c2?: unknown
) {
    if (expected !== got && util512Sort(expected, got, true) !== 0) {
        let msgEq = ` expected '${expected}' but got '${got}'.`;
        assertWarn(false, msg + msgEq, c1, c2);
    }
}

/**
 * a quick way to throw an expection if value is not what was expected.
 */
export function checkThrowEq<T>(
    expected: T,
    got: unknown,
    msg: string,
    c1: unknown = '',
    c2: unknown = ''
): asserts got is T {
    if (expected !== got && util512Sort(expected, got, true) !== 0) {
        let msgEq = ` expected '${expected}' but got '${got}'.`;
        throw new Error(`${msgEq} ${c1} ${c2}`)
    }
}

/**
 * a quick way to throw an expection if value is not what was expected.
 * throws a 512 flavor of error
 */
export function checkThrowEq512<T>(
    expected: T,
    got: unknown,
    msg: string,
    c1: unknown = '',
    c2: unknown = ''
): asserts got is T {
    if (expected !== got && util512Sort(expected, got, true) !== 0) {
        let msgEq = ` expected '${expected}' but got '${got}'.`;
        checkThrow512(false, msg + msgEq, c1, c2);
    }
}

/**
 * get last of an array
 */
export function arLast<T>(ar: T[]): T {
    assertTrue(ar.length >= 1, 'Ou|empty array');
    return ar[ar.length - 1];
}

/**
 * get last of an array, or undefined if array is empty
 */
export function lastIfThere<T>(ar: T[]): O<T> {
    return ar ? ar[ar.length - 1] : undefined;
}

/**
 * conveniently write a long string
 */
export function longstr(s: string, newlinesBecome = ' ') {
    s = s.replace(/\s*(\r\n|\n)\s*/g, newlinesBecome);
    return s.replace(/\s*{{NEWLINE}}\s*/g, '\n');
}

/**
 * wrapper over TypedJson. converts null into undefined.
 */
 export function wrapTypedJson<T>(cls:AnyParameterCtor<T>, json:string) {
    const serializer = new TypedJSON(cls);
    const objectGot = serializer.parse(json);
    const replaceWithUndef = (value:unknown) => {
        return value===null ? undefined : value
    }

    return Util512.mapValuesDeep(objectGot, replaceWithUndef)
}
