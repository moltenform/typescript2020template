
/* auto */ import { bool, O } from './../util/util512Base';
/* auto */ import { assertTrue, ensureIsError } from './../util/util512Assert';
/* auto */ import { MapKeyToObjectCanSet, OrderedHash, Util512, ValHolder, arLast, assertEq, cast, findStrToEnum, fitIntoInclusive, getEnumToStrOrFallback, getStrToEnum, longstr, slength, util512Sort, checkThrowEq, LockableArr, listEnumValsIncludingAlternates, listEnumVals, findEnumToStr, getEnumToStr, castVerifyIsNum, castVerifyIsStr } from './../util/util512';
/* auto */ import { SimpleUtil512TestCollection, assertThrows, sorted } from './testUtils';
import {expectTypeOf} from 'expect-type'
import _ from 'lodash';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

let t = new SimpleUtil512TestCollection('testCollectionUtil512');
export let testCollectionUtil512 = t;

t.test('LockableArr', () => {
    // test standard use
    let ar = new LockableArr<number>();
    ar.set(0, 55);
    ar.set(1, 56);
    assertEq(55, ar.at(0));
    assertEq(56, ar.at(1));
    assertEq(2, ar.len());
    ar.lock();
    assertThrows('locked', () => {
        ar.set(1, 57);
    });
    // test changing the copy won't change original
    let copy = ar.getUnlockedCopy();
    assertEq(55, copy.at(0));
    assertEq(56, copy.at(1));
    assertEq(2, copy.len());
    copy.set(1, 57);
    assertEq(57, copy.at(1));
    assertEq(56, ar.at(1));
    // ok to lock twice
    ar.lock() 
    // corner cases
    assertEq(undefined, ar.at(100));
    let emptyAr = new LockableArr<number>();
    assertEq(0, emptyAr.len());    
    let emptyArCopy = emptyAr.getUnlockedCopy();
    assertEq(0, emptyArCopy.len());
});

t.test('ValHolder as an out param', () => {
    function increment(vv: ValHolder<number>) {
        vv.val += 1;
    }

    let v = new ValHolder(0);
    increment(v);
    assertEq(1, v.val);
});
t.test('ValHolder.closure', () => {
    function increment() {
        v.val += 1;
    }

    let v = new ValHolder(0);
    increment();
    assertEq(1, v.val);
});
t.test('listEnumValsIncludingAlternates', () => {
    assertEq('xxx', listEnumValsIncludingAlternates(TestEnum))
    assertEq('xxx', listEnumValsIncludingAlternates(TestSimpleEnum))
    assertEq('xxx', listEnumVals(TestEnum, true))
    assertEq('xxx', listEnumVals(TestEnum, false))
    assertEq('xxx', listEnumVals(TestSimpleEnum, true))
    assertEq('xxx', listEnumVals(TestSimpleEnum, false))
})
t.test('findStrToEnum, standard usage', () => {
    // test typing inference
    expectTypeOf(findStrToEnum(TestEnum, 'First')).toEqualTypeOf(TestEnum);
    // found primary
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'First'));
    assertEq(TestEnum.Second, findStrToEnum(TestEnum, 'Second'));
    assertEq(TestEnum.Third, findStrToEnum(TestEnum, 'Third'));
    // not found
    assertEq(undefined, findStrToEnum(TestEnum, ''));
    assertEq(undefined, findStrToEnum(TestEnum, 'F'));
    assertEq(undefined, findStrToEnum(TestEnum, 'Firstf'));
});
t.test('findStrToEnum.YouShouldNotBeAbleToAccessFlags', () => {
    assertEq(undefined, findStrToEnum(TestEnum, '__isUI512Enum'));
    assertEq(undefined, findStrToEnum(TestEnum, '__UI512EnumCapitalize'));
    assertEq(undefined, findStrToEnum(TestEnum, '__foo'));
});
t.test('findStrToEnum.YouShouldNotBeAbleToDirectlyAccessAlts', () => {
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateFormTheFirst'));
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateFormFoo'));
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm__TheFirst'));
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm__Foo'));
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateForm'));
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm__'));
});
t.test('findStrToEnum.capitalizes first letter', () => {
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'First'));
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'first'));
    assertEq(undefined, findStrToEnum(TestEnum, 'firsT'));
    assertEq(undefined, findStrToEnum(TestEnum, 'FirsT'));
    assertEq(undefined, findStrToEnum(TestEnum, 'First '));
});
t.test('findStrToEnum.Use alternate forms to retrieve', () => {
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'First'));
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'TheFirst'));
    assertEq(TestEnum.Second, findStrToEnum(TestEnum, 'Scnd'));
    assertEq(TestEnum.Third, findStrToEnum(TestEnum, 'Thd'));
});

