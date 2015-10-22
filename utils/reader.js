/**
 * 文件读取器
 * @author ydr.me
 * @create 2015-10-22 09:50
 */


'use strict';

var fs = require('fs');
var typeis = require('ydr-utils').typeis;
var debug = require('ydr-utils').debug;

var bufferMap = {};


/**
 * 读取文件内容
 * @param file {String} 文件
 * @param [encoding] {String} 编码，默认为二进制
 * @returns {*}
 */
module.exports = function (file, encoding) {
    if (!typeis.file(file)) {
        debug.error('read file', path.toSystem(file));
        debug.error('read file', 'no such file');
        return process.exit(1);
    }

    encoding = encoding || 'binary';
    bufferMap[encoding] = bufferMap[encoding] || {};
    var bf = bufferMap[encoding][file];

    if (!bf) {
        try {
            var ret = fs.readFileSync(file, encoding);

            bf = bufferMap[encoding][file] = new Buffer(ret, encoding);
        } catch (err) {
            debug.error('read file', path.toSystem(file));
            debug.error('read file', err.message);
            return process.exit(1);
        }
    }

    return encoding === 'binary' ? bf : bf.toString(encoding);
};

