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


/**
 * 包裹一层 define
 * @param file
 * @param code
 * @param depIdsMap
 * @param textType
 * @param callback
 */
module.exports = function wrapDefine(file, code, depIdsMap, textType, callback) {
    var configs = global.configs;

    var next = function (err, code) {
        if (err) {
            return;
        }

        var text = code;

        if (textType !== 'json') {
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

    switch (textType) {
        case 'json':
            next(null, jsonminify(file, code));
            break;

        case 'css':
            var version = encryption.etag(file);
            var destFile = path.join(configs._cssDestPath, version + '.css');
            var uri = path.relative(configs._destPath, destFile);

            cssminify(file, code, destFile);
            next(null, pathURI);
            break;

        case 'html':
            htmlminify(file, code, next);
            break;

        default :
            next(null, code);
    }
};


