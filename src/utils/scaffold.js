/**
 * 脚手架生命周期管理
 * @author ydr.me
 * @create 2017-06-13 11:29
 * @update 2017-06-13 11:29
 */


'use strict';

var fse = require('fs-extra');
var path = require('path');

var gitDownload = require('./git-download');

/**
 * 脚手架创建与销毁
 * @param name {String} 脚手架名称
 * @param callback {Function} 回调
 */
module.exports = function (name, callback) {
    gitDownload({
        alias: 'scaffold ' + name,
        repository: 'coolie-scaffold-' + name
    }, function (err, options) {
        if (err) {
            return callback(err);
        }

        options.empty = function () {
            try {
                fse.removeSync(
                    path.join(options.dirname, options.filename)
                );
            } catch (err) {
                // ignore
            }
        };
        callback(err, options);
    });
};



