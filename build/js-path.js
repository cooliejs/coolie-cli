/**
 * js 路径构建
 * @author ydr.me
 * @create 2016-01-12 17:48
 */


'use strict';

var encryption = require('ydr-utils').encryption;
var fse = require('fs-extra');

var pathURI = require('../utils/path-uri.js');
var reader = require('../utils/reader.js');
var minifyJS = require('../minify/js.js');

var minifyJSMap = {};
var minifyPathMap = {};

module.exports = function (src) {
    // 有 src 属性
    var isRelatived = pathURI.isRelatived(src);

    if (!isRelatived) {
        return source;
    }

    var srcPath = pathURI.toAbsoluteFile(src, file, options.srcDirname);
    var destURI = minifyJSMap[srcPath];
    var destPath = minifyPathMap[srcPath];

    if (!destURI) {
        var srcCode = reader(srcPath, 'utf8');
        var destCode = srcCode;

        if (options.minifyJS) {
            destCode = minifyJS(srcPath, {
                code: srcCode,
                uglifyJSOptions: options.uglifyJSOptions
            });
        }

        var destVersion = encryption.md5(destCode).slice(0, options.versionLength);

        destPath = path.join(options.destJSDirname, destVersion + '.js');
        destURI = pathURI.toRootURL(destPath, options.destDirname);
        destURI = pathURI.joinURI(options.destHost, destURI);

        if (options.signJS) {
            destCode = sign('js') + '\n' + destCode;
        }

        try {
            fse.outputFileSync(destPath, destCode, 'utf8');
            minifyPathMap[srcPath] = destPath;
            minifyJSMap[srcPath] = destURI;
            debug.success('√', pathURI.toRootURL(srcPath, options.srcDirname));
        } catch (err) {
            debug.error('write file', path.toSystem(destPath));
            debug.error('write file', err.message);
            return process.exit(1);
        }
    }
    ;


