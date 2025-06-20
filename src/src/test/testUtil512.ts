
/* auto */ import { bool } from './../util/util512Base';
/* auto */ import { assertTrue, ensureIsError } from './../util/util512Assert';
/* auto */ import { MapKeyToObjectCanSet, OrderedHash, Util512, ValHolder, arLast, assertEq, cast, findStrToEnum, fitIntoInclusive, getEnumToStrOrFallback, getStrToEnum, longstr, slength, util512Sort, checkThrowEq } from './../util/util512';
/* auto */ import { SimpleUtil512TestCollection, assertThrows, sorted } from './testUtils';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

let t = new SimpleUtil512TestCollection('testCollectionUtil512');
export let testCollectionUtil512 = t;

t.test('class methods can be called via this', () => {
    class ExampleClass {
        static method1() {
            return this.method2();
        }
        static method2() {
            return 'abc';
        }
    }
    assertEq('abc', ExampleClass.method1(), '');
});

t.test('ValHolder.param', () => {
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
t.test('findStrToEnum.FoundPrimary', () => {
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'First'));
    assertEq(TestEnum.Second, findStrToEnum(TestEnum, 'Second'));
    assertEq(TestEnum.Third, findStrToEnum(TestEnum, 'Third'));
});
t.test('findStrToEnum.NotFound', () => {
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
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateFormScnd'));
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateFormFoo'));
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateFormTheFirst'));
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateFormScnd'));
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateFormFoo'));
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm__TheFirst'));
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm__Scnd'));
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm__Foo'));
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateForm'));
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm'));
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm__'));
});
t.test('findStrToEnum.FirstLetterCaseInsensitive', () => {
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'First'));
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'first'));
    assertEq(undefined, findStrToEnum(TestEnum, 'firsT'));
    assertEq(undefined, findStrToEnum(TestEnum, 'FirsT'));
    assertEq(undefined, findStrToEnum(TestEnum, 'First '));
    assertEq(undefined, findStrToEnum(TestEnum, 'Firstf'));
    assertEq(undefined, findStrToEnum(TestEnum, 'Firs'));
});
t.test('findStrToEnum.UseAlts', () => {
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'First'));
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'TheFirst'));
    assertEq(TestEnum.Second, findStrToEnum(TestEnum, 'Scnd'));
    assertEq(TestEnum.Third, findStrToEnum(TestEnum, 'Thd'));
});
t.test('getEnumToStr.FoundPrimary', () => {
    assertEq('first', getEnumToStrOrFallback(TestEnum, TestEnum.First));
    assertEq('second', getEnumToStrOrFallback(TestEnum, TestEnum.Second));
    assertEq('third', getEnumToStrOrFallback(TestEnum, TestEnum.Third));
});
t.test('getEnumToStr.AlternatesHaveSameVal', () => {
    assertEq(
        'first',
        getEnumToStrOrFallback(TestEnum, TestEnum.__AlternateForm__TheFirst)
    );
    assertEq('second', getEnumToStrOrFallback(TestEnum, TestEnum.__AlternateForm__Scnd));
    assertEq('third', getEnumToStrOrFallback(TestEnum, TestEnum.__AlternateForm__Thd));
});
t.test('getEnumToStr.NotFound', () => {
    assertEq('Unknown', getEnumToStrOrFallback(TestEnum, -1));
    assertEq('Unknown', getEnumToStrOrFallback(TestEnum, 999));
});
t.test('getEnumToStr.ShouldNotBeAbleToAccessFlags', () => {
    assertEq('Unknown', getEnumToStrOrFallback(TestEnum, TestEnum.__isUI512Enum));
    assertEq('Unknown', getEnumToStrOrFallback(TestEnum, TestEnum.__UI512EnumCapitalize));
});
t.test('getStrToEnum.HasExpectedReturnType', () => {
    /* check that the return value is the correct type.
    unfortunately this seems to require manually entering the type
    as a parameter, in the redundant form getStrToEnum<TestEnum>(TestEnum) */
    function takesEnumVal(__unused_v: TestEnum) {}
    let r = getStrToEnum<TestEnum>(TestEnum, 'TestEnum', 'First');
    takesEnumVal(r);
});
t.test('getStrToEnum.FoundPrimary', () => {
    assertEq(TestEnum.First, getStrToEnum(TestEnum, 'TestEnum', 'First'));
    assertEq(TestEnum.Second, getStrToEnum(TestEnum, 'TestEnum', 'Second'));
    assertEq(TestEnum.Third, getStrToEnum(TestEnum, 'TestEnum', 'Third'));
});
t.test('getStrToEnum.ShowValuesInExceptionMsg', () => {
    let excMessage = '';
    try {
        getStrToEnum(TestEnum, 'TestEnum', 'Firstf');
    } catch (e) {
        ensureIsError(e);
        excMessage = e.toString();
    }

    let pts = excMessage.split(',');
    pts.sort(util512Sort);
    assertEq(` first`, pts[0]);
    assertEq(` second`, pts[1]);
    assertEq(` third (4E)`, pts[2]);
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
t.test('isString', () => {
    assertTrue(typeof '' === 'string');
    assertTrue(typeof 'abc' === 'string');
    assertTrue(typeof String('abc') === 'string');
    assertTrue(typeof 123 !== 'string');
    assertTrue(typeof null !== 'string');
    assertTrue(typeof undefined !== 'string');
    assertTrue(typeof ['a'] !== 'string');
    /* ok to disable the warning, intentionally making a Object-style-string.
    we now assume that these will never occur, so it's ok that
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
    assertEq(0, util512Sort('', ''));
    assertEq(0, util512Sort('a', 'a'));
    assertEq(1, util512Sort('abc', 'abb'));
    assertEq(-1, util512Sort('abb', 'abc'));
    assertEq(1, util512Sort('abcd', 'abc'));
    assertEq(-1, util512Sort('abc', 'abcd'));
});
t.test('util512Sort.StringWithNonAscii', () => {
    assertEq(0, util512Sort('aunicode\u2666char', 'aunicode\u2666char'));
    assertEq(1, util512Sort('aunicode\u2667char', 'aunicode\u2666char'));
    assertEq(-1, util512Sort('aunicode\u2666char', 'aunicode\u2667char'));
    assertEq(0, util512Sort('accented\u00e9letter', 'accented\u00e9letter'));
    assertEq(1, util512Sort('accented\u00e9letter', 'accented\u0065\u0301letter'));
    assertEq(-1, util512Sort('accented\u0065\u0301letter', 'accented\u00e9letter'));
});
t.test('util512Sort.Bool', () => {
    assertEq(0, util512Sort(false, false));
    assertEq(0, util512Sort(true, true));
    assertEq(1, util512Sort(true, false));
    assertEq(-1, util512Sort(false, true));
});
t.test('util512Sort.Number', () => {
    assertEq(0, util512Sort(0, 0));
    assertEq(0, util512Sort(1, 1));
    assertEq(0, util512Sort(12345, 12345));
    assertEq(0, util512Sort(-11.15, -11.15));
    assertEq(-1, util512Sort(0, 1));
    assertEq(1, util512Sort(1, 0));
    assertEq(1, util512Sort(1.4, 1.3));
    assertEq(1, util512Sort(0, -1));
    assertEq(1, util512Sort(Number.POSITIVE_INFINITY, 12345));
    assertEq(-1, util512Sort(Number.NEGATIVE_INFINITY, -12345));
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
t.test('forOf', () => {
    let ar = [11, 22, 33];
    let result: number[] = [];
    for (let item of ar) {
        result.push(item);
    }

    assertEq([11, 22, 33], result);
});
t.test('forOfEmpty', () => {
    let ar: number[] = [];
    let result: number[] = [];
    for (let item of ar) {
        result.push(item);
    }

    assertEq([], result);
});
t.test('forOfGenerator', () => {
    function* myGenerator() {
        yield 10;
        yield 20;
        yield 30;
        yield 40;
    }

    let result: number[] = [];
    for (let item of myGenerator()) {
        result.push(item);
    }

    assertEq([10, 20, 30, 40], result);
});
t.test('OrderedHash.IterKeys', () => {
    let h = new OrderedHash<number>();
    h.insertNew('ccc', 30);
    h.insertNew('ccb', 29);
    h.insertNew('cca', 28);
    let result: string[] = [];
    for (let item of h.iterKeys()) {
        result.push(item);
    }

    assertEq(['ccc', 'ccb', 'cca'], result);
});
t.test('OrderedHash.IterVals', () => {
    let h = new OrderedHash<number>();
    h.insertNew('ccc', 30);
    h.insertNew('ccb', 29);
    h.insertNew('cca', 28);
    let result: number[] = [];
    for (let item of h.iter()) {
        result.push(item);
    }

    assertEq([30, 29, 28], result);
});
t.test('OrderedHash.IterReversed', () => {
    let h = new OrderedHash<number>();
    h.insertNew('ccc', 30);
    h.insertNew('ccb', 29);
    h.insertNew('cca', 28);
    let result: number[] = [];
    for (let item of h.iterReversed()) {
        result.push(item);
    }

    assertEq([28, 29, 30], result);
});
t.test('MapKeyToObjectCanSet', () => {
    let o = new MapKeyToObjectCanSet<number>();
    o.add('five', 5);
    o.add('six', 6);
    t.say(/*——————————*/ 'exists');
    assertTrue(o.exists('five'));
    assertTrue(o.exists('six'));
    assertTrue(!o.exists('seven'));
    assertTrue(!o.exists(''));
    t.say(/*——————————*/ 'get');
    assertEq(5, o.get('five'));
    assertEq(6, o.get('six'));
    assertThrows('not found', () => {
        o.get('seven');
    });
    assertThrows('not found', () => {
        o.get('');
    });
    t.say(/*——————————*/ 'find');
    assertEq(5, o.find('five'));
    assertEq(6, o.find('six'));
    assertEq(undefined, o.find('seven'));
    assertEq(undefined, o.find(''));
    t.say(/*——————————*/ 'getKeys');
    assertEq(['five', 'six'], sorted(o.getKeys()));
    assertEq([5, 6], sorted(o.getVals()));
    t.say(/*——————————*/ 'remove');
    o.remove('five');
    assertEq(undefined, o.find('five'));
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
 * test-only enum
 */
enum TestEnum {
    __isUI512Enum = 1,
    __UI512EnumCapitalize,
    First,
    Second,
    Third,
    __AlternateForm__TheFirst = First,
    __AlternateForm__Scnd = Second,
    __AlternateForm__Thd = Third
}
