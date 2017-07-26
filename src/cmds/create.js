/**
 * 创建模板
 * @author ydr.me
 * @create 2016-01-13 15:25
 */


'use strict';

var debug = require('blear.node.debug');
var collection = require('blear.utils.collection');
var date = require('blear.utils.date');
var path = require('blear.node.path');
var Template = require('blear.classes.template');
var console = require('blear.node.console');
var glob = require('glob');
var fse = require('fs-extra');
var howdo = require('howdo');

var banner = require('./banner.js');
var pkg = require('../../package.json');
var scaffold = require('../utils/scaffold');

var template_root = path.join(__dirname, '../../scaffolds/');
var TEMPLATE_MAP = {
    express: {
        name: 'express',
        // root: path.join(template_root, 'express'),
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
                mongoose_redis: 'webserver/index${mongoose_redis}.js',
                redis: 'webserver/index${redis}.js',
                none: 'webserver/index${none}.js'
            }
        }
    },
    'static': {
        name: 'static'
        // root: path.join(template_root, 'static')
    }
};
// 重命名的文件
var renameMap = {
    gitignore: '.gitignore',
    npmignore: '.npmignore'
};
// 忽略的文件
var ignoreMap = {
    'readme.md': true,
    '.gitignore': true,
    '.npmignore': true
};
var REG_REPLACE = /\${.*?}\./;


/**
 * 创建模板
 * @param meta
 * @param meta.root
 * @param meta.name
 * @param meta.convert
 * @param options
 * @param options.destDirname
 * @param callback
 */
var createTemplate = function (meta, options, callback) {
    var root = meta.root;
    var convert = meta.convert;
    var destDirname = options.destDirname;
    var files = path.glob('**/*', {
        srcDirname: root,
        globOptions: {
            dot: true,
            nodir: true
        },
        filter: function (indexGlob, indexFile, file) {
            return !/\/\.[^/]+$/.test(file);
        }
    });

    var convert2 = {};
    var converted = {};
    var ignore2 = {};

    collection.each(convert, function (rela, transi) {
        convert2[path.join(root, rela)] = transi;
    });

    collection.each(ignoreMap, function (rela) {
        ignore2[path.join(root, rela)] = true;
    });

    howdo.each(files, function (index, file, next) {
        var dir = path.dirname(file);
        var basename = path.basename(file);
        var renameType = renameMap[basename];
        var srcName = path.relative(root, file);
        var transiType = convert2[file];
        var relName = '';
        var relFile = '';
        var findConvert = false;
        var isDynamic = REG_REPLACE.test(basename);

        if (ignoreMap[srcName]) {
            return next();
        }

        if (isDynamic) {
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
                collection.each(transiType, function (key, originFile) {
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

        if (renameType) {
            srcName = path.join(path.dirname(srcName), renameType);
        }

        var destFile = path.join(destDirname, srcName);
        var destName = path.basename(destDirname);

        try {
            fse.copySync(file, destFile, {
                // 是否覆盖
                clobber: false
            });
        } catch (err) {
            // ignore
        }

        debug.success('create', path.join(destName, srcName));
        setTimeout(next, 45);
    }).follow(callback);
};


/**
 * 创建 readme.md
 * @param meta
 * @param meta.root
 * @param meta.name
 * @param meta.convert
 * @param options
 * @param options.destDirname
 */
var createReadmeMD = function (meta, options) {
    var destDirname = options.destDirname;
    var destName = path.basename(destDirname);
    var srcName = 'readme.md';
    var destFile = path.join(destDirname, srcName);
    var readmeMDTemplatePath = path.join(meta.root, 'readme.md');
    var readmeMDTemplateData = fse.readFileSync(readmeMDTemplatePath, 'utf8');
    var tpl = new Template(readmeMDTemplateData, {
        compress: false
    });
    var data = tpl.render({
        name: destName,
        pkg: pkg,
        now: date.format('YYYY-MM-DD HH:mm:ss.SSS')
    });

    try {
        fse.outputFileSync(destFile, data, 'utf8');
    } catch (err) {
        // ignore
    }

    debug.success('create', path.join(destName, srcName));
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

    scaffold(meta.name, function (err, template) {
        if (err) {
            return;
        }

        meta.root = template.path;
        createTemplate(meta, options, function () {
            createReadmeMD(meta, options);
            template.empty();
        });
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
        debug.warn('coolie tips', '请选择创建的样板类型，如：--express 或 --static，' +
            '\n使用 --help 查看帮助');
        return;
    }

    if (options.express) {
        deepCreate('express', options);
    } else if (options.static) {
        deepCreate('static', options);
    }
};

