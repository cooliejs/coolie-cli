/**
 * 递增猜目录
 * @author ydr.me
 * @create 2015-10-26 14:23
 */


'use strict';


var typeis = require('ydr-utils').typeis;
var path = require('ydr-utils').path;


/**
 * 递增猜目录
 * @param beginDirname {String} 起始目录
 * @param dirname {String} 目录名称
 * @returns {string}
 */
module.exports = function (beginDirname, dirname) {
    var guessPath = path.join(beginDirname, dirname + '/');

    if (!typeis.directory(guessPath)) {
        return guessPath;
    }

    var index = 0;

    guessPath = path.join(beginDirname, dirname + index+ '/');

    while (typeis.directory(guessPath)) {
        index++;
        guessPath = path.join(beginDirname, dirname + index+ '/');
    }

    return guessPath;
};



