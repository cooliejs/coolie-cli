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

var bufferMap = {};


/**
 * 读取文件内容
 * @param file {String} 文件
 * @param encoding {String} 编码
 * @param embedFile {String} 所在文件
 * @returns {*}
 */
module.exports = function (file, encoding, embedFile) {
    if (!typeis.file(file)) {
        debug.error('read file', path.toSystem(file));
        debug.error('read file', 'no such file');

        if (embedFile) {
            debug.error('embed file', path.toSystem(embedFile));
        }

        process.exit(1);
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

            if (embedFile) {
                debug.error('embed file', path.toSystem(embedFile));
            }

            process.exit(1);
        }
    }

    return encoding === 'binary' ? bf : bf.toString(encoding);
};

