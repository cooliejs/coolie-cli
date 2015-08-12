/*!
 * cmd book
 * @author ydr.me
 * @create 2015-08-12 09:18
 */


'use strict';

var openHelper = require('open');
var pkg = require('../package.json');
var log = require('../libs/log.js');

module.exports = function () {
    openHelper(pkg.book + '?from=coolie.cli@' + pkg.version, function (err) {
        if (err) {
            log('coolie book', pkg.book, 'error');
            log('coolie book', err.message, 'error');
            process.exit(1);
        }

        log('coolie book', pkg.book, 'success');
    });
};


