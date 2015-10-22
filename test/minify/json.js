'use strict';


var json = {
    a: 1,
    b: 2
};
var jsonString = JSON.stringify(json, null, 4);


var minifyJSON = require('../../minify/json.js');

var ret = minifyJSON(__filename, {
    code: jsonString
});

console.log(ret);
