/**
 * mongoose 连接
 * @author ydr.me
 * @create 2014-11-22 12:35
 */

'use strict';

var configs = require('../../configs.js');

// mongoose
var mongoose = require('mongoose');

module.exports = function (next) {
    mongoose.connect(configs.mongodb.url);
    mongoose.connection
        .on('connected', next)
        .on('error', next)
        .on('disconnected', next);
};


