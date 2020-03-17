
// gnosticnotepad
// copyright Ben Fisher, 2017

export function bwtCreateError(msg: string, c1?: any, c2?: any, c3?: any, c4?: any, c5?: any) {
    msg = 'bwt: ' + msg;
    if (c1) {
        msg += ' context: ' + c1.toString();
    }

    msg += c2 ? c2.toString() : '';
    msg += c3 ? c3.toString() : '';
    msg += c4 ? c4.toString() : '';
    msg += c5 ? c5.toString() : '';
    console.error(msg);
    if (!checkIsRelease()) {
        debugger;
    }

    window.alert(msg);
    return new Error(msg);
}

export function bwtRespondError(e: Error, context: string) {
    if (e.message.startsWith('bwt: ')) {
        console.log('caught bwt ' + e.message + ' at context ' + context);
        window.alert(e.message + ' ' + context);
    } else {
        console.error(e.message);
        if (!checkIsRelease()) {
            debugger;
        }

        window.alert(e.message);
    }
}

export function assertTrue(condition: any, c1?: any, c2?: any, c3?: any, c4?: any, c5?: any) {
    if (!condition) {
        throw bwtCreateError('assertion failed in assertTrue.', c1, c2, c3, c4, c5);
    }
}

export function assertEq(expected: any, received: any, c1?: any, c2?: any, c3?: any, c4?: any, c5?: any) {
    if (defaultSort(expected, received) !== 0) {
        let msg =
            "assertion failed in assertEq, expected '" +
            expected.toString() +
            "' but got '" +
            received.toString() +
            "'.";
        throw bwtCreateError(msg, c1, c2, c3, c4, c5);
    }
}

export function assertTrueWarn(condition: any, c1?: any, c2?: any, c3?: any, c4?: any, c5?: any) {
    if (!condition) {
        let er = bwtCreateError('warning, assertion failed in assertTrueWarn.', c1, c2, c3, c4, c5);
        if (!window.confirm('continue?')) {
            throw er;
        }
    }
}

export function assertEqWarn(expected: any, received: any, c1?: any, c2?: any, c3?: any, c4?: any, c5?: any) {
    if (defaultSort(expected, received) !== 0) {
        let msg =
            "warning, assertion failed in assertEqWarn, expected '" +
            expected.toString() +
            "' but got '" +
            received.toString() +
            "'.";
        let er = bwtCreateError(msg, c1, c2, c3, c4, c5);
        if (!window.confirm('continue?')) {
            throw er;
        }
    }
}

export function assertNever(msg: string, c1?: any, c2?: any, c3?: any, c4?: any, c5?: any): never {
    throw bwtCreateError(msg, c1, c2, c3, c4, c5);
}

// optional type
export type O<T> = T | undefined | null;

export function bool(x: any): boolean {
    // false, 0, "", null, undefined, and NaN
    return !!x;
}

export function booltrue(b: any) {
    assertEq(typeof b, 'boolean');
    return !!b;
}

export function add(a: number, b: number) {
    return a + b;
}

export function scontains(haystack: string, needle: string) {
    return haystack.indexOf(needle) != -1;
}

export function slength(s: O<string>) {
    return !s ? 0 : s.length;
}

export function setarr<T>(ar: O<T>[], index: number, val: T) {
    assertTrue(index >= 0);
    if (index >= ar.length) {
        for (let i = 0; i < index - ar.length; i++) {
            ar.push(undefined);
        }
    }

    ar[index] = val;
}

export function cast<T>(instance: any, ctor: { new (...args: any[]): T }): T {
    if (instance instanceof ctor) return instance;
    throw new Error('type cast exception');
}

export function isValidNumber(value: any) {
    return typeof value === 'number' && isFinite(value);
}

