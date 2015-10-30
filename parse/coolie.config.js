/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-26 14:27
 */


'use strict';


var fse = require('fs-extra');
var glob = require('glob');
var path = require('ydr-utils').path;
var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
var debug = require('ydr-utils').debug;

var pathURI = require('../utils/path-uri.js');
var htmlAttr = require('../utils/html-attr.js');
var hook = require('../utils/hook.js');
var copy = require('../utils/copy.js');
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
 * @param options.middleware {Object} 中间件
 * @returns {Object}
 */
module.exports = function (options) {
    var srcDirname = options.srcDirname;
    var srcCoolieConfigJSPath = path.join(srcDirname, './coolie.config.js');
    var srcCoolieJSONPath = path.join(srcDirname, './coolie.json');
    var configs = {};
    var check = {};
    var coolie = {};

    options.middleware.bindContext(coolie);

    /**
     * 配置 coolie 构建参数
     * @param _configs
     * @returns {{}}
     */
    coolie.config = function (_configs) {
        configs = _configs;
        return coolie;
    };


    /**
     * coolie 中间件
     * @param middleware {Function}
     * @returns {{coolie}}
     */
    coolie.use = function (middleware) {
        if (options.middleware) {
            if (!typeis.function(middleware)) {
                debug.warn('invalid middleware', 'some middleware is not a function');
                debug.warn('coolie tips', 'please install coolie middleware from NPM,\n' +
                    'all names are `coolie-*`');
            }

            if (!middleware.middlewareName) {
                debug.warn('invalid middleware', 'some middleware\'s name is missing');
                debug.warn('middleware', middleware.toString().slice(0, 140) + '\n...');
                debug.normal('coolie tips', 'please install coolie middleware (`coolie-*`) from NPM');
            }

            options.middleware.use(middleware);
        }

        return coolie;
    };

    /**
     * coolie 工具函数
     * @type {{getAbsolutePath: Function, getHTMLTagAttr: Function, setHTMLTagAttr: Function, copyResourceFile: Function}}
     */
    coolie.utils = {
        /**
         * 获取绝对路径
         * @param path {String} 相对路径
         * @param parentFile {String} 父级文件
         * @returns {string|null}
         */
        getAbsolutePath: function (path, parentFile) {
            var p = pathURI.toAbsoluteFile(path, parentFile, configs.srcDirname);

            return typeis.file(p) ? p : null;
        },

        /**
         * 获取 html 标签属性
         * @param attrName {String} 标签属性名
         * @param attrName {String} 标签名称
         * @returns {String}
         */
        getHTMLTagAttr: function (html, attrName) {
            return htmlAttr.get(html, attrName);
        },

        /**
         * 设置 html 标签属性
         * @param html {String} html 标签
         * @param attrName {String} 标签属性名
         * @param attrValue {String} 标签属性值
         * @returns {String}
         */
        setHTMLTagAttr: function (html, attrName, attrValue) {
            return htmlAttr.set(html, attrName, attrValue);
        },

        /**
         * 复制资源文件
         * @param srcResourcePath {String} 原始资源文件路径
         * @returns {String} 资源的 URI
         */
        copyResourceFile: function (srcResourcePath) {
            var destResourcePath = copy(srcResourcePath, {
                srcDirname: srcDirname,
                destDirname: configs.destResourceDirname,
                copyPath: false,
                version: true,
                versionLength: configs.dest.versionLength,
                minify: true,
                logType: 2
            });

            var destResourceURI = pathURI.toRootURL(destResourcePath, configs.destDirname);

            return pathURI.joinURI(configs.dest.host, destResourceURI);
        }
    };

    /**
     * coolie debug
     */
    coolie.debug = debug;

    // 检查文件
    check.file = function () {
        if (typeis.file(srcCoolieConfigJSPath)) {
            require(srcCoolieConfigJSPath)(coolie);
        } else {
            srcCoolieConfigJSPath = null;
            debug.warn('coolie tips', 'you can use `coolie.config.js` to replace `coolie.json`');

            if (!typeis.file(srcCoolieJSONPath)) {
                srcCoolieJSONPath = null;
                debug.error('coolie.json', path.toSystem(srcCoolieJSONPath) + '\nis NOT a file');
                return process.exit(1);
            }

            try {
                var configCode = fse.readFileSync(srcCoolieJSONPath, 'utf8');

                try {
                    configs = JSON.parse(configCode);
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
        if (typeis(configs.js) !== 'object') {
            debug.error('parse coolie.config', '`js` property must be an object');
            process.exit(1);
        }

        if (configs.js.src) {
            debug.error('parse coolie.config', 'please change `js.src` to `js.main`');
            process.exit(1);
        }

        // js.main
        if (configs.js.main) {
            var mainPathType = typeis(configs.js.main);

            if (mainPathType !== 'string' && mainPathType !== 'array') {
                debug.error('parse coolie.config', '`js.main` property must be a string path or an array');
                process.exit(1);
            }

            if (mainPathType === 'array') {
                configs.js.main.forEach(function (mn, index) {
                    if (typeis(mn) !== 'string') {
                        debug.error('parse coolie.config', '`js.main[' + index + ']` must be a string');
                        process.exit(1);
                    }
                });
            } else {
                configs.js.main = [configs.js.main];
            }
        } else {
            configs.js.main = [];
        }

        // js[coolie-config.js]
        if (configs.js['coolie-config.js']) {
            if (typeis(configs.js['coolie-config.js']) !== 'string') {
                debug.error('parse coolie.config', '`js[coolie-config.js]` property must be a string');
                process.exit(1);
            }

            coolieConfigJSFile = path.join(srcDirname, configs.js['coolie-config.js']);
            configs.srcCoolieConfigJSPath = coolieConfigJSFile;

            if (!typeis.file(coolieConfigJSFile)) {
                debug.error('parse coolie.config', coolieConfigJSFile +
                    '\nis NOT a file');
                process.exit(1);
            }
        } else {
            configs._noCoolieJS = true;
        }

        // js.dest
        if (typeis(configs.js.dest) !== 'string') {
            debug.error('parse coolie.config', '`js.dest` property must be a string path');
            process.exit(1);
        }

        // js.chunk
        if (configs.js.chunk) {
            var chunkPathType = typeis(configs.js.chunk);

            if (chunkPathType !== 'string' && chunkPathType !== 'array') {
                debug.error('parse coolie.config', '`js.chunk` property must be a string path or an array');
                process.exit(1);
            }

            if (chunkPathType === 'array') {
                configs.js.chunk.forEach(function (mn, index) {
                    if (!typeis.string(mn) && !typeis.array(mn)) {
                        debug.error('parse coolie.config', '`js.chunk[' + index + ']` must be a string or an array');
                        process.exit(1);
                    }
                });
            } else {
                configs.js.chunk = [configs.js.chunk];
            }
        } else {
            configs.js.chunk = [];
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

        configs.srcCoolieConfigBaseDirname = basePath;
        var relativeBase = path.relative(srcDirname, configs.srcCoolieConfigBaseDirname);
        configs.destCoolieConfigBaseDirname = path.join(configs.destDirname, relativeBase);
    };


    // 检查 html
    // html: {
    //     src: [],
    //     minify: true
    // }
    check.html = function () {
        if (typeis(configs.html) !== 'object') {
            debug.error('parse coolie.config', '`html` property must be an object');
            process.exit(1);
        }

        // html.src
        if (configs.html.src) {
            var htmSrcType = typeis(configs.html.src);

            if (htmSrcType !== 'string' && htmSrcType !== 'array') {
                debug.error('parse coolie.config', '`html.src` property must be a string path or an array');
                process.exit(1);
            }

            if (htmSrcType === 'array') {
                configs.html.src.forEach(function (mn, index) {
                    if (typeis(mn) !== 'string') {
                        debug.error('parse coolie.config', '`html.src[' + index + ']` must be a string path');
                        process.exit(1);
                    }
                });
            } else {
                configs.html.src = [configs.html.src];
            }
        } else {
            configs.html.src = [];
        }

        // html.minify
        if (typeis.undefined(configs.html.minify) !== false) {
            configs.html.minify = true;
        }
    };


    // 检查 css 配置
    // css: {
    //    dest: '',
    //    minify: {}
    // }
    check.css = function () {
        if (typeis(configs.css) !== 'object') {
            debug.error('parse coolie.config', '`css` property must be an object');
            process.exit(1);
        }

        // css.dest
        if (typeis(configs.css.dest) !== 'string') {
            debug.error('parse coolie.config', '`css.dest` property must be a string path');
            process.exit(1);
        }

        if (typeis.undefined(configs.css.minify) === true) {
            configs.css.minify = {
                compatibility: 'ie7'
            };
        }

        // css.minify
        if (!typeis.undefined(configs.css.minify) && !typeis.object(configs.css.minify)) {
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
        if (!typeis.object(configs.resource)) {
            debug.error('parse coolie.config', '`resource` property must be an object');
            process.exit(1);
        }

        // resource.dest
        if (!typeis.string(configs.resource.dest)) {
            debug.error('parse coolie.config', '`resource.dest` property must be a string path');
            process.exit(1);
        }

        if (typeis.undefined(configs.resource.minify) !== false) {
            configs.resource.minify = true;
        }
    };


    // 检查 dest 路径
    // dest: {
    //     dirname: '',
    //     host: ''
    //     versionLength: 32
    // }
    check.dest = function () {
        if (!typeis.object(configs.dest)) {
            debug.error('parse coolie.config', '`dest` property must be an object');
            process.exit(1);
        }

        if (!typeis.string(configs.dest.dirname)) {
            debug.error('parse coolie.config', '`dest.dirname` property must be a direction name');
            process.exit(1);
        }

        configs.destDirname = path.join(srcDirname, configs.dest.dirname);
        configs.destJSDirname = path.join(configs.destDirname, configs.js.dest);
        configs.destCSSDirname = path.join(configs.destDirname, configs.css.dest);
        configs.destResourceDirname = path.join(configs.destDirname, configs.resource.dest);
        configs.dest.host = configs.dest.host || '';

        if (!typeis.string(configs.dest.host)) {
            debug.error('parse coolie.config', '`dest.host` property must be an URL string');
            process.exit(1);
        }

        if (configs.dest.host.slice(-1) !== '/') {
            configs.dest.host += '/';
        }

        configs.dest.versionLength = configs.dest.versionLength || 32;

        if (!configs._noCoolieJS) {
            check._coolieConfigJS();
        }
    };


    // 检查复制
    check.copy = function () {
        if (configs.copy) {
            var copyFilesType = typeis(configs.copy);

            if (copyFilesType !== 'string' && copyFilesType !== 'array') {
                debug.error('parse coolie.config', '`copy` property must be a string path or an array path');
                process.exit(1);
            }

            if (copyFilesType === 'array') {
                configs.copy.forEach(function (cp, index) {
                    if (typeis(cp) !== 'string') {
                        debug.error('parse coolie.config', '`copy` property[' + index + '] must be a string path');
                        process.exit(1);
                    }
                });
            } else {
                configs.copy = [configs.copy];
            }
        } else {
            configs.copy = [];
        }
    };


    // 猜想 chunk 目录
    check.chunk = function () {
        if (configs.clean) {
            try {
                fse.emptyDirSync(configs.destDirname);
            } catch (err) {
                debug.error('clean dest dirname', path.toSystem(configs.destDirname));
                debug.error('clean dest dirname', err.message);
                return process.exit(1);
            }
        }

        var srcChunkDirname = guessDirname(configs.destJSDirname, 'chunk');
        var relative = path.relative(srcDirname, srcChunkDirname);

        configs.destCoolieConfigChunkDirname = path.join(configs.destDirname, relative);
    };

    // 猜想 async 目录
    check.async = function () {
        var srcAsyncDirname = guessDirname(configs.destJSDirname, 'async');
        var relative = path.relative(srcDirname, srcAsyncDirname);

        configs.destCoolieConfigAsyncDirname = path.join(configs.destDirname, relative);
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

    dato.extend(configs, {
        srcDirname: srcDirname,
        configPath: srcCoolieConfigJSPath ? srcCoolieConfigJSPath : srcCoolieJSONPath
    });

    debug.success('coolie config', path.toSystem(configs.configPath));
    debug.success('src dirname', configs.srcDirname);
    debug.success('dest dirname', configs.destDirname);
    //debug.success('coolie configs', JSON.stringify(configs, null, 4));

    return configs;
};


