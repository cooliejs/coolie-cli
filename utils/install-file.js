/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-31 15:12
 */


'use strict';
var path = require('path');
var fse = require('fs-extra');
var request = require('ydr-utils').request;
var typeis = require('ydr-utils').typeis;
var debug = require('ydr-utils').debug;

var pkg = require('../package.json');

var REG_VERSION = /^ \* @version ([\d.]+)/m;

/**
 * 下载文件
 * @param options {Object} 配置
 * @param options.url {String} 地址
 * @param options.destDirname {String} 目标地址
 * @param callback {Function} 回调
 */
module.exports = function (options, callback) {
    if (!typeis.function(callback)) {
        callback = function () {
            // ignore
        };
    }

    debug.success('install coolie', options.url);
    request.get({
        url: options.url,
        query: {
            _: Date.now()
        }
    }, function (err, body, res) {
        if (err) {
            debug.error('install coolie', options.url);
            debug.error('install coolie', err.message);
            return process.exit(1);
        }

        if (res.statusCode !== 200) {
            debug.error('install coolie', options.url);
            debug.error('install coolie', 'response status code is ' + res.statusCode);
            return process.exit(1);
        }

        var version = (body.match(REG_VERSION) || ['', '0.0.0'])[1];
        var writeFile = path.join(options.destDirname, './coolie.min-' + version + '.js');

        debug.success('coolie.js version', version);
        fse.outputFile(writeFile, body, function (err) {
            if (err) {
                debug.error('install coolie', options.url);
                debug.error('install coolie', err.message);
                return process.exit(1);
            }

            debug.success('install coolie', writeFile);
            callback(null, writeFile);
        });
    });
};
