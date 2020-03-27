

from place_imports_one_line import *
import check_for_null_coalesce
import check_for_long_lines

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
            goPrettier(srcdirectory, f)

def goPrettier(srcdirectory, f):
    # first, run prettier
    assertTrueMsg(files.exists(prettierPath), 'does not exist', prettierPath)
    assertTrueMsg(files.exists(prettierCfg), 'does not exist', prettierCfg)
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
    if linesOrig != lines:
        files.writeall(f, '\n'.join(lines), encoding='utf-8')
    
    # check for disallowed calls
    check_for_long_lines.checkText(srcdirectory, f, lines)
    check_for_null_coalesce.checkText(f, lines)

if __name__ == '__main__':
    dir = os.path.abspath('../../src')
    go(dir)

