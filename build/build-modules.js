/*!
 * build-modules.js
 * @author ydr.me
 * @create 2014-10-23 22:11
 */


"use strict";

var fs = require("fs-extra");
var howdo = require("howdo");
var path = require("path");
var glob = require("glob");
var log = require("../libs/log.js");
var util = require("../libs/util.js");
var parseConfig = require("../libs/parse-config.js");
var buildMain = require("./build-main.js");

module.exports = function (relative) {
    var config = parseConfig(relative);
    var src = path.join(relative, config.src);
    var dest = path.join(relative, config.dest);

    howdo.each(config.main, function (i, main, next) {
        glob(path.join(src, main), function (files) {
            howdo.each(files, function (j, file, next) {

            }).follow(function () {

            });
        });
    }).follow(function (err) {

    });

    console.log(src);
    console.log(dest);
};
