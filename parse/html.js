/**
 * 解析 html
 * @author ydr.me
 * @create 2016-01-12 14:53
 */


'use strict';

var posthtml = require('posthtml');
var allocation = require('ydr-utils').allocation;
var dato = require('ydr-utils').dato;


/**
 * 解析 html
 * @param code
 * @returns {{String}}
 */
module.exports = function (code/*use list*/) {
    var args = allocation.args(arguments);
    var useList = args.slice(1);
    var parser = posthtml();

    dato.each(useList, function (index, user) {
        parser = parser.use(user);
    });

    return parser.process(code, {
        sync: true
    }).html;
};

