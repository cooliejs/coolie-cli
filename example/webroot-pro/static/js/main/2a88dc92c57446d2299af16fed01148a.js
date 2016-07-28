/*coolie built*/

/* @ref http://abc.com/1/2/3/static/js/app/page1.js */
define("0", ["2", "4"], function (require, exports, module) {alert(require("2") + require("4"));

});


/* @ref http://abc.com/1/2/3/node_modules/a/src/index.js */
define("4", [], function (require, exports, module) {module.exports = ' node_modules a';

});

coolie.chunk(["0"]);