/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 09:46
 */


'use strict';

var path = require('path');

var base64 = require('../../utils/base64.js');

var base64File = path.join(__dirname, './base64.js');

console.log(base64('1'));
console.log(base64(base64File));

