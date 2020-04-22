# Ben Fisher, 2018
# MIT license

from ts_parsing import *

def whichLicense(f):
    return '/* Released under the MIT license */'

def addCopyrightIfRequested(f, linesWithNoAuto, newLinesToAdd, addCopyright):
    if addCopyright and addCopyright not in '\n'.join(linesWithNoAuto):
        which = whichLicense(f)
        if which:
            newLinesToAdd.append('')
            newLinesToAdd.append(addCopyright)
            newLinesToAdd.append(which)
            newLinesToAdd.append('')





    
