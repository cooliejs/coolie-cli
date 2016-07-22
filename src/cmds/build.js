/**
 * 构建主程序
 * @author ydr.me
 * @create 2015-10-28 11:18
 */


'use strict';

var object = require('blear.utils.object');
var debug = require('blear.node.debug');
var Middleware = require('ydr-utils').Middleware;
var Emitter = require('ydr-utils').Emitter;
var date = require('blear.utils.date');
var console = require('blear.node.console');


var parseCoolieConfig = require('../parse/coolie.config.js');
var buildAPP = require('../build/app.js');
var buildCopy = require('../build/copy.js');
var buildHTML = require('../build/html.js');
var buildMap = require('../build/map.js');
var buildAPI = require('../build/api.js');
var replaceCoolieConfig = require('../replace/coolie-config.js');
var banner = require('./banner.js');

var defaults = {
    srcDirname: process.cwd(),
    configFile: 'coolie.config.js'
};
var middleware = new Middleware({
    async: false
});
var emitter = new Emitter();


// 重写 err
middleware.catchError(function (err, middleware) {
    var pkg = middleware.package || {};
    var UNKNDOW = 'unkndow';

    pkg.author = pkg.author || {};
    pkg.bugs = pkg.bugs || {};
    pkg.repository = pkg.repository || {};

    var author = ''.concat(
        pkg.author.name || '',
        pkg.author.nickname || '',
        pkg.author.email ? '<' + pkg.author.email + '>' : ''
    );

    err.coolieMiddlware = {
        name: pkg.name || UNKNDOW,
        version: pkg.version || UNKNDOW,
        author: author || pkg.author || UNKNDOW,
        bug: pkg.bugs.url || pkg.bugs || UNKNDOW,
        repository: pkg.repository.url || pkg.repository || UNKNDOW,
        homepage: pkg.homepage || UNKNDOW
    };
    return err;
});

middleware.on('error', function (err) {
    var coolieMiddlware = err.coolieMiddlware;

    debug.error('middleware name', coolieMiddlware.name);
    debug.error('middleware version', coolieMiddlware.version);
    debug.error('middleware author', coolieMiddlware.author);
    debug.error('middleware bug', coolieMiddlware.bug);
    debug.error('middleware repo', coolieMiddlware.repository);
    debug.error('middleware home', coolieMiddlware.homepage);
    debug.error('middleware error', err.message);
    debug.error('error stack', err.stack);
    console.log();
    return process.exit(1);
});

emitter.on('exit', function (err) {
    debug.error(err.name, err.message);
    return process.exit(1);
});

/**
 * 构建主程序
 * @param options {Object} 配置
 * @param options.srcDirname {String} 构建根目录
 * @param options.configFile {String} 配置文件
 */
