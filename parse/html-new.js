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
var typeis = require('ydr-utils').typeis;

var UNCLOSED_TAGS_LIST = 'IMG LINK META BR AREA COL COMMAND EMBED HR INPUT KEYGEN PARAM SOURCE TRACK WBR'.split(' ');
var UNCLOSED_TAGS_MAP = {};

dato.each(UNCLOSED_TAGS_LIST, function (index, tag) {
    UNCLOSED_TAGS_MAP[tag] = true;
});

var REG_TAG_NAME = /^<[a-z][a-z\\d]*/i;
var REG_TAG_ATTR = /\s*([\w-]+)(?:\s*=\s*(".*?"|'.*?'|[^'">\s]+))?/g;


/**
 * 生成正则表达式
 * @param tagName
 * @param options
 * @param options.closed
 * @param options.global
 * @param options.ignoreCase
 * @returns {{reg: RegExp, options: Object}}
 */
var buildTagReg = function (tagName, options) {
    options = dato.extend({
        closed: undefined,
        global: true,
        ignoreCase: true
    }, options);

    // @link http://haacked.com/archive/2004/10/25/usingregularexpressionstomatchhtml.aspx/
    // /<\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)>/
    var tagNameRegStr = tagName === '*' ? '[a-z][a-z\\d]*' : string.escapeRegExp(tagName);
    var regString = '<' + tagNameRegStr +
        '((\\s+[\\w-]+(\\s*=\\s*(?:".*?"|\'.*?\'|[^\'">\\s]+))?)+\\s*|\\s*)>';

    if (!typeis.Boolean(options.closed)) {
        options.closed = !UNCLOSED_TAGS_MAP[tagName.toUpperCase()];
    }

    if (options.closed) {
        regString += '([\\s\\S]*?)</' + tagNameRegStr + '>';
    }

    var regexpParams = '';

    if (options.global) {
        regexpParams += 'g';
    }

    if (options.ignoreCase) {
        regexpParams += 'i';
    }

    return {
        reg: new RegExp(regString, regexpParams),
        options: options
    };
};


var parseTag = function (html, conditions) {
    var buildTagRegRet = buildTagReg(conditions.tag, {closed: false});
    var tag = html.match(buildTagRegRet.reg)[0];
    var tagName = tag.match(REG_TAG_NAME)[0].slice(1);
    var attrString = tag.replace(REG_TAG_NAME, '');
    var attrs = {};
    var content = null;
    var matched;

    while ((matched = REG_TAG_ATTR.exec(attrString))) {
        var val = matched[2];
        val = val === undefined ? true : val.slice(1, -1);
        attrs[matched[1]] = val;
    }

    // 闭合标签
    if (!UNCLOSED_TAGS_MAP[tagName.toUpperCase()]) {
        buildTagRegRet = buildTagReg(conditions.tag, {closed: true});
        console.log(html.match(buildTagRegRet.reg));
    }

    return {
        tag: tagName,
        tagName: tagName,
        attrs: attrs,
        content: content
    };
};


module.exports = function parseHTML(html, conditions) {
    conditions.tag = conditions.tag || conditions.tagName;
    var buildTagRegRet = buildTagReg(conditions.tag, conditions.closed);
    var reg = buildTagRegRet.reg;
    var matches = html.match(reg);

    if (!matches && buildTagRegRet.options.closed) {
        buildTagRegRet = buildTagReg(conditions.tag, {closed: false});
        reg = buildTagRegRet.reg;
        matches = html.match(reg);
    }

    if (!matches) {
        return [];
    }

    return matches.map(function (matched) {
        return parseTag(matched, conditions);
    });
};

