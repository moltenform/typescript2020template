
/* auto */ import { msgInternalErr, msgNotification, msgScriptErr, ui512InternalErr, } from './benBaseUtilsProductname';

// moltenform.com(Ben Fisher), 2020
// MIT license

/**
 * make an error object, record the error, and depending on severity, show alert box
 * you can pass in arguments to indicate context of when/why error occurred
 */
function makeUI512ErrorGeneric(
    firstMsg: string,
    prefix: string,
    s1?: unknown,
    s2?: unknown,
    s3?: unknown,
) {
    let msg = joinIntoMessage(firstMsg, prefix, s1, s2, s3);
    let err = new Error(msg);
    try {
        recordAndShowErr(firstMsg, msg + '\n' + err.stack);
    } catch (e) {
        console.error('could not record err ' + e.message);
    }

    return err;
}

/**
 * make ui exception
 */
export function makeUI512Error(msg: string, s1?: unknown, s2?: unknown, s3?: unknown) {
    return makeUI512ErrorGeneric(msg, ui512InternalErr, s1, s2, s3);
}

/**
 * respond to exception, only for unexpected cases where answerDialog isn't available
 */
export function respondUI512Error(e: Error, context: string) {
    if ((e as any).isUi512Error) {
        /* assert.ts */
        console.log('caught ' + e.message + ' at context ' + context);
        console.log(e.stack);
        window.alert(e.message + ' ' + context);
    } else {
        console.error(e.message);
        console.error(e.stack);
        breakIntoDebugger();
        window.alert(e.message);
    }
}

/**
 * note: this is a 'hard' assert that always throws an exception + shows a dialog
 * use assertTrueWarn if it's not a very important check
 */
export function assertTrue(
    condition: unknown,
    s1: string,
    s2?: unknown,
    s3?: unknown,
): asserts condition {
    if (!condition) {
        throw makeUI512Error('assertion failed in assertTrue.', s1, s2, s3);
    }
}

/**
 * a 'soft' assert. Record the error, but allow execution to continue
 */
export function assertTrueWarn(
    condition: unknown,
    s1: string,
    s2?: unknown,
    s3?: unknown,
) {
    if (!condition) {
        let er = makeUI512Error(
            'warning, assertion failed in assertTrueWarn.',
            s1,
            s2,
            s3,
        );
        if (!window.confirm('continue?')) {
            throw er;
        }
    }
}

/**
 * a quick way to throw an exception if condition is false
 */
export function checkThrowUI512(
    condition: unknown,
    msg: string,
    s1: unknown = '',
    s2: unknown = '',
): asserts condition {
    if (!condition) {
        throw makeUI512Error(`${msg} ${s1} ${s2}`);
    }
}

/**
 * a way to safely go from optional<T> to T
 */
export function throwIfUndefined<T>(
    v: O<T>,
    s1: string,
    s2: unknown = '',
    s3: unknown = '',
): T {
    if (v === undefined || v === null) {
        let msg = 'not defined';
        if (s1 !== '') {
            msg += ', ' + s1;
        }

        if (s2 !== '') {
            msg += ', ' + s2;
        }

        if (s3 !== '') {
            msg += ', ' + s3;
        }

        throw makeUI512Error(msg);
    } else {
        return v;
    }
}

/**
 * a short way to say optional<T>.
 * prefer O<string> over ?string, I find it easier to read and reason about.
 */
export type O<T> = T | undefined;

/**
 * external LZString compression
 */
declare let LZString: any;

/**
 * LZString uses the fact that JS strings have 16 bit chars to compress data succinctly.
 * I use compressToUTF16() instead of compress() to use only valid utf sequences.
 */
export class UI512Compress {
    protected static stringEscapeNewline = '##Newline##';
    protected static reEscapeNewline = new RegExp(UI512Compress.stringEscapeNewline, 'g');
    protected static reNewline = new RegExp('\n', 'g');
    static compressString(s: string): string {
        let compressed = LZString.compressToUTF16(s);
        return compressed;
    }

    static decompressString(s: string): string {
        return LZString.decompressFromUTF16(s);
    }
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
class RingBufferLocalStorage extends RingBuffer {
    getAt(index: number): string {
        return window.localStorage['ui512Log_' + index] ?? '';
    }

    setAt(index: number, s: string) {
        window.localStorage['ui512Log_' + index] = s;
    }

