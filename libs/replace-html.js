/*!
 * html 文件的内容替换
 * @author ydr.me
 * @create 2014-11-14 13:39
 */

'use strict';

var fs = require('fs-extra');
var path = require('ydr-utils').path;
var dato = require('ydr-utils').dato;

var log = require('./log.js');
var htmlAttr = require('./html-attr.js');
var pathURI = require('./path-uri.js');
var htmlminify = require('./htmlminify.js');
var replaceHTMLResource = require('./replace-html-resource.js');
var concat = require('./concat.js');
var copy = require('./copy.js');
var hook = require('./hook.js');

var REG_SCRIPT = /<script[^>]*?>[\s\S]*?<\/script>/gi;
var REG_COOLIE = /<!--\s*?coolie\s*?-->([\s\S]*?)<!--\s*?\/coolie\s*?-->/i;


/**
 * 解析为 URI
 * @param fileUris
 * @returns {*|Array}
 */
var parsePathURIs = function (fileUris) {
    fileUris = fileUris || [];

    return fileUris.map(function (uri) {
        return path.toURI(uri);
    });
};


/**
 * 提取 CSS 依赖并合并依赖
 * @param file {String} HTML 文件路径
 * @param code {String} HTML 文件内容
 * @returns {{depCSS: Object, code: String, mainJS: String}}
 */
module.exports = function (file, code) {
    var configs = global.configs;
    var srcPath = configs.srcDirname;
    var jsBase = configs._jsBase;
    var mainJS = '';
    var depCSS = {};
    var depJS = {};

    // 循环匹配 <!--coolie-->(matched)<!--/coolie-->
    var matchedCoolie;

    while ((matchedCoolie = code.match(REG_COOLIE))) {
        var ret = concat(file, matchedCoolie[1]);

        code = code.replace(REG_COOLIE, ret.replace);

        if (ret.type === 'css') {
            depCSS[ret.url] = parsePathURIs(ret.urls);
        } else {
            depJS[ret.url] = ret.urls;
        }
    }

    //// replace link
    //code = code.replace(REG_LINK, function ($0) {
    //    var rel = htmlAttr.get($0, 'rel');
    //    var type = htmlAttr.get($0, 'type');
    //    var href = htmlAttr.get($0, 'href');
    //    var find = false;
    //
    //    console.log($0);
    //
    //    dato.each(FAVICON_RELS, function (index, _rel) {
    //        if (rel === _rel) {
    //            find = true;
    //            return false;
    //        }
    //    });
    //
    //    if (find) {
    //        return replaceHTMLResource(file, $0, 'href');
    //    }
    //
    //    return $0;
    //});

    // 对 <script> 进行解析并且替换。
    code = code.replace(REG_SCRIPT, function ($0, $1, $2, $3) {
        //var file;
        var src = htmlAttr.get($0, 'src');
        var dataMain = htmlAttr.get($0, 'data-main');
        var dataConfig = htmlAttr.get($0, 'data-config');
        var hasCoolie = htmlAttr.get($0, 'coolie');

        if (hasCoolie && !dataConfig) {
            log('warning', pathURI.toSystemPath(file), 'error');
            log('warning', 'The `data-config` attribute of coolie.js script is EMPTY.', 'error');
        }

        if (hasCoolie && !dataMain) {
            log('warning', pathURI.toSystemPath(file), 'error');
            log('warning', 'The `data-main` attribute of coolie.js script is EMPTY.', 'error');
        }

        if (hasCoolie) {
            var copySrc = copy(src, {
                srcFile: file,
                dest: configs.destJSDirname,
                srcCode: $0,
                version: true,
                logType: 1
            });

            if (copySrc) {
                var uri = pathURI.relative(configs.destDirname, copySrc);

                $0 = htmlAttr.set($0, 'src', pathURI.joinURI(configs.dest.host, uri));
            }
        }

        if (dataMain && dataConfig && hasCoolie) {
            if (jsBase) {
                try {
                    dataMain = path.join(jsBase, dataMain);
                } catch (err) {
                    log('html file', pathURI.toSystemPath(file), 'error');
                    log('data-main', dataMain ? dataMain : 'EMPTY', 'error');
                    process.exit(1);
                }

                dataMain = pathURI.relative(srcPath, dataMain);
                mainJS = pathURI.toURIPath(dataMain);

                //不是本地根目录
                if (configs.dest.host !== '/') {
                    $0 = htmlAttr.set($0, 'data-config', pathURI.joinURI(configs.dest.host, pathURI.replaceVersion(configs._coolieConfigJSURI, configs._coolieConfigVersion)));
                } else {
                    $0 = htmlAttr.set($0, 'data-config', pathURI.replaceVersion(dataConfig, configs._coolieConfigVersion));
                }
            }

            $0 = htmlAttr.remove($0, 'coolie');
        }

        return $0;
    });

    // 挂载
    var hookRet = hook.exec('hookReaplceHTML', file, {
        code: code
    });

    if (ret) {
        code = hookRet;
    }

    // 资源替换
    code = replaceHTMLResource(file, code);

    return {
        depJS: depJS,
        depCSS: depCSS,
        code: htmlminify(file, code),
        mainJS: mainJS
    };
};