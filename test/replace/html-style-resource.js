/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-21 17:51
 */


'use strict';

var path = require('path');
var fs = require('fs');

var replaceHTMLStyleResource = require('../../replace/html-style-resource.js');
var file = path.join(__dirname, '../../example/src/html/replace.html');

var code = fs.readFileSync(file, 'utf8');
var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destResourceDirname = path.join(destDirname, 'res');

var ret = replaceHTMLStyleResource(file, {
    versionLength: 16,
    srcDirname: srcDirname,
    destDirname: destDirname,
    destHost: '/',
    destResourceDirname: destResourceDirname,
    code: code,
    minify: true
});

console.log(ret);

