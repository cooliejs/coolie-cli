/**
 * request
 * @author ydr.me
 * @create 2016-03-05 01:42
 */


'use strict';

var request = require('blear.node.request');
var object = require('blear.utils.object');
var console = require('blear.node.console');
var url = require('blear.utils.url');
var typeis = require('blear.utils.typeis');

var configs = require('../../configs.js');

var defaults = {
    debug: configs.logLevel.indexOf('log') > -1,
    method: 'post',
    parse: false,
    headers: {
        'content-type': 'application/json'
    }
};


/**
 * 解析响应数据
 * {code:200,result:}
 * @param options
 * @param args
 * @param callback
 * @returns {*}
 */
var parseResponse = function (options, args, callback) {
    var err = args[0];
    var ret = args[1];

    if (err) {
        return callback(err);
    }

    var json;

    try {
        json = JSON.parse(ret);
    } catch (ex) {
        console.error('上游接口响应内容解析 JSON 错误', options.url);
        console.error('上游接口响应内容解析 JSON 错误', ret);
        err = new Error('数据解析失败');
    }

    if (err) {
        return callback(err);
    }

    if (json.code !== 200) {
        console.warnWithTime('上游接口处理错误', options.url);

        if (options.query) {
            console.warn('request query', options.query);
        }

        if (options.body) {
            console.warn('request body', options.body);
        }

        console.warn('上游接口处理错误', json.message);
        err = new Error(json.message || '未知错误');
        return callback(err);
    }

    return callback(err, json.result);
};


/**
 * 发起请求
 * @param options
 * @param [callback]
 * @returns {*}
 */
module.exports = function (options, callback) {
    options = object.assign({}, defaults, options);
    options.url = url.resolve(configs.api, options.url);
    options.query = options.query || {};
    options.body = options.body || {};

    if (options.req) {
        var $user = options.req.session.$user;

        if ($user && $user.userId !== 0) {
            options.query.dk_token = $user.token || $user.dk_token;

            if (!options.query.userId && !options.body.userId) {
                options.query.userId = $user.userId;
            }
        }
    }

    if (options.res) {
        var $club = options.res.locals.$club;

        if ($club && !options.query.clubId && !options.body.clubId) {
            options.query.clubId = $club.clubId;
        }
    }

    options.req = null;
    options.res = null;

    if (!typeis.Function(callback)) {
        options.req = null;
        options.res = null;
        return request(options);
    }

    return request(options, function (err, body, res) {
        if (err) {
            console.errorWithTime('JAVA 接口请求错误', options.url, res && res.statusCode);
            console.error('JAVA 接口请求错误', err);
            return callback('网络错误');
        }

        if (res.statusCode !== 200) {
            console.errorWithTime('JAVA 接口响应错误', options.url, res.statusCode);
            return callback(new Error('网络错误'));
        }

        if (options.parse === true) {
            return parseResponse(options, [err, body], callback);
        }

        callback(err, body, res);
    });
};
