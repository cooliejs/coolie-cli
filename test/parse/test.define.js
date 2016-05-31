/**
 * 文件描述
 * @author ydr.me
 * @create 2016-05-31 10:30
 */


'use strict';

var fs = require('fs');
var path = require('path');


var fileAMD = path.join(__dirname, 'src/define-amd.js');
var fileCMD = path.join(__dirname, 'src/define-cmd.js');
var codeAMD = fs.readFileSync(fileAMD, 'utf8');
var codeCMD = fs.readFileSync(fileCMD, 'utf8');


var parseDefine = require('../../parse/define');


describe('parse/define.js', function () {
    it('amd', function () {
        var ret = parseDefine(fileAMD, codeAMD);

        console.log(codeAMD.slice(ret[0], ret[1]));
    });
    
    it('cmd', function () {
        var ret = parseDefine(fileCMD, codeCMD);

        console.log(codeCMD.slice(ret[0], ret[1]));
    });
});


