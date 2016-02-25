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

var defaults = {
    git: 'https://github.com',
    registry: 'expressjs',
    repository: 'coolie-demo1',
    branch: 'master'
};


/**
 * 克隆代码
 * @param options {Object}
 * @param options.git {String} git 地址
 * @param options.registry {String} 仓库名称
 * @param options.repository {String} 代码库
 * @param [options.branch=master] {String} 分支
 */
module.exports = function (options) {
    options = dato.extend({}, defaults, options);

    log.success(options);
    // https://github.com/expressjs/express/archive/master.zip
    // https://github.com/expressjs/express/archive/3.x.zip
    var url = path.joinURI(options.git, options.registry, options.repository, 'archive', options.branch + '.zip');
    log.success('git clone', url);
};


