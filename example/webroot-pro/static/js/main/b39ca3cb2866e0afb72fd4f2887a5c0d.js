/*coolie built*/

/* @ref http://abc.com/1/2/3/static/js/app/page2.js */
define("0", [], function (require, exports, module) {if(CLASSICAL){
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
