/**
 * coolie-config.js runtime
 */


'use strict';

var debug = require('blear.node.debug');
var fse = require('fs-extra');
var console = require('blear.node.console');


var reFunctionStart = /^function\s*?\(\s*\)\s*\{/;
var reFunctionEnd = /}$/;


module.exports = function (file) {
    var code;

    try {
        code = fse.readFileSync(file, 'utf8');
    } catch (err) {
        debug.error('parse coolie.config', file);
        debug.error('read file', file);
        debug.error('read file', err.message);
        process.exit(1);
    }
    
    var coolieConfig = {};
    var callbacks = [];
    var coolieFn = function () {
        var coolie = {
            config: function (cnf) {
                cnf = cnf || {};

                coolieConfig.mode = cnf.mode || '';
                coolieConfig.base = cnf.base || '';
                coolieConfig.baseDir = cnf.baseDir || '';
                coolieConfig.mainModulesDir = cnf.mainModulesDir || '';
                coolieConfig.nodeModulesDir = cnf.nodeModulesDir || '';
                coolieConfig.nodeModuleMainPath = cnf.nodeModuleMainPath || '';
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
            }
        };
    };
    var coolieFnBody = coolieFn.toString()
        .replace(reFunctionStart, '')
        .replace(reFunctionEnd, '');

    /* jshint evil: true */
    var runtime = new Function('coolieConfig', 'callbacks', coolieFnBody + code);

    try {
        runtime(coolieConfig, callbacks);
    } catch (err) {
        debug.error('parse coolie.config', file);
        debug.error('parse coolie.config', err.message);
        return process.exit(1);
    }

    coolieConfig.callbacks = callbacks;

    return coolieConfig;
};
