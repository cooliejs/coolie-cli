/**
 * 获取模块列表版本
 * @author ydr.me
 * @create 2016-01-13 16:32
 */


'use strict';


var plan = require('blear.utils.plan');
var collection = require('blear.utils.collection');
var access = require('blear.utils.access');
var console = require('blear.node.console');
var request = require('blear.node.request');
var string = require('blear.utils.string');
var typeis = require('blear.utils.typeis');
var urlUtils = require('blear.utils.url');

var MODULE_REGISTRY_MAP = {
    npm: 'https://registry.npmjs.com',
    taobao: 'https://registry.npm.taobao.org',
    cnpm: 'https://registry.cnpmjs.org'
};
var DEFAULT_REGISTRY = 'taobao';


/**
 * 获取模块列表版本
 * @param modules
 * @param callback
 */
var getModulesVersion = function (modules, callback) {
    plan
        .each(modules, function (index, dep, next) {
            getLatestVersion(dep, function (err, version) {
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

// =========================


/**
 * 获取模块的最新版本
 * @param moduleName {String|Object} 模块名称
 * @param callback {Function} 回调
 */
function getLatestVersion(moduleName, callback) {
    var moduleMeta = {};

    if (typeis.String(moduleName)) {
        moduleMeta = {
            name: moduleName,
            registry: DEFAULT_REGISTRY
        };
    } else {
        moduleMeta = moduleName;
    }

    var url = MODULE_REGISTRY_MAP[moduleMeta.registry || DEFAULT_REGISTRY];

    if (!url) {
        url = MODULE_REGISTRY_MAP[DEFAULT_REGISTRY];
    }

    url = urlUtils.join(url, '${moduleName}/latest');
    url = string.assign(url, {
        moduleName: moduleMeta.name
    });

    request({
        url: url
    }, function (err, body) {
        if (err) {
            return callback(err);
        }

        var ret = {};

        try {
            ret = JSON.parse(body);
        } catch (ex) {
            err = new Error('parse response body error');
        }

        if (err) {
            return callback(err);
        }

        if (ret.error) {
            err = new Error(ret.reason);
        }

        if (err) {
            return callback(err);
        }

        callback(null, ret.version, ret);
    });
}

