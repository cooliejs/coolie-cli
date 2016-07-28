/*coolie built*/

/* @ref http://abc.com/1/2/3/static/js/app/index.js */
define("0", ["2", "3"], function (require, exports, module) {


    'use strict';

    var hehe = require("2");
    var hehe2 = require("2");
    var hehe3 = require("2");

    require("3");

    require.async("5", function (page1) {
        alert(page1);
    });

    alert('正确');


});


/* @ref http://abc.com/1/2/3/static/js/data/json.json */
define("3", [], function () {return {"name":"json"};

});

coolie.chunk(["0"]);