/*!
 * 替换 coolie-config.js 里的 version 参数
 * @author ydr.me
 * @create 2014-10-24 11:30
 */

"use strict";

var ydrUtil = require('ydr-util');
var log = require('./log.js');
var REG_FUNCTION_START = /^function\s*?\(\s*\)\s*\{/;
var REG_FUNCTION_END = /\}$/;
var config = {};
var coolieFn = function () {
    var coolie = {
        config: function (cnf) {
            cnf = cnf || {};

            config.base = cnf.base || '';
            config.version = cnf.version || '';

            return this;
        },
        use: function () {
            return this;
        }
    };
};


/**
 * 构建配置文件
 * @param file {String} 文件地址
 * @param code {String} 文件内容
 * @param versionMap {Object} 版本 MAP
 * @returns {Object}
 */
module.exports = function (file, code, versionMap) {
    var coolieString = coolieFn.toString()
        .replace(REG_FUNCTION_START, '')
        .replace(REG_FUNCTION_END, '');

    var fn = new Function('config', coolieString + code);
    var base;
    var version = JSON.stringify(versionMap);

    try {
        fn(config);

        log('coolie config', 'base: "' + config.base + '"', 'success');
        log('coolie config', 'version: "' + JSON.stringify(versionMap, null, 4) + '"', 'success');
        return {
            config: config,
            code: 'coolie.config({base:"' + config.base + '",version:' + version + '}).use();'
        };
    } catch (err) {
        log('replace config', ydrUtil.dato.fixPath(file), 'error');
        log('replace config', err.message, 'error');
    }
};
