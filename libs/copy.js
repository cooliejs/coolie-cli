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
var REG_POINT = /^\.{1,2}\//;
var defaults = {
    // 原始文件
    srcFile: '',
    // 原始代码片段
    srcCode: '',
    // 是否构建版本
    version: false,
    // 是否压缩
    minify: false,
    // 指定目标地址
    dest: null,
    // 打印类型
    // 0：不打印
    // 1：源文件
    // 2：目标文件
    logType: 2
};

/**
 * 复制单个文件
 * @param fromFile {String} 起始地址
 * @param [options] {Object} 配置
 */
module.exports = function (fromFile, options) {
    // 如果不是相对路径文件
    if (!pathURI.isRelatived(fromFile)) {
        return;
    }

    options = dato.extend({}, defaults, options);

    var configs = global.configs;
    var fromTo = path.relative(configs._srcPath, fromFile);

    if (REG_POINT.test(fromTo)) {
        if (pathURI.isRelativeRoot(fromFile)) {
            fromFile = path.join(configs._srcPath, fromFile);
        } else if (pathURI.isRelativeFile(fromFile) && options.srcFile) {
            fromFile = path.join(path.dirname(options.srcFile), fromFile);
        } else if (options.dest) {
            fromFile = path.join(options.dest, fromFile);
        }
    }

    if (!typeis.file(fromFile)) {
        if (options.srcFile) {
            log('copy file', pathURI.toSystemPath(options.srcFile), 'error');
        }

        if (options.srcCode) {
            log('source code', options.srcCode, 'error');
        }

        log('copy error', pathURI.toSystemPath(fromFile) + ' is NOT a local file', 'error');
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
        if (options.dest) {
            toFile = path.join(options.dest, releativeTo);
        } else {
            toFile = path.join(configs._destPath, releativeTo);
        }
    }

    try {
        fse.copySync(fromFile, toFile);
        configs._copyFilesMap[fromFile] = toFile;
        configs._copyLength++;

        switch (options.logType) {
            case 1:
                log('√', pathURI.toRootURL(fromFile), 'success');
                break;

            case 2:
                log('√', pathURI.toRootURL(toFile), 'success');
                break;
        }
    } catch (err) {
        log('copy from', pathURI.toSystemPath(fromFile), 'error');
        log('copy to', pathURI.toSystemPath(toFile), 'error');
        log('copy error', err.message, 'error');
        process.exit(1);
    }

    return toFile;
};
