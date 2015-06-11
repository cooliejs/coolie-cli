/*!
 * create-config.js
 * @author ydr.me
 * @create 2014-10-23 22:13
 */


"use strict";

var path = require("path");
var fs = require("fs-extra");
var log = require("./log.js");
var pathURI = require("./path-uri.js");
var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
var coolieConfigJSFile;
var REG_FUNCTION_START = /^function\s*?\(\s*\)\s*\{/;
var REG_FUNCTION_END = /}$/;
var coolieConfig = {};
var callbacks = [];
var coolieFn = function () {
    var coolie = {
        config: function (cnf) {
            cnf = cnf || {};

            config.base = cnf.base || '';
            config.version = cnf.version || '';
            config.host = cnf.host || '';

            return coolie;
        },
        use: function () {
            return coolie;
        },
        callback: function (fn) {
            if (typeof(fn) === 'function') {
                callbacks.push(fn);
            }

            return coolie;
        }
    };
};

/**
 * 解析 config
 * @param srcPath 起始目录
 * @returns {Object}
 */
module.exports = function (srcPath) {
    var file = path.join(srcPath, "./coolie.json");
    var config = {};
    var check = {};

    // 检查文件
    check.file = function () {
        if (typeis(file) === "string") {
            try {
                config = fs.readFileSync(file);

                try {
                    config = JSON.parse(config);
                } catch (err) {
                    log("parse config", "coolie.json JSON parse error", "error");
                    console.log(err);
                    process.exit();
                }
            } catch (err) {
                log("read config", err.message, "error");
                process.exit();
            }
        }
    };


    // 检查 js 路径
    // js: {
    //    src: [],
    //    coolie-config.js: "",
    //    dest: ""
    // }
    check.js = function () {
        if (typeis(config.js) !== "object" && typeis(config.js) !== 'undefined') {
            log("parse config", "`css` property must be an object", "error");
            process.exit();
        }

        if (typeis.undefined(config.js)) {
            config._noJS = true;
            config.js = {
                src: []
            };

            return;
        }

        // js.src
        if (config.js.src) {
            var htmlPathType = typeis(config.js.src);

            if (htmlPathType !== "string" && htmlPathType !== "array") {
                log("parse config", "`js.src` property must be a string path or an array", "error");
                process.exit();
            }

            if (htmlPathType === "array") {
                config.js.src.forEach(function (mn, index) {
                    if (typeis(mn) !== "string") {
                        log("parse config", "`js.src[" + index + "]` must be a string", "error");
                        process.exit();
                    }
                });
            } else {
                config.js.src = [config.js.src];
            }
        } else {
            config.js.src = [];
        }

        // js[coolie-config.js]
        if (!config.js["coolie-config.js"]) {
            log("parse config", 'js must have `coolie-config.js` property', "error");
            process.exit();
        }

        if (typeis(config.js["coolie-config.js"]) !== "string") {
            log("parse config", "`js[coolie-config.js]` property must be a string", "error");
            process.exit();
        }

        coolieConfigJSFile = path.join(srcPath, config.js["coolie-config.js"]);

        if (!typeis.file(coolieConfigJSFile)) {
            log("parse config", coolieConfigJSFile +
                "\nis NOT a file", "error");
            process.exit();
        }

        // js.dest
        if (typeis(config.js.dest) !== 'string') {
            log("parse config", "`js.dest` property must be a string path", "error");
            process.exit();
        }
    };


    // 检查 coolie-config.js 内的 base 路径
    // base 路径必须在 coolie-config.js 以内，否则在构建之后的 main 会指向错误
    check.coolieConfigJS = function () {
        var code;

        if (config._noJS) {
            return;
        }

        try {
            code = fs.readFileSync(coolieConfigJSFile, 'utf8');
        } catch (err) {
            log("read file", pathURI.toSystemPath(coolieConfigJSFile), "error");
            log("read file", err.message, "error");
            process.exit();
        }

        var coolieString = coolieFn.toString()
            .replace(REG_FUNCTION_START, '')
            .replace(REG_FUNCTION_END, '');
        /* jshint evil: true */
        var fn = new Function('config, callbacks', coolieString + code);
        var basePath;

        try {
            fn(coolieConfig, callbacks);
            basePath = coolieConfig.base;
            //basePath = path.join(path.dirname(config.js['coolie.js']), coolieConfig.base);
        } catch (err) {
            log("parse config", pathURI.toSystemPath(file), "error");
            log("parse config", err.message, "error");
            process.exit();
        }

        try {
            basePath = path.join(path.dirname(coolieConfigJSFile), basePath);
        } catch (err) {
            log("parse config", pathURI.toSystemPath(file), "error");
            log("parse config", err.message, "error");
            process.exit();
        }

        var toBase = path.relative(srcPath, basePath);

        if (toBase.indexOf('../') > -1) {
            log('coolie base', 'coolie base path must be under ' + srcPath +
                '\nbut now is ' + basePath, 'error');
            process.exit();
        }
    };


    // 检查 html
    // html: {
    //     src: [],
    //     minify: true
    // }
    check.html = function () {
        if (typeis(config.html) !== "object") {
            log("parse config", "`html` property must be an object", "error");
            process.exit();
        }

        // html.src
        if (config.html.src) {
            var htmSrcType = typeis(config.html.src);

            if (htmSrcType !== "string" && htmSrcType !== "array") {
                log("parse config", "`html.src` property must be a string path or an array", "error");
                process.exit();
            }

            if (htmSrcType === "array") {
                config.html.src.forEach(function (mn, index) {
                    if (typeis(mn) !== "string") {
                        log("parse config", "`html.src[" + index + "]` must be a string path", "error");
                        process.exit();
                    }
                });
            } else {
                config.html.src = [config.html.src];
            }
        } else {
            config.html.src = [];
        }

        // html.minify
        var htmlMinifyType = typeis(config.html.minify);

        if (htmlMinifyType === 'undefined') {
            config.html.minify = true;
            htmlMinifyType = 'boolean';
        }

        if (htmlMinifyType !== 'boolean') {
            log("parse config", "`html.minify` property must be a boolean", "error");
            process.exit();
        }
    };


    // 检查 css 配置
    // css: {
    //    dest: "",
    //    minify: {}
    // }
    check.css = function () {
        if (typeis(config.css) !== "object") {
            log("parse config", "`css` property must be an object", "error");
            process.exit();
        }

        // css.dest
        if (typeis(config.css.dest) !== 'string') {
            log("parse config", "`css.dest` property must be a string path", "error");
            process.exit();
        }

        if(typeis.undefined(config.css.minify) === true){
            config.css.minify = {
                compatibility: 'ie7'
            };
        }

        // css.minify
        if (!typeis.undefined(config.css.minify) && !typeis.object(config.css.minify)) {
            log("parse config", "`css.minify` must be an object or a boolean value", "error");
            process.exit();
        }
    };


    // 检查 resource 路径
    // resource: {
    //     dest: "",
    // }
    check.resource = function () {
        if (!typeis.object(config.resource)) {
            log("parse config", "`resource` property must be an object", "error");
            process.exit();
        }

        // resource.dest
        if (!typeis.string(config.resource.dest)) {
            log("parse config", "`resource.dest` property must be a string path", "error");
            process.exit();
        }
    };


    // 检查 dest 路径
    // dest: {
    //     dirname: "",
    //     host: ""
    // }
    check.dest = function () {
        if (!typeis.object(config.dest)) {
            log("parse config", "`dest` property must be an object", "error");
            process.exit();
        }

        if (!typeis.string(config.dest.dirname)) {
            log("parse config", "`dest.dirname` property must be a direction name", "error");
            process.exit();
        }

        config.dest.host = config.dest.host || '';

        if (!typeis.string(config.dest.host)) {
            log("parse config", "`dest.host` property must be an URL string", "error");
            process.exit();
        }

        if (config.dest.host.slice(-1) !== '/') {
            config.dest.host += '/';
        }
    };


    // 检查复制
    check.copy = function () {
        if (config.copy) {
            var copyFilesType = typeis(config.copy);

            if (copyFilesType !== "string" && copyFilesType !== "array") {
                log("parse config", "`copy` property must be a string path or an array path", "error");
                process.exit();
            }

            if (copyFilesType === "array") {
                config.copy.forEach(function (cp, index) {
                    if (typeis(cp) !== "string") {
                        log("parse config", "`copy` property[" + index + "] must be a string path", "error");
                        process.exit();
                    }
                });
            } else {
                config.copy = [config.copy];
            }
        } else {
            config.copy = [];
        }
    };


    check.file();
    check.js();
    check.coolieConfigJS();
    check.html();
    check.css();
    check.resource();
    check.dest();
    check.copy();

    return config;
};