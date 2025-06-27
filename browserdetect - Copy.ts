
export enum BrowserOSInfo {
    __isUI512Enum = 1,
    Unknown,
    Windows,
    Linux,
    Mac,
    WindowsPhone,
    Android,
    Ios
}

// loosely based on https://github.com/lancedikson/bowser/blob/master/src/parser-os.js
export function guessOs(ua?: string) {
    ua = ua || window.navigator.userAgent;
    if (ua.match(/windows phone/i)) {
        return BrowserOSInfo.WindowsPhone;
    } else if (ua.match(/windows /i)) {
        return BrowserOSInfo.Windows;
    } else if (ua.match(/macintosh/i) || ua.match(/mac os/i)) {
        return BrowserOSInfo.Mac;
    } else if (ua.match(/(ipod|iphone|ipad)/i)) {
        return BrowserOSInfo.Ios;
    } else if (ua.match(/android/i) && !ua.match(/like android/i)) {
        return BrowserOSInfo.Android;
    } else if (ua.match(/linux/i)) {
        return BrowserOSInfo.Linux;
    } else {
        return BrowserOSInfo.Unknown;
    }
}

export enum BrowserOSInfoSimple {
    __isUI512Enum = 1,
    Unknown,
    WindowsOrWinPhone,
    LinuxOrAndroid,
    MacOrIos
}

export function guessOsSimple(ua?: string) {
    const result = guessOs(ua);
    const map: Record<number, BrowserOSInfoSimple> = {
        [BrowserOSInfo.Windows]: BrowserOSInfoSimple.WindowsOrWinPhone,
        [BrowserOSInfo.Linux]: BrowserOSInfoSimple.LinuxOrAndroid,
        [BrowserOSInfo.Mac]: BrowserOSInfoSimple.MacOrIos,
        [BrowserOSInfo.WindowsPhone]: BrowserOSInfoSimple.WindowsOrWinPhone,
        [BrowserOSInfo.Android]: BrowserOSInfoSimple.LinuxOrAndroid,
        [BrowserOSInfo.Ios]: BrowserOSInfoSimple.MacOrIos
    };

    return map[result] ?? BrowserOSInfoSimple.Unknown;
}

type BrowserDetectionQuestion =
    | 'isMobile'
    | 'isEdgeOrIE'
    | 'isAndroid'
    | 'isChromeOS'
    | 'isChrome'
    | 'isDuckDuckGo'
    | 'isEdge'
    | 'isFirefox'
    | 'isIe'
    | 'isIe9'
    | 'isIe10'
    | 'isIe11'
    | 'isIos'
    | 'isIosFirefox'
    | 'isIosGoogleSearchApp'
    | 'isIosSafari'
    | 'isIosWebview'
    | 'isIosUIWebview'
    | 'isIosWKWebview'
    | 'isMobileFirefox'
    | 'isOpera'
    | 'isSamsungBrowser'
    | 'isSilk'
    | 'hasSoftwareKeyboard'
    | 'supportsPaymentRequestApi'
    | 'supportsPopups';

// https://github.com/kaimallea/isMobile
declare const MSStream: any | undefined;
function isMobile(): { any?: boolean } {
    var f = {};
    var g = /iPhone/i,
        i = /iPod/i,
        j = /iPad/i,
        k = /\biOS-universal(?:.+)Mac\b/i,
        h = /\bAndroid(?:.+)Mobile\b/i,
        m = /Android/i,
        c = /(?:SD4930UR|\bSilk(?:.+)Mobile\b)/i,
        d = /Silk/i,
        b = /Windows Phone/i,
        n = /\bWindows(?:.+)ARM\b/i,
        p = /BlackBerry/i,
        q = /BB10/i,
        s = /Opera Mini/i,
        t = /\b(CriOS|Chrome)(?:.+)Mobile/i,
        u = /Mobile(?:.+)Firefox\b/i,
        v = function (l: any) {
            return (
                void 0 !== l &&
                'MacIntel' === l.platform &&
                'number' == typeof l.maxTouchPoints &&
                l.maxTouchPoints > 1 &&
                'undefined' == typeof MSStream
            );
        };
    function w(l: any) {
        return function ($: any) {
            return $.test(l);
        };
    }
    function x(l?: any) {
        var $ = { userAgent: '', platform: '', maxTouchPoints: 0 };
        l || 'undefined' == typeof navigator
            ? 'string' == typeof l
                ? ($.userAgent = l)
                : l &&
                  l.userAgent &&
                  ($ = {
                      userAgent: l.userAgent,
                      platform: l.platform,
                      maxTouchPoints: l.maxTouchPoints || 0
                  })
            : ($ = {
                  userAgent: navigator.userAgent,
                  platform: navigator.platform,
                  maxTouchPoints: navigator.maxTouchPoints || 0
              });
        var a = $.userAgent,
            e = a.split('[FBAN');
        void 0 !== e[1] && (a = e[0]),
            void 0 !== (e = a.split('Twitter'))[1] && (a = e[0]);
        var r = w(a),
            o = {
                apple: {
                    phone: r(g) && !r(b),
                    ipod: r(i),
                    tablet: !r(g) && (r(j) || v($)) && !r(b),
                    universal: r(k),
                    device: (r(g) || r(i) || r(j) || r(k) || v($)) && !r(b)
                },
                amazon: { phone: r(c), tablet: !r(c) && r(d), device: r(c) || r(d) },
                android: {
                    phone: (!r(b) && r(c)) || (!r(b) && r(h)),
                    tablet: !r(b) && !r(c) && !r(h) && (r(d) || r(m)),
                    device: (!r(b) && (r(c) || r(d) || r(h) || r(m))) || r(/\bokhttp\b/i)
                },
                windows: { phone: r(b), tablet: r(n), device: r(b) || r(n) },
                other: {
                    blackberry: r(p),
                    blackberry10: r(q),
                    opera: r(s),
                    firefox: r(u),
                    chrome: r(t),
                    device: r(p) || r(q) || r(s) || r(u) || r(t)
                },
                any: !1,
                phone: !1,
                tablet: !1
            };
        return (
            (o.any =
                o.apple.device || o.android.device || o.windows.device || o.other.device),
            (o.phone = o.apple.phone || o.android.phone || o.windows.phone),
            (o.tablet = o.apple.tablet || o.android.tablet || o.windows.tablet),
            o
        );
    }

    f = x();
    return f;
}

export async function guessBrowserInfo(
    question: BrowserDetectionQuestion
): Promise<boolean> {
    if (question === 'isMobile') {
        const objMobile = isMobile();
        return objMobile?.any;
    } else if (question === 'isEdgeOrIE') {
        return (await guessBrowserInfo('isEdge')) || (await guessBrowserInfo('isIe'));
    } else {
        const BrowserDetection = await import('@braintree/browser-detection');
        const method = BrowserDetection[question];
        return method();
    }
}
