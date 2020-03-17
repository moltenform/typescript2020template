
/* auto */ import { assertEq, assertEqWarn, assertNever, assertTrue, assertTrueWarn, beginLoadImage, booltrue, isValidNumber, makeDefaultSort, range, repeat, scontains, slength, } from './utils/bwtuiutils';

import { Skip } from 'serializer.ts/decorators';
import { serialize, deserialize } from 'serializer.ts/serializer';

class ClassTestSerialization {
    constructor(public id: string) {}
    public content = 'content';
    @Skip() unimportant = 'skipped';
}

function testSerialize() {
    let o = new ClassTestSerialization('id1001');
    o.unimportant = 'not important';
    let oAsJson = serialize(o);
    let oAsString = JSON.stringify(oAsJson);
    let gotJson = JSON.parse(oAsString);
    let oFromString = deserialize<ClassTestSerialization>(ClassTestSerialization, gotJson);
    assertTrue(oFromString instanceof ClassTestSerialization);
    assertEq('id1001', oFromString.id);
    assertEq('content', oFromString.content);
    assertEq('skipped', oFromString.unimportant);
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace csv {
    function encode(o: any): string;
}

function testCsvDependency() {
    let encoded = csv.encode([
        { prop1: 'v1', prop2: 'v2' },
        { prop1: 'v1b', prop2: 'v2b' },
    ]);
    let lines = encoded.split('\n');
    assertEq(3, lines.length);
    assertEq('prop1,prop2', lines[0]);
    assertEq('v1,v2', lines[1]);
    assertEq('v1b,v2b', lines[2]);
}

function testRepeat() {
    let s = repeat(4, 'a').join('_');
    assertEq('a_a_a_a', s);
}

function testRange() {
    let s = range(1, 5).join('_');
    assertEq('1_2_3_4', s);
}

function referenceMany() {
    // simply a way to import many functions,
    // to test auto-import-modules
    // and prettier-imports-on-one-line
    let ar = [
        isValidNumber,
        assertTrue,
        assertEq,
        assertTrueWarn,
        assertEqWarn,
        assertNever,
        booltrue,
        scontains,
        slength,
        makeDefaultSort,
        beginLoadImage,
    ];
    return ar;
}

export function runAllTests() {
    let testList = [testSerialize, testRepeat, testRange, testCsvDependency, referenceMany];

    for (let i = 0; i < testList.length; i++) {
        runAndCatchBasic(() => {
            console.log(`running test ${i + 1}/${testList.length} (${testList[i].name})`);
            testList[i]();
        });
    }

    console.log('tests complete!');
}

function runAndCatchBasic(fn: Function) {
    try {
        fn();
    } catch (e) {
        alert('Warning: ' + e);
        console.log(e.stack);
    }
}
