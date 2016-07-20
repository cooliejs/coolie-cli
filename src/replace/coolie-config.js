/**
 * replace coolie-config.js
 * @author ydr.me
 * @create 2015-10-23 14:10
 */


'use strict';

var collection = require('blear.utils.collection');
var encryption = require('blear.node.encryption');
var path = require('blear.node.path');
var debug = require('blear.node.debug');
var fse = require('fs-extra');
var console = require('blear.node.console');


var pathURI = require('../utils/path-uri.js');
var reader = require('../utils/reader.js');
var sign = require('../utils/sign.js');
var minifyJS = require('../minify/js.js');
var pkg = require('../../package.json');

var reLastPath = /^\.{2}\//;


/**
 * 构建配置文件
 * @param file {String} 文件内容
 * @param options {Object} 配置
 * @param options.coolieConfigs {Object} coolie-config.js 的配置信息
 * @param options.destMainModulesDirname {String} 目标 coolie-config.js:base 目录
 * @param options.destAsyncModulesDirname {String} 目标 coolie-config.js:async 目录
 * @param options.destChunkModulesDirname {String} 目标 coolie-config.js:chunk 目录
 * @param options.destCoolieConfigMainModulesDir {String} 目标 coolie-config.js:main 目录
 * @param options.srcDirname {String} 构建根目录
 * @param options.destDirname {String} 目标目录
 * @param options.versionMap {Object} 版本配置 {file: version}
 * @param options.versionLength {Number} 版本长度
 * @param options.destJSDirname {String} JS 保存目录
 * @param options.uglifyJSOptions {Object} JS 压缩配置
 * @param options.sign {Boolean} 是否签名
 * @returns {String}
 */
module.exports = function (file, options) {
    if (!options.destMainModulesDirname) {
        debug.ignore('overide config', '`coolie-config.js` is not defined');
        return null;
    }

    var coolieConfigs = options.coolieConfigs;
    var destCoolieConfig = {};
    var asyncModulesMap = {};
    var chunkModulesMap = {};

    collection.each(options.versionMap, function (_file, _version) {
        var basename = path.basename(_file, '.js');
        var relativeAsync = path.relative(options.destAsyncModulesDirname, _file);

        if (reLastPath.test(relativeAsync)) {
            chunkModulesMap[basename] = _version;
        } else {
            asyncModulesMap[basename] = _version;
        }
    });

    asyncModulesMap = JSON.stringify(asyncModulesMap);
    chunkModulesMap = JSON.stringify(chunkModulesMap);
    destCoolieConfig.mainModulesDir = path.normalize(options.destCoolieConfigMainModulesDir);
    destCoolieConfig.asyncModulesDir = path.relative(options.destMainModulesDirname, options.destAsyncModulesDirname) + '/';
    destCoolieConfig.chunkModulesDir = path.relative(options.destMainModulesDirname, options.destChunkModulesDirname) + '/';
    destCoolieConfig.global = coolieConfigs.global;

    debug.success('coolie-config.js', 'mainModulesDir: "' + destCoolieConfig.mainModulesDir + '"');
    debug.success('coolie-config.js', 'asyncModulesDir: "' + destCoolieConfig.asyncModulesDir + '"');
    debug.success('coolie-config.js', 'chunkModulesDir: "' + destCoolieConfig.chunkModulesDir + '"');
    debug.success('coolie-config.js', 'callbacks: ' + coolieConfigs.callbacks.length);

    var destCoolieConfigCode = 'coolie.config({\n';
    var configList = [];


    configList.push('debug: false');
    configList.push('mode: "AMD"');
    configList.push('asyncModulesMap: ' + asyncModulesMap);
    configList.push('chunkModulesMap: ' + chunkModulesMap);
    configList.push('built: ' + '"' + pkg.name + '@' + pkg.version + '"');

    collection.each(destCoolieConfig, function (key, val) {
        var one = '';

        if (typeof val === 'object') {
            one = key + ':' + JSON.stringify(val);
        } else if (typeof val === 'function') {
            one = key + ':' + val.toString() + '';
        } else {
            one = key + ':"' + val + '"';
        }

        if (one) {
            configList.push(one);
        }
    });

    configList = configList.map(function (item) {
        return '    ' + item;
    });

    destCoolieConfigCode += configList.join(',\n');
    destCoolieConfigCode += '\n}).use()';

    collection.each(coolieConfigs.callbacks, function (index, callback) {
        destCoolieConfigCode += '.callback(' + callback.toString() + ')';
    });

    destCoolieConfigCode += ';';

    var minifyedDestCoolieConfigCode = minifyJS(file, {
        code: destCoolieConfigCode,
        uglifyJSOptions: options.uglifyJSOptions
    });
    var destCoolieConfigJSPath = encryption.md5(minifyedDestCoolieConfigCode).slice(0, options.versionLength) + '.js';

    if (options.sign) {
        minifyedDestCoolieConfigCode = sign('js') + '\n' + minifyedDestCoolieConfigCode;
    }

    destCoolieConfigJSPath = path.join(options.destJSDirname, destCoolieConfigJSPath);
    var destCoolieConfigJSURI = pathURI.toRootURL(destCoolieConfigJSPath, options.srcDirname);

    try {
        fse.outputFileSync(destCoolieConfigJSPath, minifyedDestCoolieConfigCode, 'utf8');
        debug.success('coolie-config.js', destCoolieConfigJSURI);
    } catch (err) {
        debug.error('coolie-config.js', destCoolieConfigJSPath);
        debug.error('output file', err.message);
    }

    return destCoolieConfigJSPath;
};



