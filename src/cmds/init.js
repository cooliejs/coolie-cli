/**
 * 初始化
 * @author ydr.me
 * @create 2015-10-31 14:11
 */


'use strict';

var howdo = require('howdo');
var fse = require('fs-extra');
var debug = require('blear.node.debug');
var typeis = require('blear.utils.typeis');
var path = require('blear.node.path');
var date = require('blear.utils.date');
var Template = require('blear.classes.template');
var console = require('blear.node.console');


var banner = require('./banner.js');
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

    howdo
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
        .follow()
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
 * @param options.coolie.js {Boolean} 是否生成 coolie.js 的配置文件
 * @param options.coolie-cli {Boolean} 是否生成 coolie-cli 的配置文件
 */
module.exports = function (options) {
    banner();

    if (!options['coolie-cli'] && !options['coolie.js']) {
        debug.warn('coolie tips', '请选择初始化类型，可选：`--coolie-cli` 或 `--coolie.js`');
        return;
    }

    howdo
        .task(function (done) {
            if (!options['coolie-cli']) {
                return done();
            }

            writeFile('coolie.config.js', options.destDirname, done);
        })
        .task(function (done) {
            if (!options['coolie.js']) {
                return done();
            }

            writeFile('coolie-config.js', options.destDirname, done);
        })
        .together(function () {
            process.exit(1);
        });
};

