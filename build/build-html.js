/*!
 * build-html.js
 * @author ydr.me
 * @create 2014年11月14日14:37:55
 */

'use strict';

var fs = require('fs-extra');
var path = require('path');
var howdo = require('howdo');
var log = require('../libs/log.js');
var ydrUtil = require('ydr-util');
var replaceHtml = require('../libs/replace-html.js');
var cssminify = require('../libs/cssminify.js');


/**
 * 构建一个 HTML 文件
 * @param file {String} 源文件
 * @param cssPath {String} css 路径
 * @param srcPath {String} 构建源路径
 * @param destPath {String} 构建目标路径
 * @param callback {Function} 回调
 */
module.exports = function (file, cssPath, srcPath, destPath, callback) {
    var cssLength = 0;

    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            log("read file", ydrUtil.dato.fixPath(file), "error");
            log('read file', err.message, 'error');
            process.exit();
        }

        var ret = replaceHtml(file, data, cssPath);

        log('build html', ydrUtil.dato.fixPath(file), 'warning');

        howdo
            // 生成 HTML 文件
            .task(function (doneHTML) {
                var relative = path.relative(srcPath, file);
                var destFile = path.join(destPath, relative);

                fs.outputFile(destFile, ret.data, function (err) {
                    if (err) {
                        log("write file", ydrUtil.dato.fixPath(destFile), "error");
                        log('write file', err.message, 'error');
                        process.exit();
                    }

                    log('write html', ydrUtil.dato.fixPath(destFile), 'success');
                    doneHTML();
                });
            })
            // 生成 css 文件
            .task(function (doneCSS) {
                // 读取多个替换
                howdo.each(ret.concat, function (index, matched, nextCSSFile) {
                    var bufferList = [];

                    // 重复的css文件依赖
                    if (matched.isRepeat) {
                        return nextCSSFile();
                    }

                    // 合并多个文件
                    howdo.each(matched.files, function (index, file, doneConcat) {
                        cssLength++;

                        fs.readFile(file, 'utf8', function (err, data) {
                            if (err) {
                                log("read file", ydrUtil.dato.fixPath(file), "error");
                                log('read file', err.message, 'error');
                                process.exit();
                            }

                            data = cssminify(file, data);
                            bufferList.push(new Buffer('\n' + data, 'utf8'));
                            log('require', ydrUtil.dato.fixPath(file));
                            doneConcat();
                        });
                    }).follow(function () {
                        var data = Buffer.concat(bufferList).toString();
                        var relative = path.relative(srcPath, cssPath);
                        var destFile = path.join(destPath, relative, matched.name);

                        data = '/*coolie ' + Date.now() + '*/' + data;

                        fs.outputFile(destFile, data, function (err) {
                            if (err) {
                                log("write file", ydrUtil.dato.fixPath(destFile), "error");
                                log('write file', err.message, 'error');
                                process.exit();
                            }

                            log('write css', ydrUtil.dato.fixPath(destFile), 'success');
                            nextCSSFile();
                        });
                    });
                }).follow(function () {
                    doneCSS();
                });
            })
            // 并行
            .together(function () {
                callback(null, cssLength);
            });

    });
};