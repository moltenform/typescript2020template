
from place_imports_one_line import *
import re

'''
@typescript-eslint/prefer-nullish-coalescing isn't strict enough, so add our own test

ok: if (a || b)
ok: while (a || b)
ok: for (i = 0; i < a || i < b; i++)
warn: var a = b || c;
warn: var a = (b || c);
if ((a > b) ||
    (c > d) ||
    (e > f)) {
}

so since our prettier rules put semicolons on everything,
a good rule of thumb is:
if the line ends with a ; it should not have a ||
'''
    
def simpleStripComments(s):
    s = simpleStripMultilineComments(s, '/*', '*/')
    # remove line comment
    s = s.split('//')[0]
    return s

def simpleStripMultilineComments(text, open, close):
    # still fails on strings, but handles complicated/nested cases better
    while True:
        fnd = text.find(open)
        if (fnd == -1):
            return text

        cls = text[fnd:].find(close)
        if (cls == -1):
            return text[0: fnd]

        cls += fnd + len(close)
        text = text[0: fnd] + text[cls:]
    
def shouldWarnThisLine(line):
    withoutComments = simpleStripComments(line)
    withoutComments = withoutComments.strip()
    if withoutComments.endswith(';') and '||' in withoutComments:
        if withoutComments.startswith('assert') or withoutComments.startswith('return '):
            return False
        else:
            return True
    else:
        return False

def checkText(f, lines):
    for i, line in enumerate(lines):
        if shouldWarnThisLine(line):
            # for example, /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
            if i > 0 and 'prefer-nullish-coalescing' in lines[i-1]:
                pass # ok, ignored
            else:
                trace(f'in file "{f}" on line {i+1}:')
                trace(f'saw a || in a context that looks like nullish-coalescing')
                trace(f'please use ?? instead or put /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */')
                trace(f'on the prior line to silence this warning')
                warn('saw a || a context that looks like nullish-coalescing')

def tests():
    assertEq('abefij', simpleStripComments('ab/* cd */ef/* gh */ij'))
    assertEq('abefij', simpleStripComments('ab/* /*cd */ef/* gh */ij'))
    assertEq('abefij', simpleStripComments('ab/* /*c /*d */ef/* gh */ij'))
    assertEq('abefij */', simpleStripComments('ab/* /*cd */ef/* gh */ij */'))
    assertEq('abefij */i', simpleStripComments('ab/* /*cd */ef/* gh */ij */i'))
    assertEq('abef', simpleStripComments('ab/* cd */ef/* gh ij'))
    assertEq('', simpleStripComments('/*ab cd ef gh ij'))
    assertEq('', simpleStripComments('/*ab cd /* ef gh ij'))
    assertEq('', simpleStripComments('/*ab cd /* ef gh ij*/'))
    assertEq('', simpleStripComments('/**/'))
    assertEq('', simpleStripComments('/**//**//**/'))
    assertEq('ab', simpleStripComments('a/**//**//**/b'))
    assertEq('ab', simpleStripComments('a/*b*//*c*//*d*/b'))
    assertEq('', simpleStripComments(''))
    assertEq('abc', simpleStripComments('abc'))
    assertEq('abc def', simpleStripComments('abc def'))
    assertEq('abc ', simpleStripComments('abc //def'))
    assertEq('abc ', simpleStripComments('abc //def//ghi'))
    assertEq('abc ', simpleStripComments('abc //def//ghi//jkl'))
    assertEq('abc ', simpleStripComments('abc /* def'))
    assertEq('abc ', simpleStripComments('abc /* def*/'))
    assertEq('abc d', simpleStripComments('abc /* def*/d'))
    assertEq('abc d', simpleStripComments('abc /* def*/d/*'))
    assertEq('abc d', simpleStripComments('abc /* def*/d/*more'))
    assertEq('abc dtext', simpleStripComments('abc /* def*/d/*more*/text'))
    assertEq('abc dtext', simpleStripComments('abc /* //def*/d/*more*/text'))
    
    assertTrue(not shouldWarnThisLine('if (a || b)'))
    assertTrue(not shouldWarnThisLine('while (a || b)'))
    assertTrue(not shouldWarnThisLine('for (i = 0; i < a || i < b; i++)'))
    assertTrue(shouldWarnThisLine('var a = b || c;'))
    assertTrue(shouldWarnThisLine('    var a = b || c;'))
    assertTrue(shouldWarnThisLine('    let a = b || c;'))
    assertTrue(shouldWarnThisLine('var a = b || c; // a comment'))
    assertTrue(shouldWarnThisLine('var a = b || c; /* a comment'))
    assertTrue(shouldWarnThisLine('var a = /* not safe */ b || c;'))
    assertTrue(shouldWarnThisLine('var a = /* not safe */ b || c; /* a comment'))
    assertTrue(shouldWarnThisLine('const a = /* not safe */ b || c; /* a comment'))
    assertTrue(not shouldWarnThisLine('const a = /* is safe b || */ c; /* a comment'))
    
    assertTrue(not shouldWarnThisLine('assertTrue(a || b)'))
    assertTrue(not shouldWarnThisLine('assertTrue(a || b);'))
    assertTrue(not shouldWarnThisLine('    assertTrue(a || b)'))
    assertTrue(not shouldWarnThisLine('    assertTrue(other(a || b))'))

tests()