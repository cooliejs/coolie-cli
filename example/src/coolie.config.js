"use strict";

var fs = require('fs');

module.exports = function (coolie) {
    coolie.config({
        clean: true,
        "js": {
            "main": [
                //"/static/js/app/res.js",
                //"/static/js/app/webuploader.js",
                //"/static/js/app/async.js",
                //"/static/js/app/async-2.js",
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
                //"./html/async.html",
                //"./html/async-2.html",
                "./html/123.html",
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
        "copy": [
            //"static/fonts/tinymce.woff"
        ],
        "dest": {
            "dirname": "../dest/",
            "host": "/",
            "versionLength": 8
        }
    });

    if (process.env.NODE_ENV === 'local') {
        console.log('------------------------------------');
        console.log('[coolie.config.js]', 'local mode');
        coolie.use(require('/Users/cloudcome/development/github/coolie-html-tag-template/index.js')());
        coolie.use(require('/Users/cloudcome/development/github/coolie-html-embed-php/index.js')());
        coolie.use(require('/Users/cloudcome/development/github/coolie-html-attr-resource/index.js')());
    }

    var sourceMap = {};
    // 正则：用于匹配模板字符串
    var REG_TEMP = /{@\w+.*?}.*?{@\/\w+}/;
    var genKey = function () {
        return String(Math.random()).slice(2) + Date.now();
    };

    coolie.use(function (options) {
        switch (options.progress) {
            // 构建 html 之前替换为一串随机数
            case 'pre-html':
                options.code = options.code.replace(REG_TEMP, function (source) {
                    var key = genKey();
                    sourceMap[key] = source;
                    return key;
                });
                break;

            // 构建 html 之后再将随机数替换为原始代码
            case 'post-html':
                for (var key in sourceMap) {
                    var source = sourceMap[key];
                    options.code = options.code.replace(key, source);
                }
                break;
        }

        return options;
    });
};