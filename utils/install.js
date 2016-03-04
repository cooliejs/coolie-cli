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
var os = require('os');


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
    var tempFile = path.join(os.tmpdir(), tempName + '.zip');
    var unzipName = options.type === 'file' ? tempName : name;
    var tempStream = fse.createWriteStream(tempFile);
    var unzipDirname = path.join(destDirname, './' + unzipName);

    if (!typeis.function(callback)) {
        callback = function () {
            // ignore
        };
    }

    debug.ignore('install ' + name, url);
    console.loading();
    request.get({
        url: url,
        debug: false
    }).on('error', function (err) {
        debug.error('install ' + name, err.message);
        process.exit(1);
    }).pipe(tempStream).on('error', function (err) {
        debug.error('install ' + name, err.message);
        console.loadingEnd()
        process.exit(1);
    }).on('close', function () {
        console.loadingEnd()
        debug.ignore('unzip ' + name, tempFile);

        var zip = new AdmZip(tempFile);
        var unzipError = null;

        try {
            zip.extractAllTo(unzipDirname, true);
        } catch (err) {
            unzipError = err;
            debug.error('unzip ' + name, unzipDirname);
            debug.error('unzip ' + name, err.message);
        }

        if (unzipError) {
            return process.exit(1);
        }

        if (options.type === 'file') {
            // 目标目录 + 临时目录 + 所有文件
            var globFile = path.join(options.destDirname, tempName, './**/*');
            var files = glob.sync(globFile);

            dato.each(files, function (index, file) {
                var basename = path.basename(file);
                var destPath = path.join(options.destDirname, basename);

                try {
                    fse.copySync(file, destPath);
                    debug.success(name + ' file', path.toSystem(destPath));
                } catch (err) {
                    debug.error(name + ' file', path.toSystem(destPath));
                    debug.error('copy error', err.message);
                    return process.exit(1);
                }
            });

            try {
                fse.removeSync(unzipDirname);
            } catch (err) {
                // ignore
            }
        } else {
            debug.success(name + ' directory', path.toSystem(unzipDirname));
        }

        try {
            fse.removeSync(tempFile);
        } catch (err) {
            // ignore
        }

        callback(null, unzipDirname);
    });
};






