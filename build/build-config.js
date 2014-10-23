/*!
 * 构建配置文件
 * @author ydr.me
 * @create 2014-10-22 18:22
 */

"use strict";


var fs = require("fs-extra");
var path = require("path");
var log = require("../libs/log.js");
var template = fs.readFileSync(path.join(__dirname, "../tpls/coolie-config.js.tpl"), "utf-8");
var RE_BASE = /{{base}}/g;
var RE_CLEAN = /[\r\n\t\v""]/g;
var step = 0;

require("colors");

module.exports = function (basedir) {
    log("coolie", "coolie 苦力 builder".cyan);
    log("tips", "以下操作留空回车表示同意默认配置。".yellow);
    log("write path", basedir, "danger");
    log("warning", "如果上述目录不正确，请按`ctrl+C`退出后重新指定。", "warning");

    var writeFile = path.join(basedir, "./coolie-config.js");

    process.stdin.setEncoding("utf8");
    process.stdin.on("readable", function () {
        var chunk = process.stdin.read();

        switch (step) {
            case 0:
                log("1/1", "请输入base目录，默认为“./”：" +
                "\n`base`路径是相对于页面`coolie.js`所在的路径的" +
                "\n`base`即为入口模块的相对路径，更多详情访问`coolie`帮助" +
                "\nhttps://github.com/cloudcome/coolie", "success");
                break;

            case 1:
                template = template.replace(RE_BASE, _clean(chunk) || "./");

                fs.outputFile(writeFile, template, "utf-8", function (err) {
                    if (err) {
                        log("write", writeFile, "error");
                        return process.exit();
                    }

                    log("write", writeFile, "success");
                    process.exit();
                });
                break;
        }

        step++;
    });

    process.stdin.on("end", function () {
        process.stdout.write("end");
    });
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


