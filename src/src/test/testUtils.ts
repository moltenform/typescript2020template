
/* auto */ import { O, UI512ErrorHandling, assertTrue, makeUI512Error, scontains } from './../util/benBaseUtilsAssert';

/**
 * assert that an exception is thrown, with a certain message
 */
export async function assertThrowsAsync<T>(tagMsg: string, expectedErr: string, fn: () => Promise<T>) {
    let msg: O<string>;
    let storedBreakOnThrow = UI512ErrorHandling.breakOnThrow;
    UI512ErrorHandling.breakOnThrow = false;
    try {
        await fn();
    } catch (e) {
        msg = e.message ? e.message : '';
    } finally {
        UI512ErrorHandling.breakOnThrow = storedBreakOnThrow;
    }

    assertTrue(msg !== undefined, `JC|did not throw ${tagMsg}`);
    assertTrue(
        msg !== undefined && scontains(msg, expectedErr),
        `JB|message "${msg}" did not contain "${expectedErr}" ${tagMsg}`,
    );
}

/**
 * assert that an exception is thrown, with a certain message
 */
export function assertThrows(tagMsg: string, expectedErr: string, fn: Function) {
    let msg: O<string>;
    let storedBreakOnThrow = UI512ErrorHandling.breakOnThrow;
    try {
        UI512ErrorHandling.breakOnThrow = false;
        fn();
    } catch (e) {
        msg = e.message ? e.message : '';
    } finally {
        UI512ErrorHandling.breakOnThrow = storedBreakOnThrow;
    }

    assertTrue(msg !== undefined, `3{|did not throw ${tagMsg}`);
    assertTrue(
        msg !== undefined && scontains(msg, expectedErr),
        `9d|message "${msg}" did not contain "${expectedErr}" ${tagMsg}`,
    );
}

/**
 * if the debugger is set to All Exceptions,
 * you will see a lot of false positives
 */
export function notifyUserIfDebuggerIsSetToAllExceptions() {
    assertThrows('L||', 'intentionally throw', () => {
        throw makeUI512Error(`1!|It looks like the debugger is set to break on 'All Exceptions'...
            you probably want to turn this off because many tests intentionally throw exceptions.`);
    });
}

export class SimpleSensibleTestCategory {
    constructor(public name: string, public type:""|"async"|"slow" = "") {}
    tests: [string, Function][] = [];
    _context = ''
    public test(s:string, fn:Function) {
        this.tests.push([s, fn])
        return this
    }
    public register(list:[string, Function][]) {
        this.tests = this.tests.concat(list)
    }
    public say(context: string) {
        this._context = context.replace(/\//g, '')
        console.log("                      " + this._context);
    }
}
