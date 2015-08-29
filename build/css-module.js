/*!
 * 构建 css 模块
 * @author ydr.me
 * @create 2015-08-28 23:12
 */


'use strict';

var fse = require('fs-extra');
var path = require('path');
var cssminify = require('../libs/cssminify.js');
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

    switch (optType) {
        case 'text':
            code = cssminify(file, code);
            break;

        case 'url':
            var version = encryption.etag(file).slice(0, configs.dest.versionLength);
            var destFile = path.join(configs._cssDestPath, version + '.css');

            code = cssminify(file, code, destFile);
            fse.writeFileSync();
            break;
    }

    return code;
};

