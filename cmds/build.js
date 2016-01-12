/**
 * 构建主程序
 * @author ydr.me
 * @create 2015-10-28 11:18
 */


'use strict';

var dato = require('ydr-utils').dato;
var debug = require('ydr-utils').debug;
var Middleware = require('ydr-utils').Middleware;
var Emitter = require('ydr-utils').Emitter;

var parseCoolieConfig = require('../parse/coolie.config.js');
var buildAPP = require('../build/app.js');
var buildCopy = require('../build/copy.js');
var buildHTML = require('../build/html.js');
var buildMap = require('../build/map.js');
var buildAPI = require('../build/api.js');
var replaceCoolieConfig = require('../replace/coolie-config.js');
var banner = require('./banner.js');

var defaults = {
    srcDirname: process.cwd()
};
var middleware = new Middleware({
    async: false
});
var emitter = new Emitter();

middleware.on('error', function (err) {
    debug.error('middleware error', '');
    debug.error('middleware name', err.middlewareName);
    debug.error(err.name, err.message);
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
 */
module.exports = function (options) {
    banner();
    options = dato.extend({}, defaults, options);

    var stepIndex = 0;
    var stepLength = 6;
    var beginTime = Date.now();


    // 1. 分析配置文件
    console.log();
    debug.primary(++stepIndex + '/' + stepLength, 'parse coolie config');
    /**
     * 配置
     * @type {{js: Object, dest: Object, resource: Object, html: Object}}
     */
    var configs = parseCoolieConfig({
        srcDirname: options.srcDirname,
        middleware: middleware,
        emitter: emitter
    });
    var srcDirname = configs.srcDirname;
    var destDirname = configs.destDirname;

    buildAPI(configs);

    return console.log(configs);


    // 2. 复制文件
    console.log();
    debug.primary(++stepIndex + '/' + stepLength, 'copy files');
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
    debug.primary(++stepIndex + '/' + stepLength, 'build main module');
    var buildAPPResult = buildAPP({
        glob: configs.js.main,
        chunk: configs.js.chunk,
        srcDirname: srcDirname,
        destDirname: destDirname,
        destCSSDirname: configs.destCSSDirname,
        destResourceDirname: configs.destResourceDirname,
        destHost: configs.destHost,
        uglifyJSOptions: configs.uglifyJSOptions,
        cleanCSSOptions: configs.cleanCSSOptions,
        versionLength: configs.versionLength,
        minifyResource: configs.minifyResource,
        destCoolieConfigBaseDirname: configs.destCoolieConfigBaseDirname,
        destCoolieConfigChunkDirname: configs.destCoolieConfigChunkDirname,
        destCoolieConfigAsyncDirname: configs.destCoolieConfigAsyncDirname,
        removeHTMLYUIComments: configs.removeHTMLYUIComments,
        removeHTMLLineComments: configs.removeHTMLLineComments,
        joinHTMLSpaces: configs.joinHTMLSpaces,
        removeHTMLBreakLines: configs.removeHTMLBreakLines
    });


    // 3. 重写 coolie-config.js
    console.log();
    debug.primary(++stepIndex + '/' + stepLength, 'override coolie-config.js');
    var destCoolieConfigJSPath = replaceCoolieConfig(configs.srcCoolieConfigJSPath, {
        versionLength: configs.versionLength,
        destCoolieConfigBaseDirname: configs.destCoolieConfigBaseDirname,
        destCoolieConfigChunkDirname: configs.destCoolieConfigChunkDirname,
        destCoolieConfigAsyncDirname: configs.destCoolieConfigAsyncDirname,
        srcDirname: srcDirname,
        destDirname: destDirname,
        destJSDirname: configs.destJSDirname,
        versionMap: dato.extend({}, buildAPPResult.chunkVersionMap, buildAPPResult.asyncVersionMap),
        destHost: configs.destHost,
        sign: true
    });


    // 4. 构建 html
    console.log();
    debug.primary(++stepIndex + '/' + stepLength, 'build html');
    var buildHTMLResult = buildHTML({
        middleware: middleware,
        emitter: emitter,
        glob: configs.html.src,
        removeHTMLYUIComments: configs.removeHTMLYUIComments,
        removeHTMLLineComments: configs.removeHTMLLineComments,
        joinHTMLSpaces: configs.joinHTMLSpaces,
        removeHTMLBreakLines: configs.removeHTMLBreakLines,
        versionLength: configs.dest.versionLength,
        srcDirname: srcDirname,
        destDirname: destDirname,
        destJSDirname: configs.destJSDirname,
        destCSSDirname: configs.destCSSDirname,
        destResourceDirname: configs.destResourceDirname,
        destHost: configs.dest.host,
        coolieConfigBase: configs.coolieConfigBase,
        srcCoolieConfigJSPath: configs.srcCoolieConfigJSPath,
        srcCoolieConfigBaseDirname: configs.srcCoolieConfigBaseDirname,
        destCoolieConfigJSPath: destCoolieConfigJSPath,
        minifyJS: true,
        minifyCSS: true,
        minifyResource: true,
        uglifyJSOptions: null,
        cleanCSSOptions: configs.css.minfiy,
        replaceCSSResource: true,
        mainVersionMap: buildAPPResult.mainVersionMap
    });


    // 5. 生成资源地图
    console.log();
    debug.primary(++stepIndex + '/' + stepLength, 'generate a resource relationship map');
    buildMap({
        srcDirname: srcDirname,
        destDirname: destDirname,
        configs: configs,
        destCoolieConfigBaseDirname: configs.destCoolieConfigBaseDirname,
        destCoolieConfigChunkDirname: configs.destCoolieConfigChunkDirname,
        destCoolieConfigAsyncDirname: configs.destCoolieConfigAsyncDirname,
        buildAPPResult: buildAPPResult,
        buildHTMLResult: buildHTMLResult
    });

    var pastTime = Date.now() - beginTime;
    console.log();
    debug.primary('build success', 'past ' + pastTime + 'ms');
    console.log();
};


