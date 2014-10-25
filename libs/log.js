/*!
 * log
 * @author ydr.me
 * @create 2014-10-22 16:17
 */

'use strict';

var colors = require('colors/safe.js');
var util = require('./util.js');

// set theme
var map = {
    normal: 'white',
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    success: 'green',
    info: 'green',
    data: 'grey',
    muted: 'grey',
    help: 'cyan',
    warn: 'yellow',
    warning: 'bgYellow',
    debug: 'blue',
    error: 'bgRed',
    bgBlack: 'bgBlack',
    bgGreen: 'bgGreen',
    bgYellow: 'bgYellow',
    bgBlue: 'bgBlue',
    bgMagenta: 'bgMagenta',
    task: 'bgCyan',
    bgWhite: 'bgWhite'
};

/**
 * 输出消息
 * @param {String} event 事件
 * @param {String} message 消息
 * @param {String} type 类型，默认为muted
 */


/**
 * 输出日志
 * @param {Boolean} isTextAlignLeft 是否事件左对齐
 * @param {String} event 事件名称，如“build”
 * @param {String} message 事件消息
 * @param {String} type 显示类型
 *
 * @example
 * 事件长度20个字符
 * 默认：
 *          hi => hello world!
 *         hi2 => hello world again!
 * 左对齐
 * hi          => hello world!
 * hi2         => hello world again!
 */
module.exports = function log(isTextAlignLeft, event, message, type) {
    if (typeof arguments[0] !== 'boolean') {
        type = message;
        message = event;
        event = arguments[0];
        isTextAlignLeft = false;
    }

    while (30 - util.bytes(event, 2) > 0) {
        event = isTextAlignLeft ? event + ' ' : ' ' + event;
    }

    type = type || 'muted';
    message = message || 'empty message';

    var color = map[type] || "white";


    console.log(colors.yellow(event), colors.cyan('=>'), _splitColors(color, message));
};


/**
 * 分割颜色
 * @param color
 * @param message
 * @returns {*|exports}
 * @private
 *
 * @example
 *          event => message line1
 *                   message line2
 *                   message line3
 *                   message line4
 */
var REG_BREAK_LINE = /[\n\r]/g;
function _splitColors(color, message) {
    var newMessage = '';
    var space = '\n                                  ';
    var messageList = message.split(REG_BREAK_LINE);

    messageList.forEach(function (msg, index) {
        if (index) {
            newMessage += space + colors[color](msg);
        } else {
            newMessage += colors[color](msg);
        }
    });

    return newMessage;
}



