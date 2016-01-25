/**
 * 解析 html
 * @author ydr.me
 * @create 2016-01-12 14:53
 */


'use strict';

var posthtml = require('posthtml');
var klass = require('ydr-utils').class;
var dato = require('ydr-utils').dato;
var allocation = require('ydr-utils').allocation;


var defaults = {};
var ParseHTML = klass.create({
    constructor: function (code, options) {
        var the = this;

        the.code = code;
        the.parser = posthtml();
        the._options = dato.extend({}, defaults, options);
    },


    /**
     * 使用 post html 中间件
     * @param middleware {Function} 中间件
     * @returns {ParseHTML}
     */
    use: function (middleware) {
        var the = this;
        the.parser.use(middleware);
        return the;
    },


    /**
     * 匹配替换
     * @param [conditions] {Object} 匹配条件，默认全部标签
     * @param transform {Function} 转换方法
     * @returns {ParseHTML}
     */
    match: function (conditions, transform) {
        var the = this;
        var args = allocation.args(arguments);

        if (args.length === 1) {
            transform = args[0];
            conditions = {
                tag: /.*/
            };
        }

        the.use(function (tree) {
            tree.match(conditions, transform);
        });

        return the;
    },


    /**
     * 执行处理，并返回 html
     * @returns {string}
     */
    exec: function () {
        var the = this;

        return the.parser.process(the.code, {
            sync: true
        }).html;
    }
});

ParseHTML.defaults = defaults;


/**
 * 解析 html
 * @param code
 * @param options
 * @returns {Suite|Domain|Error}
 */
module.exports = function (code, options) {
    return new ParseHTML(code, options);
};

