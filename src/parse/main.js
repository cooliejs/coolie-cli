/**
 * 分析出所有入口模块，包括同步、异步模块
 * @author ydr.me
 * @create 2015-10-27 10:51
 */


'use strict';

var object = require('blear.utils.object');
var collection = require('blear.utils.collection');
var path = require('blear.node.path');
var debug = require('blear.node.debug');
var random = require('blear.utils.random');
var console = require('blear.node.console');

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
 * @param options.middleware
 */
module.exports = function (options) {
    options = object.assign({}, defaults, options);

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

    collection.each(mainFiles, function (index, mainFile) {
        mainFilesMap[mainFile] = true;
    });
    mainFiles = mainFiles.map(function (file) {
        return {
            file: file,
            inType: 'js',
            outType: 'js',
            nodeModule: false
        };
    });

    /**
     * 分析模块
     * @param parentFile
     * @param metas
     */
    function parseModules(parentFile, metas) {
        collection.each(metas, function (index, meta) {
            var file = meta.file;

            if (parsedMap[file]) {
                return;
            }

            parseLength++;
            progress.run('parse module', pathURI.toRootURL(file, options.srcDirname));
            var code = reader(file, 'utf8', parentFile);

            if (options.middleware) {
                code = options.middleware.exec({
                    progress: 'pre-module',
                    file: file,
                    inType: meta.inType,
                    outType: meta.outType,
                    nodeModule: meta.nodeModule,
                    parent: parentFile,
                    code: code
                }).code;
                reader.setCache(file, 'utf8', Buffer.from(code, 'utf8'));
            }

            parsedMap[file] = true;
            // require.async()
            var requireAsyncList = parseRequireList(file, {
                code: code,
                async: true,
                srcDirname: options.srcDirname,
                coolieConfigs: options.coolieConfigs,
                srcCoolieConfigNodeModulesDirname: options.srcCoolieConfigNodeModulesDirname,
                middleware: options.middleware
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
                srcCoolieConfigNodeModulesDirname: options.srcCoolieConfigNodeModulesDirname,
                middleware: options.middleware
            });

            requireSyncList = requireSyncList.filter(function (meta) {
                return meta.inType === 'js';
            });

            if (mainFilesMap[file]) {
                mainMap[file] = {
                    async: false
                };
            }

            collection.each(requireAsyncList, function (index, asyncMeta) {
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

            collection.each(requireSyncList.concat(requireAsyncList), function (index, meta) {
                parseModules(file, [meta]);
            });
        });
    }

    parseModules(null, mainFiles);
    progress.stop('parse module', parseLength + ' 个依赖模块');

    return {
        mainMap: mainMap,
        virtualMap: virtualMap,
        parseLength: parseLength
    };
};


