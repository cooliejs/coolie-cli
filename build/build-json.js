/*!
 * build-json
 * @author ydr.me
 * @create 2014-10-23 19:36
 */

"use strict";


var fs = require("fs-extra");
var path = require("path");
var log = require("../libs/log.js");
var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
var nextStep = require("../libs/next-step.js");
var RE_CLEAN = /[\r\n\t\v"']/g;
var RE_SPACE = /\s+/g;

require("colors");

module.exports = function (basedir) {
    var steps = [];
    var writeFile = path.join(basedir, "./coolie.json");
    var isExist = typeis.file(writeFile);
    var json = {};
    var jsonString = '';
    var continueStep = function () {
        json.js = {};
        log("1/10", "请输入 JS 入口模块的路径。" +
        "\n支持通配符，多个路径使用空格分开，默认为“./static/js/app/**/*.js”。", "success");
    };

    // 0
    steps.push(function () {
        log("coolie", "coolie 苦力 builder", "help");
        log("tips", "以下操作留空回车表示同意默认配置。", "warning");
        log("file path", dato.fixPath(writeFile), "task");
        log("warning", "如果上述目录不正确，请按`ctrl+C`退出后重新指定。", "warning");

        if (isExist) {
            log("warning", "该文件已存在，是否覆盖？（y/[n]）", "warning");
        } else {
            continueStep();
        }
    });

    if (isExist) {
        steps.push(function (data) {
            if (data.toLowerCase().indexOf("y") === -1) {
                process.exit();
            } else {
                continueStep();
            }
        });
    }

    // js.src
    steps.push(function (data) {
        json.js = {};
        json.js.src = _getVal(data, './static/js/app/**/*.js', true);


        log("2/10", "请输入 coolie 模块加载器所在的路径，默认为“./static/js/coolie.min.js”：" +
        "\n`coolie.js`是模块加载器的主文件。", "success");
    });

    // js[coolie.js]
    steps.push(function (data) {
        json.js['coolie.js'] = _getVal(data, './static/js/coolie.min.js', false);

        log("3/10", "请输入 coolie 模块加载器配置文件所在的路径，默认为“./static/js/coolie-config.js”。", "success");
    });

    // js[coolie-config.js]
    steps.push(function (data) {
        json.js['coolie-config.js'] = _getVal(data, './static/js/coolie-config.js', false);

        log("4/10", "请输入生成 CSS 文件的存放目录。默认为“./static/css/”", "success");
    });

    // css.dest
    steps.push(function (data) {
        json.css = {};
        json.css.dest = _getVal(data, './static/css/', false);

        log("5/10", "请输入发布后 CSS 文件所在的域，如“http://s.ydr.me/a/b”。默认为空。", "success");
    });

    // css host
    steps.push(function (data) {
        json.css.host = _getVal(data, '', false);

        log("6/10", "请输入 HTML 文件所在的路径。" +
        "\n支持通配符，多个路径使用空格分开。默认为“./views/**/*.html”。", "success");
    });

    // html.src
    steps.push(function (data) {
        json.html = {};
        json.html.src = _getVal(data, './views/**/*.html', true);

        log("7/10", "是否压缩 HTML 文件，默认为“1”（true）。", "success");
    });

    // html.minify
    steps.push(function (data) {
        json.html.minify = !!dato.parseInt(_getVal(data, 1, false), 1);

        log("8/10", "请输入资源保存目录，默认为“./static/res/”。", "success");
    });


    // resource.dest
    steps.push(function (data) {
        json.resource = {};
        json.resource.dest = _getVal(data, './static/res/', false);

        log("9/10", "请输入构建的目标目录，默认为“../dest/”。", "success");
    });

    // dest
    steps.push(function (data) {
        json.dest = _getVal(data, '../dest/', false);

        log("10/10", "请输入构建时需要原样复制的文件路径，默认为空。" +
        "\n支持通配符，多个文件路径使用空格分开。", "success");
    });

    // copy
    steps.push(function (data) {
        json.copy = _getVal(data, '', true);
        jsonString = JSON.stringify(json, null, 2);

        log("confirm", "文件内容为：", "success");
        log('coolie.json', jsonString, 'success');
        log("confirm", "确认文件内容正确并生成文件？（[y]/n）", "warning");
    });

    // write
    steps.push(function (data) {
        if (data.trim().toLocaleLowerCase().indexOf("n") === -1) {
            fs.outputFile(writeFile, jsonString, "utf-8", function (err) {
                if (err) {
                    log("write", dato.fixPath(writeFile), "error");
                    return process.exit();
                }

                log("√", dato.fixPath(writeFile), "success");
                process.exit();
            });
        } else {
            process.exit();
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
    var input = data.replace(RE_CLEAN, "").trim() || dft;

    return isArray ? input.split(RE_SPACE) : input;
}

