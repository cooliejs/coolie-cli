/**
 * 缓存服务
 * @author ydr.me
 * @create 2016-03-03 18:02
 */


'use strict';

var cache = require('ydr-utils').cache;

var configs = require('../../configs.js');

module.exports = function (next) {
    // 缓存设置
    cache.config({
        debug: 'local' === configs.env
    });
    cache.set('app.configs', configs);

    next();
};



