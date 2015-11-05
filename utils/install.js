/**
 * 下载 zip 文件并解压
 * @author ydr.me
 * @create 2015-10-29 21:56
 */


'use strict';


var fse = require('fs-extra');
var path = require('ydr-utils').path;
var request = require('ydr-utils').request;
var random = require('ydr-utils').random;
var debug = require('ydr-utils').debug;
var typeis = require('ydr-utils').typeis;
var dato = require('ydr-utils').dato;
var AdmZip = require('adm-zip');
var glob = require('glob');


/**
 * 从远程下载 zip 文件
 * @param options {Object} 配置
 * @param options.url {String} 目标地址
 * @param options.destDirname {String} 目录
 * @param options.name {String} 文件名
 * @param options.type {String} file/directory 模块类型
 * @param [callback] {Function} 回调
 */
module.exports = function (options, callback) {
    var destDirname = options.destDirname;
    var url = options.url;
    var name = options.name;
    var tempName = random.guid();
    var tempFile = path.join(destDirname, tempName + '.zip');
    var unzipName = options.type === 'file' ? tempName : name;
    var tempStream = fse.createWriteStream(tempFile);
    var unzipDirname = path.join(destDirname, './' + unzipName);

    if (!typeis.function(callback)) {
        callback = function () {
            // ignore
        };
    }

    debug.success('install ' + name, url);
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
            debug.success('install ' + name, err.message);
            process.exit(1);
        }).on('close', function () {
            debug.ignore('unzip ' + name, tempFile);

            var zip = new AdmZip(tempFile);
            var unzipError = null;

            try {
                zip.extractAllTo(unzipDirname, true);
                debug.success('unzip ' + name, unzipDirname);
            } catch (err) {
                unzipError = err;
                debug.error('unzip ' + name, tempFile);
                debug.error('unzip ' + name, err.message);
            }

            if (unzipError) {
                return process.exit(1);
            }

            if (options.type === 'file') {
                // 目标目录 + 临时目录 + 所有文件
                var globFile = path.join(options.destDirname, tempName, '**');
                var files = glob.sync(globFile);

                dato.each(files, function (index, file) {
                    var basename = path.basename(file);
                    var destPath = path.join(options.destDirname, basename);

                    try {
                        fse.moveSync(file, destPath);
                        debug.success(name + ' file', path.toSystem(destPath));
                    } catch (err) {
                        debug.error(name + ' file', path.toSystem(destPath));
                        debug.error('copy error', err.message);
                        return process.exit(1);
                    }
                });
            }

            try {
                fse.unlinkSync(tempFile);
            } catch (err) {
                debug.error('remove tempfile', tempFile);
                debug.error('remove tempfile', err.message);
            }

            callback(null, unzipDirname);
        });
    });
};






