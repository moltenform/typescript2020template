
/* auto */ import { Util512StaticClass } from './util512Base';
/* auto */ import { assertTrue, checkThrow512, ensureIsError, respondUI512Error } from './util512Assert';
/* auto */ import { type AnyUnshapedJson, Util512, arLast, assertEq, fitIntoInclusive } from './util512';

/* (c) 2020 moltenform(Ben Fisher) */
/* Released under the MIT license */

/**
 * typescript utilities
 * contains utilities like RNG that aren't as straightforward to test.
 */
export const Util512Higher = new (class Util512Higher extends Util512StaticClass {
    /**
     * weakUuid, by broofa
     * uses the weak Math.random, not cryptographically sound.
     */
    weakUuid = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            let r = (Math.random() * 16) | 0;
            let v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };

    /**
     * random number between min and max, inclusive
     * uses the weak Math.random, don't use this for crypto.
     * slightly an uneven distribution.
     */
    getRandIntInclusiveWeak = (min: number, max: number) => {
        assertTrue(min >= 1 && max >= 1, `invalid min ${min}`);
        if (min === max) {
            return min;
        } else {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    };

    /**
     * random number between min and max, inclusive
     */
    getRandIntInclusiveStrong = (min: number, max: number) => {
        assertTrue(min >= 1 && max >= 1, 'getRandIntInclusiveStrong must be >= 1');
        min = Math.ceil(min);
        max = Math.floor(max);
        if (min === max) {
            return min;
        }

        let nRange = max - min;
        assertTrue(
            nRange > 1 && nRange < 255,
            'getRandIntInclusiveStrong too wide range'
        );
        let nextPowerOf2 = 1;
        while (nextPowerOf2 < nRange) {
            nextPowerOf2 *= 2;
        }

        /* use rejection sampling. slower, but better for uniform values */
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
    };

    /**
     * make random bytes, return as base64.
     */
    makeCryptRandString = (bytes: number) => {
        let buf = new Uint8Array(bytes);
        window.crypto.getRandomValues(buf);
        return Util512.arrayToBase64(Array.from(buf));
    };

    /**
     * generate random string, first byte is specified
     */
    generateUniqueBase64UrlSafe = (nBytes: number, charPrefix: string) => {
        assertEq(1, charPrefix.length, 'expected one char');
        let buf = new Uint8Array(nBytes + 1);
        window.crypto.getRandomValues(buf);
        buf[0] = charPrefix.charCodeAt(0);
        let dataAsString = Array.from(buf)
            .map(item => String.fromCharCode(item))
            .join('');
        return Util512.toBase64UrlSafe(dataAsString);
    };

    /**
     * download image asynchronously
     */
    beginLoadImage = (url: string, img: HTMLImageElement, callback: () => void) => {
        let haveRunCallback = false;
        let on_load = () => {
            if (!haveRunCallback) {
                haveRunCallback = true;
                callback();
            }
        };

        let on_error = () => {
            throw new Error('failed to load ' + url);
        };

        img.addEventListener('load', () =>
            showMsgIfExceptionThrown(on_load, 'LoadImage.on_load')
        );
        img.addEventListener('error', () =>
            showMsgIfExceptionThrown(on_error, 'LoadImage.on_error')
        );
        img.src = url;
        if (img.complete) {
            /* apparently it might be possible for .complete to be set
            immediately in some cases */
            showMsgIfExceptionThrown(() => {
                if (!haveRunCallback) {
                    haveRunCallback = true;
                    callback();
                }
            }, 'LoadImage.on_load');
        }
    };

    loadImageAsync(url: string, img: HTMLImageElement) {
        return new Promise<void>((resolve, reject) => {
            let haveRunCallback = false;
            img.addEventListener('load', () => {
                if (!haveRunCallback) {
                    haveRunCallback = true;
                    resolve();
                }
            });
            img.addEventListener('error', () => {
                reject(new Error('failed to load ' + url));
            });
            img.src = url;
            if (img.complete) {
                /* apparently it might be possible for .complete to be set
                immediately in some cases */
                if (!haveRunCallback) {
                    haveRunCallback = true;
                    resolve();
                }
            }
        });
    }

    /**
     * download json asynchronously. see vpcrequest.ts if sending parameters.
     */
    private loadJsonImpl = (
        url: string,
        req: XMLHttpRequest,
        callback: (s: string) => void,
        callbackOnErr: (n: number) => void
    ) => {
        req.overrideMimeType('application/json');
        req.open('GET', url, true);
        let on_load = () => {
            if (req.status >= 200 && req.status <= 299) {
                callback(req.responseText);
            } else {
                callbackOnErr(req.status);
            }
        };

        let on_error = () => {
            callbackOnErr(-1);
        };

        req.addEventListener('load', () =>
            showMsgIfExceptionThrown(on_load, 'loadJson.on_load')
        );
        req.addEventListener('error', () =>
            showMsgIfExceptionThrown(on_error, 'loadJson.on_error')
        );
        req.send();
    };

    /**
     * download json asynchronously, and return string.
     */
    asyncLoadJsonString = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            this.loadJsonImpl(
                url,
                req,
                s => {
                    resolve(s);
                },
                n => {
                    reject(new Error(`failed to load ${url}, status=${n}`));
                }
            );
        });
    };

    /**
     * download json asynchronously, and return parsed js object.
     */
    asyncLoadJson = async (url: string): Promise<AnyUnshapedJson> => {
        let s = await this.asyncLoadJsonString(url);
        return JSON.parse(s);
    };

    /**
     * load and run script. must be on same domain.
     */
    private scriptsAlreadyLoaded: Record<string, boolean> = {};
    asyncLoadJsIfNotAlreadyLoaded = (url: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            assertTrue(url.startsWith('/'));
            if (this.scriptsAlreadyLoaded[url]) {
                resolve();
                return;
            }

            let script = window.document.createElement('script');
            script.setAttribute('src', url);

            /* prevents cb from being called twice */
            let cbCalled = false;
            let on_error = () => {
                if (!cbCalled) {
                    cbCalled = true;
                    let urlsplit = url.split('/');
                    reject(new Error('Did not load ' + arLast(urlsplit)));
                }
            };

            let on_load = () => {
                if (!cbCalled) {
                    cbCalled = true;
                    this.scriptsAlreadyLoaded[url] = true;
                    resolve();
                }
            };

            script.addEventListener('load', () =>
                showMsgIfExceptionThrown(on_load, 'LoadJs.on_load')
            );
            script.addEventListener('error', () =>
                showMsgIfExceptionThrown(on_error, 'LoadJs.on_error')
            );
            /* if you need to support old browsers, use onreadystatechange */
            window.document.getElementsByTagName('head')[0].appendChild(script);
        });
    };

    /**
     * all code that goes from sync to async *must* use this method
     * so that errors can be shown, otherwise they might be invisible.
     */
    syncToAsyncTransition = <T>(fn: Promise<T>, context: string, rtype: RespondToErr) => {
        fn.then(
            () => {
                /* fulfilled with no exceptions */
            },
            (err: Error) => {
                respondUI512Error(err, context, rtype === RespondToErr.ConsoleErrOnly);
            }
        );
    };

    /**
     * essentially a replacement for timeout, but responds to exceptions.
     */
    syncToAsyncAfterPause = (
        fn: () => unknown,
        nMilliseconds: number,
        context: string,
        rtype: RespondToErr
    ) => {
        let fnWithSleep = async () => {
            await this.sleep(nMilliseconds);
            fn();
        };

        this.syncToAsyncTransition(fnWithSleep(), context, rtype);
    };

    /**
     * call this in an async function: await sleep(1000) to wait one second.
     */
    sleep = (ms: number) => {
        return new Promise<void>(resolve => {
            /* it's ok to use an old-style promise, we're not going from sync to async */
            /* eslint-disable-next-line ban/ban */
            setTimeout(resolve, ms);
        });
    };

    /**
     * rejects if operation takes too long.
     * if I threw an exception to reject from within fTimeout, I'd have to
            1) add state to ensure the timeout was cleared and
            2) use a try/finally in case fn throws exceptions
        I think my approach is simpler.
     */
    runAsyncWithTimeout = async <T>(fn: Promise<T>, ms: number): Promise<T> => {
        let tokenIndicatingTimeout = Symbol();
        let fTimeout = async () => {
            await this.sleep(ms);
            return tokenIndicatingTimeout;
        };

        let ps = [fn, fTimeout()];
        let ret = await Promise.race(ps);
        if (ret === tokenIndicatingTimeout) {
            checkThrow512(false, 'Timed out.');
        } else {
            return ret as T;
        }
    };

    /**
     * takes at least ms seconds.
     */
    runAsyncWithMinimumTime = async <T>(fn: Promise<T>, ms: number): Promise<T> => {
        let fTimeout = async (): Promise<void> => {
            return this.sleep(ms);
        };

        let ps: [Promise<T>, Promise<void>] = [fn, fTimeout()];
        let ret = await Promise.all(ps);
        return ret[0];
    };

    /**
     * get date as month day hh mm
     */
    getDateString = (includeSeconds = false) => {
        let d = new Date();
        let hours = d.getHours();
        if (hours > 12) {
            hours -= 12;
        } else if (hours === 0) {
            hours = 12;
        }

        let sc = includeSeconds ? '-' + ('0' + d.getSeconds().toString()).slice(-2) : '';
        return (
            `${d.getMonth() + 1} ${d.getDate()}, ` +
            ('0' + hours.toString()).slice(-2) +
            '-' +
            ('0' + d.getMinutes().toString()).slice(-2) +
            sc
        );
    };
})();

