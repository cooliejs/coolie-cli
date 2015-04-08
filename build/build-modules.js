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
var dato = require('ydr-util').dato;
var crypto = require('ydr-util').crypto;
var replaceConfig = require('../libs/replace-config.js');
var parseConfig = require('../libs/parse-config.js');
var buildMain = require('./build-main.js');
var buildHTML = require('./build-html.js');
var REG_END = /(\.[^.]*)$/;

module.exports = function (srcPath) {
    /**
     * @prototype js
     * @prototype js.src
     * @prototype js["coolie.js"]
     * @prototype js["coolie-config.js"]
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
    var config = parseConfig(srcPath);
    //console.log(JSON.stringify(config, null, 2));
    var destPath = path.join(srcPath, config.dest);
    var cssPath = path.join(srcPath, config.css.dest);
    var coolieJSPath = path.join(srcPath, config.js['coolie.js']);
    var coolieConfigJSPath = path.join(srcPath, config.js['coolie-config.js']);
    var time = Date.now();
    var copyLength = 0;
    var mainLength = 0;
    var htmlLength = 0;
    var resLength = 0;
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
            var gbPath = path.join(srcPath, copyFile);

            glob(gbPath, {dot: false, nodir: true}, function (err, files) {
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

                        //log('√', dato.fixPath(destFile), 'success');
                        copyLength++;
                        nextFile();
                    });
                }).follow(function () {
                    log('√', dato.fixPath(gbPath), 'success');
                    nextCopy();
                });
            });
        })

        .task(function (next) {
            log('2/5', 'build main', 'task');
            next();
        })
        .each(config.js.src, function (i, main, nextMain) {
            // 构建入口模块
            var gbPath = path.join(srcPath, main);

            //log('build js', dato.fixPath(gbPath));

            glob(gbPath, {dot: false, nodir: true}, function (err, files) {
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

                        MainRelationshipMap[dato.toURLPath(relative)] = deepDeps.map(function (dep) {
                            return dato.toURLPath(path.relative(srcPath, dep));
                        });

                        var md5Version = crypto.md5(md5List).slice(0, 16);
                        var destFile = path.join(destPath, relative);

                        destFile = destFile.replace(REG_END, '.' + md5Version + '$1');
                        versionMap[dato.toURLPath(relative)] = md5Version;

                        fs.outputFile(destFile, code, function (err) {
                            if (err) {
                                log('write file', dato.fixPath(destFile), 'error');
                                log('write file', err.message, 'error');
                                process.exit();
                            }

                            //log('√', dato.fixPath(destFile), 'success');
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

            jsBase = path.join(srcPath, path.dirname(config.js['coolie.js']), coolieInfo.config.base);
            fs.outputFile(destFile, coolieInfo.code, function (err) {
                if (err) {
                    log('overwrite config', dato.fixPath(destFile), 'error');
                    log('overwrite config', err.message, 'error');
                    process.exit();
                }

                log('√', dato.fixPath(destFile), 'success');
                next();
            });
        })

        .task(function (next) {
            log('4/5', 'build html css', 'task');
            next();
        })
        .each(config.html.src, function (i, htmlFile, nextGlob) {
            // html files
            var gbPath = path.join(srcPath, htmlFile);

            glob(gbPath, {dot: false, nodir: true}, function (err, htmls) {
                if (err) {
                    log('glob', dato.fixPath(gbPath), 'error');
                    log('glob', err.message, 'error');
                    process.exit();
                }

                howdo.each(htmls, function (j, file, nextHTML) {
                    htmlLength++;

                    buildHTML(file, cssPath, config, jsBase, srcPath, destPath, function (err, _cssLength, _resLength, depCSS, mainJS) {
                        var htmlRelative = path.relative(srcPath, file);
                        var url = dato.toURLPath(htmlRelative);

                        htmlJsCssRelationshipMap[url] = {
                            css: depCSS,
                            main: mainJS
                        };
                        cssLength += _cssLength;
                        resLength = _resLength;
                        nextHTML(err);
                    });
                }).follow(function () {
                    log('√', dato.fixPath(gbPath), 'success');

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
                    log('write file', dato.fixPath(mapFile), 'error');
                    log('write file', err.message, 'error');
                    return process.exit();
                }

                log('√', dato.fixPath(mapFile), 'success');
                next();
            });
        })

        // 异步串行结束
        .follow(function (err) {
            if (err) {
                log('build error', err.message, 'error');
                return process.exit();
            }

            var past = Date.now() - time;

            console.log('');
            log('build success',
                'copy ' + copyLength + ' file(s), ' +
                '\nbuild ' + mainLength + ' js file(s), ' +
                '\nbuild ' + htmlLength + ' html file(s), ' +
                '\nbuild ' + cssLength + ' css file(s), ' +
                '\nbuild ' + resLength + ' resource file(s), ' +
                '\npast ' + past + ' ms', 'success');
        });
};
