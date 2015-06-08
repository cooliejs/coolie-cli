/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-06-08 23:12
 */


'use strict';

var fse = require('fs-extra');
var path = require('path');
var pathURI = require('./path-uri.js');
var htmlAttr = require('./html-attr.js');
var dato = require('ydr-utils').dato;
var encryption = require('ydr-utils').encryption;
var ruleMap = {
    css: {
        reg: /<link\b[^>]*>/gi,
        attr: 'href'
        //extras: {
        //    rel: ['stylesheet']
        //}
    },
    js: {
        reg: /<script\b[^>]*>[\s\S]*?<\/script>/gi,
        attr: 'src'
        //extras: {
        //    type: [false, 'javascript', 'text/javascript', 'text/ecmascript', 'text/ecmascript-6',
        //        'application/javascript', 'application/ecmascript']
        //}
    }
};
var matchedMap = {};


module.exports = function (file, html, options) {
    var defaults = {
        type: 'css'
    };
    options = dato.extend(defaults, options);
    var configs = global.configs;
    var map = {};
    var rule = ruleMap[options.type];
    var fileDirname = path.dirname(file);
    var hrefMatches;
    var files = [];
    var md5List = '';

    while ((hrefMatches = rule.reg.exec(html))) {
        var tag = hrefMatches[0];
        var source = htmlAttr.get(tag, rule.attr);

        if (pathURI.isRelativeRoot(source)) {
            file = path.join(configs._srcPath, source);
        } else {
            file = path.join(fileDirname, source);
        }

        files.push(file);
        md5List += encryption.etag(file);
    }

    if (matchedMap[md5List]) {
        return matchedMap[md5List];
    }

    var fileName = encryption.md5(md5List);

    matchedMap[md5List] = map['filename'] = {
        name: fileName,
        url: url,
        file: file,
        type: options.type,
        files: files
    };

    return map;
};

