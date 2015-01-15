/*!
 * cssminify.js
 * @author ydr.me
 * @create 2014-10-23 19:47
 */


"use strict";

var minifyCSS = require("clean-css");
var log = require('./log.js');
var dato = require('ydr-util').dato;
var options = {
    keepSpecialComments: 0,
    keepBreaks: false
};
var REG_URL = /url\(['"]?(.*?)['"]?\)/ig;


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
        log('cssminify', dato.fixPath(file), 'error');
        log('cssminify', err.message, 'error');
        process.exit();
    }
};


function _cssUrlVersion(code, version) {
    return code.replace(REG_URL, function ($0, $1) {
        // url 中没有查询字符
        if ($1.indexOf('?') > -1 || $1.indexOf('#') > -1) {
            return 'url(' + $1 + ')';
        }

        return 'url(' + $1 + '?v=' + version + ')';
    });
}


var css1 = 'body{background: url("123.png");}';
var css2 = _cssUrlVersion(css1);

console.log(css2);
