/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-08 10:59
 */


'use strict';

var fs = require('fs');
var log = require('./log.js');
var dato = require('ydr-utils').dato;


module.exports = function(file){
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

    return base64;
};


