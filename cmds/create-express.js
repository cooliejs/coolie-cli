/**
 * 创建 express 模板
 * @author ydr.me
 * @create 2016-01-13 14:32
 */


'use strict';

var npm = require('ydr-utils').npm;
var path = require('ydr-utils').path;
var allocation = require('ydr-utils').allocation;
var dato = require('ydr-utils').dato;
var debug = require('ydr-utils').debug;
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


var getModulesVersion = function (modules, callback) {
    howdo
        .each(modules, function (index, dep, done) {
            npm.getLatestVersion(dep, function (err, version) {
                done(err, version);
            });
        })
        .together()
        .try(function () {
            var args = allocation.args(arguments);
            var deps = {};

            dato.each(args, function (index, version) {
                var name = modules[index];
                deps[name] = version;
            });

            callback(null, deps);
        })
        .catch(callback);
};


/**
 * 生成 express 模板
 * @param options {Object} 配置
 * @param options.destDirname {String} 目标目录
 */
module.exports = function (options) {
    howdo
    // dependencies
        .task(function (done) {
            getModulesVersion(dependencies, done);
        })
        // devDependencies
        .task(function (done) {
            getModulesVersion(devDependencies, done);
        })
        .together()
        .try(function (dependencies, devDependencies) {

        })
        .catch(function (err) {
            debug.error('create error', err.message);
        });
};

