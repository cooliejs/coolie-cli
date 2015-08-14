/*!
 * cmd donkey
 * @author ydr.me
 * @create 2015-08-12 10:02
 */


'use strict';

var pkg = require('../package.json');
var downZip = require('../libs/down-zip.js');


module.exports = function (dirname) {
    downZip(dirname, pkg.donkey, 'donkey');
};

