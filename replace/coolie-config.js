/**
 * replace coolie-config.js
 * @author ydr.me
 * @create 2015-10-23 14:10
 */


'use strict';

var dato = require('ydr-utils').dato;
var encryption = require('ydr-utils').encryption;
var path = require('ydr-utils').path;
var debug = require('ydr-utils').debug;

var pathURI = require('../utils/path-uri.js');
var minifyJS = require('../minify/js.js');

var REG_FUNCTION_START = /^function\s*?\(\s*\)\s*\{/;
var REG_FUNCTION_END = /}$/;
var coolieConfig = {};
var config = {};
var callbacks = [];
var coolieFn = function () {
    var coolie = {
        config: function (cnf) {
            cnf = cnf || {};

            config.base = cnf.base || '';
            config.version = cnf.version || '';
            config.host = cnf.host || '';

            return coolie;
        },
        use: function () {
            return coolie;
        },
        callback: function (fn) {
            if (typeof(fn) === 'function') {
                callbacks.push(fn);
            }

            return coolie;
        }
    };
};


/**
 * 构建配置文件
 * @param file {String} 文件内容
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.srcCoolieConfigJSPath {String} coolie-config.js 路径
 * @param options.srcCoolieConfigAsyncDirname {String} coolie-config.js base 目录
 * @param options.srcCoolieConfigChunkDirname {String} coolie-config.js base 目录
 * @param options.srcDirname {String} 构建根目录
 * @param options.versionMap {Object} 版本配置 {file: version}
 * @param options.versionLength {Number} 版本长度
 * @returns {Object}
 */
module.exports = function (file, options) {
    var code = options.code;
    var versionMap = options.versionMap;
    var srcPath = options.srcDirname;
    var coolieConfigJSPath = options.srcCoolieConfigJSPath;
    var coolieString = coolieFn.toString()
        .replace(REG_FUNCTION_START, '')
        .replace(REG_FUNCTION_END, '');
    var fn = new Function('config, callbacks', coolieString + code);
    var base;
    var version = JSON.stringify(versionMap);

    try {
        fn(coolieConfig, callbacks);

        /**
         * adapt to coolie@0.9.0
         */
        var basePath = path.join(path.dirname(coolieConfigJSPath), coolieConfig.base);
        var versionMap2 = {};

        dato.each(versionMap, function (file, ver) {
            file = path.join(srcPath, file);

            var relative = pathURI.relative(basePath, file);

            relative = pathURI.toURIPath(relative);
            versionMap2[relative] = ver;
        });

        version = JSON.stringify(versionMap2);

        coolieConfig.async = path.toURI(path.relative(basePath, options.srcCoolieConfigAsyncDirname)) + '/';
        coolieConfig.chunk = path.toURI(path.relative(basePath, options.srcCoolieConfigChunkDirname)) + '/';

        debug.success('√', 'base: "' + coolieConfig.base + '"');
        debug.success('√', 'async: "' + coolieConfig.async + '"');
        debug.success('√', 'chunk: "' + coolieConfig.chunk + '"');
        debug.success('√', 'version: "' + JSON.stringify(versionMap2, null, 2) + '"');
        debug.success('√', 'callbacks: ' + callbacks.length);

        var code2 = 'coolie.config({' +
            'base:"' + coolieConfig.base + '",' +
            'async:"' + coolieConfig.async + '",' +
            'chunk:"' + coolieConfig.chunk + '",' +
            'debug:false,' +
            'cache:true,' +
            'version:' + version + '})' +
            '.use()';

        dato.each(callbacks, function (index, callback) {
            code2 += '.callback(' + callback.toString() + ')';
        });

        code2 += ';';

        return {
            config: coolieConfig,
            code: minifyJS(coolieConfigJSPath, {
                code: code2
            }),
            version: encryption.md5(code2).slice(0, options.versionLength)
        };
    } catch (err) {
        debug.error('coolie-config.js', pathURI.toSystemPath(coolieConfigJSPath));
        debug.error('coolie-config.js', err.message);
    }
};



