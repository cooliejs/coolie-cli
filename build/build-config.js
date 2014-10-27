/*!
 * 构建配置文件
 * @author ydr.me
 * @create 2014-10-22 18:22
 */

"use strict";


var fs = require("fs-extra");
var path = require("path");
var log = require("../libs/log");
var util = require("../libs/util");
var nextStep = require("../libs/next-step");
var template = fs.readFileSync(path.join(__dirname, "../tpls/coolie-config.js.tpl"), "utf-8");
var RE_BASE = /{{base}}/g;
var RE_CLEAN = /[\r\n\t\v""]/g;

require("colors");

module.exports = function (basedir) {
    var steps = [];
    var writeFile = path.join(basedir, "./coolie-config.js");
    var isExist = util.isFile(writeFile);
    var continueStep = function () {
        log("1/" + (steps.length - 2), "请输入`base`值，默认为“./”：" +
        "\n`base`路径是相对于页面`coolie.js`所在的路径的；" +
        "\n`base`即为入口模块的相对路径，更多详情访问`coolie`帮助：" +
        "\nhttps://github.com/cloudcome/coolie", "success");
    };

    // 0
    steps.push(function () {
        log("coolie", "coolie 苦力 builder", "help");
        log("tips", "以下操作留空回车表示同意默认配置。", "warning");
        log("write file", util.fixPath(writeFile), "error");
        log("warning", "如果上述目录不正确，请按`ctrl+C`退出后重新指定。", "warning");

        if(isExist){
            log("warning", "该文件已存在，是否覆盖？（y/[n]）", "warning");
        }else{
            continueStep();
        }
    });

    if(isExist){
        steps.push(function (data) {
            if(data.toLowerCase().indexOf("y") === -1){
                process.exit();
            }else{
                continueStep();
            }
        });
    }

    // base
    steps.push(function (data) {
        template = template.replace(RE_BASE, _clean(data) || "./");
        log("2/"+ (steps.length - 2), "文件内容为：", "success");
        console.log(template);
        log("confirm", "确认文件内容正确并生成文件？（[y]/n）", "warning");
    });

    // write file
    steps.push(function (data) {
        if(data.trim().toLocaleLowerCase().indexOf("n") === -1){
            fs.outputFile(writeFile, template, "utf-8", function (err) {
                if (err) {
                    log("write", util.fixPath(writeFile), "error");
                    return process.exit();
                }

                log("write", util.fixPath(writeFile), "success");
                process.exit();
            });
        }else{
            process.exit();
        }
    });

    nextStep(steps);
};


/**
 * 清理用户输入
 * @param chunk
 * @returns {string}
 * @private
 */
function _clean(chunk) {
    return chunk.replace(RE_CLEAN, "").trim();
}


