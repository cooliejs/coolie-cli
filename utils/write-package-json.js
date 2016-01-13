/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-13 16:30
 */


'use strict';

var path = require('ydr-utils').path;
var fse = require('fs-extra');

var pkg = require('../package.json');



var writePackageJSON = function (json, destDirname, callback) {
    var file = path.join(destDirname, 'package.json');

    json.createBy = 'coolie@' + pkg.version + ' ' + Date.now();
    fse.outputFileSync(file, JSON.stringify(json, null, 2), 'utf8');
};
