/**
 * 获取模块列表版本
 * @author ydr.me
 * @create 2016-01-13 16:32
 */


'use strict';


var howdo = require('howdo');
var dato = require('ydr-utils').dato;
var npm = require('ydr-utils').npm;
var allocation = require('ydr-utils').allocation;


/**
 * 获取模块列表版本
 * @param modules
 * @param callback
 */
var getModulesVersion = function (modules, callback) {
    howdo
        .each(modules, function (index, dep, done) {
            npm.getLatestVersion(dep, function (err, version) {
                done(err, version);
            });
        })
        .together()
        .try(function () {
            var args = allocation.args(arguments);
            var deps = {};

            dato.each(args, function (index, version) {
                var name = modules[index];
                deps[name] = version;
            });

            callback(null, deps);
        })
        .catch(callback);
};


module.exports = getModulesVersion;