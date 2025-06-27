
/* auto */ import { type AsyncFn, RespondToErr, Util512Higher } from './../util/util512Higher';
/* auto */ import { Util512StaticClass, checkIsProductionBuild } from './../util/util512Base';
/* auto */ import { assertTrue, assertWarn } from './../util/util512Assert';
/* auto */ import { Util512, assertWarnEq, shouldBreakOnExceptions_Enable } from './../util/util512';
/* auto */ import { SimpleUtil512Tests } from './../test/testTop';
/* auto */ import { onDemoSave, testExternalModules } from './test-external-modules';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

function setOutput(s: string) {
    let el = document.getElementById('output');
    if (el) {
        el.innerText = s;
    }
}

async function onSimpleTest() {
    let s = 'Currently running as:';
    s += checkIsProductionBuild() ? 'release' : 'debug';
    setOutput(s);
    await Util512Higher.sleep(1000);
    setOutput('1... ');
    await Util512Higher.sleep(1000);
    setOutput('2... ');
    await Util512Higher.sleep(1000);
    setOutput('3');
}

async function onDemoModules() {
    const s = await testExternalModules();
    setOutput(s);
}

export function runOnLoad() {
    shouldBreakOnExceptions_Enable();
    Util512StaticClass.callAfterAppLoad();
    const mapping: Record<string, AsyncFn> = {
        idBtnSimpleTest: onSimpleTest,
        idBtnDemoModules: onDemoModules,
        idBtnDemoSave: onDemoSave,
        idBtnTestAsserts: onTestAsserts,
        idBtnRunUtil512Tests: SimpleUtil512Tests.runTests
    };

    for (let k of Util512.getMapKeys(mapping)) {
        let btn = document.getElementById(k);
        if (btn) {
            btn.addEventListener('click', () => {
                Util512Higher.syncToAsyncTransition(
                    mapping[k](),
                    'handler for ' + k,
                    RespondToErr.Alert
                );
            });
        }
    }
}

async function onTestAsserts() {
    alert("You will see 3 'warning' or 'error' dialogs, this is intentional");
    assertWarn(false, 'You should be able to continue from this warning');
    assertWarnEq(1, 2, 'You should be able to continue from this warning');
    try {
        assertTrue(false, 'An example assertion message.');
    } catch(e) {
        // nothing needs to be done.
    }
}

runOnLoad();
