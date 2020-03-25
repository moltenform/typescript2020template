
/* auto */ import { O, assertTrue, checkThrowUI512, makeUI512Error, scontains, throwIfUndefined, } from './benBaseUtilsAssert';

// moltenform.com(Ben Fisher), 2020
// MIT license

export class Util512 {
    /**
     * checks for NaN and Infinity
     */
    static isValidNumber(value: any) {
        return typeof value === 'number' && isFinite(value);
    }

    /**
     * like Python's range()
     */
    static range(start: number, end: O<number>, inc = 1) {
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
    }

    /**
     * like Python's [x] * y
     */
    static repeat<T>(amount: number, item: T) {
        let ret: T[] = [];
        for (let i = 0; i < amount; i++) {
            ret.push(item);
        }

        return ret;
    }

    /**
     * sets an element, expands array if necessary
     */
    static setarr<T>(ar: O<T>[], index: number, val: T) {
        assertTrue(index >= 0, 'must be >= 0');
        if (index >= ar.length) {
            for (let i = 0; i < index - ar.length; i++) {
                ar.push(undefined);
            }
        }

        ar[index] = val;
    }

    /**
     * as distinct from Array.concat which returns a new object
     * don't use splice+apply, might run into issues with max-args-pased
     */
    static extendArray<T>(ar: T[], added: T[]) {
        for (let i = 0; i < added.length; i++) {
            ar.push(added[i]);
        }
    }

    /*
     * plain parseInt allows trailing text
     */
    static parseIntStrict(s: O<string>) {
        if (!s) {
            return NaN;
        }

        s = s.trim();
        if (s.match(/^\d+$/)) {
            return parseInt(s, base10);
        } else {
            return NaN;
        }
    }

    /**
     * useful for map/reduce
     */
    static add(n1: number, n2: number) {
        return n1 + n2;
    }

    /**
     * guess OS based on navstring.
     */
    static getBrowserOS(navString: string): BrowserOSInfo {
        if (scontains(navString, 'Windows')) {
            return BrowserOSInfo.Windows;
        } else if (
            /(iPhone|iPad|iPod)/.test(navString) ||
            /Mac OS X/.test(navString) ||
            /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/.test(navString)
        ) {
            return BrowserOSInfo.Mac;
        } else if (/(Linux|X11|UNIX)/.test(navString)) {
            return BrowserOSInfo.Linux;
        }
        return BrowserOSInfo.Unknown;
    }

    /**
     * is map empty
     */
    static isMapEmpty<U>(map: { [key: string]: U }) {
        for (let key in map) {
            if (map.hasOwnProperty(key)) {
                return false;
            }
        }

        return true;
    }

    /**
     * shallow clone of an object
     */
    static shallowClone(o: any) {
        return Object.assign({}, o);
    }

    /**
     * https://github.com/substack/deep-freeze
     * public domain
     */
    static freezeRecurse(o: any) {
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
    }

    /**
     * freeze a property
     */
    static freezeProperty(o: any, propName: string) {
        Object.freeze(o[propName]);
        Object.defineProperty(o, propName, { configurable: false, writable: false });
    }

    /**
     * like Python's re.escape.
     */
    static escapeForRegex(s: string) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    /**
     * make the first character uppercase.
     */
    static capitalizeFirst(s: string) {
        return s.substr(0, 1).toLocaleUpperCase() + s.substr(1);
    }

    /**
     * instead of a switch() or a map string->Function,
     * use the class itself. (we'll need to tell js minifiers not to minify method names).
     * example:
     * class MyClass {
     *      goAbc() {
     *      }
     * }
     *
     * let inst = new MyClass()
     * let method = 'goAbc'
     * callAsMethodOnClass('MyClass', inst, method, [], true)
     */
    static callAsMethodOnClass(
        clsname: string,
        me: any,
        s: string,
        args: any[],
        okIfNotExists: boolean,
    ) {
        checkThrowUI512(
            s.match(/^[a-zA-Z][0-9a-zA-Z_]+$/),
            'K@|callAsMethodOnClass requires alphanumeric no spaces',
            s,
        );

        let method = me[s];
        assertTrue(args === undefined || Array.isArray(args), '4I|args not an array');
        if (method && typeof method === 'function') {
            assertTrue(
                me.hasOwnProperty(s) || me.__proto__.hasOwnProperty(s),
                '4H|cannot use parent classes',
                clsname,
                s,
            );

            assertTrue(args.length < 100, clsname, s);
            /* eslint-disable prefer-spread */
            return method.apply(me, args);
        } else if (okIfNotExists) {
            return undefined;
        } else {
            throw makeUI512Error(`4G|callAsMethodOnClass ${clsname} could not find ${s}`);
        }
    }

