/*!
 * 替换 CSS 文件里的资源路径
 * @author ydr.me
 * @create 2015-05-28 11:07
 */


'use strict';

var htmlAttr = require('./html-attr.js');
var log = require('./log.js');
var pathURI = require('./path-uri.js');
var base64 = require('./base64.js');
var REG_HTTP = /^(https?:)?\/\//i;
var REG_ABSOLUTE = /^\//;
var REG_SUFFIX = /(\?.*|#.*)$/;


/**
 * 构建资源版本
 * @param file {String} 待替换的文件
 * @param css {String} 待替换的 CSS 文件
 * @param [isReplaceToBase64WhenRelativeToFile=false] {Boolean} 是否替换为 base64 编码，当资源相对于当前文件时
 * @returns {String}
 */
module.exports = function (file, css, isReplaceToBase64WhenRelativeToFile) {
    var configs = global.configs;


    // 绝对目录
    var absDir = isRelativeToFile ? path.dirname(file) : configs._srcPath;
    var absFile;

    try {
        absFile = path.join(absDir, value);
    } catch (err) {
        log('replace resource', pathURI.toSystemPath(file), 'error');
        log('replace resource', html, 'error');
        log('replace resource', err.message, 'error');
        log('replace ' + attrKey, value === true ? '<EMPTY>' : value, 'error');
        process.exit();
    }
};

