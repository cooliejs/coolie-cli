/**
 * parse coolie.config.js
 * @author ydr.me
 * @create 2015-10-26 14:27
 */


'use strict';


var fse = require('fs-extra');
var glob = require('glob');
var path = require('blear.node.path');
var array = require('blear.utils.array');
var collection = require('blear.utils.collection');
var object = require('blear.utils.object');
var typeis = require('blear.utils.typeis');
var access = require('blear.utils.access');
var debug = require('blear.node.debug');
var url = require('url');
var console = require('blear.node.console');


var copy = require('../utils/copy.js');
var pathURI = require('../utils/path-uri.js');
var bookURL = require('../utils/book-url');
var pkg = require('../../package.json');
var coolieConfigRuntime = require('./coolie-config-runtime');

var DEBUG = !Boolean(pkg.dist || pkg.publish_time);
var coolieConfigJSFile;
var MAIN_NAME = 'main';
var CHUNK_NAME = 'chunk';
var ASYNC_NAME = 'async';
var reSimpleProtocol = /^\/\//;


/**
 * 默认布尔值
 * @param varible
 * @param dft
 * @returns {*}
 */
var keepDefault = function (varible, dft) {
    if (undefined === varible) {
        return dft;
    }

    return typeis.Boolean(dft) ? Boolean(varible) : varible;
};


/**
 * 解析 config
 * @param options {Object} 配置
 * @param [options.coolieAPI] {Object} coolie API
 * @param options.srcDirname {Object} coolie.config.js 路径
 * @param options.middleware {Object} 中间件
 * @param options.configFile {String} 指定配置文件
 * @returns {Object}
 */
