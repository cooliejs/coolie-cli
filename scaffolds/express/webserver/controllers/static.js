/**
 * static
 * @author ydr.me
 * @create 2016-01-20 11:44
 */


'use strict';

var express = require('express');
var path = require('blear.node.path');


var configs = require('../../configs.js');

var staticPath = path.join(configs.webroot, 'static');
module.exports = express.static(staticPath, {
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