export function range(start: number, end?: number, inc = 1) {
    if (end === undefined) {
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

export function repeat<T>(amount: number, item: T) {
    let ret: T[] = [];
    for (let i = 0; i < amount; i++) {
        ret.push(item);
    }

    return ret;
}

export class RenderComplete {
    complete = true;
    public and(other: RenderComplete) {
        this.complete = this.complete && other.complete;
    }
}

export function defaultSort(a: any, b: any, onlyThisManyElements?: number): number {
    if (a === undefined && b === undefined) {
        return 0;
    } else if (a === null && b === null) {
        return 0;
    } else if (typeof a === 'string' && typeof b === 'string') {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }
    if (typeof a === 'number' && typeof b === 'number') {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }
    if (typeof a === 'boolean' && typeof b === 'boolean') {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    } else if (a instanceof Array && b instanceof Array) {
        if (a.length < b.length) return -1;
        if (a.length > b.length) return 1;
        let howManyElementsToSort = onlyThisManyElements ? Math.min(onlyThisManyElements, a.length) : a.length;
        for (let i = 0; i < howManyElementsToSort; i++) {
            let cmp = defaultSort(a[i], b[i]);
            if (cmp != 0) return cmp;
        }
        return 0;
    } else {
        throw bwtCreateError(`could not compare types ${a} and ${b}`);
    }
}

export function makeDefaultSort(onlyThisManyElements?: number) {
    return function(a: any, b: any) {
        return defaultSort(a, b, onlyThisManyElements);
    };
}

export class RepeatingTimer {
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

export interface Root {
    invalidateAll(): void;
    setCursor(s: string): void;
    runTests(all: boolean): void;
}

// considered ES6 Map, but its order is inflexible
export class OrderedHash<ValueType> {
    private keys: string[] = [];
    private vals: { [key: string]: ValueType } = {};
    public insertOrReplace(k: string, v: ValueType) {
        assertTrue(k !== null && k !== undefined);
        assertTrue(v !== undefined);
        if (this.vals[k] !== undefined) {
            this.keys.push(k);
        }
        this.vals[k] = v;
    }

    public insertNew(k: string, v: ValueType) {
        assertTrue(k !== null && k !== undefined);
        assertTrue(v !== undefined);
        assertTrue(this.vals[k] === undefined, `key ${k} already exists`);
        this.keys.push(k);
        this.vals[k] = v;
    }

    public insertBefore(keyBefore: string, k: string, v: ValueType) {
        assertTrue(k !== null && k !== undefined);
        assertTrue(v !== undefined);
        assertTrue(this.vals[k] === undefined, `key ${k} already exists`);
        let index = this.keys.indexOf(keyBefore);
        assertTrue(index !== -1, `key ${keyBefore} not found`);
        this.keys.splice(index, 0, k);
        this.vals[k] = v;
    }

    public find(k: string): O<ValueType> {
        return this.vals[k];
    }

    public get(k: string): ValueType {
        let ret = this.find(k);
        if (ret) {
            return ret;
        } else {
            throw bwtCreateError('could not find ' + k);
        }
    }

    public delete(k: string): boolean {
        assertTrue(k !== null && k !== undefined);
        let index = this.keys.indexOf(k);
        if (index !== -1) {
            this.keys.splice(index, 1);
            delete this.vals[k];
            return true;
        } else {
            return false;
        }
    }

    public length() {
        return this.keys.length;
    }

    public *iterKeys() {
        for (let k of this.keys) {
            yield k;
        }
    }

    public *iter() {
        for (let k of this.keys) {
            yield this.vals[k];
        }
    }

    public *iterReversed() {
        for (let i = this.keys.length - 1; i >= 0; i--) {
            yield this.vals[this.keys[i]];
        }
    }
}

export function beginLoadImage(url: string, img: HTMLImageElement, callback: () => void) {
    img.addEventListener('load', () => callback());
    img.onerror = function() {
        console.error('failed to load ' + url);
    };
    img.src = url;
    if (img.complete) {
        // a website mentioned onLoad might be skipped if image is cached.
        callback();
    }
}

export function beginLoadJson(url: string, req: XMLHttpRequest, callback: (s: string) => void) {
    req.overrideMimeType('application/json');
    req.open('GET', url, true);
    req.addEventListener('load', function() {
        if (req.status == 200) {
            callback(req.responseText);
        } else {
            console.error('failed to load ' + url + ' status=' + req.status);
        }
    });
    req.addEventListener('error', function() {
        console.error('failed to load ' + url);
    });
    req.send();
}

function runNextTest(root: Root, listNames: string[], listTests: Function[], index: number) {
    if (index >= listTests.length) {
        console.log(`${listTests.length + 1}/${listTests.length + 1} all tests complete!`);
    } else {
        console.log(`${index + 1}/${listTests.length + 1} starting ${listNames[index]}`);
        let nextTest = index + 1;
        if (listNames[index].startsWith('callback/')) {
            listTests[index](root, () => {
                runNextTest(root, listNames, listTests, nextTest);
            });
        } else {
            listTests[index](root);
            setTimeout(() => {
                runNextTest(root, listNames, listTests, nextTest);
            }, 1);
        }
    }
}

declare const WEBPACK_PRODUCTION: boolean;

export function checkIsRelease() {
    let ret = false;
    try {
        // when webpack builds this file it will replace the symbol
        // with `true` or `false`
        ret = WEBPACK_PRODUCTION;
    } catch {
        ret = false;
    }

    return ret;
}

export class Tests_BaseClass {
    tests: (string | Function)[] = [];

    addTest(
        name: string,
        fn: Function,
        listNames: string[],
        listTests: Function[],
        testNamesUsed: { [name: string]: boolean },
    ) {
        assertTrue(testNamesUsed[name] === undefined, name);
        testNamesUsed[name] = true;
        listNames.push(name);
        listTests.push(fn);
    }

    getAllTests(listNames: string[], listTests: Function[]) {
        let testNamesUsed: { [name: string]: boolean } = {};
        assertTrue(this.tests.length % 2 == 0);
        for (let i = 0; i < this.tests.length; i += 2) {
            let name = this.tests[i];
            let test = this.tests[i + 1];
            if (typeof name === 'string' && typeof test === 'function') {
                this.addTest(name, test, listNames, listTests, testNamesUsed);
            } else {
                assertTrue(false, name + ' ' + test);
            }
        }
    }
}

export function runTestsArray(root: Root, registeredTests: any[], all = true) {
    console.log('gathering tests...');
    let listNames: string[] = [];
    let listTests: Function[] = [];
    for (let [fn, isSlow] of registeredTests) {
        if (!isSlow || all) {
            let testInstance = fn();
            if (testInstance && testInstance instanceof Tests_BaseClass) {
                (testInstance as Tests_BaseClass).getAllTests(listNames, listTests);
            }
        } else {
            console.log("skipping a test suite because it is 'slow'");
        }
    }

    console.log('starting tests...');
    runNextTest(root, listNames, listTests, 0);
}
