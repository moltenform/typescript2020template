
from place_imports_one_line import *
from check_for_null_coalesce import simpleStripComments
import re

'''
es-lint's "prefer-spread" isn't strict enough, so add our own test

why disallow apply()?
the javascript interpreter might have a max number of args,
so using clever tricks like ar.splice.apply(0, 0, longArray)
are not safe in case longArray has many entries.
'''

def shouldWarnThisLine(line):
    line = simpleStripComments(line)
    reSeeApply = r'\.apply\('
    if re.search(reSeeApply, line):
        return True

def checkText(f, lines):
    for i, line in enumerate(lines):
        if shouldWarnThisLine(line):
            # for example, /* eslint-disable prefer-spread */
            if i > 0 and 'prefer-spread' in lines[i-1]:
                pass # ok, ignored
            else:
                trace(f'in file "{f}" on line {i+1}:')
                trace(f'saw a .apply() (careful, the javascript interpreter might have a max number of args)')
                trace(f'put /* eslint-disable prefer-spread */')
                trace(f'on the prior line to silence this warning')
                warn('')

def tests():
    assertTrue(shouldWarnThisLine('a.apply(b)'))
    assertTrue(shouldWarnThisLine('a.apply( b )'))
    assertTrue(shouldWarnThisLine('a.apply('))
    assertTrue(not shouldWarnThisLine('apply('))
    assertTrue(not shouldWarnThisLine('anotherapply('))
    assertTrue(not shouldWarnThisLine('a.anotherapply('))
    assertTrue(not shouldWarnThisLine('applyanother('))
    assertTrue(not shouldWarnThisLine('a.applyanother('))
    assertTrue(not shouldWarnThisLine('abc // a.apply(b)'))
    assertTrue(shouldWarnThisLine('abc a.apply(b) // def'))
    assertTrue(shouldWarnThisLine('/* abc */ a.apply(b)'))
    assertTrue(shouldWarnThisLine('abc /* def */ def a.apply(b)'))
    assertTrue(not shouldWarnThisLine('abc /* a.apply(b) */ def'))
    

tests()
