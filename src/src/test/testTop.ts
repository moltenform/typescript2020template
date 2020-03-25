
/* auto */ import { SimpleSensibleTestCategory, notifyUserIfDebuggerIsSetToAllExceptions } from './testUtils';
/* auto */ import { testsBenBaseUtilsClass } from './testBenBaseUtilsClass';
/* auto */ import { testsBenBaseUtilsAssert } from './testBenBaseUtilsAssert';
/* auto */ import { testsBenBaseUtils } from './testBenBaseUtils';
/* auto */ import { scontains } from './../util/benBaseUtilsAssert';
/* auto */ import { Util512, ValHolder } from './../util/benBaseUtils';

export class SimpleSensibleTests {
    static async runTests(includeSlow: boolean) {
        console.log('Running tests...');
        let categories = [testsBenBaseUtilsClass, testsBenBaseUtils, testsBenBaseUtilsAssert];

        let countTotal = categories.map(item => item.tests.length).reduce(Util512.add);
        let counter = new ValHolder(1);
        for (let category of categories) {
            console.log(`Category: ${category.name}`);
            if (includeSlow || !scontains(category.type, 'slow')) {
                await SimpleSensibleTests.runCategory(category, countTotal, counter);
            }
        }

        console.log(`All tests complete.`);
    }

    static async runCategory(category: SimpleSensibleTestCategory, countTotal: number, counter: ValHolder<number>) {
        notifyUserIfDebuggerIsSetToAllExceptions();
        for (let i = 0; i < category.tests.length; i++) {
            let [tstname, tstfn] = category.tests[i];
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
