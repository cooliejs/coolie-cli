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
var random = require('ydr-utils').random;

var reader = require('../utils/reader.js');
var pathURI = require('../utils/path-uri.js');
var parseCMDRequire = require('./cmd-require.js');

var ENCODING = 'utf8';
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
    var mainFilesMap = {};

    dato.each(mainFiles, function (index, mainFile) {
        mainFilesMap[mainFile] = true;
    });

    /**
     * 分析模块
     * @param files
     */
    function parseModules(files) {
        dato.each(files, function (index, file) {
            var code;
            try {
                code = reader(file, 'utf8');
            } catch (err) {
                debug.error('read module', path.toSystem(file));
                process.exit();
            }

            // require.async()
            var requireAsyncList = parseCMDRequire(file, {
                code: code,
                async: true,
                srcDirname: options.srcDirname
            });

            // require()
            var requireSyncList = parseCMDRequire(file, {
                code: code,
                async: false,
                srcDirname: options.srcDirname
            });

            if (mainFilesMap[file]) {
                mainMap[file] = {
                    async: false
                };
            }

            dato.each(requireAsyncList, function (index, asyncMeta) {
                // 将 async 模块虚拟出来
                var virtualName = '[coolie-virtual-file]' + random.guid();
                var virtualFile = pathURI.replaceVersion(asyncMeta.file, virtualName);
                var virtualCode = 'define(function(require){return require("' + asyncMeta.raw + '")})';
                var virtualBuffer = new Buffer(virtualCode, ENCODING);

                reader.setCache(virtualFile, ENCODING, virtualBuffer);
                mainMap[virtualFile] = {
                    async: true,
                    parent: file,
                    origin: asyncMeta.file
                };
            });

            dato.each(requireSyncList.concat(requireAsyncList), function (index, syncMeta) {
                parseModules([syncMeta.file]);
            });
        });
    }

    parseModules(mainFiles);
    return mainMap;
};


