
/* auto */ import { AsyncFn, VoidFn } from '../util/util512Higher';
/* auto */ import { O } from '../util/util512Base';
/* auto */ import { UI512ErrorHandling, assertTrue, ensureIsError } from '../util/util512Assert';
/* auto */ import { shouldBreakOnExceptions_Disable, shouldBreakOnExceptions_Enable, sortConsistentType, Util512, } from '../util/util512';
import _ from 'lodash';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

/**
 * assert that an exception is thrown, with a certain message
 */
export async function assertThrowsAsync<T>(
    expectedErrAndContext: string,
    fn: () => Promise<T>
) {
    let msg: O<string>;
    shouldBreakOnExceptions_Disable();
    UI512ErrorHandling.silenceAssertMsgs = true;
    try {
        await fn();
    } catch (e) {
        ensureIsError(e);
        msg = e.message ? e.message : '';
    } finally {
        shouldBreakOnExceptions_Enable();
        UI512ErrorHandling.silenceAssertMsgs = false;
    }

    let expectedErr = expectedErrAndContext.split('|')[0];
    let context = expectedErrAndContext.split('|')[1] ?? '';
    assertTrue(msg !== undefined, `did not throw ${context}`);
    assertTrue(
        msg !== undefined && msg.includes(expectedErr),
        `message "${msg}" did not contain "${expectedErr}" ${context}`
    );
}

/**
 * assert that an exception is thrown, with a certain message
 */
export function assertThrows(expectedErrAndContext: string, fn: VoidFn) {
    let errStored: any
    let msg: O<string>;
    shouldBreakOnExceptions_Disable();
    UI512ErrorHandling.silenceAssertMsgs = true;

    try {
        fn();
    } catch (e) {
        errStored = e
        ensureIsError(e);
        msg = e.message ?? '';
    } finally {
        shouldBreakOnExceptions_Enable();
        UI512ErrorHandling.silenceAssertMsgs = false;
    }

    let expectedErr = expectedErrAndContext.split('|')[0];
    let context = expectedErrAndContext.split('|')[1] ?? '';
    assertTrue(msg !== undefined, `did not throw`, context);
    assertTrue(
        msg !== undefined && msg.includes(expectedErr),
        `message "${msg}" did not contain "${expectedErr}"`,
        context
    );
    return errStored
}

/**
 * assert that an assertion is thrown
 */
export function assertAsserts(expectedErrAndContext: string, fn: VoidFn) {
    let msg: O<string>;
    let saved = UI512ErrorHandling.silenceAssertMsgs;
    UI512ErrorHandling.silenceAssertMsgs = true;
    try {
        fn();
    } catch (e) {
        ensureIsError(e);
        msg = e.message ?? '';
    } finally {
        UI512ErrorHandling.silenceAssertMsgs = saved;
    }

    let expectedErr = expectedErrAndContext.split('|')[0];
    let context = expectedErrAndContext.split('|')[1] ?? '';
    assertTrue(msg !== undefined, `did not throw`, context);
    assertTrue(
        msg.toLowerCase().includes('assert:'),
        `not an assertion exception`,
        context
    );
    assertTrue(
        msg !== undefined && msg.includes(expectedErr),
        `message "${msg}" did not contain "${expectedErr}"`,
        context
    );
}

/**
 * test-only code, since this is inefficient
 */
export function sorted<T>(ar: T[]) {
    let arCopy = _.clone(ar);
    arCopy = _.sortBy(arCopy);
    return arCopy;
}

/**
 * test-only code, to avoid type casts
 */
export function YetToBeDefinedTestHelper<T>(): T {
    return undefined as any as T;
}

/**
 * if the debugger is set to All Exceptions,
 * you will see a lot of false positives
 */
export function notifyUserIfDebuggerIsSetToAllExceptions() {
    assertThrows('intentionally throw', () => {
        throw new Error(
            `It looks like the debugger is set to break
            on 'All Exceptions'... you probably want to turn this off because
            many tests intentionally throw exceptions.`
        );
    });
}

/**
 * a collection of tests
 */
export class SimpleUtil512TestCollection {
    constructor(public name: string, public slow = false) {}
    tests: [string, VoidFn][] = [];
    atests: [string, AsyncFn][] = [];
    _context = '';

    /**
     * add a non-async test to the collection
     */
    public test(s: string, fn: VoidFn) {
        this.tests.push([s, fn]);
        return this;
    }

    /**
     * add an async test to the collection
     */
    public atest(s: string, fn: AsyncFn) {
        this.atests.push([s, fn]);
        return this;
    }

    /**
     * writes a string to the console,
     * often used to indicate that a test is divided into subtests.
     */
    public say(context: string) {
        this._context = context;
        console.log(Util512.repeat(25, ' ').join('') + this._context);
    }
}
