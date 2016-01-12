/**
 * 解析 html
 * @author ydr.me
 * @create 2016-01-12 14:53
 */


'use strict';

var posthtml = require('posthtml');
var klass = require('ydr-utils').class;
var dato = require('ydr-utils').dato;


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
     * @param middleware
     * @returns {ParseHTML}
     */
    use: function (middleware) {
        var the = this;
        the.parser.use(middleware);
        return the;
    },


    /**
     * 获取解析后的 html
     * @returns {string}
     */
    get: function () {
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

