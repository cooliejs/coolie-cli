/**
 * base64 文本或二进制
 * @author ydr.me
 * @create 2015-05-08 10:59
 */


'use strict';

var fs = require('fs');
var path = require('ydr-utils').path;
var dato = require('ydr-utils').dato;
var mime = require('ydr-utils').mime;
var typeis = require('ydr-utils').typeis;
var string = require('ydr-utils').string;
var debug = require('blear.node.debug');

var reader = require('./reader.js');


/**
 * 内容 base64 编码
 * @param source {String} 字符串
 * @param [extname] {String} 后缀
 * @returns {string}
 */
exports.string = function (source, extname) {
    var ret = string.base64(source);
    var prefix = '';

    if (extname) {
        // data:image/png;base64,
        prefix = 'data:' + mime.get(extname) + ';base64,';
    }

    return prefix + ret;
};


/**
 * 文件 base64 编码
 * @param file {String|Object} 文件或者文件二进制编码
 * @param [extname] {String} 后缀
 * @returns {*}
 */
exports.file = function (file, extname) {
    var binary;

    // 文件
    if (typeis.file(file)) {
        extname = extname || path.extname(file);
        try {
            binary = reader(file, 'binary');
        } catch (err) {
            debug.error('base64 file', path.toSystem(file));
            return process.exit(1);
        }
    } else {
        debug.error('base64 file', path.toSystem(file) + ' is NOT a local file');
        return process.exit(1);
    }

    // data:image/png;base64,
    var prefix = 'data:' + mime.get(extname) + ';base64,';
    var base64;

    try {
        base64 = new Buffer(binary, 'binary').toString('base64');
    } catch (err) {
        debug.error('base64 file', path.toSystem(file));
        debug.error('base64 error', err.message);
        return process.exit(1);
    }

    return prefix + base64;
};


