/**
 * 构建主程序
 * @author ydr.me
 * @create 2015-10-28 11:18
 */


'use strict';

var dato = require('ydr-utils').dato;

var defaults = {};


/**
 * 构建主程序
 * @param options {Object} 配置
 * @param options.srcDirname {String} 构建根目录
 * @param options.srcCoolieConfigPath {Object} coolie.config.js 路径
 */
module.exports = function (options) {
    options = dato.extend({}, defaults, options);


};


