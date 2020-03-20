
/* auto */ import { checkIsRelease, range, repeat } from './utils/bwtuiutils';
/* auto */ import { runAllTests } from './bwtests';

///<reference path="./bowser.d.ts"/>
declare const bowser: typeof Bowser;

import { toWords } from 'number-to-words';

function getTestString() {
    let s1 = repeat(4, 'a').join('_');
    let s2 = range(1, 5);
    let s3 = toWords(13);
    let s4 = checkIsRelease() ? 'release' : 'dev';
    return [s1, s2, s3, s4].join('<br/>');
}

export function setOutputToTestString() {
    let el = document.getElementById('output');
    if (el) {
        el.innerHTML = getTestString();
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
        elBtnGoAsync.addEventListener('click', onBtnGoAsync);
    }

    document.body.addEventListener('keydown', evt => {
        if (evt.code == 'KeyT' && evt.altKey) {
            runAllTests();
        }
    });

    doDetectBrowser();
}

runOnLoad();
