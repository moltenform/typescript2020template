
/* auto */ import { assertTrue } from './../util/util512Assert';
/* auto */ import { Util512, assertEq, longstr } from './../util/util512';
/* auto */ import { SimpleUtil512TestCollection, assertThrows, sorted } from './testUtils';
import {
    BrowserOSInfo,
    BrowserOSInfoSimple,
    guessOs,
    guessOsSimple
} from '../external/bowser';
import _ from 'lodash';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

let t = new SimpleUtil512TestCollection('testCollectionUtil512Class');
export let testCollectionUtil512Class = t;

t.test('isValidNumber', () => {
    assertTrue(Util512.isValidNumber(123));
    assertTrue(Util512.isValidNumber(0));
    assertTrue(!Util512.isValidNumber(null));
    assertTrue(!Util512.isValidNumber(undefined));
    assertTrue(!Util512.isValidNumber(NaN));
    assertTrue(!Util512.isValidNumber(Infinity));
    assertTrue(!Util512.isValidNumber(Number.POSITIVE_INFINITY));
    assertTrue(!Util512.isValidNumber(Number.NEGATIVE_INFINITY));
    assertTrue(!Util512.isValidNumber('12'));
    assertTrue(!Util512.isValidNumber(''));
});
t.test('Range.Upwards', () => {
    try {
    Util512.range(0, 1);
    } catch( e) {
        alert(e.stack)
    }

    assertEq([0], Util512.range(0, 1));
    assertEq([1], Util512.range(1, 2));
    assertEq([0, 1, 2, 3], Util512.range(0, 4));
    assertEq([2, 3, 4], Util512.range(2, 5));
    assertEq([2, 5], Util512.range(2, 8, 3));
    assertEq([2, 5, 8], Util512.range(2, 9, 3));
    assertEq([2, 5, 8], Util512.range(2, 10, 3));
});
t.test('Range.Downwards', () => {
    assertEq([1], Util512.range(1, 0, -1));
    assertEq([2], Util512.range(2, 1, -1));
    assertEq([5, 4, 3], Util512.range(5, 2, -1));
    assertEq([10, 7, 4], Util512.range(10, 2, -3));
    assertEq([9, 6, 3], Util512.range(9, 2, -3));
    assertEq([8, 5], Util512.range(8, 2, -3));
});
t.test('Range.None', () => {
    assertEq([], Util512.range(5, 2));
    assertEq([], Util512.range(2, 2));
    assertEq([], Util512.range(2, 5, -1));
    assertEq([], Util512.range(2, 2, -1));
});
t.test('Repeat', () => {
    t.say(/*——————————*/ 'strings');
    assertEq(['a', 'a', 'a'], Util512.repeat(3, 'a'));
    assertEq(['a'], Util512.repeat(1, 'a'));
    assertEq([], Util512.repeat(0, 'a'));
    t.say(/*——————————*/ 'numbers');
    assertEq([4, 4, 4], Util512.repeat(3, 4));
    assertEq([4], Util512.repeat(1, 4));
    assertEq([], Util512.repeat(0, 4));
});
t.test('setArr', () => {
    let ar1: number[] = [];
    Util512.setArr(ar1, 0, 12, 0);
    assertEq([12], ar1);
    let ar2: number[] = [];
    Util512.setArr(ar2, 1, 12, 0);
    assertEq([0, 12], ar2);
    let ar3: number[] = [];
    Util512.setArr(ar3, 3, 12, 0);
    assertEq([0, 0, 0, 12], ar3);
    let ar: number[] = [1, 2];
    Util512.setArr(ar, 0, 12, 0);
    assertEq([12, 2], ar);
    ar = [1, 2];
    Util512.setArr(ar, 2, 12, 0);
    assertEq([1, 2, 12], ar);
    ar = [1, 2];
    Util512.setArr(ar, 3, 12, 0);
    assertEq([1, 2, 0, 12], ar);
});
t.test('extendArray', () => {
    t.say(/*——————————*/ 'AppendNothing');
    let ar = [1, 2, 3];
    Util512.extendArray(ar, []);
    assertEq([1, 2, 3], ar);
    t.say(/*——————————*/ 'AppendOneElem');
    ar = [1, 2, 3];
    Util512.extendArray(ar, [4]);
    assertEq([1, 2, 3, 4], ar);
    t.say(/*——————————*/ 'AppendThreeElems');
    ar = [1, 2, 3];
    Util512.extendArray(ar, [4, 5, 6]);
    assertEq([1, 2, 3, 4, 5, 6], ar);
});
t.test('parseIntStrict', () => {
    assertEq(0, Util512.parseIntStrict('0'));
    assertEq(9, Util512.parseIntStrict('9'));
    assertEq(12, Util512.parseIntStrict('12'));
    assertEq(12, Util512.parseIntStrict(' 12'));
    assertEq(12, Util512.parseIntStrict('12 '));
    assertEq(12, Util512.parseIntStrict(' 12 '));
    assertEq(undefined, Util512.parseIntStrict(''));
    assertEq(undefined, Util512.parseIntStrict(undefined));
    assertEq(undefined, Util512.parseIntStrict('1more'));
    assertEq(undefined, Util512.parseIntStrict('1 more'));
    assertEq(undefined, Util512.parseIntStrict('1.1'));
    assertEq(undefined, Util512.parseIntStrict('12a'));
    assertEq(undefined, Util512.parseIntStrict('a12'));
    assertEq(undefined, Util512.parseIntStrict('abc'));
    assertEq(12, Util512.parseIntStrict('012'));
    assertEq(12, Util512.parseIntStrict('0012'));
});
t.test('truncateWithEllipsis', () => {
    assertEq('', Util512.truncateWithEllipsis('', 2));
    assertEq('a', Util512.truncateWithEllipsis('a', 2));
    assertEq('ab', Util512.truncateWithEllipsis('ab', 2));
    assertEq('ab', Util512.truncateWithEllipsis('abc', 2));
    assertEq('ab', Util512.truncateWithEllipsis('abcd', 2));
    assertEq('', Util512.truncateWithEllipsis('', 4));
    assertEq('a', Util512.truncateWithEllipsis('a', 4));
    assertEq('ab', Util512.truncateWithEllipsis('ab', 4));
    assertEq('abcd', Util512.truncateWithEllipsis('abcd', 4));
    assertEq('a...', Util512.truncateWithEllipsis('abcde', 4));
    assertEq('a...', Util512.truncateWithEllipsis('abcdef', 4));
});
t.test('add', () => {
    assertEq(0, Util512.add(0, 0));
    assertEq(9, Util512.add(4, 5));
    assertEq(6, [1, 2, 3].reduce(Util512.add));
    assertEq(9, [1, 2, 3].reduce(Util512.add, 3));
    assertEq(0, [].reduce(Util512.add, 0));
});
t.atest('getBrowserOS', async () => {
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
t.test('isMapEmpty.PlainObject', () => {
    let obj0 = {};
    let obj1 = { a: true };
    let obj2 = { abc: 'abc', def: 'def' };
    assertTrue(Util512.isMapEmpty(obj0));
    assertTrue(!Util512.isMapEmpty(obj1));
    assertTrue(!Util512.isMapEmpty(obj2));
});
t.test('isMapEmpty.Class', () => {
    let o0 = new TestClsEmpty();
    let o1 = new TestClsOne();
    let o2 = new TestClsOne();
    (o2 as any).aSingleAdded = 1;
    assertTrue(Util512.isMapEmpty(o0 as any));
    assertTrue(!Util512.isMapEmpty(o1 as any));
    assertTrue(!Util512.isMapEmpty(o2 as any));
});
t.test('getMapShallowClone.PlainObject', () => {
    let obj0 = {};
    let obj1 = { a: true };
    let obj2 = { abc: 'abc', def: '_def' };
    let clone0 = Util512.shallowClone(obj0);
    let clone1 = Util512.shallowClone(obj1);
    let clone2 = Util512.shallowClone(obj2);
    assertEq([], sorted(Util512.getMapKeys(clone0)));
    assertEq(['a'], sorted(Util512.getMapKeys(clone1)));
    assertEq(['abc', 'def'], sorted(Util512.getMapKeys(clone2)));
});
t.test('getMapShallowClone.Class', () => {
    let cls0 = new TestClsEmpty();
    let cls1 = new TestClsOne();
    let cls2 = new TestClsOne();
    (cls2 as any).aSingleAdded = 1;
    let clone0 = Util512.shallowClone(cls0);
    let clone1 = Util512.shallowClone(cls1);
    let clone2 = Util512.shallowClone(cls2);
    assertEq([], sorted(Util512.getMapKeys(clone0)));
    assertEq(['aSingleProp'], sorted(Util512.getMapKeys(clone1)));
    assertEq(['aSingleAdded', 'aSingleProp'], sorted(Util512.getMapKeys(clone2)));
});
t.test('freezeProperty.PlainObject', () => {
    let obj1 = { a: true, b: true };
    Util512.freezeProperty(obj1, 'a');
    obj1.b = false;
    assertThrows('', () => {
        obj1.a = false;
    });
});
t.test('freezeProperty.Class', () => {
    let cls1 = new TestClsOne();
    Util512.freezeProperty(cls1, 'aSingleProp');
    assertThrows('', () => {
        cls1.aSingleProp = false;
    });
});
t.test('freezeRecurse.PlainObject', () => {
    let obj = { a: true, b: true };
    assertTrue(!Object.isFrozen(obj));
    Util512.freezeRecurse(obj);
    assertThrows('', () => {
        obj.a = false;
    });
});
t.test('freezeRecurse.Class', () => {
    let cls1 = new TestClsOne();
    let cls2 = new TestClsOne();
    let cls3 = new TestClsOne();
    (cls1 as any).child = cls2;
    (cls2 as any).child = cls3;
    (cls3 as any).nullchild = undefined;
    assertTrue(!Object.isFrozen(cls1));
    Util512.freezeRecurse(cls1);
    assertTrue(Object.isFrozen(cls1));
    assertTrue(Object.isFrozen(cls2));
    assertTrue(Object.isFrozen(cls3));
    assertThrows('', () => {
        cls1.aSingleProp = false;
    });

    assertThrows('', () => {
        (cls1 as any).newProp = true;
    });
});
t.test('EscapeForRegex.NoEscapeNeeded', () => {
    assertEq('', Util512.escapeForRegex(''));
    assertEq('abc', Util512.escapeForRegex('abc'));
    assertEq('a 1 "', Util512.escapeForRegex('a 1 "'));
});
t.test('EscapeForRegex.EscapeNeeded', () => {
    assertEq('\\\\', Util512.escapeForRegex('\\'));
    assertEq('a\\?b\\?', Util512.escapeForRegex('a?b?'));
    assertEq('\\/', Util512.escapeForRegex('/'));
    assertEq('a\\/b', Util512.escapeForRegex('a/b'));
    assertEq('\\+', Util512.escapeForRegex('+'));
    assertEq('a\\+b', Util512.escapeForRegex('a+b'));
    assertEq('\\+\\+', Util512.escapeForRegex('++'));
    assertEq('a\\+\\+b', Util512.escapeForRegex('a++b'));
});
t.test('EscapeForRegex.Consecutive', () => {
    assertEq('', Util512.escapeForRegex(''));
    assertEq('abc', Util512.escapeForRegex('abc'));
    assertEq('\\[abc\\]', Util512.escapeForRegex('[abc]'));
    assertEq('123\\[abc\\]456', Util512.escapeForRegex('123[abc]456'));
    assertEq('\\.\\.', Util512.escapeForRegex('..'));
    assertEq('\\|\\|', Util512.escapeForRegex('||'), '');
    assertEq('\\[\\[', Util512.escapeForRegex('[['));
    assertEq('\\]\\]', Util512.escapeForRegex(']]'));
    assertEq('\\(\\(', Util512.escapeForRegex('(('));
    assertEq('\\)\\)', Util512.escapeForRegex('))'));
    assertEq('\\/\\/', Util512.escapeForRegex('//'));
    assertEq('\\\\\\\\', Util512.escapeForRegex('\\\\'));
});
t.test('capitalizeFirst.NonAlphabet', () => {
    assertEq('', Util512.capitalizeFirst(''));
    assertEq('1', Util512.capitalizeFirst('1'));
    assertEq('0123', Util512.capitalizeFirst('0123'));
    assertEq('\t1', Util512.capitalizeFirst('\t1'));
    assertEq(' 1', Util512.capitalizeFirst(' 1'));
    assertEq('!@#1', Util512.capitalizeFirst('!@#1'));
});
t.test('capitalizeFirst.Alphabet', () => {
    assertEq('A', Util512.capitalizeFirst('a'));
    assertEq('Abc', Util512.capitalizeFirst('abc'));
    assertEq('Def ghi', Util512.capitalizeFirst('def ghi'));
    assertEq('A', Util512.capitalizeFirst('A'));
    assertEq('ABC', Util512.capitalizeFirst('ABC'));
    assertEq('DEF ghi', Util512.capitalizeFirst('DEF ghi'));
});
t.test('callAsMethod.BadCharInMethodName', () => {
    let o = new TestClsWithMethods();
    assertThrows('requires alphanumeric', () =>
        Util512.callAsMethodOnClass(TestClsWithMethods.name, o, '', [true, 1], true)
    );

    assertThrows('requires alphanumeric', () =>
        Util512.callAsMethodOnClass(TestClsWithMethods.name, o, 'a b', [true, 1], true)
    );

    assertThrows('requires alphanumeric', () =>
        Util512.callAsMethodOnClass(TestClsWithMethods.name, o, 'a', [true, 1], true)
    );

    assertThrows('requires alphanumeric', () =>
        Util512.callAsMethodOnClass(TestClsWithMethods.name, o, '?', [true, 1], true)
    );

    assertThrows('requires alphanumeric', () =>
        Util512.callAsMethodOnClass(TestClsWithMethods.name, o, '1a', [true, 1], true)
    );

    assertThrows('requires alphanumeric', () =>
        Util512.callAsMethodOnClass(TestClsWithMethods.name, o, '_c', [true, 1], true)
    );

    assertThrows('requires alphanumeric', () =>
        Util512.callAsMethodOnClass(TestClsWithMethods.name, o, '__c', [true, 1], true)
    );

    assertThrows('requires alphanumeric', () =>
        Util512.callAsMethodOnClass(TestClsWithMethods.name, o, '.', [true, 1], true)
    );

    assertThrows('requires alphanumeric', () =>
        Util512.callAsMethodOnClass(TestClsWithMethods.name, o, 'a.b', [true, 1], true)
    );
});
t.test('callAsMethod.MissingMethodWhenAllowed', () => {
    let o = new TestClsWithMethods();
    Util512.callAsMethodOnClass(TestClsWithMethods.name, o, 'notExist', [true, 1], true);
});
t.test('callAsMethod.MissingMethodWhenDisAllowed', () => {
    let o = new TestClsWithMethods();
    assertThrows('could not find', () =>
        Util512.callAsMethodOnClass(
            TestClsWithMethods.name,
            o,
            'notExist',
            [true, 1],
            false
        )
    );
});
t.test('callAsMethod.ValidMethod', () => {
    let o1 = new TestClsWithMethods();
    Util512.callAsMethodOnClass(TestClsWithMethods.name, o1, 'goAbc', [true, 1], false);
    assertEq(true, o1.calledAbc);
    assertEq(false, o1.calledZ);
    let o2 = new TestClsWithMethods();
    Util512.callAsMethodOnClass(TestClsWithMethods.name, o2, 'goZ', [true, 1], false);
    assertEq(false, o2.calledAbc);
    assertEq(true, o2.calledZ);
});
t.test('isMethodOnClass', () => {
    let o1 = new TestClsWithMethods();
    assertTrue(Util512.isMethodOnClass(o1, 'goAbc'));
    assertTrue(Util512.isMethodOnClass(o1, 'goZ'));
    assertTrue(!Util512.isMethodOnClass(o1, 'goAbcd'));
    assertTrue(!Util512.isMethodOnClass(o1, 'calledAbc'));
    assertTrue(!Util512.isMethodOnClass(o1, 'notPresent'));
    assertTrue(!Util512.isMethodOnClass(o1, ''));
});
t.test('getMapKeys.PlainObject', () => {
    let obj0 = {};
    let obj1 = { a: true };
    let obj2 = { abc: 'abc', def: '_def' };
    assertEq([], sorted(Util512.getMapKeys(obj0)));
    assertEq(['a'], sorted(Util512.getMapKeys(obj1)));
    assertEq(['abc', 'def'], sorted(Util512.getMapKeys(obj2)));
});
t.test('getMapKeys.Class', () => {
    let cls0 = new TestClsEmpty();
    let cls1 = new TestClsOne();
    let cls2 = new TestClsOne();
    (cls2 as any).aSingleAdded = 1;
    assertEq([], sorted(Util512.getMapKeys(cls0 as any)));
    assertEq(['aSingleProp'], sorted(Util512.getMapKeys(cls1 as any)));
    assertEq(['aSingleAdded', 'aSingleProp'], sorted(Util512.getMapKeys(cls2 as any)));
});
t.test('getMapVals.PlainObject', () => {
    let obj0 = {};
    let obj1 = { a: true };
    let obj2 = { abc: 'abc', def: '_def' };
    assertEq([], sorted(Util512.getMapVals(obj0)));
    assertEq([true], sorted(Util512.getMapVals(obj1)));
    assertEq(['_def', 'abc'], sorted(Util512.getMapVals(obj2)));
});
t.test('getMapVals.Class', () => {
    let cls0 = new TestClsEmpty();
    let cls1 = new TestClsOne();
    let cls2 = new TestClsOne();
    (cls2 as any).aSingleAdded = false;
    assertEq([], sorted(Util512.getMapVals(cls0 as any)));
    assertEq([true], sorted(Util512.getMapVals(cls1 as any)));
    assertEq([false, true], sorted(Util512.getMapVals(cls2 as any)));
});
t.test('padStart', () => {
    assertEq('123', Util512.padStart(123, 2, '0'));
    assertEq('123', Util512.padStart(123, 3, '0'));
    assertEq('0123', Util512.padStart(123, 4, '0'));
    assertEq('00123', Util512.padStart(123, 5, '0'));
});
t.test('arrayToBase64.arrayOfNumbers', () => {
    let nums: any = Array.prototype.map.call('hello', (x: string) => x.charCodeAt(0));
    assertEq('aGVsbG8=', Util512.arrayToBase64(nums));
});
t.test('arrayToBase64.Uint8Array', () => {
    let nums: any = Array.prototype.map.call('hello', (x: string) => x.charCodeAt(0));
    let uint8 = new Uint8Array(nums);
    assertEq('aGVsbG8=', Util512.arrayToBase64(uint8));
});
t.test('arrayToBase64.ArrayBuffer', () => {
    let nums: any = Array.prototype.map.call('hello', (x: string) => x.charCodeAt(0));
    let buffer = new ArrayBuffer(nums.length);
    let view = new Uint8Array(buffer);
    for (let i = 0; i < nums.length; i++) {
        view[i] = nums[i];
    }

    assertEq('aGVsbG8=', Util512.arrayToBase64(view));
});
t.test('Base64UrlSafe.StripsAndReAddEqualsSign', () => {
    let roundTrip = (a: string, b: string) => {
        assertEq(Util512.toBase64UrlSafe(a), b);
        assertEq(Util512.fromBase64UrlSafe(b), a);
    };

    roundTrip('abc', 'YWJj');
    roundTrip('abcd', 'YWJjZA');
    roundTrip('abcde', 'YWJjZGU');
    roundTrip('abcdef', 'YWJjZGVm');
    roundTrip('abcdefg', 'YWJjZGVmZw');
});
t.test('Base64UrlSafe.ReplacesWithUnderscoreAndDash', () => {
    let roundTrip = (a: string, b: string) => {
        assertEq(Util512.toBase64UrlSafe(a), b);
        assertEq(Util512.fromBase64UrlSafe(b), a);
    };

    roundTrip('\x01\x05\xf8\xff', 'AQX4_w');
    roundTrip('\x01\x05\xf8\xffX', 'AQX4_1g');
    roundTrip('\x01\x05\xf8\xffXY', 'AQX4_1hZ');
    roundTrip('\x01\x05\xf8\xffXYZ', 'AQX4_1hZWg');
    roundTrip('\x01\x05\xf8\xffXYZ<', 'AQX4_1hZWjw');
    roundTrip('\x01\x05\xf8\xffXYZ<>', 'AQX4_1hZWjw-');
});
t.test('stringToCharArray', () => {
    assertEq([], Util512.stringToCharArray(''));
    assertEq(['a'], Util512.stringToCharArray('a'));
    assertEq(['a', 'b', ' ', 'c', 'd'], Util512.stringToCharArray('ab cd'));
});
t.test('stringToByteArray', () => {
    assertEq([], Util512.stringToByteArray(''));
    assertEq([97], Util512.stringToByteArray('a'));
    assertEq([97, 98, 32, 99, 100], Util512.stringToByteArray('ab cd'));
});
t.test('sortDecorated', () => {
    class MyClass {
        constructor(public a: string) {}
    }

    t.say(/*——————————*/ 'typical usage');
    let input: string[] = ['abc', 'dba', 'aab', 'ffd'];
    let ret = Util512.sortDecorated(input, s => s.charAt(2));
    assertEq('dba;aab;abc;ffd', ret.join(';'));
    t.say(/*——————————*/ 'with class');
    let inputCl = [new MyClass('bb'), new MyClass('aa'), new MyClass('cc')];
    let retCl = Util512.sortDecorated(inputCl, o => o.a);
    assertEq('aa;bb;cc', retCl.map(o => o.a).join(';'));
    t.say(/*——————————*/ 'with class and ties');
    inputCl = [new MyClass('bb'), new MyClass('aa'), new MyClass('bb')];
    retCl = Util512.sortDecorated(inputCl, o => o.a);
    assertEq('aa;bb;bb', retCl.map(o => o.a).join(';'));
});
t.test('normalizeNewlines', () => {
    assertEq('ab', Util512.normalizeNewlines('ab'));
    assertEq('a\nb\n', Util512.normalizeNewlines('a\nb\n'));
    assertEq('a\nb\n', Util512.normalizeNewlines('a\r\nb\r\n'));
    assertEq('a\nb\n', Util512.normalizeNewlines('a\rb\r'));
    assertEq('a\nb\n', Util512.normalizeNewlines('a\rb\r\n'));
    assertEq('a\nb\n', Util512.normalizeNewlines('a\r\nb\n'));
});

/**
 * test-only code. class with no members
 */
class TestClsEmpty {}

/**
 * test-only code. class with 1 member
 */
class TestClsOne {
    aSingleProp = true;
}

/**
 * test-only code. class with methods
 */
class TestClsWithMethods {
    calledAbc = false;
    calledZ = false;
    goAbc(p1: boolean, p2: number) {
        assertEq(true, p1);
        assertEq(1, p2);
        this.calledAbc = true;
    }

    goZ(p1: boolean, p2: number) {
        assertEq(true, p1);
        assertEq(1, p2);
        this.calledZ = true;
    }
}
