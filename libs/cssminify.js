/*!
 * cssminify.js
 * @author ydr.me
 * @create 2014-10-23 19:47
 */


"use strict";

var minifyCSS = require("clean-css");
var log = require('./log.js');
var dato = require('ydr-util').dato;
var path = require('path');
var options = {
    keepSpecialComments: 0,
    keepBreaks: false
};
var REG_URL = /url\(['"]?(.*?)['"]?\)/ig;
var REG_HTTP = /^https?:/i;


/**
 * 样式压缩
 * @param file
 * @param code
 * @param resVersionMap
 * @param [callback]
 */
module.exports = function (file, code, resVersionMap, callback) {
    try {
        code = new minifyCSS(options).minify(code);
        code = _cssUrlVersion();

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


    /**
     * 替换版本
     */
    function _cssUrlVersion() {
        var fileDir = path.dirname(file);

        return code.replace(REG_URL, function ($0, $1) {
            // 以下情况忽略添加版本号：
            // abc.png?v=123
            // abc.eot#123
            // /path/to/abc/.png
            // //path/to/abc/.png
            // http://path/to/abc/.png
            // https://path/to/abc/.png
            if (
                $1.indexOf('?') > -1 ||
                $1.indexOf('#') > -1 ||
                $1.indexOf('/') === 0 ||
                REG_HTTP.test($1)
            ) {
                return 'url(' + $1 + ')';
            }

            var absFile = path.join(fileDir, $1);
            var version = resVersionMap[absFile] || '';

            return 'url(' + $1 + (version ? '?v=' + version : '') + ')';
        });
    }
};


