/**
 * 构建入口模块
 * @author ydr.me
 * @create 2015-10-26 15:33
 */


'use strict';

var dato = require('ydr-utils').dato;
var debug = require('ydr-utils').debug;
var encryption = require('ydr-utils').encryption;
var path = require('ydr-utils').path;
var fse = require('fs-extra');

var pathURI = require('../utils/path-uri.js');
var sign = require('../utils/sign.js');
var buildModule = require('./module.js');

var defaults = {
    async: false,
    main: null,
    uglifyJSOptions: null,
    srcDirname: null,
    destDirname: null,
    destResourceDirname: null,
    destHost: '/',
    versionLength: 32,
    minifyResource: true,
    cleanCSSOptions: null,
    destCoolieConfigBaseDirname: null
};

/**
 * 构建入口模块
 * @param file {String} 入口路径
 * @param options {Object} 配置
 * @param options.async {Boolean} 是否为异步模块
 * @param options.uglifyJSOptions {Object} uglify-js 配置
 * @param options.srcDirname {String} 原始目录
 * @param options.destDirname {String} 目标目录
 * @param options.destResourceDirname {String} 目标资源目录
 * @param options.destHost {String} 目标域
 * @param options.versionLength {Number} 版本号长度
 * @param options.minifyResource {Boolean} 是否压缩资源
 * @param options.cleanCSSOptions {Object} clean-css 配置
 * @param options.destCoolieConfigBaseDirname {String} coolie-config:base 目录
 * @returns {Array}
 */
module.exports = function (file, options) {
    options = dato.extend({}, defaults, options);
    var mainFile = file;
    // 依赖长度
    var dependencyLength = 1;
    // 构建长度
    var buildLength = 0;
    var buildMap = {};
    var bfList = [];
    var md5List = [];
    var dependencies = [file];
    var build = function (file, options) {
        var ret = buildModule(file, {
            inType: options.inType,
            outType: options.outType,
            async: options.async,
            main: mainFile,
            uglifyJSOptions: options.uglifyJSOptions,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destResourceDirname: options.destResourceDirname,
            destHost: options.destHost,
            versionLength: options.versionLength,
            minifyResource: options.minifyResource,
            cleanCSSOptions: options.cleanCSSOptions
        });

        bfList.push(new Buffer('\n' + ret.code, 'utf8'));
        md5List.push(ret.md5);

        if (ret.dependencies.length) {
            dato.each(ret.dependencies, function (index, dependency) {
                if (buildMap[dependency.id]) {
                    return;
                }

                dependencies.push(dependency.id);
                buildMap[dependency.id] = true;
                dependencyLength++;
                var options3 = dato.extend({}, options, {
                    inType: dependency.inType,
                    outType: dependency.outType
                });
                build(dependency.file, options3);
            });
        }

        buildLength++;

        if (buildLength === dependencyLength) {
            var srcMainURI = pathURI.toRootURL(mainFile, options.srcDirname);
            var mainCode = Buffer.concat(bfList).toString('utf8');
            var version = encryption.md5(md5List.join('')).slice(0, options.versionLength);
            var destMainPath = path.join(options.destCoolieConfigBaseDirname, version + '.js');

            //try {
            //    fse.outputFileSync(destMainPath, mainCode, 'utf8');
            //} catch (err) {
            //    debug.error('write main', path.toSystem(mainFile));
            //    debug.error('write main', path.toSystem(destMainPath));
            //    debug.error('write file', err.message);
            //    return process.exit(1);
            //}

            debug.success('√', srcMainURI);
        }
    };
    var options2 = dato.extend({}, options, {
        inType: 'js',
        outType: 'js'
    });
    bfList.push(new Buffer(sign('js'), 'utf8'));
    build(mainFile, options2);

    return dependencies;
};


