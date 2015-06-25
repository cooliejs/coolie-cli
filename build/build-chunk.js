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


module.exports = function () {
    var configs = global.configs;
    var chunkList = [];

    dato.each(configs._chunkModuleIdMap, function (mod, mid) {
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

        var fileName = pathURI.replaceVersion(i + '.js', encryption.md5(md5List));
        var file = path.join(configs._destPath, configs.js.dest, fileName);

        try {
            fse.outputFileSync(file, output);
        } catch (err) {
            log('write file', pathURI.toSystemPath(file), 'error');
            log('write file', err.message, 'error');
            process.exit(1);
        }
    });
};

