
/* auto */ import { sleep } from './../util/util512Higher';
/* auto */ import { checkIsProductionBuild } from './../util/util512Base';
/* auto */ import { Util512 } from './../util/util512';
/* auto */ import { SimpleUtil512Tests } from './../test/testTop';

import { toWords } from 'number-to-words';
import type { Bowser } from '../../external/bowser/bowser';
declare const bowser: typeof Bowser;

function getTestString() {
    let s1 = Util512.repeat(4, 'a').join('_');
    let s2 = Util512.range(1, 5);
    let s3 = toWords(13);
    let s4 = checkIsProductionBuild() ? 'release' : 'debug';
    return [s1, s2, s3, s4].join('<br/>');
}

export function setOutputToTestString() {
    let el = document.getElementById('output');
    if (el) {
        el.innerHTML = getTestString();
    }
}

async function onBtnGoAsync() {
    let el = document.getElementById('output');
    if (el) {
        el.innerHTML += '1... ';
        await sleep(1000);
        el.innerHTML += '2... ';
        await sleep(1000);
        el.innerHTML += '3';
    }
}

function doDetectBrowser() {
    let o = bowser.parse(window.navigator.userAgent);
    let s = '';
    s += `<br/>name: ${o.browser.name}`;
    s += `<br/>v: ${o.browser.version}`;
    s += `<br/>platform: ${o.platform.type}`;
    let el = document.getElementById('detectedBrowser');
    if (el) {
        el.innerHTML = s;
    }
}

export function runOnLoad() {
    let elBtn = document.getElementById('idBtnGo');
    if (elBtn) {
        elBtn.addEventListener('click', setOutputToTestString);
    }

    let elBtnGoAsync = document.getElementById('idBtnGoAsync');
    if (elBtnGoAsync) {
        elBtnGoAsync.addEventListener('click', () => {
            onBtnGoAsync().then(
                () => {},
                () => {}
            );
        });
    }

    document.body.addEventListener('keydown', evt => {
        if (evt.code === 'KeyT' && evt.altKey) {
            SimpleUtil512Tests.runTests(true).then(
                () => {},
                () => {}
            );
        }
    });

    doDetectBrowser();
}

runOnLoad();
