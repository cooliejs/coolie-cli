/*!
 * cmd pull
 * @author ydr.me
 * @create 2015-08-12 09:18
 */


'use strict';

var path = require('path');
var fse = require('fs-extra');
var request = require('ydr-utils').request;
var pkg = require('../package.json');
var log = require('../libs/log.js');
var REG_VERSION = /^ \* @version ([\d.]+)/m;

module.exports = function (basedir) {
    var url = pkg.coolie;

    log('pull coolie.min.js', url);
    request.get({
        url: pkg.coolie
    }, function (err, body, res) {
        if (err) {
            log('pull coolie.min.js', url, 'error');
            log('pull coolie.min.js', err.message, 'error');
            return process.exit(1);
        }

        if (res.statusCode !== 200) {
            log('pull coolie.min.js', url, 'error');
            log('pull coolie.min.js', 'response statusCode is ' + res.statusCode, 'error');
            return process.exit(1);
        }

        var version = (body.match(REG_VERSION) || ['', '0.0.0'])[1];
        var writeFile = path.join(basedir, './coolie.min-' + version + '.js');

        log('coolie.js version', version, 'success');
        fse.outputFile(writeFile, body, function (err) {
            if (err) {
                log('pull coolie.min.js', url, 'error');
                log('pull coolie.min.js', err.message, 'error');
                return process.exit(1);
            }

            log('pull coolie.min.js', writeFile, 'success');
            process.exit(1);
        });
    });
};

