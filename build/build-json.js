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
        log("1/" + (steps.length - 2), "请输入`main`值，默认为空：" +
        "\n`main`路径是相对于`coolie.json`所在的路径的；" +
        "\n`main`即为构建的入口模块，支持通配符，多个入口使用空格分开，更多详情访问`coolie`帮助：" +
        "\nhttps://github.com/cloudcome/coolie", "success");

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

    // main
    steps.push(function (data) {
        json.main = _getVal(data, '', true);

        log("2/" + (steps.length - 2), "请输入`dest`值，默认为“../dest/”：" +
        "\n`dest`路径是相对于`coolie.json`所在的路径的；" +
        "\n`dest`即为构建的目标目录，更多详情访问`coolie`帮助：" +
        "\nhttps://github.com/cloudcome/coolie", "success");
    });

    // dest
    steps.push(function (data) {
        json.dest = _getVal(data, '../dest/', false);

        log("3/" + (steps.length - 2), "请输入`coolie-config.js`值，默认为空：" +
        "\n`coolie-config.js`路径是相对于`coolie.json`所在的路径的；" +
        "\n`coolie-config.js`即为模块入口的配置文件，更多详情访问`coolie`帮助：" +
        "\nhttps://github.com/cloudcome/coolie", "success");
    });

    // coolie-config.js
    steps.push(function (data) {
        json['coolie-config.js'] = _getVal(data, '', false);

        log("4/" + (steps.length - 2), "请输入`copyFiles`值，默认为“./**/*.*”：" +
        "\n`copyFiles`路径是相对于`coolie.json`所在的路径的；" +
        "\n`copyFiles`即为构建时需要原样复制的文件，支持通配符，多个入口使用空格分开，更多详情访问`coolie`帮助：" +
        "\nhttps://github.com/cloudcome/coolie", "success");
    });

    // copyFiles
    steps.push(function (data) {
        json.copyFiles = _getVal(data, './**/*.*', true);

        log("5/" + (steps.length - 2), "文件内容为：", "success");
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

