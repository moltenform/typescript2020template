
/* auto */ import { AsyncVoidFn } from './../util/util512Higher';
/* auto */ import { UI512ErrorHandling, assertTrue } from './../util/util512Assert';
/* auto */ import { Util512, ValHolder } from './../util/util512';
/* auto */ import { SimpleUtil512TestCollection, notifyUserIfDebuggerIsSetToAllExceptions } from './testUtils';
/* auto */ import { testCollectionUtil512Higher } from './testUtil512Higher';
/* auto */ import { testCollectionUtil512Class } from './testUtil512Class';
/* auto */ import { testCollectionUtil512Assert } from './testUtil512Assert';
/* auto */ import { testCollectionUtil512 } from './testUtil512';
/* auto */ import { testCollectionExternalLibs } from './testExternalLibs';

/**
 * a very simple testing framework.
 */
export class SimpleUtil512Tests {
    static async runTests(includeSlow: boolean) {
        if (UI512ErrorHandling.runningTests) {
            console.log('Apparently already running tests...');
            return;
        }

        UI512ErrorHandling.runningTests = true;
        console.log('Running tests...');

        /* order tests from high to low */
        let colls = [
            testCollectionExternalLibs,
            testCollectionExampleAsyncTests,
            testCollectionUtil512Assert,
            testCollectionUtil512,
            testCollectionUtil512Class,
            testCollectionUtil512LessUsefulLibs,
            testCollectionUtil512Higher
        ];

        /* run tests from low level to high level */
        colls.reverse();
        let colNamesSeen = new Map<string, boolean>();
        let mapSeen = new Map<string, boolean>();
        let countTotal = colls
            .filter(item => includeSlow || !item.slow)
            .map(item => item.tests.length)
            .reduce(Util512.add);
        countTotal += colls
            .filter(item => includeSlow || !item.slow)
            .map(item => item.atests.length)
            .reduce(Util512.add);
        let counter = new ValHolder(1);
        for (let coll of colls) {
            if (colNamesSeen.has(coll.name.toLowerCase())) {
                assertTrue(false, 'O.|duplicate collection name', coll.name);
            }

            colNamesSeen.set(coll.name.toLowerCase(), true);
            console.log(`Collection: ${coll.name}`);
            if (includeSlow || !coll.slow) {
                await SimpleUtil512Tests.runCollection(
                    coll,
                    countTotal,
                    counter,
                    mapSeen
                );
            } else {
                console.log('(Skipped)');
            }
        }

        UI512ErrorHandling.runningTests = false;
        if (UI512ErrorHandling.silenceWarnings) {
            console.log(`A test may have failed, warning occurred.`);
        } else {
            console.log(`All tests complete.`);
        }
    }

    /**
     * run a collection of tests
     */
    static async runCollection(
        coll: SimpleUtil512TestCollection,
        countTotal: number,
        counter: ValHolder<number>,
        mapSeen: Map<string, boolean>
    ) {
        notifyUserIfDebuggerIsSetToAllExceptions();
        assertWarn(
            coll.tests.length > 0 || coll.atests.length > 0,
            'O-|no tests in collection'
        );

        /* note that some tests require async tests to be done first. */
        let tests: [string, VoidFn | AsyncFn][] = coll.atests;
        tests = tests.concat(coll.tests);
        for (let i = 0; i < tests.length; i++) {
            let [tstname, tstfn] = tests[i];
            if (mapSeen.has(tstname.toLowerCase())) {
                assertWarn(false, 'Or|duplicate test name', tstname);
            }

            /* it's totally fine to await on a synchronous fn. */
            mapSeen.set(tstname.toLowerCase(), true);
            console.log(`Test ${counter.val}/${countTotal}: ${tstname}`);
            await tstfn();
            counter.val += 1;
        }
    }
}
