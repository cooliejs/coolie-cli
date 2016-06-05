/**
 * static
 * @author ydr.me
 * @create 2016-01-20 11:44
 */


'use strict';

var express = require('express');


var configs = require('../../configs.js');


module.exports = express.static(configs.webroot, {
    dotfiles: 'ignore',
    etag: configs.env !== 'local',
    extensions: ['html'],
    index: false,
    maxAge: '30d',
    redirect: true,
    lastModified: false,
    setHeaders: function (res) {
        if (configs.env !== 'local') {
            return;
        }

        res.setHeader('cache-control', 'no-cache');
    }
});


