/**
 * html <style> resource
 * @author ydr.me
 * @create 2015-10-22 17:41
 */


'use strict';

var object = require('blear.utils.object');
var debug = require('blear.node.debug');
var console = require('blear.node.console');


var htmlAttr = require('../utils/html-attr.js');
var minifyCSS = require('../minify/css.js');
var progress = require('../utils/progress.js');

var COOLIE_IGNOE = 'coolieignore';
var REG_STYLE_TAG = /(<style\b[\s\S]*?>)([\s\S]*?)<\/style>/ig;
var STYLE_TAG_TYPE = 'text/css';
var defaults = {
    code: '',
    versionLength: 32,
    srcDirname: null,
    destDirname: null,
    destHost: '/',
    destResourceDirname: null,
    replaceCSSResource: true,
    minifyCSS: true,
    minifyResource: true,
    mute: false
};

/**
 * 替换 html style 资源
 * @param file {String} 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.versionLength {Number} 版本长度
 * @param options.srcDirname {String} 构建工程原始根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标文件 URL 域
 * @param options.destResourceDirname {String} 目标资源文件保存目录
 * @param [options.minifyCSS] {Boolean} 是否压缩 css
 * @param [options.cleanCSSOptions] {Object} clean-css 配置
 * @param [options.minifyResource] {Boolean} 压缩资源文件
 * @param [options.replaceCSSResource=true] {Boolean} 是否替换 css 内的资源
 * @param [options.mute=false] {Boolean} 是否静音
 * @param [options.progressKey] {String} 进度日志键
 * @returns {{code: String, resList: Array}}
 */
module.exports = function (file, options) {
    var code = options.code;
    var resList = [];

    options = object.assign({}, defaults, options);

    // <style...>
    code = code.replace(REG_STYLE_TAG, function (source, styleTag, styleCode) {
        var ignore = htmlAttr.get(styleTag, COOLIE_IGNOE);

        if (ignore) {
            styleTag = htmlAttr.remove(styleTag, COOLIE_IGNOE);
            return styleTag + styleCode + '</style>';
        }

        var type = htmlAttr.get(styleTag, 'type');

        // 未配置 type 属性 || type 属性标准
        if (!type || type === STYLE_TAG_TYPE) {
            if (options.minifyCSS) {
                var minifyCSSRet = minifyCSS(file, {
                    code: styleCode,
                    cleanCSSOptions: options.cleanCSSOptions,
                    replaceCSSResource: options.replaceCSSResource,
                    destCSSDirname: null,
                    versionLength: options.versionLength,
                    srcDirname: options.srcDirname,
                    destDirname: options.destDirname,
                    destHost: options.destHost,
                    destResourceDirname: options.destResourceDirname,
                    mute: options.mute,
                    progressKey: options.progressKey
                });

                styleCode = minifyCSSRet.code;
                resList = minifyCSSRet.resList;
            }
        }

        return styleTag + styleCode + '</style>';
    });

    return {
        code: code,
        resList: resList
    };
};



