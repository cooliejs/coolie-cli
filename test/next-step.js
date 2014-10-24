/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-10-24 10:19
 */

"use strict";

var nextStep = require("../libs/next-step.js");
var steps = [];

steps.push(function () {
    console.log("hi please enter a string.");
});

steps.push(function (data) {
    console.log("1/2: your enter is " + data);
    console.log("hi please enter a number.");
});

steps.push(function (data) {
    console.log("2/2: let me guess...");
    setTimeout(function () {
        console.log("2/2: I got it, your enter is " + data);
        console.log("Thank you, bye!");
        process.exit();
    }, 1000);
});

nextStep(steps);
