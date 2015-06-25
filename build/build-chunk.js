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
var path = require('path');


/**
 * chunk 构建
 * @param versionMap {Object} 版本
 */
module.exports = function (versionMap) {
    var configs = global.configs;
    var chunkList = [];

    dato.each(configs._chunkModuleMap, function (mod, mid) {
        var index = configs._chunkFileMap[mod] * 1;

        chunkList[index] = chunkList[index] || [];
        chunkList[index].push(mod);
    });

    dato.each(chunkList, function (i, files) {
        var bfList = [];
        var output = sign('js');
        var md5List = '';

        dato.each(files, function (j, file) {
            bfList.push(configs._chunkBufferMap[file]);
            md5List += configs._chunkMD5Map[file];
        });

        output += Buffer.concat(bfList).toString();

        var version = encryption.md5(md5List);
        var fileName = i + '.js';
        var srcName = path.join(path.relative(configs._srcPath, configs._jsBase), fileName);
        var destFile = pathURI.replaceVersion(path.join(configs._destPath, srcName), version);

        versionMap[pathURI.toURIPath(srcName)] = version;

        try {
            fse.outputFileSync(destFile, output);
            log('√', pathURI.toSystemPath(destFile), 'success');
        } catch (err) {
            log('write file', pathURI.toSystemPath(destFile), 'error');
            log('write file', err.message, 'error');
            process.exit(1);
        }
    });
};

