/**
 * css 路径构建
 * @author ydr.me
 * @create 2016-01-12 16:59
 */


'use strict';

var fse = require('fs-extra');
var path = require('blear.node.path');
var encryption = require('blear.node.encryption');
var debug = require('blear.node.debug');
var object = require('blear.utils.object');
var console = require('blear.node.console');

var pathURI = require('../utils/path-uri.js');
var reader = require('../utils/reader.js');
var sign = require('../utils/sign.js');
var minifyCSS = require('../minify/css.js');

var minifyPathmap = {};
var minifyCSSmap = {};
var resourceMap = {};
var defaults = {
    file: null,
    srcDirname: null,
    destDirname: null,
    destHost: null,
    destResourceDirname: null,
    destCSSDirname: null,
    minifyCSS: true,
    minifyResource: true,
    versionLength: 32,
    signCSS: true,
    cleanCSSOptions: null,
    mute: false
};


/**
 * 构建 css 路径
 * @param href
 * @param options
 * @param options.file
 * @param options.srcDirname
 * @param options.destDirname
 * @param options.destHost
 * @param options.destResourceDirname
 * @param options.destCSSDirname
 * @param options.minifyCSS
 * @param options.minifyResource
 * @param options.versionLength
 * @param options.signCSS
 * @param options.cleanCSSOptions
 * @param options.mute
 * @returns {*}
 */
module.exports = function (href, options) {
    options = object.assign({}, defaults, options);
    var pathRet = pathURI.parseURI2Path(href);

    if (!pathURI.isRelatived(pathRet.path)) {
        return false;
    }

    var srcPath = pathURI.toAbsoluteFile(href, options.file, options.srcDirname);
    var extname = path.extname(srcPath);
    var destPath = minifyPathmap[srcPath];
    var destURI = minifyCSSmap[srcPath];
    var resList = resourceMap[srcPath];

    if (!destURI) {
        var srcCode = reader(srcPath, 'utf8', options.file);
        var destCode = srcCode;

        if (options.minifyCSS) {
            var minifyCSSRet = minifyCSS(srcPath, {
                code: srcCode,
                cleanCSSOptions: options.cleanCSSOptions,
                versionLength: options.versionLength,
                srcDirname: options.srcDirname,
                destDirname: options.destDirname,
                destHost: options.destHost,
                destResourceDirname: options.destResourceDirname,
                minifyResource: options.minifyResource,
                replaceCSSResource: true,
                mute: options.mute
            });
            destCode = minifyCSSRet.code;
            resList = minifyCSSRet.resList;
        }

        var destVersion = encryption.md5(destCode).slice(0, options.versionLength);

        destPath = path.join(options.destCSSDirname, destVersion + extname);
        destURI = pathURI.toRootURL(destPath, options.destDirname);
        destURI = pathURI.joinHost('css', options.destHost, destURI);

        if (options.signCSS) {
            destCode = sign('css') + '\n' + destCode;
        }

        try {
            fse.outputFileSync(destPath, destCode, 'utf8');
            minifyPathmap[srcPath] = destPath;
            minifyCSSmap[srcPath] = destURI;
            resourceMap[srcPath] = resList;

            if (!options.mute) {
                debug.success('build css', pathURI.toRootURL(srcPath, options.srcDirname));
            }
        } catch (err) {
            debug.error('write file', path.normalize(destPath));
            debug.error('write file', err.message);
            return process.exit(1);
        }
    }

    return {
        url: destURI,
        srcFile: srcPath,
        destFile: destPath,
        resList: resList
    };
};


