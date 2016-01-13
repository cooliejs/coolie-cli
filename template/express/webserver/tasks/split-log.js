/**
 * 日志分割
 * @author ydr.me
 * @create 2015-12-14 10:54
 */


'use strict';

var later = require('later');
var fs = require('fs');
var date = require('ydr-utils').date;
var path = require('ydr-utils').path;

var PM2_LOG = path.join(__dirname, '../logs', 'pm2.log');

module.exports = function (callback) {
    later.date.localTime();
    later.setInterval(function () {
        var dateLog = 'node-' + date.format('YYYY-MM-DD') + '.log';
        dateLog = path.join(__dirname, '../logs', dateLog);
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
    callback();
};

