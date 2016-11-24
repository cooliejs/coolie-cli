/**
 * 解析 html
 * @author ydr.me
 * @create 2016-01-12 14:53
 */


'use strict';

var Class = require('blear.classes.class');
var object = require('blear.utils.object');
var collection = require('blear.utils.collection');
var string = require('blear.utils.string');
var typeis = require('blear.utils.typeis');
var debug = require('blear.node.debug');
var console = require('blear.node.console');


var UNCLOSED_TAGS_LIST = ('AREA BASE BASEFONT BR COL COMMAND EMBED FRAME HR IMG INPUT ISINDEX KEYGEN LINK META ' +
'PARAM SOURCE TRACK WEB ' +
// svg elements
'PATH CIRCLE ELLIPSE LINE RECT USE STOP POLYLINE POLYGON').split(' ');
var UNCLOSED_TAGS_MAP = {
    '*': false
};

collection.each(UNCLOSED_TAGS_LIST, function (index, tag) {
    UNCLOSED_TAGS_MAP[tag] = true;
});

var REG_TAG_NAME = /^<[a-z][\w-]*\b/i;
var REG_TAG_ATTR = /\s*([\w:.@$-]+)(?:\s*=\s*("[\s\S]*?"|'[\s\S]*?'|[^'">\s]*))?/g;
var REG_DOUBLE_QUOTE_S = /\\"/g;

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
    options = object.assign({
        closed: undefined,
        global: true,
        ignoreCase: true
    }, options);

    if (tagName === '*') {
        options.closed = false;
    }

    // @link http://haacked.com/archive/2004/10/25/usingregularexpressionstomatchhtml.aspx/
    // /<\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)>/
    var tagNameRegStr = tagName === '*' ? '[a-z][a-z\\d-]*' : string.escapeRegExp(tagName);
    var regString = '<(' + tagNameRegStr + ')' +
        '((\\s+[\\w:.@$-]+(\\s*=\\s*(?:"[\\s\\S]*?"|\'[\\s\\S]*?\'|[^\'">\\s]+))?)+\\s*|\\s*)';

    if (!typeis.Boolean(options.closed)) {
        options.closed = !UNCLOSED_TAGS_MAP[tagName.toUpperCase()];
    }

    if (options.closed) {
        regString += '>([\\s\\S]*?)</\\1>';
    } else {
        regString += '(\\/\\s*)?>';
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


/**
 * 解析标签
 * @param html
 * @param conditions
 * @returns {{tag: String, attrs: {}, content: String, closed: Boolean}}
 */
var parseTag = function (html, conditions) {
    var buildTagRegRet = buildTagReg(conditions.tag, {closed: false});
    var tag = html.match(buildTagRegRet.reg)[0];
    var tagName = tag.match(REG_TAG_NAME)[0].slice(1);
    var attrString = tag.replace(REG_TAG_NAME, '');
    var attrs = {};
    var quotes = {};
    var content = null;
    var matched;

    while ((matched = REG_TAG_ATTR.exec(attrString))) {
        var val = matched[2];
        var quote = null;

        if (typeis.Null(val) || typeis.Undefined(val)) {
            val = true;
        } else {
            quote = val.slice(0, 1);
            val = val.slice(1, -1);
        }

        attrs[matched[1]] = val;
        quotes[matched[1]] = quote;
    }

    // 闭合标签
    if (!UNCLOSED_TAGS_MAP[conditions.tag.toUpperCase()]) {
        buildTagRegRet = buildTagReg(conditions.tag, {
            closed: true,
            global: false
        });
        content = html.match(buildTagRegRet.reg)[5];
    }

    return {
        tag: tagName,
        attrs: attrs,
        quotes: quotes,
        source: html,
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
        collection.each(find, function (index, item) {
            var find = true;
            collection.each(conditions.attrs, function (key, val) {
                switch (typeis(val)) {
                    case 'string':
                        find = item.attrs[key] === val;
                        break;

                    case 'regexp':
                        find = val.test(item.attrs[key]);
                        break;

                    default:
                        find = false;
                }

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

    collection.each(node.attrs, function (key, val) {
        var attr = key;

        if (val === true) {
            attr += '';
        } else if (val === false || typeis.Null(val) || typeis.Undefined(val)) {
            return;
        } else {
            var quote = node.quotes[key];
            var isDoubleInVal;

            if (quote) {
                isDoubleInVal = quote === "'";
            } else {
                isDoubleInVal = REG_DOUBLE_QUOTE_S.test(val);
            }

            if (isDoubleInVal) {
                val = "'" + val + "'";
            } else {
                val = '"' + val + '"';
            }

            attr += '=' + val + '';
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


/**
 * 转换 HTML
 * @param matched
 * @param transform
 * @returns {XML|void|string|*}
 */
var transformHTML = function (matched, transform) {
    // transform
    collection.each(matched.list, function (index, item) {
        matched.list[index] = transform(item);
    });

    // render
    collection.each(matched.list, function (index, item) {
        if (!item) {
            return;
        }

        matched.html = matched.html.replace(item.source, renderHTML(item).replace(/\$/, '$$$$'));
    });

    return matched.html;
};


var HTMLParser = Class.extend({
    className: 'HTMLParser',
    constructor: function (html, options) {
        var the = this;

        the._html = html;
        the._options = object.assign({}, options);
        the._matchList = [];
        HTMLParser.parent(the);
    },

    /**
     * 匹配 html
     * @param conditions
     * @param transform
     * @returns {HTMLParser}
     */
    match: function (conditions, transform) {
        var the = this;

        if (!conditions || !conditions.tag) {
            return the;
        }

        if (typeis.Array(conditions.tag)) {
            collection.each(conditions.tag, function (index, tag) {
                var childConditions = object.assign({}, conditions, {
                    tag: tag
                });
                the.match(childConditions, transform);
            });
            return the;
        }

        if (typeis.Function(transform)) {
            the._matchList.push([conditions, transform]);
        }

        return the;
    },


    /**
     * 执行匹配替换
     * @returns {*}
     */
    exec: function () {
        var the = this;

        collection.each(the._matchList, function (index, match) {
            the._html = transformHTML(matchHTML(the._html, match[0]), match[1]);
        });

        return the._html;
    }
});


/**
 * 解析 html 并进行相应转换，请勿在 html 里保留注释，请保证没有断行影响正则匹配
 * @param html
 * @param options
 * @returns {Domain|Suite}
 */
module.exports = function (html, options) {
    return new HTMLParser(html, options);
};


