/*!
 * 替换 coolie-config.js 里的 version 参数
 * @author ydr.me
 * @create 2014-10-24 11:30
 */

"use strict";

var dato = require('ydr-utils').dato;
var encryption = require('ydr-utils').encryption;
var path = require('ydr-utils').path;
var log = require('./log.js');
var pathURI = require('./path-uri.js');
var sign = require('./sign.js');
var jsminify = require('./jsminify.js');
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
 * @param code {String} 文件内容
 * @param versionMap {Object} 版本 MAP
 * @returns {Object}
 */
module.exports = function (code, versionMap) {
    var configs = global.configs;
    var srcPath = configs.srcDirname;
    var coolieConfigJSPath = configs.srcCoolieConfigJSPath;
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

        coolieConfig.async = path.toURI(path.relative(configs._jsBase, configs.srcAsyncDirname)) + '/';
        coolieConfig.chunk = path.toURI(path.relative(configs._jsBase, configs.srcChunkDirname)) + '/';

        log('√', 'base: "' + coolieConfig.base + '"', 'success');
        log('√', 'async: "' + coolieConfig.async + '"', 'success');
        log('√', 'chunk: "' + coolieConfig.chunk + '"', 'success');
        log('√', 'version: "' + JSON.stringify(versionMap2, null, 2) + '"', 'success');
        log('√', 'callbacks: ' + callbacks.length, 'success');

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
            code: sign('js') + '\n' + jsminify(coolieConfigJSPath, code2),
            version: encryption.md5(code2).slice(0, configs.dest.versionLength)
        };
    } catch (err) {
        log('coolie-config.js', pathURI.toSystemPath(coolieConfigJSPath), 'error');
        log('coolie-config.js', err.message, 'error');
    }
};
