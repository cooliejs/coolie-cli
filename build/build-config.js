/*!
 * 构建配置文件
 * @author ydr.me
 * @create 2014-10-22 18:22
 */

"use strict";

var pkg = require('../package.json');
var fs = require("fs-extra");
var path = require("path");
var log = require("../libs/log.js");
var pathURI = require("../libs/path-uri.js");
var typeis = require('ydr-utils').typeis;
var dato = require('ydr-utils').dato;
var nextStep = require("../libs/next-step.js");
var RE_CLEAN = /[\r\n\t\v""]/g;
var RE_SPACE = /\s+/g;


require("colors");

module.exports = function (basedir) {
    var steps = [];
    var writeFile = path.join(basedir, "./coolie-config.js");
    var isExist = typeis.file(writeFile);
    var continueStep = function () {
        log("1/2", "请输入`base`值，默认为“./static/app/”：" +
            "\n`base`路径是相对于 coolie 模块加载器所在的目录；" +
            "\n`base`即为入口模块的基准路径。", "success");
    };
    var json = {};
    var jsonString = '';

    // 0
    steps.push(function () {
        log("tips", "以下操作留空回车表示同意默认配置。", "warning");
        log("file path", pathURI.toSystemPath(writeFile), "task");
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
        json.base = _getVal(data, './static/app/', false);
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
                    log("write", pathURI.toSystemPath(writeFile), "error");
                    return process.exit();
                }

                log("√", pathURI.toSystemPath(writeFile), "success");
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


