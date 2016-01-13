/**
 * api
 * @author ydr.me
 * @create 2016-01-13 21:06
 */


'use strict';

var allocation = require('ydr-utils').allocation;
var httpStatus = require('ydr-utils').httpStatus;


// 添加 api 方法
exports.resAPI =function (req, res, next) {
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
                message = null;
            }
        } else if (args.length === 2) {
            message = args[1];
            result = null;
        }

        res.json({
            code: code,
            result: result,
            message: message
        });
    };

    next();
};

