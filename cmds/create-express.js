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
var glob = require('glob');
var fse = require('fs-extra');

var pkg = require('../package.json');

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


/**
 * 获取模块列表版本
 * @param modules
 * @param callback
 */
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
 * 创建模板
 * @param root
 * @param destDirname
 */
var createTemplate = function (root, destDirname) {
    var files = glob.sync(path.join(root, '*'), {
        dot: true
    });

    dato.each(files, function (index, file) {
        var basename = path.basename(file);

        if (basename === 'package.json') {
            return;
        }

        var srcName = path.relative(root, file);
        var destFile = path.join(destDirname, srcName);

        try {
            fse.copySync(file, destFile, {
                // 是否覆盖
                clobber: false
            });
        } catch (err) {
            // ignore
        }

        debug.success('create', path.toSystem(destFile));
    });
};


var writePackageJSON = function (pkg, destDirname) {
    var file = path.join(destDirname, 'package.json');

    pkg.createBy = 'coolie@' + pkg.version + ' ' + Date.now();
    fse.outputFileSync(file, JSON.stringify(pkg, null, 2), 'utf8');
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
            debug.success('dependencies', JSON.stringify(dependencies, null, 2));
            debug.success('devDependencies', JSON.stringify(devDependencies, null, 2));
            templatePackageJSON.dependencies = dependencies;
            templatePackageJSON.devDependencies = devDependencies;
            createTemplate(root, options.destDirname);
            writePackageJSON(templatePackageJSON, options.destDirname);
        })
        .catch(function (err) {
            debug.error('create error', err.message);
            process.exit(1);
        });
};

