/*coolie@0.22.0*/
define("0",["4","a"],function(e){"use strict";e("4");e("a");console.log("app/user/index")});
define("6",[],function(y,d,r){r.exports="你好 coolie"});
define("7",[],function(y,d,r){r.exports={"a":1,"b":"中国"}});
define("b",[],function(){console.log("some.js")});
define("a",["6","7","b"],function(l){"use strict";console.log("libs1/all.js");l("6");l("7");l("b")});
coolie.chunk(["0"]);