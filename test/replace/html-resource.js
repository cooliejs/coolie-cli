/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-21 17:51
 */


'use strict';

var path = require('path');
var fs = require('fs');

var replaceHTMLResource = require('../../replace/html-resource.js');
var file = path.join(__dirname, '../../example/src/html/replace.html');

var code = fs.readFileSync(file, 'utf8');
var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destResourceDirname = path.join(destDirname, 'res');

var ret = replaceHTMLResource(file, {
    srcDirname: srcDirname,
    destResourceDirname: destResourceDirname,
    code: code
});

//console.log(ret);

