/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-23 14:30
 */


'use strict';

var path = require('path');
var fs = require('fs');
var encryption = require('ydr-utils').encryption;

var replaceCoolieConfig = require('../../replace/coolie-config.js');
var file = path.join(__dirname, '../../example/src/static/js/coolie-config.js');

var code = fs.readFileSync(file, 'utf8');
var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var srcCoolieConfigJSPath = path.join(srcDirname, 'static/js/coolie-config.js');
var srcCoolieConfigAsyncDirname = path.join(srcDirname, 'static/js/async/');
var srcCoolieConfigChunkDirname = path.join(srcDirname, 'static/js/chunk/');
var testFile1 = path.join(srcDirname, 'static/js/index3-1.js');
var testFile2 = path.join(srcDirname, 'static/js/app/user/index.js');
var versionMap= {};

versionMap[testFile1] = encryption.lastModified(testFile1);
versionMap[testFile2] = encryption.lastModified(testFile2);

var ret = replaceCoolieConfig(file, {
    versionLength: 16,
    srcDirname: srcDirname,
    destDirname: destDirname,
    srcCoolieConfigJSPath: srcCoolieConfigJSPath,
    srcCoolieConfigAsyncDirname: srcCoolieConfigAsyncDirname,
    srcCoolieConfigChunkDirname: srcCoolieConfigChunkDirname,
    versionMap: versionMap,
    destHost: '/',
    code: code
});

console.log(ret);




