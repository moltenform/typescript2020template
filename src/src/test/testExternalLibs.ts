
/* auto */ import { SimpleSensibleTestCategory } from './testUtils';
/* auto */ import { assertEq } from './../util/benBaseUtils';


let t = new SimpleSensibleTestCategory('testExternalLibs');
export let testExternalLibs = t;

t.test('testCsvLib', () => {
    let encoded = csv.encode([
        { prop1: 'v1', prop2: 'v2' },
        { prop1: 'v1b', prop2: 'v2b' },
    ]);
    let lines = encoded.split('\n');
    assertEq(3, lines.length, '');
    assertEq('prop1,prop2', lines[0], '');
    assertEq('v1,v2', lines[1], '');
    assertEq('v1b,v2b', lines[2], '');
});

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace csv {
    function encode(o: any): string;
}
