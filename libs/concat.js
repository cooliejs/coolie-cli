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
        reg: /<link\b[^>]*/gi,
        test: /<link\b/i,
        attr: 'href'
    },
    js: {
        reg: /<script\b[^>]*?>[\s\S]*?<\/script>/gi,
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
    var type = ruleMap.css.test.test(html) ? 'css' : 'js';
    var configs = global.configs;
    var rule = ruleMap[type];
    var fileDirname = path.dirname(file);
    var htmlMatches = html.match(rule.reg);
    var files = [];
    var md5List = '';

    dato.each(htmlMatches, function (index, tag) {
        var source = htmlAttr.get(tag, rule.attr);

        if (source === true || source === false) {
            return;
        }

        var matchFile;

        if (pathURI.isRelativeRoot(source)) {
            matchFile = path.join(configs._srcPath, source);
        } else {
            matchFile = path.join(fileDirname, source);
        }

        files.push(matchFile);
        md5List += encryption.etag(matchFile);
    });

    if (configs._concatMap[md5List]) {
        return configs._concatMap[md5List];
    }

    var srcName = encryption.md5(md5List).slice(0, configs.dest.versionLength) + '.' + type;
    var srcPath = path.join(type === 'css' ? configs._cssPath : configs._jsPath, srcName);
    var srcRelative = path.relative(configs._srcPath, srcPath);
    var url = pathURI.toURIPath(srcRelative);
    var destPath = path.join(configs._destPath, srcRelative);
    var bufferList = [];
    var urls = [];

    files.forEach(function (f) {
        var code;

        try {
            code = fse.readFileSync(f, 'utf8');
        } catch (err) {
            log("concat", pathURI.toSystemPath(file), "error");
            log("read file", pathURI.toSystemPath(f), "error");
            log('read file', err.message, 'error');
            process.exit(1);
        }

        if (type === 'css') {
            code = cssminify(f, code, destPath);
        } else {
            code = jsminify(f, code, null);
        }

        bufferList.push(new Buffer('\n' + code, 'utf8'));

        var relative = path.relative(configs._srcPath, f);

        urls.push(pathURI.toURIPath(relative));
    });

    var newCode = sign(type) + Buffer.concat(bufferList).toString();

    try {
        fse.outputFileSync(destPath, newCode);
    } catch (err) {
        log("write file", pathURI.toSystemPath(destPath), "error");
        log('write file', err.message, 'error');
        process.exit(1);
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
            ? '<link rel="stylesheet" href="' + pathURI.joinURI(configs.dest.host, url) + '">'
            : '<script src="' + pathURI.joinURI(configs.dest.host, url) + '"></script>'
    };
};

