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
var REG_LINK = /<link\b[^>]*?\bhref\b\s*?=\s*?['"](.*?)['"][^>]*?>/gi;
var REG_SCRIPT = /<script[^>]*?>[\s\S]*?<\/script>/gi;
var REG_COOLIE = /<!--\s*?coolie\s*?-->([\s\S]*?)<!--\s*?\/coolie\s*?-->/i;
var FAVICON_RELS = [
    'apple-touch-icon',
    'apple-touch-icon-precomposed',
    'apple-touch-startup-image',
    'icon',
    'shortcut icon',
    'og:image',
    'msapplication-TileImage'
];


/**
 * 提取 CSS 依赖并合并依赖
 * @param file {String} HTML 文件路径
 * @param code {String} HTML 文件内容
 * @returns {{depCSS: Object, code: String, mainJS: String}}
 */
module.exports = function (file, code) {
    var configs = global.configs;
    var srcPath = configs._srcPath;
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
            depCSS[ret.url] = ret.urls;
        } else {
            depJS[ret.url] = ret.urls;
        }
    }

    // <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
    // <link rel="apple-touch-icon" href="/apple-touch-icon-72.png" />
    code = code.replace(REG_LINK, function ($0) {
        var rel = htmlAttr.get($0, 'rel');
        var type = htmlAttr.get($0, 'type');
        var href = htmlAttr.get($0, 'href');
        var find = false;

        dato.each(FAVICON_RELS, function (index, _rel) {
            if (rel === _rel) {
                find = true;
                return false;
            }
        });

        if (find) {
            return replaceHTMLResource(file, $0, 'href');
        }

        return $0;
    });

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
                dest: configs._jsDestPath,
                srcCode: $0,
                version: true,
                logType: 1
            });

            if (copySrc) {
                var uri = pathURI.relative(configs._destPath, copySrc);

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

    // 资源替换
    code = replaceHTMLResource(file, code);

    return {
        depJS: depJS,
        depCSS: depCSS,
        code: htmlminify(file, code),
        mainJS: mainJS
    };
};