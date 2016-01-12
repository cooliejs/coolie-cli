/**
 * 路径构建
 * @author ydr.me
 * @create 2016-01-12 16:19
 */

'use strict';

var dato = require('ydr-utils').dato;
var path = require('ydr-utils').path;

var pathURI = require('./path-uri.js');
var copy = require('./copy.js');

var defaults = {
    versionLength: 32,
    srcDirname: null,
    destResourceDirname: null,
    file: null
};


/**
 * 路径构建
 * @param value
 * @param options
 * @returns {*}
 */
module.exports = function (value, options) {
    options = dato.extend({}, defaults, options);

    var pathRet = pathURI.parseURI2Path(value);

    // 非相对路径
    if (!pathURI.isRelatived(pathRet.path)) {
        return false;
    }

    var absFile = pathURI.toAbsoluteFile(pathRet.path, options.file, options.srcDirname);
    console.log('---------------------------------');
    console.log(options);
    console.log(absFile);
    console.log('---------------------------------');

    var resFile = copy(absFile, {
        version: true,
        copyPath: false,
        versionLength: options.versionLength,
        srcDirname: options.srcDirname,
        destDirname: options.destResourceDirname,
        logType: 1,
        embedFile: options.file
    });
    var resRelative = path.relative(options.destDirname, resFile);
    var url = pathURI.joinURI(options.destHost, resRelative);

    return {
        srcFile: absFile,
        destFile: resFile,
        url: url + pathRet.suffix
    };
};
