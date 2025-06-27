
/* auto */ import { assertTrue } from './../util/util512Assert';
/* auto */ import { Util512, assertEq } from './../util/util512';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

import { sum as lodashSum } from 'lodash';
import Base64js from 'base64-js';
import FileSaver from 'file-saver';
import produce from 'immer';
import lzstring from 'lz-string';
import { LRUMap } from 'lru_map';

export async function testExternalModules() {
    let results: string[] = [];

    testUtil512(results);
    testBase64Js(results);

    // es6-error: see assert tests
    // file-saver: see file save button
    // js-lru: see util tests
    // serializer: moved to other project

    testImmer(results);
    testLodash(results);
    testLzString(results);
    testJsLru(results);
    return results.join('\n');
}

function testLzString(results: string[]) {
    const compressed = lzstring.compressToUTF16('abc');
    const decompressed = lzstring.decompressFromUTF16(compressed);
    assertEq('abc', decompressed, 'test lz-string');
    results.push(`lz-string works`);
}

function testLodash(results: string[]) {
    const sum = lodashSum([1, 2, 3]);
    assertEq(6, sum, 'test lodash');
    results.push('lodash works');
}

function testBase64Js(results: string[]) {
    const arr = Base64js.toByteArray('abcd');
    assertEq(105, arr[0], 'test base64-js');
    results.push('base64-js works');
}

function testUtil512(results: string[]) {
    const theKeys = Util512.getMapKeys({ a: 1 });
    assertEq('a', theKeys[0], 'test Util512.getMapKeys');
    results.push('Util512 works');
}

function testImmer(results: string[]) {
    const baseState = [
        {
            title: 'Learn TypeScript',
            done: true
        },
        {
            title: 'Try Immer',
            done: false
        }
    ];

    const nextState = produce(baseState, draft => {
        draft[1].done = true;
        draft.push({ title: 'Tweet about it', done: false });
    });

    assertEq(true, nextState[1].done, 'test immer 1');
    assertEq(3, nextState.length, 'test immer 2');
    results.push('immer works');
}

function testJsLru(results: string[]) {
    let testmap = new LRUMap<string, number>(3);
    testmap.set('a', 1);
    testmap.set('b', 2);
    testmap.set('c', 3);
    assertTrue(testmap.has('a'));
    assertTrue(testmap.has('b'));
    assertTrue(testmap.has('c'));
    testmap.set('d', 4);
    assertTrue(testmap.has('b'));
    assertTrue(testmap.has('c'));
    assertTrue(testmap.has('d'));
    assertTrue(!testmap.has('a'));
    results.push('JsLru works');
}

export async function onDemoSave() {
    let text = new Blob(['hello world!'], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(text, 'hello world.txt');
}
