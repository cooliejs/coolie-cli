/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-10-24 10:11
 */

"use strict";

var util = require("./util.js");

module.exports = function (steps) {
    if (util.type(steps) !== "array") {
        throw new Error("confirm steps must be an array");
    }

    if(steps.length < 2){
        throw new Error("confirm steps length must greater than 1");
    }

    var step = 0;

    process.stdin.setEncoding("utf8");
    process.stdin.on("readable", function () {
        var chunk = process.stdin.read();

        if (util.type(steps[step]) !== "function") {
            throw new Error("steps[" + step + "] must be a function");
        }

        steps[step](chunk);

        step++;
    });

    process.stdin.on("end", function () {
        process.stdout.write("end");
    });
};
