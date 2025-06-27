
t.test('getBrowserOS', async () => {
    assertTrue(false, "havent looked at this file yet")
    let s = longstr(`Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X)
        AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A5370a
        Safari/604.1`);
    assertEq(BrowserOSInfo.Mac, guessOs(s));
    assertEq(BrowserOSInfoSimple.MacOrIos, guessOsSimple(s));
    s = longstr(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
        (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246`);
    assertEq(BrowserOSInfo.Windows, guessOs(s));
    assertEq(BrowserOSInfoSimple.WindowsOrWinPhone, guessOsSimple(s));
    s = longstr(`Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9
        (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9`);
    assertEq(BrowserOSInfo.Mac, guessOs(s));
    assertEq(BrowserOSInfoSimple.MacOrIos, guessOsSimple(s));
    s = longstr(`Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML,
        like Gecko) Chrome/47.0.2526.111 Safari/537.36`);
    assertEq(BrowserOSInfo.Windows, guessOs(s));
    assertEq(BrowserOSInfoSimple.WindowsOrWinPhone, guessOsSimple(s));
    s = longstr(`Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101
        Firefox/15.0.1`);
    assertEq(BrowserOSInfo.Linux, guessOs(s));
    assertEq(BrowserOSInfoSimple.LinuxOrAndroid, guessOsSimple(s));
    /*
        The previous version also looked for
        Windows
        iPhone|iPad|iPod,Mac OS X,MacPPC|MacIntel|Mac_PowerPC|Macintosh
        Linux|X11|UNIX
    */
});


import { BrowserOSInfo, guessBrowserInfo, guessOs } from '../external/bowser';
    await testBrowserDetection(results);

async function testBrowserDetection(results: string[]) {
    const isMobile = await guessBrowserInfo('isMobile');
    const isChrome = await guessBrowserInfo('isChrome');
    const os = guessOs();
    results.push(`isMobile=${isMobile}`);
    results.push(`isChrome=${isChrome}`);

    results.push(`os=${getEnumToStrOrFallback(BrowserOSInfo, os)}`);
}