module.exports = function (options) {
    var srcDirname = options.srcDirname;
    var srcCoolieConfigJSPath = path.join(srcDirname, options.configFile);
    var configs = {};
    var check = {};
    var coolie = {};

    configs.coolieAPI = coolie;

    /**
     * 配置 coolie 构建参数
     * @param _configs
     * @returns {{}}
     */
    coolie.config = function (_configs) {
        object.assign(configs, _configs);
        object.assign(configs, {
            srcDirname: srcDirname,
            configPath: srcCoolieConfigJSPath
        });

        return coolie;
    };


    /**
     * coolie 中间件
     * @param middleware {Function}
     * @returns {{coolie}}
     */
    coolie.use = function (middleware/*arguments*/) {
        if (!typeis.Function(middleware)) {
            debug.error('coolie middleware', '不符合规范的 coolie 中间件');
            debug.error('coolie middleware', 'coolie 中间返回值必须是一个函数');
            debug.warn('coolie doc', '相关 coolie 中间件开发规范，请参阅 ' + bookURL('/document/coolie-middleware/'));
            debug.warn('coolie tips', '请使用 npm 来安装 coolie 中间件，coolie 中间件都以 `coolie-mid-*` 为前缀');
            process.exit(1);
        }

        var args = access.args(arguments);
        args.shift();
        debug.success('coolie middleware', middleware.package && middleware.package.name || '未知');
        var fn = middleware.apply(coolie, args);
        var fns = typeis.Array(fn) ? fn : [fn];

        array.each(fns, function (index, fn) {
            options.middleware.use(function (options) {
                try {
                    return fn.call(coolie, options) || options;
                } catch (err) {
                    debug.error('coolie middleware', '中间件执行出错');
                    debug.error('coolie middleware', err.message);
                    debug.warn('coolie doc', '相关 coolie 中间件开发规范，请参阅 ' + bookURL('/document/coolie-middleware/'));
                    debug.warn('coolie tips', '请使用 npm 来安装 coolie 中间件，coolie 中间件都以 `coolie-mid-*` 为前缀');
                    process.exit(1);
                }
            });
        });

        return coolie;
    };


    /**
     * coolie debug
     */
    coolie.debug = debug;
    coolie.DEBUG = DEBUG;

    // 检查文件
    check.file = function () {
        try {
            require(srcCoolieConfigJSPath)(coolie);
        } catch (err) {
            debug.error('coolie-cli config', srcCoolieConfigJSPath);
            debug.error('coolie-cli config', err.message);
            return process.exit(1);
        }
    };


    // 检查 dest 路径
    // dest: {
    //     dirname: '',
    //     host: ''
    //     versionLength: 32
    // }
    check.dest = function () {
        if (!typeis.Object(configs.dest)) {
            debug.error('coolie-cli config', '`dest` 属性必须是一个对象');
            process.exit(1);
        }

        if (!typeis.String(configs.dest.dirname)) {
            debug.error('coolie-cli config', '`dest.dirname` 必须是一个路径字符串');
            process.exit(1);
        }

        configs.destDirname = path.join(srcDirname, configs.dest.dirname);
        configs.destJSDirname = path.join(configs.destDirname, configs.js.dest);
        configs.destCSSDirname = path.join(configs.destDirname, configs.css.dest);
        configs.destResourceDirname = path.join(configs.destDirname, configs.resource.dest);
        configs.dest.host = configs.dest.host || '/';

        if (!typeis.String(configs.dest.host) && !typeis.Function(configs.dest.host)) {
            debug.error('coolie-cli config', '`dest.host` property must be an URL string');
            process.exit(1);
        }

        configs.dest.versionLength = configs.dest.versionLength || 32;
        configs.destHost = configs.dest.host;

        var tempHost = (reSimpleProtocol.test(configs.destHost) ? 'http:' : '') + configs.destHost;
        var tempRet = url.parse(tempHost);

        configs.destPathname = tempRet.pathname;
        configs.versionLength = configs.dest.versionLength;

        if (configs.clean) {
            try {
                fse.emptyDirSync(configs.destDirname);
            } catch (err) {
                debug.error('clean dest dirname', configs.destDirname);
                debug.error('clean dest dirname', err.message);
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
            debug.error('coolie-cli config', '`js` property must be an object');
            process.exit(1);
        }

        // js.main
        if (configs.js.main) {
            var mainPathType = typeis(configs.js.main);

            if (mainPathType !== 'string' && mainPathType !== 'array') {
                debug.error('coolie-cli config', '`js.main` property must be a string path or an array');
                process.exit(1);
            }

            if (mainPathType === 'array') {
                configs.js.main.forEach(function (mn, index) {
                    if (typeis(mn) !== 'string') {
                        debug.error('coolie-cli config', '`js.main[' + index + ']` must be a string');
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
                debug.error('coolie-cli config', '`js[coolie-config.js]` property must be a string');
                process.exit(1);
            }

            coolieConfigJSFile = path.join(srcDirname, configs.js['coolie-config.js']);
            configs.srcCoolieConfigJSPath = coolieConfigJSFile;

            if (!path.isFile(coolieConfigJSFile)) {
                debug.error('coolie-cli config', coolieConfigJSFile +
                    '\nis NOT a file');
                process.exit(1);
            }
        } else {
            configs._noCoolieJS = true;
        }

        // js.dest
        if (typeis(configs.js.dest) !== 'string') {
            debug.error('coolie-cli config', '`js.dest` property must be a string path');
            process.exit(1);
        }

        // js.chunk
        if (configs.js.chunk) {
            var chunkPathType = typeis(configs.js.chunk);

            if (chunkPathType !== 'string' && chunkPathType !== 'array') {
                debug.error('coolie-cli config', '`js.chunk` property must be a string path or an array');
                process.exit(1);
            }

            if (chunkPathType === 'array') {
                configs.js.chunk.forEach(function (mn, index) {
                    if (!typeis.String(mn) && !typeis.Array(mn)) {
                        debug.error('coolie-cli config', '`js.chunk[' + index + ']` must be a string or an array');
                        process.exit(1);
                    }
                });
            } else {
                configs.js.chunk = [configs.js.chunk];
            }
        } else {
            configs.js.chunk = [];
        }

        // https://www.npmjs.com/package/uglify-js#minify-options-structure
        var uglifyJSOptions = typeis.Object(configs.js.minify) ? configs.js.minify : {};
        uglifyJSOptions.coolieMinify = Boolean(configs.js.minify);
        uglifyJSOptions.compress = uglifyJSOptions.compress || {};
        var globalDefs = configs.js.minify ? configs.js.minify.global_defs || {} : {};
        uglifyJSOptions.compress.global_defs = uglifyJSOptions.compress.global_defs || {};
        object.assign(uglifyJSOptions.compress.global_defs, globalDefs);
        delete configs.js.minify.global_defs;
        configs.uglifyJSOptions = uglifyJSOptions;

        if (!configs._noCoolieJS) {
            check._coolieConfigJS();
        }
    };


    // 检查 coolie-config.js 内的 base 路径
    // base 路径必须在 coolie-config.js 以内，否则在构建之后的 main 会指向错误
    check._coolieConfigJS = function () {
        var coolieConfigs = coolieConfigRuntime(coolieConfigJSFile);
        var mainModulesDir = coolieConfigs.mainModulesDir;
        var nodeModulesDir = coolieConfigs.nodeModulesDir;

        if (coolieConfigs.mode === 'CJS') {
            configs.compatible = false;
        } else if (coolieConfigs.mode) {
            debug.warn('warning', '你在开发环境使用的模块规范是' + coolieConfigs.mode + '，\n' +
                '正在使用 1.x 兼容模式，构建过程可能会出错。');
            configs.compatible = true;
        } else {
            debug.warn('warning', '未指定开发环境下使用的模块规范`coolie-config.js:mode`，\n' +
                '正在使用 1.x 兼容模式，构建过程可能会出错。');
            configs.compatible = true;
        }

        if (coolieConfigs.global) {
            collection.each(coolieConfigs.global, function (key, val) {
                if (typeis.Boolean(val)) {
                    configs.uglifyJSOptions.compress.global_defs[key] = val;
                }
            });
        }

        configs.uglifyJSOptions.compress.global_defs.DEBUG = false;
        configs.uglifyJSOptions.compress.global_defs['process.env.NODE_ENV'] = 'production';
        coolieConfigs.global = coolieConfigs.global || {};
        coolieConfigs.global.DEBUG = false;
        configs.coolieConfigs = coolieConfigs;

        if (!mainModulesDir) {
            debug.error('coolie-config.js', coolieConfigJSFile);
            debug.error('coolie-config.js', 'config.mainModulesDir 未指定');

            if (coolieConfigs.base) {
                debug.warn('warning', '您可能使用的是 coolie.js@1.x 的模块加载器配置文件。\n' +
                    '请阅读官网相关提示来升级到 2.x：\n' +
                    'https://coolie.ydr.me/version/2.x/');
            }

            if (coolieConfigs.baseDir) {
                debug.warn('warning', '您可能使用的是 coolie.js@2.x 早期的模块加载器配置文件。\n' +
                    '请阅读官网相关提示来升级到 2.x：\n' +
                    'https://coolie.ydr.me/version/2.x/');
            }

            return process.exit(1);
        }

        var srcCoolieConfigJSDirname = path.dirname(coolieConfigJSFile);

        if (options.middleware) {
            mainModulesDir = options.middleware.exec({
                file: srcCoolieConfigJSPath,
                path: mainModulesDir,
                type: 'js',
                progress: 'pre-static'
            }).path;
            nodeModulesDir = options.middleware.exec({
                file: srcCoolieConfigJSPath,
                path: nodeModulesDir,
                type: 'js',
                progress: 'pre-static'
            }).path;
        }

        var srcCoolieConfigMainModulesDirname;
        try {
            if (pathURI.isRelativeRoot(mainModulesDir)) {
                srcCoolieConfigMainModulesDirname = path.join(srcDirname, mainModulesDir);
            } else {
                srcCoolieConfigMainModulesDirname = path.join(srcCoolieConfigJSDirname, mainModulesDir);
            }
        } catch (err) {
            debug.error('coolie-config.js', srcCoolieConfigJSDirname);
            debug.error('coolie-config.js', err.message);
            return process.exit(1);
        }

        var toMain = path.relative(srcDirname, srcCoolieConfigMainModulesDirname);

        if (/^\.\.\//.test(toMain)) {
            debug.error('coolie-config', 'coolie `mainModulesDir` path must be under ' + srcDirname +
                '\nbut now is ' + mainModulesDir, 'error');
            process.exit(1);
        }

        configs.coolieConfigMainModulesDir = mainModulesDir;
        configs.coolieConfigNodeModulesDir = nodeModulesDir;
        configs.srcCoolieConfigJSDirname = srcCoolieConfigJSDirname;
        configs.srcCoolieConfigMainModulesDirname = srcCoolieConfigMainModulesDirname;

        if (pathURI.isRelativeFile(nodeModulesDir)) {
            configs.srcCoolieConfigNodeModulesDirname = path.join(srcCoolieConfigJSDirname, nodeModulesDir);
        } else {
            configs.srcCoolieConfigNodeModulesDirname = path.join(srcDirname, nodeModulesDir);
        }

        configs.destMainModulesDirname = path.join(configs.destDirname, configs.js.dest, MAIN_NAME);
        configs.destCoolieConfigMainModulesDir = '/' + path.relative(configs.destDirname, configs.destMainModulesDirname) + '/';
        configs.destCoolieConfigMainModulesDir = path.join(configs.destPathname, configs.destCoolieConfigMainModulesDir);
    };


    // 检查 html
    // html: {
    //     src: [],
    //     minify: true
    // }
    check.html = function () {
        if (typeis(configs.html) !== 'object') {
            debug.error('coolie-cli config', '`html` property must be an object');
            process.exit(1);
        }

        // html.src
        if (configs.html.src) {
            var htmSrcType = typeis(configs.html.src);

            if (htmSrcType !== 'string' && htmSrcType !== 'array') {
                debug.error('coolie-cli config', '`html.src` property must be a string path or an array');
                process.exit(1);
            }

            if (htmSrcType === 'array') {
                configs.html.src.forEach(function (mn, index) {
                    if (typeis(mn) !== 'string') {
                        debug.error('coolie-cli config', '`html.src[' + index + ']` must be a string path');
                        process.exit(1);
                    }
                });
            } else {
                configs.html.src = [configs.html.src];
            }
        } else {
            configs.html.src = [];
        }

        // 布尔值
        if (typeis.Boolean(configs.html.minify)) {
            configs.htmlMinifyOptions = {
                removeHTMLMultipleLinesComments: configs.html.minify,
                removeHTMLOneLineComments: configs.html.minify,
                joinHTMLContinuousBlanks: configs.html.minify,
                removeHTMLBreakLines: configs.html.minify
            };
        } else {
            configs.htmlMinifyOptions = {
                removeHTMLMultipleLinesComments: keepDefault(configs.html.removeHTMLMultipleLinesComments, true),
                removeHTMLOneLineComments: keepDefault(configs.html.removeHTMLOneLineComments, true),
                joinHTMLContinuousBlanks: keepDefault(configs.html.joinHTMLContinuousBlanks, true),
                removeHTMLBreakLines: keepDefault(configs.html.removeHTMLBreakLines, true)
            };
        }
    };


    // 检查 css 配置
    // css: {
    //    dest: '',
    //    minify: {}
    // }
    check.css = function () {
        if (typeis(configs.css) !== 'object') {
            debug.error('coolie-cli config', '`css` property must be an object');
            process.exit(1);
        }

        // css.dest
        if (typeis(configs.css.dest) !== 'string') {
            debug.error('coolie-cli config', '`css.dest` property must be a string path');
            process.exit(1);
        }

        if (configs.css.minify === true) {
            configs.css.minify = {
                keepBreaks: false,
                keepSpecialComments: '0',
                mediaMerging: true
            };
        } else if (configs.css.minify === false) {
            configs.css.minify = {
                keepBreaks: true,
                keepSpecialComments: '*',
                mediaMerging: false
            };
        } else {
            configs.css.minify = configs.css.minify || {};
            configs.css.minify.keepBreaks = keepDefault(configs.css.minify.keepBreaks, false);
            configs.css.minify.keepSpecialComments = configs.css.minify.keepSpecialComments || '0';
            configs.css.minify.mediaMerging = keepDefault(configs.css.minify.mediaMerging, true);
        }

        // css.minify
        if (!typeis.Undefined(configs.css.minify) && !typeis.Object(configs.css.minify)) {
            debug.error('coolie-cli config', '`css.minify` must be an object or a boolean value');
            process.exit(1);
        }

        configs.cleanCSSOptions = configs.css.minify;
    };


    // 检查 resource 路径
    // resource: {
    //     dest: '',
    //     minify: true
    // }
    check.resource = function () {
        if (!typeis.Object(configs.resource)) {
            debug.error('coolie-cli config', '`resource` property must be an object');
            process.exit(1);
        }

        // resource.dest
        if (!typeis.String(configs.resource.dest)) {
            debug.error('coolie-cli config', '`resource.dest` property must be a string path');
            process.exit(1);
        }

        if (typeis.Undefined(configs.resource.minify) !== false) {
            configs.resource.minify = true;
        }

        configs.minifyResource = configs.resource.minify;
    };


    // 检查复制
    check.copy = function () {
        if (configs.copy) {
            var copyFilesType = typeis(configs.copy);

            if (copyFilesType !== 'string' && copyFilesType !== 'array') {
                debug.error('coolie-cli config', '`copy` property must be a string path or an array path');
                process.exit(1);
            }

            if (copyFilesType === 'array') {
                configs.copy.forEach(function (cp, index) {
                    if (typeis(cp) !== 'string') {
                        debug.error('coolie-cli config', '`copy` property[' + index + '] must be a string path');
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
        configs.destChunkModulesDirname = path.join(configs.destDirname, configs.js.dest, CHUNK_NAME);
    };


    // 猜想 async 目录
    check.async = function () {
        configs.destAsyncModulesDirname = path.join(configs.destDirname, configs.js.dest, ASYNC_NAME);
    };


    // ====================================
    check.file();
    check.dest();
    check.js();
    check.html();
    check.css();
    check.resource();
    check.copy();
    check.chunk();
    check.async();

    if (options.middleware) {
        options.middleware.exec({
            progress: 'post-config',
            configs: configs
        });
    }

    debug.success('coolie config', configs.configPath);
    debug.success('src dirname', configs.srcDirname);
    debug.success('dest dirname', configs.destDirname);
    //debug.success('coolie configs', JSON.stringify(configs, null, 4));

    return configs;
};


