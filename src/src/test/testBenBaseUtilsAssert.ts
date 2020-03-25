
/* auto */ import { SimpleSensibleTestCategory, assertThrows } from './testUtils';
/* auto */ import { RingBuffer, UI512Compress, assertTrue, checkThrowUI512, joinIntoMessage, makeUI512Error, throwIfUndefined } from './../util/benBaseUtilsAssert';
/* auto */ import { assertEq } from './../util/benBaseUtils';

let tests = new SimpleSensibleTestCategory('testBenBaseUtilsAssert');
export let testsBenBaseUtilsAssert = tests

tests.test('assertThrows', () => {
    tests.say('—————————— Gets Message From Custom Error')
    assertThrows('L0|', 'mymessage', () => {
        throw makeUI512Error('1N|1 mymessage 2');
    });
    tests.say('—————————— Gets Message From Plain Error')
    assertThrows('K~|', 'xyz', () => {
        throw new Error('1 xyz 2');
    });
});
tests.test('CheckThrow', () => {
    tests.say('—————————— Should Not Throw')
    checkThrowUI512(1, 'K<|should not throw');
    checkThrowUI512(true, 'K;|should not throw');
    tests.say('—————————— False Should Throw')
    assertThrows('K}|', 'mymessage s1 s2', () => {
        checkThrowUI512(false, 'K:|mymessage', 's1', 's2');
    });
    tests.say('—————————— Null Should Throw')
    assertThrows('K||', 'mymessage s1 s2', () => {
        checkThrowUI512(null, 'K/|mymessage', 's1', 's2');
    });
    tests.say('—————————— Undefined Should Throw')
    assertThrows('K{|', 'mymessage s1 s2', () => {
        checkThrowUI512(undefined, 'K.|mymessage', 's1', 's2');
    });
});
tests.test('ThrowIfUndefined', () => {
    tests.say('—————————— Truthy Should Not Throw')
    let n1 = throwIfUndefined(1, 'Cq|should not throw');
    assertEq(1, n1, 'Cp|');

    let s1 = throwIfUndefined('abc', 'Co|should not throw');
    assertEq('abc', s1, 'Cn|');

    let b1 = throwIfUndefined(true, 'Cm|should not throw');
    assertEq(b1, true, 'Cl|');

    tests.say('—————————— Falsy Should Not Throw')
    let n0 = throwIfUndefined(0, 'Ck|should not throw');
    assertEq(0, n0, 'Cj|');

    let s0 = throwIfUndefined('', 'Ci|should not throw');
    assertEq('', s0, 'Ch|');

    let b0 = throwIfUndefined(false, 'Cg|should not throw');
    assertEq(b0, false, 'Cf|');
    
    tests.say('—————————— NullAndUndefinedShouldThrow')
    assertThrows('K`|', 'mymessage, s1, s2', () => {
        throwIfUndefined(null, 'Ce|mymessage', 's1', 's2');
    });
    assertThrows('K_|', 'mymessage, s1, s2', () => {
        throwIfUndefined(undefined, 'Cd|mymessage', 's1', 's2');
    });
});
tests.test('JoinIntoMessage', () => {
    tests.say('—————————— WithoutTags')
    let got = joinIntoMessage('without|tags', 'prefix:');
    assertEq('prefix: without|tags', got, 'Cc|');

    tests.say('—————————— ShouldMoveTagsToTheEnd')
    got = joinIntoMessage('ab|', 'prefix:', 'c', 'd', 'e');
    assertEq('prefix: \nc, d, e (ab)', got, 'Cb|');
    got = joinIntoMessage('ab|the message', 'prefix:');
    assertEq('prefix: the message (ab)', got, 'Ca|');
    got = joinIntoMessage('the message', 'prefix:', 'ab|c');
    assertEq('prefix: the message\nc (ab)', got, 'CZ|');
});
tests.test('CompressString', () => {
    assertEq('\u2020 ', UI512Compress.compressString(''), 'CY|');
    assertEq('\u10E8 ', UI512Compress.compressString('a'), 'CX|');
    assertEq('\u10E6\u4866\u4AEA  ', UI512Compress.compressString('aaaaaaaabbbbbbbb'), 'CW|');
    assertEq('\u10E6\u4866\u4AE8\u31B0 ', UI512Compress.compressString('aaaaaaaabbbbbbbbc'), 'CV|');
    assertEq('\u10E6\u7070\u0256\u4CF0 ', UI512Compress.compressString('aaaaaaa\nbbbbbbbbb'), 'CU|');
});
tests.test('DecompressString', () => {
    assertEq('', UI512Compress.decompressString('\u2020 '), 'CT|');
    assertEq('a', UI512Compress.decompressString('\u10E8 '), 'CS|');
    assertEq('aaaaaaaabbbbbbbb', UI512Compress.decompressString('\u10E6\u4866\u4AEA  '), 'CR|');
    assertEq('aaaaaaaabbbbbbbbc', UI512Compress.decompressString('\u10E6\u4866\u4AE8\u31B0 '), 'CQ|');
    assertEq('aaaaaaa\nbbbbbbbbb', UI512Compress.decompressString('\u10E6\u7070\u0256\u4CF0 '), 'CP|');
});
tests.test('RingBufferSizeRemainsConstant', () => {
    let buf = new RingBufferArray(4);
    buf.append('a');
    buf.append('b');
    buf.append('c');
    buf.append('d');
    buf.append('e');
    buf.append('f');
    assertEq(['f'], buf.retrieve(1), 'CO|');
    assertEq(['f', 'e'], buf.retrieve(2), 'CN|');
    assertEq(['f', 'e', 'd'], buf.retrieve(3), 'CM|');
    assertEq('d', buf.getAt(0), 'CL|');
    assertEq('e', buf.getAt(1), 'CK|');
    assertEq('f', buf.getAt(2), 'CJ|');
    assertEq('c', buf.getAt(3), 'CI|');
    assertEq('', buf.getAt(5), 'CH|');
});
tests.test('RingBuffer.CorrectlyWrapsAroundWhenNegative', () => {
    let buf = new RingBufferArray(4);
    assertEq(['', ''], buf.retrieve(2), 'CG|');
    buf.append('a');
    assertEq(['a', ''], buf.retrieve(2), 'CF|');
    buf.append('b');
    assertEq(['b', 'a'], buf.retrieve(2), 'CE|');
    buf.append('c');
    assertEq(['c', 'b'], buf.retrieve(2), 'CD|');
    buf.append('d');
    assertEq(['d', 'c'], buf.retrieve(2), 'CC|');
    buf.append('e');
    assertEq(['e', 'd'], buf.retrieve(2), 'CB|');
    buf.append('f');
    assertEq(['f', 'e'], buf.retrieve(2), 'CA|');
    buf.append('g');
    assertEq(['g', 'f'], buf.retrieve(2), 'C9|');
});

/**
 * implementation of RingBuffer backed by a simple array
 */
class RingBufferArray extends RingBuffer {
    arr: string[] = [];
    ptrLatest = 0;
    getAt(index: number): string {
        return this.arr[index] || '';
    }

    setAt(index: number, s: string) {
        this.arr[index] = s;
    }

    getLatestIndex() {
        return this.ptrLatest;
    }

    setLatestIndex(index: number) {
        this.ptrLatest = index;
    }
}
