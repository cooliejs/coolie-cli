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
var REG_BASE_64 = /^data:.*?base64,/i;
var REG_FIRST = /^\//;
var REG_LAST = /\/$/;
var REG_SUFFIX = /(\?.*|#.*)$/;
var REG_EXT = /\.([^.]+)$/;


/**
 * 修正 path 路径为系统分隔符
 * @param p
 * @returns {String}
 */
exports.toSystemPath = function (p) {
    return p.replace(REG_PATH, path.sep);
};


/**
 * 转换为根 uri
 * @param p
 * @returns {String}
 */
exports.toRootURL = function (p) {
    var configs = global.configs;

    return '/' + exports.relative(configs.srcDirname, exports.toURIPath(p));
};


/**
 * 转换路径为 URL 格式
 * @param p
 * @returns {string}
 */
exports.toURIPath = function (p) {
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
 * URI 合并
 * @param p1
 * @param p2
 */
exports.joinURI = function (p1, p2) {
    p1 = exports.toURIPath(p1);
    p2 = exports.toURIPath(p2);

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
    // 实际文件
    ret.path = uri2;
    // 实际文件
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
    var p = exports.parseURI2Path(uri);

    return p.path.replace(REG_EXT, function ($0, $1) {
            return '.' + version + '.' + $1;
        }) + p.suffix;
};


/**
 * 路径相对转换
 * @param from
 * @param to
 */
exports.relative = function (from, to) {
    from = exports.toSystemPath(from);
    to = exports.toSystemPath(to);

    return path.relative(from, to);
};
