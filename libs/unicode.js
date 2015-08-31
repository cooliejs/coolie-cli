/*!
 * utf8 转换 unicode
 * @author ydr.me
 * @create 2015-08-31 14:10
 */


'use strict';

var REG_DOUBLE = /[^\x00-\xff]/g;

module.exports = function (utf8) {
    return utf8.replace(REG_DOUBLE, function ($0) {
        return '\\u' + $0.charCodeAt(0).toString(16);
    });
};

