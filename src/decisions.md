
### modules

* Goal: fastest compilation+type check time during development, compilation time not important for release.
* Webpack + ts-loader
    * Pro: decently fast
    * Pro: can use node style of referencing modules
    * Con: still needs to assemble a large bundle file and the source map
    * Pro: however, `main.js` is held in memory and not written to disk, so it might not be that slow.
* Using plain TypeScript compilation and es6 `<script type="module">`
    * Pro: very fast, untouched files don't need to be transpiled
    * Con: need to write one's imports as `import {foo} from './bar.js'` even in typescript, which confuses tools like webpack
        * for release can use a script like https://gist.github.com/AviVahl/40e031bd72c7264890f349020d04130a for webpack
        * or use rollupjs post transpilation.
        * there are open ts bugs on this like https://github.com/microsoft/TypeScript/issues/13422
    * Con: importing from node_modules is similarly tricky, might need to manually `import {foo} from '../../../node_modules/bar/bar.js'`
    * Con: can't use the 'importHelpers' tsconfig flag because it causes the error `Failed to resolve module specifier "tslib"` 
* We'll stick with Webpack + ts-loader for now.
  
  
* If I decide to use plain TypeScript compilation, I can write a script like `serve.js` to host the page for development.
* (features like ajax won't run from a file:// url)
```
// npm install --save-dev connect
// npm install --save-dev serve-static
let connect = require('connect');
let serveStatic = require('serve-static');

let settings = {
    maxAge: '0s',
    setHeaders: function (res, path) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0')
        res.setHeader('Last-Modified', 'Sun, 01 Jan 2014 00:00:00 GMT')
        res.setHeader('Expires', 'Sun, 01 Jan 2014 00:00:00 GMT')
        res.setHeader('Pragma', 'no-cache')
    }
}

connect().use(serveStatic('./', settings)).listen(8080, function(){
    console.log('Server running, browse to 127.0.0.1:8080 to view...');
});

```
