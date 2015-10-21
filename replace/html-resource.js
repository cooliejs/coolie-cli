/**
 * 替换 html 文件内的静态资源
 * @author ydr.me
 * @create 2015-10-21 17:39
 */


'use strict';

var fs = require('fs-extra');
var path = require('ydr-utils').path;
var string = require('ydr-utils').string;
var dato = require('ydr-utils').dato;

var htmlAttr = require('../utils/html-attr.js');
var log = require('../utils/log.js');
var pathURI = require('../utils/path-uri.js');
var base64 = require('../utils/base64.js');
var copy = require('../utils/copy.js');
var hook = require('../utils/hook.js');

var coolieIgnore = 'coolieignore';
var linkRelList = [
    /apple-touch-icon/,
    /apple-touch-icon-precomposed/,
    /apple-touch-startup-image/,
    /icon/,
    /og:image/,
    /msapplication-TileImage/
];
var regList = [{
    reg: /<(link)\b[\s\S]*?>(?!["'])/gi,
    replaceAttrs: ['href']
}, {
    reg: /<(embed|audio|video|source|img)\b[\s\S]*?>(?!["'])/gi,
    replaceAttrs: ['src']
}, {
    reg: /<(object)\b[\s\S]*>(?!["'])/gi,
    replaceAttrs: ['data']
}, {
    reg: /<(source)\b[\s\S]*?>(?!["'])/gi,
    replaceAttrs: ['srcset']
}];


/**
 * 替换资源版本
 * @param file {String} 待替换的文件
 * @param configs {Object} 配置
 * @param configs.code {String} 代码
 * @param configs.srcDirname {String} 构建工程原始根目录
 * @param configs.destResourceDirname {String} 目标资源文件保存目录
 * @returns {String}
 */
module.exports = function (file, configs) {
    var code = configs.code;

    // 标签替换，如 <img src="
    regList.forEach(function (item) {
        code = code.replace(item.reg, function (tag, tagName) {
            var find = true;

            switch (tagName) {
                case 'link':
                    find = false;
                    var linkRel = htmlAttr.get(tag, 'rel');

                    dato.each(linkRelList, function (index, regRel) {
                        find = regRel.test(linkRel);
                        return !find;
                    });
                    break;
            }

            if (!find) {
                return tag;
            }

            if (htmlAttr.get(tag, coolieIgnore)) {
                return htmlAttr.remove(tag, coolieIgnore);
            }

            var hookRet = hook.exec('replaceHTMLResource', file, {
                code: tag,
                tagName: tagName,
                type: configs.type
            });

            if (hookRet) {
                tag = hookRet;
                return tag;
            }

            item.replaceAttrs.forEach(function (attr) {
                var value = htmlAttr.get(tag, attr);

                // 属性值为空
                if (value === true) {
                    return tag;
                }

                var pathRet = pathURI.parseURI2Path(value);

                // 不存在路径 || URL
                if (!value || pathURI.isURL(pathRet.path)) {
                    return tag;
                }

                var absFile = pathURI.toAbsoluteFile(pathRet.path, file, configs.srcDirname);

                //try {
                //    absFile = path.join(absDir, pathRet.path);
                //} catch (err) {
                //    log('replace file', pathURI.toSystemPath(file), 'error');
                //    log('replace resource', tag, 'error');
                //    log('replace error', err.message, 'error');
                //    log('replace ' + item.attr, value === true ? '<EMPTY>' : value, 'error');
                //    process.exit(1);
                //}

                //var resFile = copy(absFile, {
                //    version: true,
                //    dest: configs.destResourceDirname,
                //    logType: 1,
                //    srcFile: file,
                //    srcCode: tag
                //});
                //var resRelative = pathURI.relative(configs.destDirname, resFile);
                //var url = pathURI.joinURI(configs.dest.host, resRelative);
                //
                //tag = htmlAttr.set(tag, attr, url + pathRet.suffix);
            });

            return tag;
        });
    });

    // @todo 属性内替换，如 style="background

    return code;
};

