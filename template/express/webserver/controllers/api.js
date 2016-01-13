/**
 * api
 * @author ydr.me
 * @create 2016-01-13 21:52
 */


'use strict';

var express = require('express');


var router = express.Router();


router.get('/', function (req, res, next) {
    res.api({
        now: Date.now()
    });
});

module.exports = router;
