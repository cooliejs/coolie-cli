define(function (require, exports, module) {
    var text = require('../libs2/some.txt', 'text');

    document.getElementById('ret').innerHTML = 'page1: ' + text;
});