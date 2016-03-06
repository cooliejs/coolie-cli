/**
 * 文件描述
 * @author ydr.me
 * @create 2016-02-25 14:45
 */


'use strict';


var request = require('ydr-utils').request;
var dato = require('ydr-utils').dato;
var path = require('ydr-utils').path;
var log = require('ydr-utils').log;
var debug = require('ydr-utils').debug;
var controller = require('ydr-utils').controller;
var typeis = require('ydr-utils').typeis;
var random = require('ydr-utils').random;
var fse = require('fs-extra');
var AdmZip = require('adm-zip');
var os = require('os');

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
    options = dato.extend({}, defaults, options);

    if (!typeis.Function(callback)) {
        callback = function () {
        };
    }

    //log.success(options);
    var url = path.joinURI(options.git, options.registry, options.repository, 'archive', options.branch + '.zip');
    debug.ignore('git clone', url);
    console.loading();
    var tempFile = path.join(os.tmpdir(), random.guid());
    var filename = options.repository + '-' + options.branch;
    var unzipPath = path.join(options.dirname, filename);
    var ws = fse.createWriteStream(tempFile);
    var complete = controller.once(function (err) {
        console.loadingEnd();

        if (err) {
            callback(err);
            return remoteTempfile();
        }

        debug.ignore('unzip', path.toSystem(tempFile));

        try {
            var zip = new AdmZip(tempFile);
            zip.extractAllTo(options.dirname, true);
            debug.success(options.repository, path.toSystem(unzipPath));
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
        debug.error('write file', path.toSystem(tempFile));
        debug.error('write error', err.message);
        complete(err);
    }).on('close', complete);
};


