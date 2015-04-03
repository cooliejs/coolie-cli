/*!
 * create-config.js
 * @author ydr.me
 * @create 2014-10-23 22:13
 */


"use strict";

var path = require("path");
var fs = require("fs-extra");
var log = require("./log.js");
var typeis = require("ydr-util").typeis;
// //path/to/coolie.js
// /path/to/coolie.js
var REG_URL = /^\/\//;


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
        if (typeis(file) === "string") {
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
    // js: []
    check.js = function () {
        var jsType = typeis(config.js);

        if (jsType !== "string" && jsType !== "array") {
            log("parse config", "`js` property must be a string path or an array object", "error");
            process.exit();
        }

        if (jsType === "array") {
            config.js.forEach(function (mn, index) {
                if (typeis(mn) !== "string") {
                    log("parse config", "`js` property[" + index + "] must be a string", "error");
                    process.exit();
                }
            });
        } else {
            config.js = [config.js];
        }
    };


    // 检查 css 配置
    // css: {
    //    path: ,
    //    host: ,
    // }
    check.css = function () {
        if (typeis(config.css) !== "object") {
            log("parse config", "`css` property must be a object", "error");
            process.exit();
        }

        // css.path
        if (typeis(config.css.path) !== 'string') {
            log("parse config", "`css.path` property must be a string path", "error");
            process.exit();
        }

        //var cssPath = path.join(relative, config.css.path);
        //
        //if (!typeis.directory(cssPath)) {
        //    log("parse config", "`" + cssPath + "` is NOT a directory", "error");
        //    process.exit();
        //}

        // css.host
        if (typeis(config.css.host) !== 'string') {
            log("parse config", "`css.host` must be a string", "error");
            process.exit();
        }

        if (config.css.host.slice(-1) !== '/') {
            config.css.host += '/';
        }
    };


    // 检查 html
    check.html = function () {
        if (typeis(config.html) !== "object") {
            log("parse config", "`html` property must be a object", "error");
            process.exit();
        }

        // html.path
        if (config.html.path) {
            var htmlPathType = typeis(config.html.path);

            if (htmlPathType !== "string" && htmlPathType !== "array") {
                log("parse config", "`html.path` property must be a string path or an array object", "error");
                process.exit();
            }

            if (htmlPathType === "array") {
                config.html.path.forEach(function (mn, index) {
                    if (typeis(mn) !== "string") {
                        log("parse config", "`html.path` property[" + index + "] must be a string", "error");
                        process.exit();
                    }
                });
            } else {
                config.html.path = [config.html.path];
            }
        } else {
            config.html.path = [];
        }

        // html.minify
        var htmlMinifyType = typeis(config.html.minify);

        if (htmlMinifyType !== 'boolean') {
            log("parse config", "`html.minify` property must be a boolean", "error");
            process.exit();
        }
    };


    // 检查 res 路径
    check.res = function () {
        if (config.res) {
            var resType = typeis(config.res);

            if (resType !== "string" && resType !== "array") {
                log("parse config", "`res` property must be a string path or an array object", "error");
                process.exit();
            }

            if (resType === "array") {
                config.res.forEach(function (mn, index) {
                    if (typeis(mn) !== "string") {
                        log("parse config", "`res` property[" + index + "] must be a string", "error");
                        process.exit();
                    }
                });
            } else {
                config.res = [config.res];
            }
        } else {
            config.res = [];
        }
    };


    // 检查 dest 路径
    check.dest = function () {
        if (!config.dest) {
            log("parse config", "coolie.json require `dest` property", "error");
            process.exit();
        }

        if (typeis(config.dest) !== "string") {
            log("parse config", "`dest` property must be a string path", "error");
            process.exit();
        }
    };


    // 检查 coolie.js
    check.coolie = function () {
        if (!config["coolie.js"]) {
            log("parse config", "coolie.json require `coolie.js` property", "error");
            process.exit();
        }

        if (typeis(config["coolie.js"]) !== "string") {
            log("parse config", "`coolie.js` property must be a string", "error");
            process.exit();
        }

        var coolieConfigJS = path.join(relative, config["coolie.js"]);

        if (!typeis.file(coolieConfigJS)) {
            log("parse config", coolieConfigJS + " is NOT a file", "error");
            process.exit();
        }
    };


    // 检查 coolie-config.js
    check.coolieConfig = function () {
        if (!config["coolie-config.js"]) {
            log("parse config", "coolie.json require `coolie-config.js` property", "error");
            process.exit();
        }

        if (typeis(config["coolie-config.js"]) !== "string") {
            log("parse config", "`coolie-config.js` property must be a string", "error");
            process.exit();
        }

        var coolieConfigJS = path.join(relative, config["coolie-config.js"]);

        if (!typeis.file(coolieConfigJS)) {
            log("parse config", coolieConfigJS + " is NOT a file", "error");
            process.exit();
        }
    };


    // 检查复制
    check.copy = function () {
        if (config.copy) {
            var copyFilesType = typeis(config.copy);

            if (copyFilesType !== "string" && copyFilesType !== "array") {
                log("parse config", "`copy` property must be a string or an array object", "error");
                process.exit();
            }

            if (copyFilesType === "array") {
                config.copy.forEach(function (cp, index) {
                    if (typeis(cp) !== "string") {
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
    check.res();
    check.dest();
    check.coolie();
    check.coolieConfig();
    check.copy();

    return config;
};


////////////////////////////////////////////////////////////////////////////
//var ret = module.exports(path.join(__dirname, '../example/src/'));
//console.log(ret);