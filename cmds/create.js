/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-13 15:25
 */


'use strict';

var debug = require('ydr-utils').debug;

var createExpress = require('./create-express');
var banner = require('./banner.js');


/**
 * 生成模板
 * @param options {Object} 配置
 * @param options.destDirname {String} 目标目录
 * @param options.express {Boolean} 是否为 express 模板
 * @param options.static {Boolean} 是否为 static 模板
 */
module.exports = function (options) {
    banner();

    if (!options.express && !options['static']) {
        debug.warn('coolie tips', 'missing template type');
        return;
    }

    if (options.express) {
        createExpress(options);
    } else if (options.static) {
        console.log('comming soon');
    }
};