t.test('getStrToEnum, standard usage', () => {
    // test typing inference
    expectTypeOf(getStrToEnum(TestEnum, 'context', 'First')).toEqualTypeOf(TestEnum);
    // found
    assertEq(TestEnum.First, getStrToEnum(TestEnum, 'context',  'First'));
    assertEq(TestEnum.First, getStrToEnum(TestEnum, 'context',  'TheFirst'));
    assertEq(TestEnum.Second, getStrToEnum(TestEnum, 'context',  'Second'));
    // not found
    assertThrows('Not a valid choice', () => getStrToEnum(TestEnum, 'context',  ''));
    assertThrows('Not a valid choice', () => getStrToEnum(TestEnum, 'context',  'F'));
    assertThrows('Not a valid choice', () => getStrToEnum(TestEnum, 'context',  'Firstf'));
});
t.test('findEnumToStr, standard usage', () => {
    // test typing inference
    expectTypeOf(findEnumToStr(TestEnum, 1)).toEqualTypeOf('');
    // found
    assertEq("first", findEnumToStr(TestEnum, TestEnum.First));
    assertEq("first", findEnumToStr(TestEnum, 1));
    assertEq("second", findEnumToStr(TestEnum, 2));
    // not found
    assertEq(undefined, findEnumToStr(TestEnum, -1));
    assertEq(undefined, findEnumToStr(TestEnum, 999));
    assertEq(undefined, findEnumToStr(TestEnum, 1)); // flag should not be visible
});
t.test('getEnumToStr, standard usage', () => {
    // test typing inference
    expectTypeOf(getEnumToStr(TestEnum, 1)).toEqualTypeOf('');
    // found
    assertEq("first", getEnumToStr(TestEnum, TestEnum.First));
    assertEq("first", getEnumToStr(TestEnum, 1));
    assertEq("second", getEnumToStr(TestEnum, 2));
    // not found
    assertEq(undefined, getEnumToStr(TestEnum, -1));
    assertEq(undefined, getEnumToStr(TestEnum, 999));
    assertEq(undefined, getEnumToStr(TestEnum, 1)); // flag should not be visible
});
t.test('getEnumToStrOrFallback, standard usage', () => {
    // test typing inference
    expectTypeOf(getEnumToStrOrFallback(TestEnum, 1)).toEqualTypeOf('');
    // found
    assertEq("first", getEnumToStrOrFallback(TestEnum, TestEnum.First));
    assertEq("first", getEnumToStrOrFallback(TestEnum, 1));
    assertEq("second", getEnumToStrOrFallback(TestEnum, 2));
    // not found
    assertEq('fallback', getEnumToStrOrFallback(TestEnum, -1, 'fallback'));
    assertEq('fallback', getEnumToStrOrFallback(TestEnum, 999, 'fallback'));
    assertEq('fallback', getEnumToStrOrFallback(TestEnum, 1, 'fallback')); // flag should not be visible
});
t.test('test enum values', () => {
    assertEq(1, TestEnum.__isUI512Enum);
    assertEq(1, TestEnum.__UI512EnumCapitalize);
    assertEq(TestEnum.__AlternateForm__TheFirst, TestEnum.First);
    assertEq(TestEnum.__AlternateForm__Scnd, TestEnum.Second);
    assertTrue(TestEnum.First as number !== TestEnum.Second as number);
})

