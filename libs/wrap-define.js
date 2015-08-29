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
var typeis = require('ydr-utils').typeis;
var cssminify = require('./cssminify.js');
var htmlminify = require('./htmlminify.js');
var jsonminify = require('./jsonminify.js');
var pathURI = require('./path-uri.js');
var base64 = require('./base64.js');
var copy = require('./copy.js');
var path = require('path');
var fse = require('fs-extra');


/**
 * 生成模块 url
 * @param file
 * @param code
 * @param configs
 * @param meta
 * @param filter
 */
var createURL = function (file, code, configs, meta, filter) {
    var extname = path.extname(file);
    var version = encryption.etag(file).slice(0, configs.dest.versionLength);
    var destFile = '';

    switch (meta.type) {
        case 'css':
            destFile = path.join(configs._cssDestPath, version + extname);
            break;

        default :
            destFile = path.join(configs._resDestPath, version + extname);
    }

    var uri = path.relative(configs._destPath, destFile);

    if (code !== null && typeis.function(filter)) {
        code = filter(uri, destFile);
    }

    if(code === null){
        copy(file, {
            dest: configs._resDestPath
        });
    }else{
        try {
            fse.outputFileSync(destFile, code, 'utf-8');
        } catch (err) {
            log('write file', pathURI.toSystemPath(file), 'error');
            log('write file', err.message, 'error');
            process.exit(1);
        }
    }

    return uri;
};


/**
 * 包裹一层 define
 * @param file
 * @param depIdsMap
 * @param meta
 * @param callback
 */
module.exports = function wrapDefine(file, depIdsMap, meta, callback) {
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
    var uri;
    var extname = path.extname(file);
    var code = '';

    if (meta.type !== 'image') {
        try {
            code = fse.readFileSync(file, 'utf8');
        } catch (err) {
            log('read file', pathURI.toSystemPath(file), 'error');
            log('read file', err.message, 'error');
            process.exit(1);
        }
    }

    switch (meta.type) {
        case 'json':
            next(null, jsonminify(file, code));
            break;

        case 'css':
            switch (meta.outType) {
                case 'url':
                    uri = createURL(file, code, configs, meta, function (uri, destFile) {
                        return cssminify(file, code, destFile);
                    });
                    next(null, pathURI.joinURI(configs.dest.host, uri));
                    break;

                case 'base64':
                    code = cssminify(file, code, null);
                    next(null, base64(new Buffer(cssminify(file, code, null), 'binary'), extname));
                    break;

                default :
                    cssminify(file, code, null, next);
                    break;
            }
            break;

        case 'text':
            switch (meta.outType) {
                case 'url':
                    uri = createURL(file, null, configs, meta);
                    next(null, pathURI.joinURI(configs.dest.host, uri));
                    break;

                case 'base64':
                    code = cssminify(file, code, null);
                    next(null, base64(new Buffer(code, 'binary'), '.css'));
                    break;

                default :
                    next(null, code);
                    break;
            }
            break;

        case 'html':
            htmlminify(file, code, next);
            break;

        case 'image':
            switch (meta.outType) {
                case 'base64':
                    code = cssminify(file, code, null);
                    next(null, base64(new Buffer(code, 'binary'), '.css'));
                    break;

                default :
                    uri = createURL(file, code, configs, meta);
                    next(null, pathURI.joinURI(configs.dest.host, uri));
                    break;
            }
            break;

        default :
            next(null, code);
    }
};


