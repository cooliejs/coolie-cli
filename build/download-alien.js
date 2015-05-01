/*!
 * download alien from aliyun oss
 * @author ydr.me
 * @create 2015-05-01 10:44
 */


'use strict';

var path = require('path');
var fs = require('fs-extra');
var request = require('ydr-utils').request;
var random = require('ydr-utils').random;
var pkg = require('../package.json');
var log = require('../libs/log.js');
var unzip = require('unzip');


module.exports = function (basedir) {
    var url = pkg.alien;
    var unzipPath = path.join(__dirname, random.guid());
    var destPath = path.join(basedir, './alien');

    console.log(unzipPath);
    log('download alien', url);
    request.down({
        url: url,
        // 100 秒
        timeout: 100000
    }, function (err, stream, res) {
        if(res.statusCode !== 200){
            log('download alien', url, 'error');
            log('download alien', 'response statusCode is ' + res.statusCode, 'error');
            return process.exit();
        }

        if (err) {
            log('download alien', url, 'error');
            log('download alien', err.message, 'error');
            return process.exit();
        }

        stream.pipe(unzip.Extract({
            path: unzipPath
        })).on('error', function (err) {
            log('unzip alien', url, 'error');
            log('unzip alien', err.message, 'error');
            process.exit();
        }).on('close', function () {
            fs.move(unzipPath, destPath, function (err) {
                if (err) {
                    log('move alien', unzipPath, 'success');
                    return process.exit();
                }

                log('download alien', unzipPath, 'success');
                process.exit();
            });
        });
    });
};
