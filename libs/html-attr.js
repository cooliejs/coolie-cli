/*!
 * html 标签的 attribute 相关操作
 * @author ydr.me
 * @create 2015-05-19 23:01
 */


'use strict';

var buildRegExp = function (attr) {
    return new RegExp('\\s\\b' + attr + '\\b\\s*(=\\s*[\'"]([\\s\\S]*?)[\'"]|)', 'i');
};
var REG_TAGNAME = /^<[^ ]+\b/;


/**
 * 获取 attr
 * @param html
 * @param attrName
 * @returns {String}
 */
exports.get = function (html, attrName) {
    var reg = buildRegExp(attrName);

    var ret1 = reg.test(html);
    var ret2 = (html.match(reg) || ['', '', ''])[2];

    return ret2 || ret1;
};


/**
 * 设置 attr
 * @param html
 * @param attrName
 * @param attrVal
 * @returns {String}
 */
exports.set = function (html, attrName, attrVal) {
    var reg = buildRegExp(attrName);
    var to = attrName + '="' + attrVal + '"';

    console.log(reg);
    console.log(reg.test(html));
    return reg.test(html) ?
        html.replace(reg, to) :
        html.replace(REG_TAGNAME, '$& ' + to);
};


/**
 * 移除某个属性
 * @param html
 * @param attrName
 * @returns {string|XML|void}
 */
exports.remove = function (html, attrName) {
    return html.replace(buildRegExp(attrName), '');
};