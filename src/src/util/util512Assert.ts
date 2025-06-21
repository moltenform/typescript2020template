
/* auto */ import { RingBufferLocalStorage, UI512Compress, bool, callDebuggerIfNotInProduction, tostring } from './util512Base';
import ExtendableError from 'es6-error';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

/**
 * Note that these asserts are "strong" asserts not to be ignored,
 * they're enabled in production, and throw exceptions on failure.
 * Failures that arise from mistaken user input should use check(),
 * whereas failures that arise from faulty logic should use assert().
 *
 * EXCEPTION HANDLING STRATEGY:
 *
 * We don't want any exception to be accidentally swallowed silently.
 * It's not enough to just put an alert in assertTrue,
 * because this won't cover base javascript errors like null-dereference.
 * It's important to show errors visibly so not to silently fall into
 * a bad state, and also we can log into local storage.
 * So, EVERY TOP OF THE CALL STACK must catch errors and send them to respondUI512Error
 * This includes:
 *          events from the browser (e.g. via golly)
 *              make sure they are wrapped in trycatch
 *          onload callbacks
 *              for images, json, server requests, dynamic script loading
 *              look for "addEventListener" and "onload"
 *              make sure they are wrapped in showMsgIfExceptionThrown
 *          setinterval and settimeout. use eslint ban / ban to stop them.
 *              use syncToAsyncAfterPause instead
 *          all async code
 *              use syncToAsyncTransition
 *          placeCallbackInQueue
 *              already ok because it's under the drawframe event.
 *
 */

/**
 * browser support is tricky when making a custom JS Error class.
 * previously, I rolled my own by adding properties onto a default Error class,
 * then checking for the existence of those tags.
 * browser support for ES6 is high enough now that I can target it and use npm's es6-error.
 */
export class Util512BaseErr extends ExtendableError {
    /* use this instead of .name to protect against minifying */
    typeName = 'Util512BaseErr';
    level = '';
    constructor(message: string, level: string) {
        super(message);
        this.level = level;
    }
}

/**
 * a warning. execution can continue afterwards, but
 * we'll show a message to the user.
 */
export class Util512Warn extends Util512BaseErr {
    override typeName = 'Util512Warn';
}

/**
 * just a message, not an error case.
 */
export class Util512Message extends Util512BaseErr {
    override typeName = 'Util512Message';
}

/**
 * helper for making a Util512BaseErr, at any level
 */
function makeUtil512BaseErrGeneric(
    firstMsg: string,
    level: string,
    s1?: unknown,
    s2?: unknown,
    s3?: unknown
) {
    let msg = joinIntoMessage(firstMsg, level, s1, s2, s3);
    return new Util512BaseErr(msg, level);
}

/**
 * make a Util512BaseErr
 */
export function make512Error(msg: string, s1?: unknown, s2?: unknown, s3?: unknown) {
    return makeUtil512BaseErrGeneric(msg, 'ui512', s1, s2, s3);
}

/**
 * duck type-checking, useful for try/catch
 */
export function ensureIsError(e: unknown): asserts e is Error {
    assertTrue(Boolean((e as any).message), 'Does not appear to be an error object');
}

/**
 * this is a hard assert that always throws.
 */
export function assertTrue(
    condition: unknown,
    s1?: string,
    s2?: unknown,
    s3?: unknown
): asserts condition {
    if (!condition) {
        if (!UI512ErrorHandling.silenceAssertMsgs) {
            let msg = joinIntoMessage('assertTrue:', 'ui512', s1, s2, s3);
            console.error(msg);
            callDebuggerIfNotInProduction(msg);
        }

        throw make512Error('assert:', s1, s2, s3);
    }
}

/**
 * can be ignored/ignore all.
 * if proceeding with execution would be unsafe, use assertTrue instead
 */
export function assertWarn(condition: unknown, s1?: string, s2?: unknown, s3?: unknown) {
    if (!condition) {
        if (UI512ErrorHandling.silenceAssertMsgs) {
            /* we are in a assertAsserts test,
            for testing convenience throw, we won't normally. */
            throw new Error(
                'assert:' + s1 + (s2 ? tostring(s2) : '') + (s3 ? tostring(s3) : '')
            );
        }

        let msg = joinIntoMessage('assert:', 'ui512', s1, s2, s3);
        console.error(msg);
        callDebuggerIfNotInProduction(msg);
        if (!UI512ErrorHandling.silenceWarnings) {
            /* we won't throw this error, but we'll make it
            so we can save it + the callstack to logs */
            let e = new Util512Warn(msg, 'ui512warn');
            respondUI512Error(e, 'ui512warn');
            if (UI512ErrorHandling.runningTests) {
                let msgTotal = msg + ' Press Cancel to exit tests.';
                if (!confirm(msgTotal)) {
                    throw new Error('Exiting tests.');
                }
            } else {
                let msgTotal = msg + ' Press OK to silence future asserts.';
                if (confirm(msgTotal)) {
                    UI512ErrorHandling.silenceWarnings = true;
                }
            }
        }
    }
}

/**
 * a quick way to throw if condition is false.
 * not the same as assert - an assert should only be
 * triggered for unexpected conditions.
 */
