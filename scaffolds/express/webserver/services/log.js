/**
 * 日志
 * @author ydr.me
 * @create 2016-01-13 21:34
 */


'use strict';

var path = require('blear.node.path');
var log = require('blear.node.log');

var configs = require('../../configs.js');

module.exports = function (next) {
    log.manage({
        dirname: path.join(configs.root, 'logs')
    });

    next();
};




