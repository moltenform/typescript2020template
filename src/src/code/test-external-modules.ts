
import {sum as lodashSum} from 'lodash';
import Base64js from 'base64-js'
import { assertEq } from '../util/util512';
import FileSaver from 'file-saver';

// can also use import _ from 'lodash';

export async function testExternalModules() {
    let results:string[] = []
    
    // base64-js
    const arr = Base64js.toByteArray('abc')
    assertEq(97, arr[0], 'test base64-js')
    results.push('base64-js works')

    // bowser
    // es6-error
    // lodash
    const sum = lodashSum([1,2,3])
    assertEq(6, sum, 'test lodash')
    results.push('lodash works')




}

export function testFilesaver() {
    var text = new Blob(["hello world!"], {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(text, "hello world.txt");
}
