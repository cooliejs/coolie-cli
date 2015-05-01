/*!
 * download alien from aliyun oss
 * @author ydr.me
 * @create 2015-05-01 10:44
 */


'use strict';

var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var request = require('ydr-utils').request;
var random = require('ydr-utils').random;
var pkg = require('../package.json');
var log = require('../libs/log.js');
var AdmZip = require('adm-zip');

module.exports = function (basedir) {
    var url = pkg.alien;
    var tempFile = path.join(basedir, 'alien-'+random.guid() + '.zip');
    var tempStream = fs.createWriteStream(tempFile);
    var unzipPath = path.join(basedir, './alien');

    log('download alien', url);
    request.down({
        url: url,
        query: {
            _: Date.now()
        }
    }, function (err, stream, res) {
        if (err) {
            log('download alien', url, 'error');
            log('download alien', err.message, 'error');
            return process.exit();
        }

        if(res.statusCode !== 200){
            log('download alien', url, 'error');
            log('download alien', 'response statusCode is ' + res.statusCode, 'error');
            return process.exit();
        }

        //stream.pipe(tempStream).on('error', function (err) {
        //    log('download alien', url, 'error');
        //    log('download alien', err.message, 'error');
        //    process.exit();
        //}).on('close', function () {
        //    log('download alien', url, 'success');
        //    log('unzip alien', tempFile);
        //
        //    //var zip = new AdmZip(tempFile);
        //    //
        //    //zip.extractAllTo(unzipPath, true);
        //    //log('unzip alien', unzipPath, 'success');
        //});


        //
        //stream.pipe(unzip.Extract({
        //    path: unzipPath
        //})).on('error', function (err) {
        //    log('unzip alien', url, 'error');
        //    log('unzip alien', err.message, 'error');
        //    process.exit();
        //}).on('close', function () {
        //    log('download alien', unzipPath, 'success');
        //    process.exit();
        //});
    });
};
