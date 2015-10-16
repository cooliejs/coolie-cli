/*!
 * 文件合并
 * @author ydr.me
 * @create 2015-06-08 23:12
 */


'use strict';

var fse = require('fs-extra');
var path = require('ydr-utils').path;
var pathURI = require('./path-uri.js');
var htmlAttr = require('./html-attr.js');
var cssminify = require('./cssminify.js');
var jsminify = require('./jsminify.js');
var sign = require('./sign.js');
var log = require('./log.js');
var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
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
    var deps = {};

    dato.each(htmlMatches, function (index, tag) {
        var source = htmlAttr.get(tag, rule.attr);

        if (typeis.boolean(source)) {
            return;
        }

        var matchFile;

        if (pathURI.isRelativeRoot(source)) {
            matchFile = path.join(configs.srcDirname, source);
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
    var srcPath = path.join(type === 'css' ? configs.srcCSSDirname : configs.srcJSDirname, srcName);
    var srcRelative = pathURI.relative(configs.srcDirname, srcPath);
    var url = pathURI.toURIPath(srcRelative);
    var destPath = path.join(configs.destDirname, srcRelative);
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

        var relative = pathURI.relative(configs.srcDirname, f);
        var uri = pathURI.toURIPath(relative);

        urls.push(uri);

        if (type === 'css') {
            var cssInfo = cssminify(f, code, destPath);
            code = cssInfo.code;
            deps[uri] = cssInfo.deps;
        } else {
            code = jsminify(f, code, null);
        }

        bufferList.push(new Buffer('\n' + code, 'utf8'));
    });

    var newCode = sign(type) + Buffer.concat(bufferList).toString();

    try {
        fse.outputFileSync(destPath, newCode);
    } catch (err) {
        log("write file", pathURI.toSystemPath(destPath), "error");
        log('write error', err.message, 'error');
        process.exit(1);
    }

    log('√', pathURI.toRootURL(destPath, configs.srcDirname), 'success');

    return (configs._concatMap[md5List] = {
        srcName: srcName,
        srcPath: srcPath,
        destPath: destPath,
        url: url,
        urls: urls,
        file: file,
        type: type,
        files: files,
        replace: type === 'css' ? '<link rel="stylesheet" href="' + pathURI.joinURI(configs.dest.host, url) + '">' :
        '<script src="' + pathURI.joinURI(configs.dest.host, url) + '"></script>',
        deps: deps
    });
};

