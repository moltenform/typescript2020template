
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


