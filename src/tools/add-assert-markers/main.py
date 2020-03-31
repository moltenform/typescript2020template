
from base90 import *
from assertmarkerutils import *

desiredArgIndex = {
    'makeUI512Error': 0,
    'assertTrue': 1,
    'assertTrueWarn': 1,
    'checkThrowUI512': 1,
    'throwIfUndefined': 1,
    'checkThrow': 1,
    'checkThrowEq': 2,
    'assertEq': 2,
    'assertEqWarn': 2,
    'assertThrows': 0,
    'assertThrowsAsync': 0,
}

skipThese = {
    # signatures
    'assertThrows(msgWithMark: string': True,
    'assertEqWarn(\n    expected: unknown': True,
    'expected: unknown': True,
    'condition: unknown': True,
    # ok calls that have the tag
    'makeUI512Error(msgAssertEq, c1, c2, c3': True,
    'makeUI512Error(msgInAssertEqWarn,': True,
    'makeUI512Error(msgInThrowIfUndefined': True,
    'makeUI512Error(msg: string,': True,
}

skipFiles = {
    'vpcParser.ts': True,
    'vpcTokens.ts': True,
    'vpcVisitor.ts': True,
}

sAssertsToMarker = '|'.join( '\\b' + k + '\\(' for k in desiredArgIndex.keys())
reAssertsToMarker = re.compile(sAssertsToMarker)

def go(srcdirectory, previewOnly):
    assertTrueMsg(files.isdir(srcdirectory), 'directory not found', srcdirectory)
    currentSavedFile = './current_assert_id.txt'
    firstNum = int(files.readall(currentSavedFile, encoding='utf-8').strip()) if files.exists(currentSavedFile) else 1
    state = Bucket(latestMarker = firstNum)
    marksAleadySeen = {}
    
    try:
        for f, short in files.recursefiles(srcdirectory):
            if short.lower().endswith('.ts') and not short in skipFiles:
                goForFile(f, previewOnly, state, marksAleadySeen)
    finally:
        if not previewOnly:
            trace(f'first={firstNum} last={state.latestMarker}')
            files.writeall(currentSavedFile, f'{state.latestMarker}\n', encoding='utf-8')
    
    for key in skipThese:
        if skipThese[key] != 'seen':
            warn('expected to skip this, but not seen. this might mean we accidentally wrote an assert marker ' +
                'to assertTrue itself, or it could just mean that the list is not up to date. ' + key)


def goForFile(f, previewOnly, state, marksAleadySeen):
    content = files.readall(f, encoding='utf-8')
    newcontent = goForFileProcess(f, previewOnly, state, marksAleadySeen, content)
    if newcontent != content: 
        if not previewOnly:
            files.writeall(f, newcontent, encoding='utf-8')

def goForFileProcess(f, previewOnly, state, marksAleadySeen, content):
    matches = []
    for m in re.finditer(reAssertsToMarker, content):
        which = m.group(0).split('(')[0]
        posStart = m.start(0)
        matches.append((posStart, which))
        
    # iterate the matches backwards so we can alter the string without altering indexes in the document
    matches.reverse()
    for posStart, which in matches:
        prefix, args, suffix, totalLength = parseArguments(content, posStart)
        looksLike = prefix+','.join(args)+suffix
        assertTrue(prefix.startswith(which + '('), 'wrong offset? ', looksLike)
        needRepl = processOneCall(state, content, looksLike, marksAleadySeen, posStart, which, prefix, args, suffix, totalLength)
        if needRepl:
            replWith = prefix+','.join(args)+suffix
            trace(f'\t{looksLike}\n\t{replWith}\n')
            assertTrue(len(replWith) >= totalLength, 'making it shorter?')
            content = splice(content, posStart, totalLength, replWith)
    
    return content

