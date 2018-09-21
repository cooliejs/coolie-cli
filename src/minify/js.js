/**
 * js 压缩
 * @author ydr.me
 * @create 2015-10-22 16:24
 */


'use strict';

var uglifyJS = require('uglify-js');
var debug = require('blear.node.debug');
var object = require('blear.utils.object');
var console = require('blear.node.console');

var compressorOptions = {
    // 全局常量
    global_defs: {}
};

var defaultUglifyOptions = {
    ie8: true
};


/**
 * 脚本压缩
 * @param file {String} 待压缩的文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param [options.uglifyJSOptions] {Object} 代码压缩配置
 * @returns {{code: string}}
 */
module.exports = function (file, options) {
    var code = options.code;

    if (options.uglifyJSOptions.coolieMinify === false) {
        return code;
    }

    delete(options.uglifyJSOptions.coolieMinify);
    options = object.assign({}, defaultUglifyOptions, options.uglifyJSOptions);

    console.log('minify options', options);

    try {
        return uglifyJS.minify(code, options);
    } catch (err) {
        debug.error('js code', code);
        debug.error('jsminify', file);
        debug.error('jsminify', err.message);
        process.exit(1);
    }
};



