
import { bool, O } from './../util/util512Base';
import { assertTrue, ensureIsError } from './../util/util512Assert';
import { Util512, ValHolder, arLast, assertEq, cast, findStrToEnum, fitIntoInclusive, getEnumToStrOrFallback, getStrToEnum, longstr, slength, sortConsistentType, checkThrowEq, LockableArr, listEnumValsIncludingAlternates, listEnumVals, findEnumToStr, getEnumToStr, castVerifyIsNum, castVerifyIsStr, getShapeRecurse } from './../util/util512';
import { SimpleUtil512TestCollection, assertThrows, sorted, t } from './testHelpers';
import {expectTypeOf} from 'expect-type'
import {sortBy as ldSortBy, clone as ldClone, sum as ldSum, 
    split as ldSplit, isEqual as ldIsEqual, isPlainObject as ldIsPlainObject, isObject as ldIsObject, 
    isArray as ldIsArray, range as ldRange, last as ldLast, padStart as ldPadStart, map as ldMap, mapValues as ldMapValues} from 'lodash';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

t.setCurrentLabel('testCollectionUtil512');
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
t.test('listEnumVals, listEnumValsIncludingAlternates', () => {
    assertEq('__isUI512Enum, __UI512EnumCapitalize, First, Second, Third, TheFirst, Scnd, Thd', listEnumValsIncludingAlternates(TestEnum))
    assertEq('__isUI512Enum, EOne, ETwo, EThree', listEnumValsIncludingAlternates(TestSimpleEnum))
    assertEq(', first, second, third', listEnumVals(TestEnum, true))
    assertEq(', First, Second, Third', listEnumVals(TestEnum, false))
    assertEq(', eone, etwo, ethree', listEnumVals(TestSimpleEnum, true))
    assertEq(', EOne, ETwo, EThree', listEnumVals(TestSimpleEnum, false))
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
    assertEq("first", findEnumToStr(TestEnum, TestEnum.__AlternateForm__TheFirst));
    assertEq("first", findEnumToStr(TestEnum, TestEnum.First));
    assertEq("first", findEnumToStr(TestEnum, 2));
    assertEq("second", findEnumToStr(TestEnum, 3));
    // not found
    assertEq(undefined, findEnumToStr(TestEnum, -1));
    assertEq(undefined, findEnumToStr(TestEnum, 999));
    assertEq(undefined, findEnumToStr(TestEnum, 1)); // flag should not be visible
});
t.test('getEnumToStr, standard usage', () => {
    // test typing inference
    expectTypeOf(getEnumToStr(TestEnum, 2)).toEqualTypeOf('');
    // found
    assertEq("first", getEnumToStr(TestEnum, TestEnum.__AlternateForm__TheFirst));
    assertEq("first", getEnumToStr(TestEnum, TestEnum.First));
    assertEq("first", getEnumToStr(TestEnum, 2));
    assertEq("second", getEnumToStr(TestEnum, 3));
    // not found
    assertThrows('Not a valid', ()=>getEnumToStr(TestEnum, -1));
    assertThrows('Not a valid', ()=>getEnumToStr(TestEnum, 999));
    assertThrows('Not a valid', ()=>getEnumToStr(TestEnum, 1)); // flag should not be visible
});
t.test('getEnumToStrOrFallback, standard usage', () => {
    // test typing inference
    expectTypeOf(getEnumToStrOrFallback(TestEnum, 1)).toEqualTypeOf('');
    // found
    assertEq("first", getEnumToStrOrFallback(TestEnum, TestEnum.First));
    assertEq("first", getEnumToStrOrFallback(TestEnum, 2));
    assertEq("second", getEnumToStrOrFallback(TestEnum, 3));
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

t.test('getStrToEnum ShowValuesInExceptionMsg', () => {
    let errFound = assertThrows('', ()=>getStrToEnum(TestEnum, 'TestEnum', '-nonexist-'))
    let excMessage: string = errFound.toString();

    let pts = sortedConsistentType(excMessage.split(','));
    assertEq(` first`, pts[0]);
    assertEq(` second`, pts[1]);
    assertEq(` third`, pts[2]);
    assertTrue(excMessage.includes(`Not a valid choice of TestEnum. try one of`));
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
t.test('getShapeRecurse', () => {
    assertEq('null', getShapeRecurse(null));
    assertEq('undefined', getShapeRecurse(undefined));
    assertEq([], getShapeRecurse([]));
    assertEq({ a: 'string'}, getShapeRecurse({ a: 'a'}));
    assertEq({ a: 'string', b:'number'}, getShapeRecurse({ a: 'a', b:1}));
    assertEq(['number', 'number'], getShapeRecurse([1, 2]));
    assertEq({}, getShapeRecurse({}));
    assertEq({ a: {b: 'number', c: 'string'}}, getShapeRecurse({ a: {b: 1, c: 'abc'} }));
});
t.test('sortConsistentType.String', () => {
    const arr = sortedConsistentType(['', 'a', 'abc', 'abb', 'abcd'])
    assertEq(',a,abb,abc,abcd', arr.join(','))
});
t.test('sortConsistentType.StringWithNonAscii', () => {
    const arr = sortedConsistentType([
        'accented\u0065\u0301letter',
'aunicode\u2666char', 'aunicode\u2667char', 'accented\u00e9letter',
'accented\u0065\u0301letter', 
    ])
    assertEq('accentedéletter,accentedéletter,accentedéletter,aunicode♦char,aunicode♧char', arr.join(','))
});
t.test('sortConsistentType.Number', () => {
    const arr = sortedConsistentType([
        0, 1, 12345, -11.15, 1.4, 1.3, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY
    ])
    assertEq('-Infinity,-11.15,0,1,1.3,1.4,12345,Infinity', arr.map(String).join(','));
});
t.test('sortConsistentType.Nullish', () => {
    assertEq([undefined, undefined], sortedConsistentType([undefined, undefined]));
    assertEq([null, null], sortedConsistentType([null, null]));
    assertThrows('not compare', () => sortedConsistentType([undefined, null]));
});
t.test('sortConsistentType.DiffTypesShouldThrow', () => {
    assertThrows('not compare', () => sortedConsistentType(['a', 1]));
    assertThrows('not compare', () => sortedConsistentType(['a', true]));
    assertThrows('not compare', () => sortedConsistentType(['a', undefined]));
    assertThrows('not compare', () => sortedConsistentType(['a', []]));
});
t.test('sortConsistentType.DiffTypesInArrayShouldThrow', () => {
     const arr = sortedConsistentType([
        ['a', 1], ['b', 2], ['a', 2], ['b', 1]
    ])
    assertEq('a,1,a,2,b,1,b,2', arr.map(String).join(','));
    assertThrows('not compare', () => sortedConsistentType([['a', 1], ['a', 'a']]));
    assertThrows('not compare', () => sortedConsistentType([['a', 1], ['a', true]]));
    assertThrows('not compare', () => sortedConsistentType([['a', 1], ['a', undefined]]));
    assertThrows('not compare', () => sortedConsistentType([['a', 1], ['a', []]]));
});
t.test('sortConsistentType.DiffTypesInObjectShouldThrow', () => {
     const arr = sortedConsistentType([
        {a:1}, {a:2}, {a:0}
    ])
    assertEq("{\"a\":1},{\"a\":2},{\"a\":0}", arr.map((x:any)=>JSON.stringify(x)).join(','));
    assertThrows('not compare', () => sortedConsistentType([{a:1}, {a: 'a'}]));
    assertThrows('not compare', () => sortedConsistentType([{a:1}, {a: true}]));
    assertThrows('not compare', () => sortedConsistentType([{a:1}, {a: undefined}]));
    assertThrows('not compare', () => sortedConsistentType([{a:1}, {a: []}]));
});
t.test('sortConsistentType.DifferentLength', () => {
    assertThrows('not compare', () => sortedConsistentType([[1,2], [1,2,3]]));
    assertThrows('not compare', () => sortedConsistentType([{a:1}, {a:1, b:2}]));
});
t.test('sortConsistentType.maps and stability', () => {
    const arrArrs = [
        ['a', 1], ['b', 2], ['a', 2], ['b', 1]
    ]
    assertEq('a,1,a,2,b,1,b,2', sortedConsistentType(arrArrs).map(String).join(','));
    // intentionally not a pretty order, because it's a stable sort
    assertEq('a,1,a,2,b,2,b,1', sortedConsistentType(arrArrs, (x:any) => x[0]).map(String).join(','));
    assertEq('a,1,b,1,b,2,a,2', sortedConsistentType(arrArrs, (x:any) => x[1]).map(String).join(','));
    const arr = [
        {a:3, b:1}, {a:2, b:3}, {a:1, b:3}, 
    ]
    assertEq('{\"a\":3,\"b\":1},{\"a\":2,\"b\":3},{\"a\":1,\"b\":3}', sortedConsistentType(arr).map((x:any)=>JSON.stringify(x)).join(','));
    assertEq('{\"a\":1,\"b\":3},{\"a\":2,\"b\":3},{\"a\":3,\"b\":1}', sortedConsistentType(arr, (x:any) => x.a).map((x:any)=>JSON.stringify(x)).join(','));
    assertEq('{\"a\":3,\"b\":1},{\"a\":2,\"b\":3},{\"a\":1,\"b\":3}', sortedConsistentType(arr, (x:any) => x.b).map((x:any)=>JSON.stringify(x)).join(','));
});

t.test('checkThrowEq', () => {
    checkThrowEq(1, 1);
    checkThrowEq('abc', 'abc');
    checkThrowEq({a:'abc', b:1}, {a:'abc', b:1}, 'abc');
    checkThrowEq({a:'abc', b:{c:1}}, {a:'abc', b:{c:1}}, 'abc');
    assertThrows('but got', () => {
        checkThrowEq({a:'abc', b:{c:1}}, {a:'abc', b:{c:2}}, 'abc');
    });
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
    assertThrows('empty', ()=>arLast([]));
    assertEq(3, ldLast([1, 2, 3]));
    assertEq(1, ldLast([1]));
    assertEq(undefined, ldLast([]));
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
t.test('assertEq corner cases', () => {
    assertEq(null, null);
    assertEq(undefined, undefined);
    // interestingly, lsIsEqual says null equals undefined,
    // let that be for now,
    assertEq([1,2,3], [1,2,3]);
    assertThrows('but got', () => {
    assertEq([1,2,3], [1,2,4]);
    })
    assertEq([1,2,{a:4}], [1,2,{a:4}]);
    assertThrows('but got', () => {
    assertEq([1,2,{a:4}], [1,2,{a:5}]);
    })
})
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
 * sorting helper for tests, space inefficent because it's not in-place
 */
function sortedConsistentType(arr: unknown[], mapper=(x:unknown)=>x): unknown[] {
   let copy = ldClone(arr) 
   copy = sortConsistentType(copy, mapper);
   assertTrue(Array.isArray(copy));
    return copy
}

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

