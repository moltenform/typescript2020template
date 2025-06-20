
/* auto */ import { RingBuffer, UI512Compress, tostring } from './../util/util512Base';
/* auto */ import { assertTrue, assertWarn, checkThrow512, ensureDefined, joinIntoMessage, make512Error } from './../util/util512Assert';
/* auto */ import { assertEq, assertWarnEq } from './../util/util512';
/* auto */ import { SimpleUtil512TestCollection, assertAsserts, assertThrows } from './testUtils';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

let t = new SimpleUtil512TestCollection('testCollectionUtil512Assert');
export let testCollectionUtil512Assert = t;

t.test('AssertThrows', () => {
    t.say(/*——————————*/ 'Get Message From Custom Error');
    assertThrows('mymessage', () => {
        throw make512Error('1 mymessage 2');
    });
    t.say(/*——————————*/ 'Get Message From Plain Error');
    assertThrows('xyz', () => {
        throw new Error('1 xyz 2');
    });
});
t.test('CheckThrow', () => {
    t.say(/*——————————*/ 'Should Not Throw');
    checkThrow512(1, 'should not throw');
    checkThrow512(true, 'should not throw');
    t.say(/*——————————*/ 'False Should Throw');
    assertThrows('mymessage\ns1, s2', () => {
        checkThrow512(false, 'mymessage', 's1', 's2');
    });
    t.say(/*——————————*/ 'Null Should Throw');
    assertThrows('mymessage\ns1, s2', () => {
        checkThrow512(null, 'mymessage', 's1', 's2');
    });
    t.say(/*——————————*/ 'Undefined Should Throw');
    assertThrows('mymessage\ns1, s2', () => {
        checkThrow512(undefined, 'mymessage', 's1', 's2');
    });
});
t.test('AssertAsserts', () => {
    assertTrue(1);
    assertWarn(1);
    assertEq(2, 1 + 1);
    assertWarnEq(2, 1 + 1);
    assertAsserts('a message', () => {
        assertTrue(0, 'a message');
    });
    assertAsserts('a message', () => {
        assertWarn(0, 'a message');
    });
    assertAsserts('a message', () => {
        assertEq(3, 1 + 1, 'a message');
    });
    assertAsserts('a message', () => {
        assertWarnEq(3, 1 + 1, 'a message');
    });
});
t.test('ThrowIfUndefined', () => {
    t.say(/*——————————*/ 'Truthy Should Not Throw');
    let n1 = ensureDefined(1, 'should not throw');
    assertEq(1, n1);

    let s1 = ensureDefined('abc', 'should not throw');
    assertEq('abc', s1);

    let b1 = ensureDefined(true, 'should not throw');
    assertEq(b1, true);

    t.say(/*——————————*/ 'Falsy Should Not Throw');
    let n0 = ensureDefined(0, 'should not throw');
    assertEq(0, n0);

    let s0 = ensureDefined('', 'should not throw');
    assertEq('', s0);

    let b0 = ensureDefined(false, 'should not throw');
    assertEq(false, b0);

    t.say(/*——————————*/ 'NullAndUndefinedShouldThrow');
    assertThrows('mymessage, s1, s2', () => {
        ensureDefined(null, 'mymessage', 's1', 's2');
    });
    assertThrows('mymessage, s1, s2', () => {
        ensureDefined(undefined, 'mymessage', 's1', 's2');
    });
});
t.test('JoinIntoMessage', () => {
    let got = joinIntoMessage('without|marks', 'prefix:');
    assertEq('prefix:: without|marks', got);
});
t.test('CompressString', () => {
    assertEq('\u2020 ', UI512Compress.compressString(''));
    assertEq('\u10E8 ', UI512Compress.compressString('a'));
    assertEq('\u10E6\u4866\u4AEA  ', UI512Compress.compressString('aaaaaaaabbbbbbbb'));
    assertEq(
        '\u10E6\u4866\u4AE8\u31B0 ',
        UI512Compress.compressString('aaaaaaaabbbbbbbbc')
    );
    assertEq(
        '\u10E6\u7070\u0256\u4CF0 ',
        UI512Compress.compressString('aaaaaaa\nbbbbbbbbb')
    );
});
t.test('DecompressString', () => {
    assertEq('', UI512Compress.decompressString('\u2020 '));
    assertEq('a', UI512Compress.decompressString('\u10E8 '));
    assertEq('aaaaaaaabbbbbbbb', UI512Compress.decompressString('\u10E6\u4866\u4AEA  '));
    assertEq(
        'aaaaaaaabbbbbbbbc',
        UI512Compress.decompressString('\u10E6\u4866\u4AE8\u31B0 ')
    );
    assertEq(
        'aaaaaaa\nbbbbbbbbb',
        UI512Compress.decompressString('\u10E6\u7070\u0256\u4CF0 ')
    );
});
t.test('RingBufferSizeRemainsConstant', () => {
    let buf = new RingBufferArray(4);
    buf.append('a');
    buf.append('b');
    buf.append('c');
    buf.append('d');
    buf.append('e');
    buf.append('f');
    assertEq(['f'], buf.retrieve(1));
    assertEq(['f', 'e'], buf.retrieve(2));
    assertEq(['f', 'e', 'd'], buf.retrieve(3));
    assertEq('d', buf.getAt(0));
    assertEq('e', buf.getAt(1));
    assertEq('f', buf.getAt(2));
    assertEq('c', buf.getAt(3));
    assertEq('', buf.getAt(5));
});
t.test('RingBuffer.CorrectlyWrapsAroundWhenNegative', () => {
    let buf = new RingBufferArray(4);
    assertEq(['', ''], buf.retrieve(2));
    buf.append('a');
    assertEq(['a', ''], buf.retrieve(2));
    buf.append('b');
    assertEq(['b', 'a'], buf.retrieve(2));
    buf.append('c');
    assertEq(['c', 'b'], buf.retrieve(2));
    buf.append('d');
    assertEq(['d', 'c'], buf.retrieve(2));
    buf.append('e');
    assertEq(['e', 'd'], buf.retrieve(2));
    buf.append('f');
    assertEq(['f', 'e'], buf.retrieve(2));
    buf.append('g');
    assertEq(['g', 'f'], buf.retrieve(2));
});
t.test('built-in includes', () => {
    t.say(/*——————————*/ 'typical usage');
    assertTrue('a test string'.includes('e'));
    assertTrue('a test string'.includes('test'));
    assertTrue('a test string'.includes('a test'));
    assertTrue('a test string'.includes('a test string'));
    assertTrue(!'a test string'.includes('a test string '));
    assertTrue(!'a test string'.includes('x'));
    t.say(/*——————————*/ 'edge cases');
    assertTrue('test'.includes('test'));
    assertTrue('test'.includes(''));
    assertTrue(!''.includes('test'));
    assertTrue(''.includes(''));
});
t.test('unknownToString', () => {
    class CustomToString {
        public toString() {
            return 'abc';
        }
    }

    let a: unknown = new CustomToString();
    let b: unknown = 'a string';
    let c: unknown = 123;
    let d: unknown = undefined;
    let e: unknown = null;
    let f: unknown = false;
    assertEq('abc', tostring(a));
    assertEq('a string', tostring(b));
    assertEq('123', tostring(c));
    assertEq('undefined', tostring(d));
    assertEq('null', tostring(e));
    assertEq('false', tostring(f));
});

/**
 * implementation of RingBuffer backed by a simple array
 */
class RingBufferArray extends RingBuffer {
    arr: string[] = [];
    ptrLatest = 0;
    getAt(index: number): string {
        return this.arr[index] ?? '';
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
