/**
 * request
 * @author ydr.me
 * @create 2016-03-05 01:42
 */


'use strict';

var request = require('ydr-utils').request;
var dato = require('ydr-utils').dato;
var path = require('ydr-utils').path;
var typeis = require('ydr-utils').typeis;

var configs = require('../../configs.js');

var defaults = {
    api: configs.api,
    method: 'post',
    parse: false,
    headers: {
        'content-type': 'application/json'
    }
};


/**
 * 发起请求
 * @param options
 * @param [callback]
 * @returns {*}
 */
var doRequest = function (options, callback) {
    options = dato.extend({}, defaults, options);
    options.url = path.joinURI(configs.api, options.url);

    if (!typeis.Function(callback)) {
        return request(options);
    }

    return request(options, function (err, body, res) {
        if (err) {
            return callback(err);
        }

        if (res.statusCode !== 200) {
            return callback(new Error('网络错误'));
        }

        if (options.parse === true) {
            return exports.parseRet([err, body], callback);
        }

        callback(err, body, res);
    });
};


/**
 * POST 请求
 * @param options
 * @param [callback]
 */
exports.post = function (options, callback) {
    options.method = 'post';
    return doRequest(options, callback);
};


/**
 * GET 请求
 * @param options
 * @param [callback]
 */
exports.get = function (options, callback) {
    options.method = 'get';
    return doRequest(options, callback);
};


/**
 * 解析响应数据
 * {code:200,result:}
 * @param args
 * @param callback
 * @returns {*}
 */
exports.parseRet = function (args, callback) {
    var err = args[0];
    var ret = args[1];

    if (err) {
        return callback(err);
    }

    var json;

    try {
        json = JSON.parse(ret);
    } catch (ex) {
        err = new Error('数据解析失败');
    }

    if (err) {
        return callback(err);
    }

    if (json.code !== 200) {
        err = new Error(json.message || '未知错误');
        return callback(err);
    }

    return callback(err, json.result);
};
