/**
 * 生成 coolie 地图
 * @author ydr.me
 * @create 2015-10-29 10:49
 */


'use strict';

var fse = require('fs-extra');
var path = require('ydr-utils').path;
var debug = require('blear.node.debug');
var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;

var pathURI = require('../utils/path-uri.js');


/**
 * 生成 coolie 地图
 * @param options {Object} 配置
 * @param options.srcDirname {String} 原始目录
 * @param options.destDirname {String} 目标目录
 * @param options.destMainModulesDirname {String} 目标 coolie-config:base 目录
 * @param options.destChunkModulesDirname {String} 目标 coolie-config:chunk 目录
 * @param options.destAsyncModulesDirname {String} 目标 coolie-config:async 目录
 * @param options.buildAPPResult {Object} app 构建结果
 * @param options.buildHTMLResult {Object} html 构建结果
 */
module.exports = function (options) {
    var coolieMapPath = path.join(options.destDirname, './coolie-map.json');
    var coolieMap = {
        //'html/index.html': {
        //    main: [{
        //        src: 'static/js/app/index.js',
        //        dest: 'static/js/app/{{version}}.js',
        //        deps: [
        //            'static/js/aa.js',
        //            'static/js/bb.js'
        //        ]
        //    }],
        //    async: [{
        //        src: 'static/js/app/index.js',
        //        dest: 'static/js/app/{{version}}.js',
        //        deps: [
        //            'static/js/aa.js',
        //            'static/js/bb.js'
        //        ]
        //    }],
        //    js: [{
        //        dest: 'static/css/{{version}}.js',
        //        deps: [
        //            'static/css/aa.js'
        //        ]
        //    }],
        //    css: [{
        //        dest: 'static/css/{{version}}.css',
        //        deps: [{
        //            src: 'static/css/aa.css',
        //            res: [
        //                'static/img/1.png',
        //                'static/img/2.png'
        //            ]
        //        }]
        //    }],
        //    res: []
        //}
    };
    var parseURI = function (_path, root) {
        var isArray = typeis.array(_path);
        var _path2 = isArray ? _path : [_path];
        var _path3 = [];
        var _map = {};

        _path2.forEach(function (_path4) {
            var uri = pathURI.toRootURL(_path4, root || options.destDirname);
            if (!_map[uri]) {
                _map[uri] = true;
                _path3.push(uri);
            }
        });

        return isArray ? _path3 : _path3[0];
    };

    var htmlMainURIMap = {};

    // 集合 main
    dato.each(options.buildHTMLResult.htmlMainMap, function (mainFile, mainList) {
        var htmlURI = parseURI(mainFile, options.srcDirname);

        coolieMap[htmlURI] = {
            main: [],
            //async: [],
            js: [],
            css: []
        };

        dato.each(mainList, function (index, mainJS) {
            htmlMainURIMap[mainJS] = htmlURI;
            var dependencies = options.buildAPPResult.appMap[mainJS] || [];
            var mainVersion = options.buildAPPResult.mainVersionMap[mainJS];
            var destMainJSPath = path.join(options.destMainModulesDirname, mainVersion + '.js');

            dependencies.shift();
            coolieMap[htmlURI].main.push({
                src: parseURI(mainJS),
                dest: parseURI(destMainJSPath),
                deps: parseURI(dependencies)
            });
        });
    });

    //// 集合 async
    //dato.each(htmlMainURIMap, function (mainJS, mainURI) {
    //    var asyncList = options.buildAPPResult.mainMap[mainJS].requireAsyncList;
    //
    //    dato.each(asyncList, function (index, asyncMain) {
    //        var noVersionAsyncMainPath = path.join(options.destAsyncModulesDirname, asyncMain.gid + '.js');
    //        var asyncMainVersion = options.buildAPPResult.asyncVersionMap[noVersionAsyncMainPath];
    //        var dependencies = options.buildAPPResult.appMap[asyncMain.file] || [];
    //        var destAsyncMainJSPath = path.join(options.destAsyncModulesDirname, asyncMain.gid + '.' + asyncMainVersion + '.js');
    //
    //        dependencies.shift();
    //        coolieMap[mainURI].async.push({
    //            src: parseURI(asyncMain.file),
    //            dest: parseURI(destAsyncMainJSPath),
    //            deps: parseURI(dependencies)
    //        });
    //    });
    //});

    // 集合 js
    dato.each(options.buildHTMLResult.htmlJSMap, function (htmlFile, jsList) {
        var htmlURI = parseURI(htmlFile, options.srcDirname);

        dato.each(jsList, function (index, jsItem) {
            coolieMap[htmlURI].js.push({
                dest: parseURI(jsItem.destPath),
                deps: parseURI(jsItem.dependencies)
            });
        });
    });

    // 集合 css
    dato.each(options.buildHTMLResult.htmlCSSMap, function (htmlFile, cssList) {
        var htmlURI = parseURI(htmlFile, options.srcDirname);

        dato.each(cssList, function (index, cssItem) {
            var coolieHTMLCSSItem = {
                dest: parseURI(cssItem.destPath),
                deps: []
            };

            dato.each(cssItem.dependencies, function (index, depCSSItem) {
                coolieHTMLCSSItem.deps.push({
                    src: parseURI(depCSSItem.srcPath),
                    res: parseURI(depCSSItem.resList)
                });
            });
            coolieMap[htmlURI].css.push(coolieHTMLCSSItem);
        });
    });

    // 集合 res
    dato.each(options.buildHTMLResult.htmlRESMap, function (htmlFile, resList) {
        var htmlURI = parseURI(htmlFile, options.srcDirname);

        coolieMap[htmlURI].res = parseURI(resList);
    });

    try {
        fse.writeJSONSync(coolieMapPath, coolieMap);
        debug.success('coolie map', pathURI.toRootURL(coolieMapPath, options.srcDirname));
        return coolieMapPath;
    } catch (err) {
        debug.error('write coolie map', path.toSystem(coolieMapPath));
        debug.error('write coolie map', err.message);
        return process.exit(1);
    }
};


