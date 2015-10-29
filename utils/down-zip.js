/**
 * 下载 zip 文件并解压
 * @author ydr.me
 * @create 2015-10-29 21:56
 */


'use strict';


var path = require('ydr-utils').path;
var fs = require('fs');
var request = require('ydr-utils').request;
var random = require('ydr-utils').random;
var debug = require('ydr-utils').debug;
var AdmZip = require('adm-zip');

var pkg = require('../package.json');

/**
 * 从远程下载 zip 文件
 * @param options {Object} 配置
 * @param options.url {String} 目标地址
 * @param options.destDirname {String} 目录
 * @param options.name {String} 文件名
 * @param callback {Function} 回调
 */
module.exports = function (options, callback) {
    var destDirname = options.destDirname;
    var url = options.url;
    var name = options.name;
    var tempFile = path.join(destDirname, random.guid() + '.zip');
    var tempStream = fs.createWriteStream(tempFile);
    var unzipDirname = path.join(destDirname, './' + name);

    debug.normal('download ' + name, url);
    request.down({
        url: url,
        query: {
            _: Date.now()
        }
    }, function (err, stream, res) {
        if (err) {
            debug.error('download ' + name, err.message);
            return process.exit(1);
        }

        if (res.statusCode !== 200) {
            debug.error('download ' + name, 'response status code is ' + res.statusCode);
            return process.exit(1);
        }

        stream.pipe(tempStream).on('error', function (err) {
            debug.success('download ' + name, err.message);
            process.exit(1);
        }).on('close', function () {
            debug.normal('unzip ' + name, tempFile);

            var zip = new AdmZip(tempFile);
            var unzipError = null;

            try {
                zip.extractAllTo(unzipDirname, true);
            } catch (err) {
                unzipError = err;
                debug.error('unzip ' + name, tempFile);
                debug.error('unzip ' + name, err.message);
            }

            try {
                fs.unlinkSync(tempFile);
            } catch (err) {
                debug.error('remove tempfile', tempFile);
                debug.error('remove tempfile', err.message);
            }

            if (!unzipError) {
                debug.success('unzip ' + name, unzipDirname);
                callback(null, unzipDirname);
            }
        });
    });
};






