/**
 * path uri 转换
 * @author ydr.me
 * @create 2015-05-19 13:47
 */


'use strict';


var path = require('blear.node.path');
var typeis = require('blear.utils.typeis');
var url = require('blear.utils.url');
var console = require('blear.node.console');


var REG_ABSOLUTE = /^((?:(?:http|ftp)s?:|)\/\/)/i;
var REG_RELATIVE_ROOT = /^\//;
var REG_BLANK = /^(data|about):/i;
var REG_SUFFIX = /(\?.*|#.*)$/;
var REG_RELATIVE = /^\.{1,2}\//;
var REG_END = /\.[a-z\d]+\.([^.]+)$/i;
var REG_COOLIE_BASE64 = /#cooliebase64$/i;


/**
 * 转换为根 uri
 * @param p {String} 路径
 * @param root {String} 根目录
 * @returns {String}
 */
exports.toRootURL = function (p, root) {
    p = path.normalize(p);
    root = path.normalize(root);

    var relative = path.relative(root, p);

    if (!REG_RELATIVE.test(relative)) {
        relative = '/' + relative;
    }

    return relative;
};


/**
 * 是否为相对路径
 * @param p
 * @returns {boolean}
 */
exports.isRelatived = function (p) {
    return !REG_ABSOLUTE.test(p) && !REG_BLANK.test(p);
};


/**
 * 是否为相对于当前文件
 * @param p
 * @returns {boolean}
 */
exports.isRelativeFile = function (p) {
    return !REG_ABSOLUTE.test(p) && !REG_RELATIVE_ROOT.test(p);
};


/**
 * 是否为相对于根目录
 * @param p
 * @returns {boolean}
 */
exports.isRelativeRoot = function (p) {
    p = path.normalize(p);
    return !REG_ABSOLUTE.test(p) && REG_RELATIVE_ROOT.test(p);
};


/**
 * 路径转成绝对路径
 * @param p
 * @param parentFile
 * @param [rootDirname]
 * @returns {string}
 */
exports.toAbsoluteFile = function (p, parentFile, rootDirname) {
    p = p.replace(REG_SUFFIX, '');
    rootDirname = rootDirname ? rootDirname : __dirname;

    // 相对文件
    if (exports.isRelativeFile(p)) {
        var parentDirname = path.dirname(parentFile);
        return path.join(parentDirname, p);
    }

    // 绝对文件
    return path.join(rootDirname, p);
};


/**
 * 判断路径是否为图片
 * @param p {String} 路径
 * @returns {boolean}
 */
exports.isImage = function (p) {
    var extname = path.extname(p);
    extname = extname.toLowerCase();
    return ['.png', '.gif', '.jpg', '.jpeg', '.webp'].indexOf(extname) > -1;
};


/**
 * 判断路径是否为空
 * @param uri
 * @returns {boolean}
 */
exports.isBlank = function (uri) {
    uri = path.normalize(uri);
    return REG_BLANK.test(uri.trim());
};


/**
 * 判断路径是否为 URL
 * @param p {String} 路径
 * @returns {boolean}
 */
exports.isURL = function (p) {
    return REG_ABSOLUTE.test(p) || REG_BLANK.test(p);
};


/**
 * 解析 URI 为路径信息
 * @param uri {String} URI
 * @returns {Object}
 */
exports.parseURI2Path = function (uri) {
    uri = String(uri || '');

    var ret = {};
    var uri2 = uri.replace(REG_SUFFIX, '');


    // 后置
    ret.suffix = (uri.match(REG_SUFFIX) || ['', ''])[1];
    ret.coolieBase64 = REG_COOLIE_BASE64.test(ret.suffix);
    ret.suffix = ret.suffix.replace(REG_COOLIE_BASE64, '');
    // 后缀
    ret.extname = path.extname(uri2);
    // 无后缀文件名
    ret.basename = path.basename(uri2);
    // 实际路径
    ret.path = uri2;
    // 原始信息
    ret.original = uri;

    return ret;
};


/**
 * 版本替换
 * @param uri
 * @param version
 * @returns {*}
 */
exports.replaceVersion = function (uri, version) {
    var dir = path.dirname(uri);
    var extname = path.extname(uri);

    return path.join(dir, version + extname);
};


/**
 * 版本替换
 * @param _path
 * @returns {*}
 */
exports.removeVersion = function (_path) {
    return path.normalize(_path).replace(REG_END, '.$1');
};


/**
 * 合并域和路径
 * @param type {String} 类型
 * @param host {String|Function} 域
 * @param _path {String} 路径
 */
exports.joinHost = function (type, host, _path) {
    console.log('joinHost', host, _path);
    if (typeis.String(host)) {
        return url.join(host, _path);
    }

    // 转换为绝对路径
    _path = url.join('/', _path);

    return url.join(host(type, _path), _path);
};


/**
 * 从当前路径开始查找，直到根路径，查找匹配 name 的路径
 * @param start {String} 开始路径
 * @param matchName {String} 匹配路径名
 * @param end {String} 结束路径
 * @returns {String}
 */
exports.closest = function (start, matchName, end) {
    while (!/^\.{1,2}\//.test(path.relative(end, start))) {
        var basename = path.basename(start);

        if (basename === matchName) {
            return start;
        }

        start = path.join(start, '..');
    }

    return null;
};
