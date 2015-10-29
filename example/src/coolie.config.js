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
            "chunk": []
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

    //coolie.hook.buildModule(function (file, meta) {
    //});
    //
    //// 挂载：替换 HTML
    //coolie.hook.replaceHTML(function (file, meta) {
    //    console.log('replaceHTML', meta.type);
    //    var code = meta.code;
    //    var REG_INCLUDE = /\{\{include (.*?)}}/g;
    //
    //    // 正则匹配 {{include *}} 标记并替换
    //    code = code.replace(REG_INCLUDE, function (input, inludeName) {
    //        var includeFile = coolie.pathURI.join(coolie.configs.srcDirname, 'html', inludeName);
    //        var includeCode = '';
    //
    //        try {
    //            includeCode = fs.readFileSync(includeFile, 'utf-8');
    //        } catch (err) {
    //            coolie.log.error('read file', includeFile);
    //        }
    //
    //        return includeCode;
    //    });
    //
    //    // 返回处理后的代码
    //    return code;
    //});
    //
    //
    //// 挂载：替换 HTML 内的资源
    //coolie.hook.replaceHTMLResource(function (file, meta) {
    //    console.log('replaceHTMLResource', meta.type);
    //    var code = meta.code;
    //    var tagName = meta.tagName;
    //
    //    if (tagName !== 'img') {
    //        return;
    //    }
    //
    //    // 读取 data-original 属性
    //    var dataOriginal = coolie.htmlAttr.get(code, 'data-original');
    //
    //    // 属性不为空或者属性为 true
    //    if (!dataOriginal || dataOriginal === true) {
    //        return;
    //    }
    //
    //    // 转换为绝对文件地址
    //    var dataOriginalFile = coolie.pathURI.toAbsoluteFile(dataOriginal, file);
    //    // 复制文件
    //    var toFile = coolie.copy(dataOriginalFile, {
    //        version: true,
    //        dest: coolie.configs.destResourceDirname
    //    });
    //    // 替换的 URI
    //    var toURI = coolie.pathURI.toRootURL(toFile, coolie.configs.destDirname);
    //
    //    // 重设 data-original 属性值
    //    return coolie.htmlAttr.set(code, 'data-original', toURI);
    //});
};