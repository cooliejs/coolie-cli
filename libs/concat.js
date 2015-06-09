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
var cssminify = require('./cssminify.js');
var jsminify = require('./jsminify.js');
var sign = require('./sign.js');
var log = require('./log.js');
var dato = require('ydr-utils').dato;
var encryption = require('ydr-utils').encryption;
var ruleMap = {
    css: {
        reg: /<link\b[^>]*>/gi,
        attr: 'href'
    },
    js: {
        reg: /<script\b[^>]*>[\s\S]*?<\/script>/gi,
        attr: 'src'
    }
};


/**
 * 合并 css、js
 * @param file {String} 文件地址
 * @param html {String} html 片段
 * @returns {*}
 */
module.exports = function (file, html) {
    var type = ruleMap.css.reg.test(html) ? 'css' : 'js';
    var configs = global.configs;
    var rule = ruleMap[type];
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

    if (configs._concatMap[md5List]) {
        return configs._concatMap[md5List];
    }

    var srcName = encryption.md5(md5List) + '.' + type;
    var srcPath = path.join(type === 'css' ? configs._cssPath : configs._jsPath, srcName);
    var srcRelative = path.relative(configs._srcPath, srcPath);
    var url = configs.dest.host + pathURI.toURIPath(srcRelative);
    var destPath = path.join(configs._destPath, srcRelative);
    var bufferList = [];
    var urls = [];

    files.forEach(function (f) {
        var code;

        try {
            code = fse.readFileSync(f, 'utf8')
        } catch (err) {
            log("concat", pathURI.toSystemPath(file), "error");
            log("read file", pathURI.toSystemPath(f), "error");
            log('read file', err.message, 'error');
            process.exit();
        }

        if (type === 'css') {
            code = cssminify(f, code, destPath);
        } else {
            code = jsminify(f, code);
        }

        bufferList.push(new Buffer('\n' + code, 'utf8'));

        var relative = path.relative(configs._srcPath, file);

        urls.push(configs.dest.host + pathURI.toURIPath(relative));
    });

    var newCode = sign(type) + Buffer.concat(bufferList).toString();

    try {
        fse.outputFileSync(destPath, newCode);
    } catch (err) {
        log("write file", pathURI.toSystemPath(destPath), "error");
        log('write file', err.message, 'error');
        process.exit();
    }

    log('√', pathURI.toSystemPath(destPath), 'success');

    return configs._concatMap[md5List] = {
        srcName: srcName,
        srcPath: srcPath,
        destPath: destPath,
        url: url,
        urls: urls,
        file: file,
        type: type,
        files: files,
        replace: type === 'css'
            ? '<link rel="stylesheet" href="' + url + '">'
            : '<script src="' + url + '"></script>'
    };
};

