/*!
 * JS 压缩
 * @author ydr.me
 * @create 2014-10-23 19:47
 */

'use strict';

var path = require('ydr-utils').path;
var fs = require('fs');
var assert = require('assert');

var minifyJS = require('../../minify/js.js');
var file = path.join(__dirname, '../../example/src/static/js/index3-1.js');

function test() {
    define("0", ["2", "3"], function (require, exports, module) {
        // @ref /static/js/app/index.js

        /**
         * 文件描述
         * @author ydr.me
         * @create 2016-05-16 15:24
         */


        'use strict';

        var hehe = require("2");
        var hehe2 = require("2");
        var hehe3 = require("2");

        require("3");

        require.async("4", function (page1) {
            alert(page1);
        });

        alert('正确');
    });
}

describe('minify/js.js', function () {
    it('e', function () {
        var ret = minifyJS(file, {
            code: test.toString().slice(17, -1)
        });

        console.log(ret);
    });
});


