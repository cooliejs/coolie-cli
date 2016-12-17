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
 * static 控制器
 * @returns {*}
 */
exports.static = function () {
    var staticDirname = path.join(configs.webroot, 'static');
    return express.static(staticDirname, staticOptions);
};

/**
 * node_modules 控制器
 * @returns {*}
 */
exports.nodeModules = function () {
    var nodeModulesDirname = path.join(configs.webroot, 'node_modules');
    return express.static(nodeModulesDirname, staticOptions);
};




