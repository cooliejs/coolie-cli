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
var fse = require('fs-extra');

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
    // https://github.com/expressjs/express/archive/master.zip
    // https://github.com/expressjs/express/archive/3.x.zip
    var url = path.joinURI(options.git, options.registry, options.repository, 'archive', options.branch + '.zip');
    //log.success('git clone', url);
    var filename = options.repository + '-' + options.branch + '.zip';
    var filepath = path.join(options.dirname, filename);
    var ws = fse.createWriteStream(filepath);
    var complete = controller.once(callback);

    request({
        url: url,
        encoding: 'binary',
        debug: false
    }).on('error', function (err) {
        debug.error('git clone', err.message);
        complete(err);
    }).on('close', complete).pipe(ws).on('error', function (err) {
        debug.error('write file', path.toSystem(filepath));
        debug.error('write error', err.message);
        complete(err);
    }).on('close', complete);
};


