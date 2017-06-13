/**
 * show coolie demo
 * @author ydr.me
 * @create 2015-12-10 15:26
 */


'use strict';

var howdo = require('howdo');
var debug = require('blear.node.debug');
var openHelper = require('open');
var console = require('blear.node.console');


var banner = require('./banner.js');
var gitDownload = require('../utils/git-download.js');
var gitRepo = require('../utils/git-repo.js');


/**
 * 下载 demo
 * @param options {Object} 配置
 * @param options.destDirname {String} 目标目录
 * @param options.demo {Number} demo 序号
 */
module.exports = function (options) {
    banner();

    var repo = 'coolie-demo' + options.demo;

    howdo
        .task(function (next) {
            gitRepo(repo, next);
        })
        .task(function (next, info) {
            if (info.created_at === info.updated_at) {
                return next(new Error('Not Found'));
            }

            gitDownload({
                dirname: options.destDirname,
                repository: repo
            }, function (err) {
                next(err, info);
            });
        })
        .task(function (next, info) {
            var homepage = info.homepage || info.html_url;
            openHelper(homepage, function (err) {
                if (err) {
                    return next();
                }

                debug.success(repo, homepage);
                next();
            });
        })
        .follow()
        .try()
        .catch(function (err) {
            debug.error(repo, err.message);
        });
};


