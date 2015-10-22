/**
 * 文件读取器
 * @author ydr.me
 * @create 2015-10-22 09:50
 */


'use strict';

var fs = require('fs');
var typeis = require('ydr-utils').typeis;

var log = require('./log.js');

var bufferMap = {};


/**
 * 读取文件内容
 * @param file {String} 文件
 * @param [encoding] {String} 编码，默认为二进制
 * @returns {*}
 */
module.exports = function (file, encoding) {
    if (!typeis.file(file)) {
        log('read file', path.toSystem(file), 'error');
        log('read file', 'no such file', 'error');
        return process.exit(1);
    }

    var bf = bufferMap[file];

    if (!bf) {
        try {
            var ret = fs.readFileSync(file, encoding);

            bf = bufferMap[file] = new Buffer(ret, encoding);
        } catch (err) {
            log('read file', path.toSystem(file), 'error');
            log('read file', err.message, 'error');
            return process.exit(1);
        }
    }

    return encoding ? bf.toString(encoding) : bf;
};

