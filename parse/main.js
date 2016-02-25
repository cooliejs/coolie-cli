/**
 * 分析出所有入口模块，包括同步、异步模块
 * @author ydr.me
 * @create 2015-10-27 10:51
 */


'use strict';

var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
var path = require('ydr-utils').path;
var debug = require('ydr-utils').debug;

var reader = require('../utils/reader.js');
var parseCMDRequire = require('./cmd-require.js');

var defaults = {
    glob: [],
    globOptions: {
        dot: false,
        nodir: true
    },
    srcDirname: null
};

/**
 * 分析出所有入口模块，包括同步、异步模块
 * @param options {Object} 配置
 * @param options.glob {String|Array} 配置
 * @param options.globOptions {Object} glob 配置
 * @param options.srcDirname {String} 原始目录
 */
module.exports = function (options) {
    options = dato.extend({}, defaults, options);

    var mainMap = {};

    // 入口文件
    var mainFiles = path.glob(options.glob, {
        globOptions: options.globOptions,
        srcDirname: options.srcDirname
    });

    dato.each(mainFiles, function (index, mainFile) {
        var code;
        try {
            code = reader(mainFile, 'utf8');
        } catch (err) {
            debug.error('parse main', path.toSystem(mainFile));
            process.exit();
        }

        var requireAsyncList = parseCMDRequire(mainFile, {
            code: code,
            async: true,
            srcDirname: options.srcDirname
        });

        mainMap[mainFile] = {
            async: false,
            requireAsyncList: requireAsyncList
        };

        dato.each(requireAsyncList, function (index, ayncMeta) {
            mainMap[ayncMeta.file] = {
                async: true,
                requireAsyncList: []
            };
        });
    });

    return mainMap;
};


