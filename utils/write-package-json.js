/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-13 16:30
 */


'use strict';

var path = require('ydr-utils').path;

var pkg = require('../package.json');



var writePackageJSON = function (pkg, modules, destDirname, callback) {
    var file = path.join(destDirname, 'package.json');

    pkg.createBy = 'coolie@' + pkg.version + ' ' + Date.now();
    fse.outputFileSync(file, JSON.stringify(pkg, null, 2), 'utf8');
};
