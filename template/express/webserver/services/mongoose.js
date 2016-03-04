/**
 * mongoose 连接
 * @author ydr.me
 * @create 2014-11-22 12:35
 */

'use strict';


var mongoose = require('mongoose');
var controller = require('ydr-utils').controller;

var configs = require('../../configs.js');

module.exports = function (next) {
    var complete = controller.once(function (err) {
        next(err);
    });

    mongoose.connect(configs.mongodb);
    mongoose.connection.on('connected', complete);
    mongoose.connection.on('error', function (err) {
        err.mongodbUrl = configs.mongodb;
        complete(err);
    });
    mongoose.connection.on('disconnected', function () {
        var err = new Error('disconnected mongodb');
        err.mongodbUrl = configs.mongodb;
        complete(err);
    });
};


