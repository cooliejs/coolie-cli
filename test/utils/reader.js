/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 10:01
 */


'use strict';

var path = require('path');
var fs = require('fs');

var reader = require('../../utils/reader.js');


var textFile = path.join(__dirname, '../../example/src/html/replace.html');
var ret1 = reader(textFile, 'utf8');
var ret2 = reader(textFile, 'utf8');
console.log(ret1);
console.log(ret2);

var binaryFile = path.join(__dirname, '../../example/src/favicon.ico');
var textBinaryFile3 = path.join(__dirname, 'favicon3.ico');
var textBinaryFile4 = path.join(__dirname, 'favicon4.ico');
var ret3 = reader(binaryFile);
var ret4 = reader(binaryFile);
console.log(ret3);
console.log(ret4);
fs.writeFileSync(textBinaryFile3, ret3);
fs.writeFileSync(textBinaryFile4, ret4);
