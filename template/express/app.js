/**
 * 启动文件
 * @author ydr.me
 * @create 2015-04-29 14:16
 */


'use strict';

var buildConsole = require('ydr-utils').console;

var configs = require('./configs.js');

buildConsole({
    whiteList: configs.console
});

require('./webserver/index.js')();
