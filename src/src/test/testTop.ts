
/* auto */ import { type AsyncFn, type VoidFn } from './../util/util512Higher';
/* auto */ import { Util512StaticClass } from './../util/util512Base';
/* auto */ import { UI512ErrorHandling, assertTrue, assertWarn } from './../util/util512Assert';
/* auto */ import { Util512, ValHolder, shouldBreakOnExceptions_Enable } from './../util/util512';
/* auto */ import { type SimpleUtil512TestCollection, notifyUserIfDebuggerIsSetToAllExceptions, t, tSlow } from './testHelpers';

import { sortBy as ldSortBy, sum as ldSum } from 'lodash';
import './testUtil512Higher';
import './testUtil512Class';
import './testUtil512Assert';
import './testUtil512Base';
import './testUtil512';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

/**
 * a very simple testing framework.
 */
export const SimpleUtil512Tests =
    new (class SimpleUtil512Tests extends Util512StaticClass {
        runTests = async (includeSlow = true) => {
            if (UI512ErrorHandling.runningTests) {
                console.log('Apparently already running tests...');
                return;
            }

            shouldBreakOnExceptions_Enable();
            UI512ErrorHandling.runningTests = true;
            console.log('Running tests...');
            try {
                await this.runTestsImpl(includeSlow);
            } finally {
                UI512ErrorHandling.runningTests = false;
            }
        };

        runTestsImpl = async (includeSlow: boolean) => {
            /* order tests from high to low */
            let colls: SimpleUtil512TestCollection[] = [t, tSlow];

            if (!colls || !colls.length) {
                console.log('no tests have been included.');
                return;
            }

            /* run tests from low level to high level */
            colls.reverse();
            let colNamesSeen = new Map<string, boolean>();
            let mapSeen = new Map<string, boolean>();

            /* put slow tests after fast tests */
            let slowTests = colls.filter(item => item.slow);
            let fastTests = colls.filter(item => !item.slow);
            if (includeSlow) {
                colls = fastTests.concat(slowTests);
            } else {
                colls = fastTests;
            }

            let countTotal = ldSum(
                colls.map(item =>
                    ldSum(Util512.getMapVals(item.tests).map(subTest => subTest.length))
                )
            );

            let counter = new ValHolder(1);
            for (let coll of colls) {
                if (colNamesSeen.has(coll.name.toLowerCase())) {
                    assertTrue(false, 'duplicate collection name', coll.name);
                }

                colNamesSeen.set(coll.name.toLowerCase(), true);
                console.log(`=== Collection: ${coll.name} ===`);
                if (includeSlow || !coll.slow) {
                    await this.runCollection(coll, countTotal, counter, mapSeen);
                } else {
                    console.log('(Skipped)');
                }
            }

            if (UI512ErrorHandling.silenceWarnings) {
                console.log(`A test may have failed, warning occurred.`);
            } else {
                console.log(`All tests complete.`);
            }
        };

        /**
         * run a collection of tests
         */
        runCollection = async (
            coll: SimpleUtil512TestCollection,
            countTotal: number,
            counter: ValHolder<number>,
            mapSeen: Map<string, boolean>
        ) => {
            notifyUserIfDebuggerIsSetToAllExceptions();

            /* if it says runFirst, run it first. */
            for (let k of Util512.getMapKeys(coll.tests)) {
                coll.tests[k] = ldSortBy(coll.tests[k], tt =>
                    tt[0].startsWith('-init-') ? 0 : 1
                );
                console.log(`=== Group: ${k} ===`);
                const tests: [string, VoidFn | AsyncFn][] = coll.tests[k];

                for (let test of tests) {
                    let [tstname, fnTest] = test;
                    if (mapSeen.has(tstname.toLowerCase())) {
                        assertWarn(false, 'duplicate test name', tstname);
                    }

                    /* fine to use await for both sync and async, since it's a no-op on sync fns. */
                    mapSeen.set(tstname.toLowerCase(), true);
                    console.log(`Test ${counter.val}/${countTotal}: ${tstname}`);
                    await fnTest();
                    counter.val += 1;
                }
            }
        };
    })();