def processOneCall(state, content, looksLike, marksAleadySeen, posStart, which, prefix, args, suffix, totalLength):
    reFindMarker = r'''^\s*("[^"][^"]|'[^'][^']|`[^`][^`])\|'''
    reFindQuote = r'''^\s*(["'`])'''

    for key in skipThese:
        if key in looksLike:
            skipThese[key] = 'seen'
            return False

    wantIndex = desiredArgIndex[which]
    for narg, arg in enumerate(args):
        fndQuote = re.search(reFindQuote, arg)
        if fndQuote:
            fndMarker = re.search(reFindMarker, arg)
            if fndMarker:
                # already marked. make sure it's not a duplicate
                thefoundMarker = fndMarker.group(1)[1:]
                alreadySaw = marksAleadySeen.get(thefoundMarker, False)
                if not alreadySaw:
                    marksAleadySeen[thefoundMarker] = True
                    return False
                else:
                    # duplicate or invalid marker
                    newmarker = genNewMarker(state)
                    assertEq(2, len(newmarker))
                    marksAleadySeen[newmarker] = True
                    args[narg] = splice(args[narg], fndMarker.start(1)+1, 2, newmarker)
                    return True
            else:
                # string with no marker. add a marker
                if narg >= wantIndex:
                    ind = fndQuote.start(1) + 1
                    newmarker = genNewMarker(state)
                    assertEq(2, len(newmarker))
                    marksAleadySeen[newmarker] = True
                    args[narg] = splice(args[narg], ind, 0, newmarker + '|' )
                    return True
    # no string literals found at all
    assertTrue(False, 'no string literals found', looksLike)

def genNewMarker(state):
    state.latestMarker += 1
    ret = toBase90(state.latestMarker)
    ret = ret.ljust(2, '0')
    return ret

def tests():
    assertEq(('other fn(', ['1', '2', '3'], ')', 15), parseArguments("other fn(1,2,3)", 0))
    assertEq(('other fn(', ['a b', 'c d', 'e f'], ')', 21), parseArguments("other fn(a b,c d,e f)", 0))
    assertEq(('other fn(', ['ff(a)', 'ff(b)'], ')', 21), parseArguments("other fn(ff(a),ff(b))", 0))
    assertEq(('other fn(', ['ff(f1(a,b), f2(c,d))', 'ff(b)'], ')', 36), parseArguments("other fn(ff(f1(a,b), f2(c,d)),ff(b))", 0))
    assertEq(('other fn(', ['"1,2,3"', '2', '3'], ')', 21), parseArguments('other fn("1,2,3",2,3)', 0))
    assertEq(('other fn(', ['"1\\"2,3"', '2', '3'], ')', 22), parseArguments('other fn("1\\"2,3",2,3)', 0))
    assertEq(('other fn(', ["'1,2,3'", '2', '3'], ')', 21), parseArguments("other fn('1,2,3',2,3)", 0))
    assertEq(('other fn(', ["'1\\'2,3'", '2', '3'], ')', 22), parseArguments("other fn('1\\'2,3',2,3)", 0))
    assertEq(('other fn(', ['`1,2,3`', '2', '3'], ')', 21), parseArguments("other fn(`1,2,3`,2,3)", 0))
    assertEq(('other fn(', ["`1\\'2,3`", '2', '3'], ')', 22), parseArguments("other fn(`1\\'2,3`,2,3)", 0))
    assertEq(('other fn(', ['[1,2]', '2', '3'], ')', 19), parseArguments("other fn([1,2],2,3)", 0))
    assertEq(('other fn(', ['[1,f(a,b)]', '2', '3'], ')', 24), parseArguments("other fn([1,f(a,b)],2,3)", 0))
    assertEq(('other fn(', ['f([1,2],3)', '2', '3'], ')', 24), parseArguments("other fn(f([1,2],3),2,3)", 0))

    assertEq(('fn(', ['1', '2', '3'], ')', 9), parseArguments("'test_test' otherotherotherotherotherother fn(1,2,3)", 43))
    assertEq(('fn(', ['1', '2', '3'], ')', 9), parseArguments("'test\\'tes' otherotherotherotherotherother fn(1,2,3)", 43))

tests()

if __name__=='__main__':
    #~ previewOnly = True
    previewOnly = False
    dir = os.path.abspath('../../src')
    go(dir, previewOnly)

