/*!
 * cssminify.js
 * @author ydr.me
 * @create 2014-10-23 19:47
 */


"use strict";

var minifyCSS = require("clean-css");
var log = require('./log.js');
var ydrUtil = require('ydr-util');
var options = {
    keepSpecialComments: 0,
    keepBreaks: false
};


/**
 * 样式压缩
 * @param code
 * @param [callback]
 */
module.exports = function (file, code, callback) {
    try {
        code = new minifyCSS(options).minify(code);

        if (callback) {
            callback(null, code);
        } else {
            return code;
        }
    } catch (err) {
        log('cssminify', ydrUtil.dato.fixPath(file), 'error');
        log('cssminify', err.message, 'error');
        process.exit();
    }
};