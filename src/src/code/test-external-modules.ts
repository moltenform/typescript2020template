
import {sum as lodashSum} from 'lodash';
import Base64js from 'base64-js'
import { assertEq, getEnumToStrOrFallback, Util512 } from '../util/util512';
import FileSaver from 'file-saver';
import { BowserBrowsers, BowserOS, BowserPlatform, bridgedGetAllBrowserInfo } from '../util/types/bowser.types';

// can also use import _ from 'lodash';

export async function testExternalModules() {
    let results:string[] = []

    // my own utils
    const theKeys = Util512.getMapKeys({a: 1})
    assertEq('a', theKeys[0], 'test Util512.getMapKeys')
    results.push('Util512 works')
    
    
    // base64-js
    const arr = Base64js.toByteArray('abcd')
    assertEq(105, arr[0], 'test base64-js')
    results.push('base64-js works')

    // bowser
    const [rBowserBrowsers, rBowserOS, rBowserPlatform] = await bridgedGetAllBrowserInfo(window.navigator.userAgent)
    console.log([rBowserBrowsers, rBowserOS, rBowserPlatform])
    results.push('bowser results1:' + getEnumToStrOrFallback<BowserBrowsers>(BowserBrowsers, rBowserBrowsers))
    results.push('bowser results2:' + getEnumToStrOrFallback<BowserOS>(BowserOS, rBowserOS))
    results.push('bowser results3:' + getEnumToStrOrFallback<BowserPlatform>(BowserPlatform, rBowserPlatform))

    // es6-error
    // lodash
    const sum = lodashSum([1,2,3])
    assertEq(6, sum, 'test lodash')
    results.push('lodash works')



    return results.join('\n')
}


function doDetectBrowser() {
    //~ let o = bowser.parse(window.navigator.userAgent);
    //~ let s = '';
    //~ s += `<br/>name: ${o.browser.name}`;
    //~ s += `<br/>v: ${o.browser.version}`;
    //~ s += `<br/>platform: ${o.platform.type}`;
    //~ let el = document.getElementById('detectedBrowser');
    //~ if (el) {
        //~ el.innerHTML = s;
    //~ }
}

export function onDemoSave() {
    var text = new Blob(["hello world!"], {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(text, "hello world.txt");
}
