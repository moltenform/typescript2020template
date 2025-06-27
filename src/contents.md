
## Contents

- code can be organized into modules
- release builds are bundled to a single file
    - better because there are fewer network roundtrips, unless there's HTTP/2
    - better because can import npm modules without manually copying in their code
- targets es2020
- source maps enabled
    - debugging in chrome+vscode is as easy as pressing F5
    - breakpoints work
- automatically add import statements
    - via vscode's feature to automatically add import statements while typing  
    - another way to add import statements:
        - my `typescript-super-auto-import` is included, a script that searches and adds import statements
        - doesn't rely on vscode
        - makes all the changes at once so it's very useful after moving code from one file to another
        - automatically removes unused imports
        - to run it, `npm run autoimportmodules`.  
- integration with vscode
    - hit Ctrl-Shift-B to run commands like lint, prettier, and autoimportmodules
    - line numbers in the output are clickable links
    - there's also integration with the SciTE code editor; edit a .ts file and press F5
- development builds with `npm run dev` will watch+auto recompile when source changes
- es-lint is included and working, with curated rules enabled
- prettier is included and working
    - in vscode, install Prettier extension, hit ctrl-shift-p then look for Format Selection
    - another way to run prettier:
        - my `prettierexceptlongimports` is included, a script that runs prettier on every file
        - it also leaves long import lines on one line as I prefer that visually
        - it also does additional prettying like removing whitespace
        - it also performs some es-lint - like checks, for example:
        - better warnings about using `||` instead of `??`, and long lines in strings/comments 
        - to run it, `npm run prettierexceptlongimports`
- utils classes are included
    - `util512 utils`, along with full unit tests
- `lzstring` as an example javascript+typescript types dependency
    - shows that node modules get bundled in successfully.
- includes my tool to prevent dependency cycles
    - it's useful to have strict layering, modules can only call lower in the list, not higher
    - write your layering in `layers.cfg` then
    - run `npm run autoimportmodules`
- code knows if built as release or not
    - use `checkIsProductionBuild()`
- code coverage
    - see vitest code coverage
- separate tsconfig files for development and production
    - useful for e.g. ignoring minor eslint items until building for production

- lost: callDebuggerIfNotInProduction(msg);, sass, assert tagging


Started with sample ts-loader code [here](https://github.com/TypeStrong/ts-loader/tree/master/examples/fork-ts-checker-webpack-plugin).

For more scripts, see the "scripts" section of `package.json`.

### libraries

* base64-js
* es6-error
* file-saver
* immer
* js-lru
* lodash
* lru-map
* lz-string

### vscode tips

* hit ctrl-shift-b, then can run the npm scripts
* the project includes a `launch.json` for an easy way to attach a debugger for client code. just run `npm run dev` in a console, then open vscode, and run the "launch chrome" debugger task.

