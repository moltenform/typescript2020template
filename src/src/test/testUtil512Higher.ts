
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
    assertTrue(uid1 !== uid2);

    let uid = Util512Higher.weakUuid();
    assertEq(36, uid.length);
    for (let i = 0; i < uid.length; i++) {
        let c = uid.charAt(i);
        if (i === 23 || i === 18 || i === 13 || i === 8) {
            assertEq('-', c);
        } else {
            assertTrue('0123456789abcdef'.includes(c));
        }
    }
});
t.test('getRandIntInclusiveWeak.OKIfBoundsEqual', () => {
    assertEq(1, Util512Higher.getRandIntInclusiveWeak(1, 1));
    assertEq(2, Util512Higher.getRandIntInclusiveWeak(2, 2));
    assertEq(3, Util512Higher.getRandIntInclusiveWeak(3, 3));
});
t.test('getRandIntInclusiveWeak', () => {
    let got = Util512Higher.getRandIntInclusiveWeak(1, 3);
    assertTrue(got >= 1 && got <= 3);
    got = Util512Higher.getRandIntInclusiveWeak(4, 6);
    assertTrue(got >= 4 && got <= 6);
    got = Util512Higher.getRandIntInclusiveWeak(7, 9);
    assertTrue(got >= 7 && got <= 9);
});
t.test('generateUniqueBase64UrlSafe', () => {
    let generated1 = Util512Higher.generateUniqueBase64UrlSafe(8, '!');
    let generated2 = Util512Higher.generateUniqueBase64UrlSafe(8, '!');
    assertTrue(generated1 !== generated2);
    assertEq('!', Util512.fromBase64UrlSafe(generated1)[0]);
    assertEq('!', Util512.fromBase64UrlSafe(generated2)[0]);
});

/* ok to disable warning, we're intentionally only synchronous here */
/* eslint-disable-next-line @typescript-eslint/require-await */
t.atest('canDoSimpleSynchronousActions', async () => {
    t.say(/*——————————*/ 'adding numbers');
    assertEq(4, 2 + 2);
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
    assertEq(123, result);
    assertTrue(performance.now() - start > 400, 'too fast');
});
t.atest('minimumTimeStaysSame', async () => {
    let longFn = async () => {
        await Util512Higher.sleep(500);
        return 123;
    };
    let start = performance.now();
    let result = await Util512Higher.runAsyncWithMinimumTime(longFn(), 100);
    assertEq(123, result);
    assertTrue(performance.now() - start > 400, 'too fast');
});
t.atest('doesNotTimeOut', async () => {
    let shortFn = async () => {
        await Util512Higher.sleep(200);
        return 123;
    };
    let start = performance.now();
    let result = await Util512Higher.runAsyncWithTimeout(shortFn(), 800);
    assertEq(123, result);
    assertTrue(performance.now() - start < 600, 'too slow');
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
    assertTrue(performance.now() - start < 600, 'too slow');
});

/**
 * test some less useful classes
 */
t.test('LockableArr', () => {
    t.say(/*——————————*/ 'standard use');
    let ar = new Util512.LockableArr<number>();
    ar.set(0, 55);
    ar.set(1, 56);
    assertEq(55, ar.at(0));
    assertEq(56, ar.at(1));
    assertEq(2, ar.len());
    ar.lock();
    assertThrows('locked', () => {
        ar.set(1, 57);
    });
    t.say(/*——————————*/ "changing the copy won't change original");
    let copy = ar.getUnlockedCopy();
    assertEq(55, copy.at(0));
    assertEq(56, copy.at(1));
    assertEq(2, copy.len());
    copy.set(1, 57);
    assertEq(57, copy.at(1));
    assertEq(56, ar.at(1));
});
t.test('keepOnlyUnique', () => {
    assertEq([], Util512.keepOnlyUnique([]));
    assertEq(['1'], Util512.keepOnlyUnique(['1']));
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '3']));
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '2', '3']));
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '3', '3']));
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '2', '3', '2']));
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '2', '3', '3']));
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '3', '2', '3']));
    assertEq(
        ['11', '12', '13', '14', '15'],
        Util512.keepOnlyUnique(['11', '12', '13', '14', '15', '15'])
    );
});
