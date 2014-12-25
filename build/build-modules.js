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
var ydrUtil = require('ydr-util');
var dato = require('ydr-util').dato;
var replaceConfig = require('../libs/replace-config.js');
var parseConfig = require('../libs/parse-config.js');
var buildMain = require('./build-main.js');
var buildHTML = require('./build-html.js');
var REG_END = /(\.[^.]*)$/;

module.exports = function (buildPath) {
    var config = parseConfig(buildPath);
    var srcPath = buildPath;
    var destPath = path.join(buildPath, config.dest);
    var cssPath = path.join(buildPath, config.css.path);
    var coolieJSPath = path.join(buildPath, config['coolie.js']);
    var coolieConfigJSPath = path.join(buildPath, config['coolie-config.js']);
    var time = Date.now();
    var copyLength = 0;
    var mainLength = 0;
    var htmlLength = 0;
    var cssLength = 0;
    var versionMap = {};
    var MainRelationshipMap = {};
    var htmlJsCssRelationshipMap = {};
    var jsBase;

    howdo
        .task(function (next) {
            log('1/5', 'copy files', 'task');
            next();
        })
        .each(config.copy, function (i, copyFile, nextCopy) {
            // copy files
            var gbPath = path.join(buildPath, copyFile);

            log('copy files', dato.fixPath(gbPath));

            glob(gbPath, function (err, files) {
                if (err) {
                    log('glob', dato.fixPath(gbPath), 'error');
                    log('glob', err.message, 'error');
                    process.exit();
                }

                howdo.each(files, function (j, file, nextFile) {
                    var relative = path.relative(srcPath, file);
                    var destFile = path.join(destPath, relative);

                    fs.copy(file, destFile, function (err) {
                        if (err) {
                            log('copy from', dato.fixPath(file), 'error');
                            log('copy to', dato.fixPath(destFile), 'error');
                            log('copy error', err.message, 'error');
                            process.exit();
                        }

                        log('copy write', dato.fixPath(destFile), 'success');
                        copyLength++;
                        nextFile();
                    });
                }).follow(function () {
                    nextCopy();
                });
            });
        })

        .task(function (next) {
            log('2/5', 'build main', 'task');
            next();
        })
        .each(config.js.main, function (i, main, nextMain) {
            // 构建入口模块
            var gbPath = path.join(buildPath, main);

            log('build js', dato.fixPath(gbPath));

            glob(gbPath, function (err, files) {
                if (err) {
                    log('glob', dato.fixPath(gbPath), 'error');
                    log('glob', err.message, 'error');
                    process.exit();
                }

                howdo.each(files, function (j, file, nextFile) {
                    var relative = path.relative(srcPath, file);

                    buildMain(file, function (err, code, md5List, deepDeps) {
                        if (err) {
                            return;
                        }

                        var depNames = deepDeps.map(function (dep) {
                            return dato.toURLPath(path.relative(srcPath, dep));
                        });

                        MainRelationshipMap[dato.toURLPath(relative)] = depNames;

                        var md5Version = ydrUtil.crypto.md5(md5List).slice(0, 8);
                        var destFile = path.join(destPath, relative);

                        destFile = destFile.replace(REG_END, '.' + md5Version + '$1');
                        versionMap[dato.toURLPath(relative)] = md5Version;

                        fs.outputFile(destFile, code, function (err) {
                            if (err) {
                                log('write file', dato.fixPath(destFile), 'error');
                                log('write file', err.message, 'error');
                                process.exit();
                            }

                            log('write js', dato.fixPath(destFile), 'success');
                            mainLength++;
                            nextFile();
                        });
                    });
                }).follow(function () {
                    nextMain();
                });
            });
        })

        .task(function (next) {
            log('3/5', 'overwrite config', 'task');
            next();
        })
        .task(function (next) {
            // 覆盖生成 coolie-config.js
            var code = fs.readFileSync(coolieConfigJSPath, 'utf8');
            var relative = path.relative(srcPath, coolieConfigJSPath);
            var destFile = path.join(destPath, relative);
            var coolieInfo = replaceConfig(srcPath, coolieJSPath, coolieConfigJSPath, code, versionMap);

            jsBase = path.join(srcPath, path.dirname(config['coolie.js']), coolieInfo.config.base);
            fs.outputFile(destFile, coolieInfo.code, function (err) {
                if (err) {
                    log('overwrite config', dato.fixPath(destFile), 'error');
                    log('overwrite config', err.message, 'error');
                    process.exit();
                }

                log('overwrite config', dato.fixPath(destFile), 'success');
                next();
            });
        })

        .task(function (next) {
            log('4/5', 'build html css', 'task');
            next();
        })
        .each(config.html, function (i, htmlFile, nextGlob) {
            // html files
            var gbPath = path.join(buildPath, htmlFile);


            log('html files', dato.fixPath(gbPath));

            glob(gbPath, function (err, htmls) {
                if (err) {
                    log('glob', dato.fixPath(gbPath), 'error');
                    log('glob', err.message, 'error');
                    process.exit();
                }

                howdo.each(htmls, function (j, file, nextHTML) {
                    htmlLength++;

                    buildHTML(file, cssPath, config.css.host, jsBase, config.js.host, srcPath, destPath, function (err, _cssLength, depCSS, depJS, mainJS) {
                        var htmlRelative = path.relative(srcPath, file);
                        var url = dato.toURLPath(htmlRelative);

                        htmlJsCssRelationshipMap[url] = {
                            css: depCSS,
                            js: depJS,
                            main: mainJS
                        };
                        cssLength += _cssLength;
                        nextHTML(err);
                    });
                }).follow(function () {
                    nextGlob();
                });
            });
        })

        .task(function (next) {
            log('5/5', 'generator relationship map', 'task');
            next();
        })
        .task(function (next) {
            dato.each(htmlJsCssRelationshipMap, function (key, item) {
                if (MainRelationshipMap[item.main]) {
                    item.deps = MainRelationshipMap[item.main];
                } else if (item.main) {
                    log('miss main', item.main, 'error');
                    item.deps = [];
                }
            });

            var mapFile = path.join(destPath, './relationship-map.json');
            var data = JSON.stringify(htmlJsCssRelationshipMap, null, 4);

            fs.outputFile(mapFile, data, function (err) {
                if (err) {
                    log('write relationship map', dato.fixPath(mapFile), 'error');
                    log('write relationship map', err.message, 'error');
                    return process.exit();
                }

                log('write relationship map', dato.fixPath(mapFile), 'success');
                next();
            });
        })

        // 异步串行结束
        .follow(function (err) {
            if (err) {
                log('unknow error', err.message, 'error');
                return process.exit();
            }

            var past = Date.now() - time;

            log('build success',
                'copy ' + copyLength + ' file(s), ' +
                'build ' + mainLength + ' js file(s), ' +
                'build ' + htmlLength + ' html file(s), ' +
                'build ' + cssLength + ' css file(s), ' +
                'past ' + past + ' ms', 'success');
        });
};
