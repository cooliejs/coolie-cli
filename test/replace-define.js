/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-08-18 18:54
 */


'use strict';


// define(a, b, c) => define(c)
var REG_DEFINE_1 = /([^.\["]|^)\bdefine\((:?[a-zA-Z_$][a-zA-Z_$\d])+,(:?[a-zA-Z_$][a-zA-Z_$\d])+,((:?[a-zA-Z_$][a-zA-Z_$\d])+)\)/;

// define(a, c) => define(c)
var REG_DEFINE_2 = /([^.\["]|^)\bdefine\((:?[a-zA-Z_$][a-zA-Z_$\d])+,((:?[a-zA-Z_$][a-zA-Z_$\d])+)\)/;

// define(c) => define(id, deps, c)
// define(function() => define(id, deps, function()
var REG_DEFINE_3 = /([^.\["]|^)\bdefine\((.*?)\)/;

var str = 'define(function(n,e,f){});';

console.log(str = str.replace(REG_DEFINE_1, '$1define($2)'))
console.log(str = str.replace(REG_DEFINE_2, '$1define($2)'))
console.log(str = str.replace(REG_DEFINE_3, '$1define("id",["deps"],$2)'))