    /**
     * for use with callAsMethodOnClass
     */
    static isMethodOnClass(me: any, s: string) {
        return me[s] !== undefined && typeof me[s] === 'function' ? me[s] : undefined;
    }

    /**
     * returns list of keys.
     */
    static getMapKeys<U>(map: { [key: string]: U }): string[] {
        let ret: string[] = [];
        for (let key in map) {
            if (Object.prototype.hasOwnProperty.call(map, key)) {
                ret.push(key);
            }
        }

        return ret;
    }

    /**
     * returns list of vals.
     */
    static getMapVals<T>(map: { [key: string]: T }): T[] {
        let ret: T[] = [];
        for (let key in map) {
            if (Object.prototype.hasOwnProperty.call(map, key)) {
                ret.push(map[key]);
            }
        }

        return ret;
    }

    /**
     * padStart, from reference implementation on mozilla.org
     * from 1 to 001.
     */
    static padStart(sIn: string | number, targetLength: number, padString: string) {
        let s = '' + sIn;
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
    }

    /**
     * to base64 with / and + characters
     */
    static arrayToBase64(b: number[] | Uint8Array) {
        let s = '';
        for (let i = 0, len = b.length; i < len; i++) {
            s += String.fromCharCode(b[i]);
        }

        return btoa(s);
    }

