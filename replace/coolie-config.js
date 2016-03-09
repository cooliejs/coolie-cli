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
    var base;
    var version = JSON.stringify(versionMap);

    try {
        fn(coolieConfig, callbacks);

        var versionMap2 = {};

        dato.each(versionMap, function (_file, _version) {
            var relative = path.relative(options.destCoolieConfigBaseDirname, _file);

            relative = path.toURI(relative);
            versionMap2[relative] = _version;
        });

        version = JSON.stringify(versionMap2);
        coolieConfig.async = path.toURI(path.relative(options.destCoolieConfigBaseDirname, options.destCoolieConfigAsyncDirname)) + '/';
        coolieConfig.chunk = path.toURI(path.relative(options.destCoolieConfigBaseDirname, options.destCoolieConfigChunkDirname)) + '/';

        debug.success('coolie-config.js', 'base: "' + coolieConfig.base + '"');
        debug.success('coolie-config.js', 'async: "' + coolieConfig.async + '"');
        debug.success('coolie-config.js', 'chunk: "' + coolieConfig.chunk + '"');
        debug.success('coolie-config.js', 'callbacks: ' + callbacks.length);

        var code2 = 'coolie.config({' +
            'base:"' + coolieConfig.base + '",' +
            'async:"' + coolieConfig.async + '",' +
            'chunk:"' + coolieConfig.chunk + '",' +
            'debug:false,' +
            'cache:true,' +
            'builder:"' + pkg.version + '",' +
            'version:' + version + '})' +
            '.use()';

        dato.each(callbacks, function (index, callback) {
            code2 += '.callback(' + callback.toString() + ')';
        });

        code2 += ';';

        var destCoolieConfigJSPath = encryption.md5(code2).slice(0, options.versionLength) + '.js';
        var code3 = minifyJS(file, {
            code: code2
        });

        if (options.sign) {
            code3 = sign('js') + '\n' + code3;
        }

        destCoolieConfigJSPath = path.join(options.destJSDirname, destCoolieConfigJSPath);
        var destCoolieConfigJSURI = pathURI.toRootURL(destCoolieConfigJSPath, options.srcDirname);

        try {
            fse.outputFileSync(destCoolieConfigJSPath, code3, 'utf8');
            debug.success('output', destCoolieConfigJSURI);
        } catch (err) {
            debug.error('coolie-config.js', destCoolieConfigJSPath);
            debug.error('write file', err.message);
        }

        return destCoolieConfigJSPath;
    } catch (err) {
        debug.error('coolie-config.js', path.toSystem(file));
        debug.error('coolie-config.js', err.message);
    }
};



