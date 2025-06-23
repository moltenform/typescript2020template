
/* auto */ import { RingBuffer, UI512Compress, tostring, Util512StaticClass, O, RingBufferLocalStorage, } from './../util/util512Base';
/* auto */ import { assertTrue, assertWarn, checkThrow512, ensureDefined, joinIntoMessage, make512Error } from './../util/util512Assert';
/* auto */ import { assertEq, assertWarnEq } from './../util/util512';
/* auto */ import { SimpleUtil512TestCollection, assertAsserts, assertThrows } from './testHelpers';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

let t = new SimpleUtil512TestCollection('testCollectionUtil512Base');
export let testCollectionUtil512Base = t;

t.test('RingBuffer.SizeRemainsConstant', () => {
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
t.test('RingBufferFromMock.SizeRemainsConstant', () => {
    let buf = new RingBufferLocalStorageMock(4);
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

t.test('StaticClass Illustrating Problems', () => {
    class Class1 {
        static addNumbers(a: number, b: number): number {
            return this.addNumbersHelper(a, b);
        }
        static addNumbersHelper(a: number, b: number): number {
            return a + b;
        }
    }

    // this works
    assertEq(9, Class1.addNumbers(4, 5));

    // this works but loses typing info
    const stored = Class1.addNumbers.bind(Class1) 
    assertEq(9, stored(4, 5));

    // this works (unless the minifier/transpiler rewrites it which is possible)
    try {
        const storedWorks = Class1.addNumbersHelper
        assertEq(9, storedWorks(4, 5));
    } catch(e) {
        console.log("test passed: transpiler made `this` refer to something else")
    }
    
    // this fails (!)
    // the approach doesn't work because `this` is invalid
    assertThrows('undefined', ()=> {
        const storedFails = Class1.addNumbers;
        assertEq(9, storedFails(4, 5));
    })
})
t.test('StaticClass Illustrating Problems 2', () => {
    const Class2 = {
        addNumbers: (a: number, b: number): number => {
            return Class2.addNumbersHelper(a, b);
        },
        addNumbersHelper: (a: number, b: number): number => {
            return a + b;
        }
    }

    // this works, and i like the feel where it shows this
    // will never have another instantiation.
    assertEq(9, Class2.addNumbers(4, 5));

    // and it doesn't run into binding problems
    const stored = Class2.addNumbers
    assertEq(9, stored(4, 5));

    // drawbacks: can't refer to `this`, need to type the full name out.
    // and I don't think you could add private methods.
})
t.test('StaticClass Best', () => {
    // put the classname in there twice for better callstacks
    const TestUI512StaticClass = new class TestUI512StaticClass extends Util512StaticClass {
        addNumbers = (a: number, b: number): number => {
            return this.addNumbersHelper(a, b);   
        }
        addNumbersHelper = (a: number, b: number): number => {
            return a + b;
        }
    }

    // simple calls
    assertEq(9, TestUI512StaticClass.addNumbers(4, 5,));

    // by using =method()=> style methods, we can even store references
    // like this without needing bind(), which otherise would fail mysteriously on `this`
    const stored = TestUI512StaticClass.addNumbers;
    assertEq(9, stored(4, 5));
    // only drawback is that the syntax 
})
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
    override  getAt(index: number): string {
        return this.arr[index] ?? '';
    }

    override setAt(index: number, s: string) {
        this.arr[index] = s;
    }

   override  getLatestIndex() {
        return this.ptrLatest;
    }

   override  setLatestIndex(index: number) {
        this.ptrLatest = index;
    }
}

class RingBufferLocalStorageMock extends RingBufferLocalStorage {
    _store: O<Storage>
    override store(): Storage  {
        class MockStore {
            getItem(key: string): string | null {
                return this[key] ?? null;
            }
            setItem(key: string, value: string): void {
                 this[key] = value;
            }
        }  

        return this._store ?? new MockStore() as Storage;
    }
}