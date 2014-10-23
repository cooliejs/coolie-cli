/*!
 * build-modules.js
 * @author ydr.me
 * @create 2014-10-23 22:11
 */


"use strict";

var fs = require("fs-extra");
var path = require("path");
var glob = require("glob");
var log = require("../libs/log.js");
var util = require("../libs/util.js");
var parseConfig = require("../libs/parse-config.js");

module.exports = function (relative, config) {
    config = parseConfig(relative, config);

    var src = path.join(relative, config.src);
    var dest = path.join(relative, config.dest);

    console.log(config);
};