/**
 * by default, alert on every exception
 */
export enum RespondToErr {
    __isUI512Enum = 1,
    Alert,
    ConsoleErrOnly
}

/**
 * if an error is thrown, show a message
 */
export function showMsgIfExceptionThrown(fn: () => void, context: string): Error | true {
    try {
        fn();
        return true;
    } catch (e) {
        ensureIsError(e);
        respondUI512Error(e, context);
        return e;
    }
}

/**
 * if an error is thrown, show a warning message just in the console
 */
export function justConsoleMsgIfExceptionThrown(
    fn: () => void,
    context: string
): Error | true {
    try {
        fn();
        return true;
    } catch (e) {
        ensureIsError(e);
        respondUI512Error(e, context, true);
        return e;
    }
}

/**
 * easier-to-read type aliases
 */
export type VoidFn = () => void;
export type AsyncVoidFn = () => Promise<void>;
export type AsyncFn = () => Promise<unknown>;

/**
 * used to intentionally free memory
 */
export function SetToInvalidObjectToReleaseMemory<T>(_useToGetType: T): T {
    return undefined as any as T;
}

/**
 * CharClassify
 *
 * Permission to use, copy, modify, and distribute this software and its
 * documentation for all purposes and without fee is hereby granted,
 * provided that the above copyright notice appear in all copies and that
 * both that copyright notice and this permission notice appear in
 * supporting documentation.
 * Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>
 * Ported from C++ to TypeScript by Ben Fisher, 2017
 */
