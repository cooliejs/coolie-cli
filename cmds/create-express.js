/**
 * 创建 express 模板
 * @author ydr.me
 * @create 2016-01-13 14:32
 */


'use strict';

var path = require('ydr-utils').path;
var dato = require('ydr-utils').dato;
var debug = require('ydr-utils').debug;
var howdo = require('howdo');
var glob = require('glob');
var fse = require('fs-extra');

var getModulesVersion = require('../utils/get-modules-version.js');
var writePackageJSON = require('../utils/write-package-json.js');

var root = path.join(__dirname, '../template/express/');
var templatePackageJSON = require(path.join(root, 'package.json'));

var dependencies = [
    'body-parser',
    'cookie-parser',
    'express',
    'express-session',
    'form-data',
    'howdo',
    'later',
    'multer',
    'ydr-utils'
];
var devDependencies = [
    'mocha',
    'supervisor'
];


