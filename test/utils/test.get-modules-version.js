/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-13 16:34
 */


'use strict';

var assert = require('assert');

var getModulesVersion = require('../../src/utils/get-modules-version.js');

describe('utils/get-modules-version', function () {
    it('e', function (done) {
        var modules = [
            'npm',
            'coolie',
            'express'
        ];

        getModulesVersion(modules, function (err, versions) {
            if (err) {
                console.log(err.message);
            }

            if (versions) {
                console.log(versions);
                assert.equal(!!versions.npm, true);
                assert.equal(!!versions.coolie, true);
                assert.equal(!!versions.express, true);
            }

            done();
        });
    });
});

