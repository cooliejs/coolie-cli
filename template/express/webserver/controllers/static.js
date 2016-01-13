/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-13 14:58
 */


'use strict';

var express = require('express');

var configs = require('../../configs.js');

module.exports = function (app) {
    app.use('/', express.static(configs.webroot, {
        dotfiles: 'ignore',
        etag: true,
        extensions: ['html'],
        index: false,
        maxAge: '30d',
        redirect: true
    }));
};


