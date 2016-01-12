/**
 * 替换 html attr 静态资源
 * @author ydr.me
 * @create 2015-10-21 17:39
 */


'use strict';

var fs = require('fs-extra');
var path = require('ydr-utils').path;
var string = require('ydr-utils').string;
var dato = require('ydr-utils').dato;
var debug = require('ydr-utils').debug;

var htmlAttr = require('../utils/html-attr.js');
var pathURI = require('../utils/path-uri.js');
var base64 = require('../utils/base64.js');
var copy = require('../utils/copy.js');
var parseHTML = require('../parse/html.js');

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
var replaceList = [{
    tags: ['link'],
    attr: 'href',
    conditions: {
        attrs: {}
    }
}, {
    tags: ['embed', 'audio', 'video', 'source', 'img'],
    attr: 'src'
}, {
    tags: ['object'],
    attr: 'data'
}, {
    tags: ['source'],
    attr: 'srcset'
}];
var defaults = {
    code: '',
    versionLength: 32,
    srcDirname: null,
    destDirname: null,
    destHost: '/',
    destResourceDirname: null,
    minifyResource: true
};


/**
 * 替换资源版本
 * @param file {String} 待替换的文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.versionLength {Number} 版本长度
 * @param options.srcDirname {String} 构建工程原始根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标文件 URL 域
 * @param options.destResourceDirname {String} 目标资源文件保存目录
 * @param [options.minifyResource] {Boolean} 压缩资源文件
 * @returns {Object}
 */
module.exports = function (file, options) {
    options = dato.extend({}, defaults, options);
    var code = options.code;
    var resList = [];
    var resMap = {};
    var parser = parseHTML(code);

    dato.each(replaceList, function (index, item) {
        var attr = item.attr;

        dato.each(item.tags, function (index, tag) {
            parser.use(function (tree) {
                tree.match({
                    tag: tag
                }, function (node) {
                    if (!node.attrs[attr]) {
                        return node;
                    }

                    if (node.attrs.hasOwnProperty(coolieIgnore)) {
                        node.attrs[coolieIgnore] = null;
                        return node;
                    }

                    var isResourceTag = true;

                    switch (node.tag) {
                        case 'link':
                            var linkRel = node.attrs.rel;
                            isResourceTag = false;
                            dato.each(linkRelList, function (index, regRel) {
                                isResourceTag = regRel.test(linkRel);
                                return !isResourceTag;
                            });
                            break;
                    }

                    if (!isResourceTag) {
                        return node;
                    }

                    var value = node.attrs[attr];
                    var pathRet = pathURI.parseURI2Path(value);

                    // 不存在路径 || URL
                    if (!value || pathURI.isURL(pathRet.path)) {
                        return node;
                    }

                    console.log(node);
                    console.log('========================================');
                    var absFile = pathURI.toAbsoluteFile(pathRet.path, file, options.srcDirname);
                    var resFile = copy(absFile, {
                        version: true,
                        copyPath: false,
                        versionLength: options.versionLength,
                        srcDirname: options.srcDirname,
                        destDirname: options.destResourceDirname,
                        logType: 1,
                        embedFile: file
                    });
                    var resRelative = path.relative(options.destDirname, resFile);
                    var url = pathURI.joinURI(options.destHost, resRelative);

                    if (!resMap[absFile]) {
                        resList.push(absFile);
                    }

                    node.attrs[attr] = url + pathRet.suffix;
                    return node;
                });
            });
        });
    });

    //// 标签替换，如 <img src="
    //regList.forEach(function (item) {
    //    code = code.replace(item.reg, function (tag, tagName) {
    //        var find = true;
    //
    //        switch (tagName) {
    //            case 'link':
    //                find = false;
    //                var linkRel = htmlAttr.get(tag, 'rel');
    //
    //                dato.each(linkRelList, function (index, regRel) {
    //                    find = regRel.test(linkRel);
    //                    return !find;
    //                });
    //                break;
    //        }
    //
    //        if (!find) {
    //            return tag;
    //        }
    //
    //        if (htmlAttr.get(tag, coolieIgnore)) {
    //            return htmlAttr.remove(tag, coolieIgnore);
    //        }
    //
    //        item.replaceAttrs.forEach(function (attr) {
    //            var value = htmlAttr.get(tag, attr);
    //
    //            // 属性值为空
    //            if (value === true) {
    //                return tag;
    //            }
    //
    //            var pathRet = pathURI.parseURI2Path(value);
    //
    //            // 不存在路径 || URL
    //            if (!value || pathURI.isURL(pathRet.path)) {
    //                return tag;
    //            }
    //
    //            var absFile = pathURI.toAbsoluteFile(pathRet.path, file, options.srcDirname);
    //            var resFile = copy(absFile, {
    //                version: true,
    //                copyPath: false,
    //                versionLength: options.versionLength,
    //                srcDirname: options.srcDirname,
    //                destDirname: options.destResourceDirname,
    //                logType: 1,
    //                embedFile: file,
    //                embedCode: tag
    //            });
    //            var resRelative = path.relative(options.destDirname, resFile);
    //            var url = pathURI.joinURI(options.destHost, resRelative);
    //
    //            if (!resMap[absFile]) {
    //                resList.push(absFile);
    //            }
    //
    //            tag = htmlAttr.set(tag, attr, url + pathRet.suffix);
    //        });
    //
    //        return tag;
    //    });
    //});

    return {
        code: parser.get(),
        resList: resList
    };
};

