/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-08-12 09:20
 */


'use strict';

var pkg = require('../package.json');
var downZip = require('../libs/down-zip.js');


module.exports = function (dirname) {
    downZip(dirname, pkg.alien, 'alien');
};

