/**
 * statical
 * @author ydr.me
 * @created 2016-12-17 13:15:16
 */


'use strict';

var express = require('express');
var path = require('blear.node.path');


var configs = require('../../configs.js');
var staticOptions = {
    dotfiles: 'ignore',
    etag: configs.env !== 'local',
    extensions: ['html'],
    index: false,
    maxAge: '30d',
    redirect: true,
    lastModified: false,
    setHeaders: function (res, _path, stat) {
        if (configs.env !== 'local') {
            return;
        }

        res.setHeader('cache-control', 'no-cache');
    }
};

/**
 * public 控制器
 * @returns {*}
 */
exports.public = function () {
    var publicDirname = path.join(configs.root, 'public');
    return express.static(publicDirname, staticOptions);
};

/**
 * webroot 控制器
 * @returns {*}
 */
exports.webroot = function () {
    var webrootDirname = path.join(configs.webroot);
    return express.static(webrootDirname, staticOptions);
};





