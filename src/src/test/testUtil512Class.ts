
import { assertTrue } from './../util/util512Assert';
import { Util512, assertEq } from './../util/util512';
import { assertThrows, sorted, t } from './testHelpers';
import { sortBy as ldSortBy, clone as ldClone, sum as ldSum, split as ldSplit } from 'lodash';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

t.setCurrentLabel('testCollectionUtil512Class');
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
    // test strings
    assertEq(['a', 'a', 'a'], Util512.repeat(3, 'a'));
    assertEq(['a'], Util512.repeat(1, 'a'));
    assertEq([], Util512.repeat(0, 'a'));
    // test numbers
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
    // test AppendNothing
    let ar = [1, 2, 3];
    Util512.extendArray(ar, []);
    assertEq([1, 2, 3], ar);
    // test AppendOneElem
    ar = [1, 2, 3];
    Util512.extendArray(ar, [4]);
    assertEq([1, 2, 3, 4], ar);
    // test AppendThreeElems
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
    // intentionally doesn't support negative numbers
    assertEq(undefined, Util512.parseIntStrict('-12'));
    assertEq(undefined, Util512.parseIntStrict('-0'));
});
t.test('parseInt', () => {
    assertEq(0, Util512.parseInt('0'));
    assertEq(9, Util512.parseInt('9'));
    assertEq(12, Util512.parseInt('12'));
    assertEq(12, Util512.parseInt(' 12'));
    assertEq(12, Util512.parseInt('12 '));
    assertEq(12, Util512.parseInt(' 12 '));
    assertEq(undefined, Util512.parseInt(''));
    assertEq(undefined, Util512.parseInt(undefined));
    assertEq(1, Util512.parseInt('1more'));
    assertEq(1, Util512.parseInt('1 more'));
    assertEq(1, Util512.parseInt('1.1'));
    assertEq(12, Util512.parseInt('12a'));
    assertEq(undefined, Util512.parseInt('a12'));
    assertEq(undefined, Util512.parseInt('abc'));
    assertEq(12, Util512.parseInt('012'));
    assertEq(12, Util512.parseInt('0012'));
    assertEq(-12, Util512.parseInt('-12'));
    assertEq(0, Util512.parseInt('-0'));
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
    assertEq(6, ldSum([1, 2, 3]));
    assertEq(0, ldSum([]));
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    assertTrue(Util512.isMapEmpty(o0 as any));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    assertTrue(!Util512.isMapEmpty(o1 as any));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    assertTrue(!Util512.isMapEmpty(o2 as any));
});
t.test('Clone.PlainObject', () => {
    let obj0 = {};
    let obj1 = { a: true };
    let obj2 = { abc: 'abc', def: '_def' };
    let clone0 = ldClone(obj0);
    let clone1 = ldClone(obj1);
    let clone2 = ldClone(obj2);
    assertEq([], sorted(Util512.getMapKeys(clone0)));
    assertEq(['a'], sorted(Util512.getMapKeys(clone1)));
    assertEq(['abc', 'def'], sorted(Util512.getMapKeys(clone2)));
});
t.test('Clone.Class', () => {
    let cls0 = new TestClsEmpty();
    let cls1 = new TestClsOne();
    let cls2 = new TestClsOne();
    (cls2 as any).aSingleAdded = 1;
    let clone0 = ldClone(cls0);
    let clone1 = ldClone(cls1);
    let clone2 = ldClone(cls2);
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
t.test('callAsMethod.ValidMethod', () => {
    let o1 = new TestClsWithMethods();
    Util512.callAsMethodOnClass(
        TestClsWithMethods.name,
        o1,
        'goAbc',
        [true, 1],
        false /* okifnotexist*/,
        undefined /* returnifnotexist */,
        false /* ok if parent*/
    );
    assertEq(true, o1.calledAbc);
    assertEq(false, o1.calledZ);
    let o2 = new TestClsWithMethods();
    Util512.callAsMethodOnClass(
        TestClsWithMethods.name,
        o2,
        'goZ',
        [true, 1],
        false /* okifnotexist*/,
        undefined /* returnifnotexist */,
        false /* ok if parent*/
    );
    assertEq(false, o2.calledAbc);
    assertEq(true, o2.calledZ);
    // minification needs to preserve names
    assertEq('TestClsWithMethods', o1.constructor.name);
});
t.test('callAsMethod.child', () => {
    let o1 = new TestClsWithMethodsChild();
    const ret = Util512.callAsMethodOnClass(
        TestClsWithMethodsChild.name,
        o1,
        'goMethodOnChild',
        [false, 0],
        true /* okifnotexist*/,
        'fallback' /* returnifnotexist */,
        false /* ok if parent*/
    );
    assertEq(false, o1.calledAbc);
    assertEq(false, o1.calledZ);
    assertEq(true, o1.calledMethodOnChild);
    assertEq(undefined, ret);

    let o2 = new TestClsWithMethodsChild();
    assertThrows('', () =>
        Util512.callAsMethodOnClass(
            TestClsWithMethodsChild.name,
            o2,
            'goAbc',
            [true, 1],
            true /* okifnotexist*/,
            'fallback' /* returnifnotexist */,
            false /* ok if parent*/
        )
    );
    Util512.callAsMethodOnClass(
        TestClsWithMethodsChild.name,
        o2,
        'goAbc',
        [true, 1],
        false /* okifnotexist*/,
        undefined /* returnifnotexist */,
        true /* ok if parent*/
    );
    assertEq(true, o2.calledAbc);
    assertEq(false, o2.calledZ);
    assertEq(false, o2.calledMethodOnChild);
    // minification needs to preserve names
    assertEq('TestClsWithMethodsChild', o1.constructor.name);
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
    assertEq(
        'fallback',
        Util512.callAsMethodOnClass(
            TestClsWithMethods.name,
            o,
            'notExist',
            [true, 1],
            true,
            'fallback'
        )
    );
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    assertEq([], sorted(Util512.getMapVals(cls0 as any)));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    assertEq([true], sorted(Util512.getMapVals(cls1 as any)));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    assertEq([false, true], sorted(Util512.getMapVals(cls2 as any)));
});
t.test('padStart', () => {
    // test with numbers
    assertEq('123', Util512.padStart(123, 2, '0'));
    assertEq('123', Util512.padStart(123, 3, '0'));
    assertEq('0123', Util512.padStart(123, 4, '0'));
    assertEq('00123', Util512.padStart(123, 5, '0'));
    // test with strings
    assertEq('123', Util512.padStart('123', 2, '0'));
    assertEq('123', Util512.padStart('123', 3, '0'));
    assertEq('0123', Util512.padStart('123', 4, '0'));
});
t.test('arrayToBase64.arrayOfNumbers', () => {
    let nums: number[] = ldSplit('hello', '').map((x: string) => x.charCodeAt(0));
    assertEq('aGVsbG8=', Util512.arrayToBase64(nums));
});
t.test('arrayToBase64.Uint8Array', () => {
    let nums: number[] = ldSplit('hello', '').map((x: string) => x.charCodeAt(0));
    let uint8 = new Uint8Array(nums);
    assertEq('aGVsbG8=', Util512.arrayToBase64(uint8));
});
t.test('arrayToBase64.ArrayBuffer', () => {
    let nums: number[] = ldSplit('hello', '').map((x: string) => x.charCodeAt(0));
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
    // better than the Array.prototype.map.call trick.
    assertEq([], ldSplit('', ''));
    assertEq(['a'], ldSplit('a', ''));
    assertEq(['a', 'b', ' ', 'c', 'd'], ldSplit('ab cd', ''));
    assertEq(
        [97, 98, 32, 99, 100],
        ldSplit('ab cd', '').map(c => c.charCodeAt(0))
    );
});
t.test('sortDecorated', () => {
    class MyClass {
        constructor(public a: string) {}
    }

    // test typical usage
    let input: string[] = ['abc', 'dba', 'aab', 'ffd'];
    let ret = ldSortBy(input, s => s.charAt(2));
    assertEq('dba;aab;abc;ffd', ret.join(';'));

    // test with class
    let inputCl = [new MyClass('bb'), new MyClass('aa'), new MyClass('cc')];
    let retCl = ldSortBy(inputCl, o => o.a);
    assertEq('aa;bb;cc', retCl.map(o => o.a).join(';'));

    // test with class and ties
    inputCl = [new MyClass('bb'), new MyClass('aa'), new MyClass('bb')];
    retCl = ldSortBy(inputCl, o => o.a);
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
t.test('keepOnlyUnique', () => {
    assertEq([], Util512.keepOnlyUnique([]));
    assertEq(['1'], Util512.keepOnlyUnique(['1']));
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '3']));
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '2', '3']));
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '3', '3']));
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '2', '3', '2']));
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '2', '3', '3']));
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '3', '2', '3']));
    assertEq(
        ['11', '12', '13', '14', '15'],
        Util512.keepOnlyUnique(['11', '12', '13', '14', '15', '15'])
    );
});
t.test('mapValuesDeep', () => {
    assertEq(
        {},
        Util512.mapValuesDeep({}, v => (v as number) + 1)
    );
    assertEq(
        { a: 2 },
        Util512.mapValuesDeep({ a: 1 }, v => (v as number) + 1)
    );
    assertEq(
        { a: 2, b: { c: 3, d: 4 } },
        Util512.mapValuesDeep({ a: 1, b: { c: 2, d: 3 } }, v => (v as number) + 1)
    );
    assertEq(
        { a: 2, b: { c: 3, d: [4, 5] } },
        Util512.mapValuesDeep({ a: 1, b: { c: 2, d: [3, 4] } }, v => (v as number) + 1)
    );

    const ignoreObj = new TestClsOne();
    assertEq(
        { a: 2, b: { c: 3, d: ignoreObj } },
        Util512.mapValuesDeep({ a: 1, b: { c: 2, d: ignoreObj } }, v => (v as number) + 1)
    );
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

/**
 * test-only code.
 */
class TestClsWithMethodsChild extends TestClsWithMethods {
    calledMethodOnChild = false;
    goMethodOnChild(p1: boolean, p2: number) {
        assertEq(false, p1);
        assertEq(0, p2);
        this.calledMethodOnChild = true;
    }
}
