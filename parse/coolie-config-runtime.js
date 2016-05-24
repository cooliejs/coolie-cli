/**
 * coolie-config.js runtime
 */


'use strict';

var path = require('ydr-utils').path;
var debug = require('ydr-utils').debug;
var fse = require('fs-extra');


var reFunctionStart = /^function\s*?\(\s*\)\s*\{/;
var reFunctionEnd = /}$/;


module.exports = function (file) {
    var code;

    try {
        code = fse.readFileSync(file, 'utf8');
    } catch (err) {
        debug.error('parse coolie.config', path.toSystem(file));
        debug.error('read file', path.toSystem(file));
        debug.error('read file', err.message);
        process.exit(1);
    }
    
    var coolieConfig = {};
    var callbacks = [];
    var moduleResolver = null;
    var moduleParser = null;
    var coolieFn = function () {
        var coolie = {
            config: function (cnf) {
                cnf = cnf || {};

                coolieConfig.mainModulesDir = cnf.mainModulesDir || '';
                coolieConfig.nodeModulesDir = cnf.nodeModulesDir || '';
                coolieConfig.debug = cnf.debug !== false;
                coolieConfig.global = cnf.global || {};

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
    var coolieFnBody = coolieFn.toString()
        .replace(reFunctionStart, '')
        .replace(reFunctionEnd, '');

    /* jshint evil: true */
    var runtime = new Function('coolieConfig', 'callbacks', 'moduleResolver', 'moduleParser', coolieFnBody + code);

    try {
        runtime(coolieConfig, callbacks, moduleResolver, moduleParser);
    } catch (err) {
        debug.error('parse coolie.config', path.toSystem(file));
        debug.error('parse coolie.config', err.message);
        return process.exit(1);
    }

    return {
        base: coolieConfig.base,
        baseDir: coolieConfig.baseDir,
        mainModulesDir: coolieConfig.mainModulesDir,
        nodeModulesDir: coolieConfig.nodeModulesDir,
        global: coolieConfig.global,
        moduleResolver: moduleResolver,
        moduleParser: moduleParser
    };
};