    /**
     * to base64 with _ and - characters.
     * note: strips off final = padding
     */
    static toBase64UrlSafe(s: string) {
        return btoa(s)
            .replace(/\//g, '_')
            .replace(/\+/g, '-')
            .replace(/\=+$/, '');
    }

    /**
     * from base64 with _ and - characters.
     * re-adds final = padding if needed.
     */
    static fromBase64UrlSafe(s: string) {
        if (s.length % 4 !== 0) {
            s += '==='.slice(0, 4 - (s.length % 4));
        }
        return atob(s.replace(/_/g, '/').replace(/-/g, '+'));
    }

    /**
     * split by character. decided not to use the
     * Array.prototype.map.call trick.
     */
    static stringToCharArray(s: string) {
        let ar: string[] = [];
        for (let i = 0; i < s.length; i++) {
            ar.push(s[i]);
        }

        return ar;
    }

    /**
     * split to bytes. decided not to use the
     * Array.prototype.map.call trick.
     */
    static stringToByteArray(s: string) {
        let ar: number[] = [];
        for (let i = 0; i < s.length; i++) {
            ar.push(s.charCodeAt(i));
        }

        return ar;
    }
}

/**
 * holds a value. useful for out-parameters.
 */
export class ValHolder<T> {
    constructor(public val: T) {}
}

/**
 * a plain JS object, can be null
 */
type AnyJsonInner =
    | string
    | number
    | boolean
    | null
    | { [property: string]: AnyJsonInner }
    | AnyJsonInner[];

/**
 * indicates that the value is a plain JS object
 */
export type AnyJson = { [property: string]: AnyJsonInner } | AnyJsonInner[];
export type NoParameterCtor<T> = { new (): T };
export type AnyParameterCtor<T> = { new (...args: any): T };

/**
 * by jcalz, stackoverflow
 */
export type TypeLikeAnEnum<E> = Record<keyof E, number | string> & {
    [k: number]: string;
};

/**
 * list enum vals
 */
export function listEnumVals<T>(Enm: T, makeLowercase: boolean) {
    let s = '';
    for (let enumMember in Enm) {
        /* show possible values */
        if (
            isString(enumMember) &&
            !enumMember.startsWith('__') &&
            !enumMember.startsWith('__AlternateForm__') &&
            !scontains('0123456789', enumMember[0].toString())
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
export function findStrToEnum<E>(Enm: TypeLikeAnEnum<E>, s: string): O<E> {
    assertTrue(
        Enm['__isUI512Enum'] !== undefined,
        '4F|must provide an enum type with __isUI512Enum defined.',
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
export function getStrToEnum<E>(
    Enm: TypeLikeAnEnum<E>,
    msgContext: string,
    s: string,
): E {
    let found = findStrToEnum(Enm, s);
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

        throw makeUI512Error(msgContext, '4E|');
    }
}

/**
 * enum to string.
 * checks that the primary string is returned, not a synonym ('alternate form')
 */
export function findEnumToStr<E>(Enm: TypeLikeAnEnum<E>, n: number): O<string> {
    assertTrue(
        Enm['__isUI512Enum'] !== undefined,
        '4D|must provide an enum type with __isUI512Enum defined.',
    );

    /* using e[n] would work, but it's fragile if enum implementation changes. */
    for (let enumMember in Enm) {
        if (
            (Enm[enumMember] as any) === n &&
            !enumMember.startsWith('__') &&
            !enumMember.startsWith('__AlternateForm__')
        ) {
            let makeLowercase = Enm['__UI512EnumCapitalize'] !== undefined;
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
export function getEnumToStrOrUnknown<E>(
    Enm: TypeLikeAnEnum<E>,
    n: number,
    fallback = 'Unknown',
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
 * let myObj = cast(o, MyClass)
 */
export function cast<T>(
    instance: any,
    ctor: { new (...args: any[]): T },
    context?: string,
): T {
    if (instance instanceof ctor) {
        return instance;
    }

    throw makeUI512Error('J7|type cast exception', context);
}

/**
 * be extra cautious in case string was made via new String
 */
export function isString(v: any) {
    return bool(typeof v === 'string') || bool(v instanceof String);
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
 * just a flag indicating that the operation is complete.
 */
export class RenderComplete {
    complete = true;
    and(other: RenderComplete) {
        this.complete = this.complete && other.complete;
    }

    andB(other: boolean) {
        this.complete = this.complete && other;
    }
}

/**
 * compare any two objects.
 * confirms that types match.
 * works on arbitrarily nested array structures.
 * can be used in .sort() or just to compare values.
 */
export function sensibleSort(a: any, b: any): number {
    if (a === undefined && b === undefined) {
        return 0;
    } else if (a === null && b === null) {
        return 0;
    } else if (isString(a) && isString(b)) {
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
            let cmp = sensibleSort(a[i], b[i]);
            if (cmp !== 0) {
                return cmp;
            }
        }
        return 0;
    } else {
        throw makeUI512Error(`4B|could not compare types ${a} and ${b}`);
    }
}

/**
 * use the function to provide sort order
 * like Python's sort(key=fn)
 * often more efficient than passing a comparison function.
 */
export function sortDecorated(ar: any[], fn: Function) {
    // 1) decorate
    let decorated = ar.map((val: any) => [fn(val), val]);
    // 2) sort
    let comparer = function(a: any[], b: any[]) {
        return sensibleSort(a[0], b[0]);
    };
    decorated.sort(comparer);
    // 3) undecorate
    return decorated.map((val: any[]) => val[1]);
}

/**
 * can be used to build a periodic timer.
 */
export class RepeatingManualTimer {
    periodInMilliseconds = 0;
    lasttimeseen = 0;
    started = 0;
    constructor(periodInMilliseconds: number) {
        this.periodInMilliseconds = periodInMilliseconds;
    }

    update(ms: number) {
        this.lasttimeseen = ms;
    }

    isDue(): boolean {
        return this.lasttimeseen - this.started > this.periodInMilliseconds;
    }

    reset() {
        this.started = this.lasttimeseen;
    }
}

/**
 * a map from string to object that preserves insertion order.
 * like Python's OrderedDict
 */
export class OrderedHash<TValue> {
    protected keys: string[] = [];
    protected vals: { [key: string]: TValue } = Object.create(null);

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
        return throwIfUndefined(this.find(k), '41|could not find ', k);
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
 * currently just the detected OS
 */
export enum BrowserOSInfo {
    __isUI512Enum = 1,
    Unknown,
    Windows,
    Linux,
    Mac,
}

/**
 * CharClassify
 *
 * Permission to use, copy, modify, and distribute this software and its
 * documentation for any purpose and without fee is hereby granted,
 * provided that the above copyright notice appear in all copies and that
 * both that copyright notice and this permission notice appear in
 * supporting documentation.
 * Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>
 * Ported from C++ to TypeScript by Ben Fisher, 2017
 */
export enum CharClass {
    __isUI512Enum = 1,
    Space,
    NewLine,
    Word,
    Punctuation,
}

/**
 * Porting SciTE's logic for typing move-to-next-word and move-to-prev-word.
 */
export class GetCharClass {
    static readonly a = 'a'.charCodeAt(0);
    static readonly z = 'z'.charCodeAt(0);
    static readonly A = 'A'.charCodeAt(0);
    static readonly Z = 'Z'.charCodeAt(0);
    static readonly n0 = '0'.charCodeAt(0);
    static readonly n9 = '9'.charCodeAt(0);
    static readonly hash = '#'.charCodeAt(0);
    static readonly under = '_'.charCodeAt(0);
    static readonly dash = '-'.charCodeAt(0);
    static readonly nl = '\n'.charCodeAt(0);
    static readonly cr = '\r'.charCodeAt(0);
    static readonly space = ' '.charCodeAt(0);
    static readonly nonbreakingspace = '\xCA'.charCodeAt(0);

    /**
     * classify a character as word or whitespace
     */
    static get(c: number) {
        if (c === GetCharClass.cr || c === GetCharClass.nl) {
            return CharClass.NewLine;
        } else if (
            c < 0x20 ||
            c === GetCharClass.space ||
            c === GetCharClass.nonbreakingspace
        ) {
            return CharClass.Space;
        } else if (
            (c >= 0x80 && c <= 0xff) ||
            (c >= GetCharClass.a && c <= GetCharClass.z) ||
            (c >= GetCharClass.A && c <= GetCharClass.Z) ||
            (c >= GetCharClass.n0 && c <= GetCharClass.n9) ||
            c === GetCharClass.hash ||
            c === GetCharClass.under ||
            c === GetCharClass.dash
        ) {
            return CharClass.Word;
        } else if (c <= 0xff) {
            return CharClass.Punctuation;
        } else {
            /* let's choose to treat all unicode non-ascii as word. */
            return CharClass.Word;
        }
    }

    /**
     * move left or right in the text editor...
     * charCodeAt gets the character code at an index in the string
     * len is the length of the string
     * n is current index (caret position) in the string
     * isLeft is true if moving left, false if moving right
     * isUntilWord means to keep moving until word boundary is seen.
     * returns the next caret position.
     */
    static getLeftRight(
        charCodeAt: (pos: number) => number,
        len: number,
        n: number,
        isLeft: boolean,
        isUntilWord: boolean,
        includeTrailingSpace: boolean,
    ) {
        if (len === 0) {
            return n;
        }

        if (isUntilWord && isLeft) {
            if (includeTrailingSpace) {
                while (n > 0 && GetCharClass.get(charCodeAt(n - 1)) === CharClass.Space) {
                    n--;
                }
            }

            if (n > 0) {
                let classStart = GetCharClass.get(charCodeAt(n - 1));
                while (n > 0 && GetCharClass.get(charCodeAt(n - 1)) === classStart) {
                    n--;
                }
            }
        } else if (isUntilWord && !isLeft) {
            if (n === len) {
                n -= 1;
            }

            let classStart = GetCharClass.get(charCodeAt(n));
            while (n < len && GetCharClass.get(charCodeAt(n)) === classStart) {
                n++;
            }

            if (includeTrailingSpace) {
                while (n < len && GetCharClass.get(charCodeAt(n)) === CharClass.Space) {
                    n++;
                }
            }
        } else {
            n += isLeft ? -1 : 1;
        }

        return fitIntoInclusive(n, 0, len);
    }
}

/**
 * just to avoid magic number in parseInt(x, 10)
 */
export const base10 = 10;

/**
 * map a key to object, does not allow setting a value twice.
 */
export class MapKeyToObject<T> {
    protected objects: { [key: string]: T } = Object.create(null);
    get(key: string) {
        return throwIfUndefined(this.objects[key], '3_|id not found', key);
    }

    exists(key: string) {
        return Object.prototype.hasOwnProperty.call(this.objects, key);
    }

    find(key: O<string>) {
        if (key) {
            return this.objects[key];
        } else {
            return undefined;
        }
    }

    add(key: string, obj: T) {
        assertTrue(slength(key) > 0, `3^|invalid id ${key}`);
        if (this.objects[key] !== undefined) {
            throw makeUI512Error(`3]|duplicate key, ${key} already exists`);
        }

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
 * a quick way to throw an expection if value is not what was expected.
 */
export function checkThrowEq(
    expected: any,
    got: any,
    msg: string,
    c1: any = '',
    c2: any = '',
) {
    if (sensibleSort(expected, got) !== 0) {
        throw makeUI512Error(
            `${msg} expected "${expected}" but got "${got}" ${c1} ${c2}`,
        );
    }
}

/**
 * a quick way to trigger assertion if value is not what was expected.
 * 'hard' assert, does not let execution continue.
 */
export function assertEq(expected: any, received: any, c1: string, c2?: any, c3?: any) {
    if (sensibleSort(expected, received) !== 0) {
        let msg = longstr(`assertion failed in assertEq,
            expected '${expected}' but got '${received}'.`);
        throw makeUI512Error(msg, c1, c2, c3);
    }
}

/**
 * a quick way to trigger assertion if value is not what was expected.
 *  'soft' assert, lets execution continue.
 */
export function assertEqWarn(
    expected: any,
    received: any,
    c1: string,
    c2?: any,
    c3?: any,
) {
    if (sensibleSort(expected, received) !== 0) {
        let msg = longstr(`warning, assertion failed in assertEqWarn,
            expected '${expected}' but got '${received}'.`);
        let er = makeUI512Error(msg, c1, c2, c3);
        if (!window.confirm('continue?')) {
            throw er;
        }
    }
}

/**
 * is it truthy? anything except false, 0, "", null, undefined, and NaN
 */
export function bool(x: any): boolean {
    return !!x;
}

/**
 * conveniently write a long string
 */
export function longstr(s: string) {
    return s.replace(/\s*(\r\n|\n)\s*/g, ' ');
}
