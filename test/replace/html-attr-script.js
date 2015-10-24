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
var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destCoolieConfigJSPath = path.join(destDirname, 'static/js/eb21eac7c7c8278c7bf0c208efbfd663.js');
var srcCoolieConfigBaseDirname = path.join(srcDirname, 'static/js/app/');
var srcMainPath = path.join(srcDirname, 'static/js/app/index.js');
var versionMap = {};

versionMap[srcMainPath] = '00023123123123123312312';

var ret = replaceHTMLAttrScript(file, {
    code: code,
    srcDirname: srcDirname,
    srcCoolieConfigBaseDirname: srcCoolieConfigBaseDirname,
    destDirname: destDirname,
    versionMap: versionMap,
    destHost: 'http://abc.com',
    destCoolieConfigJSPath: destCoolieConfigJSPath
});

console.log(ret);



