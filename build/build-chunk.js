/*!
 * chunk 模块构建
 * @author ydr.me
 * @create 2015-06-25 15:25
 */


'use strict';

var dato = require('ydr-utils').dato;
var encryption = require('ydr-utils').encryption;
var sign = require('../libs/sign.js');
var log = require('../libs/log.js');
var pathURI = require('../libs/path-uri.js');
var fse = require('fs-extra');
var path = require('ydr-utils').path;
var howdo = require('howdo');


/**
 * chunk 构建
 * @param versionMap {Object} 版本
 * @param callback {Function} 回调
 */
module.exports = function (versionMap, callback) {
    var configs = global.configs;

    howdo.each(configs._chunkList, function (index, files, done) {
        var bfList = [];
        var output = sign('js');
        var md5List = '';

        dato.each(files, function (j, file) {
            bfList.push(configs._chunkBufferMap[file]);
            md5List += configs._chunkMD5Map[file];
        });

        output += Buffer.concat(bfList).toString();

        var version = encryption.md5(md5List).slice(0, configs.dest.versionLength);
        var fileName = index + '.js';
        var srcName = path.join(pathURI.relative(configs.srcDirname, configs._chunkDirname), fileName);
        var destFile = path.join(configs.destDirname, srcName);

        destFile = pathURI.replaceVersion(destFile, version);
        versionMap[pathURI.toURIPath(srcName)] = version;

        fse.outputFile(destFile, output, function (err) {
            if (err) {
                log('write file', pathURI.toSystemPath(destFile), 'error');
                log('write file', err.message, 'error');
                process.exit(1);
            }

            log('√', pathURI.toRootURL(destFile), 'success');
            done();
        });
    }).together(callback);
};