export enum CharClass {
    __isUI512Enum = 1,
    Space,
    NewLine,
    Word,
    Punctuation
}

/**
 * Porting SciTE's logic for typing move-to-next-word and move-to-prev-word.
 */
export class GetCharClass {
    static readonly a = 'a'.charCodeAt(0);
    static readonly z = 'z'.charCodeAt(0);
    static readonly A = 'A'.charCodeAt(0);
    static readonly Z = 'Z'.charCodeAt(0);
    static readonly n0 = '0'.charCodeAt(0);
    static readonly n9 = '9'.charCodeAt(0);
    static readonly hash = '#'.charCodeAt(0);
    static readonly under = '_'.charCodeAt(0);
    static readonly dash = '-'.charCodeAt(0);
    static readonly nl = '\n'.charCodeAt(0);
    static readonly cr = '\r'.charCodeAt(0);
    static readonly space = ' '.charCodeAt(0);
    static readonly nonbreakingspace = '\xCA'.charCodeAt(0);

    /**
     * classify a character as word or whitespace
     */
    static get(c: number) {
        if (c === GetCharClass.cr || c === GetCharClass.nl) {
            return CharClass.NewLine;
        } else if (
            c < 0x20 ||
            c === GetCharClass.space ||
            c === GetCharClass.nonbreakingspace
        ) {
            return CharClass.Space;
        } else if (
            (c >= 0x80 && c <= 0xff) ||
            (c >= GetCharClass.a && c <= GetCharClass.z) ||
            (c >= GetCharClass.A && c <= GetCharClass.Z) ||
            (c >= GetCharClass.n0 && c <= GetCharClass.n9) ||
            c === GetCharClass.hash ||
            c === GetCharClass.under ||
            c === GetCharClass.dash
        ) {
            return CharClass.Word;
        } else if (c <= 0xff) {
            return CharClass.Punctuation;
        } else {
            /* let's choose to treat all unicode non-ascii as word. */
            return CharClass.Word;
        }
    }

    /**
     * move left or right in the text editor...
     * charCodeAt gets the character code at an index in the string
     * len is the length of the string
     * n is current index (caret position) in the string
     * isLeft is true if moving left, false if moving right
     * isUntilWord means to keep moving until word boundary is seen.
     * returns the next caret position.
     */
    static getLeftRight(
        charCodeAt: (pos: number) => number,
        len: number,
        n: number,
        isLeft: boolean,
        isUntilWord: boolean,
        includeTrailingSpace: boolean
    ) {
        if (len === 0) {
            return n;
        }

        if (isUntilWord && isLeft) {
            if (includeTrailingSpace) {
                while (n > 0 && GetCharClass.get(charCodeAt(n - 1)) === CharClass.Space) {
                    n--;
                }
            }

            if (n > 0) {
                let classStart = GetCharClass.get(charCodeAt(n - 1));
                while (n > 0 && GetCharClass.get(charCodeAt(n - 1)) === classStart) {
                    n--;
                }
            }
        } else if (isUntilWord && !isLeft) {
            if (n === len) {
                n -= 1;
            }

            let classStart = GetCharClass.get(charCodeAt(n));
            while (n < len && GetCharClass.get(charCodeAt(n)) === classStart) {
                n++;
            }

            if (includeTrailingSpace) {
                while (n < len && GetCharClass.get(charCodeAt(n)) === CharClass.Space) {
                    n++;
                }
            }
        } else {
            n += isLeft ? -1 : 1;
        }

        return fitIntoInclusive(n, 0, len);
    }
}
