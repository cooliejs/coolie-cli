/**
 * 遍历构建入口
 * @author ydr.me
 * @create 2015-10-27 11:25
 */


'use strict';

var debug = require('ydr-utils').debug;
var dato = require('ydr-utils').dato;

var parseMain = require('../parse/main.js');


/**
 * 遍历构建入口
 * @param options
 */
module.exports = function (options) {
    var mainAsyncMap = parseMain({
        main: options.main
    });
};


