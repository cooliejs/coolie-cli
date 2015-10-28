/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-28 15:49
 */


'use strict';

var path = require('path');

var build = require('../../build/index.js');

var srcDirname = path.join(__dirname, '../../example/src/');

build({
    srcDirname: srcDirname
});


