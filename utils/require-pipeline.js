/**
 * 文件描述
 * @author ydr.me
 * @create 2016-05-16 14:25
 */


'use strict';

var path = require('path');
var dato = require('ydr-utils').dato;
var debug = require('ydr-utils').debug;


/**
 * 模块入口类型
 * @type {{}}
 */
var moduleInTypeMap = {
    js: 'js',
    image: 'file',
    file: 'file',
    text: 'text',
    html: 'text',
    json: 'json',
    css: 'css'
};

/**
 * 模块出口类型
 * @type {{}}
 */
var moduleOutTypeMap = {
    js: {
        js: 1,
        d: 'js'
    },
    file: {
        url: 1,
        base64: 1,
        d: 'url'
    },
    text: {
        text: 1,
        url: 2,
        base64: 2,
        d: 'text'
    },
    css: {
        text: 1,
        url: 2,
        base64: 2,
        style: 3,
        d: 'text'
    },
    json: {
        js: 1,
        text: 2,
        url: 3,
        base64: 3,
        d: 'js'
    }
};


/**
 * 默认的入口模块类型匹配规则
 * @type {*[]}
 */
var moduleInTypeMatches = [
    ['js', /^js$/],
    ['html', /^html$/],
    ['css', /^css$/],
    ['json', /^json$/],
    ['text', /^txt$/]
];

/**
 * 解析依赖的管道类型
 * @param file
 * @param name
 * @param pipeline
 * @returns {Array}
 */
module.exports = function (file, name, pipeline) {
    var dftInType = 'js';
    var extension = path.extname(name).slice(1);

    if (extension && !pipeline) {
        dato.each(moduleInTypeMatches, function (index, rule) {
            var inType = rule[0];
            var regexp = rule[1];

            if (regexp.test(extension)) {
                dftInType = inType;
                return false;
            }
        });

        dftInType = dftInType || 'file';
    }

    pipeline = (pipeline ? pipeline.toLowerCase() : dftInType).split('|');

    var inType = pipeline[0];
    var outType = pipeline[1];

    inType = moduleInTypeMap[inType];

    if (!inType) {
        debug.error('错误', '不支持的入口类型：' + inType + '\n' + path.toSystem(file));
        return process.exit(1);
    }

    var dfnOutType = moduleOutTypeMap[inType];
    outType = dfnOutType[outType] ? outType : dfnOutType.d;

    console.log(file, name, inType, outType);

    return [inType, outType];
};


