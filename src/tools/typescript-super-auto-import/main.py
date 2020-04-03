
# Ben Fisher, 2018
# MIT license

from ts_exports_read import *
from ts_layers_read import *
from ts_parsing import *

# extensionInImportStatement = '.ts'
extensionInImportStatement = ''

def go(dir):
    assertTrueMsg(files.isdir(dir), 'directory not found', dir)
    useSingleQuotes = checkSingleQuotes(dir)
    confirmNoDuplicateFilenames(dir)
    layers, filesReferencedInLayers, filenamesReferencedInLayers, layersCfg = readLayersFile(dir)
    confirmLayersIncludesFiles(layersCfg, dir, filenamesReferencedInLayers)
    autoAddImports(dir, layers, useSingleQuotes)
    enforceLayering(dir)

def autoAddImports(srcdirectory, layers, useSingleQuotes):
    mapSymbolNameToLayer = {}
    
    # get a map of symbol to filename where exported from
    for layer in layers:
        layerfullpath, layershortnoext, layerdepth = layer
        symbolsInLayer = collectExports(layerfullpath)
            
        for symbol in symbolsInLayer:
            symbol = symbol.strip()
            if symbol:
                if symbol in mapSymbolNameToLayer:
                    prevFound = mapSymbolNameToLayer[symbol]
                    assertTrueMsg(symbol == 'runTestsImpl', f'dupe symbol in both {prevFound[0]} and {layer[0]}', symbol, file=layer[0])
                mapSymbolNameToLayer[symbol] = layer
    
    # add the imports
    for layer in layers:
        lines = None
        layerfullpath, layershortnoext, layerdepth = layer
        trace(layerfullpath)
        
        if layershortnoext.startswith('bridge'):
            continue
        
        lines = getFileLines(layerfullpath, tryToStripComments)
        
        addNewForThisFile = []
        for line in lines:
            if not line.strip().startswith('import ') and not line.strip().startswith('/* auto */ import'):
                for symbol in getSymbolsFromLine(line):
                    foundFromExports = mapSymbolNameToLayer.get(symbol, None)
                    if foundFromExports is not None:
                        if foundFromExports[0] == layerfullpath:
                            pass # we don't need to import from ourself
                        else:
                            addNewForThisFile.append((symbol, foundFromExports[0], foundFromExports[1]))
        
        addNewForThisFile.sort()
        # remove duplicates
        addNewForThisFile = removeListDuplicates(addNewForThisFile)
        # sort by level , low-level to high-level
        addNewForThisFile.sort(reverse=True, key=lambda item:item[2])
        
        whatToAdd = []
        currentFilename = None
        for symbol, foundFromExports0, foundFromExports1 in addNewForThisFile:
            if currentFilename != foundFromExports0:
                whatToAdd.append([foundFromExports0])
                currentFilename = foundFromExports0
            whatToAdd[-1].append(symbol)
        
        newLinesToAdd = []
        for parts in whatToAdd:
            theImports = parts[1:]
            importFromFile = getImportFromFile(srcdirectory, layerfullpath, parts[0])
            quote = "'" if useSingleQuotes else '"'
            s = f'''/* auto */ import {{ {', '.join(theImports)} }} from {quote}{importFromFile}{quote};'''
            newLinesToAdd.append(s)
        
        if newLinesToAdd:
            linesOrigFile = getFileLines(layerfullpath, False)
            linesWithNoAuto = [line for line in linesOrigFile if not (line.startswith('/* auto */ import') and '{' in line )]
            assertTrueMsg(linesWithNoAuto[0]=='', 'expected file to start with an empty line ', layer[0], file=layer[0])
            addNewLine = linesWithNoAuto[1]!=''
            if addNewLine:
                newLinesToAdd.append('')
            linesWithNoAuto[1:1] = newLinesToAdd
            
            alltxtNew = '\n'.join(linesWithNoAuto)
            if alltxtNew != '\n'.join(linesOrigFile):
                print('Writing')
                print('\n'.join(newLinesToAdd))
                files.writeall(layerfullpath, alltxtNew, encoding='utf-8')

def getImportFromFile(srcdirectory, layerfullpath, srcfilename):
    srcfilenameWithoutExt = files.splitext(srcfilename)[0]
    startdir = files.getparent(layerfullpath)
    s = './' + os.path.relpath(srcfilenameWithoutExt, startdir).replace('\\', '/')
    return s
    
def countDirDepth(s):
    return len(s.replace('\\', '/').split('/')) - 1

def checkSingleQuotes(dir):
    content = readPrettierRcContents(dir)
    if not content:
        alert('could not find .prettierrc.js, assuming single quotes')
        return True
    elif 'singleQuote:true' in content.replace(' ', ''):
        return True
    elif 'singleQuote:false' in content.replace(' ', ''):
        trace('super-auto-import supports single quotes, but most other scripts here do not.')
        trace("it'd be a good idea to audit all the scripts here and then remove this warning")
        warn('')
        return False
    else:
        assertTrueMsg(False, 'could not find singleQuote:true in prettierrc')

def enforceLayering(srcdirectory):
    print('running enforceLayering...')
    layers, filesReferencedInLayers, filenamesReferencedInLayers, layersCfg = readLayersFile(srcdirectory)
    for layer in layers:
        # read file
        basefilecontents = '\n'.join(getFileLines(layer[0], tryToStripComments))
        
        # this layer should not be able to import from anything above it
        disallowImportsFromGreaterThan = layer[2]
        for jlayer in layers:
            if jlayer[2] < disallowImportsFromGreaterThan:
                # check that the current layer didn't import from this greaterthan one
                disallowedfilename = re.escape(jlayer[1])
                assertTrueMsg(not disallowedfilename.endswith('.js') and not disallowedfilename.endswith('.ts'), disallowedfilename)
                
                # disallow "example.js", allow "_example.js_"
                if re.search(r'\b' + disallowedfilename + r'\.(ts|js)\b', basefilecontents) or \
                 re.search(r'\bfrom "[^"]*?' + disallowedfilename + r'"', basefilecontents) or \
                 re.search(r"\bfrom '[^']*?" + disallowedfilename + r"'", basefilecontents):
                    sErr = f'file {layer[0]} referred to a layer above it "{disallowedfilename}" ({jlayer[0]})'
                    showWarningGccStyle(layer[0], 1, sErr)
                    warn(sErr)
    print('layer check complete')


if __name__ == '__main__':
    dir = os.path.abspath('../../src')
    go(dir)
