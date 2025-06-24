
### quick server
  
* If I decide to use plain TypeScript compilation, I can write a script like `serve.js` to host the page for development.
* (you can't host a modern webapp from a file:// url)

```
// in a terminal, run
// npm install --save-dev connect
// npm install --save-dev serve-static
// then in serve.js add the following,
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
