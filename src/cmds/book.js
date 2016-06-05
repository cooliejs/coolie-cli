/*!
 * cmd book
 * @author ydr.me
 * @create 2015-08-12 09:18
 */


'use strict';

var openHelper = require('open');
var debug = require('blear.node.debug');

var pkg = require('../../package.json');
var banner = require('./banner.js');
var bookURL = require('../utils/book-url');

module.exports = function () {
    banner();
    openHelper(bookURL(), function (err) {
        if (err) {
            debug.error('coolie book', pkg.coolie.book);
            debug.error('coolie book', err.message);
            return process.exit(1);
        }

        debug.success('coolie book', pkg.coolie.book);
    });
};


