
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
    assertEq(1, v.val, 'NR|');
});
t.test('ValHolder.closure', () => {
    function increment() {
        v.val += 1;
    }

    let v = new ValHolder(0);
    increment();
    assertEq(1, v.val, 'NQ|');
});
t.test('findStrToEnum.FoundPrimary', () => {
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'First'), 'Dz|');
    assertEq(TestEnum.Second, findStrToEnum(TestEnum, 'Second'), 'Dy|');
    assertEq(TestEnum.Third, findStrToEnum(TestEnum, 'Third'), 'Dx|');
});
t.test('findStrToEnum.NotFound', () => {
    assertEq(undefined, findStrToEnum(TestEnum, ''), 'Dw|');
    assertEq(undefined, findStrToEnum(TestEnum, 'F'), 'Dv|');
    assertEq(undefined, findStrToEnum(TestEnum, 'Firstf'), 'Du|');
});
t.test('findStrToEnum.YouShouldNotBeAbleToAccessFlags', () => {
    assertEq(undefined, findStrToEnum(TestEnum, '__isUI512Enum'), 'Dt|');
    assertEq(undefined, findStrToEnum(TestEnum, '__UI512EnumCapitalize'), 'Ds|');
    assertEq(undefined, findStrToEnum(TestEnum, '__foo'), 'Dr|');
});
t.test('findStrToEnum.YouShouldNotBeAbleToDirectlyAccessAlts', () => {
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateFormTheFirst'), 'NP|');
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateFormScnd'), 'NO|');
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateFormFoo'), 'NN|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateFormTheFirst'), 'NM|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateFormScnd'), 'NL|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateFormFoo'), 'NK|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm__TheFirst'), 'NJ|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm__Scnd'), 'Dp|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm__Foo'), 'Do|');
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateForm'), 'NI|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm'), 'NH|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm__'), 'Dq|');
});
t.test('findStrToEnum.FirstLetterCaseInsensitive', () => {
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'First'), 'Dn|');
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'first'), 'Dm|');
    assertEq(undefined, findStrToEnum(TestEnum, 'firsT'), 'Dl|');
    assertEq(undefined, findStrToEnum(TestEnum, 'FirsT'), 'Dk|');
    assertEq(undefined, findStrToEnum(TestEnum, 'First '), 'Dj|');
    assertEq(undefined, findStrToEnum(TestEnum, 'Firstf'), 'Di|');
    assertEq(undefined, findStrToEnum(TestEnum, 'Firs'), 'Dh|');
});
t.test('findStrToEnum.UseAlts', () => {
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'First'), 'Dg|');
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'TheFirst'), 'Df|');
    assertEq(TestEnum.Second, findStrToEnum(TestEnum, 'Scnd'), 'De|');
    assertEq(TestEnum.Third, findStrToEnum(TestEnum, 'Thd'), 'Dd|');
});
t.test('getEnumToStr.FoundPrimary', () => {
    assertEq('first', getEnumToStrOrFallback(TestEnum, TestEnum.First), 'Dc|');
    assertEq('second', getEnumToStrOrFallback(TestEnum, TestEnum.Second), 'Db|');
    assertEq('third', getEnumToStrOrFallback(TestEnum, TestEnum.Third), 'Da|');
});
t.test('getEnumToStr.AlternatesHaveSameVal', () => {
    assertEq(
        'first',
        getEnumToStrOrFallback(TestEnum, TestEnum.__AlternateForm__TheFirst),
        'DZ|'
    );
    assertEq(
        'second',
        getEnumToStrOrFallback(TestEnum, TestEnum.__AlternateForm__Scnd),
        'DY|'
    );
    assertEq(
        'third',
        getEnumToStrOrFallback(TestEnum, TestEnum.__AlternateForm__Thd),
        'DX|'
    );
});
t.test('getEnumToStr.NotFound', () => {
    assertEq('Unknown', getEnumToStrOrFallback(TestEnum, -1), 'DW|');
    assertEq('Unknown', getEnumToStrOrFallback(TestEnum, 999), 'DV|');
});
t.test('getEnumToStr.ShouldNotBeAbleToAccessFlags', () => {
    assertEq('Unknown', getEnumToStrOrFallback(TestEnum, TestEnum.__isUI512Enum), 'DU|');
    assertEq(
        'Unknown',
        getEnumToStrOrFallback(TestEnum, TestEnum.__UI512EnumCapitalize),
        'DT|'
    );
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
    assertEq(TestEnum.First, getStrToEnum(TestEnum, 'TestEnum', 'First'), 'DS|');
    assertEq(TestEnum.Second, getStrToEnum(TestEnum, 'TestEnum', 'Second'), 'DR|');
    assertEq(TestEnum.Third, getStrToEnum(TestEnum, 'TestEnum', 'Third'), 'DQ|');
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
    assertEq(` first`, pts[0], 'DP|');
    assertEq(` second`, pts[1], 'DO|');
    assertEq(` third (4E)`, pts[2], 'DN|');
    assertTrue(pts[3].endsWith(`Not a valid choice of TestEnum. try one of`));
});
t.test('slength', () => {
    assertEq(0, slength(null), 'NG|');
    assertEq(0, slength(undefined), 'NF|');
    assertEq(0, slength(''), 'NE|');
    assertEq(3, slength('abc'), 'ND|');
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
    assertEq('parent', cast(Parent, o1).a(), 'NC|');
    o1 = new Child();
    assertEq('child', cast(Parent, o1).a(), 'NB|');
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
    assertEq(1, fitIntoInclusive(1, 1, 1), 'DL|');
    assertEq(1, fitIntoInclusive(1, 1, 3), 'DK|');
    assertEq(2, fitIntoInclusive(2, 1, 3), 'DJ|');
    assertEq(3, fitIntoInclusive(3, 1, 3), 'DI|');
});
t.test('fitIntoInclusive.NeedToTruncate', () => {
    assertEq(1, fitIntoInclusive(0, 1, 1), 'DH|');
    assertEq(1, fitIntoInclusive(2, 1, 1), 'DG|');
    assertEq(1, fitIntoInclusive(0, 1, 3), 'DF|');
    assertEq(3, fitIntoInclusive(4, 1, 3), 'DE|');
});
t.test('util512Sort.String', () => {
    assertEq(0, util512Sort('', ''), '1M|');
    assertEq(0, util512Sort('a', 'a'), '1L|');
    assertEq(1, util512Sort('abc', 'abb'), '1K|');
    assertEq(-1, util512Sort('abb', 'abc'), '1J|');
    assertEq(1, util512Sort('abcd', 'abc'), '1I|');
    assertEq(-1, util512Sort('abc', 'abcd'), '1H|');
});
t.test('util512Sort.StringWithNonAscii', () => {
    assertEq(0, util512Sort('aunicode\u2666char', 'aunicode\u2666char'), '1G|');
    assertEq(1, util512Sort('aunicode\u2667char', 'aunicode\u2666char'), '1F|');
    assertEq(-1, util512Sort('aunicode\u2666char', 'aunicode\u2667char'), '1E|');
    assertEq(0, util512Sort('accented\u00e9letter', 'accented\u00e9letter'), '1D|');
    assertEq(1, util512Sort('accented\u00e9letter', 'accented\u0065\u0301letter'), '1C|');
    assertEq(
        -1,
        util512Sort('accented\u0065\u0301letter', 'accented\u00e9letter'),
        '1B|'
    );
});
t.test('util512Sort.Bool', () => {
    assertEq(0, util512Sort(false, false), '1A|');
    assertEq(0, util512Sort(true, true), '19|');
    assertEq(1, util512Sort(true, false), '18|');
    assertEq(-1, util512Sort(false, true), '17|');
});
t.test('util512Sort.Number', () => {
    assertEq(0, util512Sort(0, 0), '16|');
    assertEq(0, util512Sort(1, 1), '15|');
    assertEq(0, util512Sort(12345, 12345), '14|');
    assertEq(0, util512Sort(-11.15, -11.15), '13|');
    assertEq(-1, util512Sort(0, 1), '12|');
    assertEq(1, util512Sort(1, 0), '11|');
    assertEq(1, util512Sort(1.4, 1.3), '10|');
    assertEq(1, util512Sort(0, -1), '0~|');
    assertEq(1, util512Sort(Number.POSITIVE_INFINITY, 12345), '0}|');
    assertEq(-1, util512Sort(Number.NEGATIVE_INFINITY, -12345), '0||');
});
t.test('util512Sort.Nullish', () => {
    assertEq(0, util512Sort(undefined, undefined), 'N1|');
    assertEq(0, util512Sort(null, null), 'N0|');
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
    assertEq(0, util512Sort([5, 'a', 'abcdef'], [5, 'a', 'abcdef']), '0@|');
    assertEq(1, util512Sort([5, 'a', 'abc'], [5, 'a', 'abb']), '0?|');
    assertEq(-1, util512Sort([5, 'a', 'abb'], [5, 'a', 'abc']), '0>|');
});
t.test('util512Sort.ArraySameLength', () => {
    assertEq(0, util512Sort([], []), '0{|');
    assertEq(0, util512Sort([5, 'a'], [5, 'a']), '0`|');
    assertEq(1, util512Sort([5, 'a', 7], [5, 'a', 6]), '0_|');
    assertEq(-1, util512Sort([5, 'a', 6], [5, 'a', 7]), '0^|');
    assertEq(1, util512Sort([5, 7, 'a'], [5, 6, 'a']), '0]|');
    assertEq(1, util512Sort([5, 7, 'a', 600], [5, 6, 'a', 700]), '0[|');
});
t.test('util512Sort.ArrayDifferentLength', () => {
    assertEq(1, util512Sort([1], []), '0=|');
    assertEq(-1, util512Sort([], [1]), '0<|');
    assertEq(1, util512Sort([10, 20], [10]), '0;|');
    assertEq(-1, util512Sort([10], [10, 20]), '0:|');
});
t.test('util512Sort.ArrayNested', () => {
    assertEq(0, util512Sort([[]], [[]]), '0/|');
    assertEq(0, util512Sort([[], []], [[], []]), '0.|');
    assertEq(0, util512Sort([[1, 2], []], [[1, 2], []]), '0-|');
    assertEq(0, util512Sort([[10, 20], [30]], [[10, 20], [30]]), '0,|');
    assertEq(1, util512Sort([[10, 20], [30]], [[10, 20], [-30]]), '0+|');
    assertEq(-1, util512Sort([[10, 20], [-30]], [[10, 20], [30]]), '0*|');
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
        ),
        '0)|'
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
        ),
        '0(|'
    );
    assertEq(
        1,
        util512Sort(
            [
                [10, 20],
                [30, 31]
            ],
            [[10, 20], [30]]
        ),
        '0&|'
    );
    assertEq(
        -1,
        util512Sort(
            [[10, 20], [30]],
            [
                [10, 20],
                [30, 31]
            ]
        ),
        '0%|'
    );
    assertEq(0, util512Sort([[10, 20], 50, [30]], [[10, 20], 50, [30]]), '0$|');
    assertEq(1, util512Sort([[10, 20], 60, [30]], [[10, 20], 50, [30]]), '0#|');
    assertEq(-1, util512Sort([[10, 20], 50, [30]], [[10, 20], 60, [30]]), '0!|');
});
t.test('forOf', () => {
    let ar = [11, 22, 33];
    let result: number[] = [];
    for (let item of ar) {
        result.push(item);
    }

    assertEq([11, 22, 33], result, '0t|');
});
t.test('forOfEmpty', () => {
    let ar: number[] = [];
    let result: number[] = [];
    for (let item of ar) {
        result.push(item);
    }

    assertEq([], result, 'DD|');
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

    assertEq([10, 20, 30, 40], result, '0s|');
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

    assertEq(['ccc', 'ccb', 'cca'], result, '0q|');
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

    assertEq([30, 29, 28], result, '0p|');
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

    assertEq([28, 29, 30], result, '0o|');
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
    assertEq(5, o.get('five'), 'M]|');
    assertEq(6, o.get('six'), 'M[|');
    assertThrows('not found', () => {
        o.get('seven');
    });
    assertThrows('not found', () => {
        o.get('');
    });
    t.say(/*——————————*/ 'find');
    assertEq(5, o.find('five'), 'M>|');
    assertEq(6, o.find('six'), 'M=|');
    assertEq(undefined, o.find('seven'), 'M<|');
    assertEq(undefined, o.find(''), 'M;|');
    t.say(/*——————————*/ 'getKeys');
    assertEq(['five', 'six'], sorted(o.getKeys()), 'M:|');
    assertEq([5, 6], sorted(o.getVals()), 'M/|');
    t.say(/*——————————*/ 'remove');
    o.remove('five');
    assertEq(undefined, o.find('five'), 'M.|');
});
t.test('checkThrowEq', () => {
    checkThrowEq(1, 1, 'M-|');
    checkThrowEq('abc', 'abc', 'M,|');
    assertThrows('but got', () => {
        checkThrowEq(1, 2, 'M*|');
    });
    assertThrows('but got', () => {
        checkThrowEq('abc', 'ABC', 'M(|');
    });
});
t.test('last', () => {
    assertEq(3, arLast([1, 2, 3]), 'M&|');
    assertEq(1, arLast([1]), 'M%|');
});
t.test('bool', () => {
    assertEq(true, bool(true), 'M#|');
    assertEq(true, bool(['abc']), 'M!|');
    assertEq(true, bool('abc'), 'M |');
    assertEq(true, bool(123), 'Mz|');
    assertEq(false, bool(false), 'My|');
    assertEq(false, bool(''), 'Mx|');
    assertEq(false, bool(0), 'Mw|');
    assertEq(true, bool([]), 'Mv|');
    assertEq(false, bool(null), 'Mu|');
    assertEq(false, bool(undefined), 'Mt|');
    assertEq(false, bool(NaN), 'Ms|');
});
t.test('longstr', () => {
    let s = longstr(`a long
        string across
        a few lines`);
    assertEq('a long string across a few lines', s, 'Mr|');
    s = `a long
    string across
    a few lines`;
    let sUnix = Util512.normalizeNewlines(s);
    assertEq('a long string across a few lines', longstr(sUnix), 'Mq|');
    let sWindows = Util512.normalizeNewlines(s).replace(/\n/g, '\r\n');
    assertEq('a long string across a few lines', longstr(sWindows), 'Mp|');
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
