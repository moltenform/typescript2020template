
import os
import sys
import re
sys.path.append('bn_python_common.zip')
from bn_python_common import *

def getSymbolsFromLine(s):
    for m in re.finditer(r'''(^|[^'"`a-zA-Z_])([a-zA-Z_][0-9a-zA-Z_]*)''', s):
        yield m.group(2)

def getFileLines(f, tryToStripComments):
    text = files.readall(f, encoding='utf8')
    if tryToStripComments:
        text = simpleStripMultilineComments(text, '/*', '*/')
    lines = text.replace('\r\n', '\n').split('\n')
    if tryToStripComments:
        lines = [line.split('//')[0] for line in lines]
    return lines

def simpleStripMultilineComments(text, open, close):
    # still fails on strings, but handles complicated/nested cases better
    # tests in check_for_null_coalesce.py
    while True:
        fnd = text.find(open)
        if (fnd == -1):
            return text

        cls = text[fnd:].find(close)
        if (cls == -1):
            return text[0: fnd]

        cls += fnd + len(close)
        text = text[0: fnd] + text[cls:]

def assertTrueMsg(condition, *messageArgs):
    if not condition:
        s = ' '.join(map(getPrintable, messageArgs)) if messageArgs else ''
        alert('Could not continue. ' + s)
        raise AssertionError(s)

def tests():
    testinput = '''abc, def, ghi, v1'''
    expected = ['abc', 'def', 'ghi', 'v1']
    assertEq(expected, list(getSymbolsFromLine(testinput)))
    testinput = '''  x = myFn('', h.walkNext(), 'GO|');'''
    expected = ['x', 'myFn', 'h', 'walkNext']
    assertEq(expected, list(getSymbolsFromLine(testinput)))
    testinput = ''' 's1', `s2`, "s3" '''
    expected = []
    assertEq(expected, list(getSymbolsFromLine(testinput)))

tests()
