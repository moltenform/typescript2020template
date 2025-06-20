
## Contents

- code can be organized into modules
- release builds are bundled to a single file
    - better because there are fewer network roundtrips, unless there's HTTP/2
    - better because some browsers like old mobile android don't yet support es6 modules
    - better because can import node_modules without manually copying in the src
- release builds are minifed
    - doesn't save download time because of gzip transfer
    - but better to make reverse engineering of commercial projects less trivial
    - see `optimization` in webpack config to turn on/off
- targets es2020
    - doesn't support very old mobile android
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
- development builds with `npm start` will watch+auto recompiles when source changes
- es-lint is included and working, with curated rules enabled
- no need for grunt/gulp, just use the scripts referenced in `package.json`
    - if you have a script `foo` and `prefoo`, `npm run foo` will run both.
- prettier is included and working
    - in vscode, install Prettier extension, hit ctrl-shift-p then look for Format Selection
    - confirmed that it is reading our `.prettierrc.js`
    - another way to run prettier:
        - my `prettierexceptlongimports` is included, a script that runs prettier on every file
        - it also leaves long import lines on one line as I prefer that visually
        - it also does additional prettying like removing whitespace
        - it also performs stricter checking than es-lint, for example 
        - better warnings about using `||` instead of `??`, and long lines in strings/comments 
        - to run it, `npm run prettierexceptlongimports`
- my utilities classes are included
    - `util512 utils`, along with full unit tests
    - and a simple unit test framework
- `sass`
    - decided to run sass separately, not with webpack's sass-loader
    - run `npm run buildstyle` or `npm run buildstylewatch`
    - css variables make sass less necessary.
- `number-to-words` as an example javascript+typescript types dependency
    - npm --save install @types/number-to-words
- `serializer.ts` as an example typescript dependency
    - considered TypedJSON and @jsonObject (see history of testUtilsSerialize.ts), but
    - 1) that's overkill safety for small projects, and
    - 2) modern way is to use zod or yup anyways
- includes my tool to prevent dependency cycles
    - it's useful to have strict layering, modules can only call lower in the list, not higher
    - make sure `layers.cfg` up to date, then
    - run `npm run autoimportmodules`
- code knows if built as release or not
    - use `checkIsProductionBuild()`
- code coverage
    - build development, open the site in chrome
    - press F12 for devtools, Sources tab
    - hit ctrl-p, start typing filename you are looking for 
    - you'll see a webpack:// path for it
    - do this for e.g. bwtutils.ts, bwname.ts
    - tab to the source for the ts file you care about and add a break point that will get hit when you run tests
    - hit ctrl-shift-p, then click "Performance-start instrumenting coverage and reload page"
    - run your tests, breakpoint should be hit
    - hit code is shown in blue, not-hit in red
    - retry the steps if no colors are shown or if all colors are in red,
    - it seems to not run correctly sometimes... perhaps because it takes a while to load the sourcemaps
- confirmed that async/await code runs correctly
    - load the page and click the "go async" test button
- separate tsconfig files for development and production
    - useful for e.g. ignoring unused local variables until building for production
- you can optionally run a script to add assert markers
    - if a user says they are getting an error message, you can know the origin of the error message.

This project started with the ts-loader example [here](https://github.com/TypeStrong/ts-loader/tree/master/examples/fork-ts-checker-webpack-plugin).

For more scripts, see the "scripts" section of `package.json`.

### libraries

* base64-js
* browser-detection (more recent than bowser)
* es6-error
* file-saver (more recent than FileSaver) 
* js-lru
* lodash
* lz-string
* serializer.ts
* whatwg-fetch
* map-values-deep, MIT license (pasted into source)

### libraries used solely as an example

* whatwg-fetch, MIT license

### vscode tips

* hit ctrl-shift-b, then can run the npm scripts
* can debug, if started in new chrome instance

