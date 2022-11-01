
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const path = require('path');
function main() {
    let src = path.join(__dirname, `../../src/static`);
    let dest = path.join(__dirname, `../../dist/static`);
    fs.mkdirSync(dest, {recursive: true});
    fs.cpSync(src, dest, {recursive: true});
}

main(process.argv);
