/**
 * 构建主程序
 * @author ydr.me
 * @create 2015-10-28 11:18
 */


'use strict';

var dato = require('ydr-utils').dato;

var parseCoolieConfig = require('../parse/coolie.config.js');
var buildAPP = require('./app.js');

var defaults = {};


/**
 * 构建主程序
 * @param options {Object} 配置
 * @param options.srcDirname {String} 构建根目录
 * @param options.srcCoolieConfigPath {Object} coolie.config.js 路径
 */
module.exports = function (options) {
    options = dato.extend({}, defaults, options);

    // 1. 分析配置文件
    var configs = parseCoolieConfig({
        srcDirname: options.srcDirname
    });

    // 2. 构建入口文件
    buildAPP({
        main: configs.js.main,
        chunk: configs.js.chunk,
        srcDirname: configs.srcDirname,
        destDirname: configs.destDirname,
        destResourceDirname: configs.destResourceDirname,
        destHost: configs.dest.host,
        uglifyJSOptions: configs.js.minify,
        versionLength: configs.dest.versionLength,
        minifyResource: configs.resource.minify,
        destCoolieConfigBaseDirname: configs.destCoolieConfigBaseDirname,
        destCoolieConfigChunkDirname: configs.destCoolieConfigChunkDirname,
        destCoolieConfigAsyncDirname: configs.destCoolieConfigAsyncDirname
    });
};


