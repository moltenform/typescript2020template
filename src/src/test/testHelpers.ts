
import { type AsyncFn, type VoidFn } from '../util/util512Higher';
import { type O } from '../util/util512Base';
import { UI512ErrorHandling, assertTrue, ensureIsError } from '../util/util512Assert';
import { shouldBreakOnExceptions_Disable, shouldBreakOnExceptions_Enable } from '../util/util512';
import { sortBy as ldSortBy, clone as ldClone } from 'lodash';

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
    let errStored: any;
    let msg: O<string>;
    shouldBreakOnExceptions_Disable();
    UI512ErrorHandling.silenceAssertMsgs = true;

    try {
        fn();
    } catch (e) {
        errStored = e;
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
    return errStored;
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
    let arCopy = ldClone(ar);
    arCopy = ldSortBy(arCopy);
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
    currentLabel = '';
    tests: Record<string, [string, VoidFn | AsyncFn][]> = {};
    _context = '';

    /**
     * label a group of tests
     */
    public setCurrentLabel(s: string) {
        this.currentLabel = s;
    }

    /**
     * add a non-async test to the collection
     */
    public test(s: string, fn: VoidFn | AsyncFn) {
        if (!this.tests[this.currentLabel]) {
            this.tests[this.currentLabel] = [];
        }

        this.tests[this.currentLabel].push([s, fn]);
        return this;
    }

    /**
     * do nothing with this test
     */
    public testSkip(_s: string, _fn: VoidFn) {
        return this;
    }
}

/**
 * example: import { tSkipped as t } from './testHelpers'
 */
export const t = new SimpleUtil512TestCollection('main');
export const tSlow = new SimpleUtil512TestCollection('mainSlow', true);
export const tSkipped = new SimpleUtil512TestCollection('mainSkipped');
