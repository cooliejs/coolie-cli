/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-21 18:36
 */


'use strict';

var path = require('path');
var fs = require('fs');

var copy = require('../../utils/copy.js');
var file = path.join(__dirname, '../../example/src/html/replace.html');

//var code = fs.readFileSync(file, 'utf8');
var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
//var destResourceDirname = path.join(destDirname, 'res');


copy(file, {
    srcDirname: srcDirname,
    destDirname: destDirname,
    copyPath: false,
    version: true
});

