/**
 * 资源路径
 * @author ydr.me
 * @create 2016-01-12 16:19
 */

'use strict';

var object = require('blear.utils.object');
var path = require('blear.node.path');
var console = require('blear.node.console');


var pathURI = require('../utils/path-uri.js');
var copy = require('../utils/copy.js');
var base64 = require('../utils/base64.js');

var defaults = {
    file: null,
    versionLength: 32,
    srcDirname: null,
    destDirname: null,
    destResourceDirname: null,
    destHost: '/',
    mute: false,
    base64: false
};


/**
 * 资源路径
 * @param value
 * @param options
 * @returns {*}
 */
module.exports = function (value, options) {
    options = object.assign({}, defaults, options);

    var pathRet = pathURI.parseURI2Path(value);

    // 非相对路径
    if (!pathURI.isRelatived(pathRet.path)) {
        return false;
    }

    var absFile = pathURI.toAbsoluteFile(pathRet.path, options.file, options.srcDirname);
    var url = '';
    var resFile = absFile;

    if (options.base64) {
        url = base64.file(absFile);
    } else {
        resFile = copy(absFile, {
            version: true,
            copyPath: false,
            versionLength: options.versionLength,
            srcDirname: options.srcDirname,
            destDirname: options.destResourceDirname,
            logType: options.mute ? 0 : 1,
            embedFile: options.file
        });
        var resRelative = path.relative(options.destDirname, resFile);
        url = pathURI.joinHost('res', options.destHost, resRelative);
        options.middleware.use({
            file: absFile,
            url: url,
            progress: 'post-resource'
        });
    }

    var destURL = url + (options.base64 ? '' : pathRet.suffix);

    return {
        srcFile: absFile,
        destFile: resFile,
        srcURL: pathURI.toRootURL(absFile, options.srcDirname),
        destURL: destURL,
        url: destURL
    };
};
