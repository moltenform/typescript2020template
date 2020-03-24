
## contents

- builds typescript
- includes modules
- bundles to a single file
    - fewer network requests (unless there's SPDY)
    - some browsers like old mobile android don't support es6 modules
- can minify
    - not needed, but prevents trivial reverse engineering
    - see `optimization` in webpack config to turn on/off
- targets es5
    - being conservative to support e.g. old mobile android
- source maps, can debug in vscode
- vscode can add import statements
- "watch" auto recompiles on typescript changes
- es-lint
- scripts are in package.json, not grunt/gulp
    - if you have a script `foo` and `prefoo`, `npm run foo` will run both.
- prettier
    - in vscode, install Prettier extension,
    - hit ctrl-shift-p then look for Format Selection
    - confirmed that it is reading our `.prettierrc.js`
    - `npm run prettierexceptlongimports` to run it on every file in the project
- simple test framework
- `sass`
    - decided to run sass separately, not with webpack's sass-loader
    - run `npm buildstyle` or `npm buildstylewatch`
- `number-to-words` as an example javascript+typescript types dependency
    - npm --save install @types/number-to-words
- `serializer.ts` as an example typescript dependency
- `csv.js` as an example manually added javascript dependency
    - we manually bundle these for faster build times
- browser detection via `bowser`
    - using `bowser/bundle` instead of the default because we don't have babel/polyfill
- prevent dependency cycles
    - make sure `layers.cfg` up to date, then
    - run `npm run autoimportmodules`
- python script for auto-import
    - run `npm run autoimportmodules`
- run prettier on all files, and then put long imports back on one line
    - run `npm run prettierexceptlongimports`
    - also checks for nullable coalesce
- code knows if built as release or not
    - use `checkIsRelease()`
- set output bundle filename so that it can be incremented when updated?
    - no, this can be done in a later build script
- code coverage
        -build development, open the site in chrome
        -press F12 for devtools, Sources tab
        -hit ctrl-p, start typing filename you are looking for 
        - you'll see a webpack:// path for it
        -do this for e.g. bwtutils.ts, bwname.ts
        -tab to the source for the ts file you care about and add a break point that will get hit when you run tests
        -hit ctrl-shift-p, then click "Performance-start instrumenting coverage and reload page"
        -run your tests, breakpoint should be hit
        -hit code is shown in blue, not-hit in red
        -retry the steps if no colors are shown or if all colors are in red, it seems to not run correctly sometimes... perhaps because Chrome takes a while to load the sourcemaps
- confirmed that async code runs correctly
    - hit the "go async" test button

A few other scripts can be found and run the same way, in the "scripts" section of `package.json`.



