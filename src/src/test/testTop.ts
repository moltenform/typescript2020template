
import * as testBenBaseUtilsClass from './testBenBaseUtilsClass';
import * as testBenBaseUtilsAssert from './testBenBaseUtilsAssert';
import { Util512, ValHolder } from '../util/benBaseUtils';
;import { SimpleSensibleTestCategory } from './testUtils';

export class SimpleSensibleTests {
    static async runTests(includeSlow:boolean) {
        console.log('Running tests...');
        let categories = [
            testBenBaseUtilsClass.tests,
            testBenBaseUtilsAssert.tests
        ]

        let countTotal = categories.map(item => item.tests.length).reduce(Util512.add);
        let counter = new ValHolder(1)
        for (let category of categories) {
            console.log(`Category: ${category.name}`);
            if (includeSlow || category.type !== 'slow') {
                await SimpleSensibleTests.runCategory(category, countTotal, counter);
            }
        }

        console.log(`All tests complete.`);
    }

    static async runCategory(category: SimpleSensibleTestCategory, countTotal: number, counter:ValHolder<number>) {
        for (let i = 0; i < category.tests.length; i++) {
            let [tstname, tstfn] = category.tests[i];
            console.log(`Test ${counter.val}/${countTotal}: ${tstname}`);
            counter.val += 1
            if (category.type === 'async' || category.type === 'slow') {
                await tstfn();
            } else {
                tstfn();
            }
        }
    }
}
