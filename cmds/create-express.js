/**
 * 创建 express 模板
 * @author ydr.me
 * @create 2016-01-13 14:32
 */


'use strict';

var npm = require('ydr-utils').npm;
var path = require('ydr-utils').path;
var howdo = require('howdo');

var root = path.join(__dirname, '../template/express/');
var pkg = require(path.join(root, 'package.json'));

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

