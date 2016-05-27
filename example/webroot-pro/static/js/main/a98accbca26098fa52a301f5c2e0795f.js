/*coolie built*/

define("0", ["2", "3"], function (require, exports, module) {
// @ref /static/js/app/index.js




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


define("3", [], function () {
// @ref /static/js/data/json.json

return {"name":"json"};

});

coolie.chunk(["0"]);