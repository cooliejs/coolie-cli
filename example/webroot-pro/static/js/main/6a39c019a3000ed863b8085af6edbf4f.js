/*coolie built*/

/* @ref /static/js/app/page1.js */
define("0", ["2", "4"], function (require, exports, module) {alert(require("2") + require("4"));

});


/* @ref /node_modules/a/src/index.js */
define("4", [], function (require, exports, module) {module.exports = ' node_modules a';

});

coolie.chunk(["0"]);