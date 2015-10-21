/*!
 * 复制文件
 * @author ydr.me
 * @create 2015-06-03 11:51
 */


'use strict';

var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
var encryption = require('ydr-utils').encryption;
var path = require('ydr-utils').path;
var fse = require('fs-extra');

var log = require('./log.js');
var pathURI = require('./path-uri.js');

var copyFilesMap = {};
var copyLength = 0;
var REG_POINT = path.sep === '/' ? /^\.{1,2}\// : /^\.{1,2}\\/;
var defaults = {
    // 所在的原始文件
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
    logType: 2,
    srcDirname: '',
    destDirname: '',
    versionLength: 32
};

/**
 * 复制单个文件
 * @param file {String} 起始地址
 * @param [options] {Object} 配置
 */
module.exports = function (file, options) {
    if (pathURI.isURL(file)) {
        return;
    }

    options = dato.extend({}, defaults, options);

    var fromTo = pathURI.relative(options.srcDirname, file);

    if (REG_POINT.test(fromTo)) {
        if (pathURI.isRelativeRoot(file)) {
            file = path.join(options.srcDirname, file);
        } else if (pathURI.isRelativeFile(file) && options.srcFile) {
            file = path.join(path.dirname(options.srcFile), file);
        } else if (options.dest) {
            file = path.join(options.dest, file);
        }
    }

    if (!typeis.file(file)) {
        if (options.srcFile) {
            log('copy file', pathURI.toSystemPath(options.srcFile), 'error');
        }

        if (options.srcCode) {
            log('source code', options.srcCode, 'error');
        }

        log('copy error', pathURI.toSystemPath(file) + ' is NOT a local file', 'error');
        process.exit(1);
    }

    var toFile = copyFilesMap[file];

    if (toFile) {
        return toFile;
    }

    var releativeTo = pathURI.relative(options.srcDirname, file);

    if (options.version) {
        var version = encryption.etag(file).slice(0, options.versionLength);
        var extname = path.extname(file);

        if (options.dest) {
            toFile = path.join(options.dest, version + extname);
        } else {
            toFile = path.join(options.destDirname, path.dirname(releativeTo), version + extname);
        }
    } else {
        if (options.dest) {
            toFile = path.join(options.dest, releativeTo);
        } else {
            toFile = path.join(options.destDirname, releativeTo);
        }
    }

    try {
        fse.copySync(file, toFile);
        copyFilesMap[file] = toFile;
        copyLength++;

        switch (options.logType) {
            case 1:
                log('√', pathURI.toRootURL(file, options.srcDirname), 'success');
                break;

            case 2:
                log('√', pathURI.toRootURL(toFile, options.srcDirname), 'success');
                break;
        }
    } catch (err) {
        log('copy from', pathURI.toSystemPath(file), 'error');
        log('copy to', pathURI.toSystemPath(toFile), 'error');
        log('copy error', err.message, 'error');
        process.exit(1);
    }

    return toFile;
};


/**
 * 获取复制文件的个数
 * @returns {number}
 */
module.exports.getCopLength = function () {
    return copyLength;
};

