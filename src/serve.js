

// we're not actually in a typescript environment
// so safe to disable the warnings about require statements
/* eslint-disable @typescript-eslint/no-var-requires */
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

