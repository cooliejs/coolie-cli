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
var replaceConfig = require('../libs/replace-config.js');
var parseConfig = require('../libs/parse-config.js');
var buildMain = require('./build-main.js');
var buildHTML = require('./build-html.js');
var REG_END = /(\.[^.]*)$/;

module.exports = function (buildPath) {
    var config = parseConfig(buildPath);
    var srcPath = buildPath;
    var destPath = path.join(buildPath, config.dest);
    var coolieConfigJS = path.join(buildPath, config['coolie-config.js']);
    var time = Date.now();
    var copyLength = 0;
    var mainLength = 0;
    var htmlLength = 0;
    var cssLength = 0;
    var versionMap = {};

    howdo
        // 这里采用增量覆盖，而不是全部清空
        //.task(function (next) {
        //    log('1/5', 'clean dest', 'task');
        //    next();
        //})
        //.task(function (next) {
        //    fs.remove(destPath, function (err) {
        //        if (err) {
        //            log('remove', ydrUtil.dato.fixPath(destPath), 'error');
        //            log('remove', err.message, 'error');
        //            process.exit();
        //        }
        //
        //        log('remove', ydrUtil.dato.fixPath(destPath), 'success');
        //        next();
        //    });
        //})

        //.task(function (next) {
        //    log('1/4', 'copy files', 'task');
        //    next();
        //})
        //.each(config.copy, function (i, copyFile, nextCopy) {
        //    // copy files
        //    var gbPath = path.join(buildPath, copyFile);
        //
        //    log('copy files', ydrUtil.dato.fixPath(gbPath));
        //
        //    glob(gbPath, function (err, files) {
        //        if (err) {
        //            log('glob', ydrUtil.dato.fixPath(gbPath), 'error');
        //            log('glob', err.message, 'error');
        //            process.exit();
        //        }
        //
        //        howdo.each(files, function (j, file, nextFile) {
        //            var relative = path.relative(srcPath, file);
        //            var destFile = path.join(destPath, relative);
        //
        //            fs.copy(file, destFile, function (err) {
        //                if (err) {
        //                    log('copy from', ydrUtil.dato.fixPath(file), 'error');
        //                    log('copy to', ydrUtil.dato.fixPath(destFile), 'error');
        //                    log('copy error', err.message, 'error');
        //                    process.exit();
        //                }
        //
        //                log('copy write', ydrUtil.dato.fixPath(destFile), 'success');
        //                copyLength++;
        //                nextFile();
        //            });
        //        }).follow(function () {
        //            nextCopy();
        //        });
        //    });
        //})

        .task(function (next) {
            log('2/4', 'build main', 'task');
            next();
        })
        .each(config.js, function (i, main, nextMain) {
            // 构建入口模块
            var gbPath = path.join(buildPath, main);

            log('build js', ydrUtil.dato.fixPath(gbPath));

            glob(gbPath, function (err, files) {
                if (err) {
                    log('glob', ydrUtil.dato.fixPath(gbPath), 'error');
                    log('glob', err.message, 'error');
                    process.exit();
                }

                howdo.each(files, function (j, file, nextFile) {
                    var relative = path.relative(srcPath, file);

                    buildMain(file, function (err, code, md5List) {
                        if (err) {
                            return;
                        }

                        var md5Version = ydrUtil.crypto.md5(md5List).slice(0, 8);
                        var destFile = path.join(destPath, relative);

                        destFile = destFile.replace(REG_END, '.' + md5Version + '$1');
                        versionMap[ydrUtil.dato.toURLPath(relative)] = md5Version;

                        fs.outputFile(destFile, code, function (err) {
                            if (err) {
                                log('write file', ydrUtil.dato.fixPath(destFile), 'error');
                                log('write file', err.message, 'error');
                                process.exit();
                            }

                            log('write js', ydrUtil.dato.fixPath(destFile), 'success');
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
            log('3/4', 'overwrite config', 'task');
            next();
        })
        .task(function (next) {
            // 覆盖生成 coolie-config.js
            var code = fs.readFileSync(coolieConfigJS, 'utf8');
            var relative = path.relative(srcPath, coolieConfigJS);
            var destFile = path.join(destPath, relative);

            code = replaceConfig(coolieConfigJS, code, versionMap);
            fs.outputFile(destFile, code, function (err) {
                if (err) {
                    log('overwrite config', ydrUtil.dato.fixPath(destFile), 'error');
                    log('overwrite config', err.message, 'error');
                    process.exit();
                }

                log('overwrite config', ydrUtil.dato.fixPath(destFile), 'success');
                next();
            });
        })

        //.task(function (next) {
        //    log('4/4', 'build html css', 'task');
        //    next();
        //})
        //.each(config.html, function (i, htmlFile, nextHTML) {
        //    // html files
        //    var gbPath = path.join(buildPath, htmlFile);
        //    var cssPath = path.join(buildPath, config.css);
        //
        //    log('html files', ydrUtil.dato.fixPath(gbPath));
        //
        //    glob(gbPath, function (err, files) {
        //        if (err) {
        //            log('glob', ydrUtil.dato.fixPath(gbPath), 'error');
        //            log('glob', err.message, 'error');
        //            process.exit();
        //        }
        //        howdo.each(files, function (j, file, nextFile) {
        //            htmlLength++;
        //            buildHTML(file, cssPath, srcPath, destPath, function (err, _cssLength) {
        //                cssLength += _cssLength;
        //                nextFile(err);
        //            });
        //        }).follow(function () {
        //            nextHTML();
        //        });
        //    });
        //})

        // 结束了
        .follow(function (err) {
            if (err) {
                return;
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
