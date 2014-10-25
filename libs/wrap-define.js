/*!
 * wrap-define.js
 * @author ydr.me
 * @create 2014-10-25 14:16
 */


'use strict';

var REG_HUA_START = /^.*?:/;
var REG_HUA_END = /}$/;
var REG_SINGLE = /'/g;

/**
 * 包裹一层 define
 * @param id
 * @param code
 */
module.exports = function wrapDefine(id, code) {
    var o = {
        o: code
    };
    var text = JSON.stringify(o)
        .replace(REG_HUA_START, '')
        .replace(REG_HUA_END, '');

    return 'define("' + id + '",[],function(y,d,r){' +
        'r.exports=' + text + ';' +
        '});';
};


