/*!
 * html 去换行和 tab 符
 * @author ydr.me
 * @create 2014-11-03 17:43
 */

'use strict';

var log = require('./log.js');
var dato = require('ydr-util').dato;
var random = require('ydr-util').random;
var REG_LINES = /[\n\r\t]/g;
var REG_SPACES = /\s{2,}/g;
//var REG_COMMENTS = /<!--[\s\S]*?-->/g;
var REG_PRES = /<pre\b.*?>[\s\S]*?<\/pre>/ig;


/**
 * html minify
 * @param file
 * @param code
 * @param [callback]
 */
module.exports = function (file, code, callback) {
    // 保存 <pre>
    var preMap = {};
    code = code.replace(REG_PRES, function ($0) {
        var key = _generateKey();
        
        preMap[key] = $0;
        
        return key;
    });

    
    code = code
        .replace(REG_LINES, '')
        .replace(REG_SPACES, ' ');


    
    dato.each(preMap, function (key, val) {
        code = code.replace(key, val);
    });

    
    //console.log(code);
    
    if (callback) {
        callback(null, code);
    } else {
        return code;
    }
};


function _generateKey() {
    return ':' + random.string(40, 'aA0') + ':';
}


///////////////////////////////
var html = '<!--\n\n\ncomment\n\n\n-->\n\n\n      <pre>a\n\n\n</pre>\n\n\n<!--\n\n\ncomment\n\n\n-->\n\n\n      <pre>a\n\n\n</pre>';
module.exports('', html);
