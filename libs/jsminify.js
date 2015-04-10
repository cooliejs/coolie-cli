/*!
 * JS 压缩
 * @author ydr.me
 * @create 2014-10-23 19:47
 */

'use strict';

var uglifyJS = require("uglify-js");
var log = require('./log.js');
var dato = require('ydr-utils').dato;
//var compressorOptions = {
//    // 连续单语句，逗号分开
//    // 如： alert(1);alert(2); => alert(1),alert(2)
//    sequences: false,
//    // 重写属性
//    // 如：foo['bar'] => foo.bar
//    properties: false,
//    // 删除无意义代码
//    dead_code: false,
//    // 移除`debugger;`
//    drop_debugger: true,
//    // 使用以下不安全的压缩
//    unsafe: false,
//    //
//    unsafe_comps: false,
//    // 压缩if表达式
//    conditionals: false,
//    // 压缩条件表达式
//    comparisons: false,
//    // 压缩常数表达式
//    evaluate: false,
//    // 压缩布尔值
//    booleans: false,
//    // 压缩循环
//    loops: false,
//    // 移除未使用变量
//    unused: false,
//    // 函数声明提前
//    hoist_funs: false,
//    // 变量声明提前
//    hoist_vars: false,
//    // 压缩 if return if continue
//    if_return: false,
//    // 合并连续变量省略
//    join_vars: true,
//    // 小范围连续变量压缩
//    cascade: false,
//    // 不显示警告语句
//    warnings: false,
//    side_effects: false,
//    pure_getters: false,
//    pure_funcs: false,
//    negate_iife: false,
//    // 全局变量
//    global_defs: {}
//};


/**
 * 脚本压缩
 * @param file
 * @param code
 * @param [callback]
 */
module.exports = function (file, code, callback) {
    var ret;

    //try {
    //    ast = uglifyJS.parse(code);
    //    ast.figure_out_scope();
    //    compressor = uglifyJS.Compressor(compressorOptions);
    //    ast = ast.transform(compressor);
    //    ast.figure_out_scope();
    //    ast.compute_char_frequency();
    //    ast.mangle_names();
    //    code = ast.print_to_string();
    //    callback(null, code);
    //} catch (err) {
    //    log('jsminify', dato.fixPath(file), 'error');
    //    log('jsminify', err.message, 'error');
    //    process.exit();
    //}

    // - warnings (default false) — pass true to display compressor warnings.
    // - fromString (default false) — if you pass true then you can pass JavaScript source code, rather than file names.
    // - mangle — pass false to skip mangling names.
    // - output (default null) — pass an object if you wish to specify additional [output options][codegen]. The defaults are optimized for best compression.
    // - compress (default {}) — pass false to skip compressing entirely. Pass an object to specify custom [compressor options][compressor].
    try {
        ret = uglifyJS.minify(code, {
            fromString: true,
            warnings: false,
            mangle: true,
            compress: true
        });

        if (callback) {
            callback(null, ret.code);
        } else {
            return ret.code;
        }
    } catch (err) {
        log('jsminify', dato.fixPath(file), 'error');
        log('jsminify', err.message, 'error');
        process.exit();
    }

    //yuicompressor.compress(code, {
    //    charset: 'utf8',
    //    type: 'js',
    //    nomunge: true,
    //    'line-break': -1,
    //    'preserve-semi': true
    //}, function (err, code, extra) {
    //    if (err) {
    //        log('jsminify', dato.fixPath(file), 'error');
    //        log('jsminify', err.message, 'error');
    //        log('jsminify', extra, 'error');
    //        process.exit();
    //    }
    //
    //    callback(null, code);
    //});
};
