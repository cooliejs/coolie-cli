/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-08-12 09:18
 */


'use strict';

var path = require('path');
var fs = require('fs');
var request = require('ydr-utils').request;
var pkg = require('../package.json');
var log = require('../libs/log.js');

module.exports = function (basedir) {
    var writeFile = path.join(basedir, "./coolie.min.js");
    var writeStream = fs.createWriteStream(writeFile);
    var url = pkg.coolie;

    log('pull coolie.min.js', url);
    request.down(pkg.coolie, function (err, stream, res) {
        if (err) {
            log('pull coolie.min.js', url, 'error');
            log('pull coolie.min.js', err.message, 'error');
            process.exit(1);
        }

        if (res.statusCode !== 200) {
            log('download alien', url, 'error');
            log('download alien', 'response statusCode is ' + res.statusCode, 'error');
            return process.exit(1);
        }

        stream.pipe(writeStream).on('error', function (err) {
            log('pull coolie.min.js', url, 'error');
            log('pull coolie.min.js', err.message, 'error');
            process.exit(1);
        }).on('close', function () {
            log('pull coolie.min.js', writeFile, 'success');
            process.exit(1);
        });
    });
};

