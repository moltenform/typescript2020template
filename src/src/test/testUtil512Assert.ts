
/* auto */ import { assertTrue, assertWarn, checkThrow512, ensureDefined, joinIntoMessage, make512Error } from './../util/util512Assert';
/* auto */ import { assertEq, assertWarnEq } from './../util/util512';
/* auto */ import { SimpleUtil512TestCollection, assertAsserts, assertThrows } from './testHelpers';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

let t = new SimpleUtil512TestCollection('testCollectionUtil512Assert');
export let testCollectionUtil512Assert = t;

t.test('AssertThrows', () => {
    // test Get Message From Custom Error
    assertThrows('mymessage', () => {
        throw make512Error('1 mymessage 2');
    });
    // test Get Message From Plain Error
    assertThrows('xyz', () => {
        throw new Error('1 xyz 2');
    });
});
t.test('CheckThrow', () => {
    // test Should Not Throw
    checkThrow512(1, 'should not throw');
    checkThrow512(true, 'should not throw');
    // test False Should Throw
    assertThrows('mymessage\ns1, s2', () => {
        checkThrow512(false, 'mymessage', 's1', 's2');
    });
    // test Null Should Throw
    assertThrows('mymessage\ns1, s2', () => {
        checkThrow512(null, 'mymessage', 's1', 's2');
    });
    // test Undefined Should Throw
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
    // test Truthy Should Not Throw
    let n1 = ensureDefined(1, 'should not throw');
    assertEq(1, n1);

    let s1 = ensureDefined('abc', 'should not throw');
    assertEq('abc', s1);

    let b1 = ensureDefined(true, 'should not throw');
    assertEq(b1, true);

    // test Falsy Should Not Throw
    let n0 = ensureDefined(0, 'should not throw');
    assertEq(0, n0);

    let s0 = ensureDefined('', 'should not throw');
    assertEq('', s0);

    let b0 = ensureDefined(false, 'should not throw');
    assertEq(false, b0);

    // test NullAndUndefinedShouldThrow
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

t.test('built-in includes', () => {
    // test typical usage
    assertTrue('a test string'.includes('e'));
    assertTrue('a test string'.includes('test'));
    assertTrue('a test string'.includes('a test'));
    assertTrue('a test string'.includes('a test string'));
    assertTrue(!'a test string'.includes('a test string '));
    assertTrue(!'a test string'.includes('x'));
    // test edge cases
    assertTrue('test'.includes('test'));
    assertTrue('test'.includes(''));
    assertTrue(!''.includes('test'));
    assertTrue(''.includes(''));
});


