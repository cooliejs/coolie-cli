/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-08-18 18:54
 */


'use strict';


// define(a, b, function( => define(function(
var REG_DEFINE_FUNCTION = /([^.\["]|^)\bdefine\(([^,)]*?,){0,2}function\(/;
var REG_DEFINE_1 = /([^.\["]|^)\bdefine\([^,)]*?,[^,)]*?,function\(/;
var REG_DEFINE_2 = /([^.\["]|^)\bdefine\([^,)]*?,function\(/;

// define(a, b, c) => define(c)
var REG_DEFINE_3 = /([^.\["]|^)\bdefine\([^,)]*?,[^,)]*?,([^,)]*?)\)/;

// define(a, c) => define(c)
var REG_DEFINE_4 = /([^.\["]|^)\bdefine\([^,)]*?,([^,)]*?)\)/;

// define(c) => define(id, deps, c)
// define(function() => define(id, deps, function()
var REG_DEFINE_5 = /([^.\["]|^)\bdefine\((.*?)\)/;

var code = '';
//code = 'define("jquery",[],e);';
//code = 'define([],e);';
//code = 'define("jquery",e);';
//code = 'define(e);';
//code = 'define("jquery",[],function(n,e,f){});';
//code = 'define("jquery",function(n,e,f){});';
//code = 'define([],function(n,e,f){});';
//code = 'define(function(n,e,f){});';
code = '!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):"object"==typeof exports?exports.Vue=e():t.Vue=e()}(this,function(){return function(t){function e(i){';

if (REG_DEFINE_FUNCTION.test(code)) {
    //console.log(code = code.replace(REG_DEFINE_1, '$1define(function('), '\n');
    //console.log(code = code.replace(REG_DEFINE_2, '$1define(function('), '\n');
} else {
    console.log(code = code.replace(REG_DEFINE_3, '$1define($2)'), '\n');
    console.log(code = code.replace(REG_DEFINE_4, '$1define($2)'), '\n');
}

console.log(code = code.replace(REG_DEFINE_5, '$1define("id",["deps"],$2)'), '\n');


