/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 16:33
 */


'use strict';

var path = require('path');
var fs = require('fs');

var minifyCSS = require('../../minify/css.js');
var file = path.join(__dirname, '../../example/src/static/css/1.css');

var code = fs.readFileSync(file, 'utf8');
var ret = minifyCSS(file, {
    code: code
});

console.log(code);


