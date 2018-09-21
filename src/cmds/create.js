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
var fs = require('fs');
var plan = require('blear.utils.plan');

var pkg = require('../../package.json');
var scaffold = require('../utils/scaffold');

var TEMPLATE_MAP = {
    express: {
        name: 'express'
    },
    'static': {
        name: 'static'
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
            dot: false,
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

    plan.each(files, function (index, file, next) {
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
    }).serial(callback);
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
        debug.success('create', type + ' 工程脚手架（mongoose、redis）');
    } else if (isExpress && options.mongoose) {
        debug.success('create', type + ' 工程脚手架（mongoose）');
    } else if (isExpress && options.redis) {
        debug.success('create', type + ' 工程脚手架（redis）');
    } else {
        debug.success('create', type + ' 工程脚手架');
    }

    scaffold(meta.name, function (err, template) {
        if (err) {
            return;
        }

        meta.convert = readConvert(template);
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
    if (options.express) {
        deepCreate('express', options);
    } else if (options.static) {
        deepCreate('static', options);
    }
};


/**
 * 读取 convert
 * @param template
 * @returns {*}
 */
function readConvert(template) {
    var convert;

    try {
        convert = JSON.parse(fs.readFileSync(
            path.join(template.path, '.convert.json'),
            'utf8'
        ));
    } catch (err) {
        // ignore
    }

    return convert || {};
}
