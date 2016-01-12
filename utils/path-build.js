/**
 * 路径构建
 * @author ydr.me
 * @create 2016-01-12 16:19
 */

'use strict';



var pathURI = require('./path-uri.js');
var copy = require('./copy.js');

var defaults = {
    versionLength: 32,
    srcDirname: null,
    destResourceDirname: null,
    file: null
};

module.exports = function (value, options) {
    var pathRet = pathURI.parseURI2Path(value);

    // 不存在路径 || URL
    if (!value || pathURI.isURL(pathRet.path)) {
        return false;
    }

    var absFile = pathURI.toAbsoluteFile(pathRet.path, file, options.srcDirname);
    var resFile = copy(absFile, {
        version: true,
        copyPath: false,
        versionLength: options.versionLength,
        srcDirname: options.srcDirname,
        destDirname: options.destResourceDirname,
        logType: 1,
        embedFile: file
    });
    var resRelative = path.relative(options.destDirname, resFile);
    var url = pathURI.joinURI(options.destHost, resRelative);

    if (!resMap[absFile]) {
        resList.push(absFile);
    }

    node.attrs[attr] = url + pathRet.suffix;
};
