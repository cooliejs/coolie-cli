"use strict";

var fs = require('fs');

module.exports = function (coolie) {
    coolie.config({
        clean: true,
        "js": {
            "main": [
                "./static/js/app/**"
            ],
            "coolie-config.js": "./static/js/coolie-config.js",
            "dest": "./static/js/",
            "chunk": [
                [
                    "./static/js/libs1/**"
                ],
                "./static/js/libs2/**"
            ]
        },
        "html": {
            "src": [
                "./html/**"
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
            "host": "",
            "versionLength": 32
        }
    });


    // {{include some.html}} 插值
    coolie.use(function (options, next) {
        var REG_INCLUDE = /\{\{include (.*?)}}/g;

        // 正则匹配 {{include *}} 标记并替换
        options.code = options.code.replace(REG_INCLUDE, function (input, inludeName) {
            var includeFile = coolie.utils.getAbsolutePath(inludeName, options.file);
            var includeCode = '';

            try {
                includeCode = fs.readFileSync(includeFile, 'utf-8');
            } catch (err) {
                coolie.debug.error('embed file', options.file);
                coolie.debug.error('read file', includeFile);
                coolie.debug.error('read file', err.message);
                return process.exit(1);
            }

            return includeCode;
        });

        // 交给下一个中间件
        next();
    });


    // <img data-original="/img.png"> 引用资源替换
    coolie.use(function (options, next) {
        var REG_IMG = /<img[\s\S]*?>/gi;

        options.code = options.code.replace(REG_IMG, function (htmlTag) {
            // 读取 data-original 属性
            var dataOriginal = coolie.utils.getHTMLTagAttr(htmlTag, 'data-original');

            // 属性不为空或者属性为 true
            if (!dataOriginal || dataOriginal === true) {
                return;
            }

            // 转换为绝对文件地址
            var dataOriginalFile = coolie.utils.getAbsolutePath(dataOriginal, options.file);

            // 复制文件
            var toURI = coolie.utils.copyResourceFile(dataOriginalFile);

            // 重设 data-original 属性值
            return coolie.utils.setHTMLTagAttr(htmlTag, 'data-original', toURI);
        });

        // 交给下一个中间件
        next();
    });
};