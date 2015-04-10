/*!
 * 替换 coolie-config.js 里的 version 参数
 * @author ydr.me
 * @create 2014-10-24 11:30
 */

"use strict";

var dato = require('ydr-utils').dato;
var path = require('path');
var log = require('./log.js');
var jsminify = require('./jsminify.js');
var REG_FUNCTION_START = /^function\s*?\(\s*\)\s*\{/;
var REG_FUNCTION_END = /\}$/;
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
 * @param srcPath {String} srcPath 源路径
 * @param coolieJSPath {String} coolieJS 路径
 * @param file {String} 文件地址
 * @param code {String} 文件内容
 * @param versionMap {Object} 版本 MAP
 * @returns {Object}
 */
module.exports = function (srcPath, coolieJSPath, file, code, versionMap) {
    var coolieString = coolieFn.toString()
        .replace(REG_FUNCTION_START, '')
        .replace(REG_FUNCTION_END, '');


    var fn = new Function('config, callbacks', coolieString + code);
    var base;
    var version = JSON.stringify(versionMap);

    try {
        fn(config, callbacks);

        var basePath = path.join(path.dirname(coolieJSPath), config.base);
        var versionMap2 = {};

        dato.each(versionMap, function (file, ver) {
            file = path.join(srcPath, file);

            var relative = path.relative(basePath, file);

            relative = dato.toURLPath(relative);
            versionMap2[relative] = ver;
        });

        version = JSON.stringify(versionMap2);

        log('√', 'base: "' + config.base + '"', 'success');
        log('√', 'host: "' + config.host + '"', 'success');
        log('√', 'version: "' + JSON.stringify(versionMap2, null, 2) + '"', 'success');
        log('√', 'callbacks: ' + callbacks.length, 'success');

        var code2 = 'coolie.config({' +
            'base:"' + config.base + '",' +
            'host:"' + config.host + '",' +
            'version:' + version + '})' +
            '.use()';

        dato.each(callbacks, function (index, callback) {
            code2 += '.callback(' + callback.toString() + ')';
        });

        code2 += ';';

        return {
            config: config,
            code: jsminify(file ,code2)
        };
    } catch (err) {
        log('coolie-config.js', dato.fixPath(file), 'error');
        log('coolie-config.js', err.message, 'error');
    }
};
