/**
 * 构建主程序
 * @author ydr.me
 * @create 2015-10-28 11:18
 */


'use strict';

var dato = require('ydr-utils').dato;
var debug = require('ydr-utils').debug;
var fse = require('fs-extra');

var parseCoolieConfig = require('../parse/coolie.config.js');
var buildAPP = require('./app.js');
var buildCopy = require('./copy.js');
var buildHTML = require('./html.js');
var replaceCoolieConfig = require('../replace/coolie-config.js');

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
        glob: configs.js.main,
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


    // 3. 重写 coolie-config.js
    console.log();
    debug.primary(++stepIndex + '/' + stepLength, 'override coolie-config.js');
    replaceCoolieConfig(configs.srcCoolieConfigJSPath, {
        versionLength: configs.dest.versionLength,
        destCoolieConfigBaseDirname: configs.destCoolieConfigBaseDirname,
        destCoolieConfigChunkDirname: configs.destCoolieConfigChunkDirname,
        destCoolieConfigAsyncDirname: configs.destCoolieConfigAsyncDirname,
        srcDirname: srcDirname,
        destDirname: destDirname,
        destJSDirname: configs.destJSDirname,
        versionMap: dato.extend({}, appConfigs.chunkVersionMap, appConfigs.asyncVersionMap),
        destHost: configs.dest.host
    });


    // 4. 构建 html
    console.log();
    debug.primary(++stepIndex + '/' + stepLength, 'build html');
    //buildHTML({
    //    glob: [],
    //    removeHTMLYUIComments: true,
    //    removeHTMLLineComments: true,
    //    joinHTMLSpaces: true,
    //    removeHTMLBreakLines: true,
    //    versionLength: 32,
    //    srcDirname: null,
    //    destDirname: null,
    //    destJSDirname: null,
    //    destCSSDirname: null,
    //    destResourceDirname: null,
    //    destHost: '/',
    //    srcCoolieConfigBaseDirname: null,
    //    destCoolieConfigJSPath: null,
    //    minifyJS: true,
    //    minifyCSS: true,
    //    minifyResource: true,
    //    uglifyJSOptions: null,
    //    cleanCSSOptions: null,
    //    replaceCSSResource: true,
    //    mainVersionMap: null
    //});

    // 5. 生成资源地图


    // 6. 构建统计

    var pastTime = Date.now() - beginTime;
    console.log();
    debug.primary('build success', 'past ' + pastTime + 'ms');
    debug.success('copy files', copiedList.length);
};


