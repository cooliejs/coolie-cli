/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-10-24 15:57
 */

'use strict';

var http = require('../libs/http.js');

http('http://registry.npmjs.org/coolie', function (err, data) {
    var json = {};

    try{
        json = JSON.parse(data);
    }catch(err){
        //
    }

    console.log(json);
});