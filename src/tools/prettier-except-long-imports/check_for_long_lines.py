
# Ben Fisher, 2018
# MIT license

from place_imports_one_line import *
import re

# prettier ignores long lines in multiline comments,
# so let's check ourselves.

allowSlightlyLonger = 10

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
        # iterate backwards, so that as you fix the problems, the line numbers are still valid
        walkBackwards = reversed(list(range(len(lines))))
        for i in walkBackwards:
            line = lines[i]
            if '/* check_long_lines_silence_subsequent */' in line:
                return
            if len(line) > currentPrintWidth.val + allowSlightlyLonger:
                if not 'import { ' in line:
                    helpRepaired = isOneLongStringHelpRepair(line)
                    if helpRepaired:
                        trace('automatically inserting a longstr to help you.')
                        lines[i] = helpRepaired
                    else:
                        trace(f'silence by putting /* check_long_lines_silence_subsequent */ earlier in the file')
                        showWarningGccStyle(f, i+1, f'length of line is {len(line)} which exceeds .prettierrc.js printWidth ({currentPrintWidth.val})')
                        warn('')

def isOneLongString(s):
    # is it all one long string?
    r = r"""^(\s+(?:let|const|var) \w+ = |\s+)[`"'](.+?)[`"']([,;]?)\s*$"""
    return re.match(r, s)

def isNameTooLong(s):
    # if the test name is long like this, it forces an extra indentation level for the entire test
    r = r"""^t\.(a?test)\(\s*[`"']([^\n']+)[`"'],?\s*$"""
    return re.match(r, s)

def isOneLongStringHelpRepair(s):
    found = isOneLongString(s)
    if found:
        return f"{found.group(1)} deleteThis.longstr(`{found.group(2)}`, ''){found.group(3)}"
    return None

def isNameTooLongHelpRepair(s):
    found = isNameTooLong(s)
    if found:
        return f"t.{found.group(1)}('MMMMMM', moveTheSayCallIntoTheBlockBelow, t.say(longstr(`{found.group(2)}`)),"
    return None
    
def checkTestNamesTooLong(srcdirectory, f, lines):
    def getLineOrEmpty(i):
        if i >= 0 and i < len(lines):
            return lines[i]
        else:
            return ''
            
    for i in range(len(lines)):
        twoLines = getLineOrEmpty(i) + '\n' + getLineOrEmpty(i+1)
        found = isNameTooLongHelpRepair(twoLines)
        if found:
            # we don't warn() here, but the user will get compile errors showing what happened
            trace('automatically altering the line to make it a say.')
            lines[i] = found
            lines[i+1] = ''
            
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
    
    assertTrue(isNameTooLong("t.test(\n'somelongtestname'"))
    assertTrue(isNameTooLong("t.test(\n'somelongtestname',"))
    assertTrue(isNameTooLong("t.test(\n'somelongtestname', "))
    assertTrue(isNameTooLong("t.test(\n'somelongtestname',  "))
    assertTrue(isNameTooLong("t.test(\n'some testname.with chars()',  "))
    assertTrue(isNameTooLong("t.atest(\n'somelongtestname'"))
    assertTrue(isNameTooLong("t.atest(\n'somelongtestname',"))
    assertTrue(isNameTooLong("t.atest(\n'somelongtestname', "))
    assertTrue(isNameTooLong("t.atest(\n'somelongtestname',  "))
    assertTrue(isNameTooLong("t.atest(\n'some testname.with chars()',  "))
    assertTrue(not isNameTooLong("t.test(\n'somelongtestname', ("))
    assertTrue(not isNameTooLong("t.test(\n'somelongtestname', a"))
    assertTrue(not isNameTooLong("t.atest(\n'somelongtestname', ("))
    assertTrue(not isNameTooLong("t.atest(\n'somelongtestname', a"))
    assertTrue(isNameTooLong("""t.test(\n"somelongtestname","""))
    assertTrue(not isNameTooLong("""t.atest(\n"somelongtestname", a"""))
    
    assertTrue(isOneLongString(""" 'one string'"""))
    assertTrue(isOneLongString(""" 'one string' """))
    assertTrue(isOneLongString(""" 'one string', """))
    assertTrue(isOneLongString(""" 'one string'; """))
    assertTrue(isOneLongString(""" let a = 'one string' """))
    assertTrue(isOneLongString(""" let a = 'one string', """))
    assertTrue(isOneLongString(""" let a = 'one string'; """))
    assertTrue(isOneLongString(''' "one string"'''))
    assertTrue(isOneLongString(""" "one string" """))
    assertTrue(isOneLongString(""" "one string", """))
    assertTrue(isOneLongString(""" "one string"; """))
    assertTrue(isOneLongString(""" let a = "one string" """))
    assertTrue(isOneLongString(""" let a = "one string", """))
    assertTrue(isOneLongString(""" let a = "one string"; """))

tests()
