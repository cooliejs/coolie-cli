/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-08 10:59
 */


'use strict';

var fs = require('fs');
var log = require('./log.js');
var dato = require('ydr-utils').dato;


/**
 * 文件 base64 编码
 * @param file
 * @param [callback]
 * @returns {*}
 */
module.exports = function (file, callback) {
    var binary;

    try {
        binary = fs.readFileSync(file, 'binary');
    } catch (err) {
        log('read file', dato.fixPath(file), 'error');
        log('read file', err.message, 'error');
    }

    var base64;

    try {
        base64 = new Buffer(binary, 'binary').toString('base64');
    } catch (err) {
        log('base64 file', dato.fixPath(file), 'error');
        log('base64 file', err.message, 'error');
    }

    if (callback) {
        callback(base64);
    } else {
        return base64;
    }
};


