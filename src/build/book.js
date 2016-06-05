/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-30 11:56
 */


'use strict';

var openHelper = require('open');
var debug = require('blear.node.debug');

var pkg = require('../../package.json');

module.exports = function () {
    openHelper(pkg.coolie.book);
    debug.success('coolie book', pkg.coolie.book);
};



