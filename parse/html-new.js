/**
 * 解析 html
 * @author ydr.me
 * @create 2016-01-12 14:53
 */


'use strict';

var klass = require('ydr-utils').class;
var dato = require('ydr-utils').dato;
var allocation = require('ydr-utils').allocation;
var string = require('ydr-utils').string;

var UNCLOSED_TAGS_LIST = 'IMG LINK META BR AREA COL COMMAND EMBED HR INPUT KEYGEN PARAM SOURCE TRACK WBR'.split(' ');
var UNCLOSED_TAGS_MAP = {};

dato.each(UNCLOSED_TAGS_LIST, function (index, tag) {
    UNCLOSED_TAGS_MAP[tag] = true;
});


/**
 * 生成正则表达式
 * @param tagName
 * @param closed
 * @returns {{reg: RegExp, closed: Boolean}}
 */
var buildTagReg = function (tagName, closed) {
    // @link http://haacked.com/archive/2004/10/25/usingregularexpressionstomatchhtml.aspx/
    // /<\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)>/
    var tagNameRegStr = tagName === '*' ? '[a-z][a-z\d]*?' : string.escapeRegExp(tagName);
    var regString = '<' + tagNameRegStr +
        '((\\s+[\\w-]+(\\s*=\\s*(?:".*?"|\'.*?\'|[^\'">\\s]+))?)+\\s*|\\s*)>';

    var args = allocation.args(arguments);

    if (args.length === 1) {
        closed = !UNCLOSED_TAGS_MAP[tagName.toUpperCase()];
    }

    if (closed) {
        regString += '[\\s\\S]*?</' + tagNameRegStr + '>';
    }

    return {
        reg: new RegExp(regString, 'ig'),
        closed: closed
    };
};


module.exports = function parseHTML(html, conditions) {
    conditions.tag = conditions.tag || conditions.tagName;
    var buildTagRegRet = buildTagReg(conditions.tag, conditions.closed);
    var reg = buildTagRegRet.reg;
    var matches = html.match(reg);

    if (!matches && buildTagRegRet.closed) {
        buildTagRegRet = buildTagReg(conditions.tag, false);
        reg = buildTagRegRet.reg;
        matches = html.match(reg);
    }

    if (!matches) {
        return [];
    }

    return matches;
};

