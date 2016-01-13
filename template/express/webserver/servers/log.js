/**
 * 日志
 * @author ydr.me
 * @create 2016-01-13 21:34
 */


'use strict';

var buildConsole = require('ydr-utils').console;
var later = require('later');
var fs = require('fs');
var date = require('ydr-utils').date;
var path = require('ydr-utils').path;

var configs = require('../../configs.js');

var PM2_LOG = path.join(configs.root, './logs/pm2.log');


module.exports = function (next) {
    later.date.localTime();

    // 每天 0 点重命名日志
    later.setInterval(function () {
        var dateLog = 'node-' + date.format('YYYY-MM-DD') + '.log';
        dateLog = path.join(configs.root, './logs', dateLog);
        var readStream = fs.createReadStream(PM2_LOG);
        var writeStream = fs.createWriteStream(dateLog);
        var complete = function () {
            // 清空旧文件
            fs.writeFileSync(PM2_LOG, '', 'utf8');
        };
        // 数据传输到新文件
        readStream.pipe(writeStream)
            .on('end', complete)
            .on('close', complete)
            .on('error', function (err) {
                console.error(err.stack);
            });
    }, {
        schedules: [{
            // 每天 0 点
            h: [0],
            m: [0]
        }]
    });

    // 控制 console
    buildConsole({
        whiteList: configs.console
    });
    next();
};




