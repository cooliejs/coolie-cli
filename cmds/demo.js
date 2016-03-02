/**
 * show coolie demo
 * @author ydr.me
 * @create 2015-12-10 15:26
 */


'use strict';

var banner = require('./banner.js');
var gitClone = require('../utils/git-clone.js');


/**
 * 下载 demo
 * @param options {Object} 配置
 * @param options.destDirname {String} 目标目录
 * @param options.demo {Number} demo 序号
 */
module.exports = function (options) {
    banner();

    gitClone({
        dirname: options.destDirname,
        repository: 'coolie-demo' + options.demo
    });
};


