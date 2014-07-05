/*
 * Lux: An EDSL for WebGL graphics
 * By Carlos Scheidegger, cscheid@research.att.com
 * 
 * Copyright (c) 2011-2013 AT&T Intellectual Property
 * 
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors: See github logs.
 *
 */

// Lux depends, at least partially, on the following software libraries:
// - underscore.js
// - webgl-debug
// - webgl-utils
// - typeface.js
// attribution notices and licenses for these libraries follow.

////////////////////////////////////////////////////////////////////////////////
// BEGIN UNDERSCORE.JS NOTICE
// 
// Underscore.js 1.1.7
// (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the MIT license.
// Portions of Underscore are inspired or borrowed from Prototype,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore
//
// END UNDERSCORE.JS NOTICE
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// BEGIN WEBGL-DEBUG.JS NOTICE
// https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/sdk/debug/webgl-debug.js
//
// Copyright (c) 2009 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//
// END WEBGL-DEBUG.JS NOTICE
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// BEGIN WEBGL-UTILS.JS NOTICE
// https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/sdk/demos/common/webgl-utils.js
/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
// END WEBGL-UTILS.JS NOTICE
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// BEGIN TYPEFACE.JS NOTICE
/*
typeface.js, version 0.15 | typefacejs.neocracy.org

Copyright (c) 2008 - 2009, David Chester davidchester@gmx.net 

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
 */
// END TYPEFACE.JS NOTICE
////////////////////////////////////////////////////////////////////////////////
!(function() {

var Lux = {};
// yucky globals used throughout Lux. I guess this means I lost.
//
////////////////////////////////////////////////////////////////////////////////

Lux._globals = {
    // stores the active webgl context
    ctx: undefined

    // In addition, Lux stores per-context globals inside the
    // WebGL context variable itself, on the field _lux_globals.
};
// stores references to external libraries to avoid namespace pollution

Lux.Lib = {};
// even though it is requirejs-compatible, 
// underscore detects a browser and pollutes the namespace. stop that.

var _ = (function() {
  var f = function() {

//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,g=e.filter,d=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,w=Object.keys,_=i.bind,j=function(n){return n instanceof j?n:this instanceof j?void(this._wrapped=n):new j(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=j),exports._=j):n._=j,j.VERSION="1.6.0";var A=j.each=j.forEach=function(n,t,e){if(null==n)return n;if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a=j.keys(n),u=0,i=a.length;i>u;u++)if(t.call(e,n[a[u]],a[u],n)===r)return;return n};j.map=j.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e.push(t.call(r,n,u,i))}),e)};var O="Reduce of empty array with no initial value";j.reduce=j.foldl=j.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=j.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(O);return r},j.reduceRight=j.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=j.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=j.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(O);return r},j.find=j.detect=function(n,t,r){var e;return k(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},j.filter=j.select=function(n,t,r){var e=[];return null==n?e:g&&n.filter===g?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&e.push(n)}),e)},j.reject=function(n,t,r){return j.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},j.every=j.all=function(n,t,e){t||(t=j.identity);var u=!0;return null==n?u:d&&n.every===d?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var k=j.some=j.any=function(n,t,e){t||(t=j.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};j.contains=j.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:k(n,function(n){return n===t})},j.invoke=function(n,t){var r=o.call(arguments,2),e=j.isFunction(t);return j.map(n,function(n){return(e?t:n[t]).apply(n,r)})},j.pluck=function(n,t){return j.map(n,j.property(t))},j.where=function(n,t){return j.filter(n,j.matches(t))},j.findWhere=function(n,t){return j.find(n,j.matches(t))},j.max=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.max.apply(Math,n);var e=-1/0,u=-1/0;return A(n,function(n,i,a){var o=t?t.call(r,n,i,a):n;o>u&&(e=n,u=o)}),e},j.min=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.min.apply(Math,n);var e=1/0,u=1/0;return A(n,function(n,i,a){var o=t?t.call(r,n,i,a):n;u>o&&(e=n,u=o)}),e},j.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=j.random(r++),e[r-1]=e[t],e[t]=n}),e},j.sample=function(n,t,r){return null==t||r?(n.length!==+n.length&&(n=j.values(n)),n[j.random(n.length-1)]):j.shuffle(n).slice(0,Math.max(0,t))};var E=function(n){return null==n?j.identity:j.isFunction(n)?n:j.property(n)};j.sortBy=function(n,t,r){return t=E(t),j.pluck(j.map(n,function(n,e,u){return{value:n,index:e,criteria:t.call(r,n,e,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={};return r=E(r),A(t,function(i,a){var o=r.call(e,i,a,t);n(u,o,i)}),u}};j.groupBy=F(function(n,t,r){j.has(n,t)?n[t].push(r):n[t]=[r]}),j.indexBy=F(function(n,t,r){n[t]=r}),j.countBy=F(function(n,t){j.has(n,t)?n[t]++:n[t]=1}),j.sortedIndex=function(n,t,r,e){r=E(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;r.call(e,n[o])<u?i=o+1:a=o}return i},j.toArray=function(n){return n?j.isArray(n)?o.call(n):n.length===+n.length?j.map(n,j.identity):j.values(n):[]},j.size=function(n){return null==n?0:n.length===+n.length?n.length:j.keys(n).length},j.first=j.head=j.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:0>t?[]:o.call(n,0,t)},j.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},j.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},j.rest=j.tail=j.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},j.compact=function(n){return j.filter(n,j.identity)};var M=function(n,t,r){return t&&j.every(n,j.isArray)?c.apply(r,n):(A(n,function(n){j.isArray(n)||j.isArguments(n)?t?a.apply(r,n):M(n,t,r):r.push(n)}),r)};j.flatten=function(n,t){return M(n,t,[])},j.without=function(n){return j.difference(n,o.call(arguments,1))},j.partition=function(n,t){var r=[],e=[];return A(n,function(n){(t(n)?r:e).push(n)}),[r,e]},j.uniq=j.unique=function(n,t,r,e){j.isFunction(t)&&(e=r,r=t,t=!1);var u=r?j.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:j.contains(a,r))||(a.push(r),i.push(n[e]))}),i},j.union=function(){return j.uniq(j.flatten(arguments,!0))},j.intersection=function(n){var t=o.call(arguments,1);return j.filter(j.uniq(n),function(n){return j.every(t,function(t){return j.contains(t,n)})})},j.difference=function(n){var t=c.apply(e,o.call(arguments,1));return j.filter(n,function(n){return!j.contains(t,n)})},j.zip=function(){for(var n=j.max(j.pluck(arguments,"length").concat(0)),t=new Array(n),r=0;n>r;r++)t[r]=j.pluck(arguments,""+r);return t},j.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},j.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=j.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},j.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},j.range=function(n,t,r){arguments.length<=1&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=new Array(e);e>u;)i[u++]=n,n+=r;return i};var R=function(){};j.bind=function(n,t){var r,e;if(_&&n.bind===_)return _.apply(n,o.call(arguments,1));if(!j.isFunction(n))throw new TypeError;return r=o.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(o.call(arguments)));R.prototype=n.prototype;var u=new R;R.prototype=null;var i=n.apply(u,r.concat(o.call(arguments)));return Object(i)===i?i:u}},j.partial=function(n){var t=o.call(arguments,1);return function(){for(var r=0,e=t.slice(),u=0,i=e.length;i>u;u++)e[u]===j&&(e[u]=arguments[r++]);for(;r<arguments.length;)e.push(arguments[r++]);return n.apply(this,e)}},j.bindAll=function(n){var t=o.call(arguments,1);if(0===t.length)throw new Error("bindAll must be passed function names");return A(t,function(t){n[t]=j.bind(n[t],n)}),n},j.memoize=function(n,t){var r={};return t||(t=j.identity),function(){var e=t.apply(this,arguments);return j.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},j.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},j.defer=function(n){return j.delay.apply(j,[n,1].concat(o.call(arguments,1)))},j.throttle=function(n,t,r){var e,u,i,a=null,o=0;r||(r={});var c=function(){o=r.leading===!1?0:j.now(),a=null,i=n.apply(e,u),e=u=null};return function(){var l=j.now();o||r.leading!==!1||(o=l);var f=t-(l-o);return e=this,u=arguments,0>=f?(clearTimeout(a),a=null,o=l,i=n.apply(e,u),e=u=null):a||r.trailing===!1||(a=setTimeout(c,f)),i}},j.debounce=function(n,t,r){var e,u,i,a,o,c=function(){var l=j.now()-a;t>l?e=setTimeout(c,t-l):(e=null,r||(o=n.apply(i,u),i=u=null))};return function(){i=this,u=arguments,a=j.now();var l=r&&!e;return e||(e=setTimeout(c,t)),l&&(o=n.apply(i,u),i=u=null),o}},j.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},j.wrap=function(n,t){return j.partial(t,n)},j.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},j.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},j.keys=function(n){if(!j.isObject(n))return[];if(w)return w(n);var t=[];for(var r in n)j.has(n,r)&&t.push(r);return t},j.values=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},j.pairs=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},j.invert=function(n){for(var t={},r=j.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},j.functions=j.methods=function(n){var t=[];for(var r in n)j.isFunction(n[r])&&t.push(r);return t.sort()},j.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},j.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},j.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)j.contains(r,u)||(t[u]=n[u]);return t},j.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]===void 0&&(n[r]=t[r])}),n},j.clone=function(n){return j.isObject(n)?j.isArray(n)?n.slice():j.extend({},n):n},j.tap=function(n,t){return t(n),n};var S=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof j&&(n=n._wrapped),t instanceof j&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==String(t);case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;var a=n.constructor,o=t.constructor;if(a!==o&&!(j.isFunction(a)&&a instanceof a&&j.isFunction(o)&&o instanceof o)&&"constructor"in n&&"constructor"in t)return!1;r.push(n),e.push(t);var c=0,f=!0;if("[object Array]"==u){if(c=n.length,f=c==t.length)for(;c--&&(f=S(n[c],t[c],r,e)););}else{for(var s in n)if(j.has(n,s)&&(c++,!(f=j.has(t,s)&&S(n[s],t[s],r,e))))break;if(f){for(s in t)if(j.has(t,s)&&!c--)break;f=!c}}return r.pop(),e.pop(),f};j.isEqual=function(n,t){return S(n,t,[],[])},j.isEmpty=function(n){if(null==n)return!0;if(j.isArray(n)||j.isString(n))return 0===n.length;for(var t in n)if(j.has(n,t))return!1;return!0},j.isElement=function(n){return!(!n||1!==n.nodeType)},j.isArray=x||function(n){return"[object Array]"==l.call(n)},j.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){j["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),j.isArguments(arguments)||(j.isArguments=function(n){return!(!n||!j.has(n,"callee"))}),"function"!=typeof/./&&(j.isFunction=function(n){return"function"==typeof n}),j.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},j.isNaN=function(n){return j.isNumber(n)&&n!=+n},j.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},j.isNull=function(n){return null===n},j.isUndefined=function(n){return n===void 0},j.has=function(n,t){return f.call(n,t)},j.noConflict=function(){return n._=t,this},j.identity=function(n){return n},j.constant=function(n){return function(){return n}},j.property=function(n){return function(t){return t[n]}},j.matches=function(n){return function(t){if(t===n)return!0;for(var r in n)if(n[r]!==t[r])return!1;return!0}},j.times=function(n,t,r){for(var e=Array(Math.max(0,n)),u=0;n>u;u++)e[u]=t.call(r,u);return e},j.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))},j.now=Date.now||function(){return(new Date).getTime()};var T={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"}};T.unescape=j.invert(T.escape);var I={escape:new RegExp("["+j.keys(T.escape).join("")+"]","g"),unescape:new RegExp("("+j.keys(T.unescape).join("|")+")","g")};j.each(["escape","unescape"],function(n){j[n]=function(t){return null==t?"":(""+t).replace(I[n],function(t){return T[n][t]})}}),j.result=function(n,t){if(null==n)return void 0;var r=n[t];return j.isFunction(r)?r.call(n):r},j.mixin=function(n){A(j.functions(n),function(t){var r=j[t]=n[t];j.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),z.call(this,r.apply(j,n))}})};var N=0;j.uniqueId=function(n){var t=++N+"";return n?n+t:t},j.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var q=/(.)^/,B={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\t|\u2028|\u2029/g;j.template=function(n,t,r){var e;r=j.defaults({},r,j.templateSettings);var u=new RegExp([(r.escape||q).source,(r.interpolate||q).source,(r.evaluate||q).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(D,function(n){return"\\"+B[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=new Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,j);var c=function(n){return e.call(this,n,j)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},j.chain=function(n){return j(n).chain()};var z=function(n){return this._chain?j(n).chain():n};j.mixin(j),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];j.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],z.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];j.prototype[n]=function(){return z.call(this,t.apply(this._wrapped,arguments))}}),j.extend(j.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}}),"function"==typeof define&&define.amd&&define("underscore",[],function(){return j})}).call(this);
//# sourceMappingURL=underscore-min.map// add a line break here, because underscore-min.js finishes without one.
  };
  var x = {};
  f.call(x);
  return x._;
})();
//Copyright (c) 2009 The Chromium Authors. All rights reserved.
//Use of this source code is governed by a BSD-style license that can be
//found in the LICENSE file.

// Various functions for helping debug WebGL apps.

Lux.Lib.WebGLDebugUtils = function() {

/**
 * Wrapped logging function.
 * @param {string} msg Message to log.
 */
var log = function(msg) {
  if (window.console && window.console.log) {
    window.console.log(msg);
  }
};

/**
 * Which arguements are enums.
 * @type {!Object.<number, string>}
 */
var glValidEnumContexts = {

  // Generic setters and getters

  'enable': { 0:true },
  'disable': { 0:true },
  'getParameter': { 0:true },

  // Rendering

  'drawArrays': { 0:true },
  'drawElements': { 0:true, 2:true },

  // Shaders

  'createShader': { 0:true },
  'getShaderParameter': { 1:true },
  'getProgramParameter': { 1:true },

  // Vertex attributes

  'getVertexAttrib': { 1:true },
  'vertexAttribPointer': { 2:true },

  // Textures

  'bindTexture': { 0:true },
  'activeTexture': { 0:true },
  'getTexParameter': { 0:true, 1:true },
  'texParameterf': { 0:true, 1:true },
  'texParameteri': { 0:true, 1:true, 2:true },
  'texImage2D': { 0:true, 2:true, 6:true, 7:true },
  'texSubImage2D': { 0:true, 6:true, 7:true },
  'copyTexImage2D': { 0:true, 2:true },
  'copyTexSubImage2D': { 0:true },
  'generateMipmap': { 0:true },

  // Buffer objects

  'bindBuffer': { 0:true },
  'bufferData': { 0:true, 2:true },
  'bufferSubData': { 0:true },
  'getBufferParameter': { 0:true, 1:true },

  // Renderbuffers and framebuffers

  'pixelStorei': { 0:true, 1:true },
  'readPixels': { 4:true, 5:true },
  'bindRenderbuffer': { 0:true },
  'bindFramebuffer': { 0:true },
  'checkFramebufferStatus': { 0:true },
  'framebufferRenderbuffer': { 0:true, 1:true, 2:true },
  'framebufferTexture2D': { 0:true, 1:true, 2:true },
  'getFramebufferAttachmentParameter': { 0:true, 1:true, 2:true },
  'getRenderbufferParameter': { 0:true, 1:true },
  'renderbufferStorage': { 0:true, 1:true },

  // Frame buffer operations (clear, blend, depth test, stencil)

  'clear': { 0:true },
  'depthFunc': { 0:true },
  'blendFunc': { 0:true, 1:true },
  'blendFuncSeparate': { 0:true, 1:true, 2:true, 3:true },
  'blendEquation': { 0:true },
  'blendEquationSeparate': { 0:true, 1:true },
  'stencilFunc': { 0:true },
  'stencilFuncSeparate': { 0:true, 1:true },
  'stencilMaskSeparate': { 0:true },
  'stencilOp': { 0:true, 1:true, 2:true },
  'stencilOpSeparate': { 0:true, 1:true, 2:true, 3:true },

  // Culling

  'cullFace': { 0:true },
  'frontFace': { 0:true }
};

/**
 * Map of numbers to names.
 * @type {Object}
 */
var glEnums = null;

/**
 * Initializes this module. Safe to call more than once.
 * @param {!WebGLRenderingContext} ctx A WebGL context. If
 *    you have more than one context it doesn't matter which one
 *    you pass in, it is only used to pull out constants.
 */
function init(ctx) {
  if (glEnums == null) {
    glEnums = { };
    for (var propertyName in ctx) {
      if (typeof ctx[propertyName] == 'number') {
        glEnums[ctx[propertyName]] = propertyName;
      }
    }
  }
}

/**
 * Checks the utils have been initialized.
 */
function checkInit() {
  if (glEnums == null) {
    throw 'WebGLDebugUtils.init(ctx) not called';
  }
}

/**
 * Returns true or false if value matches any WebGL enum
 * @param {*} value Value to check if it might be an enum.
 * @return {boolean} True if value matches one of the WebGL defined enums
 */
function mightBeEnum(value) {
  checkInit();
  return (glEnums[value] !== undefined);
}

/**
 * Gets an string version of an WebGL enum.
 *
 * Example:
 *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
 *
 * @param {number} value Value to return an enum for
 * @return {string} The string version of the enum.
 */
function glEnumToString(value) {
  checkInit();
  var name = glEnums[value];
  return (name !== undefined) ? name :
      ("*UNKNOWN WebGL ENUM (0x" + value.toString(16) + ")");
}

/**
 * Returns the string version of a WebGL argument.
 * Attempts to convert enum arguments to strings.
 * @param {string} functionName the name of the WebGL function.
 * @param {number} argumentIndx the index of the argument.
 * @param {*} value The value of the argument.
 * @return {string} The value as a string.
 */
function glFunctionArgToString(functionName, argumentIndex, value) {
  var funcInfo = glValidEnumContexts[functionName];
  if (funcInfo !== undefined) {
    if (funcInfo[argumentIndex]) {
      return glEnumToString(value);
    }
  }
  return value.toString();
}

/**
 * Given a WebGL context returns a wrapped context that calls
 * gl.getError after every command and calls a function if the
 * result is not gl.NO_ERROR.
 *
 * @param {!WebGLRenderingContext} ctx The webgl context to
 *        wrap.
 * @param {!function(err, funcName, args): void} opt_onErrorFunc
 *        The function to call when gl.getError returns an
 *        error. If not specified the default function calls
 *        console.log with a message.
 */
function makeDebugContext(ctx, opt_onErrorFunc) {
  init(ctx);
  opt_onErrorFunc = opt_onErrorFunc || function(err, functionName, args) {
        // apparently we can't do args.join(",");
        var argStr = "";
        for (var ii = 0; ii < args.length; ++ii) {
          argStr += ((ii == 0) ? '' : ', ') +
              glFunctionArgToString(functionName, ii, args[ii]);
        }
        log("WebGL error "+ glEnumToString(err) + " in "+ functionName +
            "(" + argStr + ")");
      };

  // Holds booleans for each GL error so after we get the error ourselves
  // we can still return it to the client app.
  var glErrorShadow = { };

  // Makes a function that calls a WebGL function and then calls getError.
  function makeErrorWrapper(ctx, functionName) {
    return function() {
      var result = ctx[functionName].apply(ctx, arguments);
      var err = ctx.getError();
      if (err != 0) {
        glErrorShadow[err] = true;
        opt_onErrorFunc(err, functionName, arguments);
      }
      return result;
    };
  }

  // Make a an object that has a copy of every property of the WebGL context
  // but wraps all functions.
  var wrapper = {};
  for (var propertyName in ctx) {
    if (typeof ctx[propertyName] == 'function') {
       wrapper[propertyName] = makeErrorWrapper(ctx, propertyName);
     } else {
       wrapper[propertyName] = ctx[propertyName];
     }
  }

  // Override the getError function with one that returns our saved results.
  wrapper.getError = function() {
    for (var err in glErrorShadow) {
      if (glErrorShadow[err]) {
        glErrorShadow[err] = false;
        return err;
      }
    }
    return ctx.NO_ERROR;
  };

  return wrapper;
}

function resetToInitialState(ctx) {
  var numAttribs = ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS);
  var tmp = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, tmp);
  for (var ii = 0; ii < numAttribs; ++ii) {
    ctx.disableVertexAttribArray(ii);
    ctx.vertexAttribPointer(ii, 4, ctx.FLOAT, false, 0, 0);
    ctx.vertexAttrib1f(ii, 0);
  }
  ctx.deleteBuffer(tmp);

  var numTextureUnits = ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS);
  for (var ii = 0; ii < numTextureUnits; ++ii) {
    ctx.activeTexture(ctx.TEXTURE0 + ii);
    ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, null);
    ctx.bindTexture(ctx.TEXTURE_2D, null);
  }

  ctx.activeTexture(ctx.TEXTURE0);
  ctx.useProgram(null);
  ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);
  ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
  ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
  ctx.disable(ctx.BLEND);
  ctx.disable(ctx.CULL_FACE);
  ctx.disable(ctx.DEPTH_TEST);
  ctx.disable(ctx.DITHER);
  ctx.disable(ctx.SCISSOR_TEST);
  ctx.blendColor(0, 0, 0, 0);
  ctx.blendEquation(ctx.FUNC_ADD);
  ctx.blendFunc(ctx.ONE, ctx.ZERO);
  ctx.clearColor(0, 0, 0, 0);
  ctx.clearDepth(1);
  ctx.clearStencil(-1);
  ctx.colorMask(true, true, true, true);
  ctx.cullFace(ctx.BACK);
  ctx.depthFunc(ctx.LESS);
  ctx.depthMask(true);
  ctx.depthRange(0, 1);
  ctx.frontFace(ctx.CCW);
  ctx.hint(ctx.GENERATE_MIPMAP_HINT, ctx.DONT_CARE);
  ctx.lineWidth(1);
  ctx.pixelStorei(ctx.PACK_ALIGNMENT, 4);
  ctx.pixelStorei(ctx.UNPACK_ALIGNMENT, 4);
  ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);
  ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  // TODO: Delete this IF.
  if (ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL) {
    ctx.pixelStorei(ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL, ctx.BROWSER_DEFAULT_WEBGL);
  }
  ctx.polygonOffset(0, 0);
  ctx.sampleCoverage(1, false);
  ctx.scissor(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.stencilFunc(ctx.ALWAYS, 0, 0xFFFFFFFF);
  ctx.stencilMask(0xFFFFFFFF);
  ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);
  ctx.viewport(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT | ctx.STENCIL_BUFFER_BIT);

  // TODO: This should NOT be needed but Firefox fails with 'hint'
  while(ctx.getError());
}

function makeLostContextSimulatingContext(ctx) {
  var wrapper_ = {};
  var contextId_ = 1;
  var contextLost_ = false;
  var resourceId_ = 0;
  var resourceDb_ = [];
  var onLost_ = undefined;
  var onRestored_ = undefined;
  var nextOnRestored_ = undefined;

  // Holds booleans for each GL error so can simulate errors.
  var glErrorShadow_ = { };

  function isWebGLObject(obj) {
    //return false;
    return (obj instanceof WebGLBuffer ||
            obj instanceof WebGLFramebuffer ||
            obj instanceof WebGLProgram ||
            obj instanceof WebGLRenderbuffer ||
            obj instanceof WebGLShader ||
            obj instanceof WebGLTexture);
  }

  function checkResources(args) {
    for (var ii = 0; ii < args.length; ++ii) {
      var arg = args[ii];
      if (isWebGLObject(arg)) {
        return arg.__webglDebugContextLostId__ == contextId_;
      }
    }
    return true;
  }

  function clearErrors() {
    var k = Object.keys(glErrorShadow_);
    for (var ii = 0; ii < k.length; ++ii) {
      delete glErrorShdow_[k];
    }
  }

  // Makes a function that simulates WebGL when out of context.
  function makeLostContextWrapper(ctx, functionName) {
    var f = ctx[functionName];
    return function() {
      // Only call the functions if the context is not lost.
      if (!contextLost_) {
        if (!checkResources(arguments)) {
          glErrorShadow_[ctx.INVALID_OPERATION] = true;
          return;
        }
        var result = f.apply(ctx, arguments);
        return result;
      }
    };
  }

  for (var propertyName in ctx) {
    if (typeof ctx[propertyName] == 'function') {
       wrapper_[propertyName] = makeLostContextWrapper(ctx, propertyName);
     } else {
       wrapper_[propertyName] = ctx[propertyName];
     }
  }

  function makeWebGLContextEvent(statusMessage) {
    return {statusMessage: statusMessage};
  }

  function freeResources() {
    for (var ii = 0; ii < resourceDb_.length; ++ii) {
      var resource = resourceDb_[ii];
      if (resource instanceof WebGLBuffer) {
        ctx.deleteBuffer(resource);
      } else if (resource instanceof WebctxFramebuffer) {
        ctx.deleteFramebuffer(resource);
      } else if (resource instanceof WebctxProgram) {
        ctx.deleteProgram(resource);
      } else if (resource instanceof WebctxRenderbuffer) {
        ctx.deleteRenderbuffer(resource);
      } else if (resource instanceof WebctxShader) {
        ctx.deleteShader(resource);
      } else if (resource instanceof WebctxTexture) {
        ctx.deleteTexture(resource);
      }
    }
  }

  wrapper_.loseContext = function() {
    if (!contextLost_) {
      contextLost_ = true;
      ++contextId_;
      while (ctx.getError());
      clearErrors();
      glErrorShadow_[ctx.CONTEXT_LOST_WEBGL] = true;
      setTimeout(function() {
          if (onLost_) {
            onLost_(makeWebGLContextEvent("context lost"));
          }
        }, 0);
    }
  };

  wrapper_.restoreContext = function() {
    if (contextLost_) {
      if (onRestored_) {
        setTimeout(function() {
            freeResources();
            resetToInitialState(ctx);
            contextLost_ = false;
            if (onRestored_) {
              var callback = onRestored_;
              onRestored_ = nextOnRestored_;
              nextOnRestored_ = undefined;
              callback(makeWebGLContextEvent("context restored"));
            }
          }, 0);
      } else {
        throw "You can not restore the context without a listener"
      }
    }
  };

  // Wrap a few functions specially.
  wrapper_.getError = function() {
    if (!contextLost_) {
      var err;
      while (err = ctx.getError()) {
        glErrorShadow_[err] = true;
      }
    }
    for (var err in glErrorShadow_) {
      if (glErrorShadow_[err]) {
        delete glErrorShadow_[err];
        return err;
      }
    }
    return ctx.NO_ERROR;
  };

  var creationFunctions = [
    "createBuffer",
    "createFramebuffer",
    "createProgram",
    "createRenderbuffer",
    "createShader",
    "createTexture"
  ];
  for (var ii = 0; ii < creationFunctions.length; ++ii) {
    var functionName = creationFunctions[ii];
    wrapper_[functionName] = function(f) {
      return function() {
        if (contextLost_) {
          return null;
        }
        var obj = f.apply(ctx, arguments);
        obj.__webglDebugContextLostId__ = contextId_;
        resourceDb_.push(obj);
        return obj;
      };
    }(ctx[functionName]);
  }

  var functionsThatShouldReturnNull = [
    "getActiveAttrib",
    "getActiveUniform",
    "getBufferParameter",
    "getContextAttributes",
    "getAttachedShaders",
    "getFramebufferAttachmentParameter",
    "getParameter",
    "getProgramParameter",
    "getProgramInfoLog",
    "getRenderbufferParameter",
    "getShaderParameter",
    "getShaderInfoLog",
    "getShaderSource",
    "getTexParameter",
    "getUniform",
    "getUniformLocation",
    "getVertexAttrib"
  ];
  for (var ii = 0; ii < functionsThatShouldReturnNull.length; ++ii) {
    var functionName = functionsThatShouldReturnNull[ii];
    wrapper_[functionName] = function(f) {
      return function() {
        if (contextLost_) {
          return null;
        }
        return f.apply(ctx, arguments);
      }
    }(wrapper_[functionName]);
  }

  var isFunctions = [
    "isBuffer",
    "isEnabled",
    "isFramebuffer",
    "isProgram",
    "isRenderbuffer",
    "isShader",
    "isTexture"
  ];
  for (var ii = 0; ii < isFunctions.length; ++ii) {
    var functionName = isFunctions[ii];
    wrapper_[functionName] = function(f) {
      return function() {
        if (contextLost_) {
          return false;
        }
        return f.apply(ctx, arguments);
      }
    }(wrapper_[functionName]);
  }

  wrapper_.checkFramebufferStatus = function(f) {
    return function() {
      if (contextLost_) {
        return ctx.FRAMEBUFFER_UNSUPPORTED;
      }
      return f.apply(ctx, arguments);
    };
  }(wrapper_.checkFramebufferStatus);

  wrapper_.getAttribLocation = function(f) {
    return function() {
      if (contextLost_) {
        return -1;
      }
      return f.apply(ctx, arguments);
    };
  }(wrapper_.getAttribLocation);

  wrapper_.getVertexAttribOffset = function(f) {
    return function() {
      if (contextLost_) {
        return 0;
      }
      return f.apply(ctx, arguments);
    };
  }(wrapper_.getVertexAttribOffset);

  wrapper_.isContextLost = function() {
    return contextLost_;
  };

  function wrapEvent(listener) {
    if (typeof(listener) == "function") {
      return listener;
    } else {
      return function(info) {
        listener.handleEvent(info);
      }
    }
  }

  wrapper_.registerOnContextLostListener = function(listener) {
    onLost_ = wrapEvent(listener);
  };

  wrapper_.registerOnContextRestoredListener = function(listener) {
    if (contextLost_) {
      nextOnRestored_ = wrapEvent(listener);
    } else {
      onRestored_ = wrapEvent(listener);
    }
  }

  return wrapper_;
}

return {
  /**
   * Initializes this module. Safe to call more than once.
   * @param {!WebGLRenderingContext} ctx A WebGL context. If
   *    you have more than one context it doesn't matter which one
   *    you pass in, it is only used to pull out constants.
   */
  'init': init,

  /**
   * Returns true or false if value matches any WebGL enum
   * @param {*} value Value to check if it might be an enum.
   * @return {boolean} True if value matches one of the WebGL defined enums
   */
  'mightBeEnum': mightBeEnum,

  /**
   * Gets an string version of an WebGL enum.
   *
   * Example:
   *   WebGLDebugUtil.init(ctx);
   *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
   *
   * @param {number} value Value to return an enum for
   * @return {string} The string version of the enum.
   */
  'glEnumToString': glEnumToString,

  /**
   * Converts the argument of a WebGL function to a string.
   * Attempts to convert enum arguments to strings.
   *
   * Example:
   *   WebGLDebugUtil.init(ctx);
   *   var str = WebGLDebugUtil.glFunctionArgToString('bindTexture', 0, gl.TEXTURE_2D);
   *
   * would return 'TEXTURE_2D'
   *
   * @param {string} functionName the name of the WebGL function.
   * @param {number} argumentIndx the index of the argument.
   * @param {*} value The value of the argument.
   * @return {string} The value as a string.
   */
  'glFunctionArgToString': glFunctionArgToString,

  /**
   * Given a WebGL context returns a wrapped context that calls
   * gl.getError after every command and calls a function if the
   * result is not NO_ERROR.
   *
   * You can supply your own function if you want. For example, if you'd like
   * an exception thrown on any GL error you could do this
   *
   *    function throwOnGLError(err, funcName, args) {
   *      throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to" +
   *            funcName;
   *    };
   *
   *    ctx = WebGLDebugUtils.makeDebugContext(
   *        canvas.getContext("webgl"), throwOnGLError);
   *
   * @param {!WebGLRenderingContext} ctx The webgl context to wrap.
   * @param {!function(err, funcName, args): void} opt_onErrorFunc The function
   *     to call when gl.getError returns an error. If not specified the default
   *     function calls console.log with a message.
   */
  'makeDebugContext': makeDebugContext,

  /**
   * Given a WebGL context returns a wrapped context that adds 4
   * functions.
   *
   * ctx.loseContext:
   *   simulates a lost context event.
   *
   * ctx.restoreContext:
   *   simulates the context being restored.
   *
   * ctx.registerOnContextLostListener(listener):
   *   lets you register a listener for context lost. Use instead
   *   of addEventListener('webglcontextlostevent', listener);
   *
   * ctx.registerOnContextRestoredListener(listener):
   *   lets you register a listener for context restored. Use
   *   instead of addEventListener('webglcontextrestored',
   *   listener);
   *
   * @param {!WebGLRenderingContext} ctx The webgl context to wrap.
   */
  'makeLostContextSimulatingContext': makeLostContextSimulatingContext,

  /**
   * Resets a context to the initial state.
   * @param {!WebGLRenderingContext} ctx The webgl context to
   *     reset.
   */
  'resetToInitialState': resetToInitialState
};

}();
/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/**
 * @fileoverview This file contains functions every webgl program will need
 * a version of one way or another.
 *
 * Instead of setting up a context manually it is recommended to
 * use. This will check for success or failure. On failure it
 * will attempt to present an approriate message to the user.
 *
 *       gl = WebGLUtils.setupWebGL(canvas);
 *
 * For animated WebGL apps use of setTimeout or setInterval are
 * discouraged. It is recommended you structure your rendering
 * loop like this.
 *
 *       function render() {
 *         window.requestAnimationFrame(render, canvas);
 *
 *         // do rendering
 *         ...
 *       }
 *       render();
 *
 * This will call your rendering function up to the refresh rate
 * of your display but will stop rendering if your app is not
 * visible.
 */

Lux.Lib.WebGLUtils = function() {

/**
 * Creates the HTML for a failure message
 * @param {string} canvasContainerId id of container of th
 *        canvas.
 * @return {string} The html.
 */
var makeFailHTML = function(msg) {
  return '' +
    '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
    '<td align="center">' +
    '<div style="display: table-cell; vertical-align: middle;">' +
    '<div style="">' + msg + '</div>' +
    '</div>' +
    '</td></tr></table>';
};

/**
 * Message for getting a webgl browser
 * @type {string}
 */
var GET_A_WEBGL_BROWSER = '' +
  'This page requires a browser that supports WebGL.<br/>' +
  '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

/**
 * Mesasge for need better hardware
 * @type {string}
 */
var OTHER_PROBLEM = '' +
  "It doesn't appear your computer can support WebGL.<br/>" +
  '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';

/**
 * Creates a webgl context. If creation fails it will
 * change the contents of the container of the <canvas>
 * tag to an error message with the correct links for WebGL.
 * @param {Element} canvas. The canvas element to create a
 *     context from.
 * @param {WebGLContextCreationAttirbutes} opt_attribs Any
 *     creation attributes you want to pass in.
 * @return {WebGLRenderingContext} The created context.
 */
var setupWebGL = function(canvas, opt_attribs) {
  function showLink(str) {
    var container = canvas.parentNode;
    if (container) {
      container.innerHTML = makeFailHTML(str);
    }
  };

  if (!window.WebGLRenderingContext) {
    showLink(GET_A_WEBGL_BROWSER);
    return null;
  }

  var context = create3DContext(canvas, opt_attribs);
  if (!context) {
    showLink(OTHER_PROBLEM);
  }
  return context;
};

/**
 * Creates a webgl context.
 * @param {!Canvas} canvas The canvas tag to get context
 *     from. If one is not passed in one will be created.
 * @return {!WebGLContext} The created context.
 */
var create3DContext = function(canvas, opt_attribs) {
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  var context = null;
  for (var ii = 0; ii < names.length; ++ii) {
    try {
      context = canvas.getContext(names[ii], opt_attribs);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  return context;
};

return {
  create3DContext: create3DContext,
  setupWebGL: setupWebGL
};
}();

/**
 * Provides requestAnimationFrame in a cross browser way.
 */
if (typeof window.requestAnimationFrame === "undefined") {
    window.requestAnimationFrame = (function() {

        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
                window.setTimeout(callback, 1000/60);
            };
    })();
}


Lux.Lib.tessellate = (function() {

var define = undefined; // hide requirejs so we can just inline the definition... ugh
var tess = function() {
!(function() {
    var Module = {};

var emscriptenate = function(Module) {
// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    return rawList ? list : ret + flushList();
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 2744;


/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });

var _stderr;
var _stderr=_stderr=allocate(1, "i32*", ALLOC_STATIC);






































































































































































/* memory initializer */ allocate([69,100,103,101,83,105,103,110,40,32,100,115,116,85,112,44,32,116,101,115,115,45,62,101,118,101,110,116,44,32,111,114,103,85,112,32,41,32,60,61,32,48,0,0,0,0,0,0,101,45,62,79,114,103,32,61,61,32,118,0,0,0,0,0,33,32,86,101,114,116,69,113,40,32,100,115,116,76,111,44,32,100,115,116,85,112,32,41,0,0,0,0,0,0,0,0,99,104,105,108,100,32,60,61,32,112,113,45,62,109,97,120,0,0,0,0,0,0,0,0,118,45,62,112,114,101,118,32,61,61,32,118,80,114,101,118,0,0,0,0,0,0,0,0,114,101,103,80,114,101,118,45,62,119,105,110,100,105,110,103,78,117,109,98,101,114,32,45,32,101,45,62,119,105,110,100,105,110,103,32,61,61,32,114,101,103,45,62,119,105,110,100,105,110,103,78,117,109,98,101,114,0,0,0,0,0,0,0,69,82,82,79,82,44,32,99,97,110,39,116,32,104,97,110,100,108,101,32,37,100,10,0,99,117,114,114,32,60,32,112,113,45,62,109,97,120,32,38,38,32,112,113,45,62,107,101,121,115,91,99,117,114,114,93,32,33,61,32,78,85,76,76,0,0,0,0,0,0,0,0,102,45,62,112,114,101,118,32,61,61,32,102,80,114,101,118,32,38,38,32,102,45,62,97,110,69,100,103,101,32,61,61,32,78,85,76,76,32,38,38,32,102,45,62,100,97,116,97,32,61,61,32,78,85,76,76,0,0,0,0,0,0,0,0,117,112,45,62,76,110,101,120,116,32,33,61,32,117,112,32,38,38,32,117,112,45,62,76,110,101,120,116,45,62,76,110,101,120,116,32,33,61,32,117,112,0,0,0,0,0,0,0,86,101,114,116,76,101,113,40,32,101,45,62,79,114,103,44,32,101,45,62,68,115,116,32,41,0,0,0,0,0,0,0,99,117,114,114,32,33,61,32,76,79,78,71,95,77,65,88,0,0,0,0,0,0,0,0,101,45,62,76,102,97,99,101,32,61,61,32,102,0,0,0,114,101,103,45,62,101,85,112,45,62,119,105,110,100,105,110,103,32,61,61,32,48,0,0,76,69,81,40,32,42,42,40,105,43,49,41,44,32,42,42,105,32,41,0,0,0,0,0,101,45,62,79,110,101,120,116,45,62,83,121,109,45,62,76,110,101,120,116,32,61,61,32,101,0,0,0,0,0,0,0,101,45,62,76,110,101,120,116,32,33,61,32,101,0,0,0,114,101,103,45,62,119,105,110,100,105,110,103,78,117,109,98,101,114,32,61,61,32,48,0,112,114,105,111,114,105,116,121,113,46,99,0,0,0,0,0,101,45,62,76,110,101,120,116,45,62,79,110,101,120,116,45,62,83,121,109,32,61,61,32,101,0,0,0,0,0,0,0,102,114,101,101,95,104,97,110,100,108,101,32,33,61,32,76,79,78,71,95,77,65,88,0,43,43,102,105,120,101,100,69,100,103,101,115,32,61,61,32,49,0,0,0,0,0,0,0,112,113,32,33,61,32,78,85,76,76,0,0,0,0,0,0,115,105,122,101,32,61,61,32,49,0,0,0,0,0,0,0,86,101,114,116,76,101,113,40,32,117,44,32,118,32,41,32,38,38,32,86,101,114,116,76,101,113,40,32,118,44,32,119,32,41,0,0,0,0,0,0,101,45,62,83,121,109,45,62,83,121,109,32,61,61,32,101,0,0,0,0,0,0,0,0,108,111,45,62,76,110,101,120,116,32,33,61,32,117,112,0,114,101,103,45,62,102,105,120,85,112,112,101,114,69,100,103,101,0,0,0,0,0,0,0,104,67,117,114,114,32,62,61,32,49,32,38,38,32,104,67,117,114,114,32,60,61,32,112,113,45,62,109,97,120,32,38,38,32,104,91,104,67,117,114,114,93,46,107,101,121,32,33,61,32,78,85,76,76,0,0,84,114,97,110,115,76,101,113,40,32,117,44,32,118,32,41,32,38,38,32,84,114,97,110,115,76,101,113,40,32,118,44,32,119,32,41,0,0,0,0,115,105,122,101,32,61,61,32,48,0,0,0,0,0,0,0,101,45,62,83,121,109,32,33,61,32,101,0,0,0,0,0,84,79,76,69,82,65,78,67,69,95,78,79,78,90,69,82,79,0,0,0,0,0,0,0,70,65,76,83,69,0,0,0,33,32,86,101,114,116,69,113,40,32,101,85,112,45,62,68,115,116,44,32,101,76,111,45,62,68,115,116,32,41,0,0,116,101,115,115,109,111,110,111,46,99,0,0,0,0,0,0,105,115,101,99,116,46,115,32,60,61,32,77,65,88,40,32,111,114,103,76,111,45,62,115,44,32,111,114,103,85,112,45,62,115,32,41,0,0,0,0,77,73,78,40,32,100,115,116,76,111,45,62,115,44,32,100,115,116,85,112,45,62,115,32,41,32,60,61,32,105,115,101,99,116,46,115,0,0,0,0,102,45,62,109,97,114,107,101,100,0,0,0,0,0,0,0,115,119,101,101,112,46,99,0,105,115,101,99,116,46,116,32,60,61,32,77,65,88,40,32,111,114,103,76,111,45,62,116,44,32,100,115,116,76,111,45,62,116,32,41,0,0,0,0,101,45,62,83,121,109,45,62,110,101,120,116,32,61,61,32,101,80,114,101,118,45,62,83,121,109,32,38,38,32,101,45,62,83,121,109,32,61,61,32,38,109,101,115,104,45,62,101,72,101,97,100,83,121,109,32,38,38,32,101,45,62,83,121,109,45,62,83,121,109,32,61,61,32,101,32,38,38,32,101,45,62,79,114,103,32,61,61,32,78,85,76,76,32,38,38,32,101,45,62,68,115,116,32,61,61,32,78,85,76,76,32,38,38,32,101,45,62,76,102,97,99,101,32,61,61,32,78,85,76,76,32,38,38,32,101,45,62,82,102,97,99,101,32,61,61,32,78,85,76,76,0,46,47,112,114,105,111,114,105,116,121,113,45,104,101,97,112,46,99,0,0,0,0,0,0,77,73,78,40,32,111,114,103,85,112,45,62,116,44,32,100,115,116,85,112,45,62,116,32,41,32,60,61,32,105,115,101,99,116,46,116,0,0,0,0,103,101,111,109,46,99,0,0,101,45,62,68,115,116,32,33,61,32,78,85,76,76,0,0,33,32,114,101,103,85,112,45,62,102,105,120,85,112,112,101,114,69,100,103,101,32,38,38,32,33,32,114,101,103,76,111,45,62,102,105,120,85,112,112,101,114,69,100,103,101,0,0,101,45,62,79,114,103,32,33,61,32,78,85,76,76,0,0,114,101,110,100,101,114,46,99,0,0,0,0,0,0,0,0,111,114,103,85,112,32,33,61,32,116,101,115,115,45,62,101,118,101,110,116,32,38,38,32,111,114,103,76,111,32,33,61,32,116,101,115,115,45,62,101,118,101,110,116,0,0,0,0,101,45,62,83,121,109,45,62,110,101,120,116,32,61,61,32,101,80,114,101,118,45,62,83,121,109,0,0,0,0,0,0,69,100,103,101,83,105,103,110,40,32,100,115,116,76,111,44,32,116,101,115,115,45,62,101,118,101,110,116,44,32,111,114,103,76,111,32,41,32,62,61,32,48,0,0,0,0,0,0,118,45,62,112,114,101,118,32,61,61,32,118,80,114,101,118,32,38,38,32,118,45,62,97,110,69,100,103,101,32,61,61,32,78,85,76,76,32,38,38,32,118,45,62,100,97,116,97,32,61,61,32,78,85,76,76,0,0,0,0,0,0,0,0,109,101,115,104,46,99,0,0,102,45,62,112,114,101,118,32,61,61,32,102,80,114,101,118,0,0,0,0,0,0,0,0,95,95,103,108,95,116,114,97,110,115,83,105,103,110,0,0,95,95,103,108,95,116,114,97,110,115,69,118,97,108,0,0,95,95,103,108,95,114,101,110,100,101,114,77,101,115,104,0,95,95,103,108,95,112,113,83,111,114,116,73,110,115,101,114,116,0,0,0,0,0,0,0,95,95,103,108,95,112,113,83,111,114,116,73,110,105,116,0,95,95,103,108,95,112,113,83,111,114,116,68,101,108,101,116,101,80,114,105,111,114,105,116,121,81,0,0,0,0,0,0,95,95,103,108,95,112,113,83,111,114,116,68,101,108,101,116,101,0,0,0,0,0,0,0,95,95,103,108,95,112,113,72,101,97,112,73,110,115,101,114,116,0,0,0,0,0,0,0,95,95,103,108,95,112,113,72,101,97,112,68,101,108,101,116,101,0,0,0,0,0,0,0,95,95,103,108,95,109,101,115,104,84,101,115,115,101,108,108,97,116,101,77,111,110,111,82,101,103,105,111,110,0,0,0,95,95,103,108,95,109,101,115,104,67,104,101,99,107,77,101,115,104,0,0,0,0,0,0,95,95,103,108,95,101,100,103,101,83,105,103,110,0,0,0,95,95,103,108,95,101,100,103,101,69,118,97,108,0,0,0,82,101,110,100,101,114,84,114,105,97,110,103,108,101,0,0,82,101,110,100,101,114,83,116,114,105,112,0,0,0,0,0,82,101,110,100,101,114,70,97,110,0,0,0,0,0,0,0,82,101,109,111,118,101,68,101,103,101,110,101,114,97,116,101,70,97,99,101,115,0,0,0,73,115,87,105,110,100,105,110,103,73,110,115,105,100,101,0,70,108,111,97,116,68,111,119,110,0,0,0,0,0,0,0,70,105,120,85,112,112,101,114,69,100,103,101,0,0,0,0,68,111,110,101,69,100,103,101,68,105,99,116,0,0,0,0,68,101,108,101,116,101,82,101,103,105,111,110,0,0,0,0,67,111,110,110,101,99,116,76,101,102,116,68,101,103,101,110,101,114,97,116,101,0,0,0,67,104,101,99,107,70,111,114,76,101,102,116,83,112,108,105,99,101,0,0,0,0,0,0,67,104,101,99,107,70,111,114,73,110,116,101,114,115,101,99,116,0,0,0,0,0,0,0,65,100,100,82,105,103,104,116,69,100,103,101,115,0,0,0,0,0,0,63,0,0,0,63,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);



var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }

  
   
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i64=_memset;

  function _llvm_lifetime_start() {}

  function _llvm_lifetime_end() {}

  
  
  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      return FS.getStreamFromPtr(stream).fd;
    }function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr;
      var fd = _fileno(stream);
      var ret = _write(fd, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _putchar(c) {
      // int putchar(int c);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/putchar.html
      return _fputc(c, HEAP32[((_stdout)>>2)]);
    } 
  Module["_saveSetjmp"] = _saveSetjmp;
  
   
  Module["_testSetjmp"] = _testSetjmp;var _setjmp=undefined;

  function _longjmp(env, value) {
      asm['setThrew'](env, value || 1);
      throw 'longjmp';
    }

  var _llvm_memset_p0i8_i32=_memset;

  
  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  
  function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }

  function _abort() {
      Module['abort']();
    }

  function ___errno_location() {
      return ___errno_state;
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }






  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
  
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


var Math_min = Math.min;
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_i(index) {
  try {
    return Module["dynCall_i"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env._stderr|0;var n=+env.NaN;var o=+env.Infinity;var p=0;var q=0;var r=0;var s=0;var t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0.0;var C=0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=global.Math.floor;var N=global.Math.abs;var O=global.Math.sqrt;var P=global.Math.pow;var Q=global.Math.cos;var R=global.Math.sin;var S=global.Math.tan;var T=global.Math.acos;var U=global.Math.asin;var V=global.Math.atan;var W=global.Math.atan2;var X=global.Math.exp;var Y=global.Math.log;var Z=global.Math.ceil;var _=global.Math.imul;var $=env.abort;var aa=env.assert;var ba=env.asmPrintInt;var ca=env.asmPrintFloat;var da=env.min;var ea=env.invoke_viiiii;var fa=env.invoke_i;var ga=env.invoke_vi;var ha=env.invoke_vii;var ia=env.invoke_iiii;var ja=env.invoke_ii;var ka=env.invoke_viii;var la=env.invoke_v;var ma=env.invoke_iii;var na=env.invoke_viiii;var oa=env._llvm_lifetime_end;var pa=env.___assert_fail;var qa=env._abort;var ra=env._fprintf;var sa=env._fflush;var ta=env._fputc;var ua=env._sysconf;var va=env.___setErrNo;var wa=env._fwrite;var xa=env._write;var ya=env._send;var za=env._longjmp;var Aa=env.__reallyNegative;var Ba=env.__formatString;var Ca=env._emscripten_memcpy_big;var Da=env._fileno;var Ea=env._pwrite;var Fa=env._putchar;var Ga=env._sbrk;var Ha=env.___errno_location;var Ia=env._llvm_lifetime_start;var Ja=env._mkport;var Ka=env._time;var La=0.0;
// EMSCRIPTEN_START_FUNCS
function Wa(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function Xa(){return i|0}function Ya(a){a=a|0;i=a}function Za(a,b){a=a|0;b=b|0;if((p|0)==0){p=a;q=b}}function _a(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function $a(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function ab(a){a=a|0;C=a}function bb(a){a=a|0;D=a}function cb(a){a=a|0;E=a}function db(a){a=a|0;F=a}function eb(a){a=a|0;G=a}function fb(a){a=a|0;H=a}function gb(a){a=a|0;I=a}function hb(a){a=a|0;J=a}function ib(a){a=a|0;K=a}function jb(a){a=a|0;L=a}function kb(){}function lb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=Qc(20)|0;if((d|0)==0){e=0;return e|0}f=d;c[d>>2]=0;c[d+4>>2]=f;c[d+8>>2]=f;c[d+12>>2]=a;c[d+16>>2]=b;e=d;return e|0}function mb(a){a=a|0;var b=0,d=0,e=0,f=0;b=a|0;d=c[a+4>>2]|0;if((d|0)==(b|0)){e=a;Rc(e);return}else{f=d}while(1){d=c[f+4>>2]|0;Rc(f);if((d|0)==(b|0)){break}else{f=d}}e=a;Rc(e);return}function nb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=a+16|0;f=a+12|0;a=b;do{a=c[a+8>>2]|0;b=c[a>>2]|0;if((b|0)==0){break}}while((Qa[c[e>>2]&7](c[f>>2]|0,b,d)|0)==0);f=Qc(12)|0;e=f;if((f|0)==0){g=0;return g|0}c[f>>2]=d;d=a+4|0;c[f+4>>2]=c[d>>2];c[(c[d>>2]|0)+8>>2]=e;c[f+8>>2]=a;c[d>>2]=e;g=e;return g|0}function ob(a,b){a=a|0;b=b|0;var d=0;a=b+8|0;d=b+4|0;c[(c[d>>2]|0)+8>>2]=c[a>>2];c[(c[a>>2]|0)+4>>2]=c[d>>2];Rc(b);return}function pb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=a+16|0;e=a+12|0;f=a|0;while(1){g=c[f+4>>2]|0;a=c[g>>2]|0;if((a|0)==0){h=4;break}if((Qa[c[d>>2]&7](c[e>>2]|0,b,a)|0)==0){f=g}else{h=4;break}}if((h|0)==4){return g|0}return 0}function qb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;b=Qc(64)|0;d=b;e=Qc(64)|0;f=e;g=Qc(28)|0;h=g;i=(b|0)==0;j=(e|0)==0;k=(g|0)==0;if(i|j|k){if(!i){Rc(b)}if(!j){Rc(e)}if(k){l=0;return l|0}Rc(g);l=0;return l|0}k=a+92|0;j=Qc(64)|0;if((j|0)==0){Rc(b);Rc(e);Rc(g);l=0;return l|0}i=j;m=j+32|0;n=m;o=c[a+96>>2]|0;p=o>>>0<k>>>0?o:k;k=p+4|0;o=c[c[k>>2]>>2]|0;c[m>>2]=o;c[c[o+4>>2]>>2]=i;c[j>>2]=p;c[c[k>>2]>>2]=n;k=j+4|0;c[k>>2]=n;c[j+8>>2]=i;c[j+12>>2]=n;Vc(j+16|0,0,16)|0;c[j+36>>2]=i;c[j+40>>2]=n;c[j+44>>2]=i;Vc(j+48|0,0,16)|0;j=a|0;n=a+4|0;p=c[n>>2]|0;c[b+4>>2]=p;c[p>>2]=d;c[b>>2]=j;c[n>>2]=d;c[b+8>>2]=i;c[b+12>>2]=0;b=i;do{c[b+16>>2]=d;b=c[b+8>>2]|0;}while((b|0)!=(i|0));b=c[k>>2]|0;k=c[n>>2]|0;c[e+4>>2]=k;c[k>>2]=f;c[e>>2]=j;c[n>>2]=f;c[e+8>>2]=b;c[e+12>>2]=0;e=b;do{c[e+16>>2]=f;e=c[e+8>>2]|0;}while((e|0)!=(b|0));b=a+68|0;e=c[b>>2]|0;c[g+4>>2]=e;c[e>>2]=h;c[g>>2]=a+64;c[b>>2]=h;c[g+8>>2]=i;c[g+12>>2]=0;c[g+16>>2]=0;c[g+20>>2]=0;c[g+24>>2]=c[a+88>>2];a=i;while(1){c[a+20>>2]=h;g=c[a+12>>2]|0;if((g|0)==(i|0)){l=i;break}else{a=g}}return l|0}function rb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((a|0)==(b|0)){d=1;return d|0}e=c[b+16>>2]|0;f=a+16|0;g=c[f>>2]|0;if((e|0)==(g|0)){h=0}else{i=c[e+8>>2]|0;j=i;do{c[j+16>>2]=g;j=c[j+8>>2]|0;}while((j|0)!=(i|0));i=c[e+4>>2]|0;j=c[e>>2]|0;c[j+4>>2]=i;c[i>>2]=j;Rc(e);h=1}e=c[b+20>>2]|0;j=a+20|0;i=c[j>>2]|0;if((e|0)==(i|0)){k=0}else{g=c[e+8>>2]|0;l=g;do{c[l+20>>2]=i;l=c[l+12>>2]|0;}while((l|0)!=(g|0));g=c[e+4>>2]|0;l=c[e>>2]|0;c[l+4>>2]=g;c[g>>2]=l;Rc(e);k=1}e=b+8|0;l=c[e>>2]|0;g=a+8|0;i=c[g>>2]|0;c[(c[l+4>>2]|0)+12>>2]=a;c[(c[i+4>>2]|0)+12>>2]=b;c[e>>2]=i;c[g>>2]=l;if((h|0)==0){h=Qc(64)|0;l=h;if((h|0)==0){d=0;return d|0}g=c[f>>2]|0;i=g+4|0;e=c[i>>2]|0;c[h+4>>2]=e;c[e>>2]=l;c[h>>2]=g;c[i>>2]=l;c[h+8>>2]=b;c[h+12>>2]=0;h=b;do{c[h+16>>2]=l;h=c[h+8>>2]|0;}while((h|0)!=(b|0));c[(c[f>>2]|0)+8>>2]=a}if((k|0)!=0){d=1;return d|0}k=Qc(28)|0;f=k;if((k|0)==0){d=0;return d|0}h=c[j>>2]|0;l=h+4|0;i=c[l>>2]|0;c[k+4>>2]=i;c[i>>2]=f;c[k>>2]=h;c[l>>2]=f;c[k+8>>2]=b;c[k+12>>2]=0;c[k+16>>2]=0;c[k+20>>2]=0;c[k+24>>2]=c[h+24>>2];h=b;do{c[h+20>>2]=f;h=c[h+12>>2]|0;}while((h|0)!=(b|0));c[(c[j>>2]|0)+8>>2]=a;d=1;return d|0}function sb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;b=a+4|0;d=c[b>>2]|0;e=a+20|0;f=c[e>>2]|0;g=d+20|0;h=c[g>>2]|0;if((f|0)==(h|0)){i=0}else{j=c[f+8>>2]|0;k=j;do{c[k+20>>2]=h;k=c[k+12>>2]|0;}while((k|0)!=(j|0));j=c[f+4>>2]|0;k=c[f>>2]|0;c[k+4>>2]=j;c[j>>2]=k;Rc(f);i=1}f=a+8|0;do{if((c[f>>2]|0)==(a|0)){k=c[a+16>>2]|0;j=c[k+8>>2]|0;h=j;do{c[h+16>>2]=0;h=c[h+8>>2]|0;}while((h|0)!=(j|0));j=c[k+4>>2]|0;h=c[k>>2]|0;c[h+4>>2]=j;c[j>>2]=h;Rc(k)}else{h=c[b>>2]|0;c[(c[h+20>>2]|0)+8>>2]=c[h+12>>2];c[(c[a+16>>2]|0)+8>>2]=c[f>>2];h=c[(c[b>>2]|0)+12>>2]|0;j=c[f>>2]|0;l=h+8|0;m=c[l>>2]|0;c[(c[j+4>>2]|0)+12>>2]=h;c[(c[m+4>>2]|0)+12>>2]=a;c[f>>2]=m;c[l>>2]=j;if((i|0)!=0){break}j=Qc(28)|0;l=j;if((j|0)==0){n=0;return n|0}m=c[e>>2]|0;h=m+4|0;o=c[h>>2]|0;c[j+4>>2]=o;c[o>>2]=l;c[j>>2]=m;c[h>>2]=l;c[j+8>>2]=a;c[j+12>>2]=0;c[j+16>>2]=0;c[j+20>>2]=0;c[j+24>>2]=c[m+24>>2];m=a;do{c[m+20>>2]=l;m=c[m+12>>2]|0;}while((m|0)!=(a|0))}}while(0);i=d+8|0;if((c[i>>2]|0)==(d|0)){f=c[d+16>>2]|0;m=c[f+8>>2]|0;l=m;do{c[l+16>>2]=0;l=c[l+8>>2]|0;}while((l|0)!=(m|0));m=c[f+4>>2]|0;l=c[f>>2]|0;c[l+4>>2]=m;c[m>>2]=l;Rc(f);f=c[g>>2]|0;g=c[f+8>>2]|0;l=g;do{c[l+20>>2]=0;l=c[l+12>>2]|0;}while((l|0)!=(g|0));g=c[f+4>>2]|0;l=c[f>>2]|0;c[l+4>>2]=g;c[g>>2]=l;Rc(f)}else{f=d+4|0;c[(c[e>>2]|0)+8>>2]=c[(c[f>>2]|0)+12>>2];c[(c[d+16>>2]|0)+8>>2]=c[i>>2];e=c[(c[f>>2]|0)+12>>2]|0;f=c[i>>2]|0;l=e+8|0;g=c[l>>2]|0;c[(c[f+4>>2]|0)+12>>2]=e;c[(c[g+4>>2]|0)+12>>2]=d;c[i>>2]=g;c[l>>2]=f}f=c[b>>2]|0;b=f>>>0<a>>>0?f:a;a=c[b>>2]|0;f=c[c[b+4>>2]>>2]|0;c[c[a+4>>2]>>2]=f;c[c[f+4>>2]>>2]=a;Rc(b);n=1;return n|0}function tb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;b=Qc(64)|0;if((b|0)==0){d=0;return d|0}e=b;f=b+32|0;g=f;h=a+4|0;i=c[h>>2]|0;j=i>>>0<a>>>0?i:a;i=j+4|0;k=c[c[i>>2]>>2]|0;c[f>>2]=k;c[c[k+4>>2]>>2]=e;c[b>>2]=j;c[c[i>>2]>>2]=g;c[b+4>>2]=g;i=b+8|0;c[i>>2]=e;c[b+12>>2]=g;j=b+16|0;Vc(j|0,0,16)|0;c[b+36>>2]=e;c[b+40>>2]=g;c[b+44>>2]=e;Vc(b+48|0,0,16)|0;k=c[a+12>>2]|0;f=k+8|0;l=c[f>>2]|0;c[b+44>>2]=k;c[(c[l+4>>2]|0)+12>>2]=e;c[i>>2]=l;c[f>>2]=e;f=c[(c[h>>2]|0)+16>>2]|0;c[j>>2]=f;j=Qc(64)|0;h=j;if((j|0)==0){d=0;return d|0}l=f+4|0;i=c[l>>2]|0;c[j+4>>2]=i;c[i>>2]=h;c[j>>2]=f;c[l>>2]=h;c[j+8>>2]=g;c[j+12>>2]=0;j=g;do{c[j+16>>2]=h;j=c[j+8>>2]|0;}while((j|0)!=(g|0));g=c[a+20>>2]|0;c[b+52>>2]=g;c[b+20>>2]=g;d=e;return d|0}function ub(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;b=tb(a)|0;if((b|0)==0){d=0;return d|0}e=c[b+4>>2]|0;b=a+4|0;f=c[b>>2]|0;g=c[(c[f+4>>2]|0)+12>>2]|0;h=f+8|0;i=c[h>>2]|0;j=g+8|0;k=c[j>>2]|0;c[(c[i+4>>2]|0)+12>>2]=g;c[(c[k+4>>2]|0)+12>>2]=f;c[h>>2]=k;c[j>>2]=i;i=c[b>>2]|0;j=i+8|0;k=c[j>>2]|0;h=e+8|0;f=c[h>>2]|0;c[(c[k+4>>2]|0)+12>>2]=e;c[(c[f+4>>2]|0)+12>>2]=i;c[j>>2]=f;c[h>>2]=k;c[(c[b>>2]|0)+16>>2]=c[e+16>>2];k=e+4|0;h=c[k>>2]|0;c[(c[h+16>>2]|0)+8>>2]=h;c[(c[k>>2]|0)+20>>2]=c[(c[b>>2]|0)+20>>2];c[e+28>>2]=c[a+28>>2];c[(c[k>>2]|0)+28>>2]=c[(c[b>>2]|0)+28>>2];d=e;return d|0}function vb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=Qc(64)|0;if((d|0)==0){e=0;return e|0}f=d;g=d+32|0;h=g;i=a+4|0;j=c[i>>2]|0;k=j>>>0<a>>>0?j:a;j=k+4|0;l=c[c[j>>2]>>2]|0;c[g>>2]=l;c[c[l+4>>2]>>2]=f;c[d>>2]=k;c[c[j>>2]>>2]=h;c[d+4>>2]=h;j=d+8|0;c[j>>2]=f;c[d+12>>2]=h;k=d+16|0;Vc(k|0,0,16)|0;c[d+36>>2]=f;c[d+40>>2]=h;c[d+44>>2]=f;Vc(d+48|0,0,16)|0;l=c[b+20>>2]|0;g=a+20|0;m=c[g>>2]|0;if((l|0)==(m|0)){n=0;o=f}else{p=c[l+8>>2]|0;q=p;do{c[q+20>>2]=m;q=c[q+12>>2]|0;}while((q|0)!=(p|0));p=c[l+4>>2]|0;q=c[l>>2]|0;c[q+4>>2]=p;c[p>>2]=q;Rc(l);n=1;o=c[j>>2]|0}l=c[a+12>>2]|0;a=l+8|0;q=c[a>>2]|0;c[(c[o+4>>2]|0)+12>>2]=l;c[(c[q+4>>2]|0)+12>>2]=f;c[j>>2]=q;c[a>>2]=o;o=d+40|0;a=c[o>>2]|0;q=b+8|0;j=c[q>>2]|0;c[(c[a+4>>2]|0)+12>>2]=b;c[(c[j+4>>2]|0)+12>>2]=h;c[o>>2]=j;c[q>>2]=a;c[k>>2]=c[(c[i>>2]|0)+16>>2];c[d+48>>2]=c[b+16>>2];b=c[g>>2]|0;c[d+52>>2]=b;c[d+20>>2]=b;c[b+8>>2]=h;if(n){e=f;return e|0}n=Qc(28)|0;h=n;if((n|0)==0){e=0;return e|0}b=c[g>>2]|0;g=b+4|0;d=c[g>>2]|0;c[n+4>>2]=d;c[d>>2]=h;c[n>>2]=b;c[g>>2]=h;c[n+8>>2]=f;c[n+12>>2]=0;c[n+16>>2]=0;c[n+20>>2]=0;c[n+24>>2]=c[b+24>>2];b=f;while(1){c[b+20>>2]=h;n=c[b+12>>2]|0;if((n|0)==(f|0)){e=f;break}else{b=n}}return e|0}function wb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;b=c[a+8>>2]|0;d=c[b+12>>2]|0;while(1){e=c[d+12>>2]|0;c[d+20>>2]=0;f=d+4|0;if((c[(c[f>>2]|0)+20>>2]|0)==0){g=d+8|0;h=c[g>>2]|0;i=c[d+16>>2]|0;j=i+8|0;if((h|0)==(d|0)){k=c[j>>2]|0;l=k;do{c[l+16>>2]=0;l=c[l+8>>2]|0;}while((l|0)!=(k|0));k=c[i+4>>2]|0;l=c[i>>2]|0;c[l+4>>2]=k;c[k>>2]=l;Rc(i)}else{c[j>>2]=h;l=c[(c[f>>2]|0)+12>>2]|0;k=c[g>>2]|0;m=l+8|0;n=c[m>>2]|0;c[(c[k+4>>2]|0)+12>>2]=l;c[(c[n+4>>2]|0)+12>>2]=d;c[g>>2]=n;c[m>>2]=k}k=c[f>>2]|0;m=k+8|0;n=c[m>>2]|0;l=c[k+16>>2]|0;o=l+8|0;if((n|0)==(k|0)){p=c[o>>2]|0;q=p;do{c[q+16>>2]=0;q=c[q+8>>2]|0;}while((q|0)!=(p|0));p=c[l+4>>2]|0;q=c[l>>2]|0;c[q+4>>2]=p;c[p>>2]=q;Rc(l)}else{c[o>>2]=n;q=c[(c[k+4>>2]|0)+12>>2]|0;p=c[m>>2]|0;g=q+8|0;h=c[g>>2]|0;c[(c[p+4>>2]|0)+12>>2]=q;c[(c[h+4>>2]|0)+12>>2]=k;c[m>>2]=h;c[g>>2]=p}p=c[f>>2]|0;g=p>>>0<d>>>0?p:d;p=c[g>>2]|0;h=c[c[g+4>>2]>>2]|0;c[c[p+4>>2]>>2]=h;c[c[h+4>>2]>>2]=p;Rc(g)}if((d|0)==(b|0)){break}else{d=e}}d=c[a+4>>2]|0;b=c[a>>2]|0;c[b+4>>2]=d;c[d>>2]=b;Rc(a);return}function xb(){var a=0,b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;a=Qc(160)|0;if((a|0)==0){b=0;return b|0}d=a;e=a+64|0;f=e;g=a+92|0;h=g;i=a+124|0;j=i;c[a+4>>2]=d;c[a>>2]=d;c[a+8>>2]=0;c[a+12>>2]=0;c[a+68>>2]=f;c[e>>2]=f;Vc(a+72|0,0,20)|0;c[g>>2]=h;c[a+96>>2]=j;Vc(a+100|0,0,24)|0;c[i>>2]=j;c[a+128>>2]=h;Vc(a+132|0,0,24)|0;b=a;return b|0}function yb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=a+64|0;d=c[b>>2]|0;if((d|0)!=(b|0)){e=d;while(1){d=c[e>>2]|0;Rc(e);if((d|0)==(b|0)){break}else{e=d}}}e=a|0;b=c[a>>2]|0;if((b|0)!=(e|0)){d=b;while(1){b=c[d>>2]|0;Rc(d);if((b|0)==(e|0)){break}else{d=b}}}d=a+92|0;e=c[d>>2]|0;if((e|0)==(d|0)){f=a;Rc(f);return}else{g=e}while(1){e=c[g>>2]|0;Rc(g);if((e|0)==(d|0)){break}else{g=e}}f=a;Rc(f);return}function zb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;b=a+64|0;d=a|0;e=a+92|0;f=c[b>>2]|0;g=(c[f+4>>2]|0)==(b|0);a:do{if((f|0)==(b|0)){h=g}else{i=f;j=g;b:while(1){if(!j){k=4;break}l=c[i+8>>2]|0;m=l;while(1){n=c[m+4>>2]|0;if((n|0)==(m|0)){k=7;break b}if((c[n+4>>2]|0)!=(m|0)){k=9;break b}n=c[m+12>>2]|0;if((c[(c[n+8>>2]|0)+4>>2]|0)!=(m|0)){k=11;break b}if((c[(c[(c[m+8>>2]|0)+4>>2]|0)+12>>2]|0)!=(m|0)){k=13;break b}if((c[m+20>>2]|0)!=(i|0)){k=15;break b}if((n|0)==(l|0)){break}else{m=n}}m=c[i>>2]|0;l=(c[m+4>>2]|0)==(i|0);if((m|0)==(b|0)){h=l;break a}else{i=m;j=l}}if((k|0)==4){pa(1696,1688,753,1944)}else if((k|0)==7){pa(936,1688,756,1944)}else if((k|0)==9){pa(760,1688,757,1944)}else if((k|0)==11){pa(608,1688,758,1944)}else if((k|0)==13){pa(520,1688,759,1944)}else if((k|0)==15){pa(456,1688,760,1944)}}}while(0);if(!h){pa(288,1688,764,1944)}if((c[a+72>>2]|0)!=0){pa(288,1688,764,1944)}if((c[a+76>>2]|0)!=0){pa(288,1688,764,1944)}h=c[a>>2]|0;b=(c[h+4>>2]|0)==(d|0);c:do{if((h|0)==(d|0)){o=b}else{g=h;f=b;d:while(1){if(!f){k=24;break}j=c[g+8>>2]|0;i=j;l=c[j+4>>2]|0;while(1){if((l|0)==(i|0)){k=27;break d}if((c[l+4>>2]|0)!=(i|0)){k=29;break d}if((c[(c[(c[i+12>>2]|0)+8>>2]|0)+4>>2]|0)!=(i|0)){k=31;break d}m=c[i+8>>2]|0;n=c[m+4>>2]|0;if((c[n+12>>2]|0)!=(i|0)){k=33;break d}if((c[i+16>>2]|0)!=(g|0)){k=35;break d}if((m|0)==(j|0)){break}else{i=m;l=n}}l=c[g>>2]|0;i=(c[l+4>>2]|0)==(g|0);if((l|0)==(d|0)){o=i;break c}else{g=l;f=i}}if((k|0)==24){pa(128,1688,768,1944)}else if((k|0)==27){pa(936,1688,771,1944)}else if((k|0)==29){pa(760,1688,772,1944)}else if((k|0)==31){pa(608,1688,773,1944)}else if((k|0)==33){pa(520,1688,774,1944)}else if((k|0)==35){pa(56,1688,775,1944)}}}while(0);if(!o){pa(1624,1688,779,1944)}if((c[a+8>>2]|0)!=0){pa(1624,1688,779,1944)}if((c[a+12>>2]|0)!=0){pa(1624,1688,779,1944)}o=e;d=c[a+96>>2]|0;while(1){b=c[o>>2]|0;p=c[b+4>>2]|0;q=(c[p>>2]|0)==(d|0);if((b|0)==(e|0)){k=57;break}if(!q){k=44;break}if((p|0)==(b|0)){k=46;break}if((c[p+4>>2]|0)!=(b|0)){k=48;break}if((c[b+16>>2]|0)==0){k=50;break}if((c[p+16>>2]|0)==0){k=52;break}if((c[(c[(c[b+12>>2]|0)+8>>2]|0)+4>>2]|0)!=(b|0)){k=54;break}if((c[(c[(c[b+8>>2]|0)+4>>2]|0)+12>>2]|0)==(b|0)){o=b;d=p}else{k=56;break}}if((k|0)==44){pa(1544,1688,783,1944)}else if((k|0)==46){pa(936,1688,784,1944)}else if((k|0)==48){pa(760,1688,785,1944)}else if((k|0)==50){pa(1464,1688,786,1944)}else if((k|0)==52){pa(1400,1688,787,1944)}else if((k|0)==54){pa(608,1688,788,1944)}else if((k|0)==56){pa(520,1688,789,1944)}else if((k|0)==57){if(!q){pa(1176,1688,795,1944)}if((p|0)!=(a+124|0)){pa(1176,1688,795,1944)}if((c[p+4>>2]|0)!=(e|0)){pa(1176,1688,795,1944)}if((c[a+108>>2]|0)!=0){pa(1176,1688,795,1944)}if((c[p+16>>2]|0)!=0){pa(1176,1688,795,1944)}if((c[a+112>>2]|0)!=0){pa(1176,1688,795,1944)}if((c[p+20>>2]|0)==0){return}else{pa(1176,1688,795,1944)}}}function Ab(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,qa=0;d=i;i=i+48|0;e=d|0;f=d+16|0;g=d+32|0;h=a+128|0;c[h>>2]=0;j=b+64|0;b=j|0;k=c[b>>2]|0;if((k|0)==(j|0)){i=d;return}else{l=k}do{c[l+20>>2]=0;l=c[l>>2]|0;}while((l|0)!=(j|0));l=c[b>>2]|0;if((l|0)==(j|0)){i=d;return}b=a+120|0;k=e|0;m=e+8|0;n=e+4|0;o=f|0;p=f+8|0;q=f+4|0;r=g|0;s=g+8|0;t=g+4|0;u=l;a:do{do{if((c[u+24>>2]|0)!=0){l=u+20|0;if((c[l>>2]|0)!=0){break}v=c[u+8>>2]|0;do{if((c[b>>2]|0)==0){w=v+20|0;x=c[w>>2]|0;b:do{if((c[x+24>>2]|0)==0){y=0;z=0}else{A=0;B=0;C=v;D=w;E=x;while(1){if((c[E+20>>2]|0)!=0){y=A;z=B;break b}c[E+16>>2]=B;F=c[D>>2]|0;c[F+20>>2]=1;G=A+1|0;H=c[C+8>>2]|0;I=H+20|0;J=c[I>>2]|0;if((c[J+24>>2]|0)==0){y=G;z=F;break}else{A=G;B=F;C=H;D=I;E=J}}}}while(0);x=v+4|0;w=c[(c[x>>2]|0)+20>>2]|0;c:do{if((c[w+24>>2]|0)==0){K=y;L=z;M=v}else{E=y;D=z;C=v;B=x;A=w;while(1){if((c[A+20>>2]|0)!=0){K=E;L=D;M=C;break c}c[A+16>>2]=D;J=c[B>>2]|0;I=c[J+20>>2]|0;c[I+20>>2]=1;H=E+1|0;F=c[J+12>>2]|0;J=F+4|0;G=c[(c[J>>2]|0)+20>>2]|0;if((c[G+24>>2]|0)==0){K=H;L=I;M=F;break}else{E=H;D=I;C=F;B=J;A=G}}}}while(0);if((L|0)!=0){w=L;do{c[w+20>>2]=0;w=c[w+16>>2]|0;}while((w|0)!=0)}w=(K|0)>1;x=w?4:2;A=w?M:v;B=w?K:1;w=v+12|0;C=c[w>>2]|0;D=C+20|0;E=c[D>>2]|0;d:do{if((c[E+24>>2]|0)==0){N=0;O=0}else{G=0;J=0;F=C;I=D;H=E;while(1){if((c[H+20>>2]|0)!=0){N=G;O=J;break d}c[H+16>>2]=J;P=c[I>>2]|0;c[P+20>>2]=1;Q=G+1|0;R=c[F+8>>2]|0;S=R+20|0;T=c[S>>2]|0;if((c[T+24>>2]|0)==0){N=Q;O=P;break}else{G=Q;J=P;F=R;I=S;H=T}}}}while(0);E=C+4|0;D=c[(c[E>>2]|0)+20>>2]|0;e:do{if((c[D+24>>2]|0)==0){U=N;V=O;W=C}else{H=N;I=O;F=C;J=E;G=D;while(1){if((c[G+20>>2]|0)!=0){U=H;V=I;W=F;break e}c[G+16>>2]=I;T=c[J>>2]|0;S=c[T+20>>2]|0;c[S+20>>2]=1;R=H+1|0;P=c[T+12>>2]|0;T=P+4|0;Q=c[(c[T>>2]|0)+20>>2]|0;if((c[Q+24>>2]|0)==0){U=R;V=S;W=P;break}else{H=R;I=S;F=P;J=T;G=Q}}}}while(0);if((V|0)!=0){D=V;do{c[D+20>>2]=0;D=c[D+16>>2]|0;}while((D|0)!=0)}D=(U|0)>(B|0);E=D?4:x;C=D?W:A;G=D?U:B;D=v+8|0;J=c[(c[D>>2]|0)+4>>2]|0;F=J+20|0;I=c[F>>2]|0;f:do{if((c[I+24>>2]|0)==0){X=0;Y=0}else{H=0;Q=0;T=J;P=F;S=I;while(1){if((c[S+20>>2]|0)!=0){X=H;Y=Q;break f}c[S+16>>2]=Q;R=c[P>>2]|0;c[R+20>>2]=1;Z=H+1|0;_=c[T+8>>2]|0;$=_+20|0;aa=c[$>>2]|0;if((c[aa+24>>2]|0)==0){X=Z;Y=R;break}else{H=Z;Q=R;T=_;P=$;S=aa}}}}while(0);I=J+4|0;F=c[(c[I>>2]|0)+20>>2]|0;g:do{if((c[F+24>>2]|0)==0){ba=X;ca=Y;da=J}else{B=X;A=Y;x=J;S=I;P=F;while(1){if((c[P+20>>2]|0)!=0){ba=B;ca=A;da=x;break g}c[P+16>>2]=A;T=c[S>>2]|0;Q=c[T+20>>2]|0;c[Q+20>>2]=1;H=B+1|0;aa=c[T+12>>2]|0;T=aa+4|0;$=c[(c[T>>2]|0)+20>>2]|0;if((c[$+24>>2]|0)==0){ba=H;ca=Q;da=aa;break}else{B=H;A=Q;x=aa;S=T;P=$}}}}while(0);if((ca|0)!=0){F=ca;do{c[F+20>>2]=0;F=c[F+16>>2]|0;}while((F|0)!=0)}F=(ba|0)>(G|0);I=F?ba:G;Eb(e,v);J=c[k>>2]|0;if((J|0)>(I|0)){ea=J;fa=c[n>>2]|0;ga=c[m>>2]|0}else{ea=I;fa=F?da:C;ga=F?4:E}Eb(f,c[w>>2]|0);F=c[o>>2]|0;if((F|0)>(ea|0)){ha=F;ia=c[q>>2]|0;ja=c[p>>2]|0}else{ha=ea;ia=fa;ja=ga}Eb(g,c[(c[D>>2]|0)+4>>2]|0);F=c[r>>2]|0;if((F|0)<=(ha|0)){ka=ha;la=ia;ma=ja;break}ka=F;la=c[t>>2]|0;ma=c[s>>2]|0}else{ka=1;la=v;ma=2}}while(0);Sa[ma&7](a,la,ka);if((c[l>>2]|0)==0){na=39;break a}}}while(0);u=c[u>>2]|0;}while((u|0)!=(j|0));if((na|0)==39){pa(1112,1480,100,1752)}na=c[h>>2]|0;if((na|0)==0){i=d;return}j=c[a+3360>>2]|0;if((j|0)==28){Oa[c[a+132>>2]&31](4);oa=a+3540|0}else{u=a+3540|0;Pa[j&31](4,c[u>>2]|0);oa=u}u=a+120|0;j=a+3368|0;ka=a+140|0;la=a+3364|0;ma=a+136|0;s=na;na=-1;while(1){t=s+8|0;ja=na;ia=c[t>>2]|0;while(1){do{if((c[u>>2]|0)==0){qa=ja}else{ha=(c[(c[(c[ia+4>>2]|0)+20>>2]|0)+24>>2]|0)==0|0;if((ja|0)==(ha|0)){qa=ja;break}r=c[la>>2]|0;if((r|0)==22){Oa[c[ma>>2]&31](ha);qa=ha;break}else{Pa[r&31](ha,c[oa>>2]|0);qa=ha;break}}}while(0);l=c[j>>2]|0;if((l|0)==4){Oa[c[ka>>2]&31](c[(c[ia+16>>2]|0)+12>>2]|0)}else{Pa[l&31](c[(c[ia+16>>2]|0)+12>>2]|0,c[oa>>2]|0)}l=c[ia+12>>2]|0;if((l|0)==(c[t>>2]|0)){break}else{ja=qa;ia=l}}ia=c[s+16>>2]|0;if((ia|0)==0){break}else{s=ia;na=qa}}qa=c[a+3372>>2]|0;if((qa|0)==6){Ta[c[a+144>>2]&3]()}else{Oa[qa&31](c[oa>>2]|0)}c[h>>2]=0;i=d;return}function Bb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;d=b+64|0;b=c[d>>2]|0;if((b|0)==(d|0)){return}e=a+3360|0;f=a+132|0;g=a+3368|0;h=a+140|0;i=a+3540|0;j=a+3372|0;k=a+144|0;a=b;do{do{if((c[a+24>>2]|0)!=0){b=c[e>>2]|0;if((b|0)==28){Oa[c[f>>2]&31](2)}else{Pa[b&31](2,c[i>>2]|0)}b=a+8|0;l=c[b>>2]|0;do{m=c[g>>2]|0;if((m|0)==4){Oa[c[h>>2]&31](c[(c[l+16>>2]|0)+12>>2]|0)}else{Pa[m&31](c[(c[l+16>>2]|0)+12>>2]|0,c[i>>2]|0)}l=c[l+12>>2]|0;}while((l|0)!=(c[b>>2]|0));b=c[j>>2]|0;if((b|0)==6){Ta[c[k>>2]&3]();break}else{Oa[b&31](c[i>>2]|0);break}}}while(0);a=c[a>>2]|0;}while((a|0)!=(d|0));return}function Cb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0.0,i=0.0,j=0.0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0,M=0,N=0,O=0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0,U=0,V=0,W=0,X=0;b=a+160|0;d=c[a+156>>2]|0;e=a+160+(d<<5)|0;if((d|0)<3){f=1;return f|0}g=+h[a+16>>3];i=+h[a+24>>3];j=+h[a+32>>3];do{if(g==0.0){if(i==0.0&j==0.0){k=a+192|0;if((d|0)<=2){break}l=+h[a+176>>3];m=+h[a+168>>3];n=+h[a+160>>3];o=+h[a+208>>3]-l;p=+h[a+200>>3]-m;q=+h[k>>3]-n;r=k;k=a+224|0;s=0.0;t=0.0;u=0.0;while(1){v=+h[k>>3]-n;w=+h[r+40>>3]-m;x=+h[r+48>>3]-l;y=p*x-o*w;z=o*v-q*x;A=q*w-p*v;if(u*A+(s*y+t*z)<0.0){B=s-y;C=u-A;D=t-z}else{B=s+y;C=u+A;D=t+z}E=k+32|0;if(E>>>0<e>>>0){o=x;p=w;q=v;r=k;k=E;s=B;t=D;u=C}else{F=B;G=D;H=C;break}}}else{F=g;G=i;H=j}if((d|0)>2){I=H;J=G;K=F;L=12}}else{I=j;J=i;K=g;L=12}}while(0);do{if((L|0)==12){k=a+192|0;g=+h[a+176>>3];i=+h[a+168>>3];j=+h[a+160>>3];F=+h[a+208>>3]-g;G=+h[a+200>>3]-i;H=+h[k>>3]-j;r=k;E=0;M=a+224|0;a:while(1){C=F;D=G;B=H;N=r;O=M;while(1){P=+h[O>>3]-j;Q=+h[N+40>>3]-i;R=+h[N+48>>3]-g;S=I*(B*Q-D*P)+(K*(D*R-C*Q)+J*(C*P-B*R));if(S!=0.0){break}T=O+32|0;if(T>>>0<e>>>0){C=R;D=Q;B=P;N=O;O=T}else{U=E;L=20;break a}}if(S>0.0){if((E|0)<0){f=0;L=51;break}else{V=1}}else{if((E|0)>0){f=0;L=51;break}else{V=-1}}N=O+32|0;if(N>>>0<e>>>0){F=R;G=Q;H=P;r=O;E=V;M=N}else{U=V;L=20;break}}if((L|0)==20){if((U|0)==0){break}else if((U|0)==2){f=0;return f|0}M=c[a+96>>2]|0;do{if((M|0)==100132){if((U|0)<0){f=1}else{break}return f|0}else if((M|0)==100133){if((U|0)>0){f=1}else{break}return f|0}else if((M|0)==100134){f=1;return f|0}}while(0);M=c[a+3360>>2]|0;if((M|0)==28){if((c[a+124>>2]|0)==0){W=(d|0)>3?6:4}else{W=2}Oa[c[a+132>>2]&31](W)}else{if((c[a+124>>2]|0)==0){X=(d|0)>3?6:4}else{X=2}Pa[M&31](X,c[a+3540>>2]|0)}M=a+3368|0;E=c[M>>2]|0;if((E|0)==4){Oa[c[a+140>>2]&31](c[a+184>>2]|0)}else{Pa[E&31](c[a+184>>2]|0,c[a+3540>>2]|0)}do{if((U|0)>0){if((d|0)<=1){break}E=a+140|0;r=a+3540|0;N=k;do{T=c[M>>2]|0;if((T|0)==4){Oa[c[E>>2]&31](c[N+24>>2]|0)}else{Pa[T&31](c[N+24>>2]|0,c[r>>2]|0)}N=N+32|0;}while(N>>>0<e>>>0)}else{N=d-1|0;if((N|0)<=0){break}r=a+140|0;E=a+3540|0;O=a+160+(N<<5)|0;do{N=c[M>>2]|0;if((N|0)==4){Oa[c[r>>2]&31](c[O+24>>2]|0)}else{Pa[N&31](c[O+24>>2]|0,c[E>>2]|0)}O=O-32|0;}while(O>>>0>b>>>0)}}while(0);M=c[a+3372>>2]|0;if((M|0)==6){Ta[c[a+144>>2]&3]();f=1;return f|0}else{Oa[M&31](c[a+3540>>2]|0);f=1;return f|0}}else if((L|0)==51){return f|0}}}while(0);f=1;return f|0}function Db(a,b,d){a=a|0;b=b|0;d=d|0;if((d|0)==1){d=a+128|0;a=b+20|0;c[(c[a>>2]|0)+16>>2]=c[d>>2];c[d>>2]=c[a>>2];c[(c[a>>2]|0)+20>>2]=1;return}else{pa(704,1480,243,2e3)}}function Eb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=b+20|0;e=c[d>>2]|0;a:do{if((c[e+24>>2]|0)==0){f=b;g=0;h=0}else{i=0;j=0;k=b;l=d;m=e;while(1){if((c[m+20>>2]|0)!=0){f=k;g=j;h=i;break a}c[m+16>>2]=j;n=c[l>>2]|0;c[n+20>>2]=1;o=i|1;p=c[(c[k+12>>2]|0)+4>>2]|0;q=p+20|0;r=c[q>>2]|0;if((c[r+24>>2]|0)==0){f=p;g=n;h=o;break a}if((c[r+20>>2]|0)!=0){f=p;g=n;h=o;break a}c[r+16>>2]=n;n=c[q>>2]|0;c[n+20>>2]=1;q=i+2|0;r=c[p+8>>2]|0;p=r+20|0;o=c[p>>2]|0;if((c[o+24>>2]|0)==0){f=r;g=n;h=q;break}else{i=q;j=n;k=r;l=p;m=o}}}}while(0);e=b+4|0;d=c[(c[e>>2]|0)+20>>2]|0;b:do{if((c[d+24>>2]|0)==0){s=b;t=g;u=0}else{m=0;l=g;k=b;j=e;i=d;while(1){if((c[i+20>>2]|0)!=0){s=k;t=l;u=m;break b}c[i+16>>2]=l;o=c[j>>2]|0;p=c[o+20>>2]|0;c[p+20>>2]=1;r=m|1;n=c[o+12>>2]|0;o=n+4|0;q=c[(c[o>>2]|0)+20>>2]|0;if((c[q+24>>2]|0)==0){s=n;t=p;u=r;break b}if((c[q+20>>2]|0)!=0){s=n;t=p;u=r;break b}c[q+16>>2]=p;p=c[o>>2]|0;o=c[p+20>>2]|0;c[o+20>>2]=1;q=m+2|0;r=c[(c[p+8>>2]|0)+4>>2]|0;p=r+4|0;n=c[(c[p>>2]|0)+20>>2]|0;if((c[n+24>>2]|0)==0){s=r;t=o;u=q;break}else{m=q;l=o;k=r;j=p;i=n}}}}while(0);d=u+h|0;do{if((h&1|0)==0){v=c[f+4>>2]|0;w=d}else{if((u&1|0)==0){v=s;w=d;break}v=c[s+8>>2]|0;w=d-1|0}}while(0);if((t|0)==0){x=a|0;c[x>>2]=w;y=a+4|0;c[y>>2]=v;z=a+8|0;c[z>>2]=6;return}else{A=t}do{c[A+20>>2]=0;A=c[A+16>>2]|0;}while((A|0)!=0);x=a|0;c[x>>2]=w;y=a+4|0;c[y>>2]=v;z=a+8|0;c[z>>2]=6;return}function Fb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=c[a+3360>>2]|0;if((e|0)==28){Oa[c[a+132>>2]&31](5)}else{Pa[e&31](5,c[a+3540>>2]|0)}e=a+3368|0;f=c[e>>2]|0;if((f|0)==4){Oa[c[a+140>>2]&31](c[(c[b+16>>2]|0)+12>>2]|0)}else{Pa[f&31](c[(c[b+16>>2]|0)+12>>2]|0,c[a+3540>>2]|0)}f=c[e>>2]|0;if((f|0)==4){Oa[c[a+140>>2]&31](c[(c[(c[b+4>>2]|0)+16>>2]|0)+12>>2]|0)}else{Pa[f&31](c[(c[(c[b+4>>2]|0)+16>>2]|0)+12>>2]|0,c[a+3540>>2]|0)}f=c[b+20>>2]|0;a:do{if((c[f+24>>2]|0)==0){g=d}else{h=a+140|0;i=a+3540|0;j=b;k=d;l=f;while(1){m=l+20|0;if((c[m>>2]|0)!=0){g=k;break a}c[m>>2]=1;m=k-1|0;n=c[(c[j+12>>2]|0)+4>>2]|0;o=c[e>>2]|0;if((o|0)==4){Oa[c[h>>2]&31](c[(c[n+16>>2]|0)+12>>2]|0)}else{Pa[o&31](c[(c[n+16>>2]|0)+12>>2]|0,c[i>>2]|0)}o=c[n+20>>2]|0;if((c[o+24>>2]|0)==0){g=m;break a}p=o+20|0;if((c[p>>2]|0)!=0){g=m;break a}c[p>>2]=1;p=k-2|0;m=c[n+8>>2]|0;n=c[e>>2]|0;if((n|0)==4){Oa[c[h>>2]&31](c[(c[(c[m+4>>2]|0)+16>>2]|0)+12>>2]|0)}else{Pa[n&31](c[(c[(c[m+4>>2]|0)+16>>2]|0)+12>>2]|0,c[i>>2]|0)}n=c[m+20>>2]|0;if((c[n+24>>2]|0)==0){g=p;break}else{j=m;k=p;l=n}}}}while(0);if((g|0)!=0){pa(920,1480,328,2016)}g=c[a+3372>>2]|0;if((g|0)==6){Ta[c[a+144>>2]&3]();return}else{Oa[g&31](c[a+3540>>2]|0);return}}function Gb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;e=c[a+3360>>2]|0;if((e|0)==28){Oa[c[a+132>>2]&31](6)}else{Pa[e&31](6,c[a+3540>>2]|0)}e=a+3368|0;f=c[e>>2]|0;if((f|0)==4){Oa[c[a+140>>2]&31](c[(c[b+16>>2]|0)+12>>2]|0)}else{Pa[f&31](c[(c[b+16>>2]|0)+12>>2]|0,c[a+3540>>2]|0)}f=c[e>>2]|0;if((f|0)==4){Oa[c[a+140>>2]&31](c[(c[(c[b+4>>2]|0)+16>>2]|0)+12>>2]|0)}else{Pa[f&31](c[(c[(c[b+4>>2]|0)+16>>2]|0)+12>>2]|0,c[a+3540>>2]|0)}f=c[b+20>>2]|0;a:do{if((c[f+24>>2]|0)==0){g=d}else{h=a+140|0;i=a+3540|0;j=b;k=d;l=f;while(1){m=l+20|0;if((c[m>>2]|0)!=0){g=k;break a}c[m>>2]=1;m=k-1|0;n=c[j+8>>2]|0;o=c[e>>2]|0;if((o|0)==4){Oa[c[h>>2]&31](c[(c[(c[n+4>>2]|0)+16>>2]|0)+12>>2]|0)}else{Pa[o&31](c[(c[(c[n+4>>2]|0)+16>>2]|0)+12>>2]|0,c[i>>2]|0)}o=c[n+20>>2]|0;if((c[o+24>>2]|0)==0){g=m;break}else{j=n;k=m;l=o}}}}while(0);if((g|0)!=0){pa(920,1480,300,2032)}g=c[a+3372>>2]|0;if((g|0)==6){Ta[c[a+144>>2]&3]();return}else{Oa[g&31](c[a+3540>>2]|0);return}}function Hb(a,b){a=a|0;b=b|0;return}function Ib(a,b){a=a|0;b=b|0;return}function Jb(a,b){a=a|0;b=b|0;return}function Kb(a){a=a|0;return}function Lb(a,b){a=a|0;b=b|0;return}function Mb(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return}function Nb(){var a=0,b=0;if((fc(64)|0)==0){a=0;return a|0}b=Qc(3544)|0;if((b|0)==0){a=0;return a|0}c[b>>2]=0;h[b+88>>3]=0.0;Vc(b+16|0,0,24)|0;c[b+96>>2]=100130;c[b+120>>2]=0;c[b+124>>2]=0;c[b+132>>2]=14;c[b+136>>2]=16;c[b+140>>2]=20;c[b+144>>2]=2;c[b+12>>2]=18;c[b+116>>2]=2;c[b+148>>2]=12;c[b+3360>>2]=28;c[b+3364>>2]=22;c[b+3368>>2]=4;c[b+3372>>2]=6;c[b+3376>>2]=18;c[b+3380>>2]=4;c[b+3540>>2]=0;a=b;return a|0}function Ob(a){a=a|0;return}function Pb(a){a=a|0;return}function Qb(a){a=a|0;return}function Rb(){return}function Sb(a){a=a|0;return}function Tb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return}function Ub(a){a=a|0;return}function Vb(a){a=a|0;if((c[a>>2]|0)!=0){Wb(a,0)}Rc(a);return}function Wb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;d=a|0;e=c[d>>2]|0;if((e|0)==(b|0)){return}f=a+3376|0;g=a+12|0;h=a+156|0;i=a+152|0;j=a+8|0;k=a+3540|0;l=a+4|0;m=e;while(1){do{if(m>>>0<b>>>0){if((m|0)==0){e=c[f>>2]|0;if((e|0)==18){Oa[c[g>>2]&31](100151)}else{Pa[e&31](100151,c[k>>2]|0)}if((c[d>>2]|0)!=0){Wb(a,0)}c[d>>2]=1;c[h>>2]=0;c[i>>2]=0;c[j>>2]=0;c[k>>2]=0;n=1;break}else if((m|0)!=1){n=m;break}e=c[f>>2]|0;if((e|0)==18){Oa[c[g>>2]&31](100152)}else{Pa[e&31](100152,c[k>>2]|0)}if((c[d>>2]|0)!=1){Wb(a,1)}c[d>>2]=2;c[l>>2]=0;if((c[h>>2]|0)<=0){n=2;break}c[i>>2]=1;n=2}else{if((m|0)==2){e=c[f>>2]|0;if((e|0)==18){Oa[c[g>>2]&31](100154)}else{Pa[e&31](100154,c[k>>2]|0)}if((c[d>>2]|0)!=2){Wb(a,2)}c[d>>2]=1;n=1;break}else if((m|0)==1){e=c[f>>2]|0;if((e|0)==18){Oa[c[g>>2]&31](100153)}else{Pa[e&31](100153,c[k>>2]|0)}e=c[j>>2]|0;if((e|0)!=0){yb(e)}c[d>>2]=0;c[l>>2]=0;c[j>>2]=0;n=0;break}else{n=m;break}}}while(0);if((n|0)==(b|0)){break}else{m=n}}return}function Xb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;switch(b|0){case 100105:{if((d|0)==0){e=2}else{e=d}c[a+116>>2]=e;return};case 100103:{if((d|0)==0){f=18}else{f=d}c[a+12>>2]=f;return};case 100109:{if((d|0)==0){g=18}else{g=d}c[a+3376>>2]=g;return};case 100100:{if((d|0)==0){h=14}else{h=d}c[a+132>>2]=h;return};case 100111:{if((d|0)==0){i=4}else{i=d}c[a+3380>>2]=i;return};case 100107:{if((d|0)==0){j=4}else{j=d}c[a+3368>>2]=j;return};case 100101:{if((d|0)==0){k=20}else{k=d}c[a+140>>2]=k;return};case 100106:{if((d|0)==0){l=28}else{l=d}c[a+3360>>2]=l;return};case 100112:{if((d|0)==0){m=12}else{m=d}c[a+148>>2]=m;return};case 100104:{if((d|0)==0){n=16}else{n=d}c[a+136>>2]=n;c[a+120>>2]=(d|0)!=0;return};case 100102:{c[a+144>>2]=(d|0)==0?2:d;return};case 100108:{if((d|0)==0){o=6}else{o=d}c[a+3372>>2]=o;return};case 100110:{if((d|0)==0){p=22}else{p=d}c[a+3364>>2]=p;c[a+120>>2]=(d|0)!=0;return};default:{d=c[a+3376>>2]|0;if((d|0)==18){Oa[c[a+12>>2]&31](100900);return}else{Pa[d&31](100900,c[a+3540>>2]|0);return}}}}function Yb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0,y=0;if((c[a>>2]|0)!=2){Wb(a,2)}e=a+152|0;a:do{if((c[e>>2]|0)!=0){f=xb()|0;g=a+8|0;c[g>>2]=f;b:do{if((f|0)!=0){i=a+156|0;j=c[i>>2]|0;k=a+160+(j<<5)|0;if((j|0)>0){j=a+4|0;l=a+160|0;m=c[j>>2]|0;while(1){n=l|0;o=c[l+24>>2]|0;if((m|0)==0){p=qb(c[g>>2]|0)|0;if((p|0)==0){break b}if((rb(p,c[p+4>>2]|0)|0)==0){break b}else{q=p}}else{if((ub(m)|0)==0){break b}q=c[m+12>>2]|0}p=q+16|0;c[(c[p>>2]|0)+12>>2]=o;o=c[p>>2]|0;h[o+16>>3]=+h[n>>3];h[o+24>>3]=+h[l+8>>3];h[o+32>>3]=+h[l+16>>3];c[q+28>>2]=1;c[(c[q+4>>2]|0)+28>>2]=-1;c[j>>2]=q;o=l+32|0;if(o>>>0<k>>>0){l=o;m=q}else{r=j;break}}}else{r=a+4|0}c[i>>2]=0;c[e>>2]=0;c[r>>2]=0;break a}}while(0);g=c[a+3376>>2]|0;if((g|0)==18){Oa[c[a+12>>2]&31](100902);return}else{Pa[g&31](100902,c[a+3540>>2]|0);return}}}while(0);s=+h[b>>3];r=s<-1.0e+150;t=r?-1.0e+150:s;q=t>1.0e+150;s=q?1.0e+150:t;t=+h[b+8>>3];g=t<-1.0e+150;u=g?-1.0e+150:t;f=u>1.0e+150;t=f?1.0e+150:u;u=+h[b+16>>3];b=u<-1.0e+150;v=b?-1.0e+150:u;j=v>1.0e+150;u=j?1.0e+150:v;do{if(r|q|g|f|b|j){m=c[a+3376>>2]|0;if((m|0)==18){Oa[c[a+12>>2]&31](100155);break}else{Pa[m&31](100155,c[a+3540>>2]|0);break}}}while(0);j=a+8|0;c:do{if((c[j>>2]|0)==0){b=a+156|0;f=c[b>>2]|0;if((f|0)<100){c[a+160+(f<<5)+24>>2]=d;h[a+160+(f<<5)>>3]=s;h[a+160+(f<<5)+8>>3]=t;h[a+160+(f<<5)+16>>3]=u;c[b>>2]=f+1;return}f=xb()|0;c[j>>2]=f;d:do{if((f|0)!=0){g=c[b>>2]|0;q=a+160+(g<<5)|0;if((g|0)>0){g=a+4|0;r=a+160|0;m=c[g>>2]|0;while(1){l=r|0;k=c[r+24>>2]|0;if((m|0)==0){o=qb(c[j>>2]|0)|0;if((o|0)==0){break d}if((rb(o,c[o+4>>2]|0)|0)==0){break d}else{w=o}}else{if((ub(m)|0)==0){break d}w=c[m+12>>2]|0}o=w+16|0;c[(c[o>>2]|0)+12>>2]=k;k=c[o>>2]|0;h[k+16>>3]=+h[l>>3];h[k+24>>3]=+h[r+8>>3];h[k+32>>3]=+h[r+16>>3];c[w+28>>2]=1;c[(c[w+4>>2]|0)+28>>2]=-1;c[g>>2]=w;k=r+32|0;if(k>>>0<q>>>0){r=k;m=w}else{break}}}c[b>>2]=0;c[e>>2]=0;break c}}while(0);b=c[a+3376>>2]|0;if((b|0)==18){Oa[c[a+12>>2]&31](100902);return}else{Pa[b&31](100902,c[a+3540>>2]|0);return}}}while(0);e=a+4|0;w=c[e>>2]|0;do{if((w|0)==0){b=qb(c[j>>2]|0)|0;if((b|0)==0){break}if((rb(b,c[b+4>>2]|0)|0)!=0){x=b;y=43}}else{if((ub(w)|0)==0){break}x=c[w+12>>2]|0;y=43}}while(0);if((y|0)==43){y=x+16|0;c[(c[y>>2]|0)+12>>2]=d;d=c[y>>2]|0;h[d+16>>3]=s;h[d+24>>3]=t;h[d+32>>3]=u;c[x+28>>2]=1;c[(c[x+4>>2]|0)+28>>2]=-1;c[e>>2]=x;return}x=c[a+3376>>2]|0;if((x|0)==18){Oa[c[a+12>>2]&31](100902);return}else{Pa[x&31](100902,c[a+3540>>2]|0);return}}function Zb(a,b){a=a|0;b=b|0;var d=0;d=a|0;if((c[d>>2]|0)!=0){Wb(a,0)}c[d>>2]=1;c[a+156>>2]=0;c[a+152>>2]=0;c[a+8>>2]=0;c[a+3540>>2]=b;return}function _b(a){a=a|0;var b=0;b=a|0;if((c[b>>2]|0)!=1){Wb(a,1)}c[b>>2]=2;c[a+4>>2]=0;if((c[a+156>>2]|0)<=0){return}c[a+152>>2]=1;return}function $b(a){a=a|0;var b=0;b=a|0;if((c[b>>2]|0)!=2){Wb(a,2)}c[b>>2]=1;return}function ac(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;b=1;d=0;e=i;i=i+168|0;c[e>>2]=0;while(1)switch(b|0){case 1:f=a+3384|0;g=Wc(f|0,b,e)|0;b=46;break;case 46:if((g|0)==0){b=5;break}else{b=2;break};case 2:j=c[a+3376>>2]|0;if((j|0)==18){b=4;break}else{b=3;break};case 3:ha(j|0,100902,c[a+3540>>2]|0);if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;b=45;break;case 4:ga(c[a+12>>2]|0,100902);if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;b=45;break;case 5:k=a|0;if((c[k>>2]|0)==1){b=7;break}else{b=6;break};case 6:ha(26,a|0,1);if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;b=7;break;case 7:c[k>>2]=0;l=a+8|0;if((c[l>>2]|0)==0){b=8;break}else{b=23;break};case 8:if((c[a+120>>2]|0)==0){b=9;break}else{b=12;break};case 9:if((c[a+148>>2]|0)==12){b=10;break}else{b=12;break};case 10:m=ja(2,a|0)|0;if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;if((m|0)==0){b=12;break}else{b=11;break};case 11:c[a+3540>>2]=0;b=45;break;case 12:m=fa(2)|0;if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;c[l>>2]=m;if((m|0)==0){b=22;break}else{b=13;break};case 13:n=a+156|0;m=c[n>>2]|0;o=a+160+(m<<5)|0;if((m|0)>0){b=14;break}else{b=21;break};case 14:r=a+4|0;s=a+160|0;t=c[r>>2]|0;b=15;break;case 15:u=s|0;v=c[s+24>>2]|0;if((t|0)==0){b=16;break}else{b=18;break};case 16:w=ja(8,c[l>>2]|0)|0;if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;if((w|0)==0){b=22;break}else{b=17;break};case 17:m=ma(2,w|0,c[w+4>>2]|0)|0;if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;if((m|0)==0){b=22;break}else{x=w;b=20;break};case 18:m=ja(10,t|0)|0;if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;if((m|0)==0){b=22;break}else{b=19;break};case 19:x=c[t+12>>2]|0;b=20;break;case 20:m=x+16|0;c[(c[m>>2]|0)+12>>2]=v;y=c[m>>2]|0;h[y+16>>3]=+h[u>>3];h[y+24>>3]=+h[s+8>>3];h[y+32>>3]=+h[s+16>>3];c[x+28>>2]=1;c[(c[x+4>>2]|0)+28>>2]=-1;c[r>>2]=x;y=s+32|0;if(y>>>0<o>>>0){s=y;t=x;b=15;break}else{b=21;break};case 21:c[n>>2]=0;c[a+152>>2]=0;b=23;break;case 22:ha(10,f|0,1);if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;;case 23:ga(10,a|0);if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;y=ja(6,a|0)|0;if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;if((y|0)==0){b=24;break}else{b=25;break};case 24:ha(10,f|0,1);if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;;case 25:z=c[l>>2]|0;if((c[a+100>>2]|0)==0){b=26;break}else{b=44;break};case 26:A=a+124|0;if((c[A>>2]|0)==0){b=28;break}else{b=27;break};case 27:y=ia(4,z|0,1,1)|0;if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;B=y;b=29;break;case 28:y=ja(4,z|0)|0;if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;B=y;b=29;break;case 29:if((B|0)==0){b=30;break}else{b=31;break};case 30:ha(10,f|0,1);if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;;case 31:ga(2,z|0);if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;if((c[a+132>>2]|0)==14){b=32;break}else{b=39;break};case 32:if((c[a+144>>2]|0)==2){b=33;break}else{b=39;break};case 33:if((c[a+140>>2]|0)==20){b=34;break}else{b=39;break};case 34:if((c[a+136>>2]|0)==16){b=35;break}else{b=39;break};case 35:if((c[a+3360>>2]|0)==28){b=36;break}else{b=39;break};case 36:if((c[a+3372>>2]|0)==6){b=37;break}else{b=39;break};case 37:if((c[a+3368>>2]|0)==4){b=38;break}else{b=39;break};case 38:if((c[a+3364>>2]|0)==22){b=42;break}else{b=39;break};case 39:if((c[A>>2]|0)==0){b=41;break}else{b=40;break};case 40:ha(12,a|0,z|0);if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;b=42;break;case 41:ha(16,a|0,z|0);if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;b=42;break;case 42:C=a+148|0;if((c[C>>2]|0)==12){b=44;break}else{b=43;break};case 43:ga(4,z|0);if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;ga(c[C>>2]|0,z|0);if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;c[l>>2]=0;c[a+3540>>2]=0;b=45;break;case 44:ga(8,z|0);if((p|0)!=0&(q|0)!=0){d=Xc(c[p>>2]|0,e)|0;if((d|0)>0){b=-1;break}else return}p=q=0;c[a+3540>>2]=0;c[l>>2]=0;b=45;break;case 45:return;case-1:if((d|0)==1){g=q;b=46}p=q=0;break}}function bc(a,b){a=a|0;b=b|0;var c=0.0,d=0.0,e=0;c=+h[a+40>>3];d=+h[b+40>>3];if(c<d){e=1;return e|0}if(!(c==d)){e=0;return e|0}e=+h[a+48>>3]<=+h[b+48>>3]|0;return e|0}function cc(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,f=0,g=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0;d=+h[a+40>>3];e=+h[b+40>>3];do{if(d<e){f=4}else{if(!(d==e)){break}if(!(+h[a+48>>3]>+h[b+48>>3])){f=4}}}while(0);do{if((f|0)==4){g=+h[c+40>>3];if(!(e<g)){if(!(e==g)){break}if(+h[b+48>>3]>+h[c+48>>3]){break}}i=e-d;j=g-e;g=i+j;if(!(g>0.0)){k=0.0;return+k}l=+h[b+48>>3];if(i<j){m=+h[a+48>>3];k=l-m+(m- +h[c+48>>3])*(i/g);return+k}else{i=+h[c+48>>3];k=l-i+(i- +h[a+48>>3])*(j/g);return+k}}}while(0);pa(720,1392,61,1984);return 0.0}function dc(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,f=0,g=0.0,i=0.0,j=0.0,k=0.0;d=+h[a+40>>3];e=+h[b+40>>3];do{if(d<e){f=4}else{if(!(d==e)){break}if(!(+h[a+48>>3]>+h[b+48>>3])){f=4}}}while(0);do{if((f|0)==4){g=+h[c+40>>3];if(!(e<g)){if(!(e==g)){break}if(+h[b+48>>3]>+h[c+48>>3]){break}}i=e-d;j=g-e;if(!(i+j>0.0)){k=0.0;return+k}g=+h[b+48>>3];k=i*(g- +h[c+48>>3])+j*(g- +h[a+48>>3]);return+k}}while(0);pa(720,1392,85,1968);return 0.0}function ec(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0.0,g=0.0,i=0,j=0,k=0,l=0,m=0.0,n=0,o=0,p=0,q=0,r=0.0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0,J=0,K=0,L=0,M=0.0,N=0,O=0,P=0,Q=0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0;f=+h[a+40>>3];g=+h[b+40>>3];do{if(f<g){i=a;j=b}else{if(f==g){if(!(+h[a+48>>3]>+h[b+48>>3])){i=a;j=b;break}}i=b;j=a}}while(0);g=+h[c+40>>3];f=+h[d+40>>3];do{if(g<f){k=c;l=d;m=g}else{if(g==f){if(!(+h[c+48>>3]>+h[d+48>>3])){k=c;l=d;m=g;break}}k=d;l=c;m=f}}while(0);f=+h[i+40>>3];do{if(f<m){n=i;o=j;p=k;q=l;r=m}else{if(f==m){if(!(+h[i+48>>3]>+h[k+48>>3])){n=i;o=j;p=k;q=l;r=m;break}}n=k;o=l;p=i;q=j;r=f}}while(0);j=p+40|0;i=o+40|0;f=+h[i>>3];l=r<f;do{if(l){s=17}else{if(r==f){if(!(+h[p+48>>3]>+h[o+48>>3])){s=17;break}}h[e+40>>3]=(r+f)*.5}}while(0);a:do{if((s|0)==17){m=+h[q+40>>3];k=f<m;do{if(!k){c=f==m;if(c){if(!(+h[o+48>>3]>+h[q+48>>3])){break}}g=+h[n+40>>3];do{if(!(g<r)){if(!(g==r)){pa(720,1392,85,1968)}if(!(+h[n+48>>3]>+h[p+48>>3])){break}pa(720,1392,85,1968)}}while(0);do{if(!l){if(!(r==f)){pa(720,1392,85,1968)}if(!(+h[p+48>>3]>+h[o+48>>3])){break}pa(720,1392,85,1968)}}while(0);t=r-g;u=f-r;if(t+u>0.0){v=+h[p+48>>3];w=t*(v- +h[o+48>>3])+u*(v- +h[n+48>>3])}else{w=0.0}do{if(!(g<m)){if(!(g==m)){pa(720,1392,85,1968)}if(!(+h[n+48>>3]>+h[q+48>>3])){break}pa(720,1392,85,1968)}}while(0);do{if(!(m<f)){if(!c){pa(720,1392,85,1968)}if(!(+h[q+48>>3]>+h[o+48>>3])){break}pa(720,1392,85,1968)}}while(0);v=m-g;u=f-m;if(v+u>0.0){t=+h[q+48>>3];x=v*(t- +h[o+48>>3])+u*(t- +h[n+48>>3])}else{x=0.0}if(w-x<0.0){y=-0.0-w;z=x}else{y=w;z=-0.0-x}t=y<0.0?0.0:y;u=z<0.0?0.0:z;do{if(t>u){A=m+(r-m)*(u/(u+t))}else{if(u==0.0){A=(r+m)*.5;break}else{A=r+(m-r)*(t/(u+t));break}}}while(0);h[e+40>>3]=A;break a}}while(0);t=+h[n+40>>3];do{if(!(t<r)){if(!(t==r)){pa(720,1392,61,1984)}if(!(+h[n+48>>3]>+h[p+48>>3])){break}pa(720,1392,61,1984)}}while(0);do{if(!l){if(!(r==f)){pa(720,1392,61,1984)}if(!(+h[p+48>>3]>+h[o+48>>3])){break}pa(720,1392,61,1984)}}while(0);u=r-t;g=f-r;v=u+g;do{if(v>0.0){B=+h[p+48>>3];if(u<g){C=+h[n+48>>3];D=B-C+(C- +h[o+48>>3])*(u/v);break}else{C=+h[o+48>>3];D=B-C+(C- +h[n+48>>3])*(g/v);break}}else{D=0.0}}while(0);do{if(!l){if(!(r==f)){pa(720,1392,61,1984)}if(!(+h[p+48>>3]>+h[o+48>>3])){break}pa(720,1392,61,1984)}}while(0);do{if(!k){if(!(f==m)){pa(720,1392,61,1984)}if(!(+h[o+48>>3]>+h[q+48>>3])){break}pa(720,1392,61,1984)}}while(0);v=m-f;u=g+v;do{if(u>0.0){t=+h[o+48>>3];if(g<v){C=+h[p+48>>3];E=t-C+(C- +h[q+48>>3])*(g/u);break}else{C=+h[q+48>>3];E=t-C+(C- +h[p+48>>3])*(v/u);break}}else{E=0.0}}while(0);if(D+E<0.0){F=-0.0-D;G=-0.0-E}else{F=D;G=E}u=F<0.0?0.0:F;v=G<0.0?0.0:G;do{if(u>v){H=f+(r-f)*(v/(v+u))}else{if(v==0.0){H=(r+f)*.5;break}else{H=r+g*(u/(v+u));break}}}while(0);h[e+40>>3]=H}}while(0);H=+h[n+48>>3];r=+h[o+48>>3];do{if(H<r){I=n;J=o}else{if(H==r){if(!(+h[n+40>>3]>+h[i>>3])){I=n;J=o;break}}I=o;J=n}}while(0);r=+h[p+48>>3];H=+h[q+48>>3];do{if(r<H){K=p;L=q;M=r}else{if(r==H){if(!(+h[j>>3]>+h[q+40>>3])){K=p;L=q;M=r;break}}K=q;L=p;M=H}}while(0);H=+h[I+48>>3];do{if(H<M){N=I;O=J;P=K;Q=L}else{if(H==M){if(!(+h[I+40>>3]>+h[K+40>>3])){N=I;O=J;P=K;Q=L;break}}N=K;O=L;P=I;Q=J}}while(0);M=+h[P+48>>3];H=+h[O+48>>3];J=M<H;do{if(!J){if(M==H){if(!(+h[P+40>>3]>+h[O+40>>3])){break}}h[e+48>>3]=(M+H)*.5;return}}while(0);r=+h[Q+48>>3];I=H<r;do{if(!I){L=H==r;if(L){if(!(+h[O+40>>3]>+h[Q+40>>3])){break}}f=+h[N+48>>3];do{if(!(f<M)){if(!(f==M)){pa(880,1392,140,1720)}if(!(+h[N+40>>3]>+h[P+40>>3])){break}pa(880,1392,140,1720)}}while(0);do{if(!J){if(!(M==H)){pa(880,1392,140,1720)}if(!(+h[P+40>>3]>+h[O+40>>3])){break}pa(880,1392,140,1720)}}while(0);G=M-f;F=H-M;if(G+F>0.0){E=+h[P+40>>3];R=G*(E- +h[O+40>>3])+F*(E- +h[N+40>>3])}else{R=0.0}do{if(!(f<r)){if(!(f==r)){pa(880,1392,140,1720)}if(!(+h[N+40>>3]>+h[Q+40>>3])){break}pa(880,1392,140,1720)}}while(0);do{if(!(r<H)){if(!L){pa(880,1392,140,1720)}if(!(+h[Q+40>>3]>+h[O+40>>3])){break}pa(880,1392,140,1720)}}while(0);E=r-f;F=H-r;if(E+F>0.0){G=+h[Q+40>>3];S=E*(G- +h[O+40>>3])+F*(G- +h[N+40>>3])}else{S=0.0}if(R-S<0.0){T=-0.0-R;U=S}else{T=R;U=-0.0-S}G=T<0.0?0.0:T;F=U<0.0?0.0:U;do{if(G>F){V=r+(M-r)*(F/(F+G))}else{if(F==0.0){V=(M+r)*.5;break}else{V=M+(r-M)*(G/(F+G));break}}}while(0);h[e+48>>3]=V;return}}while(0);V=+h[N+48>>3];do{if(!(V<M)){if(!(V==M)){pa(880,1392,116,1736)}if(!(+h[N+40>>3]>+h[P+40>>3])){break}pa(880,1392,116,1736)}}while(0);do{if(!J){if(!(M==H)){pa(880,1392,116,1736)}if(!(+h[P+40>>3]>+h[O+40>>3])){break}pa(880,1392,116,1736)}}while(0);U=M-V;V=H-M;T=U+V;do{if(T>0.0){S=+h[P+40>>3];if(U<V){R=+h[N+40>>3];W=S-R+(R- +h[O+40>>3])*(U/T);break}else{R=+h[O+40>>3];W=S-R+(R- +h[N+40>>3])*(V/T);break}}else{W=0.0}}while(0);do{if(!J){if(!(M==H)){pa(880,1392,116,1736)}if(!(+h[P+40>>3]>+h[O+40>>3])){break}pa(880,1392,116,1736)}}while(0);do{if(!I){if(!(H==r)){pa(880,1392,116,1736)}if(!(+h[O+40>>3]>+h[Q+40>>3])){break}pa(880,1392,116,1736)}}while(0);T=r-H;r=V+T;do{if(r>0.0){U=+h[O+40>>3];if(V<T){R=+h[P+40>>3];X=U-R+(R- +h[Q+40>>3])*(V/r);break}else{R=+h[Q+40>>3];X=U-R+(R- +h[P+40>>3])*(T/r);break}}else{X=0.0}}while(0);if(W+X<0.0){Y=-0.0-W;Z=-0.0-X}else{Y=W;Z=X}X=Y<0.0?0.0:Y;Y=Z<0.0?0.0:Z;do{if(X>Y){_=H+(M-H)*(Y/(Y+X))}else{if(Y==0.0){_=(M+H)*.5;break}else{_=M+V*(X/(Y+X));break}}}while(0);h[e+48>>3]=_;return}function fc(a){a=a|0;return 1}function gc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0,q=0.0,r=0,s=0.0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ba=0.0,ca=0.0,da=0,ea=0.0,fa=0,ga=0,ha=0,ia=0.0,ja=0.0,ka=0.0,la=0.0,ma=0.0,na=0.0,oa=0.0,pa=0.0,qa=0.0,ra=0.0,sa=0.0,ta=0.0,ua=0.0,va=0.0,wa=0.0,xa=0,ya=0,za=0,Aa=0.0;b=i;i=i+128|0;d=b|0;e=b+24|0;f=b+48|0;g=b+72|0;j=b+88|0;k=b+104|0;l=a+8|0;m=c[l>>2]|0;n=m|0;o=+h[a+16>>3];p=k|0;h[p>>3]=o;q=+h[a+24>>3];r=k+8|0;h[r>>3]=q;s=+h[a+32>>3];t=k+16|0;h[t>>3]=s;do{if(o==0.0){if(!(q==0.0&s==0.0)){u=0;v=q;w=34;break}x=d+16|0;h[x>>3]=-2.0e+150;y=d+8|0;h[y>>3]=-2.0e+150;z=d|0;h[z>>3]=-2.0e+150;A=e+16|0;h[A>>3]=2.0e+150;B=e+8|0;h[B>>3]=2.0e+150;C=e|0;h[C>>3]=2.0e+150;D=c[m>>2]|0;E=(D|0)==(n|0);if(E){F=-2.0e+150;G=2.0e+150;H=-2.0e+150;I=2.0e+150;J=-2.0e+150;K=2.0e+150}else{L=j|0;M=g|0;N=j+4|0;O=g+4|0;P=j+8|0;Q=g+8|0;R=D;S=2.0e+150;T=-2.0e+150;U=2.0e+150;V=-2.0e+150;W=2.0e+150;X=-2.0e+150;while(1){Y=+h[R+16>>3];if(Y<S){h[C>>3]=Y;c[L>>2]=R;Z=Y}else{Z=S}if(Y>T){h[z>>3]=Y;c[M>>2]=R;_=Y}else{_=T}Y=+h[R+24>>3];if(Y<U){h[B>>3]=Y;c[N>>2]=R;$=Y}else{$=U}if(Y>V){h[y>>3]=Y;c[O>>2]=R;aa=Y}else{aa=V}Y=+h[R+32>>3];if(Y<W){h[A>>3]=Y;c[P>>2]=R;ba=Y}else{ba=W}if(Y>X){h[x>>3]=Y;c[Q>>2]=R;ca=Y}else{ca=X}da=c[R>>2]|0;if((da|0)==(n|0)){F=aa;G=$;H=_;I=Z;J=ca;K=ba;break}else{R=da;S=Z;T=_;U=$;V=aa;W=ba;X=ca}}}R=F-G>H-I|0;Q=J-K>+h[d+(R<<3)>>3]- +h[e+(R<<3)>>3]?2:R;if(!(+h[e+(Q<<3)>>3]<+h[d+(Q<<3)>>3])){Vc(k|0,0,16)|0;h[t>>3]=1.0;ea=0.0;fa=1;ga=a+40|0;ha=a+64|0;break}R=c[j+(Q<<2)>>2]|0;x=c[g+(Q<<2)>>2]|0;X=+h[x+16>>3];W=+h[R+16>>3]-X;h[f>>3]=W;V=+h[x+24>>3];U=+h[R+24>>3]-V;h[f+8>>3]=U;T=+h[x+32>>3];S=+h[R+32>>3]-T;h[f+16>>3]=S;if(!E){Y=0.0;R=D;ia=q;while(1){ja=+h[R+16>>3]-X;ka=+h[R+24>>3]-V;la=+h[R+32>>3]-T;ma=U*la-S*ka;na=S*ja-W*la;la=W*ka-U*ja;ja=la*la+(ma*ma+na*na);if(ja>Y){h[p>>3]=ma;h[r>>3]=na;h[t>>3]=la;oa=ja;pa=na}else{oa=Y;pa=ia}x=c[R>>2]|0;if((x|0)==(n|0)){break}else{Y=oa;R=x;ia=pa}}if(oa>0.0){u=1;v=pa;w=34;break}}Vc(k|0,0,24)|0;if(U<0.0){qa=-0.0-U}else{qa=U}if(W<0.0){ra=-0.0-W}else{ra=W}R=qa>ra|0;if(S<0.0){sa=-0.0-S}else{sa=S}ia=+h[f+(R<<3)>>3];if(ia<0.0){ta=-0.0-ia}else{ta=ia}h[k+((sa>ta?2:R)<<3)>>3]=1.0;u=1;v=+h[r>>3];w=34}else{u=0;v=q;w=34}}while(0);do{if((w|0)==34){r=a+40|0;f=a+64|0;if(!(v<0.0)){ea=v;fa=u;ga=r;ha=f;break}ea=-0.0-v;fa=u;ga=r;ha=f}}while(0);v=+h[p>>3];if(v<0.0){ua=-0.0-v}else{ua=v}p=ea>ua|0;ua=+h[t>>3];if(ua<0.0){va=-0.0-ua}else{va=ua}ua=+h[k+(p<<3)>>3];if(ua<0.0){wa=-0.0-ua}else{wa=ua}t=va>wa?2:p;h[a+40+(t<<3)>>3]=0.0;p=((t+1|0)>>>0)%3|0;h[a+40+(p<<3)>>3]=1.0;u=((t+2|0)>>>0)%3|0;h[a+40+(u<<3)>>3]=0.0;h[a+64+(t<<3)>>3]=0.0;w=+h[k+(t<<3)>>3]>0.0;h[a+64+(p<<3)>>3]=w?-0.0:0.0;h[a+64+(u<<3)>>3]=w?1.0:-1.0;w=c[m>>2]|0;if((w|0)!=(n|0)){m=a+48|0;u=a+56|0;p=a+72|0;t=a+80|0;k=w;do{wa=+h[k+16>>3];va=+h[k+24>>3];ua=+h[k+32>>3];h[k+40>>3]=wa*+h[ga>>3]+va*+h[m>>3]+ua*+h[u>>3];h[k+48>>3]=wa*+h[ha>>3]+va*+h[p>>3]+ua*+h[t>>3];k=c[k>>2]|0;}while((k|0)!=(n|0))}if((fa|0)==0){i=b;return}fa=c[l>>2]|0;l=fa+64|0;ua=0.0;n=l;a:while(1){k=n;while(1){xa=c[k>>2]|0;if((xa|0)==(l|0)){break a}ya=c[xa+8>>2]|0;if((c[ya+28>>2]|0)<1){k=xa}else{za=ya;Aa=ua;break}}while(1){k=c[za+16>>2]|0;t=c[(c[za+4>>2]|0)+16>>2]|0;S=Aa+(+h[k+40>>3]- +h[t+40>>3])*(+h[k+48>>3]+ +h[t+48>>3]);t=c[za+12>>2]|0;if((t|0)==(ya|0)){ua=S;n=xa;continue a}else{za=t;Aa=S}}}za=fa|0;if(!(ua<0.0)){i=b;return}xa=c[fa>>2]|0;if((xa|0)!=(za|0)){fa=xa;do{xa=fa+48|0;h[xa>>3]=-0.0- +h[xa>>3];fa=c[fa>>2]|0;}while((fa|0)!=(za|0))}h[ha>>3]=-0.0- +h[ha>>3];ha=a+72|0;h[ha>>3]=-0.0- +h[ha>>3];ha=a+80|0;h[ha>>3]=-0.0- +h[ha>>3];i=b;return}function hc(a){a=a|0;var b=0,d=0,e=0,f=0;b=Qc(28)|0;if((b|0)==0){d=0;return d|0}c[b+8>>2]=0;c[b+12>>2]=32;e=Qc(132)|0;c[b>>2]=e;if((e|0)==0){Rc(b);d=0;return d|0}f=Qc(264)|0;c[b+4>>2]=f;if((f|0)==0){Rc(e);Rc(b);d=0;return d|0}else{c[b+20>>2]=0;c[b+16>>2]=0;c[b+24>>2]=a;c[e+4>>2]=1;c[f+8>>2]=0;d=b;return d|0}return 0}function ic(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0.0,o=0,p=0.0,q=0,r=0;d=c[a>>2]|0;e=c[a+4>>2]|0;f=c[d+(b<<2)>>2]|0;g=a+8|0;i=a+12|0;a=e+(f<<3)|0;j=b;while(1){b=j<<1;k=c[g>>2]|0;do{if((b|0)<(k|0)){l=b|1;m=c[e+(c[d+(l<<2)>>2]<<3)>>2]|0;n=+h[m+40>>3];o=c[e+(c[d+(b<<2)>>2]<<3)>>2]|0;p=+h[o+40>>3];if(!(n<p)){if(!(n==p)){q=b;break}if(+h[m+48>>3]>+h[o+48>>3]){q=b;break}}q=l}else{q=b}}while(0);if((q|0)>(c[i>>2]|0)){r=8;break}b=c[d+(q<<2)>>2]|0;if((q|0)>(k|0)){r=13;break}l=c[a>>2]|0;p=+h[l+40>>3];o=c[e+(b<<3)>>2]|0;n=+h[o+40>>3];if(p<n){r=13;break}if(p==n){if(!(+h[l+48>>3]>+h[o+48>>3])){r=13;break}}c[d+(j<<2)>>2]=b;c[e+(b<<3)+4>>2]=j;j=q}if((r|0)==8){pa(104,1328,112,2088)}else if((r|0)==13){c[d+(j<<2)>>2]=f;c[e+(f<<3)+4>>2]=j;return}}function jc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0;d=a+8|0;e=(c[d>>2]|0)+1|0;c[d>>2]=e;d=a+12|0;f=c[d>>2]|0;do{if((e<<1|0)>(f|0)){g=a|0;i=c[g>>2]|0;j=a+4|0;k=c[j>>2]|0;c[d>>2]=f<<1;l=Sc(i,f<<3|4)|0;c[g>>2]=l;if((l|0)==0){c[g>>2]=i;m=2147483647;return m|0}i=Sc(c[j>>2]|0,(c[d>>2]<<3)+8|0)|0;c[j>>2]=i;if((i|0)!=0){break}c[j>>2]=k;m=2147483647;return m|0}}while(0);d=a+16|0;f=c[d>>2]|0;k=c[a+4>>2]|0;if((f|0)==0){n=e}else{c[d>>2]=c[k+(f<<3)+4>>2];n=f}f=a|0;c[(c[f>>2]|0)+(e<<2)>>2]=n;c[k+(n<<3)+4>>2]=e;c[k+(n<<3)>>2]=b;if((c[a+20>>2]|0)!=0){b=c[f>>2]|0;f=c[a+4>>2]|0;a=c[b+(e<<2)>>2]|0;k=e>>1;a:do{if((k|0)==0){o=e}else{d=c[f+(a<<3)>>2]|0;p=+h[d+40>>3];j=d+48|0;d=e;i=k;while(1){g=c[b+(i<<2)>>2]|0;l=c[f+(g<<3)>>2]|0;q=+h[l+40>>3];if(q<p){o=d;break a}if(q==p){if(!(+h[l+48>>3]>+h[j>>3])){o=d;break a}}c[b+(d<<2)>>2]=g;c[f+(g<<3)+4>>2]=d;g=i>>1;if((g|0)==0){o=i;break}else{d=i;i=g}}}}while(0);c[b+(o<<2)>>2]=a;c[f+(a<<3)+4>>2]=o}if((n|0)==2147483647){pa(640,1328,207,1864);return 0}else{m=n;return m|0}return 0}function kc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0,r=0,s=0.0,t=0,u=0,v=0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0;d=c[a>>2]|0;e=c[a+4>>2]|0;if((b|0)<=0){pa(824,1328,241,1888)}if((c[a+12>>2]|0)<(b|0)){pa(824,1328,241,1888)}f=e+(b<<3)|0;if((c[f>>2]|0)==0){pa(824,1328,241,1888)}g=e+(b<<3)+4|0;i=c[g>>2]|0;j=a+8|0;k=c[d+(c[j>>2]<<2)>>2]|0;l=d+(i<<2)|0;c[l>>2]=k;c[e+(k<<3)+4>>2]=i;k=(c[j>>2]|0)-1|0;c[j>>2]=k;if((i|0)>(k|0)){c[f>>2]=0;m=a+16|0;n=c[m>>2]|0;c[g>>2]=n;c[m>>2]=b;return}do{if((i|0)>=2){k=i>>1;j=c[d+(k<<2)>>2]|0;o=c[e+(j<<3)>>2]|0;p=+h[o+40>>3];q=c[l>>2]|0;r=c[e+(q<<3)>>2]|0;s=+h[r+40>>3];if(p<s){break}if(p==s){if(!(+h[o+48>>3]>+h[r+48>>3])){break}}a:do{if((k|0)==0){t=i}else{u=r+48|0;v=i;w=k;x=j;y=o;z=p;while(1){if(z<s){t=v;break a}if(z==s){if(!(+h[y+48>>3]>+h[u>>3])){t=v;break a}}c[d+(v<<2)>>2]=x;c[e+(x<<3)+4>>2]=v;A=w>>1;if((A|0)==0){t=w;break a}B=c[d+(A<<2)>>2]|0;C=c[e+(B<<3)>>2]|0;v=w;w=A;x=B;y=C;z=+h[C+40>>3]}}}while(0);c[d+(t<<2)>>2]=q;c[e+(q<<3)+4>>2]=t;c[f>>2]=0;m=a+16|0;n=c[m>>2]|0;c[g>>2]=n;c[m>>2]=b;return}}while(0);ic(a,i);c[f>>2]=0;m=a+16|0;n=c[m>>2]|0;c[g>>2]=n;c[m>>2]=b;return}function lc(a){a=a|0;var b=0,d=0,e=0,f=0;b=Qc(28)|0;if((b|0)==0){d=0;return d|0}e=hc(a)|0;c[b>>2]=e;if((e|0)==0){Rc(b);d=0;return d|0}f=Qc(128)|0;c[b+4>>2]=f;if((f|0)==0){Rc(c[e+4>>2]|0);Rc(c[e>>2]|0);Rc(e);Rc(b);d=0;return d|0}else{c[b+12>>2]=0;c[b+16>>2]=32;c[b+20>>2]=0;c[b+24>>2]=a;d=b;return d|0}return 0}function mc(a){a=a|0;var b=0,d=0;if((a|0)==0){pa(688,592,78,1808)}b=c[a>>2]|0;if((b|0)!=0){Rc(c[b+4>>2]|0);Rc(c[b>>2]|0);Rc(b)}b=c[a+8>>2]|0;if((b|0)!=0){Rc(b)}b=c[a+4>>2]|0;if((b|0)==0){d=a;Rc(d);return}Rc(b);d=a;Rc(d);return}function nc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0.0,H=0,I=0.0,J=0,K=0,L=0,M=0,N=0,O=0,P=0.0,Q=0,R=0,S=0,T=0,U=0.0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0;b=i;i=i+400|0;d=b|0;e=d|0;f=a+12|0;g=c[f>>2]|0;j=Qc((g<<2)+4|0)|0;k=j;l=a+8|0;c[l>>2]=k;if((j|0)==0){m=0;i=b;return m|0}j=k+(g-1<<2)|0;if(!(k>>>0>j>>>0)){n=k;o=c[a+4>>2]|0;while(1){c[n>>2]=o;p=n+4|0;if(p>>>0>j>>>0){break}else{n=p;o=o+4|0}}}c[d>>2]=k;c[d+4>>2]=j;j=d+8|0;d=2016473283;k=e;while(1){o=c[k>>2]|0;n=c[j-8+4>>2]|0;a:do{if(n>>>0>(o+40|0)>>>0){p=n;q=k;r=d;s=o;while(1){t=p;u=p+4|0;v=q;w=r;x=s;while(1){y=(_(w,1539415821)|0)+1|0;z=x;A=x+(((y>>>0)%(((t-z>>2)+1|0)>>>0)|0)<<2)|0;B=c[A>>2]|0;c[A>>2]=c[x>>2];c[x>>2]=B;A=u;C=x-4|0;while(1){D=C+4|0;E=c[D>>2]|0;F=c[E>>2]|0;G=+h[F+40>>3];H=c[B>>2]|0;I=+h[H+40>>3];b:do{if(G<I){J=C;K=D;L=E}else{M=C;N=D;O=F;P=G;Q=E;while(1){if(P==I){if(!(+h[O+48>>3]>+h[H+48>>3])){J=M;K=N;L=Q;break b}}R=N+4|0;S=c[R>>2]|0;T=c[S>>2]|0;U=+h[T+40>>3];if(U<I){J=N;K=R;L=S;break}else{M=N;N=R;O=T;P=U;Q=S}}}}while(0);E=A-4|0;F=c[E>>2]|0;D=c[F>>2]|0;G=+h[D+40>>3];c:do{if(I<G){V=A;W=E;X=F}else{Q=A;O=E;N=D;P=G;M=F;while(1){if(I==P){if(!(+h[H+48>>3]>+h[N+48>>3])){V=Q;W=O;X=M;break c}}S=O-4|0;T=c[S>>2]|0;R=c[T>>2]|0;U=+h[R+40>>3];if(I<U){V=O;W=S;X=T;break}else{Q=O;O=S;N=R;P=U;M=T}}}}while(0);c[K>>2]=X;c[W>>2]=L;if(K>>>0<W>>>0){A=W;C=K}else{break}}C=c[K>>2]|0;c[K>>2]=L;c[W>>2]=C;Y=v|0;if((K-z|0)<(t-W|0)){break}c[Y>>2]=x;c[v+4>>2]=J;C=v+8|0;if(p>>>0>(V+40|0)>>>0){v=C;w=y;x=V}else{Z=C;$=y;aa=V;ba=p;break a}}c[Y>>2]=V;c[v+4>>2]=p;w=v+8|0;if(J>>>0>(x+40|0)>>>0){p=J;q=w;r=y;s=x}else{Z=w;$=y;aa=x;ba=J;break}}}else{Z=k;$=d;aa=o;ba=n}}while(0);n=aa+4|0;if(!(n>>>0>ba>>>0)){o=n;do{n=c[o>>2]|0;d:do{if(o>>>0>aa>>>0){s=o;while(1){r=c[n>>2]|0;I=+h[r+40>>3];q=s-4|0;p=c[q>>2]|0;w=c[p>>2]|0;G=+h[w+40>>3];if(I<G){ca=s;break d}if(I==G){if(!(+h[r+48>>3]>+h[w+48>>3])){ca=s;break d}}c[s>>2]=p;if(q>>>0>aa>>>0){s=q}else{ca=q;break}}}else{ca=o}}while(0);c[ca>>2]=n;o=o+4|0;}while(!(o>>>0>ba>>>0))}o=Z-8|0;if(o>>>0<e>>>0){break}else{j=Z;d=$;k=o}}c[a+16>>2]=g;c[a+20>>2]=1;k=c[a>>2]|0;a=c[k+8>>2]|0;if((a|0)>0){$=a;do{ic(k,$);$=$-1|0;}while(($|0)>0);da=c[f>>2]|0}else{da=g}c[k+20>>2]=1;k=c[l>>2]|0;l=da-1|0;da=k+(l<<2)|0;if((l|0)<=0){m=1;i=b;return m|0}l=c[c[k>>2]>>2]|0;g=k;k=l;G=+h[l+40>>3];while(1){l=g+4|0;f=c[c[l>>2]>>2]|0;I=+h[f+40>>3];if(!(I<G)){if(!(I==G)){ea=38;break}if(+h[f+48>>3]>+h[k+48>>3]){ea=38;break}}if(l>>>0<da>>>0){g=l;k=f;G=I}else{m=1;ea=39;break}}if((ea|0)==38){pa(496,592,164,1792);return 0}else if((ea|0)==39){i=b;return m|0}return 0}function oc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;if((c[a+20>>2]|0)!=0){d=jc(c[a>>2]|0,b)|0;return d|0}e=a+12|0;f=c[e>>2]|0;g=f+1|0;c[e>>2]=g;e=a+16|0;h=c[e>>2]|0;do{if((g|0)>=(h|0)){i=a+4|0;j=c[i>>2]|0;c[e>>2]=h<<1;k=Sc(j,h<<3)|0;c[i>>2]=k;if((k|0)!=0){break}c[i>>2]=j;d=2147483647;return d|0}}while(0);if((f|0)==2147483647){pa(432,592,194,1768);return 0}c[(c[a+4>>2]|0)+(f<<2)>>2]=b;d=~f;return d|0}function pc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0,u=0;b=a+12|0;d=c[b>>2]|0;if((d|0)==0){e=c[a>>2]|0;f=c[e>>2]|0;g=c[e+4>>2]|0;i=f+4|0;j=c[i>>2]|0;k=g+(j<<3)|0;l=c[k>>2]|0;m=e+8|0;n=c[m>>2]|0;if((n|0)<=0){o=l;return o|0}p=c[f+(n<<2)>>2]|0;c[i>>2]=p;c[g+(p<<3)+4>>2]=1;c[k>>2]=0;k=e+16|0;c[g+(j<<3)+4>>2]=c[k>>2];c[k>>2]=j;j=(c[m>>2]|0)-1|0;c[m>>2]=j;if((j|0)<=0){o=l;return o|0}ic(e,1);o=l;return o|0}l=c[a+8>>2]|0;e=c[c[l+(d-1<<2)>>2]>>2]|0;j=c[a>>2]|0;a=j+8|0;m=c[a>>2]|0;do{if((m|0)==0){q=d}else{k=c[j>>2]|0;g=k+4|0;p=c[g>>2]|0;i=c[j+4>>2]|0;n=i+(p<<3)|0;f=c[n>>2]|0;r=+h[f+40>>3];s=+h[e+40>>3];if(!(r<s)){if(!(r==s)){q=d;break}if(+h[f+48>>3]>+h[e+48>>3]){q=d;break}}if((m|0)<=0){o=f;return o|0}t=c[k+(m<<2)>>2]|0;c[g>>2]=t;c[i+(t<<3)+4>>2]=1;c[n>>2]=0;n=j+16|0;c[i+(p<<3)+4>>2]=c[n>>2];c[n>>2]=p;p=(c[a>>2]|0)-1|0;c[a>>2]=p;if((p|0)<=0){o=f;return o|0}ic(j,1);o=f;return o|0}}while(0);while(1){u=q-1|0;if((u|0)<=0){break}if((c[c[l+(q-2<<2)>>2]>>2]|0)==0){q=u}else{break}}c[b>>2]=u;o=e;return o|0}function qc(a){a=a|0;var b=0,d=0,e=0,f=0.0,g=0.0;b=c[a+12>>2]|0;if((b|0)==0){d=c[a>>2]|0;e=c[(c[d+4>>2]|0)+(c[(c[d>>2]|0)+4>>2]<<3)>>2]|0;return e|0}d=c[c[(c[a+8>>2]|0)+(b-1<<2)>>2]>>2]|0;b=c[a>>2]|0;do{if((c[b+8>>2]|0)!=0){a=c[(c[b+4>>2]|0)+(c[(c[b>>2]|0)+4>>2]<<3)>>2]|0;f=+h[a+40>>3];g=+h[d+40>>3];if(f<g){e=a;return e|0}if(!(f==g)){break}if(+h[a+48>>3]>+h[d+48>>3]){break}else{e=a}return e|0}}while(0);e=d;return e|0}function rc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;if((b|0)>-1){kc(c[a>>2]|0,b);return}d=~b;if((c[a+16>>2]|0)<=(d|0)){pa(240,592,254,1840)}b=(c[a+4>>2]|0)+(d<<2)|0;if((c[b>>2]|0)==0){pa(240,592,254,1840)}c[b>>2]=0;b=a+12|0;d=c[b>>2]|0;if((d|0)<=0){return}e=c[a+8>>2]|0;a=d;while(1){d=a-1|0;if((c[c[e+(d<<2)>>2]>>2]|0)!=0){f=10;break}c[b>>2]=d;if((d|0)>0){a=d}else{f=10;break}}if((f|0)==10){return}}function sc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;b=i;i=i+80|0;d=b|0;e=b+24|0;f=b+48|0;g=b+64|0;c[a+100>>2]=0;j=a+8|0;k=(c[j>>2]|0)+92|0;l=c[k>>2]|0;a:do{if((l|0)!=(k|0)){m=f;n=g;o=f|0;p=f+4|0;q=g|0;r=e|0;s=e+8|0;t=e+16|0;u=a+3380|0;v=a+116|0;w=a+3540|0;x=l;b:while(1){y=c[x>>2]|0;z=c[x+12>>2]|0;A=x+16|0;B=c[A>>2]|0;C=c[(c[x+4>>2]|0)+16>>2]|0;do{if(+h[B+40>>3]==+h[C+40>>3]){if(!(+h[B+48>>3]==+h[C+48>>3])){D=x;E=z;break}F=z+12|0;if((c[F>>2]|0)==(x|0)){D=x;E=z;break}Vc(m|0,0,16)|0;c[n>>2]=c[560];c[n+4>>2]=c[561];c[n+8>>2]=c[562];c[n+12>>2]=c[563];G=c[z+16>>2]|0;H=G+12|0;c[o>>2]=c[H>>2];c[p>>2]=c[(c[A>>2]|0)+12>>2];h[r>>3]=+h[G+16>>3];h[s>>3]=+h[G+24>>3];h[t>>3]=+h[G+32>>3];c[H>>2]=0;G=c[u>>2]|0;if((G|0)==4){Va[c[v>>2]&3](r,o,q,H)}else{Ma[G&7](r,o,q,H,c[w>>2]|0)}if((c[H>>2]|0)==0){c[H>>2]=c[o>>2]}if((rb(z,x)|0)==0){I=12;break b}if((sb(x)|0)==0){I=14;break b}D=z;E=c[F>>2]|0}else{D=x;E=z}}while(0);if((c[E+12>>2]|0)==(D|0)){if((E|0)==(D|0)){J=y}else{if((E|0)==(y|0)){I=20}else{if((E|0)==(c[y+4>>2]|0)){I=20}else{K=y}}if((I|0)==20){I=0;K=c[y>>2]|0}if((sb(E)|0)==0){I=22;break}else{J=K}}if((D|0)==(J|0)){I=25}else{if((D|0)==(c[J+4>>2]|0)){I=25}else{L=J}}if((I|0)==25){I=0;L=c[J>>2]|0}if((sb(D)|0)==0){I=28;break}else{M=L}}else{M=y}if((M|0)==(k|0)){break a}else{x=M}}if((I|0)==12){za(a+3384|0,1);return 0}else if((I|0)==14){za(a+3384|0,1);return 0}else if((I|0)==22){za(a+3384|0,1);return 0}else if((I|0)==28){za(a+3384|0,1);return 0}}}while(0);M=lc(4)|0;k=a+108|0;c[k>>2]=M;if((M|0)==0){N=0;i=b;return N|0}L=c[j>>2]|0;D=L|0;J=L|0;while(1){L=c[J>>2]|0;if((L|0)==(D|0)){I=33;break}K=oc(M,L)|0;c[L+56>>2]=K;if((K|0)==2147483647){break}else{J=L|0}}do{if((I|0)==33){if((nc(M)|0)==0){break}J=lb(a,2)|0;D=a+104|0;c[D>>2]=J;if((J|0)==0){za(a+3384|0,1);return 0}Cc(a,-4.0e+150);Cc(a,4.0e+150);J=pc(c[k>>2]|0)|0;c:do{if((J|0)!=0){L=f;K=g;E=f|0;l=f+4|0;e=g|0;x=d|0;o=d+8|0;w=d+16|0;q=a+3380|0;r=a+116|0;v=a+3540|0;u=J;d:while(1){t=u;s=u+40|0;p=u+48|0;n=u+8|0;while(1){m=qc(c[k>>2]|0)|0;if((m|0)==0){break}if(!(+h[m+40>>3]==+h[s>>3])){break}if(!(+h[m+48>>3]==+h[p>>3])){break}m=pc(c[k>>2]|0)|0;z=c[n>>2]|0;A=c[m+8>>2]|0;Vc(L|0,0,16)|0;c[K>>2]=c[560];c[K+4>>2]=c[561];c[K+8>>2]=c[562];c[K+12>>2]=c[563];m=c[z+16>>2]|0;C=m+12|0;c[E>>2]=c[C>>2];c[l>>2]=c[(c[A+16>>2]|0)+12>>2];h[x>>3]=+h[m+16>>3];h[o>>3]=+h[m+24>>3];h[w>>3]=+h[m+32>>3];c[C>>2]=0;m=c[q>>2]|0;if((m|0)==4){Va[c[r>>2]&3](x,E,e,C)}else{Ma[m&7](x,E,e,C,c[v>>2]|0)}if((c[C>>2]|0)==0){c[C>>2]=c[E>>2]}if((rb(z,A)|0)==0){break d}}tc(a,t);u=pc(c[k>>2]|0)|0;if((u|0)==0){break c}}za(a+3384|0,1);return 0}}while(0);J=c[D>>2]|0;u=J+4|0;c[a+112>>2]=c[(c[c[c[u>>2]>>2]>>2]|0)+16>>2];E=c[c[u>>2]>>2]|0;e:do{if((E|0)==0){O=J}else{u=0;v=E;while(1){if((c[v+16>>2]|0)==0){if((c[v+24>>2]|0)==0){I=54;break}if((u|0)==0){P=1}else{I=56;break}}else{P=u}if((c[v+8>>2]|0)!=0){I=58;break}e=c[v>>2]|0;if((c[v+24>>2]|0)!=0){if((c[e+28>>2]|0)!=0){I=61;break}}c[e+24>>2]=0;ob(c[D>>2]|0,c[v+4>>2]|0);Rc(v);e=c[D>>2]|0;x=c[c[e+4>>2]>>2]|0;if((x|0)==0){O=e;break e}else{u=P;v=x}}if((I|0)==54){pa(800,1128,1188,2120);return 0}else if((I|0)==56){pa(664,1128,1189,2120);return 0}else if((I|0)==58){pa(568,1128,1191,2120);return 0}else if((I|0)==61){pa(472,1128,158,2136);return 0}}}while(0);mb(O);mc(c[k>>2]|0);D=c[j>>2]|0;E=D+64|0;J=c[E>>2]|0;do{if((J|0)==(E|0)){Q=D}else{v=J;while(1){u=c[v>>2]|0;x=c[v+8>>2]|0;e=c[x+12>>2]|0;if((e|0)==(x|0)){I=65;break}if((c[e+12>>2]|0)==(x|0)){e=c[x+8>>2]|0;r=e+28|0;c[r>>2]=(c[r>>2]|0)+(c[x+28>>2]|0);r=(c[e+4>>2]|0)+28|0;c[r>>2]=(c[r>>2]|0)+(c[(c[x+4>>2]|0)+28>>2]|0);if((sb(x)|0)==0){N=0;I=71;break}}if((u|0)==(E|0)){I=69;break}else{v=u}}if((I|0)==65){pa(552,1128,1290,2048);return 0}else if((I|0)==69){Q=c[j>>2]|0;break}else if((I|0)==71){i=b;return N|0}}}while(0);zb(Q);N=1;i=b;return N|0}}while(0);mc(c[k>>2]|0);c[k>>2]=0;N=0;i=b;return N|0}function tc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0,v=0.0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0.0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;d=i;i=i+32|0;e=d|0;f=a+112|0;c[f>>2]=b;g=b+8|0;j=c[g>>2]|0;k=j;while(1){l=c[k+24>>2]|0;if((l|0)!=0){break}m=c[k+8>>2]|0;if((m|0)==(j|0)){n=4;break}else{k=m}}if((n|0)==4){c[e>>2]=c[j+4>>2];j=a+104|0;k=c[(pb(c[j>>2]|0,e)|0)>>2]|0;e=k;m=k+4|0;o=c[c[(c[m>>2]|0)+8>>2]>>2]|0;p=o;q=c[k>>2]|0;r=c[o>>2]|0;o=q+4|0;if(+dc(c[(c[o>>2]|0)+16>>2]|0,b,c[q+16>>2]|0)==0.0){Ac(a,e,b);i=d;return}s=c[r+4>>2]|0;r=c[s+16>>2]|0;t=+h[r+40>>3];u=c[(c[o>>2]|0)+16>>2]|0;v=+h[u+40>>3];do{if(t<v){w=e}else{if(t==v){if(!(+h[r+48>>3]>+h[u+48>>3])){w=e;break}}w=p}}while(0);do{if((c[k+12>>2]|0)==0){if((c[w+24>>2]|0)!=0){break}p=c[g>>2]|0;vc(a,e,p,p,0,1);i=d;return}}while(0);do{if((w|0)==(e|0)){k=vb(c[(c[g>>2]|0)+4>>2]|0,c[q+12>>2]|0)|0;if((k|0)!=0){x=k;break}za(a+3384|0,1)}else{k=vb(c[(c[s+8>>2]|0)+4>>2]|0,c[g>>2]|0)|0;if((k|0)==0){za(a+3384|0,1)}else{x=c[k+4>>2]|0;break}}}while(0);g=w+24|0;do{if((c[g>>2]|0)==0){s=Qc(28)|0;if((s|0)==0){za(a+3384|0,1)}q=s;c[q>>2]=x;e=nb(c[j>>2]|0,c[m>>2]|0,s)|0;k=s+4|0;c[k>>2]=e;if((e|0)==0){za(a+3384|0,1)}c[s+24>>2]=0;c[s+16>>2]=0;c[s+20>>2]=0;c[x+24>>2]=s;e=(c[(c[q>>2]|0)+28>>2]|0)+(c[(c[c[(c[k>>2]|0)+4>>2]>>2]|0)+8>>2]|0)|0;c[s+8>>2]=e;a:do{switch(c[a+96>>2]|0){case 100130:{y=e&1;break};case 100131:{y=(e|0)!=0|0;break};case 100134:{if((e|0)>1){y=1;break a}y=(e|0)<-1|0;break};case 100132:{y=(e|0)>0|0;break};case 100133:{y=e>>>31;break};default:{pa(976,1128,253,2072)}}}while(0);c[s+12>>2]=y}else{e=w|0;if((sb(c[e>>2]|0)|0)==0){za(a+3384|0,1)}else{c[g>>2]=0;c[e>>2]=x;c[x+24>>2]=w;break}}}while(0);tc(a,b);i=d;return}b=c[(c[l>>2]|0)+16>>2]|0;w=l;do{z=c[c[(c[w+4>>2]|0)+4>>2]>>2]|0;w=z;A=z;B=c[A>>2]|0;}while((c[B+16>>2]|0)==(b|0));b=z+24|0;do{if((c[b>>2]|0)==0){C=w}else{l=z+4|0;x=vb(c[(c[c[c[(c[l>>2]|0)+8>>2]>>2]>>2]|0)+4>>2]|0,c[B+12>>2]|0)|0;if((x|0)==0){D=a+3384|0;za(D|0,1)}if((c[b>>2]|0)==0){pa(800,1128,171,2104)}if((sb(c[A>>2]|0)|0)==0){D=a+3384|0;za(D|0,1)}else{c[b>>2]=0;c[A>>2]=x;c[x+24>>2]=w;C=c[c[(c[l>>2]|0)+4>>2]>>2]|0;break}}}while(0);if((C|0)==0){D=a+3384|0;za(D|0,1)}D=C+4|0;w=c[c[(c[D>>2]|0)+8>>2]>>2]|0;A=c[w>>2]|0;b=uc(a,w,0)|0;w=b+8|0;B=c[w>>2]|0;if((B|0)!=(A|0)){vc(a,C,B,A,A,1);i=d;return}B=c[c[(c[D>>2]|0)+8>>2]>>2]|0;D=B;z=C|0;l=c[z>>2]|0;x=c[B>>2]|0;B=x+4|0;if((c[(c[l+4>>2]|0)+16>>2]|0)!=(c[(c[B>>2]|0)+16>>2]|0)){yc(a,C)|0}g=l+16|0;y=c[g>>2]|0;m=c[f>>2]|0;v=+h[m+40>>3];do{if(+h[y+40>>3]==v){if(!(+h[y+48>>3]==+h[m+48>>3])){E=0;F=C;G=A;H=m;I=v;break}if((rb(c[(c[A+4>>2]|0)+12>>2]|0,l)|0)==0){za(a+3384|0,1)}j=c[(c[z>>2]|0)+16>>2]|0;e=C;do{J=c[c[(c[e+4>>2]|0)+4>>2]>>2]|0;e=J;K=J;L=c[K>>2]|0;}while((c[L+16>>2]|0)==(j|0));j=J+24|0;do{if((c[j>>2]|0)==0){M=e}else{s=J+4|0;k=vb(c[(c[c[c[(c[s>>2]|0)+8>>2]>>2]>>2]|0)+4>>2]|0,c[L+12>>2]|0)|0;if((k|0)==0){N=a+3384|0;za(N|0,1)}if((c[j>>2]|0)==0){pa(800,1128,171,2104)}if((sb(c[K>>2]|0)|0)==0){N=a+3384|0;za(N|0,1)}else{c[j>>2]=0;c[K>>2]=k;c[k+24>>2]=e;M=c[c[(c[s>>2]|0)+4>>2]>>2]|0;break}}}while(0);if((M|0)==0){N=a+3384|0;za(N|0,1)}else{e=c[c[(c[M+4>>2]|0)+8>>2]>>2]|0;j=c[e>>2]|0;uc(a,e,D)|0;e=c[f>>2]|0;E=1;F=M;G=j;H=e;I=+h[e+40>>3];break}}else{E=0;F=C;G=A;H=m;I=v}}while(0);m=c[x+16>>2]|0;v=+h[m+40>>3];do{if(v==I){if(!(+h[m+48>>3]==+h[H+48>>3])){n=70;break}if((rb(b,c[(c[B>>2]|0)+12>>2]|0)|0)==0){za(a+3384|0,1)}else{O=uc(a,D,0)|0;break}}else{n=70}}while(0);do{if((n|0)==70){if((E|0)!=0){O=b;break}D=c[g>>2]|0;I=+h[D+40>>3];do{if(v<I){n=75}else{if(!(v==I)){P=l;break}if(+h[m+48>>3]>+h[D+48>>3]){P=l}else{n=75}}}while(0);if((n|0)==75){P=c[(c[B>>2]|0)+12>>2]|0}D=vb(c[(c[w>>2]|0)+4>>2]|0,P)|0;if((D|0)==0){za(a+3384|0,1)}H=c[D+8>>2]|0;vc(a,F,D,H,H,0);c[(c[(c[D+4>>2]|0)+24>>2]|0)+24>>2]=1;xc(a,F);i=d;return}}while(0);vc(a,F,c[O+8>>2]|0,G,G,1);i=d;return}function uc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=c[b>>2]|0;if((b|0)==(d|0)){f=e;return f|0}g=a+104|0;h=b;b=e;while(1){i=h+24|0;c[i>>2]=0;j=h+4|0;e=c[c[(c[j>>2]|0)+8>>2]>>2]|0;k=e;l=e;m=c[l>>2]|0;if((c[m+16>>2]|0)==(c[b+16>>2]|0)){n=m;o=b+8|0}else{p=e+24|0;if((c[p>>2]|0)==0){q=6;break}e=b+8|0;r=vb(c[(c[e>>2]|0)+4>>2]|0,c[m+4>>2]|0)|0;if((r|0)==0){q=11;break}if((c[p>>2]|0)==0){q=13;break}if((sb(c[l>>2]|0)|0)==0){q=16;break}c[p>>2]=0;c[l>>2]=r;c[r+24>>2]=k;n=r;o=e}if((c[o>>2]|0)!=(n|0)){if((rb(c[(c[n+4>>2]|0)+12>>2]|0,n)|0)==0){q=19;break}if((rb(b,n)|0)==0){q=21;break}}e=h|0;r=c[e>>2]|0;p=c[r+20>>2]|0;c[p+24>>2]=c[h+12>>2];c[p+8>>2]=r;r=c[e>>2]|0;if((c[i>>2]|0)!=0){if((c[r+28>>2]|0)!=0){q=24;break}}c[r+24>>2]=0;ob(c[g>>2]|0,c[j>>2]|0);Rc(h);r=c[l>>2]|0;if((k|0)==(d|0)){f=r;q=26;break}else{h=k;b=r}}if((q|0)==6){d=h|0;n=c[d>>2]|0;o=c[n+20>>2]|0;c[o+24>>2]=c[h+12>>2];c[o+8>>2]=n;n=c[d>>2]|0;do{if((c[i>>2]|0)!=0){if((c[n+28>>2]|0)==0){break}pa(472,1128,158,2136);return 0}}while(0);c[n+24>>2]=0;ob(c[g>>2]|0,c[j>>2]|0);Rc(h);f=b;return f|0}else if((q|0)==11){za(a+3384|0,1);return 0}else if((q|0)==13){pa(800,1128,171,2104);return 0}else if((q|0)==16){za(a+3384|0,1);return 0}else if((q|0)==19){za(a+3384|0,1);return 0}else if((q|0)==21){za(a+3384|0,1);return 0}else if((q|0)==24){pa(472,1128,158,2136);return 0}else if((q|0)==26){return f|0}return 0}function vc(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var i=0,j=0,k=0,l=0.0,m=0,n=0,o=0.0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;i=a+104|0;j=b+4|0;k=d;while(1){d=c[k+16>>2]|0;l=+h[d+40>>3];m=c[k+4>>2]|0;n=c[m+16>>2]|0;o=+h[n+40>>3];if(!(l<o)){if(!(l==o)){p=5;break}if(+h[d+48>>3]>+h[n+48>>3]){p=5;break}}n=Qc(28)|0;if((n|0)==0){p=7;break}c[n>>2]=m;d=nb(c[i>>2]|0,c[j>>2]|0,n)|0;c[n+4>>2]=d;if((d|0)==0){p=9;break}c[n+24>>2]=0;c[n+16>>2]=0;c[n+20>>2]=0;c[m+24>>2]=n;n=c[k+8>>2]|0;if((n|0)==(e|0)){p=11;break}else{k=n}}if((p|0)==5){pa(400,1128,361,2224)}else if((p|0)==7){za(a+3384|0,1)}else if((p|0)==9){za(a+3384|0,1)}else if((p|0)==11){k=c[c[(c[j>>2]|0)+8>>2]>>2]|0;e=c[(c[k>>2]|0)+4>>2]|0;if((f|0)==0){q=c[e+8>>2]|0}else{q=f}a:do{if((c[e+16>>2]|0)==(c[q+16>>2]|0)){f=a+96|0;n=b;m=q;d=1;r=j;s=k;t=e;b:while(1){u=s;if((c[t+8>>2]|0)!=(m|0)){if((rb(c[(c[t+4>>2]|0)+12>>2]|0,t)|0)==0){p=17;break}if((rb(c[(c[m+4>>2]|0)+12>>2]|0,t)|0)==0){p=19;break}}v=c[n+8>>2]|0;w=t+28|0;x=c[w>>2]|0;y=v-x|0;c[s+8>>2]=y;c:do{switch(c[f>>2]|0){case 100130:{z=y&1;break};case 100133:{z=y>>>31;break};case 100132:{z=(y|0)>0|0;break};case 100134:{if((y|0)>1){z=1;break c}z=(y|0)<-1|0;break};case 100131:{z=(v|0)!=(x|0)|0;break};default:{p=27;break b}}}while(0);c[s+12>>2]=z;c[n+20>>2]=1;do{if((d|0)==0){if((wc(a,n)|0)==0){break}c[w>>2]=(c[w>>2]|0)+(c[m+28>>2]|0);x=(c[t+4>>2]|0)+28|0;c[x>>2]=(c[x>>2]|0)+(c[(c[m+4>>2]|0)+28>>2]|0);x=c[n>>2]|0;if((c[n+24>>2]|0)!=0){if((c[x+28>>2]|0)!=0){p=32;break b}}c[x+24>>2]=0;ob(c[i>>2]|0,c[r>>2]|0);Rc(n);if((sb(m)|0)==0){p=35;break b}}}while(0);w=s+4|0;x=c[c[(c[w>>2]|0)+8>>2]>>2]|0;v=c[(c[x>>2]|0)+4>>2]|0;if((c[v+16>>2]|0)==(c[t+16>>2]|0)){n=u;m=t;d=0;r=w;s=x;t=v}else{A=u;B=x;C=v;break a}}if((p|0)==17){za(a+3384|0,1)}else if((p|0)==19){za(a+3384|0,1)}else if((p|0)==27){pa(976,1128,253,2072)}else if((p|0)==32){pa(472,1128,158,2136)}else if((p|0)==35){za(a+3384|0,1)}}else{A=b;B=k;C=e}}while(0);c[A+20>>2]=1;if(((c[A+8>>2]|0)-(c[C+28>>2]|0)|0)!=(c[B+8>>2]|0)){pa(152,1128,403,2224)}if((g|0)==0){return}xc(a,A);return}}function wc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0,r=0,s=0.0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+56|0;e=d|0;f=d+24|0;g=d+40|0;j=b+4|0;k=c[c[(c[j>>2]|0)+8>>2]>>2]|0;l=c[b>>2]|0;m=c[k>>2]|0;n=l+16|0;o=c[n>>2]|0;p=+h[o+40>>3];q=m+16|0;r=c[q>>2]|0;s=+h[r+40>>3];do{if(!(p<s)){if(p==s){if(!(+h[o+48>>3]>+h[r+48>>3])){break}}t=l+4|0;if(+dc(c[(c[t>>2]|0)+16>>2]|0,r,o)<0.0){u=0;i=d;return u|0}c[b+20>>2]=1;c[(c[c[(c[j>>2]|0)+4>>2]>>2]|0)+20>>2]=1;if((ub(c[t>>2]|0)|0)==0){za(a+3384|0,1);return 0}if((rb(c[(c[m+4>>2]|0)+12>>2]|0,l)|0)==0){za(a+3384|0,1);return 0}else{u=1;i=d;return u|0}}}while(0);j=m+4|0;if(+dc(c[(c[j>>2]|0)+16>>2]|0,o,r)>0.0){u=0;i=d;return u|0}r=c[n>>2]|0;o=c[q>>2]|0;do{if(+h[r+40>>3]==+h[o+40>>3]){if(!(+h[r+48>>3]==+h[o+48>>3])){break}if((r|0)==(o|0)){u=1;i=d;return u|0}rc(c[a+108>>2]|0,c[r+56>>2]|0);q=c[(c[j>>2]|0)+12>>2]|0;m=g;Vc(f|0,0,16)|0;c[m>>2]=c[560];c[m+4>>2]=c[561];c[m+8>>2]=c[562];c[m+12>>2]=c[563];m=c[q+16>>2]|0;t=m+12|0;v=f|0;c[v>>2]=c[t>>2];c[f+4>>2]=c[(c[n>>2]|0)+12>>2];w=g|0;x=e|0;h[x>>3]=+h[m+16>>3];h[e+8>>3]=+h[m+24>>3];h[e+16>>3]=+h[m+32>>3];c[t>>2]=0;m=c[a+3380>>2]|0;if((m|0)==4){Va[c[a+116>>2]&3](x,v,w,t)}else{Ma[m&7](x,v,w,t,c[a+3540>>2]|0)}if((c[t>>2]|0)==0){c[t>>2]=c[v>>2]}if((rb(q,l)|0)==0){za(a+3384|0,1);return 0}else{u=1;i=d;return u|0}}}while(0);if((ub(c[j>>2]|0)|0)==0){za(a+3384|0,1);return 0}if((rb(l,c[(c[j>>2]|0)+12>>2]|0)|0)==0){za(a+3384|0,1);return 0}c[k+20>>2]=1;c[b+20>>2]=1;u=1;i=d;return u|0}function xc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0.0,B=0,C=0;d=a+104|0;e=a+112|0;f=c[c[(c[b+4>>2]|0)+8>>2]>>2]|0;g=b;a:while(1){if((c[f+20>>2]|0)!=0){g=f;f=c[c[(c[f+4>>2]|0)+8>>2]>>2]|0;continue}if((c[g+20>>2]|0)==0){b=c[c[(c[g+4>>2]|0)+4>>2]>>2]|0;if((b|0)==0){i=53;break}if((c[b+20>>2]|0)==0){i=53;break}else{j=g;k=b}}else{j=f;k=g}b=k+20|0;c[b>>2]=0;l=k|0;m=c[l>>2]|0;n=j|0;o=c[n>>2]|0;p=c[(c[m+4>>2]|0)+16>>2]|0;b:do{if((p|0)==(c[(c[o+4>>2]|0)+16>>2]|0)){q=o;r=m;s=j;t=k}else{u=k+4|0;v=c[c[(c[u>>2]|0)+8>>2]>>2]|0;w=c[v>>2]|0;x=+h[p+40>>3];y=w+4|0;z=c[(c[y>>2]|0)+16>>2]|0;A=+h[z+40>>3];B=x==A;if(B){if(+h[p+48>>3]==+h[z+48>>3]){i=10;break a}}do{if(x<A){i=14}else{if(B){if(!(+h[p+48>>3]>+h[z+48>>3])){i=14;break}}if(+dc(z,p,c[w+16>>2]|0)>0.0){q=o;r=m;s=j;t=k;break b}c[v+20>>2]=1;c[b>>2]=1;C=ub(w)|0;if((C|0)==0){i=22;break a}if((rb(c[m+12>>2]|0,c[y>>2]|0)|0)==0){i=24;break a}c[(c[(c[C+4>>2]|0)+20>>2]|0)+24>>2]=c[k+12>>2]}}while(0);if((i|0)==14){i=0;if(+dc(p,z,c[m+16>>2]|0)<0.0){q=o;r=m;s=j;t=k;break}c[b>>2]=1;c[(c[c[(c[u>>2]|0)+4>>2]>>2]|0)+20>>2]=1;w=ub(m)|0;if((w|0)==0){i=16;break a}if((rb(c[y>>2]|0,w)|0)==0){i=18;break a}c[(c[w+20>>2]|0)+24>>2]=c[k+12>>2]}if((c[j+24>>2]|0)!=0){w=c[n>>2]|0;if((c[w+28>>2]|0)!=0){i=28;break a}c[w+24>>2]=0;ob(c[d>>2]|0,c[j+4>>2]|0);Rc(j);if((sb(o)|0)==0){i=30;break a}w=c[c[(c[u>>2]|0)+8>>2]>>2]|0;q=c[w>>2]|0;r=m;s=w;t=k;break}if((c[k+24>>2]|0)==0){q=o;r=m;s=j;t=k;break}w=c[l>>2]|0;if((c[w+28>>2]|0)!=0){i=34;break a}c[w+24>>2]=0;ob(c[d>>2]|0,c[u>>2]|0);Rc(k);if((sb(m)|0)==0){i=36;break a}w=c[c[(c[j+4>>2]|0)+4>>2]>>2]|0;q=o;r=c[w>>2]|0;s=j;t=w}}while(0);o=r+16|0;m=q+16|0;c:do{if((c[o>>2]|0)!=(c[m>>2]|0)){l=c[(c[r+4>>2]|0)+16>>2]|0;n=c[(c[q+4>>2]|0)+16>>2]|0;do{if((l|0)!=(n|0)){if((c[t+24>>2]|0)!=0){break}if((c[s+24>>2]|0)!=0){break}b=c[e>>2]|0;if(!((l|0)==(b|0)|(n|0)==(b|0))){break}if((yc(a,t)|0)==0){break c}else{i=53;break a}}}while(0);wc(a,t)|0}}while(0);if((c[o>>2]|0)!=(c[m>>2]|0)){f=s;g=t;continue}n=c[r+4>>2]|0;l=c[q+4>>2]|0;if((c[n+16>>2]|0)!=(c[l+16>>2]|0)){f=s;g=t;continue}u=q+28|0;c[u>>2]=(c[u>>2]|0)+(c[r+28>>2]|0);u=l+28|0;c[u>>2]=(c[u>>2]|0)+(c[n+28>>2]|0);n=c[t>>2]|0;if((c[t+24>>2]|0)!=0){if((c[n+28>>2]|0)!=0){i=49;break}}c[n+24>>2]=0;ob(c[d>>2]|0,c[t+4>>2]|0);Rc(t);if((sb(r)|0)==0){i=51;break}f=s;g=c[c[(c[s+4>>2]|0)+4>>2]>>2]|0}if((i|0)==10){pa(984,1128,581,2176)}else if((i|0)==16){za(a+3384|0,1)}else if((i|0)==18){za(a+3384|0,1)}else if((i|0)==22){za(a+3384|0,1)}else if((i|0)==24){za(a+3384|0,1)}else if((i|0)==28){pa(472,1128,158,2136)}else if((i|0)==30){za(a+3384|0,1)}else if((i|0)==34){pa(472,1128,158,2136)}else if((i|0)==36){za(a+3384|0,1)}else if((i|0)==49){pa(472,1128,158,2136)}else if((i|0)==51){za(a+3384|0,1)}else if((i|0)==53){return}}function yc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0.0,D=0,E=0.0,F=0,G=0.0,H=0,I=0.0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0.0,R=0,S=0.0,T=0.0,U=0.0,V=0.0,W=0,X=0,Y=0.0,Z=0,_=0.0,$=0.0,aa=0.0,ba=0,ca=0.0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0;d=i;i=i+120|0;e=d|0;f=d+24|0;g=d+40|0;j=d+56|0;k=b+4|0;l=c[c[(c[k>>2]|0)+8>>2]>>2]|0;m=l;n=b|0;o=c[n>>2]|0;p=c[l>>2]|0;q=o+16|0;r=c[q>>2]|0;s=p+16|0;t=c[s>>2]|0;u=o+4|0;v=c[(c[u>>2]|0)+16>>2]|0;w=p+4|0;p=c[(c[w>>2]|0)+16>>2]|0;x=p+40|0;y=v+40|0;do{if(+h[x>>3]==+h[y>>3]){if(!(+h[p+48>>3]==+h[v+48>>3])){break}pa(72,1128,628,2200);return 0}}while(0);z=a+112|0;if(+dc(v,c[z>>2]|0,r)>0.0){pa(8,1128,629,2200);return 0}if(+dc(p,c[z>>2]|0,t)<0.0){pa(1576,1128,630,2200);return 0}A=c[z>>2]|0;if((r|0)==(A|0)|(t|0)==(A|0)){pa(1496,1128,631,2200);return 0}if((c[b+24>>2]|0)!=0){pa(1416,1128,632,2200);return 0}if((c[l+24>>2]|0)!=0){pa(1416,1128,632,2200);return 0}if((r|0)==(t|0)){B=0;i=d;return B|0}A=r+48|0;C=+h[A>>3];D=v+48|0;E=+h[D>>3];F=t+48|0;G=+h[F>>3];H=p+48|0;I=+h[H>>3];if((C>E?E:C)>(G<I?I:G)){B=0;i=d;return B|0}J=r+40|0;I=+h[J>>3];K=t+40|0;E=+h[K>>3];do{if(I<E){L=17}else{if(!(I!=E|C>G)){L=17;break}if(+dc(v,t,r)<0.0){B=0}else{break}i=d;return B|0}}while(0);do{if((L|0)==17){if(+dc(p,r,t)>0.0){B=0}else{break}i=d;return B|0}}while(0);ec(v,r,p,t,j);G=+h[A>>3];C=+h[D>>3];M=j+48|0;E=+h[M>>3];if((G>C?C:G)>E){pa(1352,1128,651,2200);return 0}G=+h[F>>3];C=+h[H>>3];if(E>(G<C?C:G)){pa(1136,1128,652,2200);return 0}G=+h[x>>3];C=+h[y>>3];N=j+40|0;I=+h[N>>3];if((G>C?C:G)>I){pa(1072,1128,653,2200);return 0}G=+h[K>>3];C=+h[J>>3];if(I>(G<C?C:G)){pa(1032,1128,654,2200);return 0}O=c[z>>2]|0;P=O+40|0;Q=+h[P>>3];do{if(I<Q){R=O+48|0;L=31}else{if(!(I==Q)){S=C;T=G;U=I;V=E;break}W=O+48|0;if(E>+h[W>>3]){S=C;T=G;U=I;V=E}else{R=W;L=31}}}while(0);if((L|0)==31){h[N>>3]=Q;E=+h[R>>3];h[M>>3]=E;S=+h[J>>3];T=+h[K>>3];U=Q;V=E}do{if(S<T){X=r;Y=S}else{if(S==T){if(!(+h[A>>3]>+h[F>>3])){X=r;Y=S;break}}X=t;Y=T}}while(0);do{if(Y<U){Z=X+48|0;L=40}else{if(!(Y==U)){_=U;$=S;aa=V;break}R=X+48|0;if(+h[R>>3]>V){_=U;$=S;aa=V}else{Z=R;L=40}}}while(0);if((L|0)==40){h[N>>3]=Y;V=+h[Z>>3];h[M>>3]=V;_=Y;$=+h[J>>3];aa=V}if(_==$){if(!(aa==+h[A>>3])){L=43}}else{L=43}do{if((L|0)==43){if(_==+h[K>>3]){if(aa==+h[F>>3]){break}}$=+h[P>>3];if(+h[y>>3]==$){if(+h[D>>3]==+h[O+48>>3]){ba=O;ca=$;L=50}else{L=48}}else{L=48}do{if((L|0)==48){if(!(+dc(v,O,j)<0.0)){break}A=c[z>>2]|0;ba=A;ca=+h[A+40>>3];L=50}}while(0);do{if((L|0)==50){if(+h[x>>3]==ca){if(!(+h[H>>3]==+h[ba+48>>3])){L=52}}else{L=52}if((L|0)==52){if(!(+dc(p,ba,j)>0.0)){break}}if((ub(c[u>>2]|0)|0)==0){za(a+3384|0,1);return 0}if((ub(c[w>>2]|0)|0)==0){za(a+3384|0,1);return 0}if((rb(c[(c[w>>2]|0)+12>>2]|0,o)|0)==0){za(a+3384|0,1);return 0}A=c[q>>2]|0;h[A+40>>3]=+h[N>>3];h[A+48>>3]=+h[M>>3];J=a+108|0;Z=oc(c[J>>2]|0,A)|0;A=c[q>>2]|0;c[A+56>>2]=Z;if((Z|0)==2147483647){mc(c[J>>2]|0);c[J>>2]=0;za(a+3384|0,1);return 0}J=f|0;c[J>>2]=c[r+12>>2];c[f+4>>2]=c[v+12>>2];c[f+8>>2]=c[t+12>>2];c[f+12>>2]=c[p+12>>2];Z=A+16|0;X=g|0;Vc(Z|0,0,24)|0;zc(A,r,v,X);zc(A,t,p,g+8|0);R=e|0;h[R>>3]=+h[Z>>3];h[e+8>>3]=+h[A+24>>3];h[e+16>>3]=+h[A+32>>3];Z=A+12|0;c[Z>>2]=0;A=c[a+3380>>2]|0;if((A|0)==4){Va[c[a+116>>2]&3](R,J,X,Z)}else{Ma[A&7](R,J,X,Z,c[a+3540>>2]|0)}do{if((c[Z>>2]|0)==0){X=a+100|0;if((c[X>>2]|0)!=0){break}J=c[a+3376>>2]|0;if((J|0)==18){Oa[c[a+12>>2]&31](100156)}else{Pa[J&31](100156,c[a+3540>>2]|0)}c[X>>2]=1}}while(0);c[l+20>>2]=1;c[b+20>>2]=1;c[(c[c[(c[k>>2]|0)+4>>2]>>2]|0)+20>>2]=1;B=0;i=d;return B|0}}while(0);Z=c[z>>2]|0;if((p|0)==(Z|0)){if((ub(c[u>>2]|0)|0)==0){za(a+3384|0,1);return 0}if((rb(c[w>>2]|0,o)|0)==0){za(a+3384|0,1);return 0}X=c[(c[n>>2]|0)+16>>2]|0;J=b;do{da=c[c[(c[J+4>>2]|0)+4>>2]>>2]|0;J=da;ea=da;fa=c[ea>>2]|0;}while((c[fa+16>>2]|0)==(X|0));X=da+24|0;do{if((c[X>>2]|0)==0){ga=J}else{R=da+4|0;A=vb(c[(c[c[c[(c[R>>2]|0)+8>>2]>>2]>>2]|0)+4>>2]|0,c[fa+12>>2]|0)|0;if((A|0)==0){ha=a+3384|0;za(ha|0,1);return 0}if((c[X>>2]|0)==0){pa(800,1128,171,2104);return 0}if((sb(c[ea>>2]|0)|0)==0){ha=a+3384|0;za(ha|0,1);return 0}else{c[X>>2]=0;c[ea>>2]=A;c[A+24>>2]=J;ga=c[c[(c[R>>2]|0)+4>>2]>>2]|0;break}}}while(0);if((ga|0)==0){ha=a+3384|0;za(ha|0,1);return 0}J=c[c[(c[ga+4>>2]|0)+8>>2]>>2]|0;X=c[J>>2]|0;uc(a,J,m)|0;vc(a,ga,c[(c[X+4>>2]|0)+12>>2]|0,X,X,1);B=1;i=d;return B|0}if((v|0)==(Z|0)){if((ub(c[w>>2]|0)|0)==0){za(a+3384|0,1);return 0}if((rb(c[o+12>>2]|0,c[(c[w>>2]|0)+12>>2]|0)|0)==0){za(a+3384|0,1);return 0}X=c[(c[(c[n>>2]|0)+4>>2]|0)+16>>2]|0;J=b;do{ia=c[c[(c[J+4>>2]|0)+4>>2]>>2]|0;J=ia;}while((c[(c[(c[ia>>2]|0)+4>>2]|0)+16>>2]|0)==(X|0));X=c[(c[(c[c[c[(c[ia+4>>2]|0)+8>>2]>>2]>>2]|0)+4>>2]|0)+8>>2]|0;c[n>>2]=c[(c[w>>2]|0)+12>>2];R=c[(uc(a,b,0)|0)+8>>2]|0;vc(a,J,R,c[(c[u>>2]|0)+8>>2]|0,X,1);B=1;i=d;return B|0}do{if(+dc(v,Z,j)<0.0){ja=c[z>>2]|0}else{c[b+20>>2]=1;c[(c[c[(c[k>>2]|0)+4>>2]>>2]|0)+20>>2]=1;if((ub(c[u>>2]|0)|0)==0){za(a+3384|0,1);return 0}else{X=c[z>>2]|0;R=c[q>>2]|0;h[R+40>>3]=+h[X+40>>3];h[R+48>>3]=+h[X+48>>3];ja=X;break}}}while(0);if(+dc(p,ja,j)>0.0){B=0;i=d;return B|0}c[l+20>>2]=1;c[b+20>>2]=1;if((ub(c[w>>2]|0)|0)==0){za(a+3384|0,1);return 0}Z=c[z>>2]|0;J=c[s>>2]|0;h[J+40>>3]=+h[Z+40>>3];h[J+48>>3]=+h[Z+48>>3];B=0;i=d;return B|0}}while(0);wc(a,b)|0;B=0;i=d;return B|0}function zc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0.0,f=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0;e=+h[a+40>>3];f=+h[b+40>>3]-e;if(f<0.0){i=-0.0-f}else{i=f}f=+h[a+48>>3];j=+h[b+48>>3]-f;if(j<0.0){k=-0.0-j}else{k=j}j=i+k;k=+h[c+40>>3]-e;if(k<0.0){l=-0.0-k}else{l=k}k=+h[c+48>>3]-f;if(k<0.0){m=-0.0-k}else{m=k}k=l+m;m=j+k;l=k*.5/m;g[d>>2]=l;k=j*.5/m;g[d+4>>2]=k;m=l;l=k;d=a+16|0;h[d>>3]=+h[d>>3]+(m*+h[b+16>>3]+l*+h[c+16>>3]);d=a+24|0;h[d>>3]=+h[d>>3]+(m*+h[b+24>>3]+l*+h[c+24>>3]);d=a+32|0;h[d>>3]=+h[d>>3]+(m*+h[b+32>>3]+l*+h[c+32>>3]);return}function Ac(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0.0,i=0;e=c[b>>2]|0;f=c[e+16>>2]|0;g=+h[d+40>>3];do{if(+h[f+40>>3]==g){if(!(+h[f+48>>3]==+h[d+48>>3])){break}pa(952,1128,957,2152)}}while(0);f=c[e+4>>2]|0;i=c[f+16>>2]|0;do{if(+h[i+40>>3]==g){if(!(+h[i+48>>3]==+h[d+48>>3])){break}pa(952,1128,978,2152)}}while(0);if((ub(f)|0)==0){za(a+3384|0,1)}f=b+24|0;do{if((c[f>>2]|0)!=0){if((sb(c[e+8>>2]|0)|0)==0){za(a+3384|0,1)}else{c[f>>2]=0;break}}}while(0);if((rb(c[d+8>>2]|0,e)|0)==0){za(a+3384|0,1)}else{tc(a,d);return}}function Bc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0.0,n=0.0;e=c[a+112>>2]|0;a=c[b>>2]|0;b=c[d>>2]|0;d=c[(c[a+4>>2]|0)+16>>2]|0;f=b+4|0;g=c[(c[f>>2]|0)+16>>2]|0;i=(g|0)==(e|0);if((d|0)!=(e|0)){j=c[a+16>>2]|0;if(i){k=+dc(d,e,j)>=0.0;l=k&1;return l|0}else{m=+cc(d,e,j);k=m>=+cc(c[(c[f>>2]|0)+16>>2]|0,e,c[b+16>>2]|0);l=k&1;return l|0}}if(!i){k=+dc(g,e,c[b+16>>2]|0)<=0.0;l=k&1;return l|0}g=c[a+16>>2]|0;m=+h[g+40>>3];a=c[b+16>>2]|0;n=+h[a+40>>3];do{if(!(m<n)){if(m==n){if(!(+h[g+48>>3]>+h[a+48>>3])){break}}k=+dc(e,a,g)>=0.0;l=k&1;return l|0}}while(0);k=+dc(e,g,a)<=0.0;l=k&1;return l|0}function Cc(a,b){a=a|0;b=+b;var d=0,e=0,f=0;d=Qc(28)|0;if((d|0)==0){za(a+3384|0,1)}e=qb(c[a+8>>2]|0)|0;if((e|0)==0){za(a+3384|0,1)}f=c[e+16>>2]|0;h[f+40>>3]=4.0e+150;h[f+48>>3]=b;f=c[(c[e+4>>2]|0)+16>>2]|0;h[f+40>>3]=-4.0e+150;h[f+48>>3]=b;c[a+112>>2]=f;c[d>>2]=e;c[d+8>>2]=0;c[d+12>>2]=0;c[d+24>>2]=0;c[d+16>>2]=1;c[d+20>>2]=0;e=c[a+104>>2]|0;f=nb(e,e|0,d)|0;c[d+4>>2]=f;if((f|0)==0){za(a+3384|0,1)}else{return}}function Dc(a){a=a|0;var b=0,d=0,e=0.0,f=0.0,g=0,i=0,j=0.0,k=0,l=0.0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;b=c[a+8>>2]|0;a=c[b+12>>2]|0;if((a|0)==(b|0)){pa(352,1016,82,1912);return 0}if((c[a+12>>2]|0)==(b|0)){pa(352,1016,82,1912);return 0}else{d=b}while(1){b=c[(c[d+4>>2]|0)+16>>2]|0;e=+h[b+40>>3];a=c[d+16>>2]|0;f=+h[a+40>>3];if(!(e<f)){if(!(e==f)){g=d;i=a;j=f;k=b;l=e;break}if(+h[b+48>>3]>+h[a+48>>3]){g=d;i=a;j=f;k=b;l=e;break}}d=c[(c[d+8>>2]|0)+4>>2]|0}while(1){if(!(j<l)){if(!(j==l)){break}if(+h[i+48>>3]>+h[k+48>>3]){break}}d=c[g+12>>2]|0;b=c[d+16>>2]|0;a=c[(c[d+4>>2]|0)+16>>2]|0;g=d;i=b;j=+h[b+40>>3];k=a;l=+h[a+40>>3]}k=c[(c[g+8>>2]|0)+4>>2]|0;a:do{if((c[g+12>>2]|0)==(k|0)){m=g;n=k}else{i=k;a=g;b:while(1){b=i+16|0;d=i+12|0;o=a;while(1){p=c[(c[o+4>>2]|0)+16>>2]|0;l=+h[p+40>>3];q=c[b>>2]|0;j=+h[q+40>>3];if(l<j){break}if(l==j){if(!(+h[p+48>>3]>+h[q+48>>3])){break}}c:do{if((c[d>>2]|0)==(o|0)){r=o}else{q=o;while(1){p=q+8|0;s=c[(c[p>>2]|0)+4>>2]|0;t=c[s+16>>2]|0;j=+h[t+40>>3];u=c[(c[s+4>>2]|0)+16>>2]|0;l=+h[u+40>>3];do{if(j<l){v=s}else{if(j==l){if(!(+h[t+48>>3]>+h[u+48>>3])){v=s;break}}if(+dc(c[(c[q+4>>2]|0)+16>>2]|0,c[q+16>>2]|0,t)<0.0){r=q;break c}v=c[(c[p>>2]|0)+4>>2]|0}}while(0);p=vb(q,v)|0;if((p|0)==0){w=0;x=40;break b}t=c[p+4>>2]|0;if((c[d>>2]|0)==(t|0)){r=t;break}else{q=t}}}}while(0);q=c[r+12>>2]|0;if((c[q+12>>2]|0)==(i|0)){m=q;n=i;break a}else{o=q}}b=c[d>>2]|0;d:do{if((b|0)==(o|0)){y=i}else{q=i;t=d;p=b;while(1){s=c[(c[p+4>>2]|0)+16>>2]|0;l=+h[s+40>>3];u=c[p+16>>2]|0;j=+h[u+40>>3];do{if(l<j){z=p}else{if(l==j){if(!(+h[s+48>>3]>+h[u+48>>3])){z=p;break}}if(+dc(c[q+16>>2]|0,c[(c[q+4>>2]|0)+16>>2]|0,s)>0.0){y=q;break d}z=c[t>>2]|0}}while(0);s=vb(z,q)|0;if((s|0)==0){w=0;x=40;break b}u=c[s+4>>2]|0;s=u+12|0;A=c[s>>2]|0;if((A|0)==(o|0)){y=u;break}else{q=u;t=s;p=A}}}}while(0);b=c[(c[y+8>>2]|0)+4>>2]|0;if((c[o+12>>2]|0)==(b|0)){m=o;n=b;break a}else{i=b;a=o}}if((x|0)==40){return w|0}}}while(0);y=c[n+12>>2]|0;if((y|0)==(m|0)){pa(784,1016,118,1912);return 0}if((c[y+12>>2]|0)==(m|0)){w=1;return w|0}else{B=n;C=y}while(1){y=vb(C,B)|0;if((y|0)==0){w=0;x=40;break}n=c[y+4>>2]|0;y=c[n+12>>2]|0;if((c[y+12>>2]|0)==(m|0)){w=1;x=40;break}else{B=n;C=y}}if((x|0)==40){return w|0}return 0}function Ec(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+64|0;a=c[b>>2]|0;if((a|0)==(b|0)){d=1;return d|0}else{e=a}while(1){a=c[e>>2]|0;if((c[e+24>>2]|0)!=0){if((Dc(e)|0)==0){d=0;f=5;break}}if((a|0)==(b|0)){d=1;f=5;break}else{e=a}}if((f|0)==5){return d|0}return 0}function Fc(a){a=a|0;var b=0,d=0;b=a+64|0;a=c[b>>2]|0;if((a|0)==(b|0)){return}else{d=a}while(1){a=c[d>>2]|0;if((c[d+24>>2]|0)==0){wb(d)}if((a|0)==(b|0)){break}else{d=a}}return}function Gc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=a+92|0;a=c[e>>2]|0;if((a|0)==(e|0)){f=1;return f|0}g=-b|0;if((d|0)==0){d=a;while(1){h=c[d>>2]|0;i=c[(c[d+20>>2]|0)+24>>2]|0;if((c[(c[(c[d+4>>2]|0)+20>>2]|0)+24>>2]|0)==(i|0)){c[d+28>>2]=0}else{c[d+28>>2]=(i|0)!=0?b:g}if((h|0)==(e|0)){f=1;break}else{d=h}}return f|0}else{j=a}while(1){a=c[j>>2]|0;d=c[(c[j+20>>2]|0)+24>>2]|0;if((c[(c[(c[j+4>>2]|0)+20>>2]|0)+24>>2]|0)==(d|0)){if((sb(j)|0)==0){f=0;k=11;break}}else{c[j+28>>2]=(d|0)!=0?b:g}if((a|0)==(e|0)){f=1;k=11;break}else{j=a}}if((k|0)==11){return f|0}return 0}function Hc(a,b){a=a|0;b=b|0;return}function Ic(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=b+12|0;e=c[d>>2]|0;if((e|0)==0){c[d>>2]=a;return}d=b+8|0;f=c[d>>2]|0;if((f|0)==0){c[d>>2]=a;return}else{g=c[e+24>>2]|0;e=c[f+24>>2]|0;f=c[a+24>>2]|0;h=Qc(16)|0;i=b|0;c[h+12>>2]=c[i>>2];c[h>>2]=g;c[h+4>>2]=e;c[h+8>>2]=f;f=b+4|0;c[f>>2]=(c[f>>2]|0)+1;c[i>>2]=h;c[d>>2]=a;return}}function Jc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;d=b+8|0;e=c[d>>2]|0;if((e|0)==0){c[d>>2]=a;return}f=b+12|0;g=c[f>>2]|0;if((g|0)==0){c[f>>2]=a;return}h=b+24|0;i=(c[h>>2]|0)==0;if(i){j=c[e+24>>2]|0;k=c[g+24>>2]|0;l=c[a+24>>2]|0;m=Qc(16)|0;n=b|0;c[m+12>>2]=c[n>>2];c[m>>2]=j;c[m+4>>2]=k;c[m+8>>2]=l;l=b+4|0;c[l>>2]=(c[l>>2]|0)+1;c[n>>2]=m}else{m=c[g+24>>2]|0;n=c[e+24>>2]|0;e=c[a+24>>2]|0;l=Qc(16)|0;k=b|0;c[l+12>>2]=c[k>>2];c[l>>2]=m;c[l+4>>2]=n;c[l+8>>2]=e;e=b+4|0;c[e>>2]=(c[e>>2]|0)+1;c[k>>2]=l}c[h>>2]=i&1;c[d>>2]=g;c[f>>2]=a;return}function Kc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=b+12|0;e=c[d>>2]|0;if((e|0)==0){c[d>>2]=a;return}f=b+8|0;g=c[f>>2]|0;if((g|0)==0){c[f>>2]=a;return}else{h=c[e+24>>2]|0;e=c[g+24>>2]|0;g=c[a+24>>2]|0;a=Qc(16)|0;i=b|0;c[a+12>>2]=c[i>>2];c[a>>2]=h;c[a+4>>2]=e;c[a+8>>2]=g;g=b+4|0;c[g>>2]=(c[g>>2]|0)+1;c[i>>2]=a;c[d>>2]=0;c[f>>2]=0;return}}function Lc(a,b){a=a|0;b=b|0;Pa[c[b+28>>2]&31](a,b);return}function Mc(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;c[b+12>>2]=0;c[b+8>>2]=0;c[b+24>>2]=0;if((a|0)==4){c[b+28>>2]=8;i=d;return}else if((a|0)==5){c[b+28>>2]=20;i=d;return}else if((a|0)==6){c[b+28>>2]=14;i=d;return}else{ra(c[m>>2]|0,216,(e=i,i=i+8|0,c[e>>2]=a,e)|0)|0;i=e;c[b+28>>2]=6;i=d;return}}function Nc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0.0,i=0.0;g=+h[a>>3];i=+h[a+8>>3];a=Qc(32)|0;d=a;b=f+16|0;f=c[b>>2]|0;c[a+28>>2]=f;h[a>>3]=g;h[a+8>>3]=i;h[a+16>>3]=0.0;if((f|0)==0){c[a+24>>2]=0;c[b>>2]=d;c[e>>2]=a;return}else{c[a+24>>2]=(c[f+24>>2]|0)+1;c[b>>2]=d;c[e>>2]=a;return}}function Oc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,i=0,j=0,k=0,l=0,m=0;g=a+16|0;i=(c[(c[g>>2]|0)+24>>2]|0)+1|0;c[e>>2]=i;e=a+4|0;j=c[e>>2]|0;c[f>>2]=j;c[b>>2]=Qc(i<<4)|0;i=c[e>>2]|0;if((i|0)==0){k=0}else{k=Qc(i*12|0)|0}c[d>>2]=k;k=c[g>>2]|0;if((k|0)!=0){i=k;while(1){k=c[i+24>>2]<<1;e=c[b>>2]|0;h[e+(k<<3)>>3]=+h[i>>3];h[e+((k|1)<<3)>>3]=+h[i+8>>3];k=c[i+28>>2]|0;Rc(i);c[g>>2]=k;if((k|0)==0){break}else{i=k}}}i=a|0;a=c[i>>2]|0;if((a|0)==0){return}else{l=j;m=a}while(1){a=l*3|0;j=c[d>>2]|0;c[j+(a-3<<2)>>2]=c[m>>2];c[j+(a-2<<2)>>2]=c[m+4>>2];c[j+(a-1<<2)>>2]=c[m+8>>2];a=c[m+12>>2]|0;Rc(m);c[i>>2]=a;if((a|0)==0){break}l=l-1|0;m=a}return}function Pc(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0,s=0;i=Nb()|0;j=Qc(32)|0;Vc(j|0,0,20)|0;c[j+28>>2]=6;c[j+24>>2]=0;Xb(i,100107,24);Xb(i,100106,2);Xb(i,100111,2);Zb(i,j);k=g-4|0;g=j+16|0;l=f;while(1){f=l+4|0;m=c[l>>2]|0;n=c[f>>2]|0;_b(i);if((m|0)!=(n|0)){o=m;do{p=+h[o>>3];q=+h[o+8>>3];m=Qc(32)|0;r=c[g>>2]|0;c[m+28>>2]=r;s=m;h[s>>3]=p;h[m+8>>3]=q;h[m+16>>3]=0.0;if((r|0)==0){c[m+24>>2]=0}else{c[m+24>>2]=(c[r+24>>2]|0)+1}c[g>>2]=m;o=o+16|0;Yb(i,s,m);}while((o|0)!=(n|0))}$b(i);if((f|0)==(k|0)){break}else{l=f}}ac(i);Oc(j,a,d,b,e);Rc(j);Vb(i);return}function Qc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,ra=0,sa=0,ta=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ia=0,Ja=0,La=0;do{if(a>>>0<245>>>0){if(a>>>0<11>>>0){b=16}else{b=a+11&-8}d=b>>>3;e=c[570]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=2320+(h<<2)|0;j=2320+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[570]=e&~(1<<g)}else{if(l>>>0<(c[574]|0)>>>0){qa();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{qa();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(!(b>>>0>(c[572]|0)>>>0)){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=2320+(p<<2)|0;m=2320+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[570]=e&~(1<<r)}else{if(l>>>0<(c[574]|0)>>>0){qa();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{qa();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[572]|0;if((l|0)!=0){q=c[575]|0;d=l>>>3;l=d<<1;f=2320+(l<<2)|0;k=c[570]|0;h=1<<d;do{if((k&h|0)==0){c[570]=k|h;s=f;t=2320+(l+2<<2)|0}else{d=2320+(l+2<<2)|0;g=c[d>>2]|0;if(!(g>>>0<(c[574]|0)>>>0)){s=g;t=d;break}qa();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[572]=m;c[575]=e;n=i;return n|0}l=c[571]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[2584+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[574]|0;if(r>>>0<i>>>0){qa();return 0}e=r+b|0;m=e;if(!(r>>>0<e>>>0)){qa();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){qa();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){qa();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){qa();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{qa();return 0}}}while(0);a:do{if((e|0)!=0){f=c[d+28>>2]|0;i=2584+(f<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[571]=c[571]&~(1<<f);break a}else{if(e>>>0<(c[574]|0)>>>0){qa();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break a}}}while(0);if(v>>>0<(c[574]|0)>>>0){qa();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[574]|0)>>>0){qa();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[574]|0)>>>0){qa();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16>>>0){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[572]|0;if((f|0)!=0){e=c[575]|0;i=f>>>3;f=i<<1;q=2320+(f<<2)|0;k=c[570]|0;g=1<<i;do{if((k&g|0)==0){c[570]=k|g;y=q;z=2320+(f+2<<2)|0}else{i=2320+(f+2<<2)|0;l=c[i>>2]|0;if(!(l>>>0<(c[574]|0)>>>0)){y=l;z=i;break}qa();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[572]=p;c[575]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231>>>0){o=-1;break}f=a+11|0;g=f&-8;k=c[571]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215>>>0){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[2584+(A<<2)>>2]|0;b:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break b}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[2584+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(!(J>>>0<((c[572]|0)-g|0)>>>0)){o=g;break}q=K;m=c[574]|0;if(q>>>0<m>>>0){qa();return 0}p=q+g|0;k=p;if(!(q>>>0<p>>>0)){qa();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){qa();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){qa();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){qa();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{qa();return 0}}}while(0);c:do{if((e|0)!=0){i=c[K+28>>2]|0;m=2584+(i<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[571]=c[571]&~(1<<i);break c}else{if(e>>>0<(c[574]|0)>>>0){qa();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break c}}}while(0);if(L>>>0<(c[574]|0)>>>0){qa();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[574]|0)>>>0){qa();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[574]|0)>>>0){qa();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16>>>0){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256>>>0){e=i<<1;m=2320+(e<<2)|0;r=c[570]|0;j=1<<i;do{if((r&j|0)==0){c[570]=r|j;O=m;P=2320+(e+2<<2)|0}else{i=2320+(e+2<<2)|0;d=c[i>>2]|0;if(!(d>>>0<(c[574]|0)>>>0)){O=d;P=i;break}qa();return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215>>>0){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=2584+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[571]|0;l=1<<Q;if((m&l|0)==0){c[571]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=151;break}else{l=l<<1;m=j}}if((T|0)==151){if(S>>>0<(c[574]|0)>>>0){qa();return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[574]|0;if(m>>>0<i>>>0){qa();return 0}if(j>>>0<i>>>0){qa();return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[572]|0;if(!(o>>>0>K>>>0)){S=K-o|0;J=c[575]|0;if(S>>>0>15>>>0){R=J;c[575]=R+o;c[572]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[572]=0;c[575]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[573]|0;if(o>>>0<J>>>0){S=J-o|0;c[573]=S;J=c[576]|0;K=J;c[576]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[564]|0)==0){J=ua(30)|0;if((J-1&J|0)==0){c[566]=J;c[565]=J;c[567]=-1;c[568]=-1;c[569]=0;c[681]=0;c[564]=(Ka(0)|0)&-16^1431655768;break}else{qa();return 0}}}while(0);J=o+48|0;S=c[566]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(!(S>>>0>o>>>0)){n=0;return n|0}O=c[680]|0;do{if((O|0)!=0){P=c[678]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);d:do{if((c[681]&4|0)==0){O=c[576]|0;e:do{if((O|0)==0){T=181}else{L=O;P=2728;while(1){U=P|0;M=c[U>>2]|0;if(!(M>>>0>L>>>0)){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=181;break e}else{P=M}}if((P|0)==0){T=181;break}L=R-(c[573]|0)&Q;if(!(L>>>0<2147483647>>>0)){W=0;break}m=Ga(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=190}}while(0);do{if((T|0)==181){O=Ga(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[565]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[678]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647>>>0)){W=0;break}m=c[680]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=Ga($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=190}}while(0);f:do{if((T|0)==190){m=-_|0;if(!((X|0)==-1)){aa=Y;ba=X;T=201;break d}do{if((Z|0)!=-1&_>>>0<2147483647>>>0&_>>>0<J>>>0){g=c[566]|0;O=K-_+g&-g;if(!(O>>>0<2147483647>>>0)){ca=_;break}if((Ga(O|0)|0)==-1){Ga(m|0)|0;W=Y;break f}else{ca=O+_|0;break}}else{ca=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ca;ba=Z;T=201;break d}}}while(0);c[681]=c[681]|4;da=W;T=198}else{da=0;T=198}}while(0);do{if((T|0)==198){if(!(S>>>0<2147483647>>>0)){break}W=Ga(S|0)|0;Z=Ga(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ca=Z-W|0;Z=ca>>>0>(o+40|0)>>>0;Y=Z?W:-1;if(!((Y|0)==-1)){aa=Z?ca:da;ba=Y;T=201}}}while(0);do{if((T|0)==201){da=(c[678]|0)+aa|0;c[678]=da;if(da>>>0>(c[679]|0)>>>0){c[679]=da}da=c[576]|0;g:do{if((da|0)==0){S=c[574]|0;if((S|0)==0|ba>>>0<S>>>0){c[574]=ba}c[682]=ba;c[683]=aa;c[685]=0;c[579]=c[564];c[578]=-1;S=0;do{Y=S<<1;ca=2320+(Y<<2)|0;c[2320+(Y+3<<2)>>2]=ca;c[2320+(Y+2<<2)>>2]=ca;S=S+1|0;}while(S>>>0<32>>>0);S=ba+8|0;if((S&7|0)==0){ea=0}else{ea=-S&7}S=aa-40-ea|0;c[576]=ba+ea;c[573]=S;c[ba+(ea+4)>>2]=S|1;c[ba+(aa-36)>>2]=40;c[577]=c[568]}else{S=2728;while(1){fa=c[S>>2]|0;ga=S+4|0;ha=c[ga>>2]|0;if((ba|0)==(fa+ha|0)){T=213;break}ca=c[S+8>>2]|0;if((ca|0)==0){break}else{S=ca}}do{if((T|0)==213){if((c[S+12>>2]&8|0)!=0){break}ca=da;if(!(ca>>>0>=fa>>>0&ca>>>0<ba>>>0)){break}c[ga>>2]=ha+aa;Y=(c[573]|0)+aa|0;Z=da+8|0;if((Z&7|0)==0){ia=0}else{ia=-Z&7}Z=Y-ia|0;c[576]=ca+ia;c[573]=Z;c[ca+(ia+4)>>2]=Z|1;c[ca+(Y+4)>>2]=40;c[577]=c[568];break g}}while(0);if(ba>>>0<(c[574]|0)>>>0){c[574]=ba}S=ba+aa|0;Y=2728;while(1){ja=Y|0;if((c[ja>>2]|0)==(S|0)){T=223;break}ca=c[Y+8>>2]|0;if((ca|0)==0){break}else{Y=ca}}do{if((T|0)==223){if((c[Y+12>>2]&8|0)!=0){break}c[ja>>2]=ba;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ba+8|0;if((S&7|0)==0){ka=0}else{ka=-S&7}S=ba+(aa+8)|0;if((S&7|0)==0){la=0}else{la=-S&7}S=ba+(la+aa)|0;ca=S;Z=ka+o|0;W=ba+Z|0;_=W;K=S-(ba+ka)-o|0;c[ba+(ka+4)>>2]=o|3;do{if((ca|0)==(c[576]|0)){J=(c[573]|0)+K|0;c[573]=J;c[576]=_;c[ba+(Z+4)>>2]=J|1}else{if((ca|0)==(c[575]|0)){J=(c[572]|0)+K|0;c[572]=J;c[575]=_;c[ba+(Z+4)>>2]=J|1;c[ba+(J+Z)>>2]=J;break}J=aa+4|0;X=c[ba+(J+la)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;h:do{if(X>>>0<256>>>0){U=c[ba+((la|8)+aa)>>2]|0;Q=c[ba+(aa+12+la)>>2]|0;R=2320+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[574]|0)>>>0){qa();return 0}if((c[U+12>>2]|0)==(ca|0)){break}qa();return 0}}while(0);if((Q|0)==(U|0)){c[570]=c[570]&~(1<<V);break}do{if((Q|0)==(R|0)){ma=Q+8|0}else{if(Q>>>0<(c[574]|0)>>>0){qa();return 0}m=Q+8|0;if((c[m>>2]|0)==(ca|0)){ma=m;break}qa();return 0}}while(0);c[U+12>>2]=Q;c[ma>>2]=U}else{R=S;m=c[ba+((la|24)+aa)>>2]|0;P=c[ba+(aa+12+la)>>2]|0;do{if((P|0)==(R|0)){O=la|16;g=ba+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ba+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){na=0;break}else{oa=O;pa=e}}else{oa=L;pa=g}while(1){g=oa+20|0;L=c[g>>2]|0;if((L|0)!=0){oa=L;pa=g;continue}g=oa+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{oa=L;pa=g}}if(pa>>>0<(c[574]|0)>>>0){qa();return 0}else{c[pa>>2]=0;na=oa;break}}else{g=c[ba+((la|8)+aa)>>2]|0;if(g>>>0<(c[574]|0)>>>0){qa();return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){qa();return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;na=P;break}else{qa();return 0}}}while(0);if((m|0)==0){break}P=c[ba+(aa+28+la)>>2]|0;U=2584+(P<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=na;if((na|0)!=0){break}c[571]=c[571]&~(1<<P);break h}else{if(m>>>0<(c[574]|0)>>>0){qa();return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=na}else{c[m+20>>2]=na}if((na|0)==0){break h}}}while(0);if(na>>>0<(c[574]|0)>>>0){qa();return 0}c[na+24>>2]=m;R=la|16;P=c[ba+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[574]|0)>>>0){qa();return 0}else{c[na+16>>2]=P;c[P+24>>2]=na;break}}}while(0);P=c[ba+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[574]|0)>>>0){qa();return 0}else{c[na+20>>2]=P;c[P+24>>2]=na;break}}}while(0);ra=ba+(($|la)+aa)|0;sa=$+K|0}else{ra=ca;sa=K}J=ra+4|0;c[J>>2]=c[J>>2]&-2;c[ba+(Z+4)>>2]=sa|1;c[ba+(sa+Z)>>2]=sa;J=sa>>>3;if(sa>>>0<256>>>0){V=J<<1;X=2320+(V<<2)|0;P=c[570]|0;m=1<<J;do{if((P&m|0)==0){c[570]=P|m;ta=X;va=2320+(V+2<<2)|0}else{J=2320+(V+2<<2)|0;U=c[J>>2]|0;if(!(U>>>0<(c[574]|0)>>>0)){ta=U;va=J;break}qa();return 0}}while(0);c[va>>2]=_;c[ta+12>>2]=_;c[ba+(Z+8)>>2]=ta;c[ba+(Z+12)>>2]=X;break}V=W;m=sa>>>8;do{if((m|0)==0){wa=0}else{if(sa>>>0>16777215>>>0){wa=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;wa=sa>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=2584+(wa<<2)|0;c[ba+(Z+28)>>2]=wa;c[ba+(Z+20)>>2]=0;c[ba+(Z+16)>>2]=0;X=c[571]|0;Q=1<<wa;if((X&Q|0)==0){c[571]=X|Q;c[m>>2]=V;c[ba+(Z+24)>>2]=m;c[ba+(Z+12)>>2]=V;c[ba+(Z+8)>>2]=V;break}if((wa|0)==31){xa=0}else{xa=25-(wa>>>1)|0}Q=sa<<xa;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(sa|0)){break}ya=X+16+(Q>>>31<<2)|0;m=c[ya>>2]|0;if((m|0)==0){T=296;break}else{Q=Q<<1;X=m}}if((T|0)==296){if(ya>>>0<(c[574]|0)>>>0){qa();return 0}else{c[ya>>2]=V;c[ba+(Z+24)>>2]=X;c[ba+(Z+12)>>2]=V;c[ba+(Z+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[574]|0;if(X>>>0<$>>>0){qa();return 0}if(m>>>0<$>>>0){qa();return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ba+(Z+8)>>2]=m;c[ba+(Z+12)>>2]=X;c[ba+(Z+24)>>2]=0;break}}}while(0);n=ba+(ka|8)|0;return n|0}}while(0);Y=da;Z=2728;while(1){za=c[Z>>2]|0;if(!(za>>>0>Y>>>0)){Aa=c[Z+4>>2]|0;Ba=za+Aa|0;if(Ba>>>0>Y>>>0){break}}Z=c[Z+8>>2]|0}Z=za+(Aa-39)|0;if((Z&7|0)==0){Ca=0}else{Ca=-Z&7}Z=za+(Aa-47+Ca)|0;W=Z>>>0<(da+16|0)>>>0?Y:Z;Z=W+8|0;_=ba+8|0;if((_&7|0)==0){Da=0}else{Da=-_&7}_=aa-40-Da|0;c[576]=ba+Da;c[573]=_;c[ba+(Da+4)>>2]=_|1;c[ba+(aa-36)>>2]=40;c[577]=c[568];c[W+4>>2]=27;c[Z>>2]=c[682];c[Z+4>>2]=c[683];c[Z+8>>2]=c[684];c[Z+12>>2]=c[685];c[682]=ba;c[683]=aa;c[685]=0;c[684]=Z;Z=W+28|0;c[Z>>2]=7;if((W+32|0)>>>0<Ba>>>0){_=Z;while(1){Z=_+4|0;c[Z>>2]=7;if((_+8|0)>>>0<Ba>>>0){_=Z}else{break}}}if((W|0)==(Y|0)){break}_=W-da|0;Z=Y+(_+4)|0;c[Z>>2]=c[Z>>2]&-2;c[da+4>>2]=_|1;c[Y+_>>2]=_;Z=_>>>3;if(_>>>0<256>>>0){K=Z<<1;ca=2320+(K<<2)|0;S=c[570]|0;m=1<<Z;do{if((S&m|0)==0){c[570]=S|m;Ea=ca;Fa=2320+(K+2<<2)|0}else{Z=2320+(K+2<<2)|0;Q=c[Z>>2]|0;if(!(Q>>>0<(c[574]|0)>>>0)){Ea=Q;Fa=Z;break}qa();return 0}}while(0);c[Fa>>2]=da;c[Ea+12>>2]=da;c[da+8>>2]=Ea;c[da+12>>2]=ca;break}K=da;m=_>>>8;do{if((m|0)==0){Ia=0}else{if(_>>>0>16777215>>>0){Ia=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;W=(Y+520192|0)>>>16&4;Z=Y<<W;Y=(Z+245760|0)>>>16&2;Q=14-(W|S|Y)+(Z<<Y>>>15)|0;Ia=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=2584+(Ia<<2)|0;c[da+28>>2]=Ia;c[da+20>>2]=0;c[da+16>>2]=0;ca=c[571]|0;Q=1<<Ia;if((ca&Q|0)==0){c[571]=ca|Q;c[m>>2]=K;c[da+24>>2]=m;c[da+12>>2]=da;c[da+8>>2]=da;break}if((Ia|0)==31){Ja=0}else{Ja=25-(Ia>>>1)|0}Q=_<<Ja;ca=c[m>>2]|0;while(1){if((c[ca+4>>2]&-8|0)==(_|0)){break}La=ca+16+(Q>>>31<<2)|0;m=c[La>>2]|0;if((m|0)==0){T=331;break}else{Q=Q<<1;ca=m}}if((T|0)==331){if(La>>>0<(c[574]|0)>>>0){qa();return 0}else{c[La>>2]=K;c[da+24>>2]=ca;c[da+12>>2]=da;c[da+8>>2]=da;break}}Q=ca+8|0;_=c[Q>>2]|0;m=c[574]|0;if(ca>>>0<m>>>0){qa();return 0}if(_>>>0<m>>>0){qa();return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[da+8>>2]=_;c[da+12>>2]=ca;c[da+24>>2]=0;break}}}while(0);da=c[573]|0;if(!(da>>>0>o>>>0)){break}_=da-o|0;c[573]=_;da=c[576]|0;Q=da;c[576]=Q+o;c[Q+(o+4)>>2]=_|1;c[da+4>>2]=o|3;n=da+8|0;return n|0}}while(0);c[(Ha()|0)>>2]=12;n=0;return n|0}function Rc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[574]|0;if(b>>>0<e>>>0){qa()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){qa()}h=f&-8;i=a+(h-8)|0;j=i;a:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){qa()}if((n|0)==(c[575]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[572]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256>>>0){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=2320+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){qa()}if((c[k+12>>2]|0)==(n|0)){break}qa()}}while(0);if((s|0)==(k|0)){c[570]=c[570]&~(1<<p);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){qa()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}qa()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){qa()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){qa()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){qa()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{qa()}}}while(0);if((p|0)==0){q=n;r=o;break}v=c[a+(l+28)>>2]|0;m=2584+(v<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[571]=c[571]&~(1<<v);q=n;r=o;break a}else{if(p>>>0<(c[574]|0)>>>0){qa()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break a}}}while(0);if(A>>>0<(c[574]|0)>>>0){qa()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[574]|0)>>>0){qa()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[574]|0)>>>0){qa()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(!(d>>>0<i>>>0)){qa()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){qa()}do{if((e&2|0)==0){if((j|0)==(c[576]|0)){B=(c[573]|0)+r|0;c[573]=B;c[576]=q;c[q+4>>2]=B|1;if((q|0)!=(c[575]|0)){return}c[575]=0;c[572]=0;return}if((j|0)==(c[575]|0)){B=(c[572]|0)+r|0;c[572]=B;c[575]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;b:do{if(e>>>0<256>>>0){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=2320+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[574]|0)>>>0){qa()}if((c[u+12>>2]|0)==(j|0)){break}qa()}}while(0);if((g|0)==(u|0)){c[570]=c[570]&~(1<<C);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[574]|0)>>>0){qa()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}qa()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[574]|0)>>>0){qa()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[574]|0)>>>0){qa()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){qa()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{qa()}}}while(0);if((f|0)==0){break}t=c[a+(h+20)>>2]|0;u=2584+(t<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[571]=c[571]&~(1<<t);break b}else{if(f>>>0<(c[574]|0)>>>0){qa()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break b}}}while(0);if(E>>>0<(c[574]|0)>>>0){qa()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[574]|0)>>>0){qa()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[574]|0)>>>0){qa()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[575]|0)){H=B;break}c[572]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256>>>0){d=r<<1;e=2320+(d<<2)|0;A=c[570]|0;E=1<<r;do{if((A&E|0)==0){c[570]=A|E;I=e;J=2320+(d+2<<2)|0}else{r=2320+(d+2<<2)|0;h=c[r>>2]|0;if(!(h>>>0<(c[574]|0)>>>0)){I=h;J=r;break}qa()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215>>>0){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=2584+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[571]|0;d=1<<K;do{if((r&d|0)==0){c[571]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=129;break}else{A=A<<1;J=E}}if((N|0)==129){if(M>>>0<(c[574]|0)>>>0){qa()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[574]|0;if(J>>>0<E>>>0){qa()}if(B>>>0<E>>>0){qa()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[578]|0)-1|0;c[578]=q;if((q|0)==0){O=2736}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[578]=-1;return}function Sc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if((a|0)==0){d=Qc(b)|0;return d|0}if(b>>>0>4294967231>>>0){c[(Ha()|0)>>2]=12;d=0;return d|0}if(b>>>0<11>>>0){e=16}else{e=b+11&-8}f=Tc(a-8|0,e)|0;if((f|0)!=0){d=f+8|0;return d|0}f=Qc(b)|0;if((f|0)==0){d=0;return d|0}e=c[a-4>>2]|0;g=(e&-8)-((e&3|0)==0?8:4)|0;Yc(f|0,a|0,g>>>0<b>>>0?g:b)|0;Rc(a);d=f;return d|0}function Tc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[574]|0;if(g>>>0<j>>>0){qa();return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){qa();return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){qa();return 0}if((k|0)==0){if(b>>>0<256>>>0){n=0;return n|0}do{if(!(f>>>0<(b+4|0)>>>0)){if((f-b|0)>>>0>c[566]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(!(f>>>0<b>>>0)){k=f-b|0;if(!(k>>>0>15>>>0)){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|3;c[l>>2]=c[l>>2]|1;Uc(g+b|0,k);n=a;return n|0}if((i|0)==(c[576]|0)){k=(c[573]|0)+f|0;if(!(k>>>0>b>>>0)){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=l|1;c[576]=g+b;c[573]=l;n=a;return n|0}if((i|0)==(c[575]|0)){l=(c[572]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15>>>0){c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[572]=q;c[575]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;a:do{if(m>>>0<256>>>0){l=c[g+(f+8)>>2]|0;k=c[g+(f+12)>>2]|0;o=2320+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){qa();return 0}if((c[l+12>>2]|0)==(i|0)){break}qa();return 0}}while(0);if((k|0)==(l|0)){c[570]=c[570]&~(1<<e);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){qa();return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}qa();return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24)>>2]|0;t=c[g+(f+12)>>2]|0;do{if((t|0)==(o|0)){u=g+(f+20)|0;v=c[u>>2]|0;if((v|0)==0){w=g+(f+16)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){qa();return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8)>>2]|0;if(u>>>0<j>>>0){qa();return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){qa();return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{qa();return 0}}}while(0);if((s|0)==0){break}t=c[g+(f+28)>>2]|0;l=2584+(t<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[571]=c[571]&~(1<<t);break a}else{if(s>>>0<(c[574]|0)>>>0){qa();return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break a}}}while(0);if(y>>>0<(c[574]|0)>>>0){qa();return 0}c[y+24>>2]=s;o=c[g+(f+16)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[574]|0)>>>0){qa();return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[574]|0)>>>0){qa();return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16>>>0){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;Uc(g+b|0,q);n=a;return n|0}return 0}function Uc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;a:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[574]|0;if(i>>>0<l>>>0){qa()}if((j|0)==(c[575]|0)){m=d+(b+4)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[572]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256>>>0){p=c[d+(8-h)>>2]|0;q=c[d+(12-h)>>2]|0;r=2320+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){qa()}if((c[p+12>>2]|0)==(j|0)){break}qa()}}while(0);if((q|0)==(p|0)){c[570]=c[570]&~(1<<m);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){qa()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}qa()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h)>>2]|0;t=c[d+(12-h)>>2]|0;do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4)|0;w=c[v>>2]|0;if((w|0)==0){x=d+u|0;u=c[x>>2]|0;if((u|0)==0){y=0;break}else{z=u;A=x}}else{z=w;A=v}while(1){v=z+20|0;w=c[v>>2]|0;if((w|0)!=0){z=w;A=v;continue}v=z+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{z=w;A=v}}if(A>>>0<l>>>0){qa()}else{c[A>>2]=0;y=z;break}}else{v=c[d+(8-h)>>2]|0;if(v>>>0<l>>>0){qa()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){qa()}x=t+8|0;if((c[x>>2]|0)==(r|0)){c[w>>2]=t;c[x>>2]=v;y=t;break}else{qa()}}}while(0);if((m|0)==0){n=j;o=k;break}t=c[d+(28-h)>>2]|0;l=2584+(t<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[571]=c[571]&~(1<<t);n=j;o=k;break a}else{if(m>>>0<(c[574]|0)>>>0){qa()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=y}else{c[m+20>>2]=y}if((y|0)==0){n=j;o=k;break a}}}while(0);if(y>>>0<(c[574]|0)>>>0){qa()}c[y+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[574]|0)>>>0){qa()}else{c[y+16>>2]=t;c[t+24>>2]=y;break}}}while(0);t=c[d+(r+4)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[574]|0)>>>0){qa()}else{c[y+20>>2]=t;c[t+24>>2]=y;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[574]|0;if(e>>>0<a>>>0){qa()}y=d+(b+4)|0;z=c[y>>2]|0;do{if((z&2|0)==0){if((f|0)==(c[576]|0)){A=(c[573]|0)+o|0;c[573]=A;c[576]=n;c[n+4>>2]=A|1;if((n|0)!=(c[575]|0)){return}c[575]=0;c[572]=0;return}if((f|0)==(c[575]|0)){A=(c[572]|0)+o|0;c[572]=A;c[575]=n;c[n+4>>2]=A|1;c[n+A>>2]=A;return}A=(z&-8)+o|0;s=z>>>3;b:do{if(z>>>0<256>>>0){g=c[d+(b+8)>>2]|0;t=c[d+(b+12)>>2]|0;h=2320+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){qa()}if((c[g+12>>2]|0)==(f|0)){break}qa()}}while(0);if((t|0)==(g|0)){c[570]=c[570]&~(1<<s);break}do{if((t|0)==(h|0)){B=t+8|0}else{if(t>>>0<a>>>0){qa()}m=t+8|0;if((c[m>>2]|0)==(f|0)){B=m;break}qa()}}while(0);c[g+12>>2]=t;c[B>>2]=g}else{h=e;m=c[d+(b+24)>>2]|0;l=c[d+(b+12)>>2]|0;do{if((l|0)==(h|0)){i=d+(b+20)|0;p=c[i>>2]|0;if((p|0)==0){q=d+(b+16)|0;v=c[q>>2]|0;if((v|0)==0){C=0;break}else{D=v;E=q}}else{D=p;E=i}while(1){i=D+20|0;p=c[i>>2]|0;if((p|0)!=0){D=p;E=i;continue}i=D+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{D=p;E=i}}if(E>>>0<a>>>0){qa()}else{c[E>>2]=0;C=D;break}}else{i=c[d+(b+8)>>2]|0;if(i>>>0<a>>>0){qa()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){qa()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;C=l;break}else{qa()}}}while(0);if((m|0)==0){break}l=c[d+(b+28)>>2]|0;g=2584+(l<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=C;if((C|0)!=0){break}c[571]=c[571]&~(1<<l);break b}else{if(m>>>0<(c[574]|0)>>>0){qa()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=C}else{c[m+20>>2]=C}if((C|0)==0){break b}}}while(0);if(C>>>0<(c[574]|0)>>>0){qa()}c[C+24>>2]=m;h=c[d+(b+16)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[574]|0)>>>0){qa()}else{c[C+16>>2]=h;c[h+24>>2]=C;break}}}while(0);h=c[d+(b+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[574]|0)>>>0){qa()}else{c[C+20>>2]=h;c[h+24>>2]=C;break}}}while(0);c[n+4>>2]=A|1;c[n+A>>2]=A;if((n|0)!=(c[575]|0)){F=A;break}c[572]=A;return}else{c[y>>2]=z&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;F=o}}while(0);o=F>>>3;if(F>>>0<256>>>0){z=o<<1;y=2320+(z<<2)|0;C=c[570]|0;b=1<<o;do{if((C&b|0)==0){c[570]=C|b;G=y;H=2320+(z+2<<2)|0}else{o=2320+(z+2<<2)|0;d=c[o>>2]|0;if(!(d>>>0<(c[574]|0)>>>0)){G=d;H=o;break}qa()}}while(0);c[H>>2]=n;c[G+12>>2]=n;c[n+8>>2]=G;c[n+12>>2]=y;return}y=n;G=F>>>8;do{if((G|0)==0){I=0}else{if(F>>>0>16777215>>>0){I=31;break}H=(G+1048320|0)>>>16&8;z=G<<H;b=(z+520192|0)>>>16&4;C=z<<b;z=(C+245760|0)>>>16&2;o=14-(b|H|z)+(C<<z>>>15)|0;I=F>>>((o+7|0)>>>0)&1|o<<1}}while(0);G=2584+(I<<2)|0;c[n+28>>2]=I;c[n+20>>2]=0;c[n+16>>2]=0;o=c[571]|0;z=1<<I;if((o&z|0)==0){c[571]=o|z;c[G>>2]=y;c[n+24>>2]=G;c[n+12>>2]=n;c[n+8>>2]=n;return}if((I|0)==31){J=0}else{J=25-(I>>>1)|0}I=F<<J;J=c[G>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(F|0)){break}K=J+16+(I>>>31<<2)|0;G=c[K>>2]|0;if((G|0)==0){L=126;break}else{I=I<<1;J=G}}if((L|0)==126){if(K>>>0<(c[574]|0)>>>0){qa()}c[K>>2]=y;c[n+24>>2]=J;c[n+12>>2]=n;c[n+8>>2]=n;return}K=J+8|0;L=c[K>>2]|0;I=c[574]|0;if(J>>>0<I>>>0){qa()}if(L>>>0<I>>>0){qa()}c[L+12>>2]=y;c[K>>2]=y;c[n+8>>2]=L;c[n+12>>2]=J;c[n+24>>2]=0;return}function Vc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;g=b&3;h=d|d<<8|d<<16|d<<24;i=f&~3;if(g){g=b+4-g|0;while((b|0)<(g|0)){a[b]=d;b=b+1|0}}while((b|0)<(i|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function Wc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;r=r+1|0;c[a>>2]=r;while((e|0)<40){if((c[d+(e<<2)>>2]|0)==0){c[d+(e<<2)>>2]=r;c[d+((e<<2)+4)>>2]=b;c[d+((e<<2)+8)>>2]=0;return 0}e=e+2|0}Fa(116);Fa(111);Fa(111);Fa(32);Fa(109);Fa(97);Fa(110);Fa(121);Fa(32);Fa(115);Fa(101);Fa(116);Fa(106);Fa(109);Fa(112);Fa(115);Fa(32);Fa(105);Fa(110);Fa(32);Fa(97);Fa(32);Fa(102);Fa(117);Fa(110);Fa(99);Fa(116);Fa(105);Fa(111);Fa(110);Fa(32);Fa(99);Fa(97);Fa(108);Fa(108);Fa(44);Fa(32);Fa(98);Fa(117);Fa(105);Fa(108);Fa(100);Fa(32);Fa(119);Fa(105);Fa(116);Fa(104);Fa(32);Fa(97);Fa(32);Fa(104);Fa(105);Fa(103);Fa(104);Fa(101);Fa(114);Fa(32);Fa(118);Fa(97);Fa(108);Fa(117);Fa(101);Fa(32);Fa(102);Fa(111);Fa(114);Fa(32);Fa(77);Fa(65);Fa(88);Fa(95);Fa(83);Fa(69);Fa(84);Fa(74);Fa(77);Fa(80);Fa(83);Fa(10);$(0);return 0}function Xc(a,b){a=a|0;b=b|0;var d=0,e=0;while((d|0)<20){e=c[b+(d<<2)>>2]|0;if((e|0)==0)break;if((e|0)==(a|0)){return c[b+((d<<2)+4)>>2]|0}d=d+2|0}return 0}function Yc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return Ca(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function Zc(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function _c(a,b){a=a|0;b=b|0;za(a|0,b|0)}function $c(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;Ma[a&7](b|0,c|0,d|0,e|0,f|0)}function ad(a){a=a|0;return Na[a&3]()|0}function bd(a,b){a=a|0;b=b|0;Oa[a&31](b|0)}function cd(a,b,c){a=a|0;b=b|0;c=c|0;Pa[a&31](b|0,c|0)}function dd(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Qa[a&7](b|0,c|0,d|0)|0}function ed(a,b){a=a|0;b=b|0;return Ra[a&15](b|0)|0}function fd(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Sa[a&7](b|0,c|0,d|0)}function gd(a){a=a|0;Ta[a&3]()}function hd(a,b,c){a=a|0;b=b|0;c=c|0;return Ua[a&7](b|0,c|0)|0}function id(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;Va[a&3](b|0,c|0,d|0,e|0)}function jd(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;$(0)}function kd(){$(1);return 0}function ld(a){a=a|0;$(2)}function md(a,b){a=a|0;b=b|0;$(3)}function nd(a,b,c){a=a|0;b=b|0;c=c|0;$(4);return 0}function od(a){a=a|0;$(5);return 0}function pd(a,b,c){a=a|0;b=b|0;c=c|0;$(6)}function qd(){$(7)}function rd(a,b){a=a|0;b=b|0;$(8);return 0}function sd(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;$(9)}




// EMSCRIPTEN_END_FUNCS
var Ma=[jd,jd,Nc,jd,Mb,jd,jd,jd];var Na=[kd,kd,xb,kd];var Oa=[ld,ld,zb,ld,Fc,ld,Kb,ld,yb,ld,gc,ld,Ub,ld,Ob,ld,Pb,ld,Sb,ld,Qb,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld,ld];var Pa=[md,md,Mc,md,Jb,md,Hc,md,Kc,md,_c,md,Bb,md,Ic,md,Ab,md,Lb,md,Jc,md,Ib,md,Lc,md,Wb,md,Hb,md,md,md];var Qa=[nd,nd,Bc,nd,Gc,nd,nd,nd];var Ra=[od,od,Cb,od,Ec,od,sc,od,qb,od,ub,od,od,od,od,od];var Sa=[pd,pd,Db,pd,Gb,pd,Fb,pd];var Ta=[qd,qd,Rb,qd];var Ua=[rd,rd,rb,rd,bc,rd,rd,rd];var Va=[sd,sd,Tb,sd];return{_testSetjmp:Xc,_strlen:Zc,_free:Rc,_realloc:Sc,_tessellate:Pc,_memset:Vc,_malloc:Qc,_saveSetjmp:Wc,_memcpy:Yc,runPostSets:kb,stackAlloc:Wa,stackSave:Xa,stackRestore:Ya,setThrew:Za,setTempRet0:ab,setTempRet1:bb,setTempRet2:cb,setTempRet3:db,setTempRet4:eb,setTempRet5:fb,setTempRet6:gb,setTempRet7:hb,setTempRet8:ib,setTempRet9:jb,dynCall_viiiii:$c,dynCall_i:ad,dynCall_vi:bd,dynCall_vii:cd,dynCall_iiii:dd,dynCall_ii:ed,dynCall_viii:fd,dynCall_v:gd,dynCall_iii:hd,dynCall_viiii:id}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_viiiii": invoke_viiiii, "invoke_i": invoke_i, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iiii": invoke_iiii, "invoke_ii": invoke_ii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "___assert_fail": ___assert_fail, "_abort": _abort, "_fprintf": _fprintf, "_fflush": _fflush, "_fputc": _fputc, "_sysconf": _sysconf, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "_write": _write, "_send": _send, "_longjmp": _longjmp, "__reallyNegative": __reallyNegative, "__formatString": __formatString, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_fileno": _fileno, "_pwrite": _pwrite, "_putchar": _putchar, "_sbrk": _sbrk, "___errno_location": ___errno_location, "_llvm_lifetime_start": _llvm_lifetime_start, "_mkport": _mkport, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr }, buffer);
var _testSetjmp = Module["_testSetjmp"] = asm["_testSetjmp"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _tessellate = Module["_tessellate"] = asm["_tessellate"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _saveSetjmp = Module["_saveSetjmp"] = asm["_saveSetjmp"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };

// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  throw 'abort() at ' + stackTrace();
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}






};
new emscriptenate(Module);


var tessellate = {};

tessellate.tessellate = (function() {

var c_tessellate = Module.cwrap('tessellate', 'void', ['number', 'number', 'number', 
                                                       'number', 'number', 'number']);
var tessellate = function(loops)
{
    var i;
    if (loops.length === 0)
        throw "Expected at least one loop";

    var vertices = [];
    var boundaries = [0];

    for (var l=0; l<loops.length; ++l) {
        var loop = loops[l];
        if (loop.length % 2 !== 0)
            throw "Expected even number of coordinates";
        vertices.push.apply(vertices, loop);
        boundaries.push(vertices.length);
    }

    var p = Module._malloc(vertices.length * 8);

    for (i=0; i<vertices.length; ++i)
        Module.setValue(p+i*8, vertices[i], "double");

    var contours = Module._malloc(boundaries.length * 4);
    for (i=0; i<boundaries.length; ++i)
        Module.setValue(contours + 4 * i, p + 8 * boundaries[i], 'i32');

    var ppcoordinates_out = Module._malloc(4);
    var pptris_out = Module._malloc(4);
    var pnverts = Module._malloc(4);
    var pntris = Module._malloc(4);

    c_tessellate(ppcoordinates_out, pnverts, pptris_out, pntris, 
                 contours, contours+4*boundaries.length);

    var pcoordinates_out = Module.getValue(ppcoordinates_out, 'i32');
    var ptris_out = Module.getValue(pptris_out, 'i32');

    var nverts = Module.getValue(pnverts, 'i32');
    var ntris = Module.getValue(pntris, 'i32');

    var result_vertices = new Float64Array(nverts * 2);
    var result_triangles = new Int32Array(ntris * 3);

    for (i=0; i<2*nverts; ++i) {
        result_vertices[i] = Module.getValue(pcoordinates_out + i*8, 'double');
    }
    for (i=0; i<3*ntris; ++i) {
        result_triangles[i] = Module.getValue(ptris_out + i*4, 'i32');
    }
    Module._free(pnverts);
    Module._free(pntris);
    Module._free(ppcoordinates_out);
    Module._free(pptris_out);
    Module._free(pcoordinates_out);
    Module._free(ptris_out);
    Module._free(p);
    Module._free(contours);
    return {
        vertices: result_vertices,
        triangles: result_triangles
    };
};

return tessellate;

})();
    if (typeof define === "function" && define.amd) {
        define(tessellate);
    } else if (typeof module === "object" && module.exports) {
        module.exports = tessellate;
    } else {
        this.tessellate = tessellate;
    }
}).apply(this);
};
  var x = {};
  tess.apply(x);

  return x.tessellate.tessellate;
})();
// Some underscore.js extensions

// build objects from key-value pair lists
_.mixin({
    build: function(iterable) {
        var result = {};
        _.each(iterable, function(v) {
            result[v[0]] = v[1];
        });
        return result;
    }
});
// The linalg module is inspired by glMatrix and Sylvester.

// The goal is to be comparably fast as glMatrix but as close to
// Sylvester's generality as possible for
// low-dimensional linear algebra (vec2, 3, 4, mat2, 3, 4).

// In particular, I believe it is possible to have a "fast when
// needed" and "convenient when acceptable" Javascript vector library.

//////////////////////////////////////////////////////////////////////////////

Lux.LinAlg = {};

var vec = {};
var mat = {};
vec.eps = 1e-6;
mat.eps = 1e-6;

Lux.LinAlg.vec = vec;
Lux.LinAlg.mat = mat;
var vec2 = {};

vec2.create = function()
{
    var result = new Float32Array(2);
    result.buffer._type = 'vec2';
    return result;
};

vec2.copy = function(vec)
{
    var result = new Float32Array(2);
    result.buffer._type = 'vec2';
    result[0] = vec[0];
    result[1] = vec[1];
    return result;
};

vec2.make = vec2.copy;

vec2.equal_eps = function(v1, v2)
{
    return Math.abs(v1[0] - v2[0]) < vec.eps &&
        Math.abs(v1[1] - v2[1]) < vec.eps;
};

vec2.equal = function(v1, v2)
{
    return v1[0] === v2[0] && v1[1] === v2[1];
};

vec2.random = function()
{
    var result = vec2.make([Math.random(), Math.random()]);
    return result;
};

vec2.set = function(dest, vec)
{
    dest[0] = vec[0];
    dest[1] = vec[1];
    return dest;
};

vec2.plus = function(v1, v2)
{
    var result = new Float32Array(2);
    result.buffer._type = 'vec2';
    result[0] = v1[0] + v2[0];
    result[1] = v1[1] + v2[1];
    return result;
};

vec2.add = function(dest, other)
{
    dest[0] += other[0];
    dest[1] += other[1];
    return dest;
};

vec2.minus = function(v1, v2)
{
    var result = new Float32Array(2);
    result.buffer._type = 'vec2';
    result[0] = v1[0] - v2[0];
    result[1] = v1[1] - v2[1];
    return result;
};

vec2.subtract = function(dest, other)
{
    dest[0] -= other[0];
    dest[1] -= other[1];
    return dest;
};

vec2.negative = function(v)
{
    var result = new Float32Array(2);
    result.buffer._type = 'vec2';
    result[0] = -v[0];
    result[1] = -v[1];
    return result;
};

vec2.negate = function(dest)
{
    dest[0] = -dest[0];
    dest[1] = -dest[1];
    return dest;
};

vec2.scaling = function(vec, val)
{
    var result = new Float32Array(2);
    result.buffer._type = 'vec2';
    result[0] = vec[0]*val;
    result[1] = vec[1]*val;
    return result;
};

vec2.scale = function(dest, val)
{
    dest[0] *= val;
    dest[1] *= val;
    return dest;
};

vec2.schur_product = function(v1, v2)
{
    var result = new Float32Array(2);
    result.buffer._type = 'vec2';
    result[0] = v1[0] * v2[0];
    result[1] = v1[1] * v2[1];
    return result;
};

vec2.schur_multiply = function(dest, other)
{
    dest[0] *= other[0];
    dest[1] *= other[1];
    return dest;
};

vec2.normalized = function(vec)
{
    var result = new Float32Array(2);
    result.buffer._type = 'vec2';
    var x = vec[0], y = vec[1];
    var len = Math.sqrt(x*x + y*y);
    if (!len)
        return result;
    if (len == 1) {
        result[0] = x;
        result[1] = y;
        return result;
    }
    result[0] = x / len;
    result[1] = y / len;
    return result;
};

vec2.normalize = function(dest)
{
    var x = dest[0], y = dest[1];
    var len = Math.sqrt(x*x + y*y);
    if (!len) {
        dest[0] = dest[1] = 0;
        return dest;
    }
    dest[0] /= len;
    dest[1] /= len;
    return dest;
};

vec2.length = function(vec)
{
    var x = vec[0], y = vec[1];
    return Math.sqrt(x*x + y*y);
};

vec2.length2 = function(vec)
{
    return vec[0] * vec[0] + vec[1] * vec[1];
};

vec2.dot = function(v1, v2)
{
    return v1[0] * v2[0] + v1[1] * v2[1];
};

vec2.map = function(vec, f) {
    return vec2.make(_.map(vec, f));
};

vec2.str = function(v) { return "[" + v[0] + ", " + v[1] + "]"; };

vec2.cross = function(v0, v1) {
    return v0[0] * v1[1] - v0[1] * v1[0];
};
var vec3 = {};

vec3.create = function()
{
    var result = new Float32Array(3);
    result.buffer._type = 'vec3';
    return result;
};

vec3.copy = function(vec)
{
    var result = new Float32Array(3);
    result.buffer._type = 'vec3';
    result[0] = vec[0];
    result[1] = vec[1];
    result[2] = vec[2];
    return result;
};

vec3.make = vec3.copy;

vec3.equal_eps = function(v1, v2)
{
    return Math.abs(v1[0] - v2[0]) < vec.eps &&
           Math.abs(v1[1] - v2[1]) < vec.eps &&
           Math.abs(v1[2] - v2[2]) < vec.eps;
};

vec3.equal = function(v1, v2)
{
    return v1[0] === v2[0] && v1[1] === v2[1] && v1[2] === v2[2];
};

vec3.random = function()
{
    var result = vec3.make([Math.random(), Math.random(), Math.random()]);
    return result;
};

vec3.set = function(dest, vec)
{
    dest[0] = vec[0];
    dest[1] = vec[1];
    dest[2] = vec[2];
    return dest;
};

vec3.plus = function(v1, v2)
{
    var result = new Float32Array(3);
    result.buffer._type = 'vec3';
    result[0] = v1[0] + v2[0];
    result[1] = v1[1] + v2[1];
    result[2] = v1[2] + v2[2];
    return result;
};

vec3.add = function(dest, other)
{
    dest[0] += other[0];
    dest[1] += other[1];
    dest[2] += other[2];
    return dest;
};

vec3.minus = function(v1, v2)
{
    var result = new Float32Array(3);
    result.buffer._type = 'vec3';
    result[0] = v1[0] - v2[0];
    result[1] = v1[1] - v2[1];
    result[2] = v1[2] - v2[2];
    return result;
};

vec3.subtract = function(dest, other)
{
    dest[0] -= other[0];
    dest[1] -= other[1];
    dest[2] -= other[2];
    return dest;
};

vec3.negative = function(v)
{
    var result = new Float32Array(3);
    result.buffer._type = 'vec3';
    result[0] = -v[0];
    result[1] = -v[1];
    result[2] = -v[2];
    return result;
};

vec3.negate = function(dest)
{
    dest[0] = -dest[0];
    dest[1] = -dest[1];
    dest[2] = -dest[2];
    return dest;
};

vec3.scaling = function(vec, val)
{
    var result = new Float32Array(3);
    result.buffer._type = 'vec3';
    result[0] = vec[0]*val;
    result[1] = vec[1]*val;
    result[2] = vec[2]*val;
    return result;
};

vec3.scale = function(dest, val)
{
    dest[0] *= val;
    dest[1] *= val;
    dest[2] *= val;
    return dest;
};

vec3.schur_product = function(v1, v2)
{
    var result = new Float32Array(3);
    result.buffer._type = 'vec3';
    result[0] = v1[0] * v2[0];
    result[1] = v1[1] * v2[1];
    result[2] = v1[2] * v2[2];
    return result;
};

vec3.schur_multiply = function(dest, other)
{
    dest[0] *= other[0];
    dest[1] *= other[1];
    dest[2] *= other[2];
    return dest;
};

vec3.normalized = function(vec)
{
    var result = new Float32Array(3);
    result.buffer._type = 'vec3';
    var x = vec[0], y = vec[1], z = vec[2];
    var len = Math.sqrt(x*x + y*y + z*z);
    if (!len)
        return result;
    if (len == 1) {
        result[0] = x;
        result[1] = y;
        result[2] = z;
        return result;
    }
    result[0] = x / len;
    result[1] = y / len;
    result[2] = z / len;
    return result;
};

vec3.normalize = function(dest)
{
    var x = dest[0], y = dest[1], z = dest[2];
    var len = Math.sqrt(x*x + y*y + z*z);
    if (!len) {
        dest[0] = dest[1] = dest[2] = 0;
        return dest;
    }
    dest[0] /= len;
    dest[1] /= len;
    dest[2] /= len;
    return dest;
};

vec3.cross = function(v1, v2)
{
    var x1 = v1[0], y1 = v1[1], z1 = v1[2];
    var x2 = v2[0], y2 = v2[1], z2 = v2[2];
    var result = new Float32Array(3);
    result.buffer._type = 'vec3';
    result[0] = y1 * z2 - z1 * y2;
    result[1] = z1 * x2 - x1 * z2;
    result[2] = x1 * y2 - y1 * x2;
    return result;
};

vec3.length = function(vec)
{
    var x = vec[0], y = vec[1], z = vec[2];
    return Math.sqrt(x*x + y*y + z*z);
};

vec3.length2 = function(vec)
{
    return vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2];
};

vec3.dot = function(v1, v2)
{
    return v1[0] * v2[0] + 
           v1[1] * v2[1] + 
           v1[2] * v2[2];
};

vec3.map = function(vec, f) {
    return vec3.make(_.map(vec, f));
};

vec3.str = function(v) { 
    return "[" + v[0] + ", " + v[1] + ", " + v[2] + "]";
};
var vec4 = {};

vec4.create = function()
{
    var result = new Float32Array(4);
    result.buffer._type = 'vec4';
    return result;
};

vec4.copy = function(vec)
{
    var result = new Float32Array(4);
    result.buffer._type = 'vec4';
    result[0] = vec[0];
    result[1] = vec[1];
    result[2] = vec[2];
    result[3] = vec[3];
    return result;
};

vec4.make = vec4.copy;

vec4.random = function() {
    var lst = [Math.random(), Math.random(), Math.random(), Math.random()];
    return vec4.make(lst);
};

vec4.equal_eps = function(v1, v2)
{
    return Math.abs(v1[0] - v2[0]) < vec.eps &&
        Math.abs(v1[1] - v2[1]) < vec.eps &&
        Math.abs(v1[2] - v2[2]) < vec.eps &&
        Math.abs(v1[3] - v2[3]) < vec.eps;
};

vec4.equal = function(v1, v2)
{
    return v1[0] === v2[0] && v1[1] === v2[1] && v1[2] === v2[2] && v1[3] === v2[3];
};

vec4.set = function(dest, vec)
{
    dest[0] = vec[0];
    dest[1] = vec[1];
    dest[2] = vec[2];
    dest[3] = vec[3];
    return dest;
};

vec4.plus = function(v1, v2)
{
    var result = new Float32Array(4);
    result.buffer._type = 'vec4';
    result[0] = v1[0] + v2[0];
    result[1] = v1[1] + v2[1];
    result[2] = v1[2] + v2[2];
    result[3] = v1[3] + v2[3];
    return result;
};

vec4.add = function(dest, other)
{
    dest[0] += other[0];
    dest[1] += other[1];
    dest[2] += other[2];
    dest[3] += other[3];
    return dest;
};

vec4.minus = function(v1, v2)
{
    var result = new Float32Array(4);
    result.buffer._type = 'vec4';
    result[0] = v1[0] - v2[0];
    result[1] = v1[1] - v2[1];
    result[2] = v1[2] - v2[2];
    result[3] = v1[3] - v2[3];
    return result;
};

vec4.subtract = function(dest, other)
{
    dest[0] -= other[0];
    dest[1] -= other[1];
    dest[2] -= other[2];
    dest[3] -= other[3];
    return dest;
};

vec4.negative = function(v)
{
    var result = new Float32Array(4);
    result.buffer._type = 'vec4';
    result[0] = -v[0];
    result[1] = -v[1];
    result[2] = -v[2];
    result[3] = -v[3];
    return result;
};

vec4.negate = function(dest)
{
    dest[0] = -dest[0];
    dest[1] = -dest[1];
    dest[2] = -dest[2];
    dest[3] = -dest[3];
    return dest;
};

vec4.scaling = function(vec, val)
{
    var result = new Float32Array(4);
    result.buffer._type = 'vec4';
    result[0] = vec[0]*val;
    result[1] = vec[1]*val;
    result[2] = vec[2]*val;
    result[3] = vec[3]*val;
    return result;
};

vec4.scale = function(dest, val)
{
    dest[0] *= val;
    dest[1] *= val;
    dest[2] *= val;
    dest[3] *= val;
    return dest;
};

vec4.schur_product = function(v1, v2)
{
    var result = new Float32Array(4);
    result.buffer._type = 'vec4';
    result[0] = v1[0] * v2[0];
    result[1] = v1[1] * v2[1];
    result[2] = v1[2] * v2[2];
    result[3] = v1[3] * v2[3];
    return result;
};

vec4.schur_multiply = function(dest, other)
{
    dest[0] *= other[0];
    dest[1] *= other[1];
    dest[2] *= other[2];
    dest[3] *= other[3];
    return dest;
};

vec4.normalized = function(vec)
{
    var result = new Float32Array(4);
    result.buffer._type = 'vec4';
    var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
    var len = Math.sqrt(x*x + y*y + z*z + w*w);
    if (!len)
        return result;
    if (len == 1) {
        result[0] = x;
        result[1] = y;
        result[2] = z;
        result[3] = w;
        return result;
    }
    result[0] = x / len;
    result[1] = y / len;
    result[2] = z / len;
    result[3] = w / len;
    return result;
};

vec4.normalize = function(dest)
{
    var x = dest[0], y = dest[1], z = dest[2], w = dest[3];
    var len = Math.sqrt(x*x + y*y + z*z + w*w);
    if (!len) {
        dest[0] = dest[1] = dest[2] = dest[3] = 0;
        return dest;
    }
    dest[0] /= len;
    dest[1] /= len;
    dest[2] /= len;
    dest[3] /= len;
    return dest;
};

vec4.length = function(vec)
{
    var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

vec4.length2 = function(vec)
{
    return vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2] + vec[3] * vec[3];
};

vec4.dot = function(v1, v2)
{
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2] + v1[3] * v2[3];
};

vec4.map = function(vec, f) {
    return vec4.make(_.map(vec, f));
};

vec4.str = function(v) { 
    return "[" + v[0] + ", " + v[1] + ", " + v[2] + ", " + v[3] + "]";
};
var mat2 = {};

mat2.create = function()
{
    var result = new Float32Array(4);
    result.buffer._type = 'mat2';
    return result;
};

mat2.copy = function(mat)
{
    var result = new Float32Array(4);
    result.buffer._type = 'mat2';
    result[0] = mat[0];
    result[1] = mat[1];
    result[2] = mat[2];
    result[3] = mat[3];
    return result;
};
mat2.make = mat2.copy;

mat2.equal = function(v1, v2)
{
    return Math.abs(v1[0] - v2[0]) < mat.eps &&
        Math.abs(v1[1] - v2[1]) < mat.eps &&
        Math.abs(v1[2] - v2[2]) < mat.eps &&
        Math.abs(v1[3] - v2[3]) < mat.eps;
};

mat2.random = function()
{
    var result = new Float32Array(4);
    result.buffer._type = 'mat2';
    result[0] = Math.random();
    result[1] = Math.random();
    result[2] = Math.random();
    result[3] = Math.random();
    return result;
};

mat2.set = function(dest, mat)
{
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[3];
    return dest;
};

(function() {
var _identity = new Float32Array([1,0,0,1]);

mat2.identity = function()
{
    var result = new Float32Array(_identity);
    result.buffer._type = 'mat2';
    return result;
};

mat2.set_identity = function(mat)
{
    mat2.set(mat, _identity);
    return mat;
};
})();

mat2.transpose = function(mat)
{
    var result = new Float32Array(4);
    result.buffer._type = 'mat2';
    result[0] = mat[0];
    result[1] = mat[2];
    result[2] = mat[1];
    result[3] = mat[3];
    return result;
};

mat2.set_transpose = function(dest, mat)
{
    if (mat == dest) {
        var a01 = mat[1];
        dest[1] = mat[2];
        dest[2] = a01;
        return dest;
    } else {
        dest[0] = mat[0];
        dest[1] = mat[2];
        dest[2] = mat[1];
        dest[3] = mat[3];
        return dest;
    }
};

mat2.determinant = function(mat)
{
    return mat[0]*mat[3] - mat[1]*mat[2];
};

// From glMatrix
mat2.inverse = function(mat)
{
    var result = new Float32Array(4);
    result.buffer._type = 'mat2';
	
    var a00 = mat[0], a01 = mat[1];
    var a10 = mat[2], a11 = mat[3];
    
    // Calculate the determinant (inlined to avoid double-caching)
    var det = (a00*a11 - a01*a10);
    if (det === 0)
        throw new Error("Singular matrix");

    result[0] =  a11/det;
    result[1] = -a01/det;
    result[2] = -a10/det;
    result[3] =  a00/det;

    return result;
};

mat2.invert = function(mat)
{
    var a00 = mat[0], a01 = mat[1];
    var a10 = mat[2], a11 = mat[3];
    
    // Calculate the determinant (inlined to avoid double-caching)
    var det = (a00*a11 - a01*a10);
    if (det === 0)
        throw new Error("Singular matrix");

    mat[0] =  a11/det;
    mat[1] = -a01/det;
    mat[2] = -a10/det;
    mat[3] =  a00/det;

    return mat;
};

mat2.as_mat4 = function(mat)
{
    var result = new Float32Array(16);
    result.buffer._type = 'mat4';
    result[0]  = mat[0];
    result[1]  = mat[1];
    result[4]  = mat[2];
    result[5]  = mat[3];
    return result;
};

mat2.as_mat3 = function(mat)
{
    var result = new Float32Array(9);
    result.buffer._type = 'mat3';
    result[0] = mat[0];
    result[1] = mat[1];
    result[3] = mat[2];
    result[4] = mat[3];
    return result;
};

// from glMatrix
mat2.product = function(m1, m2)
{
    var result = new Float32Array(4);
    result.buffer._type = 'mat2';

    // Cache the matrix values (makes for huge speed increases!)
    var a00 = m1[0],  a01 = m1[1];
    var a10 = m1[2],  a11 = m1[3];
    
    var b00 = m2[0],  b01 = m2[1];
    var b10 = m2[2],  b11 = m2[3];
    
    result[0] = b00*a00 + b01*a10;
    result[1] = b00*a01 + b01*a11;
    result[2] = b10*a00 + b11*a10;
    result[3] = b10*a01 + b11*a11;
    
    return result;
};

// from glMatrix
mat2.multiply = function(dest, other)
{
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = dest[0],  a01 = dest[1]; 
    var a10 = dest[2],  a11 = dest[3]; 
    
    var b00 = other[0],  b01 = other[1]; 
    var b10 = other[2],  b11 = other[3]; 
    
    dest[0] = b00*a00 + b01*a10;
    dest[1] = b00*a01 + b01*a11;
    dest[2] = b10*a00 + b11*a10;
    dest[3] = b10*a01 + b11*a11;
    
    return dest;
};

mat2.product_vec = function(mat, vec)
{
    var result = new Float32Array(2);
    result.buffer._type = 'vec2';
    var x = vec[0], y = vec[1];
    result[0] = mat[0]*x + mat[2]*y;
    result[1] = mat[1]*x + mat[3]*y;
    return result;
};


mat2.multiply_vec = function(mat, vec)
{
    var x = vec[0], y = vec[1];
    vec[0] = mat[0]*x + mat[2]*y;
    vec[1] = mat[1]*x + mat[3]*y;
    return vec;
};

mat2.frobenius_norm = function(mat)
{
    return Math.sqrt(mat[0] * mat[0] +
                     mat[1] * mat[1] +
                     mat[2] * mat[2] +
                     mat[3] * mat[3]);
};

mat2.map = function(mat, f)
{
    return mat2.make(_.map(mat, f));
};

mat2.str = function(mat)
{
    return "[ [" + mat[0] + "] [" + mat[2] + "] ]\n" +
        "[ [" + mat[1] + "] [" + mat[3] + "] ]";
};

var mat3 = {};

mat3.create = function()
{
    var result = new Float32Array(9);
    result.buffer._type = 'mat3';
    return result;
};

mat3.copy = function(mat)
{
    var result = new Float32Array(9);
    result.buffer._type = 'mat3';
    result[0] = mat[0];
    result[1] = mat[1];
    result[2] = mat[2];
    result[3] = mat[3];
    result[4] = mat[4];
    result[5] = mat[5];
    result[6] = mat[6];
    result[7] = mat[7];
    result[8] = mat[8];
    return result;
};
mat3.make = mat3.copy;

mat3.equal = function(v1, v2)
{
    return Math.abs(v1[0] - v2[0]) < mat.eps &&
        Math.abs(v1[1] - v2[1]) < mat.eps &&
        Math.abs(v1[2] - v2[2]) < mat.eps &&
        Math.abs(v1[3] - v2[3]) < mat.eps &&
        Math.abs(v1[4] - v2[4]) < mat.eps &&
        Math.abs(v1[5] - v2[5]) < mat.eps &&
        Math.abs(v1[6] - v2[6]) < mat.eps &&
        Math.abs(v1[7] - v2[7]) < mat.eps &&
        Math.abs(v1[8] - v2[8]) < mat.eps;
};

mat3.random = function()
{
    var result = new Float32Array(9);
    result.buffer._type = 'mat3';
    result[0] = Math.random();
    result[1] = Math.random();
    result[2] = Math.random();
    result[3] = Math.random();
    result[4] = Math.random();
    result[5] = Math.random();
    result[6] = Math.random();
    result[7] = Math.random();
    result[8] = Math.random();
    return result;
};

mat3.set = function(dest, mat)
{
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[3];
    dest[4] = mat[4];
    dest[5] = mat[5];
    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
    return dest;
};

(function() {
var _identity = new Float32Array([1,0,0,
                                  0,1,0,
                                  0,0,1]);

mat3.identity = function()
{
    var result = new Float32Array(_identity);
    result.buffer._type = 'mat3';
    return result;
};

mat3.set_identity = function(mat)
{
    mat3.set(mat, _identity);
    return mat;
};
})();

mat3.transpose = function(mat)
{
    var result = new Float32Array(9);
    result.buffer._type = 'mat3';
    result[0] = mat[0];
    result[1] = mat[3];
    result[2] = mat[6];
    result[3] = mat[1];
    result[4] = mat[4];
    result[5] = mat[7];
    result[6] = mat[2];
    result[7] = mat[5];
    result[8] =  mat[8];
    return result;
};

mat3.set_transpose = function(dest, mat)
{
    if (mat == dest) {
        var a01 = mat[1], a02 = mat[2];
        var a12 = mat[5];
        dest[1] = mat[3];
        dest[2] = mat[6];
        dest[3] = a01;
        dest[5] = mat[7];
        dest[6] = a02;
        dest[7] = a12;
        return dest;
    } else {
        dest[0] = mat[0];
        dest[1] = mat[3];
        dest[2] = mat[6];
        dest[3] = mat[1];
        dest[4] = mat[4];
        dest[5] = mat[7];
        dest[6] = mat[2];
        dest[7] = mat[5];
        dest[8] = mat[8];
        return dest;
    }
};

mat3.determinant = function(mat)
{
    var a00 = mat[0], a01 = mat[1], a02 = mat[2];
    var a10 = mat[3], a11 = mat[4], a12 = mat[5];
    var a20 = mat[6], a21 = mat[7], a22 = mat[8];
    
    return a00*a11*a22 + a01*a12*a20 + a02*a10*a21
        - a02*a11*a20 - a01*a10*a22 - a00*a12*a21;
};

// From glMatrix
mat3.inverse = function(mat)
{
    var result = new Float32Array(9);
    result.buffer._type = 'mat3';

    var a00 = mat[0], a01 = mat[3], a02 = mat[6];
    var a10 = mat[1], a11 = mat[4], a12 = mat[7];
    var a20 = mat[2], a21 = mat[5], a22 = mat[8];
    
    // Calculate the determinant (inlined to avoid double-caching)
    // var det = mat3.determinant(mat);
    var det = a00*a11*a22 + a01*a12*a20 + a02*a10*a21
        - a02*a11*a20 - a01*a10*a22 - a00*a12*a21;
    if (det === 0)
        throw new Error("Singular matrix");

    result[0] = ( a11*a22 - a12*a21)/det;
    result[1] = (-a10*a22 + a12*a20)/det;
    result[2] = ( a10*a21 - a11*a20)/det;
    result[3] = (-a01*a22 + a02*a21)/det;
    result[4] = ( a00*a22 - a02*a20)/det;
    result[5] = (-a00*a21 + a01*a20)/det;
    result[6] = ( a01*a12 - a02*a11)/det;
    result[7] = (-a00*a12 + a02*a10)/det;
    result[8] = ( a00*a11 - a01*a10)/det;

    return result;
};

// From glMatrix
mat3.invert = function(mat)
{
    var a00 = mat[0], a01 = mat[3], a02 = mat[6];
    var a10 = mat[1], a11 = mat[4], a12 = mat[7];
    var a20 = mat[2], a21 = mat[5], a22 = mat[8];
    
    // Calculate the determinant (inlined to avoid double-caching)
    var det = a00*a11*a22 + a01*a12*a20 + a02*a10*a21
        - a02*a11*a20 - a01*a10*a22 - a00*a12*a21;
    if (det === 0)
        throw new Error("Singular mat3");

    mat[0] = ( a11*a22 - a12*a21)/det;
    mat[1] = (-a10*a22 + a12*a20)/det;
    mat[2] = ( a10*a21 - a11*a20)/det;
    mat[3] = (-a01*a22 + a02*a21)/det;
    mat[4] = ( a00*a22 - a02*a20)/det;
    mat[5] = (-a00*a21 + a01*a20)/det;
    mat[6] = ( a01*a12 - a02*a11)/det;
    mat[7] = (-a00*a12 + a02*a10)/det;
    mat[8] = ( a00*a11 - a01*a10)/det;

    return mat;
};

mat3.as_mat4 = function(mat)
{
    var result = new Float32Array(9);
    result.buffer._type = 'mat4';
    result[0]  = mat[0];
    result[1]  = mat[1];
    result[2]  = mat[2];
    result[4]  = mat[3];
    result[5]  = mat[4];
    result[6]  = mat[5];
    result[8]  = mat[6];
    result[9]  = mat[7];
    result[10] = mat[8];
    return result;
};

mat3.as_mat2 = function(mat)
{
    var result = new Float32Array(4);
    result.buffer._type = 'mat2';
    result[0] = mat[0];
    result[1] = mat[1];
    result[2] = mat[3];
    result[3] = mat[4];
    return result;
};

// from glMatrix
mat3.product = function(m1, m2)
{
    var result = new Float32Array(9);
    result.buffer._type = 'mat3';

    // Cache the matrix values (makes for huge speed increases!)
    var a00 = m1[0],  a01 = m1[1],  a02 = m1[2];
    var a10 = m1[3],  a11 = m1[4],  a12 = m1[5];
    var a20 = m1[6],  a21 = m1[7],  a22 = m1[8];
    
    var b00 = m2[0],  b01 = m2[1],  b02 = m2[2];
    var b10 = m2[3],  b11 = m2[4],  b12 = m2[5];
    var b20 = m2[6],  b21 = m2[7],  b22 = m2[8];
    
    result[0] = b00*a00 + b01*a10 + b02*a20;
    result[1] = b00*a01 + b01*a11 + b02*a21;
    result[2] = b00*a02 + b01*a12 + b02*a22;
    result[3] = b10*a00 + b11*a10 + b12*a20;
    result[4] = b10*a01 + b11*a11 + b12*a21;
    result[5] = b10*a02 + b11*a12 + b12*a22;
    result[6] = b20*a00 + b21*a10 + b22*a20;
    result[7] = b20*a01 + b21*a11 + b22*a21;
    result[8] = b20*a02 + b21*a12 + b22*a22;
    
    return result;
};

// from glMatrix
mat3.multiply = function(dest, other)
{
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = dest[0],  a01 = dest[1],  a02 = dest[2]; 
    var a10 = dest[3],  a11 = dest[4],  a12 = dest[5]; 
    var a20 = dest[6],  a21 = dest[7],  a22 = dest[8];
    
    var b00 = other[0],  b01 = other[1],  b02 = other[2]; 
    var b10 = other[3],  b11 = other[4],  b12 = other[5]; 
    var b20 = other[6],  b21 = other[7],  b22 = other[8];
    
    dest[0] = b00*a00 + b01*a10 + b02*a20;
    dest[1] = b00*a01 + b01*a11 + b02*a21;
    dest[2] = b00*a02 + b01*a12 + b02*a22;
    dest[3] = b10*a00 + b11*a10 + b12*a20;
    dest[4] = b10*a01 + b11*a11 + b12*a21;
    dest[5] = b10*a02 + b11*a12 + b12*a22;
    dest[6] = b20*a00 + b21*a10 + b22*a20;
    dest[7] = b20*a01 + b21*a11 + b22*a21;
    dest[8] = b20*a02 + b21*a12 + b22*a22;
    
    return dest;
};

mat3.product_vec = function(mat, vec)
{
    var result = new Float32Array(3);
    result.buffer._type = 'vec3';
    var x = vec[0], y = vec[1], z = vec[2];
    result[0] = mat[0]*x + mat[3]*y + mat[6]*z;
    result[1] = mat[1]*x + mat[4]*y + mat[7]*z;
    result[2] = mat[2]*x + mat[5]*y + mat[8]*z;
    return result;
};

mat3.multiply_vec = function(mat, vec)
{
    var x = vec[0], y = vec[1], z = vec[2];
    vec[0] = mat[0]*x + mat[3]*y + mat[6]*z;
    vec[1] = mat[1]*x + mat[4]*y + mat[7]*z;
    vec[2] = mat[2]*x + mat[5]*y + mat[8]*z;
    return vec;
};

mat3.frobenius_norm = function(mat)
{
    return Math.sqrt(mat[0] * mat[0] +
                     mat[1] * mat[1] +
                     mat[2] * mat[2] +
                     mat[3] * mat[3] +
                     mat[4] * mat[4] +
                     mat[5] * mat[5] +
                     mat[6] * mat[6] +
                     mat[7] * mat[7] +
                     mat[8] * mat[8]);

};

mat3.map = function(mat, f)
{
    return mat3.make(_.map(mat, f));
};

mat3.str = function(mat)
{
    return "[ [" + mat[0] + "] [" + mat[3] + "] [" + mat[6] + "] ]\n" +
        "[ [" + mat[1] + "] [" + mat[4] + "] [" + mat[7] + "] ]\n" +
        "[ [" + mat[2] + "] [" + mat[5] + "] [" + mat[8] + "] ]";
};

var mat4 = {};

mat4.create = function(mat)
{
    var result = new Float32Array(16);
    result.buffer._type = 'mat4';
    return result;
};

mat4.copy = function(mat)
{
    var result = new Float32Array(16);
    result.buffer._type = 'mat4';
    result[0] = mat[0];
    result[1] = mat[1];
    result[2] = mat[2];
    result[3] = mat[3];
    result[4] = mat[4];
    result[5] = mat[5];
    result[6] = mat[6];
    result[7] = mat[7];
    result[8] = mat[8];
    result[9] = mat[9];
    result[10] = mat[10];
    result[11] = mat[11];
    result[12] = mat[12];
    result[13] = mat[13];
    result[14] = mat[14];
    result[15] = mat[15];
    return result;
};
mat4.make = mat4.copy;

mat4.equal = function(v1, v2)
{
    return Math.abs(v1[0] - v2[0]) < mat.eps &&
        Math.abs(v1[1] - v2[1]) < mat.eps &&
        Math.abs(v1[2] - v2[2]) < mat.eps &&
        Math.abs(v1[3] - v2[3]) < mat.eps &&
        Math.abs(v1[4] - v2[4]) < mat.eps &&
        Math.abs(v1[5] - v2[5]) < mat.eps &&
        Math.abs(v1[6] - v2[6]) < mat.eps &&
        Math.abs(v1[7] - v2[7]) < mat.eps &&
        Math.abs(v1[8] - v2[8]) < mat.eps &&
        Math.abs(v1[9] - v2[9]) < mat.eps &&
        Math.abs(v1[10]- v2[10]) < mat.eps &&
        Math.abs(v1[11]- v2[11]) < mat.eps &&
        Math.abs(v1[12]- v2[12]) < mat.eps &&
        Math.abs(v1[13]- v2[13]) < mat.eps &&
        Math.abs(v1[14]- v2[14]) < mat.eps &&
        Math.abs(v1[15]- v2[15]) < mat.eps;
};

mat4.random = function()
{
    var result = mat4.create();
    for (var i=0; i<16; ++i) {
        result[i] = Math.random();
    }
    return result;
};

mat4.set = function(dest, mat)
{
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[3];
    dest[4] = mat[4];
    dest[5] = mat[5];
    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
    dest[9] = mat[9];
    dest[10] = mat[10];
    dest[11] = mat[11];
    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
    return dest;
};

(function() {
var _identity = new Float32Array([1,0,0,0,
                                  0,1,0,0,
                                  0,0,1,0,
                                  0,0,0,1]);

mat4.identity = function()
{
    var result = new Float32Array(_identity);
    result.buffer._type = 'mat4';
    return result;
};

mat4.set_identity = function(mat)
{
    mat4.set(mat, _identity);
    return mat;
};
})();

mat4.transpose = function(mat)
{
    var result = new Float32Array(16);
    result.buffer._type = 'mat4';
    result[0] = mat[0];
    result[1] = mat[4];
    result[2] = mat[8];
    result[3] = mat[12];
    result[4] = mat[1];
    result[5] = mat[5];
    result[6] = mat[9];
    result[7] = mat[13];
    result[8] =  mat[2];
    result[9] =  mat[6];
    result[10] = mat[10];
    result[11] = mat[14];
    result[12] = mat[3];
    result[13] = mat[7];
    result[14] = mat[11];
    result[15] = mat[15];
    return result;
};

mat4.set_transpose = function(dest, mat)
{
    if (mat == dest) {
        var a01 = mat[1], a02 = mat[2], a03 = mat[3];
        var a12 = mat[6], a13 = mat[7];
        var a23 = mat[11];
        dest[1] = mat[4];
        dest[2] = mat[8];
        dest[3] = mat[12];
        dest[4] = a01;
        dest[6] = mat[9];
        dest[7] = mat[13];
        dest[8] = a02;
        dest[9] = a03;
        dest[11] = mat[14];
        dest[12] = a03;
        dest[13] = a13;
        dest[14] = a23;
        return dest;
    } else {
        dest[0] = mat[0];
        dest[1] = mat[4];
        dest[2] = mat[8];
        dest[3] = mat[12];
        dest[4] = mat[1];
        dest[5] = mat[5];
        dest[6] = mat[9];
        dest[7] = mat[13];
        dest[8] = mat[2];
        dest[9] = mat[6];
        dest[10] = mat[10];
        dest[11] = mat[14];
        dest[12] = mat[3];
        dest[13] = mat[7];
        dest[14] = mat[11];
        dest[15] = mat[15];
        return dest;
    }
};

// From glMatrix
mat4.determinant = function(mat)
{
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
    var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
    var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
    
    return a30*a21*a12*a03 - a20*a31*a12*a03 - a30*a11*a22*a03 + a10*a31*a22*a03 +
	a20*a11*a32*a03 - a10*a21*a32*a03 - a30*a21*a02*a13 + a20*a31*a02*a13 +
	a30*a01*a22*a13 - a00*a31*a22*a13 - a20*a01*a32*a13 + a00*a21*a32*a13 +
	a30*a11*a02*a23 - a10*a31*a02*a23 - a30*a01*a12*a23 + a00*a31*a12*a23 +
	a10*a01*a32*a23 - a00*a11*a32*a23 - a20*a11*a02*a33 + a10*a21*a02*a33 +
	a20*a01*a12*a33 - a00*a21*a12*a33 - a10*a01*a22*a33 + a00*a11*a22*a33;
};

// From glMatrix
mat4.inverse = function(mat)
{
    var result = new Float32Array(16);
    result.buffer._type = 'mat4';
	
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
    var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
    var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
	
    var b00 = a00*a11 - a01*a10;
    var b01 = a00*a12 - a02*a10;
    var b02 = a00*a13 - a03*a10;
    var b03 = a01*a12 - a02*a11;
    var b04 = a01*a13 - a03*a11;
    var b05 = a02*a13 - a03*a12;
    var b06 = a20*a31 - a21*a30;
    var b07 = a20*a32 - a22*a30;
    var b08 = a20*a33 - a23*a30;
    var b09 = a21*a32 - a22*a31;
    var b10 = a21*a33 - a23*a31;
    var b11 = a22*a33 - a23*a32;
    
    // Calculate the determinant (inlined to avoid double-caching)
    var det = (b00*b11 - b01*b10 + b02*b09 + b03*b08 - b04*b07 + b05*b06);
    
    result[0] = (a11*b11 - a12*b10 + a13*b09)/det;
    result[1] = (-a01*b11 + a02*b10 - a03*b09)/det;
    result[2] = (a31*b05 - a32*b04 + a33*b03)/det;
    result[3] = (-a21*b05 + a22*b04 - a23*b03)/det;
    result[4] = (-a10*b11 + a12*b08 - a13*b07)/det;
    result[5] = (a00*b11 - a02*b08 + a03*b07)/det;
    result[6] = (-a30*b05 + a32*b02 - a33*b01)/det;
    result[7] = (a20*b05 - a22*b02 + a23*b01)/det;
    result[8] = (a10*b10 - a11*b08 + a13*b06)/det;
    result[9] = (-a00*b10 + a01*b08 - a03*b06)/det;
    result[10] = (a30*b04 - a31*b02 + a33*b00)/det;
    result[11] = (-a20*b04 + a21*b02 - a23*b00)/det;
    result[12] = (-a10*b09 + a11*b07 - a12*b06)/det;
    result[13] = (a00*b09 - a01*b07 + a02*b06)/det;
    result[14] = (-a30*b03 + a31*b01 - a32*b00)/det;
    result[15] = (a20*b03 - a21*b01 + a22*b00)/det;
    
    return result;
};

// From glMatrix
mat4.invert = function(mat)
{
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
    var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
    var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
	
    var b00 = a00*a11 - a01*a10;
    var b01 = a00*a12 - a02*a10;
    var b02 = a00*a13 - a03*a10;
    var b03 = a01*a12 - a02*a11;
    var b04 = a01*a13 - a03*a11;
    var b05 = a02*a13 - a03*a12;
    var b06 = a20*a31 - a21*a30;
    var b07 = a20*a32 - a22*a30;
    var b08 = a20*a33 - a23*a30;
    var b09 = a21*a32 - a22*a31;
    var b10 = a21*a33 - a23*a31;
    var b11 = a22*a33 - a23*a32;
    
    // Calculate the determinant (inlined to avoid double-caching)
    var det = (b00*b11 - b01*b10 + b02*b09 + b03*b08 - b04*b07 + b05*b06);
    
    mat[0] = (a11*b11 - a12*b10 + a13*b09)/det;
    mat[1] = (-a01*b11 + a02*b10 - a03*b09)/det;
    mat[2] = (a31*b05 - a32*b04 + a33*b03)/det;
    mat[3] = (-a21*b05 + a22*b04 - a23*b03)/det;
    mat[4] = (-a10*b11 + a12*b08 - a13*b07)/det;
    mat[5] = (a00*b11 - a02*b08 + a03*b07)/det;
    mat[6] = (-a30*b05 + a32*b02 - a33*b01)/det;
    mat[7] = (a20*b05 - a22*b02 + a23*b01)/det;
    mat[8] = (a10*b10 - a11*b08 + a13*b06)/det;
    mat[9] = (-a00*b10 + a01*b08 - a03*b06)/det;
    mat[10] = (a30*b04 - a31*b02 + a33*b00)/det;
    mat[11] = (-a20*b04 + a21*b02 - a23*b00)/det;
    mat[12] = (-a10*b09 + a11*b07 - a12*b06)/det;
    mat[13] = (a00*b09 - a01*b07 + a02*b06)/det;
    mat[14] = (-a30*b03 + a31*b01 - a32*b00)/det;
    mat[15] = (a20*b03 - a21*b01 + a22*b00)/det;
    
    return mat;
};

mat4.as_mat3 = function(mat)
{
    var result = new Float32Array(9);
    result.buffer._type = 'mat3';
    result[0] = mat[0];
    result[1] = mat[1];
    result[2] = mat[2];
    result[3] = mat[4];
    result[4] = mat[5];
    result[5] = mat[6];
    result[6] = mat[8];
    result[7] = mat[9];
    result[8] = mat[10];
    return result;
};

mat4.as_mat2 = function(mat)
{
    var result = new Float32Array(4);
    result.buffer._type = 'mat2';
    result[0] = mat[0];
    result[1] = mat[1];
    result[2] = mat[4];
    result[3] = mat[5];
    return result;
};


// from glMatrix
mat4.as_inverse_transpose_mat3 = function(mat)
{
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = mat[0], a01 = mat[4], a02 = mat[8];
    var a10 = mat[1], a11 = mat[5], a12 = mat[9];
    var a20 = mat[2], a21 = mat[6], a22 = mat[10];
	
    var b01 =  a22*a11-a12*a21;
    var b11 = -a22*a10+a12*a20;
    var b21 =  a21*a10-a11*a20;
		
    var d = a00*b01 + a01*b11 + a02*b21;
    if (!d) throw new Error("singular matrix");

    var result = new Float32Array(9);
    result.buffer._type = 'mat3';
	
    result[0] = b01/d;
    result[1] = (-a22*a01 + a02*a21)/d;
    result[2] = ( a12*a01 - a02*a11)/d;
    result[3] = b11/d;
    result[4] = ( a22*a00 - a02*a20)/d;
    result[5] = (-a12*a00 + a02*a10)/d;
    result[6] = b21/d;
    result[7] = (-a21*a00 + a01*a20)/d;
    result[8] = ( a11*a00 - a01*a10)/d;
	
    return result;
};

// from glMatrix
mat4.product = function(m1, m2)
{
    var result = new Float32Array(16);
    result.buffer._type = 'mat4';

    // Cache the matrix values (makes for huge speed increases!)
    var a00 = m1[0],  a01 = m1[1],  a02 = m1[2],  a03 = m1[3];
    var a10 = m1[4],  a11 = m1[5],  a12 = m1[6],  a13 = m1[7];
    var a20 = m1[8],  a21 = m1[9],  a22 = m1[10], a23 = m1[11];
    var a30 = m1[12], a31 = m1[13], a32 = m1[14], a33 = m1[15];
    
    var b00 = m2[0],  b01 = m2[1],  b02 = m2[2],  b03 = m2[3];
    var b10 = m2[4],  b11 = m2[5],  b12 = m2[6],  b13 = m2[7];
    var b20 = m2[8],  b21 = m2[9],  b22 = m2[10], b23 = m2[11];
    var b30 = m2[12], b31 = m2[13], b32 = m2[14], b33 = m2[15];
    
    result[0]  = b00*a00 + b01*a10 + b02*a20 + b03*a30;
    result[1]  = b00*a01 + b01*a11 + b02*a21 + b03*a31;
    result[2]  = b00*a02 + b01*a12 + b02*a22 + b03*a32;
    result[3]  = b00*a03 + b01*a13 + b02*a23 + b03*a33;
    result[4]  = b10*a00 + b11*a10 + b12*a20 + b13*a30;
    result[5]  = b10*a01 + b11*a11 + b12*a21 + b13*a31;
    result[6]  = b10*a02 + b11*a12 + b12*a22 + b13*a32;
    result[7]  = b10*a03 + b11*a13 + b12*a23 + b13*a33;
    result[8]  = b20*a00 + b21*a10 + b22*a20 + b23*a30;
    result[9]  = b20*a01 + b21*a11 + b22*a21 + b23*a31;
    result[10] = b20*a02 + b21*a12 + b22*a22 + b23*a32;
    result[11] = b20*a03 + b21*a13 + b22*a23 + b23*a33;
    result[12] = b30*a00 + b31*a10 + b32*a20 + b33*a30;
    result[13] = b30*a01 + b31*a11 + b32*a21 + b33*a31;
    result[14] = b30*a02 + b31*a12 + b32*a22 + b33*a32;
    result[15] = b30*a03 + b31*a13 + b32*a23 + b33*a33;
    
    return result;
};

// from glMatrix
mat4.multiply = function(dest, other)
{
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = dest[0],  a01 = dest[1],  a02 = dest[2],  a03 = dest[3];
    var a10 = dest[4],  a11 = dest[5],  a12 = dest[6],  a13 = dest[7];
    var a20 = dest[8],  a21 = dest[9],  a22 = dest[10], a23 = dest[11];
    var a30 = dest[12], a31 = dest[13], a32 = dest[14], a33 = dest[15];
    
    var b00 = other[0],  b01 = other[1],  b02 = other[2],  b03 = other[3];
    var b10 = other[4],  b11 = other[5],  b12 = other[6],  b13 = other[7];
    var b20 = other[8],  b21 = other[9],  b22 = other[10], b23 = other[11];
    var b30 = other[12], b31 = other[13], b32 = other[14], b33 = other[15];
    
    dest[0]  = b00*a00 + b01*a10 + b02*a20 + b03*a30;
    dest[1]  = b00*a01 + b01*a11 + b02*a21 + b03*a31;
    dest[2]  = b00*a02 + b01*a12 + b02*a22 + b03*a32;
    dest[3]  = b00*a03 + b01*a13 + b02*a23 + b03*a33;
    dest[4]  = b10*a00 + b11*a10 + b12*a20 + b13*a30;
    dest[5]  = b10*a01 + b11*a11 + b12*a21 + b13*a31;
    dest[6]  = b10*a02 + b11*a12 + b12*a22 + b13*a32;
    dest[7]  = b10*a03 + b11*a13 + b12*a23 + b13*a33;
    dest[8]  = b20*a00 + b21*a10 + b22*a20 + b23*a30;
    dest[9]  = b20*a01 + b21*a11 + b22*a21 + b23*a31;
    dest[10] = b20*a02 + b21*a12 + b22*a22 + b23*a32;
    dest[11] = b20*a03 + b21*a13 + b22*a23 + b23*a33;
    dest[12] = b30*a00 + b31*a10 + b32*a20 + b33*a30;
    dest[13] = b30*a01 + b31*a11 + b32*a21 + b33*a31;
    dest[14] = b30*a02 + b31*a12 + b32*a22 + b33*a32;
    dest[15] = b30*a03 + b31*a13 + b32*a23 + b33*a33;
    
    return dest;
};

mat4.product_vec = function(mat, vec)
{
    var result = new Float32Array(4);
    result.buffer._type = 'vec4';
    var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
    result[0] = mat[0]*x + mat[4]*y + mat[8]*z  + mat[12]*w;
    result[1] = mat[1]*x + mat[5]*y + mat[9]*z  + mat[13]*w;
    result[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14]*w;
    result[3] = mat[3]*x + mat[7]*y + mat[11]*z + mat[15]*w;
    return result;
};

mat4.multiply_vec = function(mat, vec)
{
    var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
    vec[0] = mat[0]*x + mat[4]*y + mat[8]*z  + mat[12]*w;
    vec[1] = mat[1]*x + mat[5]*y + mat[9]*z  + mat[13]*w;
    vec[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14]*w;
    vec[3] = mat[3]*x + mat[7]*y + mat[11]*z + mat[15]*w;
    return vec;
};

mat4.multiply_vec3 = function(mat, vec)
{
    var x = vec[0], y = vec[1], z = vec[2];
    vec[0] = mat[0]*x + mat[4]*y + mat[8]*z;
    vec[1] = mat[1]*x + mat[5]*y + mat[9]*z;
    vec[2] = mat[2]*x + mat[6]*y + mat[10]*z;
    return vec;
};

// from glMatrix
mat4.translation_of = function(mat, vec)
{
    var result = new Float32Array(16);
    result.buffer._type = 'mat4';
    var x = vec[0], y = vec[1], z = vec[2];
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
    var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
    result[0] = a00;
    result[1] = a01;
    result[2] = a02;
    result[3] = a03;
    result[4] = a10;
    result[5] = a11;
    result[6] = a12;
    result[7] = a13;
    result[8] = a20;
    result[9] = a21;
    result[10] = a22;
    result[11] = a23;
    result[12] = a00*x + a10*y + a20*z + mat[12];
    result[13] = a01*x + a11*y + a21*z + mat[13];
    result[14] = a02*x + a12*y + a22*z + mat[14];
    result[15] = a03*x + a13*y + a23*z + mat[15];
    return result;
};

mat4.translation = function(vec)
{
    var result = new Float32Array(16);
    result.buffer._type = 'mat4';
    result[0] = result[5] = result[10] = result[15] = 1;    
    result[12] = vec[0];
    result[13] = vec[1];
    result[14] = vec[2];
    return result;
};

mat4.translate = function(mat, vec)
{
    var x = vec[0], y = vec[1], z = vec[2];
    mat[12] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12];
    mat[13] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13];
    mat[14] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14];
    mat[15] = mat[3]*x + mat[7]*y + mat[11]*z + mat[15];
    return mat;
};

mat4.scaling_of = function(mat, vec)
{
    var result = new Float32Array(16);
    result.buffer._type = 'mat4';
    var x = vec[0], y = vec[1], z = vec[2];
    result[0] =  mat[0]  * x;
    result[1] =  mat[1]  * x;
    result[2] =  mat[2]  * x;
    result[3] =  mat[3]  * x;
    result[4] =  mat[4]  * y;
    result[5] =  mat[5]  * y;
    result[6] =  mat[6]  * y;
    result[7] =  mat[7]  * y;
    result[8] =  mat[8]  * z;
    result[9] =  mat[9]  * z;
    result[10] = mat[10] * z;
    result[11] = mat[11] * z;
    result[12] = mat[12];
    result[13] = mat[13];
    result[14] = mat[14];
    result[15] = mat[15];
    return result;
};

mat4.scaling = function(mat, vec)
{
    var result = new Float32Array(16);
    result[0] =  vec[0];
    result[5] =  vec[1];
    result[10] = vec[2];
    result[15] = 1;
    return result;
};

mat4.scale = function(mat, vec)
{
    var result = new Float32Array(16);
    result.buffer._type = 'mat4';
    var x = vec[0], y = vec[1], z = vec[2];
    mat[0]  *= x;
    mat[1]  *= x;
    mat[2]  *= x;
    mat[3]  *= x;
    mat[4]  *= y;
    mat[5]  *= y;
    mat[6]  *= y;
    mat[7]  *= y;
    mat[8]  *= z;
    mat[9]  *= z;
    mat[10] *= z;
    mat[11] *= z;
    return result;
};

// from glMatrix
mat4.rotation_of = function(mat, angle, axis)
{
    var x = axis[0], y = axis[1], z = axis[2];
    var len = Math.sqrt(x*x + y*y + z*z);
    if (!len) { throw new Error("zero-length axis"); }
    if (len != 1) {
	x /= len; 
	y /= len; 
	z /= len;
    }
    
    var s = Math.sin(angle);
    var c = Math.cos(angle);
    var t = 1-c;
    
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = mat[0], a01 = mat[1], a02 = mat[2],  a03 = mat[3];
    var a10 = mat[4], a11 = mat[5], a12 = mat[6],  a13 = mat[7];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
    
    // Construct the elements of the rotation matrix
    var b00 = x*x*t + c, b01 = y*x*t + z*s, b02 = z*x*t - y*s;
    var b10 = x*y*t - z*s, b11 = y*y*t + c, b12 = z*y*t + x*s;
    var b20 = x*z*t + y*s, b21 = y*z*t - x*s, b22 = z*z*t + c;

    var result = new Float32Array(16);    
    result.buffer._type = 'mat4';
    
    // Perform rotation-specific matrix multiplication
    result[0]  = a00*b00 + a10*b01 + a20*b02;
    result[1]  = a01*b00 + a11*b01 + a21*b02;
    result[2]  = a02*b00 + a12*b01 + a22*b02;
    result[3]  = a03*b00 + a13*b01 + a23*b02;
    
    result[4]  = a00*b10 + a10*b11 + a20*b12;
    result[5]  = a01*b10 + a11*b11 + a21*b12;
    result[6]  = a02*b10 + a12*b11 + a22*b12;
    result[7]  = a03*b10 + a13*b11 + a23*b12;
    
    result[8]  = a00*b20 + a10*b21 + a20*b22;
    result[9]  = a01*b20 + a11*b21 + a21*b22;
    result[10] = a02*b20 + a12*b21 + a22*b22;
    result[11] = a03*b20 + a13*b21 + a23*b22;

    result[12] = mat[12];
    result[13] = mat[13];
    result[14] = mat[14];
    result[15] = mat[15];
    return result;
};

mat4.rotation = function(angle, axis)
{
    var x = axis[0], y = axis[1], z = axis[2];
    var len = Math.sqrt(x*x + y*y + z*z);
    if (!len) { throw new Error("zero-length axis"); }
    if (len != 1) {
	x /= len; 
	y /= len; 
	z /= len;
    }
    
    var s = Math.sin(angle);
    var c = Math.cos(angle);
    var t = 1-c;
    
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = 1, a01 = 0, a02 = 0, a03 = 0;
    var a10 = 0, a11 = 1, a12 = 0, a13 = 0;
    var a20 = 0, a21 = 0, a22 = 1, a23 = 0;
    
    // Construct the elements of the rotation matrix
    var b00 = x*x*t + c, b01 = y*x*t + z*s, b02 = z*x*t - y*s;
    var b10 = x*y*t - z*s, b11 = y*y*t + c, b12 = z*y*t + x*s;
    var b20 = x*z*t + y*s, b21 = y*z*t - x*s, b22 = z*z*t + c;

    var result = new Float32Array(16);    
    result.buffer._type = 'mat4';
    
    // Perform rotation-specific matrix multiplication
    result[0]  = x*x*t + c;
    result[1]  = y*x*t + z*s;
    result[2]  = z*x*t - y*s;
    result[4]  = x*y*t - z*s;
    result[5]  = y*y*t + c;
    result[6]  = z*y*t + x*s;
    result[8]  = x*z*t + y*s;
    result[9]  = y*z*t - x*s;
    result[10] = z*z*t + c;
    result[15] = 1;

    return result;
};

mat4.rotate = function(mat, angle, axis)
{
    var x = axis[0], y = axis[1], z = axis[2];
    var len = Math.sqrt(x*x + y*y + z*z);
    if (!len) { throw new Error("zero-length axis"); }
    if (len != 1) {
	x /= len; 
	y /= len; 
	z /= len;
    }
    
    var s = Math.sin(angle);
    var c = Math.cos(angle);
    var t = 1-c;
    
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = mat[0], a01 = mat[1], a02 = mat[2],  a03 = mat[3];
    var a10 = mat[4], a11 = mat[5], a12 = mat[6],  a13 = mat[7];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
    
    // Construct the elements of the rotation matrix
    var b00 = x*x*t + c, b01 = y*x*t + z*s, b02 = z*x*t - y*s;
    var b10 = x*y*t - z*s, b11 = y*y*t + c, b12 = z*y*t + x*s;
    var b20 = x*z*t + y*s, b21 = y*z*t - x*s, b22 = z*z*t + c;
    
    // Perform rotation-specific matrix multiplication
    mat[0]  = a00*b00 + a10*b01 + a20*b02;
    mat[1]  = a01*b00 + a11*b01 + a21*b02;
    mat[2]  = a02*b00 + a12*b01 + a22*b02;
    mat[3]  = a03*b00 + a13*b01 + a23*b02;
    
    mat[4]  = a00*b10 + a10*b11 + a20*b12;
    mat[5]  = a01*b10 + a11*b11 + a21*b12;
    mat[6]  = a02*b10 + a12*b11 + a22*b12;
    mat[7]  = a03*b10 + a13*b11 + a23*b12;
    
    mat[8]  = a00*b20 + a10*b21 + a20*b22;
    mat[9]  = a01*b20 + a11*b21 + a21*b22;
    mat[10] = a02*b20 + a12*b21 + a22*b22;
    mat[11] = a03*b20 + a13*b21 + a23*b22;

    mat[12] = mat[12];
    mat[13] = mat[13];
    mat[14] = mat[14];
    mat[15] = mat[15];
    return mat;
};

mat4.frustum = function(left, right, bottom, top, near, far)
{
    var result = new Float32Array(16);
    result.buffer._type = 'mat4';
    var rl = (right - left);
    var tb = (top - bottom);
    var fn = (far - near);
    result[0] = (near*2) / rl;
    result[5] = (near*2) / tb;
    result[8] = (right + left) / rl;
    result[9] = (top + bottom) / tb;
    result[10] = -(far + near) / fn;
    result[11] = -1;
    result[14] = -(far*near*2) / fn;
    return result;
};

mat4.perspective = function(fovy, aspect, near, far)
{
    var top = near*Math.tan(fovy*Math.PI / 360.0);
    var right = top*aspect;
    return mat4.frustum(-right, right, -top, top, near, far);
};

mat4.ortho = function(left, right, bottom, top, near, far)
{
    var result = new Float32Array(16);
    result.buffer._type = 'mat4';
    var rl = (right - left);
    var tb = (top - bottom);
    var fn = (far - near);
    result[0] = 2 / rl;
    result[5] = 2 / tb;
    result[10] = -2 / fn;
    result[12] = -(left + right) / rl;
    result[13] = -(top + bottom) / tb;
    result[14] = -(far + near) / fn;
    result[15] = 1;
    return result;
};

mat4.lookAt = function(eye, center, up)
{
    var result = new Float32Array(16);
    result.buffer._type = 'mat4';
    
    var eyex = eye[0],
    eyey = eye[1],
    eyez = eye[2],
    upx = up[0],
    upy = up[1],
    upz = up[2],
    centerx = center[0],
    centery = center[1],
    centerz = center[2];

    if (eyex == centerx && eyey == centery && eyez == centerz) {
	return mat4.identity();
    }
    
    var z0,z1,z2,x0,x1,x2,y0,y1,y2,len;
    
    //vec3.direction(eye, center, z);
    z0 = eyex - center[0];
    z1 = eyey - center[1];
    z2 = eyez - center[2];
    
    // normalize (no check needed for 0 because of early return)
    len = Math.sqrt(z0*z0 + z1*z1 + z2*z2);
    z0 /= len;
    z1 /= len;
    z2 /= len;
    
    //vec3.normalize(vec3.cross(up, z, x));
    x0 = upy*z2 - upz*z1;
    x1 = upz*z0 - upx*z2;
    x2 = upx*z1 - upy*z0;
    if ((len = Math.sqrt(x0*x0 + x1*x1 + x2*x2))) {
	x0 /= len;
	x1 /= len;
	x2 /= len;
    }
    
    //vec3.normalize(vec3.cross(z, x, y));
    y0 = z1*x2 - z2*x1;
    y1 = z2*x0 - z0*x2;
    y2 = z0*x1 - z1*x0;
    
    if ((len = Math.sqrt(y0*y0 + y1*y1 + y2*y2))) {
	y0 /= len;
	y1 /= len;
	y2 /= len;
    }
    
    result[0]  = x0;
    result[1]  = y0;
    result[2]  = z0;
    result[4]  = x1;
    result[5]  = y1;
    result[6]  = z1;
    result[8]  = x2;
    result[9]  = y2;
    result[10] = z2;
    result[12] = -(x0*eyex + x1*eyey + x2*eyez);
    result[13] = -(y0*eyex + y1*eyey + y2*eyez);
    result[14] = -(z0*eyex + z1*eyey + z2*eyez);
    result[15] = 1;
    
    return result;
};

mat4.frobenius_norm = function(mat)
{
    return Math.sqrt(mat[0] * mat[0] +
                     mat[1] * mat[1] +
                     mat[2] * mat[2] +
                     mat[3] * mat[3] +
                     mat[4] * mat[4] +
                     mat[5] * mat[5] +
                     mat[6] * mat[6] +
                     mat[7] * mat[7] +
                     mat[8] * mat[8] +
                     mat[9] * mat[9] +
                     mat[10] * mat[10] +
                     mat[11] * mat[11] +
                     mat[12] * mat[12] +
                     mat[13] * mat[13] +
                     mat[14] * mat[14] +
                     mat[15] * mat[15]);
};

mat4.map = function(mat, f)
{
    return mat4.make(_.map(mat, f));
};

mat4.str = function(mat)
{
    return "[ [" + mat[0] + "] [" + mat[4] + "]" + "[ [" + mat[8] + "] [" + mat[12] + "]\n" +
        "[ [" + mat[1] + "] [" + mat[5] + "]" + "[ [" + mat[9] + "] [" + mat[13] + "]\n" +
        "[ [" + mat[2] + "] [" + mat[6] + "]" + "[ [" + mat[10] + "] [" + mat[14] + "]\n" +
        "[ [" + mat[3] + "] [" + mat[7] + "]" + "[ [" + mat[11] + "] [" + mat[15] + "] ]";
};

// A thin veneer of polymorphic convenience over the fast vec classes
// for when you can get away with a little slowness.

vec[2] = vec2;
vec[3] = vec3;
vec[4] = vec4;
vec2.mat = mat2;
vec3.mat = mat3;
vec4.mat = mat4;
vec.eps = 1e-6;

vec.make = function(v)
{
    return vec[v.length].make(v);
};

vec.equal_eps = function(v1, v2)
{
    if (v1.length != v2.length) {
        throw new Error("mismatched lengths");
    }
    return vec[v1.length].equal_eps(v1, v2);
};

vec.equal = function(v1, v2)
{
    if (v1.length != v2.length) {
        throw new Error("mismatched lengths");
    }
    return vec[v1.length].equal(v1, v2);
};

vec.plus = function(v1, v2)
{
    if (v1.length != v2.length) {
        throw new Error("mismatched lengths");
    }
    return vec[v1.length].plus(v1, v2);
};

vec.minus = function(v1, v2)
{
    if (v1.length != v2.length) {
        throw new Error("mismatched lengths");
    }
    return vec[v1.length].minus(v1, v2);
};

vec.negative = function(v)
{
    return vec[v.length].negative(v);
};

vec.scaling = function(v, val)
{
    return vec[v.length].scaling(v, val);
};

vec.schur_product = function(v1, v2)
{
    if (v1.length != v2.length) {
        throw new Error("mismatched lengths");
    }
    return vec[v1.length].schur_product(v1, v2);
};

vec.normalized = function(v)
{
    return vec[v.length].normalized(v);
};

vec.length = function(v)
{
    return vec[v.length].length(v);
};

vec.length2 = function(v)
{
    return vec[v.length].length2(v);
};

vec.dot = function(v1, v2)
{
    if (v1.length != v2.length) {
        throw new Error("mismatched lengths");
    }
    return vec[v1.length].dot(v1, v2);
};

vec.map = function(c, f)
{
    return vec[c.length].map(c, f);
};

/*
// strictly speaking, this is unnecessary, since only vec3.cross exists.
// However, to force vec3.* to be written alongside vec.* would mean that
// some code would be written
// x = vec.normalized(foo);
// y = vec.normalized(bar);
// z = vec3.cross(x, y);

// instead of

// z = vec.cross(x, y);

// The notational uniformity of the latter wins
*/

vec.cross = function(v1, v2)
{
    return vec[v1.length].cross(v1, v2);
};

vec.str = function(v)
{
    return vec[v.length].str(v);
};
(function() {

mat[2] = mat2;
mat[3] = mat3;
mat[4] = mat4;
mat2.vec = vec2;
mat3.vec = vec3;
mat4.vec = vec4;
mat.eps = 1e-6;

function to_dim(l)
{
    switch (l) {
    case 4: return 2;
    case 9: return 3;
    case 16: return 4;
    }
    throw new Error("bad length");
}

mat.make = function(v)
{
    return mat[to_dim(v.length)].make(v);
};

mat.map = function(c, f)
{
    return mat[to_dim(c.length)].map(c, f);
};

mat.equal = function(m1, m2)
{
    if (m1.length != m2.length) {
        throw new Error("mismatched lengths: " + m1.length + ", " + m2.length);
    }
    return mat[to_dim(m1.length)].equal(m1, m2);
};

mat.str = function(m1)
{
    return mat[to_dim(m1.length)].str(m1);
};

})();
Lux.LinAlg.vec2 = vec2;
Lux.LinAlg.vec3 = vec3;
Lux.LinAlg.vec4 = vec4;
Lux.LinAlg.mat2 = mat2;
Lux.LinAlg.mat3 = mat3;
Lux.LinAlg.mat4 = mat4;
// run-time type information helper functions
// 
// All of this would be unnecessary if Javascript was SML. Alas,
// Javascript is no SML.
// 
//////////////////////////////////////////////////////////////////////////////

// returns false if object is not a Shade expression, or returns
// the AST type of the shade expression.
//
// For example, in some instances it is useful to know whether the
// float value comes from a constant or a GLSL uniform or an attribute 
// buffer.
Lux.is_shade_expression = function(obj)
{
    return typeof obj === 'function' && obj._lux_expression && obj.expression_type;
};

//////////////////////////////////////////////////////////////////////////////
// http://javascript.crockford.com/remedial.html

// Notice that Lux.type_of is NOT EXACTLY equal to
// 
//   http://javascript.crockford.com/remedial.html
//
// In particular, Lux.type_of will return "object" if given Shade expressions
// 
// Shade expressions are actually functions with a bunch of extra methods.
// 
// This is something of a hack, but it is the simplest way I know of to get
// operator() overloading, which turns out to be notationally quite powerful.
//

Lux.type_of = function(value) 
{
    var s = typeof value;
    if (s === 'function' && value._lux_expression)
        return 'object'; // shade expression
    if (s === 'object') {
        if (value) {
            if (typeof value.length === 'number'
                 && !(value.propertyIsEnumerable('length'))
                 && typeof value.splice === 'function')  { // typed array
                s = 'array';
            }
        } else {
            s = 'null';
        }
    }
    return s;
}
/*
 * Lux.attribute_buffer_view builds an attribute_buffer object from an
 * Lux.buffer object, instead of an array (or typed array). The main
 * use case for attribute_buffer_view is to allow one to build
 * several attribute_buffer_views over the same Lux.buffer, for efficient
 * strided attribute buffers (which share the same buffer)
 * 
 * The main difference between calling Lux.attribute_buffer_view and
 * Lux.attribute_buffer is that attribute_buffer_view takes a "buffer"
 * parameter instead of an "array" parameter.
 * 
 */

Lux.attribute_buffer_view = function(opts)
{
    var ctx = Lux._globals.ctx;
    opts = _.defaults(opts, {
        item_size: 3,
        item_type: 'float',
        normalized: false,
        keep_array: false,
        stride: 0,
        offset: 0
    });

    if (_.isUndefined(opts.buffer)) {
        throw new Error("opts.buffer must be defined");
    }

    var itemSize = opts.item_size;
    if ([1,2,3,4].indexOf(itemSize) === -1) {
        throw new Error("opts.item_size must be one of 1, 2, 3, or 4");
    }

    var normalized = opts.normalized;
    if (Lux.type_of(normalized) !== "boolean") {
        throw new Error("opts.normalized must be boolean");
    }

    var gl_enum_typed_array_map = {
        'float': { webgl_enum: ctx.FLOAT, typed_array_ctor: Float32Array, size: 4 },
        'short': { webgl_enum: ctx.SHORT, typed_array_ctor: Int16Array, size: 2 },
        'ushort': { webgl_enum: ctx.UNSIGNED_SHORT, typed_array_ctor: Uint16Array, size: 2 },
        'byte': { webgl_enum: ctx.BYTE, typed_array_ctor: Int8Array, size: 1 },
        'ubyte': { webgl_enum: ctx.UNSIGNED_BYTE, typed_array_ctor: Uint8Array, size: 1 }
    };

    var itemType = gl_enum_typed_array_map[opts.item_type];
    if (_.isUndefined(itemType)) {
        throw new Error("opts.item_type must be 'float', 'short', 'ushort', 'byte' or 'ubyte'");
    }

    function convert_array(array) {
        var numItems;
        if (array.constructor === Array) {
            if (array.length % itemSize) {
                throw new Error("set: attribute_buffer expected length to be a multiple of " + 
                    itemSize + ", got " + array.length + " instead.");
            }
            array = new itemType.typed_array_ctor(array);
        } else if (array.constructor === itemType._typed_array_ctor) {
            if (array.length % itemSize) {
                throw new Error("set: attribute_buffer expected length to be a multiple of " + 
                    itemSize + ", got " + array.length + " instead.");
            }
        } else if (opts.vertex_array.constructor === ArrayBuffer) {
            array = opts.vertex_array;
        }
        return array;
    }

    var result = {
        buffer: opts.buffer,
        itemSize: itemSize,
        normalized: normalized,
        numItems: opts.buffer.byteLength / (opts.stride || itemSize * itemType.size),
        stride: opts.stride,
        offset: opts.offset,
        _ctx: ctx,
        _shade_type: 'attribute_buffer',
        _webgl_type: itemType.webgl_enum,
        _typed_array_ctor: itemType.typed_array_ctor,
        _word_length: itemType.size,
        _item_byte_length: opts.stride || itemType.size * itemSize,
        set: function(vertex_array) {
            vertex_array = convert_array(vertex_array);
            this.buffer.set(vertex_array);
            this.numItems = this.buffer.byteLength / (this.stride || this.itemSize * this._word_length);
            if (opts.keep_array) {
                this.array = this.buffer.array;
            }
        },
        set_region: function() {
            throw new Error("currently unimplemented");
        },
        //////////////////////////////////////////////////////////////////////
        // These methods are only for internal use within Lux
        bind: function(attribute) {
            Lux.set_context(ctx);
            ctx.bindBuffer(ctx.ARRAY_BUFFER, this.buffer);
            ctx.vertexAttribPointer(attribute, this.itemSize, this._webgl_type, normalized, this.stride, this.offset);
        },
        draw: function(primitive) {
            Lux.set_context(ctx);
            ctx.drawArrays(primitive, 0, this.numItems);
        },
        bind_and_draw: function(attribute, primitive) {
            // here we inline the calls to bind and draw to shave a redundant set_context.
            Lux.set_context(ctx);
            ctx.bindBuffer(ctx.ARRAY_BUFFER, this.buffer);
            ctx.vertexAttribPointer(attribute, this.itemSize, this._webgl_type, normalized, this.stride, this.offset);
            ctx.drawArrays(primitive, 0, this.numItems);
        }
    };
    if (opts.keep_array)
        result.array = result.buffer.array;
    return result;
};
/*
 * Lux.attribute_buffer creates the structures necessary for Lux to handle 
 * per-vertex data.
 * 
 * Typically these will be vertex positions, normals, texture coordinates, 
 * colors, etc.
 * 
 * options: 
 * 
 *   vertex_array is the data array to be used. It must be one of the following 
 *     datatypes:
 * 
 *     - a javascript array of values, (which will be converted to a typed array
 *     of the appropriate type)
 * 
 *     - a typed array whose type matches the passed type below
 * 
 *     - an ArrayBuffer of the appropriate size
 * 
 *   item_size is the number of elements to be associated with each vertex
 * 
 *   item_type is the data type of each element. Default is 'float', for
 *     IEEE 754 32-bit floating point numbers.
 * 
 *   usage follows the WebGL bufferData call. From the man page for bufferData:
 * 
 *     Specifies the expected usage pattern of the data store. The symbolic 
 *     constant must be STREAM_DRAW, STATIC_DRAW, or DYNAMIC_DRAW.
 * 
 *   keep_array tells Lux.attribute_buffer to keep a copy of the buffer in 
 *   Javascript. This will be stored in the returned object, in the "array" 
 *   property. It is useful for javascript-side inspection, or as a convenient
 *   place to keep the array stashed in case you need it.
 * 
 *   stride: if stride is non-zero, WebGL will skip an arbitrary number of 
 *   bytes per element. This is used to specify many different attributes which
 *   share a single buffer (which gives memory locality advantages in some
 *   GPU architectures). stride uses *bytes* as units, so be aware of datatype
 *   conversions.
 * 
 *   offset: gives the offset into the buffer at which to access the data,
 *   again used to specify different attributes sharing a single buffer.
 *   offset uses *bytes* as units, so be aware of datatype conversions.
 * 
 * 
 * Example usage:
 * 
 *   // associate three 32-bit floating-point values with each vertex
 *   var position_attribute = Lux.attribute_buffer({
 *       vertex_array: [1,0,0, 0,1,0, 1,0,0],
 *       // item_size: 3 is the default
 *       // item_type: 'float' is the default
 *   })
 * 
 *   // associate four 8-bit unsigned bytes with each vertex
 *   var color_attribute = Lux.attribute_buffer({
 *       vertex_array: [1,0,0,1, 1,1,0,1, 1,1,1,1],
 *       item_size: 4,
 *       item_type: 'ubyte', // the default item_type is 'float'
 *       normalized: true // when 
 *   });
 *   ...
 * 
 *   var triangle = Lux.model({
 *       type: 'triangles',
 *       position: position_attribute,
 *       color: color_attribute
 *   })
 */

Lux.attribute_buffer = function(opts)
{
    var ctx = Lux._globals.ctx;
    opts = _.defaults(opts, {
        item_size: 3,
        item_type: 'float',
        usage: ctx.STATIC_DRAW,
        normalized: false,
        keep_array: false,
        stride: 0,
        offset: 0
    });

    var itemSize = opts.item_size;
    if ([1,2,3,4].indexOf(itemSize) === -1) {
        throw new Error("opts.item_size must be one of 1, 2, 3, or 4");
    }

    var gl_enum_typed_array_map = {
        'float': { webgl_enum: ctx.FLOAT, typed_array_ctor: Float32Array, size: 4 },
        'short': { webgl_enum: ctx.SHORT, typed_array_ctor: Int16Array, size: 2 },
        'ushort': { webgl_enum: ctx.UNSIGNED_SHORT, typed_array_ctor: Uint16Array, size: 2 },
        'byte': { webgl_enum: ctx.BYTE, typed_array_ctor: Int8Array, size: 1 },
        'ubyte': { webgl_enum: ctx.UNSIGNED_BYTE, typed_array_ctor: Uint8Array, size: 1 }
    };

    var itemType = gl_enum_typed_array_map[opts.item_type];
    if (_.isUndefined(itemType)) {
        throw new Error("opts.item_type must be 'float', 'short', 'ushort', 'byte' or 'ubyte'");
    }

    if (_.isUndefined(opts.vertex_array)) {
        throw new Error("opts.vertex_array must be defined");
    }

    function convert_array(array) {
        var numItems;
        if (array.constructor === Array) {
            if (array.length % itemSize) {
                throw new Error("set: attribute_buffer expected length to be a multiple of " + 
                    itemSize + ", got " + array.length + " instead.");
            }
            array = new itemType.typed_array_ctor(array);
        } else if (array.constructor === itemType.typed_array_ctor) {
            if (array.length % itemSize) {
                throw new Error("set: attribute_buffer expected length to be a multiple of " + 
                    itemSize + ", got " + array.length + " instead.");
            }
        } else if (opts.vertex_array.constructor === ArrayBuffer) {
            array = opts.vertex_array;
        } else {
            throw new Error("Unrecognized array type for attribute_buffer");
        }
        return array;
    }

    var array = convert_array(opts.vertex_array);
    var buffer = Lux.buffer({
        usage: opts.usage,
        array: array,
        keep_array: opts.keep_array
    });

    return Lux.attribute_buffer_view(_.defaults(opts, {
        buffer: buffer
    }));
};
Lux.buffer = function(opts)
{
    var ctx = Lux._globals.ctx;
    opts = _.defaults(opts, {
        usage: ctx.STATIC_DRAW,
        keep_array: false
    });

    if (_.isUndefined(opts.array)) {
        throw new Error("opts.array must be defined");
    }

    var usage = opts.usage;
    if ([ctx.STATIC_DRAW, ctx.DYNAMIC_DRAW, ctx.STREAM_DRAW].indexOf(usage) === -1) {
        throw new Error("opts.usage must be one of STATIC_DRAW, DYNAMIC_DRAW, STREAM_DRAW");
    }

    var result = ctx.createBuffer();
    result.usage = usage;
    result.set = function(array) {
        ctx.bindBuffer(ctx.ARRAY_BUFFER, this);
        ctx.bufferData(ctx.ARRAY_BUFFER, array, this.usage);
        if (opts.keep_array) {
            this.array = array;
        }
        this.byteLength = array.byteLength;
    };
    result.set(opts.array);
    result.set_region = function() {
        throw new Error("currently unimplemented");
    };

    return result;
};
(function() {

var previous_batch_opts = {};
Lux.get_current_batch_opts = function()
{
    return previous_batch_opts;
};

Lux.unload_batch = function()
{
    if (!previous_batch_opts._ctx)
        return;
    var ctx = previous_batch_opts._ctx;
    if (previous_batch_opts.attributes) {
        for (var key in previous_batch_opts.attributes) {
            ctx.disableVertexAttribArray(previous_batch_opts.program[key]);
        }
        _.each(previous_batch_opts.program.uniforms, function (uniform) {
            delete uniform._lux_active_uniform;
        });
    }

    if (previous_batch_opts.line_width)
        ctx.lineWidth(1.0);
    if (previous_batch_opts.polygon_offset) {
        ctx.disable(ctx.POLYGON_OFFSET_FILL);
    }

    // reset the opengl capabilities which are determined by
    // Lux.DrawingMode.*
    ctx.disable(ctx.DEPTH_TEST);
    ctx.disable(ctx.BLEND);
    ctx.depthMask(true);

    previous_batch_opts = {};
};

function draw_it(batch_opts)
{
    if (_.isUndefined(batch_opts))
        throw new Error("drawing mode undefined");

    // When the batch_options object is different from the one previously drawn,
    // we must set up the appropriate state for drawing.
    if (batch_opts.batch_id !== previous_batch_opts.batch_id) {
        var attributes = batch_opts.attributes || {};
        var uniforms = batch_opts.uniforms || {};
        var program = batch_opts.program;
        var key;

        Lux.unload_batch();
        previous_batch_opts = batch_opts;
        batch_opts.set_caps();

        var ctx = batch_opts._ctx;
        ctx.useProgram(program);

        for (key in attributes) {
            var attr = program[key];
            if (!_.isUndefined(attr)) {
                ctx.enableVertexAttribArray(attr);
                var buffer = attributes[key].get();
                if (!buffer) {
                    throw new Error("Unset Shade.attribute " + attributes[key]._attribute_name);
                }
                buffer.bind(attr);
            }
        }
        
        var currentActiveTexture = 0;
        _.each(program.uniforms, function(uniform) {
            var key = uniform.uniform_name;
            var call = uniform.uniform_call,
                value = uniform.get();
            if (_.isUndefined(value)) {
                throw new Error("parameter " + key + " has not been set.");
            }
            var t = Shade.Types.type_of(value);
            if (t.equals(Shade.Types.other_t)) {
                uniform._lux_active_uniform = (function(uid, cat) {
                    return function(v) {
                        ctx.activeTexture(ctx.TEXTURE0 + cat);
                        ctx.bindTexture(ctx.TEXTURE_2D, v);
                        ctx.uniform1i(uid, cat);
                    };
                })(program[key], currentActiveTexture);
                currentActiveTexture++;
            } else if (t.equals(Shade.Types.float_t) || 
                       t.equals(Shade.Types.bool_t) ||
                       t.repr().substr(0,3) === "vec") {
                uniform._lux_active_uniform = (function(call, uid) {
                    return function(v) {
                        call.call(ctx, uid, v);
                    };
                })(ctx[call], program[key]);
            } else if (t.repr().substr(0,3) === "mat") {
                uniform._lux_active_uniform = (function(call, uid) {
                    return function(v) {
                        ctx[call](uid, false, v);
                    };
                })(call, program[key]);
            } else {
                throw new Error("could not figure out parameter type! " + t);
            }
            uniform._lux_active_uniform(value);
        });
    }

    batch_opts.draw_chunk();
}

var largest_batch_id = 1;

Lux.bake = function(model, appearance, opts)
{
    appearance = Shade.canonicalize_program_object(appearance);
    opts = _.defaults(opts || {}, {
        force_no_draw: false,
        force_no_pick: false,
        force_no_unproject: false
    });
    var ctx = model._ctx || Lux._globals.ctx;

    if (_.isUndefined(appearance.gl_FragColor)) {
        appearance.gl_FragColor = Shade.vec(1,1,1,1);
    }

    // these are necessary outputs which must be compiled by Shade.program
    function is_program_output(key)
    {
        return ["color", "position", "point_size",
                "gl_FragColor", "gl_Position", "gl_PointSize"].indexOf(key) != -1;
    };

    if (appearance.gl_Position.type.equals(Shade.Types.vec2)) {
        appearance.gl_Position = Shade.vec(appearance.gl_Position, 0, 1);
    } else if (appearance.gl_Position.type.equals(Shade.Types.vec3)) {
        appearance.gl_Position = Shade.vec(appearance.gl_Position, 1);
    } else if (!appearance.gl_Position.type.equals(Shade.Types.vec4)) {
        throw new Error("position appearance attribute must be vec2, vec3 or vec4");
    }

    var batch_id = Lux.fresh_pick_id();

    function build_attribute_arrays_obj(prog) {
        return _.build(_.map(
            prog.attribute_buffers, function(v) { return [v._attribute_name, v]; }
        ));
    }

    function process_appearance(val_key_function) {
        var result = {};
        _.each(appearance, function(value, key) {
            if (is_program_output(key)) {
                result[key] = val_key_function(value, key);
            }
        });
        return Shade.program(result);
    }

    function create_draw_program() {
        return process_appearance(function(value, key) {
            return value;
        });
    }

    function create_pick_program() {
        var pick_id;
        if (appearance.pick_id)
            pick_id = Shade(appearance.pick_id);
        else {
            pick_id = Shade(Shade.id(batch_id));
        }
        return process_appearance(function(value, key) {
            if (key === 'gl_FragColor') {
                var pick_if = (appearance.pick_if || 
                               Shade(value).swizzle("a").gt(0));
                return pick_id.discard_if(Shade.not(pick_if));
            } else
                return value;
        });
    }

    /* Lux unprojecting uses the render-as-depth technique suggested
     by Benedetto et al. in the SpiderGL paper in the context of
     shadow mapping:

     SpiderGL: A JavaScript 3D Graphics Library for Next-Generation
     WWW

     Marco Di Benedetto, Federico Ponchio, Fabio Ganovelli, Roberto
     Scopigno. Visual Computing Lab, ISTI-CNR

     http://vcg.isti.cnr.it/Publications/2010/DPGS10/spidergl.pdf

     FIXME: Perhaps there should be an option of doing this directly as
     render-to-float-texture.

     */
    
    function create_unproject_program() {
        return process_appearance(function(value, key) {
            if (key === 'gl_FragColor') {
                var position_z = appearance.gl_Position.swizzle('z'),
                    position_w = appearance.gl_Position.swizzle('w');
                var normalized_z = position_z.div(position_w).add(1).div(2);

                // normalized_z ranges from 0 to 1.

                // an opengl z-buffer actually stores information as
                // 1/z, so that more precision is spent on the close part
                // of the depth range. Here, we are storing z, and so our efficiency won't be great.
                // 
                // However, even 1/z is only an approximation to the ideal scenario, and 
                // if we're already doing this computation on a shader, it might be worthwhile to use
                // Thatcher Ulrich's suggestion about constant relative precision using 
                // a logarithmic mapping:

                // http://tulrich.com/geekstuff/log_depth_buffer.txt

                // This mapping, incidentally, is more directly interpretable as
                // linear interpolation in log space.

                var result_rgba = Shade.vec(
                    normalized_z,
                    normalized_z.mul(1 << 8),
                    normalized_z.mul(1 << 16),
                    normalized_z.mul(1 << 24)
                );
                return result_rgba;
            } else
                return value;
        });
    }

    var primitive_types = {
        points: ctx.POINTS,
        line_strip: ctx.LINE_STRIP,
        line_loop: ctx.LINE_LOOP,
        lines: ctx.LINES,
        triangle_strip: ctx.TRIANGLE_STRIP,
        triangle_fan: ctx.TRIANGLE_FAN,
        triangles: ctx.TRIANGLES
    };

    var primitive_type = primitive_types[model.type];
    var elements = model.elements;
    var draw_chunk;
    if (Lux.type_of(elements) === 'number') {
        draw_chunk = function() {
            // it's important to use "model.elements" here instead of "elements" because
            // the indirection captures the fact that the model might have been updated with
            // a different number of elements, by changing the attribute buffers.
            // 
            // FIXME This is a phenomentally bad way to go about this problem, but let's go with it for now.
            ctx.drawArrays(primitive_type, 0, model.elements);
        };
    } else {
        if (elements._shade_type === 'attribute_buffer') {
            draw_chunk = function() {
                model.elements.draw(primitive_type);
            };
        } else if (elements._shade_type === 'element_buffer') {
            draw_chunk = function() {
                model.elements.bind_and_draw(primitive_type);
            };
        } else
            throw new Error("model.elements must be a number, an element buffer or an attribute buffer");
    }

    // FIXME the batch_id field in the batch_opts objects is not
    // the same as the batch_id in the batch itself. 
    // 
    // The former is used to avoid state switching, while the latter is
    // a generic automatic id which might be used for picking, for
    // example.
    // 
    // This should not lead to any problems right now but might be confusing to
    // readers.

    function create_batch_opts(program, caps_name) {
        function ensure_parameter(v) {
            if (Lux.type_of(v) === 'number')
                return Shade.parameter("float", v);
            else if (Lux.is_shade_expression(v) === 'parameter')
                return v;
            else throw new Error("expected float or parameter, got " + v + " instead.");
        }
        var result = {
            _ctx: ctx,
            program: program,
            attributes: build_attribute_arrays_obj(program),
            set_caps: function() {
                var ctx = Lux._globals.ctx;
                var mode_caps = ((appearance.mode && appearance.mode[caps_name]) ||
                       Lux.DrawingMode.standard[caps_name]);
                mode_caps();
                if (this.line_width) {
                    ctx.lineWidth(this.line_width.get());
                }
                if (this.polygon_offset) {
                    ctx.enable(ctx.POLYGON_OFFSET_FILL);
                    ctx.polygonOffset(this.polygon_offset.factor.get(), 
                                      this.polygon_offset.units.get());
                }
            },
            draw_chunk: draw_chunk,
            batch_id: largest_batch_id++
        };
        if (!_.isUndefined(appearance.line_width))
            result.line_width = ensure_parameter(appearance.line_width);
        if (!_.isUndefined(appearance.polygon_offset))
            result.polygon_offset = {
                factor: ensure_parameter(appearance.polygon_offset.factor),
                units: ensure_parameter(appearance.polygon_offset.units)
            };
        return result;
    }

    var draw_opts, pick_opts, unproject_opts;

    if (!opts.force_no_draw)
        draw_opts = create_batch_opts(create_draw_program(), "set_draw_caps");

    if (!opts.force_no_pick)
        pick_opts = create_batch_opts(create_pick_program(), "set_pick_caps");

    if (!opts.force_no_unproject)
        unproject_opts = create_batch_opts(create_unproject_program(), "set_unproject_caps");

    var which_opts = [ draw_opts, pick_opts, unproject_opts ];

    var result = {
        model: model,
        batch_id: batch_id,
        draw: function() {
            draw_it(which_opts[ctx._lux_globals.batch_render_mode]);
        },
        // in case you want to force the behavior, or that
        // single array lookup is too slow for you.
        _draw: function() {
            draw_it(draw_opts);
        },
        _pick: function() {
            draw_it(pick_opts);
        },
        // for debugging purposes
        _batch_opts: function() { return which_opts; }
    };
    return result;
};
})();
Lux.batch_list = function(lst)
{
    lst = lst.slice().reverse();
    return {
        list: lst,
        draw: function() {
            var i=this.list.length;
            var lst = this.list;
            while (i--) {
                lst[i].draw();
            }
        }
    };
};
Lux.conditional_batch = function(batch, condition)
{
    return {
        draw: function() {
            if (condition()) batch.draw();
        }
    };
};

Lux.conditional_actor = function(opts)
{
    opts = _.clone(opts);
    opts.bake = function(model, changed_appearance) {
        return Lux.conditional_batch(Lux.bake(model, changed_appearance), opts.condition);
    };
    return Lux.actor(opts);
};
// DEPRECATED, possibly useless. actor_many is what you're probably looking for,
// but that has a horrible name. There's got to be a better API for this kind of thing.

Lux.bake_many = function(model_list, 
                         appearance_function,
                         model_callback)
{
    var scratch_model = _.clone(model_list[0]);
    var batch = Lux.bake(scratch_model, appearance_function(scratch_model));
    return model_callback ? {
        draw: function() {
            _.each(model_list, function(model, i) {
                _.each(scratch_model.attributes, function(v, k) {
                    v.set(model[k].get());
                });
                scratch_model.elements.set(model.elements.array);
                model_callback(model, i);
                batch.draw();
            });
        }
    }:{
        draw: function() {
            _.each(model_list, function(model, i) {
                _.each(scratch_model.attributes, function(v, k) {
                    v.set(model[k].get());
                });
                scratch_model.elements.set(model.elements.array);
                batch.draw();
            });
        }
    };
};
// FIXME make API similar to Lux.attribute_buffer
Lux.element_buffer = function(vertex_array)
{
    var ctx = Lux._globals.ctx;
    var result = ctx.createBuffer();
    result._ctx = ctx;
    result._shade_type = 'element_buffer';
    result.itemSize = 1;
    var draw_enum;

    //////////////////////////////////////////////////////////////////////////
    // These methods are only for internal use within Lux

    result.set = function(vertex_array) {
        Lux.set_context(ctx);
        var typedArray;
        var typed_array_ctor;
        var has_extension = ctx._lux_globals.webgl_extensions.OES_element_index_uint;
        if (has_extension)
            typed_array_ctor = Uint32Array;
        else
            typed_array_ctor = Uint16Array;

        if (vertex_array.constructor.name === 'Array') {
            typedArray = new typed_array_ctor(vertex_array);
        } else {
            if (has_extension) {
                if (vertex_array.constructor !== Uint16Array &&
                    vertex_array.constructor !== Uint32Array) {
                    throw new Error("Lux.element_buffer.set requires either a plain list, a Uint16Array, or a Uint32Array");
                }
            } else {
                if (vertex_array.constructor !== Uint16Array) {
                    throw new Error("Lux.element_buffer.set requires either a plain list or a Uint16Array");
                }
            }
            typedArray = vertex_array;
        }
        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this);
        ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, typedArray, ctx.STATIC_DRAW);
        if (typedArray.constructor === Uint16Array)
            draw_enum = ctx.UNSIGNED_SHORT;
        else if (typedArray.constructor === Uint32Array)
            draw_enum = ctx.UNSIGNED_INT;
        else
            throw new Error("internal error: expecting typed array to be either Uint16 or Uint32");
        this.array = typedArray;
        this.numItems = typedArray.length;
    };
    result.set(vertex_array);

    result.bind = function() {
        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this);
    };
    result.draw = function(primitive) {
        ctx.drawElements(primitive, this.numItems, draw_enum, 0);
    };
    result.bind_and_draw = function(primitive) {
        this.bind();
        this.draw(primitive);
    };
    return result;
};
// Call this to get a guaranteed unique range of picking ids.
// Useful to avoid name conflicts between automatic ids and
// user-defined ids.

(function() {

var latest_pick_id = 1;

Lux.fresh_pick_id = function(quantity)
{
    quantity = quantity || 1;
    var result = latest_pick_id;
    latest_pick_id += quantity;
    return result;
};

})();
Lux.id_buffer = function(vertex_array)
{
    if (Lux.type_of(vertex_array) !== 'array')
        throw new Error("id_buffer expects array of integers");
    var typedArray = new Int32Array(vertex_array);
    var byteArray = new Uint8Array(typedArray.buffer);
    return Lux.attribute_buffer({
        vertex_array: byteArray, 
        item_size: 4, 
        item_type: 'ubyte', 
        normalized: true
    });
};
(function() {

function initialize_context_globals(gl)
{
    gl._lux_globals = {};

    // batches can currently be rendered in "draw" or "pick" mode.
    // draw: 0
    // pick: 1
    // these are indices into an array defined inside Lux.bake
    // For legibility, they should be strings, but for speed, they'll be integers.
    gl._lux_globals.batch_render_mode = 0;

    // epoch is the initial time being tracked by the context.
    gl._lux_globals.epoch = new Date().getTime() / 1000;

    gl._lux_globals.devicePixelRatio = undefined;

    // Optional, enabled WebGL extensions go here.
    gl._lux_globals.webgl_extensions = {};

    // from https://developer.mozilla.org/en-US/docs/JavaScript/Typed_arrays/DataView
    gl._lux_globals.little_endian = (function() {
        var buffer = new ArrayBuffer(2);
        new DataView(buffer).setInt16(0, 256, true);
        return new Int16Array(buffer)[0] === 256;
    })();
}

////////////////////////////////////////////////////////////////////////////////

function polyfill_event(event, gl)
{
    // polyfill event.offsetX and offsetY in Firefox,
    // according to http://bugs.jquery.com/ticket/8523
    if(typeof event.offsetX === "undefined" || typeof event.offsetY === "undefined") {
        var targetOffset = $(event.target).offset();
        event.offsetX = event.pageX - targetOffset.left;
        event.offsetY = event.pageY - targetOffset.top;
    }
    
    event.luxX = event.offsetX * gl._lux_globals.devicePixelRatio;
    event.luxY = gl.viewportHeight - event.offsetY * gl._lux_globals.devicePixelRatio;
}

Lux.init = function(opts)
{
    opts = _.defaults(opts || {}, {
        clearColor: [1,1,1,0],
        clearDepth: 1.0,
        attributes: {
            alpha: true,
            depth: true,
            preserveDrawingBuffer: true
        },
        highDPS: true
    });

    var canvas = opts.canvas;
    if (_.isUndefined(canvas)) {
        var q = $("canvas");
        if (q.length === 0) {
            throw new Error("no canvas elements found in document");
        }
        if (q.length > 1) {
            throw new Error("More than one canvas element found in document; please specify a canvas option in Lux.init");
        }
        canvas = q[0];
    }

    canvas.unselectable = true;
    canvas.onselectstart = function() { return false; };
    var gl;

    var devicePixelRatio = 1;

    if (opts.highDPS) {
        devicePixelRatio = window.devicePixelRatio || 1;
        canvas.style.width = canvas.width;
        canvas.style.height = canvas.height;
        canvas.width = (canvas.clientWidth || canvas.width) * devicePixelRatio;
        canvas.height = (canvas.clientHeight || canvas.height) * devicePixelRatio;
    }

    try {
        if ("attributes" in opts) {
            gl = Lux.Lib.WebGLUtils.setupWebGL(canvas, opts.attributes);
            var x = gl.getContextAttributes();
            for (var key in opts.attributes) {
                if (opts.attributes[key] !== x[key]) {
                    throw new Error("requested attribute " + 
                           key + ": " + opts.attributes[key] +
                           " could not be satisfied");
                }
            }
        } else
            gl = Lux.Lib.WebGLUtils.setupWebGL(canvas);
        if (!gl)
            throw new Error("failed context creation");
        initialize_context_globals(gl);
        if ("interactor" in opts) {
            opts.interactor.resize && opts.interactor.resize(canvas.width, canvas.height);
            for (var key in opts.interactor.events) {
                if (opts[key]) {
                    opts[key] = (function(handler, interactor_handler) {
                        return function(event) {
                            var v = handler(event);
                            return v && interactor_handler(event);
                        };
                    })(opts[key], opts.interactor.events[key]);
                } else {
                    opts[key] = opts.interactor.events[key];
                }
            }
        }
        
        if (opts.debugging) {
            var throwOnGLError = function(err, funcName, args) {
                throw new Error(Lux.Lib.WebGLDebugUtils.glEnumToString(err) + 
                    " was caused by call to " + funcName);
            };
            gl = Lux.Lib.WebGLDebugUtils.makeDebugContext(gl, throwOnGLError, opts.tracing);
        }

        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;

        //////////////////////////////////////////////////////////////////////
        // event handling

        var canvas_events = ["mouseover", "mousemove", "mousedown", "mouseout", 
                             "mouseup", "dblclick"];
        _.each(canvas_events, function(ename) {
            var listener = opts[ename];
            function internal_listener(event) {
                polyfill_event(event, gl);
                if (!Lux.Scene.on(ename, event, gl))
                    return false;
                if (listener)
                    return listener(event);
                return true;
            }
            canvas.addEventListener(ename, Lux.on_context(gl, internal_listener), false);
        });
        
        if (!_.isUndefined(opts.mousewheel)) {
            $(canvas).bind('mousewheel', function(event, delta, deltaX, deltaY) {
                polyfill_event(event, gl);
                return opts.mousewheel(event, delta, deltaX, deltaY);
            });
        };

        //////////////////////////////////////////////////////////////////////

        var ext;
        var exts = gl.getSupportedExtensions();

        function enable_if_existing(name) {
            if (exts.indexOf(name) !== -1 &&
                gl.getExtension(name) !== null) {
                gl._lux_globals.webgl_extensions[name] = true;
            }
        }
        _.each(["OES_texture_float", "OES_standard_derivatives"], function(ext) {
            if (exts.indexOf(ext) === -1 ||
                (gl.getExtension(ext)) === null) { // must call this to enable extension
                alert(ext + " is not available on your browser/computer! " +
                      "Lux will not work, sorry.");
                throw new Error("insufficient GPU support");
            }
        });
        _.each(["OES_texture_float_linear"], enable_if_existing);
        _.each(["WEBKIT_EXT_texture_filter_anisotropic",
                "EXT_texture_filter_anisotropic"], 
               function(ext) {
                   if (exts.indexOf(ext) !== -1 && (gl.getExtension(ext) !== null)) {
                       gl._lux_globals.webgl_extensions.EXT_texture_filter_anisotropic = true;
                       gl.TEXTURE_MAX_ANISOTROPY_EXT     = 0x84FE;
                       gl.MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FF;
                   }
               });
        if (exts.indexOf("OES_element_index_uint") !== -1 &&
            gl.getExtension("OES_element_index_uint") !== null) {
            gl._lux_globals.webgl_extensions.OES_element_index_uint = true;
        }
    } catch(e) {
        alert(e);
        throw e;
    }
    if (!gl) {
        alert("Could not initialize WebGL, sorry :-(");
        throw new Error("failed initalization");
    }

    gl._lux_globals.devicePixelRatio = devicePixelRatio;

    Lux.set_context(gl);

    gl.resize = function(width, height) {
        this.parameters.width.set(width);
        this.parameters.height.set(height);
        if (opts.highDPS) {
            this.viewportWidth = width * devicePixelRatio;
            this.viewportHeight = height * devicePixelRatio;
            this.canvas.style.width = width;
            this.canvas.style.height = height;
            this.canvas.width = this.canvas.clientWidth * devicePixelRatio;
            this.canvas.height = this.canvas.clientHeight * devicePixelRatio;
            if (opts.resize)
                opts.resize(width, height);
        } else {
            this.viewportWidth = width;
            this.viewportHeight = height;
            this.canvas.width = width;
            this.canvas.height = height;
            if (opts.resize)
                opts.resize(width, height);
        }
    };
    gl.parameters = {};
    if (opts.highDPS) {
        gl.parameters.width = Shade.parameter("float", gl.viewportWidth / devicePixelRatio);
        gl.parameters.height = Shade.parameter("float", gl.viewportHeight / devicePixelRatio);
    } else {
        gl.parameters.width = Shade.parameter("float", gl.viewportWidth);
        gl.parameters.height = Shade.parameter("float", gl.viewportHeight);
    }
    gl.parameters.now = Shade.parameter("float", 0);
    gl.parameters.frame_duration = Shade.parameter("float", 0);

    gl._lux_globals.scene = Lux.default_scene({
        context: gl,
        clearColor: opts.clearColor,
        clearDepth: opts.clearDepth,
        pre_draw: function() {
            var raw_t = new Date().getTime() / 1000;
            var new_t = raw_t - gl._lux_globals.epoch;
            var old_t = gl.parameters.now.get();
            gl.parameters.frame_duration.set(new_t - old_t);
            gl.parameters.now.set(new_t);
            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        }
    });

    if ("interactor" in opts) {
        gl._lux_globals.scene.add(opts.interactor.scene);
        gl._lux_globals.scene = opts.interactor.scene;
    }

    return gl;
};

})();
Lux.identity = function()
{
    return mat4.identity();
};

Lux.translation = function(v)
{
    function t_3x3(ar) {
        var r = mat3.create();
        r[6] = ar[0];
        r[7] = ar[1];
        return r;
    }
    function t_4x4(ar) {
        return mat4.translation(ar);
    }
    if (v.length === 3) return t_4x4(v);
    else if (arguments.length === 3) return t_4x4(arguments);
    else if (v.length === 2) return t_3x3(v);
    else if (arguments.length === 2) return t_3x3(arguments);

    throw new Error("invalid vector size for translation");
};

Lux.scaling = function (v)
{
    var ar;
    function s_3x3(ar) {
        var r = mat3.create();
        r[0] = ar[0];
        r[4] = ar[1];
        return r;
    }
    function s_4x4(ar) {
        return mat4.scaling(ar);
    }

    if (v.length === 3) return s_4x4(v);
    else if (arguments.length === 3) return s_4x4(arguments);
    else if (v.length === 2) return s_3x3(v);
    else if (arguments.length === 2) return s_3x3(arguments);

    throw new Error("invalid size for scale");
};

Lux.rotation = function(angle, axis)
{
    return mat4.rotation(angle, axis);
};

Lux.look_at = function(ex, ey, ez, cx, cy, cz, ux, uy, uz)
{
    return mat4.lookAt([ex, ey, ez], [cx, cy, cz], [ux, uy, uz]);
};

Lux.perspective = mat4.perspective;

Lux.frustum = mat4.frustum;

Lux.ortho = mat4.ortho;

Lux.shear = function(xf, yf)
{
    return mat4.create([1, 0, xf, 0,
                        0, 1, yf, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1]);
};
// This function is fairly ugly, but I'd rather this function be ugly
// than the code which calls it be ugly.
Lux.model = function(input)
{
    var n_elements;
    function push_into(array, dimension) {
        return function(el) {
            var v = el.constant_value();
            for (var i=0; i<dimension; ++i)
                array.push(v[i]);
        };
    }

    var result = {
        add: function(k, v) {
            // First we handle the mandatory keys: "type" and "elements"
            if (k === 'type')
                // example: 'type: "triangles"'
                result.type = v;
            else if (k === 'elements') {
                if (v._shade_type === 'element_buffer') {
                    // example: 'elements: Lux.element_buffer(...)'
                    result.elements = v;
                } else if (Lux.type_of(v) === 'number') {
                    // example: 'elements: 4'
                    result.elements = v;
                } else { // if (Lux.type_of(v) === 'array') {
                    // example: 'elements: [0, 1, 2, 3]'
                    // example: 'elements: new Int16Array([0, 1, 2, 3])'
                    // example: 'elements: new Int32Array([0, 1, 2, 3])' (WebGL only supports 16-bit elements, so Lux converts this to a 16-bit element array)
                    result.elements = Lux.element_buffer(v);
                } 
            }
            // Then we handle the model attributes. They can be ...
            else if (v._shade_type === 'attribute_buffer') { // ... attribute buffers,
                // example: 'vertex: Lux.attribute_buffer(...)'
                result[k] = Shade(v);
                result.attributes[k] = result[k];
                n_elements = v.numItems;
            } else if (Lux.type_of(v) === "array") { // ... or a list of per-vertex things
                var buffer;
                // These things can be shade vecs
                if (Lux.type_of(v[0]) !== "array" && v[0]._lux_expression) {
                    // example: 'color: [Shade.color('white'), Shade.color('blue'), ...]
                    // assume it's a list of shade vecs, assume they all have the same dimension
                    // FIXME: check this
                    var dimension = v[0].type.vec_dimension();
                    var new_v = [];
                    _.each(v, push_into(new_v, dimension));
                    buffer = Lux.attribute_buffer({
                        vertex_array: new_v, 
                        item_size: dimension
                    });
                    result[k] = Shade(buffer);
                    result.attributes[k] = result[k];
                    n_elements = buffer.numItems;
                } else {
                    // Or they can be a single list of plain numbers, in which case we're passed 
                    // a pair, the first element being the list, the second 
                    // being the per-element size
                    // example: 'color: [[1,0,0, 0,1,0, 0,0,1], 3]'
                    buffer = Lux.attribute_buffer({
                        vertex_array: v[0], 
                        item_size: v[1]
                    });
                    result[k] = Shade(buffer);
                    result.attributes[k] = result[k];
                    n_elements = buffer.numItems;
                }
            } else {
                // if it's not any of the above things, then it's either a single shade expression
                // or a function which returns one. In any case, we just assign it to the key
                // and leave the user to fend for his poor self.
                result[k] = v;
            }
        },
        attributes: {}
    };

    for (var k in input) {
        var v = input[k];
        result.add(k, v);
    }
    if (!("elements" in result)) {
        // populate automatically using some sensible guess inferred from the attributes above
        if (_.isUndefined(n_elements)) {
            throw new Error("could not figure out how many elements are in this model; "
                + "consider passing an 'elements' field");
        } else {
            result.elements = n_elements;
        }
    }
    if (!("type" in result)) {
        result.add("type", "triangles");
    }
    result._ctx = Lux._globals.ctx;
    return result;
};
Lux.now = function()
{
    var ctx = Lux._globals.ctx;
    return ctx.parameters.now;
};
(function() {

var rb;

Lux.Picker = {
    draw_pick_scene: function(callback) {
        var ctx = Lux._globals.ctx;
        if (!rb) {
            rb = Lux.render_buffer({
                width: ctx.viewportWidth,
                height: ctx.viewportHeight,
                mag_filter: ctx.NEAREST,
                min_filter: ctx.NEAREST
            });
        }

        callback = callback || function() { Lux._globals.ctx._lux_globals.scene.draw(); };
        var old_scene_render_mode = ctx._lux_globals.batch_render_mode;
        ctx._lux_globals.batch_render_mode = 1;
        try {
            rb.with_bound_buffer(callback);
        } finally {
            ctx._lux_globals.batch_render_mode = old_scene_render_mode;
        }
    },
    pick: function(x, y) {
        var ctx = Lux._globals.ctx;
        var buf = new ArrayBuffer(4);
        var result_bytes = new Uint8Array(4);
        rb.with_bound_buffer(function() {
            ctx.readPixels(x, y, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, 
                           result_bytes);
        });
        var result_words = new Uint32Array(result_bytes.buffer);
        return result_words[0];
    }
};

})();
Lux.profile = function(name, seconds, onstart, onend) {
    if (onstart) onstart();
    console.profile(name);
    setTimeout(function() {
        console.profileEnd();
        if (onend) onend();
    }, seconds * 1000);
};
Lux.program = function(vs_src, fs_src)
{
    var ctx = Lux._globals.ctx;
    function getShader(shader_type, str)
    {
        var shader = ctx.createShader(shader_type);
        ctx.shaderSource(shader, str);
        ctx.compileShader(shader);
        if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
            alert(ctx.getShaderInfoLog(shader));
            console.log("Error message: ");
            console.log(ctx.getShaderInfoLog(shader));
            console.log("Failing shader: ");
            console.log(str);
            throw new Error("failed compilation");
        }
        return shader;
    }

    var vertex_shader = getShader(ctx.VERTEX_SHADER, vs_src), 
        fragment_shader = getShader(ctx.FRAGMENT_SHADER, fs_src);

    var shaderProgram = ctx.createProgram();
    ctx.attachShader(shaderProgram, vertex_shader);
    ctx.attachShader(shaderProgram, fragment_shader);
    ctx.linkProgram(shaderProgram);
    
    if (!ctx.getProgramParameter(shaderProgram, ctx.LINK_STATUS)) {
        alert("Could not link program");
        console.log("Error message: ");
        console.log(ctx.getProgramInfoLog(shaderProgram));
        console.log("Failing shader pair:");
        console.log("Vertex shader");
        console.log(vs_src);
        console.log("Fragment shader");
        console.log(fs_src);
        throw new Error("failed link");
    }

    var active_parameters = ctx.getProgramParameter(shaderProgram, ctx.ACTIVE_UNIFORMS);
    var array_name_regexp = /.*\[0\]/;
    var info;
    for (var i=0; i<active_parameters; ++i) {
        info = ctx.getActiveUniform(shaderProgram, i);
        if (array_name_regexp.test(info.name)) {
            var array_name = info.name.substr(0, info.name.length-3);
            shaderProgram[array_name] = ctx.getUniformLocation(shaderProgram, array_name);
        } else {
            shaderProgram[info.name] = ctx.getUniformLocation(shaderProgram, info.name);
        }
    }
    var active_attributes = ctx.getProgramParameter(shaderProgram, ctx.ACTIVE_ATTRIBUTES);
    for (i=0; i<active_attributes; ++i) {
        info = ctx.getActiveAttrib(shaderProgram, i);
        shaderProgram[info.name] = ctx.getAttribLocation(shaderProgram, info.name);
    }
    return shaderProgram;    
};
Lux.render_buffer = function(opts)
{
    opts = _.defaults(opts || {}, {
        context: Lux._globals.ctx,
        width: 512,
        height: 512,
        mag_filter: Lux.texture.linear,
        min_filter: Lux.texture.linear,
        mipmaps: false,
        max_anisotropy: 1,
        wrap_s: Lux.texture.clamp_to_edge,
        wrap_t: Lux.texture.clamp_to_edge,
        clearColor: [0,0,0,1],
        clearDepth: 1.0
    });
    var ctx = opts.context;
    var frame_buffer = ctx.createFramebuffer();

    // Weird:
    // http://www.khronos.org/registry/gles/specs/2.0/es_full_spec_2.0.25.pdf
    // Page 118
    // 
    // Seems unenforced in my implementations of WebGL, even though 
    // the WebGL spec defers to GLSL ES spec.
    // 
    // if (opts.width != opts.height)
    //     throw new Error("renderbuffers must be square (blame GLSL ES!)");

    var rttTexture = Lux.texture(opts);

    frame_buffer.init = function(width, height) {
        Lux.set_context(ctx);
        this.width  = opts.width;
        this.height = opts.height;
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, this);
        var renderbuffer = ctx.createRenderbuffer();
        ctx.bindRenderbuffer(ctx.RENDERBUFFER, renderbuffer);
        ctx.renderbufferStorage(ctx.RENDERBUFFER, ctx.DEPTH_COMPONENT16, this.width, this.height);

        ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, rttTexture, 0);
        ctx.framebufferRenderbuffer(ctx.FRAMEBUFFER, ctx.DEPTH_ATTACHMENT, ctx.RENDERBUFFER, renderbuffer);
        var status = ctx.checkFramebufferStatus(ctx.FRAMEBUFFER);
        try {
            switch (status) {
            case ctx.FRAMEBUFFER_COMPLETE:
                break;
            case ctx.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                throw new Error("incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
            case ctx.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                throw new Error("incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            case ctx.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                throw new Error("incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            case ctx.FRAMEBUFFER_UNSUPPORTED:
                throw new Error("incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
            default:
                throw new Error("incomplete framebuffer: " + status);
            }
        } finally {
            ctx.bindTexture(ctx.TEXTURE_2D, null);
            ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
            ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
        }
    };

    frame_buffer.init(opts.width, opts.height);
    frame_buffer._shade_type = 'render_buffer';
    frame_buffer.texture = rttTexture;
    frame_buffer.resize = function(width, height) {
        opts.width = width;
        opts.height = height;
        this.texture.init(opts);
        this.init(width, height);
    };
    frame_buffer.with_bound_buffer = function(what) {
        var v = ctx.getParameter(ctx.VIEWPORT);
        try {
            ctx.bindFramebuffer(ctx.FRAMEBUFFER, this);
            ctx.viewport(0, 0, this.width, this.height);
            return what();
        } finally {
            ctx.viewport(v[0], v[1], v[2], v[3]);
            ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
        }
    };
    frame_buffer.screen_actor = function(opts) {
        opts = _.defaults(opts, {
            mode: Lux.DrawingMode.standard
        });
        var with_texel_at_uv = opts.texel_function;
        var mode = opts.mode;
        var that = this;
        var sq = Lux.Models.square();
        mode = mode || Lux.DrawingMode.standard;
        return Lux.actor({
            model: sq,
            appearance: {
                screen_position: sq.vertex.mul(2).sub(1),
                color: with_texel_at_uv(function(offset) {
                    var texcoord = sq.tex_coord;
                    if (arguments.length > 0)
                        texcoord = texcoord.add(offset);
                    return Shade.texture2D(that.texture, texcoord);
                }),
                mode: mode
            },
            bake: opts.bake
        });
    };
    
    var old_v;
    frame_buffer.scene = Lux.default_scene({
        clearColor: opts.clearColor,
        clearDepth: opts.clearDepth,
        context: ctx,
        pre_draw: function() {
            old_v = ctx.getParameter(ctx.VIEWPORT);
            ctx.bindFramebuffer(ctx.FRAMEBUFFER, frame_buffer);
            ctx.viewport(0, 0, frame_buffer.width, frame_buffer.height);
        },
        post_draw: function() {
            ctx.viewport(old_v[0], old_v[1], old_v[2], old_v[3]);
            ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
        }
    });

    return frame_buffer;
};
Lux.set_context = function(the_ctx)
{
    Lux._globals.ctx = the_ctx;
    // Shade.set_context(the_ctx);
};
/*
 * Lux.on_context returns a wrapped callback that guarantees that the passed
 * callback will be invoked with the given current context. 
 * 
 * This is primarily used to safeguard pieces of code that need to work under
 * multiple active WebGL contexts.
 */
Lux.on_context = function(the_ctx, f)
{
    return function() {
        Lux.set_context(the_ctx);
        f.apply(this, arguments);
    };
};
//////////////////////////////////////////////////////////////////////////////
// load texture from DOM element or URL. 
// BEWARE SAME-DOMAIN POLICY!

Lux.texture = function(opts)
{
    var ctx = Lux._globals.ctx;
    var texture = ctx.createTexture();

    texture._shade_type = 'texture';
    // Each texture has to be associated with a particular context, so we
    // store that in ._ctx
    // FIXME: This must be true for other WebGL resources as well. Are we checking them?
    texture._ctx = ctx;

    texture.init = Lux.on_context(ctx, function(opts) {
        var ctx = Lux._globals.ctx;
        var has_mipmaps = _.isUndefined(opts.mipmaps) || opts.mipmaps;
        opts = _.defaults(opts, {
            onload: function() {},
            max_anisotropy: has_mipmaps ? 2 : 1,
            mipmaps: true,
            mag_filter: Lux.texture.linear,
            min_filter: has_mipmaps ? Lux.texture.linear_mipmap_linear : Lux.texture.linear,
            wrap_s: Lux.texture.clamp_to_edge,
            wrap_t: Lux.texture.clamp_to_edge,
            format: Lux.texture.rgba,
            type: Lux.texture.unsigned_byte
        });
        this.width = opts.width;
        this.height = opts.height;

        this.ready = false;
        var that = this;

        /*
         * Texture.load:
         * 
         *   Replaces a rectangle of a Lux texture with a given image.
         * 
         *   This is useful to store a large set of rectangular images into a single texture, for example.
         * 
         *   Example usage:
         * 
         *   * Load an image from a URL:
         * 
         *     texture.load({
         *       src: "http://www.example.com/image.png"
         *     })
         * 
         *   * Invoke a callback when image is successfully loaded:
         * 
         *     texture.load({
         *       src: "http://www.example.com/image.png",
         *       onload: function(image) { 
         *         alert("image has now loaded into texture!");
         *       }
         *     })
         * 
         *     The parameter passed to the callback is the image, canvas 
         *     or buffer loaded into the texture, and in
         *     the callback, 'this' points to the texture. In other words,
         *     the callback is called with "onload.call(texture, image)"
         *        
         *   * Specify an offset:
         * 
         *     texture.load({
         *       src: "http://www.example.com/image.png",
         *       x_offset: 64,
         *       y_offset: 32
         *     })
         * 
         *   * Load an image from an existing element in the DOM:
         * 
         *     texture.load({
         *       img: document.getElementById("image-element")
         *     });
         *
         *     texture.load({
         *       canvas: document.getElementById("canvas-element")
         *     });
         * 
         *   * Load an image from a TypedArray buffer (currently only supports 8-bit RGBA or 32-bit float RGBA):
         * 
         *     Lux.load({
         *       width: 128,
         *       height: 128,
         *       buffer: new Uint8Array(128 * 128 * 4)
         *     });
         */
        this.load = function(opts) {
            opts = _.defaults(opts, {
                onload: function() {},
                x_offset: 0,
                y_offset: 0,
                transform_image: function(i) { return i; }
            });

            var texture = this;
            var onload = opts.onload;
            var x_offset = opts.x_offset;
            var y_offset = opts.y_offset;

            function image_handler(image) {
                image = opts.transform_image(image);
                var ctx = texture._ctx;
                Lux.set_context(texture._ctx);
                ctx.bindTexture(ctx.TEXTURE_2D, texture);
                ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
                if (_.isUndefined(that.width)) {
                    that.width = image.width;
                    that.height = image.height;
                    ctx.texImage2D(ctx.TEXTURE_2D, 0, opts.format,
                                   that.width, that.height,
                                   0, opts.format, opts.type, null);
                }
                ctx.texSubImage2D(ctx.TEXTURE_2D, 0, x_offset, y_offset,
                                  ctx.RGBA, ctx.UNSIGNED_BYTE, image);
                if (opts.mipmaps)
                    ctx.generateMipmap(ctx.TEXTURE_2D);
                Lux.unload_batch();
                that.ready = true;
                onload.call(texture, image);
            }

            function buffer_handler()
            {
                var ctx = texture._ctx;
                Lux.set_context(texture._ctx);
                ctx.bindTexture(ctx.TEXTURE_2D, texture);
                if (_.isUndefined(opts.buffer)) {
                    if (x_offset !== 0 || y_offset !== 0) {
                        throw new Error("texture.load cannot be called with nonzero offsets and no data");
                    }
                    ctx.texImage2D(ctx.TEXTURE_2D, 0, opts.format,
                                   that.width, that.height,
                                   0, opts.format, opts.type, null);
                } else {
                    var type;
                    var ctor = opts.buffer.constructor.name;
                    var map = {
                        "Uint8Array": ctx.UNSIGNED_BYTE,
                        "Float32Array": ctx.FLOAT
                    };
                    if (_.isUndefined(map[ctor])) {
                        throw new Error("opts.buffer must be either Uint8Array or Float32Array");
                    }
                    ctx.texSubImage2D(ctx.TEXTURE_2D, 0, x_offset, y_offset, 
                                      opts.width, opts.height,
                                      ctx.RGBA, map[ctor], opts.buffer);
                }
                if (opts.mipmaps)
                    ctx.generateMipmap(ctx.TEXTURE_2D);
                that.ready = true;
                Lux.unload_batch();
                onload.call(texture, opts.buffer);
            }

            if (opts.src) {
                var image = new Image();
                image.onload = function() {
                    image_handler(image);
                };
                // CORS support
                if (opts.crossOrigin)
                    image.crossOrigin = opts.crossOrigin;
                image.src = opts.src;
            } else if (opts.canvas) {
                image_handler(opts.canvas);
            } else if (opts.img) {
                if (opts.img.isComplete) {
                    image_handler(opts.img);
                } else {
                    var old_onload = texture.image.onload || function() {};
                    opts.img.onload = function() {
                        image_handler(opts.img);
                        old_onload();
                    };
                }
            } else {
                buffer_handler();
            }
        };
        
        Lux.set_context(ctx);
        ctx.bindTexture(ctx.TEXTURE_2D, that);
        ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        ctx.texImage2D(ctx.TEXTURE_2D, 0, opts.format,
                       that.width, that.height,
                       0, opts.format, opts.type, null);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, opts.mag_filter);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, opts.min_filter);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, opts.wrap_s);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, opts.wrap_t);
        if (ctx._lux_globals.webgl_extensions.EXT_texture_filter_anisotropic &&
            opts.max_anisotropy > 1 && opts.mipmaps) {
            ctx.texParameterf(ctx.TEXTURE_2D, ctx.TEXTURE_MAX_ANISOTROPY_EXT, opts.max_anisotropy);
        }

        delete this.buffer;
        delete this.image;

        this.load(opts);
    });

    texture.init(opts);

    return texture;
};

//////////////////////////////////////////////////////////////////////////////
// texture-related enums go here

// mag_filter
Lux.texture.nearest                = 0x2600;
Lux.texture.linear                 = 0x2601;

// min_filter 
Lux.texture.nearest_mipmap_nearest = 0x2700;
Lux.texture.linear_mipmap_nearest  = 0x2701;
Lux.texture.nearest_mipmap_linear  = 0x2702;
Lux.texture.linear_mipmap_linear   = 0x2703;

// wrap_s and wrap_t
Lux.texture.repeat                 = 0x2901;
Lux.texture.clamp_to_edge          = 0x812F;
Lux.texture.mirrored_repeat        = 0x8370;

// format
Lux.texture.depth_component        = 0x1902;
Lux.texture.alpha                  = 0x1906;
Lux.texture.rgb                    = 0x1907;
Lux.texture.rgba                   = 0x1908;
Lux.texture.luminance              = 0x1909;
Lux.texture.luminance_alpha        = 0x190A;

// type
Lux.texture.unsigned_byte          = 0x1401;
Lux.texture.unsigned_short_4_4_4_4 = 0x8033;
Lux.texture.unsigned_short_5_5_5_1 = 0x8034;
Lux.texture.unsigned_short_5_6_5   = 0x8363;
Lux.texture["float"]               = 0x1406;
(function() {

var rb;
var depth_value;
var clear_batch;
    
Lux.Unprojector = {
    draw_unproject_scene: function(callback) {
        var ctx = Lux._globals.ctx;
        if (!rb) {
            rb = Lux.render_buffer({
                width: ctx.viewportWidth,
                height: ctx.viewportHeight,
                TEXTURE_MAG_FILTER: ctx.NEAREST,
                TEXTURE_MIN_FILTER: ctx.NEAREST
            });
        }
        // In addition to clearing the depth buffer, we need to fill
        // the color buffer with
        // the right depth value. We do it via the batch below.

        if (!clear_batch) {
            var xy = Shade(Lux.attribute_buffer({
                vertex_array: [-1, -1,   1, -1,   -1,  1,   1,  1], 
                item_size: 2}));
            var model = Lux.model({
                type: "triangle_strip",
                elements: 4,
                vertex: xy
            });
            depth_value = Shade.parameter("float");
            clear_batch = Lux.bake(model, {
                position: Shade.vec(xy, depth_value),
                color: Shade.vec(1,1,1,1)
            });
        }

        callback = callback || ctx._lux_globals.display_callback;
        var old_scene_render_mode = ctx._lux_globals.batch_render_mode;
        ctx._lux_globals.batch_render_mode = 2;
        rb.with_bound_buffer(function() {
            var old_clear_color = ctx.getParameter(ctx.COLOR_CLEAR_VALUE);
            var old_clear_depth = ctx.getParameter(ctx.DEPTH_CLEAR_VALUE);
            ctx.clearColor(old_clear_depth,
                           old_clear_depth / (1 << 8),
                           old_clear_depth / (1 << 16),
                           old_clear_depth / (1 << 24));
            ctx.clear(ctx.DEPTH_BUFFER_BIT | ctx.COLOR_BUFFER_BIT);
            try {
                callback();
            } finally {
                ctx.clearColor(old_clear_color[0],
                               old_clear_color[1],
                               old_clear_color[2],
                               old_clear_color[3]);
                ctx._lux_globals.batch_render_mode = old_scene_render_mode;
            }
        });
    },

    unproject: function(x, y) {
        var ctx = Lux._globals.ctx;
        var buf = new ArrayBuffer(4);
        var result_bytes = new Uint8Array(4);
        ctx.readPixels(x, y, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, 
                       result_bytes);
        rb.with_bound_buffer(function() {
            ctx.readPixels(x, y, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, 
                           result_bytes);
        });
        return result_bytes[0] / 256 + 
            result_bytes[1] / (1 << 16) + 
            result_bytes[2] / (1 << 24);
        // +  result_bytes[3] / (1 << 32);
    }
};

})();
Lux.Net = {};

(function() {

var handle_many = function(url, handler, self_call) {
    var obj = {};
    var done = _.after(url.length, handler);
    function piecemeal_handler(result, internal_url) {
        obj[internal_url] = result;
        done(obj);
    }
    _.each(url, function(internal_url) {
        self_call(internal_url, piecemeal_handler);
    });
};


/*
 * Lux.Net.ajax issues AJAX requests.
 * 
 * It takes as parameters
 * 
 *  url (string or list of strings): urls to fetch
 * 
 *  handler (function(buffer or dictionary of (url: buffer))): a callback
 *  which gets invoked when all requests finish. If a single URL was passed,
 *  the callback is called with the single response eturned. If a list of URLs
 *  were passed, then an object is returned, mapping the URLs as passed to
 *  the responses.
 *  
 * FIXME Lux.Net.ajax has no error handling.
 */

Lux.Net.ajax = function(url, handler)
{
    var current_context = Lux._globals.ctx;

    if (Lux.type_of(url) === "array")
        return handle_many(url, handler, Lux.Net.ajax);

    var xhr = new XMLHttpRequest;

    xhr.open("GET", url, true);

    var ready = false;
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200 && !ready) {
            Lux.set_context(current_context);
            handler(xhr.response, url);
            ready = true;
        }
    };
    xhr.send(null);
    return undefined;
};
/*
 * Lux.Net.json issues JSON AJAX requests.
 * 
 * It takes as parameters
 * 
 *  url (string or list of strings): urls to fetch
 * 
 *  handler (function(buffer or dictionary of (url: buffer))): a callback
 *  which gets invoked when all requests finish. If a single URL was passed,
 *  the callback is called with the single JSON object returned. If a list of URLs
 *  were passed, then an object is returned, mapping the URLs as passed to
 *  the responses.
 *  
 * FIXME Lux.Net.json has no error handling.
 */

Lux.Net.json = function(url, handler)
{
    if (Lux.type_of(url) === "array")
        return handle_many(url, handler, Lux.Net.json);

    var xhr = new XMLHttpRequest;

    xhr.open("GET", url, true);

    var ready = false;
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200 && !ready) {
            handler(JSON.parse(xhr.response), url);
            ready = true;
        }
    };
    xhr.send(null);
};
/*
 * Lux.Net.binary issues binary AJAX requests, which can be
 * used to load data into Lux more efficiently than through the
 * regular text or JSON AJAX interfaces. It returns ArrayBuffer objects.
 * 
 * It takes as parameters
 * 
 *  url (string or list of strings): urls to fetch
 * 
 *  handler (function(ArrayBuffer or dictionary of (url: ArrayBuffer))): a callback
 *  which gets invoked when all requests finish. If a single URL was passed,
 *  the callback is called with the single buffer returned. If a list of URLs
 *  were passed, then an object is returned, mapping the URLs as passed to
 *  the buffers.
 *  
 * FIXME Lux.Net.binary has no error handling.
 */

// based on http://calumnymmo.wordpress.com/2010/12/22/so-i-decided-to-wait/
// Update 2013-04-24; Firefox now seems to behave in the same way as Chrome.

Lux.Net.binary = function(url, handler)
{
    var current_context = Lux._globals.ctx;

    if (Lux.type_of(url) === "array")
        return handle_many(url, handler, Lux.Net.binary);

    var xhr = new window.XMLHttpRequest();
    var ready = false;
    xhr.onreadystatechange = function() {
        Lux.set_context(current_context);
        if (xhr.readyState === 4 && xhr.status === 200
            && ready !== true) {
            if (xhr.responseType === "arraybuffer") {
                handler(xhr.response, url);
            } else if (xhr.mozResponseArrayBuffer !== null) {
                handler(xhr.mozResponseArrayBuffer, url);
            } else if (xhr.responseText !== null) {
                var data = String(xhr.responseText);
                var ary = new Array(data.length);
                for (var i = 0; i <data.length; i++) {
                    ary[i] = data.charCodeAt(i) & 0xff;
                }
                var uint8ay = new Uint8Array(ary);
                handler(uint8ay.buffer, url);
            }
            ready = true;
        }
    };
    xhr.open("GET", url, true);
    xhr.responseType="arraybuffer";
    xhr.send();
};
})();
// drawing mode objects can be part of the parameters passed to 
// Lux.bake, in order for the batch to automatically set the capabilities.
// This lets us specify blending, depth-testing, etc. at bake time.

/* FIXME This is double dispatch done wrong. See lux.org for details.
 */

Lux.DrawingMode = {};
Lux.DrawingMode.additive = {
    set_draw_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.enable(ctx.BLEND);
        ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE);
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
        ctx.depthMask(false);
    },
    set_pick_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
        ctx.depthMask(false);
    },
    set_unproject_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
        ctx.depthMask(false);
    }
};
// over is the standard porter-duff over operator

// NB: since over is associative but not commutative, we need
// back-to-front rendering for correct results,
// and then the depth buffer is not necessary. 
// 
// In the case of incorrect behavior (that is, when contents are not
// rendered back-to-front), it is not clear which of the two incorrect 
// behaviors is preferable:
// 
// 1. that depth buffer writing be enabled, and some things which should
// be rendered "behind" alpha-blended simply disappear (this gets
// worse the more transparent objects get)
//
// 2. that depth buffer writing be disabled, and some things which would be
// entirely occluded by others simply appear (this gets worse the more opaque
// objects get)
//
// These two behaviors correspond respectively to 
// Lux.DrawingMode.over_with_depth and Lux.DrawingMode.over

Lux.DrawingMode.over = {
    set_draw_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.enable(ctx.BLEND);
        ctx.blendFuncSeparate(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA, 
                              ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA);
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
        ctx.depthMask(false);
    },
    set_pick_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
        ctx.depthMask(false);
    },
    set_unproject_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
        ctx.depthMask(false);
    }
};

Lux.DrawingMode.over_with_depth = {
    set_draw_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.enable(ctx.BLEND);
        ctx.blendFuncSeparate(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA, 
                              ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA);
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LEQUAL);
    },
    set_pick_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LEQUAL);
    },
    set_unproject_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LEQUAL);
    }
};

Lux.DrawingMode.over_no_depth = {
    set_draw_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.enable(ctx.BLEND);
        ctx.blendFuncSeparate(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA, 
                              ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA);
        ctx.disable(ctx.DEPTH_TEST);
        ctx.depthMask(false);
    },
    set_pick_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.disable(ctx.DEPTH_TEST);
        ctx.depthMask(false);
    },
    set_unproject_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.disable(ctx.DEPTH_TEST);
        ctx.depthMask(false);
    }
};
Lux.DrawingMode.standard = {
    set_draw_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
        ctx.disable(ctx.BLEND);
    },
    set_pick_caps: function()
    { 
        var ctx = Lux._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
        ctx.disable(ctx.BLEND);
   },
    set_unproject_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
        ctx.disable(ctx.BLEND);
    }
};
/*
 * Lux.DrawingMode.pass is used whenever depth testing needs to be off;
 * 
 * Lux.DrawingMode.pass disables *writing* to the depth test as well
 * 
 */

Lux.DrawingMode.pass = {
    set_draw_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.disable(ctx.DEPTH_TEST);
        ctx.depthMask(false);
        ctx.disable(ctx.BLEND);
    },
    set_pick_caps: function()
    { 
        var ctx = Lux._globals.ctx;
        ctx.disable(ctx.DEPTH_TEST);
        ctx.depthMask(false);
        ctx.disable(ctx.BLEND);
    },
    set_unproject_caps: function()
    {
        var ctx = Lux._globals.ctx;
        ctx.disable(ctx.DEPTH_TEST);
        ctx.depthMask(false);
        ctx.disable(ctx.BLEND);
    }
};
Lux.Data = {};
Lux.Data.table = function(obj) {
    obj = _.defaults(obj || {}, {
        number_columns: []
    });
    if (_.isUndefined(obj.data)) throw new Error("data is a required field");
    if (_.isUndefined(obj.data)) throw new Error("columns is a required field");
    function table() {
    };
    table.prototype = {
        is_numeric_row_complete: function(row) {
            for (var i=0; i<this.number_columns.length; ++i) {
                var col = this.columns[i];
                var val = row[col];
                if (typeof val !== "number")
                    return false;
            }
            return this.number_columns.length > 0;
        }
    };
    var result = new table();
    for (var key in obj) {
        result[key] = obj[key];
    }
    return result;
};
Lux.Data.texture_table = function(table)
{
    var elements = [];
    for (var row_ix = 0; row_ix < table.data.length; ++row_ix) {
        var row = table.data[row_ix];
        if (!table.is_numeric_row_complete(row))
            continue;
        for (var col_ix = 0; col_ix < table.number_columns.length; ++col_ix) {
            var col_name = table.columns[table.number_columns[col_ix]];
            var val = row[col_name];
            if (typeof val !== "number")
                throw new Error("texture_table requires numeric values");
            elements.push(val);
        }
    }

    var table_ncols = table.number_columns.length;
    // can't be table.data.length because not all rows are valid.
    var table_nrows = elements.length / table.number_columns.length;
    var texture_width = 1;

    return Lux.Data.texture_array({
        n_rows: table_nrows,
        n_cols: table_ncols,
        elements: elements
    });
};
/*
   texture array takes an object with fields:

     n_cols (integer): number of columns in the 2D array of data
     n_rows (integer): number of rows in the 2D array of data
     elements (array, Float32Array): list of elements in the array

   and returns an object with four fields:

   n_cols (integer): number of columns in the data

   n_rows (integer): number of rows in the data

   at (function(Shade(int), Shade(int)) -> Shade(float)): returns the
   value stored at given row and column

   index (function(Shade(int), Shade(int)) -> Shade(vec3)): returns
   the index of the value stored at given row and column. This is a
   three dimensional vector.  The first two coordinates store the
   texture coordinate, and the fourth coordinate stores the
   channel. This is necessary to take advantage of RGBA float
   textures, which have the widest support on WebGL-capable hardware.

   For example, luminance float textures appear to clamp to [0,1], at
   least on Chrome 15 on Linux.

 */

Lux.Data.texture_array = function(opts)
{
    var ctx = Lux._globals.ctx;
    var elements = opts.elements;
    var n_cols = opts.n_cols;
    var n_rows = opts.n_rows;

    var texture_width = 1;
    while (4 * texture_width * texture_width < elements.length) {
        texture_width = texture_width * 2;
    }
    var texture_height = Math.ceil(elements.length / (4 * texture_width));

    var new_elements;
    if (texture_width * texture_height === elements.length) {
        // no chance this will ever happen in practice, but hey, 
        // a man can dream
        if (Lux.type_of(elements) === "array") {
            new_elements = new Float32Array(elements);
        } else
            new_elements = elements;
    } else {
        new_elements = new Float32Array(texture_width * texture_height * 4);
        for (var i=0; i<elements.length; ++i)
            new_elements[i] = elements[i];
    }

    var texture = Lux.texture({
        width: texture_width,
        height: texture_height,
        buffer: new_elements,
        type: ctx.FLOAT,
        format: ctx.RGBA,
        min_filter: ctx.NEAREST,
        mag_filter: ctx.NEAREST
    });

    var index = Shade(function(row, col) {
        var linear_index    = row.mul(n_cols).add(col);
        var in_texel_offset = linear_index.mod(4);
        var texel_index     = linear_index.div(4).floor();
        var x               = texel_index.mod(texture_width);
        var y               = texel_index.div(texture_width).floor();
        var result          = Shade.vec(x, y, in_texel_offset);
        return result;
    });
    var at = Shade(function(row, col) {
        // returns Shade expression with value at row, col
        var ix = index(row, col);
        var uv = ix.swizzle("xy")
            .add(Shade.vec(0.5, 0.5))
            .div(Shade.vec(texture_width, texture_height))
            ;
        return Shade.texture2D(texture, uv).at(ix.z());
    });

    return {
        n_rows: n_rows,
        n_cols: n_cols,
        at: at,
        index: index
    };
};
Lux.Data.array_1d = function(array)
{
    var ctx = Lux._globals.ctx;

    var elements = array;
    var texture_width = 1;
    while (4 * texture_width * texture_width < elements.length) {
        texture_width = texture_width * 2;
    }
    var texture_height = Math.ceil(elements.length / (4 * texture_width));
    var new_elements;
    if (texture_width * texture_height === elements.length) {
        if (Lux.type_of(elements) === "array") {
            new_elements = new Float32Array(elements);
        } else
            new_elements = elements;
    } else {
        new_elements = new Float32Array(texture_width * texture_height * 4);
        for (var i=0; i<elements.length; ++i)
            new_elements[i] = elements[i];
    }

    var texture = Lux.texture({
        width: texture_width,
        height: texture_height,
        buffer: new_elements,
        type: ctx.FLOAT,
        format: ctx.RGBA,
        min_filter: ctx.NEAREST,
        min_filter: ctx.NEAREST
    });

    var index = Shade(function(linear_index) {
        var in_texel_offset = linear_index.mod(4);
        var texel_index = linear_index.div(4).floor();
        var x = texel_index.mod(texture_width);
        var y = texel_index.div(texture_width).floor();
        var result = Shade.vec(x, y, in_texel_offset);
        return result;
    });

    var at = Shade(function(linear_index) {
        var ix = index(linear_index);
        var uv = ix.swizzle("xy")
            .add(Shade.vec(0.5, 0.5))
            .div(Shade.vec(texture_width, texture_height))
            ;
        return Shade.texture2D(texture, uv).at(ix.z());
    });
    return {
        length: new_elements.length,
        at: at,
        index: index
    };
};
Lux.UI = {};
/*
 * Lux.UI.parameter_slider is a function to help create UI elements
 * that control Shade.parameter objects. 
 *
 * The result of calling Lux.UI.parameter_slider is a Shade.parameter,
 * either freshly created, or the one passed as input.
 *
 * Lux.UI.parameter_slider requires the "element" field in its options.
 * 
 * opts.element is the HTML element used by jquery-ui to create the slider. That
 *   object needs to have the correct CSS class assigned to it ahead of calling
 *   this function.
 * 
 * opts.parameter is the Shade.parameter object under control. if opts.parameter
 *   is undefined, Lux.UI.parameter_slider creates the Shade.parameter.
 * 
 * opts.change is a user-defined callback to the slider change event.
 * opts.slide is a user-defined callback to the slider slide event.
 * 
 *   Both event handlers are passed the HTML element, the parameter object, 
 *   and the new value, in that order.
 * 
 * opts.min is the minimum value allowed by the slider
 * opts.max is the maximum value allowed by the slider
 * opts.value is the starting value of the slider and parameter
 * opts.orientation is the slider's orientation, either "horizontal" or "vertical"
 *
 * Lux.UI.parameter_slider uses jquery-ui sliders, and so assumes
 * jquery-ui in addition to jquery.  If you know of a better
 * lightweight gui library, let me know as well.
 */

Lux.UI.parameter_slider = function(opts)
{
    opts = _.defaults(opts, {
        min: 0,
        max: 1,
        orientation: "horizontal",
        slide: function() {},
        change: function() {}
    });
    var element = opts.element;
    if (_.isUndefined(opts.element)) {
        throw new Error("parameter_slider requires an element option");
    }
    if (_.isUndefined(opts.parameter)) {
        opts.parameter = Shade.parameter("float", opts.min);
    }
    if (!_.isUndefined(opts.value)) {
        opts.parameter.set(opts.value);
    }
    var parameter  = opts.parameter,
        slider_min = 0, 
        slider_max = 1000;

    function to_slider(v) {
        return (v-opts.min) / (opts.max - opts.min) * 
            (slider_max - slider_min) + slider_min;
    }
    function to_parameter(v) {
        return (v-slider_min) / (slider_max - slider_min) *
            (opts.max - opts.min) + opts.min;
    }
    $(element).slider({
        min: slider_min,
        max: slider_max,
        value: to_slider(parameter.get()),
        orientation: opts.orientation,
        slide: function() {
            var v = to_parameter($(element).slider("value"));
            parameter.set(v);
            opts.slide(element, parameter, v);
            Lux.Scene.invalidate();
        },
        change: function() {
            var v = to_parameter($(element).slider("value"));
            parameter.set(v);
            opts.change(element, parameter, v);
            Lux.Scene.invalidate();
        }
    });
    return parameter;
};
Lux.UI.parameter_checkbox = function(opts)
{
    opts = _.defaults(opts, {
        toggle: function() {}
    });
    var element = opts.element;
    var parameter = opts.parameter;

    function on_click(event) {
        parameter.set(~~event.target.checked);
        console.log(parameter.get());
        opts.toggle(event);
        Lux.Scene.invalidate();
    }

    $(element).button().click(on_click);
};
/*
 * A Lux interactor is an object that exposes a list of events that
 * Lux.init uses to hook up to canvas event handlers.
 * 
 * Lux.UI.center_zoom_interactor provides event handlers for the
 * common interaction mode of zooming and panning. Its main visible variables
 * are center and zoom Shade.parameter objects, together with a Shade.camera
 * that computes the appropriate projection matrix.
 * 
 * usage examples:
 *   demos/beauty_of_roots
 * 
 */

Lux.UI.center_zoom_interactor = function(opts)
{
    opts = _.defaults(opts || {}, {
        mousemove: function() {},
        mouseup: function() {},
        mousedown: function() {},
        mousewheel: function() {},
        dblclick: function() {},
        center: vec.make([0,0]),
        zoom: 1,
        widest_zoom: 0.1,
        width: 100,
        height: 100
    });

    var height = opts.height;
    var width = opts.width;

    var aspect_ratio = Shade.parameter("float", width/height);
    var center = Shade.parameter("vec2", opts.center);
    var zoom = Shade.parameter("float", opts.zoom);
    var camera = Shade.Camera.ortho({
        left: opts.left,
        right: opts.right,
        top: opts.top,
        bottom: opts.bottom,
        center: center,
        zoom: zoom,
        aspect_ratio: aspect_ratio
    });

    var prev_mouse_pos, down_mouse_pos;
    var current_button = 0;

    function dblclick(event) {
        internal_move(result.width/2-event.offsetX, event.offsetY-result.height/2);
        zoom.set(zoom.get() * 2);
        internal_move(event.offsetX-result.width/2, result.height/2-event.offsetY);
        Lux.Scene.invalidate();
        opts.dblclick(event);
    }

    function mousedown(event) {
        if (_.isUndefined(event.buttons)) {
            // webkit
            current_button = event.which;
        } else {
            // firefox
            current_button = event.buttons;
        }

        prev_mouse_pos = [event.offsetX, event.offsetY];
        down_mouse_pos = [event.offsetX, event.offsetY];
        opts.mousedown(event);
    }

    function mouseup(event) {
        current_button = 0;
        opts.mouseup(event);
    }

    // c stores the compensation for the kahan compensated sum
    var c = vec.make([0, 0]);

    // f computes the change in the center position, relative to the
    // current camera parameters. Since camera is a Lux expression,
    // to get the javascript value we create a Shade function and
    // use js_evaluate.
    var f = Shade(function (delta_vec) {
        return result.camera.unproject(Shade.vec(0,0))
            .sub(result.camera.unproject(delta_vec));
    }).js_evaluate;

    var internal_move = function(dx, dy) {
        var ctx = Lux._globals.ctx;
        // FIXME This doesn't work with highDPS: true
        var v = vec.make([2*dx/ctx.parameters.width.get(), 
                          2*dy/ctx.parameters.height.get()]);
        var negdelta = f(v);
        // we use a kahan compensated sum here:
        // http://en.wikipedia.org/wiki/Kahan_summation_algorithm
        // to accumulate minute changes in the center that come from deep zooms.
        var y = vec.minus(negdelta, c);
        var t = vec.plus(center.get(), y);
        c = vec.minus(vec.minus(t, center.get()), y);
        center.set(t);
    };

    function mousemove(event) {
        if ((current_button & 1) && !event.shiftKey) {
            internal_move(event.offsetX - prev_mouse_pos[0], 
                        -(event.offsetY - prev_mouse_pos[1]));
            Lux.Scene.invalidate();
        } else if ((current_button & 1) && event.shiftKey) {
            internal_move(result.width/2-down_mouse_pos[0], down_mouse_pos[1]-result.height/2);
            var new_value = Math.max(opts.widest_zoom, zoom.get() * (1.0 + (event.offsetY - prev_mouse_pos[1]) / 240));
            zoom.set(new_value);
            internal_move(down_mouse_pos[0]-result.width/2, result.height/2-down_mouse_pos[1]);
            Lux.Scene.invalidate();
        }
        prev_mouse_pos = [ event.offsetX, event.offsetY ];
        opts.mousemove(event);
    }

    // FIXME mousewheel madness
    function mousewheel(event, delta, deltaX, deltaY) {
        internal_move(result.width/2-event.offsetX, event.offsetY-result.height/2);
	var new_value = Math.max(opts.widest_zoom, zoom.get() * (1.0 + deltaY/10));
        // var new_value = Math.max(opts.widest_zoom, zoom.get() * (1.0 + event.wheelDelta / 1200));
        zoom.set(new_value);
        internal_move(event.offsetX-result.width/2, result.height/2-event.offsetY);
        // opts.mousewheel(event);
        Lux.Scene.invalidate();
        return false;
    }

    function resize(w, h) {
        result.resize(w, h);
    }

    // implement transform stack inverse requirements
    var transform = function(appearance) {
        if (_.isUndefined(appearance.position))
            return appearance;
        var new_appearance = _.clone(appearance);
        new_appearance.position = result.project(new_appearance.position);
        return new_appearance;
    };
    transform.inverse = function(appearance) {
        if (_.isUndefined(appearance.position))
            return appearance;
        var new_appearance = _.clone(appearance);
        new_appearance.position = result.unproject(new_appearance.position);
        return new_appearance;
    };
    transform.inverse.inverse = transform;

    var result = {
        camera: camera,
        center: center,
        zoom: zoom,
        width: width,
        height: height,

        transform: transform,

        scene: Lux.scene({
            transform: transform
        }),

        project: function(pt) {
            return this.camera.project(pt);
        },

        unproject: function(pt) {
            return this.camera.unproject(pt);
        },

        resize: function(w, h) {
            aspect_ratio.set(w/h);
            this.width = w;
            this.height = h;
        },

        // Transitions between two projections using van Wijk and Nuij's scale-space geodesics
        // from "Smooth and Efficient zooming and panning", IEEE Infovis 2003.
        transition_to: function(new_center, new_zoom, seconds) {
            if (_.isUndefined(seconds))
                seconds = 3;
            new_zoom = 1.0 / new_zoom;
            var old_zoom = 1.0 / zoom.get(),
                old_center = center.get();
            var start = (new Date()).getTime() / 1000.0;
            var rho = 1.6;
            var direction = vec.minus(new_center, old_center);
            var d = vec.length(direction);

            if (d < 1e-6) {
                console.log("unimplemented"); 
                return;
            }

            var u = [0, d],
                w = [old_zoom, new_zoom],
                b = [(w[1] * w[1] - w[0] * w[0] + Math.pow(rho, 4) * Math.pow(u[1] - u[0], 2)) / (2 * w[0] * rho * rho * (u[1] - u[0])),
                     (w[1] * w[1] - w[0] * w[0] - Math.pow(rho, 4) * Math.pow(u[1] - u[0], 2)) / (2 * w[1] * rho * rho * (u[1] - u[0]))];
            var r = [Math.log(-b[0] + Math.sqrt(b[0] * b[0] + 1)),
                     Math.log(-b[1] + Math.sqrt(b[1] * b[1] + 1))];
            var S = (r[1] - r[0]) / rho;
            
            function cosh(x) {
                return 0.5 * (Math.exp(x) + Math.exp(-x));
            }
            function sinh(x) {
                return 0.5 * (Math.exp(x) - Math.exp(-x));
            }
            function tanh(x) {
                return sinh(x) / cosh(x);
            }

            var that = this;

            var ticker = Lux.Scene.animate(function() {
                var now = Date.now() / 1000.0;
                var s = (now - start) / seconds * S;
                var u_s = (w[0] / (rho * rho)) * (cosh(r[0]) * tanh(rho * s + r[0]) - sinh(r[0])) + u[0];
                var w_s = w[0] * cosh(r[0]) / cosh(rho * s + r[0]);
                var this_center = vec.plus(old_center, vec.scaling(direction, u_s / d));
                var this_zoom = w_s;
                that.center.set(this_center);
                that.zoom.set(1.0 / this_zoom);
                if (s >= S) {
                    that.center.set(new_center);
                    that.zoom.set(1.0 / new_zoom);
                    ticker.stop();
                    return;
                }
            });
        },

        events: {
            mousedown: mousedown,
            mouseup: mouseup,
            mousemove: mousemove,
            mousewheel: mousewheel,
            dblclick: dblclick,
            resize: resize
        }
    };

    return result;
};
/*
 * Shade is the javascript DSL for writing GLSL shaders, part of Lux.
 * 
 */

// FIXME: fix the constant-index-expression hack I've been using to get around
// restrictions. This will eventually be plugged by webgl implementors.

var Shade = function(exp)
{
    return Shade.make(exp);
};

Lux.Shade = Shade;

(function() {

Shade.debug = false;
/*
 * Shade.Debug contains code that helps with debugging Shade
   expressions, the Shade-to-GLSL compiler, etc.
 */
Shade.Debug = {};
/*
 * Shade.Debug.walk walks an expression dag and calls 'visit' on each
 * expression in a bottom-up order. The return values of 'visit' are
 * passed to the higher-level invocations of 'visit', and so is the
 * dictionary of references that is used to resolve multiple node
 * references. Shade.Debug.walk will only call 'visit' once per node,
 * even if visit can be reached by many different paths in the dag.
 * 
 * If 'revisit' is passed, then it is called every time a node is 
 * revisited. 
 * 
 * Shade.Debug.walk returns the dictionary of references.
 */

Shade.Debug.walk = function(exp, visit, revisit) {
    var refs = {};
    function internal_walk_no_revisit(node) {
        if (!_.isUndefined(refs[node.guid])) {
            return refs[node.guid];
        }
        var parent_results = _.map(node.parents, internal_walk_no_revisit);
        var result = visit(node, parent_results, refs);
        refs[node.guid] = result;
        return result;
    };
    function internal_walk_revisit(node) {
        if (!_.isUndefined(refs[node.guid])) {
            return revisit(node, _.map(node.parents, function(exp) {
                return refs[exp.guid];
            }), refs);
        }
        var parent_results = _.map(node.parents, internal_walk_revisit);
        var result = visit(node, parent_results, refs);
        refs[node.guid] = result;
        return result;
    }
    if (!_.isUndefined(revisit))
        internal_walk_revisit(exp);
    else
        internal_walk_no_revisit(exp);
    return refs;
};
/*
 * from_json produces a JSON object that satisfies the following property:
 * 
 * if j is a Shade expresssion,
 * 
 * Shade.Debug.from_json(f.json()) equals f, up to guid renaming
 */
Shade.Debug.from_json = function(json)
{
    var refs = {};
    function build_node(json_node) {
        var parent_nodes = _.map(json_node.parents, function(parent) {
            return refs[parent.guid];
        });
        switch (json_node.type) {
        case "constant": 
            return Shade.constant.apply(undefined, json_node.values);
        case "struct":
            return Shade.struct(_.build(_.zip(json_node.fields, json_node.parents)));
        case "parameter":
            return Shade.parameter(json_node.parameter_type);
        case "attribute":
            return Shade.attribute(json_node.attribute_type);
        case "varying":
            return Shade.varying(json_node.varying_name, json_node.varying_type);
        case "index":
            return parent_nodes[0].at(parent_nodes[1]);
        };

        // swizzle
        var m = json_node.type.match(/swizzle{(.+)}$/);
        if (m) return parent_nodes[0].swizzle(m[1]);

        // field
        m = json_node.type.match(/struct-accessor{(.+)}$/);
        if (m) return parent_nodes[0].field(m[1]);

        var f = Shade[json_node.type];
        if (_.isUndefined(f)) {
            throw new Error("from_json: unimplemented type '" + json_node.type + "'");
        }
        return f.apply(undefined, parent_nodes);
    }
    function walk_json(json_node) {
        if (json_node.type === 'reference')
            return refs[json_node.guid];
        _.each(json_node.parents, walk_json);
        var new_node = build_node(json_node);
        refs[json_node.guid] = new_node;
        return new_node;
    }
    return walk_json(json);
};
/*
 * Shade.Debug._json_builder is a helper function used internally by
 * the Shade infrastructure to build JSON objects through
 * Shade.Debug.walk visitors.
 * 
 */
Shade.Debug._json_builder = function(type, parent_reprs_fun) {
    parent_reprs_fun = parent_reprs_fun || function (i) { return i; };
    return function(parent_reprs, refs) {
        if (!_.isUndefined(refs[this.guid]))
            return { type: "reference",
                     guid: this.guid };
        else {
            var result = { type: type || this._json_key(),
                           guid: this.guid,
                           parents: parent_reprs };
            return parent_reprs_fun.call(this, result);
        }
    };
};
//////////////////////////////////////////////////////////////////////////////
// make converts objects which can be meaningfully interpreted as
// Exp values to the appropriate Exp values, giving us some poor-man
// static polymorphism

Shade.make = function(value)
{
    if (_.isUndefined(value)) {
        return undefined;
    }
    var t = Lux.type_of(value);
    if (t === 'string') {
        // Did you accidentally say exp1 + exp2 when you meant
        // exp1.add(exp2)?
        throw new Error("strings are not valid shade expressions");
    } else if (t === 'boolean' || t === 'number') {
        if (isNaN(value)) {
            // Did you accidentally say exp1 / exp2 or exp1 - exp2 when you meant
            // exp1.div(exp2) or exp1.sub(exp2)?
            throw new Error("nans are not valid in shade expressions");
        }
        return Shade.constant(value);
    } else if (t === 'array') {
        return Shade.seq(value);
    } else if (t === 'function') {
        /* lifts the passed function to a "shade function".
        
         In other words, this creates a function that replaces every
         passed parameter p by Shade.make(p) This way, we save a lot of
         typing and errors. If a javascript function is expected to
         take shade values and produce shade expressions as a result,
         simply wrap that function around a call to Shade.make()

         FIXME: Document js_evaluate appropriately. This is a cool feature!

         */

        var result = function() {
            var wrapped_arguments = [];
            for (var i=0; i<arguments.length; ++i) {
                wrapped_arguments.push(Shade.make(arguments[i]));
            }
            return Shade.make(value.apply(this, wrapped_arguments));
        };

        var args_type_cache = {};
        var create_parameterized_function = function(shade_function, types) {
            var parameters = _.map(types, function(t) {
                return Shade.parameter(t);
            });
            var expression = shade_function.apply(this, parameters);
            return function() {
                for (var i=0; i<arguments.length; ++i)
                    parameters[i].set(arguments[i]);
                return expression.evaluate();
            };
        };

        result.js_evaluate = function() {
            var args_types = [];
            var args_type_string;
            for (var i=0; i<arguments.length; ++i) {
                args_types.push(Shade.Types.type_of(arguments[i]));
            }
            args_type_string = _.map(args_types, function(t) { return t.repr(); }).join(",");
            if (_.isUndefined(args_type_cache[args_type_string]))
                args_type_cache[args_type_string] = create_parameterized_function(result, args_types);
            return args_type_cache[args_type_string].apply(result, arguments);
        };
        return result;
    }
    t = Shade.Types.type_of(value);
    if (t.is_vec() || t.is_mat()) {
        return Shade.constant(value);
    } else if (value._shade_type === 'attribute_buffer') {
        return Shade.attribute_from_buffer(value);
    } else if (value._shade_type === 'render_buffer') {
        return Shade.sampler2D_from_texture(value.texture);
    } else if (value._shade_type === 'texture') {
        return Shade.sampler2D_from_texture(value);
    } else if (t.equals(Shade.Types.other_t)) { // FIXME struct types 
        return Shade.struct(value);
    }

    return value;
};


// only memoizes on value of first argument, so will fail if function
// takes more than one argument!!
Shade.memoize_on_field = function(field_name, fun, key_fun)
{
    key_fun = key_fun || function(i) { return i; };
    return function() {
        if (_.isUndefined(this._caches[field_name])) {
            this._caches[field_name] = {};
        }
        if (_.isUndefined(this._caches[field_name][arguments[0]])) {
            this._caches[field_name][arguments[0]] = fun.apply(this, arguments);
        }
        return this._caches[field_name][arguments[0]];
    };
};
Shade.memoize_on_guid_dict = function(if_not_found) {
    function evaluate(cache) {
        if (_.isUndefined(cache))
            cache = {};
        var t = cache[this.guid];
        if (_.isUndefined(t)) {
            t = if_not_found.call(this, cache);
            cache[this.guid] = t;
        }
        return t;
    };
    return evaluate;
};
// Shade.unknown encodes a Shade expression whose value
// is not determinable at compile time.
//
// This is used only internally by the compiler

(function() {
    var obj = { _caches: {} };
    obj.fun = Shade.memoize_on_field("_cache", function(type) {
        return Shade._create_concrete_value_exp({
            parents: [],
            type: type,
            evaluate: function() { throw new Error("<unknown> does not support evaluation"); },
            value: function() { throw new Error("<unknown> should never get to compilation"); }
        });
    }, function(type) { 
        return type.repr();
    });
    Shade.unknown = function(type) {
        return obj.fun(type);
    };
})();
Shade.Camera = {};
Shade.Camera.perspective = function(opts)
{
    opts = _.defaults(opts || {}, {
        look_at: [Shade.vec(0, 0, 0), 
                  Shade.vec(0, 0, -1), 
                  Shade.vec(0, 1, 0)],
        field_of_view_y: 45,
        near_distance: 0.1,
        far_distance: 100
    });
    
    var field_of_view_y = opts.field_of_view_y;
    var near_distance = opts.near_distance;
    var far_distance = opts.far_distance;
    var aspect_ratio;
    if (opts.aspect_ratio)
        aspect_ratio = opts.aspect_ratio;
    else {
        var ctx = Lux._globals.ctx;
        if (_.isUndefined(ctx)) {
            throw new Error("aspect_ratio is only optional with an active Lux context");
        }
        // FIXME why is this not using parameters.width and parameters.height?
        aspect_ratio = ctx.viewportWidth / ctx.viewportHeight;
    }

    var view = Shade.look_at(opts.look_at[0], opts.look_at[1], opts.look_at[2]);
    var projection = Shade.perspective_matrix(field_of_view_y, aspect_ratio, near_distance, far_distance);
    var vp_parameter = Shade.mul(projection, view);
    var result = function(obj) {
        return result.project(obj);
    };
    result.project = function(model_vertex) {
        return vp_parameter.mul(model_vertex);
    };
    result.eye_vertex = function(model_vertex) {
        var t = model_vertex.type;
        return view.mul(model_vertex);
    };
    return result;
};
/*
 * FIXME Shade.Camera.ortho currently mixes a view matrix
 * with the projection matrix. This must be factored out.
 */

Shade.Camera.ortho = function(opts)
{
    opts = _.defaults(opts || {}, {
        left: -1,
        right: 1,
        bottom: -1,
        top: 1,
        near: -1,
        far: 1,
        center: Shade.vec(0,0),
        zoom: Shade(1)
    });

    var viewport_ratio;
    var ctx;
    if (opts.aspect_ratio)
        viewport_ratio = opts.aspect_ratio;
    else {
        ctx = Lux._globals.ctx;
        if (_.isUndefined(ctx)) {
            throw new Error("aspect_ratio is only optional with an active Lux context");
        }
        viewport_ratio = ctx.viewportWidth / ctx.viewportHeight;
    };

    var left, right, bottom, top;
    var near = opts.near;
    var far = opts.far;

    left = opts.left;
    right = opts.right;
    bottom = opts.bottom;
    top = opts.top;

    var view_ratio = Shade.sub(right, left).div(Shade.sub(top, bottom));
    var l_or_p = view_ratio.gt(viewport_ratio); // letterbox or pillarbox

    var cx = Shade.add(right, left).div(2);
    var cy = Shade.add(top, bottom).div(2);
    var half_width = Shade.sub(right, left).div(2);
    var half_height = Shade.sub(top, bottom).div(2);
    var corrected_half_width = half_height.mul(viewport_ratio);
    var corrected_half_height = half_width.div(viewport_ratio);

    var l = l_or_p.ifelse(left,  cx.sub(corrected_half_width));
    var r = l_or_p.ifelse(right, cx.add(corrected_half_width));
    var b = l_or_p.ifelse(cy.sub(corrected_half_height), bottom);
    var t = l_or_p.ifelse(cy.add(corrected_half_height), top);
    var m = Shade.ortho(l, r, b, t, near, far);

    function replace_xy_with(vec, new_vec) {
        if (vec.type === Shade.Types.vec2)
            return new_vec;
        else if (vec.type === Shade.Types.vec3)
            return Shade.vec(new_vec, vec.z());
        else if (vec.type === Shade.Types.vec4)
            return Shade.vec(new_vec, vec.swizzle("zw"));
        else
            throw new Error("Shade.ortho requires vec2, vec3, or vec4s");
    };

    var view_xform = Shade(function(model_vertex) {
        var new_v = model_vertex.swizzle("xy").sub(opts.center).mul(opts.zoom);
        return replace_xy_with(model_vertex, new_v);
    });
    var view_xform_invert = Shade(function(view_vertex) {
        var new_v = view_vertex.swizzle("xy").div(opts.zoom).add(opts.center);
        return replace_xy_with(view_vertex, new_v);
    });

    function result(obj) {
        return result.project(obj);
    }
    result.model_to_view = view_xform;
    result.view_to_device = function(view_vertex) {
        return m.mul(view_vertex);
    };
    result.project = function(model_vertex) {
        return m.mul(view_xform(model_vertex));
    };
    result.unproject = function(normalized_view_pos) {
        // var inv_m = Shade.Scale.linear({
        //     domain: [Shade.vec(-1,-1,-1),
        //              Shade.vec( 1, 1, 1)],
        //     range: [Shade.vec(l, b, near),
        //             Shade.vec(r, t, far)]});
        var inv_m = Shade.Scale.linear({
            domain: [Shade.vec(-1,-1),
                     Shade.vec( 1, 1)],
            range: [Shade.vec(l, b),
                    Shade.vec(r, t)]});
        return view_xform_invert(inv_m(normalized_view_pos));
        // var ctx = Lux._globals.ctx;
        // var screen_size = Shade.vec(ctx.parameters.width, ctx.parameters.height);
        // var view_vtx = min.add(max.sub(min).mul(screen_pos.div(screen_size)));
        // return view_xform_invert(view_vtx);
    };
    return result;
};
// Specifying colors in shade in an easier way

(function() {

var css_colors = {
    "aliceblue":            "#F0F8FF",
    "antiquewhite":         "#FAEBD7",
    "aqua":                 "#00FFFF",
    "aquamarine":           "#7FFFD4",
    "azure":                "#F0FFFF",
    "beige":                "#F5F5DC",
    "bisque":               "#FFE4C4",
    "black":                "#000000",
    "blanchedalmond":       "#FFEBCD",
    "blue":                 "#0000FF",
    "blueviolet":           "#8A2BE2",
    "brown":                "#A52A2A",
    "burlywood":            "#DEB887",
    "cadetblue":            "#5F9EA0",
    "chartreuse":           "#7FFF00",
    "chocolate":            "#D2691E",
    "coral":                "#FF7F50",
    "cornflowerblue":       "#6495ED",
    "cornsilk":             "#FFF8DC",
    "crimson":              "#DC143C",
    "cyan":                 "#00FFFF",
    "darkblue":             "#00008B",
    "darkcyan":             "#008B8B",
    "darkgoldenrod":        "#B8860B",
    "darkgray":             "#A9A9A9",
    "darkgrey":             "#A9A9A9",
    "darkgreen":            "#006400",
    "darkkhaki":            "#BDB76B",
    "darkmagenta":          "#8B008B",
    "darkolivegreen":       "#556B2F",
    "darkorange":           "#FF8C00",
    "darkorchid":           "#9932CC",
    "darkred":              "#8B0000",
    "darksalmon":           "#E9967A",
    "darkseagreen":         "#8FBC8F",
    "darkslateblue":        "#483D8B",
    "darkslategray":        "#2F4F4F",
    "darkslategrey":        "#2F4F4F",
    "darkturquoise":        "#00CED1",
    "darkviolet":           "#9400D3",
    "deeppink":             "#FF1493",
    "deepskyblue":          "#00BFFF",
    "dimgray":              "#696969",
    "dimgrey":              "#696969",
    "dodgerblue":           "#1E90FF",
    "firebrick":            "#B22222",
    "floralwhite":          "#FFFAF0",
    "forestgreen":          "#228B22",
    "fuchsia":              "#FF00FF",
    "gainsboro":            "#DCDCDC",
    "ghostwhite":           "#F8F8FF",
    "gold":                 "#FFD700",
    "goldenrod":            "#DAA520",
    "gray":                 "#808080",
    "grey":                 "#808080",
    "green":                "#008000",
    "greenyellow":          "#ADFF2F",
    "honeydew":             "#F0FFF0",
    "hotpink":              "#FF69B4",
    "indianred":            "#CD5C5C",
    "indigo":               "#4B0082",
    "ivory":                "#FFFFF0",
    "khaki":                "#F0E68C",
    "lavender":             "#E6E6FA",
    "lavenderblush":        "#FFF0F5",
    "lawngreen":            "#7CFC00",
    "lemonchiffon":         "#FFFACD",
    "lightblue":            "#ADD8E6",
    "lightcoral":           "#F08080",
    "lightcyan":            "#E0FFFF",
    "lightgoldenrodyellow": "#FAFAD2",
    "lightgray":            "#D3D3D3",
    "lightgrey":            "#D3D3D3",
    "lightgreen":           "#90EE90",
    "lightpink":            "#FFB6C1",
    "lightsalmon":          "#FFA07A",
    "lightseagreen":        "#20B2AA",
    "lightskyblue":         "#87CEFA",
    "lightslategray":       "#778899",
    "lightslategrey":       "#778899",
    "lightsteelblue":       "#B0C4DE",
    "lightyellow":          "#FFFFE0",
    "lime":                 "#00FF00",
    "limegreen":            "#32CD32",
    "linen":                "#FAF0E6",
    "magenta":              "#FF00FF",
    "maroon":               "#800000",
    "mediumaquamarine":     "#66CDAA",
    "mediumblue":           "#0000CD",
    "mediumorchid":         "#BA55D3",
    "mediumpurple":         "#9370D8",
    "mediumseagreen":       "#3CB371",
    "mediumslateblue":      "#7B68EE",
    "mediumspringgreen":    "#00FA9A",
    "mediumturquoise":      "#48D1CC",
    "mediumvioletred":      "#C71585",
    "midnightblue":         "#191970",
    "mintcream":            "#F5FFFA",
    "mistyrose":            "#FFE4E1",
    "moccasin":             "#FFE4B5",
    "navajowhite":          "#FFDEAD",
    "navy":                 "#000080",
    "oldlace":              "#FDF5E6",
    "olive":                "#808000",
    "olivedrab":            "#6B8E23",
    "orange":               "#FFA500",
    "orangered":            "#FF4500",
    "orchid":               "#DA70D6",
    "palegoldenrod":        "#EEE8AA",
    "palegreen":            "#98FB98",
    "paleturquoise":        "#AFEEEE",
    "palevioletred":        "#D87093",
    "papayawhip":           "#FFEFD5",
    "peachpuff":            "#FFDAB9",
    "peru":                 "#CD853F",
    "pink":                 "#FFC0CB",
    "plum":                 "#DDA0DD",
    "powderblue":           "#B0E0E6",
    "purple":               "#800080",
    "red":                  "#FF0000",
    "rosybrown":            "#BC8F8F",
    "royalblue":            "#4169E1",
    "saddlebrown":          "#8B4513",
    "salmon":               "#FA8072",
    "sandybrown":           "#F4A460",
    "seagreen":             "#2E8B57",
    "seashell":             "#FFF5EE",
    "sienna":               "#A0522D",
    "silver":               "#C0C0C0",
    "skyblue":              "#87CEEB",
    "slateblue":            "#6A5ACD",
    "slategray":            "#708090",
    "slategrey":            "#708090",
    "snow":                 "#FFFAFA",
    "springgreen":          "#00FF7F",
    "steelblue":            "#4682B4",
    "tan":                  "#D2B48C",
    "teal":                 "#008080",
    "thistle":              "#D8BFD8",
    "tomato":               "#FF6347",
    "turquoise":            "#40E0D0",
    "violet":               "#EE82EE",
    "wheat":                "#F5DEB3",
    "white":                "#FFFFFF",
    "whitesmoke":           "#F5F5F5",
    "yellow":               "#FFFF00",
    "yellowgreen":          "#9ACD32"
};

var rgb_re = / *rgb *\( *(\d+) *, *(\d+) *, *(\d+) *\) */;
Shade.color = function(spec, alpha)
{
    if (_.isUndefined(alpha))
        alpha = 1;
    if (spec[0] === '#') {
        if (spec.length === 4) {
            return Shade.vec(parseInt(spec[1], 16) / 15,
                             parseInt(spec[2], 16) / 15,
                             parseInt(spec[3], 16) / 15, alpha);
        } else if (spec.length == 7) {
            return Shade.vec(parseInt(spec.substr(1,2), 16) / 255,
                             parseInt(spec.substr(3,2), 16) / 255,
                             parseInt(spec.substr(5,2), 16) / 255, alpha);
        } else
            throw new Error("hex specifier must be either #rgb or #rrggbb");
    }
    var m = rgb_re.exec(spec);
    if (m) {
        return Shade.vec(parseInt(m[1], 10) / 255,
                         parseInt(m[2], 10) / 255,
                         parseInt(m[3], 10) / 255, alpha);
    }
    if (spec in css_colors)
        return Shade.color(css_colors[spec], alpha);
    throw new Error("unrecognized color specifier " + spec);
};
}());
/*
 A range expression represents a finite stream of values. 

 It is meant
 to be an abstraction over looping, and provides a few ways to combine values.

 Currently the only operations supported are plain stream
 transformations (like "map") and fold (like "reduce").

 It should be possible to add, at the very least, "filter", "scan", and "firstWhich".

 nb: nested loops will require deep changes to the infrastructure, and
 won't be supported for a while.

 Currently, looping is fairly untested.
*/

(function() {

Shade.loop_variable = function(type, force_no_declare)
{
    return Shade._create_concrete_exp({
        parents: [],
        type: type,
        expression_type: "loop_variable",
        glsl_expression: function() {
            return this.glsl_name;
        },
        compile: function(ctx) {
            if (_.isUndefined(force_no_declare))
                ctx.global_scope.add_declaration(type.declare(this.glsl_name));
        },
        loop_variable_dependencies: Shade.memoize_on_field("_loop_variable_dependencies", function () {
            return [this];
        }),
        evaluate: function() {
            throw new Error("evaluate undefined for loop_variable");
        }
    });
};

function BasicRange(range_begin, range_end, value, condition, termination)
{
    this.begin = Shade.make(range_begin).as_int();
    this.end = Shade.make(range_end).as_int();
    this.value = value || function(index) { return index; };
    this.condition = condition || function() { return Shade.make(true); };
    this.termination = termination || function() { return Shade.make(false); };
};

Shade.range = function(range_begin, range_end, value, condition, termination)
{
    return new BasicRange(range_begin, range_end, value, condition, termination);
};

BasicRange.prototype.transform = function(xform)
{
    var that = this;
    return Shade.range(
        this.begin,
        this.end,
        function (i) {
            var input = that.value(i);
            var result = xform(input, i);
            return result;
        },
        this.condition,
        this.termination
    );
};

BasicRange.prototype.filter = function(new_condition)
{
    var that = this;
    return Shade.range(
        this.begin,
        this.end,
        this.value,
        function (value, i) {
            var old_condition = that.condition(value, i);
            var result = Shade.and(old_condition, new_condition(value, i));
            return result;
        },
        this.termination
    );
};

BasicRange.prototype.break_if = function(new_termination)
{
    var that = this;
    return Shade.range(
        this.begin,
        this.end,
        this.value,
        this.condition,
        function (value, i) {
            var old_termination = that.termination(value, i);
            var result = Shade.or(old_termination, new_termination(value, i));
            return result;
        }
    );
};

BasicRange.prototype.fold = Shade(function(operation, starting_value)
{
    var index_variable = Shade.loop_variable(Shade.Types.int_t, true);
    var accumulator_value = Shade.loop_variable(starting_value.type, true);
    var element_value = this.value(index_variable);
    var condition_value = this.condition(element_value, index_variable);
    var termination_value = this.termination(element_value, index_variable);
    var result_type = accumulator_value.type;
    var operation_value = operation(accumulator_value, element_value);
    // FIXME: instead of refusing to compile, we should transform
    // violating expressions to a transformed index variable loop 
    // with a termination condition
    if (!this.begin.is_constant())
        throw new Error("WebGL restricts loop index variable initialization to be constant");
    if (!this.end.is_constant())
        throw new Error("WebGL restricts loop index termination check to be constant");

    var result = Shade._create_concrete_exp({
        has_scope: true,
        patch_scope: function() {
            var index_variable = this.parents[2];
            var accumulator_value = this.parents[3];
            var element_value = this.parents[4];
            var operation_value = this.parents[6];
            var condition_value = this.parents[7];
            var termination_value = this.parents[8];
            var that = this;

            function patch_internal(exp) {
                _.each(exp.sorted_sub_expressions(), function(node) {
                    if (_.any(node.loop_variable_dependencies(), function(dep) {
                        return dep.glsl_name === index_variable.glsl_name ||
                            dep.glsl_name === accumulator_value.glsl_name;
                    })) {
                        node.scope = that.scope;
                    };
                });
            }

            _.each([element_value, operation_value, condition_value, termination_value], patch_internal);
        },
        parents: [this.begin, this.end, 
                  index_variable, accumulator_value, element_value,
                  starting_value, operation_value,
                  condition_value, termination_value
                 ],
        type: result_type,
        element: Shade.memoize_on_field("_element", function(i) {
            if (this.type.is_pod()) {
                if (i === 0)
                    return this;
                else
                    throw new Error(this.type.repr() + " is an atomic type");
            } else
                return this.at(i);
        }),
        loop_variable_dependencies: Shade.memoize_on_field("_loop_variable_dependencies", function () {
            return [];
        }),
        compile: function(ctx) {
            var beg = this.parents[0];
            var end = this.parents[1];
            var index_variable = this.parents[2];
            var accumulator_value = this.parents[3];
            var element_value = this.parents[4];
            var starting_value = this.parents[5];
            var operation_value = this.parents[6];
            var condition = this.parents[7];
            var termination = this.parents[8];
            var must_evaluate_condition = !(condition.is_constant() && (condition.constant_value() === true));
            var must_evaluate_termination = !(termination.is_constant() && (termination.constant_value() === false));

            ctx.global_scope.add_declaration(accumulator_value.type.declare(accumulator_value.glsl_name));
            ctx.strings.push(this.type.repr(), this.glsl_name, "() {\n");
            ctx.strings.push("    ",accumulator_value.glsl_name, "=", starting_value.glsl_expression(), ";\n");

            ctx.strings.push("    for (int",
                             index_variable.glsl_expression(),"=",beg.glsl_expression(),";",
                             index_variable.glsl_expression(),"<",end.glsl_expression(),";",
                             "++",index_variable.glsl_expression(),") {\n");

            _.each(this.scope.declarations, function(exp) {
                ctx.strings.push("        ", exp, ";\n");
            });
            if (must_evaluate_condition) {
                ctx.strings.push("      if (", condition.glsl_expression(), ") {\n");
            }
            _.each(this.scope.initializations, function(exp) {
                ctx.strings.push("        ", exp, ";\n");
            });
            ctx.strings.push("        ",
                             accumulator_value.glsl_expression(),"=",
                             operation_value.glsl_expression() + ";\n");
            if (must_evaluate_termination) {
                ctx.strings.push("        if (", termination.glsl_expression(), ") break;\n");
            }
            if (must_evaluate_condition) {
                ctx.strings.push("      }\n");
            }
            ctx.strings.push("    }\n");
            ctx.strings.push("    return", accumulator_value.glsl_expression(), ";\n");
            ctx.strings.push("}\n");

            if (this.children_count > 1) {
                this.precomputed_value_glsl_name = ctx.request_fresh_glsl_name();
                ctx.global_scope.add_declaration(this.type.declare(this.precomputed_value_glsl_name));
                ctx.global_scope.add_initialization(this.precomputed_value_glsl_name + " = " + this.glsl_name + "()");
            }
        },
        glsl_expression: function() {
            if (this.children_count > 1) {
                return this.precomputed_value_glsl_name;
            } else {
                return this.glsl_name + "()";
            }
        },
        evaluate: function() {
            throw new Error("evaluate currently undefined for looping expressions");
        }
    });

    return result;
});

//////////////////////////////////////////////////////////////////////////////

BasicRange.prototype.sum = function()
{
    var this_begin_v = this.value(this.begin);

    return this.fold(Shade.add, this_begin_v.type.zero);
};

BasicRange.prototype.max = function()
{
    var this_begin_v = this.value(this.begin);
    return this.fold(Shade.max, this_begin_v.type.minus_infinity);
};

BasicRange.prototype.average = function()
{
    // special-case average when we know the total number of samples in advance
    // 
    // this is ugly, but how could I make it better?
    var s = this.sum();
    if ((s.parents[7].is_constant() &&
         s.parents[7].constant_value() === true) &&
        (s.parents[8].is_constant() &&
         s.parents[8].constant_value() === false)) {
        if (s.type.equals(Shade.Types.int_t)) s = s.as_float();
        return s.div(this.end.sub(this.begin).as_float());
    } else {
        var xf = this.transform(function(v) {
            return Shade({
                s1: 1,
                sx: v
            });
        });
        var sum_result = xf.sum();
        var sx = sum_result("sx");
        if (sx.type.equals(Shade.Types.int_t)) {
            sx = sx.as_float();
        }
        return sx.div(sum_result("s1"));
    }
};

Shade.locate = Shade(function(accessor, target, left, right, nsteps)
{
    function halfway(a, b) { return a.as_float().add(b.as_float()).div(2).as_int(); };

    nsteps = nsteps || right.sub(left).log2().ceil();
    var base = Shade.range(0, nsteps);
    var mid = halfway(left, right);
    var initial_state = Shade({
        l: left.as_int(),
        r: right.as_int(),
        m: mid.as_int(),
        vl: accessor(left),
        vr: accessor(right),
        vm: accessor(mid)
    });
    return base.fold(function(state, i) {
        var right_nm = halfway(state("m"), state("r"));
        var left_nm = halfway(state("l"), state("m"));
        return state("vm").lt(target).ifelse(Shade({
            l: state("m"), vl: state("vm"),
            m: right_nm,   vm: accessor(right_nm),
            r: state("r"), vr: state("vr")
        }), Shade({
            l: state("l"), vl: state("vl"),
            m: left_nm,    vm: accessor(left_nm),
            r: state("m"), vr: state("vm")
        }));
    }, initial_state);
});

})();
Shade.unique_name = function() {
    var counter = 0;
    return function() {
        counter = counter + 1;
        return "_unique_name_" + counter;
    };
}();
//////////////////////////////////////////////////////////////////////////////
// roll-your-own prototypal inheritance

Shade._create = (function() {
    var guid = 0;
    return function(base_type, new_obj)
    {
        // function F() {
        //     for (var key in new_obj) {
        //         this[key] = new_obj[key];
        //     }
        //     this.guid = "GUID_" + guid;

        //     // this is where memoize_on_field stashes results. putting
        //     // them all in a single member variable makes it easy to
        //     // create a clean prototype
        //     this._caches = {};

        //     guid += 1;
        // }
        // F.prototype = base_type;
        // return new F();

        var result = function() {
            return result.call_operator.apply(result, _.toArray(arguments));
        };

        for (var key in new_obj) {
            result[key] = new_obj[key];
        }
        result.guid = guid;

        // this is where memoize_on_field stashes results. putting
        // them all in a single member variable makes it easy to
        // create a clean prototype
        result._caches = {};

        guid += 1;
        result.__proto__ = base_type;
        return result;
    };
})();

Shade._create_concrete = function(base, requirements)
{
    function create_it(new_obj) {
        for (var i=0; i<requirements.length; ++i) {
            var field = requirements[i];
            if (!(field in new_obj)) {
                throw new Error("new expression missing " + requirements[i]);
            }
            if (_.isUndefined(new_obj[field])) {
                throw new Error("field '" + field + "' cannot be undefined");
            }
        }
        return Shade._create(base, new_obj);
    }
    return create_it;
};
Shade.Types = {};
// Shade.Types.type_of implements the following spec:
// 
// for all shade values s such that s.evaluate() equals v,
// s.type.equals(Shade.Types.type_of(v))

// In addition, if there is no s such that s.evaluate() equals v,
// then Shade.Types.type_of returns other_t. That's a kludge,
// but is convenient.
Shade.Types.type_of = function(v)
{
    var t = typeof v;
    if (t === "boolean") {
        return Shade.Types.bool_t;
    } else if (t === "number") {
        return Shade.Types.float_t;
    } else if (Lux.is_shade_expression(v)) {
        return Shade.Types.shade_t;
    } else if (_.isUndefined(v)) {
        return Shade.Types.undefined_t;
    } else if (!_.isUndefined(v.buffer) && v.buffer._type) {
        return Shade.Types[v.buffer._type];
    } else {
        return Shade.Types.other_t;
    }
};
// <rant> How I wish I had algebraic data types. </rant>
Shade.Types.base_t = {
    is_floating: function() { return false; },
    is_integral: function() { return false; },
    is_array: function()    { return false; },
    // POD = plain old data (ints, bools, floats)
    is_pod: function()      { return false; },
    is_vec: function()      { return false; },
    is_mat: function()      { return false; },
    vec_dimension: function() { 
        throw new Error("is_vec() === false, cannot call vec_dimension");
    },
    is_function: function() { return false; },
    is_struct:   function() { return false; },
    is_sampler:  function() { return false; },
    equals: function(other) {
        if (_.isUndefined(other))
            throw new Error("type cannot be compared to undefined");
        return this.repr() == other.repr();
    },
    swizzle: function(pattern) {
        throw new Error("type '" + this.repr() + "' does not support swizzling");
    },
    element_type: function(i) {
        throw new Error("invalid call: atomic expression");
    },
    declare: function(glsl_name) {
        return this.repr() + " " + glsl_name;
    }
    // repr
    // 
    // for arrays:
    //   array_base
    //   array_size
    // 
    // for function types:
    //   function_return_type
    //   function_parameter
    //   function_parameter_count
    // 
    // for structs:
    //   fields

    // value_equals
    //   value_equals is a function that takes two parameters as produced
    //   by the constant_value() or evaluate() method of an object with
    //   the given type, and tests their equality.
};
(function() {

function is_valid_basic_type(repr) {
    if (repr === 'float') return true;
    if (repr === 'int') return true;
    if (repr === 'bool') return true;
    if (repr === 'void') return true;
    if (repr === 'sampler2D') return true;
    if (repr.substring(0, 3) === 'mat' &&
        (Number(repr[3]) > 1 && 
         Number(repr[3]) < 5)) return true;
    if (repr.substring(0, 3) === 'vec' &&
        (Number(repr[3]) > 1 && 
         Number(repr[3]) < 5)) return true;
    if (repr.substring(0, 4) === 'bvec' &&
        (Number(repr[4]) > 1 && 
         Number(repr[4]) < 5)) return true;
    if (repr.substring(0, 4) === 'ivec' &&
        (Number(repr[4]) > 1 && 
         Number(repr[4]) < 5)) return true;
    // if (repr === '__auto__') return true;
    return false;
}

Shade.Types.basic = function(repr) {
    if (!is_valid_basic_type(repr)) {
        throw new Error("invalid basic type '" + repr + "'");
    }
    return Shade.Types[repr];
};

Shade.Types._create_basic = function(repr) { 
    return Shade._create(Shade.Types.base_t, {
        declare: function(glsl_name) { return repr + " " + glsl_name; },
        repr: function() { return repr; },
        swizzle: function(pattern) {
            if (!this.is_vec()) {
                throw new Error("swizzle requires a vec");
            }
            var base_repr = this.repr();
            var base_size = Number(base_repr[base_repr.length-1]);

            var valid_re, group_res;
            switch (base_size) {
            case 2:
                valid_re = /[rgxyst]+/;
                group_res = [ /[rg]/, /[xy]/, /[st]/ ];
                break;
            case 3:
                valid_re = /[rgbxyzstp]+/;
                group_res = [ /[rgb]/, /[xyz]/, /[stp]/ ];
                break;
            case 4:
                valid_re = /[rgbaxyzwstpq]+/;
                group_res = [ /[rgba]/, /[xyzw]/, /[stpq]/ ];
                break;
            default:
                throw new Error("internal error on swizzle");
            }
            if (!pattern.match(valid_re)) {
                throw new Error("invalid swizzle pattern '" + pattern + "'");
            }
            var count = 0;
            for (var i=0; i<group_res.length; ++i) {
                if (pattern.match(group_res[i])) count += 1;
            }
            if (count != 1) {
                throw new Error("swizzle pattern '" + pattern + 
                       "' belongs to more than one group");
            }
            if (pattern.length === 1) {
                return this.array_base();
            } else {
                var type_str = base_repr.substring(0, base_repr.length-1) + pattern.length;
                return Shade.Types[type_str];
            }
        },
        is_pod: function() {
            var repr = this.repr();
            return ["float", "bool", "int"].indexOf(repr) !== -1;
        },
        is_vec: function() {
            var repr = this.repr();
            if (repr.substring(0, 3) === "vec")
                return true;
            if (repr.substring(0, 4) === "ivec")
                return true;
            if (repr.substring(0, 4) === "bvec")
                return true;
            return false;
        },
        is_mat: function() {
            var repr = this.repr();
            if (repr.substring(0, 3) === "mat")
                return true;
            return false;
        },
        vec_dimension: function() {
            var repr = this.repr();
            if (repr.substring(0, 3) === "vec")
                return parseInt(repr[3], 10);
            if (repr.substring(0, 4) === "ivec" ||
                repr.substring(0, 4) === "bvec")
                return parseInt(repr[4], 10);
            if (this.repr() === 'float'
                || this.repr() === 'int'
                || this.repr() === 'bool')
                // This is convenient: assuming vec_dimension() === 1 for POD 
                // lets me pretend floats, ints and bools are vec1, ivec1 and bvec1.
                // 
                // However, this might have
                // other bad consequences I have not thought of.
                //
                // For example, I cannot make float_t.is_vec() be true, because
                // this would allow sizzling from a float, which GLSL disallows.
                return 1;
            if (!this.is_vec()) {
                throw new Error("is_vec() === false, cannot call vec_dimension");
            }
            throw new Error("internal error");
        },
        is_array: function() {
            var repr = this.repr();
            if (repr.substring(0, 3) === "mat")
                return true;
            if (this.is_vec())
                return true;
            return false;
        },
        array_base: function() {
            var repr = this.repr();
            if (repr.substring(0, 3) === "mat")
                return Shade.Types["vec" + repr[3]];
            if (repr.substring(0, 3) === "vec")
                return Shade.Types.float_t;
            if (repr.substring(0, 4) === "bvec")
                return Shade.Types.bool_t;
            if (repr.substring(0, 4) === "ivec")
                return Shade.Types.int_t;
            if (repr === "float")
                return Shade.Types.float_t;
            throw new Error("datatype not array");
        },
        size_for_vec_constructor: function() {
            var repr = this.repr();
            if (this.is_array())
                return this.array_size();
            if (repr === 'float' ||
                repr === 'bool' ||
                repr === 'int')
                return 1;
            throw new Error("not usable inside vec constructor");
        },
        array_size: function() {
            if (this.is_vec())
                return this.vec_dimension();
            var repr = this.repr();
            if (repr.substring(0, 3) === "mat")  
                return parseInt(repr[3], 10);
            throw new Error("datatype not array");
        },
        is_floating: function() {
            var repr = this.repr();
            if (repr === "float")
                return true;
            if (repr.substring(0, 3) === "vec")
                return true;
            if (repr.substring(0, 3) === "mat")
                return true;
            return false;
        },
        is_integral: function() {
            var repr = this.repr();
            if (repr === "int")
                return true;
            if (repr.substring(0, 4) === "ivec")
                return true;
            return false;
        },
        is_sampler: function() {
            var repr = this.repr();
            if (repr === 'sampler2D')
                return true;
            return false;
        },
        element_type: function(i) {
            if (this.is_pod()) {
                if (i === 0)
                    return this;
                else
                    throw new Error("invalid call: " + this.repr() + " is atomic");
            } else if (this.is_vec()) {
                var f = this.repr()[0];
                var d = this.array_size();
                if (i < 0 || i >= d) {
                    throw new Error("invalid call: " + this.repr() + 
                                    " has no element " + i);
                }
                if (f === 'v')
                    return Shade.Types.float_t;
                else if (f === 'b')
                    return Shade.Types.bool_t;
                else if (f === 'i')
                    return Shade.Types.int_t;
                else
                    throw new Error("internal error");
            } else
                // FIXME implement this
                throw new Error("unimplemented for mats");
        },
        value_equals: function(v1, v2) {
            if (this.is_pod())
                return v1 === v2;
            if (this.is_vec())
                return vec.equal(v1, v2);
            if (this.is_mat())
                return mat.equal(v1, v2);
            throw new Error("bad type for equality comparison: " + this.repr());
        }
    });
};

})();
Shade.Types.array = function(base_type, size) {
    return Shade._create(Shade.Types.base_t, {
        is_array: function() { return true; },
        declare: function(glsl_name) {
            return base_type.declare(glsl_name) + "[" + size + "]";
        },
        repr: function() {
            return base_type.repr() + "[" + size + "]";
        },
        array_size: function() {
            return size;
        },
        array_base: function() {
            return base_type;
        }
    });
};
Shade.Types.function_t = function(return_type, param_types) {
    return Shade._create(Shade.Types.base_t, {
        repr: function() {
            return "(" + return_type.repr() + ")("
                + ", ".join(param_types.map(function (o) { 
                    return o.repr(); 
                }));
        },
        is_function: function() {
            return true;
        },
        function_return_type: function() {
            return return_type;
        },
        function_parameter: function(i) {
            return param_types[i];
        },
        function_parameter_count: function() {
            return param_types.length;
        }
    });
};
(function() {

    var simple_types = 
        ["mat2", "mat3", "mat4",
         "vec2", "vec3", "vec4",
         "ivec2", "ivec3", "ivec4",
         "bvec2", "bvec3", "bvec4"];

    for (var i=0; i<simple_types.length; ++i) {
        Shade.Types[simple_types[i]] = Shade.Types._create_basic(simple_types[i]);
    }

    Shade.Types.float_t   = Shade.Types._create_basic('float');
    Shade.Types.bool_t    = Shade.Types._create_basic('bool');
    Shade.Types.int_t     = Shade.Types._create_basic('int');

    Shade.Types.sampler2D = Shade.Types._create_basic('sampler2D');
    Shade.Types.void_t    = Shade.Types._create_basic('void');

    // create aliases so that x === y.repr() implies Shade.Types[x] === y
    Shade.Types["float"] = Shade.Types.float_t;
    Shade.Types["bool"]  = Shade.Types.bool_t;
    Shade.Types["int"]   = Shade.Types.int_t;
    Shade.Types["void"]  = Shade.Types.void_t;

    // represents other "non-constant" types. kludgy, but hey.
    Shade.Types.undefined_t = Shade.Types._create_basic('<undefined>');
    Shade.Types.shade_t     = Shade.Types._create_basic('<shade>');
    Shade.Types.other_t     = Shade.Types._create_basic('<other>');
})();
(function () {

var _structs = {};

function _register_struct(type) {
    var t = type._struct_key;
    var v = _structs[t];
    if (v !== undefined) {
        throw new Error("type " + t + " already registered as " + v.internal_type_name);
    }
    _structs[t] = type;
};

var struct_key = function(obj) {
    return _.map(obj, function(value, key) {
        if (value.is_function()) {
            throw new Error("function types not allowed inside struct");
        }
        if (value.is_sampler()) {
            throw new Error("sampler types not allowed inside struct");
        }
        if (value.is_struct()) {
            return "[" + key + ":" + value.internal_type_name + "]";
        }
        return "[" + key + ":" + value.repr() + "]";
    }).sort().join("");
};

function field_indices(obj) {
    var lst = _.map(obj, function(value, key) {
        return [key, value.repr()];
    });
    return lst.sort(function(v1, v2) {
        if (v1[0] < v2[0]) return -1;
        if (v1[0] > v2[0]) return 1;
        if (v1[1] < v2[1]) return -1;
        if (v1[1] > v2[1]) return 1;
        return 0;
    });
};

Shade.Types.struct = function(fields) {
    var key = struct_key(fields);
    var t = _structs[key];
    if (t) return t;
    var field_index = {};
    _.each(field_indices(fields), function(v, i) {
        field_index[v[0]] = i;
    });
    var result = Shade._create(Shade.Types.struct_t, {
        fields: fields,
        field_index: field_index,
        _struct_key: key
    });
    result.internal_type_name = 'type_' + result.guid;
    _register_struct(result);

    _.each(["zero", "infinity", "minus_infinity"], function(value) {
        if (_.all(fields, function(v, k) { return !_.isUndefined(v[value]); })) {
            var c = {};
            _.each(fields, function(v, k) {
                c[k] = v[value];
            });
            result[value] = Shade.struct(c);
        }
    });

    return result;
};

Shade.Types.struct_t = Shade._create(Shade.Types.base_t, {
    is_struct: function() { return true; },
    repr: function() { return this.internal_type_name; }
});

})();
Shade.VERTEX_PROGRAM_COMPILE = 1;
Shade.FRAGMENT_PROGRAM_COMPILE = 2;
Shade.UNSET_PROGRAM_COMPILE = 3;

function new_scope()
{
    return {
        declarations: [],
        initializations: [],
        enclosing_scope: undefined,
        
        // make all declarations 
        // global since names are unique anyway
        add_declaration: function(exp) {
            // this.declarations.push(exp);
            this.enclosing_scope.add_declaration(exp);
        },
        add_initialization: function(exp) {
            this.initializations.push(exp);
        },
        show: function() {
            return "(Scope decls " 
                + String(this.declarations)
                + " inits "
                + String(this.initializations)
                + " enclosing "
                + this.enclosing_scope.show()
                + " )";
        }
    };
};

Shade.CompilationContext = function(compile_type)
{
    return {
        freshest_glsl_name: 0,
        compile_type: compile_type || Shade.UNSET_PROGRAM_COMPILE,
        float_precision: "highp",
        strings: [],
        global_decls: [],
        declarations: { uniform: {},
                        attribute: {},
                        varying: {}
                      },
        declared_struct_types: {},
        // min_version: -1,
        source: function() {
            return this.strings.join(" ");
        },
        request_fresh_glsl_name: function() {
            var int_name = this.freshest_glsl_name++;
            return "glsl_name_" + int_name;
        },
        declare: function(decltype, glsl_name, type, declmap) {
            if (_.isUndefined(type)) {
                throw new Error("must define type");
            }
            if (!(glsl_name in declmap)) {
                declmap[glsl_name] = type;
                this.strings.push(decltype + " " + type.declare(glsl_name) + ";\n");
            } else {
                var existing_type = declmap[glsl_name];
                if (!existing_type.equals(type)) {
                    throw new Error("compile error: different expressions use "
                           + "conflicting types for '" + decltype + " " + glsl_name
                           + "': '" + existing_type.repr() + "', '"
                           + type.repr() + "'");
                }
            }
        },
        declare_uniform: function(glsl_name, type) {
            this.declare("uniform", glsl_name, type, this.declarations.uniform);
        },
        declare_varying: function(glsl_name, type) {
            this.declare("varying", glsl_name, type, this.declarations.varying);
        },
        declare_attribute: function(glsl_name, type) {
            this.declare("attribute", glsl_name, type, this.declarations.attribute);
        },
        declare_struct: function(type) {
            var that = this;
            if (!_.isUndefined(this.declared_struct_types[type.internal_type_name]))
                return;
            _.each(type.fields, function(v) {
                if (v.is_struct() && 
                    _.isUndefined(this.declared_struct_types[type.internal_type_name])) {
                    throw new Error("internal error; declare_struct found undeclared internal struct");
                }
            });
            this.global_decls.push("struct", type.internal_type_name, "{\n");
            var internal_decls = [];
            _.each(type.field_index, function(i, k) {
                internal_decls[i] = type.fields[k].declare(k);
            });
            _.each(internal_decls, function(v) {
                that.global_decls.push("    ",v, ";\n");
            });
            this.global_decls.push("};\n");
            this.declared_struct_types[type.internal_type_name] = true;
        },
        compile: function(fun) {
            var that = this;
            this.global_decls = [];

            this.global_scope = {
                initializations: [],
                add_declaration: function(exp) {
                    that.global_decls.push(exp, ";\n");
                },
                add_initialization: function(exp) {
                    this.initializations.push(exp);
                },
                show: function() {
                    return "(Global scope)";
                }
            };

            var topo_sort = fun.sorted_sub_expressions();
            var i;
            var p = this.strings.push;
            _.each(topo_sort, function(n) {
                n.children_count = 0;
                n.is_unconditional = false;
                n.glsl_name = that.request_fresh_glsl_name();
                n.set_requirements(this);
                if (n.type.is_struct()) {
                    that.declare_struct(n.type);
                }
                for (var j=0; j<n.parents.length; ++j) {
                    n.parents[j].children_count++;
                    // adds base scope to objects which have them.
                    // FIXME currently all scope objects point directly to global scope
                    n.scope = n.has_scope ? new_scope() : that.global_scope;
                }
            });
            // top-level node is always unconditional.
            topo_sort[topo_sort.length-1].is_unconditional = true;
            // top-level node has global scope.
            topo_sort[topo_sort.length-1].scope = this.global_scope;
            i = topo_sort.length;
            while (i--) {
                var n = topo_sort[i];
                n.propagate_conditions();
                for (var j=0; j<n.parents.length; ++j) {
                    if (n.parents[j].has_scope)
                        n.parents[j].scope.enclosing_scope = n.scope;
                }
                n.patch_scope();
            }
            for (i=0; i<topo_sort.length; ++i) {
                topo_sort[i].compile(this);
            }

            var args = [0, 0];
            args.push.apply(args, this.global_decls);
            this.strings.splice.apply(this.strings, args);
            this.strings.splice(0, 0, "precision",this.float_precision,"float;\n");
            this.strings.splice(0, 0, "#extension GL_OES_standard_derivatives : enable\n");
            this.strings.push("void main() {\n");
            _.each(this.global_scope.initializations, function(exp) {
                that.strings.push("    ", exp, ";\n");
            });
            this.strings.push("    ", fun.glsl_expression(), ";\n", "}\n");
            // for (i=0; i<this.initialization_exprs.length; ++i)
            //     this.strings.push("    ", this.initialization_exprs[i], ";\n");
            // this.strings.push("    ", fun.glsl_expression(), ";\n", "}\n");
        },
        add_initialization: function(expr) {
            this.global_scope.initializations.push(expr);
        },
        value_function: function() {
            var that = this;
            this.strings.push(arguments[0].type.repr(),
                              arguments[0].glsl_name,
                              "(");
            _.each(arguments[0].loop_variable_dependencies(), function(exp, i) {
                if (i > 0)
                    that.strings.push(',');
                that.strings.push('int', exp.glsl_name);
            });
            this.strings.push(") {\n",
                              "    return ");
            for (var i=1; i<arguments.length; ++i) {
                this.strings.push(arguments[i]);
            }
            this.strings.push(";\n}\n");
        },
        void_function: function() {
            this.strings.push("void",
                              arguments[0].glsl_name,
                              "() {\n",
                              "    ");
            for (var i=1; i<arguments.length; ++i) {
                this.strings.push(arguments[i]);
            }
            this.strings.push(";\n}\n");
        }
    };
};
Shade.Exp = {
    glsl_expression: function() {
        return this.glsl_name + "()";
    },
    parent_is_unconditional: function(i) {
        return true;
    },
    propagate_conditions: function() {
        // the condition for an execution of a node is the
        // disjunction of the conjunction of all its children and their respective
        // edge conditions
        for (var i=0; i<this.parents.length; ++i)
            this.parents[i].is_unconditional = (
                this.parents[i].is_unconditional ||
                    (this.is_unconditional && 
                     this.parent_is_unconditional(i)));

    },
    set_requirements: function() {},

    // returns all sub-expressions in topologically-sorted order
    sorted_sub_expressions: Shade.memoize_on_field("_sorted_sub_expressions", function() {
        var so_far = [];
        var visited_guids = [];
        var topological_sort_internal = function(exp) {
            var guid = exp.guid;
            if (visited_guids[guid]) {
                return;
            }
            var parents = exp.parents;
            var i = parents.length;
            while (i--) {
                topological_sort_internal(parents[i]);
            }
            so_far.push(exp);
            visited_guids[guid] = true;
        };
        topological_sort_internal(this);
        return so_far;
    }),

    //////////////////////////////////////////////////////////////////////////
    // javascript-side evaluation of Shade expressions

    evaluate: function() {
        throw new Error("internal error: evaluate undefined for " + this.expression_type);
    },
    is_constant: function() {
        return false;
    },
    constant_value: Shade.memoize_on_field("_constant_value", function() {
        if (!this.is_constant())
            throw new Error("constant_value called on non-constant expression");
        return this.evaluate();
    }),
    element_is_constant: function(i) {
        return false;
    },
    element_constant_value: function(i) {
        throw new Error("invalid call: no constant elements");
    },

    //////////////////////////////////////////////////////////////////////////
    // element access for compound expressions

    element: function(i) {
        // FIXME. Why doesn't this check for is_pod and use this.at()?
        throw new Error("invalid call: atomic expression");
    },

    //////////////////////////////////////////////////////////////////////////
    // some sugar

    add: function(op) {
        return Shade.add(this, op);
    },
    mul: function(op) {
        return Shade.mul(this, op);
    },
    div: function(op) {
        return Shade.div(this, op);
    },
    mod: function(op) {
        return Shade.mod(this, op);
    },
    sub: function(op) {
        return Shade.sub(this, op);
    },
    norm: function() {
        return Shade.norm(this);
    },
    distance: function(other) {
        return Shade.distance(this, other);
    },
    dot: function(other) {
        return Shade.dot(this, other);
    },
    cross: function(other) {
        return Shade.cross(this, other);
    },
    normalize: function() {
        return Shade.normalize(this);
    },
    reflect: function(other) {
        return Shade.reflect(this, other);
    },
    refract: function(o1, o2) {
        return Shade.refract(this, o1, o2);
    },
    texture2D: function(coords) {
        return Shade.texture2D(this, coords);
    },
    clamp: function(mn, mx) {
        return Shade.clamp(this, mn, mx);
    },
    min: function(other) {
        return Shade.min(this, other);
    },
    max: function(other) {
        return Shade.max(this, other);
    },

    per_vertex: function() {
        return Shade.per_vertex(this);
    },
    discard_if: function(condition) {
        return Shade.discard_if(this, condition);
    },

    // overload this to overload exp(foo)
    call_operator: function() {
        if (this.type.is_struct()) {
            return this.field(arguments[0]);
        }
        return this.mul.apply(this, arguments);
    },

    // all sugar for funcs_1op is defined later on in the source

    //////////////////////////////////////////////////////////////////////////

    as_int: function() {
        if (this.type.equals(Shade.Types.int_t))
            return this;
        var parent = this;
        return Shade._create_concrete_value_exp({
            parents: [parent],
            type: Shade.Types.int_t,
            value: function() { return "int(" + this.parents[0].glsl_expression() + ")"; },
            is_constant: function() { return this.parents[0].is_constant(); },
            evaluate: Shade.memoize_on_guid_dict(function(cache) {
                var v = this.parents[0].evaluate(cache);
                return Math.floor(v);
            }),
            expression_type: "cast(int)"
        });
    },
    as_bool: function() {
        if (this.type.equals(Shade.Types.bool_t))
            return this;
        var parent = this;
        return Shade._create_concrete_value_exp({
            parents: [parent],
            type: Shade.Types.bool_t,
            value: function() { return "bool(" + this.parents[0].glsl_expression() + ")"; },
            is_constant: function() { return this.parents[0].is_constant(); },
            evaluate: Shade.memoize_on_guid_dict(function(cache) {
                var v = this.parents[0].evaluate(cache);
                return ~~v;
            }),
            expression_type: "cast(bool)"
        });
    },
    as_float: function() {
        if (this.type.equals(Shade.Types.float_t))
            return this;
        var parent = this;
        return Shade._create_concrete_value_exp({
            parents: [parent],
            type: Shade.Types.float_t,
            value: function() { return "float(" + this.parents[0].glsl_expression() + ")"; },
            is_constant: function() { return this.parents[0].is_constant(); },
            evaluate: Shade.memoize_on_guid_dict(function(cache) {
                var v = this.parents[0].evaluate(cache);
                return Number(v);
            }),
            expression_type: "cast(float)"
        });
    },
    swizzle: function(pattern) {
        function swizzle_pattern_to_indices(pattern) {
            function to_index(v) {
                switch (v.toLowerCase()) {
                case 'r': return 0;
                case 'g': return 1;
                case 'b': return 2;
                case 'a': return 3;
                case 'x': return 0;
                case 'y': return 1;
                case 'z': return 2;
                case 'w': return 3;
                case 's': return 0;
                case 't': return 1;
                case 'p': return 2;
                case 'q': return 3;
                default: throw new Error("invalid swizzle pattern");
                }
            }
            var result = [];
            for (var i=0; i<pattern.length; ++i) {
                result.push(to_index(pattern[i]));
            }
            return result;
        }
        
        var parent = this;
        var indices = swizzle_pattern_to_indices(pattern);
        return Shade._create_concrete_exp( {
            parents: [parent],
            type: parent.type.swizzle(pattern),
            expression_type: "swizzle{" + pattern + "}",
            glsl_expression: function() {
                if (this._must_be_function_call)
                    return this.glsl_name + "()";
                else
                    return this.parents[0].glsl_expression() + "." + pattern; 
            },
            is_constant: Shade.memoize_on_field("_is_constant", function () {
                var that = this;
                return _.all(indices, function(i) {
                    return that.parents[0].element_is_constant(i);
                });
            }),
            constant_value: Shade.memoize_on_field("_constant_value", function() {
                var that = this;
                var ar = _.map(indices, function(i) {
                    return that.parents[0].element_constant_value(i);
                });
                if (ar.length === 1)
                    return ar[0];
                var d = this.type.vec_dimension();
                var ctor = vec[d];
                if (_.isUndefined(ctor))
                    throw new Error("bad vec dimension " + d);
                return ctor.make(ar);
            }),
            evaluate: Shade.memoize_on_guid_dict(function(cache) {
                if (this.is_constant())
                    return this.constant_value();
                if (this.type.is_pod()) {
                    return this.parents[0].element(indices[0]).evaluate(cache);
                } else {
                    var that = this;
                    var ar = _.map(indices, function(index) {
                        return that.parents[0].element(index).evaluate(cache);
                    });
                    var d = this.type.vec_dimension();
                    var ctor = vec[d];
                    if (_.isUndefined(ctor))
                        throw new Error("bad vec dimension " + d);
                    return ctor.make(ar);
                }
            }),
            element: function(i) {
                return this.parents[0].element(indices[i]);
            },
            element_is_constant: Shade.memoize_on_field("_element_is_constant", function(i) {
                return this.parents[0].element_is_constant(indices[i]);
            }),
            element_constant_value: Shade.memoize_on_field("_element_constant_value", function(i) {
                return this.parents[0].element_constant_value(indices[i]);
            }),
            compile: function(ctx) {
                if (this._must_be_function_call) {
                    this.precomputed_value_glsl_name = ctx.request_fresh_glsl_name();
                    ctx.strings.push(this.type.declare(this.precomputed_value_glsl_name), ";\n");
                    ctx.add_initialization(this.precomputed_value_glsl_name + " = " + 
                                           this.parents[0].glsl_expression() + "." + pattern);
                    ctx.value_function(this, this.precomputed_value_glsl_name);
                }
            }
        });
    },
    at: function(index) {
        var parent = this;
        index = Shade.make(index);
        // this "works around" current constant index restrictions in webgl
        // look for it to get broken in the future as this hole is plugged.
        index._must_be_function_call = true;
        if (!index.type.equals(Shade.Types.float_t) &&
            !index.type.equals(Shade.Types.int_t)) {
            throw new Error("at expects int or float, got '" + 
                            index.type.repr() + "' instead");
        }
        return Shade._create_concrete_exp( {
            parents: [parent, index],
            type: parent.type.array_base(),
            expression_type: "index",
            glsl_expression: function() {
                if (this.parents[1].type.is_integral()) {
                    return this.parents[0].glsl_expression() + 
                        "[" + this.parents[1].glsl_expression() + "]"; 
                } else {
                    return this.parents[0].glsl_expression() + 
                        "[int(" + this.parents[1].glsl_expression() + ")]"; 
                }
            },
            is_constant: function() {
                if (!this.parents[1].is_constant())
                    return false;
                var ix = Math.floor(this.parents[1].constant_value());
                return (this.parents[1].is_constant() &&
                        this.parents[0].element_is_constant(ix));
            },
            evaluate: Shade.memoize_on_guid_dict(function(cache) {
                var ix = Math.floor(this.parents[1].evaluate(cache));
                var parent_value = this.parents[0].evaluate();
                return parent_value[ix];
                // return this.parents[0].element(ix).evaluate(cache);
            }),

            element: Shade.memoize_on_field("_element", function(i) {
                // FIXME I suspect that a bug here might still arise
                // out of some interaction between the two conditions
                // described below. The right fix will require rewriting the whole
                // constant-folding system :) so it will be a while.

                var array = this.parents[0], 
                    index = this.parents[1];

                if (!index.is_constant()) {
                    // If index is not constant, then we use the following equation:
                    // element(Array(a_1 .. a_n).at(ix), i) ==
                    // Array(element(a_1, i) .. element(a_n, i)).at(ix)
                    var elts = _.map(array.parents, function(parent) {
                        return parent.element(i);
                    });
                    return Shade.array(elts).at(index);
                }
                var index_value = this.parents[1].constant_value();
                var x = this.parents[0].element(index_value);

                // the reason for the (if x === this) checks here is that sometimes
                // the only appropriate description of an element() of an
                // opaque object (uniforms and attributes, notably) is an at() call.
                // This means that (this.parents[0].element(ix) === this) is
                // sometimes true, and we're stuck in an infinite loop.
                if (x === this) {
                    return x.at(i);
                } else
                    return x.element(i);
            }),
            element_is_constant: Shade.memoize_on_field("_element_is_constant", function(i) {
                if (!this.parents[1].is_constant()) {
                    return false;
                }
                var ix = this.parents[1].constant_value();
                var x = this.parents[0].element(ix);
                if (x === this) {
                    return false;
                } else
                    return x.element_is_constant(i);
            }),
            element_constant_value: Shade.memoize_on_field("_element_constant_value", function(i) {
                var ix = this.parents[1].constant_value();
                var x = this.parents[0].element(ix);
                if (x === this) {
                    throw new Error("internal error: would have gone into an infinite loop here.");
                }
                return x.element_constant_value(i);
            }),
            compile: function() {}
        });
    },
    field: function(field_name) {
        if (!this.type.is_struct()) {
            throw new Error("field() only valid on struct types");
        }
        var index = this.type.field_index[field_name];
        if (_.isUndefined(index)) {
            throw new Error("field " + field_name + " not existent");
        }

        return Shade._create_concrete_value_exp({
            parents: [this],
            type: this.type.fields[field_name],
            expression_type: "struct-accessor{" + field_name + "}",
            value: function() {
                return "(" + this.parents[0].glsl_expression() + "." + field_name + ")";
            },
            evaluate: Shade.memoize_on_guid_dict(function(cache) {
                var struct_value = this.parents[0].evaluate(cache);
                return struct_value[field_name];
            }),
            is_constant: Shade.memoize_on_field("_is_constant", function() {
                // this is conservative for many situations, but hey.
                return this.parents[0].is_constant();
            }),
            element: function(i) {
                return this.at(i);
            }
        });
    },
    _lux_expression: true, // used by Lux.type_of
    expression_type: "other",
    _uniforms: [],

    //////////////////////////////////////////////////////////////////////////

    attribute_buffers: function() {
        return _.flatten(this.sorted_sub_expressions().map(function(v) { 
            return v.expression_type === 'attribute' ? [v] : [];
        }));
    },
    uniforms: function() {
        return _.flatten(this.sorted_sub_expressions().map(function(v) { 
            return v._uniforms; 
        }));
    },

    //////////////////////////////////////////////////////////////////////////
    // simple re-writing of shaders, useful for moving expressions
    // around, such as the things we move around when attributes are 
    // referenced in fragment programs
    // 
    // NB: it's easy to create bad expressions with these.
    //
    // The general rule is that types should be preserved (although
    // that might not *always* be the case)
    find_if: function(check) {
        return _.select(this.sorted_sub_expressions(), check);
    },

    replace_if: function(check, replacement) {
        // this code is not particularly clear, but this is a compiler
        // hot-path, bear with me.
        var subexprs = this.sorted_sub_expressions();
        var replaced_pairs = {};
        function parent_replacement(x) {
            if (!(x.guid in replaced_pairs)) {
                return x;
            } else
                return replaced_pairs[x.guid];
        }
        var latest_replacement, replaced;
        for (var i=0; i<subexprs.length; ++i) {
            var exp = subexprs[i];
            if (check(exp)) {
                latest_replacement = replacement(exp);
                replaced_pairs[exp.guid] = latest_replacement;
            } else {
                replaced = false;
                for (var j=0; j<exp.parents.length; ++j) {
                    if (exp.parents[j].guid in replaced_pairs) {
                        latest_replacement = Shade._create(exp, {
                            parents: _.map(exp.parents, parent_replacement)
                        });
                        replaced_pairs[exp.guid] = latest_replacement;
                        replaced = true;
                        break;
                    }
                }
                if (!replaced) {
                    latest_replacement = exp;
                }
            }
        }
        return latest_replacement;
    },

    //////////////////////////////////////////////////////////////////////////
    // debugging infrastructure

    json: function() {
        function helper_f(node, parents, refs) { return node._json_helper(parents, refs); };
        var refs = Shade.Debug.walk(this, helper_f, helper_f);
        return refs[this.guid];
    },
    _json_helper: Shade.Debug._json_builder(),    
    _json_key: function() { return this.expression_type; },
    
    debug_print: function(do_what) {
        var lst = [];
        var refs = {};
        function _debug_print(which, indent) {
            var i;
            var str = new Array(indent+2).join(" "); // This is python's '" " * indent'
            // var str = "";
            // for (var i=0; i<indent; ++i) { str = str + ' '; }
            if (which.parents.length === 0) 
                lst.push(str + "[" + which.expression_type + ":" + which.guid + "]"
                            // + "[is_constant: " + which.is_constant() + "]"
                            + " ()");
            else {
                lst.push(str + "[" + which.expression_type + ":" + which.guid + "]"
                            // + "[is_constant: " + which.is_constant() + "]"
                            + " (");
                for (i=0; i<which.parents.length; ++i) {
                    if (refs[which.parents[i].guid])
                        lst.push(str + "  {{" + which.parents[i].guid + "}}");
                    else {
                        _debug_print(which.parents[i], indent + 2);
                        refs[which.parents[i].guid] = 1;
                    }
                }
                lst.push(str + ')');
            }
        };
        _debug_print(this, 0);
        do_what = do_what || function(l) {
            return l.join("\n");
        };
        return do_what(lst);
    },

    locate: function(predicate) {
        var sub_exprs = this.sorted_sub_expressions();
        for (var i=0; i<sub_exprs.length; ++i) {
            if (predicate(sub_exprs[i]))
                return sub_exprs[i];
        }
        return undefined;
    },

    //////////////////////////////////////////////////////////////////////////
    // fields
    
    // if stage is "vertex" then this expression will be hoisted to the vertex shader
    stage: null,

    // if has_scope is true, then the expression has its own scope
    // (like for-loops)
    has_scope: false,
    patch_scope: function () {},
    loop_variable_dependencies: Shade.memoize_on_field("_loop_variable_dependencies", function () {
        var parent_deps = _.map(this.parents, function(v) {
            return v.loop_variable_dependencies();
        });
        if (parent_deps.length === 0)
            return [];
        else {
            var result_with_duplicates = parent_deps[0].concat.apply(parent_deps[0], parent_deps.slice(1));
            var guids = [];
            var result = [];
            _.each(result_with_duplicates, function(n) {
                if (!guids[n.guid]) {
                    guids[n.guid] = true;
                    result.push(n);
                }
            });
            return result;
        }
    })
};

_.each(["r", "g", "b", "a",
        "x", "y", "z", "w",
        "s", "t", "p", "q"], function(v) {
            Shade.Exp[v] = function() {
                return this.swizzle(v);
            };
        });

Shade._create_concrete_exp = Shade._create_concrete(Shade.Exp, ["parents", "compile", "type"]);
/*
 * FIXME the webgl compiler seems to be having trouble with the
 * conditional expressions in longer shaders.  Temporarily, then, I
 * will replace all "unconditional" checks with "true". The end effect
 * is that the shader always evaluates potentially unused sides of a
 * conditional expression if they're used in two or more places in
 * the shader.
 */

Shade.ValueExp = Shade._create(Shade.Exp, {
    is_constant: Shade.memoize_on_field("_is_constant", function() {
        return _.all(this.parents, function(v) {
            return v.is_constant();
        });
    }),
    element_is_constant: Shade.memoize_on_field("_element_is_constant", function(i) {
        return this.is_constant();
    }),
    element_constant_value: Shade.memoize_on_field("_element_constant_value", function (i) {
        return this.element(i).constant_value();
    }),
    _must_be_function_call: false,
    glsl_expression: function() {
        var unconditional = true; // see comment on top
        if (this._must_be_function_call) {
            return this.glsl_name + "(" + _.map(this.loop_variable_dependencies(), function(exp) {
                return exp.glsl_name;
            }).join(",") + ")";
        }
        // this.children_count will be undefined if object was built
        // during compilation (lifted operators for structs will do that, for example)
        if (_.isUndefined(this.children_count) || this.children_count <= 1)
            return this.value();
        if (unconditional)
            return this.precomputed_value_glsl_name;
        else
            return this.glsl_name + "()";
    },
    // For types which are not POD, element(i) returns a Shade expression
    // whose value is equivalent to evaluating the i-th element of the
    // expression itself. for example:
    // Shade.add(vec1, vec2).element(0) -> Shade.add(vec1.element(0), vec2.element(0));
    element: function(i) {
        if (this.type.is_pod()) {
            if (i === 0)
                return this;
            else
                throw new Error(this.type.repr() + " is an atomic type, got this: " + i);
        } else {
            this.debug_print();
            throw new Error("Internal error; this should have been overriden.");
        }
    },
    compile: function(ctx) {
        var unconditional = true; // see comment on top
        if (this._must_be_function_call) {
            if (unconditional) {
                if (this.children_count > 1) {
                    this.precomputed_value_glsl_name = ctx.request_fresh_glsl_name();
                    this.scope.add_declaration(this.type.declare(this.precomputed_value_glsl_name));
                    this.scope.add_initialization(this.precomputed_value_glsl_name + " = " + this.value());
                    ctx.value_function(this, this.precomputed_value_glsl_name);
                } else {
                    ctx.value_function(this, this.value());
                }
            } else {
                if (this.children_count > 1) {
                    this.precomputed_value_glsl_name = ctx.request_fresh_glsl_name();
                    this.has_precomputed_value_glsl_name = ctx.request_fresh_glsl_name();
                    this.scope.add_declaration(this.type.declare(this.precomputed_value_glsl_name));
                    this.scope.add_declaration(Shade.Types.bool_t.declare(this.has_precomputed_value_glsl_name));
                    this.scope.add_initialization(this.has_precomputed_value_glsl_name + " = false");

                    ctx.value_function(this, "(" + this.has_precomputed_value_glsl_name + "?"
                                       + this.precomputed_value_glsl_name + ": (("
                                       + this.has_precomputed_value_glsl_name + "=true),("
                                       + this.precomputed_value_glsl_name + "="
                                       + this.value() + ")))");
                } else
                    ctx.value_function(this, this.value());
            }
        } else {
            if (unconditional) {
                if (this.children_count > 1) {
                    this.precomputed_value_glsl_name = ctx.request_fresh_glsl_name();
                    this.scope.add_declaration(this.type.declare(this.precomputed_value_glsl_name));
                    this.scope.add_initialization(this.precomputed_value_glsl_name + " = " + this.value());
                } else {
                    // don't emit anything, all is taken care by glsl_expression()
                }
            } else {
                if (this.children_count > 1) {
                    this.precomputed_value_glsl_name = ctx.request_fresh_glsl_name();
                    this.has_precomputed_value_glsl_name = ctx.request_fresh_glsl_name();
                    this.scope.add_declaration(this.type.declare(this.precomputed_value_glsl_name));
                    this.scope.add_declaration(Shade.Types.bool_t.declare(this.has_precomputed_value_glsl_name));
                    this.scope.add_initialization(this.has_precomputed_value_glsl_name + " = false");
                    ctx.value_function(this, "(" + this.has_precomputed_value_glsl_name + "?"
                                       + this.precomputed_value_glsl_name + ": (("
                                       + this.has_precomputed_value_glsl_name + "=true),("
                                       + this.precomputed_value_glsl_name + "="
                                       + this.value() + ")))");
                } else {
                    // don't emit anything, all is taken care by glsl_expression()
                }
            }
        }
    }, call_operator: function(other) {
        return this.mul(other);
    }
});
Shade._create_concrete_value_exp = Shade._create_concrete(Shade.ValueExp, ["parents", "type", "value"]);
Shade.swizzle = function(exp, pattern)
{
    return Shade(exp).swizzle(pattern);
};
// Shade.constant creates a constant value in the Shade language.
// 
// This value can be one of:
// - a single float: 
//    Shade.constant(1)
//    Shade.constant(3.0, Shade.Types.float_t)
// - a single integer:
//    Shade.constant(1, Shade.Types.int_t)
// - a boolean:
//    Shade.constant(false);
// - a GLSL vec2, vec3 or vec4 (of floating point values):
//    Shade.constant(2, vec.make([1, 2]));
// - a GLSL matrix of dimensions 2x2, 3x3, 4x4 (Lux currently does not support GLSL rectangular matrices):
//    Shade.constant(2, mat.make([1, 0, 0, 1]));
// - an array
// - a struct

Shade.constant = function(v, type)
{
    var mat_length_to_dimension = {16: 4, 9: 3, 4: 2, 1: 1};

    var constant_tuple_fun = function(type, args)
    {
        function to_glsl(type, args) {
            // this seems incredibly ugly, but we need something
            // like it, so that numbers are appropriately promoted to floats
            // in GLSL's syntax.

            var string_args = _.map(args, function(arg) {
                var v = String(arg);
                if (Lux.type_of(arg) === "number" && v.indexOf(".") === -1) {
                    return v + ".0";
                } else
                    return v;
            });
            return type + '(' + _.toArray(string_args).join(', ') + ')';
        }

        function matrix_row(i) {
            var sz = type.array_size();
            var result = [];
            for (var j=0; j<sz; ++j) {
                result.push(args[i + j*sz]);
            }
            return result;
        }

        return Shade._create_concrete_exp( {
            glsl_expression: function(glsl_name) {
                return to_glsl(this.type.repr(), args);
            },
            expression_type: "constant{" + args + "}",
            is_constant: function() { return true; },
            element: Shade.memoize_on_field("_element", function(i) {
                if (this.type.is_pod()) {
                    if (i === 0)
                        return this;
                    else
                        throw new Error(this.type.repr() + " is an atomic type, got this: " + i);
                } else if (this.type.is_vec()) {
                    return Shade.constant(args[i]);
                } else {
                    return Shade.vec.apply(matrix_row(i));
                }
            }),
            element_is_constant: function(i) {
                return true;
            },
            element_constant_value: Shade.memoize_on_field("_element_constant_value", function(i) {
                if (this.type.equals(Shade.Types.float_t)) {
                    if (i === 0)
                        return args[0];
                    else
                        throw new Error("float is an atomic type");
                } if (this.type.is_vec()) {
                    return args[i];
                }
                return vec[this.type.array_size()].make(matrix_row(i));
            }),
            evaluate: Shade.memoize_on_guid_dict(function(cache) {
                // FIXME boolean_vector
                if (this.type.is_pod())
                    return args[0];
                if (this.type.equals(Shade.Types.vec2) ||
                    this.type.equals(Shade.Types.vec3) ||
                    this.type.equals(Shade.Types.vec4))
                    return vec[args.length].make(args);
                if (this.type.equals(Shade.Types.mat2) ||
                    this.type.equals(Shade.Types.mat3) ||
                    this.type.equals(Shade.Types.mat4))
                    return mat[mat_length_to_dimension[args.length]].make(args);
                else
                    throw new Error("internal error: constant of unknown type");
            }),
            compile: function(ctx) {},
            parents: [],
            type: type,

            //////////////////////////////////////////////////////////////////
            // debugging

            _json_helper: Shade.Debug._json_builder("constant", function(obj) {
                obj.values = args;
                return obj;
            })
        });
    };

    // FIXME refactor this since type_of result is now a Shade.Types.*
    var t = Shade.Types.type_of(v);
    var d, computed_t;
    if (t.equals(Shade.Types.float_t)) {
        if (type && !(type.equals(Shade.Types.float_t) ||
                      type.equals(Shade.Types.int_t))) {
            throw new Error("expected specified type for numbers to be float or int," +
                   " got " + type.repr() + " instead.");
        }
        return constant_tuple_fun(type || Shade.Types.float_t, [v]);
    } else if (t.equals(Shade.Types.bool_t)) {
        if (type && !type.equals(Shade.Types.bool_t))
            throw new Error("boolean constants cannot be interpreted as " + 
                   type.repr());
        return constant_tuple_fun(Shade.Types.bool_t, [v]);
    } else if (t.repr().substr(0,3) === 'vec') {
        d = v.length;
        if (d < 2 && d > 4)
            throw new Error("invalid length for constant vector: " + v);
        var el_ts = _.map(v, function(t) { return Lux.type_of(t); });
        if (!_.all(el_ts, function(t) { return t === el_ts[0]; })) {
            throw new Error("not all constant params have the same types");
        }
        if (el_ts[0] === "number") {
            computed_t = Shade.Types['vec' + d];
            if (type && !computed_t.equals(type)) {
                throw new Error("passed constant must have type " + computed_t.repr()
                    + ", but was request to have incompatible type " 
                    + type.repr());
            }
            return constant_tuple_fun(computed_t, v);
        }
        else
            throw new Error("bad datatype for constant: " + el_ts[0]);
    } else if (t.repr().substr(0,3) === 'mat') {
        d = mat_length_to_dimension[v.length];
        computed_t = Shade.Types['mat' + d];
        if (type && !computed_t.equals(type)) {
            throw new Error("passed constant must have type " + computed_t.repr()
                            + ", but was requested to have incompatible type " 
                            + type.repr());
        }
        return constant_tuple_fun(computed_t, v);
    } else if (type.is_struct()) {
        var obj = {};
        _.each(v, function(val, k) {
            obj[k] = Shade.constant(val, type.fields[k]);
        });
        return Shade.struct(obj);
    } else {
        throw new Error("type error: constant should be bool, number, vector, matrix, array or struct. got " + t
                        + " instead");
    }
    throw new Error("internal error: Shade.Types.type_of returned bogus value");
};

Shade.as_int = function(v) { return Shade.make(v).as_int(); };
Shade.as_bool = function(v) { return Shade.make(v).as_bool(); };
Shade.as_float = function(v) { return Shade.make(v).as_float(); };

// Shade.array denotes an array of Lux values of the same type:
//    Shade.array([2, 3, 4, 5, 6]);

Shade.array = function(v)
{
    var t = Lux.type_of(v);
    if (t !== 'array')
        throw new Error("type error: need array");

    var new_v = v.map(Shade.make);
    var array_size = new_v.length;
    if (array_size === 0) {
        throw new Error("array constant must be non-empty");
    }

    var new_types = new_v.map(function(t) { return t.type; });
    var array_type = Shade.Types.array(new_types[0], array_size);
    if (_.any(new_types, function(t) { return !t.equals(new_types[0]); })) {
        throw new Error("array elements must have identical types");
    }
    return Shade._create_concrete_exp( {
        parents: new_v,
        type: array_type,
        array_element_type: new_types[0],
        expression_type: "constant", // FIXME: is there a reason this is not "array"?

        evaluate: Shade.memoize_on_guid_dict(function(cache) {
            return _.map(this.parents, function(e) {
                return e.evaluate(cache);
            });
        }),
        
        glsl_expression: function() { return this.glsl_name; },
        compile: function (ctx) {
            this.array_initializer_glsl_name = ctx.request_fresh_glsl_name();
            ctx.strings.push(this.type.declare(this.glsl_name), ";\n");
            ctx.strings.push("void", this.array_initializer_glsl_name, "(void) {\n");
            for (var i=0; i<this.parents.length; ++i) {
                ctx.strings.push("    ", this.glsl_name, "[", i, "] =",
                                 this.parents[i].glsl_expression(), ";\n");
            }
            ctx.strings.push("}\n");
            ctx.add_initialization(this.array_initializer_glsl_name + "()");
        },
        is_constant: function() { return false; }, 
        element: function(i) {
            return this.parents[i];
        },
        element_is_constant: function(i) {
            return this.parents[i].is_constant();
        },
        element_constant_value: function(i) {
            return this.parents[i].constant_value();
        },
        locate: function(target, xform) {
            var that = this;
            xform = xform || function(x) { return x; };
            return Shade.locate(function(i) { return xform(that.at(i.as_int())); }, target, 0, array_size-1);
        },

        _json_key: function() { return "array"; }
    });
};
// Shade.struct denotes a heterogeneous structure of Shade values:
//   Shade.struct({foo: Shade.vec(1,2,3), bar: Shade.struct({baz: 1, bah: false})});

Shade.struct = function(obj)
{
    var vs = _.map(obj, function(v) { return Shade.make(v); });
    var ks = _.keys(obj);
    var types = _.map(vs, function(v) { return v.type; });
    var t = {};
    _.each(ks, function(k, i) {
        t[k] = types[i];
    });
    var struct_type = Shade.Types.struct(t), new_vs = [], new_ks = [];

    // javascript object order is arbitrary;
    // make sure structs follow the type field order, which is unique
    _.each(struct_type.field_index, function(index, key) {
        var old_index = ks.indexOf(key);
        new_vs[index] = vs[old_index];
        new_ks[index] = key;
    });
    vs = new_vs;
    ks = new_ks;
    
    var result = Shade._create_concrete_value_exp({
        parents: vs,
        fields: ks,
        type: struct_type,
        expression_type: "struct",
        value: function() {
            return [this.type.internal_type_name, "(",
                    this.parents.map(function(t) {
                        return t.glsl_expression();
                    }).join(", "),
                    ")"].join(" ");
        },
        evaluate: Shade.memoize_on_guid_dict(function(cache) {
            var result = {};
            var that = this;
            _.each(this.parents, function(v, i) {
                result[that.fields[i]] = v.evaluate(cache);
            });
            return result;
        }),
        field: function(field_name) {
            var index = this.type.field_index[field_name];
            if (_.isUndefined(index)) {
                throw new Error("field " + field_name + " not existent");
            }

            /* Since field_name is always an immediate string, 
             it will never need to be "computed" on a shader.            
             This means that in this case, its value can always
             be resolved in compile time and 
             val(constructor(foo=bar).foo) is always val(bar).
             */

            return this.parents[index];
        },
        call_operator: function(v) {
            return this.field(v);
        },
        _json_helper: Shade.Debug._json_builder("struct", function(obj) {
            obj.fields = ks;
            return obj;
        })
    });

    // _.each(ks, function(k) {
    //     // I can't use _.has because result is actually a javascript function..
    //     if (!_.isUndefined(result[k])) {
    //         console.log("Warning: Field",k,"is reserved. JS struct notation (a.b) will not be usable");
    //     } else
    //         result[k] = result.field(k);
    // });
    return result;
};

/* Shade.set is essentially an internal method for Shade. Don't use it
   unless you know exactly what you're doing.
 */

Shade.set = function(exp, name)
{
    exp = Shade(exp);
    var type = exp.type;
    return Shade._create_concrete_exp({
        expression_type: "set",
        compile: function(ctx) {
            if ((name === "gl_FragColor" ||
                 (name.substring(0, 11) === "gl_FragData")) &&
                ctx.compile_type !== Shade.FRAGMENT_PROGRAM_COMPILE) {
                throw new Error("gl_FragColor and gl_FragData assignment"
                       + " only allowed on fragment shaders");
            }
            if ((name === "gl_Position" ||
                 name === "gl_PointSize") &&
                ctx.compile_type !== Shade.VERTEX_PROGRAM_COMPILE) {
                throw new Error("gl_Position and gl_PointSize assignment "
                       + "only allowed on vertex shaders");
            }
            if ((ctx.compile_type !== Shade.VERTEX_PROGRAM_COMPILE) &&
                (name !== "gl_FragColor") &&
                (name.substring(0, 11) !== "gl_FragData")) {
                throw new Error("the only allowed output variables on a fragment"
                       + " shader are gl_FragColor and gl_FragData[]");
            }
            if (name !== "gl_FragColor" &&
                name !== "gl_Position" &&
                name !== "gl_PointSize" &&
                name.substring(0, 11) !== "gl_FragData") {
                ctx.declare_varying(name, type);
            }
            ctx.void_function(this, "(", name, "=", this.parents[0].glsl_expression(), ")");
        },
        type: Shade.Types.void_t,
        parents: [exp],
        evaluate: Shade.memoize_on_guid_dict(function(cache) {
            return this.parents[0].evaluate(cache);
        })
    });
};
Shade.parameter = function(type, v)
{
    var call_lookup = [
        [Shade.Types.float_t, "uniform1f"],
        [Shade.Types.int_t, "uniform1i"],
        [Shade.Types.bool_t, "uniform1i"],
        [Shade.Types.sampler2D, "uniform1i"],
        [Shade.Types.vec2, "uniform2fv"],
        [Shade.Types.vec3, "uniform3fv"],
        [Shade.Types.vec4, "uniform4fv"],
        [Shade.Types.mat2, "uniformMatrix2fv"],
        [Shade.Types.mat3, "uniformMatrix3fv"],
        [Shade.Types.mat4, "uniformMatrix4fv"]
    ];

    var uniform_name = Shade.unique_name();
    if (_.isUndefined(type)) throw new Error("parameter requires type");
    if (typeof type === 'string') type = Shade.Types[type];
    if (_.isUndefined(type)) throw new Error("parameter requires valid type");

    // the local variable value stores the actual value of the
    // parameter to be used by the GLSL uniform when it is set.
    var value;

    var call = _.detect(call_lookup, function(p) { return type.equals(p[0]); });
    if (!_.isUndefined(call)) {
        call = call[1];
    } else {
        throw new Error("Unsupported type " + type.repr() + " for parameter.");
    }
    var result = Shade._create_concrete_exp({
        parents: [],
        watchers: [],
        type: type,
        expression_type: 'parameter',
        glsl_expression: function() {
            if (this._must_be_function_call) {
                return this.glsl_name + "()";
            } else
                return uniform_name; 
        },
        evaluate: function() {
            return value;
        },
        element: Shade.memoize_on_field("_element", function(i) {
            if (this.type.is_pod()) {
                if (i === 0)
                    return this;
                else
                    throw new Error(this.type.repr() + " is an atomic type");
            } else
                return this.at(i);
        }),
        compile: function(ctx) {
            ctx.declare_uniform(uniform_name, this.type);
            if (this._must_be_function_call) {
                this.precomputed_value_glsl_name = ctx.request_fresh_glsl_name();
                ctx.strings.push(this.type.declare(this.precomputed_value_glsl_name), ";\n");
                ctx.add_initialization(this.precomputed_value_glsl_name + " = " + uniform_name);
                ctx.value_function(this, this.precomputed_value_glsl_name);
            }
        },
        set: function(v) {
            // Ideally, we'd like to do type checking here, but I'm concerned about
            // performance implications. setting a uniform might be a hot path
            // then again, Shade.Types.type_of is unlikely to be particularly fast.
            // FIXME check performance
            var t = Shade.Types.type_of(v);
            if (t === "shade_expression")
                v = v.evaluate();
            value = v;
            if (this._lux_active_uniform) {
                this._lux_active_uniform(v);
            }
            _.each(this.watchers, function(f) { f(v); });
        },
        get: function(v) {
            return value;
        },
        watch: function(callback) {
            this.watchers.push(callback);
        },
        unwatch: function(callback) {
            this.watchers.splice(this.watchers.indexOf(callback), 1);
        },
        uniform_call: call,
        uniform_name: uniform_name,

        //////////////////////////////////////////////////////////////////////
        // debugging

        _json_helper: Shade.Debug._json_builder("parameter", function(obj) {
            obj.parameter_type = type.repr();
            return obj;
        })
    });
    result._uniforms = [result];
    result.set(v);
    return result;
};
Shade.sampler2D_from_texture = function(texture)
{
    return texture._shade_expression || function() {
        var result = Shade.parameter("sampler2D");
        result.set(texture);
        texture._shade_expression = result;
        // FIXME: What if the same texture is bound to many samplers?!
        return result;
    }();
};

Shade.attribute_from_buffer = function(buffer)
{
    return buffer._shade_expression || function() {
        var itemTypeMap = [ undefined, Shade.Types.float_t, Shade.Types.vec2, Shade.Types.vec3, Shade.Types.vec4 ];
        var itemType = itemTypeMap[buffer.itemSize];
        var result = Shade.attribute(itemType);
        buffer._shade_expression = result;
        result.set(buffer);
        return result;
    }();
};

Shade.attribute = function(type)
{
    var name = Shade.unique_name();
    if (_.isUndefined(type)) throw new Error("attribute requires type");
    if (typeof type === 'string') type = Shade.Types[type];
    if (_.isUndefined(type)) throw new Error("attribute requires valid type");
    var bound_buffer;

    return Shade._create_concrete_exp( {
        parents: [],
        type: type,
        expression_type: 'attribute',
        element: Shade.memoize_on_field("_element", function(i) {
            if (this.type.equals(Shade.Types.float_t)) {
                if (i === 0)
                    return this;
                else
                    throw new Error("float is an atomic type");
            } else
                return this.at(i);
        }),
        evaluate: function() {
            throw new Error("client-side evaluation of attributes is currently unsupported");
        },
        glsl_expression: function() { 
            if (this._must_be_function_call) {
                return this.glsl_name + "()";
            } else
                return name; 
        },
        compile: function(ctx) {
            ctx.declare_attribute(name, this.type);
            if (this._must_be_function_call) {
                this.precomputed_value_glsl_name = ctx.request_fresh_glsl_name();
                ctx.strings.push(this.type.declare(this.precomputed_value_glsl_name), ";\n");
                ctx.add_initialization(this.precomputed_value_glsl_name + " = " + name);
                ctx.value_function(this, this.precomputed_value_glsl_name);
            }
        },
        get: function() {
            return bound_buffer;
        },
        set: function(buffer) {
            // FIXME buffer typechecking
            var batch_opts = Lux.get_current_batch_opts();
            if (batch_opts.program && (name in batch_opts.program)) {
                var ctx = batch_opts._ctx;
                buffer.bind(batch_opts.program[name]);
            }
            bound_buffer = buffer;
        },
        _attribute_name: name,

        //////////////////////////////////////////////////////////////////////
        // debugging

        _json_helper: Shade.Debug._json_builder("attribute", function(obj) {
            obj.attribute_type = type.repr();
            return obj;
        })

    });
};
Shade.varying = function(name, type)
{
    if (_.isUndefined(type)) throw new Error("varying requires type");
    if (Lux.type_of(type) === 'string') type = Shade.Types[type];
    if (_.isUndefined(type)) throw new Error("varying requires valid type");
    var allowed_types = [
        Shade.Types.float_t,
        Shade.Types.vec2,
        Shade.Types.vec3,
        Shade.Types.vec4,
        Shade.Types.mat2,
        Shade.Types.mat3,
        Shade.Types.mat4
    ];
    if (!_.any(allowed_types, function(t) { return t.equals(type); })) {
        throw new Error("varying does not support type '" + type.repr() + "'");
    }
    return Shade._create_concrete_exp( {
        parents: [],
        type: type,
        expression_type: 'varying',
        _varying_name: name,
        element: Shade.memoize_on_field("_element", function(i) {
            if (this.type.is_pod()) {
                if (i === 0)
                    return this;
                else
                    throw new Error(this.type.repr() + " is an atomic type");
            } else
                return this.at(i);
        }),
        glsl_expression: function() { 
            if (this._must_be_function_call) {
                return this.glsl_name + "()";
            } else
                return name; 
        },
        evaluate: function() {
            throw new Error("evaluate unsupported for varying expressions");
        },
        compile: function(ctx) {
            ctx.declare_varying(name, this.type);
            if (this._must_be_function_call) {
                this.precomputed_value_glsl_name = ctx.request_fresh_glsl_name();
                ctx.strings.push(this.type.declare(this.precomputed_value_glsl_name), ";\n");
                ctx.add_initialization(this.precomputed_value_glsl_name + " = " + name);
                ctx.value_function(this, this.precomputed_value_glsl_name);
            }
        },

        //////////////////////////////////////////////////////////////////////
        // debugging

        _json_helper: Shade.Debug._json_builder("varying", function(obj) {
            obj.varying_type = type.repr();
            obj.varying_name = name;
            return obj;
        })
    });
};

Shade.fragCoord = function() {
    return Shade._create_concrete_exp({
        expression_type: "builtin_input{gl_FragCoord}",
        parents: [],
        type: Shade.Types.vec4,
        glsl_expression: function() { return "gl_FragCoord"; },
        evaluate: function() {
            throw new Error("evaluate undefined for fragCoord");
        },
        element: function(i) {
            return this.at(i);
        },
        compile: function(ctx) {
        },
        _json_key: function() { return 'fragCoord'; }
    });
};
Shade.pointCoord = function() {
    return Shade._create_concrete_exp({
        expression_type: "builtin_input{gl_PointCoord}",
        parents: [],
        type: Shade.Types.vec2,
        glsl_expression: function() { return "gl_PointCoord"; },
        compile: function(ctx) {
        },
        evaluate: function() {
            throw new Error("evaluate undefined for pointCoord");
        },
        element: function(i) {
            return this.at(i);
        },
        _json_key: function() { return 'pointCoord'; }
    });
};
Shade.round_dot = function(color) {
    var outside_dot = Shade.pointCoord().sub(Shade.vec(0.5, 0.5)).norm().gt(0.25);
    return Shade.make(color).discard_if(outside_dot);
};
(function() {

var operator = function(exp1, exp2, 
                        operator_name, type_resolver,
                        evaluator,
                        element_evaluator,
                        shade_name)
{
    var resulting_type = type_resolver(exp1.type, exp2.type);
    return Shade._create_concrete_value_exp( {
        parents: [exp1, exp2],
        type: resulting_type,
        expression_type: "operator" + operator_name,
        _json_key: function() { return shade_name; },
        value: function () {
            var p1 = this.parents[0], p2 = this.parents[1];
            if (this.type.is_struct()) {
                return "(" + this.type.repr() + "(" +
                    _.map(this.type.fields, function (v,k) {
                        return p1.field(k).glsl_expression() + " " + operator_name + " " +
                            p2.field(k).glsl_expression();
                    }).join(", ") + "))";
            } else {
                return "(" + this.parents[0].glsl_expression() + " " + operator_name + " " +
                    this.parents[1].glsl_expression() + ")";
            }
        },
        evaluate: Shade.memoize_on_guid_dict(function(cache) {
            return evaluator(this, cache);
        }),
        element: Shade.memoize_on_field("_element", function(i) {
            return element_evaluator(this, i);
        }),
        element_constant_value: Shade.memoize_on_field("_element_constant_value", function(i) {
            return this.element(i).constant_value();
        }),
        element_is_constant: Shade.memoize_on_field("_element_is_constant", function(i) {
            return this.element(i).is_constant();
        })
    });
};

Shade.add = function() {
    if (arguments.length === 0) throw new Error("add needs at least one argument");
    if (arguments.length === 1) return arguments[0];
    function add_type_resolver(t1, t2) {
        var type_list = [
            [Shade.Types.vec4, Shade.Types.vec4, Shade.Types.vec4],
            [Shade.Types.mat4, Shade.Types.mat4, Shade.Types.mat4],
            [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec4, Shade.Types.float_t, Shade.Types.vec4],
            [Shade.Types.float_t, Shade.Types.vec4, Shade.Types.vec4],
            [Shade.Types.mat4, Shade.Types.float_t, Shade.Types.mat4],
            [Shade.Types.float_t, Shade.Types.mat4, Shade.Types.mat4],

            [Shade.Types.vec3, Shade.Types.vec3, Shade.Types.vec3],
            [Shade.Types.mat3, Shade.Types.mat3, Shade.Types.mat3],
            [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec3, Shade.Types.float_t, Shade.Types.vec3],
            [Shade.Types.float_t, Shade.Types.vec3, Shade.Types.vec3],
            [Shade.Types.mat3, Shade.Types.float_t, Shade.Types.mat3],
            [Shade.Types.float_t, Shade.Types.mat3, Shade.Types.mat3],

            [Shade.Types.vec2, Shade.Types.vec2, Shade.Types.vec2],
            [Shade.Types.mat2, Shade.Types.mat2, Shade.Types.mat2],
            [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec2, Shade.Types.float_t, Shade.Types.vec2],
            [Shade.Types.float_t, Shade.Types.vec2, Shade.Types.vec2],
            [Shade.Types.mat2, Shade.Types.float_t, Shade.Types.mat2],
            [Shade.Types.float_t, Shade.Types.mat2, Shade.Types.mat2],
            
            [Shade.Types.int_t, Shade.Types.int_t, Shade.Types.int_t]
        ];
        for (var i=0; i<type_list.length; ++i)
            if (t1.equals(type_list[i][0]) &&
                t2.equals(type_list[i][1]))
                return type_list[i][2];

        // if t1 and t2 are the same struct and all fields admit
        // addition, then a+b is field-wise a+b
        if (t1.is_struct() && t2.is_struct() && t1.equals(t2) &&
            _.all(t1.fields, function(v, k) {
                try {
                    add_type_resolver(v, v);
                    return true;
                } catch (e) {
                    return false;
                }
            })) {
            return t1;
        }
        throw new Error("type mismatch on add: unexpected types  '"
                   + t1.repr() + "' and '" + t2.repr() + "'.");
    }
    var current_result = Shade.make(arguments[0]);
    function evaluator(exp, cache) {
        var exp1 = exp.parents[0], exp2 = exp.parents[1];
        var vt;
        if (exp1.type.is_vec())
            vt = vec[exp1.type.vec_dimension()];
        else if (exp2.type.is_vec())
            vt = vec[exp2.type.vec_dimension()];
        var v1 = exp1.evaluate(cache), v2 = exp2.evaluate(cache);
        if (exp1.type.equals(Shade.Types.int_t) && 
            exp2.type.equals(Shade.Types.int_t))
            return v1 + v2;
        if (exp1.type.equals(Shade.Types.float_t) &&
            exp2.type.equals(Shade.Types.float_t))
            return v1 + v2;
        if (exp2.type.equals(Shade.Types.float_t))
            return vt.map(v1, function(x) { 
                return x + v2;
            });
        if (exp1.type.equals(Shade.Types.float_t))
            return vt.map(v2, function(x) {
                return v1 + x;
            });
        if (vt) {
            return vt.plus(v1, v2);
        } else {
            if (!exp1.type.is_struct())
                throw new Error("internal error, was expecting a struct here");
            var s = {};
            _.each(v1, function(v, k) {
                s[k] = evaluator(Shade.add(exp1.field(k), exp2.field(k)));
            });
            return s;
        }
    };
    function element_evaluator(exp, i) {
        var e1 = exp.parents[0], e2 = exp.parents[1];
        var v1, v2;
        var t1 = e1.type, t2 = e2.type;
        if (t1.is_pod() && t2.is_pod()) {
            if (i === 0)
                return exp;
            else
                throw new Error("i > 0 in pod element");
        }
        if (e1.type.is_vec() || e1.type.is_mat())
            v1 = e1.element(i);
        else
            v1 = e1;
        if (e2.type.is_vec() || e2.type.is_vec())
            v2 = e2.element(i);
        else
            v2 = e2;
        return operator(v1, v2, "+", add_type_resolver, evaluator, element_evaluator, "add");
    }
    for (var i=1; i<arguments.length; ++i) {
        current_result = operator(current_result, Shade.make(arguments[i]),
                                  "+", add_type_resolver, evaluator,
                                  element_evaluator, "add");
    }
    return current_result;
};

Shade.sub = function() {
    if (arguments.length === 0) throw new Error("sub needs at least two arguments");
    if (arguments.length === 1) throw new Error("unary minus unimplemented");
    function sub_type_resolver(t1, t2) {
        var type_list = [
            [Shade.Types.vec4, Shade.Types.vec4, Shade.Types.vec4],
            [Shade.Types.mat4, Shade.Types.mat4, Shade.Types.mat4],
            [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec4, Shade.Types.float_t, Shade.Types.vec4],
            [Shade.Types.float_t, Shade.Types.vec4, Shade.Types.vec4],
            [Shade.Types.mat4, Shade.Types.float_t, Shade.Types.mat4],
            [Shade.Types.float_t, Shade.Types.mat4, Shade.Types.mat4],

            [Shade.Types.vec3, Shade.Types.vec3, Shade.Types.vec3],
            [Shade.Types.mat3, Shade.Types.mat3, Shade.Types.mat3],
            [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec3, Shade.Types.float_t, Shade.Types.vec3],
            [Shade.Types.float_t, Shade.Types.vec3, Shade.Types.vec3],
            [Shade.Types.mat3, Shade.Types.float_t, Shade.Types.mat3],
            [Shade.Types.float_t, Shade.Types.mat3, Shade.Types.mat3],

            [Shade.Types.vec2, Shade.Types.vec2, Shade.Types.vec2],
            [Shade.Types.mat2, Shade.Types.mat2, Shade.Types.mat2],
            [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec2, Shade.Types.float_t, Shade.Types.vec2],
            [Shade.Types.float_t, Shade.Types.vec2, Shade.Types.vec2],
            [Shade.Types.mat2, Shade.Types.float_t, Shade.Types.mat2],
            [Shade.Types.float_t, Shade.Types.mat2, Shade.Types.mat2],
            
            [Shade.Types.int_t, Shade.Types.int_t, Shade.Types.int_t]
        ];
        for (var i=0; i<type_list.length; ++i)
            if (t1.equals(type_list[i][0]) &&
                t2.equals(type_list[i][1]))
                return type_list[i][2];
        // if t1 and t2 are the same struct and all fields admit
        // subtraction, then a-b is field-wise a-b
        if (t1.is_struct() && t2.is_struct() && t1.equals(t2) &&
            _.all(t1.fields, function(v, k) {
                try {
                    sub_type_resolver(v, v);
                    return true;
                } catch (e) {
                    return false;
                }
            })) {
            return t1;
        }
        throw new Error("type mismatch on sub: unexpected types  '"
                   + t1.repr() + "' and '" + t2.repr() + "'.");
    }
    function evaluator(exp, cache) {
        var exp1 = exp.parents[0], exp2 = exp.parents[1];
        var vt;
        if (exp1.type.is_vec())
            vt = vec[exp1.type.vec_dimension()];
        else if (exp2.type.is_vec())
            vt = vec[exp2.type.vec_dimension()];
        var v1 = exp1.evaluate(cache), v2 = exp2.evaluate(cache);
        if (exp1.type.equals(Shade.Types.int_t) && 
            exp2.type.equals(Shade.Types.int_t))
            return v1 - v2;
        if (exp1.type.equals(Shade.Types.float_t) &&
            exp2.type.equals(Shade.Types.float_t))
            return v1 - v2;
        if (exp2.type.equals(Shade.Types.float_t))
            return vt.map(v1, function(x) { 
                return x - v2; 
            });
        if (exp1.type.equals(Shade.Types.float_t))
            return vt.map(v2, function(x) {
                return v1 - x;
            });
        return vt.minus(v1, v2);
    }
    function element_evaluator(exp, i) {
        var e1 = exp.parents[0], e2 = exp.parents[1];
        var v1, v2;
        var t1 = e1.type, t2 = e2.type;
        if (t1.is_pod() && t2.is_pod()) {
            if (i === 0)
                return exp;
            else
                throw new Error("i > 0 in pod element");
        }
        if (e1.type.is_vec() || e1.type.is_mat())
            v1 = e1.element(i);
        else
            v1 = e1;
        if (e2.type.is_vec() || e2.type.is_vec())
            v2 = e2.element(i);
        else
            v2 = e2;
        return operator(v1, v2, "-", sub_type_resolver, evaluator, element_evaluator, "sub");
    }
    var current_result = Shade.make(arguments[0]);
    for (var i=1; i<arguments.length; ++i) {
        current_result = operator(current_result, Shade.make(arguments[i]),
                                  "-", sub_type_resolver, evaluator,
                                  element_evaluator, "sub");
    }
    return current_result;
};

Shade.div = function() {
    if (arguments.length === 0) throw new Error("div needs at least two arguments");
    function div_type_resolver(t1, t2) {
        if (_.isUndefined(t1))
            throw new Error("internal error: t1 multiplication with undefined type");
        if (_.isUndefined(t2))
            throw new Error("internal error: t2 multiplication with undefined type");
        var type_list = [
            [Shade.Types.vec4, Shade.Types.vec4, Shade.Types.vec4],
            [Shade.Types.mat4, Shade.Types.mat4, Shade.Types.mat4],
            [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec4, Shade.Types.float_t, Shade.Types.vec4],
            [Shade.Types.float_t, Shade.Types.vec4, Shade.Types.vec4],
            [Shade.Types.mat4, Shade.Types.float_t, Shade.Types.mat4],
            [Shade.Types.float_t, Shade.Types.mat4, Shade.Types.mat4],

            [Shade.Types.vec3, Shade.Types.vec3, Shade.Types.vec3],
            [Shade.Types.mat3, Shade.Types.mat3, Shade.Types.mat3],
            [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec3, Shade.Types.float_t, Shade.Types.vec3],
            [Shade.Types.float_t, Shade.Types.vec3, Shade.Types.vec3],
            [Shade.Types.mat3, Shade.Types.float_t, Shade.Types.mat3],
            [Shade.Types.float_t, Shade.Types.mat3, Shade.Types.mat3],

            [Shade.Types.vec2, Shade.Types.vec2, Shade.Types.vec2],
            [Shade.Types.mat2, Shade.Types.mat2, Shade.Types.mat2],
            [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec2, Shade.Types.float_t, Shade.Types.vec2],
            [Shade.Types.float_t, Shade.Types.vec2, Shade.Types.vec2],
            [Shade.Types.mat2, Shade.Types.float_t, Shade.Types.mat2],
            [Shade.Types.float_t, Shade.Types.mat2, Shade.Types.mat2],

            [Shade.Types.int_t, Shade.Types.int_t, Shade.Types.int_t]
        ];
        for (var i=0; i<type_list.length; ++i)
            if (t1.equals(type_list[i][0]) &&
                t2.equals(type_list[i][1]))
                return type_list[i][2];
        throw new Error("type mismatch on div: unexpected types '"
                   + t1.repr() + "' and '" + t2.repr() + "'");
    }
    function evaluator(exp, cache) {
        var exp1 = exp.parents[0];
        var exp2 = exp.parents[1];
        var v1 = exp1.evaluate(cache);
        var v2 = exp2.evaluate(cache);
        var vt, mt;
        if (exp1.type.is_array()) {
            vt = vec[exp1.type.array_size()];
            mt = mat[exp1.type.array_size()];
        } else if (exp2.type.is_array()) {
            vt = vec[exp2.type.array_size()];
            mt = mat[exp2.type.array_size()];
        }
        var t1 = Shade.Types.type_of(v1), t2 = Shade.Types.type_of(v2);
        var k1 = t1.is_vec() ? "vector" :
                 t1.is_mat() ? "matrix" :
                 t1.is_pod() ? "number" : "BAD";
        var k2 = t2.is_vec() ? "vector" :
                 t2.is_mat() ? "matrix" :
                 t2.is_pod() ? "number" : "BAD";
        var dispatch = {
            number: { number: function (x, y) { 
                                  if (exp1.type.equals(Shade.Types.int_t))
                                      return ~~(x / y);
                                  else
                                      return x / y;
                              },
                      vector: function (x, y) { 
                          return vt.map(y, function(v) {
                              return x/v;
                          });
                      },
                      matrix: function (x, y) { 
                          return mt.map(y, function(v) {
                              return x/v;
                          });
                      }
                    },
            vector: { number: function (x, y) { return vt.scaling(x, 1/y); },
                      vector: function (x, y) { 
                          return vt.map(y, function(v,i) {
                              return x[i]/v;
                          });
                      },
                      matrix: function (x, y) {
                          throw new Error("internal error, can't evaluate vector/matrix");
                      }
                    },
            matrix: { number: function (x, y) { return mt.scaling(x, 1/y); },
                      vector: function (x, y) { 
                          throw new Error("internal error, can't evaluate matrix/vector");
                      },
                      matrix: function (x, y) { 
                          throw new Error("internal error, can't evaluate matrix/matrix");
                      }
                    }
        };
        return dispatch[k1][k2](v1, v2);
    }
    function element_evaluator(exp, i) {
        var e1 = exp.parents[0], e2 = exp.parents[1];
        var v1, v2;
        var t1 = e1.type, t2 = e2.type;
        if (t1.is_pod() && t2.is_pod()) {
            if (i === 0)
                return exp;
            else
                throw new Error("i > 0 in pod element");
        }
        if (e1.type.is_vec() || e1.type.is_mat())
            v1 = e1.element(i);
        else
            v1 = e1;
        if (e2.type.is_vec() || e2.type.is_vec())
            v2 = e2.element(i);
        else
            v2 = e2;
        return operator(v1, v2, "/", div_type_resolver, evaluator, element_evaluator, "div");
    }
    var current_result = Shade.make(arguments[0]);
    for (var i=1; i<arguments.length; ++i) {
        current_result = operator(current_result, Shade.make(arguments[i]),
                                  "/", div_type_resolver, evaluator, element_evaluator,
                                  "div");
    }
    return current_result;
};

Shade.mul = function() {
    if (arguments.length === 0) throw new Error("mul needs at least one argument");
    if (arguments.length === 1) return arguments[0];
    function mul_type_resolver(t1, t2) {
        if (_.isUndefined(t1))
            throw new Error("t1 multiplication with undefined type?");
        if (_.isUndefined(t2))
            throw new Error("t2 multiplication with undefined type?");
        var type_list = [
            [Shade.Types.vec4, Shade.Types.vec4, Shade.Types.vec4],
            [Shade.Types.mat4, Shade.Types.mat4, Shade.Types.mat4],
            [Shade.Types.mat4, Shade.Types.vec4, Shade.Types.vec4],
            [Shade.Types.vec4, Shade.Types.mat4, Shade.Types.vec4],
            [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec4, Shade.Types.float_t, Shade.Types.vec4],
            [Shade.Types.float_t, Shade.Types.vec4, Shade.Types.vec4],
            [Shade.Types.mat4, Shade.Types.float_t, Shade.Types.mat4],
            [Shade.Types.float_t, Shade.Types.mat4, Shade.Types.mat4],

            [Shade.Types.vec3, Shade.Types.vec3, Shade.Types.vec3],
            [Shade.Types.mat3, Shade.Types.mat3, Shade.Types.mat3],
            [Shade.Types.mat3, Shade.Types.vec3, Shade.Types.vec3],
            [Shade.Types.vec3, Shade.Types.mat3, Shade.Types.vec3],
            [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec3, Shade.Types.float_t, Shade.Types.vec3],
            [Shade.Types.float_t, Shade.Types.vec3, Shade.Types.vec3],
            [Shade.Types.mat3, Shade.Types.float_t, Shade.Types.mat3],
            [Shade.Types.float_t, Shade.Types.mat3, Shade.Types.mat3],

            [Shade.Types.vec2, Shade.Types.vec2, Shade.Types.vec2],
            [Shade.Types.mat2, Shade.Types.mat2, Shade.Types.mat2],
            [Shade.Types.mat2, Shade.Types.vec2, Shade.Types.vec2],
            [Shade.Types.vec2, Shade.Types.mat2, Shade.Types.vec2],
            [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec2, Shade.Types.float_t, Shade.Types.vec2],
            [Shade.Types.float_t, Shade.Types.vec2, Shade.Types.vec2],
            [Shade.Types.mat2, Shade.Types.float_t, Shade.Types.mat2],
            [Shade.Types.float_t, Shade.Types.mat2, Shade.Types.mat2],
            
            [Shade.Types.int_t, Shade.Types.int_t, Shade.Types.int_t]
        ];
        for (var i=0; i<type_list.length; ++i)
            if (t1.equals(type_list[i][0]) &&
                t2.equals(type_list[i][1]))
                return type_list[i][2];
        throw new Error("type mismatch on mul: unexpected types  '"
                   + t1.repr() + "' and '" + t2.repr() + "'.");
    }
    function evaluator(exp, cache) {
        var exp1 = exp.parents[0];
        var exp2 = exp.parents[1];
        var v1 = exp1.evaluate(cache);
        var v2 = exp2.evaluate(cache);
        var vt, mt;
        if (exp1.type.is_array()) {
            vt = vec[exp1.type.array_size()];
            mt = mat[exp1.type.array_size()];
        } else if (exp2.type.is_array()) {
            vt = vec[exp2.type.array_size()];
            mt = mat[exp2.type.array_size()];
        }
        var t1 = Shade.Types.type_of(v1), t2 = Shade.Types.type_of(v2);
        var k1 = t1.is_vec() ? "vector" :
                 t1.is_mat() ? "matrix" :
                 t1.is_pod() ? "number" : "BAD";
        var k2 = t2.is_vec() ? "vector" :
                 t2.is_mat() ? "matrix" :
                 t2.is_pod() ? "number" : "BAD";
        var dispatch = {
            number: { number: function (x, y) { return x * y; },
                      vector: function (x, y) { return vt.scaling(y, x); },
                      matrix: function (x, y) { return mt.scaling(y, x); }
                    },
            vector: { number: function (x, y) { return vt.scaling(x, y); },
                      vector: function (x, y) {
                          return vt.schur_product(x, y);
                      },
                      matrix: function (x, y) {
                          return mt.product_vec(mt.transpose(y), x);
                      }
                    },
            matrix: { number: function (x, y) { return mt.scaling(x, y); },
                      vector: function (x, y) { return mt.product_vec(x, y); },
                      matrix: function (x, y) { return mt.product(x, y); }
                    }
        };
        return dispatch[k1][k2](v1, v2);
    }
    function element_evaluator(exp, i) {
        var e1 = exp.parents[0], e2 = exp.parents[1];
        var v1, v2;
        var t1 = e1.type, t2 = e2.type;
        if (t1.is_pod() && t2.is_pod()) {
            if (i === 0)
                return exp;
            else
                throw new Error("i > 0 in pod element");
        }
        function value_kind(t) {
            if (t.is_pod())
                return "pod";
            if (t.is_vec())
                return "vec";
            if (t.is_mat())
                return "mat";
            throw new Error("internal error: not pod, vec or mat");
        }
        var k1 = value_kind(t1), k2 = value_kind(t2);
        var dispatch = {
            "pod": { 
                "pod": function() { 
                    throw new Error("internal error, pod pod"); 
                },
                "vec": function() { 
                    v1 = e1; v2 = e2.element(i); 
                    return operator(v1, v2, "*", mul_type_resolver, evaluator, element_evaluator, "mul");
                },
                "mat": function() { 
                    v1 = e1; v2 = e2.element(i); 
                    return operator(v1, v2, "*", mul_type_resolver, evaluator, element_evaluator, "mul");
                }
            },
            "vec": { 
                "pod": function() { 
                    v1 = e1.element(i); v2 = e2; 
                    return operator(v1, v2, "*", mul_type_resolver, evaluator, element_evaluator, "mul");
                },
                "vec": function() { 
                    v1 = e1.element(i); v2 = e2.element(i); 
                    return operator(v1, v2, "*", mul_type_resolver, evaluator, element_evaluator, "mul");
                },
                "mat": function() {
                    // FIXME should we have a mat_dimension?
                    return Shade.dot(e1, e2.element(i));
                }
            },
            "mat": { 
                "pod": function() { 
                    v1 = e1.element(i); v2 = e2;
                    return operator(v1, v2, "*", mul_type_resolver, evaluator, element_evaluator, "mul");
                },
                "vec": function() {
                    // FIXME should we have a mat_dimension?
                    var d = t1.array_size();
                    var row;
                    if (d === 2) {
                        row = Shade.vec(e1.element(0).element(i),
                                        e1.element(1).element(i));
                    } else if (d === 3) {
                        row = Shade.vec(e1.element(0).element(i),
                                        e1.element(1).element(i),
                                        e1.element(2).element(i));
                    } else if (d === 4) {
                        row = Shade.vec(e1.element(0).element(i),
                                        e1.element(1).element(i),
                                        e1.element(2).element(i),
                                        e1.element(3).element(i));
                    } else
                        throw new Error("bad dimension for mat " + d);
                    return Shade.dot(row, e2);
                    // var row = e1.element(i);
                    // return Shade.dot(row, e2);
                },
                "mat": function() {
                    var col = e2.element(i);
                    return operator(e1, col, "*", mul_type_resolver, evaluator, element_evaluator,
                                    "mul");
                }
            }
        };
        return dispatch[k1][k2]();
    };
    var current_result = Shade.make(arguments[0]);
    for (var i=1; i<arguments.length; ++i) {
        if (current_result.type.equals(Shade.Types.mat4)) {
            if (arguments[i].type.equals(Shade.Types.vec2)) {
                arguments[i] = Shade.vec(arguments[i], 0, 1);
            } else if (arguments[i].type.equals(Shade.Types.vec3)) {
                arguments[i] = Shade.vec(arguments[i], 1);
            }
        }
        current_result = operator(current_result, Shade.make(arguments[i]),
                                  "*", mul_type_resolver, evaluator, element_evaluator, "mul");
    }
    return current_result;
};
})();
Shade.neg = function(x)
{
    return Shade.sub(0, x);
};
Shade.Exp.neg = function() { return Shade.neg(this); };
Shade.vec = function()
{
    var parents = [];
    var parent_offsets = [];
    var total_size = 0;
    var vec_type;
    for (var i=0; i<arguments.length; ++i) {
        var arg = Shade.make(arguments[i]);
        parents.push(arg);
        parent_offsets.push(total_size);
        if (_.isUndefined(vec_type))
            vec_type = arg.type.element_type(0);
        else if (!vec_type.equals(arg.type.element_type(0)))
            throw new Error("vec requires equal types");
        total_size += arg.type.size_for_vec_constructor();
    }
    parent_offsets.push(total_size);
    if (total_size < 1 || total_size > 4) {
        throw new Error("vec constructor requires resulting width to be between "
            + "1 and 4, got " + total_size + " instead");
    }
    var type;
    if (vec_type.equals(Shade.Types.float_t)) {
        type = Shade.Types["vec" + total_size];
    } else if (vec_type.equals(Shade.Types.int_t)) {
        type = Shade.Types["ivec" + total_size];
    } else if (vec_type.equals(Shade.Types.bool_t)) {
        type = Shade.Types["bvec" + total_size];
    } else {
        throw new Error("vec type must be bool, int, or float");
    }
    
    return Shade._create_concrete_value_exp({
        parents: parents,
        parent_offsets: parent_offsets,
        type: type,
        expression_type: 'vec',
        size: total_size,
        element: function(i) {
            var old_i = i;
            for (var j=0; j<this.parents.length; ++j) {
                var sz = this.parent_offsets[j+1] - this.parent_offsets[j];
                if (i < sz)
                    return this.parents[j].element(i);
                i = i - sz;
            }
            throw new Error("element " + old_i + " out of bounds (size=" 
                + total_size + ")");
        },
        element_is_constant: function(i) {
            var old_i = i;
            for (var j=0; j<this.parents.length; ++j) {
                var sz = this.parent_offsets[j+1] - this.parent_offsets[j];
                if (i < sz)
                    return this.parents[j].element_is_constant(i);
                i = i - sz;
            }
            throw new Error("element " + old_i + " out of bounds (size=" 
                + total_size + ")");
        },
        element_constant_value: function(i) {
            var old_i = i;
            for (var j=0; j<this.parents.length; ++j) {
                var sz = this.parent_offsets[j+1] - this.parent_offsets[j];
                if (i < sz)
                    return this.parents[j].element_constant_value(i);
                i = i - sz;
            }
            throw new Error("element " + old_i + " out of bounds (size=" 
                + total_size + ")");
        },
        evaluate: Shade.memoize_on_guid_dict(function(cache) {
            var result = [];
            var parent_values = _.each(this.parents, function(v) {
                var c = v.evaluate(cache);
                if (Lux.type_of(c) === 'number')
                    result.push(c);
                else
                    for (var i=0; i<c.length; ++i)
                        result.push(c[i]);
            });
            return vec[result.length].make(result);
        }),
        value: function() {
            return this.type.repr() + "(" +
                this.parents.map(function (t) {
                    return t.glsl_expression();
                }).join(", ") + ")";
        }
    });
};
Shade.mat = function()
{
    var parents = [];
    var rows = arguments.length, cols;

    for (var i=0; i<arguments.length; ++i) {
        var arg = arguments[i];
        // if (!(arg.expression_type === 'vec')) {
        //     throw new Error("mat only takes vecs as parameters");
        // }
        parents.push(arg);
        if (i === 0)
            cols = arg.type.size_for_vec_constructor();
        else if (cols !== arg.type.size_for_vec_constructor())
            throw new Error("mat: all vecs must have same dimension");
    }

    if (cols !== rows) {
        throw new Error("non-square matrices currently not supported");
    }

    if (rows < 1 || rows > 4) {
        throw new Error("mat constructor requires resulting dimension to be between "
            + "2 and 4");
    }
    var type = Shade.Types["mat" + rows];
    return Shade._create_concrete_value_exp( {
        parents: parents,
        type: type,
        expression_type: 'mat',
        size: rows,
        element: function(i) {
            return this.parents[i];
        },
        element_is_constant: function(i) {
            return this.parents[i].is_constant();
        },
        element_constant_value: function(i) {
            return this.parents[i].constant_value();
        },
        evaluate: Shade.memoize_on_guid_dict(function(cache) {
            var result = [];
            var ll = _.each(this.parents, function(v) {
                v = v.evaluate(cache);
                for (var i=0; i<v.length; ++i) {
                    result.push(v[i]);
                }
            });
            return mat[this.type.array_size()].make(result);
        }),
        value: function() {
            return this.type.repr() + "(" +
                this.parents.map(function (t) { 
                    return t.glsl_expression(); 
                }).join(", ") + ")";
        }
    });
};

Shade.mat3 = function(m)
{
    var t = m.type;
    if (t.equals(Shade.Types.mat2)) {
        return Shade.mat(Shade.vec(m.at(0), 0),
                         Shade.vec(m.at(1), 0),
                         Shade.vec(0, 0, 1));
    } else if (t.equals(Shade.Types.mat3)) {
        return m;
    } else if (t.equals(Shade.Types.mat4)) {
        return Shade.mat(m.element(0).swizzle("xyz"),
                         m.element(1).swizzle("xyz"),
                         m.element(2).swizzle("xyz"));
    } else {
        throw new Error("need matrix to convert to mat3");
    }
};
// per_vertex is an identity operation value-wise, but it tags the AST
// so the optimizer can do its thing.
Shade.per_vertex = function(exp)
{
    exp = Shade.make(exp);
    return Shade._create_concrete_exp({
        expression_name: "per_vertex",
        parents: [exp],
        type: exp.type,
        stage: "vertex",
        glsl_expression: function() { return this.parents[0].glsl_expression(); },
        evaluate: function () { return this.parents[0].evaluate(); },
        compile: function () {}
    });
};
(function() {

function zipWith(f, v1, v2)
{
    return _.map(_.zip(v1, v2),
                 function(v) { return f(v[0], v[1]); });
}

function zipWith3(f, v1, v2, v3)
{
    return _.map(_.zip(v1, v2, v3),
                 function(v) { return f(v[0], v[1], v[2]); });
}

//////////////////////////////////////////////////////////////////////////////
// common functions

function builtin_glsl_function(opts)
{
    var name = opts.name;
    var shade_name = opts.shade_name || opts.name;
    var evaluator = opts.evaluator;
    var type_resolving_list = opts.type_resolving_list;
    var element_function = opts.element_function;
    var element_constant_evaluator = opts.element_constant_evaluator;

    for (var i=0; i<type_resolving_list.length; ++i)
        for (var j=0; j<type_resolving_list[i].length; ++j) {
            var t = type_resolving_list[i][j];
            if (_.isUndefined(t))
                throw new Error("undefined type in type_resolver");
        }

    // takes a list of lists of possible argument types, returns a function to 
    // resolve those types.
    function type_resolver_from_list(lst)
    {
        var param_length = lst[0].length - 1;
        return function() {
            if (arguments.length != param_length) {
                throw new Error("expected " + param_length + " arguments, got "
                    + arguments.length + " instead.");
            }
            for (var i=0; i<lst.length; ++i) {
                var this_params = lst[i];
                var matched = true;
                for (var j=0; j<param_length; ++j) {
                    if (!this_params[j].equals(arguments[j].type)) {
                        matched = false;
                        break;
                    }
                }
                if (matched)
                    return this_params[param_length];
            }
            var types = _.map(_.toArray(arguments).slice(0, arguments.length),
                  function(x) { return x.type.repr(); }).join(", ");
            throw new Error("could not find appropriate type match for (" + types + ")");
        };
    }

    return function() {
        var resolver = type_resolver_from_list(type_resolving_list);
        var type, canon_args = [];
        for (i=0; i<arguments.length; ++i) {
            canon_args.push(Shade.make(arguments[i]));
        }
        try {
            type = resolver.apply(this, canon_args);
        } catch (err) {
            throw new Error("type error on " + name + ": " + err);
        }
        var obj = {
            parents: canon_args,
            expression_type: "builtin_function{" + name + "}",
            type: type,
            
            value: function() {
                return [name, "(",
                        this.parents.map(function(t) { 
                            return t.glsl_expression(); 
                        }).join(", "),
                        ")"].join(" ");
            },
            _json_helper: Shade.Debug._json_builder(shade_name)
        };

        if (evaluator) {
            obj.evaluate = Shade.memoize_on_guid_dict(function(cache) {
                return evaluator(this, cache);
            });
        } else {
            throw new Error("Internal error: Builtin '" + name + "' has no evaluator?!");
        }

        obj.constant_value = Shade.memoize_on_field("_constant_value", function() {
            if (!this.is_constant())
                throw new Error("constant_value called on non-constant expression");
            return evaluator(this);
        });

        if (element_function) {
            obj.element = function(i) {
                return element_function(this, i);
            };
            if (element_constant_evaluator) {
                obj.element_is_constant = function(i) {
                    return element_constant_evaluator(this, i);
                };
            } else {
                obj.element_is_constant = function(i) {
                    // if (this.guid === 489) {
                    //     debugger;
                    // }
                    return this.element(i).is_constant();
                };
            }
        }
        return Shade._create_concrete_value_exp(obj);
    };
}

function common_fun_1op(fun_name, evaluator) {
    var result = builtin_glsl_function({
        name: fun_name,
        type_resolving_list: [
            [Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec2, Shade.Types.vec2],
            [Shade.Types.vec3, Shade.Types.vec3],
            [Shade.Types.vec4, Shade.Types.vec4]
        ], 
        evaluator: evaluator,
        element_function: function(exp, i) {
            return result(exp.parents[0].element(i));
        }
    });
    return result;
}

function common_fun_2op(fun_name, evaluator) {
    var result = builtin_glsl_function({
        name: fun_name, 
        type_resolving_list: [
            [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec2, Shade.Types.vec2, Shade.Types.vec2],
            [Shade.Types.vec3, Shade.Types.vec3, Shade.Types.vec3],
            [Shade.Types.vec4, Shade.Types.vec4, Shade.Types.vec4]
        ], 
        evaluator: evaluator, 
        element_function: function(exp, i) {
            return result(exp.parents[0].element(i), exp.parents[1].element(i));
        }
    });
    return result;
}

// angle and trig, some common, some exponential,
var funcs_1op = {
    "radians": function(v) { return v * Math.PI / 180; },
    "degrees": function(v) { return v / Math.PI * 180; }, 
    "sin": Math.sin,
    "cos": Math.cos, 
    "tan": Math.tan, 
    "asin": Math.asin, 
    "acos": Math.acos, 
    "abs": Math.abs,
    "sign": function(v) { if (v < 0) return -1;
                          if (v === 0) return 0;
                          return 1;
                        }, 
    "floor": Math.floor,
    "ceil": Math.ceil,
    "fract": function(v) { return v - Math.floor(v); },
    "exp": Math.exp, 
    "log": Math.log, 
    "exp2": function(v) { return Math.exp(v * Math.log(2)); },
    "log2": function(v) { return Math.log(v) / Math.log(2); },
    "sqrt": Math.sqrt,
    "inversesqrt": function(v) { return 1 / Math.sqrt(v); }
};

_.each(funcs_1op, function (evaluator_1, fun_name) {
    function evaluator(exp, cache) {
        if (exp.type.equals(Shade.Types.float_t))
            return evaluator_1(exp.parents[0].evaluate(cache));
        else {
            var c = exp.parents[0].evaluate(cache);
            return vec.map(c, evaluator_1);
        }
    }
    Shade[fun_name] = common_fun_1op(fun_name, evaluator);
    Shade.Exp[fun_name] = function(fun) {
        return function() {
            return fun(this);
        };
    }(Shade[fun_name]);
});

function atan1_evaluator(exp, cache)
{
    var v1 = exp.parents[0].evaluate(cache);
    if (exp.type.equals(Shade.Types.float_t))
        return Math.atan(v1);
    else {
        return vec.map(v1, Math.atan);
    }
}

function common_fun_2op_evaluator(fun)
{
    return function(exp, cache) {
        var v1 = exp.parents[0].evaluate(cache);
        var v2 = exp.parents[1].evaluate(cache);
        if (exp.type.equals(Shade.Types.float_t))
            return fun(v1, v2);
        else {
            var result = [];
            for (var i=0; i<v1.length; ++i) {
                result.push(fun(v1[i], v2[i]));
            }
            return vec.make(result);
        }
    };
}

function atan()
{
    if (arguments.length == 1) {
        return common_fun_1op("atan", atan1_evaluator)(arguments[0]);
    } else if (arguments.length == 2) {
        var c = common_fun_2op_evaluator(Math.atan2);
        return common_fun_2op("atan", c)(arguments[0], arguments[1]);
    } else {
        throw new Error("atan expects 1 or 2 parameters, got " + arguments.length
                        + " instead.");
    }
}

function broadcast_elements(exp, i) {
    return _.map(exp.parents, function(parent) {
        return parent.type.is_vec() ? parent.element(i) : parent;
    });
}

Shade.atan = atan;
Shade.Exp.atan = function() { return Shade.atan(this); };
Shade.pow = common_fun_2op("pow", common_fun_2op_evaluator(Math.pow));
Shade.Exp.pow = function(other) { return Shade.pow(this, other); };

function mod_min_max_evaluator(op) {
    return function(exp, cache) {
        var values = _.map(exp.parents, function (p) {
            return p.evaluate(cache);
        });
        if (exp.parents[0].type.equals(Shade.Types.float_t))
            return op.apply(op, values);
        else if (exp.parents[0].type.equals(Shade.Types.int_t))
            return op.apply(op, values);
        else if (exp.parents[0].type.equals(exp.parents[1].type)) {
            return vec.make(zipWith(op, values[0], values[1]));
        } else {
            return vec.map(values[0], function(v) {
                return op(v, values[1]);
            });
        }
    };
}

_.each({
    "mod": function(a,b) { return a % b; },
    "min": Math.min,
    "max": Math.max
}, function(op, k) {
    var result = builtin_glsl_function({
        name: k, 
        type_resolving_list: [
            [Shade.Types.float_t,  Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec2,     Shade.Types.vec2,    Shade.Types.vec2],
            [Shade.Types.vec3,     Shade.Types.vec3,    Shade.Types.vec3],
            [Shade.Types.vec4,     Shade.Types.vec4,    Shade.Types.vec4],
            [Shade.Types.float_t,  Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec2,     Shade.Types.float_t, Shade.Types.vec2],
            [Shade.Types.vec3,     Shade.Types.float_t, Shade.Types.vec3],
            [Shade.Types.vec4,     Shade.Types.float_t, Shade.Types.vec4]
        ], 
        evaluator: mod_min_max_evaluator(op),
        element_function: function(exp, i) {
            return result.apply(this, broadcast_elements(exp, i));
        }
    });
    Shade[k] = result;
});

function clamp_evaluator(exp, cache)
{
    function clamp(v, mn, mx) {
        return Math.max(mn, Math.min(mx, v));
    }

    var e1 = exp.parents[0];
    var e2 = exp.parents[1];
    var e3 = exp.parents[2];
    var v1 = e1.evaluate(cache);
    var v2 = e2.evaluate(cache);
    var v3 = e3.evaluate(cache);

    if (e1.type.equals(Shade.Types.float_t)) {
        return clamp(v1, v2, v3);
    } else if (e1.type.equals(e2.type)) {
        return vec.make(zipWith3(clamp, v1, v2, v3));
    } else {
        return vec.map(v1, function(v) {
            return clamp(v, v2, v3);
        });
    }
}

var clamp = builtin_glsl_function({
    name: "clamp", 
    type_resolving_list: [
        [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
        [Shade.Types.vec2,    Shade.Types.vec2,    Shade.Types.vec2,    Shade.Types.vec2],
        [Shade.Types.vec3,    Shade.Types.vec3,    Shade.Types.vec3,    Shade.Types.vec3],
        [Shade.Types.vec4,    Shade.Types.vec4,    Shade.Types.vec4,    Shade.Types.vec4],
        [Shade.Types.vec2,    Shade.Types.float_t, Shade.Types.float_t, Shade.Types.vec2],
        [Shade.Types.vec3,    Shade.Types.float_t, Shade.Types.float_t, Shade.Types.vec3],
        [Shade.Types.vec4,    Shade.Types.float_t, Shade.Types.float_t, Shade.Types.vec4]], 
    evaluator: clamp_evaluator,
    element_function: function (exp, i) {
        return Shade.clamp.apply(this, broadcast_elements(exp, i));
    }
});

Shade.clamp = clamp;

function mix_evaluator(exp, cache)
{
    function mix(left, right, u) {
        return (1-u) * left + u * right;
    }
    var e1 = exp.parents[0];
    var e2 = exp.parents[1];
    var e3 = exp.parents[2];
    var v1 = e1.evaluate(cache);
    var v2 = e2.evaluate(cache);
    var v3 = e3.evaluate(cache);
    if (e1.type.equals(Shade.Types.float_t)) {
        return mix(v1, v2, v3);
    } else if (e2.type.equals(e3.type)) {
        return vec.make(zipWith3(mix, v1, v2, v3));
    } else {
        return vec.make(zipWith(function(v1, v2) {
            return mix(v1, v2, v3);
        }, v1, v2));
    }
}

var mix = builtin_glsl_function({ 
    name: "mix", 
    type_resolving_list: [
        [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
        [Shade.Types.vec2,    Shade.Types.vec2,    Shade.Types.vec2,    Shade.Types.vec2],
        [Shade.Types.vec3,    Shade.Types.vec3,    Shade.Types.vec3,    Shade.Types.vec3],
        [Shade.Types.vec4,    Shade.Types.vec4,    Shade.Types.vec4,    Shade.Types.vec4],
        [Shade.Types.vec2,    Shade.Types.vec2,    Shade.Types.float_t, Shade.Types.vec2],
        [Shade.Types.vec3,    Shade.Types.vec3,    Shade.Types.float_t, Shade.Types.vec3],
        [Shade.Types.vec4,    Shade.Types.vec4,    Shade.Types.float_t, Shade.Types.vec4]],
    evaluator: mix_evaluator,
    element_function: function(exp, i) {
        return Shade.mix.apply(this, broadcast_elements(exp, i));
    }
});
Shade.mix = mix;

var step = builtin_glsl_function({
    name: "step", 
    type_resolving_list: [
        [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
        [Shade.Types.vec2,    Shade.Types.vec2,    Shade.Types.vec2],
        [Shade.Types.vec3,    Shade.Types.vec3,    Shade.Types.vec3],
        [Shade.Types.vec4,    Shade.Types.vec4,    Shade.Types.vec4],
        [Shade.Types.float_t, Shade.Types.vec2,    Shade.Types.vec2],
        [Shade.Types.float_t, Shade.Types.vec3,    Shade.Types.vec3],
        [Shade.Types.float_t, Shade.Types.vec4,    Shade.Types.vec4]], 
    evaluator: function(exp, cache) {
        function step(edge, x) {
            if (x < edge) return 0.0; else return 1.0;
        }
        var e1 = exp.parents[0];
        var e2 = exp.parents[1];
        var v1 = e1.evaluate(cache);
        var v2 = e2.evaluate(cache);
        if (e2.type.equals(Shade.Types.float_t)) {
            return step(v1, v2);
        } if (e1.type.equals(e2.type)) {
            return vec.make(zipWith(step, v1, v2));
        } else {
            return vec.map(v2, function(v) { 
                return step(v1, v);
            });
        }
    },
    element_function: function(exp, i) {
        return Shade.step.apply(this, broadcast_elements(exp, i));
    }
});
Shade.step = step;

var smoothstep = builtin_glsl_function({
    name: "smoothstep", 
    type_resolving_list: [
        [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
        [Shade.Types.vec2,    Shade.Types.vec2,    Shade.Types.vec2,    Shade.Types.vec2],
        [Shade.Types.vec3,    Shade.Types.vec3,    Shade.Types.vec3,    Shade.Types.vec3],
        [Shade.Types.vec4,    Shade.Types.vec4,    Shade.Types.vec4,    Shade.Types.vec4],
        [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.vec2,    Shade.Types.vec2],
        [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.vec3,    Shade.Types.vec3],
        [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.vec4,    Shade.Types.vec4]], 
    evaluator: function(exp, cache) {
        var edge0 = exp.parents[0];
        var edge1 = exp.parents[1];
        var x = exp.parents[2];
        var t = Shade.clamp(x.sub(edge0).div(edge1.sub(edge0)), 0, 1);
        return t.mul(t).mul(Shade.sub(3, t.mul(2))).evaluate(cache);
    }, element_function: function(exp, i) {
        return Shade.smoothstep.apply(this, broadcast_elements(exp, i));
    }
});
Shade.smoothstep = smoothstep;

var norm = builtin_glsl_function({
    name: "length", 
    shade_name: "norm",
    type_resolving_list: [
        [Shade.Types.float_t, Shade.Types.float_t],
        [Shade.Types.vec2,    Shade.Types.float_t],
        [Shade.Types.vec3,    Shade.Types.float_t],
        [Shade.Types.vec4,    Shade.Types.float_t]], 
    evaluator: function(exp, cache) {
        var v = exp.parents[0].evaluate(cache);
        if (exp.parents[0].type.equals(Shade.Types.float_t))
            return Math.abs(v);
        else
            return vec.length(v);
    }});
Shade.norm = norm;

var distance = builtin_glsl_function({
    name: "distance", 
    type_resolving_list: [
        [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
        [Shade.Types.vec2,    Shade.Types.vec2,    Shade.Types.float_t],
        [Shade.Types.vec3,    Shade.Types.vec3,    Shade.Types.float_t],
        [Shade.Types.vec4,    Shade.Types.vec4,    Shade.Types.float_t]], 
    evaluator: function(exp, cache) {
        return exp.parents[0].sub(exp.parents[1]).norm().evaluate(cache);
    }});
Shade.distance = distance;

var dot = builtin_glsl_function({
    name: "dot", 
    type_resolving_list: [
        [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
        [Shade.Types.vec2,    Shade.Types.vec2,    Shade.Types.float_t],
        [Shade.Types.vec3,    Shade.Types.vec3,    Shade.Types.float_t],
        [Shade.Types.vec4,    Shade.Types.vec4,    Shade.Types.float_t]],
    evaluator: function (exp, cache) {
        var v1 = exp.parents[0].evaluate(cache),
            v2 = exp.parents[1].evaluate(cache);
        if (exp.parents[0].type.equals(Shade.Types.float_t)) {
            return v1 * v2;
        } else {
            return vec.dot(v1, v2);
        }
    }});
Shade.dot = dot;

var cross = builtin_glsl_function({
    name: "cross", 
    type_resolving_list: [[Shade.Types.vec3, Shade.Types.vec3, Shade.Types.vec3]], 
    evaluator: function(exp, cache) {
        return vec3.cross(exp.parents[0].evaluate(cache),
                          exp.parents[1].evaluate(cache));
    }, element_function: function (exp, i) {
        var v1 = exp.parents[0];
        var v2 = exp.parents[1];
        if        (i === 0) { return v1.at(1).mul(v2.at(2)).sub(v1.at(2).mul(v2.at(1)));
        } else if (i === 1) { return v1.at(2).mul(v2.at(0)).sub(v1.at(0).mul(v2.at(2)));
        } else if (i === 2) { return v1.at(0).mul(v2.at(1)).sub(v1.at(1).mul(v2.at(0)));
        } else
            throw new Error("invalid element " + i + " for cross");
    }
});
Shade.cross = cross;

var normalize = builtin_glsl_function({
    name: "normalize", 
    type_resolving_list: [
        [Shade.Types.float_t, Shade.Types.float_t],
        [Shade.Types.vec2, Shade.Types.vec2],
        [Shade.Types.vec3, Shade.Types.vec3],
        [Shade.Types.vec4, Shade.Types.vec4]], 
    evaluator: function(exp, cache) {
        return exp.parents[0].div(exp.parents[0].norm()).evaluate(cache);
    }, element_function: function(exp, i) {
        return exp.parents[0].div(exp.parents[0].norm()).element(i);
    }
});
Shade.normalize = normalize;

var faceforward = builtin_glsl_function({
    name: "faceforward", 
    type_resolving_list: [
        [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
        [Shade.Types.vec2, Shade.Types.vec2, Shade.Types.vec2, Shade.Types.vec2],
        [Shade.Types.vec3, Shade.Types.vec3, Shade.Types.vec3, Shade.Types.vec3],
        [Shade.Types.vec4, Shade.Types.vec4, Shade.Types.vec4, Shade.Types.vec4]], 
    evaluator: function(exp, cache) {
        var N = exp.parents[0];
        var I = exp.parents[1];
        var Nref = exp.parents[2];
        if (Nref.dot(I).evaluate(cache) < 0)
            return N.evaluate(cache);
        else
            return Shade.sub(0, N).evaluate(cache);
    }, element_function: function(exp, i) {
        var N = exp.parents[0];
        var I = exp.parents[1];
        var Nref = exp.parents[2];
        return Shade.ifelse(Nref.dot(I).lt(0),
                            N, Shade.neg(N)).element(i);
    }
});
Shade.faceforward = faceforward;

var reflect = builtin_glsl_function({
    name: "reflect", 
    type_resolving_list: [
        [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
        [Shade.Types.vec2, Shade.Types.vec2, Shade.Types.vec2],
        [Shade.Types.vec3, Shade.Types.vec3, Shade.Types.vec3],
        [Shade.Types.vec4, Shade.Types.vec4, Shade.Types.vec4]], 
    evaluator: function(exp, cache) {
        var I = exp.parents[0];
        var N = exp.parents[1];
        return I.sub(Shade.mul(2, N.dot(I), N)).evaluate(cache);
    }, element_function: function(exp, i) {
        var I = exp.parents[0];
        var N = exp.parents[1];
        return I.sub(Shade.mul(2, N.dot(I), N)).element(i);
    }
});
Shade.reflect = reflect;

var refract = builtin_glsl_function({
    name: "refract", 
    type_resolving_list: [
        [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
        [Shade.Types.vec2, Shade.Types.vec2, Shade.Types.float_t, Shade.Types.vec2],
        [Shade.Types.vec3, Shade.Types.vec3, Shade.Types.float_t, Shade.Types.vec3],
        [Shade.Types.vec4, Shade.Types.vec4, Shade.Types.float_t, Shade.Types.vec4]],
    evaluator: function(exp, cache) {
        var I = exp.parents[0];
        var N = exp.parents[1];
        var eta = exp.parents[2];
        
        var k = Shade.sub(1.0, Shade.mul(eta, eta, Shade.sub(1.0, N.dot(I).mul(N.dot(I)))));
        // FIXME This is cute but inefficient
        if (k.evaluate(cache) < 0.0) {
            return vec[I.type.array_size()].create();
        } else {
            return eta.mul(I).sub(eta.mul(N.dot(I)).add(k.sqrt()).mul(N)).evaluate(cache);
        }
    }, element_function: function(exp, i) {
        var I = exp.parents[0];
        var N = exp.parents[1];
        var eta = exp.parents[2];
        var k = Shade.sub(1.0, Shade.mul(eta, eta, Shade.sub(1.0, N.dot(I).mul(N.dot(I)))));
        var refraction = eta.mul(I).sub(eta.mul(N.dot(I)).add(k.sqrt()).mul(N));
        var zero;
        switch (I.type.array_size()) {
        case 2: zero = Shade.vec(0,0); break;
        case 3: zero = Shade.vec(0,0,0); break;
        case 4: zero = Shade.vec(0,0,0,0); break;
        default: throw new Error("internal error");
        };
        return Shade.ifelse(k.lt(0), zero, refraction).element(i);
    }
});
Shade.refract = refract;

var texture2D = builtin_glsl_function({
    name: "texture2D", 
    type_resolving_list: [[Shade.Types.sampler2D, Shade.Types.vec2, Shade.Types.vec4]],
    element_function: function(exp, i) { return exp.at(i); },

    // This line below is necessary to prevent an infinite loop
    // because we're expressing element_function as exp.at();
    element_constant_evaluator: function(exp, i) { return false; },

    evaluator: function(exp) {
        throw new Error("evaluate unsupported on texture2D expressions");
    }
});
Shade.texture2D = texture2D;

_.each(["dFdx", "dFdy", "fwidth"], function(cmd) {
    var fun = builtin_glsl_function({
        name: cmd,
        type_resolving_list: [
            [Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec2, Shade.Types.vec2],
            [Shade.Types.vec3, Shade.Types.vec3],
            [Shade.Types.vec4, Shade.Types.vec4]
        ],

        // This line below is necessary to prevent an infinite loop
        // because we're expressing element_function as exp.at();
        element_function: function(exp, i) { return exp.at(i); },

        element_constant_evaluator: function(exp, i) { return false; },

        evaluator: function(exp) {
            throw new Error("evaluate unsupported on " + cmd + " expressions");
        }
    });
    Shade[cmd] = fun;
    Shade.Exp[cmd] = function() {
        return Shade[cmd](this);
    };
});

Shade.equal = builtin_glsl_function({
    name: "equal", 
    type_resolving_list: [
        [Shade.Types.vec2, Shade.Types.vec2, Shade.Types.bool_t],
        [Shade.Types.vec3, Shade.Types.vec3, Shade.Types.bool_t],
        [Shade.Types.vec4, Shade.Types.vec4, Shade.Types.bool_t],
        [Shade.Types.ivec2, Shade.Types.ivec2, Shade.Types.bool_t],
        [Shade.Types.ivec3, Shade.Types.ivec3, Shade.Types.bool_t],
        [Shade.Types.ivec4, Shade.Types.ivec4, Shade.Types.bool_t],
        [Shade.Types.bvec2, Shade.Types.bvec2, Shade.Types.bool_t],
        [Shade.Types.bvec3, Shade.Types.bvec3, Shade.Types.bool_t],
        [Shade.Types.bvec4, Shade.Types.bvec4, Shade.Types.bool_t]], 
    evaluator: function(exp, cache) {
        var left = exp.parents[0].evaluate(cache);
        var right = exp.parents[1].evaluate(cache);
        return (_.all(zipWith(function (x, y) { return x === y; }),
                      left, right));
    }});
Shade.Exp.equal = function(other) { return Shade.equal(this, other); };

Shade.notEqual = builtin_glsl_function({
    name: "notEqual", 
    type_resolving_list: [
        [Shade.Types.vec2, Shade.Types.vec2, Shade.Types.bool_t],
        [Shade.Types.vec3, Shade.Types.vec3, Shade.Types.bool_t],
        [Shade.Types.vec4, Shade.Types.vec4, Shade.Types.bool_t],
        [Shade.Types.ivec2, Shade.Types.ivec2, Shade.Types.bool_t],
        [Shade.Types.ivec3, Shade.Types.ivec3, Shade.Types.bool_t],
        [Shade.Types.ivec4, Shade.Types.ivec4, Shade.Types.bool_t],
        [Shade.Types.bvec2, Shade.Types.bvec2, Shade.Types.bool_t],
        [Shade.Types.bvec3, Shade.Types.bvec3, Shade.Types.bool_t],
        [Shade.Types.bvec4, Shade.Types.bvec4, Shade.Types.bool_t]], 
    evaluator: function(exp, cache) {
        var left = exp.parents[0].evaluate(cache);
        var right = exp.parents[1].evaluate(cache);
        return !(_.all(zipWith(function (x, y) { return x === y; }),
                       left, right));
    }});
Shade.Exp.notEqual = function(other) { return Shade.notEqual(this, other); };

Shade.lessThan = builtin_glsl_function({
    name: "lessThan", 
    type_resolving_list: [
        [Shade.Types.vec2, Shade.Types.vec2, Shade.Types.bvec2],
        [Shade.Types.vec3, Shade.Types.vec3, Shade.Types.bvec3],
        [Shade.Types.vec4, Shade.Types.vec4, Shade.Types.bvec4],
        [Shade.Types.ivec2, Shade.Types.ivec2, Shade.Types.bvec2],
        [Shade.Types.ivec3, Shade.Types.ivec3, Shade.Types.bvec3],
        [Shade.Types.ivec4, Shade.Types.ivec4, Shade.Types.bvec4]], 
    evaluator: function(exp, cache) {
        var left = exp.parents[0].evaluate(cache);
        var right = exp.parents[1].evaluate(cache);
        return _.map(left, function(x, i) { return x < right[i]; });
    }, element_function: function(exp, i) {
        return Shade.lt.apply(this, broadcast_elements(exp, i));
    }
});
Shade.Exp.lessThan = function(other) { return Shade.lessThan(this, other); };

Shade.lessThanEqual = builtin_glsl_function({
    name: "lessThanEqual", 
    type_resolving_list: [
        [Shade.Types.vec2, Shade.Types.vec2, Shade.Types.bvec2],
        [Shade.Types.vec3, Shade.Types.vec3, Shade.Types.bvec3],
        [Shade.Types.vec4, Shade.Types.vec4, Shade.Types.bvec4],
        [Shade.Types.ivec2, Shade.Types.ivec2, Shade.Types.bvec2],
        [Shade.Types.ivec3, Shade.Types.ivec3, Shade.Types.bvec3],
        [Shade.Types.ivec4, Shade.Types.ivec4, Shade.Types.bvec4]], 
    evaluator: function(exp, cache) {
        var left = exp.parents[0].evaluate(cache);
        var right = exp.parents[1].evaluate(cache);
        return _.map(left, function(x, i) { return x <= right[i]; });
    }, element_function: function(exp, i) {
        return Shade.le.apply(this, broadcast_elements(exp, i));
    }
});
Shade.Exp.lessThanEqual = function(other) { 
    return Shade.lessThanEqual(this, other); 
};

Shade.greaterThan = builtin_glsl_function({
    name: "greaterThan", 
    type_resolving_list: [
        [Shade.Types.vec2, Shade.Types.vec2, Shade.Types.bvec2],
        [Shade.Types.vec3, Shade.Types.vec3, Shade.Types.bvec3],
        [Shade.Types.vec4, Shade.Types.vec4, Shade.Types.bvec4],
        [Shade.Types.ivec2, Shade.Types.ivec2, Shade.Types.bvec2],
        [Shade.Types.ivec3, Shade.Types.ivec3, Shade.Types.bvec3],
        [Shade.Types.ivec4, Shade.Types.ivec4, Shade.Types.bvec4]], 
    evaluator: function(exp, cache) {
        var left = exp.parents[0].evaluate(cache);
        var right = exp.parents[1].evaluate(cache);
        return _.map(left, function(x, i) { return x > right[i]; });
    }, element_function: function(exp, i) {
        return Shade.gt.apply(this, broadcast_elements(exp, i));
    }
});
Shade.Exp.greaterThan = function(other) {
    return Shade.greaterThan(this, other);
};

Shade.greaterThanEqual = builtin_glsl_function({
    name: "greaterThanEqual", 
    type_resolving_list: [
        [Shade.Types.vec2, Shade.Types.vec2, Shade.Types.bvec2],
        [Shade.Types.vec3, Shade.Types.vec3, Shade.Types.bvec3],
        [Shade.Types.vec4, Shade.Types.vec4, Shade.Types.bvec4],
        [Shade.Types.ivec2, Shade.Types.ivec2, Shade.Types.bvec2],
        [Shade.Types.ivec3, Shade.Types.ivec3, Shade.Types.bvec3],
        [Shade.Types.ivec4, Shade.Types.ivec4, Shade.Types.bvec4]], 
    evaluator: function(exp, cache) {
        var left = exp.parents[0].evaluate(cache);
        var right = exp.parents[1].evaluate(cache);
        return _.map(left, function(x, i) { return x >= right[i]; });
    }, element_function: function(exp, i) {
        return Shade.ge.apply(this, broadcast_elements(exp, i));
    }
});
Shade.Exp.greaterThanEqual = function(other) {
    return Shade.greaterThanEqual(this, other);
};

Shade.all = builtin_glsl_function({
    name: "all", 
    type_resolving_list: [
        [Shade.Types.bvec2, Shade.Types.bool_t],
        [Shade.Types.bvec3, Shade.Types.bool_t],
        [Shade.Types.bvec4, Shade.Types.bool_t]], 
    evaluator: function(exp, cache) {
        var v = exp.parents[0].evaluate(cache);
        return _.all(v, function(x) { return x; });
    }});
Shade.Exp.all = function() { return Shade.all(this); };

Shade.any = builtin_glsl_function({
    name: "any", 
    type_resolving_list: [
        [Shade.Types.bvec2, Shade.Types.bool_t],
        [Shade.Types.bvec3, Shade.Types.bool_t],
        [Shade.Types.bvec4, Shade.Types.bool_t]], 
    evaluator: function(exp, cache) {
        var v = exp.parents[0].evaluate(cache);
        return _.any(v, function(x) { return x; });
    }});
Shade.Exp.any = function() { return Shade.any(this); };

Shade.matrixCompMult = builtin_glsl_function({
    name: "matrixCompMult", 
    type_resolving_list: [
        [Shade.Types.mat2, Shade.Types.mat2, Shade.Types.mat2],
        [Shade.Types.mat3, Shade.Types.mat3, Shade.Types.mat3],
        [Shade.Types.mat4, Shade.Types.mat4, Shade.Types.mat4]], 
    evaluator: function(exp, cache) {
        var v1 = exp.parents[0].evaluate(cache);
        var v2 = exp.parents[1].evaluate(cache);
        return mat.map(v1, function(x, i) { return x * v2[i]; });
    }, element_function: function(exp, i) {
        var v1 = exp.parents[0];
        var v2 = exp.parents[1];
        return v1.element(i).mul(v2.element(i));
    }
});
Shade.Exp.matrixCompMult = function(other) {
    return Shade.matrixCompMult(this, other);
};

Shade.Types.int_t.zero   = Shade.constant(0, Shade.Types.int_t);
Shade.Types.float_t.zero = Shade.constant(0);
Shade.Types.vec2.zero    = Shade.constant(vec2.make([0,0]));
Shade.Types.vec3.zero    = Shade.constant(vec3.make([0,0,0]));
Shade.Types.vec4.zero    = Shade.constant(vec4.make([0,0,0,0]));
Shade.Types.mat2.zero    = Shade.constant(mat2.make([0,0,0,0]));
Shade.Types.mat3.zero    = Shade.constant(mat3.make([0,0,0,0,0,0,0,0,0]));
Shade.Types.mat4.zero    = Shade.constant(mat4.make([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]));

// according to the GLSL ES spec, for highp numbers the limit for ints is 2^16, and for floats, 2^52 ~= 10^18
Shade.Types.int_t.infinity   = Shade.constant(65535, Shade.Types.int_t);
Shade.Types.float_t.infinity = Shade.constant(1e18);
Shade.Types.vec2.infinity    = Shade.constant(vec2.make([1e18,1e18]));
Shade.Types.vec3.infinity    = Shade.constant(vec3.make([1e18,1e18,1e18]));
Shade.Types.vec4.infinity    = Shade.constant(vec4.make([1e18,1e18,1e18,1e18]));
Shade.Types.mat2.infinity    = Shade.constant(mat2.make([1e18,1e18,1e18,1e18]));
Shade.Types.mat3.infinity    = Shade.constant(mat3.make([1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18]));
Shade.Types.mat4.infinity    = Shade.constant(mat4.make([1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18]));

Shade.Types.int_t.minus_infinity   = Shade.constant(-65535, Shade.Types.int_t);
Shade.Types.float_t.minus_infinity = Shade.constant(-1e18);
Shade.Types.vec2.minus_infinity    = Shade.constant(vec2.make([-1e18,-1e18]));
Shade.Types.vec3.minus_infinity    = Shade.constant(vec3.make([-1e18,-1e18,-1e18]));
Shade.Types.vec4.minus_infinity    = Shade.constant(vec4.make([-1e18,-1e18,-1e18,-1e18]));
Shade.Types.mat2.minus_infinity    = Shade.constant(mat2.make([-1e18,-1e18,-1e18,-1e18]));
Shade.Types.mat3.minus_infinity    = Shade.constant(mat3.make([-1e18,-1e18,-1e18,-1e18,-1e18,-1e18,-1e18,-1e18,-1e18]));
Shade.Types.mat4.minus_infinity    = Shade.constant(mat4.make([-1e18,-1e18,-1e18,-1e18,-1e18,-1e18,-1e18,-1e18,-1e18,-1e18,-1e18,-1e18,-1e18,-1e18,-1e18,-1e18]));

})();
Shade.seq = function(parents)
{
    if (parents.length == 1) {
        return parents[0];
    }
    return Shade._create_concrete_exp({
        expression_name: "seq",
        parents: parents,
        glsl_expression: function(glsl_name) {
            return this.parents.map(function (n) { return n.glsl_expression(); }).join("; ");
        },
        type: Shade.Types.void_t,
        compile: function (ctx) {},
        evaluate: Shade.memoize_on_guid_dict(function(cache) {
            return this.parents[this.parents.length-1].evaluate(cache);
        })
    });
};
Shade.Optimizer = {};

Shade.Optimizer.debug = false;

Shade.Optimizer._debug_passes = false;

Shade.Optimizer.transform_expression = function(operations)
{
    return function(v) {
        var old_v;
        for (var i=0; i<operations.length; ++i) {
            if (Shade.debug && Shade.Optimizer._debug_passes) {
                old_v = v;
            }
            var test = operations[i][0];
            var fun = operations[i][1];
            var old_guid = v.guid;
            if (Shade.debug && Shade.Optimizer._debug_passes) {
                console.log("Pass",operations[i][2],"starting");
            }
            if (operations[i][3]) {
                var this_old_guid;
                do {
                    this_old_guid = v.guid;
                    v = v.replace_if(test, fun);
                } while (v.guid !== this_old_guid);
            } else {
                v = v.replace_if(test, fun);
            }
            var new_guid = v.guid;
            if (Shade.debug && Shade.Optimizer._debug_passes) {
                console.log("Pass",operations[i][2],"succeeded");
                if (old_guid != new_guid) {
                    console.log("Before: ");
                    old_v.debug_print();
                    console.log("After: ");
                    v.debug_print();
                }
            }
        }
        return v;
    };
};

Shade.Optimizer.is_constant = function(exp)
{
    return exp.is_constant();
};

Shade.Optimizer.replace_with_constant = function(exp)
{
    var v = exp.constant_value();
    var result = Shade.constant(v, exp.type);
    if (!exp.type.equals(result.type)) {
        throw new Error("Shade.constant internal error: type was not preserved");
    }
    return result;
};

Shade.Optimizer.is_zero = function(exp)
{
    if (!exp.is_constant())
        return false;
    var v = exp.constant_value();
    var t = Shade.Types.type_of(v);
    if (t.is_pod())
        return v === 0;
    if (t.is_vec())
        return _.all(v, function (x) { return x === 0; });
    if (t.is_mat())
        return _.all(v, function (x) { return x === 0; });
    return false;
};

Shade.Optimizer.is_mul_identity = function(exp)
{
    if (!exp.is_constant())
        return false;
    var v = exp.constant_value();
    var t = Shade.Types.type_of(v);
    if (t.is_pod())
        return v === 1;
    if (t.is_vec()) {
        switch (v.length) {
        case 2: return vec.equal(v, vec.make([1,1]));
        case 3: return vec.equal(v, vec.make([1,1,1]));
        case 4: return vec.equal(v, vec.make([1,1,1,1]));
        default:
            throw new Error("bad vec length: " + v.length);
        }
    }
    if (t.is_mat())
        return mat.equal(v, mat[Math.sqrt(v.length)].identity());
    return false;
};

Shade.Optimizer.is_times_zero = function(exp)
{
    return exp.expression_type === 'operator*' &&
        (Shade.Optimizer.is_zero(exp.parents[0]) ||
         Shade.Optimizer.is_zero(exp.parents[1]));
};

Shade.Optimizer.is_plus_zero = function(exp)
{
    return exp.expression_type === 'operator+' &&
        (Shade.Optimizer.is_zero(exp.parents[0]) ||
         Shade.Optimizer.is_zero(exp.parents[1]));
};

Shade.Optimizer.replace_with_nonzero = function(exp)
{
    if (Shade.Optimizer.is_zero(exp.parents[0]))
        return exp.parents[1];
    if (Shade.Optimizer.is_zero(exp.parents[1]))
        return exp.parents[0];
    throw new Error("internal error: no zero value on input to replace_with_nonzero");
};


Shade.Optimizer.is_times_one = function(exp)
{
    if (exp.expression_type !== 'operator*')
        return false;
    var t1 = exp.parents[0].type, t2 = exp.parents[1].type;
    var ft = Shade.Types.float_t;
    if (t1.equals(t2)) {
        return (Shade.Optimizer.is_mul_identity(exp.parents[0]) ||
                Shade.Optimizer.is_mul_identity(exp.parents[1]));
    } else if (!t1.equals(ft) && t2.equals(ft)) {
        return Shade.Optimizer.is_mul_identity(exp.parents[1]);
    } else if (t1.equals(ft) && !t2.equals(ft)) {
        return Shade.Optimizer.is_mul_identity(exp.parents[0]);
    } else if (t1.is_vec() && t2.is_mat()) {
        return Shade.Optimizer.is_mul_identity(exp.parents[1]);
    } else if (t1.is_mat() && t2.is_vec()) {
        return Shade.Optimizer.is_mul_identity(exp.parents[0]);
    } else {
        throw new Error("internal error on Shade.Optimizer.is_times_one");
    }
};

Shade.Optimizer.replace_with_notone = function(exp)
{
    var t1 = exp.parents[0].type, t2 = exp.parents[1].type;
    var ft = Shade.Types.float_t;
    if (t1.equals(t2)) {
        if (Shade.Optimizer.is_mul_identity(exp.parents[0])) {
            return exp.parents[1];
        } else if (Shade.Optimizer.is_mul_identity(exp.parents[1])) {
            return exp.parents[0];
        } else {
            throw new Error("internal error on Shade.Optimizer.replace_with_notone");
        }
    } else if (!t1.equals(ft) && t2.equals(ft)) {
        return exp.parents[0];
    } else if (t1.equals(ft) && !t2.equals(ft)) {
        return exp.parents[1];
    } else if (t1.is_vec() && t2.is_mat()) {
        return exp.parents[0];
    } else if (t1.is_mat() && t2.is_vec()) {
        return exp.parents[1];
    }
    throw new Error("internal error: no is_mul_identity value on input to replace_with_notone");
};

Shade.Optimizer.replace_with_zero = function(x)
{
    if (x.type.equals(Shade.Types.float_t))
        return Shade.constant(0);
    if (x.type.equals(Shade.Types.int_t))
        return Shade.as_int(0);
    if (x.type.equals(Shade.Types.vec2))
        return Shade.constant(vec2.create());
    if (x.type.equals(Shade.Types.vec3))
        return Shade.constant(vec3.create());
    if (x.type.equals(Shade.Types.vec4))
        return Shade.constant(vec4.create());
    if (x.type.equals(Shade.Types.mat2))
        return Shade.constant(mat2.create());
    if (x.type.equals(Shade.Types.mat3))
        return Shade.constant(mat3.create());
    if (x.type.equals(Shade.Types.mat4))
        return Shade.constant(mat4.create());
    throw new Error("internal error: not a type replaceable with zero");
};

Shade.Optimizer.vec_at_constant_index = function(exp)
{
    if (exp.expression_type !== "index")
        return false;
    if (!exp.parents[1].is_constant())
        return false;
    var v = exp.parents[1].constant_value();
    if (Lux.type_of(v) !== "number")
        return false;
    var t = exp.parents[0].type;
    if (t.equals(Shade.Types.vec2) && (v >= 0) && (v <= 1))
        return true;
    if (t.equals(Shade.Types.vec3) && (v >= 0) && (v <= 2))
        return true;
    if (t.equals(Shade.Types.vec4) && (v >= 0) && (v <= 3))
        return true;
    return false;
};

Shade.Optimizer.replace_vec_at_constant_with_swizzle = function(exp)
{
    var v = exp.parents[1].constant_value();
    if (v === 0) return exp.parents[0].swizzle("x");
    if (v === 1) return exp.parents[0].swizzle("y");
    if (v === 2) return exp.parents[0].swizzle("z");
    if (v === 3) return exp.parents[0].swizzle("w");
    throw new Error("internal error on Shade.Optimizer.replace_vec_at_constant_with_swizzle");
};

Shade.Optimizer.is_logical_and_with_constant = function(exp)
{
    return (exp.expression_type === "operator&&" &&
            exp.parents[0].is_constant());
};

Shade.Optimizer.replace_logical_and_with_constant = function(exp)
{
    if (exp.parents[0].constant_value()) {
        return exp.parents[1];
    } else {
        return Shade.make(false);
    }
};

Shade.Optimizer.is_logical_or_with_constant = function(exp)
{
    return (exp.expression_type === "operator||" &&
            exp.parents[0].is_constant());
};

Shade.Optimizer.replace_logical_or_with_constant = function(exp)
{
    if (exp.parents[0].constant_value()) {
        return Shade.make(true);
    } else {
        return exp.parents[1];
    }
};

Shade.Optimizer.is_never_discarding = function(exp)
{
    return (exp.expression_type === "discard_if" &&
            exp.parents[0].is_constant() &&
            !exp.parents[0].constant_value());
};

Shade.Optimizer.remove_discard = function(exp)
{
    return exp.parents[1];
};

Shade.Optimizer.is_known_branch = function(exp)
{
    var result = (exp.expression_type === "ifelse" &&
                  exp.parents[0].is_constant());
    return result;
};

Shade.Optimizer.prune_ifelse_branch = function(exp)
{
    if (exp.parents[0].constant_value()) {
        return exp.parents[1];
    } else {
        return exp.parents[2];
    }
};

// We provide saner names for program targets so users don't
// need to memorize gl_FragColor, gl_Position and gl_PointSize.
//
// However, these names should still work, in case the users
// want to have GLSL-familiar names.
Shade.canonicalize_program_object = function(program_obj)
{
    var result = {};
    var canonicalization_map = {
        'color': 'gl_FragColor',
        'position': 'gl_Position',
        'screen_position': 'gl_Position',
        'point_size': 'gl_PointSize'
    };

    _.each(program_obj, function(v, k) {
        var transposed_key = (k in canonicalization_map) ?
            canonicalization_map[k] : k;
        result[transposed_key] = v;
    });
    return result;
};

//////////////////////////////////////////////////////////////////////////////
/*
 * Shade.program is the main procedure that compiles a Shade
 * appearance object (which is an object with fields containing Shade
 * expressions like 'position' and 'color') to a WebGL program (a pair
 * of vertex and fragment shaders). It performs a variety of optimizations and
 * program transformations to support a more uniform programming model.
 * 
 * The sequence of transformations is as follows:
 * 
 *  - An appearance object is first canonicalized (which transforms names like 
 *    color to gl_FragColor)
 * 
 *  - There are some expressions that are valid in vertex shader contexts but 
 *    invalid in fragment shader contexts, and vice-versa (eg. attributes can 
 *    only be read in vertex shaders; dFdx can only be evaluated in fragment 
 *    shaders; the discard statement can only appear in a fragment shader). 
 *    This means we must move expressions around:
 * 
 *    - expressions that can be hoisted from the vertex shader to the fragment 
 *      shader are hoisted. Currently, this only includes discard_if 
 *      statements.
 * 
 *    - expressions that must be hoisted from the fragment-shader computations 
 *      to the vertex-shader computations are hoisted. For example, WebGL 
 *      attributes can only be read on vertex shaders, and so Shade.program 
 *      introduces a varying variable to communicate the value to the fragment 
 *      shader.
 * 
 *  - At the end of this stage, some fragment-shader only expressions might 
 *    remain on vertex-shader computations. These are invalid WebGL programs and
 *    Shade.program must fail here (The canonical example is: 
 *
 *    {
 *        position: Shade.dFdx(attribute)
 *    })
 * 
 *  - After relocating expressions, vertex and fragment shaders are optimized
 *    using a variety of simple expression rewriting (constant folding, etc).
 */

Shade.program = function(program_obj)
{
    program_obj = Shade.canonicalize_program_object(program_obj);
    var vp_obj = {}, fp_obj = {};

    _.each(program_obj, function(v, k) {
        v = Shade.make(v);
        if (k === 'gl_FragColor') {
            if (!v.type.equals(Shade.Types.vec4)) {
                throw new Error("color attribute must be of type vec4, got " +
                    v.type.repr() + " instead");
            }
            fp_obj.gl_FragColor = v;
        } else if (k === 'gl_Position') {
            if (!v.type.equals(Shade.Types.vec4)) {
                throw new Error("position attribute must be of type vec4, got " +
                    v.type.repr() + " instead");
            }
            vp_obj.gl_Position = v;
        } else if (k === 'gl_PointSize') {
            if (!v.type.equals(Shade.Types.float_t)) {
                throw new Error("color attribute must be of type float, got " +
                    v.type.repr() + " instead");
            }
            vp_obj.gl_PointSize = v;
        } else if (k.substr(0, 3) === 'gl_') {
            // FIXME: Can we sensibly work around these?
            throw new Error("gl_* are reserved GLSL names");
        } else
            vp_obj[k] = v;
    });

    var vp_compile = Shade.CompilationContext(Shade.VERTEX_PROGRAM_COMPILE),
        fp_compile = Shade.CompilationContext(Shade.FRAGMENT_PROGRAM_COMPILE);

    var vp_exprs = [], fp_exprs = [];

    function is_attribute(x) {
        return x.expression_type === 'attribute';
    }
    function is_varying(x) {
        return x.expression_type === 'varying';
    }
    function is_per_vertex(x) {
        return x.stage === 'vertex';
    }
    var varying_names = [];
    function hoist_to_varying(exp) {
        var varying_name = Shade.unique_name();
        vp_obj[varying_name] = exp;
        varying_names.push(varying_name);
        var result = Shade.varying(varying_name, exp.type);
        if (exp._must_be_function_call) {
            result._must_be_function_call = true;
        }
        return result;
    }

    //////////////////////////////////////////////////////////////////////////
    // moving discard statements on vertex program to fragment program

    var shade_values_vp_obj = Shade(_.object(_.filter(
        _.pairs(vp_obj), function(lst) {
            var k = lst[0], v = lst[1];
            return Lux.is_shade_expression(v);
        })));

    var vp_discard_conditions = {};
    shade_values_vp_obj = shade_values_vp_obj.replace_if(function(x) {
        return x.expression_type === 'discard_if';
    }, function(exp) {
        vp_discard_conditions[exp.parents[1].guid] = exp.parents[1];
        return exp.parents[0];
    });

    var disallowed_vertex_expressions = shade_values_vp_obj.find_if(function(x) {
        if (x.expression_type === 'builtin_function{dFdx}') return true;
        if (x.expression_type === 'builtin_function{dFdy}') return true;
        if (x.expression_type === 'builtin_function{fwidth}') return true;
        return false;
    });
    if (disallowed_vertex_expressions.length > 0) {
        throw "'" + disallowed_vertex_expressions[0] + "' not allowed in vertex expression";
    }

    vp_obj = _.object(shade_values_vp_obj.fields, shade_values_vp_obj.parents);
    vp_discard_conditions = _.values(vp_discard_conditions);

    if (vp_discard_conditions.length) {
        var vp_discard_condition = _.reduce(vp_discard_conditions, function(a, b) {
            return a.or(b);
        }).ifelse(1, 0).gt(0);
        fp_obj.gl_FragColor = fp_obj.gl_FragColor.discard_if(vp_discard_condition);
    }

    

    var common_sequence = [
        [Shade.Optimizer.is_times_zero, Shade.Optimizer.replace_with_zero, 
         "v * 0", true]
       ,[Shade.Optimizer.is_times_one, Shade.Optimizer.replace_with_notone, 
         "v * 1", true]
       ,[Shade.Optimizer.is_plus_zero, Shade.Optimizer.replace_with_nonzero,
         "v + 0", true]
       ,[Shade.Optimizer.is_never_discarding,
         Shade.Optimizer.remove_discard, "discard_if(false)"]
       ,[Shade.Optimizer.is_known_branch,
         Shade.Optimizer.prune_ifelse_branch, "constant?a:b", true]
       ,[Shade.Optimizer.vec_at_constant_index, 
         Shade.Optimizer.replace_vec_at_constant_with_swizzle, "vec[constant_ix]"]
       ,[Shade.Optimizer.is_constant,
         Shade.Optimizer.replace_with_constant, "constant folding"]
       ,[Shade.Optimizer.is_logical_or_with_constant,
         Shade.Optimizer.replace_logical_or_with_constant, "constant||v", true]
       ,[Shade.Optimizer.is_logical_and_with_constant,
         Shade.Optimizer.replace_logical_and_with_constant, "constant&&v", true]
    ];

    // explicit per-vertex hoisting must happen before is_attribute hoisting,
    // otherwise we might end up reading from a varying in the vertex program,
    // which is undefined behavior
    var fp_sequence = [
        [is_per_vertex, hoist_to_varying, "per-vertex hoisting"],
        [is_attribute, hoist_to_varying, "attribute hoisting"]  
    ];
    fp_sequence.push.apply(fp_sequence, common_sequence);
    var vp_sequence = common_sequence;
    var fp_optimize = Shade.Optimizer.transform_expression(fp_sequence);
    var vp_optimize = Shade.Optimizer.transform_expression(vp_sequence);

    var used_varying_names = [];
    _.each(fp_obj, function(v, k) {
        try {
            v = fp_optimize(v);
        } catch (e) {
            console.error("fragment program optimization crashed. This is a bug. Please send the following JSON object in the bug report:");
            console.error(JSON.stringify(v.json()));
            throw e;
        }
        used_varying_names.push.apply(used_varying_names,
                                      _.map(v.find_if(is_varying),
                                            function (v) { 
                                                return v._varying_name;
                                            }));
        fp_exprs.push(Shade.set(v, k));
    });

    _.each(vp_obj, function(v, k) {
        var new_v;
        if ((varying_names.indexOf(k) === -1) ||
            (used_varying_names.indexOf(k) !== -1)) {
            try {
                new_v = vp_optimize(v);
            } catch (e) {
                console.error("vertex program optimization crashed. This is a bug. Please send the following JSON object in the bug report:");
                console.error(JSON.stringify(v.json()));
                throw e;
            }
            vp_exprs.push(Shade.set(new_v, k));
        }
    });

    var vp_exp = Shade.seq(vp_exprs);
    var fp_exp = Shade.seq(fp_exprs);

    vp_compile.compile(vp_exp);
    fp_compile.compile(fp_exp);
    var vp_source = vp_compile.source(),
        fp_source = fp_compile.source();
    if (Shade.debug) {
        if (Shade.debug && Shade.Optimizer._debug_passes) {
            console.log("Vertex program final AST:");
            vp_exp.debug_print();
        }
        console.log("Vertex program source:");
        console.log(vp_source);
        // vp_exp.debug_print();
        
        if (Shade.debug && Shade.Optimizer._debug_passes) {
            console.log("Fragment program final AST:");
            fp_exp.debug_print();
        }
        console.log("Fragment program source:");
        console.log(fp_source);
        // fp_exp.debug_print();
    }
    var result = Lux.program(vp_source, fp_source);
    result.attribute_buffers = vp_exp.attribute_buffers();
    result.uniforms = _.union(vp_exp.uniforms(), fp_exp.uniforms());
    return result;
};
Shade.round = Shade.make(function(v) {
    return v.add(0.5).floor();
});
Shade.Exp.round = function() { return Shade.round(this); };
Shade.Utils = {};
// given a list of values, returns a function which, when given a
// value between 0 and 1, returns the appropriate linearly interpolated
// value.

// Hat function reconstruction

Shade.Utils.lerp = function(lst) {
    var new_lst = _.toArray(lst);
    new_lst.push(new_lst[new_lst.length-1]);
    // repeat last to make index calc easier
    return function(v) {
        var colors_exp = Shade.array(new_lst);
        v = Shade.clamp(v, 0, 1).mul(new_lst.length-2);
        var u = v.fract();
        var ix = v.floor();
        return Shade.mix(colors_exp.at(ix),
                         colors_exp.at(ix.add(1)),
                         u);
    };
};
// given a list of values, returns a function which, when given a
// value between 0 and l, returns the value of the index;

// box function reconstruction

Shade.Utils.choose = function(lst) {
    var new_lst = _.toArray(lst);
    var vals_exp = Shade.array(new_lst);
    return function(v) {
        v = Shade.clamp(v, 0, new_lst.length-1).floor().as_int();
        return vals_exp.at(v);
    };
};
// FIXME remove from API
Shade.Utils.linear = function(f1, f2, t1, t2)
{
    console.log("Shade.Utils.linear is deprecated; use Shade.Scale.linear instead");
    var df = Shade.sub(f2, f1), dt = Shade.sub(t2, t1);
    return function(x) {
        return Shade.make(x).sub(f1).mul(dt.div(df)).add(t1);
    };
};
// returns a linear transformation of the coordinates such that the given list of values
// fits between [0, 1]

Shade.Utils.fit = function(data) {
    // this makes float attribute buffers work, but it might be confusing to the
    // user that there exist values v for which Shade.Utils.fit(v) works,
    // but Shade.Utils.fit(Shade.make(v)) does not
    var t = data._shade_type;
    if (t === 'attribute_buffer') {
        if (data.itemSize !== 1)
            throw new Error("only dimension-1 attribute buffers are supported");
        if (_.isUndefined(data.array))
            throw new Error("Shade.Utils.fit on attribute buffers requires keep_array:true in options");
        data = data.array;
    }

    var min = _.min(data), max = _.max(data);
    return Shade.Scale.linear({domain: [min, max]},
                              {range: [0, 1]});
};
// replicates OpenGL's fog functionality

(function() {

var default_color = Shade.vec(0,0,0,0);

Shade.gl_fog = function(opts)
{
    opts = _.defaults(opts, { mode: "exp",
                              density: 1,
                              start: 0,
                              end: 1,
                              fog_color: default_color,
                              per_vertex: false
                            });
    var mode = opts.mode || "exp";
    var fog_color = Shade.make(opts.fog_color);
    var color = opts.color;
    var z = Shade.make(opts.z);
    var f, density, start;

    if (opts.mode === "exp") {
        density = Shade.make(opts.density);
        start = Shade.make(opts.start);
        f = z.sub(start).mul(density).exp();
    } else if (mode === "exp2") {
        density = Shade.make(opts.density);
        start = Shade.make(opts.start);
        f = z.sub(start).min(0).mul(density);
        f = f.mul(f);
        f = f.neg().exp();
    } else if (mode === "linear") {
        start = Shade.make(opts.start);
        var end = Shade.make(opts.end);
        end = Shade.make(end);
        start = Shade.make(start);
        f = end.sub(z).div(end.sub(start));
    }
    f = f.clamp(0, 1);
    if (opts.per_vertex)
        f = f.per_vertex();
    return Shade.mix(fog_color, color, f);
};

})();
Shade.cosh = Shade(function(v)
{
    return v.exp().add(v.neg().exp()).div(2);
});
Shade.Exp.cosh = function() { return Shade.cosh(this); };
Shade.sinh = Shade(function(v)
{
    return v.exp().sub(v.neg().exp()).div(2);
});
Shade.Exp.sinh = function() { return Shade.sinh(this); };
Shade.tanh = Shade(function(v)
{
    return v.sinh().div(v.cosh());
});
Shade.Exp.tanh = function() { return Shade.tanh(this); };
(function() {

var logical_operator_binexp = function(exp1, exp2, operator_name, evaluator,
                                       parent_is_unconditional, shade_name)
{
    parent_is_unconditional = parent_is_unconditional ||
        function (i) { return true; };
    return Shade._create_concrete_value_exp({
        parents: [exp1, exp2],
        type: Shade.Types.bool_t,
        expression_type: "operator" + operator_name,
        value: function() {
            return "(" + this.parents[0].glsl_expression() + " " + operator_name + " " +
                this.parents[1].glsl_expression() + ")";
        },
        evaluate: Shade.memoize_on_guid_dict(function(cache) {
            return evaluator(this, cache);
        }),
        parent_is_unconditional: parent_is_unconditional,
        _json_key: function() { return shade_name; }
    });
};

var lift_binfun_to_evaluator = function(binfun) {
    return function(exp, cache) {
        var exp1 = exp.parents[0], exp2 = exp.parents[1];
        return binfun(exp1.evaluate(cache), exp2.evaluate(cache));
    };
};

var logical_operator_exp = function(operator_name, binary_evaluator,
                                    parent_is_unconditional, shade_name)
{
    return function() {
        if (arguments.length === 0) 
            throw new Error("operator " + operator_name 
                   + " requires at least 1 parameter");
        if (arguments.length === 1) return Shade(arguments[0]).as_bool();
        var first = Shade(arguments[0]);
        if (!first.type.equals(Shade.Types.bool_t))
            throw new Error("operator " + operator_name + 
                   " requires booleans, got argument 1 as " +
                   arguments[0].type.repr() + " instead.");
        var current_result = first;
        for (var i=1; i<arguments.length; ++i) {
            var next = Shade(arguments[i]);
            if (!next.type.equals(Shade.Types.bool_t))
                throw new Error("operator " + operator_name + 
                       " requires booleans, got argument " + (i+1) +
                       " as " + next.type.repr() + " instead.");
            current_result = logical_operator_binexp(
                current_result, next,
                operator_name, binary_evaluator,
                parent_is_unconditional, shade_name);
        }
        return current_result;
    };
};

Shade.or = logical_operator_exp(
    "||", lift_binfun_to_evaluator(function(a, b) { return a || b; }),
    function(i) { return i === 0; }, "or"
);

Shade.Exp.or = function(other)
{
    return Shade.or(this, other);
};

Shade.and = logical_operator_exp(
    "&&", lift_binfun_to_evaluator(function(a, b) { return a && b; }),
    function(i) { return i === 0; }, "and"
);

Shade.Exp.and = function(other)
{
    return Shade.and(this, other);
};

Shade.xor = logical_operator_exp(
    "^^", lift_binfun_to_evaluator(function(a, b) { return ~~(a ^ b); }), undefined, "xor");
Shade.Exp.xor = function(other)
{
    return Shade.xor(this, other);
};

Shade.not = Shade(function(exp)
{
    if (!exp.type.equals(Shade.Types.bool_t)) {
        throw new Error("logical_not requires bool expression");
    }
    return Shade._create_concrete_value_exp({
        parents: [exp],
        type: Shade.Types.bool_t,
        expression_type: "operator!",
        value: function() {
            return "(!" + this.parents[0].glsl_expression() + ")";
        },
        evaluate: Shade.memoize_on_guid_dict(function(cache) {
            return !this.parents[0].evaluate(cache);
        }),
        _json_key: function() { return "not"; }
    });
});

Shade.Exp.not = function() { return Shade.not(this); };

var comparison_operator_exp = function(operator_name, type_checker, binary_evaluator, shade_name)
{
    return Shade(function(first, second) {
        type_checker(first.type, second.type);

        return logical_operator_binexp(
            first, second, operator_name, binary_evaluator, undefined, shade_name);
    });
};

var inequality_type_checker = function(name) {
    return function(t1, t2) {
        if (!(t1.equals(Shade.Types.float_t) && 
              t2.equals(Shade.Types.float_t)) &&
            !(t1.equals(Shade.Types.int_t) && 
              t2.equals(Shade.Types.int_t)))
            throw new Error("operator" + name + 
                   " requires two ints or two floats, got " +
                   t1.repr() + " and " + t2.repr() +
                   " instead.");
    };
};

var equality_type_checker = function(name) {
    return function(t1, t2) {
        if (!t1.equals(t2))
            throw new Error("operator" + name +
                   " requires same types, got " +
                   t1.repr() + " and " + t2.repr() +
                   " instead.");
        if (t1.is_array() && !t1.is_vec() && !t1.is_mat())
            throw new Error("operator" + name +
                   " does not support arrays");
    };
};

Shade.lt = comparison_operator_exp("<", inequality_type_checker("<"),
    lift_binfun_to_evaluator(function(a, b) { return a < b; }), "lt");
Shade.Exp.lt = function(other) { return Shade.lt(this, other); };

Shade.le = comparison_operator_exp("<=", inequality_type_checker("<="),
    lift_binfun_to_evaluator(function(a, b) { return a <= b; }), "le");
Shade.Exp.le = function(other) { return Shade.le(this, other); };

Shade.gt = comparison_operator_exp(">", inequality_type_checker(">"),
    lift_binfun_to_evaluator(function(a, b) { return a > b; }), "gt");
Shade.Exp.gt = function(other) { return Shade.gt(this, other); };

Shade.ge = comparison_operator_exp(">=", inequality_type_checker(">="),
    lift_binfun_to_evaluator(function(a, b) { return a >= b; }), "ge");
Shade.Exp.ge = function(other) { return Shade.ge(this, other); };

Shade.eq = comparison_operator_exp("==", equality_type_checker("=="),
    lift_binfun_to_evaluator(function(a, b) {
        if (Lux.type_of(a) === 'array') {
            return _.all(_.map(_.zip(a, b),
                               function(v) { return v[0] === v[1]; }),
                         function (x) { return x; });
        }
        return Shade.Types.type_of(a).value_equals(a, b);
    }), "eq");
Shade.Exp.eq = function(other) { return Shade.eq(this, other); };

Shade.ne = comparison_operator_exp("!=", equality_type_checker("!="),
    lift_binfun_to_evaluator(function(a, b) { 
        if (Lux.type_of(a) === 'array') {
            return _.any(_.map(_.zip(a, b),
                               function(v) { return v[0] !== v[1]; } ),
                         function (x) { return x; });
        }
        return !Shade.Types.type_of(a).value_equals(a, b);
    }), "ne");
Shade.Exp.ne = function(other) { return Shade.ne(this, other); };

// component-wise comparisons are defined on builtins.js

})();
Shade.ifelse = function(condition, if_true, if_false)
{
    condition = Shade.make(condition);
    if_true = Shade.make(if_true);
    if_false = Shade.make(if_false);

    if (!if_true.type.equals(if_false.type))
        throw new Error("ifelse return expressions must have same types");
    if (!condition.type.equals(condition.type))
        throw new Error("ifelse condition must be of type bool");

    return Shade._create_concrete_value_exp( {
        parents: [condition, if_true, if_false],
        type: if_true.type,
        expression_type: "ifelse",
        // FIXME: works around Chrome Bug ID 103053
        _must_be_function_call: true,
        value: function() {
            return "(" + this.parents[0].glsl_expression() + "?"
                + this.parents[1].glsl_expression() + ":"
                + this.parents[2].glsl_expression() + ")";
        },
        /*
         * The methods is_constant(), constant_value() and evaluate() for
         * Shade.ifelse are designed to handle cases like the following:
         * 
         * Shade.ifelse(Shade.parameter("bool"), 3, 3).is_constant()
         * 
         * That expression should be true.
         * 
         */ 
        constant_value: function() {
            if (!this.parents[0].is_constant()) {
                // This only gets called when this.is_constant() holds, so
                // it must be that this.parents[1].constant_value() == 
                // this.parents[2].constant_value(); we return either
                return this.parents[1].constant_value();
            } else {
                return (this.parents[0].constant_value() ?
                        this.parents[1].constant_value() :
                        this.parents[2].constant_value());
            }
        },
        evaluate: Shade.memoize_on_guid_dict(function(cache) {
            if (this.parents[1].is_constant() &&
                this.parents[2].is_constant() &&
                this.type.value_equals(this.parents[1].constant_value(),
                                       this.parents[2].constant_value())) {
                // if both sides of the branch have the same value, then
                // this evaluates to the constant, regardless of the condition.
                return this.parents[1].constant_value();
            } else {
                return this.parents[0].evaluate(cache)?
                    this.parents[1].evaluate(cache):
                    this.parents[2].evaluate(cache);
            };
        }),
        is_constant: function() {
            if (!this.parents[0].is_constant()) {
                // if condition is not constant, 
                // then expression is only constant if sides always
                // evaluate to same values.
                if (this.parents[1].is_constant() && 
                    this.parents[2].is_constant()) {
                    var v1 = this.parents[1].constant_value();
                    var v2 = this.parents[2].constant_value();
                    return this.type.value_equals(v1, v2);
                } else {
                    return false;
                }
            } else {
                // if condition is constant, then
                // the expression is constant if the appropriate
                // side of the evaluation is constant.
                return (this.parents[0].constant_value() ?
                        this.parents[1].is_constant() :
                        this.parents[2].is_constant());
            }
        },
        element: function(i) {
            return Shade.ifelse(this.parents[0],
                                   this.parents[1].element(i),
                                   this.parents[2].element(i));
        },
        element_constant_value: function(i) {
            if (!this.parents[0].is_constant()) {
                // This only gets called when this.is_constant() holds, so
                // it must be that this.parents[1].constant_value() == 
                // this.parents[2].constant_value(); we return either
                return this.parents[1].element_constant_value(i);
            } else {
                return (this.parents[0].constant_value() ?
                        this.parents[1].element_constant_value(i) :
                        this.parents[2].element_constant_value(i));
            }
        },
        element_is_constant: function(i) {
            if (!this.parents[0].is_constant()) {
                // if condition is not constant, 
                // then expression is only constant if sides always
                // evaluate to same values.
                if (this.parents[1].element_is_constant(i) && 
                    this.parents[2].element_is_constant(i)) {
                    var v1 = this.parents[1].element_constant_value(i);
                    var v2 = this.parents[2].element_constant_value(i);
                    return this.type.element_type(i).value_equals(v1, v2);
                } else {
                    return false;
                }
            } else {
                // if condition is constant, then
                // the expression is constant if the appropriate
                // side of the evaluation is constant.
                return (this.parents[0].constant_value() ?
                        this.parents[1].element_is_constant(i) :
                        this.parents[2].element_is_constant(i));
            }
        },
        parent_is_unconditional: function(i) {
            return i === 0;
        }
    });
};

Shade.Exp.ifelse = function(if_true, if_false)
{
    return Shade.ifelse(this, if_true, if_false);
};
// FIXME This should be Shade.rotation = Shade.make(function() ...
// but before I do that I have to make sure that at this point
// in the source Shade.make actually exists.

Shade.rotation = Shade(function(angle, axis)
{
    if (axis.type.equals(Shade.Types.vec4))
        axis = axis.swizzle("xyz");
    axis = axis.normalize();

    var s = angle.sin(), c = angle.cos(), t = Shade.sub(1, c);
    var x = axis.at(0), y = axis.at(1), z = axis.at(2);

    return Shade.mat(Shade.vec(x.mul(x).mul(t).add(c),
                               y.mul(x).mul(t).add(z.mul(s)),
                               z.mul(x).mul(t).sub(y.mul(s)),
                               0),
                     Shade.vec(x.mul(y).mul(t).sub(z.mul(s)),
                               y.mul(y).mul(t).add(c),
                               z.mul(y).mul(t).add(x.mul(s)),
                               0),
                     Shade.vec(x.mul(z).mul(t).add(y.mul(s)),
                               y.mul(z).mul(t).sub(x.mul(s)),
                               z.mul(z).mul(t).add(c),
                               0),
                     Shade.vec(0,0,0,1));
});
Shade.translation = Shade(function() {
    function from_vec3(v) {
        return Shade.mat(Shade.vec(1,0,0,0),
                         Shade.vec(0,1,0,0),
                         Shade.vec(0,0,1,0),
                         Shade.vec(v, 1));
    }
    if (arguments.length === 1) {
        var t = arguments[0];
        if (!t.type.equals(Shade.Types.vec3)) {
            throw new Error("expected vec3, got " + t.type.repr() + "instead");
        }
        return from_vec3(t);
    } else if (arguments.length === 2) {
        var x = arguments[0], y = arguments[1];
        if (!x.type.equals(Shade.Types.float_t)) {
            throw new Error("expected float, got " + x.type.repr() + "instead");
        }
        if (!y.type.equals(Shade.Types.float_t)) {
            throw new Error("expected float, got " + y.type.repr() + "instead");
        }
        return from_vec3(Shade.vec(x, y, 0));
    } else if (arguments.length === 3) {
        var x = arguments[0], y = arguments[1], z = arguments[2];
        if (!x.type.equals(Shade.Types.float_t)) {
            throw new Error("expected float, got " + x.type.repr() + "instead");
        }
        if (!y.type.equals(Shade.Types.float_t)) {
            throw new Error("expected float, got " + y.type.repr() + "instead");
        }
        if (!z.type.equals(Shade.Types.float_t)) {
            throw new Error("expected float, got " + z.type.repr() + "instead");
        }
        return from_vec3(Shade.vec(x, y, z));
    } else
        throw new Error("expected either 1, 2 or 3 parameters");
});
Shade.scaling = Shade(function() {
    function build(v1, v2, v3) {
        return Shade.mat(Shade.vec(v1, 0, 0, 0),
                         Shade.vec( 0,v2, 0, 0),
                         Shade.vec( 0, 0,v3, 0),
                         Shade.vec( 0, 0, 0, 1));
    }
    if (arguments.length === 1) {
        var t = arguments[0];
        if (t.type.equals(Shade.Types.float_t))
            return build(t, t, t);
        if (t.type.equals(Shade.Types.vec3))
            return build(t.x(), t.y(), t.z());
        throw new Error("expected float or vec3, got " + t.type.repr() + " instead");
    } else if (arguments.length === 3) {
        return build(arguments[0], arguments[1], arguments[2]);
    } else {
        throw new Error("expected one or three parameters, got " + arguments.length + " instead");
    }
});
Shade.ortho = Shade.make(function(left, right, bottom, top, near, far) {
    var rl = right.sub(left);
    var tb = top.sub(bottom);
    var fn = far.sub(near);
    return Shade.mat(Shade.vec(Shade.div(2, rl), 0, 0, 0),
                     Shade.vec(0, Shade.div(2, tb), 0, 0),
                     Shade.vec(0, 0, Shade.div(-2, fn), 0),
                     Shade.vec(Shade.add(right, left).neg().div(rl),
                               Shade.add(top, bottom).neg().div(tb),
                               Shade.add(far, near).neg().div(fn),
                               1));
});
// FIXME This should be Shade.look_at = Shade.make(function() ...
// but before I do that I have to make sure that at this point
// in the source Shade.make actually exists.

Shade.look_at = function(eye, center, up)
{
    eye = Shade.make(eye);
    center = Shade.make(center);
    up = Shade.make(up);

    var z = eye.sub(center).normalize();
    var x = up.cross(z).normalize();
    var y = up.normalize();
    // var y = z.cross(x).normalize();

    return Shade.mat(Shade.vec(x, 0),
                     Shade.vec(y, 0),
                     Shade.vec(z, 0),
                     Shade.vec(x.dot(eye).neg(),
                               y.dot(eye).neg(),
                               z.dot(eye).neg(),
                               1));
};
/*
 * Shade.discard_if: conditionally discard fragments from the pipeline
 * 

*********************************************************************************
 * 
 * For future reference, this is a copy of the org discussion on the
 * discard statement as I was designing it.
 * 

Discard is a statement; I don't really have statements in the
language.


*** discard is fragment-only.

How do I implement discard in a vertex shader?

**** Possibilities:
***** Disallow it to happen in the vertex shader
Good: Simplest
Bad: Breaks the model in Lux programs where we don't care much about
what happens in vertex expressions vs fragment expressions
Ugly: The error messages would be really opaque, unless I specifically
detect where the discard statement would appear.
***** Send the vertex outside the homogenous cube
Good: Simple
Bad: doesn't discard the whole primitive
Ugly: would make triangles, etc look really weird.
***** Set some special varying which discards every single fragment in the shader
Good: Discards an entire primitive.
Bad: Wastes a varying, which might be a scarce resource.
Ugly: varying cannot be discrete (bool). The solution would be to
discard if varying is greater than zero, set the discarded varying to be greater
than the largest possible distance between two vertices on the screen,
and the non-discarded to zero.

*** Implementation ideas:

**** special key for the program description

like so:

{
  gl_Position: foo
  gl_FragColor: bar
  discard_if: baz
}

The main disadvantage here is that one application of discard is to
save computation time. This means that my current initialization of
variables used in more than one context will be wasteful if none of
these variables are actually used before the discard condition is
verified. What I would need, then, is some dependency analysis that
determines which variables are used for which discard checks, and
computes those in the correct order.

This discard interacts with the initializer code.

**** new expression called discard_if

We add a discard_when(condition, value_if_not) expression, which
issues the discard statement if condition is true. 

But what about discard_when being executed inside conditional
expressions? Worse: discard_when would turn case D above from a
performance problem into an actual bug.

 * 
 */

Shade.discard_if = function(exp, condition)
{
    if (_.isUndefined(exp) ||
        _.isUndefined(condition))
        throw new Error("discard_if expects two parameters");
    exp = Shade.make(exp);
    condition = Shade.make(condition);

    var result = Shade._create_concrete_exp({
        is_constant: Shade.memoize_on_field("_is_constant", function() {
            var cond = _.all(this.parents, function(v) {
                return v.is_constant();
            });
            return (cond && !this.parents[1].constant_value());
        }),
        _must_be_function_call: true,
        type: exp.type,
        expression_type: "discard_if",
        parents: [exp, condition],
        parent_is_unconditional: function(i) {
            return i === 0;
        },
        compile: function(ctx) {
            ctx.strings.push(this.parents[0].type.repr(), this.glsl_name, "(void) {\n",
                             "    if (",this.parents[1].glsl_expression(),") discard;\n",
                             "    return ", this.parents[0].glsl_expression(), ";\n}\n");
        },
        // FIXME How does evaluate interact with fragment discarding?
        // I still need to define the value of a discarded fragment. Currently evaluate
        // on fragment-varying expressions is undefined anyway, so we punt.
        evaluate: function(cache) {
            return exp.evaluate(cache);
        }
    });
    return result;
};
// converts a 32-bit integer into an 8-bit RGBA value.
// this is most useful for picking.

// Ideally we would like this to take shade expressions,
// but WebGL does not support bitwise operators.

Shade.id = function(id_value)
{
    var r = id_value & 255;
    var g = (id_value >> 8) & 255;
    var b = (id_value >> 16) & 255;
    var a = (id_value >> 24) & 255;
    
    return vec4.make([r / 255, g / 255, b / 255, a / 255]);
};

Shade.shade_id = Shade(function(id_value)
{
    return id_value.div(Shade.vec(1, 256, 65536, 16777216)).mod(256).floor().div(255);
});
Shade.frustum = Shade.make(function(left, right, bottom, top, near, far)
{
    var rl = right.sub(left);
    var tb = top.sub(bottom);
    var fn = far.sub(near);
    return Shade.mat(Shade.vec(near.mul(2).div(rl), 0, 0, 0),
                     Shade.vec(0, near.mul(2).div(tb), 0, 0),
                     Shade.vec(right.add(left).div(rl), 
                               top.add(bottom).div(tb), 
                               far.add(near).neg().div(fn),
                               -1),
                     Shade.vec(0, 0, far.mul(near).mul(2).neg().div(fn), 0));
});
Shade.perspective_matrix = Shade.make(function(fovy, aspect, near, far)
{
    var top = near.mul(Shade.tan(fovy.mul(Math.PI / 360)));
    var right = top.mul(aspect);
    return Shade.frustum(right.neg(), right, top.neg(), top, near, far);
});

return Shade;
}());
////////////////////////////////////////////////////////////////////////////////
// The colorspace conversion routines are based on
// Ross Ihaka's colorspace library for R.

Shade.Colors = {};
Shade.Colors.alpha = function(color, alpha)
{
    color = Shade.make(color);
    alpha = Shade.make(alpha);
    if (!alpha.type.equals(Shade.Types.float_t))
        throw new Error("alpha parameter must be float");
    if (color.type.equals(Shade.Types.vec4)) {
        return Shade.vec(color.swizzle("rgb"), alpha);
    }
    if (color.type.equals(Shade.Types.vec3)) {
        return Shade.vec(color, alpha);
    }
    throw new Error("color parameter must be vec3 or vec4");
};

Shade.Exp.alpha = function(alpha)
{
    return Shade.Colors.alpha(this, alpha);
};
Shade.Colors.Brewer = {};

(function() {

var schemes = {
    "qualitative":{"Accent":[[127,201,127],[190,174,212],[253,192,134],[255,255,153],[56,108,176],[240,2,127],[191,91,23],[102,102,102]],
                   "Dark2":[[27,158,119],[217,95,2],[117,112,179],[231,41,138],[102,166,30],[230,171,2],[166,118,29],[102,102,102]],
	           "Paired":[[166,206,227],[31,120,180],[178,223,138],[51,160,44],[251,154,153],[227,26,28],[253,191,111],[255,127,0],[202,178,214],[106,61,154],[255,255,153],[177,89,40]],
	           "Pastel1":[[251,180,174],[179,205,227],[204,235,197],[222,203,228],[254,217,166],[255,255,204],[229,216,189],[253,218,236],[242,242,242]],
                   "Pastel2":[[179,226,205],[253,205,172],[203,213,232],[244,202,228],[230,245,201],[255,242,174],[241,226,204],[204,204,204]],
	           "Set1":[[228,26,28],[55,126,184],[77,175,74],[152,78,163],[255,127,0],[255,255,51],[166,86,40],[247,129,191],[153,153,153]],
	           "Set2":[[102,194,165],[252,141,98],[141,160,203],[231,138,195],[166,216,84],[255,217,47],[229,196,148],[179,179,179]],
	           "Set3":[[141,211,199],[255,255,179],[190,186,218],[251,128,114],[128,177,211],[253,180,98],[179,222,105],[252,205,229],[217,217,217],[188,128,189],[204,235,197],[255,237,111]]},
    "sequential":{"Blues":[[247,251,255],[222,235,247],[198,219,239],[158,202,225],[107,174,214],[66,146,198],[33,113,181],[8,81,156],[8,48,107]],
                  "BuGn":[[247,252,253],[229,245,249],[204,236,230],[153,216,201],[102,194,164],[65,174,118],[35,139,69],[0,109,44],[0,68,27]],
                  "BuPu":[[247,252,253],[224,236,244],[191,211,230],[158,188,218],[140,150,198],[140,107,177],[136,65,157],[129,15,124],[77,0,75]],
                  "GnBu":[[247,252,240],[224,243,219],[204,235,197],[168,221,181],[123,204,196],[78,179,211],[43,140,190],[8,104,172],[8,64,129]],
                  "Greens":[[247,252,245],[229,245,224],[199,233,192],[161,217,155],[116,196,118],[65,171,93],[35,139,69],[0,109,44],[0,68,27]],
                  "Greys":[[255,255,255],[240,240,240],[217,217,217],[189,189,189],[150,150,150],[115,115,115],[82,82,82],[37,37,37],[0,0,0]],
                  "Oranges":[[255,245,235],[254,230,206],[253,208,162],[253,174,107],[253,141,60],[241,105,19],[217,72,1],[166,54,3],[127,39,4]],
                  "OrRd":[[255,247,236],[254,232,200],[253,212,158],[253,187,132],[252,141,89],[239,101,72],[215,48,31],[179,0,0],[127,0,0]],
                  "PuBu":[[255,247,251],[236,231,242],[208,209,230],[166,189,219],[116,169,207],[54,144,192],[5,112,176],[4,90,141],[2,56,88]],
                  "PuBuGn":[[255,247,251],[236,226,240],[208,209,230],[166,189,219],[103,169,207],[54,144,192],[2,129,138],[1,108,89],[1,70,54]],
                  "PuRd":[[247,244,249],[231,225,239],[212,185,218],[201,148,199],[223,101,176],[231,41,138],[206,18,86],[152,0,67],[103,0,31]],
                  "Purples":[[252,251,253],[239,237,245],[218,218,235],[188,189,220],[158,154,200],[128,125,186],[106,81,163],[84,39,143],[63,0,125]],
                  "RdPu":[[255,247,243],[253,224,221],[252,197,192],[250,159,181],[247,104,161],[221,52,151],[174,1,126],[122,1,119],[73,0,106]],
	          "Reds":[[255,245,240],[254,224,210],[252,187,161],[252,146,114],[251,106,74],[239,59,44],[203,24,29],[165,15,21],[103,0,13]],
                  "YlGn":[[255,255,229],[247,252,185],[217,240,163],[173,221,142],[120,198,121],[65,171,93],[35,132,67],[0,104,55],[0,69,41]],
	          "YlGnBu":[[255,255,217],[237,248,177],[199,233,180],[127,205,187],[65,182,196],[29,145,192],[34,94,168],[37,52,148],[8,29,88]],
	          "YlOrBr":[[255,255,229],[255,247,188],[254,227,145],[254,196,79],[254,153,41],[236,112,20],[204,76,2],[153,52,4],[102,37,6]],
	          "YlOrRd":[[255,255,204],[255,237,160],[254,217,118],[254,178,76],[253,141,60],[252,78,42],[227,26,28],[189,0,38],[128,0,38]]},
    "divergent":{"BrBG":[[84,48,5],[140,81,10],[191,129,45],[223,194,125],[246,232,195],[245,245,245],[199,234,229],[128,205,193],[53,151,143],[1,102,94],[0,60,48]],
                 "PiYG":[[142,1,82],[197,27,125],[222,119,174],[241,182,218],[253,224,239],[247,247,247],[230,245,208],[184,225,134],[127,188,65],[77,146,33],[39,100,25]],
	         "PRGn":[[64,0,75],[118,42,131],[153,112,171],[194,165,207],[231,212,232],[247,247,247],[217,240,211],[166,219,160],[90,174,97],[27,120,55],[0,68,27]],
                 "PuOr":[[127,59,8],[179,88,6],[224,130,20],[253,184,99],[254,224,182],[247,247,247],[216,218,235],[178,171,210],[128,115,172],[84,39,136],[45,0,75]],
	         "RdBu":[[103,0,31],[178,24,43],[214,96,77],[244,165,130],[253,219,199],[247,247,247],[209,229,240],[146,197,222],[67,147,195],[33,102,172],[5,48,97]],
	         "RdGy":[[103,0,31],[178,24,43],[214,96,77],[244,165,130],[253,219,199],[255,255,255],[224,224,224],[186,186,186],[135,135,135],[77,77,77],[26,26,26]],
	         "RdYlBu":[[165,0,38],[215,48,39],[244,109,67],[253,174,97],[254,224,144],[255,255,191],[224,243,248],[171,217,233],[116,173,209],[69,117,180],[49,54,149]],
	         "RdYlGn":[[165,0,38],[215,48,39],[244,109,67],[253,174,97],[254,224,139],[255,255,191],[217,239,139],[166,217,106],[102,189,99],[26,152,80],[0,104,55]],
	         "Spectral":[[158,1,66],[213,62,79],[244,109,67],[253,174,97],[254,224,139],[255,255,191],[230,245,152],[171,221,164],[102,194,165],[50,136,189],[94,79,162]]}
};

Shade.Colors.Brewer.sequential = function(opts) {
    opts = _.defaults(opts || {}, {
        alpha: 1,
        min: 0,
        max: 1
    });
    if (_.isUndefined(opts.name))
        throw new Error("'name' is a required option");
    var a = schemes.sequential[opts.name];
    if (_.isUndefined(a))
        throw new Error("Unknown sequential colormap " + opts.name);
    var range = _.map(a, function(lst) {
        return Shade.vec(lst[0] / 255, lst[1]/255, lst[2]/255, opts.alpha);
    });
    var us = _.map(range, function(v, i) {
        return i / (range.length - 1);
    });
    return Shade.Scale.linear({
        domain: _.map(us, function(u) { return Shade.mix(opts.min, opts.max, u); }),
        range: range
    });
};

Shade.Colors.Brewer.qualitative = function(opts) {
    opts = _.defaults(opts || {}, {
        alpha: 1
    });
    if (_.isUndefined(opts.name))
        throw new Error("'name' is a required option");
    var a = schemes.qualitative[opts.name];
    if (_.isUndefined(a))
        throw new Error("Unknown qualitative colormap " + opts.name);
    function lookup(i) {
        if (_.isUndefined(opts.domain)) {
            return a[i];
        }
        return a[opts.domain[i]];
    }
    var range = _.map(a, function(unused, i) {
        lst = lookup(i);
        return Shade.vec(lst[0] / 255, lst[1]/255, lst[2]/255, opts.alpha);
    });
    return Shade.Scale.ordinal({range: range});
};

Shade.Colors.Brewer.divergent = function(opts) {
    opts = _.defaults(opts || {}, {
        alpha: 1,
        low: -1,
        zero: 0,
        high: 1
    });
    if (_.isUndefined(opts.name))
        throw new Error("'name' is a required option");
    var a = schemes.divergent[opts.name];
    if (_.isUndefined(a))
        throw new Error("Unknown divergent colormap " + opts.name);
    var range = _.map(a, function(lst) {
        return Shade.vec(lst[0] / 255, lst[1]/255, lst[2]/255, opts.alpha);
    });
    
    var map1 = Shade.Scale.linear({
        domain: [opts.low, opts.zero, opts.high],
        range: [0, (range.length - 1) / 2, range.length - 1]
    });

    var map2 = Shade.Scale.linear({domain: _.range(range.length),
                                   range: range});
    return Shade(_.compose(map2, map1));
};

})();
(function() {

function compose(g, f)
{
    if (_.isUndefined(f) || _.isUndefined(g))
        throw new Error("Undefined!");
    return function(x) {
        return g(f(x));
    };
}

var table = {};
var colorspaces = ["rgb", "srgb", "luv", "hcl", "hls", "hsv", "xyz"];
_.each(colorspaces, function(space) {
    table[space] = {};
    table[space][space] = function(x) { return x; };
    table[space].create = function(v0, v1, v2) {
        // this function is carefully designed to work for the above
        // color space names. if those change, this probably changes
        // too.
        var l = space.length;
        var field_0 = space[l-3],
            field_1 = space[l-2],
            field_2 = space[l-1];
        var result = {
            space: space,
            values: function() {
                return [this[field_0], this[field_1], this[field_2]];
            },
            as_shade: function(alpha) {
                if (_.isUndefined(alpha))
                    alpha = 1;
                var srgb = table[space].rgb(this);
                return Shade.vec(srgb.r, srgb.g, srgb.b, alpha);
            }
        };
        
        result[field_0] = v0;
        result[field_1] = v1;
        result[field_2] = v2;
        _.each(colorspaces, function(other_space) {
            result[other_space] = function() { return table[space][other_space](result); };
        });
        return result;
    };
});

function xyz_to_uv(xyz)
{
    var t, x, y;
    t = xyz.x + xyz.y + xyz.z;
    x = xyz.x / t;
    y = xyz.y / t;
    return [2 * x / (6 * y - x + 1.5),
            4.5 * y / (6 * y - x + 1.5)];
};

// qtrans takes hue varying from 0 to 1!
function qtrans(q1, q2, hue)
{
    if (hue > 1) hue -= 1;
    if (hue < 0) hue += 1;
    if (hue < 1/6) 
        return q1 + (q2 - q1) * (hue * 6);
    else if (hue < 1/2)
        return q2;
    else if (hue < 2/3)
        return q1 + (q2 - q1) * (2/3 - hue) * 6;
    else
        return q1;
};

function gtrans(u, gamma)
{
    if (u > 0.00304)
        return 1.055 * Math.pow(u, 1 / gamma) - 0.055;
    else
        return 12.92 * u;
    // if (u < 0) return u;
    // return Math.pow(u, 1.0 / gamma);
}

function ftrans(u, gamma)
{
    if (u > 0.03928)
        return Math.pow((u + 0.055) / 1.055, gamma);
    else
        return u / 12.92;
    // if (u < 0) return u;
    // return Math.pow(u, gamma);
}

//////////////////////////////////////////////////////////////////////////////
// table.rgb.*

table.rgb.hsv = function(rgb)
{
    var x = Math.min(rgb.r, rgb.g, rgb.b);
    var y = Math.max(rgb.r, rgb.g, rgb.b);
    if (y !== x) {
        var f = ((rgb.r === x) ? rgb.g - rgb.b : 
                 (rgb.g === x) ? rgb.b - rgb.r :
                                 rgb.r - rgb.g);
        var i = ((rgb.r === x) ? 3 :
                 (rgb.g === x) ? 5 : 1);
        return table.hsv.create((Math.PI/3) * (i - f / (y - x)),
                                (y - x) / y,
                                y);
    } else {
        return table.hsv.create(0, 0, y);
    }
};

table.rgb.hls = function(rgb)
{
    var min = Math.min(rgb.r, rgb.g, rgb.b);
    var max = Math.max(rgb.r, rgb.g, rgb.b);

    var l = (max + min) / 2, s, h;
    if (max !== min) {
        if (l < 0.5)
            s = (max - min) / (max + min);
        else
            s = (max - min) / (2.0 - max - min);
        if (rgb.r === max) {
            h = (rgb.g - rgb.b) / (max - min);
        } else if (rgb.g === max) {
            h = 2.0 + (rgb.b - rgb.r) / (max - min);
        } else {
            h = 4.0 + (rgb.r - rgb.g) / (max - min);
        }
        h = h * Math.PI / 3;
        if (h < 0)           h += Math.PI * 2;
        if (h > Math.PI * 2) h -= Math.PI * 2;
    } else {
        s = 0;
        h = 0;
    }
    return table.hls.create(h, l, s);
};

table.rgb.xyz = function(rgb)
{
    var yn = white_point.y;
    return table.xyz.create(
        yn * (0.412453 * rgb.r + 0.357580 * rgb.g + 0.180423 * rgb.b),
        yn * (0.212671 * rgb.r + 0.715160 * rgb.g + 0.072169 * rgb.b),
        yn * (0.019334 * rgb.r + 0.119193 * rgb.g + 0.950227 * rgb.b));
};

table.rgb.srgb = function(rgb)
{
    return table.srgb.create(gtrans(rgb.r, 2.4),
                             gtrans(rgb.g, 2.4),
                             gtrans(rgb.b, 2.4));
};

// table.rgb.luv = compose(table.xyz.luv, table.rgb.xyz);
// table.rgb.hcl = compose(table.luv.hcl, table.rgb.luv);

//////////////////////////////////////////////////////////////////////////////
// table.srgb.*

table.srgb.xyz = function(srgb)
{
    var yn = white_point.y;
    var r = ftrans(srgb.r, 2.4),
        g = ftrans(srgb.g, 2.4),
        b = ftrans(srgb.b, 2.4);
    return table.xyz.create(
        yn * (0.412453 * r + 0.357580 * g + 0.180423 * b),
        yn * (0.212671 * r + 0.715160 * g + 0.072169 * b),
        yn * (0.019334 * r + 0.119193 * g + 0.950227 * b));
};

table.srgb.rgb = function(srgb)
{
    var result = table.rgb.create(ftrans(srgb.r, 2.4),
                                  ftrans(srgb.g, 2.4),
                                  ftrans(srgb.b, 2.4));
    return result;
};

table.srgb.hls = compose(table.rgb.hls, table.srgb.rgb);
table.srgb.hsv = compose(table.rgb.hsv, table.srgb.rgb);
// table.srgb.luv = compose(table.rgb.luv, table.srgb.rgb);
// table.srgb.hcl = compose(table.rgb.hcl, table.srgb.rgb);

//////////////////////////////////////////////////////////////////////////////
// table.xyz.*

table.xyz.luv = function(xyz)
{
    var y;
    var t1 = xyz_to_uv(xyz);
    y = xyz.y / white_point.y;
    var l = (y > 0.008856 ? 
             116 * Math.pow(y, 1.0/3.0) - 16 :
             903.3 * y);
    return table.luv.create(l, 
                            13 * l * (t1[0] - white_point_uv[0]),
                            13 * l * (t1[1] - white_point_uv[1]));
};
// now I can define these
table.rgb.luv = compose(table.xyz.luv, table.rgb.xyz);
table.srgb.luv = compose(table.rgb.luv, table.srgb.rgb);

table.xyz.rgb = function(xyz)
{
    var yn = white_point.y;
    return table.rgb.create(
        ( 3.240479 * xyz.x - 1.537150 * xyz.y - 0.498535 * xyz.z) / yn,
        (-0.969256 * xyz.x + 1.875992 * xyz.y + 0.041556 * xyz.z) / yn,
        ( 0.055648 * xyz.x - 0.204043 * xyz.y + 1.057311 * xyz.z) / yn
    );
};
table.xyz.hls = compose(table.rgb.hls, table.xyz.rgb);
table.xyz.hsv = compose(table.rgb.hsv, table.xyz.rgb);

table.xyz.srgb = function(xyz)
{
    var yn = white_point.y;
    return table.srgb.create(
        gtrans(( 3.240479 * xyz.x - 1.537150 * xyz.y - 0.498535 * xyz.z) / yn, 2.4),
        gtrans((-0.969256 * xyz.x + 1.875992 * xyz.y + 0.041556 * xyz.z) / yn, 2.4),
        gtrans(( 0.055648 * xyz.x - 0.204043 * xyz.y + 1.057311 * xyz.z) / yn, 2.4)
    );
};

// table.xyz.hcl = compose(table.rgb.hcl, table.xyz.rgb);

//////////////////////////////////////////////////////////////////////////////
// table.luv.*

table.luv.hcl = function(luv)
{
    var c = Math.sqrt(luv.u * luv.u + luv.v * luv.v);    
    var h = Math.atan2(luv.v, luv.u);
    while (h > Math.PI * 2) { h -= Math.PI * 2; }
    while (h < 0) { h += Math.PI * 2; }
    return table.hcl.create(h, c, luv.l);
};
table.rgb.hcl  = compose(table.luv.hcl,  table.rgb.luv);
table.srgb.hcl = compose(table.luv.hcl,  table.srgb.luv);
table.xyz.hcl  = compose(table.rgb.hcl, table.xyz.rgb);

table.luv.xyz = function(luv)
{
    var x = 0, y = 0, z = 0;
    if (!(luv.l <= 0 && luv.u == 0 && luv.v == 0)) {
        y = white_point.y * ((luv.l > 7.999592) ? 
                             Math.pow((luv.l + 16)/116, 3) : 
                             luv.l / 903.3);
        // var t = xyz_to_uv(xn, yn, zn);
        // var un = t[0], vn = t[1];
        var result_u = luv.u / (13 * luv.l) + white_point_uv[0];
        var result_v = luv.v / (13 * luv.l) + white_point_uv[1];
        x = 9 * y * result_u / (4 * result_v);
        z = -x / 3 - 5 * y + 3 * y / result_v;
    }
    return table.xyz.create(x, y, z);
};
table.luv.rgb  = compose(table.xyz.rgb,  table.luv.xyz);
table.luv.hls  = compose(table.rgb.hls,  table.luv.rgb);
table.luv.hsv  = compose(table.rgb.hsv,  table.luv.rgb);
table.luv.srgb = compose(table.rgb.srgb, table.luv.rgb);


//////////////////////////////////////////////////////////////////////////////
// table.hcl.*

table.hcl.luv = function(hcl)
{
    return table.luv.create(
        hcl.l, hcl.c * Math.cos(hcl.h), hcl.c * Math.sin(hcl.h));
};

table.hcl.rgb  = compose(table.luv.rgb,  table.hcl.luv);
table.hcl.srgb = compose(table.luv.srgb, table.hcl.luv);
table.hcl.hsv  = compose(table.luv.hsv,  table.hcl.luv);
table.hcl.hls  = compose(table.luv.hls,  table.hcl.luv);
table.hcl.xyz  = compose(table.luv.xyz,  table.hcl.luv);

//////////////////////////////////////////////////////////////////////////////
// table.hls.*

table.hls.rgb = function(hls)
{
    var p1, p2;
    if (hls.l <= 0.5)
        p2 = hls.l * (1 + hls.s);
    else
        p2 = hls.l + hls.s - (hls.l * hls.s);
    p1 = 2 * hls.l - p2;
    if (hls.s === 0) {
        return table.rgb.create(hls.l, hls.l, hls.l);
    } else {
        return table.rgb.create(
            qtrans(p1, p2, (hls.h + Math.PI * 2/3) / (Math.PI * 2)),
            qtrans(p1, p2, hls.h / (Math.PI * 2)),
            qtrans(p1, p2, (hls.h - Math.PI * 2/3) / (Math.PI * 2)));
    }
};

table.hls.srgb = compose(table.rgb.srgb, table.hls.rgb);
table.hls.hsv  = compose(table.rgb.hsv,  table.hls.rgb);
table.hls.xyz  = compose(table.rgb.xyz,  table.hls.rgb);
table.hls.luv  = compose(table.rgb.luv,  table.hls.rgb);
table.hls.hcl  = compose(table.rgb.hcl,  table.hls.rgb);

//////////////////////////////////////////////////////////////////////////////
// table.hsv.*

table.hsv.rgb = function(hsv)
{
    if (isNaN(hsv.h)) {
        return table.rgb.create(hsv.v, hsv.v, hsv.v);
    } else {
        var v = hsv.v;
        var h = hsv.h / Math.PI * 3; // from [0,2Pi] to [0,6];
        var i = Math.floor(h);
        var f = h - i;
        if (!(i & 1)) // if index is even
            f = 1 - f;
        var m = v * (1 - hsv.s);
        var n = v * (1 - hsv.s * f);
        switch (i) {
        case 6:
        case 0: return table.rgb.create(v, n, m);
        case 1: return table.rgb.create(n, v, m);
        case 2: return table.rgb.create(m, v, n);
        case 3: return table.rgb.create(m, n, v);
        case 4: return table.rgb.create(n, m, v);
        case 5: return table.rgb.create(v, m, n);
        default:
            throw new Error("internal error");
        };
    }
};

table.hsv.srgb = compose(table.rgb.srgb, table.hsv.rgb);
table.hsv.hls  = compose(table.rgb.hls,  table.hsv.rgb);
table.hsv.xyz  = compose(table.rgb.xyz,  table.hsv.rgb);
table.hsv.luv  = compose(table.rgb.luv,  table.hsv.rgb);
table.hsv.hcl  = compose(table.rgb.hcl,  table.hsv.rgb);

// currently we assume a D65 white point, but this could be configurable
var white_point = table.xyz.create(95.047, 100.000, 108.883);
var white_point_uv = xyz_to_uv(white_point);

Shade.Colors.jstable = table;

})();
/*
 * FIXME The API in Shade.Colors is a disgusting mess. My apologies.
 * 
 */

(function() {

function compose(g, f)
{
    if (_.isUndefined(f) || _.isUndefined(g))
        throw new Error("Undefined!");
    return function(x) {
        return g(f(x));
    };
}

var _if = Shade.ifelse;

var table = {};
var colorspaces = ["rgb", "srgb", "luv", "hcl", "hls", "hsv", "xyz"];
_.each(colorspaces, function(space) {
    Shade.Colors[space] = function(v1, v2, v3, alpha) {
        if (_.isUndefined(alpha))
            alpha = 1;
        return Shade.Colors.shadetable[space].create(v1, v2, v3).as_shade(alpha);
    };
    table[space] = {};
    table[space][space] = function(x) { return x; };
    table[space].create = function() {
        var vec;
        if (arguments.length === 1) {
            vec = arguments[0];
            if (!vec.type.equals(Shade.Types.vec3))
                throw new Error("create with 1 parameter requires a vec3");
        } else if (arguments.length === 3) {
            vec = Shade.vec(arguments[0], arguments[1], arguments[2]);
            if (!vec.type.equals(Shade.Types.vec3))
                throw new Error("create with 3 parameter requires 3 floats");
        } else
            throw new Error("create requires either 1 vec3 or 3 floats");
        // this function is carefully designed to work for the above
        // color space names. if those change, this probably changes
        // too.
        var l = space.length;
        var field_0 = space[l-3],
            field_1 = space[l-2],
            field_2 = space[l-1];
        var result = {
            space: space,
            vec: vec,
            values: function() {
                return [this[field_0].constant_value(), 
                        this[field_1].constant_value(), 
                        this[field_2].constant_value()];
            },
            as_shade: function(alpha) {
                if (_.isUndefined(alpha))
                    alpha = Shade.make(1);
                var result = this.rgb().vec;
                return Shade.vec(this.rgb().vec, alpha);
            }
        };
        result[field_0] = vec.swizzle("r");
        result[field_1] = vec.swizzle("g");
        result[field_2] = vec.swizzle("b");
        _.each(colorspaces, function(other_space) {
            result[other_space] = function() { return table[space][other_space](result); };
        });
        return result;
    };
});

function xyz_to_uv(xyz)
{
    var t, x, y;
    t = xyz.x.add(xyz.y).add(xyz.z);
    x = xyz.x.div(t);
    y = xyz.y.div(t);
    return Shade.vec(x.mul(2).div(y.mul(6).sub(x).add(1.5)),
                     y.mul(4.5).div(y.mul(6).sub(x).add(1.5)));
};

// qtrans takes hue varying from 0 to 1!
function qtrans(q1, q2, hue)
{
    hue = _if(hue.gt(1), hue.sub(1), hue);
    hue = _if(hue.lt(0), hue.add(1), hue);
    return _if(hue.lt(1/6), q1.add(q2.sub(q1).mul(hue.mul(6))),
           _if(hue.lt(1/2), q2,
           _if(hue.lt(2/3), q1.add(q2.sub(q1).mul(Shade.make(2/3)
                                                  .sub(hue).mul(6))),
               q1)));
};

function gtrans(u, gamma)
{
    return _if(u.gt(0.00304),
               Shade.mul(1.055, Shade.pow(u, Shade.div(1, gamma))).sub(0.055),
               u.mul(12.92));
}

function ftrans(u, gamma)
{
    return _if(u.gt(0.03928),
               Shade.pow(u.add(0.055).div(1.055), gamma),
               u.div(12.92));
}

//////////////////////////////////////////////////////////////////////////////
// table.rgb.*

function min3(v)
{
    return Shade.min(v.r, Shade.min(v.g, v.b));
}

function max3(v)
{
    return Shade.max(v.r, Shade.max(v.g, v.b));
}

table.rgb.hsv = function(rgb)
{
    var x = min3(rgb);
    var y = max3(rgb);
    
    var f = _if(rgb.r.eq(x), rgb.g.sub(rgb.b),
            _if(rgb.g.eq(x), rgb.b.sub(rgb.r),
                             rgb.r.sub(rgb.g)));
    var i = _if(rgb.r.eq(x), 3, _if(rgb.g.eq(x), 5, 1));
    return table.hsv.create(_if(
        y.eq(x), 
        Shade.vec(0,0,y),
        Shade.vec(Shade.mul(Math.PI/3, i.sub(f.div(y.sub(x)))),
                  y.sub(x).div(y),
                  y)));
};

table.rgb.hls = function(rgb)
{
    var min = min3(rgb);
    var max = max3(rgb);
    var l = max.add(min).div(2), s, h;
    var mx_ne_mn = max.ne(min);
    
    s = _if(mx_ne_mn,
            _if(l.lt(0.5), 
                max.sub(min).div(max.add(min)),
                max.sub(min).div(Shade.sub(2.0, max).sub(min))),
            0);
    h = _if(mx_ne_mn,
            _if(rgb.r.eq(max),                rgb.g.sub(rgb.b).div(max.sub(min)),
            _if(rgb.g.eq(max), Shade.add(2.0, rgb.b.sub(rgb.r).div(max.sub(min))),
                               Shade.add(4.0, rgb.r.sub(rgb.g).div(max.sub(min))))),
            0);
    h = h.mul(Math.PI / 3);
    h = _if(h.lt(0),           h.add(Math.PI * 2),
        _if(h.gt(Math.PI * 2), h.sub(Math.PI * 2), 
                               h));
    return table.hls.create(h, l, s);
};

table.rgb.xyz = function(rgb)
{
    var yn = white_point.y;
    return table.xyz.create(
        yn.mul(rgb.r.mul(0.412453).add(rgb.g.mul(0.357580)).add(rgb.b.mul(0.180423))),
        yn.mul(rgb.r.mul(0.212671).add(rgb.g.mul(0.715160)).add(rgb.b.mul(0.072169))),
        yn.mul(rgb.r.mul(0.019334).add(rgb.g.mul(0.119193)).add(rgb.b.mul(0.950227))));
};

table.rgb.srgb = function(rgb)
{
    return table.srgb.create(gtrans(rgb.r, 2.4),
                             gtrans(rgb.g, 2.4),
                             gtrans(rgb.b, 2.4));
};

// table.rgb.luv = compose(table.xyz.luv, table.rgb.xyz);
// table.rgb.hcl = compose(table.luv.hcl, table.rgb.luv);

//////////////////////////////////////////////////////////////////////////////
// table.srgb.*

table.srgb.xyz = function(srgb)
{
    var yn = white_point.y;
    var r = ftrans(srgb.r, 2.4),
        g = ftrans(srgb.g, 2.4),
        b = ftrans(srgb.b, 2.4);
    return table.xyz.create(
        yn.mul(r.mul(0.412453).add(g.mul(0.357580)).add(b.mul(0.180423))),
        yn.mul(r.mul(0.212671).add(g.mul(0.715160)).add(b.mul(0.072169))),
        yn.mul(r.mul(0.019334).add(g.mul(0.119193)).add(b.mul(0.950227))));
};

table.srgb.rgb = function(srgb)
{
    var result = table.rgb.create(ftrans(srgb.r, 2.4),
                                  ftrans(srgb.g, 2.4),
                                  ftrans(srgb.b, 2.4));
    
    return result;
};

table.srgb.hls = compose(table.rgb.hls, table.srgb.rgb);
table.srgb.hsv = compose(table.rgb.hsv, table.srgb.rgb);
// table.srgb.luv = compose(table.rgb.luv, table.srgb.rgb);
// table.srgb.hcl = compose(table.rgb.hcl, table.srgb.rgb);

//////////////////////////////////////////////////////////////////////////////
// table.xyz.*

table.xyz.luv = function(xyz)
{
    var y;
    var t1 = xyz_to_uv(xyz);
    y = xyz.y.div(white_point.y);
    var l = _if(y.gt(0.008856), 
                Shade.mul(116, Shade.pow(y, 1.0/3.0)).sub(16),
                Shade.mul(903.3, y));
    return table.luv.create(Shade.vec(l, l.mul(t1.sub(white_point_uv)).mul(13)));
};
// now I can define these
table.rgb.luv = compose(table.xyz.luv, table.rgb.xyz);
table.srgb.luv = compose(table.rgb.luv, table.srgb.rgb);

table.xyz.rgb = function(xyz)
{
    var yn = white_point.y;
    return table.rgb.create(
        (xyz.x.mul( 3.240479).sub(xyz.y.mul(1.537150)).sub(xyz.z.mul(0.498535))).div(yn),
        (xyz.x.mul(-0.969256).add(xyz.y.mul(1.875992)).add(xyz.z.mul(0.041556))).div(yn),
        (xyz.x.mul( 0.055648).sub(xyz.y.mul(0.204043)).add(xyz.z.mul(1.057311))).div(yn)
    );
};
table.xyz.hls = compose(table.rgb.hls, table.xyz.rgb);
table.xyz.hsv = compose(table.rgb.hsv, table.xyz.rgb);

table.xyz.srgb = function(xyz)
{
    var yn = white_point.y;
    return table.srgb.create(
        gtrans((xyz.x.mul( 3.240479).sub(xyz.y.mul(1.537150)).sub(xyz.z.mul(0.498535))).div(yn), 2.4),
        gtrans((xyz.x.mul(-0.969256).add(xyz.y.mul(1.875992)).add(xyz.z.mul(0.041556))).div(yn), 2.4),
        gtrans((xyz.x.mul( 0.055648).sub(xyz.y.mul(0.204043)).add(xyz.z.mul(1.057311))).div(yn), 2.4)
    );
};

// table.xyz.hcl = compose(table.rgb.hcl, table.xyz.rgb);

//////////////////////////////////////////////////////////////////////////////
// table.luv.*

table.luv.hcl = function(luv)
{
    var c = Shade.norm(luv.vec.swizzle("gb"));
    var h = Shade.atan(luv.v, luv.u);
    h = _if(h.gt(Math.PI*2), h.sub(Math.PI*2),
        _if(h.lt(0), h.add(Math.PI*2), h));
    while (h > Math.PI * 2) { h -= Math.PI * 2; }
    while (h < 0) { h += Math.PI * 2; }
    return table.hcl.create(h, c, luv.l);
};
table.rgb.hcl  = compose(table.luv.hcl,  table.rgb.luv);
table.srgb.hcl = compose(table.luv.hcl,  table.srgb.luv);
table.xyz.hcl  = compose(table.rgb.hcl, table.xyz.rgb);

table.luv.xyz = function(luv)
{
    var uv = luv.vec.swizzle("gb").div(luv.l.mul(13)).add(white_point_uv);
    var u = uv.swizzle("r"), v = uv.swizzle("g");
    var y = white_point.y.mul(_if(luv.l.gt(7.999592),
                                  Shade.pow(luv.l.add(16).div(116), 3),
                                  luv.l.div(903.3)));
    var x = y.mul(9).mul(u).div(v.mul(4));
    var z = x.div(-3).sub(y.mul(5)).add(y.mul(3).div(v));
    return table.xyz.create(_if(luv.l.le(0).and(luv.u.eq(0).and(luv.v.eq(0))),
                                Shade.vec(0,0,0),
                                Shade.vec(x,y,z)));
};
table.luv.rgb  = compose(table.xyz.rgb,  table.luv.xyz);
table.luv.hls  = compose(table.rgb.hls,  table.luv.rgb);
table.luv.hsv  = compose(table.rgb.hsv,  table.luv.rgb);
table.luv.srgb = compose(table.rgb.srgb, table.luv.rgb);

//////////////////////////////////////////////////////////////////////////////
// table.hcl.*

table.hcl.luv = function(hcl)
{
    return table.luv.create(
        hcl.l, hcl.c.mul(hcl.h.cos()), hcl.c.mul(hcl.h.sin()));
};

table.hcl.rgb  = compose(table.luv.rgb,  table.hcl.luv);
table.hcl.srgb = compose(table.luv.srgb, table.hcl.luv);
table.hcl.hsv  = compose(table.luv.hsv,  table.hcl.luv);
table.hcl.hls  = compose(table.luv.hls,  table.hcl.luv);
table.hcl.xyz  = compose(table.luv.xyz,  table.hcl.luv);

//////////////////////////////////////////////////////////////////////////////
// table.hls.*

table.hls.rgb = function(hls)
{
    var p2 = _if(hls.l.le(0.5),
                 hls.l.mul(hls.s.add(1)),
                 hls.l.add(hls.s).sub(hls.l.mul(hls.s)));
    var p1 = hls.l.mul(2).sub(p2);
    return table.rgb.create(
        _if(hls.s.eq(0),
            Shade.vec(hls.vec.swizzle("ggg")),
            Shade.vec(qtrans(p1, p2, hls.h.add(Math.PI * 2/3).div(Math.PI * 2)),
                      qtrans(p1, p2, hls.h.div(Math.PI * 2)),
                      qtrans(p1, p2, hls.h.sub(Math.PI * 2/3).div(Math.PI * 2)))));
};

table.hls.srgb = compose(table.rgb.srgb, table.hls.rgb);
table.hls.hsv  = compose(table.rgb.hsv,  table.hls.rgb);
table.hls.xyz  = compose(table.rgb.xyz,  table.hls.rgb);
table.hls.luv  = compose(table.rgb.luv,  table.hls.rgb);
table.hls.hcl  = compose(table.rgb.hcl,  table.hls.rgb);

//////////////////////////////////////////////////////////////////////////////
// table.hsv.*

table.hsv.rgb = function(hsv)
{
    var v = hsv.v;
    var h = hsv.h.div(Math.PI).mul(3);
    var i = h.floor();
    var f = h.sub(i);
    f = _if(i.div(2).floor().eq(i.div(2)),
            Shade.sub(1, f),
            f);
    var m = v.mul(Shade.sub(1, hsv.s));
    var n = v.mul(Shade.sub(1, hsv.s.mul(f)));
    return table.rgb.create(_if(i.eq(0), Shade.vec(v, n, m),
                            _if(i.eq(1), Shade.vec(n, v, m),
                            _if(i.eq(2), Shade.vec(m, v, n),
                            _if(i.eq(3), Shade.vec(m, n, v),
                            _if(i.eq(4), Shade.vec(n, m, v),
                            _if(i.eq(5), Shade.vec(v, m, n),
                                         Shade.vec(v, n, m))))))));
};

table.hsv.srgb = compose(table.rgb.srgb, table.hsv.rgb);
table.hsv.hls  = compose(table.rgb.hls,  table.hsv.rgb);
table.hsv.xyz  = compose(table.rgb.xyz,  table.hsv.rgb);
table.hsv.luv  = compose(table.rgb.luv,  table.hsv.rgb);
table.hsv.hcl  = compose(table.rgb.hcl,  table.hsv.rgb);

// currently we assume a D65 white point, but this could be configurable
var white_point = table.xyz.create(95.047, 100.000, 108.883);
var white_point_uv = xyz_to_uv(white_point);

Shade.Colors.shadetable = table;

//////////////////////////////////////////////////////////////////////////////
// Color utility functions

// FIXME Ideally, I would like these to not depend on the 'table' variable,
// which is a gigantic mess. But for now, they do.

function flip(v) { return Shade(1).sub(v); }

Shade.Colors.desaturate = Shade(function(amount) {
    return function(color) {
        var a;
        if (color.type.equals(Shade.Types.vec4)) {
            a = color.a();
        }
        var rgb = table.rgb.create(color.r(), color.g(), color.b());
        var hsv = table.rgb.hsv(rgb);
        return table.hsv.create(hsv.h, hsv.s.mul(flip(amount)), hsv.v).as_shade(a);
    };
});

Shade.Colors.brighten = Shade(function(amount) {
    return function(color) {
        var a;
        if (color.type.equals(Shade.Types.vec4)) {
            a = color.a();
        }
        var rgb = table.rgb.create(color.r(), color.g(), color.b());
        var hls = table.rgb.hls(rgb);
        var darkness = flip(hls.l);
        amount = flip(amount);
        var resulting_darkness = darkness.mul(amount);
        return table.hls.create(hls.h, flip(resulting_darkness), hls.s).as_shade(a);
    };
});

Shade.Colors.darken = Shade(function(amount) {
    return function(color) {
        var a;
        if (color.type.equals(Shade.Types.vec4)) {
            a = color.a();
        }
        var rgb = table.rgb.create(color.r(), color.g(), color.b());
        var hls = table.rgb.hls(rgb);
        var darkness = flip(hls.l);
        amount = flip(amount);
        var resulting_darkness = darkness.mul(amount);
        return table.hls.create(hls.h, resulting_darkness, hls.s).as_shade(a);
    };
});

Shade.Colors.invert = Shade(function(c) {
    var a;
    if (c.type.equals(Shade.Types.vec4)) {
        a = c.a();
    }
    var rgb = table.rgb.create(c.r(), c.g(), c.b());
    var hls = table.rgb.hls(rgb);
    return table.hls.create(hls.h, flip(hls.l), hls.s).as_shade(a);
});

})();
/* These are all pretty sketchily dependent on the underlying
 precision of the FP units.

 It is likely that the only correct and portable implementations are
 through the use of texture lookup tables.

 */
Shade.Bits = {};
/* Shade.Bits.encode_float encodes a single 32-bit IEEE 754
   floating-point number as a 32-bit RGBA value, so that when rendered
   to a non-floating-point render buffer and read with readPixels, the
   resulting ArrayBufferView can be cast directly as a Float32Array,
   which will encode the correct value.

   These gymnastics are necessary because, shockingly, readPixels does
   not support reading off floating-point values of an FBO bound to a
   floating-point texture (!):

   https://www.khronos.org/webgl/public-mailing-list/archives/1108/threads.html#00020

   WebGL does not support bitwise operators. As a result, much of what
   is happening here is less efficient than it should be, and incurs
   precision losses. That is unfortunate, but currently unavoidable as
   well.

*/

// This function is currently only defined for "well-behaved" IEEE 754
// numbers. No denormals, NaN, infinities, etc.
Shade.Bits.encode_float = Shade.make(function(val) {

    var byte1, byte2, byte3, byte4;

    var is_zero = val.eq(0);

    var sign = val.gt(0).ifelse(0, 1);
    val = val.abs();

    var exponent = val.log2().floor();
    var biased_exponent = exponent.add(127);
    var fraction = val.div(exponent.exp2()).sub(1).mul(8388608); // 2^23

    var t = biased_exponent.div(2);
    var last_bit_of_biased_exponent = t.fract().mul(2);
    var remaining_bits_of_biased_exponent = t.floor();

    byte4 = Shade.Bits.extract_bits(fraction, 0, 8).div(255);
    byte3 = Shade.Bits.extract_bits(fraction, 8, 16).div(255);
    byte2 = last_bit_of_biased_exponent.mul(128)
        .add(Shade.Bits.extract_bits(fraction, 16, 23)).div(255);
    byte1 = sign.mul(128).add(remaining_bits_of_biased_exponent).div(255);

    return is_zero.ifelse(Shade.vec(0, 0, 0, 0),
                          Shade.vec(byte4, byte3, byte2, byte1));
});
/* Shade.Bits.extract_bits returns a certain bit substring of the
   original number using no bitwise operations, which are not available in WebGL.

   if they were, then the definition of extract_bits would be:

     extract_bits(num, from, to) = (num >> from) & ((1 << (to - from)) - 1)

   Shade.Bits.extract_bits assumes:

     num > 0
     from < to
*/

Shade.Bits.extract_bits = Shade.make(function(num, from, to) {
    from = from.add(0.5).floor();
    to = to.add(0.5).floor();
    return Shade.Bits.mask_last(Shade.Bits.shift_right(num, from), to.sub(from));
});
/* If webgl supported bitwise operations,
   mask_last(v, bits) = v & ((1 << bits) - 1)

   We use the slower version via mod():

   v & ((1 << k) - 1) = v % (1 << k)
*/
Shade.Bits.mask_last = Shade.make(function(v, bits) {
    return v.mod(Shade.Bits.shift_left(1, bits));
});
Shade.Bits.shift_left = Shade.make(function(v, amt) {
    return v.mul(amt.exp2()).round();
});
Shade.Bits.shift_right = Shade.make(function(v, amt) {
    // NB: this is *not* equivalent to any sequence of operations
    // involving round()

    // The extra gymnastics are necessary because
    //
    // 1. we cannot round the result, since some of the fractional values
    // might be larger than 0.5
    //
    // 2. shifting right by a large number (>22 in my tests) creates
    // a large enough float that precision is an issue (2^22 / exp2(22) < 1, for example). 
    // So we divide an ever so slightly larger number so that flooring
    // does the right thing.
    //
    // THIS REMAINS TO BE THOROUGHLY TESTED.
    //
    // There's possibly a better alternative involving integer arithmetic,
    // but GLSL ES allows implementations to use floating-point in place of integers.
    // 
    // It's likely that the only portably correct implementation of this
    // uses look-up tables. I won't fix this for now.

    v = v.floor().add(0.5);
    return v.div(amt.exp2()).floor();
});
Shade.Scale = {};

/*
 * nearest-neighbor interpolation
 */

Shade.Scale.ordinal = function(opts)
{
    function all_same(set) {
        return _.all(set, function(v) { return v.equals(set[0]); });
    }
    if (!(opts.range.length >= 2)) { 
        throw new Error("Shade.Scale.ordinal requires arrays of length at least 2");
    }
    var range = _.map(opts.range, Shade.make);
    var range_types = _.map(range,  function(v) { return v.type; });
    if (!all_same(range_types))
        throw new Error("Shade.Scale.linear requires range elements to have the same type");

    var choose = Shade.Utils.choose(range);

    return Shade(function(v) {
        return choose(v.as_float().add(0.5));
    });
};
Shade.Scale.linear = function(opts)
{
    var allowable_types = [
        Shade.Types.float_t,
        Shade.Types.vec2,
        Shade.Types.vec3,
        Shade.Types.vec4
    ];
    var vec_types = [
        Shade.Types.vec2,
        Shade.Types.vec3,
        Shade.Types.vec4
    ];
    function is_any(set) {
        return function(t) {
            return _.any(set, function(v) { return v.equals(t); });
        };
    }
    function all_same(set) {
        return _.all(set, function(v) { return v.equals(set[0]); });
    }

    opts = _.defaults(opts || {}, {
        domain: [0, 1],
        range: [0, 1]
    });

    //////////////////////////////////////////////////////////////////////////
    // typechecking

    // that condition is written awkwardly so it catches
    // opts.domain === undefined as well.
    if (!(opts.domain.length >= 2)) { 
        throw new Error("Shade.Scale.linear requires arrays of length at least 2");
    }
    if (opts.domain.length !== opts.range.length) {
        throw new Error("Shade.Scale.linear requires domain and range to be arrays of the same length");
    }

    opts.domain = _.map(opts.domain, Shade.make);
    opts.range = _.map(opts.range, Shade.make);

    var domain_types = _.map(opts.domain, function(v) { return v.type; });
    var range_types =  _.map(opts.range,  function(v) { return v.type; });

    if (!is_any(allowable_types)(domain_types[0]))
        throw new Error("Shade.Scale.linear requires domain type to be one of {float, vec2, vec3, vec4}");
    if (!all_same(domain_types))
        throw new Error("Shade.Scale.linear requires domain elements to have the same type");
    if (!is_any(allowable_types)(range_types[0]))
        throw new Error("Shade.Scale.linear requires range type to be one of {float, vec2, vec3, vec4}");
    if (!all_same(range_types))
        throw new Error("Shade.Scale.linear requires range elements to have the same type");
    if (is_any(vec_types)(domain_types[0]) && (!domain_types[0].equals(range_types[0])))
        throw new Error("Shade.Scale.linear for vec types require equal domain and range types");
    if (opts.domain.length < 2 || opts.range.length < 2)
        throw new Error("Shade.Scale.linear requires domain and range to have at least two elements");

    // Special-case the two-element scale for performance
    if (opts.domain.length === 2) {
        var f1 = opts.domain[0];
        var f2 = opts.domain[1];
        var t1 = opts.range[0];
        var t2 = opts.range[1];
        var df = Shade.sub(f2, f1);
        var dt = Shade.sub(t2, t1);

        return Shade(function(x) {
            return x.sub(f1).mul(dt.div(df)).add(t1);
        });
    } else {
        var domain_array = Shade.array(opts.domain);
        var range_array = Shade.array(opts.range);
        var dt = domain_array.array_element_type;

        return Shade(function(x) {
            function create_shade(i) {
                var segment_at_x = Shade.Scale.linear({
                    domain: [ opts.domain[i], opts.domain[i+1] ],
                    range:  [ opts.range[i],  opts.range[i+1] ] })(x);
                if (i === opts.domain.length-2) {
                    return segment_at_x;
                } else {
                    return Shade.ifelse(x.lt(opts.domain[i+1]),
                                        segment_at_x,
                                        create_shade(i+1));
                }
            }
            return create_shade(0);
        });
    }

/*

 The previous version of the code uses Shade.Array.locate to binary-search the array.
 However, it turns out that we're not allowed to read from arbitrary locations in an
 array (even if we could prove their safety) in WebGL's version of GLSL, which means
 I believe, in principle, that binary search is not implementable inside a for loop 
 in WebGL GLSL. (?!)

 I have temporarily replaced it with a dumb loop over the array.

        var result;

        if (dt.equals(Shade.Types.float_t))
            result = Shade(function(v) {
                var bs = domain_array.locate(v);
                var u = v.sub(bs("vl")).div(bs("vr").sub(bs("vl")));
                var output = Shade.mix(range_array.at(bs("l")), range_array.at(bs("r")), u);
                return output;
            });
        else if (_.any(["vec2", "vec3", "vec4"], function(t) 
                       {
                           return dt.equals(Shade.Types[t]);
                       })) {
            result = Shade(function(v) {
                var result = _.range(dt.vec_dimension()).map(function(i) {
                    var bs = domain_array.locate(v.at(i), function(array_value) {
                        return array_value.at(i);
                    });
                    var u = v.sub(bs("vl")).div(bs("vr").sub(bs("vl")));
                    var output = Shade.mix(range_array.at(bs("l")).at(i), 
                                           range_array.at(bs("r")).at(i), u);
                    return output;
                });
                return Shade.vec.apply(this, result);
            });
        } else {
            throw new Error("internal error on Shade.Scale.linear");
        }
        return result;
*/
};
Shade.Scale.transformed = function(opts)
{
    if (_.isUndefined(opts.transform)) {
        throw new Error("Shade.Scale.transform expects a domain transformation function");
    };
    var linear_scale = Shade.Scale.linear(opts);
    return Shade(function(x) {
        return linear_scale(opts.transform(x));
    });
};
Shade.Scale.log = function(opts)
{
    var new_opts = _.extend({
        transform: function(x) { return Shade.log(x); }
    }, opts);
    return Shade.Scale.transformed(new_opts);
};
Shade.Scale.log10 = function(opts)
{
    var new_opts = _.extend({
        transform: function(x) { return Shade.log(x).div(Math.log(10)); }
    }, opts);
    return Shade.Scale.transformed(new_opts);
};
Shade.Scale.log2 = function(opts)
{
    var new_opts = _.extend({
        transform: function(x) { return Shade.log(x).div(Math.log(2)); }
    }, opts);
    return Shade.Scale.transformed(new_opts);
};
Shade.Scale.Geo = {};
Shade.Scale.Geo.latlong_to_hammer = Shade(function(lat, lon, B)
{
    if (_.isUndefined(B))
        B = Shade(2);
    else if (!B.type.equals(Shade.Types.float_t))
        throw new Error("B should have type float");
    var phi = lat,
        lambda = lon;
    var eta = phi.cos().mul(lambda.div(B).cos()).add(1).sqrt();
    var x = B.mul(Math.sqrt(2)).mul(phi.cos()).mul(lambda.div(B).sin()).div(eta);
    var y = phi.sin().mul(Math.sqrt(2)).div(eta);
    var out = Shade.vec(x, y);
    return out;
});
Shade.Scale.Geo.latlong_to_mercator = Shade(function(lat, lon)
{
    lat = lat.div(2).add(Math.PI/4).tan().log();
    return Shade.vec(lon, lat);
});
Shade.Scale.Geo.latlong_to_spherical = Shade(function(lat, lon)
{
    var stretch = lat.cos();
    return Shade.vec(lon.sin().mul(stretch),
                     lat.sin(),
                     lon.cos().mul(stretch), 1);
});
Shade.Scale.Geo.mercator_to_latlong = Shade(function(x, y)
{
    // http://stackoverflow.com/a/1166095
    return Shade.vec(y.sinh().atan(), x);
});
Shade.Scale.Geo.mercator_to_spherical = Shade(function(x, y)
{
    var lat = y.sinh().atan();
    var lon = x;
    return Shade.Scale.Geo.latlong_to_spherical(lat, lon);
});
// replicates something like an opengl light. 
// Fairly bare-bones for now (only diffuse, no attenuation)
// gl_light is deprecated, functionality is being moved to Shade.Light
Shade.gl_light = function(opts)
{
    console.log("DEPRECATED: use Shade.Light functionality");
    opts = _.defaults(opts || {}, {
        light_ambient: Shade.vec(0,0,0,1),
        light_diffuse: Shade.vec(1,1,1,1),
        two_sided: false,
        per_vertex: false
    });
    function vec3(v) {
        return v.type.equals(Shade.Types.vec4) ? v.swizzle("xyz").div(v.at(3)) : v;
    }
    var light_pos = vec3(opts.light_position);
    var vertex_pos = vec3(opts.vertex);
    var material_color = opts.material_color;
    var light_ambient = opts.light_ambient;
    var light_diffuse = opts.light_diffuse;
    var per_vertex = opts.per_vertex;
    var vertex_normal = (opts.normal.type.equals(Shade.Types.vec4) ? 
                         opts.normal.swizzle("xyz") : 
                         opts.normal).normalize();

    // this must be appropriately transformed
    var N = vertex_normal;
    var L = light_pos.sub(vertex_pos).normalize();
    var v = Shade.max(Shade.ifelse(opts.two_sided,
                                   L.dot(N).abs(),
                                   L.dot(N)), 0);
    if (per_vertex)
        v = Shade.per_vertex(v);

    return Shade.add(light_ambient.mul(material_color),
                     v.mul(light_diffuse).mul(material_color));
};
Shade.Light = {};
// The most basic lighting component, ambient lighting simply multiplies
// the light color by the material color.
Shade.Light.ambient = function(light_opts)
{
    var color;
    if (light_opts.color.type.equals(Shade.Types.vec4)) {
        color = light_opts.color.swizzle("rgb");
    } else if (light_opts.color.type.equals(Shade.Types.vec3)) {
        color = light_opts.color;
    } else throw new Error("expected color of type vec3 or vec4, got " +
                           light_opts.color.type.repr() + " instead");
    return function(material_opts) {
        if (material_opts.color.type.equals(Shade.Types.vec4)) {
            return Shade.vec(
                material_opts.color.swizzle("xyz").mul(color),
                material_opts.color.swizzle("a")
            );
        } else {
            return material_opts.color.mul(color);
        }
    };
};
Shade.Light.diffuse = function(light_opts)
{
    light_opts = _.defaults(light_opts || {}, {
        color: Shade.vec(1,1,1,1)
    });

    function vec3(v) {
        return v.type.equals(Shade.Types.vec4) ? v.swizzle("xyz").div(v.at(3)) : v;
    }
    var light_diffuse = light_opts.color;
    if (light_diffuse.type.equals(Shade.Types.vec4))
        light_diffuse = light_diffuse.swizzle("xyz");
    var light_pos = vec3(light_opts.position);

    return function(material_opts) {
        material_opts = _.defaults(material_opts || {}, {
            two_sided: false
        });
        var vertex_pos = vec3(material_opts.position);
        var material_color = material_opts.color;
        if (material_color.type.equals(Shade.Types.vec4))
            material_color = material_color.swizzle("xyz");

        var vertex_normal;
        if (_.isUndefined(material_opts.normal)) {
            vertex_normal = Shade.ThreeD.normal(vertex_pos);
        } else {
            vertex_normal = vec3(material_opts.normal).normalize();
        }

        var L = light_pos.sub(vertex_pos).normalize();
        var v = Shade.max(Shade.ifelse(material_opts.two_sided,
                                       L.dot(vertex_normal).abs(),
                                       L.dot(vertex_normal)), 0);

        var c = Shade.add(v.mul(light_diffuse).mul(material_color));

        return material_opts.color.type.equals(Shade.Types.vec4) ?
            Shade.vec(c, material_opts.color.a()) : c;
    };
};
// functions to help with 3D rendering.
Shade.ThreeD = {};
// Shade.ThreeD.bump returns a normal perturbed by bump mapping.

Shade.ThreeD.bump = function(opts) {
    // Via Three.JS, and
    // http://mmikkelsen3d.blogspot.sk/2011/07/derivative-maps.html
    var uv         = opts.uv;
    var bump_map   = opts.map;
    var bump_scale = opts.scale;
    var surf_pos   = opts.position;
    var surf_norm  = opts.normal;

    var dSTdx      = Shade.dFdx(uv);
    var dSTdy      = Shade.dFdy(uv);
    var Hll        = Shade.texture2D(bump_map, uv).x();
    var dBx        = Shade.texture2D(bump_map, uv.add(dSTdx)).x().sub(Hll);
    var dBy        = Shade.texture2D(bump_map, uv.add(dSTdy)).x().sub(Hll);
    var dHdxy      = Shade.vec(dBx, dBy).mul(bump_scale);
    var sigmaX     = Shade.dFdx(surf_pos);
    var sigmaY     = Shade.dFdy(surf_pos);
    var R1         = Shade.cross(sigmaY, surf_norm);
    var R2         = Shade.cross(surf_norm, sigmaX);
    var det        = sigmaX.dot(R1);
    var vGrad      = det.sign().mul(dHdxy.x().mul(R1).add(dHdxy.y().mul(R2)));
    return det.abs().mul(surf_norm).sub(vGrad).normalize();
};
/*
 * Given a position expression, computes screen-space normals using
 * pixel derivatives
 */
Shade.ThreeD.normal = function(position)
{
    if (position.type.equals(Shade.Types.vec4))
        position = position.swizzle("xyz").div(position.w());
    var dPos_dpixelx = Shade.dFdx(position);
    var dPos_dpixely = Shade.dFdy(position);
    return Shade.normalize(Shade.cross(dPos_dpixelx, dPos_dpixely));
};
Shade.ThreeD.cull_backface = Shade(function(position, normal, ccw)
{
    if (_.isUndefined(ccw)) ccw = Shade(true);
    ccw = ccw.ifelse(1, -1);
    return position.discard_if(normal.dot(Shade.vec(0,0,ccw)).le(0));
});
Lux.Geometry = {};
Lux.Geometry.triangulate = function(opts) {
    var poly = _.map(opts.contour, function(contour) {
        var p = [];
        for (var i=0; i<contour.length; ++i) {
            p.push(contour[i][0], contour[i][1]);
        }
        return p;
    });
    return Lux.Lib.tessellate(poly);
};
Lux.Geometry.PLY = {};

Lux.Geometry.PLY.load = function(url, k) {

    function property_size(prop) {
        // char       character                 1
        // uchar      unsigned character        1
        // short      short integer             2
        // ushort     unsigned short integer    2
        // int        integer                   4
        // uint       unsigned integer          4
        // float      single-precision float    4
        // double     double-precision float    8
        return {'char': 1,
                'uchar': 1,
                'short': 2,
                'ushort': 2,
                'int': 4,
                'uint': 4,
                'float': 4,
                'double': 8}[prop.type];
    }
    function property_dataview_setter(prop) {
        return {'char': 'setInt8',
                'uchar': 'setUint8',
                'short': 'setInt16',
                'ushort': 'setUint16',
                'int': 'setInt32',
                'uint': 'setUint32',
                'float': 'setFloat32',
                'double': 'setFloat64'}[prop.type];
    }

    Lux.Net.ajax(url, function(result) {
        var lines = result.split('\n');
        var current_line = 0;

        var header_res = [
                /^element.*/,
                /^comment.*/,
                /^format.*/
        ];

        function parse_header() {
            var header = { 
                elements: [],
                comments: []
            };
            function fail() {
                throw new Error("parse error on line " + (current_line+1) + ": '" + lines[current_line] + "'");
            }
            if (lines[current_line] !== 'ply') {
                fail();
            }
            ++current_line;
            function parse_element_header() {
                var line = lines[current_line].trim().split(' ');
                ++current_line;
                var result = { name: line[1], count: Number(line[2]), 
                               properties: [] };
                line = lines[current_line].trim().split(' ');
                while (line[0] === 'property') {
                    if (line[1] === 'list') {
                        result.properties.push({ type: line[1], 
                                                 name: line[4],
                                                 element_type: line[3] });
                    } else {
                        result.properties.push({ type: line[1], name: line[2] });
                    }
                    ++current_line;
                    line = lines[current_line].trim().split(' ');
                }
                return result;
            }
            while (lines[current_line] !== 'end_header') {
                if (lines[current_line].match(/^element.*/)) {
                    header.elements.push(parse_element_header());
                } else if (lines[current_line].match(/^comment.*/)) {
                    header.comments.push(lines[current_line].trim().split(' ').slice(1).join(" "));
                    ++current_line;
                } else if (lines[current_line].match(/^format.*/)) {
                    header.format = lines[current_line].trim().split(' ').slice(1);
                    ++current_line;
                } else
                    fail();
            }
            current_line++;
            return header;
        };

        // element list parsing is currently very very primitive, and
        // limited to polygonal faces one typically sees in PLY files.

        function parse_element_list(element_header) {
            if (element_header.name !== 'face' ||
                element_header.properties.length !== 1 ||
                element_header.properties[0].element_type !== 'int') {
                throw new Error("element lists are only currently supported for 'face' element and a single property if type 'int'");
            }
            var result = [];
            var max_v = 0;
            for (var i=0; i<element_header.count; ++i) {
                var row = _.map(lines[current_line].trim().split(' '), Number);
                current_line++;
                if (row.length < 4)
                    continue;
                var vertex1 = row[1];
                max_v = Math.max(max_v, row[1], row[2]);
                for (var j=2; j<row.length-1; ++j) {
                    result.push(vertex1, row[j], row[j+1]);
                    max_v = Math.max(max_v, row[j+1]);
                }
            }
            if (max_v > 65535)
                return new Uint32Array(result);
            else
                return new Uint16Array(result);
        }

        function parse_element(element_header) {
            // are we parsing list properties?
            if (_.any(element_header.properties, function(prop) { return prop.type === 'list'; })) {
                if (_.any(element_header.properties, function(prop) { return prop.type !== 'list'; })) {
                    throw new Error("this PLY parser does not currently support mixed property types");
                }
                return parse_element_list(element_header);
            }
            // no, this is a plain property array
            // 
            // we always use a single arraybuffer and stride into it for performance.
            var row_size = _.reduce(_.map(element_header.properties, property_size),
                                    function(a,b) { return a+b; }, 0);
            var result_buffer = new ArrayBuffer(element_header.count * row_size);
            var view = new DataView(result_buffer);
            var row_offset = 0;
            var row_offsets = [];
            var property_setters = _.map(element_header.properties, function(prop) {
                return view[property_dataview_setter(prop)];
            });
            _.each(element_header.properties, function(prop) {
                row_offsets.push(row_offset);
                row_offset += property_size(prop);
            });
            var n_props = row_offsets.length;
            var endian = Lux._globals.ctx._lux_globals.little_endian;
            for (var i=0; i<element_header.count; ++i) {
                var row = _.map(lines[current_line].trim().split(' '), Number);
                current_line++;
                for (var j=0; j<row_offsets.length; ++j) {
                    property_setters[j].call(view, i * row_size + row_offsets[j], row[j], endian);
                };
            }
            return result_buffer;
        }

        function parse_content() {
            if (header.format[0] !== 'ascii' ||
                header.format[1] !== '1.0')
                throw new Error("format is unsupported: " + header.format.join(' '));
            return _.object(_.map(header.elements, function(element) {
                return [element.name, parse_element(element)];
            }));
        }

        var header = parse_header();
        var content = parse_content();
        k({ header: header, content: content });
    });
};
Lux.Text = {};
(function() {

function parse_typeface_instructions(glyph)
{
    // convert the string of typeface instructions coming from a typeface.js glyph
    // representation to a list of "paths", each path being a list of points
    // which are the glyph "internal polygon", and a list of "ears", the quadratic
    // splines that are to be rendered using Loop-Blinn.

    // this function mutates the passed glyph to memoize the result for increased
    // performance.

    if (_.isUndefined(glyph.o))
        return [];

    var x, y, cpx, cpy;
    var ops = _.map(glyph.o.split(" "), function(e) {
        var n = Number(e);
        return isNaN(n) ? e : n;
    });
    ops = ops.slice(0, ops.length-1);

    var paths = [];
    var points = [];
    var quadratic_ears = [];
    var current_point = undefined, control_point;
    var next_point = undefined;
    var pc = 0;
    var quadratic_sign, opcode;
    while (pc < ops.length) {
        switch (opcode = ops[pc++]) {
        case "m":
            if (points.length || quadratic_ears.length) {
                paths.push({points: points,
                            ears: quadratic_ears});
                points = [];
                quadratic_ears = [];
            }
            x = ops[pc++];
            y = ops[pc++];
            current_point = vec.make([x, y]);
            break;
        case "q":
            x = ops[pc++];
            y = ops[pc++];
            cpx = ops[pc++];
            cpy = ops[pc++];
            next_point = vec.make([x, y]);
            control_point = vec.make([cpx, cpy]);
            quadratic_sign = vec.cross(vec.minus(control_point, current_point),
                                       vec.minus(next_point, control_point));
            quadratic_sign = quadratic_sign / Math.abs(quadratic_sign);
            quadratic_ears.push([current_point, control_point, next_point, quadratic_sign]);

            if (quadratic_sign < 0) {
                if (current_point)
                    points.push(current_point);
                current_point = next_point;
            } else {
                if (current_point)
                    points.push(current_point);
                points.push(control_point);
                current_point = next_point;
            }
            break;
        case "l":
            if (current_point)
                points.push(current_point);
            x = ops[pc++];
            y = ops[pc++];
            current_point = vec.make([x, y]);
            break;
        default:
            throw new Error("Unsupported opcode '" + opcode + "'");
        };
    }
    if (points.length || quadratic_ears.length)
        paths.push({points: points,
                    ears: quadratic_ears});

    return paths;
}

var loop_blinn_actor = function(opts) {
    var position_function = opts.position;
    var color_function = opts.color;
    
    function quadratic_discriminator(model) {
        var u = model.uv.x(), v = model.uv.y(), 
        winding = model.winding.sign();
        return u.mul(u).sub(v).mul(winding);
    }
    
    function quadratic_discard(exp, model) {
        return exp.discard_if(quadratic_discriminator(model).gt(0));
    };

    var model = {};
    var uv = Lux.attribute_buffer({vertex_array: [0,0], item_size: 2});
    var winding = Lux.attribute_buffer({vertex_array: [0], item_size: 1});
    var position = Lux.attribute_buffer({vertex_array: [0,0], item_size: 2});
    var internal_position_attribute = Lux.attribute_buffer({vertex_array: [0,0], item_size: 2});
    var elements = Lux.element_buffer([0]); // {vertex_array: []});
    
    var ears_model = Lux.model({
        uv: uv,
        position: position,
        winding: winding,
        elements: 1,
        type: "triangles"
    });
    var x_offset = Shade.parameter("float", 0);
    var y_offset = Shade.parameter("float", 0);
    var offset = Shade.vec(x_offset, y_offset);
    var ears_position = Shade.add(ears_model.position, offset);
    var ears_actor = Lux.actor({
        model: ears_model, 
        appearance: {
            position: position_function(ears_position.div(1000).mul(opts.size)),
            color: quadratic_discard(color_function(ears_position), ears_model)}});
    var internal_model = Lux.model({
        vertex: internal_position_attribute,
        elements: elements
    });
    var internal_position = Shade.add(internal_model.vertex, offset);
    var internal_actor = Lux.actor({
        model: internal_model, 
        appearance: {
            position: position_function(internal_position.div(1000).mul(opts.size)),
            elements: internal_model.elements,
            color: color_function(internal_position)}});
    return {
        ears_actor: ears_actor,
        ears_model: ears_model,
        internal_actor: internal_actor,
        internal_model: internal_model,
        x_offset: x_offset,
        y_offset: y_offset
    };
};

function glyph_to_model(glyph)
{
    if (_.isUndefined(glyph._model)) {
        var paths = parse_typeface_instructions(glyph);
        if (paths.length === 0)
            return undefined;

        var elements = [], vertex = [], uv = [], position = [], winding = [];
        _.each(paths, function(path) {
            _.each(path.ears, function(ear) {
                winding.push.apply(winding, [-ear[3], -ear[3], -ear[3]]);
                position.push.apply(position, ear[0]);
                position.push.apply(position, ear[1]);
                position.push.apply(position, ear[2]);
                uv.push.apply(uv, [0,0, 0.5,0, 1,1]);
            });
        });

        var contour = _.map(paths, function(path) {
            return path.points.slice().reverse();
        });
        var triangulation = Lux.Geometry.triangulate({ contour: contour });
        var internal_model = Lux.model({
            type: "triangles",
            vertex: Lux.attribute_buffer({vertex_array: new Float32Array(triangulation.vertices), item_size: 2, keep_array: true}),
            elements: _.toArray(triangulation.triangles)
        });

        var ears_model = Lux.model({
            uv: Lux.attribute_buffer({vertex_array: uv, item_size: 2, keep_array: true}),
            position: Lux.attribute_buffer({vertex_array: position, item_size: 2, keep_array: true}),
            winding: Lux.attribute_buffer({vertex_array: winding, item_size: 1, keep_array: true}),
            elements: uv.length/2,
            type: "triangles"
        });

        glyph._model = {
            ears_model: ears_model, 
            internal_model: internal_model
        };
    };
    return glyph._model;
}

Lux.Text.outline = function(opts) {
    opts = _.defaults(opts, {
        string: "",
        size: 10,
        align: "left",
        position: function(pos) { return Shade.vec(pos, 0, 1); },
        color: function(pos) { return Shade.color("white"); }
    });
    if (_.isUndefined(opts.font)) {
        throw new Error("outline requires font parameter");
    }
    var actor = loop_blinn_actor(opts);

    var result = {
        set: function(new_string) {
            opts.string = new_string;
        },
        advance: function(char_offset) {
            var result = 0;
            while (char_offset < opts.string.length &&
                   "\n\r".indexOf(opts.string[char_offset])) {
                result += opts.font.glyphs[opts.string[char_offset++]].ha;
            }
            return result;
        },
        alignment_offset: function(char_offset) {
            var advance = this.advance(char_offset);
            switch (opts.align) {
            case "left": return 0;
            case "right": return -advance;
            case "center": return -advance/2;
            default:
                throw new Error("align must be one of 'left', 'center' or 'right'");
            }
        },
        dress: function(scene) {
            actor.internal_batch = actor.internal_actor.dress(scene);
            actor.ears_batch = actor.ears_actor.dress(scene);
            return {
                draw: function() {
                    actor.x_offset.set(result.alignment_offset(0));
                    actor.y_offset.set(0);
                    for (var i=0; i<opts.string.length; ++i) {
                        var c = opts.string[i];
                        if ("\n\r".indexOf(c) !== -1) {
                            actor.x_offset.set(0);                    
                            actor.y_offset.set(actor.y_offset.get() - opts.font.lineHeight);
                            continue;
                        }
                        var glyph = opts.font.glyphs[c];
                        if (_.isUndefined(glyph))
                            glyph = opts.font.glyphs['?'];
                        var model = glyph_to_model(glyph);
                        if (model) {
                            actor.ears_model.elements = model.ears_model.elements;
                            actor.ears_model.uv.set(model.ears_model.uv.get());
                            actor.ears_model.winding.set(model.ears_model.winding.get());
                            actor.ears_model.position.set(model.ears_model.position.get());
                            actor.internal_model.vertex.set(model.internal_model.vertex.get());
                            actor.internal_model.elements.set(model.internal_model.elements.array);
                            actor.ears_batch.draw();
                            actor.internal_batch.draw();
                        }
                        actor.x_offset.set(actor.x_offset.get() + glyph.ha);
                    }
                }
            };
        },
        on: function() { return true; }
    };
    return result;
};

})();
(function() {

function internal_actor(opts) {
    var texture = opts.font.texture;
    var texture_width = opts.font.texture_width;
    var texture_height = opts.font.texture_height;
    
    var position_function = opts.position;
    var color_function = opts.color;

    var uv = Lux.attribute_buffer({vertex_array: [0,0, 1, 0, 1, 1], item_size: 2});
    var position = Lux.attribute_buffer({vertex_array: [0,0, 1, 0, 1, 1], item_size: 2});
    var elements = Lux.element_buffer([0, 1, 2]);

    var x_offset = Shade.parameter("float", 0);
    var y_offset = Shade.parameter("float", 0);
    var offset = Shade.vec(x_offset, y_offset);
    var model = Lux.model({
        uv: uv,
        position: position,
        elements: elements,
        type: "triangles"
    });
    var world_position = Shade.add(model.position, offset).div(opts.font.ascender).mul(opts.size);
    var opacity = Shade.texture2D(texture, model.uv).r();
    var uv_gradmag = model.uv.x().mul(texture_width).dFdx().pow(2).add(model.uv.y().mul(texture_height).dFdy().pow(2)).sqrt();

    var blur_compensation = Shade.Scale.linear(
        {domain: [Shade.max(Shade(0.5).sub(uv_gradmag), 0), Shade.min(Shade(0.5).add(uv_gradmag), 1)],
         range: [0, 1]})(opacity).clamp(0, 1);

    var final_opacity = Shade.ifelse(opts.compensate_blur, blur_compensation, opacity);

    var final_color = color_function(world_position).mul(Shade.vec(1,1,1, final_opacity));
    var actor = Lux.actor({
        model: model, 
        appearance: {
            position: position_function(world_position),
            color: final_color,
            elements: model.elements,
            mode: Lux.DrawingMode.over_with_depth }});
    return {
        actor: actor,
        model: model,
        x_offset: x_offset,
        y_offset: y_offset
    };
}

function glyph_to_model(glyph, font)
{
    if (_.isUndefined(glyph._model)) {
        var elements = [0, 1, 2, 0, 2, 3];
        var position = [glyph.left, glyph.top - glyph.glyph_height,
                        glyph.left + glyph.glyph_width, glyph.top - glyph.glyph_height,
                        glyph.left + glyph.glyph_width, glyph.top,
                        glyph.left, glyph.top];
        var uv = [glyph.xoff / font.texture_width, 1 - (glyph.yoff + glyph.glyph_height) / font.texture_height,
                  (glyph.xoff + glyph.glyph_width) / font.texture_width, 1 - (glyph.yoff + glyph.glyph_height) / font.texture_height,
                  (glyph.xoff + glyph.glyph_width) / font.texture_width, 1 - glyph.yoff/font.texture_height,
                  glyph.xoff / font.texture_width, 1 - glyph.yoff/font.texture_height];
        glyph._model = Lux.model({
            type: "triangles",
            uv: Lux.attribute_buffer({vertex_array: uv, item_size: 2, keep_array: true}),
            position: Lux.attribute_buffer({vertex_array: position, item_size: 2, keep_array: true}),
            elements: Lux.element_buffer(elements)
        });
    }
    return glyph._model;
}

Lux.Text.texture = function(opts) {
    opts = _.defaults(opts, {
        string: "",
        size: 10,
        align: "left",
        position: function(pos) { return Shade.vec(pos, 0, 1); },
        color: function(pos) { return Shade.color("white"); },
        onload: function() { Lux.Scene.invalidate(); },
        compensate_blur: true
    });

    if (_.isUndefined(opts.font)) {
        throw new Error("Lux.Text.texture requires font parameter");
    }

    var actor = {};

    if (!opts.font.texture) {
        opts.font.texture = Lux.texture({
            src: opts.font.image_url,
            mipmaps: false,
            onload: function() {
                return opts.onload();
            }
        });
    }
    actor = internal_actor(opts);

    var result = {
        set: function(new_string) {
            opts.string = new_string;
        },
        advance: function(char_offset) {
            var result = 0;
            while (char_offset < opts.string.length &&
                   "\n\r".indexOf(opts.string[char_offset])) {
                // oh god i need to fix this mess
                var ix = String(opts.string[char_offset++].charCodeAt(0));
                result += opts.font.glyphs[ix].ha;
            }
            return result;
        },
        alignment_offset: function(char_offset) {
            var advance = this.advance(char_offset);
            switch (opts.align) {
            case "left": return 0;
            case "right": return -advance;
            case "center": return -advance/2;
            default:
                throw new Error("align must be one of 'left', 'center' or 'right'");
            }
        },
        dress: function(scene) {
            actor.batch = actor.actor.dress(scene);
            return {
                draw: function() {
                    actor.x_offset.set(result.alignment_offset(0));
                    actor.y_offset.set(0);
                    for (var i=0; i<opts.string.length; ++i) {
                        var c = opts.string[i];
                        if ("\n\r".indexOf(c) !== -1) {
                            actor.x_offset.set(0);
                            actor.y_offset.set(actor.y_offset.get() - opts.font.lineheight);
                            continue;
                        }
                        var glyph = opts.font.glyphs[String(c.charCodeAt(0))];
                        if (_.isUndefined(glyph))
                            glyph = opts.font.glyphs[String('?'.charCodeAt(0))];
                        var model = glyph_to_model(glyph, opts.font);
                        if (model) {
                            actor.model.elements = model.elements;
                            actor.model.uv.set(model.uv.get());
                            actor.model.position.set(model.position.get());
                            actor.batch.draw();
                        }
                        actor.x_offset.set(actor.x_offset.get() + glyph.ha);
                    }
                }
            };
        },
        on: function() { return true; }
    };
    return result;
};

})();
Lux.Debug = {};
Lux.Debug.init = function(div)
{
    if (Lux._globals.debug_table)
        return;
    if (_.isUndefined(div)) {
        div = $('<div style="position:absolute;left:1em;top:1em"></div>');
        $('body').append(div);
    }
    var table = $("<table></table>");
    div.append(table);
    Lux._globals.debug_table = table;
    Lux._globals.debug_dict = {};
};
Lux.Debug.post = function(key, value)
{
    Lux.Debug.init();
    var str = '<td>' + key + '</td><td>' + value + '</td>';
    if (Lux._globals.debug_dict[key]) {
        Lux._globals.debug_dict[key].html(str);
    } else {
        Lux._globals.debug_dict[key] = $('<tr>' + str + '</tr>');
        Lux._globals.debug_table.append(Lux._globals.debug_dict[key]);
    }
};
Lux.Marks = {};
//////////////////////////////////////////////////////////////////////////
// This is like a poor man's instancing/geometry shader. I need a
// general API for it.

Lux.Marks.aligned_rects = function(opts)
{
    opts = _.defaults(opts || {}, {
        mode: Lux.DrawingMode.standard,
        z: function() { return 0; }
    });
    if (!opts.elements) throw new Error("elements is a required field");
    if (!opts.left)     throw new Error("left is a required field");
    if (!opts.right)    throw new Error("right is a required field");
    if (!opts.top)      throw new Error("top is a required field");
    if (!opts.bottom)   throw new Error("bottom is a required field");
    if (!opts.color)    throw new Error("color is a required field");

    var index = _.range(opts.elements * 6);
    var vertex_index = Lux.attribute_buffer({ 
        vertex_array: index, 
        item_size: 1
    });
    var primitive_index = Shade.div(vertex_index, 6).floor();
    var vertex_in_primitive = Shade.mod(vertex_index, 6).floor();

    // aif == apply_if_function
    var aif = function(f, params) {
        if (Lux.type_of(f) === 'function')
            return f.apply(this, params);
        else
            return f;
    };

    var left   = aif(opts.left,   [primitive_index]),
        right  = aif(opts.right,  [primitive_index]),
        bottom = aif(opts.bottom, [primitive_index]),
        top    = aif(opts.top,    [primitive_index]),
        color  = aif(opts.color,  [primitive_index, index_in_vertex_primitive]),
        z      = aif(opts.z,      [primitive_index]);

    var lower_left  = Shade.vec(left,  bottom);
    var lower_right = Shade.vec(right, bottom);
    var upper_left  = Shade.vec(left,  top);
    var upper_right = Shade.vec(right, top);
    var vertex_map  = Shade.array([lower_left, upper_right, upper_left,
                                   lower_left, lower_right, upper_right]);
    var index_array = Shade.array([0, 2, 3, 0, 1, 2]);
    var index_in_vertex_primitive = index_array.at(vertex_in_primitive);

    var model = Lux.model({
        type: "triangles",
        elements: index
    });

    var appearance = {
        position: Shade.vec(vertex_map.at(vertex_in_primitive), z),
        color: color,
        pick_id: opts.pick_id,
        mode: opts.mode
    };

    return Lux.actor({ model: model, appearance: appearance });
};
Lux.Marks.lines = function(opts)
{
    opts = _.defaults(opts || {}, {
        mode: Lux.DrawingMode.standard,
        z: function() { return 0; }
    });

    if (_.isUndefined(opts.elements)) throw new Error("elements is a required field");
    if (_.isUndefined(opts.color))    throw new Error("color is a required field");
    if (_.isUndefined(opts.position) && 
        (_.isUndefined(opts.x) || _.isUndefined(opts.y))) {
        throw new Error("either position or x and y are required fields");
    }

    var vertex_index        = Lux.attribute_buffer({
        vertex_array: _.range(opts.elements * 2), 
        item_size: 1
    });
    var primitive_index     = Shade.div(vertex_index, 2).floor();
    var vertex_in_primitive = Shade.mod(vertex_index, 2).floor();

    var position = opts.position 
        ? opts.position(primitive_index, vertex_in_primitive)
        : Shade.vec(opts.x(primitive_index, vertex_in_primitive),
                    opts.y(primitive_index, vertex_in_primitive),
                    opts.z(primitive_index, vertex_in_primitive));

    var appearance = {
        mode: opts.mode,
        position: position,
        color: opts.color(primitive_index, vertex_in_primitive)
    };
    if (opts.line_width) {
        appearance.line_width = opts.line_width;
    }
    var model = {
        type: "lines",
        elements: vertex_index
    };
    return Lux.actor({ model: model, appearance: appearance });
};
Lux.Marks.dots = function(opts)
{
    opts = _.defaults(opts, {
        fill_color: Shade.vec(0,0,0,1),
        stroke_color: Shade.vec(0,0,0,1),
        point_diameter: 5,
        stroke_width: 2,
        mode: Lux.DrawingMode.over_with_depth,
        alpha: true,
        plain: false
    });

    if (!opts.position)
        throw new Error("missing required parameter 'position'");
    if (!opts.elements)
        throw new Error("missing required parameter 'elements'");

    var S = Shade;
    var ctx = Lux._globals.ctx;

    var fill_color     = Shade(opts.fill_color);
    var stroke_color   = Shade(opts.stroke_color);
    var point_diameter = Shade(opts.point_diameter).mul(ctx._lux_globals.devicePixelRatio);
    var stroke_width   = Shade(opts.stroke_width).add(1);
    var use_alpha      = Shade(opts.alpha);
    opts.plain = Shade(opts.plain);
    
    var model_opts = {
        type: "points",
        vertex: opts.position,
        elements: opts.elements
    };

    var model = Lux.model(model_opts);

    var distance_to_center_in_pixels = S.pointCoord().sub(S.vec(0.5, 0.5))
        .norm().mul(point_diameter);
    var point_radius = point_diameter.div(2);
    var distance_to_border = point_radius.sub(distance_to_center_in_pixels);
    var gl_Position = model.vertex;

    var no_alpha = S.mix(fill_color, stroke_color,
                         S.clamp(stroke_width.sub(distance_to_border), 0, 1));
    
    var plain_fill_color = fill_color;
    var alpha_fill_color = 
        S.ifelse(use_alpha,
                    no_alpha.mul(S.vec(1,1,1,S.clamp(distance_to_border, 0, 1))),
                    no_alpha)
        .discard_if(distance_to_center_in_pixels.gt(point_radius));

    var result = Lux.actor({
        model: model, 
        appearance: {
            position: gl_Position,
            point_size: point_diameter,
            color: opts.plain.ifelse(plain_fill_color, alpha_fill_color),
            mode: opts.mode,
            pick_id: opts.pick_id }});

    /* We pass the gl_Position attribute explicitly because some other
     call might want to explicitly use the same position of the dots marks.

     This is the exact use case of dot-and-line graph drawing.
     */
    result.gl_Position = gl_Position;
    return result;
};
Lux.Marks.scatterplot = function(opts)
{
    opts = _.defaults(opts, {
        x_scale: function (x) { return x; },
        y_scale: function (x) { return x; },
        xy_scale: function (x) { return x; }
    });

    function to_opengl(x) { return x.mul(2).sub(1); }
    var S = Shade;
    
    var x_scale = opts.x_scale;
    var y_scale = opts.y_scale;

    var position, elements;

    if (!_.isUndefined(opts.x)) {
        position = S.vec(to_opengl(opts.x_scale(opts.x)), 
                         to_opengl(opts.y_scale(opts.y)));
    } else if (!_.isUndefined(opts.xy)) {
        position = opts.xy_scale(opts.xy).mul(2).sub(S.vec(1,1));
    }

    if (opts.model) {
        elements = opts.model.elements;
    } else if (opts.elements) {
        elements = opts.elements;
    }
    return Lux.Marks.dots({
        position: position,
        elements: elements,
        fill_color: opts.fill_color,
        stroke_color: opts.stroke_color,
        point_diameter: opts.point_diameter,
        stroke_width: opts.stroke_width,
        mode: opts.mode,
        alpha: opts.alpha,
        plain: opts.plain,
        pick_id: opts.pick_id
    });
};
Lux.Marks.rectangle_brush = function(opts)
{
    opts = _.defaults(opts || {}, {
        color: Shade.vec(1,1,1,0.5),
        mode: Lux.DrawingMode.over_no_depth,
        on: {}
    });
    var gl = Lux._globals.ctx;
    var brush_is_active = false;
    var unproject;
    var selection_pt1 = Shade.parameter("vec2", vec.make([0,0]));
    var selection_pt2 = Shade.parameter("vec2", vec.make([0,0]));
    var b1;

    var handlers = {
        mousedown: function(event) {
            if (opts.accept_event(event)) {
                var xy_v = unproject(vec.make([event.luxX / gl._lux_globals.devicePixelRatio, event.luxY / gl._lux_globals.devicePixelRatio]));
                b1 = xy_v;
                selection_pt1.set(xy_v);
                brush_is_active = true;
                opts.on.brush_started && opts.on.brush_started(b1);
                return false;
            }
            return true;
        },
        mousemove: function(event) { 
            if (!brush_is_active)
                return true;
            if (opts.accept_event(event)) {
                var xy_v = unproject(vec.make([event.luxX / gl._lux_globals.devicePixelRatio, event.luxY / gl._lux_globals.devicePixelRatio]));
                selection_pt2.set(xy_v);
                var b2 = xy_v;
                opts.on.brush_changed && opts.on.brush_changed(b1, b2);
                Lux.Scene.invalidate();
                return false;
            }
            return true;
        },
        mouseup: function(event) {
            if (!brush_is_active)
                return true;
            brush_is_active = false;
            if (opts.accept_event(event)) {
                var xy_v = unproject(vec.make([event.luxX / gl._lux_globals.devicePixelRatio, event.luxY / gl._lux_globals.devicePixelRatio]));
                selection_pt2.set(xy_v);
                var b2 = xy_v;
                if (opts.on.brush_changed) {
                    opts.on.brush_changed(b1, b2);
                } else if (opts.on.brush_ended) {
                    opts.on.brush_ended(b1, b2);
                }
                Lux.Scene.invalidate();
                return false;
            }
            return true;
        }
    };

    var brush_actor = Lux.Marks.aligned_rects({
        elements: 1,
        left: selection_pt1.x(),
        right: selection_pt2.x(),
        top: selection_pt1.y(),
        bottom: selection_pt2.y(),
        color: opts.color,
        mode: opts.mode
    });

    return {
        dress: function(scene) {
            var ctx = Lux._globals.ctx;
            var xform = scene.get_transform();
            var half_screen_size = Shade.vec(ctx.parameters.width, ctx.parameters.height).div(2);
            unproject = Shade(function(p) {
                return xform.inverse({position: p.div(half_screen_size).sub(Shade.vec(1,1))}).position;
            }).js_evaluate;
            return brush_actor.dress(scene);
        }, on: function(ename, event) {
            var handler = handlers[ename];
            if (_.isUndefined(handler))
                return true;
            return handler(event);
        }
    };
};
(function() {

function spherical_mercator_patch(tess)
{
    var uv = [];
    var elements = [];
    var i, j;

    for (i=0; i<=tess; ++i)
        for (j=0; j<=tess; ++j)
            uv.push(i/tess, j/tess);

    for (i=0; i<tess; ++i)
        for (j=0; j<tess; ++j) {
            var ix = (tess + 1) * i + j;
            elements.push(ix, ix+1, ix+tess+2, ix, ix+tess+2, ix+tess+1);
        }

    return Lux.model({
        type: "triangles",
        uv: [uv, 2],
        elements: elements,
        vertex: function(min, max) {
            var xf = this.uv.mul(max.sub(min)).add(min);
            return Shade.Scale.Geo.mercator_to_spherical(xf.at(0), xf.at(1));
        },
        transformed_uv: function(min, max) {
            return Shade.mix(min, max, this.uv).div(Math.PI * 2).add(Shade.vec(0, 0.5));
        }
    });
}

function latlong_to_mercator(lat, lon)
{
    lat = lat / (180 / Math.PI);
    lon = lon / (180 / Math.PI);
    return [lon, Math.log(1.0/Math.cos(lat) + Math.tan(lat))];
}

Lux.Marks.globe = function(opts)
{
    opts = _.defaults(opts || {}, {
        longitude_center: -98,
        latitude_center: 38,
        zoom: 3,
        resolution_bias: 0,
        patch_size: 10,
        cache_size: 3,
        tile_pattern: function(zoom, x, y) {
            return "http://tile.openstreetmap.org/"+zoom+"/"+x+"/"+y+".png";
        }
    });
    var model = Shade.parameter("mat4");
    var patch = spherical_mercator_patch(opts.patch_size);
    var cache_size = 1 << (2 * opts.cache_size); // cache size must be (2^n)^2
    var tile_size = 256;
    var tiles_per_line  = 1 << (~~Math.round(Math.log(Math.sqrt(cache_size))/Math.log(2)));
    var super_tile_size = tile_size * tiles_per_line;

    var ctx = Lux._globals.ctx;
    var texture = Lux.texture({
        width: super_tile_size,
        height: super_tile_size,
        mipmaps: false
    });

    function new_tile(i) {
        var x = i % tiles_per_line;
        var y = ~~(i / tiles_per_line);
        return {
            texture: texture,
            offset_x: x,
            offset_y: y,
            // 0: inactive,
            // 1: mid-request,
            // 2: ready to draw.
            active: 0,
            x: -1,
            y: -1,
            zoom: -1,
            last_touched: 0
        };
    };

    var tiles = [];
    for (var i=0; i<cache_size; ++i) {
        tiles.push(new_tile(i));
    };

    var zooming = false, panning = false;
    var prev = [0,0];
    var inertia = 1;
    var move_vec = [0,0];

    // FIXME for some reason, sometimes mouseup is preceded by a quick mousemove,
    // even when apparently no mouse movement was detected. This extra tick
    // throws my inertial browsing off. We work around by keeping the
    // second-to-last tick.

    var last_moves = [0,0];
    function log_move() {
        last_moves[1] = last_moves[0];
        last_moves[0] = new Date().getTime();
    }

    var min_x = Shade.parameter("float");
    var max_x = Shade.parameter("float");
    var min_y = Shade.parameter("float");
    var max_y = Shade.parameter("float");
    var offset_x = Shade.parameter("float");
    var offset_y = Shade.parameter("float");
    var texture_scale = 1.0 / tiles_per_line;
    var sampler = Shade.parameter("sampler2D");

    var v = patch.vertex(Shade.vec(min_x, min_y), 
                         Shade.vec(max_x, max_y));

    var xformed_patch = patch.uv 
    // These two lines work around the texture seams on the texture atlas
        .mul((tile_size-1.0)/tile_size)
        .add(0.5/tile_size)
    //
        .add(Shade.vec(offset_x, offset_y))
        .mul(texture_scale)
    ;

    var sphere_actor = Lux.actor({
        model: patch, 
        appearance: {
            position: model(v),
            color: Shade.texture2D(sampler, xformed_patch).discard_if(model.mul(v).z().lt(0)),
            polygon_offset: opts.polygon_offset
        }});

    function inertia_tick() {
        var f = function() {
            Lux.Scene.invalidate();
            result.longitude_center += move_vec[0] * inertia;
            result.latitude_center  += move_vec[1] * inertia;
            result.latitude_center  = Math.max(Math.min(80, result.latitude_center), -80);
            result.update_model_matrix();
            if (inertia > 0.01)
                window.requestAnimationFrame(f, result.canvas);
            inertia *= 0.95;
        };
        f();
    }

    if (Lux.type_of(opts.zoom) === "number") {
        opts.zoom = Shade.parameter("float", opts.zoom);
    } else if (Lux.is_shade_expression(opts.zoom) !== "parameter") {
        throw new Error("zoom must be either a number or a parameter");
    }
    var foo = Shade.parameter("vec4");

    var result = {
        tiles: tiles,
        queue: [],
        current_osm_zoom: 3,
        longitude_center: opts.longitude_center,
        latitude_center: opts.latitude_center,
        zoom: opts.zoom,
        model_matrix: model,
        // lat_lon_position: function(lat, lon) {
        //     return model(Shade.Scale.Geo.latlong_to_spherical(lat, lon));
        // },
        resolution_bias: opts.resolution_bias,
        update_model_matrix: function() {
            while (this.longitude_center < 0)
                this.longitude_center += 360;
            while (this.longitude_center > 360)
                this.longitude_center -= 360;
            var r1 = Lux.rotation(this.latitude_center * (Math.PI/180), [ 1, 0, 0]);
            var r2 = Lux.rotation(this.longitude_center * (Math.PI/180), [ 0,-1, 0]);
            this.model_matrix.set(mat4.product(r1, r2));
        },
        mousedown: function(event) {
            prev[0] = event.offsetX;
            prev[1] = event.offsetY;
            inertia = 0;
            Lux.Scene.invalidate();
        },
        mousemove: function(event) {
            var w = ctx.viewportWidth;
            var h = ctx.viewportHeight;
            var w_divider = 218.18;
            var h_divider = 109.09;
            var zoom = this.zoom.get();

            if ((event.which & 1) && !event.shiftKey) {
                panning = true;
                move_vec[0] = -(event.offsetX - prev[0]) / (w * zoom / w_divider);
                move_vec[1] =  (event.offsetY - prev[1]) / (h * zoom / h_divider);
                prev[0] = event.offsetX;
                prev[1] = event.offsetY;
                log_move();
                this.longitude_center += move_vec[0];
                this.latitude_center += move_vec[1];
                this.latitude_center = Math.max(Math.min(80, this.latitude_center), -80);
                this.update_model_matrix();
                Lux.Scene.invalidate();
            }
            if (event.which & 1 && event.shiftKey) {
                zooming = true;
                var new_zoom = this.zoom.get() * (1.0 + (event.offsetY - prev[1]) / 240);
                this.zoom.set(Math.max(new_zoom, 0.5));
                Lux.Scene.invalidate();
            }
            this.new_center(this.latitude_center, this.longitude_center, this.zoom.get());
            prev[0] = event.offsetX;
            prev[1] = event.offsetY;
        },
        mouseup: function(event) {
            var w = ctx.viewportWidth;
            var h = ctx.viewportHeight;
            var w_divider = 218.18;
            var h_divider = 109.09;
            var now = Date.now();
            // assume 16.66 ms per tick,
            inertia = Math.pow(0.95, (now - last_moves[1]) / 16.666);
            if (panning)
                inertia_tick();
            panning = zooming = false;
        },
        new_center: function(center_lat, center_lon, center_zoom) {
            var w = ctx.viewportWidth;
            var zoom_divider = 63.6396;
            var base_zoom = Math.log(w / zoom_divider) / Math.log(2);

            var zoom = this.resolution_bias + base_zoom + (Math.log(center_zoom / 2.6) / Math.log(2));
            zoom = ~~zoom;
            this.current_osm_zoom = zoom;
            var lst = latlong_to_mercator(center_lat, center_lon);
            var y = (lst[1] / (Math.PI * 2) + 0.5) * (1 << zoom);
            var x = lst[0] / (Math.PI * 2) * (1 << zoom);
            // var y = (center_lat + 90) / 180 * (1 << zoom);
            // var x = center_lon / 360 * (1 << zoom);
            y = (1 << zoom) - y - 1;
            x = (x + (1 << (zoom - 1))) & ((1 << zoom) - 1);

            for (var i=-2; i<=2; ++i) {
                for (var j=-2; j<=2; ++j) {
                    var rx = ~~x + i;
                    var ry = ~~y + j;
                    if (ry < 0 || ry >= (1 << zoom))
                        continue;
                    if (rx < 0)
                        rx += 1 << zoom;
                    if (rx >= (1 << zoom))
                        rx -= 1 << zoom;
                    this.request(rx, ry, ~~zoom);
                }
            }
        },
        get_available_id: function(x, y, zoom) {
            // easy cases first: return available tile or a cache hit
            var now = Date.now();
            for (var i=0; i<cache_size; ++i) {
                if (this.tiles[i].x == x &&
                    this.tiles[i].y == y &&
                    this.tiles[i].zoom == zoom &&
                    this.tiles[i].active != 0) {
                    this.tiles[i].last_touched = now;
                    return i;
                }
            }
            for (i=0; i<cache_size; ++i) {
                if (!this.tiles[i].active) {
                    this.tiles[i].last_touched = now;
                    return i;
                }
            }
            // now we need to bump someone out. who?
            var worst_index = -1;
            var worst_time = 1e30;
            for (i=0; i<cache_size; ++i) {
                if (this.tiles[i].active == 1)
                    // don't use this one, it's getting bumped out
                    continue;
                var score = this.tiles[i].last_touched;
                if (score < worst_time) {
                    worst_time = score;
                    worst_index = i;
                }
            }
            return worst_index;
        },
        init: function() {
            for (var z=0; z<3; ++z)
                for (var i=0; i<(1 << z); ++i)
                    for (var j=0; j<(1 << z); ++j)
                        this.request(i, j, z);
            this.new_center(this.latitude_center, this.longitude_center, this.zoom.get());
            this.update_model_matrix();
        },
        sanity_check: function() {
            var d = {};
            for (var i=0; i<cache_size; ++i) {
                $("#x" + i).text(this.tiles[i].x);
                $("#y" + i).text(this.tiles[i].y);
                $("#z" + i).text(this.tiles[i].zoom);
                if (this.tiles[i].active !== 2)
                    continue;
                var k = this.tiles[i].x + "-" +
                    this.tiles[i].y + "-" +
                    this.tiles[i].zoom;
                if (d[k] !== undefined) {
                    console.log("BAD STATE!", 
                                this.tiles[i].x, this.tiles[i].y, this.tiles[i].zoom, 
                                this.tiles[i].active,
                                k);                    
                    throw new Error("Internal Error in globe");
                }
                d[k] = true;
            }
        },
        request: function(x, y, zoom) {
            var that = this;
            var id = this.get_available_id(x, y, zoom);
            if (id === -1) {
                alert("Could not fulfill request " + x + " " + y + " " + zoom);
                return;
            }
            if (this.tiles[id].x == x && 
                this.tiles[id].y == y && 
                this.tiles[id].zoom == zoom) {
                return;
            }

            that.tiles[id].x = x;
            that.tiles[id].y = y;
            that.tiles[id].zoom = zoom;
            this.tiles[id].active = 1;
            var f = function(x, y, zoom, id) {
                return function() {
                    that.tiles[id].active = 2;
                    that.tiles[id].last_touched = new Date().getTime();
                    // uncomment this during debugging
                    // that.sanity_check();
                    Lux.Scene.invalidate();
                };
            };
            texture: tiles[id].texture.load({
                src: opts.tile_pattern(zoom, x, y),
                crossOrigin: "anonymous",
                x_offset: tiles[id].offset_x * tile_size,
                y_offset: tiles[id].offset_y * tile_size,
                onload: f(x, y, zoom, id)
            });
        },
        scene: function(opts) {
            opts = _.clone(opts || {});
            opts.transform = function(appearance) {
                if (_.isUndefined(appearance.position))
                    return appearance;
                appearance = _.clone(appearance);
                var lat = appearance.position.x();
                var lon = appearance.position.y();
                appearance.position = model(Shade.Scale.Geo.latlong_to_spherical(lat, lon));
                return appearance;
            };
            return Lux.scene(opts);
        },
        dress: function(scene) {
            var sphere_batch = sphere_actor.dress(scene);
            return {
                draw: function() {
                    var lst = _.range(cache_size);
                    var that = this;
                    lst.sort(function(id1, id2) { 
                        var g1 = Math.abs(tiles[id1].zoom - that.current_osm_zoom);
                        var g2 = Math.abs(tiles[id2].zoom - that.current_osm_zoom);
                        return g2 - g1;
                    });

                    sampler.set(texture);
                    for (var i=0; i<cache_size; ++i) {
                        var t = tiles[lst[i]];
                        if (t.active !== 2)
                            continue;
                        min_x.set((t.x / (1 << t.zoom))           * Math.PI*2 + Math.PI);
                        min_y.set((1 - (t.y + 1) / (1 << t.zoom)) * Math.PI*2 - Math.PI);
                        max_x.set(((t.x + 1) / (1 << t.zoom))     * Math.PI*2 + Math.PI);
                        max_y.set((1 - t.y / (1 << t.zoom))       * Math.PI*2 - Math.PI);
                        offset_x.set(t.offset_x);
                        offset_y.set(t.offset_y);
                        sphere_batch.draw();
                    }
                }
            };
        },
        on: function() { return true; }
    };
    result.init();

    return result;
};

})();
Lux.Marks.globe_2d = function(opts)
{
    opts = _.defaults(opts || {}, {
        zoom: 3,
        resolution_bias: -1,
        patch_size: 10,
        cache_size: 3, // 3: 64 images; 4: 256 images.
        tile_pattern: function(zoom, x, y) {
            return "http://tile.openstreetmap.org/"+zoom+"/"+x+"/"+y+".png";
        },
        camera: function(v) { return v; },
        debug: false, // if true, add outline and x-y-zoom marker to every tile
        no_network: false, // if true, tile is always blank white and does no HTTP requests.
        post_process: function(c) { return c; }
    });

    var has_interactor = false, get_center_zoom;
    if (opts.interactor) {
        has_interactor = true;
        get_center_zoom = function() {
            return [opts.interactor.center.get()[0], 
                    opts.interactor.center.get()[1], 
                    opts.interactor.zoom.get()];
        };
    }
    if (opts.no_network) {
        opts.debug = true; // no_network implies debug;
    }

    var patch = Lux.model({
        type: "triangles",
        uv: [[0,0,1,0,1,1,0,0,1,1,0,1], 2],
        vertex: function(min, max) {
            return this.uv.mul(max.sub(min)).add(min);
        }
    });
    var cache_size = 1 << (2 * opts.cache_size);
    var tile_size = 256;
    var tiles_per_line  = 1 << (~~Math.round(Math.log(Math.sqrt(cache_size))/Math.log(2)));
    var super_tile_size = tile_size * tiles_per_line;

    var ctx = Lux._globals.ctx;
    var texture = Lux.texture({
        mipmaps: false,
        width: super_tile_size,
        height: super_tile_size
    });

    function new_tile(i) {
        var x = i % tiles_per_line;
        var y = ~~(i / tiles_per_line);
        return {
            texture: texture,
            offset_x: x,
            offset_y: y,
            // 0: inactive,
            // 1: mid-request,
            // 2: ready to draw.
            active: 0,
            x: -1,
            y: -1,
            zoom: -1,
            last_touched: 0
        };
    };

    var tiles = [];
    for (var i=0; i<cache_size; ++i) {
        tiles.push(new_tile(i));
    };

    var min_x = Shade.parameter("float");
    var max_x = Shade.parameter("float");
    var min_y = Shade.parameter("float");
    var max_y = Shade.parameter("float");
    var offset_x = Shade.parameter("float");
    var offset_y = Shade.parameter("float");
    var texture_scale = 1.0 / tiles_per_line;
    var sampler = Shade.parameter("sampler2D");

    var v = patch.vertex(Shade.vec(min_x, min_y), Shade.vec(max_x, max_y));

    var xformed_patch = patch.uv 
    // These two lines work around the texture seams on the texture atlas
        .mul((tile_size-1.0)/tile_size)
        .add(0.5/tile_size)
    //
        .add(Shade.vec(offset_x, offset_y))
        .mul(texture_scale)
    ;

    var tile_actor = Lux.actor({
        model: patch, 
        appearance: {
            position: opts.camera(v),
            color: opts.post_process(Shade.texture2D(sampler, xformed_patch)),
            mode: Lux.DrawingMode.pass }});

    if (Lux.type_of(opts.zoom) === "number") {
        opts.zoom = Shade.parameter("float", opts.zoom);
    } else if (Lux.is_shade_expression(opts.zoom) !== "parameter") {
        throw new Error("zoom must be either a number or a parameter");
    }

    var unproject;

    var result = {
        tiles: tiles,
        queue: [],
        current_osm_zoom: 0,
        lat_lon_position: Lux.Marks.globe_2d.lat_lon_to_tile_mercator,
        resolution_bias: opts.resolution_bias,
        new_center: function() {
            // ctx.viewport* here is bad...
            // var mn = unproject(vec.make([0, 0]));
            // var mx = unproject(vec.make([ctx.viewportWidth, ctx.viewportHeight]));
            var t = get_center_zoom();
            var center_x = t[0];
            var center_y = t[1];
            var center_zoom = t[2]; // opts.zoom.get();

            var screen_resolution_bias = Math.log(ctx.viewportHeight / 256) / Math.log(2);
            var zoom = this.resolution_bias + screen_resolution_bias + (Math.log(center_zoom) / Math.log(2));
            zoom = ~~zoom;
            this.current_osm_zoom = zoom;
            var y = center_y * (1 << zoom);
            var x = center_x * (1 << zoom);
            y = (1 << zoom) - y - 1;

            for (var i=-2; i<=2; ++i) {
                for (var j=-2; j<=2; ++j) {
                    var rx = ~~x + i;
                    var ry = ~~y + j;
                    if (ry < 0 || ry >= (1 << zoom))
                        continue;
                    if (rx < 0)
                        continue;
                    if (rx >= (1 << zoom))
                        continue;
                    this.request(rx, ry, ~~zoom);
                }
            }
        },
        get_available_id: function(x, y, zoom) {
            // easy cases first: return available tile or a cache hit
            var now = Date.now();
            for (var i=0; i<cache_size; ++i) {
                if (this.tiles[i].x == x &&
                    this.tiles[i].y == y &&
                    this.tiles[i].zoom == zoom &&
                    this.tiles[i].active != 0) {
                    this.tiles[i].last_touched = now;
                    return i;
                }
            }
            for (i=0; i<cache_size; ++i) {
                if (!this.tiles[i].active) {
                    this.tiles[i].last_touched = now;
                    return i;
                }
            }
            // now we need to bump someone out. who?
            var worst_index = -1;
            var worst_time = 1e30;
            for (i=0; i<cache_size; ++i) {
                if (this.tiles[i].active == 1)
                    // don't use this one, it's getting bumped out
                    continue;
                var score = this.tiles[i].last_touched;
                if (score < worst_time) {
                    worst_time = score;
                    worst_index = i;
                }
            }
            return worst_index;
        },
        init: function() {
            for (var z=0; z<3; ++z)
                for (var i=0; i<(1 << z); ++i)
                    for (var j=0; j<(1 << z); ++j)
                        this.request(i, j, z);
        },
        sanity_check: function() {
            var d = {};
            for (var i=0; i<cache_size; ++i) {
                $("#x" + i).text(this.tiles[i].x);
                $("#y" + i).text(this.tiles[i].y);
                $("#z" + i).text(this.tiles[i].zoom);
                if (this.tiles[i].active !== 2)
                    continue;
                var k = this.tiles[i].x + "-" +
                    this.tiles[i].y + "-" +
                    this.tiles[i].zoom;
                if (d[k] !== undefined) {
                    console.log("BAD STATE!", 
                                this.tiles[i].x, this.tiles[i].y, this.tiles[i].zoom, 
                                this.tiles[i].active,
                                k);                    
                    throw new Error("Internal Error in globe_2d");
                }
                d[k] = true;
            }
        },
        request: function(x, y, zoom) {
            var that = this;
            var id = this.get_available_id(x, y, zoom);
            if (id === -1) {
                console.log("Could not fulfill request " + x + " " + y + " " + zoom);
                return;
            }
            if (this.tiles[id].x == x && 
                this.tiles[id].y == y && 
                this.tiles[id].zoom == zoom) {
                return;
            }

            that.tiles[id].x = x;
            that.tiles[id].y = y;
            that.tiles[id].zoom = zoom;
            this.tiles[id].active = 1;
            var f = function(x, y, zoom, id) {
                return function() {
                    that.tiles[id].active = 2;
                    that.tiles[id].last_touched = Date.now();
                    // uncomment this during debugging
                    // that.sanity_check();
                    Lux.Scene.invalidate();
                };
            };
            var xform = opts.debug ? function(image) {
                var c = document.createElement("canvas");
                c.setAttribute("width", image.width);
                c.setAttribute("height", image.height);
                var ctx = c.getContext('2d');
                ctx.drawImage(image, 0, 0);
                ctx.font = "12pt Helvetica Neue";
                ctx.fillStyle = "black";
                ctx.fillText(zoom + " " + x + " " + y + " ", 10, 250);
                ctx.lineWidth = 3;
                ctx.strokeStyle = "black";
                ctx.strokeRect(0, 0, 256, 256);
                return c;
            } : function(image) { return image; };
            var obj = {
                transform_image: xform,
                crossOrigin: "anonymous",
                x_offset: tiles[id].offset_x * tile_size,
                y_offset: tiles[id].offset_y * tile_size,
                onload: f(x, y, zoom, id)
            };
            if (opts.no_network) {
                if (!Lux._globals.blank_globe_2d_image) {
                    var c = document.createElement("canvas");
                    c.setAttribute("width", 256);
                    c.setAttribute("height", 256);
                    var ctx = c.getContext('2d');
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, 256, 256);
                    Lux._globals.blank_globe_2d_image = c;
                }
                obj.canvas = Lux._globals.blank_globe_2d_image;
            } else {
                obj.src = opts.tile_pattern(zoom, x, y);
            }
            tiles[id].texture.load(obj);
        },
        dress: function(scene) {
            var tile_batch = tile_actor.dress(scene);
            var xf = scene.get_transform().inverse;
            if (!has_interactor) {
                get_center_zoom = function() {
                    var p1 = unproject(vec.make([0, 0]));
                    var p2 = unproject(vec.make([1, 1]));
                    var zoom = 1.0/(p2[1] - p1[1]);
                    return [p1[0], p1[1], zoom];
                };
                unproject = Shade(function(p) {
                    return xf({position: p}).position;
                }).js_evaluate;
            }
            var that = this;
            return {
                draw: function() {
                    that.new_center();
                    var lst = _.range(cache_size);
                    lst.sort(function(id1, id2) { 
                        var g1 = Math.abs(tiles[id1].zoom - that.current_osm_zoom);
                        var g2 = Math.abs(tiles[id2].zoom - that.current_osm_zoom);
                        return g2 - g1;
                    });

                    sampler.set(texture);
                    for (var i=0; i<cache_size; ++i) {
                        var t = tiles[lst[i]];
                        if (t.active !== 2)
                            continue;
                        var z = (1 << t.zoom);
                        min_x.set(t.x / z);
                        min_y.set(1 - (t.y + 1) / z);
                        max_x.set((t.x + 1) / z);
                        max_y.set(1 - t.y / z);
                        offset_x.set(t.offset_x);
                        offset_y.set(t.offset_y);
                        tile_batch.draw();
                    }
                }
            };
        },
        on: function() { return true; }
    };
    result.init();

    return result;
};

Lux.Marks.globe_2d.scene = function(opts)
{
    opts = _.clone(opts || {});
    opts.transform = function(appearance) {
        if (_.isUndefined(appearance.position))
            return appearance;
        appearance = _.clone(appearance);
        var lat = appearance.position.x();
        var lon = appearance.position.y();
        appearance.position = Lux.Marks.globe_2d.lat_lon_to_tile_mercator(lat, lon);
        return appearance;
    };
    return Lux.scene(opts);
};

Lux.Marks.globe_2d.lat_lon_to_tile_mercator = Shade(function(lat, lon) {
    return Shade.Scale.Geo.latlong_to_mercator(lat, lon).div(Math.PI * 2).add(Shade.vec(0.5,0.5));
});

// Lux.Marks.globe_2d.transform = function(appearance) {
//     var new_appearance = _.clone(appearance);
//     new_appearance.position = Shade.vec(Lux.Marks.globe_2d.lat_lon_to_tile_mercator(
//         appearance.position.x(),
//         appearance.position.y()), appearance.position.swizzle("xw"));
//     return new_appearance;
// };

// Lux.Marks.globe_2d.transform.inverse = function() { throw new Error("unimplemented"); };
Lux.Models = {};
Lux.Models.flat_cube = function() {
    return Lux.model({
        type: "triangles",
        elements: [0,  1,  2,  0,  2,  3,
                   4,  5,  6,  4,  6,  7,
                   8,  9,  10, 8,  10, 11,
                   12, 13, 14, 12, 14, 15,
                   16, 17, 18, 16, 18, 19,
                   20, 21, 22, 20, 22, 23],
        vertex: [[ 1, 1,-1, -1, 1,-1, -1, 1, 1,  1, 1, 1,
                   1,-1, 1, -1,-1, 1, -1,-1,-1,  1,-1,-1,
                   1, 1, 1, -1, 1, 1, -1,-1, 1,  1,-1, 1,
                   1,-1,-1, -1,-1,-1, -1, 1,-1,  1, 1,-1,
                   -1, 1, 1, -1, 1,-1, -1,-1,-1, -1,-1, 1,
                   1, 1,-1,  1, 1, 1,  1,-1, 1,  1,-1,-1], 3],
        normal: [[ 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
                   0,-1, 0, 0,-1, 0, 0,-1, 0, 0,-1, 0,
                   0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
                   0, 0,-1, 0, 0,-1, 0, 0,-1, 0, 0,-1,
                   -1, 0, 0,-1, 0, 0,-1, 0, 0,-1, 0, 0,
                   1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], 3],
        tex_coord: [[0,0, 1,0, 1,1, 0,1,
                     0,0, 1,0, 1,1, 0,1,
                     0,0, 1,0, 1,1, 0,1,
                     0,0, 1,0, 1,1, 0,1,
                     0,0, 1,0, 1,1, 0,1,
                     0,0, 1,0, 1,1, 0,1], 2]
    });
};
Lux.Models.mesh = function(u_secs, v_secs) {
    var verts = [];
    var elements = [];
    if (_.isUndefined(v_secs)) v_secs = u_secs;
    if (v_secs <= 0) throw new Error("v_secs must be positive");
    if (u_secs <= 0) throw new Error("u_secs must be positive");
    v_secs = Math.floor(v_secs);
    u_secs = Math.floor(u_secs);
    var i, j;    
    for (i=0; i<=v_secs; ++i) {
        var v = (i / v_secs);
        for (j=0; j<=u_secs; ++j) {
            var u = (j / u_secs);
            verts.push(u, v);
        }
    }
    for (i=0; i<v_secs; ++i) {
        for (j=0; j<=u_secs; ++j) {
            elements.push(i * (u_secs + 1) + j,
                          (i + 1) * (u_secs + 1) + j);
        }
        // set up a non-rasterizing triangle in the middle of the strip
        // to transition between strips.
        if (i < v_secs-1) {
            elements.push((i + 1) * (u_secs + 1) + u_secs,
                          (i + 2) * (u_secs + 1),
                          (i + 2) * (u_secs + 1)
                         );
        }
    }

    var uv_attr = Shade(Lux.attribute_buffer({
        vertex_array: verts, 
        item_size: 2
    }));
    return Lux.model({
        type: "triangle_strip",
        tex_coord: uv_attr,
        vertex: uv_attr.mul(2).sub(1),
        elements: Lux.element_buffer(elements)
    });
};
Lux.Models.sphere = function(lat_secs, long_secs) {
    if (_.isUndefined(lat_secs)) {
        lat_secs = 5;
        long_secs = 5;
    }
    var verts = [];
    var elements = [];
    if (_.isUndefined(long_secs)) long_secs = lat_secs;
    if (lat_secs <= 0) throw new Error("lat_secs must be positive");
    if (long_secs <= 0) throw new Error("long_secs must be positive");
    lat_secs = Math.floor(lat_secs);
    long_secs = Math.floor(long_secs);
    var i, j, phi, theta;    
    for (i=0; i<=lat_secs; ++i) {
        phi = (i / lat_secs);
        for (j=0; j<long_secs; ++j) {
            theta = (j / long_secs);
            verts.push(theta, phi);
        }
    }
    for (i=0; i<lat_secs; ++i) {
        for (j=0; j<long_secs; ++j) {
            elements.push(i * long_secs + j,
                          i * long_secs + ((j + 1) % long_secs),
                          (i + 1) * long_secs + j,
                          i * long_secs + ((j + 1) % long_secs),
                          (i + 1) * long_secs + ((j + 1) % long_secs),
                          (i + 1) * long_secs + j);
        }
    }

    var S = Shade;
    var uv_attr = Lux.attribute_buffer({ vertex_array: verts, item_size: 2});
    phi = S.sub(S.mul(Math.PI, S.swizzle(uv_attr, "r")), Math.PI/2);
    theta = S.mul(2 * Math.PI, S.swizzle(uv_attr, "g"));
    var cosphi = S.cos(phi);
    var position = S.vec(S.sin(theta).mul(cosphi),
                         S.sin(phi),
                         S.cos(theta).mul(cosphi), 1);
    return Lux.model({
        type: "triangles",
        elements: Lux.element_buffer(elements),
        vertex: position,
        tex_coord: uv_attr,
        normal: position
    });
};
Lux.Models.square = function() {
    var uv = Shade(Lux.attribute_buffer({
        vertex_array: [0, 0, 1, 0, 0, 1, 1, 1], 
        item_size: 2
    }));
    return Lux.model({
        type: "triangles",
        elements: Lux.element_buffer([0, 1, 2, 1, 3, 2]),
        vertex: uv,
        tex_coord: uv
    });
};
Lux.Models.teapot = function()
{
    // Teapot data from Daniel Wagner (daniel@ims.tuwien.ac.at), via freeglut
    var teapot_coords = [
        2.1, 3.6, 0.0, 
        2.071, 3.711, 0.0, 
        2.105, 3.748, 0.0, 
        2.174, 3.711, 0.0, 
        2.25, 3.6, 0.0, 
        1.937, 3.6, 0.8242, 
        1.91, 3.711, 0.8128, 
        1.942, 3.748, 0.8261, 
        2.005, 3.711, 0.8532, 
        2.076, 3.6, 0.8831, 
        1.491, 3.6, 1.491, 
        1.47, 3.711, 1.47, 
        1.494, 3.748, 1.494, 
        1.543, 3.711, 1.543, 
        1.597, 3.6, 1.597, 
        0.8242, 3.6, 1.937, 
        0.8128, 3.711, 1.91, 
        0.8261, 3.748, 1.942, 
        0.8532, 3.711, 2.005, 
        0.8831, 3.6, 2.076, 
        0.0, 3.6, 2.1, 
        0.0, 3.711, 2.071, 
        0.0, 3.748, 2.105, 
        0.0, 3.711, 2.174, 
        0.0, 3.6, 2.25, 
            -0.8812, 3.6, 1.937,
            -0.8368, 3.711, 1.91, 
            -0.8332, 3.748, 1.942, 
            -0.8541, 3.711, 2.005, 
            -0.8831, 3.6, 2.076, 
            -1.542, 3.6, 1.491, 
            -1.492, 3.711, 1.47, 
            -1.501, 3.748, 1.494, 
            -1.544, 3.711, 1.543, 
            -1.597, 3.6, 1.597, 
            -1.956, 3.6, 0.8242, 
            -1.918, 3.711, 0.8128, 
            -1.944, 3.748, 0.8261, 
            -2.006, 3.711, 0.8532, 
            -2.076, 3.6, 0.8831, 
            -2.1, 3.6, 0.0, 
            -2.071, 3.711, 0.0, 
            -2.105, 3.748, 0.0, 
            -2.174, 3.711, 0.0, 
            -2.25, 3.6, 0.0, 
            -1.937, 3.6, -0.8242, 
            -1.91, 3.711, -0.8128, 
            -1.942, 3.748, -0.8261, 
            -2.005, 3.711, -0.8532, 
            -2.076, 3.6, -0.8831, 
            -1.491, 3.6, -1.491, 
            -1.47, 3.711, -1.47, 
            -1.494, 3.748, -1.494, 
            -1.543, 3.711, -1.543, 
            -1.597, 3.6, -1.597, 
            -0.8242, 3.6, -1.937, 
            -0.8128, 3.711, -1.91, 
            -0.8261, 3.748, -1.942, 
            -0.8532, 3.711, -2.005, 
            -0.8831, 3.6, -2.076, 
        0.0, 3.6, -2.1, 
        0.0, 3.711, -2.071, 
        0.0, 3.748, -2.105, 
        0.0, 3.711, -2.174, 
        0.0, 3.6, -2.25, 
        0.8242, 3.6, -1.937, 
        0.8128, 3.711, -1.91, 
        0.8261, 3.748, -1.942, 
        0.8532, 3.711, -2.005, 
        0.8831, 3.6, -2.076, 
        1.491, 3.6, -1.491, 
        1.47, 3.711, -1.47, 
        1.494, 3.748, -1.494, 
        1.543, 3.711, -1.543, 
        1.597, 3.6, -1.597, 
        1.937, 3.6, -0.8242, 
        1.91, 3.711, -0.8128, 
        1.942, 3.748, -0.8261, 
        2.005, 3.711, -0.8532, 
        2.076, 3.6, -0.8831, 
        2.525, 3.011, 0.0, 
        2.766, 2.433, 0.0, 
        2.936, 1.876, 0.0, 
        3.0, 1.35, 0.0, 
        2.33, 3.011, 0.9912, 
        2.551, 2.433, 1.086, 
        2.708, 1.876, 1.152, 
        2.767, 1.35, 1.178, 
        1.793, 3.011, 1.793, 
        1.964, 2.433, 1.964, 
        2.084, 1.876, 2.084, 
        2.13, 1.35, 2.13, 
        0.9912, 3.011, 2.33, 
        1.086, 2.433, 2.551, 
        1.152, 1.876, 2.708, 
        1.178, 1.35, 2.767, 
        0.0, 3.011, 2.525, 
        0.0, 2.433, 2.766, 
        0.0, 1.876, 2.936, 
        0.0, 1.35, 3.0, 
            -0.9912, 3.011, 2.33, 
            -1.086, 2.433, 2.551, 
            -1.152, 1.876, 2.708, 
            -1.178, 1.35, 2.767, 
            -1.793, 3.011, 1.793, 
            -1.964, 2.433, 1.964, 
            -2.084, 1.876, 2.084, 
            -2.13, 1.35, 2.13, 
            -2.33, 3.011, 0.9912, 
            -2.551, 2.433, 1.086, 
            -2.708, 1.876, 1.152, 
            -2.767, 1.35, 1.178, 
            -2.525, 3.011, 0.0, 
            -2.766, 2.433, 0.0, 
            -2.936, 1.876, 0.0, 
            -3.0, 1.35, 0.0, 
            -2.33, 3.011, -0.9912, 
            -2.551, 2.433, -1.086, 
            -2.708, 1.876, -1.152, 
            -2.767, 1.35, -1.178, 
            -1.793, 3.011, -1.793, 
            -1.964, 2.433, -1.964, 
            -2.084, 1.876, -2.084, 
            -2.13, 1.35, -2.13, 
            -0.9912, 3.011, -2.33, 
            -1.086, 2.433, -2.551, 
            -1.152, 1.876, -2.708, 
            -1.178, 1.35, -2.767, 
        0.0, 3.011, -2.525, 
        0.0, 2.433, -2.766, 
        0.0, 1.876, -2.936, 
        0.0, 1.35, -3.0, 
        0.9912, 3.011, -2.33, 
        1.086, 2.433, -2.551, 
        1.152, 1.876, -2.708, 
        1.178, 1.35, -2.767, 
        1.793, 3.011, -1.793, 
        1.964, 2.433, -1.964, 
        2.084, 1.876, -2.084, 
        2.13, 1.35, -2.13, 
        2.33, 3.011, -0.9912, 
        2.551, 2.433, -1.086, 
        2.708, 1.876, -1.152, 
        2.767, 1.35, -1.178, 
        2.883, 0.9053, 0.0, 
        2.625, 0.5766, 0.0, 
        2.367, 0.3533, 0.0, 
        2.25, 0.225, 0.0, 
        2.659, 0.9053, 1.132, 
        2.422, 0.5766, 1.03, 
        2.184, 0.3533, 0.9291, 
        2.076, 0.225, 0.8831, 
        2.047, 0.9053, 2.047, 
        1.864, 0.5766, 1.864, 
        1.681, 0.3533, 1.681, 
        1.597, 0.225, 1.597, 
        1.132, 0.9053, 2.659, 
        1.03, 0.5766, 2.422, 
        0.9291, 0.3533, 2.184, 
        0.8831, 0.225, 2.076, 
        0.0, 0.9053, 2.883, 
        0.0, 0.5766, 2.625, 
        0.0, 0.3533, 2.367, 
        0.0, 0.225, 2.25, 
            -1.132, 0.9053, 2.659, 
            -1.03, 0.5766, 2.422, 
            -0.9291, 0.3533, 2.184, 
            -0.8831, 0.225, 2.076, 
            -2.047, 0.9053, 2.047, 
            -1.864, 0.5766, 1.864, 
            -1.681, 0.3533, 1.681, 
            -1.597, 0.225, 1.597, 
            -2.659, 0.9053, 1.132, 
            -2.422, 0.5766, 1.03, 
            -2.184, 0.3533, 0.9291, 
            -2.076, 0.225, 0.8831, 
            -2.883, 0.9053, 0.0, 
            -2.625, 0.5766, 0.0, 
            -2.367, 0.3533, 0.0, 
            -2.25, 0.225, 0.0, 
            -2.659, 0.9053, -1.132, 
            -2.422, 0.5766, -1.03, 
            -2.184, 0.3533, -0.9291, 
            -2.076, 0.225, -0.8831, 
            -2.047, 0.9053, -2.047, 
            -1.864, 0.5766, -1.864, 
            -1.681, 0.3533, -1.681, 
            -1.597, 0.225, -1.597, 
            -1.132, 0.9053, -2.659, 
            -1.03, 0.5766, -2.422, 
            -0.9291, 0.3533, -2.184, 
            -0.8831, 0.225, -2.076, 
        0.0, 0.9053, -2.883, 
        0.0, 0.5766, -2.625, 
        0.0, 0.3533, -2.367, 
        0.0, 0.225, -2.25, 
        1.132, 0.9053, -2.659, 
        1.03, 0.5766, -2.422, 
        0.9291, 0.3533, -2.184, 
        0.8831, 0.225, -2.076, 
        2.047, 0.9053, -2.047, 
        1.864, 0.5766, -1.864, 
        1.681, 0.3533, -1.681, 
        1.597, 0.225, -1.597, 
        2.659, 0.9053, -1.132, 
        2.422, 0.5766, -1.03, 
        2.184, 0.3533, -0.9291, 
        2.076, 0.225, -0.8831, 
        2.199, 0.1424, 0.0, 
        1.927, 0.07031, 0.0, 
        1.253, 0.01934, 0.0, 
        0.0, 0.0, 0.0, 
        2.029, 0.1424, 0.8631, 
        1.777, 0.07031, 0.7562, 
        1.156, 0.01934, 0.4919, 
        1.561, 0.1424, 1.561, 
        1.368, 0.07031, 1.368, 
        0.8899, 0.01934, 0.8899, 
        0.8631, 0.1424, 2.029, 
        0.7562, 0.07031, 1.777, 
        0.4919, 0.01934, 1.156, 
        0.0, 0.1424, 2.199, 
        0.0, 0.07031, 1.927, 
        0.0, 0.01934, 1.253, 
            -0.8631, 0.1424, 2.029, 
            -0.7562, 0.07031, 1.777, 
            -0.4919, 0.01934, 1.156, 
            -1.561, 0.1424, 1.561, 
            -1.368, 0.07031, 1.368, 
            -0.8899, 0.01934, 0.8899, 
            -2.029, 0.1424, 0.8631, 
            -1.777, 0.07031, 0.7562, 
            -1.156, 0.01934, 0.4919, 
            -2.199, 0.1424, 0.0, 
            -1.927, 0.07031, 0.0, 
            -1.253, 0.01934, 0.0, 
            -2.029, 0.1424, -0.8631, 
            -1.777, 0.07031, -0.7562, 
            -1.156, 0.01934, -0.4919, 
            -1.561, 0.1424, -1.561, 
            -1.368, 0.07031, -1.368, 
            -0.8899, 0.01934, -0.8899, 
            -0.8631, 0.1424, -2.029, 
            -0.7562, 0.07031, -1.777, 
            -0.4919, 0.01934, -1.156, 
        0.0, 0.1424, -2.199, 
        0.0, 0.07031, -1.927, 
        0.0, 0.01934, -1.253, 
        0.8631, 0.1424, -2.029, 
        0.7562, 0.07031, -1.777, 
        0.4919, 0.01934, -1.156, 
        1.561, 0.1424, -1.561, 
        1.368, 0.07031, -1.368, 
        0.8899, 0.01934, -0.8899, 
        2.029, 0.1424, -0.8631, 
        1.777, 0.07031, -0.7562, 
        1.156, 0.01934, -0.4919, 
            -2.4, 3.038, 0.0, 
            -3.101, 3.032, 0.0, 
            -3.619, 2.995, 0.0, 
            -3.94, 2.895, 0.0, 
            -4.05, 2.7, 0.0, 
            -2.377, 3.09, 0.2531, 
            -3.122, 3.084, 0.2531, 
            -3.669, 3.041, 0.2531, 
            -4.005, 2.926, 0.2531, 
            -4.12, 2.7, 0.2531, 
            -2.325, 3.206, 0.3375, 
            -3.168, 3.198, 0.3375, 
            -3.778, 3.143, 0.3375, 
            -4.15, 2.993, 0.3375, 
            -4.275, 2.7, 0.3375, 
            -2.273, 3.322, 0.2531, 
            -3.214, 3.313, 0.2531, 
            -3.888, 3.244, 0.2531, 
            -4.294, 3.06, 0.2531, 
            -4.43, 2.7, 0.2531, 
            -2.25, 3.375, 0.0, 
            -3.234, 3.364, 0.0, 
            -3.938, 3.291, 0.0, 
            -4.359, 3.09, 0.0, 
            -4.5, 2.7, 0.0, 
            -2.273, 3.322, -0.2531, 
            -3.214, 3.313, -0.2531, 
            -3.888, 3.244, -0.2531, 
            -4.294, 3.06, -0.2531, 
            -4.43, 2.7, -0.2531, 
            -2.325, 3.206, -0.3375, 
            -3.168, 3.198, -0.3375, 
            -3.778, 3.143, -0.3375, 
            -4.15, 2.993, -0.3375, 
            -4.275, 2.7, -0.3375, 
            -2.377, 3.09, -0.2531, 
            -3.122, 3.084, -0.2531, 
            -3.669, 3.041, -0.2531, 
            -4.005, 2.926, -0.2531, 
            -4.12, 2.7, -0.2531, 
            -3.991, 2.394, 0.0, 
            -3.806, 2.025, 0.0, 
            -3.48, 1.656, 0.0, 
            -3.0, 1.35, 0.0, 
            -4.055, 2.365, 0.2531, 
            -3.852, 1.98, 0.2531, 
            -3.496, 1.6, 0.2531, 
            -2.977, 1.28, 0.2531, 
            -4.196, 2.3, 0.3375, 
            -3.952, 1.881, 0.3375, 
            -3.531, 1.478, 0.3375, 
            -2.925, 1.125, 0.3375, 
            -4.336, 2.235, 0.2531, 
            -4.051, 1.782, 0.2531, 
            -3.566, 1.356, 0.2531, 
            -2.873, 0.9703, 0.2531, 
            -4.4, 2.205, 0.0, 
            -4.097, 1.737, 0.0, 
            -3.582, 1.3, 0.0, 
            -2.85, 0.9, 0.0, 
            -4.336, 2.235, -0.2531, 
            -4.051, 1.782, -0.2531, 
            -3.566, 1.356, -0.2531, 
            -2.873, 0.9703, -0.2531, 
            -4.196, 2.3, -0.3375, 
            -3.952, 1.881, -0.3375, 
            -3.531, 1.478, -0.3375, 
            -2.925, 1.125, -0.3375, 
            -4.055, 2.365, -0.2531, 
            -3.852, 1.98, -0.2531, 
            -3.496, 1.6, -0.2531, 
            -2.977, 1.28, -0.2531, 
        2.55, 2.137, 0.0, 
        3.27, 2.303, 0.0, 
        3.581, 2.7, 0.0, 
        3.752, 3.182, 0.0, 
        4.05, 3.6, 0.0, 
        2.55, 1.944, 0.5569, 
        3.324, 2.159, 0.5028, 
        3.652, 2.617, 0.3839, 
        3.838, 3.151, 0.265, 
        4.191, 3.6, 0.2109, 
        2.55, 1.519, 0.7425, 
        3.445, 1.844, 0.6704, 
        3.806, 2.433, 0.5119, 
        4.027, 3.085, 0.3533, 
        4.5, 3.6, 0.2813, 
        2.55, 1.093, 0.5569, 
        3.566, 1.529, 0.5028, 
        3.961, 2.249, 0.3839, 
        4.215, 3.018, 0.265, 
        4.809, 3.6, 0.2109, 
        2.55, 0.9, 0.0, 
        3.621, 1.385, 0.0, 
        4.031, 2.166, 0.0, 
        4.301, 2.988, 0.0, 
        4.95, 3.6, 0.0, 
        2.55, 1.093, -0.5569, 
        3.566, 1.529, -0.5028, 
        3.961, 2.249, -0.3839, 
        4.215, 3.018, -0.265, 
        4.809, 3.6, -0.2109, 
        2.55, 1.519, -0.7425, 
        3.445, 1.844, -0.6704, 
        3.806, 2.433, -0.5119, 
        4.027, 3.085, -0.3533, 
        4.5, 3.6, -0.2813, 
        2.55, 1.944, -0.5569, 
        3.324, 2.159, -0.5028, 
        3.652, 2.617, -0.3839, 
        3.838, 3.151, -0.265, 
        4.191, 3.6, -0.2109, 
        4.158, 3.663, 0.0, 
        4.238, 3.684, 0.0, 
        4.261, 3.663, 0.0, 
        4.2, 3.6, 0.0, 
        4.308, 3.666, 0.1978, 
        4.379, 3.689, 0.1687, 
        4.381, 3.668, 0.1397, 
        4.294, 3.6, 0.1266, 
        4.64, 3.673, 0.2637, 
        4.69, 3.7, 0.225, 
        4.645, 3.677, 0.1863, 
        4.5, 3.6, 0.1688, 
        4.971, 3.68, 0.1978, 
        5.001, 3.711, 0.1687, 
        4.909, 3.687, 0.1397, 
        4.706, 3.6, 0.1266, 
        5.122, 3.683, 0.0, 
        5.142, 3.716, 0.0, 
        5.029, 3.691, 0.0, 
        4.8, 3.6, 0.0, 
        4.971, 3.68, -0.1978, 
        5.001, 3.711, -0.1687, 
        4.909, 3.687, -0.1397, 
        4.706, 3.6, -0.1266, 
        4.64, 3.673, -0.2637, 
        4.69, 3.7, -0.225, 
        4.645, 3.677, -0.1863, 
        4.5, 3.6, -0.1688, 
        4.308, 3.666, -0.1978, 
        4.379, 3.689, -0.1687, 
        4.381, 3.668, -0.1397, 
        4.294, 3.6, -0.1266, 
        0.0, 4.725, 0.0, 
        0.5109, 4.651, 0.0, 
        0.4875, 4.472, 0.0, 
        0.2953, 4.25, 0.0, 
        0.3, 4.05, 0.0, 
        0.4715, 4.651, 0.2011, 
        0.4499, 4.472, 0.1918, 
        0.2725, 4.25, 0.1161, 
        0.2768, 4.05, 0.1178, 
        0.3632, 4.651, 0.3632, 
        0.3465, 4.472, 0.3465, 
        0.2098, 4.25, 0.2098, 
        0.213, 4.05, 0.213, 
        0.2011, 4.651, 0.4715, 
        0.1918, 4.472, 0.4499, 
        0.1161, 4.25, 0.2725, 
        0.1178, 4.05, 0.2768, 
        0.0, 4.651, 0.5109, 
        0.0, 4.472, 0.4875, 
        0.0, 4.25, 0.2953, 
        0.0, 4.05, 0.3, 
            -0.2011, 4.651, 0.4715, 
            -0.1918, 4.472, 0.4499, 
            -0.1161, 4.25, 0.2725, 
            -0.1178, 4.05, 0.2768, 
            -0.3632, 4.651, 0.3632, 
            -0.3465, 4.472, 0.3465, 
            -0.2098, 4.25, 0.2098, 
            -0.213, 4.05, 0.213, 
            -0.4715, 4.651, 0.2011, 
            -0.4499, 4.472, 0.1918, 
            -0.2725, 4.25, 0.1161, 
            -0.2768, 4.05, 0.1178, 
            -0.5109, 4.651, 0.0, 
            -0.4875, 4.472, 0.0, 
            -0.2953, 4.25, 0.0, 
            -0.3, 4.05, 0.0, 
            -0.4715, 4.651, -0.2011, 
            -0.4499, 4.472, -0.1918, 
            -0.2725, 4.25, -0.1161, 
            -0.2768, 4.05, -0.1178, 
            -0.3632, 4.651, -0.3632, 
            -0.3465, 4.472, -0.3465, 
            -0.2098, 4.25, -0.2098, 
            -0.213, 4.05, -0.213, 
            -0.2011, 4.651, -0.4715, 
            -0.1918, 4.472, -0.4499, 
            -0.1161, 4.25, -0.2725, 
            -0.1178, 4.05, -0.2768, 
        0.0, 4.651, -0.5109, 
        0.0, 4.472, -0.4875, 
        0.0, 4.25, -0.2953, 
        0.0, 4.05, -0.3, 
        0.2011, 4.651, -0.4715, 
        0.1918, 4.472, -0.4499, 
        0.1161, 4.25, -0.2725, 
        0.1178, 4.05, -0.2768, 
        0.3632, 4.651, -0.3632, 
        0.3465, 4.472, -0.3465, 
        0.2098, 4.25, -0.2098, 
        0.213, 4.05, -0.213, 
        0.4715, 4.651, -0.2011, 
        0.4499, 4.472, -0.1918, 
        0.2725, 4.25, -0.1161, 
        0.2768, 4.05, -0.1178, 
        0.6844, 3.916, 0.0, 
        1.237, 3.825, 0.0, 
        1.734, 3.734, 0.0, 
        1.95, 3.6, 0.0, 
        0.6313, 3.916, 0.2686, 
        1.142, 3.825, 0.4857, 
        1.6, 3.734, 0.6807, 
        1.799, 3.6, 0.7654, 
        0.4859, 3.916, 0.4859, 
        0.8786, 3.825, 0.8786, 
        1.231, 3.734, 1.231, 
        1.385, 3.6, 1.385, 
        0.2686, 3.916, 0.6313, 
        0.4857, 3.825, 1.142, 
        0.6807, 3.734, 1.6, 
        0.7654, 3.6, 1.799, 
        0.0, 3.916, 0.6844, 
        0.0, 3.825, 1.237, 
        0.0, 3.734, 1.734, 
        0.0, 3.6, 1.95, 
            -0.2686, 3.916, 0.6313, 
            -0.4857, 3.825, 1.142, 
            -0.6807, 3.734, 1.6, 
            -0.7654, 3.6, 1.799, 
            -0.4859, 3.916, 0.4859, 
            -0.8786, 3.825, 0.8786, 
            -1.231, 3.734, 1.231, 
            -1.385, 3.6, 1.385, 
            -0.6313, 3.916, 0.2686, 
            -1.142, 3.825, 0.4857, 
            -1.6, 3.734, 0.6807, 
            -1.799, 3.6, 0.7654, 
            -0.6844, 3.916, 0.0, 
            -1.237, 3.825, 0.0, 
            -1.734, 3.734, 0.0, 
            -1.95, 3.6, 0.0, 
            -0.6313, 3.916, -0.2686, 
            -1.142, 3.825, -0.4857, 
            -1.6, 3.734, -0.6807, 
            -1.799, 3.6, -0.7654, 
            -0.4859, 3.916, -0.4859, 
            -0.8786, 3.825, -0.8786, 
            -1.231, 3.734, -1.231, 
            -1.385, 3.6, -1.385, 
            -0.2686, 3.916, -0.6313, 
            -0.4857, 3.825, -1.142, 
            -0.6807, 3.734, -1.6, 
            -0.7654, 3.6, -1.799, 
        0.0, 3.916, -0.6844, 
        0.0, 3.825, -1.237, 
        0.0, 3.734, -1.734, 
        0.0, 3.6, -1.95, 
        0.2686, 3.916, -0.6313, 
        0.4857, 3.825, -1.142, 
        0.6807, 3.734, -1.6, 
        0.7654, 3.6, -1.799, 
        0.4859, 3.916, -0.4859, 
        0.8786, 3.825, -0.8786, 
        1.231, 3.734, -1.231, 
        1.385, 3.6, -1.385, 
        0.6313, 3.916, -0.2686, 
        1.142, 3.825, -0.4857, 
        1.6, 3.734, -0.6807, 
        1.799, 3.6, -0.7654
    ];

    var teapot_elements = [
        0, 5, 6, 
        6, 1, 0,
        1, 6, 7,
        7, 2, 1,
        2, 7, 8,
        8, 3, 2,
        3, 8, 9,
        9, 4, 3,
        5, 10, 11,
        11, 6, 5,
        6, 11, 12,
        12, 7, 6,
        7, 12, 13,
        13, 8, 7,
        8, 13, 14,
        14, 9, 8,
        10, 15, 16,
        16, 11, 10,
        11, 16, 17,
        17, 12, 11,
        12, 17, 18,
        18, 13, 12,
        13, 18, 19,
        19, 14, 13,
        15, 20, 21,
        21, 16, 15,
        16, 21, 22,
        22, 17, 16,
        17, 22, 23,
        23, 18, 17,
        18, 23, 24,
        24, 19, 18,
        20, 25, 26,
        26, 21, 20,
        21, 26, 27,
        27, 22, 21,
        22, 27, 28,
        28, 23, 22,
        23, 28, 29,
        29, 24, 23,
        25, 30, 31,
        31, 26, 25,
        26, 31, 32,
        32, 27, 26,
        27, 32, 33,
        33, 28, 27,
        28, 33, 34,
        34, 29, 28,
        30, 35, 36,
        36, 31, 30,
        31, 36, 37,
        37, 32, 31,
        32, 37, 38,
        38, 33, 32,
        33, 38, 39,
        39, 34, 33,
        35, 40, 41,
        41, 36, 35,
        36, 41, 42,
        42, 37, 36,
        37, 42, 43,
        43, 38, 37,
        38, 43, 44,
        44, 39, 38,
        40, 45, 46,
        46, 41, 40,
        41, 46, 47,
        47, 42, 41,
        42, 47, 48,
        48, 43, 42,
        43, 48, 49,
        49, 44, 43,
        45, 50, 51,
        51, 46, 45,
        46, 51, 52,
        52, 47, 46,
        47, 52, 53,
        53, 48, 47,
        48, 53, 54,
        54, 49, 48,
        50, 55, 56,
        56, 51, 50,
        51, 56, 57,
        57, 52, 51,
        52, 57, 58,
        58, 53, 52,
        53, 58, 59,
        59, 54, 53,
        55, 60, 61,
        61, 56, 55,
        56, 61, 62,
        62, 57, 56,
        57, 62, 63,
        63, 58, 57,
        58, 63, 64,
        64, 59, 58,
        60, 65, 66,
        66, 61, 60,
        61, 66, 67,
        67, 62, 61,
        62, 67, 68,
        68, 63, 62,
        63, 68, 69,
        69, 64, 63,
        65, 70, 71,
        71, 66, 65,
        66, 71, 72,
        72, 67, 66,
        67, 72, 73,
        73, 68, 67,
        68, 73, 74,
        74, 69, 68,
        70, 75, 76,
        76, 71, 70,
        71, 76, 77,
        77, 72, 71,
        72, 77, 78,
        78, 73, 72,
        73, 78, 79,
        79, 74, 73,
        75, 0, 1,
        1, 76, 75,
        76, 1, 2,
        2, 77, 76,
        77, 2, 3,
        3, 78, 77,
        78, 3, 4,
        4, 79, 78,
        4, 9, 84,
        84, 80, 4,
        80, 84, 85,
        85, 81, 80,
        81, 85, 86,
        86, 82, 81,
        82, 86, 87,
        87, 83, 82,
        9, 14, 88,
        88, 84, 9,
        84, 88, 89,
        89, 85, 84,
        85, 89, 90,
        90, 86, 85,
        86, 90, 91,
        91, 87, 86,
        14, 19, 92,
        92, 88, 14,
        88, 92, 93,
        93, 89, 88,
        89, 93, 94,
        94, 90, 89,
        90, 94, 95,
        95, 91, 90,
        19, 24, 96,
        96, 92, 19,
        92, 96, 97,
        97, 93, 92,
        93, 97, 98,
        98, 94, 93,
        94, 98, 99,
        99, 95, 94,
        24, 29, 100,
        100, 96, 24,
        96, 100, 101,
        101, 97, 96,
        97, 101, 102,
        102, 98, 97,
        98, 102, 103,
        103, 99, 98,
        29, 34, 104,
        104, 100, 29,
        100, 104, 105,
        105, 101, 100,
        101, 105, 106,
        106, 102, 101,
        102, 106, 107,
        107, 103, 102,
        34, 39, 108,
        108, 104, 34,
        104, 108, 109,
        109, 105, 104,
        105, 109, 110,
        110, 106, 105,
        106, 110, 111,
        111, 107, 106,
        39, 44, 112,
        112, 108, 39,
        108, 112, 113,
        113, 109, 108,
        109, 113, 114,
        114, 110, 109,
        110, 114, 115,
        115, 111, 110,
        44, 49, 116,
        116, 112, 44,
        112, 116, 117,
        117, 113, 112,
        113, 117, 118,
        118, 114, 113,
        114, 118, 119,
        119, 115, 114,
        49, 54, 120,
        120, 116, 49,
        116, 120, 121,
        121, 117, 116,
        117, 121, 122,
        122, 118, 117,
        118, 122, 123,
        123, 119, 118,
        54, 59, 124,
        124, 120, 54,
        120, 124, 125,
        125, 121, 120,
        121, 125, 126,
        126, 122, 121,
        122, 126, 127,
        127, 123, 122,
        59, 64, 128,
        128, 124, 59,
        124, 128, 129,
        129, 125, 124,
        125, 129, 130,
        130, 126, 125,
        126, 130, 131,
        131, 127, 126,
        64, 69, 132,
        132, 128, 64,
        128, 132, 133,
        133, 129, 128,
        129, 133, 134,
        134, 130, 129,
        130, 134, 135,
        135, 131, 130,
        69, 74, 136,
        136, 132, 69,
        132, 136, 137,
        137, 133, 132,
        133, 137, 138,
        138, 134, 133,
        134, 138, 139,
        139, 135, 134,
        74, 79, 140,
        140, 136, 74,
        136, 140, 141,
        141, 137, 136,
        137, 141, 142,
        142, 138, 137,
        138, 142, 143,
        143, 139, 138,
        79, 4, 80,
        80, 140, 79,
        140, 80, 81,
        81, 141, 140,
        141, 81, 82,
        82, 142, 141,
        142, 82, 83,
        83, 143, 142,
        83, 87, 148,
        148, 144, 83,
        144, 148, 149,
        149, 145, 144,
        145, 149, 150,
        150, 146, 145,
        146, 150, 151,
        151, 147, 146,
        87, 91, 152,
        152, 148, 87,
        148, 152, 153,
        153, 149, 148,
        149, 153, 154,
        154, 150, 149,
        150, 154, 155,
        155, 151, 150,
        91, 95, 156,
        156, 152, 91,
        152, 156, 157,
        157, 153, 152,
        153, 157, 158,
        158, 154, 153,
        154, 158, 159,
        159, 155, 154,
        95, 99, 160,
        160, 156, 95,
        156, 160, 161,
        161, 157, 156,
        157, 161, 162,
        162, 158, 157,
        158, 162, 163,
        163, 159, 158,
        99, 103, 164,
        164, 160, 99,
        160, 164, 165,
        165, 161, 160,
        161, 165, 166,
        166, 162, 161,
        162, 166, 167,
        167, 163, 162,
        103, 107, 168,
        168, 164, 103,
        164, 168, 169,
        169, 165, 164,
        165, 169, 170,
        170, 166, 165,
        166, 170, 171,
        171, 167, 166,
        107, 111, 172,
        172, 168, 107,
        168, 172, 173,
        173, 169, 168,
        169, 173, 174,
        174, 170, 169,
        170, 174, 175,
        175, 171, 170,
        111, 115, 176,
        176, 172, 111,
        172, 176, 177,
        177, 173, 172,
        173, 177, 178,
        178, 174, 173,
        174, 178, 179,
        179, 175, 174,
        115, 119, 180,
        180, 176, 115,
        176, 180, 181,
        181, 177, 176,
        177, 181, 182,
        182, 178, 177,
        178, 182, 183,
        183, 179, 178,
        119, 123, 184,
        184, 180, 119,
        180, 184, 185,
        185, 181, 180,
        181, 185, 186,
        186, 182, 181,
        182, 186, 187,
        187, 183, 182,
        123, 127, 188,
        188, 184, 123,
        184, 188, 189,
        189, 185, 184,
        185, 189, 190,
        190, 186, 185,
        186, 190, 191,
        191, 187, 186,
        127, 131, 192,
        192, 188, 127,
        188, 192, 193,
        193, 189, 188,
        189, 193, 194,
        194, 190, 189,
        190, 194, 195,
        195, 191, 190,
        131, 135, 196,
        196, 192, 131,
        192, 196, 197,
        197, 193, 192,
        193, 197, 198,
        198, 194, 193,
        194, 198, 199,
        199, 195, 194,
        135, 139, 200,
        200, 196, 135,
        196, 200, 201,
        201, 197, 196,
        197, 201, 202,
        202, 198, 197,
        198, 202, 203,
        203, 199, 198,
        139, 143, 204,
        204, 200, 139,
        200, 204, 205,
        205, 201, 200,
        201, 205, 206,
        206, 202, 201,
        202, 206, 207,
        207, 203, 202,
        143, 83, 144,
        144, 204, 143,
        204, 144, 145,
        145, 205, 204,
        205, 145, 146,
        146, 206, 205,
        206, 146, 147,
        147, 207, 206,
        147, 151, 212,
        212, 208, 147,
        208, 212, 213,
        213, 209, 208,
        209, 213, 214,
        214, 210, 209,
        210, 214, 211,
        211, 211, 210,
        151, 155, 215,
        215, 212, 151,
        212, 215, 216,
        216, 213, 212,
        213, 216, 217,
        217, 214, 213,
        214, 217, 211,
        211, 211, 214,
        155, 159, 218,
        218, 215, 155,
        215, 218, 219,
        219, 216, 215,
        216, 219, 220,
        220, 217, 216,
        217, 220, 211,
        211, 211, 217,
        159, 163, 221,
        221, 218, 159,
        218, 221, 222,
        222, 219, 218,
        219, 222, 223,
        223, 220, 219,
        220, 223, 211,
        211, 211, 220,
        163, 167, 224,
        224, 221, 163,
        221, 224, 225,
        225, 222, 221,
        222, 225, 226,
        226, 223, 222,
        223, 226, 211,
        211, 211, 223,
        167, 171, 227,
        227, 224, 167,
        224, 227, 228,
        228, 225, 224,
        225, 228, 229,
        229, 226, 225,
        226, 229, 211,
        211, 211, 226,
        171, 175, 230,
        230, 227, 171,
        227, 230, 231,
        231, 228, 227,
        228, 231, 232,
        232, 229, 228,
        229, 232, 211,
        211, 211, 229,
        175, 179, 233,
        233, 230, 175,
        230, 233, 234,
        234, 231, 230,
        231, 234, 235,
        235, 232, 231,
        232, 235, 211,
        211, 211, 232,
        179, 183, 236,
        236, 233, 179,
        233, 236, 237,
        237, 234, 233,
        234, 237, 238,
        238, 235, 234,
        235, 238, 211,
        211, 211, 235,
        183, 187, 239,
        239, 236, 183,
        236, 239, 240,
        240, 237, 236,
        237, 240, 241,
        241, 238, 237,
        238, 241, 211,
        211, 211, 238,
        187, 191, 242,
        242, 239, 187,
        239, 242, 243,
        243, 240, 239,
        240, 243, 244,
        244, 241, 240,
        241, 244, 211,
        211, 211, 241,
        191, 195, 245,
        245, 242, 191,
        242, 245, 246,
        246, 243, 242,
        243, 246, 247,
        247, 244, 243,
        244, 247, 211,
        211, 211, 244,
        195, 199, 248,
        248, 245, 195,
        245, 248, 249,
        249, 246, 245,
        246, 249, 250,
        250, 247, 246,
        247, 250, 211,
        211, 211, 247,
        199, 203, 251,
        251, 248, 199,
        248, 251, 252,
        252, 249, 248,
        249, 252, 253,
        253, 250, 249,
        250, 253, 211,
        211, 211, 250,
        203, 207, 254,
        254, 251, 203,
        251, 254, 255,
        255, 252, 251,
        252, 255, 256,
        256, 253, 252,
        253, 256, 211,
        211, 211, 253,
        207, 147, 208,
        208, 254, 207,
        254, 208, 209,
        209, 255, 254,
        255, 209, 210,
        210, 256, 255,
        256, 210, 211,
        211, 211, 256,
        257, 262, 263,
        263, 258, 257,
        258, 263, 264,
        264, 259, 258,
        259, 264, 265,
        265, 260, 259,
        260, 265, 266,
        266, 261, 260,
        262, 267, 268,
        268, 263, 262,
        263, 268, 269,
        269, 264, 263,
        264, 269, 270,
        270, 265, 264,
        265, 270, 271,
        271, 266, 265,
        267, 272, 273,
        273, 268, 267,
        268, 273, 274,
        274, 269, 268,
        269, 274, 275,
        275, 270, 269,
        270, 275, 276,
        276, 271, 270,
        272, 277, 278,
        278, 273, 272,
        273, 278, 279,
        279, 274, 273,
        274, 279, 280,
        280, 275, 274,
        275, 280, 281,
        281, 276, 275,
        277, 282, 283,
        283, 278, 277,
        278, 283, 284,
        284, 279, 278,
        279, 284, 285,
        285, 280, 279,
        280, 285, 286,
        286, 281, 280,
        282, 287, 288,
        288, 283, 282,
        283, 288, 289,
        289, 284, 283,
        284, 289, 290,
        290, 285, 284,
        285, 290, 291,
        291, 286, 285,
        287, 292, 293,
        293, 288, 287,
        288, 293, 294,
        294, 289, 288,
        289, 294, 295,
        295, 290, 289,
        290, 295, 296,
        296, 291, 290,
        292, 257, 258,
        258, 293, 292,
        293, 258, 259,
        259, 294, 293,
        294, 259, 260,
        260, 295, 294,
        295, 260, 261,
        261, 296, 295,
        261, 266, 301,
        301, 297, 261,
        297, 301, 302,
        302, 298, 297,
        298, 302, 303,
        303, 299, 298,
        299, 303, 304,
        304, 300, 299,
        266, 271, 305,
        305, 301, 266,
        301, 305, 306,
        306, 302, 301,
        302, 306, 307,
        307, 303, 302,
        303, 307, 308,
        308, 304, 303,
        271, 276, 309,
        309, 305, 271,
        305, 309, 310,
        310, 306, 305,
        306, 310, 311,
        311, 307, 306,
        307, 311, 312,
        312, 308, 307,
        276, 281, 313,
        313, 309, 276,
        309, 313, 314,
        314, 310, 309,
        310, 314, 315,
        315, 311, 310,
        311, 315, 316,
        316, 312, 311,
        281, 286, 317,
        317, 313, 281,
        313, 317, 318,
        318, 314, 313,
        314, 318, 319,
        319, 315, 314,
        315, 319, 320,
        320, 316, 315,
        286, 291, 321,
        321, 317, 286,
        317, 321, 322,
        322, 318, 317,
        318, 322, 323,
        323, 319, 318,
        319, 323, 324,
        324, 320, 319,
        291, 296, 325,
        325, 321, 291,
        321, 325, 326,
        326, 322, 321,
        322, 326, 327,
        327, 323, 322,
        323, 327, 328,
        328, 324, 323,
        296, 261, 297,
        297, 325, 296,
        325, 297, 298,
        298, 326, 325,
        326, 298, 299,
        299, 327, 326,
        327, 299, 300,
        300, 328, 327,
        329, 334, 335,
        335, 330, 329,
        330, 335, 336,
        336, 331, 330,
        331, 336, 337,
        337, 332, 331,
        332, 337, 338,
        338, 333, 332,
        334, 339, 340,
        340, 335, 334,
        335, 340, 341,
        341, 336, 335,
        336, 341, 342,
        342, 337, 336,
        337, 342, 343,
        343, 338, 337,
        339, 344, 345,
        345, 340, 339,
        340, 345, 346,
        346, 341, 340,
        341, 346, 347,
        347, 342, 341,
        342, 347, 348,
        348, 343, 342,
        344, 349, 350,
        350, 345, 344,
        345, 350, 351,
        351, 346, 345,
        346, 351, 352,
        352, 347, 346,
        347, 352, 353,
        353, 348, 347,
        349, 354, 355,
        355, 350, 349,
        350, 355, 356,
        356, 351, 350,
        351, 356, 357,
        357, 352, 351,
        352, 357, 358,
        358, 353, 352,
        354, 359, 360,
        360, 355, 354,
        355, 360, 361,
        361, 356, 355,
        356, 361, 362,
        362, 357, 356,
        357, 362, 363,
        363, 358, 357,
        359, 364, 365,
        365, 360, 359,
        360, 365, 366,
        366, 361, 360,
        361, 366, 367,
        367, 362, 361,
        362, 367, 368,
        368, 363, 362,
        364, 329, 330,
        330, 365, 364,
        365, 330, 331,
        331, 366, 365,
        366, 331, 332,
        332, 367, 366,
        367, 332, 333,
        333, 368, 367,
        333, 338, 373,
        373, 369, 333,
        369, 373, 374,
        374, 370, 369,
        370, 374, 375,
        375, 371, 370,
        371, 375, 376,
        376, 372, 371,
        338, 343, 377,
        377, 373, 338,
        373, 377, 378,
        378, 374, 373,
        374, 378, 379,
        379, 375, 374,
        375, 379, 380,
        380, 376, 375,
        343, 348, 381,
        381, 377, 343,
        377, 381, 382,
        382, 378, 377,
        378, 382, 383,
        383, 379, 378,
        379, 383, 384,
        384, 380, 379,
        348, 353, 385,
        385, 381, 348,
        381, 385, 386,
        386, 382, 381,
        382, 386, 387,
        387, 383, 382,
        383, 387, 388,
        388, 384, 383,
        353, 358, 389,
        389, 385, 353,
        385, 389, 390,
        390, 386, 385,
        386, 390, 391,
        391, 387, 386,
        387, 391, 392,
        392, 388, 387,
        358, 363, 393,
        393, 389, 358,
        389, 393, 394,
        394, 390, 389,
        390, 394, 395,
        395, 391, 390,
        391, 395, 396,
        396, 392, 391,
        363, 368, 397,
        397, 393, 363,
        393, 397, 398,
        398, 394, 393,
        394, 398, 399,
        399, 395, 394,
        395, 399, 400,
        400, 396, 395,
        368, 333, 369,
        369, 397, 368,
        397, 369, 370,
        370, 398, 397,
        398, 370, 371,
        371, 399, 398,
        399, 371, 372,
        372, 400, 399,
        401, 401, 406,
        406, 402, 401,
        402, 406, 407,
        407, 403, 402,
        403, 407, 408,
        408, 404, 403,
        404, 408, 409,
        409, 405, 404,
        401, 401, 410,
        410, 406, 401,
        406, 410, 411,
        411, 407, 406,
        407, 411, 412,
        412, 408, 407,
        408, 412, 413,
        413, 409, 408,
        401, 401, 414,
        414, 410, 401,
        410, 414, 415,
        415, 411, 410,
        411, 415, 416,
        416, 412, 411,
        412, 416, 417,
        417, 413, 412,
        401, 401, 418,
        418, 414, 401,
        414, 418, 419,
        419, 415, 414,
        415, 419, 420,
        420, 416, 415,
        416, 420, 421,
        421, 417, 416,
        401, 401, 422,
        422, 418, 401,
        418, 422, 423,
        423, 419, 418,
        419, 423, 424,
        424, 420, 419,
        420, 424, 425,
        425, 421, 420,
        401, 401, 426,
        426, 422, 401,
        422, 426, 427,
        427, 423, 422,
        423, 427, 428,
        428, 424, 423,
        424, 428, 429,
        429, 425, 424,
        401, 401, 430,
        430, 426, 401,
        426, 430, 431,
        431, 427, 426,
        427, 431, 432,
        432, 428, 427,
        428, 432, 433,
        433, 429, 428,
        401, 401, 434,
        434, 430, 401,
        430, 434, 435,
        435, 431, 430,
        431, 435, 436,
        436, 432, 431,
        432, 436, 437,
        437, 433, 432,
        401, 401, 438,
        438, 434, 401,
        434, 438, 439,
        439, 435, 434,
        435, 439, 440,
        440, 436, 435,
        436, 440, 441,
        441, 437, 436,
        401, 401, 442,
        442, 438, 401,
        438, 442, 443,
        443, 439, 438,
        439, 443, 444,
        444, 440, 439,
        440, 444, 445,
        445, 441, 440,
        401, 401, 446,
        446, 442, 401,
        442, 446, 447,
        447, 443, 442,
        443, 447, 448,
        448, 444, 443,
        444, 448, 449,
        449, 445, 444,
        401, 401, 450,
        450, 446, 401,
        446, 450, 451,
        451, 447, 446,
        447, 451, 452,
        452, 448, 447,
        448, 452, 453,
        453, 449, 448,
        401, 401, 454,
        454, 450, 401,
        450, 454, 455,
        455, 451, 450,
        451, 455, 456,
        456, 452, 451,
        452, 456, 457,
        457, 453, 452,
        401, 401, 458,
        458, 454, 401,
        454, 458, 459,
        459, 455, 454,
        455, 459, 460,
        460, 456, 455,
        456, 460, 461,
        461, 457, 456,
        401, 401, 462,
        462, 458, 401,
        458, 462, 463,
        463, 459, 458,
        459, 463, 464,
        464, 460, 459,
        460, 464, 465,
        465, 461, 460,
        401, 401, 402,
        402, 462, 401,
        462, 402, 403,
        403, 463, 462,
        463, 403, 404,
        404, 464, 463,
        464, 404, 405,
        405, 465, 464,
        405, 409, 470,
        470, 466, 405,
        466, 470, 471,
        471, 467, 466,
        467, 471, 472,
        472, 468, 467,
        468, 472, 473,
        473, 469, 468,
        409, 413, 474,
        474, 470, 409,
        470, 474, 475,
        475, 471, 470,
        471, 475, 476,
        476, 472, 471,
        472, 476, 477,
        477, 473, 472,
        413, 417, 478,
        478, 474, 413,
        474, 478, 479,
        479, 475, 474,
        475, 479, 480,
        480, 476, 475,
        476, 480, 481,
        481, 477, 476,
        417, 421, 482,
        482, 478, 417,
        478, 482, 483,
        483, 479, 478,
        479, 483, 484,
        484, 480, 479,
        480, 484, 485,
        485, 481, 480,
        421, 425, 486,
        486, 482, 421,
        482, 486, 487,
        487, 483, 482,
        483, 487, 488,
        488, 484, 483,
        484, 488, 489,
        489, 485, 484,
        425, 429, 490,
        490, 486, 425,
        486, 490, 491,
        491, 487, 486,
        487, 491, 492,
        492, 488, 487,
        488, 492, 493,
        493, 489, 488,
        429, 433, 494,
        494, 490, 429,
        490, 494, 495,
        495, 491, 490,
        491, 495, 496,
        496, 492, 491,
        492, 496, 497,
        497, 493, 492,
        433, 437, 498,
        498, 494, 433,
        494, 498, 499,
        499, 495, 494,
        495, 499, 500,
        500, 496, 495,
        496, 500, 501,
        501, 497, 496,
        437, 441, 502,
        502, 498, 437,
        498, 502, 503,
        503, 499, 498,
        499, 503, 504,
        504, 500, 499,
        500, 504, 505,
        505, 501, 500,
        441, 445, 506,
        506, 502, 441,
        502, 506, 507,
        507, 503, 502,
        503, 507, 508,
        508, 504, 503,
        504, 508, 509,
        509, 505, 504,
        445, 449, 510,
        510, 506, 445,
        506, 510, 511,
        511, 507, 506,
        507, 511, 512,
        512, 508, 507,
        508, 512, 513,
        513, 509, 508,
        449, 453, 514,
        514, 510, 449,
        510, 514, 515,
        515, 511, 510,
        511, 515, 516,
        516, 512, 511,
        512, 516, 517,
        517, 513, 512,
        453, 457, 518,
        518, 514, 453,
        514, 518, 519,
        519, 515, 514,
        515, 519, 520,
        520, 516, 515,
        516, 520, 521,
        521, 517, 516,
        457, 461, 522,
        522, 518, 457,
        518, 522, 523,
        523, 519, 518,
        519, 523, 524,
        524, 520, 519,
        520, 524, 525,
        525, 521, 520,
        461, 465, 526,
        526, 522, 461,
        522, 526, 527,
        527, 523, 522,
        523, 527, 528,
        528, 524, 523,
        524, 528, 529,
        529, 525, 524,
        465, 405, 466,
        466, 526, 465,
        526, 466, 467,
        467, 527, 526,
        527, 467, 468,
        468, 528, 527,
        528, 468, 469,
        469, 529, 528
    ];
    
    var elements = teapot_elements;
    var coords = teapot_coords;

    var mesh = Lux.Mesh.indexed(coords, elements);
    mesh.make_normals();
    return mesh.model;
};
Lux.Mesh = {};
Lux.Mesh.indexed = function(vertices, elements)
{
    vertices = vertices.slice();
    elements = elements.slice();
    
    var model = Lux.model({
        type: "triangles",
        elements: elements,
        vertex: [vertices, 3]
    });

    var normals;

    function create_normals() {
        var normal = new Float32Array(vertices.length);
        var areas = new Float32Array(vertices.length / 3);

        for (var i=0; i<elements.length; i+=3) {
            var i1 = elements[i], i2 = elements[i+1], i3 = elements[i+2];
            var v1 = vec3.copy(vertices.slice(3 * i1, 3 * i1 + 3));
            var v2 = vec3.copy(vertices.slice(3 * i2, 3 * i2 + 3));
            var v3 = vec3.copy(vertices.slice(3 * i3, 3 * i3 + 3));
            var cp = vec3.cross(vec3.minus(v2, v1), vec3.minus(v3, v1));
            var area2 = vec3.length(cp);
            areas[i1] += area2;
            areas[i2] += area2;
            areas[i3] += area2;
            
            normal[3*i1]   += cp[0];
            normal[3*i1+1] += cp[1];
            normal[3*i1+2] += cp[2];
            normal[3*i2]   += cp[0];
            normal[3*i3+1] += cp[1];
            normal[3*i1+2] += cp[2];
            normal[3*i1]   += cp[0];
            normal[3*i2+1] += cp[1];
            normal[3*i3+2] += cp[2];
        }

        for (i=0; i<areas.length; ++i) {
            normal[3*i] /= areas[i];
            normal[3*i+1] /= areas[i];
            normal[3*i+2] /= areas[i];
        }
        return normal;
    }

    return {
        model: model,
        make_normals: function() {
            if (!normals) {
                normals = create_normals();
                this.model.add("normal", [normals, 3]);
            }
            return normals;
        }
    };
};
/*
 * An actor must conform to the following interface:

 * - actors respond to a "dress" method. This method takes as a
 * parameter an object conforming to the scene interface and returns
 * an object conforming to the batch interface.

 * - actors respond to an "on" method. This method takes as a
 * parameter a string and an object. The string is the name of the
 * canvas event that was triggered, and the object is the
 * corresponding event. The method should return false if the event
 * handling chain is to be terminated. If true, the event handling
 * loop will keep traversing the scene graph and calling event
 * handlers.

 */

Lux.actor = function(opts)
{
    opts = _.defaults(opts, {
        on: function() { return true; },
        bake: Lux.bake
    });
    var appearance = opts.appearance;
    var model = opts.model;
    var on = opts.on;
    var bake = opts.bake;
    var batch;
    return {
        dress: function(scene) {
            var xform = scene.get_transform();
            var this_appearance = xform(appearance);
            return bake(model, this_appearance);
        },
        on: function(event_name, event) {
            return opts.on(event_name, event);
        }
    };
};

Lux.actor_list = function(actors_list)
{
    return {
        dress: function(scene) {
            var batch_list = _.map(actors_list, function(actor) {
                return actor.dress(scene);
            });
            return {
                draw: function() {
                    _.each(batch_list, function(batch) {
                        return batch.draw();
                    });
                }
            };
        },
        on: function(event_name, event) {
            for (var i=0; i<actors_list.length; ++i) {
                if (!actors_list[i].on(event_name, event))
                    return false;
            }
            return true;
        }
    };
};

Lux.actor_many = function(opts)
{
    opts = _.defaults(opts, {
        on: function() { return true; }
    });
    var appearance_function = opts.appearance_function;
    var model_list = opts.model_list;
    var on = opts.on;
    var model_callback = opts.model_callback;
    var scratch_model = _.clone(model_list[0]);
    var scratch_actor = Lux.actor({
        model: scratch_model,
        appearance: appearance_function(scratch_model)
    });
    var batch;

    return {
        dress: function(scene) {
            batch = scratch_actor.dress(scene);
            return model_callback ? {
                draw: function() {
                    _.each(model_list, function(model, i) {
                        _.each(scratch_model.attributes, function(v, k) {
                            v.set(model[k].get());
                        });
                        scratch_model.elements.set(model.elements.array);
                        model_callback(model, i);
                        batch.draw();
                    });
                }
            } : {
                draw: function() {
                    _.each(model_list, function(model, i) {
                        _.each(scratch_model.attributes, function(v, k) {
                            v.set(model[k].get());
                        });
                        scratch_model.elements.set(model.elements.array);
                        // model_callback(model, i); -- only difference to above
                        batch.draw();
                    });
                }
            };
        },
        on: function(event_name, event) {
            return opts.on(event_name, event);
        }
    };
};
/*
 * Scenes conform to the actor interface. Scenes can then
   contain other scenes, and have hierarchical structure. Currently,
   "sub-scenes" cannot have more than one parent. (If you're thinking
   about scene graphs and sharing, this means that, to you, Lux scenes
   are actually "scene trees".)

 */
Lux.scene = function(opts)
{
    opts = _.defaults(opts || {}, {
        context: Lux._globals.ctx,
        transform: function(i) { return i; },
        pre_draw: function() {},
        post_draw: function() {}
    });
    var ctx = opts.context;
    var transform = opts.transform;

    var dirty = false;
    var pre_display_list = [];
    var post_display_list = [];
    function draw_it() {
        Lux.set_context(ctx);
        var pre = pre_display_list;
        pre_display_list = [];
        var post = post_display_list;
        post_display_list = [];
        for (var i=0; i<pre.length; ++i)
            pre[i]();
        scene.draw();
        dirty = false;
        for (i=0; i<post.length; ++i)
            post[i]();
    }

    var batch_list = [];
    var actor_list = [];
    var parent_scene = undefined;
    var scene = {
        context: ctx,
        get_transform: function() { return transform; },

        add: function(actor) {
            actor_list.push(actor);
            var result = actor.dress(this);
            batch_list.push(result);
            this.invalidate(undefined, undefined, ctx);
            return result;
        }, 

        remove: function(actor) {
            var i = actor_list.indexOf(actor);
            if (i === -1)
                throw new Error("actor not found in scene");
            actor_list.splice(i, 1);
            batch_list.splice(i, 1);
            this.invalidate(undefined, undefined, ctx);
        },

        //////////////////////////////////////////////////////////////////////
        /*
         * animate starts a continuous stream of animation
         * refresh triggers. It returns an object with a single field
         * "stop", which is a function that when called will stop the
         * refresh triggers.
         */

        animate: function(tick_function) {
            if (parent_scene)
                return parent_scene.animate(tick_function);
            if (_.isUndefined(tick_function)) {
                tick_function = _.identity;
            }
            var done = false;
            var that = this;
            function f() {
                that.invalidate(
                    function() {
                        tick_function();
                    }, function() { 
                        if (!done) f();
                    }, ctx);
            };
            f();
            return {
                stop: function() {
                    done = true;
                }
            };
        },

        /*
         * scene.invalidate triggers a scene redraw using
         * requestAnimationFrame.  It takes two callbacks to be called respectively
         * before the scene is drawn and after. 
         * 
         * The function allows many different callbacks to be
         * invoked by a single requestAnimationFrame handler. This guarantees that
         * every callback passed to scene.invalidate during the rendering
         * of a single frame will be called before the invocation of the next scene 
         * redraw.
         * 
         * If every call to invalidate issues a new requestAnimationFrame, the following situation might happen:
         * 
         * - during scene.render:
         * 
         *    - object 1 calls scene.invalidate(f1, f2) (requestAnimationFrame #1)
         * 
         *    - object 2 calls scene.invalidate(f3, f4) (requestAnimationFrame #2)
         * 
         *    - scene.render ends
         * 
         * - requestAnimationFrame #1 is triggered:
         * 
         *    - f1 is called
         * 
         *    - scene.render is called
         * 
         *    ...
         * 
         * So scene.render is being called again before f3 has a chance to run.
         * 
         */
        invalidate: function(pre_display, post_display) {
            if (parent_scene) {
                parent_scene.invalidate(pre_display, post_display);
                return;
            }
            if (!dirty) {
                dirty = true;
                window.requestAnimationFrame(function() { return draw_it(); });
            }
            if (pre_display) {
                pre_display_list.push(pre_display);
            }
            if (post_display) {
                post_display_list.push(post_display);
            }
        },


        //////////////////////////////////////////////////////////////////////
        // actor interface

        on: function(event_name, event) {
            for (var i=0; i<actor_list.length; ++i) {
                if (!actor_list[i].on(event_name, event))
                    return false;
            }
            return true;
        },

        dress: function(scene) {
            parent_scene = scene;
            var that = this;
            // reset transform, then re-add things to batch list.
            transform = function(appearance) {
                appearance = opts.transform(appearance);
                appearance = parent_scene.get_transform()(appearance);
                return appearance;
            };
            transform.inverse = function(appearance) {
                appearance = parent_scene.get_transform().inverse(appearance);
                appearance = opts.transform.inverse(appearance);
                return appearance;
            };
            // FIXME ideally we'd have a well-defined cleanup of batches; I
            // think the current implementation below might leak.
            batch_list = _.map(actor_list, function(actor) {
                return actor.dress(that);                
            });
            return this;
        },

        //////////////////////////////////////////////////////////////////////
        // batch interface

        draw: function() {
            opts.pre_draw();
            for (var i=0; i<batch_list.length; ++i) {
                batch_list[i].draw();
            }
            opts.post_draw();
        }

    };
    return scene;
};

Lux.default_scene = function(opts)
{
    opts = _.clone(opts);
    opts.transform = function(appearance) {
        appearance = _.clone(appearance);
        if (!_.isUndefined(appearance.screen_position))
            appearance.position = appearance.screen_position;
        // return Shade.canonicalize_program_object(appearance);
        return appearance;
    };
    opts.transform.inverse = function(i) { return i; };
    var scene = Lux.scene(opts);
    var ctx = scene.context;

    var clearColor, clearDepth;

    if (Lux.is_shade_expression(opts.clearColor)) {
        if (!opts.clearColor.is_constant())
            throw new Error("clearColor must be constant expression");
        if (!opts.clearColor.type.equals(Shade.Types.vec4))
            throw new Error("clearColor must be vec4");
        clearColor = _.toArray(opts.clearColor.constant_value());
    } else
        clearColor = opts.clearColor;

    if (Lux.is_shade_expression(opts.clearDepth)) {
        if (!opts.clearDepth.is_constant())
            throw new Error("clearDepth must be constant expression");
        if (!opts.clearDepth.type.equals(Shade.Types.float_t))
            throw new Error("clearDepth must be float");
        clearDepth = opts.clearDepth.constant_value();
    } else
        clearDepth = opts.clearDepth;

    // FIXME this is kind of ugly, but would otherwise requiring changing the picker infrastructure
    // quite a bit. Since the picker infrastructure should be overhauled anyway,
    // we stick with this hack until we fix everything.
    function clear() {
        switch (ctx._lux_globals.batch_render_mode) {
        case 1:
        case 2:
            ctx.clearDepth(clearDepth);
            ctx.clearColor(0,0,0,0);
            break;
        case 0:
            ctx.clearDepth(clearDepth);
            ctx.clearColor.apply(ctx, clearColor);
            break;
        default:
            throw new Error("Unknown batch rendering mode");
        }
        ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
    }
    scene.add({
        dress: function(scene) { return { draw: clear }; },
        on: function() { return true; }
    });
    return scene;
};
Lux.Scene = {};
Lux.Scene.add = function(obj, ctx)
{
    if (_.isUndefined(ctx)) {
        ctx = Lux._globals.ctx;
    }
    var scene = ctx._lux_globals.scene;

    return scene.add(obj);
};
Lux.Scene.remove = function(obj, ctx)
{
    if (_.isUndefined(ctx)) {
        ctx = Lux._globals.ctx;
    }
    var scene = ctx._lux_globals.scene;
    scene.remove(obj);
};
Lux.Scene.render = function()
{
    var scene = Lux._globals.ctx._lux_globals.scene;
    for (var i=0; i<scene.length; ++i) {
        scene[i].draw();
    }
};
Lux.Scene.animate = function(tick_function, ctx)
{
    if (_.isUndefined(ctx)) {
        ctx = Lux._globals.ctx;
    }
    var scene = ctx._lux_globals.scene;

    return scene.animate(tick_function);
};
Lux.Scene.on = function(ename, event, ctx) 
{
    if (_.isUndefined(ctx)) {
        ctx = Lux._globals.ctx;
    }
    var scene = ctx._lux_globals.scene;

    return scene.on(ename, event);
};
Lux.Scene.invalidate = function(pre_display, post_display, ctx)
{
    if (_.isUndefined(ctx)) {
        ctx = Lux._globals.ctx;
    }
    var scene = ctx._lux_globals.scene;

    return scene.invalidate(pre_display, post_display);
};
Lux.Scene.Transform = {};
Lux.Scene.Transform.Geo = {};

(function() {

var two_d_position_xform = function(xform, inverse_xform) {
    function make_it(xf) {
        return function(appearance) {
            if (_.isUndefined(appearance.position))
                return appearance;
            appearance = _.clone(appearance);
            var pos = appearance.position;
            var out = xf(appearance.position.x(), appearance.position.y());
            if (pos.type.equals(Shade.Types.vec2))
                appearance.position = out;
            else if (pos.type.equals(Shade.Types.vec3))
                appearance.position = Shade.vec(out, pos.at(2));
            else if (pos.type.equals(Shade.Types.vec4))
                appearance.position = Shade.vec(out, pos.swizzle("zw"));
            return appearance;
        };
    };
    return function(opts) {
        opts = _.clone(opts || {});
        opts.transform = make_it(xform);
        if (!_.isUndefined(inverse_xform)) {
            opts.transform.inverse = make_it(inverse_xform);
            opts.transform.inverse.inverse = opts.transform;
        }
        return Lux.scene(opts);
    };
};
Lux.Scene.Transform.Geo.latlong_to_hammer = function(opts) {
    opts = _.clone(opts || {});
    opts.transform = function(appearance) {
        if (_.isUndefined(appearance.position))
            return appearance;
        appearance = _.clone(appearance);
        var pos = appearance.position;
        var out = Shade.Scale.Geo.latlong_to_hammer(appearance.position.x(), appearance.position.y(), opts.B);
        if (pos.type.equals(Shade.Types.vec2))
            appearance.position = out;
        else if (pos.type.equals(Shade.Types.vec3))
            appearance.position = Shade.vec(out, pos.at(2));
        else if (pos.type.equals(Shade.Types.vec4))
            appearance.position = Shade.vec(out, pos.swizzle("zw"));
        return appearance;
    };
    return Lux.scene(opts);
};
Lux.Scene.Transform.Geo.latlong_to_mercator = 
    two_d_position_xform(Shade.Scale.Geo.latlong_to_mercator,
                         Shade.Scale.Geo.mercator_to_latlong);
Lux.Scene.Transform.Geo.latlong_to_spherical = function(opts) {
    opts = _.clone(opts || {});
    opts.transform = function(appearance) {
        if (_.isUndefined(appearance.position))
            return appearance;
        appearance = _.clone(appearance);
        var pos = appearance.position;
        var lat = appearance.position.x();
        var lon = appearance.position.y();
        var out = Shade.Scale.Geo.latlong_to_spherical(lat, lon);
        if (pos.type.equals(Shade.Types.vec3))
            appearance.position = out;
        else if (pos.type.equals(Shade.Types.vec4))
            appearance.position = Shade.vec(out, pos.w());
        return appearance;
    };
    return Lux.scene(opts);
};
Lux.Scene.Transform.Geo.mercator_to_latlong = 
    two_d_position_xform(Shade.Scale.Geo.mercator_to_latlong,
                         Shade.Scale.Geo.latlong_to_mercator);
})();
Lux.Scene.Transform.Camera = {};
Lux.Scene.Transform.Camera.perspective = function(opts)
{
    opts = _.clone(opts || {});
    var camera = Shade.Camera.perspective(opts);
    opts.transform = function(appearance) {
        if (_.isUndefined(appearance.position))
            return appearance;
        appearance = _.clone(appearance);
        appearance.position = camera(appearance.position);
        return appearance;
    };
    var scene = Lux.scene(opts);
    scene.camera = camera;
    return scene;
};
    if (typeof define === "function" && define.amd) {
        // Because we're loading lux.js from outside a require, we need to force
	// a named module definition
	// (we're using rcloud's install module thing which does an explicit eval)
        define("lux", Lux);
    } else if (typeof module === "object" && module.exports) {
        module.exports = Lux;
    } else {
        this.Lux = Lux;
        this.Shade = Shade;
        this.vec = vec;
        this.vec2 = vec2;
        this.vec3 = vec3;
        this.vec4 = vec4;
        this.mat = mat;
        this.mat2 = mat2;
        this.mat3 = mat3;
        this.mat4 = mat4;
    }
}).apply(this);
