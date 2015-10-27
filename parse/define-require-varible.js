/**
 * 获取 define require 变量
 * @author ydr.me
 * @create 2015-10-27 21:04
 */


'use strict';

var REG_DEFINE = /^\bdefine\b\s*?\b\(\s*?function\b[^(]*\(([^,)]*)/;


/**
 * 获取 define require 变量
 * @param file {String} 文件路径
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @returns {string}
 */
module.exports = function (file, options) {
    //if(requireVar){
    //    debug.error('parse define require', path.toSystem(file));
    //    debug.error('parse define require', 'require varible is empty, but used');
    //    return process.exit(1);
    //}

    return (options.code.match(REG_DEFINE) || ['', ''])[1].trim();
};


