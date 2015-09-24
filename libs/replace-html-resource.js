/*!
 * 替换 HTML 文件里的资源路径
 * @author ydr.me
 * @create 2015-05-28 10:03
 */


'use strict';

var fs = require('fs-extra');
var path = require('ydr-utils').path;
var htmlAttr = require('./html-attr.js');
var log = require('./log.js');
var pathURI = require('./path-uri.js');
var base64 = require('./base64.js');
var copy = require('./copy.js');
var coolieIgnore = 'coolieignore';
var regList = [{
    reg: /<(:?embed|audio|video|source)\b[\s\S]*?>/gi,
    attrs: ['src']
}, {
    reg: /<(:?object)\b[\s\S]*?>/gi,
    attrs: ['data']
}, {
    reg: /<(:?source)\b[\s\S]*?>/gi,
    attrs: ['srcset']
}, {
    reg: /<(:?img)\b[\s\S]*?>/gi,
    attrs: ['src', 'data-original']
}];


/**
 * 构建资源版本
 * @param file {String} 待替换的文件
 * @param code {String} 代码
 * @returns {String}
 */
module.exports = function (file, code) {
    var configs = global.configs;

    regList.forEach(function (item) {
        code = code.replace(item.reg, function (tag) {
            if (htmlAttr.get(tag, coolieIgnore)) {
                return htmlAttr.remove(tag, coolieIgnore);
            }

            item.attrs.forEach(function (attr) {
                var value = htmlAttr.get(tag, attr);

                // 属性值为空
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
                    log('replace ' + item.attr, value === true ? '<EMPTY>' : value, 'error');
                    process.exit(1);
                }

                var resFile = copy(absFile, {
                    version: true,
                    dest: configs._resDestPath,
                    logType: 1,
                    srcFile: file,
                    srcCode: tag
                });
                var resRelative = pathURI.relative(configs._destPath, resFile);
                var url = pathURI.joinURI(configs.dest.host, resRelative);

                tag = htmlAttr.set(tag, attr, url + pathRet.suffix);
            });

            return tag;
        });
    });

    return code;
};