
/* auto */ import { SimpleSensibleTestCategory } from './testUtils';
/* auto */ import { Util512Higher, sleep } from './../util/benBaseUtilsHigher';
/* auto */ import { assertTrue, scontains } from './../util/benBaseUtilsAssert';
/* auto */ import { Util512, assertEq } from './../util/benBaseUtils';

let t = new SimpleSensibleTestCategory('testBenBaseUtilsHigher');
export let testBenBaseUtilsHigher = t;

t.test('WeakUuid', () => {
    let uid1 = Util512Higher.weakUuid();
    let uid2 = Util512Higher.weakUuid();
    assertTrue(uid1 !== uid2, 'Ea|');

    let uid = Util512Higher.weakUuid();
    assertEq(36, uid.length, 'EZ|');
    for (let i = 0; i < uid.length; i++) {
        let c = uid.charAt(i);
        if (i === 23 || i === 18 || i === 13 || i === 8) {
            assertEq('-', c, 'EY|');
        } else {
            assertTrue(scontains('0123456789abcdef', c), 'EX|');
        }
    }
});
t.test('getRandIntInclusiveWeak.OKIfBoundsEqual', () => {
    assertEq(1, Util512Higher.getRandIntInclusiveWeak(1, 1), 'EW|');
    assertEq(2, Util512Higher.getRandIntInclusiveWeak(2, 2), 'EV|');
    assertEq(3, Util512Higher.getRandIntInclusiveWeak(3, 3), 'EU|');
});
t.test('getRandIntInclusiveWeak', () => {
    let got = Util512Higher.getRandIntInclusiveWeak(1, 3);
    assertTrue(got >= 1 && got <= 3, 'ET|');
    got = Util512Higher.getRandIntInclusiveWeak(4, 6);
    assertTrue(got >= 4 && got <= 6, 'ES|');
    got = Util512Higher.getRandIntInclusiveWeak(7, 9);
    assertTrue(got >= 7 && got <= 9, 'ER|');
});
t.test('generateUniqueBase64UrlSafe', () => {
    let generated1 = Util512Higher.generateUniqueBase64UrlSafe(8, '!');
    let generated2 = Util512Higher.generateUniqueBase64UrlSafe(8, '!');
    assertTrue(generated1 !== generated2, 'D(|');
    assertEq('!', Util512.fromBase64UrlSafe(generated1)[0], 'D&|');
    assertEq('!', Util512.fromBase64UrlSafe(generated2)[0], 'D%|');
});

t = new SimpleSensibleTestCategory('testExampleAsyncTests', 'async');
export let testExampleAsyncTests = t;

t.atest('canDoSimpleSynchronousActions', async () => {
    t.say('adding numbers');
    assertEq(4, 2 + 2, 'OA|');
});
t.atest('canAwaitACall', async () => {
    t.say('0...');
    await exampleAsyncFn();
    t.say('3');
});
t.atest('canChainACall', () => {
    return exampleAsyncFn();
});

async function exampleAsyncFn() {
    t.say('1...');
    await sleep(100);
    t.say('2...');
}
