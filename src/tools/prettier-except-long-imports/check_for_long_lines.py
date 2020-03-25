
from place_imports_one_line import *
import re

# prettier ignores long lines in multiline comments,
# so let's check ourselves.

def searchPrettierRc(srcdirectory):
    if files.isfile(files.join(srcdirectory, '.prettierrc.js')):
        return files.join(srcdirectory, '.prettierrc.js')
    if files.isfile(files.join(srcdirectory, 'src/.prettierrc.js')):
        return files.join(srcdirectory, 'src/.prettierrc.js')
    if files.isfile(files.join(srcdirectory, '../.prettierrc.js')):
        return files.join(srcdirectory, '../.prettierrc.js')
    if files.isfile(files.join(srcdirectory, '../src/.prettierrc.js')):
        return files.join(srcdirectory, '../src/.prettierrc.js')
    return None
    
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
    f = searchPrettierRc(srcdirectory)
    if not f:
        alert('skipping test for long lines, could not find .prettierrc.js')
        return None
    
    text = files.readall(f, encoding='utf-8')
    width = getFromPrettierRcText(text)
    if not width:
        alert('skipping test for long lines, could not find "printWidth:" in .prettierrc.js')
        return None
    
    return width

currentPrintWidth = Bucket()

def checkText(srcdirectory, f, lines):
    if not hasattr(currentPrintWidth, 'val'):
        currentPrintWidth.val =  getCurrentPrintWidth(srcdirectory)
    if currentPrintWidth.val:
        for i, line in enumerate(lines):
            if len(line) > currentPrintWidth.val:
                if not 'import { ' in line:
                    trace(f'in file "{f}" on line {i+1}:')
                    trace(f'length of line is {len(line)}')
                    trace(f'which exceeds .prettierrc.js printWidth ({currentPrintWidth.val})')
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