"use strict";

var fs = require('fs');

module.exports = function (coolie) {
    coolie.config({
        clean: true,
        "js": {
            "main": [
                "./static/js/app/index.js"
            ],
            "coolie-config.js": "./static/js/coolie-config.js",
            "dest": "./static/js/",
            "chunk": [
                //[
                //    "./static/js/libs1/**" // => 0
                //],
                //"./static/js/libs2/**"    // => 1
            ]
        },
        "html": {
            "src": [
                "./html/replace.html"
            ],
            "minify": true
        },
        "css": {
            "dest": "./static/css/",
            "minify": {
                "compatibility": "ie7"
            }
        },
        "resource": {
            "dest": "./static/res/",
            "minify": true
        },
        "copy": [],
        "dest": {
            "dirname": "../dest/",
            "host": "/",
            "versionLength": 8
        }
    });


    // {{include some.html}} 插值
    //coolie.use(require('./coolie-include-html.js'));



    coolie.use();


    // <img data-original="/img.png"> 引用资源替换
    //coolie.use(function (options) {
    //    var REG_IMG = /<img[\s\S]*?>(?!["'])/gi;
    //
    //    options.code = options.code.replace(REG_IMG, function (htmlTag) {
    //        // 读取 data-original 属性
    //        var dataOriginal = coolie.utils.getHTMLTagAttr(htmlTag, 'data-original');
    //
    //        // 属性不为空或者属性为 true
    //        if (!dataOriginal || dataOriginal === true) {
    //            return htmlTag;
    //        }
    //
    //        // 转换为绝对文件地址
    //        var dataOriginalFile = coolie.utils.getAbsolutePath(dataOriginal, options.file);
    //
    //        if (!dataOriginalFile) {
    //            return htmlTag;
    //        }
    //
    //        // 复制文件
    //        var toURI = coolie.utils.copyResourceFile(dataOriginalFile);
    //
    //        // 重设 data-original 属性值
    //        return coolie.utils.setHTMLTagAttr(htmlTag, 'data-original', toURI);
    //    });
    //
    //    return options;
    //});
};