    getLatestIndex() {
        let ptrLatest = parseInt(window.localStorage['ui512LogPtr'] ?? '0', 10);
        return Number.isFinite(ptrLatest) ? ptrLatest : 0;
    }

    setLatestIndex(index: number) {
        window.localStorage['ui512LogPtr'] = index.toString();
    }
}

/**
 * if an error is thrown, show a warning message and swallow the error
 */
export function showWarningIfExceptionThrown(fn: () => void) {
    try {
        fn();
    } catch (e) {
        assertTrueWarn(false, e.toString());
    }
}

/**
 * store logs. user can choose "send err report" to send us error context.
 */
export class UI512ErrorHandling {
    static breakOnThrow = true;
    static runningTests = false;
    static readonly maxEntryLength = 512;
    static readonly maxLinesKept = 256;
    static store = new RingBufferLocalStorage(UI512ErrorHandling.maxLinesKept);

    protected static encodeErrMsg(s: string) {
        s = s.substr(0, UI512ErrorHandling.maxEntryLength);
        return UI512Compress.compressString(s);
    }

    protected static decodeErrMsg(compressed: string) {
        return UI512Compress.decompressString(compressed);
    }

    static appendErrMsgToLogs(showedDialog: boolean, s: string) {
        if (
            !UI512ErrorHandling.runningTests &&
            !!window.localStorage &&
            !scontains(s, msgNotification)
        ) {
            let severity = showedDialog ? '1' : '2';
            let encoded = severity + UI512ErrorHandling.encodeErrMsg(s);
            UI512ErrorHandling.store.append(encoded);
        }
    }

    static getLatestErrLogs(amount: number): string[] {
        return UI512ErrorHandling.store.retrieve(amount);
    }
}

/**
 * string-contains
 */
export function scontains(haystack: string, needle: string) {
    return haystack.indexOf(needle) !== -1;
}

/**
 * sometimes when showing exception message, don't need to show prefix
 */
export function cleanExceptionMsg(s: string) {
    if (s.startsWith(msgInternalErr + ' ' + msgNotification)) {
        s = s.substr((msgInternalErr + ' ' + msgNotification).length).trim();
    }

    if (s.startsWith(ui512InternalErr)) {
        s = s.substr(ui512InternalErr.length).trim();
    } else if (s.startsWith(msgScriptErr)) {
        s = s.substr(msgScriptErr.length).trim();
    } else if (s.startsWith(msgInternalErr)) {
        s = s.substr(msgInternalErr.length).trim();
    }

    s = s.trim();
    return s;
}

/**
 * combine strings, and move all 'tags' to the end
 */
export function joinIntoMessage(
    c0: string,
    prefix: string,
    s1?: unknown,
    s2?: unknown,
    s3?: unknown,
) {
    let tags: string[] = [];
    c0 = findTags(c0, tags) ?? '';
    s1 = findTags(s1, tags);
    let message = prefix + ' ' + c0;
    message += s1 ? '\n' + s1 : '';
    message += s2 ? ', ' + s2 : '';
    message += s3 ? ', ' + s3 : '';
    if (tags.length) {
        message += ' (' + tags.join(',') + ')';
    }

    return message;
}

/**
 * an error that can be attached with markUI512Err
 */
export interface UI512AttachableErr {}

/**
 * break into debugger. V8 js perf sometimes hurt if seeing a debugger
 * statement, so separate it here.
 */
function breakIntoDebugger() {
    if (!checkIsRelease()) {
        debugger;
    }
}

/**
 * record and show an unhandled exception
 */
function recordAndShowErr(firstMsg: string, msg: string) {
    if (UI512ErrorHandling.breakOnThrow || scontains(firstMsg, 'assertion failed')) {
        UI512ErrorHandling.appendErrMsgToLogs(true, msg);
        console.error(msg);
        breakIntoDebugger();
        window.alert(msg);
    } else {
        UI512ErrorHandling.appendErrMsgToLogs(false, msg);
    }
}

/**
 * we add two-digit tags to most asserts, so that if a bug report comes in,
 * we have more context about the site of failure.
 * assert tags are in the form xx|; this fn extracts them from a string.
 */
function findTags(s: unknown, tags: string[]): O<string> {
    if (s && typeof s === 'string' && s[2] === '|') {
        tags.push(s.slice(0, 2));
        return s.slice(3);
    } else if (!s) {
        return undefined;
    } else {
        return '' + s;
    }
}

declare const WEBPACK_PRODUCTION: boolean;

export function checkIsRelease(): boolean {
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
