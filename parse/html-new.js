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
    var tagNameRegStr = tagName === '*' ? '[a-z][a-z\\d-]*' : string.escapeRegExp(tagName);
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
        buildTagRegRet = buildTagReg(conditions.tag, {
            closed: true,
            global: false
        });
        content = html.match(buildTagRegRet.reg)[4];
    }

    return {
        tag: tagName,
        attrs: attrs,
        content: content,
        closed: buildTagRegRet.options.closed
    };
};


/**
 * 解析 html
 * @param html
 * @param conditions {Object} 查询条件
 * @returns {*}
 */
var matchHTML = function (html, conditions) {
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
        return {
            html: html,
            list: [],
            reg: reg
        };
    }

    var find = matches.map(function (matched) {
        return parseTag(matched, conditions);
    });

    matches = [];

    if (conditions.attrs) {
        dato.each(find, function (index, item) {
            var find = true;
            dato.each(conditions.attrs, function (key, val) {
                find = item.attrs[key] === val;

                if (!find) {
                    return false;
                }
            });

            if (find) {
                matches.push(item);
            }
        });
    } else {
        matches = find;
    }

    return {
        html: html,
        list: matches,
        reg: reg
    };
};


/**
 * 渲染 html
 * @param node
 * @returns {string}
 */
var renderHTML = function (node) {
    var html = '<' + node.tag;
    var attrList = [];

    dato.each(node.attrs || {}, function (key, val) {
        var attr = key;

        if (val === true) {
            attr += '';
        } else if (val === false) {
            return;
        } else {
            attr += '="' + String(val) + '"';
        }

        if (attr) {
            attrList.push(attr);
        }
    });

    if (attrList.length) {
        html += ' ' + attrList.join(' ');
    }

    html += '>';

    if (node.closed) {
        html += node.content + '</' + node.tag + '>';
    }

    return html;
};


var transformHTML = function (matched, transform) {
    // transform
    dato.each(matched.list, function (index, item) {
        matched.list[index] = transform(item);
    });

    // render
    //dato.each(matched.list, function (index, item) {
    //    matched.html = matched.html.replace(matched.reg, renderHTML(item));
    //});

    console.log(matched);

    return matched.html;
};


var HTMLParser = klass.create({
    constructor: function (html, options) {
        var the = this;

        the._html = html;
        the._options = dato.extend({}, options);
        the._matchList = [];
    },


    match: function (conditions, transform) {
        var the = this;

        if (typeis.Function(transform)) {
            the._matchList.push([conditions, transform]);
        }

        return the;
    },


    exec: function () {
        var the = this;

        dato.each(the._matchList, function (index, match) {
            the._html = transformHTML(matchHTML(the._html, match[0]), match[1]);
        });

        return the._html;
    }
});


module.exports = function (html, options) {
    return new HTMLParser(html, options);
};


