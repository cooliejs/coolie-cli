/**
 * js 压缩
 * @author ydr.me
 * @create 2015-10-22 16:24
 */


'use strict';


var uglifyJS = require('uglify-js');
var debug = require('ydr-utils').debug;
var dato = require('ydr-utils').dato;
var path = require('ydr-utils').path;

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

    // 使用不安全的压缩
    unsafe: false,

    // 不安全压缩
    unsafe_comps: false,

    // 压缩if表达式
    // if(abc) { dosth. } => abc&&dosth.
    conditionals: true,

    // 压缩比较表达式，unsafe === true
    // !(a <= b) => a > b
    // a = !b && !c && !d && !e => a=!(b||c||d||e)
    comparisons: false,

    // 压缩常数表达式，移除无用的常量判断
    // if(DEBUG){return 1}else{return 2} => return 2
    // if(!1 == false){..} => EMPTY
    evaluate: true,

    // 压缩布尔值
    booleans: true,

    // 压缩循环
    loops: true,

    // 移除未使用变量
    // function(){ var a = 1; return 1;} => function(){return 1;}
    unused: true,

    // 函数声明提前
    hoist_funs: true,

    // 变量声明提前
    hoist_vars: true,

    // 压缩 if return if continue
    if_return: true,

    // 合并连续变量省略
    join_vars: true,

    // 小范围连续变量压缩
    cascade: true,

    // 显示警告语句
    warnings: false,

    // 全局常量
    global_defs: {
        DEBUG: false
    }
};


/**
 * 脚本压缩
 * @param file {String} 待压缩的文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param [options.uglifyJSOptions] {Object} 代码压缩配置
 */
module.exports = function (file, options) {
    var code = options.code;

    try {
        return uglifyJS.minify(code, {
            fromString: true,
            // 是否警告提示
            warnings: false,
            // 变量管理
            mangle: true,
            // 是否压缩
            compress: dato.extend({}, compressorOptions, options.uglifyJSOptions)
        }).code;
    } catch (err) {
        debug.error('js code', code);
        debug.error('jsminify', path.toSystem(file));
        debug.error('jsminify', err.message);
        process.exit(1);
    }
};



