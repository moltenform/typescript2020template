
import LzString from 'lz-string';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

/**
 * is it truthy? anything except false, 0, "", null, undefined, and NaN
 */
export function bool(x: unknown): boolean {
    /* eslint-disable-next-line no-implicit-coercion */
    return !!x;
}

/**
 * works as a typescript type assertion
 */
export function trueIfDefinedAndNotNull<T>(x: O<T>): x is T {
    return bool(x);
}

/**
 * cast to string.
 * we used to have an isstring() check, but weird 'new String'
 * hybrid strings are rare and banned by es-lint, so assumed not to occur.
 */
export function tostring(s: unknown): string {
    /* nb: this is not the unsafe `new String()` constructor */
    return String(s);
}

/**
 * retains the let a = b || c; behavior
 */
export function coalesceIfFalseLike<T>(instance: T | null | undefined, defaultval: T): T {
    return instance ? instance : defaultval;
}

/**
 * this will not exist at runtime, the string is rewritten
 */
declare const WEBPACK_PRODUCTION: boolean;
declare const DBGPLACEHOLDER: boolean;

/**
 * check if we are in a production build.
 */
export function checkIsProductionBuild(): boolean {
    let ret = false;
    try {
        /* when webpack builds this file it will replace the string */
        /* with `true` or `false` */
        ret = WEBPACK_PRODUCTION;
    } catch {
        ret = false;
    }

    return ret;
}

/**
 * at build time, the string below
 * might be replaced with "debugger".
 * V8's perf can be affected if there's a debugger statement around,
 * so this makes sure it's not even there.
 */
export function callDebuggerIfNotInProduction(context?: string) {
    console.log('callDebuggerIfNotInProduction: ' + (context ?? ''));
    window['DBG' + 'PLACEHOLDER'] = true;
    /* eslint-disable-next-line no-unused-expressions */
    DBGPLACEHOLDER;
}

/**
 * store the last <size> log entries, without needing to
 * move contents or allocate more memory.
 */
export abstract class RingBuffer {
    constructor(protected size: number) {}

    /**
     * add log to buffer.
     */
    append(s: string) {
        let ptrLatest = this.getLatestIndex();
        ptrLatest = this.mod(ptrLatest + 1, this.size);
        this.setAt(ptrLatest, s);
        this.setLatestIndex(ptrLatest);
    }

    /**
     * retrieve the latest entries.
     */
    retrieve(howMany: number) {
        howMany = Math.min(howMany, this.size - 1);
        let ptrLatest = this.getLatestIndex();
        let ret: string[] = [];
        for (let i = 0; i < howMany; i++) {
            let index = this.mod(ptrLatest - i, this.size);
            ret.push(this.getAt(index));
        }

        return ret;
    }

    /**
     * more intuitive with negative numbers than the % operator
     */
    mod(a: number, n: number) {
        return ((a % n) + n) % n;
    }

    abstract getAt(index: number): string;
    abstract setAt(index: number, s: string): void;
    abstract getLatestIndex(): number;
    abstract setLatestIndex(index: number): void;
}

/**
 * use localstorage to store, so that logs persist when page is refreshed.
 * ui512LogPtr should be in local storage, we could be running in 2 browser windows.
 */
export class RingBufferLocalStorage extends RingBuffer {
    getAt(index: number): string {
        if (window.localStorage) {
            return window.localStorage.getItem('ui512Log_' + index.toString()) ?? '';
        } else {
            return '';
        }
    }

    setAt(index: number, s: string) {
        if (window.localStorage) {
            window.localStorage.setItem('ui512Log_' + index.toString(), s);
        }
    }

    getLatestIndex() {
        if (window.localStorage) {
            let sLatest = window.localStorage.getItem('ui512LogPtr') ?? '0';

            /* ok to use here, we remembered to say base 10 */
            /* eslint-disable-next-line ban/ban */
            let ptrLatest = parseInt(sLatest, 10);
            return Number.isFinite(ptrLatest) ? ptrLatest : 0;
        } else {
            return 0;
        }
    }

    setLatestIndex(index: number) {
        if (window.localStorage) {
            window.localStorage.setItem('ui512LogPtr', index.toString());
        }
    }
}

/**
 * a short way to say optional<T>.
 * prefer O<string> over ?string, I find it easier to read and reason about.
 */
export type O<T> = T | undefined;


/**
 * Helper for creating a 'static class' that has no state.
 * By using freeze we ensure state won't accidentally be attached.
 * 
 * Why not static methods on a class, maybe with a private ctor?
 * 1) verbose to specify static everywhere.
 * 2) can't use `this` to refer to methods in the class--
 * works in raw JS but transpilation/minifying/retargeting will often
 * rewrite the code such that `this` no longer references 
 * the class - it's legit fragile.
 * 3) also, there's a pitfall with unbound (i.e. stored calls)
 * for code like: const stored = MyClass.method; stored();
 * Works if the method happens to not reference `this` but fails at runtime
 * otherwise, which is not good. Probably possible to use typing
 * magic to have a const stored = MyClass.bound('method'), but ugly.
 * 
 * Why not the pattern const MyObject = { method: ()=> { return 1; } }
 * I do like the feel of this, and no binding issues with MyObject.method.
 * But again, you can't use `this` to call other methods, you'd need
 * to specify the full name which is verbose.
 * 
 * Why not namespaces? They're deprecated these days.
 * 
 * A singleton pattern would work but it's more lines of code
 * and has different semantics, we don't want it to feel like
 * there's one instance we want it to feel like it can't be instantiated.
 * Downside: unlike a true static method, needs to be bound
 * 
 * See automated tests for an example usage.
 */
export class UI512StaticClass {
    // Freezing is optional, it's unlikely that someone would call (this as any).state = 1
    // Can't use a constructor that calls Object.freeze(this)
    // but that would prevent method=()=>{} style methods from being added.
    private static instancesToFreeze: UI512StaticClass[] = [];
    
    constructor() {
        UI512StaticClass.instancesToFreeze.push(this);
    }

    static freezeAll() {
        for (let i = 0; i < UI512StaticClass.instancesToFreeze.length; i++) {
            Object.freeze(UI512StaticClass.instancesToFreeze[i]);
        }
    }
}

/**
 * LZString uses the fact that JS strings have 16 bit chars to compress data succinctly.
 * I use compressToUTF16() instead of compress() to use only valid utf sequences.
 */

export const UI512Compress = new class UI512Compress extends UI512StaticClass {
    protected stringEscapeNewline = '##Newline##';
    protected reEscapeNewline = new RegExp(this.stringEscapeNewline, 'g');
    protected reNewline = /\n/g;
    compressString = (s: string): string => {
        let compressed = LzString.compressToUTF16(s);
        return compressed;
    }

    decompressString= (s: string): string  => {
        return LzString.decompressFromUTF16(s) ?? '';
    }
}

