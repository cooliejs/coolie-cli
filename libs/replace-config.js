/*!
 * 替换 coolie-config.js 里的 version 参数
 * @author ydr.me
 * @create 2014-10-24 11:30
 */

"use strict";

var util = require('./util.js');
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


module.exports = function (file, code) {
    //if(!REG_VERSION.test(code)){
    //    log('replace config', 'can not found version config in ' + util.fixPath(file), 'error');
    //    process.exit();
    //}
    //
    //return code.replace(REG_VERSION, 'version: "' + util.randomString(6) + '"');

    var coolieString = coolieFn.toString()
        .replace(REG_FUNCTION_START, '')
        .replace(REG_FUNCTION_END, '');

    var fn = new Function('config',coolieString + code);
    var base;
    var version = util.randomString(6);

    try {
        fn(config);

        return 'coolie.config({base:"' + config.base + '",version:"' + version + '"}).use();';
    } catch (err) {
        log('replace config', util.fixPath(file), 'error');
        log('replace config', err.message, 'error');
    }
};
