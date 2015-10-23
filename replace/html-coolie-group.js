/**
 * html coolie group
 * 合并代码、压缩代码
 * @author ydr.me
 * @create 2015-10-23 09:16
 */


'use strict';


var reader = require('../utils/reader.js');

// <!--coolie-->
var REG_COOLIE_GROUP = /<!--\s*?coolie\s*?-->([\s\S]*?)<!--\s*?\/coolie\s*?-->/gi;


/**
 * 合并 coolie 组，合并、压缩、版本控制代码
 * @param file {String} 所在的 html 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.minifyJS {Boolean} 是否压缩 JS
 * @param options.minifyCSS {Boolean} 是否压缩 CSS
 * @param [options.cleanCSSOptions] {Object} clean-css 配置
 * @param options.versionLength {Number} 版本长度
 * @param options.srcDirname {String} 构建工程原始根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标文件 URL 域
 * @param options.destResourceDirname {String} 目标资源文件保存目录
 * @param [options.destCSSFile] {String} 目标样式文件，如果存在，则相对
 * @param [options.minifyResource] {Boolean} 压缩资源文件
 * @returns {*}
 */
module.exports = function (file, options) {
    var code = options.code;

    code.replace(REG_COOLIE_GROUP, function (source, coolieCode) {

    });

    return code;
};


