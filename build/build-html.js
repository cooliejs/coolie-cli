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
var util = require('../libs/util.js');
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
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            log("read file", util.fixPath(file), "error");
            log('read file', err.message, 'error');
            process.exit();
        }

        var ret = replaceHtml(file, data, cssPath);

        log('build html', util.fixPath(file), 'warning');

        howdo
            // 生成 HTML 文件
            .task(function (doneHTML) {
                var relative = path.relative(srcPath, file);
                var destFile = path.join(destPath, relative);

                fs.outputFile(destFile, ret.data, function (err) {
                    if (err) {
                        log("write file", util.fixPath(destFile), "error");
                        log('write file', err.message, 'error');
                        process.exit();
                    }

                    log('write html', util.fixPath(destFile), 'success');
                    doneHTML();
                });
            })
            // 生成 css 文件
            .task(function (doneCSS) {
                // 读取多个替换
                howdo.each(ret.concat, function (index, concat, nextCSSFile) {
                    var bufferList = [];


                    // 合并多个文件
                    howdo.each(concat.files, function (index, file, doneConcat) {
                        fs.readFile(file, 'utf8', function (err, data) {
                            if (err) {
                                log("read file", util.fixPath(file), "error");
                                log('read file', err.message, 'error');
                                process.exit();
                            }

                            data = cssminify(file, data);
                            bufferList.push(new Buffer(data + '\n', 'utf8'));
                            log('require', util.fixPath(file));
                            doneConcat();
                        });
                    }).together(function () {
                        var data = Buffer.concat(bufferList).toString();
                        var relative = path.relative(srcPath, cssPath);
                        var destFile = path.join(destPath, relative, concat.name);

                        fs.outputFile(destFile, data, function (err) {
                            if (err) {
                                log("write file", util.fixPath(destFile), "error");
                                log('write file', err.message, 'error');
                                process.exit();
                            }

                            log('write css', util.fixPath(destFile), 'success');
                            nextCSSFile();
                        });
                    });
                }).follow(function () {
                    doneCSS();
                });
            })
            // 并行
            .together(callback);

    });
};