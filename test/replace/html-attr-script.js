/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 18:56
 */


'use strict';

var path = require('path');
var fs = require('fs');

var replaceHTMLAttrScript = require('../../replace/html-attr-script.js');
var file = path.join(__dirname, '../../example/src/html/replace.html');

var code = fs.readFileSync(file, 'utf8');
//var srcDirname = path.join(__dirname, '../../example/src/');
//var destDirname = path.join(__dirname, '../../example/dest/');
//var destResourceDirname = path.join(destDirname, 'res');

var ret = replaceHTMLAttrScript(file, {
    code: code
});

console.log(ret);



