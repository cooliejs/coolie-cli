/*coolie built*/

define("0", ["2", "4"], function (require, exports, module) {
// @ref /static/js/app/page1.js

alert(require("2") + require("4"));

});


define("4", [], function (require, exports, module) {
// @ref /node_modules/a/src/index.js

module.exports = ' node_modules a';

});

coolie.chunk(["0"]);