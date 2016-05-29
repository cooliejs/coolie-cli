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
var controller = require('ydr-utils').controller;

var reader = require('../utils/reader.js');
var pathURI = require('../utils/path-uri.js');
var progress = require('../utils/progress.js');
var parseRequireList = require('./require.js');

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
 * @param options.coolieConfigs {String} coolie-configs.js 配置
 * @param options.srcCoolieConfigNodeModulesDirname {String} node_modules 根目录
 */
module.exports = function (options) {
    options = dato.extend({}, defaults, options);

    var mainMap = {};
    var virtualMap = {};
    // 入口文件
    var mainFiles = path.glob(options.glob, {
        globOptions: options.globOptions,
        srcDirname: options.srcDirname
    });
    var mainFilesMap = {};
    var parsedMap = {};
    var parseLength = 0;

    dato.each(mainFiles, function (index, mainFile) {
        mainFilesMap[mainFile] = true;
    });

    /**
     * 分析模块
     * @param parentFile
     * @param files
     */
    function parseModules(parentFile, files) {
        dato.each(files, function (index, file) {
            if (parsedMap[file]) {
                return;
            }

            parseLength++;
            progress.run('parse module', pathURI.toRootURL(file, options.srcDirname));
            var code = reader(file, 'utf8', parentFile);
            parsedMap[file] = true;
            // require.async()
            var requireAsyncList = parseRequireList(file, {
                code: code,
                async: true,
                srcDirname: options.srcDirname,
                coolieConfigs: options.coolieConfigs,
                srcCoolieConfigNodeModulesDirname: options.srcCoolieConfigNodeModulesDirname
            });

            requireAsyncList = requireAsyncList.filter(function (meta) {
                return meta.inType === 'js';
            });

            // require()
            var requireSyncList = parseRequireList(file, {
                code: code,
                async: false,
                srcDirname: options.srcDirname,
                coolieConfigs: options.coolieConfigs,
                srcCoolieConfigNodeModulesDirname: options.srcCoolieConfigNodeModulesDirname
            });

            requireSyncList = requireSyncList.filter(function (meta) {
                return meta.inType === 'js';
            });

            if (mainFilesMap[file]) {
                mainMap[file] = {
                    async: false
                };
            }

            dato.each(requireAsyncList, function (index, asyncMeta) {
                // 将 async 模块虚拟出来
                var originalFile = asyncMeta.file;
                var virtualName = '[coolie-virtual-file]-' + random.guid();
                var virtualFile = pathURI.replaceVersion(originalFile, virtualName);
                var rawName = path.basename(asyncMeta.name);
                var virtualCode = 'module.exports = require("./' + rawName + '");';
                var virtualBuffer = new Buffer(virtualCode, ENCODING);

                //debug.info('code', code);
                //debug.info('asyncMeta', asyncMeta);
                reader.setCache(virtualFile, ENCODING, virtualBuffer);
                virtualMap[originalFile] = virtualFile;
                virtualMap[virtualFile] = originalFile;
                mainMap[virtualFile] = {
                    async: true,
                    parent: file,
                    origin: asyncMeta.file
                };
            });

            dato.each(requireSyncList.concat(requireAsyncList), function (index, meta) {
                parseModules(file, [meta.file]);
            });
        });
    }

    parseModules(null, mainFiles);
    progress.stop('parse module', parseLength + ' modules parsed');

    return {
        mainMap: mainMap,
        virtualMap: virtualMap,
        parseLength: parseLength
    };
};


