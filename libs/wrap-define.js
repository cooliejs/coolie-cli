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
var unicode = require('./unicode.js');
var path = require('ydr-utils').path;
var fse = require('fs-extra');


/**
 * 生成模块 url
 * @param file
 * @param code {String|Null} image 的 code 为 null
 * @param configs
 * @param meta
 * @param filter
 */
var createURL = function (file, code, configs, meta, filter) {
    var dest = meta.type === 'css' ? configs.destCSSDirname : configs.destResourceDirname;
    var destFile = '';

    // 直接复制
    if (code === null) {
        destFile = copy(file, {
            dest: dest,
            version: true,
            logType: 1
        });
    } else {
        var extname = path.extname(file);
        var version = encryption.etag(file).slice(0, configs.dest.versionLength);

        destFile = path.join(configs.destCSSDirname, version + extname);

        if (code !== null && typeis.function(filter)) {
            code = filter(destFile);
        }

        try {
            fse.outputFileSync(destFile, code, 'utf-8');
        } catch (err) {
            log('write file', pathURI.toSystemPath(file), 'error');
            log('write file', err.message, 'error');
            process.exit(1);
        }
    }

    var relativeTo = pathURI.relative(configs.destDirname, destFile);

    return pathURI.joinURI(configs.dest.host, relativeTo);
};


/**
 * 包裹一层 define
 * @param file
 * @param meta
 * @param callback
 */
module.exports = function wrapDefine(file, meta, callback) {
    var configs = global.configs;
    var next = function (err, code) {
        if (err) {
            return;
        }

        var text = code;

        if (!(meta.type === 'json' && meta.outType === 'js')) {
            var o = {
                o: code
            };

            text = JSON.stringify(o)
                .replace(REG_HUA_START, '')
                .replace(REG_HUA_END, '');
        }

        code = 'define("' + configs._moduleIdMap[file] + '",[],function(y,d,r){' +
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
            log('wrap define', pathURI.toSystemPath(file), 'error');
            log('read file', pathURI.toSystemPath(file), 'error');
            log('read error', err.message, 'error');
            process.exit(1);
        }
    }

    switch (meta.type) {
        case 'json':
            switch (meta.outType) {
                case 'url':
                    uri = createURL(file, code, configs, meta, function (destFile) {
                        return jsonminify(file, code);
                    });
                    next(null, pathURI.joinURI(configs.dest.host, uri));
                    break;

                case 'base64':
                    code = jsonminify(file, code, null);
                    code = unicode(code);
                    next(null, base64(new Buffer(code, 'utf8'), extname));
                    break;

                default :
                    code = jsonminify(file, code);
                    next(null, code);
                    break;
            }
            break;

        case 'css':
            switch (meta.outType) {
                case 'url':
                    uri = createURL(file, code, configs, meta, function (destFile) {
                        return cssminify(file, code, destFile).code;
                    });
                    next(null, pathURI.joinURI(configs.dest.host, uri));
                    break;

                case 'base64':
                    code = cssminify(file, code, null).code;
                    code = unicode(code);
                    next(null, base64(new Buffer(code, 'utf8'), extname));
                    break;

                default :
                    cssminify(file, code, null, function (err, cssInfo) {
                        next(err, cssInfo && cssInfo.code);
                    });
                    break;
            }
            break;

        case 'text':
            switch (meta.outType) {
                case 'url':
                    uri = createURL(file, code, configs, meta);
                    next(null, pathURI.joinURI(configs.dest.host, uri));
                    break;

                case 'base64':
                    code = unicode(code);
                    next(null, base64(new Buffer(code, 'utf8'), extname));
                    break;

                default :
                    next(null, code);
                    break;
            }
            break;

        case 'html':
            switch (meta.outType) {
                case 'url':
                    uri = createURL(file, code, configs, meta, function (destFile) {
                        return htmlminify(file, {
                            code: code,
                            type: 'module'
                        });
                    });
                    next(null, pathURI.joinURI(configs.dest.host, uri));
                    break;

                case 'base64':
                    code = htmlminify(file, {
                        code: code,
                        type: 'module'
                    });
                    code = unicode(code);
                    next(null, base64(new Buffer(code, 'utf8'), extname));
                    break;

                default :
                    htmlminify(file, {
                        code: code
                    }, next);
                    break;
            }
            break;

        case 'image':
            switch (meta.outType) {
                case 'base64':
                    code = cssminify(file, code, null).code;
                    next(null, base64(file));
                    break;

                default :
                    uri = createURL(file, null, configs, meta);
                    next(null, uri);
                    break;
            }
            break;

        default :
            next(null, code);
    }
};


