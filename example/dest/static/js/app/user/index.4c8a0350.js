/*coolie@0.22.5*/
define("0",["2","8"],function(e){"use strict";e("2");e("8");console.log("app/user/index")});
define("4",[],function(y,d,r){r.exports="你好 coolie"});
define("5",[],function(y,d,r){r.exports={"a":1,"b":"中国"}});
define("9",[],function(){console.log("some.js")});
define("8",["4","5","9"],function(l){"use strict";console.log("libs1/all.js");l("4");l("5");l("9")});
coolie.chunk(["0"]);