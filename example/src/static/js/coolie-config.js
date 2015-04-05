coolie.config({
    base: './app/',
    host: 'http://abc.com'
}).callback(function () {
    alert(123);
}).use().callback(function () {
    alert(456);
});