
/* auto */ import { UI512ErrorHandling, assertTrue } from './../util/util512Assert';
/* auto */ import { Util512, ValHolder } from './../util/util512';
/* auto */ import { AVoidFn, SimpleUtil512TestCollection, notifyUserIfDebuggerIsSetToAllExceptions, } from './testUtils';
/* auto */ import { testCollectionExampleAsyncTests, testCollectionUtil512Higher, } from './testUtil512Higher';
/* auto */ import { testCollectionUtil512Class } from './testUtil512Class';
/* auto */ import { testCollectionUtil512Assert } from './testUtil512Assert';
/* auto */ import { testCollectionUtil512 } from './testUtil512';
/* auto */ import { testCollectionExternalLibs, testCollectionUtil512LessUsefulLibs, } from './testExternalLibs';

export class SimpleUtil512Tests {
    static async runTests(includeSlow: boolean) {
        console.log('Running tests...');
        UI512ErrorHandling.runningTests = true;
        let colls = [
            testCollectionExternalLibs,
            testCollectionExampleAsyncTests,
            testCollectionUtil512Assert,
            testCollectionUtil512,
            testCollectionUtil512Class,
            testCollectionUtil512LessUsefulLibs,
            testCollectionUtil512Higher,
        ];

        let mapSeen = new Map<string, boolean>();
        let countTotal = colls.map(item => item.tests.length).reduce(Util512.add);
        countTotal += colls.map(item => item.atests.length).reduce(Util512.add);
        let counter = new ValHolder(1);
        for (let coll of colls) {
            console.log(`Collection: ${coll.name}`);
            if (includeSlow || !coll.slow) {
                await SimpleUtil512Tests.runCollection(
                    coll,
                    countTotal,
                    counter,
                    mapSeen,
                );
            }
        }

        UI512ErrorHandling.runningTests = false;
        console.log(`All tests complete.`);
    }

    static async runCollection(
        coll: SimpleUtil512TestCollection,
        countTotal: number,
        counter: ValHolder<number>,
        mapSeen: Map<string, boolean>,
    ) {
        notifyUserIfDebuggerIsSetToAllExceptions();
        let tests = coll.async ? coll.atests : coll.tests;
        assertTrue(tests.length > 0, 'no tests in collection');
        for (let i = 0; i < tests.length; i++) {
            let [tstname, tstfn] = tests[i];
            if (mapSeen.has(tstname.toLowerCase())) {
                assertTrue(false, 'Or|duplicate test name', tstname);
            }

            mapSeen.set(tstname, true);
            console.log(`Test ${counter.val}/${countTotal}: ${tstname}`);
            counter.val += 1;
            if (coll.async) {
                await (tstfn as AVoidFn)();
            } else {
                tstfn();
            }
        }
    }
}
