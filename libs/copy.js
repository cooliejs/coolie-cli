/*!
 * 复制文件
 * @author ydr.me
 * @create 2015-06-03 11:51
 */


'use strict';

var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
var encryption = require('ydr-utils').encryption;
var pathURI = require('./path-uri.js');
var log = require('./log.js');
var path = require('path');
var fse = require('fs-extra');
var defaults = {
    // 是否构建版本
    version: false,
    // 是否压缩
    minify: false,
    // 指定目标地址
    dest: null
};

/**
 * 复制单个文件
 * @param fromFile {String} 起始地址
 * @param [options] {Object} 配置
 */
module.exports = function (fromFile, options) {
    options = dato.extend({}, defaults, options);

    var configs = global.configs;

    if (!typeis.file(fromFile)) {
        log('file', pathURI.toSystemPath(fromFile) +
            '\n is NOT a file', 'error');
        process.exit(1);
    }

    var toFile = configs._copyFilesMap[fromFile];

    if (toFile) {
        return toFile;
    }

    var releativeTo = path.relative(configs._srcPath, fromFile);

    if (options.version) {
        var version = encryption.etag(fromFile).slice(0, configs.dest.versionLength);
        var extname = path.extname(fromFile);

        if (options.dest) {
            toFile = path.join(options.dest, version + extname);
        } else {
            toFile = path.join(configs._destPath, path.dirname(releativeTo), version + extname);
        }
    } else {
        if(options.dest){
            toFile = path.join(options.dest, releativeTo);
        }else{
            toFile = path.join(configs._destPath, releativeTo);
        }
    }

    try {
        fse.copySync(fromFile, toFile);
        configs._copyFilesMap[fromFile] = toFile;
        configs._copyLength++;
        log('√', pathURI.toSystemPath(toFile), 'success');
    } catch (err) {
        log('copy from', pathURI.toSystemPath(fromFile), 'error');
        log('copy to', pathURI.toSystemPath(toFile), 'error');
        log('copy error', err.message, 'error');
        process.exit(1);
    }

    return toFile;
};
