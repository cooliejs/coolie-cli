/**
 * 字符串字符串化，防止引号感染
 * @author ydr.me
 * @create 2016-01-27 11:40
 */


'use strict';

var console = require('blear.node.console');


var REG_HUA_START = /^.*?:/;
var REG_HUA_END = /}$/;


/**
 * stringify
 * @param string
 * @returns {XML|string}
 */
module.exports = function (string) {
    var o = {
        p: String(string)
    };

    return JSON.stringify(o).replace(REG_HUA_START, '').replace(REG_HUA_END, '');
};


