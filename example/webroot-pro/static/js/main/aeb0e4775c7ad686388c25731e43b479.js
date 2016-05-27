/*coolie built*/

define("0", [], function (require, exports, module) {
// @ref /static/js/app/page2.js

if(CLASSICAL){
    console.log('a');
} else {
    console.log('b')
}

if(typeof CLASSICAL !== 'undefined' && CLASSICAL === true){
    console.log('c');
} else {
    console.log('d');
}

});
