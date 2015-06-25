/*!
 * build-modules.js
 * @author ydr.me
 * @create 2014-10-23 22:11
 */


'use strict';

var fs = require('fs-extra');
var howdo = require('howdo');
var path = require('path');
var glob = require('glob');
var log = require('../libs/log.js');
var dato = require('ydr-utils').dato;
var pathURI = require("../libs/path-uri.js");
var encryption = require('ydr-utils').encryption;
var replaceConfig = require('../libs/replace-config.js');
var parseConfig = require('../libs/parse-config.js');
var assignChunk = require('../libs/assign-chunk.js');
var buildMain = require('./build-main.js');
var buildChunk = require('./build-chunk.js');
var buildHTML = require('./build-html.js');
var copy = require('../libs/copy.js');


module.exports = function (srcPath) {
    /**
     * @prototype js
     * @prototype js.main
     * @prototype js["coolie-config.js"]
     * @prototype js.chunk
     * @prototype css
     * @prototype css.src
     * @prototype css.host
     * @prototype html
     * @prototype html.src
     * @prototype html.minify
     * @prototype resource
     * @prototype resource.src
     * @prototype resource.dest
     * @prototype dest
     * @prototype copy
     * @type {object}
     */
    var configs = parseConfig(srcPath);
    var destPath = path.join(srcPath, configs.dest.dirname);
    var jsPath = path.join(srcPath, configs.js.dest);
    var cssPath = path.join(srcPath, configs.css.dest);
    var coolieConfigJSPath = configs._noCoolieJS ? null : path.join(srcPath, configs.js['coolie-config.js']);
    var mainMap = {};

    configs._srcPath = srcPath;
    configs._destPath = destPath;
    configs._jsPath = jsPath;
    configs._cssPath = cssPath;
    configs._coolieConfigJSPath = coolieConfigJSPath;
    configs._coolieConfigJSURI = configs._noCoolieJS ? null : pathURI.toURIPath(path.relative(srcPath, coolieConfigJSPath));
    configs._buildStep = 0;
    configs._resVerMap = {};
    configs._resURIMap = {};
    configs._resBase64Map = {};
    configs._resImageList = [];
    configs._resImageMap = {};
    configs._resDestMap = {};
    configs._copyFilesMap = {};
    configs._copyLength = 0;
    configs._concatMap = {};
    configs._chunkFileMap = {};
    configs._chunkModuleMap = {};
    configs._chunkBufferMap = {};
    configs._chunkMD5Map = {};

    configs.js.chunk.forEach(function (ck, index) {
        var gbPath = path.join(srcPath, ck);
        var files;

        try {
            files = glob.sync(gbPath, {dot: false, nodir: true});
        } catch (err) {
            log('glob', pathURI.toSystemPath(gbPath), 'error');
            log('glob', err.message, 'error');
            process.exit(1);
        }

        files.forEach(function (f) {
            configs._chunkFileMap[f] = String(index);
        });
    });
    global.configs = configs;

    //return console.log(JSON.stringify(configs, null, 2));

    var time = Date.now();
    var mainLength = 0;
    var htmlLength = 0;
    var jsLength = 0;
    var cssLength = 0;
    var versionMap = {};
    var mainRelationshipMap = {};
    var htmlJsCssRelationshipMap = {};

    howdo
        .task(function (next) {
            log('1/5', 'copy files', 'task');
            configs._buildStep = 1;
            next();
        })
        .each(configs.copy, function (i, copyFile, nextCopy) {
            // copy files
            var gbPath = path.join(srcPath, copyFile);

            glob(gbPath, {dot: false, nodir: true}, function (err, files) {
                if (err) {
                    log('glob', pathURI.toSystemPath(gbPath), 'error');
                    log('glob', err.message, 'error');
                    process.exit(1);
                }

                howdo.each(files, function (j, file, nextFile) {
                    var relative = path.relative(srcPath, file);

                    copy(relative);
                    nextFile();
                }).follow(function () {
                    //log('√', pathURI.toSystemPath(gbPath), 'success');
                    nextCopy();
                });
            });
        })

        .task(function (next) {
            log('2/5', 'build main', 'task');
            configs._buildStep = 2;

            if (configs._noCoolieJS) {
                log('×', 'NO coolie.js files');
                return next();
            }

            next();
        })
        .each(configs.js.main, function (i, main, nextMain) {
            // 构建入口模块
            var gbPath = path.join(srcPath, main);

            //log('build js', pathURI.toSystemPath(gbPath));

            glob(gbPath, {dot: false, nodir: true}, function (err, files) {
                if (err) {
                    log('glob', pathURI.toSystemPath(gbPath), 'error');
                    log('glob', err.message, 'error');
                    process.exit(1);
                }

                howdo.each(files, function (j, file, nextFile) {
                    var relative = path.relative(srcPath, file);

                    buildMain(file, function (err, bufferList, md5List, deepDeps, chunkList) {
                        if (err) {
                            return;
                        }

                        mainRelationshipMap[pathURI.toURIPath(relative)] = deepDeps.map(function (dep) {
                            return pathURI.toURIPath(path.relative(srcPath, dep));
                        });

                        //var md5Version = encryption.md5(md5List);
                        //var destFile = path.join(destPath, relative);
                        //
                        //destFile = pathURI.replaceVersion(destFile, md5Version);
                        //versionMap[pathURI.toURIPath(relative)] = md5Version;

                        //if (chunkList.length) {
                        //    code += '\ncoolie.chunk(' + joinArr(chunkList) + ');';
                        //}

                        mainMap[file] = {
                            mainFile: file,
                            md5List: md5List,
                            chunkList: chunkList,
                            bufferList: bufferList
                        };
                        mainLength++;
                        nextFile();

                        //fs.outputFile(destFile, code, function (err) {
                        //    if (err) {
                        //        log('write file', pathURI.toSystemPath(destFile), 'error');
                        //        log('write file', err.message, 'error');
                        //        process.exit(1);
                        //    }
                        //
                        //    mainLength++;
                        //    nextFile();
                        //});
                    });
                }).follow(function () {
                    nextMain();
                });
            });
        })
        // 分配chunk、合并 chunk
        .task(function (next) {
            assignChunk(mainMap, versionMap);
            buildChunk(versionMap);
            next();
        })

        .task(function (next) {
            log('3/5', 'overwrite config', 'task');
            configs._buildStep = 3;
            next();
        })
        .task(function (next) {
            if (!coolieConfigJSPath) {
                return next();
            }

            // 覆盖生成 coolie-config.js
            var code = fs.readFileSync(coolieConfigJSPath, 'utf8');
            var relative = path.relative(srcPath, coolieConfigJSPath);
            var coolieInfo = replaceConfig(code, versionMap);
            var destFile = path.join(destPath, relative);

            destFile = pathURI.replaceVersion(destFile, coolieInfo.version);
            configs._coolieConfigVersion = coolieInfo.version;
            configs._coolieConfig = coolieInfo.config;
            fs.outputFile(destFile, coolieInfo.code, function (err) {
                if (err) {
                    log('overwrite config', pathURI.toSystemPath(destFile), 'error');
                    log('overwrite config', err.message, 'error');
                    process.exit(1);
                }

                log('√', pathURI.toSystemPath(destFile), 'success');
                next();
            });
        })

        .task(function (next) {
            log('4/5', 'build html css', 'task');
            configs._buildStep = 4;
            next();
        })
        .each(configs.html.src, function (i, htmlFile, nextGlob) {
            var gbPath = path.join(srcPath, htmlFile);

            glob(gbPath, {dot: false, nodir: true}, function (err, htmls) {
                if (err) {
                    log('glob', pathURI.toSystemPath(gbPath), 'error');
                    log('glob', err.message, 'error');
                    process.exit(1);
                }

                howdo.each(htmls, function (j, file, nextHTML) {
                    htmlLength++;

                    buildHTML(file, function (err, depCSS, depJS, mainJS) {
                        var htmlRelative = path.relative(srcPath, file);
                        var url = pathURI.toURIPath(htmlRelative);

                        htmlJsCssRelationshipMap[url] = {
                            css: depCSS,
                            js: depJS,
                            main: mainJS
                        };

                        dato.each(depCSS, function (name, dep) {
                            cssLength += dep.length;
                        });

                        dato.each(depJS, function (name, dep) {
                            jsLength += dep.length;
                        });

                        nextHTML(err);
                    });
                }).follow(function () {
                    log('√', pathURI.toSystemPath(gbPath), 'success');

                    nextGlob();
                });
            });
        })

        //.task(function (next) {
        //    log('5/5', 'optimize image files', 'task');
        //    configs._buildStep = 5;
        //    next();
        //})
        //.task(function (next) {
        //    if (!configs._resImageList.length || configs.resource.minify === false) {
        //        log('×', 'optimize image files');
        //        return next();
        //    }
        //
        //    var allActualSize = 0;
        //    var allOriginalSize = 0;
        //
        //    howdo.each(configs._resImageList, function (index, image, done) {
        //        imageminify(image, function (err, actualSize, originalSize) {
        //            allActualSize += actualSize;
        //            allOriginalSize += originalSize;
        //            done();
        //        });
        //    }).together(function () {
        //        log('√', 'orginal size: ' + allOriginalSize + ' B', 'success');
        //        log('√', 'actual size: ' + allActualSize + ' B, saved ' +
        //            (allOriginalSize ? 100 - allActualSize * 100 / allOriginalSize : 0).toFixed(2) + '%', 'success');
        //        next();
        //    });
        //})

        .task(function (next) {
            log('5/5', 'generator relationship map', 'task');
            configs._buildStep = 6;
            next();
        })
        .task(function (next) {
            dato.each(htmlJsCssRelationshipMap, function (key, item) {
                if (mainRelationshipMap[item.main]) {
                    item.deps = mainRelationshipMap[item.main];
                } else if (item.main) {
                    log('miss main', item.main, 'error');
                    item.deps = [];
                }
            });

            var mapFile = path.join(destPath, './relationship-map.json');
            var data = JSON.stringify(htmlJsCssRelationshipMap, null, 4);

            fs.outputFile(mapFile, data, function (err) {
                if (err) {
                    log('write file', pathURI.toSystemPath(mapFile), 'error');
                    log('write file', err.message, 'error');
                    return process.exit(1);
                }

                log('√', pathURI.toSystemPath(mapFile), 'success');
                next();
            });
        })

        // 异步串行结束
        .follow(function (err) {
            if (err) {
                log('build error', err.message, 'error');
                return process.exit(1);
            }

            var past = Date.now() - time;

            console.log('');
            log('build success',
                'copy ' + configs._copyLength + ' file(s), ' +
                '\nbuild ' + mainLength + ' main file(s), ' +
                '\nbuild ' + jsLength + ' js file(s), ' +
                '\nbuild ' + htmlLength + ' html file(s), ' +
                '\nbuild ' + cssLength + ' css file(s), ' +
                    //'\nbuild ' + configs._resImageList.length + ' image file(s), ' +
                '\nbuild ' + Object.keys(configs._resVerMap).length + ' resource file(s), ' +
                '\npast ' + past + ' ms', 'success');
            console.log('');
            console.log('');
            console.log();
        });
};


/**
 * 数组合并并保留字符串
 * @param arr
 * @returns {string}
 */
var joinArr = function (arr) {
    var s = '[';

    arr.forEach(function (item, index) {
        if (index) {
            s += ',';
        }

        s += '"' + item + '"';
    });

    return s + ']';
};
