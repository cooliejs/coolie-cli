/*!
 * log
 * @author ydr.me
 * @create 2014-10-22 16:17
 */

'use strict';

require('colors');

/**
 * 输出消息
 * @param {String} event 事件
 * @param {String} message 消息
 * @param {String} type 类型，默认为muted
 */


var map = {
    info: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    danger: 'red',
    muted: 'grey',
    normal: 'white'
};

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

    while (20 - _bytes(event, 2) > 0) {
        event = isTextAlignLeft ? event + ' ' : ' ' + event;
    }

    type = type || 'muted';
    message = message || 'empty message';
    var color = map[type] || type;

    message = message.replace(/[\n\r]/g, '\n                        ');

    console.log((event).bold, ('=>').cyan, (message)[color]);
};


/**
 * 计算字节长度
 * @param {String} string 源字符串
 * @param {Number} [length] 1个中文占用长度，默认2
 * @return {Number} 总长度
 */
function _bytes(string, length) {
    var i = 0,
        j = string.length,
        k = 0,
        c;

    length = length || 2;

    for (; i < j; i++) {
        c = string.charCodeAt(i);
        k += (c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f) ? 1 : length;
    }

    return k;
}




