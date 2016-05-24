/**
 * replace coolie-config.js
 * @author ydr.me
 * @create 2015-10-23 14:10
 */


'use strict';

var dato = require('ydr-utils').dato;
var encryption = require('ydr-utils').encryption;
var path = require('ydr-utils').path;
var debug = require('ydr-utils').debug;
var fse = require('fs-extra');

var pathURI = require('../utils/path-uri.js');
var reader = require('../utils/reader.js');
var sign = require('../utils/sign.js');
var minifyJS = require('../minify/js.js');
var pkg = require('../package.json');

var REG_FUNCTION_START = /^function\s*?\(\s*\)\s*\{/;
var REG_FUNCTION_END = /}$/;
var coolieConfig = {};
var config = {};
var callbacks = [];
var moduleResolver = null;
var moduleParser = null;
var coolieFn = function () {
    var coolie = {
        config: function (_configs) {
            _configs = _configs || {};

            for (var i in _configs) {
                config[i] = _configs[i];
            }

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
        },
        resolveModule: function (fn) {
            if(moduleResolver){
                return;
            }

            moduleResolver = fn;
            return coolie;
        },
        parseModule: function (fn) {
            if(moduleParser){
                return;
            }

            moduleParser = fn;
            return coolie;
        }
        
    };
};
var reLastPath = /^\.{2}\//;


/**
 * 构建配置文件
 * @param file {String} 文件内容
 * @param options {Object} 配置
 * @param options.destCoolieConfigBaseDirname {String} 目标 coolie-config.js:base 目录
 * @param options.destCoolieConfigAsyncDirname {String} 目标 coolie-config.js:async 目录
 * @param options.destCoolieConfigChunkDirname {String} 目标 coolie-config.js:chunk 目录
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
    if (!options.destCoolieConfigBaseDirname) {
        debug.ignore('overide config', '`coolie-config.js` is not defined');
        return null;
    }

    var code = reader(file, 'utf8');
    var versionMap = options.versionMap;
    var coolieString = coolieFn.toString()
        .replace(REG_FUNCTION_START, '')
        .replace(REG_FUNCTION_END, '');
    /*jshint evil: true*/
    var fn = new Function('config, callbacks', coolieString + code);
    var version = JSON.stringify(versionMap);

    try {
        fn(coolieConfig, callbacks);

        var asyncMap = {};
        var chunkMap = {};

        dato.each(versionMap, function (_file, _version) {
            var basename = path.basename(_file, '.js');
            var relativeAsync = path.relative(options.destCoolieConfigAsyncDirname, _file);

            if(reLastPath.test(relativeAsync)){
                chunkMap[basename] = _version;
            } else {
                asyncMap[basename] = _version;
            }
        });

        asyncMap = JSON.stringify(asyncMap);
        chunkMap = JSON.stringify(chunkMap);
        coolieConfig.asyncDir = path.toURI(path.relative(options.destCoolieConfigBaseDirname, options.destCoolieConfigAsyncDirname)) + '/';
        coolieConfig.chunkDir = path.toURI(path.relative(options.destCoolieConfigBaseDirname, options.destCoolieConfigChunkDirname)) + '/';

        debug.success('coolie-config.js', 'baseDir: "' + coolieConfig.baseDir + '"');
        debug.success('coolie-config.js', 'asyncDir: "' + coolieConfig.asyncDir + '"');
        debug.success('coolie-config.js', 'chunkDir: "' + coolieConfig.chunkDir + '"');
        debug.success('coolie-config.js', 'callbacks: ' + callbacks.length);

        var code2 = 'coolie.config({\n';

        //+
        //    'base:"' + coolieConfig.base + '",' +
        //    'async:"' + coolieConfig.async + '",' +
        //    'chunk:"' + coolieConfig.chunk + '",' +
        //    'debug:false,' +
        //    'cache:true,' +
        //    'built:"' + pkg.name + '@' + pkg.version + '",' +
        //    'version:' + version + '})';

        var configList = [];
        var ignoreMap = {
            debug: 1,
            mode: 1
        };

        configList.push('debug: false');
        configList.push('mode: "AMD"');
        configList.push('asyncMap: ' + asyncMap);
        configList.push('chunkMap: ' + chunkMap);
        configList.push('built: ' + '"' + pkg.name + '@' + pkg.version + '"');

        dato.each(coolieConfig, function (key, val) {
            var one = '';

            if (ignoreMap[key]) {
                return;
            }

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

        code2 += configList.join(',\n');
        code2 += '\n}).use()';

        dato.each(callbacks, function (index, callback) {
            code2 += '.callback(' + callback.toString() + ')';
        });

        code2 += ';';

        var code3 = minifyJS(file, {
            code: code2,
            uglifyJSOptions: options.uglifyJSOptions
        });
        var destCoolieConfigJSPath = encryption.md5(code3).slice(0, options.versionLength) + '.js';

        if (options.sign) {
            code3 = sign('js') + '\n' + code3;
        }

        destCoolieConfigJSPath = path.join(options.destJSDirname, destCoolieConfigJSPath);
        var destCoolieConfigJSURI = pathURI.toRootURL(destCoolieConfigJSPath, options.srcDirname);

        try {
            fse.outputFileSync(destCoolieConfigJSPath, code3, 'utf8');
            debug.success('coolie-config.js', destCoolieConfigJSURI);
        } catch (err) {
            debug.error('coolie-config.js', destCoolieConfigJSPath);
            debug.error('output file', err.message);
        }

        return destCoolieConfigJSPath;
    } catch (err) {
        debug.error('coolie-config.js', path.toSystem(file));
        debug.error('coolie-config.js', err.message);
    }
};



