const path = require('path');
const {
  isBinaryFileSync
} = require('isbinaryfile');
let logo = path.join(__dirname, 'template/assets/logo.jpg');
let isBinary = isBinaryFileSync(logo);
console.log(isBinary); // true
let main = path.join(__dirname, 'template/main.js');
isBinary = isBinaryFileSync(main);
console.log(isBinary); // false