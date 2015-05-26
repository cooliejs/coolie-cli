/*!
 * 构建帮助
 * @author ydr.me
 * @create 2014-11-14 16:50
 */

'use strict';

var open = require('open');
var pkg = require('../package.json');
var log = require('../libs/log.js');

module.exports = function () {
    open(pkg.book + '?from=coolie.cli@' + pkg.version, function (err) {
        if (err) {
            log('coolie book', pkg.book, 'error');
            log('coolie book', err.message, 'error');
            process.exit();
        }

        log('coolie book', pkg.book, 'success');
    });
};
