/**
 * define 包装
 * @author ydr.me
 * @create 2016-05-16 16:37
 */


'use strict';

var pathURI = require('../utils/path-uri.js');


/**
 * define 包装
 * @param file
 * @param options
 * @returns {string}
 */
module.exports = function (file, options) {
    var id = options.id;
    var deps = options.deps;
    var factory = options.factory;
    var rem = options.rem !== false;
    var depsStr = deps.join('", "');
    var args = rem ? 'require, exports, module' : '';

    if (depsStr) {
        depsStr = '"' + depsStr + '"';
    }

    return '\n' +
        'define("' + id + '", [' + depsStr + '], function (' + args + ') {\n\n' +
        factory +
        '\n\n//# sourceURL=' + pathURI.toRootURL(file, options.srcDirname) + '\n' +
        '});\n';
};


