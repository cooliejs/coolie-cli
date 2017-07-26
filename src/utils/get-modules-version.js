/**
 * 获取模块列表版本
 * @author ydr.me
 * @create 2016-01-13 16:32
 */


'use strict';


var plan = require('blear.utils.plan');
var collection = require('blear.utils.collection');
var npm = require('ydr-utils').npm;
var access = require('blear.utils.access');
var console = require('blear.node.console');


/**
 * 获取模块列表版本
 * @param modules
 * @param callback
 */
var getModulesVersion = function (modules, callback) {
    plan
        .each(modules, function (index, dep, next) {
            npm.getLatestVersion(dep, function (err, version) {
                next(err, version);
            });
        })
        .parallel()
        .try(function () {
            var args = access.args(arguments);
            var deps = {};

            collection.each(args, function (index, version) {
                var name = modules[index];
                deps[name] = version;
            });

            callback(null, deps);
        })
        .catch(callback);
};


module.exports = getModulesVersion;