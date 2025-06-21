/* auto */ import { AsyncFn, VoidFn } from './../util/util512Higher';
/* auto */ import {
    UI512ErrorHandling,
    assertTrue,
    assertWarn
} from './../util/util512Assert';
/* auto */ import { MapKeyToObjectCanSet, Util512, ValHolder } from './../util/util512';
/* auto */ import {
    SimpleUtil512TestCollection,
    notifyUserIfDebuggerIsSetToAllExceptions
} from './testUtils';
/* auto */ import { testCollectionUtil512Higher } from './testUtil512Higher';
/* auto */ import { testCollectionUtil512Class } from './testUtil512Class';
/* auto */ import { testCollectionUtil512Assert } from './testUtil512Assert';
/* auto */ import { testCollectionUtil512 } from './testUtil512';
/* auto */ import { testCollectionExternalLibs } from './testExternalLibs';
import { Util512StaticClass } from '../util/util512Base';
import { testCollectionUtil512Base } from './testUtil512Base';
import _ from 'lodash'

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

/**
 * a very simple testing framework.
 */
export const SimpleUtil512Tests = new (class SimpleUtil512Tests extends Util512StaticClass {
    async runTests(includeSlow: boolean) {
        if (UI512ErrorHandling.runningTests) {
            console.log('Apparently already running tests...');
            return;
        }

        UI512ErrorHandling.runningTests = true;
        console.log('Running tests...');

        /* order tests from high to low */
        let colls: SimpleUtil512TestCollection[] = [
            testCollectionExternalLibs,
            testCollectionUtil512Assert,
            testCollectionUtil512Base,
            testCollectionUtil512,
            testCollectionUtil512Class,
            testCollectionUtil512Higher
        ];

        if (!colls || !colls.length) {
            console.log('no tests have been included.');
            return;
        }

        /* run tests from low level to high level */
        colls.reverse();
        let colNamesSeen = new MapKeyToObjectCanSet<boolean>();
        let mapSeen = new MapKeyToObjectCanSet<boolean>();

        /* put slow tests after fast tests */
        let slowTests = colls.filter(item => item.slow);
        let fastTests = colls.filter(item => !item.slow);
        colls = fastTests.concat(slowTests);
        let testsIncluded = colls
            .filter(item => includeSlow || !item.slow)
        let countTotal = _.sum(
            testsIncluded.map(item => item.tests.length + item.atests.length));
        let counter = new ValHolder(1);
        for (let coll of colls) {
            if (colNamesSeen.exists(coll.name.toLowerCase())) {
                assertTrue(false, 'duplicate collection name', coll.name);
            }

            colNamesSeen.set(coll.name.toLowerCase(), true);
            console.log(`Collection: ${coll.name}`);
            if (includeSlow || !coll.slow) {
                await this.runCollection(coll, countTotal, counter, mapSeen);
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
    async runCollection(
        coll: SimpleUtil512TestCollection,
        countTotal: number,
        counter: ValHolder<number>,
        mapSeen: MapKeyToObjectCanSet<boolean>
    ) {
        notifyUserIfDebuggerIsSetToAllExceptions();
        assertWarn(
            coll.tests.length > 0 || coll.atests.length > 0,
            'no tests in collection'
        );

        /* note that some tests require async tests to be done first. */
        let tests: [string, VoidFn | AsyncFn][] = coll.atests;
        tests = tests.concat(coll.tests);
        for (let i = 0; i < tests.length; i++) {
            let [tstname, fnTest] = tests[i];
            if (mapSeen.exists(tstname.toLowerCase())) {
                assertWarn(false, 'duplicate test name', tstname);
            }

            /* it's totally fine to await on a synchronous fn. */
            mapSeen.set(tstname.toLowerCase(), true);
            console.log(`Test ${counter.val}/${countTotal}: ${tstname}`);
            await fnTest();
            counter.val += 1;
        }
    }
})();
