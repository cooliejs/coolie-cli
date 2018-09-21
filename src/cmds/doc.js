/*!
 * cmd book
 * @author ydr.me
 * @create 2015-08-12 09:18
 */


'use strict';

var openHelper = require('open');
var debug = require('blear.node.debug');
var console = require('blear.node.console');


var pkg = require('../../package.json');
var bookURL = require('../utils/book-url');

module.exports = function () {
    openHelper(bookURL(), function (err) {
        if (err) {
            debug.error('coolie doc', pkg.coolie.book);
            debug.error('coolie doc', err.message);
            return process.exit(1);
        }

        debug.success('coolie doc', pkg.coolie.book);
    });
};


