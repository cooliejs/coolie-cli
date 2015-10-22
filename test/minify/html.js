/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 17:21
 */


'use strict';

var path = require('path');
var fs = require('fs');

var minifyHTML = require('../../minify/html.js');
var file = path.join(__dirname, '../../example/src/html/index.html');

var code = fs.readFileSync(file, 'utf8');
var ret = minifyHTML(file, {
    code: code
});

console.log(ret);



