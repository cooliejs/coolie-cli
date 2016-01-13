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

