/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-13 15:25
 */


'use strict';

var debug = require('ydr-utils').debug;
var path = require('ydr-utils').path;
var glob = require('glob');
var fse = require('fs-extra');
var howdo = require('howdo');

var createExpress = require('./create-express');
var banner = require('./banner.js');
var getModulesVersion = require('../utils/get-modules-version.js');
var writePackageJSON = require('../utils/write-package-json.js');

var template_root = path.join(__dirname, '../template/');
var TEMPLATE_MAP = {
    express: {
        root: path.join(template_root, 'express'),
        dependencies: [
            'body-parser',
            'cookie-parser',
            'express',
            'express-session',
            'form-data',
            'howdo',
            'later',
            'multer',
            'ydr-utils'
        ],
        devDependencies: [
            'mocha',
            'supervisor'
        ]
    },
    'static': {
        root: path.join(template_root, 'static'),
        dependencies: [],
        devDependencies: []
    }
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


/**
 * 生成 express 模板
 * @param type {String} 模板类型
 * @param options {Object} 配置
 * @param options.destDirname {String} 目标目录
 */
var deepCreate = function (type, options) {
    var meta = TEMPLATE_MAP[type];
    var dependencies = meta.dependencies;
    var devDependencies = meta.devDependencies;
    var templatePackageJSON = require(path.join(meta.root, 'package.json'));

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
            createTemplate(meta.root, options.destDirname);
            writePackageJSON(templatePackageJSON, options.destDirname);
        })
        .catch(function (err) {
            debug.error('create error', err.message);
            process.exit(1);
        });
};


/**
 * 生成模板
 * @param options {Object} 配置
 * @param options.destDirname {String} 目标目录
 * @param options.express {Boolean} 是否为 express 模板
 * @param options.static {Boolean} 是否为 static 模板
 */
module.exports = function (options) {
    banner();

    if (!options.express && !options['static']) {
        debug.warn('coolie tips', 'missing template type');
        return;
    }

    if (options.express) {
        deepCreate('express', options);
    } else if (options.static) {
        deepCreate('static', options);
    }
};

