
import os
import sys
import re
sys.path.append('bn_python_common.zip')
from bn_python_common import *

def getSymbolsFromLine(s):
    for m in re.finditer(r'''(^|[^'"`a-zA-Z_])([a-zA-Z_][0-9a-zA-Z_]*)''', s):
        yield m.group(2)

def doSomeAutomaticFormatting(lines):
    if lines[-1] != '':
        print('adding final blank line')
        lines.append('')
    
    for i in range(len(lines)):
        stripped = lines[i].rstrip()
        if lines[i] != stripped:
            print('removing whitespace on right of line')
        lines[i] = stripped

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