module.exports = function (options) {
    banner();
    options = object.assign({}, defaults, options);

    var stepIndex = 0;
    var stepLength = 6;
    var beginTime = Date.now();


    // 1. 分析配置文件
    console.log();
    debug.primary('step ' + (++stepIndex) + '/' + stepLength, 'parse coolie-cli profile');
    /**
     * 配置
     * @type {{js: Object, dest: Object, resource: Object, html: Object}}
     */
    var configs = parseCoolieConfig({
        srcDirname: options.srcDirname,
        configFile: options.configFile,
        middleware: middleware,
        emitter: emitter
    });
    var srcDirname = configs.srcDirname;
    var destDirname = configs.destDirname;

    buildAPI(configs, middleware);

    // 2. 复制文件
    console.log();
    debug.primary('step ' + (++stepIndex) + '/' + stepLength, 'copy files');
    var copiedList = buildCopy({
        srcDirname: srcDirname,
        destDirname: destDirname,
        copy: configs.copy
    });
    if (!copiedList.length) {
        debug.ignore('copy files', 'no files are copied');
    }


    // 3. 构建入口文件
    console.log();
    debug.primary('step ' + (++stepIndex) + '/' + stepLength, 'build main modules');
    var buildAPPResult = buildAPP({
        glob: configs.js.main,
        chunk: configs.js.chunk,
        srcDirname: srcDirname,
        coolieConfigs: configs.coolieConfigs,
        srcCoolieConfigMainModulesDirname: configs.srcCoolieConfigMainModulesDirname,
        srcCoolieConfigNodeModulesDirname: configs.srcCoolieConfigNodeModulesDirname,
        destDirname: destDirname,
        destJSDirname: configs.destJSDirname,
        destCSSDirname: configs.destCSSDirname,
        destResourceDirname: configs.destResourceDirname,
        destHost: configs.destHost,
        uglifyJSOptions: configs.uglifyJSOptions,
        cleanCSSOptions: configs.cleanCSSOptions,
        versionLength: configs.versionLength,
        minifyResource: configs.minifyResource,
        destMainModulesDirname: configs.destMainModulesDirname,
        destChunkModulesDirname: configs.destChunkModulesDirname,
        destAsyncModulesDirname: configs.destAsyncModulesDirname,
        htmlMinifyOptions: configs.htmlMinifyOptions,
        mute: true,
        compatible: configs.compatible
    });

    // 4. 重写 coolie-config.js
    console.log();
    debug.primary('step ' + (++stepIndex) + '/' + stepLength, 'generate coolie.js profile');
    var destCoolieConfigJSPath = replaceCoolieConfig(configs.srcCoolieConfigJSPath, {
        coolieConfigs: configs.coolieConfigs,
        versionLength: configs.versionLength,
        destMainModulesDirname: configs.destMainModulesDirname,
        destChunkModulesDirname: configs.destChunkModulesDirname,
        destAsyncModulesDirname: configs.destAsyncModulesDirname,
        destCoolieConfigMainModulesDir: configs.destCoolieConfigMainModulesDir,
        srcDirname: srcDirname,
        destDirname: destDirname,
        destJSDirname: configs.destJSDirname,
        versionMap: object.assign({}, buildAPPResult.chunkVersionMap, buildAPPResult.asyncVersionMap),
        destHost: configs.destHost,
        uglifyJSOptions: configs.uglifyJSOptions,
        sign: true
    });


    // 5. 构建 html
    console.log();
    debug.primary('step ' + (++stepIndex) + '/' + stepLength, 'build htmls');
    var buildHTMLResult = buildHTML({
        middleware: middleware,
        emitter: emitter,
        glob: configs.html.src,
        htmlMinifyOptions: configs.htmlMinifyOptions,
        versionLength: configs.versionLength,
        srcDirname: srcDirname,
        destDirname: destDirname,
        destJSDirname: configs.destJSDirname,
        destCSSDirname: configs.destCSSDirname,
        destResourceDirname: configs.destResourceDirname,
        destHost: configs.destHost,
        coolieConfigMainModulesDir: configs.coolieConfigMainModulesDir,
        srcCoolieConfigJSPath: configs.srcCoolieConfigJSPath,
        srcCoolieConfigMainModulesDirname: configs.srcCoolieConfigMainModulesDirname,
        destCoolieConfigJSPath: destCoolieConfigJSPath,
        minifyJS: true,
        minifyCSS: true,
        minifyResource: true,
        uglifyJSOptions: configs.uglifyJSOptions,
        cleanCSSOptions: configs.cleanCSSOptions,
        replaceCSSResource: true,
        mainVersionMap: buildAPPResult.mainVersionMap,
        mute: true
    });


    // 6. 生成资源地图
    console.log();
    debug.primary('step ' + (++stepIndex) + '/' + stepLength, 'generate coolie map');
    buildMap({
        srcDirname: srcDirname,
        destDirname: destDirname,
        configs: configs,
        destMainModulesDirname: configs.destMainModulesDirname,
        destChunkModulesDirname: configs.destChunkModulesDirname,
        destAsyncModulesDirname: configs.destAsyncModulesDirname,
        buildAPPResult: buildAPPResult,
        buildHTMLResult: buildHTMLResult
    });

    var pastTime = Date.now() - beginTime;
    console.log();
    debug.primary('build success', 'elapsed ' + pastTime + 'ms, at ' + date.format('YYYY-MM-DD HH:mm:ss.SSS'));
    console.log();
};