export function checkThrow512(
    condition: unknown,
    msg: string,
    s1: unknown = '',
    s2: unknown = ''
): asserts condition {
    if (!condition) {
        throw make512Error(msg, s1, s2);
    }
}

/* see also: assertEq, assertWarnEq, checkThrowEq in util512.ts */

/**
 * store logs. user can choose "send err report" to send us error context.
 */
export class UI512ErrorHandling {
    static shouldRecordErrors = true;
    static runningTests = false;
    static silenceAssertMsgs = false;
    static silenceWarnings = false;
    static silenceWarningsAndMore = false;
    static silenceWarningsAndMoreCount = 0;
    static contextHint = '';
    static readonly maxEntryLength = 512;
    static readonly maxLinesKept = 256;
    static store = new RingBufferLocalStorage(UI512ErrorHandling.maxLinesKept);

    protected static encodeErrMsg(s: string) {
        s = s.substring(0, UI512ErrorHandling.maxEntryLength);
        return UI512Compress.compressString(s);
    }

    protected static decodeErrMsg(compressed: string) {
        return UI512Compress.decompressString(compressed);
    }

    static appendErrMsgToLogs(severity: boolean, s: string) {
        if (UI512ErrorHandling.shouldRecordErrors) {
            if (!UI512ErrorHandling.runningTests) {
                let sseverity = severity ? '1' : '2';
                let encoded = sseverity + UI512ErrorHandling.encodeErrMsg(s);
                UI512ErrorHandling.store.append(encoded);
            }
        }
    }

    static getLatestErrLogs(amount: number): string[] {
        return UI512ErrorHandling.store.retrieve(amount);
    }
}

/**
 * I used to show a dialog in assertTrue, but that's not needed,
 * since we'll show a dialog in the respondtoui512. and by putting the
 * logging in just the response and not the error site, we won't have
 * unbounded recursion if there's an exception in the logging code.
 *
 * how to respond to exception:
 */
export function respondUI512Error(e: Error, context: string, logOnly = false) {
    let message =
        (e as any).typeName?.includes('Message') ||
        /* bool */ (e as any).typeName?.includes('Msg');
    let warn = (e as any).typeName?.includes('Warn');
    let structure = bool((e as any).typeName);
    callDebuggerIfNotInProduction(e.message);
    if (message) {
        /* not really an error, just a message */
        if (logOnly) {
            console.error(e.message);
        } else {
            window.alert(e.message);
        }

        return;
    }

    let sAllInfo = '';
    if (e.message) {
        sAllInfo += e.message;
    }
    if (e.stack) {
        sAllInfo += '\n\n' + e.stack.toString();
    }
    if ((e as any).line) {
        sAllInfo += '\n\n' + tostring((e as any).line);
    }
    if ((e as any).sourceURL) {
        sAllInfo += '\n\n' + tostring((e as any).sourceURL);
    }
    if (!structure && UI512ErrorHandling.contextHint) {
        sAllInfo += ` ${UI512ErrorHandling.contextHint}`;
    }
    if (context) {
        sAllInfo += ` (${context})`;
    }

    console.error(sAllInfo);
    let severity = false;
    if (!e.message || !e.message.includes('assertion failed')) {
        severity = true;
    }

    if (UI512ErrorHandling.shouldRecordErrors && !UI512ErrorHandling.runningTests) {
        UI512ErrorHandling.appendErrMsgToLogs(severity, sAllInfo);
    }

    /* let's always show at least some type of dialog,
    unless user has explicitly silenced it. */
    if (!(warn && UI512ErrorHandling.silenceWarnings)) {
        UI512ErrorHandling.silenceWarningsAndMoreCount += 1;
        if (logOnly || UI512ErrorHandling.silenceWarningsAndMore) {
            /* do nothing, we've already logged it */
        } else if (UI512ErrorHandling.silenceWarningsAndMoreCount > 4) {
            /* unfortunately, we probably want an option like this,
            otherwise if there's a steady stream of dialogs it will be bad */
            let msgTotal =
                sAllInfo +
                ` -- we recommend that you save your` +
                `work and refresh the website -- Press OK to silence future asserts`;
            if (confirm(msgTotal)) {
                UI512ErrorHandling.silenceWarningsAndMore = true;
            }
        } else {
            window.alert(sAllInfo);
        }
    }
}

/**
 * combine strings
 */
export function joinIntoMessage(
    c0: string,
    level: string,
    s1?: unknown,
    s2?: unknown,
    s3?: unknown
) {
    let message = level + ': ' + c0;
    message += s1 ? '\n' + tostring(s1) : '';
    message += s2 ? ', ' + tostring(s2) : '';
    message += s3 ? ', ' + tostring(s3) : '';
    return message;
}

/**
 * a way to safely go from optional<T> to T
 */
export function ensureDefined<T>(
    v: T | null | undefined,
    s1: string,
    s2: unknown = '',
    s3: unknown = ''
): T {
    if (v === undefined || v === null) {
        let sTotal = 'not defined';
        if (s1 !== '') {
            sTotal += ', ' + s1;
        }

        if (s2 !== '') {
            sTotal += ', ' + tostring(s2);
        }

        if (s3 !== '') {
            sTotal += ', ' + tostring(s3);
        }

        throw make512Error(sTotal);
    } else {
        return v;
    }
}
