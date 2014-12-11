/*!
 * index
 * @author ydr.me
 * @create 2014-10-22 18:38
 */

"use strict";

var log = require("../libs/log.js");
var buildConfig = require("./build-config.js");
var buildJSON = require("./build-json.js");
var buildModules = require("./build-modules.js");
var checkUpdate = require("./check-update.js");
var openHelp = require("./open-help.js");
var pullCoolie = require("./pull-coolie.js");
var path = require("path");
var CWD = process.cwd();
var cmdArgs = process.argv.slice(2);
var cmdArg0 = cmdArgs[0];
var cmdArg1 = cmdArgs[1];
var buildPath = cmdArg1 ? path.join(CWD, cmdArg1) : CWD;

switch ((cmdArg0 || "").toLowerCase()) {
    case "wiki":
        openHelp();
        break;

    case "version":
        checkUpdate();
        break;

    case "config":
        buildConfig(buildPath);
        break;

    case "json":
        buildJSON(buildPath);
        break;

    case "build":
        buildModules(buildPath);
        break;

    case "pull":
        pullCoolie(buildPath);
        break;

    default:
        log(true, "coolie wiki", "打开 WIKI 页面", "success");
        log(true, "coolie pull [path]", "下载 coolie.min.js 到指定目录", "success");
        log(true, "coolie version", "输出版本号", "success");
        log(true, "coolie config [path]", "在指定目录生成`coolie-config.js`", "success");
        log(true, "coolie json [path]", "在指定目录生成`coolie.json`", "success");
        log(true, "coolie build [path]", "在指定目录根据`coolie.json`配置文件执行构建HTML/JS/CSS", "success");
}

