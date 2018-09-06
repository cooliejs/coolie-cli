/**
 * js 路径构建
 * @author ydr.me
 * @create 2016-01-12 17:48
 */


'use strict';

var path = require('blear.node.path');
var encryption = require('blear.node.encryption');
var debug = require('blear.node.debug');
var object = require('blear.utils.object');
var console = require('blear.node.console');
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
    options = object.assign({}, defaults, options);
    var isRelatived = pathURI.isRelatived(src);

    if (!isRelatived) {
        return false;
    }

    var srcPath = pathURI.toAbsoluteFile(src, options.file, options.srcDirname);
    var destURI = minifyJSMap[srcPath];
    var destPath = minifyPathMap[srcPath];
    var srcURL = pathURI.toRootURL(srcPath, options.srcDirname);

    if (!destURI) {
        var srcCode = reader(srcPath, 'utf8', options.file);
        var destCode = srcCode;

        if (options.minifyJS) {
            destCode = minifyJS(srcPath, {
                code: srcCode,
                uglifyJSOptions: options.uglifyJSOptions
            }).code;
        }

        var destVersion = encryption.md5(destCode).slice(0, options.versionLength);

        destPath = path.join(options.destJSDirname, destVersion + '.js');
        destURI = pathURI.toRootURL(destPath, options.destDirname);
        destURI = pathURI.joinHost('js',options.destHost, destURI);

        if (options.signJS) {
            destCode = sign('js') + '\n' + destCode;
        }

        try {
            fse.outputFileSync(destPath, destCode, 'utf8');
            minifyPathMap[srcPath] = destPath;
            minifyJSMap[srcPath] = destURI;

            if (!options.mute) {
                debug.success('build js', srcURL);
            }
        } catch (err) {
            debug.error('write file', destPath);
            debug.error('write file', err.message);
            return process.exit(1);
        }
    }

    return {
        srcFile: srcPath,
        destFile: destPath,
        srcURL: srcURL,
        destURL: destURI,
        url: destURI
    };
};


