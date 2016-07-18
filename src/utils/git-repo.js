/**
 * 获取 git repo 信息
 * @author ydr.me
 * @create 2016-03-06 10:59
 */


'use strict';

var request = require('blear.node.request');
var url = require('blear.utils.url');
var console = require('blear.node.console');

var pkg = require('../../package.json');

var owner = pkg.coolie.owner;
var REPO_URL = 'https://api.github.com/repos';


/**
 * 获取 git repo 信息
 * @param repo
 * @param callback
 */
module.exports = function (repo, callback) {
    var url = url.join(REPO_URL, owner, repo);

    console.loading();
    request({
        method: 'get',
        url: url,
        debug: false
    }, function (err, body) {
        console.loadingEnd();
        
        if (err) {
            return callback(err);
        }

        var json = {};

        try {
            json = JSON.parse(body);
        } catch (err) {
            // ignore
        }

        if (!json.name && json.message) {
            return callback(new Error(json.message || 'Not Found'));
        }

        callback(null, json);
    });
};




