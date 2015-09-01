/*!
 * 替换 HTML 文件里的资源路径
 * @author ydr.me
 * @create 2015-05-28 10:03
 */


'use strict';

var fs = require('fs-extra');
var path = require('path');
var htmlAttr = require('./html-attr.js');
var log = require('./log.js');
var pathURI = require('./path-uri.js');
var base64 = require('./base64.js');
var copy = require('./copy.js');
var coolieIgnore = 'coolieignore';


/**
 * 构建资源版本
 * @param file {String} 待替换的文件
 * @param tag {String} 待替换的标签
 * @param attrKey {String} 资源标签属性
 * @returns {String}
 */
module.exports = function (file, tag, attrKey) {
    var configs = global.configs;

    if (htmlAttr.get(tag, coolieIgnore)) {
        return htmlAttr.remove(tag, coolieIgnore);
    }

    var value = htmlAttr.get(tag, attrKey);

    if (value === true) {
        return tag;
    }

    var pathRet = pathURI.parseURI2Path(value);

    if (!value || !pathURI.isRelatived(pathRet.path) || pathURI.isBase64(pathRet.original)) {
        return tag;
    }

    var isRelativeToFile = pathURI.isRelativeFile(pathRet.path);
    var absDir = isRelativeToFile ? path.dirname(file) : configs._srcPath;
    var absFile;

    try {
        absFile = path.join(absDir, pathRet.path);
    } catch (err) {
        log('replace file', pathURI.toSystemPath(file), 'error');
        log('replace resource', tag, 'error');
        log('replace error', err.message, 'error');
        log('replace ' + attrKey, value === true ? '<EMPTY>' : value, 'error');
        process.exit(1);
    }

    var resFile = copy(absFile, {
        version: true,
        dest: configs._resDestPath,
        logType: 1
    });
    var resRelative = pathURI.relative(configs._destPath, resFile);
    var url = pathURI.joinURI(configs.dest.host, resRelative);

    return htmlAttr.set(tag, attrKey, url + pathRet.suffix);
};