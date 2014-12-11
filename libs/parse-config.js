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
    // js: {
    //    path: ,
    //    main: ,
    //    host: ,
    // }
    check.js = function () {
        if (typeis(config.js) !== "object") {
            log("parse config", "`js` property must be a object", "error");
            process.exit();
        }

        // js.path
        if (typeis(config.js.path) !== 'string') {
            log("parse config", "`js.path` property must be a string path", "error");
            process.exit();
        }

        var jsPath = path.join(relative, config.js.path);

        if (!typeis.directory(jsPath)) {
            log("parse config", "`" + jsPath + "` is NOT a directory", "error");
            process.exit();
        }

        // js.main
        var jsMainType = typeis(config.js.main);

        if (jsMainType !== "string" && jsMainType !== "array") {
            log("parse config", "`js.main` property must be a string path or an array object", "error");
            process.exit();
        }

        if (jsMainType === "array") {
            config.js.main.forEach(function (mn, index) {
                if (typeis(mn) !== "string") {
                    log("parse config", "`js.main` property[" + index + "] must be a string", "error");
                    process.exit();
                }
            });
        } else {
            config.js.main = [config.js.main];
        }

        // js.host
        if (typeis(config.js.host) !== 'string') {
            log("parse config", "`js.host` must be a string", "error");
            process.exit();
        }

        if (config.js.host.slice(-1) !== '/') {
            config.js.host += '/';
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

        var cssPath = path.join(relative, config.css.path);

        if (!typeis.directory(cssPath)) {
            log("parse config", "`" + cssPath + "` is NOT a directory", "error");
            process.exit();
        }

        // css.host
        if (typeis(config.css.host) !== 'string') {
            log("parse config", "`css.host` must be a string", "error");
            process.exit();
        }

        if (config.css.host.slice(-1) !== '/') {
            config.css.host += '/';
        }
    };


    // 检查 html 路径
    //    html: ,
    check.html = function () {
        if (config.html) {
            var htmlType = typeis(config.html);

            if (htmlType !== "string" && htmlType !== "array") {
                log("parse config", "`html` property must be a string path or an array object", "error");
                process.exit();
            }

            if (htmlType === "array") {
                config.html.forEach(function (mn, index) {
                    if (typeis(mn) !== "string") {
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
    //    html: ,
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


    // 检查配置
    check.config = function () {
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
    //    copy: ,
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
    check.dest();
    check.config();
    check.copy();

    return config;
};


////////////////////////////////////////////////////////////////////////////
//var ret = module.exports(path.join(__dirname, '../example/src/'));
//console.log(ret);