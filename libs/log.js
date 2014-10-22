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
 */
module.exports = function log(isTextAlignLeft, event, message, type) {
    if (typeof arguments[0] !== 'boolean') {
        type = message;
        message = event;
        event = arguments[0];
        isTextAlignLeft = false;
    }

    while (20 - event.length > 0) {
        event = isTextAlignLeft ? event + ' ' : ' ' + event;
    }

    type = type || 'muted';
    var color = map[type] || type;

    console.log((event).bold, ('=>').cyan, (message)[color]);
};