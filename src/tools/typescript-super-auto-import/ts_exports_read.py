
# ts_exports_read.py
# Ben Fisher, 2017

import os
import sys
import re
from collections import OrderedDict

sys.path.append('bn_python_common.zip')
from bn_python_common import *

def collectExportsLine(line, found, which):
    pts = re.split(' +', line)
    ret = pts[which]
    ret = ret.split('<')[0]
    ret = ret.split('(')[0]
    ret = ret.split(':')[0]
    if ret in found:
        if found[ret] == 'ignore':
            pass
        else:
            trace('warning: apparently exported twice', ret)
    else:
        found[ret] = 1

def collectExports(file):
    # nb: does not yet respect commented out /* */ section
    short = os.path.split(file)[-1]
    shortd = short.replace('.ts', '.js')
    f = open(file, 'r', encoding='utf8')
    found = OrderedDict()
    for line in f:
        line = line.rstrip()
        if line.startswith('export class ') or \
            line.startswith('export function ') or \
            line.startswith('export enum ') or \
            line.startswith('export type ') or \
            line.startswith('export interface ') or \
            line.startswith('export const ') or \
            line.startswith('export let ') or \
            line.startswith('export var ') or \
            line.startswith('export type '):
            collectExportsLine(line, found, 2)
        elif line.startswith('export abstract class ') or \
            line.startswith('export async function '):
            collectExportsLine(line, found, 3)
        elif line.startswith('/* ts_exports_read.py add '):
            collectExportsAddedManually(line, found)
        elif line.startswith('/* ts_exports_read.py ignore '):
            collectExportsIgnoredManually(line, found)
    
    found = {k:found[k] for k in found if found[k] != 'ignore'}
    return found

def readAlreadyImportedNotByUs(filelines):
    # not supported since many prettifiers want to put the imports
    # on multiple lines, not worth parsing
    return {}
    if False:
        imports = dict()
        for line in filelines:
            if line.startswith('import ') and '{' in line and not '/* auto */' in line:
                a, b = line.split('{')
                c, d = line.split('}')
                for item in c.split(','):
                    imports[item.strip()] = True
        return imports

def collectExportsAddedManually(line, found):
    assertTrueMsg(line.startswith('/* ts_exports_read.py add '), 'internal error, no prefix', line)
    pts = line.replace('*/', '').replace('/* ', '').split(' ')
    pts.pop(0) # remove "ts_exports_read.py"
    pts.pop(0) # remove "add"
    for pt in pts:
        found[pt.strip()] = 1
    
def collectExportsIgnoredManually(line, found):
    assertTrueMsg(line.startswith('/* ts_exports_read.py ignore '), 'internal error, no prefix', line)
    pts = line.replace('*/', '').replace('/* ', '').split(' ')
    pts.pop(0) # remove "ts_exports_read.py"
    pts.pop(0) # remove "ignore"
    for pt in pts:
        found[pt.strip()] = 'ignore'
    
