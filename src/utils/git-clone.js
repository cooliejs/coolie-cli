/**
 * 文件描述
 * @author ydr.me
 * @create 2016-02-25 14:45
 */


'use strict';


var request = require('blear.node.request');
var object = require('blear.utils.object');
var path = require('blear.node.path');
var url = require('blear.utils.url');
var debug = require('blear.node.debug');
var fun = require('blear.utils.function');
var typeis = require('blear.utils.typeis');
var random = require('blear.utils.random');
var fse = require('fs-extra');
var AdmZip = require('adm-zip');
var os = require('os');
var console = require('blear.node.console');


var defaults = {
    git: 'https://github.com',
    registry: 'cooliejs',
    repository: 'coolie-demo1',
    branch: 'master'
};


/**
 * 克隆代码
 * @param options {Object}
 * @param options.dirname {String} 目录
 * @param options.git {String} git 地址
 * @param options.registry {String} 仓库名称
 * @param options.repository {String} 代码库
 * @param [options.branch=master] {String} 分支
 * @param [callback] {Function} 回调
 */
module.exports = function (options, callback) {
    options = object.extend({}, defaults, options);

    if (!typeis.Function(callback)) {
        callback = function () {
        };
    }

    //log.success(options);
    var url = url.join(options.git, options.registry, options.repository, 'archive', options.branch + '.zip');
    debug.ignore('git clone', url);
    console.loading();
    var tempFile = path.join(os.tmpdir(), random.guid());
    var filename = options.repository + '-' + options.branch;
    var unzipPath = path.join(options.dirname, filename);
    var ws = fse.createWriteStream(tempFile);
    var complete = fun.once(function (err) {
        console.loadingEnd();

        if (err) {
            callback(err);
            return remoteTempfile();
        }

        debug.ignore('unzip', tempFile);

        try {
            var zip = new AdmZip(tempFile);
            zip.extractAllTo(options.dirname, true);
            debug.success(options.repository, unzipPath);
            callback();
        } catch (err) {
            debug.error('unzip ' + options.repository, unzipPath);
            debug.error('unzip ' + options.repository, err.message);
            callback(err);
        }

        remoteTempfile();
    });
    var remoteTempfile = function () {
        try {
            fse.removeSync(tempFile);
        } catch (err) {
            // ignore
        }
    };

    request({
        url: url,
        encoding: 'binary',
        debug: false
    }).on('error', function (err) {
        debug.error('git clone', err.message);
        complete(err);
    }).on('close', complete).pipe(ws).on('error', function (err) {
        debug.error('write file', tempFile);
        debug.error('write error', err.message);
        complete(err);
    }).on('close', complete);
};


