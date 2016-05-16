'use strict';


var assert = require('assert');

var json = {
    a: 1,
    b: 2
};
var jsonString = JSON.stringify(json, null, 4);


describe('minify/json.js', function () {
    it('e', function () {
        var minifyJSON = require('../../minify/json.js');
        var ret = minifyJSON(__filename, {
            code: jsonString
        });
        var expect = '{"a":1,"b":2}';

        assert.equal(ret, expect);
    });
});


