/*!
 * 帮助命令
 * @author ydr.me
 * @create 2015-08-12 10:07
 */


'use strict';

var log = require("../libs/log.js");

module.exports = function (isFull) {
    log(true, "coolie version", "输出版本号", "success");
    log(true, "coolie build [path]", "在指定目录根据`coolie.json`执行前端构建", "success");
    log(true, "coolie json [path]", "在指定目录生成`coolie.json`", "success");
    log(true, "coolie pull [path]", "下载 coolie.min.js 到指定目录", "success");
    log(true, "coolie config [path]", "在指定目录生成`coolie-config.js`", "success");
    log(true, "coolie book", "打开 coolie book", "success");

    if (isFull) {
        log(true, "coolie alien [path]", "下载 alien/ 到指定目录", "success");
        log(true, "coolie donkey [path]", "下载 donkey/ 到指定目录", "success");
    }
};

