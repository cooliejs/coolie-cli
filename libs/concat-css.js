/*!
 * 合并 CSS 文件并生成 MD5
 * @author ydr.me
 * @create 2014-11-19 15:56
 */

'use strict';

var ydrUtil = require('ydr-util');
var fs = require('fs');
var log = require('./log.js');


/**
 * 合并 CSS 文件并生成 MD5
 * @param files {Array} 要合并的 css 文件列表
 * @returns {{md5: string, bufferList: Array}}
 */
module.exports = function (files) {
    var md5List = '';
    var bufferList = [];

    files.forEach(function (file) {
        var code;
        try {
            code = fs.readFileSync(file, 'utf8');
            md5List += ydrUtil.crypto.md5(code);
            bufferList.push(new Buffer(code, 'utf8'));
        } catch (err) {
            log('read file', file, 'error');
            log('read file', err.message, 'error');
            process.exit();
        }
    });

    return {
        md5: ydrUtil.crypto.md5(md5List),
        bufferList: bufferList
    };
};
