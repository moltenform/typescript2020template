
# Ben Fisher, 2018
# MIT license

from place_imports_one_line import *
import re

# all tests should be referenced

state = Bucket(needToReference={}, wereReferenced={}, alteredFile=False, pathTop=None)

def checkText(f, lines):
    if f.lower().endswith('testtop.ts'):
        getWereReferenced(f, lines)
    else:
        getNeedToReference(f, lines)

def getWereReferenced(f, lines):
    assertTrueMsg(not state.pathTop, 'saw two testtop?', file=f)
    state.pathTop = f
    text = '\n'.join(lines)
    pts = text.split('let colls = [')
    assertTrueMsg(len(pts) == 2, f"did not see 'let colls = ['", file=f)
    assertTrueMsg(']' in pts[1], f"did not see ']' after let colls", file=f)
    listColls = pts[1].split(']')[0]
    listColls = [s.strip() for s in listColls.split(',')]
    for s in listColls:
        assertTrueMsg(re.match('^[a-zA-Z0-9_]+$', s), f'weird collection name {s}', file=f)
        assertTrueMsg(not s in state.wereReferenced, 'dupe entry', s, file=f)
        state.wereReferenced[s] = True
    
def getNeedToReference(f, lines):
    for i in range(len(lines)):
        line = lines[i]
        if "new SimpleUtil512TestCollection('testCollectionMMMMMM')" in line:
            trace('automatically setting collection name')
            lines[i] = f"let t = new SimpleUtil512TestCollection('{getCollNameFromPath(f)}');"
            state.alteredFile = True
        elif "export let testCollectionMMMMMM = t" in line:
            trace('automatically setting collection name')
            lines[i] = f"export let {getCollNameFromPath(f)} = t;"
            state.alteredFile = True
        elif 'new SimpleUtil512TestCollection' in line:
            startWith1 = "let t = new SimpleUtil512TestCollection('"
            startWith2 = "t = new SimpleUtil512TestCollection('"
            assertTrueMsg(line.startswith(startWith1) or line.startswith(startWith2), 
                f'did not start with {startWith1}', file=f, linenum=i)
            colName = line.replace(startWith1, '').replace(startWith2, '').split("'")[0]
            assertTrueMsg(not colName in state.needToReference, 'dupe name', colName, file=f, linenum=i)
            state.needToReference[colName] = f
            
            # confirm that the next line is what we expect
            expected = f'export let {colName} = t'
            nextLine = lines[i+1]
            assertTrueMsg(nextLine.startswith(expected), f'did not start with {expected}', file=f, linenum=i+1)

def getCollNameFromPath(f):
    nameWithNoExt = files.splitext(files.getname(f))[0]
    return 'testCollection' + nameWithNoExt.replace('test', '')

def checkTestsReferenced():
    if state.alteredFile:
        trace('skipping because we modified a file, please run the script again')
        return
    
    assertTrueMsg(len(state.needToReference), "new SimpleUtil512TestCollection(' never seen?")
    assertTrueMsg(len(state.wereReferenced), "testTop.ts not seen?")
    expected = ',\n'.join(sorted(state.needToReference.keys()))
    got = ',\n'.join(sorted(state.wereReferenced.keys()))
    assertTrueMsg(expected == got, f'expected \n\n{expected}\n\n but got \n\n{got}\n\n', file=state.pathTop)

def tests():
    assertEq('testCollectionMyFile', getCollNameFromPath('./src/abc/testMyFile.ts'))
    assertEq('testCollectionMyFile', getCollNameFromPath('./src/abc/MyFile.ts'))
    assertEq('testCollectionotherFile', getCollNameFromPath('./src/abc/otherFile.js'))
    

tests()
