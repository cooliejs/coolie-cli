/**
 * 初始化
 * @author ydr.me
 * @create 2015-10-31 14:11
 */


'use strict';

var fs = require('fs');
var debug = require('ydr-utils').debug;
var typeis = require('ydr-utils').typeis;
var path = require('ydr-utils').path;

var coolieConfigJSPath = path.join(__dirname, '../data/coolie.config.js');

/**
 * 生成配置文件
 * @param options {Object} 配置
 * @param options.srcDirname {String} 根目录
 */
module.exports = function (options) {
    var destPath = path.join(options.srcDirname, 'coolie.config.js');

    if (typeis.file(destPath)) {
        debug.error('init error', path.toSystem(destPath) + ' is exist');
        return process.exit(1);
    }

    fs.createReadStream(coolieConfigJSPath)
        .pipe(fs.createWriteStream(destPath))
        .on('error', function (err) {
            debug.error('coolie.config.js', path.toSystem(destPath));
            debug.error('init error', err.message);
            process.exit(1);
        })
        .on('close', function () {
            debug.success('init success', path.toSystem(destPath));
            process.exit(1);
        });
};

