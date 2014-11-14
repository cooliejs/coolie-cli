/*!
 * build-json
 * @author ydr.me
 * @create 2014-10-23 19:36
 */

"use strict";


var fs = require("fs-extra");
var path = require("path");
var log = require("../libs/log.js");
var util = require("../libs/util.js");
var nextStep = require("../libs/next-step.js");
var RE_CLEAN = /[\r\n\t\v"']/g;
var RE_SPACE = /\s+/g;

require("colors");

module.exports = function (basedir) {
    var steps = [];
    var writeFile = path.join(basedir, "./coolie.json");
    var isExist = util.isFile(writeFile);
    var continueStep = function () {
        log("1/6", "请输入`js`值，默认为空：" +
        "\n`js`路径是相对于`coolie.json`所在的目录；" +
        "\n`js`即为构建的入口 JS 模块，支持通配符，多个文件使用空格分开。", "success");

    };
    var json = {};

    // 0
    steps.push(function () {
        log("coolie", "coolie 苦力 builder", "help");
        log("tips", "以下操作留空回车表示同意默认配置。", "warning");
        log("write file", util.fixPath(writeFile), "error");
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

    // js
    steps.push(function (data) {
        json.js = _getVal(data, '', true);

        log("2/6", "请输入`html`值，默认为空：" +
        "\n`html`路径是相对于`coolie.json`所在的目录；" +
        "\n`html`即为构建的 HTML 文件，支持通配符，多个文件使用空格分开。", "success");
    });

    // html
    steps.push(function (data) {
        json.html = _getVal(data, '', true);

        log("3/6", "请输入`css`值，默认为空：" +
        "\n`css`路径是相对于`coolie.json`所在的目录；" +
        "\n`css`即为构建的 CSS 目录。", "success");
    });

    // css
    steps.push(function (data) {
        json.css = _getVal(data, '', false);

        log("4/6", "请输入`dest`值，默认为“../dest/”：" +
        "\n`dest`路径是相对于`coolie.json`所在的目录；" +
        "\n`dest`即为构建的目标目录。", "success");
    });

    // dest
    steps.push(function (data) {
        json.dest = _getVal(data, '../dest/', false);

        log("5/6", "请输入`coolie-config.js`值，默认为空：" +
        "\n`coolie-config.js`路径是相对于`coolie.json`所在的目录；" +
        "\n`coolie-config.js`即为模块入口的配置文件。", "success");
    });

    // coolie-config.js
    steps.push(function (data) {
        json['coolie-config.js'] = _getVal(data, '', false);

        log("6/6", "请输入`copy`值，默认为“./**/*.*”：" +
        "\n`copy`路径是相对于`coolie.json`所在的目录；" +
        "\n`copy`即为构建时需要原样复制的文件，支持通配符，多个入口使用空格分开。", "success");
    });

    // copy
    steps.push(function (data) {
        json.copy = _getVal(data, './**/*.*', true);

        log("confirm", "文件内容为：", "success");
        console.log(JSON.stringify(json));
        log("confirm", "确认文件内容正确并生成文件？（[y]/n）", "warning");
    });

    // write
    steps.push(function (data) {
        if (data.trim().toLocaleLowerCase().indexOf("n") === -1) {
            fs.outputFile(writeFile, JSON.stringify(json), "utf-8", function (err) {
                if (err) {
                    log("write", util.fixPath(writeFile), "error");
                    return process.exit();
                }

                log("write", util.fixPath(writeFile), "success");
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

