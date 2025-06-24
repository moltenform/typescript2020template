
import { Util512Higher } from './../util/util512Higher';
import { assertTrue } from './../util/util512Assert';
import { Util512, assertEq } from './../util/util512';
import { SimpleUtil512TestCollection, assertThrows, assertThrowsAsync, t } from './testHelpers';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

t.setCurrentLabel('testCollectionUtil512Higher');
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
t.test('getRandIntInclusiveStrong.OKIfBoundsEqual', () => {
    assertEq(1, Util512Higher.getRandIntInclusiveStrong(1, 1));
    assertEq(2, Util512Higher.getRandIntInclusiveStrong(2, 2));
    assertEq(3, Util512Higher.getRandIntInclusiveStrong(3, 3));
});
t.test('getRandIntInclusiveStrong', () => {
    let got = Util512Higher.getRandIntInclusiveStrong(1, 3);
    assertTrue(got >= 1 && got <= 3);
    got = Util512Higher.getRandIntInclusiveStrong(4, 6);
    assertTrue(got >= 4 && got <= 6);
    got = Util512Higher.getRandIntInclusiveStrong(7, 9);
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
t.test('canAwaitACall', async () => {
    let ret = await exampleAsyncFn();
    assertEq(1, ret);
});
/* don't need to write return await exampleAsyncFn */
t.test('canChainACall', async () => {
    async function testFn() {
        return exampleAsyncFn();
    }

    assertEq(1, await testFn());
});

/* an example async function */
async function exampleAsyncFn() {
    await Util512Higher.sleep(100);
    return 1;
}
t.test('doesNotTimeOut', async () => {
    let shortFn = async () => {
        await Util512Higher.sleep(200);
        return 123;
    };
    let start = performance.now();
    let result = await Util512Higher.runAsyncWithTimeout(shortFn(), 800);
    assertEq(123, result);
    assertTrue(performance.now() - start < 600, 'too slow');
});
t.test('timesOut', async () => {
    let longFn = async () => {
        await Util512Higher.sleep(800);
        return 123;
    };
    let start = performance.now();
    let cb = async () => {
        return Util512Higher.runAsyncWithTimeout(longFn(), 200);
    };
    await assertThrowsAsync('Timed out', () => cb());
    assertTrue(performance.now() - start < 600, 'too slow');
});
t.test('minimumTimeSlowsDown', async () => {
    let shortFn = async () => {
        await Util512Higher.sleep(100);
        return 123;
    };
    let start = performance.now();
    let result = await Util512Higher.runAsyncWithMinimumTime(shortFn(), 500);
    assertEq(123, result);
    assertTrue(performance.now() - start > 400, 'too fast');
});
t.test('minimumTimeStaysSame', async () => {
    let longFn = async () => {
        await Util512Higher.sleep(500);
        return 123;
    };
    let start = performance.now();
    let result = await Util512Higher.runAsyncWithMinimumTime(longFn(), 100);
    assertEq(123, result);
    assertTrue(performance.now() - start > 400, 'too fast');
});
