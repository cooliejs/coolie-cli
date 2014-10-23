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
var parseConfig = require("../libs/parse-config.js");
var buildMain = require("./build-main.js");

module.exports = function (buildPath) {
    var config = parseConfig(buildPath);
    var src = path.join(buildPath, config.src);
    var dest = path.join(buildPath, config.dest);
    var time = Date.now();
    var mainLength = 0;

    howdo.each(config.main, function (i, main, nextMain) {
        var gbPath = path.join(buildPath, main);

        log("build files", gbPath);

        glob(gbPath, function (err, files) {
            if(err){
                log("glob", gbPath, "error");
                console.log(err);
                process.exit();
            }

            howdo.each(files, function (j, file, nextFile) {
                var relative = path.relative(src, file);

                buildMain(file, function (err, code) {
                    if (err) {
                        return;
                    }

                    var destFile = path.join(dest, relative);

                    fs.outputFile(destFile, code, function (err) {
                        if (err) {
                            log("write main", destFile, "error");
                            console.log(err);
                            process.exit();
                        }

                        log("write main", destFile, "success");
                        mainLength++;
                        nextFile();
                    });
                });
            }).follow(function () {
                nextMain();
            });
        });
    }).follow(function (err) {
        if (err) {
            return;
        }

        var past = Date.now() - time;

        log("build", "build " + mainLength + " files, past " + past + " ms", "success");
    });
};
