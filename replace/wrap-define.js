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
 * @param options.id
 * @param options.deps
 * @param options.factory
 * @param options.srcDirname
 * @param options.destHost
 * @param options.inType
 * @param [options.rem]
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

    console.log(file);
    
    var uri = pathURI.toRootURL(file, options.srcDirname);
    var url = pathURI.joinHost(options.inType, options.destHost, uri);

    return '\n' +
        'define("' + id + '", [' + depsStr + '], function (' + args + ') {\n' +
        '// @ref ' + url + '\n\n' +
        factory +
        '\n\n});\n';
};


