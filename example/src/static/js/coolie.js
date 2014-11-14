/*!
 * coolie 苦力
 * @author ydr.me
 * @version 0.1.4
 * @license MIT
 */
!function(){"use strict";function e(e,u){var s,c,l,d={};2===arguments.length?(l=e,d._isAn=!1,d._id=u,d._type="ajax",d._path=i(u),d._deps=[],d._factory=function(e,n,t){t.exports=l.responseText||"",l=null},n(d),R[d._id]=d,O[d._id]={}):G.length&&(c=e,s=G.shift(),d._isAn=""===s[0],d._id=s[0]||c.id,d._type=s[0]?"local":"script",c=null,d._path=d._isAn?i(d._id):"",d._deps=s[1],d._factory=s[2],n(d),R[d._id]=d,O[d._id]={},d._deps.length&&f(d._deps,function(e,n){var t=n.replace(j,""),i=d._isAn?a(d._path,t):t;if(O[i]&&O[i][d._id])throw"module `"+d._id+"` and module `"+i+"` make up a circular dependency relationship";d._deps[e]=i,O[d._id][i]=1,H.push({id:i,by:d._id}),O[i]||(O[i]={},j.test(n)?r(i):o(i))})),S===B&&!G.length&&g&&R[g]&&(f(H,function(e,n){if(!O[n.id])throw"can not found module `"+n.id+"`, but module `"+n.by+"` dependence on it"}),t(g),O=null,G=null,H=null)}function n(e){e.exports={},e._exec=function(){var n=function(n){n=n.replace(j,"");var t=e._isAn?a(i(e._id),n):n;if(!R[t])throw"can not found module `"+t+"`, require in `"+e._id+"`";return R[t]._exec()};return function(){return e._factory.call(window,n,e.exports,e),e.exports}}()}function t(e){if(!R[e])throw"can not found module `"+e+"`";console.log("past "+(Date.now()-b)+" ms"),console.groupEnd("coolie modules"),R[e]._exec()}function o(n){var t,o,r=u(n),i=Date.now();return S++,r?(t=document.createElement("script"),o=function(o){"error"===o.type?console.groupEnd("coolie modules"):(console.log("script module",n,Date.now()-i+"ms"),B++,e(t)),$.removeChild(t)},t.id=n,t.async=!0,t.defer=!0,t.src=p(n),t.onload=t.onerror=o,void $.appendChild(t)):setTimeout(function(){console.log("local module",n,Date.now()-i+"ms"),B++,e()},1)}function r(n){S++;var t=new XMLHttpRequest,o=Date.now(),r=function(){if(200!==t.status&&304!==t.status)throw"can not ajax "+n+", response status is "+t.status;console.log("text module",n,Date.now()-o+"ms"),B++,e(t,n)};t.onload=t.onerror=t.onabort=t.ontimeout=r,t.open("GET",n),t.send(null)}function i(e){return e.replace(A,"/")}function u(e){return(e.replace(j,"").replace(T,"").match(D)||[""])[0]}function a(e,n){var t=(e.match(T)||[""])[0],o=u(e),r=u(n),i=0,a=e.replace(T,""),s=n;switch(o||(a="./"+a),"/"!==a.slice(-1)&&(a+="/"),r||(s="./"+s,r="./"),r){case"./":return t+a+s.slice(2);case"../":for(i=s.match(E).length;i-->0;){if(!q.test(a))throw"can not change path from `"+e+"` to `"+n+"`";a=a.replace(q,"")}return t+a+s.replace(E,"");default:return t+s}}function s(e){var n=[];return e.replace(x,"").replace(y,function(e,t,o){o&&n.push(o)}),n}function c(e){return e&&e instanceof Array}function l(e){return"function"==typeof e}function d(e){return"string"==typeof e}function f(e,n){var t,o;if(c(e))for(t=0,o=e.length;o>t&&n(t,e[t])!==!1;t++);else if("object"==typeof e)for(t in e)if(e.hasOwnProperty(t)&&n(t,e[t])===!1)break}function p(e){return N.version?e+(e.indexOf("?")>-1?"&":"?")+"_="+encodeURIComponent(N.version):e}function m(){var e=document.getElementsByTagName("script");return e[e.length-1]}function h(e){return e.dataset?e.dataset.main:e.getAttribute("data-main")}var w,_,g,b,v="0.1.4",y=/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g,x=/\\\\/g,E=/\.\.\//g,A=/\/([^\/]+)$/,D=/^.*?\//,q=/[^\/]+\/$/,T=/^.*\/\/[^\/]*/,j=/^(css|html|text)!/i,C=m(),$=C.parentNode,k=location.protocol+"//"+location.host+i(a(i(location.pathname),C.getAttribute("src"))),M=h(C),N={base:k},O={},R={},S=0,B=0,G=[],H=[];window.define=function(e,n,t){var o=arguments,r=1===o.length;if(g||(r?g=w:(_=g=e,O={},O[_]={})),r)t=o[0],e="";else{if(!d(e))throw new Error("module id must be a string");if(l(o[1])&&(t=o[1],n=[]),!c(n))throw new Error("module defineModules must be an array")}if(!l(t))throw new Error("module factory must be a function");n=r?s(t.toString()):n,G.push([e,n,t])},window.coolie={version:v,modules:R,config:function(e){return e=e||{},N.base=e.base?a(k,e.base):k,N.version=e.version,this},use:function(e){if(w)throw new Error("can not  execute `coolie.use` twice more");if(!d(N.base))throw new Error("coolie config `base` property must be a string");if(e&&!d(e))throw new Error("main module must be a string");return M&&M!==e&&(e&&console.warn("attribute main is `"+M+"`, but use main is `"+e+"`"),e=M),w=a(N.base,e),b=Date.now(),console.group("coolie modules"),o(w),this}}}();