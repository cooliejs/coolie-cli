/*!
 * wrap-define.js
 * @author ydr.me
 * @create 2014-10-25 14:16
 */


'use strict';

var REG_HUA_START = /^.*?:/;
var REG_HUA_END = /}$/;
var log = require('./log');
var util = require('./util');

/**
 * 包裹一层 define
 * @param file
 * @param code
 * @param depIdsMap
 */
module.exports = function wrapDefine(file, code, depIdsMap) {
    var o = {
        o: code
    };
    var text = JSON.stringify(o)
        .replace(REG_HUA_START, '')
        .replace(REG_HUA_END, '');

    return 'define("' + depIdsMap[file] + '",[],function(y,d,r){' +
        'r.exports=' + text + ';' +
        '});';
};


