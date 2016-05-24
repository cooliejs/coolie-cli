/**
 * parse coolie.config.js
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

var copy = require('../utils/copy.js');
var guessDirname = require('../utils/guess-dirname.js');
var pathURI = require('../utils/path-uri.js');
var pkg = require('../package.json');
var coolieConfigRuntime = require('./coolie-config-runtime');

var DEBUG = !Boolean(pkg.dist || pkg.publish_time);
var coolieConfigJSFile;
var REG_FUNCTION_START = /^function\s*?\(\s*\)\s*\{/;
var REG_FUNCTION_END = /}$/;


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
 * @returns {Object}
 */
module.exports = function (options) {
    var srcDirname = options.srcDirname;
    var srcCoolieConfigJSPath = path.join(srcDirname, './coolie.config.js');
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
        dato.extend(configs, _configs);
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
                debug.warn('coolie tips', 'please use npm install coolie middleware, their names are "coolie-*"');
            }

            if (!middleware.package) {
                debug.warn('invalid middleware', 'some middleware has lost its `package` property');
                debug.warn('coolie tips', 'please use npm install coolie middleware, their names are "coolie-*"');
            }

            options.middleware.use(middleware);
        }

        return coolie;
    };


    /**
     * coolie debug
     */
    coolie.debug = debug;
    coolie.DEBUG = DEBUG;

    // 检查文件
    check.file = function () {
        require(srcCoolieConfigJSPath)(coolie);
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

        if (configs.js.minify !== false) {
            configs.js.minify = typeis.Object(configs.js.minify) ? configs.js.minify : {};
        }

        configs.uglifyJSOptions = {
            minify: Boolean(configs.js.minify),
            global_defs: configs.js.minify ? configs.js.minify.global_defs || {} : {}
        };
    };


    // 检查 coolie-config.js 内的 base 路径
    // base 路径必须在 coolie-config.js 以内，否则在构建之后的 main 会指向错误
    check._coolieConfigJS = function () {
        var coolieConfigs = coolieConfigRuntime(coolieConfigJSFile);
        var mainModulesDir = coolieConfigs.mainModulesDir;

        if (coolieConfigs.global) {
            dato.each(coolieConfigs.global, function (key, val) {
                if (typeis.Boolean(val)) {
                    configs.uglifyJSOptions.global_defs[key] = val;
                }
            });
        }

        configs.coolieConfigs = coolieConfigs;
        configs.uglifyJSOptions.global_defs.DEBUG = false;

        if (!mainModulesDir) {
            debug.error('parse coolie.config', path.toSystem(coolieConfigJSFile));
            debug.error('parse coolie.config', 'config.baseDir 未指定');
            return process.exit(1);
        }

        var coolieConfigJSDir = path.dirname(coolieConfigJSFile);

        try {
            if (pathURI.isRelativeRoot(mainModulesDir)) {
                mainModulesDir = path.join(srcDirname, mainModulesDir);
            } else {
                mainModulesDir = path.join(coolieConfigJSDir, mainModulesDir);
            }
        } catch (err) {
            debug.error('parse coolie.config', path.toSystem(coolieConfigJSDir));
            debug.error('parse coolie.config', err.message);
            return process.exit(1);
        }

        var toMain = path.relative(srcDirname, mainModulesDir);

        if (/^\.\.\//.test(toMain)) {
            debug.error('coolie-config', 'coolie `mainModulesDir` path must be under ' + srcDirname +
                '\nbut now is ' + mainModulesDir, 'error');
            process.exit(1);
        }

        configs.coolieConfigMainModulesDir = coolieConfigs.mainModulesDir;
        configs.coolieConfigNodeModulesDir = coolieConfigs.nodeModulesDir;
        configs.srcCoolieConfigMainModulesDirname = mainModulesDir;

        if (pathURI.isRelativeFile(coolieConfigs.nodeModulesDir)) {
            configs.srcCoolieConfigNodeModulesDirname = path.join(mainModulesDir, coolieConfigs.nodeModulesDir);
        } else {
            configs.srcCoolieConfigNodeModulesDirname = path.join(srcDirname, coolieConfigs.nodeModulesDir);
        }

        configs.destMainModulesDirname = path.join(configs.destDirname, configs.js.dest, coolieConfigs.baseDir);
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
            debug.error('parse coolie.config', '`css` property must be an object');
            process.exit(1);
        }

        // css.dest
        if (typeis(configs.css.dest) !== 'string') {
            debug.error('parse coolie.config', '`css.dest` property must be a string path');
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
        if (!typeis.undefined(configs.css.minify) && !typeis.object(configs.css.minify)) {
            debug.error('parse coolie.config', '`css.minify` must be an object or a boolean value');
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

        configs.minifyResource = configs.resource.minify;
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
        configs.dest.host = configs.dest.host || '/';

        if (!typeis.String(configs.dest.host) && !typeis.Function(configs.dest.host)) {
            debug.error('parse coolie.config', '`dest.host` property must be an URL string');
            process.exit(1);
        }

        configs.dest.versionLength = configs.dest.versionLength || 32;
        configs.destHost = configs.dest.host;
        configs.versionLength = configs.dest.versionLength;

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

        configs.destChunkModulesDirname = path.join(configs.destDirname, relative);
    };


    // 猜想 async 目录
    check.async = function () {
        var srcAsyncDirname = guessDirname(configs.destJSDirname, 'async');
        var relative = path.relative(srcDirname, srcAsyncDirname);

        configs.destAsyncModulesDirname = path.join(configs.destDirname, relative);
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
        configPath: srcCoolieConfigJSPath
    });

    debug.success('coolie config', path.toSystem(configs.configPath));
    debug.success('src dirname', configs.srcDirname);
    debug.success('dest dirname', configs.destDirname);
    //debug.success('coolie configs', JSON.stringify(configs, null, 4));

    return configs;
};


