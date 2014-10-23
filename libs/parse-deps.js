/*!
 * 解析依赖
 * @author ydr.me
 * @create 2014-10-23 19:53
 */


"use strict";

var REG_REQUIRE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;
var REG_SLASH = /\\\\/g;

/**
 * 解析依赖，返回数组
 * @param code
 * @returns {Array} 依赖数组
 */
module.exports = function (code) {
    var deps = [];

    code.replace(REG_SLASH, '').replace(REG_REQUIRE, function ($0, $1, $2) {
        // $0 require('abc.js');
        // $1 '
        // $2 abc.js
        if($2){
            deps.push($2);
        }
    });

    return deps;
};
