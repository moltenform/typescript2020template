
/* auto */ import { O, assertTrue, checkThrowUI512, makeUI512Error, } from './benBaseUtilsAssert';
/* auto */ import { AnyJson, BrowserOSInfo, Util512, assertEq } from './benBaseUtils';

// moltenform.com(Ben Fisher), 2020
// MIT license

export class Util512Higher {
    /**
     * weakUuid, by broofa
     * uses the weak Math.random, not cryptographically sound.
     */
    static weakUuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            let r = (Math.random() * 16) | 0;
            let v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * random number between min and max, inclusive
     * uses the weak Math.random, don't use this for crypto.
     * slightly an uneven distribution.
     */
    static getRandIntInclusiveWeak(min: number, max: number) {
        assertTrue(min >= 1 && max >= 1, `4M|invalid min ${min}`);
        if (min === max) {
            return min;
        } else {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    /**
     * random number between min and max, inclusive
     */
    static getRandIntInclusiveStrong(min: number, max: number) {
        assertTrue(min >= 1 && max >= 1, 'getRandIntInclusiveStrong must be >= 1');
        min = Math.ceil(min);
        max = Math.floor(max);
        let nRange = max - min;
        assertTrue(
            nRange > 1 && nRange < 255,
            'getRandIntInclusiveStrong too wide range',
        );
        let nextPowerOf2 = 1;
        while (nextPowerOf2 < nRange) {
            nextPowerOf2 *= 2;
        }

        // use rejection sampling. slower, but better for uniform values
        let buf = new Uint8Array(8);
        while (true) {
            window.crypto.getRandomValues(buf);
            for (let i = 0; i < buf.length; i++) {
                assertTrue(buf[i] >= 0 && buf[i] < 256, 'out of range');
                let v = buf[i] % nextPowerOf2;
                if (v <= nRange) {
                    return min + v;
                }
            }
        }
    }

    /**
     * make random bytes, return as base64.
     */
    static makeCryptRandString(bytes: number) {
        let buf = new Uint8Array(bytes);
        window.crypto.getRandomValues(buf);
        return Util512.arrayToBase64(Array.from(buf));
    }

    /**
     * generate random string, first byte is specified
     */
    static generateUniqueBase64UrlSafe(nBytes: number, charPrefix: string) {
        assertEq(1, charPrefix.length, 'expected one char');
        let buf = new Uint8Array(nBytes + 1);
        window.crypto.getRandomValues(buf);
        buf[0] = charPrefix.charCodeAt(0);
        let dataAsString = Array.from(buf)
            .map(item => String.fromCharCode(item))
            .join('');
        return Util512.toBase64UrlSafe(dataAsString);
    }

    /**
     * download image asynchronously
     */
    static beginLoadImage(url: string, img: HTMLImageElement, callback: () => void) {
        let haveRunCallback = false;
        img.addEventListener('load', () => {
            if (!haveRunCallback) {
                haveRunCallback = true;
                callback();
            }
        });
        img.onerror = () => {
            throw makeUI512Error('4L|failed to load ' + url);
        };
        img.src = url;
        if (img.complete) {
            /* some sources say it might be possible for .complete to be set
            immediately if image was cached */
            haveRunCallback = true;
            callback();
        }
    }

    /**
     * download json asynchronously. see vpcrequest.ts if sending parameters.
     */
    static beginLoadJson(
        url: string,
        req: XMLHttpRequest,
        callback: (s: string) => void,
        callbackOnErr?: () => void,
    ) {
        req.overrideMimeType('application/json');
        req.open('GET', url, true);
        if (!callbackOnErr) {
            callbackOnErr = () => {
                throw makeUI512Error(`4K|failed to load ${url}, status=${req.status}`);
            };
        }

        req.addEventListener('load', () => {
            if (req.status === 200) {
                callback(req.responseText);
            } else if (callbackOnErr) {
                callbackOnErr();
            }
        });

        req.addEventListener('error', () => {
            if (callbackOnErr) {
                callbackOnErr();
            }
        });

        req.send();
    }

    /**
     * download json asynchronously, and return parsed js object.
     */
    static asyncBeginLoadJson(url: string): Promise<AnyJson> {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            Util512Higher.beginLoadJson(
                url,
                req,
                s => {
                    let parsed = undefined;
                    try {
                        parsed = JSON.parse(s);
                    } catch (e) {
                        reject(e);
                    }

                    resolve(parsed);
                },
                () => reject(new Error(`4K|failed to load ${url}, status=${req.status}`)),
            );
        });
    }

    /**
     * load and run script. must be on same domain.
     */
    static scriptsAlreadyLoaded: { [key: string]: boolean } = {};
    static asyncLoadJsIfNotAlreadyLoaded(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            assertTrue(url.startsWith('/'), 'J8|');
            if (Util512Higher.scriptsAlreadyLoaded[url]) {
                resolve();
                return;
            }

            let script = window.document.createElement('script');
            script.setAttribute('src', url);

            /* prevents cb from being called twice */
            let loaded = false;
            script.onerror = () => {
                let urlsplit = url.split('/');
                reject(new Error('Did not load ' + urlsplit[urlsplit.length - 1]));
            };

            script.onload = () => {
                if (!loaded) {
                    Util512Higher.scriptsAlreadyLoaded[url] = true;
                    loaded = true;
                    resolve();
                }
            };

            (script as any).onreadystatechange = script.onload; /* browser compat */

            window.document.getElementsByTagName('head')[0].appendChild(script);
        });
    }
}

/**
 * root (top-level) object
 */
export interface UI512IsDrawTextInterface {}
export interface UI512IsDrawIconInterface {}
export interface UI512IsSessionInterface {}
export interface UI512IsPresenterInterface {}
export interface UI512IsEventInterface {}
export interface Root {
    invalidateAll(): void;
    getDrawText(): UI512IsDrawTextInterface;
    getDrawIcon(): UI512IsDrawIconInterface;
    getSession(): O<UI512IsSessionInterface>;
    setSession(session: O<UI512IsSessionInterface>): void;
    getBrowserInfo(): BrowserOSInfo;
    setTimerRate(s: string): void;
    sendEvent(evt: UI512IsEventInterface): void;
    replaceCurrentPresenter(pr: O<UI512IsPresenterInterface>): void;
    runTests(all: boolean): void;
}

/**
 * get top-level object
 */
let rootHolder: Root[] = [];
export function getRoot(): Root {
    checkThrowUI512(rootHolder[0], 'J6|root not yet set.');
    return rootHolder[0];
}

/**
 * set top-level object
 */
export function setRoot(r: Root) {
    rootHolder[0] = r;
}

/**
 * sleep, if called in an async function.
 * await sleep(1000) to wait one second.
 */
export function sleep(ms: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, ms);
    });
}

/**
 * get date as month day hh mm
 */
export function getdatestring(includeSeconds = false) {
    let d = new Date();
    let hours = d.getHours();
    if (hours > 12) {
        hours -= 12;
    } else if (hours === 0) {
        hours = 12;
    }

    let sc = includeSeconds ? '-' + ('0' + d.getSeconds()).slice(-2) : '';
    return (
        `${d.getMonth() + 1} ${d.getDate()}, ` +
        ('0' + hours).slice(-2) +
        '-' +
        ('0' + d.getMinutes()).slice(-2) +
        sc
    );
}
