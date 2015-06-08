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
        var matchFile;

        if (pathURI.isRelativeRoot(source)) {
            matchFile = path.join(configs._srcPath, source);
        } else {
            matchFile = path.join(fileDirname, source);
        }

        files.push(matchFile);
        md5List += encryption.etag(matchFile);
    }

    if (matchedMap[md5List]) {
        return matchedMap[md5List];
    }

    var srcName = encryption.md5(md5List) + '.' + options.type;
    var srcPath = path.join(configs._jsPath, srcName);
    var url = configs.dest.host + pathURI.toURIPath(path.relative(configs._srcPath, srcPath));
    var destPath = path.join(configs._destPath, srcPath);

    matchedMap[md5List] = map[srcName] = {
        srcName: srcName,
        srcPath: srcPath,
        destPath: destPath,
        url: url,
        file: file,
        type: options.type,
        files: files
    };

    return map;
};

