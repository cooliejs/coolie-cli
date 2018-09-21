/**
 * 初始化
 * @author ydr.me
 * @create 2015-10-31 14:11
 */


'use strict';

var plan = require('blear.utils.plan');
var fse = require('fs-extra');
var debug = require('blear.node.debug');
var typeis = require('blear.utils.typeis');
var path = require('blear.node.path');
var date = require('blear.utils.date');
var Template = require('blear.classes.template');
var console = require('blear.node.console');


var pkg = require('../../package.json');
var scaffold = require('../utils/scaffold');


/**
 * 生成文件
 * @param name {String} 文件名
 * @param destDirname {String} 目标地址
 * @param callback {Function} 回调
 * @returns {*}
 */
var writeFile = function (name, destDirname, callback) {
    var destPath = path.join(destDirname, name);
    var chineseName = {
        'coolie.config.js': '构建配置文件',
        'coolie-config.js': '模块配置文件'
    }[name];

    if (path.isFile(destPath)) {
        debug.error('init error', chineseName + ' `' + name + '` 已存在');
        return process.exit(1);
    }

    plan
        .task(function (next) {
            scaffold('self', next);
        })
        .task(function (next, template) {
            var srcPath = path.join(template.dirname, template.filename, name);

            try {
                fse.ensureFileSync(destPath);
            } catch (err) {
                debug.error(name, destPath);
                template.empty();
                return next(err);
            }

            var srcData = fse.readFileSync(srcPath, 'utf8');
            var tpl = new Template(srcData, {
                compress: false
            });
            var destData = tpl.render({
                version: pkg.version,
                datetime: date.format('YYYY-MM-DD HH:mm:ss')
            });

            try {
                fse.outputFileSync(destPath, destData, 'utf8');
            } catch (err) {
                debug.error(name, destPath);
                template.empty();
                return next(err);
            }

            debug.success('init success', destData);
            debug.success('init success', destPath);
            template.empty();
            next();
        })
        .serial()
        .try(callback)
        .catch(function (err) {
            debug.error('init error', err.message);
            return process.exit(1);
        });
};

/**
 * 生成配置文件
 * @param options {Object} 配置
 * @param options.destDirname {String} 根目录
 * @param options.coolieCli {Boolean} 是否生成 coolie-cli 的配置文件
 * @param options.coolieJs {Boolean} 是否生成 coolie.js 的配置文件
 */
module.exports = function (options) {
    if (!options.coolieCli && !options.coolieJs) {
        debug.warn('coolie tips', '请选择初始化类型，可选：`--coolie-cli` 或 `--coolie-js`');
        return;
    }

    plan
        .task(function (next) {
            if (!options['coolieCli']) {
                return next();
            }

            writeFile('coolie.config.js', options.destDirname, next);
        })
        .task(function (next) {
            if (!options['coolieJs']) {
                return next();
            }

            writeFile('coolie-config.js', options.destDirname, next);
        })
        .serial(function () {
            process.exit(1);
        });
};

