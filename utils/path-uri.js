/*!
 * path uri 转换
 * @author ydr.me
 * @create 2015-05-19 13:47
 */


'use strict';


var path = require('ydr-utils').path;

var REG_PATH = path.sep === '/' ? /\\/ : /\//g;
var REG_URL = /\\/g;
var REG_ABSOLUTE = /^((http|ftp)s?|\/\/)/i;
var REG_RELATIVE_ROOT = /^\//;
var REG_BASE_64 = /^data:/i;
var REG_FIRST = /^\//;
var REG_LAST = /\/$/;
var REG_SUFFIX = /(\?.*|#.*)$/;
var REG_RELATIVE = /^.{1,2}\//;



/**
 * 转换为根 uri
 * @param p {String} 路径
 * @param root {String} 根目录
 * @returns {String}
 */
exports.toRootURL = function (p, root) {
    var relative = exports.relative(path.toURI(root), path.toURI(p));

    if (!REG_RELATIVE.test(relative)) {
        relative = '/' + relative;
    }

    return relative;
};


/**
 * 转换路径为 URL 格式
 * @param p
 * @returns {string}
 */
path.toURI = function (p) {
    return String(p).replace(REG_URL, '/');
};


/**
 * 是否为相对路径
 * @param p
 * @returns {boolean}
 */
exports.isRelatived = function (p) {
    return !REG_ABSOLUTE.test(p);
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
    var configs = global.configs;

    p = p.replace(REG_SUFFIX, '');
    p = path.toSystem(p);
    rootDirname = rootDirname ? path.toSystem(rootDirname) : configs.srcDirname;

    // 相对文件
    if (exports.isRelativeFile(p)) {
        var parentDirname = path.dirname(parentFile);
        parentDirname = path.toSystem(parentDirname);
        return path.join(parentDirname, p);
    }

    // 绝对文件
    return path.join(rootDirname, p);
};


/**
 * 判断路径后缀是否为图片
 * @param extname
 * @returns {boolean}
 */
exports.isImage = function (extname) {
    extname = extname.toLowerCase();

    return ['.png', '.gif', '.jpg', '.jpeg'].indexOf(extname) > -1;
};


/**
 * 判断路径是否为 base64
 * @param uri
 * @returns {boolean}
 */
exports.isBase64 = function (uri) {
    return REG_BASE_64.test(uri);
};


/**
 * 判断路径是否为 URL
 * @param p {String} 路径
 * @returns {boolean}
 */
exports.isURL = function (p) {
    return REG_ABSOLUTE.test(p) || REG_BASE_64.test(p);
};


/**
 * URI 合并
 * @param p1
 * @param p2
 */
exports.joinURI = function (p1, p2) {
    p1 = path.toURI(p1);
    p2 = path.toURI(p2);

    return p1.replace(REG_LAST, '') + '/' + p2.replace(REG_FIRST, '');
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

    return exports.joinURI(dir, version + extname);
};


/**
 * 路径相对转换
 * @param from
 * @param to
 */
exports.relative = function (from, to) {
    from = path.toSystem(from);
    to = path.toSystem(to);

    return path.relative(from, to);
};
