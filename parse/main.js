/**
 * 分析出所有入口模块，包括同步、异步模块
 * @author ydr.me
 * @create 2015-10-27 10:51
 */


'use strict';

var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
var glob = require('glob');


var reader = require('../utils/reader.js');

var defaults = {
    main: [],
    globConfig: {
        dot: false,
        nodir: true
    },
    srcDirname: null
};

/**
 * 分析出所有入口模块，包括同步、异步模块
 * @param options {Object} 配置
 * @param options.main {String|Array} 配置
 * @param options.globConfig {Object} glob 配置
 * @param options.srcDirname {String} 原始目录
 * @returns {Array}
 */
module.exports = function (options) {
    options = dato.extend({}, defaults, options);

    options.main = typeis.array(options.main) ? options.main : [options.main];

    var files = [];

    try {
        glob.sync();
    } catch (err) {
        // ignore
    }

    return [];
};


