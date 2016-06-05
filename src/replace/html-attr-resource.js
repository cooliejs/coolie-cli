/**
 * 替换 html attr 静态资源
 * @author ydr.me
 * @create 2015-10-21 17:39
 */


'use strict';

var fs = require('fs-extra');
var path = require('ydr-utils').path;
var dato = require('ydr-utils').dato;
var debug = require('blear.node.debug');
var console = require('blear.node.console');


var base64 = require('../utils/base64.js');
var copy = require('../utils/copy.js');
var buildResPath = require('../build/res-path.js');
var parseHTML = require('../parse/html.js');
var pathURI = require('../utils/path-uri.js');

var COOLIE_IGNORE = 'coolieignore';
var COOLIE_BASE64 = 'cooliebase64';
var linkRelList = [
    /apple-touch-icon/,
    /apple-touch-icon-precomposed/,
    /apple-touch-startup-image/,
    /icon/,
    /og:image/,
    /msapplication-TileImage/
];
var replaceList = [{
    tags: ['link'],
    attr: 'href'
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
    minifyResource: true,
    mute: false
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
 * @param [options.minifyResource] {Boolean} 是否压缩资源文件
 * @param [options.mute] {Boolean} 是否静音
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

        parser.match({
            tag: item.tags
        }, function (node) {
            if (!node.attrs[attr]) {
                return node;
            }

            if (node.attrs.hasOwnProperty(COOLIE_IGNORE)) {
                node.attrs[COOLIE_IGNORE] = null;
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

            var resource = node.attrs[attr];
            var pathRet = pathURI.parseURI2Path(resource);
            var ret = buildResPath(resource, {
                file: file,
                versionLength: options.versionLength,
                srcDirname: options.srcDirname,
                destDirname: options.destDirname,
                destResourceDirname: options.destResourceDirname,
                destHost: options.destHost,
                mute: options.mute,
                base64: pathRet.coolieBase64
            });

            if (!ret) {
                return node;
            }

            if (!resMap[ret.srcFile]) {
                resList.push(ret.srcFile);
            }

            node.attrs[attr] = ret.url;
            return node;
        });
    });

    return {
        code: parser.exec(),
        resList: resList
    };
};

