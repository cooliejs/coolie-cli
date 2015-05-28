/*!
 * 文件描述
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
var REG_HTTP = /^(https?:)?\/\//i;
var REG_ABSOLUTE = /^\//;
var REG_SUFFIX = /(\?.*|#.*)$/;



/**
 * 构建资源版本
 * @param file
 * @param html
 * @param attrKey
 * @returns {String}
 * @private
 */
module.exports = function (file, html, attrKey) {
    var configs = global.configs;

    if (htmlAttr.get(html, 'coolieIgnore')) {
        return htmlAttr.remove(html, 'coolieIgnore');
    }

    var value = htmlAttr.get(html, attrKey);

    if (REG_HTTP.test(value) || !value) {
        return html;
    }

    var absFile;

    //console.log(configs);

    try {
        absFile = path.join(configs._srcPath, value);
    } catch (err) {
        log('replace html', pathURI.toSystemPath(file), 'error');
        log('replace html', html, 'error');
        log('replace html', err.message, 'error');
        log('replace ' + attrKey, value === true ? '<EMPTY>' : value, 'error');
        process.exit();
    }

    var basename = path.basename(absFile);
    var srcName = basename.replace(REG_SUFFIX, '');
    var suffix = (basename.match(REG_SUFFIX) || [''])[0];

    absFile = absFile.replace(REG_SUFFIX, '');

    var url = configs._resURIMap[absFile];
    var version = configs._resVerMap[absFile];

    if (!version) {
        version = encryption.etag(absFile);
    }

    // 未进行版本构建
    if (!url) {
        var extname = path.extname(srcName);
        var resName = version + extname;
        var resFile = path.join(configs._destPath, configs.resource.dest, resName);

        try {
            fs.copySync(absFile, resFile);
        } catch (err) {
            log('html file', pathURI.toSystemPath(file), 'error');
            log('copy from', pathURI.toSystemPath(absFile), 'error');
            log('copy to', pathURI.toSystemPath(resFile), 'error');
            log('copy file', err.message, 'error');
            process.exit();
        }

        configs._resURIMap[absFile] = url = (configs.dest.host ? '' : '/') + path.relative(configs._destPath, resFile);
    }

    return htmlAttr.set(html, attrKey, configs.dest.host + url + suffix);
};