/**
 * define 包装
 * @author ydr.me
 * @create 2016-05-16 16:37
 */


'use strict';

var pathURI = require('../utils/path-uri.js');
var parseDefine = require('../parse/define');
var console = require('blear.node.console');


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
 * @param [options.compatible] {Boolean} 是否兼容模式
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

    var uri = pathURI.toRootURL(file, options.srcDirname);
    var url = pathURI.joinHost(options.inType, options.destHost, uri);


    /**
     * 标准处理
     * @returns {string}
     */
    var standardProcess = function () {
        return '' +
            '\n/* @ref ' + url + ' */\ndefine("' + id + '", [' + depsStr + '], function (' + args + ') {' +
            factory +
            '\n\n});\n';
    };


    /**
     * 兼容处理
     * @returns {string}
     */
    var compatibleProcess = function () {
        var before = factory.slice(0, pos[0]);
        var end = factory.slice(pos[1]);

        return before +
            '\n/* @ref ' + url + ' */\ndefine("' + id + '", [' + depsStr + '], function(' + args + ') {\n' +
            end;
    };

    
    if (options.compatible) {
        var pos = parseDefine(file, factory);

        if (pos[1] === 0) {
            return standardProcess();
        } else {
            return compatibleProcess();
        }
    } else {
        return standardProcess();
    }
};


