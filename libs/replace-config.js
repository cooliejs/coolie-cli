/*!
 * 替换 coolie-config.js 里的 version 参数
 * @author ydr.me
 * @create 2014-10-24 11:30
 */

"use strict";

var util = require('./util.js');
var log = require('./log.js');
// version: ""
var REG_VERSION = /\bversion\b\s*:\s*['"](.*?)['"]/;

module.exports = function (file, code) {
    if(!REG_VERSION.test(code)){
        log('replace config', 'can not found version config in ' + util.fixPath(file), 'error');
        process.exit();
    }

    return code.replace(REG_VERSION, 'version: "' + util.randomString(6) + '"');
};
