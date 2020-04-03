
# Ben Fisher, 2018
# MIT license

from place_imports_one_line import *
import check_for_null_coalesce
import check_for_long_lines
import check_tests_referenced
import help_fix_long_lines

doPlaceImportsOnOneLine = True
prettierCfg = '../../.prettierrc.js'
prettierPath = '../../node_modules/prettier/bin-prettier.js'

def go(srcdirectory):
    global prettierCfg, prettierPath
    assertTrueMsg(files.isdir(srcdirectory), 'directory not found', srcdirectory)
    if not files.isfile(prettierCfg):
        prettierCfg = searchForNearbyFile(dir, '.prettierrc.js')
    if not files.isfile(prettierPath):
        prettierPath = searchForNearbyFile(dir, 'node_modules/prettier/bin-prettier.js')
        
    assertTrueMsg(prettierCfg and files.isfile(prettierCfg), 
        'could not find .prettierrc.js')
    assertTrueMsg(prettierPath and files.isfile(prettierPath),
        'could not find node_modules/prettier/bin-prettier.js')
    goPrettierAll(srcdirectory, prettierPath, prettierCfg)

def goPrettierAll(srcdirectory, prettierPath, prettierCfg):
    for f, short in files.recursefiles(srcdirectory):
        f = f.replace('\\', '/')
        if short.endswith('.ts') and not short.endswith('.d.ts'):
            trace(f)
            goPerFile(srcdirectory, f, prettierPath, prettierCfg)
    
    check_tests_referenced.checkTestsReferenced()

def goPerFile(srcdirectory, f, prettierPath, prettierCfg):
    # first do operations that potentially change file contents
    # must be done in this order, or the file will appear to change out from under you while editing.
    lines = doOperationsThatMightChangeFile(srcdirectory, f, prettierPath, prettierCfg)
    
    # then do operations that ask the user questions
    doOperationsThatAskQuestions(srcdirectory, f, lines, prettierPath, prettierCfg)

def doOperationsThatMightChangeFile(srcdirectory, f, prettierPath, prettierCfg):
    # run prettier
    assertTrueMsg(files.exists(prettierPath), 'does not exist', prettierPath, file=f)
    assertTrueMsg(files.exists(prettierCfg), 'does not exist', prettierCfg, file=f)
    args = ['node', prettierPath, '--config', prettierCfg, '--write', f]
    files.run(args)

    # then, put long import statements on one line
    # we don't want the import to spill across multiple lines.
    # could maybe do this by passing a range-start to prettier, but let's write it ourselves.
    if doPlaceImportsOnOneLine:
        alltxt = files.readall(f, encoding='utf-8')
        alltxtNew = placeImportsOnOneLine(alltxt)
        if alltxt != alltxtNew:
            print('placing import {} back all on one line')
            files.writeall(f, alltxtNew, encoding='utf-8')
    
    # some simple formatting
    lines = getFileLines(f, False)
    linesOrig = list(lines)
    addFinalLineAndRemoveRightWhitespace(lines)
    
    help_fix_long_lines.autoHelpNamesTooLong(f, lines)
    help_fix_long_lines.autoHelpLongLines(f, lines, prettierCfg)
    check_tests_referenced.autoHelpSetTestName(f, lines)
    if linesOrig != lines:
        files.writeall(f, '\n'.join(lines), encoding='utf-8')
    return lines
        
def doOperationsThatAskQuestions(srcdirectory, f, lines, prettierPath, prettierCfg):
    check_tests_referenced.checkText(f, lines)
    check_for_null_coalesce.checkText(f, lines)
    check_for_long_lines.checkText(f, lines, prettierCfg)

if __name__ == '__main__':
    dir = os.path.abspath('../../src')
    go(dir)

