/**
 * 请求服务
 * @author ydr.me
 * @create 2016-03-03 18:02
 */


'use strict';

var request = require('ydr-utils').request;

var configs = require('../../configs.js');

module.exports = function (next) {
    // 请求设置
    request.defaults.debug = true;

    next();
};



