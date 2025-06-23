
import { RespondToErr, Util512Higher } from './../util/util512Higher';
import { checkIsProductionBuild, Util512StaticClass } from './../util/util512Base';
import { SimpleUtil512Tests } from './../test/testTop';
import { onDemoSave, testExternalModules } from './test-external-modules';
import { shouldBreakOnExceptions_Enable } from '../util/util512';

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
    const mapping = {
        idBtnSimpleTest: onSimpleTest,
        idBtnDemoModules: onDemoModules,
        idBtnDemoSave: onDemoSave,
        idBtnRunUtil512Tests: SimpleUtil512Tests.runTests
    };

    for (let k in mapping) {
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

runOnLoad();
