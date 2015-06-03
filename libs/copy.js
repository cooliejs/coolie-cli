/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-06-03 11:51
 */


'use strict';

var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
var pathURI = require('./path-uri.js');
var log = require('./log.js');
var path = require('path');
var fse = require('fs-extra');


/**
 * 复制单个文件
 * @param from {String} 起始地址
 * @param to {String} 目标地址
 * @param [options] {Object} 配置
 */
module.exports = function (from, to, options) {
    var configs = {};
    var fromFile = path.join(configs._srcPath, from);

    if (!pathURI.isRelatived(from)) {
        return;
    }

    if (!typeis.file(fromFile)) {
        log('file', pathURI.toSystemPath(fromFile) +
            '\n is NOT a file', 'error');
        process.exit();
    }

    var toFile = path.join(configs._destPath, from);

    try {
        fse.copySync(fromFile, toFile);
    } catch (err) {
        log('copy from', pathURI.toSystemPath(fromFile), 'error');
        log('copy to', pathURI.toSystemPath(toFile), 'error');
        log('copy file', err.message, 'error');
        process.exit();
    }
};
