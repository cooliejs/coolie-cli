/*!
 * 构建配置文件
 * @author ydr.me
 * @create 2014-10-22 18:22
 */

"use strict";


var fs = require("fs-extra");
var path = require("path");
var log = require("../libs/log.js");
var ydrUtil = require("ydr-util");
var nextStep = require("../libs/next-step.js");
var RE_CLEAN = /[\r\n\t\v""]/g;
var RE_SPACE = /\s+/g;


require("colors");

module.exports = function (basedir) {
    var steps = [];
    var writeFile = path.join(basedir, "./coolie-config.js");
    var isExist = ydrUtil.typeis.file(writeFile);
    var continueStep = function () {
        log("1/2", "请输入`base`值，默认为“./”：" +
        "\n`base`路径是相对于页面`coolie.js`所在的目录；" +
        "\n`base`即为入口模块的相对路径。", "success");
    };
    var json = {};
    var jsonString = '';

    // 0
    steps.push(function () {
        log("coolie", "coolie 苦力 builder", "help");
        log("tips", "以下操作留空回车表示同意默认配置。", "warning");
        log("write file", ydrUtil.dato.fixPath(writeFile), "error");
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

    // base
    steps.push(function (data) {
        json.base = _getVal(data, './', false);
        log("2/2", "文件内容为：", "success");
        jsonString = _config(json);
        log('coolie-config.js', jsonString, 'success');
        log("confirm", "确认文件内容正确并生成文件？（[y]/n）", "warning");
    });

    // write file
    steps.push(function (data) {
        if (data.trim().toLocaleLowerCase().indexOf("n") === -1) {
            fs.outputFile(writeFile, jsonString, "utf-8", function (err) {
                if (err) {
                    log("write", ydrUtil.dato.fixPath(writeFile), "error");
                    return process.exit();
                }

                log("write", ydrUtil.dato.fixPath(writeFile), "success");
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


/**
 * 生成配置代码
 * @param json
 * @private
 */
function _config(json) {
    var code = JSON.stringify(json, null, 4);

    return 'coolie.config(' + code + ').use();';
}