t.test('ShowValuesInExceptionMsg', () => {
    let excMessage = '';
    try {
        getStrToEnum(TestEnum, 'TestEnum', '-nonexist-');
    } catch (e) {
        ensureIsError(e);
        excMessage = e.toString();
    }

    let pts = excMessage.split(',');
    pts.sort(util512Sort);
    assertEq(` first`, pts[0]);
    assertEq(` second`, pts[1]);
    assertEq(` third`, pts[2]);
    assertTrue(pts[3].endsWith(`Not a valid choice of TestEnum. try one of`));
});
t.test('slength', () => {
    assertEq(0, slength(null));
    assertEq(0, slength(undefined));
    assertEq(0, slength(''));
    assertEq(3, slength('abc'));
});
t.test('cast', () => {
    class Parent {
        public a() {
            return 'parent';
        }
    }
    class Child extends Parent {
        public override a() {
            return 'child';
        }
    }
    class Other {
        public a() {
            return 'other';
        }
    }

    let o1: unknown = new Parent();
    assertEq('parent', cast(Parent, o1).a());
    o1 = new Child();
    assertEq('child', cast(Parent, o1).a());
    o1 = new Other();
    assertThrows('type cast exception|this cast should fail', () => {
        cast(Parent, o1);
    });
});
t.test('castVerifyIsNum and castVerifyIsStr', () => {
    assertEq(1, castVerifyIsNum(1));
    assertThrows('type cast exception', () => {
        castVerifyIsNum(null);
    });
    assertThrows('type cast exception', () => {
        castVerifyIsNum(undefined);
    });
    assertThrows('type cast exception', () => {
        castVerifyIsNum('abc');
    });
    assertEq('abc', castVerifyIsStr('abc'));
    assertThrows('type cast exception', () => {
        castVerifyIsStr(null);
    });
    assertThrows('type cast exception', () => {
        castVerifyIsStr(undefined);
    });
    assertThrows('type cast exception', () => {
        castVerifyIsStr(123);
    });
})
t.test('isString', () => {
    assertTrue(typeof '' === 'string');
    assertTrue(typeof 'abc' === 'string');
    assertTrue(typeof String('abc') === 'string');
    assertTrue(typeof 123 !== 'string');
    assertTrue(typeof null !== 'string');
    assertTrue(typeof undefined !== 'string');
    assertTrue(typeof ['a'] !== 'string');
    /* intentionally making an unusual Object-style-string.
    We assume that these will never occur, so it's ok that
    they aren't identified as strings. */
    /* eslint-disable-next-line no-new-wrappers */
    assertTrue(typeof new String('abc') !== 'string');
});
t.test('fitIntoInclusive.AlreadyWithin', () => {
    assertEq(1, fitIntoInclusive(1, 1, 1));
    assertEq(1, fitIntoInclusive(1, 1, 3));
    assertEq(2, fitIntoInclusive(2, 1, 3));
    assertEq(3, fitIntoInclusive(3, 1, 3));
});
t.test('fitIntoInclusive.NeedToTruncate', () => {
    assertEq(1, fitIntoInclusive(0, 1, 1));
    assertEq(1, fitIntoInclusive(2, 1, 1));
    assertEq(1, fitIntoInclusive(0, 1, 3));
    assertEq(3, fitIntoInclusive(4, 1, 3));
});
t.test('util512Sort.String', () => {
    const arr = ['', 'a', 'abc', 'abb', 'abcd']
    _.sortBy(arr)
    assertEq('TMMP', arr.join(','))
});
t.test('util512Sort.StringWithNonAscii', () => {
    const arr = [
        'accented\u0065\u0301letter',
'aunicode\u2666char', 'aunicode\u2667char', 'accented\u00e9letter',
'accented\u0065\u0301letter', 
    ]
    assertEq('TMMP', arr.join(','))
});
t.test('util512Sort.Bool', () => {
    const arr = [false, true, false, true]
    _.sortBy(arr)
    assertEq('false,true,false,true', arr.map(String).join(','));
});
t.test('util512Sort.Number', () => {
    const arr = [
        0, 1, 12345, -11.15, 1.4, 1.3, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY
    ]
    _.sortBy(arr)
    assertEq('TMMP', arr.map(String).join(','));
});
t.test('util512Sort.Nullish', () => {
    assertEq(0, util512Sort(undefined, undefined));
    assertEq(0, util512Sort(null, null));
    assertThrows('not compare', () => util512Sort(null, undefined));
    assertThrows('not compare', () => util512Sort(undefined, null));
});
t.test('util512Sort.DiffTypesShouldThrow', () => {
    assertThrows('not compare', () => util512Sort('a', 1));
    assertThrows('not compare', () => util512Sort('a', true));
    assertThrows('not compare', () => util512Sort('a', undefined));
    assertThrows('not compare', () => util512Sort('a', []));
    assertThrows('not compare', () => util512Sort(1, 'a'));
    assertThrows('not compare', () => util512Sort(1, true));
    assertThrows('not compare', () => util512Sort(1, undefined));
    assertThrows('not compare', () => util512Sort(1, []));
    assertThrows('not compare', () => util512Sort(true, 'a'));
    assertThrows('not compare', () => util512Sort(true, 1));
    assertThrows('not compare', () => util512Sort(true, undefined));
    assertThrows('not compare', () => util512Sort(true, []));
    assertThrows('not compare', () => util512Sort(undefined, 'a'));
    assertThrows('not compare', () => util512Sort(undefined, 1));
    assertThrows('not compare', () => util512Sort(undefined, true));
    assertThrows('not compare', () => util512Sort(undefined, []));
    assertThrows('not compare', () => util512Sort([], 'a'));
    assertThrows('not compare', () => util512Sort([], 1));
    assertThrows('not compare', () => util512Sort([], true));
    assertThrows('not compare', () => util512Sort([], undefined));
});
t.test('util512Sort.DiffTypesInArrayShouldThrow', () => {
    assertThrows('not compare', () => util512Sort(['a', 'a'], ['a', 1]));
    assertThrows('not compare', () => util512Sort(['a', 'a'], ['a', true]));
    assertThrows('not compare', () => util512Sort(['a', 'a'], ['a', undefined]));
    assertThrows('not compare', () => util512Sort(['a', 'a'], ['a', []]));
    assertThrows('not compare', () => util512Sort(['a', 1], ['a', 'a']));
    assertThrows('not compare', () => util512Sort(['a', 1], ['a', true]));
    assertThrows('not compare', () => util512Sort(['a', 1], ['a', undefined]));
    assertThrows('not compare', () => util512Sort(['a', 1], ['a', []]));
    assertThrows('not compare', () => util512Sort(['a', true], ['a', 'a']));
    assertThrows('not compare', () => util512Sort(['a', true], ['a', 1]));
    assertThrows('not compare', () => util512Sort(['a', true], ['a', undefined]));
    assertThrows('not compare', () => util512Sort(['a', true], ['a', []]));
    assertThrows('not compare', () => util512Sort(['a', undefined], ['a', 'a']));
    assertThrows('not compare', () => util512Sort(['a', undefined], ['a', 1]));
    assertThrows('not compare', () => util512Sort(['a', undefined], ['a', true]));
    assertThrows('not compare', () => util512Sort(['a', undefined], ['a', []]));
    assertThrows('not compare', () => util512Sort(['a', []], ['a', 'a']));
    assertThrows('not compare', () => util512Sort(['a', []], ['a', 1]));
    assertThrows('not compare', () => util512Sort(['a', []], ['a', true]));
    assertThrows('not compare', () => util512Sort(['a', []], ['a', undefined]));
});
t.test('util512Sort.ArrayThreeElements', () => {
    assertEq(0, util512Sort([5, 'a', 'abcdef'], [5, 'a', 'abcdef']));
    assertEq(1, util512Sort([5, 'a', 'abc'], [5, 'a', 'abb']));
    assertEq(-1, util512Sort([5, 'a', 'abb'], [5, 'a', 'abc']));
});
t.test('util512Sort.ArraySameLength', () => {
    assertEq(0, util512Sort([], []));
    assertEq(0, util512Sort([5, 'a'], [5, 'a']));
    assertEq(1, util512Sort([5, 'a', 7], [5, 'a', 6]));
    assertEq(-1, util512Sort([5, 'a', 6], [5, 'a', 7]));
    assertEq(1, util512Sort([5, 7, 'a'], [5, 6, 'a']));
    assertEq(1, util512Sort([5, 7, 'a', 600], [5, 6, 'a', 700]));
});
t.test('util512Sort.ArrayDifferentLength', () => {
    assertEq(1, util512Sort([1], []));
    assertEq(-1, util512Sort([], [1]));
    assertEq(1, util512Sort([10, 20], [10]));
    assertEq(-1, util512Sort([10], [10, 20]));
});
t.test('util512Sort.ArrayNested', () => {
    assertEq(0, util512Sort([[]], [[]]));
    assertEq(0, util512Sort([[], []], [[], []]));
    assertEq(0, util512Sort([[1, 2], []], [[1, 2], []]));
    assertEq(0, util512Sort([[10, 20], [30]], [[10, 20], [30]]));
    assertEq(1, util512Sort([[10, 20], [30]], [[10, 20], [-30]]));
    assertEq(-1, util512Sort([[10, 20], [-30]], [[10, 20], [30]]));
    assertEq(
        1,
        util512Sort(
            [
                [10, 20],
                [1, 30]
            ],
            [
                [10, 20],
                [1, -30]
            ]
        )
    );
    assertEq(
        -1,
        util512Sort(
            [
                [10, 20],
                [1, -30]
            ],
            [
                [10, 20],
                [1, 30]
            ]
        )
    );
    assertEq(
        1,
        util512Sort(
            [
                [10, 20],
                [30, 31]
            ],
            [[10, 20], [30]]
        )
    );
    assertEq(
        -1,
        util512Sort(
            [[10, 20], [30]],
            [
                [10, 20],
                [30, 31]
            ]
        )
    );
    assertEq(0, util512Sort([[10, 20], 50, [30]], [[10, 20], 50, [30]]));
    assertEq(1, util512Sort([[10, 20], 60, [30]], [[10, 20], 50, [30]]));
    assertEq(-1, util512Sort([[10, 20], 50, [30]], [[10, 20], 60, [30]]));
});

