
import { sum as lodashSum } from 'lodash';
import Base64js from 'base64-js';
import { assertEq, getEnumToStrOrFallback, Util512 } from '../util/util512';
import FileSaver from 'file-saver';
import { BrowserOSInfo, guessBrowserInfo, guessOs } from '../external/bowser';
import produce from 'immer';
import lzstring from 'lz-string';

// can also use import _ from 'lodash';

export async function testExternalModules() {
    let results: string[] = [];

    // my own utils
    const theKeys = Util512.getMapKeys({ a: 1 });
    assertEq('a', theKeys[0], 'test Util512.getMapKeys');
    results.push('Util512 works');

    // browser detection
    const isMobile = await guessBrowserInfo('isMobile');
    const isChrome = await guessBrowserInfo('isChrome');
    const os = guessOs();
    results.push(`isMobile=${isMobile}`);
    results.push(`isChrome=${isChrome}`);

    results.push(`os=${getEnumToStrOrFallback(BrowserOSInfo, os)}`);

    // base64-js
    const arr = Base64js.toByteArray('abcd');
    assertEq(105, arr[0], 'test base64-js');
    results.push('base64-js works');

    // es6-error
    // see assert tests
    // file-saver
    // see file save button
    // js-lru
    // see util tests

    // immer
    immerExample();
    results.push('immer works');

    // lodash
    const sum = lodashSum([1, 2, 3]);
    assertEq(6, sum, 'test lodash');
    results.push('lodash works');

    // lz-string
    const compressed = lzstring.compressToUTF16('abc');
    results.push(`lz-string got ${compressed.charCodeAt(0)}`);

    // serializer

    // whatwg-fetch
    // not yet tested here

    return results.join('\n');
}

function immerExample() {
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
}

export function onDemoSave() {
    var text = new Blob(['hello world!'], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(text, 'hello world.txt');
}
