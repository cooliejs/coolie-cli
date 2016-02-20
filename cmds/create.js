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
            'package.json': {
                mongoose: 'package${mongoose}.json',
                redis: 'package${redis}.json',
                mongoose_redis: 'package${mongoose_redis}.json',
                none: 'package${none}.json'
            },
            'configs.js': {
                mongoose_redis: 'configs${mongoose_redis}.js',
                mongoose: 'configs${mongoose}.js',
                redis: 'configs${redis}.js',
                none: 'configs${none}.js'
            },
            'webserver/index.js': {
                mongoose: 'webserver/index${mongoose}.js',
                mongoose_redis: 'webserver/index${mongoose}.js',
                none: 'webserver/index${none}.js'
            },
            'webserver/middlewares/parser.js': {
                redis: 'webserver/middlewares/parser${redis}.js',
                mongoose_redis: 'webserver/middlewares/parser${redis}.js',
                none: 'webserver/middlewares/parser${none}.js'
            },
            'package${mongoose_redis}.json': false,
            'package${mongoose}.json': false,
            'package${none}.json': false,
            'package${redis}.json': false,
            'configs${redis}.js': false,
            'configs${none}.js': false,
            'webserver/index${mongoose}.js': false,
            'webserver/index${none}.js': false,
            'webserver/middlewares/parser${none}.js': false,
            'webserver/middlewares/parser${redis}.js': false
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
            fse.copySync(file, destFile, {
                // 是否覆盖
                clobber: false
            });
        } catch (err) {
            // ignore
        }

        debug.success('create', path.toSystem(srcName));
        setTimeout(next, 45);
    }).follow();
};


/**
 * 生成 express 模板
 * @param type {String} 模板类型
 * @param options {Object} 配置
 * @param options.destDirname {String} 目标目录
 * @param options.mongoose {Boolean} 是否添加 mongoose
 * @param options.redis {Boolean} 是否添加 redis
 * @param options.mongoose_redis {Boolean} 是否添加 mongoose 和 redis
 */
var deepCreate = function (type, options) {
    var meta = TEMPLATE_MAP[type];
    var isExpress = type === 'express';

    if (isExpress && options.mongoose && options.redis) {
        options.mongoose_redis = true;
        options.mongoose = options.redis = false;
        debug.success('create', type + ' template with mongoose and redis');
    } else if (isExpress && options.mongoose) {
        debug.success('create', type + ' template with mongoose');
    } else if (isExpress && options.redis) {
        debug.success('create', type + ' template with redis');
    } else {
        debug.success('create', type + ' template');
    }

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
        debug.warn('coolie tips', 'missing template type, can be --express(-e), --static(-s)');
        return;
    }

    if (options.express) {
        deepCreate('express', options);
    } else if (options.static) {
        deepCreate('static', options);
    }
};

