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
var debug = require('ydr-utils').debug;
var fse = require('fs-extra');

var pathURI = require('./path-uri.js');

var copyFilesMap = {};
var copyLength = 0;
var REG_POINT = path.sep === '/' ? /^\.{1,2}\// : /^\.{1,2}\\/;
var defaults = {
    srcDirname: '',
    destDirname: '',
    // 是否复制路径
    // src/a/b/c/file.html
    // true: dest/a/b/c/file.html
    // false: dest/file.html
    copyPath: true,
    // 所在的原始文件
    embedFile: '',
    // 原始代码片段
    embedCode: '',
    // 是否构建版本
    version: false,
    versionLength: 32,
    // 是否压缩
    minify: false,
    // 打印类型
    // 0：不打印
    // 1：源文件
    // 2：目标文件
    logType: 2
};

/**
 * 复制单个文件
 * @param file {String} 起始地址
 * @param options {Object} 配置
 * @param options.srcDirname {String} 原始根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.copyPath {Boolean} 是否复制路径
 * @param options.embedFile {String} 被嵌入的文件
 * @param options.embedCode {String} 被嵌入的文件代码
 * @param options.version {Boolean} 是否版本控制
 * @param options.versionLength {Number} 版本长度
 * @param options.minify {Boolean} 是否压缩
 * @param [options.logType=2] {Number} 日志类型
 */
module.exports = function (file, options) {
    options = dato.extend({}, defaults, options);

    var fromTo = pathURI.relative(options.srcDirname, file);

    if (REG_POINT.test(fromTo)) {
        if (pathURI.isRelativeRoot(file)) {
            file = path.join(options.srcDirname, file);
        } else if (pathURI.isRelativeFile(file) && options.embedFile) {
            file = path.join(path.dirname(options.embedFile), file);
        }
    }

    if (!typeis.file(file)) {
        if (options.embedFile) {
            debug.error('embed file', pathURI.toSystemPath(options.embedFile));
        }

        if (options.embedCode) {
            debug.error('embed code', options.embedCode);
        }

        debug.error('copy error', pathURI.toSystemPath(file) + ' is NOT a local file');
        return process.exit(1);
    }

    var toFile = copyFilesMap[file];

    if (toFile) {
        return toFile;
    }

    var releativeTo = pathURI.relative(options.srcDirname, file);

    if (options.version) {
        var version = encryption.etag(file).slice(0, options.versionLength);
        var extname = path.extname(file);

        toFile = path.join(options.destDirname, options.copyPath ? path.dirname(releativeTo) : '', version + extname);
    } else {
        var releativeName = path.basename(releativeTo);

        toFile = path.join(options.destDirname, options.copyPath ? releativeTo : releativeName);
    }

    try {
        fse.copySync(file, toFile);
        copyFilesMap[file] = toFile;
        copyLength++;

        switch (options.logType) {
            case 1:
                debug.success('√', pathURI.toRootURL(file, options.srcDirname));
                break;

            case 2:
                debug.success('√', pathURI.toRootURL(toFile, options.srcDirname));
                break;
        }
    } catch (err) {
        debug.error('copy from', pathURI.toSystemPath(file));
        debug.error('copy to', pathURI.toSystemPath(toFile));
        debug.error('copy error', err.message);
        return process.exit(1);
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

