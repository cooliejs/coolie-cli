/**
 * 获取 git repo 信息
 * @author ydr.me
 * @create 2016-03-06 10:59
 */


'use strict';

var request = require('ydr-utils').request;
var path = require('ydr-utils').path;

var pkg = require('../package.json');

var owner = pkg.coolie.owner;
var REPO_URL = 'https://api.github.com/repos';


/**
 * 获取 git repo 信息
 * @param repo
 * @param callback
 */
module.exports = function (repo, callback) {
    var url = path.joinURI(REPO_URL, owner, repo);

    request.get(url, function (err, body) {
        if(err){
            return callback(null, {});
        }

        var json = {};

        try {
            json = JSON.parse(body);
        } catch (err) {
            // ignore
        }

        callback(null, json);
    });
};




