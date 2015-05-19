/*!
 * 生成版本号
 * @author ydr.me
 * @create 2015-05-19 13:23
 */


'use strict';

var REG_EXT = /\.([^.]+)$/;

module.exports = function (uri, version) {
    return uri.replace(REG_EXT, function ($0, $1) {
        return '.' + version + '.' + $1;
    });
};




/*==============================*/
//var test = function () {
//    console.log(module.exports('/a/b/1.js', 'abcdef123456'));
//};
//test();