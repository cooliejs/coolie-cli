/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-08 10:59
 */


'use strict';

var fs = require('fs');
var path = require('path');
var log = require('./log.js');
var pathURI = require('./path-uri.js');
var dato = require('ydr-utils').dato;
var mime = require('ydr-utils').mime;
var typeis = require('ydr-utils').typeis;


/**
 * 文件 base64 编码
 * @param file
 * @param [extname]
 * @param [callback]
 * @returns {*}
 */
module.exports = function (file, extname, callback) {
    var args = arguments;

    if (args.length === 2) {
        // file, callback
        if (typeis.function(args[1])) {
            callback = args[1];
            extname = null;
        } else {
            callback = null;
        }
    }

    var binary;
    extname = extname || path.extname(file);
    // data:image/png;base64,
    var prefix = 'data:' + mime.get(extname) + ';base64,';

    try {
        binary = fs.readFileSync(file, 'binary');
    } catch (err) {
        log('read file', pathURI.toSystemPath(file), 'error');
        log('read file', err.message, 'error');
        process.exit(1);
    }

    var base64;

    try {
        base64 = new Buffer(binary, 'binary').toString('base64');
    } catch (err) {
        log('base64 file', pathURI.toSystemPath(file), 'error');
        log('base64 file', err.message, 'error');
        process.exit(1);
    }

    if (callback) {
        callback(null, prefix + base64);
    } else {
        return prefix + base64;
    }
};


