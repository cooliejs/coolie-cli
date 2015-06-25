/*!
 * index
 * @author ydr.me
 * @create 2014-10-22 18:38
 */

"use strict";

var string = require('ydr-utils').string;
var pkg = require('../package.json');
var log = require("../libs/log.js");
var buildConfig = require("./build-config.js");
var buildJSON = require("./build-json.js");
var buildModules = require("./build-modules.js");
var checkUpdate = require("./check-update.js");
var openBook = require("./open-book.js");
var pullCoolie = require("./pull-coolie.js");
var downloadAlien = require("./download-alien.js");
var path = require("path");
var colors = require('colors/safe.js');
var CWD = process.cwd();
var cmdArgs = process.argv.slice(2);
var cmdArg0 = cmdArgs[0];
var cmdArg1 = cmdArgs[1];
var buildPath = cmdArg1 ? path.join(CWD, cmdArg1) : CWD;


console.log('');
console.log(colors.cyan('            ╔═══════════════════════════════════════════════════════╗'));
console.log(colors.cyan('            ║         ', 'coolie.cli@' + pkg.version, '                           ║'));
console.log(colors.cyan('            ║         ', pkg.description, '          ║'));
console.log(colors.cyan('            ╚═══════════════════════════════════════════════════════╝'));
console.log('');

switch ((cmdArg0 || "").toLowerCase()) {
    case "book":
        openBook();
        break;

    case "-v":
    case "version":
        checkUpdate();
        break;

    case "pull":
        pullCoolie(buildPath);
        break;

    case "alien":
        downloadAlien(buildPath);
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

    default:
        log(true, "coolie book", "打开 coolie book", "success");
        log(true, "coolie version", "输出版本号", "success");
        log(true, "coolie pull [path]", "下载 coolie.min.js 到指定目录", "success");
        log(true, "coolie alien [path]", "下载 alien/ 到指定目录", "success");
        log(true, "coolie config [path]", "在指定目录生成`coolie-config.js`", "success");
        log(true, "coolie json [path]", "在指定目录生成`coolie.json`", "success");
        log(true, "coolie build [path]", "在指定目录根据`coolie.json`配置文件执行构建HTML/JS/CSS", "success");
}

