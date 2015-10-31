/**
 * install
 * @author ydr.me
 * @create 2015-10-31 14:54
 */


'use strict';

var pkg = require('../package.json');
var downZip = require('../utils/down-zip.js');

module.exports = function (options) {
    downZip({
        url: pkg.coolie[options.name],
        destDirname: options.destDirname,
        name: options.name
    });
};

