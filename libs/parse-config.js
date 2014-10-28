/*!
 * create-config.js
 * @author ydr.me
 * @create 2014-10-23 22:13
 */


"use strict";

var path = require("path");
var fs = require("fs-extra");
var log = require("./log.js");
var util = require("./util.js");


/**
 * 解析 config
 * @param relative 起始目录
 * @param config 配置文件的路径或配置对象
 * @returns {Object}
 */
module.exports = function (relative) {
    var file = path.join(relative, "./coolie.json");
    var config = {};
    var dest;
    var coolieConfigJS;
    var mainType;
    var copyFilesType;


    if (util.type(file) === "string") {
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

    if (config.main) {
        mainType = util.type(config.main);

        if (mainType !== "string" && mainType !== "array") {
            log("parse config", "`main` property must be a string or an array object", "error");
            process.exit();
        }

        if (mainType === "array") {
            config.main.forEach(function (mn, index) {
                if (util.type(mn) !== "string") {
                    log("parse config", "`main` property[" + index + "] must be a string", "error");
                    process.exit();
                }
            });
        } else {
            config.main = [config.main];
        }
    } else {
        config.main = [];
    }

    if (!config.dest) {
        log("parse config", "coolie.json require `dest` property", "error");
        process.exit();
    }

    if (util.type(config.dest) !== "string") {
        log("parse config", "`dest` property must be a string", "error");
        process.exit();
    }

    dest = path.join(relative, config.dest);

    if (!util.isDirectory(dest)) {
        log("parse config", "`" + dest + "` is NOT a directory", "error");
        process.exit();
    }

    if (!config["coolie-config.js"]) {
        log("parse config", "coolie.json require `coolie-config.js` property", "error");
        process.exit();
    }

    if (util.type(config["coolie-config.js"]) !== "string") {
        log("parse config", "`coolie-config.js` property must be a string", "error");
        process.exit();
    }

    coolieConfigJS = path.join(relative, config["coolie-config.js"]);

    if (!util.isFile(coolieConfigJS)) {
        log("parse config", coolieConfigJS + " is NOT a file", "error");
        process.exit();
    }

    if (config.copyFiles) {
        copyFilesType = util.type(config.copyFiles);

        if (copyFilesType !== "string" && copyFilesType !== "array") {
            log("parse config", "`copyFiles` property must be a string or an array object", "error");
            process.exit();
        }

        if (copyFilesType === "array") {
            config.copyFiles.forEach(function (cp, index) {
                if (util.type(cp) !== "string") {
                    log("parse config", "`copyFiles` property[" + index + "] must be a string", "error");
                    process.exit();
                }
            });
        } else {
            config.copyFiles = [config.copyFiles];
        }
    } else {
        config.copyFiles = [];
    }


    return config;
};
