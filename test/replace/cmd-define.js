/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-23 15:24
 */


'use strict';

var path = require('path');

var replaceCMDDefine = require('../../replace/cmd-define.js');
var globalId = require('../../utils/global-id.js');

var file = __filename;
var code = 'define(function(){});';
var depFileList = [file];

// 预先注入几个文件
globalId.get(file);

var ret = replaceCMDDefine(file, {
    code: code,
    depFileList: depFileList
});

console.log(ret);

