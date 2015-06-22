/*!
 * 替换 HTML 文件里的资源路径
 * @author ydr.me
 * @create 2015-05-28 10:03
 */


'use strict';

var fs = require('fs-extra');
var path = require('path');
var encryption = require('ydr-utils').encryption;
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
 * @param tag {String} 待替换的标签
 * @param attrKey {String} 资源标签属性
 * @param [isReplaceToBase64WhenRelativeToFile=false] {Boolean} 是否替换为 base64 编码，当资源相对于当前文件时
 * @returns {String}
 */
module.exports = function (file, tag, attrKey, isReplaceToBase64WhenRelativeToFile) {
    var configs = global.configs;

    if (htmlAttr.get(tag, 'coolieignore')) {
        return htmlAttr.remove(tag, 'coolieignore');
    }

    var value = htmlAttr.get(tag, attrKey);
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
        log('replace resource', pathURI.toSystemPath(file), 'error');
        log('replace resource', tag, 'error');
        log('replace resource', err.message, 'error');
        log('replace ' + attrKey, value === true ? '<EMPTY>' : value, 'error');
        process.exit(1);
    }

    var b64 = configs._resBase64Map[absFile];

    // 相对当前文件 && 替换为 base64
    if (isRelativeToFile && isReplaceToBase64WhenRelativeToFile) {
        if (!b64) {
            configs._resBase64Map[absFile] = b64 = base64(absFile);
        }

        return htmlAttr.set(tag, attrKey, b64);
    }

    var version = configs._resVerMap[absFile];
    var url = configs._resURIMap[absFile];

    if (!version) {
        version = encryption.md5(absFile);
    }

    // 未进行版本构建
    if (!url) {
        var resFile = path.join(configs._destPath, configs.resource.dest, version + pathRet.extname);

        //var isImage = pathURI.isImage(pathRet.extname);

        //if (configs.resource.minify !== false && isImage) {
        //    if (!configs._resImageMap[absFile]) {
        //        configs._resImageMap[absFile] = resFile;
        //        configs._resImageList.push(absFile);
        //    }
        //} else if (configs.resource.minify === false || !isImage) {
        try {
            fs.copySync(absFile, resFile);
        } catch (err) {
            log('html file', pathURI.toSystemPath(file), 'error');
            log('copy from', pathURI.toSystemPath(absFile), 'error');
            log('copy to', pathURI.toSystemPath(resFile), 'error');
            log('copy file', err.message, 'error');
            process.exit(1);
        }
        //}

        configs._resURIMap[absFile] = url = pathURI.joinURI(configs.dest.host, path.relative(configs._destPath, resFile));
    }

    return htmlAttr.set(tag, attrKey, url + pathRet.suffix);
};