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

// @link https://www.npmjs.com/package/uglify-js#compress-options
var compressorOptions = {
    // 全局常量
    global_defs: {}
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

    options.uglifyJSOptions = options.uglifyJSOptions || {};

    if (options.uglifyJSOptions.minify === false) {
        return code;
    }

    options.uglifyJSOptions.global_defs = options.uglifyJSOptions.global_defs || {};
    delete(options.uglifyJSOptions.minify);

    try {
        return uglifyJS.minify(code, {
            // 是否警告提示
            warnings: false,
            // 变量管理
            mangle: true,
            // 是否支持 ie8
            ie8: true,
            // 是否压缩
            compress: object.assign(true, {}, compressorOptions, options.uglifyJSOptions)
        });
    } catch (err) {
        debug.error('js code', code);
        debug.error('jsminify', file);
        debug.error('jsminify', err.message);
        process.exit(1);
    }
};



