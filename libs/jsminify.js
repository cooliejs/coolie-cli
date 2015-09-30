/*!
 * JS 压缩
 * @author ydr.me
 * @create 2014-10-23 19:47
 */

'use strict';

var uglifyJS = require("uglify-js");
var log = require('./log.js');
var pathURI = require('./path-uri.js');
var dato = require('ydr-utils').dato;
var compressorOptions = {
    // 连续单语句，逗号分开
    // 如： alert(1);alert(2); => alert(1),alert(2)
    sequences: false,
    // 重写属性
    // 如：foo['bar'] => foo.bar
    properties: false,
    // 删除无意义代码
    dead_code: false,
    // 移除`debugger;`
    drop_debugger: true,
    // 使用以下不安全的压缩
    unsafe: false,
    // 不安全压缩
    unsafe_comps: false,
    // 压缩if表达式
    conditionals: true,
    // 压缩条件表达式
    comparisons: true,
    // 压缩常数表达式
    evaluate: true,
    // 压缩布尔值
    booleans: true,
    // 压缩循环
    loops: true,
    // 移除未使用变量
    unused: false,
    // 函数声明提前
    hoist_funs: true,
    // 变量声明提前
    hoist_vars: false,
    // 压缩 if return if continue
    if_return: true,
    // 合并连续变量省略
    join_vars: true,
    // 小范围连续变量压缩
    cascade: true,
    // 显示警告语句
    warnings: false,
    // 全局变量，会在构建之后，删除
    global_defs: {
        DEBUG: false
    }
};


/**
 * 脚本压缩
 * @param file
 * @param code
 * @param [callback]
 */
module.exports = function (file, code, callback) {
    var ret;

    try {
        ret = uglifyJS.minify(code, {
            fromString: true,
            // 是否警告提示
            warnings: false,
            // 变量管理
            mangle: true,
            // 是否压缩
            compress: compressorOptions
        });

        if (callback) {
            callback(null, ret.code);
        } else {
            return ret.code;
        }
    } catch (err) {
        log('jsminify', pathURI.toSystemPath(file), 'error');
        log('jsminify', err.message, 'error');
        process.exit(1);
    }
};
