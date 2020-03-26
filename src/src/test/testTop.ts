
/* auto */ import { SimpleSensibleTestCategory, notifyUserIfDebuggerIsSetToAllExceptions, } from './testUtils';
/* auto */ import { testExternalLibs } from './testExternalLibs';
/* auto */ import { testBenBaseUtilsHigher, testExampleAsyncTests, } from './testBenBaseUtilsHigher';
/* auto */ import { testsBenBaseUtilsClass } from './testBenBaseUtilsClass';
/* auto */ import { testsBenBaseUtilsAssert } from './testBenBaseUtilsAssert';
/* auto */ import { testsBenBaseUtils } from './testBenBaseUtils';
/* auto */ import { UI512ErrorHandling, assertTrue, scontains, } from './../util/benBaseUtilsAssert';
/* auto */ import { Util512, ValHolder } from './../util/benBaseUtils';

export class SimpleSensibleTests {
    static async runTests(includeSlow: boolean) {
        console.log('Running tests...');
        UI512ErrorHandling.runningTests = true;
        let categories = [
            testExternalLibs,
            testExampleAsyncTests,
            testsBenBaseUtilsAssert,
            testsBenBaseUtils,
            testsBenBaseUtilsClass,
            testBenBaseUtilsHigher,
        ];

        let mapSeen = new Map<string, boolean>();
        let countTotal = categories.map(item => item.tests.length).reduce(Util512.add);
        let counter = new ValHolder(1);
        for (let category of categories) {
            console.log(`Category: ${category.name}`);
            if (includeSlow || !scontains(category.type, 'slow')) {
                await SimpleSensibleTests.runCategory(
                    category,
                    countTotal,
                    counter,
                    mapSeen,
                );
            }
        }

        UI512ErrorHandling.runningTests = false;
        console.log(`All tests complete.`);
    }

    static async runCategory(
        category: SimpleSensibleTestCategory,
        countTotal: number,
        counter: ValHolder<number>,
        mapSeen: Map<string, boolean>,
    ) {
        notifyUserIfDebuggerIsSetToAllExceptions();
        for (let i = 0; i < category.tests.length; i++) {
            let [tstname, tstfn] = category.tests[i];
            if (mapSeen.has(tstname.toLowerCase())) {
                assertTrue(false, 'duplicate test name', tstname);
            }

            mapSeen.set(tstname, true);
            console.log(`Test ${counter.val}/${countTotal}: ${tstname}`);
            counter.val += 1;
            if (scontains(category.type, 'async')) {
                await tstfn();
            } else {
                tstfn();
            }
        }
    }
}
