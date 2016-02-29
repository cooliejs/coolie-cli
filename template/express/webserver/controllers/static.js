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
    etag: true,
    extensions: ['html'],
    index: false,
    maxAge: '30d',
    redirect: true
});


