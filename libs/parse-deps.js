/*!
 * 解析依赖
 * @author ydr.me
 * @create 2014-10-23 19:53
 */


"use strict";

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
 * 文本模块
 * @type {RegExp}
 */
var REG_TEXT_MODULE = /^(css|html|text)!/i;


/**
 * 图片模块
 * @type {RegExp}
 */
var REG_IMAGE_MODULE = /^(image)!/i;


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
 * 解析依赖类型
 * @param name
 * @returns {Object}
 */
var parseNameType = function (name) {
    var matches;

    if ((matches = name.match(REG_TEXT_MODULE))) {
        return {
            raw: name,
            name: cleanURL(name.replace(REG_TEXT_MODULE, ''), true),
            type: matches[1]
        };
    } else if (REG_IMAGE_MODULE.test(name)) {
        return {
            raw: name,
            name: cleanURL(name.replace(REG_IMAGE_MODULE, ''), true),
            type: 'image'
        };
    }

    return {
        raw: name,
        name: cleanURL(name),
        type: 'js'
    };
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
            var dep;

            // require('abc', 'image');
            if (matches[2]) {
                dep = {
                    raw: matches[1],
                    name: cleanURL(matches[1], true),
                    type: matches[2].toLowerCase()
                };
            }
            // require('abc');
            else {
                dep = parseNameType(matches[1]);
            }

            requires.push(dep);
        }
    });

    return requires;
};
