/*!
 * 远程下载 zip
 * @author ydr.me
 * @create 2015-08-14 22:53
 */


'use strict';

var path = require('path');
var fs = require('fs');
var request = require('ydr-utils').request;
var random = require('ydr-utils').random;
var pkg = require('../package.json');
var log = require('./log.js');
var AdmZip = require('adm-zip');

/**
 * 从远程下载 zip 文件
 * @param basedir {String} 存储目录
 * @param url {String} 远程地址
 * @param name {String} 文件名
 */
module.exports = function (basedir, url, name) {
    var tempFile = path.join(process.cwd(), random.guid() + '.zip');
    var tempStream = fs.createWriteStream(tempFile);
    var unzipPath = path.join(basedir, './' + name);

    log('download ' + name, url);
    request.down({
        url: url,
        query: {
            _: Date.now()
        }
    }, function (err, stream, res) {
        if (err) {
            log('download ' + name, url, 'error');
            log('download ' + name, err.message, 'error');
            return process.exit(1);
        }

        if (res.statusCode !== 200) {
            log('download ' + name, url, 'error');
            log('download ' + name, 'response statusCode is ' + res.statusCode, 'error');
            return process.exit(1);
        }

        stream.pipe(tempStream).on('error', function (err) {
            log('download ' + name, url, 'error');
            log('download ' + name, err.message, 'error');
            process.exit(1);
        }).on('close', function () {
            log('download ' + name, url, 'success');
            log('unzip ' + name, tempFile);

            var zip = new AdmZip(tempFile);
            var unzipError = null;

            try {
                zip.extractAllTo(unzipPath, true);
            } catch (err) {
                unzipError = err;
                log('unzip ' + name, tempFile, 'error');
                log('unzip ' + name, err.message, 'error');
            }

            try {
                fs.unlinkSync(tempFile);
            } catch (err) {
                log('remove tempfile', tempFile, 'error');
                log('remove tempfile', err.message, 'error');
            }

            if (!unzipError) {
                log('unzip ' + name, unzipPath, 'success');
            }
        });
    });
};



