/*!
 * create-config.js
 * @author ydr.me
 * @create 2014-10-23 22:13
 */


"use strict";

var path = require("path");
var fs = require("fs-extra");
var log = require("./log.js");
var ydrUtil = require("ydr-util");


/**
 * 解析 config
 * @param relative 起始目录
 * @param config 配置文件的路径或配置对象
 * @returns {Object}
 */
module.exports = function (relative) {
    var file = path.join(relative, "./coolie.json");
    var config = {};
    var check = {};

    // 检查文件
    check.file = function () {
        if (ydrUtil.typeis(file) === "string") {
            try {
                config = fs.readFileSync(file);

                try {
                    config = JSON.parse(config);
                } catch (err) {
                    log("parse config", "coolie.json JSON parse error", "error");
                    console.log(err);
                    process.exit();
                }
            } catch (err) {
                log("read config", err.message, "error");
                process.exit();
            }
        }
    };


    // 检查 js 路径
    check.js = function () {
        if (config.js) {
            var jsType = ydrUtil.typeis(config.js);

            if (jsType !== "string" && jsType !== "array") {
                log("parse config", "`js` property must be a string path or an array object", "error");
                process.exit();
            }

            if (jsType === "array") {
                config.js.forEach(function (mn, index) {
                    if (ydrUtil.typeis(mn) !== "string") {
                        log("parse config", "`js` property[" + index + "] must be a string", "error");
                        process.exit();
                    }
                });
            } else {
                config.js = [config.js];
            }
        } else {
            config.js = [];
        }
    };


    // 检查 css 路径与URL前缀
    check.css = function () {
        if (config.css && ydrUtil.typeis(config.css) !== "object") {
            log("parse config", "`css` property must be a object", "error");
            process.exit();
        }

        var cssPath = path.join(relative, config.css.path);

        if (!ydrUtil.typeis.directory(cssPath)) {
            log("parse config", "`" + cssPath + "` is NOT a directory", "error");
            process.exit();
        }
    };


    // 检查 html 路径
    check.html = function () {
        if (config.html) {
            var htmlType = ydrUtil.typeis(config.html);

            if (htmlType !== "string" && htmlType !== "array") {
                log("parse config", "`html` property must be a string path or an array object", "error");
                process.exit();
            }

            if (htmlType === "array") {
                config.html.forEach(function (mn, index) {
                    if (ydrUtil.typeis(mn) !== "string") {
                        log("parse config", "`html` property[" + index + "] must be a string", "error");
                        process.exit();
                    }
                });
            } else {
                config.html = [config.html];
            }
        } else {
            config.html = [];
        }
    };


    // 检查 dest 路径
    check.dest = function () {
        if (!config.dest) {
            log("parse config", "coolie.json require `dest` property", "error");
            process.exit();
        }

        if (ydrUtil.typeis(config.dest) !== "string") {
            log("parse config", "`dest` property must be a string path", "error");
            process.exit();
        }
    };


    // 检查配置
    check.config = function () {
        if (!config["coolie-config.js"]) {
            log("parse config", "coolie.json require `coolie-config.js` property", "error");
            process.exit();
        }

        if (ydrUtil.typeis(config["coolie-config.js"]) !== "string") {
            log("parse config", "`coolie-config.js` property must be a string", "error");
            process.exit();
        }

        var coolieConfigJS = path.join(relative, config["coolie-config.js"]);

        if (!ydrUtil.typeis.file(coolieConfigJS)) {
            log("parse config", coolieConfigJS + " is NOT a file", "error");
            process.exit();
        }
    };


    // 检查复制
    check.copy = function () {
        if (config.copy) {
            var copyFilesType = ydrUtil.typeis(config.copy);

            if (copyFilesType !== "string" && copyFilesType !== "array") {
                log("parse config", "`copy` property must be a string or an array object", "error");
                process.exit();
            }

            if (copyFilesType === "array") {
                config.copy.forEach(function (cp, index) {
                    if (ydrUtil.typeis(cp) !== "string") {
                        log("parse config", "`copy` property[" + index + "] must be a string", "error");
                        process.exit();
                    }
                });
            } else {
                config.copy = [config.copy];
            }
        } else {
            config.copy = [];
        }

    };


    check.file();
    check.js();
    check.css();
    check.html();
    check.dest();
    check.config();
    check.copy();

    return config;
};


////////////////////////////////////////////////////////////////////////////
//var ret = module.exports(path.join(__dirname, '../example/src/'));
//console.log(ret);