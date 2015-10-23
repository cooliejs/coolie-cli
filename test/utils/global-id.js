/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-23 15:11
 */


'use strict';

var path = require('path');

var globalId = require('../../utils/global-id.js');

var file1 = 'abc';
var file2 = 'def';

var gid1 = globalId.get(file1);
var gid2 = globalId.get(file2);
var gid3 = globalId.get(file1);

console.log(gid1);
console.log(gid2);
console.log(gid3);
