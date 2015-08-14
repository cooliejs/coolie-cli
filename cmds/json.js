/*!
 * cmd json
 * @author ydr.me
 * @create 2015-08-12 09:21
 */


'use strict';


var pkg = require('../package.json');
var fs = require('fs-extra');
var path = require('path');
var log = require('../libs/log.js');
var pathURI = require('../libs/path-uri.js');
var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
var number = require('ydr-utils').number;
var nextStep = require('../libs/next-step.js');
var RE_CLEAN = /[\r\n\t\v'']/g;
var RE_SPACE = /\s+/g;

require('colors');

module.exports = function (basedir) {
    var steps = [];
    var writeFile = path.join(basedir, './coolie.json');
    var isExist = typeis.file(writeFile);
    var json = {};
    var jsonString = '';
    var continueStep = function () {
        json.js = {};
        log('1/7', '请输入 JS 入口模块的路径。' +
            '\n支持通配符，多个路径使用空格分开，默认为“./static/js/app/**/*.js”。', 'success');
    };

    // 0
    steps.push(function () {
        log('tips', '以下操作留空回车表示同意默认配置。', 'warning');
        log('file path', pathURI.toSystemPath(writeFile), 'task');
        log('warning', '如果上述目录不正确，请按`ctrl+C`退出后重新指定。', 'warning');

        if (isExist) {
            log('warning', '该文件已存在，是否覆盖？（y/[n]）', 'warning');
        } else {
            continueStep();
        }
    });

    if (isExist) {
        steps.push(function (data) {
            if (data.toLowerCase().indexOf('y') === -1) {
                process.exit(1);
            } else {
                continueStep();
            }
        });
    }

    // js.main
    steps.push(function (data) {
        json.js = {};
        json.js.main = _getVal(data, './static/js/app/**/*.js', true);

        log('2/7', '请输入 coolie.js 配置文件所在的路径，默认为“./static/js/coolie-config.js”。', 'success');
    });

    // js[coolie-config.js]
    steps.push(function (data) {
        json.js['coolie-config.js'] = _getVal(data, './static/js/coolie-config.js', false);

        log('3/7', '请输入合并压缩后的非模块化 JS 文件的保存目录。默认为“./static/js/”。' +
            '\n不建议与 JS 入口模块的目录一样', 'success');
    });

    // js.dest
    steps.push(function (data) {
        json.js.dest = _getVal(data, './static/js/', false);
        json.js.chunk = [];

        log('4/7', '请输入合并压缩后的 CSS 文件的保存目录。默认为“./static/css/”。', 'success');
    });

    // css.dest
    steps.push(function (data) {
        json.css = {};
        json.css.dest = _getVal(data, './static/css/', false);
        json.css.minify = {
            compatibility: 'ie7'
        };

        log('5/7', '请输入 HTML 文件所在的路径。' +
            '\n支持通配符，多个路径使用空格分开。默认为“./views/**/*.html”。', 'success');
    });

    // html.src
    steps.push(function (data) {
        json.html = {};
        json.html.src = _getVal(data, './views/**/*.html', true);
        json.html.minify = true;

        log('6/7', '请输入构建之后的静态资源（如：图片、字体）的目录，默认为“./static/res/”。', 'success');
    });

    // resource.dest
    steps.push(function (data) {
        json.resource = {};
        json.resource.dest = _getVal(data, './static/res/', false);
        json.resource.minify = true;
        json.copy = [];

        log('7/7', '请输入构建的目标目录，默认为“../dest/”。', 'success');
    });

    // dest.dirname
    steps.push(function (data) {
        json.dest = {};
        json.dest.dirname = _getVal(data, '../dest/', false);
        json.dest.host = '';
        json.dest.md5Length = 32;
        jsonString = JSON.stringify(json, null, 2);

        log('confirm', '文件内容为：', 'success');
        log('coolie.json', jsonString, 'success');
        log('confirm', '确认文件内容正确并生成文件？（[y]/n）', 'warning');
    });

    // write
    steps.push(function (data) {
        if (data.trim().toLocaleLowerCase().indexOf('n') === -1) {
            fs.outputFile(writeFile, jsonString, 'utf-8', function (err) {
                if (err) {
                    log('write', pathURI.toSystemPath(writeFile), 'error');
                    return process.exit(1);
                }

                log('√', pathURI.toSystemPath(writeFile), 'success');
                process.exit(1);
            });
        } else {
            process.exit(1);
        }
    });

    nextStep(steps);
};


/**
 * 获取输入内容
 * @param data
 * @param dft
 * @param isArray
 * @returns {Array|string|*}
 * @private
 */
function _getVal(data, dft, isArray) {
    var input = data.replace(RE_CLEAN, '').trim() || dft;

    return isArray ? input.split(RE_SPACE) : input;
}


