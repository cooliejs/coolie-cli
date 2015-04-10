/*!
 * pull coolie.min.js from github
 * @author ydr.me
 * @create 2014-12-11 17:28
 */

'use strict';

var path = require('path');
var fs = require('fs');
var request = require('ydr-utils').request;
var pkg = require('../package.json');
var log = require('../libs/log.js');

module.exports = function (basedir) {
    var writeFile = path.join(basedir, "./coolie.min.js");

    log('pull coolie.min.js', 'wait a moment...');
    request.down(pkg.coolie, function (err, binary) {
        if (err) {
            log('pull coolie.min.js', pkg.coolie, 'error');
            log('pull coolie.min.js', err.message, 'error');
            process.exit();
        }

        fs.writeFile(writeFile, binary, 'binary', function (err) {
            if (err) {
                log('pull coolie.min.js', pkg.coolie, 'error');
                log('pull coolie.min.js', err.message, 'error');
                process.exit();
            }

            log('write coolie.min.js', writeFile, 'success');
        });
    });
};