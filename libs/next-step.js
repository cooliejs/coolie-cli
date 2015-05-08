/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-10-24 10:11
 */

"use strict";

var typeis = require('ydr-utils').typeis;

module.exports = function (steps) {
    if (typeis(steps) !== "array") {
        throw new Error("confirm steps must be an array");
    }

    if(steps.length < 2){
        throw new Error("confirm steps length must greater than 1");
    }

    var step = 0;

    process.stdin.setEncoding("utf8");
    process.stdin.on("readable", function () {
        var chunk = process.stdin.read();

        if (typeis(steps[step]) !== "function") {
            process.exit();
        }

        steps[step](chunk);

        step++;
    });

    process.stdin.on("end", function () {
        process.stdout.write("end");
    });
};
