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

var glob = require('../utils/glob.js');

var defaults = {
    chunkList: [],
    globOptions: {
        dot: false,
        nodir: true
    },
    srcDirname: null
};

/**
 * 分析 chunk 配置
 * @param options {Object} 配置
 * @param options.srcDirname {String} 原始目录
 * @param options.chunk {Array} 配置
 * @param options.globOptions {Object} glob 配置
 * @returns {{}}
 */
module.exports = function (options) {
    options = dato.extend(true, {}, defaults, options);
    var chunkFileMap = {};

    glob({
        srcDirname: options.srcDirname,
        globOptions: options.globOptions,
        glob: options.chunk,
        progress: function (indexGlob, indexFile, file) {
            chunkFileMap[file] = indexGlob + '';
        }
    });

    return chunkFileMap;
};


