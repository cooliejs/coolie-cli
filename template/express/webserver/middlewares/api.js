/**
 * api
 * @author ydr.me
 * @create 2016-01-13 21:06
 */


'use strict';

var typeis = require('ydr-utils').typeis;
var allocation = require('ydr-utils').allocation;
var httpStatus = require('ydr-utils').httpStatus;


// 添加 api 方法
exports.resAPI = function (app) {
    var jsonpCallbackName = app.get('jsonp callback name');

    return function (req, res, next) {
        var isJSONP = req.query[jsonpCallbackName] !== undefined;

        /**
         * 输出 API 接口消息
         * @param code
         * @param [result]
         * @param [message]
         */
        res.api = function (code, result, message) {
            var args = allocation.args(arguments);

            if (args.length === 1) {
                // res.api(500);
                if (typeis.Number(args[0])) {
                    result = null;
                    message = httpStatus.get(code);
                }
                // res.api(result);
                else {
                    result = args[0];
                    code = 200;
                    message = undefined;
                }
            }
            // res.api(code, message);
            else if (args.length === 2) {
                message = args[1];
                result = undefined;
            }

            var json = {
                code: code,
                result: result,
                message: message
            };

            if (isJSONP) {
                return res.jsonp(json);
            }

            res.json(json);
        };

        next();
    };
};
