/*!
 * 解析依赖
 * @author ydr.me
 * @create 2014-10-23 19:53
 */


"use strict";

var path = require('ydr-utils').path;

var log = require('./log.js');


/**
 * require 正则
 * @type {RegExp}
 * @link https://github.com/seajs/seajs/blob/master/dist/sea-debug.js
 */
var REG_REQUIRE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;


/**
 * 反斜杠
 * @type {RegExp}
 */
var REG_SLASH = /\\\\/g;


/**
 * require 类型
 * @type {RegExp}
 */
var REG_REQUIRE_TYPE = /([^"']+)(?:['"]\s*?,\s*?['"]([^'"]*))?/;


/**
 * 路径结尾
 * @type {RegExp}
 */
var REG_PATH_END = /(\/[^/]+?)?\/$/;


/**
 * 文件后缀
 * @type {RegExp}
 */
var REG_SUFFIX = /[\?#].*?$/;


/**
 * 脚本后缀
 * @type {RegExp}
 */
var REG_JS = /\.js($|\?)/i;



/**
 * 清理 url
 * @param url {String} 原始 URL
 * @param [isSingleURL=false] 是否为独立 URL
 * @returns {String}
 */
var cleanURL = function (url, isSingleURL) {
    url = url.replace(REG_SUFFIX, '');

    if (isSingleURL) {
        return url;
    }

    if (REG_PATH_END.test(url)) {
        url += 'index';
    }

    return url + (REG_JS.test(url) ? '' : '.js');
};


/**
 * 解析依赖，返回数组
 * @param file
 * @param code
 * @returns {Array} 依赖数组
 */
module.exports = function (file, code) {
    var requires = [];

    code.replace(REG_SLASH, '').replace(REG_REQUIRE, function ($0, $1, $2) {
        if ($2) {
            var matches = $2.match(REG_REQUIRE_TYPE);
            var pipeline = (matches[2] ? matches[2].toLowerCase() : 'js').split('|');
            var name = cleanURL(matches[1], !!matches[2]);
            var dep = {
                id: path.join(path.dirname(file), name),
                raw: matches[1],
                name: name,
                type: pipeline[0],
                outType: pipeline[1] || 'js',
                pipeline: pipeline
            };

            requires.push(dep);
        }
    });

    return requires;
};
