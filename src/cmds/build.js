/**
 * 构建主程序
 * @author ydr.me
 * @create 2015-10-28 11:18
 */


'use strict';

var object = require('blear.utils.object');
var debug = require('blear.node.debug');
var date = require('blear.utils.date');
var console = require('blear.node.console');

var Middleware = require('../classes/middleware');
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
    debug.primary('step ' + (++stepIndex) + '/' + stepLength, '解析配置');
    /**
     * 配置
     * @type {{js: Object, dest: Object, resource: Object, html: Object}}
     */
    var configs = parseCoolieConfig({
        srcDirname: options.srcDirname,
        configFile: options.configFile,
        middleware: middleware
    });
    var srcDirname = configs.srcDirname;
    var destDirname = configs.destDirname;

    buildAPI(configs, middleware);

    // 2. 复制文件
    console.log();
    debug.primary('step ' + (++stepIndex) + '/' + stepLength, '复制文件');
    var copiedList = buildCopy({
        srcDirname: srcDirname,
        destDirname: destDirname,
        copy: configs.copy,
        middleware: middleware
    });
    if (!copiedList.length) {
        debug.ignore('copy files', '无文件可以被复制');
    }


    // 3. 构建入口文件
    console.log();
    debug.primary('step ' + (++stepIndex) + '/' + stepLength, '构建入口模块');
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
        compatible: configs.compatible,
        middleware: middleware
    });


    // 4. 重写 coolie-config.js
    console.log();
    debug.primary('step ' + (++stepIndex) + '/' + stepLength, '生成模块加载器配置文件');
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
        sign: true,
        middleware: middleware
    });


    // 5. 构建 html
    console.log();
    debug.primary('step ' + (++stepIndex) + '/' + stepLength, '构建 html');
    var buildHTMLResult = buildHTML({
        middleware: middleware,
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
    debug.primary('step ' + (++stepIndex) + '/' + stepLength, '生成资源引用关系地图');
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

    var elapsedTime = Date.now() - beginTime;
    var humanizeTime = '';
    var humanizeMinutes = 0;
    var humanizeSeconds = 0;

    if (elapsedTime > date.MINUTE_TIME) {
        humanizeMinutes = Math.floor(elapsedTime / date.MINUTE_TIME);
        elapsedTime -= humanizeMinutes * date.MINUTE_TIME;
    }

    if (elapsedTime > date.SECOND_TIME) {
        humanizeSeconds = Math.floor(elapsedTime / date.SECOND_TIME);
        elapsedTime -= humanizeSeconds * date.SECOND_TIME;
    }

    if (humanizeMinutes) {
        humanizeTime += humanizeMinutes + 'm';
    }

    if (humanizeSeconds) {
        humanizeTime += humanizeSeconds + 's';
    }

    humanizeTime += elapsedTime + 'ms';

    console.log();
    debug.primary('build success', '耗时 ' + humanizeTime + ', ' +
        '于 ' + date.format('YYYY-MM-DD HH:mm:ss.SSS'));
    console.log();
};


