
/* auto */ import { msgInternalErr, msgNotification, msgScriptErr, ui512InternalErr } from './util512Productname';
/* auto */ import { O, RingBufferLocalStorage, UI512Compress, bool, callDebuggerIfNotInProduction, tostring } from './util512Base';

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
    s3?: unknown
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
        callDebuggerIfNotInProduction();
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
    s3?: unknown
): asserts condition {
    if (!condition) {
        throw makeUI512Error('O#|assertion failed in assertTrue.', s1, s2, s3);
    }
}

/**
 * a 'soft' assert. Record the error, but allow execution to continue
 */
export function assertTrueWarn(
    condition: unknown,
    s1: string,
    s2?: unknown,
    s3?: unknown
) {
    if (!condition) {
        let er = makeUI512Error(
            'O!|warning, assertion failed in assertTrueWarn.',
            s1,
            s2,
            s3
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
    s2: unknown = ''
): asserts condition {
    if (!condition) {
        throw makeUI512Error(`O |${msg} ${s1} ${s2}`);
    }
}

/**
 * a way to safely go from optional<T> to T
 */
export function throwIfUndefined<T>(
    v: O<T>,
    s1: string,
    s2: unknown = '',
    s3: unknown = ''
): T {
    if (v === undefined || v === null) {
        let msgInThrowIfUndefined = 'not defined';
        if (s1 !== '') {
            msgInThrowIfUndefined += ', ' + s1;
        }

        if (s2 !== '') {
            msgInThrowIfUndefined += ', ' + s2;
        }

        if (s3 !== '') {
            msgInThrowIfUndefined += ', ' + s3;
        }

        throw makeUI512Error(msgInThrowIfUndefined);
    } else {
        return v;
    }
}

/**
 * if an error is thrown, show a warning message and swallow the error
 */
export function showWarningIfExceptionThrown(fn: () => void) {
    try {
        fn();
    } catch (e) {
        assertTrueWarn(false, e.toString(), 'Oz|');
    }
}

/**
 * store logs. user can choose "send err report" to send us error context.
 */
export class UI512ErrorHandling {
    static shouldRecordErrors = false;
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
        if (UI512ErrorHandling.shouldRecordErrors) {
            if (
                !UI512ErrorHandling.runningTests &&
                bool(window.localStorage) &&
                !s.includes(msgNotification)
            ) {
                let severity = showedDialog ? '1' : '2';
                let encoded = severity + UI512ErrorHandling.encodeErrMsg(s);
                UI512ErrorHandling.store.append(encoded);
            }
        }
    }

    static getLatestErrLogs(amount: number): string[] {
        return UI512ErrorHandling.store.retrieve(amount);
    }
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
 * combine strings, and move all 'markers' to the end
 */
export function joinIntoMessage(
    c0: string,
    prefix: string,
    s1?: unknown,
    s2?: unknown,
    s3?: unknown
) {
    let markers: string[] = [];
    c0 = findMarkers(c0, markers) ?? '';
    s1 = findMarkers(s1, markers);
    let message = prefix + ' ' + c0;
    message += s1 ? '\n' + s1 : '';
    message += s2 ? ', ' + s2 : '';
    message += s3 ? ', ' + s3 : '';
    if (markers.length) {
        message += ' (' + markers.join(',') + ')';
    }

    return message;
}

/**
 * an error that can be attached with markUI512Err
 */
export interface UI512AttachableErr {}

/**
 * record and show an unhandled exception
 */
function recordAndShowErr(firstMsg: string, msg: string) {
    if (UI512ErrorHandling.breakOnThrow || firstMsg.includes('assertion failed')) {
        UI512ErrorHandling.appendErrMsgToLogs(true, msg);
        console.error(msg);
        callDebuggerIfNotInProduction();
        window.alert(msg);
    } else {
        UI512ErrorHandling.appendErrMsgToLogs(false, msg);
    }
}

/**
 * we add two-digit markers to most asserts, so that if a bug report comes in,
 * we have more context about the site of failure.
 * assert markers are in the form xx|; this fn extracts them from a string.
 */
function findMarkers(s: unknown, markers: string[]): O<string> {
    if (s && typeof s === 'string' && s[2] === '|') {
        markers.push(s.slice(0, 2));
        return s.slice(3);
    } else if (!s) {
        return undefined;
    } else {
        return tostring(s);
    }
}

