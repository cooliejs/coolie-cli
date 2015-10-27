/**
 * parse coolie.config.js:chunk
 * @author ydr.me
 * @create 2015-10-27 10:27
 */


'use strict';

var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
var debug = require('ydr-utils').debug;
var path = require('ydr-utils').path;
var glob = require('glob');

var defaults = {
    chunkList: [],
    globConfig: {
        dot: false,
        nodir: true
    }
};

/**
 * 分析 chunk 配置
 * @param options {Object} 配置
 * @param options.srcDirname {String} 原始目录
 * @param options.chunk {Array} 配置
 * @param options.globConfig {Object} glob 配置
 * @returns {{}}
 */
module.exports = function (options) {
    options = dato.extend(true, {}, defaults, options);
    var chunkFileMap = {};

    // 遍历分析 chunk 配置
    dato.each(options.chunk, function (i, chunkArr) {
        chunkArr = typeis.array(chunkArr) ? chunkArr : [chunkArr];

        dato.each(chunkArr, function (j, p) {
            var files = [];

            p = path.join(options.srcDirname, p);

            try {
                files = glob.sync(p, options.globConfig);
            } catch (err) {
                debug.error('parse chunk', p);
                debug.error('parse chunk', err.message);
                return process.exit(1);
            }

            dato.each(files, function (k, file) {
                chunkFileMap[file] = i;
            });
        });
    });

    return chunkFileMap;
};


