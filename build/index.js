/**
 * 构建主程序
 * @author ydr.me
 * @create 2015-10-28 11:18
 */


'use strict';

var dato = require('ydr-utils').dato;
var debug = require('ydr-utils').debug;

var parseCoolieConfig = require('../parse/coolie.config.js');
var buildAPP = require('./app.js');
var buildCopy = require('./copy.js');

var defaults = {};


/**
 * 构建主程序
 * @param options {Object} 配置
 * @param options.srcDirname {String} 构建根目录
 */
module.exports = function (options) {
    options = dato.extend({}, defaults, options);

    var stepIndex = 0;
    var stepLength = 5;
    var beginTime = Date.now();

    // 1. 分析配置文件
    console.log();
    debug.primary(++stepIndex + '/' + stepLength, 'parse coolie config');
    var configs = parseCoolieConfig({
        srcDirname: options.srcDirname
    });
    var srcDirname = configs.srcDirname;
    var destDirname = configs.destDirname;

    // 2. 复制文件
    console.log();
    debug.primary(++stepIndex + '/' + stepLength, 'copy files');
    var copiedList = buildCopy({
        srcDirname: srcDirname,
        destDirname: destDirname,
        copy: configs.copy
    });
    if (!copiedList.length) {
        debug.warn('copy files', 'no files are copied');
    }


    // 3. 构建入口文件
    console.log();
    debug.primary(++stepIndex + '/' + stepLength, 'build main module');
    var appConfigs = buildAPP({
        main: configs.js.main,
        chunk: configs.js.chunk,
        srcDirname: srcDirname,
        destDirname: destDirname,
        destResourceDirname: configs.destResourceDirname,
        destHost: configs.dest.host,
        uglifyJSOptions: configs.js.minify,
        versionLength: configs.dest.versionLength,
        minifyResource: configs.resource.minify,
        destCoolieConfigBaseDirname: configs.destCoolieConfigBaseDirname,
        destCoolieConfigChunkDirname: configs.destCoolieConfigChunkDirname,
        destCoolieConfigAsyncDirname: configs.destCoolieConfigAsyncDirname
    });

    // 3.

    var pastTime = Date.now() - beginTime;
    console.log();
    debug.success('copy files', copiedList.length);
    debug.success('build success', 'past ' + pastTime + 'ms');
};


