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
    var mainLength = 0;

    howdo.each(config.main, function (i, main, nextMain) {
        var gbPath = path.join(buildPath, main);

        log('build files', util.fixPath(gbPath));

        glob(gbPath, function (err, files) {
            if (err) {
                log('glob', util.fixPath(gbPath), 'error');
                log('glob', err.message, 'error');
                process.exit();
            }

            howdo.each(files, function (j, file, nextFile) {
                var relative = path.relative(src, file);

                buildMain(file, function (err, code) {
                    if (err) {
                        return;
                    }

                    var destFile = path.join(dest, relative);

                    fs.outputFile(destFile, code, function (err) {
                        if (err) {
                            log('write main', util.fixPath(destFile), 'error');
                            log('write main', err.message, 'error');
                            process.exit();
                        }

                        log('write main', util.fixPath(destFile), 'success');
                        mainLength++;
                        nextFile();
                    });
                });
            }).follow(function () {
                nextMain();
            });
        });
    }).task(function (next) {
        // 覆盖生成 coolie-config.js
        var code = fs.readFileSync(coolieConfigJS, 'utf8');
        var relative = path.relative(src, coolieConfigJS);
        var destFile = path.join(dest, relative);

        code = replaceConfig(code);
        fs.outputFile(destFile, code, function (err) {
            if (err) {
                log('overwrite version', util.fixPath(destFile), 'error');
                log('overwrite version', err.message, 'error');
                process.exit();
            }

            log('overwrite version', util.fixPath(destFile), 'success');
            next();
        });
    }).follow(function (err) {
        if (err) {
            return;
        }

        var past = Date.now() - time;

        log('build', 'build ' + mainLength + ' main files, past ' + past + ' ms', 'success');
    });
};
