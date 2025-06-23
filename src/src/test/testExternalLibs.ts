
/* auto */ import { O } from './../util/util512Base';
/* auto */ import { assertTrue } from './../util/util512Assert';
/* auto */ import { assertEq, longstr } from './../util/util512';
/* auto */ import { SimpleUtil512TestCollection } from './testHelpers';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

import { Skip, Type } from 'serializer.ts/decorators';
import { serialize, deserialize } from 'serializer.ts/serializer';
import { LRUMap } from 'lru_map';
import { BrowserOSInfo, BrowserOSInfoSimple, guessOs, guessOsSimple } from '../external/bowser';

let t = new SimpleUtil512TestCollection('testCollectionExternalLibs');
export let testCollectionExternalLibs = t;

t.atest('getBrowserOS', async () => {
    assertTrue(false, "havent looked at this file yet")
    let s = longstr(`Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X)
        AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A5370a
        Safari/604.1`);
    assertEq(BrowserOSInfo.Mac, guessOs(s));
    assertEq(BrowserOSInfoSimple.MacOrIos, guessOsSimple(s));
    s = longstr(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
        (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246`);
    assertEq(BrowserOSInfo.Windows, guessOs(s));
    assertEq(BrowserOSInfoSimple.WindowsOrWinPhone, guessOsSimple(s));
    s = longstr(`Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9
        (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9`);
    assertEq(BrowserOSInfo.Mac, guessOs(s));
    assertEq(BrowserOSInfoSimple.MacOrIos, guessOsSimple(s));
    s = longstr(`Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML,
        like Gecko) Chrome/47.0.2526.111 Safari/537.36`);
    assertEq(BrowserOSInfo.Windows, guessOs(s));
    assertEq(BrowserOSInfoSimple.WindowsOrWinPhone, guessOsSimple(s));
    s = longstr(`Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101
        Firefox/15.0.1`);
    assertEq(BrowserOSInfo.Linux, guessOs(s));
    assertEq(BrowserOSInfoSimple.LinuxOrAndroid, guessOsSimple(s));
    /*
        The previous version also looked for
        Windows
        iPhone|iPad|iPod,Mac OS X,MacPPC|MacIntel|Mac_PowerPC|Macintosh
        Linux|X11|UNIX
    */
});
t.test('JsLru', () => {
    let testmap = new (LRUMap)<string, number>(3);
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
});

t.test('testSimpleSerialize', () => {
    let o = new ClassTestSimpleSerialization('id1001');
    o.unimportant = 'not important';
    let oAsJson = serialize(o);
    let oAsString = JSON.stringify(oAsJson);
    let gotJson = JSON.parse(oAsString);
    let oFromString = deserialize<ClassTestSimpleSerialization>(
        ClassTestSimpleSerialization,
        gotJson
    );
    assertTrue(oFromString instanceof ClassTestSimpleSerialization);
    assertEq('id1001', oFromString.id);
    assertEq('content', oFromString.content);
    assertEq('skipped', oFromString.unimportant);
});
t.test('testClassSerialization', () => {
    let hl = new Hand(1, 'left');
    let hr = new Hand(1, 'right');
    let person = new Person('jim');

    person.hands = [hl, hr];
    hl.fingers = [new Finger(1, 'fl1'), new Finger(2, 'fl2'), new Finger(3, 'fl3')];
    hr.fingers = [new Finger(11, 'fr1'), new Finger(12, 'fr2'), new Finger(13, 'fr3')];
    hl.currentOrientation = 'dn';
    hl.holding = ['a', 'b'];
    let expectedS = longstr(
        `p=jim,h=[hid=1,hnm=left,hol=a|b,o=dn,f=[id=1nm=[fl1],
        id=2nm=[fl2],id=3nm=[fl3]],hid=1,hnm=right,hol=,o=up,f=[id=11nm=[fr1],
        id=12nm=[fr2],id=13nm=[fr3]]]`,
        ''
    );
    assertEq(expectedS, person.asString());

    let serialized = JSON.stringify(serialize(person));
    let got = deserialize<Person>(Person, JSON.parse(serialized));

    // o was marked as skip, so it should return to the default value
    let expectedDeser = expectedS.replace(/,o=dn,/, ',o=up,');
    assertEq(expectedDeser, got.asString());

    // round trip it
    let serialized2 = JSON.stringify(serialize(got));
    let got2 = deserialize<Person>(Person, JSON.parse(serialized2));
    assertEq(expectedDeser, got2.asString());
});
t.test('testClassSerializationWithNulls', () => {
    // test with empty array
    let h = new Hand(1, 'test');
    h.holding = [];
    let expectedS = 'hid=1,hnm=test,hol=,o=up,f=[]';
    assertEq(expectedS, h.asString());
    let serialized = JSON.stringify(serialize(h));
    let got = deserialize<Hand>(Hand, JSON.parse(serialized));
    assertEq(expectedS, got.asString());

    // test with array with null and undefined
    h = new Hand(1, 'test');
    h.holding = [null as any, undefined as any];
    expectedS = 'hid=1,hnm=test,hol=|,o=up,f=[]';
    assertEq(expectedS, h.asString());
    serialized = JSON.stringify(serialize(h));
    got = deserialize<Hand>(Hand, JSON.parse(serialized));
    assertEq(expectedS, got.asString());
    assertEq(2, got.holding.length);
    assertTrue(got.holding[0] === null, 'expected null->null');
    assertTrue(got.holding[1] === null, 'expected undefined->null');

    // test with array with undefined between values
    h = new Hand(1, 'test');
    h.holding = ['a', undefined, 'c'];
    expectedS = 'hid=1,hnm=test,hol=a||c,o=up,f=[]';
    assertEq(expectedS, h.asString());
    serialized = JSON.stringify(serialize(h));
    got = deserialize<Hand>(Hand, JSON.parse(serialized));
    assertEq(expectedS, got.asString());
    assertEq(3, got.holding.length);
    assertTrue(got.holding[0] === 'a');
    assertTrue(got.holding[1] === null, 'expected undefined->null');
    assertTrue(got.holding[2] === 'c');
});

class Person {
    constructor(public name: string) {}
    @Type(() => Hand)
    hands: Hand[] = [];
    asString() {
        let h = this.hands.map(a => a.asString()).join(',');
        return `p=${this.name},h=[${h}]`;
    }
}

class Hand {
    constructor(public id: number, private _name: string) {}

    holding: O<string>[] = [];

    @Skip()
    currentOrientation = 'up';

    @Type(() => Finger)
    fingers: Finger[] = [];

    @Skip()
    get name() {
        return this._name;
    }

    getCountFingers() {
        return this.fingers.length;
    }

    asString() {
        let f = this.fingers.map(a => a.asString()).join(',');
        return `hid=${this.id},hnm=${this.name},hol=${this.holding.join('|')},o=${
            this.currentOrientation
        },f=[${f}]`;
    }
}

class Finger {
    constructor(public id: number, public name: string) {}
    asString() {
        return `id=${this.id}nm=[${this.name}]`;
    }
}

class ClassTestSimpleSerialization {
    constructor(public id: string) {}
    public content = 'content';
    @Skip() unimportant = 'skipped';
}
