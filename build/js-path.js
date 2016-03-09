/**
 * js 路径构建
 * @author ydr.me
 * @create 2016-01-12 17:48
 */


'use strict';

var path = require('ydr-utils').path;
var encryption = require('ydr-utils').encryption;
var debug = require('ydr-utils').debug;
var dato = require('ydr-utils').dato;
var fse = require('fs-extra');

var pathURI = require('../utils/path-uri.js');
var reader = require('../utils/reader.js');
var sign = require('../utils/sign.js');
var minifyJS = require('../minify/js.js');

var minifyJSMap = {};
var minifyPathMap = {};
var defaults = {
    file: null,
    srcDirname: null,
    destDirname: null,
    destHost: null,
    destJSDirname: null,
    minifyJS: true,
    uglifyJSOptions: null,
    versionLength: 32,
    signJS: true,
    mute: false
};


/**
 * js 路径构建
 * @param src
 * @param options
 * @returns {*}
 */
module.exports = function (src, options) {
    options = dato.extend({}, defaults, options);
    var isRelatived = pathURI.isRelatived(src);

    if (!isRelatived) {
        return false;
    }

    var srcPath = pathURI.toAbsoluteFile(src, options.file, options.srcDirname);
    var destURI = minifyJSMap[srcPath];
    var destPath = minifyPathMap[srcPath];

    if (!destURI) {
        var srcCode = reader(srcPath, 'utf8', options.file);
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

            if (!options.mute) {
                debug.success('build', pathURI.toRootURL(srcPath, options.srcDirname));
            }
        } catch (err) {
            debug.error('write file', path.toSystem(destPath));
            debug.error('write file', err.message);
            return process.exit(1);
        }
    }

    return {
        srcFile: srcPath,
        destFile: destPath,
        url: destURI
    };
};


