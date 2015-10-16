/*!
 * build-modules.js
 * @author ydr.me
 * @create 2014-10-23 22:11
 */


'use strict';

var fse = require('fs-extra');
var howdo = require('howdo');
var path = require('ydr-utils').path;
var glob = require('glob');
var log = require('../libs/log.js');
var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
var pathURI = require("../libs/path-uri.js");
var guessDirname = require("../libs/guess-dirname.js");
var replaceConfig = require('../libs/replace-config.js');
var parseConfig = require('../libs/parse-config.js');
var parseAsync = require('../libs/parse-async.js');
var assignChunk = require('../libs/assign-chunk.js');
var buildMain = require('./build-main.js');
var buildChunk = require('./build-chunk.js');
var buildHTML = require('./build-html.js');
var copy = require('../libs/copy.js');
var globalId = require('../libs/global-id.js');


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
     * @prototype dest.dirname
     * @prototype dest.host
     * @prototype dest.versionLength
     * @prototype copy
     * @type {object}
     */
    var configs = parseConfig(srcPath);
    var destPath = path.join(srcPath, configs.dest.dirname);
    var jsPath = path.join(srcPath, configs.js.dest);
    var cssPath = path.join(srcPath, configs.css.dest);
    var coolieConfigJSPath = configs._noCoolieJS ? null : path.join(srcPath, configs.js['coolie-config.js']);

    // public
    configs.srcDirname = srcPath;
    configs.destDirname = destPath;
    configs.srcJSDirname = jsPath;
    configs.srcCSSDirname = cssPath;
    configs.srcAsyncDirname = guessDirname(jsPath, 'async');
    configs.srcChunkDirname = guessDirname(jsPath, 'chunk');
    configs.srcCoolieConfigJSPath = coolieConfigJSPath;
    configs.destJSDirname = path.join(destPath, configs.js.dest);
    configs.destCSSDirname = path.join(destPath, configs.css.dest);
    configs.destResourceDirname = path.join(destPath, configs.resource.dest);

    // private
    configs._mainFiles = {};
    configs._bufferMap = {};
    configs._fileIdMap = {};
    configs._asyncMap = {};
    configs._coolieConfigJSURI = configs._noCoolieJS ? null : pathURI.toURIPath(pathURI.relative(srcPath, coolieConfigJSPath));
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
    configs._moduleIdMap = {};
    configs._privateModuleMap = {};
    configs._chunkModuleMap = {};
    configs._chunkBufferMap = {};
    configs._chunkMD5Map = {};
    configs._chunkList = {};
    configs._mainMap = {};

    global.coolie.configs = configs;

    configs.js.chunk.forEach(function (chunk, index) {
        var chunkList = chunk;

        if (!typeis.array(chunk)) {
            chunkList = [chunk];
        }

        chunkList.forEach(function (chunk) {
            var gbPath = path.join(srcPath, chunk);
            var files;

            try {
                files = glob.sync(gbPath, {dot: false, nodir: true});
            } catch (err) {
                log('glob', pathURI.toSystemPath(gbPath), 'error');
                log('glob', err.message, 'error');
                process.exit(1);
            }

            files.forEach(function (f) {
                configs._chunkFileMap[pathURI.toSystemPath(f)] = String(index);
            });
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
    var asyncRelationshipMap = {};
    var chunkRelationshipList = [];
    var htmlJsCssRelationshipMap = {};
    var htmlMainRelationshipMap = {};

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
                    copy(file);
                    nextFile();
                }).follow(function () {
                    //log('√', pathURI.toRootURL(gbPath, configs.srcDirname), 'success');
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
        // 分析出入口文件
        .task(function (next) {
            howdo
                .each(configs.js.main, function (index, main, done) {
                    // 构建入口模块
                    var gbPath = path.join(srcPath, main);

                    glob(gbPath, {dot: false, nodir: true}, function (err, files) {
                        if (err) {
                            log('glob', pathURI.toSystemPath(gbPath), 'error');
                            log('glob', err.message, 'error');
                            process.exit(1);
                        }

                        files.forEach(function (file) {
                            configs._mainFiles[file] = {
                                async: false,
                                gid: '0'
                            };
                            configs._moduleIdMap[file] = '0';
                        });
                        done();
                    });
                })
                .together(next);
        })
        // 分析出 async 模块
        .task(function (next) {
            howdo.each(configs._mainFiles, function (file, boo, next) {
                var code = '';

                try {
                    code = fse.readFileSync(file, 'utf8');
                } catch (err) {
                    log('parse async', pathURI.toSystemPath(file), 'error');
                    log('read file', pathURI.toSystemPath(file), 'error');
                    log('read file', err.message, 'error');
                    process.exit(1);
                }

                configs._bufferMap[file] = new Buffer(code, 'utf8');
                configs._mainFiles[file].asyncList = configs._mainFiles[file].asyncList || [];
                parseAsync(file, code).forEach(function (info) {
                    configs._mainFiles[file].asyncList.push(info);
                    configs._mainFiles[info.id] = configs._mainFiles[info.id] || {async: true};
                    configs._mainFiles[info.id].gid = configs._mainFiles[info.id].gid || globalId.get();
                    configs._moduleIdMap[info.id] = '0';
                    configs._asyncMap[info.id] = configs._mainFiles[info.id].gid;
                });
                next();
            }).follow(next);
        })
        // 构建 main
        .task(function (next) {
            dato.each(configs._mainFiles, function (mainFile, info) {
                dato.each(info.asyncList || [], function (index, asyncInfo) {
                    asyncInfo.gid = configs._mainFiles[asyncInfo.id].gid;
                });
            });

            howdo.each(configs._mainFiles, function (mainFile, mainInfo, next) {
                var srcName = pathURI.relative(srcPath, mainFile);

                buildMain(mainFile, function (err, info) {
                    if (err) {
                        return;
                    }

                    var bufferList = info.bufferList;
                    var md5List = info.md5List;
                    var deepDeps = info.deepDeps;
                    var depFiles = info.depFiles;
                    var chunkList = info.chunkList;

                    if (configs._asyncMap[mainFile]) {
                        asyncRelationshipMap[mainFile] = deepDeps.map(function (dep) {
                            return pathURI.toURIPath(pathURI.relative(srcPath, dep));
                        });
                    } else {
                        mainRelationshipMap[pathURI.toURIPath(srcName)] = deepDeps.map(function (dep) {
                            return pathURI.toURIPath(pathURI.relative(srcPath, dep));
                        });
                    }

                    configs._mainMap[mainFile] = {
                        mainFile: mainFile,
                        depFiles: depFiles,
                        srcName: srcName,
                        md5List: md5List,
                        chunkList: chunkList,
                        bufferList: bufferList
                    };
                    mainLength++;
                    next();
                });
            }).follow(next);
        })
        // chunk 管理
        .task(function (next) {
            if (!configs.js.chunk || !configs.js.chunk.length) {
                log('×', 'unchunk modules', 'warning');
            }

            howdo
                // 分配 chunk
                .task(function (next) {
                    assignChunk(versionMap, next);
                })
                // 合并 chunk
                .task(function (next) {
                    buildChunk(versionMap, next);
                })
                .follow(next);
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
            var code = fse.readFileSync(coolieConfigJSPath, 'utf8');
            var relative = pathURI.relative(srcPath, coolieConfigJSPath);
            var coolieInfo = replaceConfig(code, versionMap);
            var destFile = path.join(destPath, relative);

            destFile = pathURI.replaceVersion(destFile, coolieInfo.version);
            configs._coolieConfigVersion = coolieInfo.version;
            configs._coolieConfig = coolieInfo.config;
            fse.outputFile(destFile, coolieInfo.code, function (err) {
                if (err) {
                    log('overwrite config', pathURI.toSystemPath(destFile), 'error');
                    log('overwrite config', err.message, 'error');
                    process.exit(1);
                }

                log('√', pathURI.toRootURL(destFile, configs.srcDirname), 'success');
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
                        var htmlRelative = pathURI.relative(srcPath, file);
                        var url = pathURI.toURIPath(htmlRelative);
                        var mainFile = path.join(configs.srcDirname, mainJS);
                        var async = {};

                        if (configs._mainFiles[mainFile] && !configs._mainFiles[mainFile].async) {
                            configs._mainFiles[mainFile].asyncList.forEach(function (asyncInfo) {
                                var file = asyncInfo.id;
                                var relative = path.relative(configs.srcDirname, file);
                                var name = path.toURI(relative);

                                async[name] = asyncRelationshipMap[file];
                            });
                        }

                        htmlJsCssRelationshipMap[url] = {
                            css: depCSS,
                            js: depJS,
                            main: mainJS,
                            async: async
                        };
                        htmlMainRelationshipMap[mainJS] = true;

                        dato.each(depCSS, function (name, dep) {
                            cssLength += Object.keys(dep).length;
                        });

                        dato.each(depJS, function (name, dep) {
                            jsLength += dep.length;
                        });

                        nextHTML(err);
                    });
                }).follow(function () {
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
                var mainJS = item.main;
                var temp = {};

                if (mainRelationshipMap[mainJS]) {
                    temp[mainJS] = mainRelationshipMap[item.main];
                    item.main = temp;
                    //item.deps = mainRelationshipMap[item.main];
                } else if (item.main) {
                    log('×', 'miss main file: ' + mainJS, 'warning');
                    temp[mainJS] = [];
                    item.main = temp;
                }
            });

            dato.each(mainRelationshipMap, function (key) {
                if (!htmlMainRelationshipMap[key]) {
                    log('×', 'unuse main file: ' + key, 'warning');
                }
            });

            var mapFile = path.join(destPath, './relationship-map.json');
            var data = JSON.stringify(htmlJsCssRelationshipMap, null, 4);

            fse.outputFile(mapFile, data, function (err) {
                if (err) {
                    log('write file', pathURI.toSystemPath(mapFile), 'error');
                    log('write file', err.message, 'error');
                    return process.exit(1);
                }

                log('√', pathURI.toRootURL(mapFile, configs.srcDirname), 'success');
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
                'copy ' + configs._copyLength + ' files, ' +
                '\nbuild ' + mainLength + ' main module, ' +
                '\nbuild ' + jsLength + ' js files, ' +
                '\nbuild ' + htmlLength + ' html files, ' +
                '\nbuild ' + cssLength + ' css files, ' +
                    //'\nbuild ' + configs._resImageList.length + ' image file(s), ' +
                    //'\nbuild ' + Object.keys(configs._resVerMap).length + ' resource file(s), ' +
                '\npast ' + past + ' ms', 'success');
            console.log('');
            console.log('');
            console.log();
        });
};