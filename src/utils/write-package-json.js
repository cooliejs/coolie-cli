/**
 * 写 package.json
 * @author ydr.me
 * @create 2016-01-13 16:30
 */


'use strict';

var path = require('ydr-utils').path;
var debug = require('ydr-utils').debug;
var fse = require('fs-extra');

var pkg = require('../../package.json');


var writePackageJSON = function (json, destDirname) {
    var file = path.join(destDirname, 'package.json');

    json.createBy = 'coolie@' + pkg.version + ' ' + Date.now();

    try {
        fse.outputFileSync(file, JSON.stringify(json, null, 2), 'utf8');
        debug.success('create', path.toSystem(file));
    } catch (err) {
        debug.danger('create', path.toSystem(file));
        debug.danger('error', err.message);
    }
};

module.exports = writePackageJSON;
