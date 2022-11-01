//~ import type bowser from 'bowser'


/* https://github.com/lancedikson/bowser/blob/master/src/constants.js */
export enum BowserBrowsers {
    __isUI512Enum = 1,
    unknown,
    amazon_silk,
    android,
    bada,
    blackberry,
    chrome,
    chromium,
    electron,
    epiphany,
    firefox,
    focus,
    generic,
    googlebot,
    google_search,
    ie,
    k_meleon,
    maxthon,
    edge,
    mz,
    naver,
    opera,
    opera_coast,
    phantomjs,
    puffin,
    qupzilla,
    qq,
    qqlite,
    safari,
    sailfish,
    samsung_internet,
    seamonkey,
    sleipnir,
    swing,
    tizen,
    uc,
    vivaldi,
    webos,
    wechat,
    yandex
}

export enum BowserOS {
    __isUI512Enum = 1,
    unknown,
    windowsphone,
    windows,
    macos,
    ios,
    android,
    webos,
    blackberry,
    bada,
    tizen,
    linux,
    chromeos,
    playstation4,
    roku
}

export enum BowserPlatform {
    __isUI512Enum = 1,
    unknown,
    tablet,
    mobile,
    desktop,
    tv
}

function mapToBowserBrowsers(s: string, bowserMap:Record<string, string>): BowserBrowsers {
    let map = Object.create(null);
    let assign = (k: string, v: string) => {
        k = k.toLowerCase();
        v = v.toLowerCase();
        if (!BowserBrowsers[v]) {
            console.error('get the latest bowser?', k, v);
        } else {
            map[k] = BowserBrowsers[v];
        }
    };

    for (let key in bowserMap) {
        if (typeof key === 'string' && typeof bowserMap[key] === 'string') {
            assign(key, key);
            assign(bowserMap[key], key);
        }
    }

    let ret = map[s.toLowerCase()];
    return ret ?? BowserBrowsers.unknown;
}

function mapToBowserOs(s: string, bowserMap:Record<string, string>): BowserOS {
    let map = Object.create(null);
    let assign = (k: string, v: string) => {
        k = k.toLowerCase();
        v = v.toLowerCase();
        if (!BowserOS[v]) {
            console.error('get the latest bowser?', k, v);
        } else {
            map[k] = BowserOS[v];
        }
    };

    for (let key in bowserMap) {
        if (typeof key === 'string' && typeof bowserMap[key] === 'string') {
            assign(key, key);
            assign(bowserMap[key], key);
        }
    }

    let ret = map[s.toLowerCase()];
    return ret ?? BowserOS.unknown;
}

function mapToBowserPlatform(s: string, bowserMap:Record<string, string>): BowserPlatform {
    let map = Object.create(null);
    let assign = (k: string, v: string) => {
        k = k.toLowerCase();
        v = v.toLowerCase();
        if (!BowserPlatform[v]) {
            console.error('get the latest bowser?', k, v);
        } else {
            map[k] = BowserPlatform[v];
        }
    };

    for (let key in bowserMap) {
        if (typeof key === 'string' && typeof bowserMap[key] === 'string') {
            assign(key, key);
            assign(bowserMap[key], key);
        }
    }

    let ret = map[s.toLowerCase()];
    return ret ?? BowserPlatform.unknown;
}

export async function bridgedGetAllBrowserInfo(
    s: string
): Promise<[BowserBrowsers, BowserOS, BowserPlatform]> {
    const bowser = await import('bowser')
    let rBowserBrowsers = BowserBrowsers.unknown;
    let rBowserOS = BowserOS.unknown;
    let rBowserPlatform = BowserPlatform.unknown;
    let obj = bowser.parse(s);

    let rawBrowsername = obj?.browser?.name;
    if (rawBrowsername) {
        rBowserBrowsers = mapToBowserBrowsers(rawBrowsername, bowser.BROWSER_MAP);
    }

    let rawOsName = obj?.os?.name;
    if (rawOsName) {
        rBowserOS = mapToBowserOs(rawOsName, bowser.OS_MAP);
    }

    let rawPlatform = obj?.platform?.type;
    if (rawPlatform) {
        rBowserPlatform = mapToBowserPlatform(rawPlatform, bowser.PLATFORMS_MAP);
    }

    return [rBowserBrowsers, rBowserOS, rBowserPlatform];
}

