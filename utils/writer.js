/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-27 23:38
 */


'use strict';

var fse = require('fs-extra');
var string = require('ydr-utils').string;
var debug = require('ydr-utils').debug;
var path = require('ydr-utils').path;
var dato = require('ydr-utils').dato;
var encryption = require('ydr-utils').encryption;

var sign = require('./sign.js');
var pathURI = require('./path-uri.js');

var defaults = {
    srcDirname: null,
    destDirname: null,
    fileNameTemplate: '${version}.js',
    signType: 'js',
    bufferList: [],
    versionList: [],
    versionLength: 32,
    log: false
};


/**
 *
 * @param options {Object} 配置
 * @param options.srcDirname {String} 原始目录
 * @param options.destDirname {String} 目标目录
 * @param options.fileNameTemplate {String} 文件名称模板
 * @param options.signType {String} 签名类型
 * @param options.bufferList {Array} buffer 列表
 * @param options.versionList {Array} 版本列表
 * @param options.versionLength {Number} 版本配置
 * @param options.log {Boolean} 是否显示日志
 * @returns {{file: String, version: String}}
 */
module.exports = function (options) {
    options = dato.extend({}, defaults, options);

    var version = encryption.md5(options.versionList.join('')).slice(0, options.versionLength);
    var outputPath = path.join(options.destDirname, string.assign(options.fileNameTemplate, {
        version: version
    }));

    if (options.signType) {
        options.bufferList.unshift(new Buffer(sign(options.signType), 'utf8'));
    }

    var buffer = Buffer.concat(options.bufferList);
    var outputURI = pathURI.toRootURL(outputPath, options.srcDirname);

    try {
        fse.outputFileSync(outputPath, buffer);

        if (options.log) {
            debug.success('write file', outputURI);
        }
    } catch (err) {
        debug.error('write file', path.toSystem(outputPath));
        debug.error('write file', err.message);
        return process.exit(1);
    }

    return {
        path: outputPath,
        version: version
    };
};


