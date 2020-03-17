
from ts_exports_read import *
from ts_layers_read import *
from ts_parsing import *

# extensionInImportStatement = '.ts'
extensionInImportStatement = ''

def go(dir):
    confirmNoDuplicateFilenames(dir)
    layers, filesReferencedInLayers, filenamesReferencedInLayers = readLayersFile(dir)
    confirmLayersIncludesFiles(dir, filenamesReferencedInLayers)
    autoAddImports(dir, layers)
    enforceLayering(dir)

def autoAddImports(srcdirectory, layers):
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
                    assertTrue(symbol == 'runTestsImpl', f'dupe symbol in both {prevFound[0]} and {layer[0]}', symbol)
                mapSymbolNameToLayer[symbol] = layer
    
    # add the imports
    for layer in layers:
        lines = None
        layerfullpath, layershortnoext, layerdepth = layer
        trace(layerfullpath)
        
        if layershortnoext.startswith('bridge'):
            continue
        
        alltxt = files.readall(layerfullpath, encoding='utf-8')
        lines = alltxt.replace('\r\n', '\n').split('\n')
        alreadyImported = {} # it's not worth the effort to parse what has already been imported
        
        addNewForThisFile = []
        for line in lines:
            if not line.startswith('import ') and not line.startswith('/* auto */ import'):
                for symbol in getSymbolsFromLine(line):
                    if symbol in alreadyImported:
                        continue
                    
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
            s = f'''/* auto */ import {{ {', '.join(theImports)} }} from '{importFromFile}';'''
            newLinesToAdd.append(s)
        
        if newLinesToAdd:
            linesWithNoAuto = [line for line in lines if not (line.startswith('/* auto */ import') and '{' in line )]
            assertTrue(linesWithNoAuto[0]=='', 'expected file to start with an empty line '+layer[0])
            addNewLine = linesWithNoAuto[1]!=''
            if addNewLine:
                newLinesToAdd.append('')
            linesWithNoAuto[1:1] = newLinesToAdd
            
            doSomeAutomaticFormatting(linesWithNoAuto)
            alltxtNew = '\n'.join(linesWithNoAuto)
            if alltxtNew != alltxt:
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

def enforceLayering(srcdirectory):
    print('running enforceLayering...')
    layers, filesReferencedInLayers, filenamesReferencedInLayers = readLayersFile(srcdirectory)
    for layer in layers:
        # read file
        basefilecontents = files.readall(layer[0], encoding='utf-8')
        
        # this layer should not be able to import from anything above it
        disallowImportsFromGreaterThan = layer[2]
        for jlayer in layers:
            if jlayer[2] < disallowImportsFromGreaterThan:
                # check that the current layer didn't import from this greaterthan one
                disallowedfilename = re.escape(jlayer[1])
                
                # disallow "example.js", allow "_example.js_"
                if re.search(r'\b' + disallowedfilename + r'\.(ts|js)\b', basefilecontents) or \
                 re.search(r'\bfrom "[^"]*?' + disallowedfilename + r'"', basefilecontents) or \
                 re.search(r"\bfrom '[^']*?" + disallowedfilename + r"'", basefilecontents):
                    warn(f'file {layer[0]} referred to a layer above it "{disallowedfilename}" ({jlayer[0]})')
    print('layer check complete')


if __name__ == '__main__':
    dir = os.path.abspath('../../src/src')
    go(dir)
