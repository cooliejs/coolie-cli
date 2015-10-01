/*!
 * 递增猜目录
 * @author ydr.me
 * @create 2015-10-01 16:30
 */


'use strict';

var typeis = require('ydr-utils').typeis;
var path = require('ydr-utils').path;


/**
 * 递增猜目录
 * @param beginPath {String} 起始目录
 * @param dirname {String} 目录名称
 * @returns {string}
 */
module.exports = function (beginPath, dirname) {
    var guessPath = path.join(beginPath, dirname + '/');

    if (!typeis.directory(guessPath)) {
        return guessPath;
    }

    var index = 0;

    guessPath = path.join(beginPath, dirname + index+ '/');

    while (typeis.directory(guessPath)) {
        index++;
        guessPath = path.join(beginPath, dirname + index+ '/');
    }

    return guessPath;
};
