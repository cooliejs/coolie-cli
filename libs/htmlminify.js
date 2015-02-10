/*!
 * html 去换行和 tab 符
 * @author ydr.me
 * @create 2014-11-03 17:43
 */

'use strict';

var log = require('./log.js');
var dato = require('ydr-util').dato;
var REG_LINES = /[\n\r\t]/g;
var REG_SPACES = /\s{2,}/g;
var REG_COMMENTS = /<!--[\s\S]*?-->/g;


/**
 * html minify
 * @param code
 * @param [callback]
 */
module.exports = function (file, code, callback) {
    //code = code
    //    .replace(REG_LINES, ' ')
    //    .replace(REG_COMMENTS, '')
    //    .replace(REG_SPACES, ' ');

    if (callback) {
        callback(null, code);
    } else {
        return code;
    }
};
