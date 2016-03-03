/**
 * 控制台服务
 * @author ydr.me
 * @create 2016-03-03 18:02
 */


'use strict';

var console = require('ydr-utils').console;

var configs = require('../../configs.js');

module.exports = function (next) {
    // 控制台设置
    console.config({
        color: 'local' === configs.env
    });

    next();
};



