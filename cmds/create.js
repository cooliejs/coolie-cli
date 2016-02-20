/**
 * 创建模板
 * @author ydr.me
 * @create 2016-01-13 15:25
 */


'use strict';

var debug = require('ydr-utils').debug;
var dato = require('ydr-utils').dato;
var path = require('ydr-utils').path;
var typeis = require('ydr-utils').typeis;
var glob = require('glob');
var fse = require('fs-extra');
var howdo = require('howdo');

var banner = require('./banner.js');

var template_root = path.join(__dirname, '../template/');
var TEMPLATE_MAP = {
    express: {
        root: path.join(template_root, 'express'),
        convert: {
            'webserver/index.js': {
                mongoose: 'webserver/index${mongoose}.js',
                none: 'webserver/index${none}.js'
            },
            'webserver/index${mongoose}.js': false,
            'webserver/index${none}.js': false
        }
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
var REG_REPLACE = /\$\{.*?}\./;


/**
 * 创建模板
 * @param meta
 * @param options
 */
var createTemplate = function (meta, options) {
    var root = meta.root;
    var convert = meta.convert;
    var destDirname = options.destDirname;
    var files = glob.sync(path.join(root, '**/*'), {
        dot: true,
        nodir: true
    });

    var convert2 = {};
    var converted = {};

    dato.each(convert, function (rela, transi) {
        convert2[path.join(root, rela)] = transi;
    });

    howdo.each(files, function (index, file, next) {
        var dir = path.dirname(file);
        var basename = path.basename(file);
        var ignoreType = IGNORE_MAP[basename];
        var srcName = path.relative(root, file);
        var transiType = convert2[file];
        var relName = '';
        var relFile = '';
        var findConvert = false;

        if (transiType === false) {
            relName = basename.replace(REG_REPLACE, '.');
            relFile = path.join(dir, relName);
        }

        if (relFile) {
            if (converted[relFile]) {
                return next();
            }

            converted[relFile] = true;
            transiType = convert2[relFile];

            if (transiType) {
                srcName = path.relative(root, relFile);
                dato.each(transiType, function (key, originFile) {
                    if (options[key]) {
                        file = originFile;
                        findConvert = true;
                        return false;
                    }
                });

                if (!findConvert) {
                    file = transiType.none;
                }

                file = path.join(root, file);
                //debug.warn('transiType', transiType);
                //debug.warn('relFile', relFile);
                //debug.warn('srcName', srcName);
                //debug.warn('options', options);
                //debug.warn('file', file);
            }
        }

        if (ignoreType) {
            srcName = path.join(path.dirname(srcName), ignoreType);
        }

        var destFile = path.join(destDirname, srcName);

        try {
            debug.error('file', file);
            debug.error('destFile', destFile);
            fse.copySync(file, destFile, {
                // 是否覆盖
                clobber: false
            });
        } catch (err) {
            // ignore
        }

        //debug.success('create', path.toSystem(srcName));
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
    var pkg = require(path.join(meta.root, 'package.json'));
    var makeList = function (obj) {
        var list = [];

        dato.each(obj, function (key, val) {
            list.push(key + ': ' + val);
        });

        return list.join('\n');
    };

    debug.success('name', pkg.name + '@' + pkg.version);
    debug.success('dependencies', makeList(pkg.dependencies));
    debug.success('devDependencies', makeList(pkg.devDependencies));
    createTemplate(meta, options);
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

