import { O, tostring, Util512StaticClass } from './util512Base';
import {
    assertTrue,
    assertWarn,
    checkThrow512,
    ensureDefined,
    make512Error
} from './util512Assert';
import {sortBy as ldSortBy, clone as ldClone, sum as ldSum, 
    split as ldSplit, isEqual as ldIsEqual, isPlainObject as ldIsPlainObject, isObject as ldIsObject, 
    isArray as ldIsArray, range as ldRange, last as ldLast, padStart as ldPadStart, map as ldMap, mapValues as ldMapValues} from 'lodash';


/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

/**
 * typescript utilities
 */
export const Util512 = new (class Util512 extends Util512StaticClass {
    /**
     * checks for number type, and not NaN / Infinity
     */
    isValidNumber = (value: unknown) => {
        return typeof value === 'number' && Number.isFinite(value);
    };

    /**
     * like Python's range()
     */
    range = (start: number, end: number, inc = 1) => {
        if (end <= start && inc > 0) {
            return [];
        } else if (end >= start && inc < 0) {
            return [];
        } else {
            return ldRange(start, end, inc);
        }
    };

    /**
     * like Python's [x] * y
     * not in lodash as of 2025
     */
    repeat = <T>(amount: number, item: T) => {
        let ret: T[] = [];
        for (let i = 0; i < amount; i++) {
            ret.push(item);
        }

        return ret;
    };

    /**
     * sets an element, expands array if necessary
     */
    setArr = <T>(ar: O<T>[], index: number, val: T, fill: T) => {
        assertTrue(index >= 0, 'must be >= 0');
        if (index >= ar.length) {
            for (let i = ar.length; i <= index; i++) {
                ar.push(fill);
            }
        }

        ar[index] = val;
    };

    /**
     * like Python's extend()
     * distinct from Array.concat which returns a new object
     * don't use splice+apply, might run into issues with max-args-pased
     */
    extendArray = <T>(ar: T[], added: T[]) => {
        for (let i = 0; i < added.length; i++) {
            ar.push(added[i]);
        }
    };

    /*
     * parseInt allows trailing text, this doesn't.
     * also only accepts non-negative numbers.
     */
    parseIntStrict = (s: O<string>): O<number> => {
        if (!s) {
            return undefined;
        }

        s = s.trim();
        if (s.match(/^\d+$/)) {
            return this.parseInt(s);
        } else {
            return undefined;
        }
    };

    /*
     * this enforces base10 unlike builtin parseInt,
     * and uses undefined instead of NaN
     */
    parseInt = (s: O<string>): O<number> => {
        let ret = 0;
        if (s) {
            /* ok to use, we remembered to say base 10 */
            /* eslint-disable-next-line ban/ban */
            ret = parseInt(s, 10);
        } else {
            ret = NaN;
        }

        return Number.isFinite(ret) ? ret : undefined;
    };

    /**
     * ensures that the string is <= maxLen
     */
    truncateWithEllipsis = (s: string, maxLen: number) => {
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
    };

    /**
     * useful for map/reduce,
     * although ldSum is preferred
     */
    add = (n1: number, n2: number) => {
        return n1 + n2;
    };

    /**
     * is a 'map' empty.
     * this codebase used to target es5 so we
     * often say {} instead of new Map()
     */
    isMapEmpty = <U>(map: Record<string, U>) => {
        for (let key in map) {
            if (map.hasOwnProperty(key)) {
                return false;
            }
        }

        return true;
    };

    /**
     * freeze a property on an object
     */
    freezeProperty = (o: any, propName: string) => {
        Object.freeze(o[propName]);
        Object.defineProperty(o, propName, { configurable: false, writable: false });
    };

    /**
     * https://github.com/substack/deep-freeze
     * public domain
     */
    freezeRecurse = (o: any) => {
        Object.freeze(o);
        for (let prop in o) {
            if (
                Object.prototype.hasOwnProperty.call(o, prop) &&
                o[prop] !== null &&
                o[prop] !== undefined &&
                (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
                !Object.isFrozen(o[prop])
            ) {
                this.freezeRecurse(o[prop]);
            }
        }
    };

    /**
     * like Python's re.escape.
     * it's in the latest ES standards but not evereywhere yet.
     */
    escapeForRegex = (s: string) => {
        return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    /**
     * make the first character uppercase.
     */
    capitalizeFirst = (s: string) => {
        return s.substring(0, 1).toLocaleUpperCase() + s.substring(1);
    };

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
    callAsMethodOnClass = (
        clsname: string,
        me: any,
        s: string,
        args: unknown[],
        okIfNotExists: boolean,
        returnIfNotExists = '',
        okIfOnParentClass = false
    ): unknown => {
        checkThrow512(
            s.match(/^[a-zA-Z][0-9a-zA-Z_]+$/),
            'callAsMethodOnClass requires alphanumeric no spaces',
            s
        );

        let method = me[s];
        assertTrue(args === undefined || Array.isArray(args), 'args not an array');
        if (method && typeof method === 'function') {
            assertTrue(
                okIfOnParentClass ||
                    me.hasOwnProperty(s) ||
                    me.__proto__.hasOwnProperty(s),
                'cannot use parent classes',
                clsname,
                s
            );

            assertTrue(args.length < 100, 'too many args', clsname, s);
            return method.apply(me, args); /* warn-apply-ok */
        } else if (okIfNotExists) {
            return returnIfNotExists ? returnIfNotExists : undefined;
        } else {
            checkThrow512(false, `callAsMethodOnClass ${clsname} could not find ${s}`);
        }
    };

    /**
     * for use with callAsMethodOnClass
     */
    isMethodOnClass = (me: any, s: string) => {
        return me[s] !== undefined && typeof me[s] === 'function' ? me[s] : undefined;
    };

    /**
     * returns list of keys.
     */
    getMapKeys = (map: any): string[] => {
        let ret: string[] = [];
        for (let key in map) {
            if (Object.prototype.hasOwnProperty.call(map, key)) {
                ret.push(key);
            }
        }

        return ret;
    };

    /**
     * returns list of vals.
     */
    getMapVals = <T>(map: Record<string, T>): T[] => {
        let ret: T[] = [];
        for (let key in map) {
            if (Object.prototype.hasOwnProperty.call(map, key)) {
                ret.push(map[key]);
            }
        }

        return ret;
    };

    /**
     * padStart, accepts integers as well.
     * from 1 to 001.
     */
    padStart = (sIn: string | number, targetLength: number, padString: string) => {
        let s = tostring(sIn);
        return ldPadStart(s, targetLength, padString);
    };

    /**
     * to base64 with / and + characters
     */
    arrayToBase64 = (b: number[] | Uint8Array) => {
        let s = '';
        for (let i = 0, len = b.length; i < len; i++) {
            s += String.fromCharCode(b[i]);
        }

        return btoa(s);
    };

    /**
     * to base64 with _ and - characters.
     * note: strips off final = padding
     */
    toBase64UrlSafe = (s: string) => {
        return btoa(s).replace(/\//g, '_').replace(/\+/g, '-').replace(/=+$/, '');
    };

    /**
     * from base64 with _ and - characters.
     * re-adds final = padding if needed.
     */
    fromBase64UrlSafe = (s: string) => {
        if (s.length % 4 !== 0) {
            s += '==='.slice(0, 4 - (s.length % 4));
        }
        return atob(s.replace(/_/g, '/').replace(/-/g, '+'));
    };

    /**
     * javascript's default sort is dangerous because it's
     * always a string sort, but we can use this for cases where
     * we know we are sorting strings. our util512 sort is
     * usually better though because it checks types at runtime.
     */
    sortStringArray = (arr: string[]): void => {
        /* eslint-disable-next-line @typescript-eslint/require-array-sort-compare */
        arr.sort();
    };

    /**
     * normalize newlines to \n
     */
    normalizeNewlines = (s: string) => {
        return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    };

    /**
     * filter a list, keeping only unique values.
     */
    keepOnlyUnique = (ar: string[]) => {
        let ret: string[] = [];
        let seen: Record<string, boolean> = {};
        for (let i = 0; i < ar.length; i++) {
            if (!seen[ar[i]]) {
                seen[ar[i]] = true;
                ret.push(ar[i]);
            }
        }

        return ret;
    };

    /**
     * map-values-deep, applies mapping recursively to an object.
     * © Kiko Beats, released under the MIT License.
     * https://www.npmjs.com/package/map-values-deep
     */
    mapValuesDeep = (
        obj: any,
        fn: (o: any, k?: string | number) => any,
        key?: string | number
    ): any => {
        return ldIsArray(obj)
            ? ldMap(obj, (innerObj, idx) => this.mapValuesDeep(innerObj, fn, idx))
            : ldIsPlainObject(obj)
            ? ldMapValues(obj, (val, key) => this.mapValuesDeep(val, fn, key))
            : ldIsObject(obj)
            ? obj
            : fn(obj, key);
    };
})();

/**
 * array that can be locked
 */
export class LockableArr<T> {
    protected vals: T[] = [];
    protected locked = false;
    constructor(vals: T[] = []) {
        this.vals = vals;
    }

    lock() {
        this.locked = true;
    }

    push(v: T) {
        checkThrowEq(false, this.locked, 'locked');
        this.vals.push(v);
    }

    set(i: number, v: T) {
        checkThrowEq(false, this.locked, 'locked');
        this.vals[i] = v;
    }

    len() {
        return this.vals.length;
    }

    at(i: number) {
        return this.vals[i];
    }

    getUnlockedCopy() {
        let other = new LockableArr<T>();
        other.locked = false;
        other.vals = ldClone(this.vals);
        return other;
    }
}

/**
 * holds a value. useful for out-parameters.
 */
export class ValHolder<T> {
    constructor(public val: T) {}
}

/**
 * for unused-variable warnings
 */
export function unused(..._args: unknown[]) {}

/**
 * indicates that the value is a plain JS object
 */
export type AnyUnshapedJson = any;
export type NoParameterCtor<T> = { new (): T };
export type AnyParameterCtor<T> = { new (...args: unknown[]): T };
export type TypeLikeAnEnum = { __isUI512Enum: number };

/**
 * list enum vals
 */
export function listEnumValsIncludingAlternates<T>(Enm: T):string {
    let ret: string[] = [];
    for (let enumMember in Enm) {
        /* show possible values */
        if (
            typeof enumMember === 'string' &&
            !'0123456789'.includes(enumMember[0].toString())
        ) {
            let s = enumMember.toString();
            if (s.startsWith('__AlternateForm__')) {
                s = s.substring('__AlternateForm__'.length);
            }

            ret.push(s);
        }
    }

    return ret.join(', ');
}

/**
 * list enum vals
 */
export function listEnumVals<T>(Enm: T, makeLowercase: boolean):string {
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
export function findStrToEnum<T>(Enm: T, s: string): O<T> {
    assertTrue(
        Enm['__isUI512Enum'] !== undefined,
        'must provide an enum type with __isUI512Enum defined.'
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
export function getStrToEnum<T>(Enm: T, msgContext: string, s: string): T {
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

        checkThrow512(false, msgContext);
    }
}

/**
 * enum to string.
 * checks that the primary string is returned, not a synonym ('alternate form')
 */
export function findEnumToStr(Enm: TypeLikeAnEnum, n: number): O<string> {
    assertTrue(
        Enm['__isUI512Enum' as any] !== undefined,
        'must provide an enum type with __isUI512Enum defined.'
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
 * findEnumToStr, but throws
 */
export function getEnumToStr(
    Enm: TypeLikeAnEnum,
    n: number,
): string {
    const ret = findEnumToStr(Enm, n) 
    checkThrow512(ret !== undefined, `Not a valid choice for this value.`);
    return ret
}

/**
 * findEnumToStr, but returns a fallback value.
 */
export function getEnumToStrOrFallback(
    Enm: TypeLikeAnEnum,
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

    checkThrow512(false, 'type cast exception', context);
}

/**
 * safe cast, throws if cast would fail.
 */
export function castVerifyIsNum(instance: unknown, context?: string): number {
    if (typeof instance === 'number') {
        return instance;
    }

    throw make512Error('type cast exception', context);
}

/**
 * safe cast, throws if cast would fail.
 */
export function castVerifyIsStr(instance: unknown, context?: string): string {
    if (typeof instance === 'string') {
        return instance;
    }

    throw make512Error('type cast exception', context);
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
 * returns the 'shape' as a structure of strings.
 * 1 -> 'number'
 * [1, 'abc'] -> ['number', 'string']
 * { a: {b: 1, c: 'abc'} } -> { a: {b: 'number', c: 'string'}}
 */
export function getShapeRecurse(origObj: unknown,): unknown {
    const getValType = (val: unknown): string => {
        if (val === undefined) {
            return 'undefined';
        } else if (val === null) {
            return 'null';
        } else if (typeof val === 'function') {
            throw new Error('cannot compare functions');
        } else {
            return typeof val;
        }
    }

    return Util512.mapValuesDeep(origObj, getValType)
}

/**
 * JavaScript's built-in sort only does string comparisons,
 * even when given numbers. `sortConsistentType` on the other hand
 * does reasonable sorting and thanks to lodash it supports several types.
 * This function also refuses to compare dissimilar data, so it will throw
 * if attempting to compare a string and number.
 * This is a stable sort.
 */
export function sortConsistentType(arr: unknown[], mapper=(x:unknown)=>x):unknown[] {
    if (!arr.length) {
        return arr
    }

    const shapeFirst = getShapeRecurse(mapper(arr[0]));
    if (arr.some((v) => !ldIsEqual(getShapeRecurse(mapper(v)), shapeFirst))) {
        throw new Error('cannot compare arrays with different types/shapes');
    }

    return ldSortBy(arr, mapper)
}

/**
 * a quick way to trigger assertion if value is not what was expected.
 * 'hard' assert, does not let execution continue.
 */
export function assertEq<T>(
    expected: T,
    got: unknown,
    c1?: string,
    c2?: unknown,
    c3?: unknown
): asserts got is T {
    if (!ldIsEqual(expected, got)) {
        let msgEq = ` expected '${JSON.stringify(expected)}' but got '${JSON.stringify(got)}'.`;
        msgEq += c1 ?? '';
        assertTrue(false, msgEq, c2, c3);
    }
}

/**
 * used during debugging, for example tell your IDE
 * to break on uncaught exceptions if shouldBreakOnExceptions===true
 */
declare global {
  var shouldBreakOnExceptions: boolean
}

/**
 * tell your IDE that it's ok to break on uncaught exceptions
 */
export function shouldBreakOnExceptions_Enable() {
    if (typeof globalThis !== 'undefined') {
        globalThis.shouldBreakOnExceptions = true;
    }
}

/**
 * tell your IDE that not to break on uncaught exceptions,
 * call this for places like assertThrows that intentionally throw
 */
export function shouldBreakOnExceptions_Disable() {
    if (typeof globalThis !== 'undefined') {
        // this would be better if it were a stack to push/pop,
        // so that it would work during functions like assertAsserts,
        // but it's not worth the complexity (and even with a stack
        // there'd be await/async issues).
        globalThis.shouldBreakOnExceptions = false;
    }
}

/**
 * if expected and msg are not the same, assertWarn.
 */
export function assertWarnEq(
    expected: unknown,
    got: unknown,
    c1?: unknown,
    c2?: unknown,
    c3?: unknown
) {
    if (!ldIsEqual(expected, got)) {
        let msgEq = ` expected '${JSON.stringify(expected)}' but got '${JSON.stringify(got)}'.`;
        msgEq += c1 ?? '';
        assertWarn(false, msgEq, c2, c3);
    }
}

/**
 * a quick way to throw an expection if value is not what was expected.
 * check and assert do similar things but have different semantics,
 * an assert() fires when there's logic issues in the program,
 * a check() fires on mistaken input from the user, it's not a bug.
 */
export function checkThrowEq<T>(
    expected: T,
    got: unknown,
    msg: string = '',
    c1: unknown = '',
    c2: unknown = ''
): asserts got is T {
    if (!ldIsEqual(expected, got)) {
        let msgEq = ` expected '${JSON.stringify(expected)}' but got '${JSON.stringify(got)}'.`;
        throw new Error(`checkThrowEq ${msgEq} ${msg} ${c1} ${c2}`);
    }
}

/**
 * a quick way to throw an expection if value is not what was expected.
 * tags error with '512' marking, indicating it came from that part of the code.
 */
export function checkThrowEq512<T>(
    expected: T,
    got: unknown,
    msg: string,
    c1: unknown = '',
    c2: unknown = ''
): asserts got is T {
    if (!ldIsEqual(expected, got)) {
        let msgEq = ` expected '${JSON.stringify(expected)}' but got '${JSON.stringify(got)}'.`;
        checkThrow512(false, msg + msgEq, c1, c2);
    }
}

/**
 * get last of an array
 * unlike ldLast, will throw if array is empty
 */
export function arLast<T>(ar: T[]): T {
    assertTrue(ar.length >= 1, 'empty array');
    return ar[ar.length - 1];
}

/**
 * conveniently write a long string
 */
export function longstr(s: string, newlinesBecome = ' ') {
    s = s.replace(/\s*(\r\n|\n)\s*/g, newlinesBecome);
    return s.replace(/\s*{{NEWLINE}}\s*/g, '\n');
}
