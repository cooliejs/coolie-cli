/*!
 * 构建 css 模块
 * @author ydr.me
 * @create 2015-08-28 23:12
 */


'use strict';

var fse = require('fs-extra');
var path = require('path');
var cssminify = require('../libs/cssminify.js');
var log = require('../libs/log.js');
var pathURI = require('../libs/path-uri.js');
var encryption = require('ydr-utils').encryption;


/**
 * 处理 css 模块
 * @param file
 * @param pipeline
 * @param options
 */
module.exports = function (file, pipeline, options) {
    pipeline = pipeline.split('|');

    var configs = global.configs;
    var code = fse.readFileSync(file, 'utf8');
    var optType = pipeline.length > 1 ? pipeline[pipeline.length - 1] : 'text';
    var destFile = null;

    switch (optType) {
        case 'text':
            code = cssminify(file, code);
            break;

        case 'url':
            var version = encryption.etag(file).slice(0, configs.dest.versionLength);
            destFile = path.join(configs._cssDestPath, version + '.css');

            code = cssminify(file, code, destFile);

            try {
                fse.writeFileSync(destFile, code, 'utf8');
            } catch (err) {
                log('cssminify', pathURI.toSystemPath(file), 'error');
                log('cssminify', err.message, 'error');
                process.exit(1);
            }

            break;
    }

    return {
        code: code,
        destFile: destFile
    };
};

