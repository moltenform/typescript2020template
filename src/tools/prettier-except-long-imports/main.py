
# Ben Fisher, 2018
# MIT license

from place_imports_one_line import *
import check_for_null_coalesce
import check_for_long_lines
import check_tests_referenced
import help_fix_long_lines

doPlaceImportsOnOneLine = True
prettierPath = '../../node_modules/prettier/bin-prettier.js'
prettierCfg = '../../.prettierrc.js'

def go(srcdirectory):
    assertTrueMsg(files.isdir(srcdirectory), 'directory not found', srcdirectory)
    goPrettierAll(srcdirectory)

def goPrettierAll(srcdirectory):
    for f, short in files.recursefiles(srcdirectory):
        f = f.replace('\\', '/')
        if short.endswith('.ts') and not short.endswith('.d.ts'):
            trace(f)
            goPerFile(srcdirectory, f)
    
    check_tests_referenced.checkTestsReferenced()

def goPerFile(srcdirectory, f):
    # first do operations that potentially change file contents
    # must be done in this order, or the file will appear to change out from under you while editing.
    lines = doOperationsThatMightChangeFile(srcdirectory, f)
    
    # then do operations that ask the user questions
    doOperationsThatAskQuestions(srcdirectory, f, lines)

def doOperationsThatMightChangeFile(srcdirectory, f):
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
    
    check_tests_referenced.checkText(f, lines)
    help_fix_long_lines.autoHelpNamesTooLong(srcdirectory, f, lines)
    help_fix_long_lines.autoHelpLongLines(srcdirectory, f, lines)
    if linesOrig != lines:
        files.writeall(f, '\n'.join(lines), encoding='utf-8')
    return lines
        
def doOperationsThatAskQuestions(srcdirectory, f, lines):
    check_for_null_coalesce.checkText(f, lines)
    check_for_long_lines.checkText(srcdirectory, f, lines)

if __name__ == '__main__':
    dir = os.path.abspath('../../src')
    go(dir)

