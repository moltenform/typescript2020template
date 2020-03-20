

/**
 * assert that an exception is thrown, with a certain message
 */
export async function assertThrowsAsync<T>(tagMsg: string, expectedErr: string, fn: () => Promise<T>) {
    let msg: O<string>;
    let storedBreakOnThrow = UI512ErrorHandling.breakOnThrow
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
        `JB|message "${msg}" did not contain "${expectedErr}" ${tagMsg}`
    );
}

/**
 * assert that an exception is thrown, with a certain message
 */
export function assertThrows(tagMsg: string, expectedErr: string, fn: Function) {
    let msg: O<string>;
    let storedBreakOnThrow = UI512ErrorHandling.breakOnThrow
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
        `9d|message "${msg}" did not contain "${expectedErr}" ${tagMsg}`
    );
}

/**
 * if the debugger is set to All Exceptions,
 * you will see a lot of false positives
 */
export function notifyUserIfDebuggerIsSetToAllExceptions() {
    assertThrows('L||', 'intentionally throw', () => {
        throw makeVpcScriptErr(`1!|It looks like the debugger is set to break on 'All Exceptions'...
            you probably want to turn this off because many tests intentionally throw exceptions.`);
    });
}

//~ class TestCategory {
    //~ constructor(public name:string) {}
    //~ tests:[string, Function][] = []
    //~ static categories:TestCategory[] = []
    //~ static runAllSynchronousTests() {
        //~ console.log("Running tests...");
        //~ let allTests:[string, Function][] = []
        //~ let countTotal = categories.map(item => item.tests.length).reduce(Utils.add)
        //~ for (let category of categories) {
            //~ console.log(`Category: ${category.name}`);
            //~ for (let i=0; i<category.tests.length; i++) {
                //~ let [tstname, tstfn] = category.tests[i]
                //~ console.log(`Test ${i+1}/{category.tests.length}`);
                
            //~ }
        //~ }
    //~ }
//~ }

//~ export function beginTestCategory(name:string) {
    //~ TestCategory.categories.push(new TestCategory(name))
//~ }

//~ export function registerTest(testName, fn) {
    //~ let currentCategory = last(TestCategory.categories)
    //~ currentCategory.tests.push([testName, fn])
//~ }


