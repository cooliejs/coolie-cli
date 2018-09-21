#!/usr/bin/env node

/**
 * coolie bin
 * @author ydr.me
 * @create 2018-09-21 14:29
 * @update 2018-09-21 14:29
 */


'use strict';

var cli = require('blear.node.cli');

var cmdBanner = require('../src/cmds/banner.js');
var cmdBuild = require('../src/cmds/build.js');
var cmdVersion = require('../src/cmds/version.js');
var cmdInit = require('../src/cmds/init.js');
var cmdBook = require('../src/cmds/book.js');
// var cmdInstall = require('../src/cmds/install.js');
var cmdCreate = require('../src/cmds/create.js');
var cmdDemo = require('../src/cmds/demo.js');
var cmdHelp = require('../src/cmds/help.js');
var cmdHelpBuild = require('../src/cmds/help-build.js');
var cmdHelpCreate = require('../src/cmds/help-create.js');
var cmdHelpInit = require('../src/cmds/help-init.js');
var cmdHelpDemo = require('../src/cmds/help-demo.js');
var cmdHelpInstall = require('../src/cmds/help-install.js');


cli
    .banner(cmdBanner)
    .command()
    .usage('coolie build', '在当前目录进行构建')
    .usage('coolie create <options>', '在当前目录新建指定类型的工程脚手架')
    .usage('coolie demo <id>', '打开指定演示项目')
    .helper()
    .versioning()
    .action(function () {
        cli.help();
    })
    .command('build', '构建工程')
    .option('dirname', {
        alias: 'd',
        description: '工程根目录，默认当前工作目录'
    })
    .option('config', {
        alias: 'c',
        description: '配置文件，默认为 coolie.config.js'
    })
    .helper()
    .command('create', '创建工程')
    .helper()
    .command('demo', '演示项目')
    .helper()
    .command('doc', '官方文档')
    .helper()
    .command('init', '初始化配置文件')
    .helper()
    .command('version', '打印版本号并检查更新')
    .helper()
    .parse({
        bin: 'coolie',
        package: require('../package.json')
    });

