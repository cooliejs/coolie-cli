#!/usr/bin/env node

/**
 * coolie bin
 * @author ydr.me
 * @create 2018-09-21 14:29
 * @update 2018-09-21 14:29
 */


'use strict';

var cli = require('blear.node.cli');
var path = require('blear.node.path');
var console = require('blear.node.console');
var debug = require('blear.node.debug');

var cmdBanner = require('../src/cmds/banner.js');
var cmdBuild = require('../src/cmds/build.js');
var cmdCreate = require('../src/cmds/create.js');
var cmdDemo = require('../src/cmds/demo.js');
var cmdDoc = require('../src/cmds/doc.js');
var cmdInit = require('../src/cmds/init.js');
var cmdVersion = require('../src/cmds/version.js');


cli
    .banner(cmdBanner)
    .command()
    .helper()
    .versioning()
    .action(function () {
        cli.help();
    })

    .command('build', '构建工程')
    .usage('coolie build [options]', '在当前目录进行工程构建')
    .option('dirname', {
        alias: 'd',
        description: '工程根目录，默认当前工作目录',
        transform: function (value, args, params) {
            return path.resolve(value || './');
        }
    })
    .option('config', {
        alias: 'c',
        description: '配置文件，默认为 coolie.config.js',
        default: 'coolie.config.js'
    })
    .helper()
    .action(function (args, params) {
        cmdBuild({
            srcDirname: args.dirname,
            configFile: args.config
        });
    })

    .command('create', '创建工程')
    .usage('coolie create -erm', '在当前目录新建 express & redis & mongoose 类型的工程脚手架')
    .usage('coolie create -s', '在当前目录新建 static 类型的工程脚手架')
    .option('dirname', {
        alias: 'd',
        description: '工程根目录，默认当前工作目录',
        transform: function (value, args, params) {
            return path.resolve(value || './');
        }
    })
    .option('express', {
        alias: 'e',
        description: 'express 类型',
        type: 'boolean'
    })
    .option('redis', {
        alias: 'r',
        description: 'redis 类型，依附于 express',
        type: 'boolean'
    })
    .option('mongoose', {
        alias: 'm',
        description: 'mongoose 类型，依附于 express',
        type: 'boolean'
    })
    .option('static', {
        alias: 's',
        description: 'static 类型，互斥于 express',
        type: 'boolean'
    })
    .helper()
    .action(function (args, params) {
        // 互斥
        if (args.express === true && args.static === true) {
            debug.error('coolie create', 'express 与 static 类型互斥，只能选其一');
            return;
        }

        // 依附
        if (args.redis === true || args.mongoose === true) {
            args.express = true;
        }

        // 必选其一
        if (args.express === false && args.static === false) {
            cli.help('create');
            return;
        }

        cmdCreate({
            destDirname: args.dirname,
            express: args.express,
            static: args.static,
            mongoose: args.mongoose,
            redis: args.redis
        });
    })

    .command('demo', '演示项目')
    .usage('coolie demo <id>', '打开指定演示项目')
    .option('dirname', {
        alias: 'd',
        description: '工程根目录，默认当前工作目录',
        transform: function (value, args, params) {
            return path.resolve(value || './');
        }
    })
    .helper()
    .action(function (args, params) {
        var id = params[0];
        id = id || '1';
        cmdDemo({
            destDirname: args.dirname,
            demo: id
        });
    })

    .command('doc', '官方文档')
    .usage('coolie doc', '使用浏览器打开官方文档')
    .action(function () {
        cmdDoc();
    })

    .command('init', '初始化配置文件')
    .option('dirname', {
        alias: 'd',
        description: '工程根目录，默认当前工作目录',
        transform: function (value, args, params) {
            return path.resolve(value || './');
        }
    })
    .usage('coolie init -c', '初始化 coolie 工程构建配置文件')
    .usage('coolie init -j', '初始化 coolie 模块加载器配置文件')
    .option('coolieCli', {
        alias: 'c',
        description: 'coolie 工程构建配置文件',
        type: 'boolean'
    })
    .option('coolieJs', {
        alias: 'j',
        description: 'coolie 模块加载器配置文件',
        type: 'boolean'
    })
    .helper()
    .action(function (args, params) {
        if (args.coolieCli === false && args.coolieJs === false) {
            cli.help('init');
            return;
        }

        cmdInit({
            destDirname: args.dirname,
            coolieCli: args.coolieCli,
            coolieJs: args.coolieJs
        });
    })

    .command('version', '打印版本号并检查更新')
    .helper()
    .action(function (args, params) {
        cmdVersion();
    })

    .parse({
        bin: 'coolie',
        package: require('../package.json')
    });

