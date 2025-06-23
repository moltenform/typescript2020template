/* auto */ import { AsyncFn, VoidFn } from './../util/util512Higher';
/* auto */ import {
    UI512ErrorHandling,
    assertTrue,
    assertWarn
} from './../util/util512Assert';
/* auto */ import {  shouldBreakOnExceptions_Enable, Util512, ValHolder } from './../util/util512';
/* auto */ import {
    SimpleUtil512TestCollection,
    notifyUserIfDebuggerIsSetToAllExceptions,
    t
} from './testHelpers';
/* auto */ import  './testUtil512Higher';
/* auto */ import './testUtil512Class';
/* auto */ import './testUtil512Assert';
/* auto */ import './testUtil512';
import { Util512StaticClass } from '../util/util512Base';
import { testCollectionUtil512Base } from './testUtil512Base';
import _ from 'lodash'

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

/**
 * a very simple testing framework.
 */
export const SimpleUtil512Tests = new (class SimpleUtil512Tests extends Util512StaticClass {
     runTests = async(includeSlow=true)=>{
        if (UI512ErrorHandling.runningTests) {
            console.log('Apparently already running tests...');
            return;
        }

        shouldBreakOnExceptions_Enable()
        UI512ErrorHandling.runningTests = true;
        console.log('Running tests...');
        try {
            await this.runTestsImpl(includeSlow);
        } finally {
            UI512ErrorHandling.runningTests = false;
        }
    }

     runTestsImpl=async(includeSlow: boolean) =>{
        /* order tests from high to low */
        let colls: SimpleUtil512TestCollection[] = [
            //~ testCollectionUtil512Assert,
            //~ testCollectionUtil512Base,
            //~ testCollectionUtil512,
            //~ testCollectionUtil512Class,
            //~ testCollectionUtil512Higher
            t
        ];

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
        colls = fastTests.concat(slowTests);
        let testsIncluded = colls
            .filter(item => includeSlow || !item.slow)
        let countTotal = _.sum(
            testsIncluded.map(item => item.tests.length));
        let counter = new ValHolder(1);
        for (let coll of colls) {
            if (colNamesSeen.has(coll.name.toLowerCase())) {
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

        if (UI512ErrorHandling.silenceWarnings) {
            console.log(`A test may have failed, warning occurred.`);
        } else {
            console.log(`All tests complete.`);
        }
    }

    /**
     * run a collection of tests
     */
    runCollection = async(
        coll: SimpleUtil512TestCollection,
        countTotal: number,
        counter: ValHolder<number>,
        mapSeen: Map<string, boolean>
    ) => {
        notifyUserIfDebuggerIsSetToAllExceptions();
        assertWarn(
            coll.tests.length > 0,
            'no tests in collection'
        );

        /* note that some tests require async tests to be done first. */
        let tests: [string, VoidFn | AsyncFn, string][] = _.clone(coll.tests);
        for (let i = 0; i < tests.length; i++) {
            let [tstname, fnTest, label] = tests[i];
            if (mapSeen.has(tstname.toLowerCase())) {
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
