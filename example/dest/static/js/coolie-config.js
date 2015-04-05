coolie.config({base:"./app/",host:"http://abc.com",version:{"index.js":"6b9abd4a3d58543d","user/index.js":"020eb29b524d7ba6"}}).use().callback(function () {
    alert(123);
}).callback(function () {
    alert(456);
});