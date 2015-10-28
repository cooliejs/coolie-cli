/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-26 14:27
 */


'use strict';


var fse = require('fs-extra');
var path = require('ydr-utils').path;
var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
var debug = require('ydr-utils').debug;

var pathURI = require('../utils/path-uri.js');
var hook = require('../utils/hook.js');
var guessDirname = require('../utils/guess-dirname.js');

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
 * @param options {Object} 配置
 * @param options.srcDirname {Object} coolie.config.js 路径
 * @returns {Object}
 */
module.exports = function (options) {
    var srcDirname = options.srcDirname;
    var srcCoolieConfigJSPath = path.join(srcDirname, './coolie.config.js');
    var srcCoolieJSONPath = path.join(srcDirname, './coolie.json');
    var config = {};
    var check = {};
    var coolie = {
        config: function (_config) {
            config = _config;
        }
    };

    // 检查文件
    check.file = function () {
        if (typeis.file(srcCoolieConfigJSPath)) {
            require(srcCoolieConfigJSPath)(coolie);
        } else {
            debug.warn('coolie tips', 'you can use `coolie.config.js` to replace `coolie.json`');

            if (!typeis.file(srcCoolieJSONPath)) {
                debug.error('coolie.json', path.toSystem(srcCoolieJSONPath) + '\nis NOT a file');
                return process.exit(1);
            }

            try {
                var configCode = fse.readFileSync(srcCoolieJSONPath, 'utf8');

                try {
                    config = JSON.parse(configCode);
                } catch (err) {
                    debug.error('read coolie.json', path.toSystem(srcCoolieJSONPath));
                    debug.error('parse coolie.json', '`coolie.json` parse error');
                    debug.error('parse coolie.json', err.message);
                    return process.exit(1);
                }
            } catch (err) {
                debug.error('read coolie.json', path.toSystem(srcCoolieJSONPath));
                debug.error('read coolie.json', err.message);
                return process.exit(1);
            }
        }
    };


    // 检查 js 路径
    // js: {
    //    main: [],
    //    coolie-config.js: '',
    //    dest: ''
    //    chunk: []
    // }
    check.js = function () {
        if (typeis(config.js) !== 'object') {
            debug.error('parse coolie.config', '`js` property must be an object');
            process.exit(1);
        }

        if (config.js.src) {
            debug.error('parse coolie.config', 'please change `js.src` to `js.main`');
            process.exit(1);
        }

        // js.main
        if (config.js.main) {
            var mainPathType = typeis(config.js.main);

            if (mainPathType !== 'string' && mainPathType !== 'array') {
                debug.error('parse coolie.config', '`js.main` property must be a string path or an array');
                process.exit(1);
            }

            if (mainPathType === 'array') {
                config.js.main.forEach(function (mn, index) {
                    if (typeis(mn) !== 'string') {
                        debug.error('parse coolie.config', '`js.main[' + index + ']` must be a string');
                        process.exit(1);
                    }
                });
            } else {
                config.js.main = [config.js.main];
            }
        } else {
            config.js.main = [];
        }

        // js[coolie-config.js]
        if (config.js['coolie-config.js']) {
            if (typeis(config.js['coolie-config.js']) !== 'string') {
                debug.error('parse coolie.config', '`js[coolie-config.js]` property must be a string');
                process.exit(1);
            }

            coolieConfigJSFile = path.join(srcDirname, config.js['coolie-config.js']);

            if (!typeis.file(coolieConfigJSFile)) {
                debug.error('parse coolie.config', coolieConfigJSFile +
                    '\nis NOT a file');
                process.exit(1);
            }
        } else {
            config._noCoolieJS = true;
        }

        // js.dest
        if (typeis(config.js.dest) !== 'string') {
            debug.error('parse coolie.config', '`js.dest` property must be a string path');
            process.exit(1);
        }

        // js.chunk
        if (config.js.chunk) {
            var chunkPathType = typeis(config.js.chunk);

            if (chunkPathType !== 'string' && chunkPathType !== 'array') {
                debug.error('parse coolie.config', '`js.chunk` property must be a string path or an array');
                process.exit(1);
            }

            if (chunkPathType === 'array') {
                config.js.chunk.forEach(function (mn, index) {
                    if (!typeis.string(mn) && !typeis.array(mn)) {
                        debug.error('parse coolie.config', '`js.chunk[' + index + ']` must be a string or an array');
                        process.exit(1);
                    }
                });
            } else {
                config.js.chunk = [config.js.chunk];
            }
        } else {
            config.js.chunk = [];
        }
    };

    // 检查 coolie-config.js 内的 base 路径
    // base 路径必须在 coolie-config.js 以内，否则在构建之后的 main 会指向错误
    check._coolieConfigJS = function () {
        var code;

        try {
            code = fse.readFileSync(coolieConfigJSFile, 'utf8');
        } catch (err) {
            debug.error('parse coolie.config', path.toSystem(coolieConfigJSFile));
            debug.error('read file', path.toSystem(coolieConfigJSFile));
            debug.error('read file', err.message);
            process.exit(1);
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
            debug.error('parse coolie.config', path.toSystem(srcCoolieJSONPath));
            debug.error('parse coolie.config', err.message);
            process.exit(1);
        }

        var coolieConfigJSDir = path.dirname(coolieConfigJSFile);

        try {
            basePath = path.join(coolieConfigJSDir, basePath);
        } catch (err) {
            debug.error('parse coolie.config', path.toSystem(srcCoolieJSONPath));
            debug.error('parse coolie.config', err.message);
            process.exit(1);
        }

        var toBase = path.relative(srcDirname, basePath);

        if (toBase.indexOf('../') > -1) {
            debug.error('coolie base', 'coolie base path must be under ' + srcDirname +
                '\nbut now is ' + basePath, 'error');
            process.exit(1);
        }

        config.srcCoolieConfigBaseDirname = basePath;
        var relativeBase = path.relative(srcDirname, config.srcCoolieConfigBaseDirname);
        config.destCoolieConfigBaseDirname = path.join(config.destDirname, relativeBase);
    };


    // 检查 html
    // html: {
    //     src: [],
    //     minify: true
    // }
    check.html = function () {
        if (typeis(config.html) !== 'object') {
            debug.error('parse coolie.config', '`html` property must be an object');
            process.exit(1);
        }

        // html.src
        if (config.html.src) {
            var htmSrcType = typeis(config.html.src);

            if (htmSrcType !== 'string' && htmSrcType !== 'array') {
                debug.error('parse coolie.config', '`html.src` property must be a string path or an array');
                process.exit(1);
            }

            if (htmSrcType === 'array') {
                config.html.src.forEach(function (mn, index) {
                    if (typeis(mn) !== 'string') {
                        debug.error('parse coolie.config', '`html.src[' + index + ']` must be a string path');
                        process.exit(1);
                    }
                });
            } else {
                config.html.src = [config.html.src];
            }
        } else {
            config.html.src = [];
        }

        // html.minify
        if (typeis.undefined(config.html.minify) !== false) {
            config.html.minify = true;
        }
    };


    // 检查 css 配置
    // css: {
    //    dest: '',
    //    minify: {}
    // }
    check.css = function () {
        if (typeis(config.css) !== 'object') {
            debug.error('parse coolie.config', '`css` property must be an object');
            process.exit(1);
        }

        // css.dest
        if (typeis(config.css.dest) !== 'string') {
            debug.error('parse coolie.config', '`css.dest` property must be a string path');
            process.exit(1);
        }

        if (typeis.undefined(config.css.minify) === true) {
            config.css.minify = {
                compatibility: 'ie7'
            };
        }

        // css.minify
        if (!typeis.undefined(config.css.minify) && !typeis.object(config.css.minify)) {
            debug.error('parse coolie.config', '`css.minify` must be an object or a boolean value');
            process.exit(1);
        }
    };


    // 检查 resource 路径
    // resource: {
    //     dest: '',
    //     minify: true
    // }
    check.resource = function () {
        if (!typeis.object(config.resource)) {
            debug.error('parse coolie.config', '`resource` property must be an object');
            process.exit(1);
        }

        // resource.dest
        if (!typeis.string(config.resource.dest)) {
            debug.error('parse coolie.config', '`resource.dest` property must be a string path');
            process.exit(1);
        }

        if (typeis.undefined(config.resource.minify) !== false) {
            config.resource.minify = true;
        }
    };


    // 检查 dest 路径
    // dest: {
    //     dirname: '',
    //     host: ''
    //     versionLength: 32
    // }
    check.dest = function () {
        if (!typeis.object(config.dest)) {
            debug.error('parse coolie.config', '`dest` property must be an object');
            process.exit(1);
        }

        if (!typeis.string(config.dest.dirname)) {
            debug.error('parse coolie.config', '`dest.dirname` property must be a direction name');
            process.exit(1);
        }

        config.destDirname = path.join(srcDirname, config.dest.dirname);
        config.destJSDirname = path.join(config.destDirname, config.js.dest);
        config.destCSSDirname = path.join(config.destDirname, config.css.dest);
        config.destResourceDirname = path.join(config.destDirname, config.resource.dest);
        config.dest.host = config.dest.host || '';

        if (!typeis.string(config.dest.host)) {
            debug.error('parse coolie.config', '`dest.host` property must be an URL string');
            process.exit(1);
        }

        if (config.dest.host.slice(-1) !== '/') {
            config.dest.host += '/';
        }

        config.dest.versionLength = config.dest.versionLength || 32;

        if (!config._noCoolieJS) {
            check._coolieConfigJS();
        }
    };


    // 检查复制
    check.copy = function () {
        if (config.copy) {
            var copyFilesType = typeis(config.copy);

            if (copyFilesType !== 'string' && copyFilesType !== 'array') {
                debug.error('parse coolie.config', '`copy` property must be a string path or an array path');
                process.exit(1);
            }

            if (copyFilesType === 'array') {
                config.copy.forEach(function (cp, index) {
                    if (typeis(cp) !== 'string') {
                        debug.error('parse coolie.config', '`copy` property[' + index + '] must be a string path');
                        process.exit(1);
                    }
                });
            } else {
                config.copy = [config.copy];
            }
        } else {
            config.copy = [];
        }
    };


    // 猜想 chunk 目录
    check.chunk = function () {
        var srcChunkDirname = guessDirname(srcDirname, 'chunk');
        var relative = path.relative(srcDirname, srcChunkDirname);

        config.destCoolieConfigChunkDirname = path.join(config.destDirname, relative);
    };

    // 猜想 async 目录
    check.async = function () {
        var srcAsyncDirname = guessDirname(srcDirname, 'async');
        var relative = path.relative(srcDirname, srcAsyncDirname);

        config.destCoolieConfigAsyncDirname = path.join(config.destDirname, relative);
    };


    check.file();
    check.js();
    check.html();
    check.css();
    check.resource();
    check.dest();
    check.copy();
    check.chunk();
    check.async();

    dato.extend(config, {
        srcDirname: srcDirname,
        srcCoolieConfigJSPath: srcCoolieConfigJSPath,
        srcCoolieJSONPath: srcCoolieJSONPath
    });

    return config;
};


