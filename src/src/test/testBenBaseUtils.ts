
/* auto */ import { SimpleSensibleTestCategory, assertThrows } from './testUtils';
/* auto */ import { UI512ErrorHandling, assertTrue } from './../util/benBaseUtilsAssert';
/* auto */ import { OrderedHash, assertEq, findStrToEnum, fitIntoInclusive, getEnumToStrOrUnknown, getStrToEnum, sensibleSort, } from './../util/benBaseUtils';

let tests = new SimpleSensibleTestCategory('testBenBaseUtils');
export let testsBenBaseUtils = tests;

tests.test('findStrToEnum.FoundPrimary', () => {
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'First'), 'Dz|');
    assertEq(TestEnum.Second, findStrToEnum(TestEnum, 'Second'), 'Dy|');
    assertEq(TestEnum.Third, findStrToEnum(TestEnum, 'Third'), 'Dx|');
});
tests.test('findStrToEnum.NotFound', () => {
    assertEq(undefined, findStrToEnum(TestEnum, ''), 'Dw|');
    assertEq(undefined, findStrToEnum(TestEnum, 'F'), 'Dv|');
    assertEq(undefined, findStrToEnum(TestEnum, 'Firstf'), 'Du|');
});
tests.test('findStrToEnum.YouShouldNotBeAbleToAccessFlags', () => {
    assertEq(undefined, findStrToEnum(TestEnum, '__isUI512Enum'), 'Dt|');
    assertEq(undefined, findStrToEnum(TestEnum, '__UI512EnumCapitalize'), 'Ds|');
    assertEq(undefined, findStrToEnum(TestEnum, '__foo'), 'Dr|');
});
tests.test('findStrToEnum.YouShouldNotBeAbleToDirectlyAccessAlts', () => {
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateFormTheFirst'), 'Dq|');
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateFormScnd'), 'Dp|');
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateFormFoo'), 'Do|');
});
tests.test('findStrToEnum.FirstLetterCaseInsensitive', () => {
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'First'), 'Dn|');
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'first'), 'Dm|');
    assertEq(undefined, findStrToEnum(TestEnum, 'firsT'), 'Dl|');
    assertEq(undefined, findStrToEnum(TestEnum, 'FirsT'), 'Dk|');
    assertEq(undefined, findStrToEnum(TestEnum, 'First '), 'Dj|');
    assertEq(undefined, findStrToEnum(TestEnum, 'Firstf'), 'Di|');
    assertEq(undefined, findStrToEnum(TestEnum, 'Firs'), 'Dh|');
});
tests.test('findStrToEnum.UseAlts', () => {
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'First'), 'Dg|');
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'TheFirst'), 'Df|');
    assertEq(TestEnum.Second, findStrToEnum(TestEnum, 'Scnd'), 'De|');
    assertEq(TestEnum.Third, findStrToEnum(TestEnum, 'Thd'), 'Dd|');
});
tests.test('getEnumToStr.FoundPrimary', () => {
    assertEq('first', getEnumToStrOrUnknown(TestEnum, TestEnum.First), 'Dc|');
    assertEq('second', getEnumToStrOrUnknown(TestEnum, TestEnum.Second), 'Db|');
    assertEq('third', getEnumToStrOrUnknown(TestEnum, TestEnum.Third), 'Da|');
});
tests.test('getEnumToStr.AlternatesHaveSameVal', () => {
    assertEq('first', getEnumToStrOrUnknown(TestEnum, TestEnum.AlternateFormTheFirst), 'DZ|');
    assertEq('second', getEnumToStrOrUnknown(TestEnum, TestEnum.AlternateFormScnd), 'DY|');
    assertEq('third', getEnumToStrOrUnknown(TestEnum, TestEnum.AlternateFormThd), 'DX|');
});
tests.test('getEnumToStr.NotFound', () => {
    assertEq('Unknown', getEnumToStrOrUnknown(TestEnum, -1), 'DW|');
    assertEq('Unknown', getEnumToStrOrUnknown(TestEnum, 999), 'DV|');
});
tests.test('getEnumToStr.ShouldNotBeAbleToAccessFlags', () => {
    assertEq('Unknown', getEnumToStrOrUnknown(TestEnum, TestEnum.__isUI512Enum), 'DU|');
    assertEq('Unknown', getEnumToStrOrUnknown(TestEnum, TestEnum.__UI512EnumCapitalize), 'DT|');
});
tests.test('getStrToEnum.FoundPrimary', () => {
    assertEq(TestEnum.First, getStrToEnum(TestEnum, 'TestEnum', 'First'), 'DS|');
    assertEq(TestEnum.Second, getStrToEnum(TestEnum, 'TestEnum', 'Second'), 'DR|');
    assertEq(TestEnum.Third, getStrToEnum(TestEnum, 'TestEnum', 'Third'), 'DQ|');
});
tests.test('getStrToEnum.ShowValuesInExceptionMsg', () => {
    let excMessage = '';
    try {
        UI512ErrorHandling.breakOnThrow = false;
        getStrToEnum(TestEnum, 'TestEnum', 'Firstf');
    } catch (e) {
        excMessage = e.toString();
    } finally {
        UI512ErrorHandling.breakOnThrow = true;
    }

    let pts = excMessage.split(',');
    pts.sort();
    assertEq(pts[0], ` first`, 'DP|');
    assertEq(pts[1], ` second`, 'DO|');
    assertEq(pts[2], ` third (4E)`, 'DN|');
    assertTrue(pts[3].endsWith(`Not a valid choice of TestEnum. try one of`), 'DM|');
});
tests.test('fitIntoInclusive.AlreadyWithin', () => {
    assertEq(1, fitIntoInclusive(1, 1, 1), 'DL|');
    assertEq(1, fitIntoInclusive(1, 1, 3), 'DK|');
    assertEq(2, fitIntoInclusive(2, 1, 3), 'DJ|');
    assertEq(3, fitIntoInclusive(3, 1, 3), 'DI|');
});
tests.test('fitIntoInclusive.NeedToTruncate', () => {
    assertEq(1, fitIntoInclusive(0, 1, 1), 'DH|');
    assertEq(1, fitIntoInclusive(2, 1, 1), 'DG|');
    assertEq(1, fitIntoInclusive(0, 1, 3), 'DF|');
    assertEq(3, fitIntoInclusive(4, 1, 3), 'DE|');
});
tests.test('sensibleSort.String', () => {
    assertEq(0, sensibleSort('', ''), '1M|');
    assertEq(0, sensibleSort('a', 'a'), '1L|');
    assertEq(1, sensibleSort('abc', 'abb'), '1K|');
    assertEq(-1, sensibleSort('abb', 'abc'), '1J|');
    assertEq(1, sensibleSort('abcd', 'abc'), '1I|');
    assertEq(-1, sensibleSort('abc', 'abcd'), '1H|');
});
tests.test('sensibleSort.StringWithNonAscii', () => {
    assertEq(0, sensibleSort('aunicode\u2666char', 'aunicode\u2666char'), '1G|');
    assertEq(1, sensibleSort('aunicode\u2667char', 'aunicode\u2666char'), '1F|');
    assertEq(-1, sensibleSort('aunicode\u2666char', 'aunicode\u2667char'), '1E|');
    assertEq(0, sensibleSort('accented\u00e9letter', 'accented\u00e9letter'), '1D|');
    assertEq(1, sensibleSort('accented\u00e9letter', 'accented\u0065\u0301letter'), '1C|');
    assertEq(-1, sensibleSort('accented\u0065\u0301letter', 'accented\u00e9letter'), '1B|');
});
tests.test('sensibleSort.Bool', () => {
    assertEq(0, sensibleSort(false, false), '1A|');
    assertEq(0, sensibleSort(true, true), '19|');
    assertEq(1, sensibleSort(true, false), '18|');
    assertEq(-1, sensibleSort(false, true), '17|');
});
tests.test('sensibleSort.Number', () => {
    assertEq(0, sensibleSort(0, 0), '16|');
    assertEq(0, sensibleSort(1, 1), '15|');
    assertEq(0, sensibleSort(12345, 12345), '14|');
    assertEq(0, sensibleSort(-11.15, -11.15), '13|');
    assertEq(-1, sensibleSort(0, 1), '12|');
    assertEq(1, sensibleSort(1, 0), '11|');
    assertEq(1, sensibleSort(1.4, 1.3), '10|');
    assertEq(1, sensibleSort(0, -1), '0~|');
    assertEq(1, sensibleSort(Number.POSITIVE_INFINITY, 12345), '0}|');
    assertEq(-1, sensibleSort(Number.NEGATIVE_INFINITY, -12345), '0||');
});
tests.test('sensibleSort.DiffTypesShouldThrow', () => {
    assertThrows('Le|', 'not compare', () => sensibleSort('a', 1));
    assertThrows('Ld|', 'not compare', () => sensibleSort('a', true));
    assertThrows('Lc|', 'not compare', () => sensibleSort('a', undefined));
    assertThrows('Lb|', 'not compare', () => sensibleSort('a', []));
    assertThrows('La|', 'not compare', () => sensibleSort(1, 'a'));
    assertThrows('LZ|', 'not compare', () => sensibleSort(1, true));
    assertThrows('LY|', 'not compare', () => sensibleSort(1, undefined));
    assertThrows('LX|', 'not compare', () => sensibleSort(1, []));
    assertThrows('LW|', 'not compare', () => sensibleSort(true, 'a'));
    assertThrows('LV|', 'not compare', () => sensibleSort(true, 1));
    assertThrows('LU|', 'not compare', () => sensibleSort(true, undefined));
    assertThrows('LT|', 'not compare', () => sensibleSort(true, []));
    assertThrows('LS|', 'not compare', () => sensibleSort(undefined, 'a'));
    assertThrows('LR|', 'not compare', () => sensibleSort(undefined, 1));
    assertThrows('LQ|', 'not compare', () => sensibleSort(undefined, true));
    assertThrows('LP|', 'not compare', () => sensibleSort(undefined, []));
    assertThrows('LO|', 'not compare', () => sensibleSort([], 'a'));
    assertThrows('LN|', 'not compare', () => sensibleSort([], 1));
    assertThrows('LM|', 'not compare', () => sensibleSort([], true));
    assertThrows('LL|', 'not compare', () => sensibleSort([], undefined));
});
tests.test('sensibleSort.DiffTypesInArrayShouldThrow', () => {
    assertThrows('LK|', 'not compare', () => sensibleSort(['a', 'a'], ['a', 1]));
    assertThrows('LJ|', 'not compare', () => sensibleSort(['a', 'a'], ['a', true]));
    assertThrows('LI|', 'not compare', () => sensibleSort(['a', 'a'], ['a', undefined]));
    assertThrows('LH|', 'not compare', () => sensibleSort(['a', 'a'], ['a', []]));
    assertThrows('LG|', 'not compare', () => sensibleSort(['a', 1], ['a', 'a']));
    assertThrows('LF|', 'not compare', () => sensibleSort(['a', 1], ['a', true]));
    assertThrows('LE|', 'not compare', () => sensibleSort(['a', 1], ['a', undefined]));
    assertThrows('LD|', 'not compare', () => sensibleSort(['a', 1], ['a', []]));
    assertThrows('LC|', 'not compare', () => sensibleSort(['a', true], ['a', 'a']));
    assertThrows('LB|', 'not compare', () => sensibleSort(['a', true], ['a', 1]));
    assertThrows('LA|', 'not compare', () => sensibleSort(['a', true], ['a', undefined]));
    assertThrows('L9|', 'not compare', () => sensibleSort(['a', true], ['a', []]));
    assertThrows('L8|', 'not compare', () => sensibleSort(['a', undefined], ['a', 'a']));
    assertThrows('L7|', 'not compare', () => sensibleSort(['a', undefined], ['a', 1]));
    assertThrows('L6|', 'not compare', () => sensibleSort(['a', undefined], ['a', true]));
    assertThrows('L5|', 'not compare', () => sensibleSort(['a', undefined], ['a', []]));
    assertThrows('L4|', 'not compare', () => sensibleSort(['a', []], ['a', 'a']));
    assertThrows('L3|', 'not compare', () => sensibleSort(['a', []], ['a', 1]));
    assertThrows('L2|', 'not compare', () => sensibleSort(['a', []], ['a', true]));
    assertThrows('L1|', 'not compare', () => sensibleSort(['a', []], ['a', undefined]));
});
tests.test('sensibleSort.ArrayThreeElements', () => {
    assertEq(0, sensibleSort([5, 'a', 'abcdef'], [5, 'a', 'abcdef']), '0@|');
    assertEq(1, sensibleSort([5, 'a', 'abc'], [5, 'a', 'abb']), '0?|');
    assertEq(-1, sensibleSort([5, 'a', 'abb'], [5, 'a', 'abc']), '0>|');
});
tests.test('sensibleSort.ArraySameLength', () => {
    assertEq(0, sensibleSort([], []), '0{|');
    assertEq(0, sensibleSort([5, 'a'], [5, 'a']), '0`|');
    assertEq(1, sensibleSort([5, 'a', 7], [5, 'a', 6]), '0_|');
    assertEq(-1, sensibleSort([5, 'a', 6], [5, 'a', 7]), '0^|');
    assertEq(1, sensibleSort([5, 7, 'a'], [5, 6, 'a']), '0]|');
    assertEq(1, sensibleSort([5, 7, 'a', 600], [5, 6, 'a', 700]), '0[|');
});
tests.test('sensibleSort.ArrayDifferentLength', () => {
    assertEq(1, sensibleSort([1], []), '0=|');
    assertEq(-1, sensibleSort([], [1]), '0<|');
    assertEq(1, sensibleSort([10, 20], [10]), '0;|');
    assertEq(-1, sensibleSort([10], [10, 20]), '0:|');
});
tests.test('sensibleSort.ArrayNested', () => {
    assertEq(0, sensibleSort([[]], [[]]), '0/|');
    assertEq(0, sensibleSort([[], []], [[], []]), '0.|');
    assertEq(0, sensibleSort([[1, 2], []], [[1, 2], []]), '0-|');
    assertEq(0, sensibleSort([[10, 20], [30]], [[10, 20], [30]]), '0,|');
    assertEq(1, sensibleSort([[10, 20], [30]], [[10, 20], [-30]]), '0+|');
    assertEq(-1, sensibleSort([[10, 20], [-30]], [[10, 20], [30]]), '0*|');
    assertEq(
        1,
        sensibleSort(
            [
                [10, 20],
                [1, 30],
            ],
            [
                [10, 20],
                [1, -30],
            ],
        ),
        '0)|',
    );
    assertEq(
        -1,
        sensibleSort(
            [
                [10, 20],
                [1, -30],
            ],
            [
                [10, 20],
                [1, 30],
            ],
        ),
        '0(|',
    );
    assertEq(
        1,
        sensibleSort(
            [
                [10, 20],
                [30, 31],
            ],
            [[10, 20], [30]],
        ),
        '0&|',
    );
    assertEq(
        -1,
        sensibleSort(
            [[10, 20], [30]],
            [
                [10, 20],
                [30, 31],
            ],
        ),
        '0%|',
    );
    assertEq(0, sensibleSort([[10, 20], 50, [30]], [[10, 20], 50, [30]]), '0$|');
    assertEq(1, sensibleSort([[10, 20], 60, [30]], [[10, 20], 50, [30]]), '0#|');
    assertEq(-1, sensibleSort([[10, 20], 50, [30]], [[10, 20], 60, [30]]), '0!|');
});
tests.test('forOf', () => {
    let ar = [11, 22, 33];
    let result: number[] = [];
    for (let item of ar) {
        result.push(item);
    }

    assertEq([11, 22, 33], result, '0t|');
});
tests.test('forOfEmpty', () => {
    let ar: number[] = [];
    let result: number[] = [];
    for (let item of ar) {
        result.push(item);
    }

    assertEq([], result, 'DD|');
});
tests.test('forOfGenerator', () => {
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
tests.test('testOrderedHash.IterKeys', () => {
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
tests.test('testOrderedHash.IterVals', () => {
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
tests.test('testOrderedHash.IterReversed', () => {
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

/**
 * test-only enum
 */
enum TestEnum {
    __isUI512Enum = 1,
    __UI512EnumCapitalize,
    First,
    Second,
    Third,
    AlternateFormTheFirst = First,
    AlternateFormScnd = Second,
    AlternateFormThd = Third,
}
