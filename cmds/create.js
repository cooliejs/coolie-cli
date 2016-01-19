/**
 * 创建模板
 * @author ydr.me
 * @create 2016-01-13 15:25
 */


'use strict';

var debug = require('ydr-utils').debug;
var dato = require('ydr-utils').dato;
var path = require('ydr-utils').path;
var glob = require('glob');
var fse = require('fs-extra');
var howdo = require('howdo');

var banner = require('./banner.js');
var getModulesVersion = require('../utils/get-modules-version.js');
var writePackageJSON = require('../utils/write-package-json.js');

var template_root = path.join(__dirname, '../template/');
var TEMPLATE_MAP = {
    express: {
        root: path.join(template_root, 'express')
    },
    'static': {
        root: path.join(template_root, 'static')
    }
};
// 忽略复制的文件
var IGNORE_MAP = {
    gitignore: '.gitignore',
    npmignore: '.npmignore'
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

    howdo.each(files, function (index, file, next) {
        var basename = path.basename(file);
        var ignoreType = IGNORE_MAP[basename];
        var srcName = path.relative(root, file);

        if (ignoreType) {
            srcName = path.join(path.dirname(srcName), ignoreType);
        }

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
        setTimeout(next, 45);
    }).follow();
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

    debug.success('dependencies', JSON.stringify(dependencies, null, 2));
    debug.success('devDependencies', JSON.stringify(devDependencies, null, 2));
    templatePackageJSON.dependencies = dependencies;
    templatePackageJSON.devDependencies = devDependencies;
    writePackageJSON(templatePackageJSON, options.destDirname);
    createTemplate(meta.root, options.destDirname);
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

