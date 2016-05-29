/**
 * 文件读取器
 * @author ydr.me
 * @create 2015-10-22 09:50
 */


'use strict';

var fs = require('fs');
var path = require('ydr-utils').path;
var typeis = require('ydr-utils').typeis;
var debug = require('ydr-utils').debug;

var bookURL = require('./book-url');

var bufferMap = {};


/**
 * 读取文件内容
 * @param file {String} 文件
 * @param encoding {String} 编码
 * @param [embedFile] {String} 所在文件
 * @returns {*}
 */
module.exports = function (file, encoding, embedFile) {
    encoding = encoding || 'binary';
    bufferMap[encoding] = bufferMap[encoding] || {};
    var bf = bufferMap[encoding][file];

    if (!bf) {
        if (!typeis.file(file)) {
            console.log();
            debug.error('read file', path.toSystem(file));
            debug.error('read file', '该文件不存在');

            if (embedFile) {
                debug.error('embed file', path.toSystem(embedFile));
            }

            debug.warn('warning', '模块路径指南 <' + bookURL('/introduction/module-path/') + '>');
            process.exit(1);
        }

        try {
            var ret = fs.readFileSync(file, encoding);

            bf = bufferMap[encoding][file] = new Buffer(ret, encoding);
        } catch (err) {
            debug.error('read file', path.toSystem(file));
            debug.error('read file', err.message);

            if (embedFile) {
                debug.error('embed file', path.toSystem(embedFile));
            }

            process.exit(1);
        }
    }

    return encoding === 'binary' ? bf : bf.toString(encoding);
};


/**
 * 主动设置缓存
 * @param file
 * @param encoding
 * @param buffer
 */
module.exports.setCache = function (file, encoding, buffer) {
    bufferMap[encoding] = bufferMap[encoding] || {};
    bufferMap[encoding][file] = buffer;
};
