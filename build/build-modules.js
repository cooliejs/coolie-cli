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
var util = require('../libs/util.js');
var replaceConfig = require('../libs/replace-config.js');
var parseConfig = require('../libs/parse-config.js');
var buildMain = require('./build-main.js');

module.exports = function (buildPath) {
    var config = parseConfig(buildPath);
    var src = buildPath;
    var dest = path.join(buildPath, config.dest);
    var coolieConfigJS = path.join(buildPath, config['coolie-config.js']);
    var time = Date.now();
    var copyLength = 0;
    var mainLength = 0;

    howdo.task(function (next) {
        log('1/3', 'copy files', 'task');
        next();
    })
    //    .each(config.copyFiles, function (i, copyFile, nextCopy) {
    //    // copy files
    //    var gbPath = path.join(buildPath, copyFile);
    //
    //    log('copy files', util.fixPath(gbPath));
    //
    //    glob(gbPath, function (err, files) {
    //        if (err) {
    //            log('glob', util.fixPath(gbPath), 'error');
    //            log('glob', err.message, 'error');
    //            process.exit();
    //        }
    //
    //        howdo.each(files, function (j, file, nextFile) {
    //            var relative = path.relative(src, file);
    //            var destFile = path.join(dest, relative);
    //
    //            fs.copy(file, destFile, function (err) {
    //                if (err) {
    //                    log('copy from', util.fixPath(file), 'error');
    //                    log('copy to', util.fixPath(destFile), 'error');
    //                    log('copy error', err.message, 'error');
    //                    process.exit();
    //                }
    //
    //                log('copy write', util.fixPath(destFile));
    //                copyLength++;
    //                nextFile();
    //            });
    //        }).follow(function () {
    //            nextCopy();
    //        });
    //    });
    //}).task(function (next) {
    //    log('2/3', 'build main', 'task');
    //    next();
    //}).each(config.main, function (i, main, nextMain) {
    //    // 构建入口模块
    //    var gbPath = path.join(buildPath, main);
    //
    //    log('build files', util.fixPath(gbPath));
    //
    //    glob(gbPath, function (err, files) {
    //        if (err) {
    //            log('glob', util.fixPath(gbPath), 'error');
    //            log('glob', err.message, 'error');
    //            process.exit();
    //        }
    //
    //        howdo.each(files, function (j, file, nextFile) {
    //            var relative = path.relative(src, file);
    //
    //            buildMain(file, function (err, code) {
    //                if (err) {
    //                    return;
    //                }
    //
    //                var destFile = path.join(dest, relative);
    //
    //                fs.outputFile(destFile, code, function (err) {
    //                    if (err) {
    //                        log('write main', util.fixPath(destFile), 'error');
    //                        log('write main', err.message, 'error');
    //                        process.exit();
    //                    }
    //
    //                    log('write main', util.fixPath(destFile), 'success');
    //                    mainLength++;
    //                    nextFile();
    //                });
    //            });
    //        }).follow(function () {
    //            nextMain();
    //        });
    //    });
    //}).task(function (next) {
    //    log('3/3', 'overwrite config', 'task');
    //    next();
    //})
        .task(function (next) {
        // 覆盖生成 coolie-config.js
        var code = fs.readFileSync(coolieConfigJS, 'utf8');
        var relative = path.relative(src, coolieConfigJS);
        var destFile = path.join(dest, relative);

        code = replaceConfig(coolieConfigJS, code);
        fs.outputFile(destFile, code, function (err) {
            if (err) {
                log('overwrite config', util.fixPath(destFile), 'error');
                log('overwrite config', err.message, 'error');
                process.exit();
            }

            log('overwrite config', util.fixPath(destFile), 'success');
            next();
        });
    }).follow(function (err) {
        if (err) {
            return;
        }

        var past = Date.now() - time;

        log('build success', 'copy ' + copyLength + ' file(s),' +
        ' build ' + mainLength + ' file(s),' +
        ' past ' + past + ' ms', 'success');
    });
};
