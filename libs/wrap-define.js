/*!
 * wrap-define.js
 * @author ydr.me
 * @create 2014-10-25 14:16
 */


'use strict';

var REG_HUA_START = /^.*?:/;
var REG_HUA_END = /}$/;
var log = require('./log.js');
var encryption = require('ydr-utils').encryption;
var cssminify = require('./cssminify.js');
var htmlminify = require('./htmlminify.js');
var jsonminify = require('./jsonminify.js');
var pathURI = require('./path-uri.js');
var path = require('path');
var fse = require('fs-extra');


/**
 * 包裹一层 define
 * @param file
 * @param code
 * @param depIdsMap
 * @param meta
 * @param callback
 */
module.exports = function wrapDefine(file, code, depIdsMap, meta, callback) {
    var configs = global.configs;

    var next = function (err, code) {
        if (err) {
            return;
        }

        var text = code;

        if (meta.type !== 'json') {
            var o = {
                o: code
            };
            text = JSON.stringify(o)
                .replace(REG_HUA_START, '')
                .replace(REG_HUA_END, '');
        }

        code = 'define("' + depIdsMap[file] + '",[],function(y,d,r){' +
            'r.exports=' + text + '' +
            '});';

        callback(null, code);
    };

    switch (meta.type) {
        case 'json':
            next(null, jsonminify(file, code));
            break;

        case 'css':
            // 出口类型
            switch (meta.outType) {
                case 'url':
                    var version = encryption.etag(file).slice(0, configs.dest.versionLength);
                    var destFile = path.join(configs._cssDestPath, version + '.css');
                    var uri = path.relative(configs._destPath, destFile);

                    code = cssminify(file, code, destFile);

                    try {
                        fse.outputFileSync(destFile, code, 'utf-8');
                    } catch (err) {
                        log('write file', pathURI.toSystemPath(file), 'error');
                        log('write file', err.message, 'error');
                        process.exit(1);
                    }

                    next(null, pathURI.joinURI(configs.dest.host, uri));
                    break;

                default :
                    cssminify(file, code, null, next);
                    break;
            }
            break;

        case 'html':
            htmlminify(file, code, next);
            break;

        default :
            next(null, code);
    }
};