t.test('checkThrowEq', () => {
    checkThrowEq(1, 1);
    checkThrowEq('abc', 'abc');
    assertThrows('but got', () => {
        checkThrowEq(1, 2);
    });
    assertThrows('but got', () => {
        checkThrowEq('abc', 'ABC');
    });
});
t.test('last', () => {
    assertEq(3, arLast([1, 2, 3]));
    assertEq(1, arLast([1]));
});
t.test('bool', () => {
    assertEq(true, bool(true));
    assertEq(true, bool(['abc']));
    assertEq(true, bool('abc'));
    assertEq(true, bool(123));
    assertEq(false, bool(false));
    assertEq(false, bool(''));
    assertEq(false, bool(0));
    assertEq(true, bool([]));
    assertEq(false, bool(null));
    assertEq(false, bool(undefined));
    assertEq(false, bool(NaN));
});
t.test('longstr', () => {
    let s = longstr(`a long
        string across
        a few lines`);
    assertEq('a long string across a few lines', s);
    s = `a long
    string across
    a few lines`;
    let sUnix = Util512.normalizeNewlines(s);
    assertEq('a long string across a few lines', longstr(sUnix));
    let sWindows = Util512.normalizeNewlines(s).replace(/\n/g, '\r\n');
    assertEq('a long string across a few lines', longstr(sWindows));
});

/**
 * test-only enum.
 * do our tests on numeric enums because
 * the that's what our legacy code uses, string enums are
 * better especially when persisting to disk.
 */
enum TestEnum {
    __isUI512Enum = 1,
    __UI512EnumCapitalize = 1, // don't disrupt order
    First,
    Second,
    Third,
    __AlternateForm__TheFirst = First,
    __AlternateForm__Scnd = Second,
    __AlternateForm__Thd = Third
}

/**
 * test-only enum
 */
enum TestSimpleEnum {
    __isUI512Enum = 1,
    EOne,
    ETwo,
    EThree
}

