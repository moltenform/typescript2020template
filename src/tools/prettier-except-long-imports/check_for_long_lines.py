
# Ben Fisher, 2018
# MIT license

from place_imports_one_line import *
import re

# prettier ignores long lines in multiline comments,
# so let's check ourselves.

allowSlightlyLonger = 10
currentPrintWidth = Bucket()
    
def getFromPrettierRcText(text):
    parts = text.split('printWidth:')
    if len(parts) <= 1:
        return None
    
    parts[1] = parts[1].strip()
    found = re.search(r'^(\d+).*', parts[1])
    if not found or not found.group(1):
        return None
    
    try:
        return int(found.group(1), 10)
    except ValueError:
        return None

def getCurrentPrintWidth(srcdirectory):
    content = readPrettierRcContents(dir)
    if not content:
        alert('skipping test for long lines, could not find .prettierrc.js')
        return None
    
    width = getFromPrettierRcText(content)
    if not width:
        alert('skipping test for long lines, could not find "printWidth:" in .prettierrc.js')
        return None
    
    return width

def isLineTooLong(lines, i):
    line = lines[i]
    if len(line) > currentPrintWidth.val + allowSlightlyLonger:
        prevLine = lines[i-1] if i>0 else ''
        if not 'import { ' in line and not '/* prettier-ignore */' in prevLine:
            if not 'deleteThis.longstr' in line: # the long-line helper put this here
                return True
    return False

def checkText(srcdirectory, f, lines):
    if not hasattr(currentPrintWidth, 'val'):
        currentPrintWidth.val =  getCurrentPrintWidth(srcdirectory)
    if currentPrintWidth.val:
        # iterate backwards, so that as you fix the problems, the line numbers are still valid
        walkBackwards = reversed(list(range(len(lines))))
        for i in walkBackwards:
            line = lines[i]
            if '/* check_long_lines_silence_subsequent */' in line:
                return
            elif isLineTooLong(lines, i):
                trace(f'silence by putting /* check_long_lines_silence_subsequent */ earlier in the file')
                trace(f'or /* prettier-ignore */ on the prior line')
                showWarningGccStyle(f, i+1, f'length of line is {len(line)} which exceeds .prettierrc.js printWidth ({currentPrintWidth.val})')
                warn('')
            
def tests():
    assertEq(20, getFromPrettierRcText('abc printWidth:20'))
    assertEq(20, getFromPrettierRcText('abc printWidth:20}'))
    assertEq(20, getFromPrettierRcText('abc printWidth:20 }'))
    assertEq(20, getFromPrettierRcText('abc printWidth:20, some other text'))
    assertEq(20, getFromPrettierRcText('abc printWidth:20 , some other text'))
    assertEq(12, getFromPrettierRcText('abc printWidth: 12'))
    assertEq(12, getFromPrettierRcText('abc printWidth: 12}'))
    assertEq(12, getFromPrettierRcText('abc printWidth: 12 }'))
    assertEq(12, getFromPrettierRcText('abc printWidth: 12, some other text'))
    assertEq(12, getFromPrettierRcText('abc printWidth: 12 , some other text'))


tests()
