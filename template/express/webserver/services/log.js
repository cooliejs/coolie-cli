/**
 * 日志
 * @author ydr.me
 * @create 2016-01-13 21:34
 */


'use strict';

var path = require('ydr-utils').path;
var log = require('ydr-utils').log;
var request = require('ydr-utils').request;

var configs = require('../../configs.js');

module.exports = function (next) {
    log.config({
        whiteList: configs.logLevel
    });

    request.defaults.debug = configs.logLevel.indexOf('info') > -1;

    log.manage({
        dirname: path.join(configs.root, 'logs')
    });

    next();
};




