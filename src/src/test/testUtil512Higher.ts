
/* auto */ import { Util512Higher } from './../util/util512Higher';
/* auto */ import { assertTrue } from './../util/util512Assert';
/* auto */ import { Util512, assertEq } from './../util/util512';
/* auto */ import { SimpleUtil512TestCollection, assertThrows, assertThrowsAsync } from './testUtils';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

let t = new SimpleUtil512TestCollection('testCollectionUtil512Higher');
export let testCollectionUtil512Higher = t;

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
            assertTrue('0123456789abcdef'.includes(c), 'EX|');
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



/* ok to disable warning, we're intentionally only synchronous here */
/* eslint-disable-next-line @typescript-eslint/require-await */
t.atest('canDoSimpleSynchronousActions', async () => {
    t.say(/*——————————*/ 'adding numbers');
    assertEq(4, 2 + 2, 'OA|');
});
t.atest('canAwaitACall', async () => {
    t.say(/*——————————*/ '0...');
    await exampleAsyncFn();
    t.say(/*——————————*/ '3');
});
/* note that we're intentionally returning a promise */
t.atest('canChainACall', async () => {
    return exampleAsyncFn();
});

/* an example async function */
async function exampleAsyncFn() {
    t.say(/*——————————*/ '1...');
    await Util512Higher.sleep(100);
    t.say(/*——————————*/ '2...');
}
t.atest('minimumTimeSlowsDown', async () => {
    let shortFn = async () => {
        await Util512Higher.sleep(100);
        return 123;
    };
    let start = performance.now();
    let result = await Util512Higher.runAsyncWithMinimumTime(shortFn(), 500);
    assertEq(123, result, 'PY|');
    assertTrue(performance.now() - start > 400, 'PX|too fast');
});
t.atest('minimumTimeStaysSame', async () => {
    let longFn = async () => {
        await Util512Higher.sleep(500);
        return 123;
    };
    let start = performance.now();
    let result = await Util512Higher.runAsyncWithMinimumTime(longFn(), 100);
    assertEq(123, result, 'PW|');
    assertTrue(performance.now() - start > 400, 'PV|too fast');
});
t.atest('doesNotTimeOut', async () => {
    let shortFn = async () => {
        await Util512Higher.sleep(200);
        return 123;
    };
    let start = performance.now();
    let result = await Util512Higher.runAsyncWithTimeout(shortFn(), 800);
    assertEq(123, result, 'PU|');
    assertTrue(performance.now() - start < 600, 'PT|too slow');
});
t.atest('timesOut', async () => {
    let longFn = async () => {
        await Util512Higher.sleep(800);
        return 123;
    };
    let start = performance.now();
    let cb = async () => {
        return Util512Higher.runAsyncWithTimeout(longFn(), 200);
    };
    await assertThrowsAsync('PS|', 'Timed out', () => cb());
    assertTrue(performance.now() - start < 600, 'PR|too slow');
});

/**
 * test some less useful classes
 */
t.test('LockableArr', () => {
    t.say(/*——————————*/ 'standard use');
    let ar = new Util512.LockableArr<number>();
    ar.set(0, 55);
    ar.set(1, 56);
    assertEq(55, ar.at(0), 'OS|');
    assertEq(56, ar.at(1), 'OR|');
    assertEq(2, ar.len(), 'OQ|');
    ar.lock();
    assertThrows('OP|', 'locked', () => {
        ar.set(1, 57);
    });
    t.say(/*——————————*/ "changing the copy won't change original");
    let copy = ar.getUnlockedCopy();
    assertEq(55, copy.at(0), 'OO|');
    assertEq(56, copy.at(1), 'ON|');
    assertEq(2, copy.len(), 'OM|');
    copy.set(1, 57);
    assertEq(57, copy.at(1), 'OL|');
    assertEq(56, ar.at(1), 'OK|');
});
t.test('keepOnlyUnique', () => {
    assertEq([], Util512.keepOnlyUnique([]), 'OJ|');
    assertEq(['1'], Util512.keepOnlyUnique(['1']), 'OI|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '3']), 'OH|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '2', '3']), 'OG|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '3', '3']), 'OF|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '2', '3', '2']), 'OE|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '2', '3', '3']), 'OD|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '3', '2', '3']), 'OC|');
    assertEq(
        ['11', '12', '13', '14', '15'],
        Util512.keepOnlyUnique(['11', '12', '13', '14', '15', '15']),
        'OB|'
    );
});
