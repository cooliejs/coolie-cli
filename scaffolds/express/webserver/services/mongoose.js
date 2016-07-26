/**
 * mongoose 连接
 * @author ydr.me
 * @create 2014-11-22 12:35
 */

'use strict';


var mongoose = require('mongoose');
var fun = require('blear.utils.function');
var console = require('blear.node.console');

var configs = require('../../configs.js');

module.exports = function (next) {
    var complete = fun.once(function (err) {
        if (err) {
            err.mongodbURL = configs.mongodb;
        }

        next(err);
    });

    mongoose.connect(configs.mongodb);
    mongoose.connection.on('connected', function () {
        console.log('connected mongodb success');
        complete();
    });
    mongoose.connection.on('error', complete);
    mongoose.connection.on('disconnected', function () {
        var err = new Error('disconnected mongodb');
        complete(err);
    });
};


