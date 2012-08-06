/*
 * Facet: An EDSL for WebGL graphics
 * By Carlos Scheidegger, cscheid@research.att.com
 * 
 * Copyright (c) 2011, 2012 AT&T Intellectual Property
 * 
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors: See github logs.
 *
 */

// Facet depends on the following software libraries:

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
/*

  Facet is a library for making WebGL marginally
  less painful to program, featuring things like nicer support for
  fragment and vertex programs, webgl buffers, textures, etc.

 */

Facet = {};
// yucky globals used throughout Facet. I guess this means I lost.
//
////////////////////////////////////////////////////////////////////////////////

Facet._globals = {
    // stores the active webgl context
    ctx: undefined

    // In addition, Facet stores per-context globals inside the
    // WebGL context variable itself, on the field _facet_globals.
};
// Underscore.js 1.1.7
// (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the MIT license.
// Portions of Underscore are inspired or borrowed from Prototype,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore
(function(){var p=this,C=p._,m={},i=Array.prototype,n=Object.prototype,f=i.slice,D=i.unshift,E=n.toString,l=n.hasOwnProperty,s=i.forEach,t=i.map,u=i.reduce,v=i.reduceRight,w=i.filter,x=i.every,y=i.some,o=i.indexOf,z=i.lastIndexOf;n=Array.isArray;var F=Object.keys,q=Function.prototype.bind,b=function(a){return new j(a)};typeof module!=="undefined"&&module.exports?(module.exports=b,b._=b):p._=b;b.VERSION="1.1.7";var h=b.each=b.forEach=function(a,c,b){if(a!=null)if(s&&a.forEach===s)a.forEach(c,b);else if(a.length===
+a.length)for(var e=0,k=a.length;e<k;e++){if(e in a&&c.call(b,a[e],e,a)===m)break}else for(e in a)if(l.call(a,e)&&c.call(b,a[e],e,a)===m)break};b.map=function(a,c,b){var e=[];if(a==null)return e;if(t&&a.map===t)return a.map(c,b);h(a,function(a,g,G){e[e.length]=c.call(b,a,g,G)});return e};b.reduce=b.foldl=b.inject=function(a,c,d,e){var k=d!==void 0;a==null&&(a=[]);if(u&&a.reduce===u)return e&&(c=b.bind(c,e)),k?a.reduce(c,d):a.reduce(c);h(a,function(a,b,f){k?d=c.call(e,d,a,b,f):(d=a,k=!0)});if(!k)throw new TypeError("Reduce of empty array with no initial value");
return d};b.reduceRight=b.foldr=function(a,c,d,e){a==null&&(a=[]);if(v&&a.reduceRight===v)return e&&(c=b.bind(c,e)),d!==void 0?a.reduceRight(c,d):a.reduceRight(c);a=(b.isArray(a)?a.slice():b.toArray(a)).reverse();return b.reduce(a,c,d,e)};b.find=b.detect=function(a,c,b){var e;A(a,function(a,g,f){if(c.call(b,a,g,f))return e=a,!0});return e};b.filter=b.select=function(a,c,b){var e=[];if(a==null)return e;if(w&&a.filter===w)return a.filter(c,b);h(a,function(a,g,f){c.call(b,a,g,f)&&(e[e.length]=a)});return e};
b.reject=function(a,c,b){var e=[];if(a==null)return e;h(a,function(a,g,f){c.call(b,a,g,f)||(e[e.length]=a)});return e};b.every=b.all=function(a,c,b){var e=!0;if(a==null)return e;if(x&&a.every===x)return a.every(c,b);h(a,function(a,g,f){if(!(e=e&&c.call(b,a,g,f)))return m});return e};var A=b.some=b.any=function(a,c,d){c=c||b.identity;var e=!1;if(a==null)return e;if(y&&a.some===y)return a.some(c,d);h(a,function(a,b,f){if(e|=c.call(d,a,b,f))return m});return!!e};b.include=b.contains=function(a,c){var b=
!1;if(a==null)return b;if(o&&a.indexOf===o)return a.indexOf(c)!=-1;A(a,function(a){if(b=a===c)return!0});return b};b.invoke=function(a,c){var d=f.call(arguments,2);return b.map(a,function(a){return(c.call?c||a:a[c]).apply(a,d)})};b.pluck=function(a,c){return b.map(a,function(a){return a[c]})};b.max=function(a,c,d){if(!c&&b.isArray(a))return Math.max.apply(Math,a);var e={computed:-Infinity};h(a,function(a,b,f){b=c?c.call(d,a,b,f):a;b>=e.computed&&(e={value:a,computed:b})});return e.value};b.min=function(a,
c,d){if(!c&&b.isArray(a))return Math.min.apply(Math,a);var e={computed:Infinity};h(a,function(a,b,f){b=c?c.call(d,a,b,f):a;b<e.computed&&(e={value:a,computed:b})});return e.value};b.sortBy=function(a,c,d){return b.pluck(b.map(a,function(a,b,f){return{value:a,criteria:c.call(d,a,b,f)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;return c<d?-1:c>d?1:0}),"value")};b.groupBy=function(a,b){var d={};h(a,function(a,f){var g=b(a,f);(d[g]||(d[g]=[])).push(a)});return d};b.sortedIndex=function(a,c,d){d||
(d=b.identity);for(var e=0,f=a.length;e<f;){var g=e+f>>1;d(a[g])<d(c)?e=g+1:f=g}return e};b.toArray=function(a){if(!a)return[];if(a.toArray)return a.toArray();if(b.isArray(a))return f.call(a);if(b.isArguments(a))return f.call(a);return b.values(a)};b.size=function(a){return b.toArray(a).length};b.first=b.head=function(a,b,d){return b!=null&&!d?f.call(a,0,b):a[0]};b.rest=b.tail=function(a,b,d){return f.call(a,b==null||d?1:b)};b.last=function(a){return a[a.length-1]};b.compact=function(a){return b.filter(a,
function(a){return!!a})};b.flatten=function(a){return b.reduce(a,function(a,d){if(b.isArray(d))return a.concat(b.flatten(d));a[a.length]=d;return a},[])};b.without=function(a){return b.difference(a,f.call(arguments,1))};b.uniq=b.unique=function(a,c){return b.reduce(a,function(a,e,f){if(0==f||(c===!0?b.last(a)!=e:!b.include(a,e)))a[a.length]=e;return a},[])};b.union=function(){return b.uniq(b.flatten(arguments))};b.intersection=b.intersect=function(a){var c=f.call(arguments,1);return b.filter(b.uniq(a),
function(a){return b.every(c,function(c){return b.indexOf(c,a)>=0})})};b.difference=function(a,c){return b.filter(a,function(a){return!b.include(c,a)})};b.zip=function(){for(var a=f.call(arguments),c=b.max(b.pluck(a,"length")),d=Array(c),e=0;e<c;e++)d[e]=b.pluck(a,""+e);return d};b.indexOf=function(a,c,d){if(a==null)return-1;var e;if(d)return d=b.sortedIndex(a,c),a[d]===c?d:-1;if(o&&a.indexOf===o)return a.indexOf(c);d=0;for(e=a.length;d<e;d++)if(a[d]===c)return d;return-1};b.lastIndexOf=function(a,
b){if(a==null)return-1;if(z&&a.lastIndexOf===z)return a.lastIndexOf(b);for(var d=a.length;d--;)if(a[d]===b)return d;return-1};b.range=function(a,b,d){arguments.length<=1&&(b=a||0,a=0);d=arguments[2]||1;for(var e=Math.max(Math.ceil((b-a)/d),0),f=0,g=Array(e);f<e;)g[f++]=a,a+=d;return g};b.bind=function(a,b){if(a.bind===q&&q)return q.apply(a,f.call(arguments,1));var d=f.call(arguments,2);return function(){return a.apply(b,d.concat(f.call(arguments)))}};b.bindAll=function(a){var c=f.call(arguments,1);
c.length==0&&(c=b.functions(a));h(c,function(c){a[c]=b.bind(a[c],a)});return a};b.memoize=function(a,c){var d={};c||(c=b.identity);return function(){var b=c.apply(this,arguments);return l.call(d,b)?d[b]:d[b]=a.apply(this,arguments)}};b.delay=function(a,b){var d=f.call(arguments,2);return setTimeout(function(){return a.apply(a,d)},b)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(f.call(arguments,1)))};var B=function(a,b,d){var e;return function(){var f=this,g=arguments,h=function(){e=null;
a.apply(f,g)};d&&clearTimeout(e);if(d||!e)e=setTimeout(h,b)}};b.throttle=function(a,b){return B(a,b,!1)};b.debounce=function(a,b){return B(a,b,!0)};b.once=function(a){var b=!1,d;return function(){if(b)return d;b=!0;return d=a.apply(this,arguments)}};b.wrap=function(a,b){return function(){var d=[a].concat(f.call(arguments));return b.apply(this,d)}};b.compose=function(){var a=f.call(arguments);return function(){for(var b=f.call(arguments),d=a.length-1;d>=0;d--)b=[a[d].apply(this,b)];return b[0]}};b.after=
function(a,b){return function(){if(--a<1)return b.apply(this,arguments)}};b.keys=F||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var b=[],d;for(d in a)l.call(a,d)&&(b[b.length]=d);return b};b.values=function(a){return b.map(a,b.identity)};b.functions=b.methods=function(a){var c=[],d;for(d in a)b.isFunction(a[d])&&c.push(d);return c.sort()};b.extend=function(a){h(f.call(arguments,1),function(b){for(var d in b)b[d]!==void 0&&(a[d]=b[d])});return a};b.defaults=function(a){h(f.call(arguments,
1),function(b){for(var d in b)a[d]==null&&(a[d]=b[d])});return a};b.clone=function(a){return b.isArray(a)?a.slice():b.extend({},a)};b.tap=function(a,b){b(a);return a};b.isEqual=function(a,c){if(a===c)return!0;var d=typeof a;if(d!=typeof c)return!1;if(a==c)return!0;if(!a&&c||a&&!c)return!1;if(a._chain)a=a._wrapped;if(c._chain)c=c._wrapped;if(a.isEqual)return a.isEqual(c);if(c.isEqual)return c.isEqual(a);if(b.isDate(a)&&b.isDate(c))return a.getTime()===c.getTime();if(b.isNaN(a)&&b.isNaN(c))return!1;
if(b.isRegExp(a)&&b.isRegExp(c))return a.source===c.source&&a.global===c.global&&a.ignoreCase===c.ignoreCase&&a.multiline===c.multiline;if(d!=="object")return!1;if(a.length&&a.length!==c.length)return!1;d=b.keys(a);var e=b.keys(c);if(d.length!=e.length)return!1;for(var f in a)if(!(f in c)||!b.isEqual(a[f],c[f]))return!1;return!0};b.isEmpty=function(a){if(b.isArray(a)||b.isString(a))return a.length===0;for(var c in a)if(l.call(a,c))return!1;return!0};b.isElement=function(a){return!!(a&&a.nodeType==
1)};b.isArray=n||function(a){return E.call(a)==="[object Array]"};b.isObject=function(a){return a===Object(a)};b.isArguments=function(a){return!(!a||!l.call(a,"callee"))};b.isFunction=function(a){return!(!a||!a.constructor||!a.call||!a.apply)};b.isString=function(a){return!!(a===""||a&&a.charCodeAt&&a.substr)};b.isNumber=function(a){return!!(a===0||a&&a.toExponential&&a.toFixed)};b.isNaN=function(a){return a!==a};b.isBoolean=function(a){return a===!0||a===!1};b.isDate=function(a){return!(!a||!a.getTimezoneOffset||
!a.setUTCFullYear)};b.isRegExp=function(a){return!(!a||!a.test||!a.exec||!(a.ignoreCase||a.ignoreCase===!1))};b.isNull=function(a){return a===null};b.isUndefined=function(a){return a===void 0};b.noConflict=function(){p._=C;return this};b.identity=function(a){return a};b.times=function(a,b,d){for(var e=0;e<a;e++)b.call(d,e)};b.mixin=function(a){h(b.functions(a),function(c){H(c,b[c]=a[c])})};var I=0;b.uniqueId=function(a){var b=I++;return a?a+b:b};b.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g};
b.template=function(a,c){var d=b.templateSettings;d="var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('"+a.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(d.interpolate,function(a,b){return"',"+b.replace(/\\'/g,"'")+",'"}).replace(d.evaluate||null,function(a,b){return"');"+b.replace(/\\'/g,"'").replace(/[\r\n\t]/g," ")+"__p.push('"}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+"');}return __p.join('');";d=new Function("obj",d);return c?d(c):d};
var j=function(a){this._wrapped=a};b.prototype=j.prototype;var r=function(a,c){return c?b(a).chain():a},H=function(a,c){j.prototype[a]=function(){var a=f.call(arguments);D.call(a,this._wrapped);return r(c.apply(b,a),this._chain)}};b.mixin(b);h(["pop","push","reverse","shift","sort","splice","unshift"],function(a){var b=i[a];j.prototype[a]=function(){b.apply(this._wrapped,arguments);return r(this._wrapped,this._chain)}});h(["concat","join","slice"],function(a){var b=i[a];j.prototype[a]=function(){return r(b.apply(this._wrapped,
arguments),this._chain)}});j.prototype.chain=function(){this._chain=!0;return this};j.prototype.value=function(){return this._wrapped}})();
//Copyright (c) 2009 The Chromium Authors. All rights reserved.
//Use of this source code is governed by a BSD-style license that can be
//found in the LICENSE file.

// Various functions for helping debug WebGL apps.

WebGLDebugUtils = function() {

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
  'frontFace': { 0:true },
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
 *         window.requestAnimFrame(render, canvas);
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

WebGLUtils = function() {

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
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
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

var vec = {};
var mat = {};
vec.eps = 1e-6;
mat.eps = 1e-6;
var vec2 = {};

vec2.create = function()
{
    var result = new Float32Array(2);
    result._type = 'vector';
    return result;
};

vec2.copy = function(vec)
{
    var result = new Float32Array(2);
    result._type = 'vector';
    result[0] = vec[0];
    result[1] = vec[1];
    return result;
};

vec2.make = vec2.copy;

vec2.equal = function(v1, v2)
{
    return Math.abs(v1[0] - v2[0]) < vec.eps &&
        Math.abs(v1[1] - v2[1]) < vec.eps;
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
    result._type = 'vector';
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
    result._type = 'vector';
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
    result._type = 'vector';
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
    result._type = 'vector';
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
    result._type = 'vector';
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
    result._type = 'vector';
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

vec2.dot = function(v1, v2)
{
    return v1[0] * v2[0] + v1[1] * v2[1];
};

vec2.map = function(vec, f) {
    return vec2.make(_.map(vec, f));
};

vec2.str = function(v) { return "[" + v[0] + ", " + v[1] + "]"; };
var vec3 = {};

vec3.create = function()
{
    var result = new Float32Array(3);
    result._type = 'vector';
    return result;
};

vec3.copy = function(vec)
{
    var result = new Float32Array(3);
    result._type = 'vector';
    result[0] = vec[0];
    result[1] = vec[1];
    result[2] = vec[2];
    return result;
};

vec3.make = vec3.copy;

vec3.equal = function(v1, v2)
{
    return Math.abs(v1[0] - v2[0]) < vec.eps &&
           Math.abs(v1[1] - v2[1]) < vec.eps &&
           Math.abs(v1[2] - v2[2]) < vec.eps;
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
    result._type = 'vector';
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
    result._type = 'vector';
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
    result._type = 'vector';
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
    result._type = 'vector';
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
    result._type = 'vector';
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
    result._type = 'vector';
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
    result._type = 'vector';
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
    result._type = 'vector';
    return result;
};

vec4.copy = function(vec)
{
    var result = new Float32Array(4);
    result._type = 'vector';
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

vec4.equal = function(v1, v2)
{
    return Math.abs(v1[0] - v2[0]) < vec.eps &&
        Math.abs(v1[1] - v2[1]) < vec.eps &&
        Math.abs(v1[2] - v2[2]) < vec.eps &&
        Math.abs(v1[3] - v2[3]) < vec.eps;
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
    result._type = 'vector';
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
    result._type = 'vector';
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
    result._type = 'vector';
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
    result._type = 'vector';
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
    result._type = 'vector';
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
    result._type = 'vector';
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
    result._type = 'matrix';
    return result;
};

mat2.copy = function(mat)
{
    var result = new Float32Array(4);
    result._type = 'matrix';
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
    result._type = 'matrix';
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
    result._type = 'matrix';
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
    result._type = 'matrix';
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
    result._type = 'matrix';
	
    var a00 = mat[0], a01 = mat[1];
    var a10 = mat[2], a11 = mat[3];
    
    // Calculate the determinant (inlined to avoid double-caching)
    var det = (a00*a11 - a01*a10);
    if (det === 0)
        throw "Singular matrix";

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
        throw "Singular matrix";

    mat[0] =  a11/det;
    mat[1] = -a01/det;
    mat[2] = -a10/det;
    mat[3] =  a00/det;

    return mat;
};

mat2.as_mat4 = function(mat)
{
    var result = new Float32Array(16);
    result._type = 'matrix';
    result[0]  = mat[0];
    result[1]  = mat[1];
    result[4]  = mat[2];
    result[5]  = mat[3];
    return result;
};

mat2.as_mat3 = function(mat)
{
    var result = new Float32Array(9);
    result._type = 'matrix';
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
    result._type = 'matrix';

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
    result._type = 'vector';
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
    result._type = 'matrix';
    return result;
};

mat3.copy = function(mat)
{
    var result = new Float32Array(9);
    result._type = 'matrix';
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
    result._type = 'matrix';
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
    result._type = 'matrix';
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
    result._type = 'matrix';
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
    result._type = 'matrix';

    var a00 = mat[0], a01 = mat[3], a02 = mat[6];
    var a10 = mat[1], a11 = mat[4], a12 = mat[7];
    var a20 = mat[2], a21 = mat[5], a22 = mat[8];
    
    // Calculate the determinant (inlined to avoid double-caching)
    // var det = mat3.determinant(mat);
    var det = a00*a11*a22 + a01*a12*a20 + a02*a10*a21
        - a02*a11*a20 - a01*a10*a22 - a00*a12*a21;
    if (det === 0)
        throw "Singular matrix";

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
        throw "Singular matrix";

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
    result._type = 'matrix';
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
    result._type = 'matrix';
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
    result._type = 'matrix';

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
    result._type = 'vector';
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
    result._type = 'matrix';
    return result;
};

mat4.copy = function(mat)
{
    var result = new Float32Array(16);
    result._type = 'matrix';
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
    result._type = 'matrix';
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
    result._type = 'matrix';
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
    result._type = 'matrix';
	
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
    result._type = 'matrix';
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
    result._type = 'matrix';
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
    if (!d) throw "singular matrix";

    var result = new Float32Array(9);
    result._type = 'matrix';
	
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
    result._type = 'matrix';

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
    result._type = 'vector';
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
    result._type = 'matrix';
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
    result._type = 'matrix';
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
    result._type = 'matrix';
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
    result._type = 'matrix';
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
    if (!len) { throw "zero-length axis"; }
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
    result._type = 'matrix';
    
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
    if (!len) { throw "zero-length axis"; }
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
    result._type = 'matrix';
    
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
    if (!len) { throw "zero-length axis"; }
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
    result._type = 'matrix';
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
    result._type = 'matrix';
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
    result._type = 'matrix';
    
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

vec.equal = function(v1, v2)
{
    if (v1.length != v2.length) {
        throw "mismatched lengths";
    }
    return vec[v1.length].equal(v1, v2);
};

vec.plus = function(v1, v2)
{
    if (v1.length != v2.length) {
        throw "mismatched lengths";
    }
    return vec[v1.length].plus(v1, v2);
};

vec.minus = function(v1, v2)
{
    if (v1.length != v2.length) {
        throw "mismatched lengths";
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
        throw "mismatched lengths";
    }
    return vec[v1.length].schur_product(v1, v2);
};

vec.normalized = function(v)
{
    return vec[v.length].schur_product(v);
};

vec.length = function(v)
{
    return vec[v.length].length(v);
};

vec.dot = function(v1, v2)
{
    if (v1.length != v2.length) {
        throw "mismatched lengths";
    }
    return vec[v1.length].dot(v1, v2);
};

vec.map = function(c, f)
{
    return vec[c.length].map(c, f);
};

vec.str = function(vec)
{
    return vec[vec.length].str(vec);
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
    throw "bad length";
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
        throw "mismatched lengths: " + m1.length + ", " + m2.length;
    }
    return mat[to_dim(m1.length)].equal(m1, m2);
};

mat.str = function(m1)
{
    return mat[to_dim(m1.length)].str(m1);
};

})();
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
Facet.is_shade_expression = function(obj)
{
    return typeof obj === 'function' && obj._facet_expression && obj.expression_type;
};

//////////////////////////////////////////////////////////////////////////////

// FIXME Can I make these two the same function call?
function facet_constant_type(obj)
// it is convenient in many places to accept as a parameter a scalar,
// a vector or a matrix. This function tries to
// tell them apart. Functions such as vec.make and mat.make populate
// the _type slot. This is ugly, but extremely convenient.
{
    var t = typeof obj;
    if (t === "boolean")         return "boolean";
    if (t === "number")          return "number";
    if (obj) {
        t = obj._type;
        if (!t)                      return "other";
    }
    return t;
}

//////////////////////////////////////////////////////////////////////////////
// http://javascript.crockford.com/remedial.html

// Notice that facet_typeOf is NOT EXACTLY equal to
// 
//   http://javascript.crockford.com/remedial.html
//
// In particular, facet_typeOf will return "object" if given Shade expressions.
// 
// Shade expressions are actually functions with a bunch of extra methods.
// 
// This is something of a hack, but it is the simplest way I know of to get
// operator() overloading, which turns out to be notationally quite powerful.
//

function facet_typeOf(value) 
{
    var s = typeof value;
    if (s === 'function' && value._facet_expression)
        return 'object';
    if (s === 'object') {
        if (value) {
            if (typeof value.length === 'number' &&
                !(value.propertyIsEnumerable('length')) &&
                typeof value.splice === 'function') {
                s = 'array';
            }
        } else {
            s = 'null';
        }
    }
    return s;
}
Facet.attribute_buffer = function(opts)
{
    var ctx = Facet._globals.ctx;
    opts = _.defaults(opts, {
        item_size: 3,
        item_type: 'float',
        usage: ctx.STATIC_DRAW,
        normalized: false,
        keep_array: false
    });

    var vertex_array = opts.vertex_array;
    if (_.isUndefined(vertex_array)) {
        throw "opts.vertex_array must be defined";
    }

    var usage = opts.usage;
    if ([ctx.STATIC_DRAW, ctx.DYNAMIC_DRAW, ctx.STREAM_DRAW].indexOf(usage) === -1) {
        throw "opts.usage must be one of STATIC_DRAW, DYNAMIC_DRAW, STREAM_DRAW";
    }

    var itemSize = opts.item_size;
    if ([1,2,3,4].indexOf(itemSize) === -1) {
        throw "opts.item_size must be one of 1, 2, 3, or 4";
    }

    var normalized = opts.normalized;
    if (facet_typeOf(normalized) !== "boolean") {
        throw "opts.normalized must be boolean";
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
        throw "opts.item_type must be 'float', 'short', 'ushort', 'byte' or 'ubyte'";
    }

    var result = ctx.createBuffer();
    result._ctx = ctx;
    result._shade_type = 'attribute_buffer';
    result.itemSize = itemSize;
    result.usage = usage;
    result.normalized = normalized;
    result._webgl_type = itemType.webgl_enum;
    result._typed_array_ctor = itemType.typed_array_ctor;
    result._word_length = itemType.size;

    result.set = function(vertex_array) {
        Facet.set_context(ctx);
        if (vertex_array.length % itemSize !== 0) {
            throw "length of array must be multiple of item_size";
        }
        var typedArray = new this._typed_array_ctor(vertex_array);
        ctx.bindBuffer(ctx.ARRAY_BUFFER, this);
        ctx.bufferData(ctx.ARRAY_BUFFER, typedArray, this.usage);
        if (opts.keep_array) {
            this.array = typedArray;
        }
        this.numItems = vertex_array.length/itemSize;
    };
    result.set(vertex_array);

    result.set_region = function(index, array) {
        Facet.set_context(ctx);
        if ((index + array.length) > (this.numItems * this.itemSize) || (index < 0))
            throw "set_region index out of bounds";
        var typedArray = new this._typed_array_ctor(array);
        ctx.bindBuffer(ctx.ARRAY_BUFFER, this);
        ctx.bufferSubData(ctx.ARRAY_BUFFER, index * this._word_length, typedArray);
        if (opts.keep_array) {
            for (var i=0; i<array.length; ++i) {
                this.array[index+i] = array[i];
            }
        }
    };

    result.bind = function(attribute) {
        Facet.set_context(ctx);
        ctx.bindBuffer(ctx.ARRAY_BUFFER, this);
        ctx.vertexAttribPointer(attribute, this.itemSize, this._webgl_type, normalized, 0, 0);
    };

    result.draw = function(primitive) {
        Facet.set_context(ctx);
        ctx.drawArrays(primitive, 0, this.numItems);
    };
    result.bind_and_draw = function(attribute, primitive) {
        // inline the calls to bind and draw to shave a redundant set_context.
        Facet.set_context(ctx);
        ctx.bindBuffer(ctx.ARRAY_BUFFER, this);
        ctx.vertexAttribPointer(attribute, this.itemSize, this._webgl_type, normalized, 0, 0);
        ctx.drawArrays(primitive, 0, this.numItems);
    };
    return result;
};
(function() {

var previous_batch_opts = {};

Facet.unload_batch = function()
{
    if (!previous_batch_opts._ctx)
        return;
    var ctx = previous_batch_opts._ctx;
    if (previous_batch_opts.attributes) {
        for (var key in previous_batch_opts.attributes) {
            ctx.disableVertexAttribArray(previous_batch_opts.program[key]);
        }
        _.each(previous_batch_opts.program.uniforms, function (uniform) {
            delete uniform._facet_active_uniform;
        });
    }
    // FIXME setting line width belongs somewhere else, but I'm not quite sure where.
    // resets line width
    if (previous_batch_opts.line_width)
        ctx.lineWidth(1.0);

    // reset the opengl capabilities which are determined by
    // Facet.DrawingMode.*
    ctx.disable(ctx.DEPTH_TEST);
    ctx.disable(ctx.BLEND);
    ctx.depthMask(true);

    previous_batch_opts = {};
};

function draw_it(batch_opts)
{
    if (_.isUndefined(batch_opts))
        throw "drawing mode undefined";

    if (batch_opts.batch_id !== previous_batch_opts.batch_id) {
        var attributes = batch_opts.attributes || {};
        var uniforms = batch_opts.uniforms || {};
        var program = batch_opts.program;
        var primitives = batch_opts.primitives;
        var key;

        Facet.unload_batch();
        previous_batch_opts = batch_opts;
        batch_opts.set_caps();

        var ctx = batch_opts._ctx;
        ctx.useProgram(program);

        for (key in attributes) {
            var attr = program[key];
            if (!_.isUndefined(attr)) {
                ctx.enableVertexAttribArray(attr);
                attributes[key].bind(attr);
            }
        }
        
        var currentActiveTexture = 0;
        _.each(program.uniforms, function(uniform) {
            var key = uniform.uniform_name;
            var call = uniform.uniform_call,
                value = uniform.get();
            if (_.isUndefined(value)) {
                throw "parameter " + key + " has not been set.";
            }
            var t = facet_constant_type(value);
            if (t === "other") {
                uniform._facet_active_uniform = (function(uid, cat) {
                    return function(v) {
                        ctx.activeTexture(ctx.TEXTURE0 + cat);
                        ctx.bindTexture(ctx.TEXTURE_2D, v);
                        ctx.uniform1i(uid, cat);
                    };
                })(program[key], currentActiveTexture);
                currentActiveTexture++;
            } else if (t === "number" || t === "vector" || t === "boolean") {
                uniform._facet_active_uniform = (function(call, uid) {
                    return function(v) {
                        call.call(ctx, uid, v);
                    };
                })(ctx[call], program[key]);
            } else if (t === "matrix") {
                uniform._facet_active_uniform = (function(call, uid) {
                    return function(v) {
                        ctx[call](uid, false, v);
                    };
                })(call, program[key]);
            } else {
                throw "could not figure out parameter type! " + t;
            }
            uniform._facet_active_uniform(value);
        });
    }

    batch_opts.draw_chunk();
}

var largest_batch_id = 1;

Facet.bake = function(model, appearance, opts)
{
    opts = _.defaults(opts || {}, {
        force_no_draw: false,
        force_no_pick: false,
        force_no_unproject: false
    });

    appearance = Shade.canonicalize_program_object(appearance);

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
        throw "position appearance attribute must be vec2, vec3 or vec4";
    }

    var ctx = model._ctx || Facet._globals.ctx;

    var batch_id = Facet.fresh_pick_id();

    function build_attribute_arrays_obj(prog) {
        return _.build(_.map(
            prog.attribute_buffers, function(v) { return [v._shade_name, v]; }
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

    /* Facet unprojecting uses the render-as-depth technique suggested
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
    if (facet_typeOf(elements) === 'number') {
        draw_chunk = function() {
            ctx.drawArrays(primitive_type, 0, elements);
        };
    } else {
        draw_chunk = function() {
            elements.bind_and_draw(elements, primitive_type);
        };
    }
    var primitives = [primitive_types[model.type], model.elements];

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
        var result = {
            _ctx: ctx,
            program: program,
            attributes: build_attribute_arrays_obj(program),
            set_caps: function() {
                var ctx = Facet._globals.ctx;
                var mode_caps = ((appearance.mode && appearance.mode[caps_name]) ||
                       Facet.DrawingMode.standard[caps_name]);
                mode_caps();
                if (this.line_width) {
                    ctx.lineWidth(this.line_width);
                }
            },
            draw_chunk: draw_chunk,
            batch_id: largest_batch_id++
        };
        if (appearance.line_width)
            result.line_width = appearance.line_width;
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
        batch_id: batch_id,
        draw: function() {
            draw_it(which_opts[ctx._facet_globals.batch_render_mode]);
        },
        // in case you want to force the behavior, or that
        // single array lookup is too slow for you.
        _draw: function() {
            draw_it(draw_opts);
        },
        _pick: function() {
            draw_it(pick_opts);
        }
    };
    return result;
};
})();
(function() {

})();
// FIXME make API similar to Facet.attribute_buffer
Facet.element_buffer = function(vertex_array)
{
    var ctx = Facet._globals.ctx;
    var result = ctx.createBuffer();
    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, result);
    var typedArray = new Uint16Array(vertex_array);
    ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, typedArray, ctx.STATIC_DRAW);
    result._shade_type = 'element_buffer';
    result.array = typedArray;
    result.itemSize = 1;
    result.numItems = vertex_array.length;
    result.bind = function() {
        /* Javascript functions are quirky in that they can take unused arguments.
         So if a call passes an argument to result.bind, it won't fail; the argument
         is simply dropped.

         This has the fortuitous consequence of making attribute
         buffers and element buffers share the same interface
         (attributes that get passed to bind are ignored by element
         buffers and handled by attribute buffers)
        */
        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this);
    };
    result.draw = function(primitive) {
        ctx.drawElements(primitive, this.numItems, ctx.UNSIGNED_SHORT, 0);
    };
    result.bind_and_draw = function(attribute, primitive) {
        this.bind(attribute);
        this.draw(primitive);
    };
    return result;
};
// Call this to get a guaranteed unique range of picking ids.
// Useful to avoid name conflicts between automatic ids and
// user-defined ids.

(function() {

var latest_pick_id = 1;

Facet.fresh_pick_id = function(quantity)
{
    quantity = quantity || 1;
    var result = latest_pick_id;
    latest_pick_id += quantity;
    return result;
};

})();
Facet.id_buffer = function(vertex_array)
{
    if (facet_typeOf(vertex_array) !== 'array')
        throw "id_buffer expects array of integers";
    var typedArray = new Int32Array(vertex_array);
    var byteArray = new Uint8Array(typedArray.buffer);
    return Facet.attribute_buffer({
        vertex_array: byteArray, 
        item_size: 4, 
        item_type: 'ubyte', 
        normalized: true
    });
};
(function() {

function initialize_context_globals(gl)
{
    gl._facet_globals = {};

    // when Facet.init is called with a display callback, that gets stored in
    // gl._globals.display_callback
    gl._facet_globals.display_callback = Facet.Scene.render;

    // Objects stored in the scene are automatically drawn
    gl._facet_globals.scene = [];

    // batches can currently be rendered in "draw" or "pick" mode.
    // draw: 0
    // pick: 1
    // these are indices into an array defined inside Facet.bake
    // For legibility, they should be strings, but for speed, they'll be integers.
    gl._facet_globals.batch_render_mode = 0;
}

Facet.init = function(canvas, opts)
{
    canvas.unselectable = true;
    canvas.onselectstart = function() { return false; };
    var gl;
    var clearColor, clearDepth;
    opts = _.defaults(opts || {}, { clearColor: [1,1,1,0],
                                    clearDepth: 1.0,
                                    attributes: {
                                        alpha: true,
                                        depth: true
                                    }
                                  });
    if (Facet.is_shade_expression(opts.clearColor)) {
        if (!opts.clearColor.is_constant())
            throw "clearColor must be constant expression";
        if (!opts.clearColor.type.equals(Shade.Types.vec4))
            throw "clearColor must be vec4";
        clearColor = _.toArray(opts.clearColor.constant_value());
    } else
        clearColor = opts.clearColor;

    // FIXME This should be a "is Shade expression" check
    if (Facet.is_shade_expression(opts.clearDepth)) {
        if (!opts.clearDepth.is_constant())
            throw "clearDepth must be constant expression";
        if (!opts.clearDepth.type.equals(Shade.Types.float_t))
            throw "clearDepth must be float";
        clearDepth = opts.clearDepth.constant_value();
    } else
        clearDepth = opts.clearDepth;

    try {
        if ("attributes" in opts) {
            gl = WebGLUtils.setupWebGL(canvas, opts.attributes);
            var x = gl.getContextAttributes();
            for (var key in opts.attributes) {
                if (opts.attributes[key] !== x[key]) {
                    throw ("requested attribute " + 
                           key + ": " + opts.attributes[key] +
                           " could not be satisfied");
                }
            }
        } else
            gl = WebGLUtils.setupWebGL(canvas);
        if (!gl)
            throw "failed context creation";
        if ("interactor" in opts) {
            for (var key in opts.interactor.events) {
                opts[key] = opts.interactor.events[key];
            }
        }
        
        if (opts.debugging) {
            var throwOnGLError = function(err, funcName, args) {
                throw WebGLDebugUtils.glEnumToString(err) + 
                    " was caused by call to " + funcName;
            };
            gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError, opts.tracing);
        }
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        var canvas_events = ["mouseover", "mousemove", "mousedown", "mouseout", "mouseup"];
        for (var i=0; i<canvas_events.length; ++i) {
            var ename = canvas_events[i];
            var listener = opts[ename];
            if (!_.isUndefined(listener)) {
                (function(listener) {
                    function internal_listener(event) {
                        event.facetX = event.offsetX;
                        event.facetY = gl.viewportHeight - event.offsetY;
                        return listener(event);
                    }
                    canvas.addEventListener(ename, Facet.on_context(gl, internal_listener), false);
                })(listener);
            }
        }
        if (!_.isUndefined(opts.mousewheel)) {
            $(canvas).bind('mousewheel', opts.mousewheel);
        };

        var ext;
        var exts = _.map(gl.getSupportedExtensions(), function (x) { 
            return x.toLowerCase();
        });
        if (exts.indexOf("oes_texture_float") == -1) {
            // FIXME design something like progressive enhancement for these cases. HARD!
            alert("OES_texture_float is not available on your browser/computer! " +
                  "Facet will not work, sorry.");
            throw "insufficient GPU support";
        } else {
            gl.getExtension("oes_texture_float");
        }
    } catch(e) {
        alert(e);
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
        throw "failed initalization";
    }

    initialize_context_globals(gl);
    Facet.set_context(gl);

    if (opts.display) {
        gl._facet_globals.display_callback = opts.display;
    }

    gl.display = function() {
        this.viewport(0, 0, this.viewportWidth, this.viewportHeight);
        this.clearDepth(clearDepth);
        this.clearColor.apply(gl, clearColor);
        this.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this._facet_globals.display_callback();
    };
    gl.resize = function(width, height) {
        this.viewportWidth = width;
        this.viewportHeight = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.display();
    };

    return gl;
};

})();
Facet.load_image_into_texture = function(opts)
{
    opts = _.defaults(opts, {
        onload: function() {},
        x_offset: 0,
        y_offset: 0
    });

    var texture = opts.texture;
    var onload = opts.onload;
    var x_offset = opts.x_offset;
    var y_offset = opts.y_offset;

    function image_handler(image) {
        var ctx = texture._ctx;
        Facet.set_context(texture._ctx);
        ctx.bindTexture(ctx.TEXTURE_2D, texture);
        ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
        ctx.texSubImage2D(ctx.TEXTURE_2D, 0, x_offset, y_offset,
                          ctx.RGBA, ctx.UNSIGNED_BYTE, image);
        Facet.unload_batch();
        onload(image);
    }

    function buffer_handler()
    {
        var ctx = texture._ctx;
        Facet.set_context(texture._ctx);
        ctx.bindTexture(ctx.TEXTURE_2D, texture);
        ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
        ctx.texSubImage2D(ctx.TEXTURE_2D, 0, x_offset, y_offset,
                          opts.width, opts.height,
                          ctx.RGBA, ctx.UNSIGNED_BYTE, opts.buffer);
        Facet.unload_batch();
        onload();
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
Facet.identity = function()
{
    return mat4.identity();
};

Facet.translation = function(v)
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

    throw "invalid vector size for translation";
};

Facet.scaling = function (v)
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

    throw "invalid size for scale";
};

Facet.rotation = function(angle, axis)
{
    return mat4.rotation(angle, axis);
};

Facet.look_at = function(ex, ey, ez, cx, cy, cz, ux, uy, uz)
{
    return mat4.lookAt([ex, ey, ez], [cx, cy, cz], [ux, uy, uz]);
};

Facet.perspective = mat4.perspective;

Facet.frustum = mat4.frustum;

Facet.ortho = mat4.ortho;

Facet.shear = function(xf, yf)
{
    return mat4.create([1, 0, xf, 0,
                        0, 1, yf, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1]);
};
// This function is fairly ugly, but I'd rather this function be ugly
// than the code which calls it be ugly.
Facet.model = function(input)
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
                if (v._shade_type === 'element_buffer')
                    // example: 'elements: Facet.element_buffer(...)'
                    result.elements = v;
                else if (facet_typeOf(v) === 'array')
                    // example: 'elements: [0, 1, 2, 3]'
                    result.elements = Facet.element_buffer(v);
                else
                    // example: 'elements: 4'
                    result.elements = v;
            }
            // Then we handle the model attributes. They can be ...
            else if (v._shade_type === 'attribute_buffer') { // ... attribute buffers,
                // example: 'vertex: Facet.attribute_buffer(...)'
                result[k] = Shade(v);
                n_elements = v.numItems;
            } else if (facet_typeOf(v) === "array") { // ... or a list of per-vertex things
                var buffer;
                // These things can be shade vecs
                if (facet_typeOf(v[0]) !== "array" && v[0]._facet_expression) {
                    // example: 'color: [Shade.color('white'), Shade.color('blue'), ...]
                    // assume it's a list of shade vecs, assume they all have the same dimension
                    // FIXME: check this
                    var dimension = v[0].type.vec_dimension();
                    var new_v = [];
                    _.each(v, push_into(new_v, dimension));
                    buffer = Facet.attribute_buffer({
                        vertex_array: new_v, 
                        item_size: dimension
                    });
                    result[k] = Shade(buffer);
                    n_elements = buffer.numItems;
                } else {
                    // Or they can be a single list of plain numbers, in which case we're passed 
                    // a pair, the first element being the list, the second 
                    // being the per-element size
                    // example: 'color: [[1,0,0, 0,1,0, 0,0,1], 3]'
                    buffer = Facet.attribute_buffer({
                        vertex_array: v[0], 
                        item_size: v[1]
                    });
                    result[k] = Shade(buffer);
                    n_elements = buffer.numItems;
                }
            } else {
                // if it's not any of the above things, then it's either a single shade expression
                // or a function which returns one. In any case, we just assign it to the key
                // and leave the user to fend for his poor self.
                result[k] = v;
            }
        }
    };

    for (var k in input) {
        var v = input[k];
        result.add(k, v);
    }
    if (!("elements" in result)) {
        // populate automatically using some sensible guess inferred from the attributes above
        if (_.isUndefined(n_elements)) {
            throw "could not figure out how many elements are in this model; "
                + "consider passing an 'elements' field";
        } else {
            result.elements = n_elements;
        }
    }
    result._ctx = Facet._globals.ctx;
    return result;
};
(function() {

var rb;

Facet.Picker = {
    draw_pick_scene: function(callback) {
        var ctx = Facet._globals.ctx;
        if (!rb) {
            rb = Facet.render_buffer({
                width: ctx.viewportWidth,
                height: ctx.viewportHeight,
                mag_filter: ctx.NEAREST,
                min_filter: ctx.NEAREST
            });
        }

        callback = callback || ctx._facet_globals.display_callback;
        var old_scene_render_mode = ctx._facet_globals.batch_render_mode;
        ctx._facet_globals.batch_render_mode = 1;
        try {
            rb.with_bound_buffer(function() {
                ctx.clearColor(0,0,0,0);
                ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
                callback();
            });
        } finally {
            ctx._facet_globals.batch_render_mode = old_scene_render_mode;
        }
    },
    pick: function(x, y) {
        var ctx = Facet._globals.ctx;
        var buf = new ArrayBuffer(4);
        var result_bytes = new Uint8Array(4);
        ctx.readPixels(x, y, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, 
                       result_bytes);
        rb.with_bound_buffer(function() {
            ctx.readPixels(x, y, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, 
                           result_bytes);
        });
        var result_words = new Uint32Array(result_bytes.buffer);
        return result_words[0];
    }
};

})();
Facet.profile = function(name, seconds, onstart, onend) {
    if (onstart) onstart();
    console.profile(name);
    setTimeout(function() {
        console.profileEnd();
        if (onend) onend();
    }, seconds * 1000);
};
Facet.program = function(vs_src, fs_src)
{
    var ctx = Facet._globals.ctx;
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
            return null;
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
        alert("Could not initialise shaders");
        return null;
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
Facet.render_buffer = function(opts)
{
    var ctx = Facet._globals.ctx;
    var frame_buffer = ctx.createFramebuffer();
    opts = _.defaults(opts || {}, {
        width: 512,
        height: 512,
        mag_filter: ctx.LINEAR,
        min_filter: ctx.LINEAR,
        wrap_s: ctx.CLAMP_TO_EDGE,
        wrap_t: ctx.CLAMP_TO_EDGE
    });

    // Weird:
    // http://www.khronos.org/registry/gles/specs/2.0/es_full_spec_2.0.25.pdf
    // Page 118
    // 
    // Seems unenforced in my implementations of WebGL, even though 
    // the WebGL spec defers to GLSL ES spec.
    // 
    // if (opts.width != opts.height)
    //     throw "renderbuffers must be square (blame GLSL ES!)";

    var rttTexture = Facet.texture(opts);

    frame_buffer.init = function(width, height) {
        Facet.set_context(ctx);
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
                throw "incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT";
            case ctx.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                throw "incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";
            case ctx.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                throw "incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS";
            case ctx.FRAMEBUFFER_UNSUPPORTED:
                throw "incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED";
            default:
                throw "incomplete framebuffer: " + status;
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
        try {
            ctx.bindFramebuffer(ctx.FRAMEBUFFER, this);
            ctx.viewport(0, 0, this.width, this.height);
            return what();
        } finally {
            ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
        }
    };
    frame_buffer.make_screen_batch = function(with_texel_at_uv) {
        var sq = Facet.Models.square();
        return Facet.bake(sq, {
            position: sq.vertex.mul(2).sub(1),
            color: with_texel_at_uv(Shade.texture2D(this.texture, sq.tex_coord), sq.tex_coord)
        });
    };
    return frame_buffer;
};
Facet.set_context = function(the_ctx)
{
    Facet._globals.ctx = the_ctx;
    // Shade.set_context(the_ctx);
};
/*
 * Facet.on_context returns a wrapped callback that guarantees that the passed
 * callback will be invoked with the given current context. 
 * 
 * This is primarily used to safeguard pieces of code that need to work under
 * multiple active WebGL contexts.
 */
Facet.on_context = function(the_ctx, f)
{
    return function() {
        Facet.set_context(the_ctx);
        f.apply(this, arguments);
    };
};
//////////////////////////////////////////////////////////////////////////////
// load texture from DOM element or URL. 
// BEWARE SAME-DOMAIN POLICY!

Facet.texture = function(opts)
{
    var ctx = Facet._globals.ctx;
    var texture = ctx.createTexture();
    texture._shade_type = 'texture';
    texture._ctx = ctx;

    texture.init = Facet.on_context(ctx, function(opts) {
        var ctx = Facet._globals.ctx;
        opts = _.defaults(opts, {
            onload: function() {},
            mipmaps: false,
            mag_filter: ctx.LINEAR,
            min_filter: ctx.LINEAR,
            wrap_s: ctx.CLAMP_TO_EDGE,
            wrap_t: ctx.CLAMP_TO_EDGE,
            format: ctx.RGBA,
            type: ctx.UNSIGNED_BYTE
        });
        this.width = opts.width;
        this.height = opts.height;

        var that = this;
        function handler() {
            Facet.set_context(ctx);
            ctx.bindTexture(ctx.TEXTURE_2D, that);
            ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            if (that.image) {
                ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
                ctx.pixelStorei(ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL, 
                                ctx.BROWSER_DEFAULT_WEBGL);
                ctx.texImage2D(ctx.TEXTURE_2D, 0, opts.format, opts.format,
                               opts.type, that.image);
            } else {
                ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);
                ctx.pixelStorei(ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL, ctx.NONE);
                ctx.texImage2D(ctx.TEXTURE_2D, 0, opts.format,
                               that.width, that.height,
                               0, opts.format, opts.type, that.buffer);
            }
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, opts.mag_filter);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, opts.min_filter);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, opts.wrap_s);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, opts.wrap_t);
            if (opts.mipmaps)
                ctx.generateMipmap(ctx.TEXTURE_2D);
            ctx.bindTexture(ctx.TEXTURE_2D, null);
            opts.onload(that);
            // to ensure that all textures are bound correctly,
            // we unload the current batch, forcing all uniforms to be re-evaluated.
            Facet.unload_batch();
        }

        delete this.buffer;
        delete this.image;

        if (opts.src) {
            var image = new Image();
            image.onload = function() {
                that.width = image.width;
                that.height = image.height;
                handler();
            };
            this.image = image;
            if (opts.crossOrigin)
                image.crossOrigin = opts.crossOrigin; // CORS support
            image.src = opts.src;
        } else if (opts.img) {
            this.image = opts.img;
            if (this.image.isComplete) {
                this.width = this.image.width;
                this.height = this.image.height;
                handler();
            } else {
                this.image.onload = function() {
                    that.width = that.image.width;
                    that.height = that.image.height;
                    handler();
                };
            }
        } else {
            this.buffer = opts.buffer || null;
            handler();        
        }
    });
    texture.init(opts);

    return texture;
};
(function() {

var rb;
var depth_value;
var clear_batch;
    
Facet.Unprojector = {
    draw_unproject_scene: function(callback) {
        var ctx = Facet._globals.ctx;
        if (!rb) {
            rb = Facet.render_buffer({
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
            var xy = Shade(Facet.attribute_buffer({
                vertex_array: [-1, -1,   1, -1,   -1,  1,   1,  1], 
                item_size: 2}));
            var model = Facet.model({
                type: "triangle_strip",
                elements: 4,
                vertex: xy
            });
            depth_value = Shade.parameter("float");
            clear_batch = Facet.bake(model, {
                position: Shade.vec(xy, depth_value),
                color: Shade.vec(1,1,1,1)
            });
        }

        callback = callback || ctx._facet_globals.display_callback;
        var old_scene_render_mode = ctx._facet_globals.batch_render_mode;
        ctx._facet_globals.batch_render_mode = 2;
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
                ctx._facet_globals.batch_render_mode = old_scene_render_mode;
            }
        });
    },

    unproject: function(x, y) {
        var ctx = Facet._globals.ctx;
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
Facet.Net = {};

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
 * Facet.Net.ajax issues AJAX requests.
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
 * FIXME Facet.Net.ajax has no error handling.
 */

Facet.Net.ajax = function(url, handler)
{
    var current_context = Facet._globals.ctx;

    if (facet_typeOf(url) === "array")
        return handle_many(url, handler, Facet.Net.ajax);

    var xhr = new XMLHttpRequest;

    xhr.open("GET", url, true);

    var ready = false;
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200 && !ready) {
            Facet.set_context(current_context);
            handler(xhr.response, url);
            ready = true;
        }
    };
    xhr.send(null);
};
/*
 * Facet.Net.json issues JSON AJAX requests.
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
 * FIXME Facet.Net.json has no error handling.
 */

Facet.Net.json = function(url, handler)
{
    if (facet_typeOf(url) === "array")
        return handle_many(url, handler, Facet.Net.json);

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
 * Facet.Net.binary issues binary AJAX requests, which can be
 * used to load data into Facet more efficiently than through the
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
 * FIXME Facet.Net.binary has no error handling.
 */

// based on http://calumnymmo.wordpress.com/2010/12/22/so-i-decided-to-wait/
Facet.Net.binary = function(url, handler)
{
    var current_context = Facet._globals.ctx;

    if (facet_typeOf(url) === "array")
        return handle_many(url, handler, Facet.Net.binary);

    var xhr = new window.XMLHttpRequest();
    var ready = false;
    xhr.onreadystatechange = function() {
        Facet.set_context(current_context);
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
    if(xhr.hasOwnProperty("responseType")) {
        xhr.responseType="arraybuffer";
    } else {
        xhr.overrideMimeType('text/plain; charset=x-user-defined');
    }
    xhr.send();
};
})();
Facet.Scale = {};
Facet.Scale.Geo = {};
Facet.Scale.Geo.mercator_to_spherical = function(x, y)
{
    var lat = y.sinh().atan();
    var lon = x;
    return Facet.Scale.Geo.latlong_to_spherical(lat, lon);
};
// FIXME can't be Shade(function()...) because Shade() hasn't been defined yet.
//
// FIXME this means that Facet.Scale should, unsurprisingly, be Shade.Scale.
Facet.Scale.Geo.latlong_to_spherical = function(lat, lon)
{
    lat = Shade(lat);
    lon = Shade(lon);
    var stretch = lat.cos();
    return Shade.vec(lon.sin().mul(stretch),
                     lat.sin(),
                     lon.cos().mul(stretch), 1);
};
// drawing mode objects can be part of the parameters passed to 
// Facet.bake, in order for the batch to automatically set the capabilities.
// This lets us specify blending, depth-testing, etc. at bake time.

/* FIXME This is double dispatch done wrong. See facet.org for details.
 */

Facet.DrawingMode = {};
Facet.DrawingMode.additive = {
    set_draw_caps: function()
    {
        var ctx = Facet._globals.ctx;
        ctx.enable(ctx.BLEND);
        ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE);
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
        ctx.depthMask(false);
    },
    set_pick_caps: function()
    {
        var ctx = Facet._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
        ctx.depthMask(false);
    },
    set_unproject_caps: function()
    {
        var ctx = Facet._globals.ctx;
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
// Facet.DrawingMode.over_with_depth and Facet.DrawingMode.over

Facet.DrawingMode.over = {
    set_draw_caps: function()
    {
        var ctx = Facet._globals.ctx;
        ctx.enable(ctx.BLEND);
        ctx.blendFuncSeparate(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA, 
                              ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA);
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
        ctx.depthMask(false);
    },
    set_pick_caps: function()
    {
        var ctx = Facet._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
        ctx.depthMask(false);
    },
    set_unproject_caps: function()
    {
        var ctx = Facet._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
        ctx.depthMask(false);
    }
};

Facet.DrawingMode.over_with_depth = {
    set_draw_caps: function()
    {
        var ctx = Facet._globals.ctx;
        ctx.enable(ctx.BLEND);
        ctx.blendFuncSeparate(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA, 
                              ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA);
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LEQUAL);
    },
    set_pick_caps: function()
    {
        var ctx = Facet._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LEQUAL);
    },
    set_unproject_caps: function()
    {
        var ctx = Facet._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LEQUAL);
    }
};
Facet.DrawingMode.standard = {
    set_draw_caps: function()
    {
        var ctx = Facet._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
    },
    set_pick_caps: function()
    { 
        var ctx = Facet._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
   },
    set_unproject_caps: function()
    {
        var ctx = Facet._globals.ctx;
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LESS);
    }
};
Facet.DrawingMode.pass = {
    set_draw_caps: function()
    {
        var ctx = Facet._globals.ctx;
        ctx.disable(ctx.DEPTH_TEST);
        ctx.depthMask(false);
    },
    set_pick_caps: function()
    { 
        var ctx = Facet._globals.ctx;
        ctx.disable(ctx.DEPTH_TEST);
        ctx.depthMask(false);
    },
    set_unproject_caps: function()
    {
        var ctx = Facet._globals.ctx;
        ctx.disable(ctx.DEPTH_TEST);
        ctx.depthMask(false);
    }
};
Facet.Data = {};
Facet.Data.table = function(obj) {
    obj = _.defaults(obj || {}, {
        number_columns: []
    });
    if (_.isUndefined(obj.data)) throw "data is a required field";
    if (_.isUndefined(obj.data)) throw "columns is a required field";
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
Facet.Data.texture_table = function(table)
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
                throw "texture_table requires numeric values";
            elements.push(val);
        }
    }

    var table_ncols = table.number_columns.length;
    // can't be table.data.length because not all rows are valid.
    var table_nrows = elements.length / table.number_columns.length;
    var texture_width = 1;

    return Facet.Data.texture_array({
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

s parameters a list of floating point elements
   (or a Float32Array), the number of columns and rows in the implied 2D array of data

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

Facet.Data.texture_array = function(opts)
{
    var ctx = Facet._globals.ctx;
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
        if (facet_typeOf(elements) === "array") {
            new_elements = new Float32Array(elements);
        } else
            new_elements = elements;
    } else {
        new_elements = new Float32Array(texture_width * texture_height * 4);
        for (var i=0; i<elements.length; ++i)
            new_elements[i] = elements[i];
    }

    var texture = Facet.texture({
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
Facet.Data.array_1d = function(array)
{
    var ctx = Facet._globals.ctx;

    var elements = array;
    var texture_width = 1;
    while (4 * texture_width * texture_width < elements.length) {
        texture_width = texture_width * 2;
    }
    var texture_height = Math.ceil(elements.length / (4 * texture_width));
    var new_elements;
    if (texture_width * texture_height === elements.length) {
        if (facet_typeOf(elements) === "array") {
            new_elements = new Float32Array(elements);
        } else
            new_elements = elements;
    } else {
        new_elements = new Float32Array(texture_width * texture_height * 4);
        for (var i=0; i<elements.length; ++i)
            new_elements[i] = elements[i];
    }

    var texture = Facet.texture({
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
Facet.UI = {};
/*
 * Facet.UI.parameter_slider is a function to help create UI elements
 * that control Shade.parameter objects. 
 * 
 * It uses jquery-ui sliders, and so assumes jquery-ui in addition to jquery.
 * 
 * I hear jquery-ui is about as cool as pocket protectors, but hey, 
 * it does the job.
 * 
 */

/*
 * Facet.UI.parameter_slider requires "element" and "parameter" options.
 * 
 * opts.element is the HTML element used by jquery-ui to create the slider. That
 *   object needs to have the correct CSS class assigned to it ahead of calling
 *   this function.
 * 
 * opts.parameter is the Shade.parameter object under control.
 * 
 * opts.change is a user-defined callback to the slider change event.
 * opts.slide is a user-defined callback to the slider slide event.
 * 
 *   Both event handlers are passed the HTML element, the parameter object, 
 *   and the new value, in that order.
 * 
 * opts.min is the minimum value allowed by the slider
 * opts.max is the maximum value allowed by the slider
 * opts.orientation is the slider's orientation, either "horizontal" or "vertical"
 */

Facet.UI.parameter_slider = function(opts)
{
    opts = _.defaults(opts, {
        min: 0,
        max: 1,
        orientation: "horizontal",
        slide: function() {},
        change: function() {}
    });
    var element = opts.element;
    var parameter =  opts.parameter;

    var slider_min = 0, slider_max = 1000;

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
            Facet.Scene.invalidate();
        },
        change: function() {
            var v = to_parameter($(element).slider("value"));
            parameter.set(v);
            opts.change(element, parameter, v);
            Facet.Scene.invalidate();
        }
    });
};
/*
 * A Facet interactor is an object that exposes a list of events that
 * Facet.init uses to hook up to canvas event handlers.
 * 
 * Facet.UI.center_zoom_interactor provides event handlers for the
 * common interaction mode of zooming and panning. Its main visible variables
 * are center and zoom Shade.parameter objects, together with a Shade.camera
 * that computes the appropriate projection matrix.
 * 
 * usage examples:
 *   demos/beauty_of_roots
 * 
 */

Facet.UI.center_zoom_interactor = function(opts)
{
    opts = _.defaults(opts, {
        mousemove: function() {},
        mousedown: function() {},
        mousewheel: function() {},
        center: vec.make([0,0]),
        zoom: 1
    });

    var height = opts.height;
    var width = opts.width;
    var center = Shade.parameter("vec2", opts.center);
    var zoom = Shade.parameter("float", opts.zoom);
    var prev_mouse_pos;

    function mousedown(event) {
        prev_mouse_pos = [event.offsetX, event.offsetY];
        opts.mousedown(event);
    }

    function mousemove(event) {
        if ((event.which & 1) && !event.shiftKey) {
            var deltaX =  (event.offsetX - prev_mouse_pos[0]) / (height * zoom.get() / 2);
            var deltaY = -(event.offsetY - prev_mouse_pos[1]) / (height * zoom.get() / 2);
            var delta = vec.make([deltaX, deltaY]);
            center.set(vec.minus(center.get(), delta));
        } else if ((event.which & 1) && event.shiftKey) {
            zoom.set(zoom.get() * (1.0 + (event.offsetY - prev_mouse_pos[1]) / 240));
        }
        prev_mouse_pos = [ event.offsetX, event.offsetY ];
        opts.mousemove(event);
        Facet.Scene.invalidate();
    }

    function mousewheel(event, delta, deltaX, deltaY) {
        zoom.set(zoom.get() * (1.0 - deltaY / 15));
        opts.mousewheel(event, delta, deltaX, deltaY);
        Facet.Scene.invalidate();
    }

    var aspect_ratio = Shade.parameter("float", width/height);
    var camera = Shade.Camera.ortho({
        center: center,
        zoom: zoom,
        aspect_ratio: aspect_ratio
    });

    return {
        camera: camera,
        center: center,
        zoom: zoom,

        resize: function(w, h) {
            aspect_ratio.set(w/h);
            width = w;
            height = h;
            Facet.Scene.invalidate();
        },

        events: {
            mousedown: mousedown,
            mousemove: mousemove,
            mousewheel: mousewheel
        }
    };
}
/*
 * Shade is the javascript DSL for writing GLSL shaders, part of Facet.
 * 
 */

// FIXME: fix the constant-index-expression hack I've been using to get around
// restrictions. This will eventually be plugged by webgl implementors.

// FIXME: Move this object inside Facet's main object.

var Shade = function(exp)
{
    return Shade.make(exp);
};

(function() {

Shade.debug = false;
//////////////////////////////////////////////////////////////////////////////
// make converts objects which can be meaningfully interpreted as
// Exp values to the appropriate Exp values, giving us some poor-man
// static polymorphism

Shade.make = function(exp)
{
    if (_.isUndefined(exp)) {
        throw "expected a value, got undefined instead";
    }
    var t = facet_typeOf(exp);
    if (t === 'string') {
        // Did you accidentally say exp1 + exp2 when you meant
        // exp1.add(exp2)?
        throw "strings are not valid shade expressions";
    } else if (t === 'boolean' || t === 'number') {
        if (isNaN(exp)) {
            // Did you accidentally say exp1 / exp2 or exp1 - exp2 when you meant
            // exp1.div(exp2) or exp1.sub(exp2)?
            throw "nans are not valid in shade expressions";
        }
        return Shade.constant(exp);
    } else if (t === 'array') {
        return Shade.seq(exp);
    } else if (t === 'function') {
        /* lifts the passed function to a "shade function".
        
        In other words, this creates a function that replaces every
        passed parameter p by Shade.make(p) This way, we save a lot of
        typing and errors. If a javascript function is expected to
        take shade values and produce shade expressions as a result,
        simply wrap that function around a call to Shade.make()

         */

        return function() {
            var wrapped_arguments = [];
            for (var i=0; i<arguments.length; ++i) {
                wrapped_arguments.push(Shade.make(arguments[i]));
            }
            return Shade.make(exp.apply(this, wrapped_arguments));
        };
    }
    t = facet_constant_type(exp);
    if (t === 'vector' || t === 'matrix') {
        return Shade.constant(exp);
    } else if (exp._shade_type === 'attribute_buffer') {
        return Shade.attribute_from_buffer(exp);
    } else if (exp._shade_type === 'render_buffer') {
        return Shade.sampler2D_from_texture(exp.texture);
    } else if (exp._shade_type === 'texture') {
        return Shade.sampler2D_from_texture(exp);
    } else if (t === 'other') {
        return Shade.struct(exp);
    }

    return exp;
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
            value: function() { throw "<unknown> should never get to compilation"; }
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
        var ctx = Facet._globals.ctx;
        if (_.isUndefined(ctx)) {
            throw "aspect_ratio is only optional with an active Facet context";
        }
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
Shade.Camera.ortho = function(opts)
{
    opts = _.defaults(opts || {}, {
        left: -1,
        right: 1,
        bottom: -1,
        top: 1,
        near: -1,
        far: 1
    });

    var viewport_ratio;

    if (opts.aspect_ratio)
        viewport_ratio = opts.aspect_ratio;
    else {
        var ctx = Facet._globals.ctx;
        if (_.isUndefined(ctx)) {
            throw "aspect_ratio is only optional with an active Facet context";
        }
        viewport_ratio = ctx.viewportWidth / ctx.viewportHeight;
    };

    var left, right, bottom, top;
    var near = opts.near;
    var far = opts.far;

    if (!_.isUndefined(opts.center) && !_.isUndefined(opts.zoom)) {
        var viewport_width = Shade.div(1, opts.zoom);
        left   = opts.center.at(0).sub(viewport_width);
        right  = opts.center.at(0).add(viewport_width);
        bottom = opts.center.at(1).sub(viewport_width);
        top    = opts.center.at(1).add(viewport_width);
    } else {
        left = opts.left;
        right = opts.right;
        bottom = opts.bottom;
        top = opts.top;
    }

    function letterbox_projection() {
        var cy = Shade.add(top, bottom).div(2);
        var half_width = Shade.sub(right, left).div(2);
        var half_height = half_width.div(viewport_ratio);
        var l = left;
        var r = right;
        var t = cy.add(half_height);
        var b = cy.sub(half_height);
        return Shade.ortho(l, r, b, t, near, far);
    }

    function pillarbox_projection() {
        var cx = Shade.add(right, left).div(2);
        var half_height = Shade.sub(top, bottom).div(2);
        var half_width = half_height.mul(viewport_ratio);
        var l = cx.sub(half_width);
        var r = cx.add(half_width);
        var t = top;
        var b = bottom;
        return Shade.ortho(l, r, b, t, near, far);
    }

    var view_ratio = Shade.sub(right, left).div(Shade.sub(top, bottom));
    
    var m = view_ratio.gt(viewport_ratio)
        .ifelse(letterbox_projection(),
                pillarbox_projection());

    function result(obj) {
        return result.project(obj);
    }
    result.project = function(model_vertex) {
        return m.mul(model_vertex);
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
            throw "hex specifier must be either #rgb or #rrggbb";
    }
    var m = rgb_re.exec(spec);
    if (m) {
        return Shade.vec(parseInt(m[1], 10) / 255,
                         parseInt(m[2], 10) / 255,
                         parseInt(m[3], 10) / 255, alpha);
    }
    if (spec in css_colors)
        return Shade.color(css_colors[spec], alpha);
    throw "unrecognized color specifier " + spec;
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

 In general, looping in general is pretty unstable.
*/

(function() {

Shade.loop_variable = function(type, force_no_declare)
{
    return Shade._create_concrete_exp({
        parents: [],
        type: type,
        expression_type: "loop_variable",
        evaluate: function() {
            return this.glsl_name;
        },
        compile: function() {
            if (_.isUndefined(force_no_declare))
                this.scope.add_declaration(type.declare(this.glsl_name));
        },
        loop_variable_dependencies: Shade.memoize_on_field("_loop_variable_dependencies", function () {
            return [this];
        })
    });
};

function BasicRange(range_begin, range_end, value)
{
    this.begin = Shade.make(range_begin).as_int();
    this.end = Shade.make(range_end).as_int();
    this.value = value || function(index) { return index; };
};

Shade.range = function(range_begin, range_end, value)
{
    return new BasicRange(range_begin, range_end, value);
};

BasicRange.prototype.transform = function(xform)
{
    var that = this;
    return Shade.range(
        this.begin,
        this.end, 
        function (i) {
            var input = that.value(i);
            var result = xform(input);
            return result;
        });
};

BasicRange.prototype.fold = Shade(function(operation, starting_value)
{
    var index_variable = Shade.loop_variable(Shade.Types.int_t, true);
    var accumulator_value = Shade.loop_variable(starting_value.type, true);

    var element_value = this.value(index_variable);
    var result_type = accumulator_value.type;
    var operation_value = operation(accumulator_value, element_value);

    var result = Shade._create_concrete_exp({
        has_scope: true,
        patch_scope: function() {
            var index_variable = this.parents[2];
            var accumulator_value = this.parents[3];
            var element_value = this.parents[4];
            var that = this;

            _.each(element_value.sorted_sub_expressions(), function(node) {
                if (_.any(node.loop_variable_dependencies(), function(dep) {
                    return dep.glsl_name === index_variable.glsl_name ||
                        dep.glsl_name === accumulator_value.glsl_name;
                })) {
                    node.scope = that.scope;
                };
            });
        },
        parents: [this.begin, this.end, 
                  index_variable, accumulator_value, element_value,
                  starting_value, operation_value],
        type: result_type,
        element: Shade.memoize_on_field("_element", function(i) {
            if (this.type.is_pod()) {
                if (i === 0)
                    return this;
                else
                    throw this.type.repr() + " is an atomic type";
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

            ctx.strings.push(this.type.repr(), this.glsl_name, "() {\n");
            ctx.strings.push("    ",accumulator_value.type.repr(), accumulator_value.glsl_name, "=", starting_value.evaluate(), ";\n");

            ctx.strings.push("    for (int",
                             index_variable.evaluate(),"=",beg.evaluate(),";",
                             index_variable.evaluate(),"<",end.evaluate(),";",
                             "++",index_variable.evaluate(),") {\n");
            _.each(this.scope.declarations, function(exp) {
                ctx.strings.push("        ", exp, ";\n");
            });
            _.each(this.scope.initializations, function(exp) {
                ctx.strings.push("        ", exp, ";\n");
            });
            ctx.strings.push("        ",
                             accumulator_value.evaluate(),"=",
                             operation_value.evaluate() + ";\n");
            ctx.strings.push("    }\n");
            ctx.strings.push("    return", 
                             this.type.repr(), "(", accumulator_value.evaluate(), ");\n");
            ctx.strings.push("}\n");
        }
    });

    return result;
});

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
    var s = this.sum();
    if (s.type.equals(Shade.Types.int_t)) {
        s = s.as_float();
    }
    return s.div(this.end.sub(this.begin).as_float());
};

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
                throw "new expression missing " + requirements[i];
            }
            if (_.isUndefined(new_obj[field])) {
                throw "field '" + field + "' cannot be undefined";
            }
        }
        return Shade._create(base, new_obj);
    }
    return create_it;
};
Shade.Types = {};
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
        throw "is_vec() === false, cannot call vec_dimension";
    },
    is_function: function() { return false; },
    is_struct:   function() { return false; },
    is_sampler:  function() { return false; },
    equals: function(other) {
        if (_.isUndefined(other))
            throw "type cannot be compared to undefined";
        return this.repr() == other.repr();
    },
    swizzle: function(pattern) {
        throw "type '" + this.repr() + "' does not support swizzling";
    },
    element_type: function(i) {
        throw "invalid call: atomic expression";
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

    // constant_equal
    //   constant_equal is a function that takes two parameters as produced
    //   by the constant_value() method of an object with the given type,
    //   and tests their equality.
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
        throw "invalid basic type '" + repr + "'";
    }
    return Shade.Types[repr];
};

Shade.Types._create_basic = function(repr) { 
    return Shade._create(Shade.Types.base_t, {
        declare: function(glsl_name) { return repr + " " + glsl_name; },
        repr: function() { return repr; },
        swizzle: function(pattern) {
            if (!this.is_vec()) {
                throw "swizzle requires a vec";
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
                valid_re = /[rgbazxyzwstpq]+/;
                group_res = [ /[rgba]/, /[xyzw]/, /[stpq]/ ];
                break;
            default:
                throw "internal error on swizzle";
            }
            if (!pattern.match(valid_re)) {
                throw "invalid swizzle pattern '" + pattern + "'";
            }
            var count = 0;
            for (var i=0; i<group_res.length; ++i) {
                if (pattern.match(group_res[i])) count += 1;
            }
            if (count != 1) {
                throw ("swizzle pattern '" + pattern + 
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
                throw "is_vec() === false, cannot call vec_dimension";
            }
            throw "internal error";
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
            throw "datatype not array";
        },
        size_for_vec_constructor: function() {
            var repr = this.repr();
            if (this.is_array())
                return this.array_size();
            if (repr === 'float' ||
                repr === 'bool' ||
                repr === 'int')
                return 1;
            throw "not usable inside vec constructor";
        },
        array_size: function() {
            if (this.is_vec())
                return this.vec_dimension();
            var repr = this.repr();
            if (repr.substring(0, 3) === "mat")  
                return parseInt(repr[3], 10);
            throw "datatype not array";
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
                    throw "invalid call: " + this.repr() + " is atomic";
            } else if (this.is_vec()) {
                var f = this.repr()[0];
                var d = this.array_size();
                if (i < 0 || i >= d) {
                    throw "invalid call: " + this.repr() + 
                        " has no element " + i;
                }
                if (f === 'v')
                    return Shade.Types.float_t;
                else if (f === 'b')
                    return Shade.Types.bool_t;
                else if (f === 'i')
                    return Shade.Types.int_t;
                else
                    throw "internal error";
            } else
                // FIXME implement this
                throw "unimplemented for mats";
        },
        constant_equal: function(v1, v2) {
            if (this.is_pod())
                return v1 === v2;
            if (this.is_vec() || this.is_mat())
                return _.all(_.range(v1.length), function(i) { return v1[i] === v2[i]; });
            else
                throw "bad type for equality comparison: " + this.repr();
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
})();
(function () {

var _structs = {};

function _register_struct(type) {
    var t = type._struct_key;
    var v = _structs[t];
    if (v !== undefined) {
        throw "type " + t + " already registered as " + v.internal_type_name;
    }
    _structs[t] = type;
};

var struct_key = function(obj) {
    return _.map(obj, function(value, key) {
        if (value.is_function()) {
            throw "function types not allowed inside struct";
        }
        if (value.is_sampler()) {
            throw "function types not allowed inside struct";
        }
        if (value.is_struct()) {
            return "[" + key + ":" + value.internal_type_name + "]";
        }
        return "[" + key + ":" + value.repr() + "]";
    }).join("");
};

Shade.Types.struct = function(fields) {
    var key = struct_key(fields);
    var t = _structs[key];
    if (t) return t;

    var result = Shade._create(Shade.Types.struct_t, {
        fields: fields,
        _struct_key: key
    });
    result.internal_type_name = 'type_' + result.guid;
    _register_struct(result);
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
                throw "must define type";
            }
            if (!(glsl_name in declmap)) {
                declmap[glsl_name] = type;
                this.strings.push(decltype + " " + type.declare(glsl_name) + ";\n");
            } else {
                var existing_type = declmap[glsl_name];
                if (!existing_type.equals(type)) {
                    throw ("compile error: different expressions use "
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
                    throw "internal error; declare_struct found undeclared internal struct";
                }
            });
            this.strings.push("struct", type.internal_type_name, "{\n");
            _.each(type.fields, function(v, k) {
                that.strings.push("    ",v.declare(k), ";\n");
            });
            this.strings.push("};\n");
            this.declared_struct_types[type.internal_type_name] = true;
        },
        compile: function(fun) {
            var that = this;

            this.global_scope = {
                initializations: [],
                add_declaration: function(exp) {
                    that.strings.push(exp, ";\n");
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
            this.strings.push("precision",this.float_precision,"float;\n");
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
            this.strings.push("void main() {\n");
            _.each(this.global_scope.initializations, function(exp) {
                that.strings.push("    ", exp, ";\n");
            });
            this.strings.push("    ", fun.evaluate(), ";\n", "}\n");
            // for (i=0; i<this.initialization_exprs.length; ++i)
            //     this.strings.push("    ", this.initialization_exprs[i], ";\n");
            // this.strings.push("    ", fun.evaluate(), ";\n", "}\n");
        },
        add_initialization: function(expr) {
            this.global_scope.initializations.push(expr);
        },
        value_function: function() {
            this.strings.push(arguments[0].type.repr(),
                              arguments[0].glsl_name,
                              "(");
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
            var s = l.join("\n");
            console.log(s);
        };
        do_what(lst);
    },
    evaluate: function() {
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
            // for (var i=0; i<l; ++i) {
            // }
            so_far.push(exp);
            visited_guids[guid] = true;
        };
        topological_sort_internal(this);
        return so_far;
    }),

    //////////////////////////////////////////////////////////////////////////
    // constant checking, will be useful for folding and for enforcement

    is_constant: function() {
        return false;
    },
    constant_value: function() {
        throw "invalid call: this.is_constant() == false";
    },
    element_is_constant: function(i) {
        return false;
    },
    element_constant_value: function(i) {
        throw "invalid call: no constant elements";
    },

    //////////////////////////////////////////////////////////////////////////
    // element access for compound expressions

    element: function(i) {
        // FIXME. Why doesn't this check for is_pod and use this.at()?
        throw "invalid call: atomic expression";  
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
            value: function() { return "int(" + this.parents[0].evaluate() + ")"; },
            is_constant: function() { return parent.is_constant(); },
            constant_value: function() {
                var v = parent.constant_value();
                return Math.floor(v);
            },
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
            value: function() { return "bool(" + this.parents[0].evaluate() + ")"; },
            is_constant: function() { return parent.is_constant(); },
            constant_value: function() {
                var v = parent.constant_value();
                return ~~v;
            },
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
            value: function() { return "float(" + this.parents[0].evaluate() + ")"; },
            is_constant: function() { return parent.is_constant(); },
            constant_value: function() {
                var v = parent.constant_value();
                return Number(v);
            },
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
                default: throw "invalid swizzle pattern";
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
            evaluate: function() {
                if (this._must_be_function_call)
                    return this.glsl_name + "()";
                else
                    return this.parents[0].evaluate() + "." + pattern; 
            },
            is_constant: Shade.memoize_on_field("_is_constant", function () {
                var that = this;
                return _.all(indices, function(i) {
                    return that.parents[0].element_is_constant(i);
                });
            }),
            constant_value: Shade.memoize_on_field("_constant_value", function() {
                if (this.type.is_pod()) {
                    return this.parents[0].element_constant_value(indices[0]);
                } else {
                    var that = this;
                    var ar = _.map(indices, function(index) {
                        return that.parents[0].element_constant_value(index);
                    });
                    var d = this.type.vec_dimension();
                    switch (d) {
                    case 2: return vec2.make(ar);
                    case 3: return vec3.make(ar);
                    case 4: return vec4.make(ar);
                    default:
                        throw "bad vec dimension " + d;
                    }
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
                                           this.parents[0].evaluate() + "." + pattern);
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
            throw "at expects int or float, got '" + 
                index.type.repr() + "' instead";
        }
        return Shade._create_concrete_exp( {
            parents: [parent, index],
            type: parent.type.array_base(),
            expression_type: "index",
            evaluate: function() {
                if (this.parents[1].type.is_integral()) {
                    return this.parents[0].evaluate() + 
                        "[" + this.parents[1].evaluate() + "]"; 
                } else {
                    return this.parents[0].evaluate() + 
                        "[int(" + this.parents[1].evaluate() + ")]"; 
                }
            },
            is_constant: function() {
                if (!this.parents[1].is_constant())
                    return false;
                var ix = Math.floor(this.parents[1].constant_value());
                return (this.parents[1].is_constant() &&
                        this.parents[0].element_is_constant(ix));
            },
            constant_value: Shade.memoize_on_field("_constant_value", function() {
                var ix = Math.floor(this.parents[1].constant_value());
                return this.parents[0].element_constant_value(ix);
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
                    throw "internal error: would have gone into an infinite loop here.";
                }
                return x.element_constant_value(i);
            }),
            compile: function() {}
        });
    },
    _facet_expression: true, // used by facet_typeOf
    expression_type: "other",
    _type: "shade_expression",
    _attribute_buffers: [],
    _uniforms: [],

    //////////////////////////////////////////////////////////////////////////

    attribute_buffers: function() {
        return _.flatten(this.sorted_sub_expressions().map(function(v) { 
            return v._attribute_buffers; 
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
 * conditional expression if they're is used in two or more places in
 * the shader.
 
   Currently this will not be a big issue, but when I have loops, I
   won't want a loop to be evaluated unconditionally.
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
    evaluate: function() {
        var unconditional = true; // see comment on top
        if (this._must_be_function_call) {
            return this.glsl_name + "(" + ")";
        }
        if (this.children_count <= 1)
            return this.value();
        if (unconditional)
            return this.precomputed_value_glsl_name;
        else
            return this.glsl_name + "()";
    },
    element: function(i) {
        if (this.type.is_pod()) {
            if (i === 0)
                return this;
            else
                throw this.type.repr() + " is an atomic type, got this: " + i;
        } else {
            this.debug_print();
            throw "Internal error; this should have been overriden.";
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
                    // don't emit anything, all is taken care by evaluate()
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
                    // don't emit anything, all is taken care by evaluate()
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
// - a GLSL matrix of dimensions 2x2, 3x3, 4x4 (Facet currently does not support GLSL rectangular matrices):
//    Shade.constant(2, mat.make([1, 0, 0, 1]));

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
                if (facet_typeOf(arg) === "number" && v.indexOf(".") === -1) {
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
            evaluate: function(glsl_name) {
                return to_glsl(this.type.repr(), args);
            },
            expression_type: "constant{" + args + "}",
            is_constant: function() { return true; },
            element: Shade.memoize_on_field("_element", function(i) {
                if (this.type.is_pod()) {
                    if (i === 0)
                        return this;
                    else
                        throw this.type.repr() + " is an atomic type, got this: " + i;
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
                        throw "float is an atomic type";
                } if (this.type.is_vec()) {
                    return args[i];
                }
                return vec[this.type.array_size()].make(matrix_row(i));
            }),
            constant_value: Shade.memoize_on_field("_constant_value", function() {
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
                    throw "internal error: constant of unknown type";
            }),
            compile: function(ctx) {},
            parents: [],
            type: type
        });
    };

    var t = facet_constant_type(v);
    var d, computed_t;
    if (t === 'number') {
        if (type && !(type.equals(Shade.Types.float_t) ||
                      type.equals(Shade.Types.int_t))) {
            throw ("expected specified type for numbers to be float or int," +
                   " got " + type.repr() + " instead.");
        }
        return constant_tuple_fun(type || Shade.Types.float_t, [v]);
    } else if (t === 'boolean') {
        if (type && !type.equals(Shade.Types.bool_t))
            throw ("boolean constants cannot be interpreted as " + 
                   type.repr());
        return constant_tuple_fun(Shade.Types.bool_t, [v]);
    } else if (t === 'vector') {
        d = v.length;
        if (d < 2 && d > 4)
            throw "invalid length for constant vector: " + v;
        var el_ts = _.map(v, function(t) { return facet_typeOf(t); });
        if (!_.all(el_ts, function(t) { return t === el_ts[0]; })) {
            throw "not all constant params have the same types";
        }
        if (el_ts[0] === "number") {
            computed_t = Shade.Types['vec' + d];
            if (type && !computed_t.equals(type)) {
                throw "passed constant must have type " + computed_t.repr()
                    + ", but was request to have incompatible type " 
                    + type.repr();
            }
            return constant_tuple_fun(computed_t, v);
        }
        else
            throw "bad datatype for constant: " + el_ts[0];
    } else if (t === 'matrix') {
        d = mat_length_to_dimension[v.length];
        computed_t = Shade.Types['mat' + d];
        if (type && !computed_t.equals(type)) {
            throw "passed constant must have type " + computed_t.repr()
                + ", but was request to have incompatible type " 
                + type.repr();
        }
        return constant_tuple_fun(computed_t, v);
    } else {
        throw "type error: constant should be bool, number, vector, matrix or array. got " + t
            + " instead";
    }
    throw "internal error: facet_constant_type returned bogus value";
};

Shade.as_int = function(v) { return Shade.make(v).as_int(); };
Shade.as_bool = function(v) { return Shade.make(v).as_bool(); };
Shade.as_float = function(v) { return Shade.make(v).as_float(); };

// Shade.array denotes an array of Facet values of the same type:
//    Shade.array([2, 3, 4, 5, 6]);

Shade.array = function(v)
{
    var t = facet_typeOf(v);
    if (t === 'array') {
        var new_v = v.map(Shade.make);
        var array_size = new_v.length;
        if (array_size === 0) {
            throw "array constant must be non-empty";
        }

        var new_types = new_v.map(function(t) { return t.type; });
        var array_type = Shade.Types.array(new_types[0], array_size);
        if (_.any(new_types, function(t) { return !t.equals(new_types[0]); })) {
            throw "array elements must have identical types";
        }
        return Shade._create_concrete_exp( {
            parents: new_v,
            type: array_type,
            expression_type: "constant",
            evaluate: function() { return this.glsl_name; },
            compile: function (ctx) {
                this.array_initializer_glsl_name = ctx.request_fresh_glsl_name();
                ctx.strings.push(this.type.declare(this.glsl_name), ";\n");
                ctx.strings.push("void", this.array_initializer_glsl_name, "(void) {\n");
                for (var i=0; i<this.parents.length; ++i) {
                    ctx.strings.push("    ", this.glsl_name, "[", i, "] =",
                                     this.parents[i].evaluate(), ";\n");
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
            }
        });
    } else {
        throw "type error: need array";
    }
};
// Shade.struct denotes a heterogeneous structure of Facet values:
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
    var struct_type = Shade.Types.struct(t);
    
    var result = Shade._create_concrete_value_exp({
        parents: vs,
        fields: ks,
        type: struct_type,
        expression_type: "struct",
        value: function() {
            return [this.type.internal_type_name, "(",
                    this.parents.map(function(t) {
                        return t.evaluate();
                    }).join(", "),
                    ")"].join(" ");
        },
        constant_value: Shade.memoize_on_field("_constant_value", function() {
            var result = {};
            var that = this;
            _.each(this.parents, function(v, i) {
                result[that.fields[i]] = v.constant_value();
            });
            return result;
        }),
        field: function(field_name) {
            var index = this.fields.indexOf(field_name);
            if (index === -1) {
                throw "field " + field_name + " not existent";
            };

            /* Since field_name is always an immediate string, 
             it will never need to be "computed" on a shader.            
             This means its value can always be resolved in compile time and 
             val(constructor(foo=bar).foo) is always val(bar).

             Of course, if the above is true, then it means that most of the time
             we should not need to see a GLSL struct in a Facet shader, and so
             Shade structs appear to be mostly unnecessary.

             But there is one specific case in which it helps, namely in ensuring
             that assignment of structs values in looping variables is atomic.
            }); */

            /*

            return Shade._create_concrete_value_exp({
                parents: [this],
                type: this.parents[index].type,
                expression_type: "struct-accessor",
                value: function() {
                    return "(" + this.parents[0].evaluate() + "." + field_name + ")";
                },
                constant_value: Shade.memoize_on_field("_constant_value", function() {
                    return this.parents[0].parents[index].constant_value();
                }),
                is_constant: Shade.memoize_on_field("_is_constant", function() {
                    return this.parents[0].parents[index].is_constant();
                })
             
             */
            return this.parents[index];
        },
        call_operator: function(v) {
            return this.field(v);
        }
    });

    _.each(ks, function(k) {
        // I can't use _.has because result is actually a javascript function..
        if (!_.isUndefined(result[k])) {
            console.log("Warning: Field",k,"is reserved. JS struct notation (a.b) will not be usable");
        } else
            result[k] = result.field(k);
    });
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
                throw ("gl_FragColor and gl_FragData assignment"
                       + " only allowed on fragment shaders");
            }
            if ((name === "gl_Position" ||
                 name === "gl_PointSize") &&
                ctx.compile_type !== Shade.VERTEX_PROGRAM_COMPILE) {
                throw ("gl_Position and gl_PointSize assignment "
                       + "only allowed on vertex shaders");
            }
            if ((ctx.compile_type !== Shade.VERTEX_PROGRAM_COMPILE) &&
                (name !== "gl_FragColor") &&
                (name.substring(0, 11) !== "gl_FragData")) {
                throw ("the only allowed output variables on a fragment"
                       + " shader are gl_FragColor and gl_FragData[]");
            }
            if (name !== "gl_FragColor" &&
                name !== "gl_Position" &&
                name !== "gl_PointSize" &&
                name.substring(0, 11) !== "gl_FragData") {
                ctx.declare_varying(name, type);
            }
            ctx.void_function(this, "(", name, "=", this.parents[0].evaluate(), ")");
        },
        type: Shade.Types.void_t,
        parents: [exp]
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
    if (_.isUndefined(type)) throw "parameter requires type";
    if (typeof type === 'string') type = Shade.Types[type]; // basic(type);
    if (_.isUndefined(type)) throw "parameter requires valid type";
    var value;
    var call = _.detect(call_lookup, function(p) { return type.equals(p[0]); });
    if (!_.isUndefined(call)) {
        call = call[1];
    } else {
        throw "Unsupported type " + type.repr() + " for parameter.";
    }
    var result = Shade._create_concrete_exp({
        parents: [],
        type: type,
        expression_type: 'parameter',
        evaluate: function() {
            if (this._must_be_function_call) {
                return this.glsl_name + "()";
            } else
                return uniform_name; 
        },
        element: Shade.memoize_on_field("_element", function(i) {
            if (this.type.is_pod()) {
                if (i === 0)
                    return this;
                else
                    throw this.type.repr() + " is an atomic type";
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
            // then again, facet_constant_type is unlikely to be particularly fast.
            // FIXME check performance
            var t = facet_constant_type(v);
            if (t === "shade_expression")
                v = v.constant_value();
            value = v;
            if (this._facet_active_uniform) {
                this._facet_active_uniform(v);
            }
        },
        get: function(v) {
            return value;
        },
        uniform_call: call,
        uniform_name: uniform_name
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
        var itemName;
        if (_.isUndefined(buffer._shade_name)) {
            itemName = Shade.unique_name();
            buffer._shade_name = itemName;
        } else {
            itemName = buffer._shade_name;
        }
        var result = Shade.attribute(itemName, itemType);
        result._attribute_buffers = [buffer];
        buffer._shade_expression = result;
        return result;
    }();
};

Shade.attribute = function(name, type)
{
    if (_.isUndefined(type)) throw "attribute requires type";
    if (typeof type === 'string') type = Shade.Types[type];
    if (_.isUndefined(type)) throw "attribute requires valid type";

    return Shade._create_concrete_exp( {
        parents: [],
        type: type,
        expression_type: 'attribute',
        element: Shade.memoize_on_field("_element", function(i) {
            if (this.type.equals(Shade.Types.float_t)) {
                if (i === 0)
                    return this;
                else
                    throw "float is an atomic type";
            } else
                return this.at(i);
        }),
        evaluate: function() { 
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
        }
    });
};
Shade.varying = function(name, type)
{
    if (_.isUndefined(type)) throw "varying requires type";
    if (facet_typeOf(type) === 'string') type = Shade.Types[type];
    if (_.isUndefined(type)) throw "varying requires valid type";
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
        throw "varying does not support type '" + type.repr() + "'";
    }
    return Shade._create_concrete_exp( {
        parents: [],
        type: type,
        expression_type: 'varying',
        element: Shade.memoize_on_field("_element", function(i) {
            if (this.type.is_pod()) {
                if (i === 0)
                    return this;
                else
                    throw this.type.repr() + " is an atomic type";
            } else
                return this.at(i);
        }),
        evaluate: function() { return name; },
        compile: function(ctx) {
            ctx.declare_varying(name, this.type);
        }
    });
};

Shade.fragCoord = function() {
    return Shade._create_concrete_exp({
        expression_type: "builtin_input{gl_FragCoord}",
        parents: [],
        type: Shade.Types.vec4,
        evaluate: function() { return "gl_FragCoord"; },
        compile: function(ctx) {
        }
    });
};
Shade.pointCoord = function() {
    return Shade._create_concrete_exp({
        expression_type: "builtin_input{gl_PointCoord}",
        parents: [],
        type: Shade.Types.vec2,
        evaluate: function() { return "gl_PointCoord"; },
        compile: function(ctx) {
        }
    });
};
Shade.round_dot = function(color) {
    var outside_dot = Shade.pointCoord().sub(Shade.vec(0.5, 0.5)).norm().gt(0.25);
    return Shade.make(color).discard_if(outside_dot);
};
(function() {

var operator = function(exp1, exp2, 
                        operator_name, type_resolver,
                        constant_evaluator,
                        element_evaluator)
{
    var resulting_type = type_resolver(exp1.type, exp2.type);
    return Shade._create_concrete_value_exp( {
        parents: [exp1, exp2],
        type: resulting_type,
        expression_type: "operator" + operator_name,
        value: function () {
            return "(" + this.parents[0].evaluate() + " " + operator_name + " " +
                this.parents[1].evaluate() + ")";
        },
        constant_value: Shade.memoize_on_field("_constant_value", function() {
            return constant_evaluator(this);
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
    if (arguments.length === 0) throw "add needs at least one argument";
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
        throw ("type mismatch on add: unexpected types  '"
                   + t1.repr() + "' and '" + t2.repr() + "'.");
    }
    var current_result = Shade.make(arguments[0]);
    function evaluator(exp) {
        var exp1 = exp.parents[0], exp2 = exp.parents[1];
        var vt;
        if (exp1.type.is_vec())
            vt = vec[exp1.type.vec_dimension()];
        else if (exp2.type.is_vec())
            vt = vec[exp2.type.vec_dimension()];
        var v1 = exp1.constant_value(), v2 = exp2.constant_value();
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
        return vt.plus(v1, v2);
    }
    function element_evaluator(exp, i) {
        var e1 = exp.parents[0], e2 = exp.parents[1];
        var v1, v2;
        var t1 = e1.type, t2 = e2.type;
        if (t1.is_pod() && t2.is_pod()) {
            if (i === 0)
                return exp;
            else
                throw "i > 0 in pod element";
        }
        if (e1.type.is_vec() || e1.type.is_mat())
            v1 = e1.element(i);
        else
            v1 = e1;
        if (e2.type.is_vec() || e2.type.is_vec())
            v2 = e2.element(i);
        else
            v2 = e2;
        return operator(v1, v2, "+", add_type_resolver, evaluator, element_evaluator);
    }
    for (var i=1; i<arguments.length; ++i) {
        current_result = operator(current_result, Shade.make(arguments[i]),
                                  "+", add_type_resolver, evaluator,
                                  element_evaluator);
    }
    return current_result;
};

Shade.sub = function() {
    if (arguments.length === 0) throw "sub needs at least two arguments";
    if (arguments.length === 1) throw "unary minus unimplemented";
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
        throw ("type mismatch on sub: unexpected types  '"
                   + t1.repr() + "' and '" + t2.repr() + "'.");
    }
    function evaluator(exp) {
        var exp1 = exp.parents[0], exp2 = exp.parents[1];
        var vt;
        if (exp1.type.is_vec())
            vt = vec[exp1.type.vec_dimension()];
        else if (exp2.type.is_vec())
            vt = vec[exp2.type.vec_dimension()];
        var v1 = exp1.constant_value(), v2 = exp2.constant_value();
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
                throw "i > 0 in pod element";
        }
        if (e1.type.is_vec() || e1.type.is_mat())
            v1 = e1.element(i);
        else
            v1 = e1;
        if (e2.type.is_vec() || e2.type.is_vec())
            v2 = e2.element(i);
        else
            v2 = e2;
        return operator(v1, v2, "-", sub_type_resolver, evaluator, element_evaluator);
    }
    var current_result = Shade.make(arguments[0]);
    for (var i=1; i<arguments.length; ++i) {
        current_result = operator(current_result, Shade.make(arguments[i]),
                                  "-", sub_type_resolver, evaluator,
                                  element_evaluator);
    }
    return current_result;
};

Shade.div = function() {
    if (arguments.length === 0) throw "div needs at least two arguments";
    function div_type_resolver(t1, t2) {
        if (_.isUndefined(t1))
            throw "internal error: t1 multiplication with undefined type";
        if (_.isUndefined(t2))
            throw "internal error: t2 multiplication with undefined type";
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
            [Shade.Types.float_t, Shade.Types.mat2, Shade.Types.mat2]
        ];
        for (var i=0; i<type_list.length; ++i)
            if (t1.equals(type_list[i][0]) &&
                t2.equals(type_list[i][1]))
                return type_list[i][2];
        throw ("type mismatch on div: unexpected types '"
                   + t1.repr() + "' and '" + t2.repr() + "'");
    }
    function evaluator(exp) {
        var exp1 = exp.parents[0];
        var exp2 = exp.parents[1];
        var v1 = exp1.constant_value();
        var v2 = exp2.constant_value();
        var vt, mt;
        if (exp1.type.is_array()) {
            vt = vec[exp1.type.array_size()];
            mt = mat[exp1.type.array_size()];
        } else if (exp2.type.is_array()) {
            vt = vec[exp2.type.array_size()];
            mt = mat[exp2.type.array_size()];
        }
        var t1 = facet_constant_type(v1), t2 = facet_constant_type(v2);
        var dispatch = {
            number: { number: function (x, y) { return x / y; },
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
                          throw "internal error, can't evaluate vector/matrix";
                      }
                    },
            matrix: { number: function (x, y) { return mt.scaling(x, 1/y); },
                      vector: function (x, y) { 
                          throw "internal error, can't evaluate matrix/vector";
                      },
                      matrix: function (x, y) { 
                          throw "internal error, can't evaluate matrix/matrix";
                      }
                    }
        };
        return dispatch[t1][t2](v1, v2);
    }
    function element_evaluator(exp, i) {
        var e1 = exp.parents[0], e2 = exp.parents[1];
        var v1, v2;
        var t1 = e1.type, t2 = e2.type;
        if (t1.is_pod() && t2.is_pod()) {
            if (i === 0)
                return exp;
            else
                throw "i > 0 in pod element";
        }
        if (e1.type.is_vec() || e1.type.is_mat())
            v1 = e1.element(i);
        else
            v1 = e1;
        if (e2.type.is_vec() || e2.type.is_vec())
            v2 = e2.element(i);
        else
            v2 = e2;
        return operator(v1, v2, "/", div_type_resolver, evaluator, element_evaluator);
    }
    var current_result = Shade.make(arguments[0]);
    for (var i=1; i<arguments.length; ++i) {
        current_result = operator(current_result, Shade.make(arguments[i]),
                                  "/", div_type_resolver, evaluator, element_evaluator);
    }
    return current_result;
};

Shade.mul = function() {
    if (arguments.length === 0) throw "mul needs at least one argument";
    if (arguments.length === 1) return arguments[0];
    function mul_type_resolver(t1, t2) {
        if (_.isUndefined(t1))
            throw "t1 multiplication with undefined type?";
        if (_.isUndefined(t2))
            throw "t2 multiplication with undefined type?";
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
        throw ("type mismatch on mul: unexpected types  '"
                   + t1.repr() + "' and '" + t2.repr() + "'.");
    }
    function evaluator(exp) {
        var exp1 = exp.parents[0];
        var exp2 = exp.parents[1];
        var v1 = exp1.constant_value();
        var v2 = exp2.constant_value();
        var vt, mt;
        if (exp1.type.is_array()) {
            vt = vec[exp1.type.array_size()];
            mt = mat[exp1.type.array_size()];
        } else if (exp2.type.is_array()) {
            vt = vec[exp2.type.array_size()];
            mt = mat[exp2.type.array_size()];
        }
        var t1 = facet_constant_type(v1), t2 = facet_constant_type(v2);
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
        return dispatch[t1][t2](v1, v2);
    }
    function element_evaluator(exp, i) {
        var e1 = exp.parents[0], e2 = exp.parents[1];
        var v1, v2;
        var t1 = e1.type, t2 = e2.type;
        if (t1.is_pod() && t2.is_pod()) {
            if (i === 0)
                return exp;
            else
                throw "i > 0 in pod element";
        }
        function value_kind(t) {
            if (t.is_pod())
                return "pod";
            if (t.is_vec())
                return "vec";
            if (t.is_mat())
                return "mat";
            throw "internal error: not pod, vec or mat";
        }
        var k1 = value_kind(t1), k2 = value_kind(t2);
        var dispatch = {
            "pod": { 
                "pod": function() { 
                    throw "internal error, pod pod"; 
                },
                "vec": function() { 
                    v1 = e1; v2 = e2.element(i); 
                    return operator(v1, v2, "*", mul_type_resolver, evaluator, element_evaluator);
                },
                "mat": function() { 
                    v1 = e1; v2 = e2.element(i); 
                    return operator(v1, v2, "*", mul_type_resolver, evaluator, element_evaluator);
                }
            },
            "vec": { 
                "pod": function() { 
                    v1 = e1.element(i); v2 = e2; 
                    return operator(v1, v2, "*", mul_type_resolver, evaluator, element_evaluator);
                },
                "vec": function() { 
                    v1 = e1.element(i); v2 = e2.element(i); 
                    return operator(v1, v2, "*", mul_type_resolver, evaluator, element_evaluator);
                },
                "mat": function() {
                    // FIXME should we have a mat_dimension?
                    return Shade.dot(e1, e2.element(i));
                }
            },
            "mat": { 
                "pod": function() { 
                    v1 = e1.element(i); v2 = e2;
                    return operator(v1, v2, "*", mul_type_resolver, evaluator, element_evaluator);
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
                        throw "bad dimension for mat " + d;
                    return Shade.dot(row, e2);
                    // var row = e1.element(i);
                    // return Shade.dot(row, e2);
                },
                "mat": function() {
                    var col = e2.element(i);
                    return operator(e1, col, "*", mul_type_resolver, evaluator, element_evaluator);
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
                                  "*", mul_type_resolver, evaluator, element_evaluator);
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
            throw "vec requires equal types";
        total_size += arg.type.size_for_vec_constructor();
    }
    parent_offsets.push(total_size);
    if (total_size < 1 || total_size > 4) {
        throw "vec constructor requires resulting width to be between "
            + "1 and 4, got " + total_size + " instead";
    }
    var type;
    if (vec_type.equals(Shade.Types.float_t)) {
        type = Shade.Types["vec" + total_size];
    } else if (vec_type.equals(Shade.Types.int_t)) {
        type = Shade.Types["ivec" + total_size];
    } else if (vec_type.equals(Shade.Types.bool_t)) {
        type = Shade.Types["bvec" + total_size];
    } else {
        throw "vec type must be bool, int, or float";
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
            throw "element " + old_i + " out of bounds (size=" 
                + total_size + ")";
        },
        element_is_constant: function(i) {
            var old_i = i;
            for (var j=0; j<this.parents.length; ++j) {
                var sz = this.parent_offsets[j+1] - this.parent_offsets[j];
                if (i < sz)
                    return this.parents[j].element_is_constant(i);
                i = i - sz;
            }
            throw "element " + old_i + " out of bounds (size=" 
                + total_size + ")";
        },
        element_constant_value: function(i) {
            var old_i = i;
            for (var j=0; j<this.parents.length; ++j) {
                var sz = this.parent_offsets[j+1] - this.parent_offsets[j];
                if (i < sz)
                    return this.parents[j].element_constant_value(i);
                i = i - sz;
            }
            throw "element " + old_i + " out of bounds (size=" 
                + total_size + ")";
        },
        constant_value: Shade.memoize_on_field("_constant_value", function () {
            var result = [];
            var parent_values = _.each(this.parents, function(v) {
                var c = v.constant_value();
                if (facet_typeOf(c) === 'number')
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
                    return t.evaluate();
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
        //     throw "mat only takes vecs as parameters";
        // }
        parents.push(arg);
        if (i === 0)
            cols = arg.type.size_for_vec_constructor();
        else if (cols !== arg.type.size_for_vec_constructor())
            throw "mat: all vecs must have same dimension";
    }

    if (cols !== rows) {
        throw "non-square matrices currently not supported";
    }

    if (rows < 1 || rows > 4) {
        throw "mat constructor requires resulting dimension to be between "
            + "2 and 4";
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
        constant_value: Shade.memoize_on_field("_constant_value", function() {
            var result = [];
            var ll = _.each(this.parents, function(v) {
                v = v.constant_value();
                for (var i=0; i<v.length; ++i) {
                    result.push(v[i]);
                }
            });
            return mat[this.type.array_size()].make(result);
        }),
        value: function() {
            return this.type.repr() + "(" +
                this.parents.map(function (t) { 
                    return t.evaluate(); 
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
        throw "need matrix to convert to mat3";
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
        evaluate: function() { return this.parents[0].evaluate(); },
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
    var type_resolving_list = opts.type_resolving_list;
    var constant_evaluator = opts.constant_evaluator;
    var element_evaluator = opts.element_evaluator;
    var element_constant_evaluator = opts.element_constant_evaluator;

    for (var i=0; i<type_resolving_list.length; ++i)
        for (var j=0; j<type_resolving_list[i].length; ++j) {
            var t = type_resolving_list[i][j];
            if (_.isUndefined(t))
                throw "undefined type in type_resolver";
        }

    // takes a list of lists of possible argument types, returns a function to 
    // resolve those types.
    function type_resolver_from_list(lst)
    {
        var param_length = lst[0].length - 1;
        return function() {
            if (arguments.length != param_length) {
                throw "expected " + param_length + " arguments, got "
                    + arguments.length + " instead.";
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
            throw "could not find appropriate type match for (" + types + ")";
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
            throw "type error on " + name + ": " + err;
        }
        var obj = {
            parents: canon_args,
            expression_type: "builtin_function{" + name + "}",
            type: type,
            value: function() {
                return [name, "(",
                        this.parents.map(function(t) { 
                            return t.evaluate(); 
                        }).join(", "),
                        ")"].join(" ");
            }
        };

        if (constant_evaluator) {
            obj.constant_value = Shade.memoize_on_field("_constant_value", function() {
                return constant_evaluator(this);
            });
        } else {
            obj.is_constant = function() { return false; };
        };
        if (element_evaluator) {
            obj.element = function(i) {
                return element_evaluator(this, i);
            };
            obj.element_is_constant = function(i) {
                return this.element(i).is_constant();
            };
        }
        if (element_constant_evaluator) {
            obj.element_is_constant = function(i) {
                return element_constant_evaluator(this, i);
            };
        }
        return Shade._create_concrete_value_exp(obj);
    };
}

function common_fun_1op(fun_name, constant_evaluator) {
    var result = builtin_glsl_function({
        name: fun_name, 
        type_resolving_list: [
            [Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec2, Shade.Types.vec2],
            [Shade.Types.vec3, Shade.Types.vec3],
            [Shade.Types.vec4, Shade.Types.vec4]
        ], 
        constant_evaluator: constant_evaluator,
        element_evaluator: function(exp, i) {
            return result(exp.parents[0].element(i));
        }
    });
    return result;
}

function common_fun_2op(fun_name, constant_evaluator) {
    var result = builtin_glsl_function({
        name: fun_name, 
        type_resolving_list: [
            [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec2, Shade.Types.vec2, Shade.Types.vec2],
            [Shade.Types.vec3, Shade.Types.vec3, Shade.Types.vec3],
            [Shade.Types.vec4, Shade.Types.vec4, Shade.Types.vec4]
        ], 
        constant_evaluator: constant_evaluator, 
        element_evaluator: function(exp, i) {
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

_.each(funcs_1op, function (constant_evaluator_1, fun_name) {
    function constant_evaluator(exp) {
        if (exp.type.equals(Shade.Types.float_t))
            return constant_evaluator_1(exp.parents[0].constant_value());
        else {
            var c = exp.parents[0].constant_value();
            return vec.map(c, constant_evaluator_1);
        }
    }
    Shade[fun_name] = common_fun_1op(fun_name, constant_evaluator);
    Shade.Exp[fun_name] = function(fun) {
        return function() {
            return fun(this);
        };
    }(Shade[fun_name]);
});

function atan1_constant_evaluator(exp)
{
    var v1 = exp.parents[0].constant_value();
    if (exp.type.equals(Shade.Types.float_t))
        return Math.atan(v1);
    else {
        return vec.map(c, Math.atan);
    }
}

function common_fun_2op_constant_evaluator(fun)
{
    return function(exp){
        var v1 = exp.parents[0].constant_value();
        var v2 = exp.parents[1].constant_value();
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
        return common_fun_1op("atan", atan1_constant_evaluator)(arguments[0]);
    } else if (arguments.length == 2) {
        var c = common_fun_2op_constant_evaluator(Math.atan2);
        return common_fun_2op("atan", c)(arguments[0], arguments[1]);
    } else {
        throw "atan expects 1 or 2 parameters, got " + arguments.length
        + " instead.";
    }
}

function broadcast_elements(exp, i) {
    return _.map(exp.parents, function(parent) {
        return parent.type.is_vec() ? parent.element(i) : parent;
    });
}

Shade.atan = atan;
Shade.Exp.atan = function() { return Shade.atan(this); };
Shade.pow = common_fun_2op("pow", common_fun_2op_constant_evaluator(Math.pow));
Shade.Exp.pow = function(other) { return Shade.pow(this, other); };

function mod_min_max_constant_evaluator(op) {
    return function(exp) {
        var values = _.map(exp.parents, function (p) {
            return p.constant_value();
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
            [Shade.Types.int_t,    Shade.Types.int_t,   Shade.Types.int_t],
            [Shade.Types.float_t,  Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec2,     Shade.Types.vec2,    Shade.Types.vec2],
            [Shade.Types.vec3,     Shade.Types.vec3,    Shade.Types.vec3],
            [Shade.Types.vec4,     Shade.Types.vec4,    Shade.Types.vec4],
            [Shade.Types.float_t,  Shade.Types.float_t, Shade.Types.float_t],
            [Shade.Types.vec2,     Shade.Types.float_t, Shade.Types.vec2],
            [Shade.Types.vec3,     Shade.Types.float_t, Shade.Types.vec3],
            [Shade.Types.vec4,     Shade.Types.float_t, Shade.Types.vec4]
        ], 
        constant_evaluator: mod_min_max_constant_evaluator(op),
        element_evaluator: function(exp, i) {
            return result.apply(this, broadcast_elements(exp, i));
        }
    });
    Shade[k] = result;
});

function clamp_constant_evaluator(exp)
{
    function clamp(v, mn, mx) {
        return Math.max(mn, Math.min(mx, v));
    }

    var e1 = exp.parents[0];
    var e2 = exp.parents[1];
    var e3 = exp.parents[2];
    var v1 = e1.constant_value();
    var v2 = e2.constant_value();
    var v3 = e3.constant_value();

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
    constant_evaluator: clamp_constant_evaluator,
    element_evaluator: function (exp, i) {
        return Shade.clamp.apply(this, broadcast_elements(exp, i));
    }
});

Shade.clamp = clamp;

function mix_constant_evaluator(exp)
{
    function mix(left, right, u) {
        return (1-u) * left + u * right;
    }
    var e1 = exp.parents[0];
    var e2 = exp.parents[1];
    var e3 = exp.parents[2];
    var v1 = e1.constant_value();
    var v2 = e2.constant_value();
    var v3 = e3.constant_value();
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
    constant_evaluator: mix_constant_evaluator,
    element_evaluator: function(exp, i) {
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
    constant_evaluator: function(exp) {
        function step(edge, x) {
            if (x < edge) return 0.0; else return 1.0;
        }
        var e1 = exp.parents[0];
        var e2 = exp.parents[1];
        var v1 = e1.constant_value();
        var v2 = e2.constant_value();
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
    element_evaluator: function(exp, i) {
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
    constant_evaluator: function(exp) {
        var edge0 = exp.parents[0];
        var edge1 = exp.parents[1];
        var x = exp.parents[2];
        var t = Shade.clamp(x.sub(edge0).div(edge1.sub(edge0)), 0, 1);
        return t.mul(t).mul(Shade.sub(3, t.mul(2))).constant_value();
    }, element_evaluator: function(exp, i) {
        return Shade.smoothstep.apply(this, broadcast_elements(exp, i));
    }
});
Shade.smoothstep = smoothstep;

var norm = builtin_glsl_function({
    name: "length", 
    type_resolving_list: [
        [Shade.Types.float_t, Shade.Types.float_t],
        [Shade.Types.vec2,    Shade.Types.float_t],
        [Shade.Types.vec3,    Shade.Types.float_t],
        [Shade.Types.vec4,    Shade.Types.float_t]], 
    constant_evaluator: function(exp) {
        var v = exp.parents[0].constant_value();
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
    constant_evaluator: function(exp) {
        return exp.parents[0].sub(exp.parents[1]).norm().constant_value();
    }});
Shade.distance = distance;

var dot = builtin_glsl_function({
    name: "dot", 
    type_resolving_list: [
        [Shade.Types.float_t, Shade.Types.float_t, Shade.Types.float_t],
        [Shade.Types.vec2,    Shade.Types.vec2,    Shade.Types.float_t],
        [Shade.Types.vec3,    Shade.Types.vec3,    Shade.Types.float_t],
        [Shade.Types.vec4,    Shade.Types.vec4,    Shade.Types.float_t]],
    constant_evaluator: function (exp) {
        var v1 = exp.parents[0].constant_value(),
            v2 = exp.parents[1].constant_value();
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
    constant_evaluator: function(exp) {
        return vec3.cross(exp.parents[0].constant_value(),
                          exp.parents[1].constant_value());
    }, element_evaluator: function (exp, i) {
        var v1 = exp.parents[0].length;
        var v2 = exp.parents[1].length;
        if        (i === 0) { return v1.at(1).mul(v2.at(2)).sub(v1.at(2).mul(v2.at(1)));
        } else if (i === 1) { return v1.at(2).mul(v2.at(0)).sub(v1.at(0).mul(v2.at(2)));
        } else if (i === 2) { return v1.at(0).mul(v2.at(1)).sub(v1.at(1).mul(v2.at(0)));
        } else
            throw "invalid element " + i + " for cross";
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
    constant_evaluator: function(exp) {
        return exp.parents[0].div(exp.parents[0].norm()).constant_value();
    }, element_evaluator: function(exp, i) {
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
    constant_evaluator: function(exp) {
        var N = exp.parents[0];
        var I = exp.parents[1];
        var Nref = exp.parents[2];
        if (Nref.dot(I).constant_value() < 0)
            return N.constant_value();
        else
            return Shade.sub(0, N).constant_value();
    }, element_evaluator: function(exp, i) {
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
    constant_evaluator: function(exp) {
        var I = exp.parents[0];
        var N = exp.parents[1];
        return I.sub(Shade.mul(2, N.dot(I), N)).constant_value();
    }, element_evaluator: function(exp, i) {
        var I = exp.parents[0];
        var N = exp.parents[1];
        return I.sub(Shade.mul(2, N.dot(I), N)).element_constant_value(i);
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
    constant_evaluator: function(exp) {
        var I = exp.parents[0];
        var N = exp.parents[1];
        var eta = exp.parents[2];
        
        var k = Shade.sub(1.0, Shade.mul(eta, eta, Shade.sub(1.0, N.dot(I).mul(N.dot(I)))));
        if (k.constant_value() < 0.0) {
            return vec[I.type.array_size()].create();
        } else {
            return eta.mul(I).sub(eta.mul(N.dot(I)).add(k.sqrt()).mul(N)).constant_value();
        }
    }, element_evaluator: function(exp, i) {
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
        default: throw "internal error";
        };
        return Shade.ifelse(k.lt(0), zero, refraction).element(i);
    }
});
Shade.refract = refract;

var texture2D = builtin_glsl_function({
    name: "texture2D", 
    type_resolving_list: [[Shade.Types.sampler2D, Shade.Types.vec2, Shade.Types.vec4]],
    element_evaluator: function(exp, i) { return exp.at(i); },
    element_constant_evaluator: function(exp, i) { return false; }
});
Shade.texture2D = texture2D;

// FIXME BUG?
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
    constant_evaluator: function(exp) {
        var left = exp.parents[0].constant_value();
        var right = exp.parents[1].constant_value();
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
    constant_evaluator: function(exp) {
        var left = exp.parents[0].constant_value();
        var right = exp.parents[1].constant_value();
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
    constant_evaluator: function(exp) {
        var left = exp.parents[0].constant_value();
        var right = exp.parents[1].constant_value();
        return _.map(left, function(x, i) { return x < right[i]; });
    }, element_evaluator: function(exp, i) {
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
    constant_evaluator: function(exp) {
        var left = exp.parents[0].constant_value();
        var right = exp.parents[1].constant_value();
        return _.map(left, function(x, i) { return x <= right[i]; });
    }, element_evaluator: function(exp, i) {
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
    constant_evaluator: function(exp) {
        var left = exp.parents[0].constant_value();
        var right = exp.parents[1].constant_value();
        return _.map(left, function(x, i) { return x > right[i]; });
    }, element_evaluator: function(exp, i) {
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
    constant_evaluator: function(exp) {
        var left = exp.parents[0].constant_value();
        var right = exp.parents[1].constant_value();
        return _.map(left, function(x, i) { return x >= right[i]; });
    }, element_evaluator: function(exp, i) {
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
    constant_evaluator: function(exp) {
        var v = exp.parents[0].constant_value();
        return _.all(v, function(x) { return x; });
    }});
Shade.Exp.all = function() { return Shade.all(this); };

Shade.any = builtin_glsl_function({
    name: "any", 
    type_resolving_list: [
        [Shade.Types.bvec2, Shade.Types.bool_t],
        [Shade.Types.bvec3, Shade.Types.bool_t],
        [Shade.Types.bvec4, Shade.Types.bool_t]], 
    constant_evaluator: function(exp) {
        var v = exp.parents[0].constant_value();
        return _.any(v, function(x) { return x; });
    }});
Shade.Exp.any = function() { return Shade.any(this); };

Shade.matrixCompMult = builtin_glsl_function({
    name: "matrixCompMult", 
    type_resolving_list: [
        [Shade.Types.mat2, Shade.Types.mat2, Shade.Types.mat2],
        [Shade.Types.mat3, Shade.Types.mat3, Shade.Types.mat3],
        [Shade.Types.mat4, Shade.Types.mat4, Shade.Types.mat4]], 
    constant_evaluator: function(exp) {
        var v1 = exp.parents[0].constant_value();
        var v2 = exp.parents[1].constant_value();
        return mat.map(v1, function(x, i) { return x * v2[i]; });
    }, element_evaluator: function(exp, i) {
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

// /o\
Shade.Types.int_t.infinity   = Shade.constant(65535, Shade.Types.int_t);
Shade.Types.float_t.infinity = Shade.constant(1e18);
Shade.Types.vec2.infinity    = Shade.constant(vec2.make([1e18,1e18]));
Shade.Types.vec3.infinity    = Shade.constant(vec3.make([1e18,1e18,1e18]));
Shade.Types.vec4.infinity    = Shade.constant(vec4.make([1e18,1e18,1e18,1e18]));
Shade.Types.mat2.infinity    = Shade.constant(mat2.make([1e18,1e18,1e18,1e18]));
Shade.Types.mat3.infinity    = Shade.constant(mat3.make([1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18]));
Shade.Types.mat4.infinity    = Shade.constant(mat4.make([1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18,1e18]));

// according to the GLSL ES spec, for highp numbers the limit for ints is 2^16, and for floats, 2^52 ~= 10^18
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
        evaluate: function(glsl_name) {
            return this.parents.map(function (n) { return n.evaluate(); }).join("; ");
        },
        type: Shade.Types.void_t,
        compile: function (ctx) {}
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
            if (Shade.debug && Shade.Optimizer._debug_passes &&
                old_guid != new_guid) {
                console.log("Pass",operations[i][2],"succeeded");
                console.log("Before: ");
                old_v.debug_print();
                console.log("After: ");
                v.debug_print();
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
    return result;
};

Shade.Optimizer.is_zero = function(exp)
{
    if (!exp.is_constant())
        return false;
    var v = exp.constant_value();
    var t = facet_constant_type(v);
    if (t === 'number')
        return v === 0;
    if (t === 'vector')
        return _.all(v, function (x) { return x === 0; });
    if (facet_typeOf(v) === 'matrix')
        return _.all(v, function (x) { return x === 0; });
    return false;
};

Shade.Optimizer.is_mul_identity = function(exp)
{
    if (!exp.is_constant())
        return false;
    var v = exp.constant_value();
    var t = facet_constant_type(v);
    if (t === 'number')
        return v === 1;
    if (t === 'vector') {
        switch (v.length) {
        case 2: return vec.equal(v, vec.make([1,1]));
        case 3: return vec.equal(v, vec.make([1,1,1]));
        case 4: return vec.equal(v, vec.make([1,1,1,1]));
        default:
            throw "bad vec length: " + v.length;    
        }
    }
    if (t === 'matrix')
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
    throw "internal error: no zero value on input to replace_with_nonzero";
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
        throw "internal error on Shade.Optimizer.is_times_one";
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
            throw "internal error on Shade.Optimizer.replace_with_notone";
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
    throw "internal error: no is_mul_identity value on input to replace_with_notone";
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
    throw "internal error: not a type replaceable with zero";
};

Shade.Optimizer.vec_at_constant_index = function(exp)
{
    if (exp.expression_type !== "index")
        return false;
    if (!exp.parents[1].is_constant())
        return false;
    var v = exp.parents[1].constant_value();
    if (facet_typeOf(v) !== "number")
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
    throw "internal error on Shade.Optimizer.replace_vec_at_constant_with_swizzle";
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
        'point_size': 'gl_PointSize'
    };

    _.each(program_obj, function(v, k) {
        var transposed_key = (k in canonicalization_map) ?
            canonicalization_map[k] : k;
        result[transposed_key] = v;
    });
    return result;
};

Shade.program = function(program_obj)
{
    program_obj = Shade.canonicalize_program_object(program_obj);
    var vp_obj = {}, fp_obj = {};

    _.each(program_obj, function(v, k) {
        v = Shade.make(v);
        if (k === 'gl_FragColor') {
            if (!v.type.equals(Shade.Types.vec4)) {
                throw "color attribute must be of type vec4, got " +
                    v.type.repr() + " instead";
            }
            fp_obj.gl_FragColor = v;
        } else if (k === 'gl_Position') {
            if (!v.type.equals(Shade.Types.vec4)) {
                throw "position attribute must be of type vec4, got " +
                    v.type.repr() + " instead";
            }
            vp_obj.gl_Position = v;
        } else if (k === 'gl_PointSize') {
            if (!v.type.equals(Shade.Types.float_t)) {
                throw "color attribute must be of type float, got " +
                    v.type.repr() + " instead";
            }
            vp_obj.gl_PointSize = v;
        } else if (k.substr(0, 3) === 'gl_') {
            // FIXME: Can we sensibly work around these?
            throw "gl_* are reserved GLSL names";
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
        return Shade.varying(varying_name, exp.type);
    }

    // explicit per-vertex hoisting must happen before is_attribute hoisting,
    // otherwise we might end up reading from a varying in the vertex program,
    // which is undefined behavior

    var common_sequence = [
        [Shade.Optimizer.is_times_zero, Shade.Optimizer.replace_with_zero, 
         "v * 0", true],
        [Shade.Optimizer.is_times_one, Shade.Optimizer.replace_with_notone, 
         "v * 1", true],
        [Shade.Optimizer.is_plus_zero, Shade.Optimizer.replace_with_nonzero,
         "v + 0", true],
        [Shade.Optimizer.is_never_discarding,
         Shade.Optimizer.remove_discard, "discard_if(false)"],
        [Shade.Optimizer.is_known_branch,
         Shade.Optimizer.prune_ifelse_branch, "constant?a:b", true],
        [Shade.Optimizer.vec_at_constant_index, 
         Shade.Optimizer.replace_vec_at_constant_with_swizzle, "vec[constant_ix]"],
        [Shade.Optimizer.is_constant,
         Shade.Optimizer.replace_with_constant, "constant folding"],
        [Shade.Optimizer.is_logical_or_with_constant,
         Shade.Optimizer.replace_logical_or_with_constant, "constant||v", true],
        [Shade.Optimizer.is_logical_and_with_constant,
         Shade.Optimizer.replace_logical_and_with_constant, "constant&&v", true]];

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
        v = fp_optimize(v);
        used_varying_names.push.apply(used_varying_names,
                                      _.map(v.find_if(is_varying),
                                            function (v) { 
                                                return v.evaluate();
                                            }));
        fp_exprs.push(Shade.set(v, k));
    });

    _.each(vp_obj, function(v, k) {
        if ((varying_names.indexOf(k) === -1) ||
            (used_varying_names.indexOf(k) !== -1))
            vp_exprs.push(Shade.set(vp_optimize(v), k));
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
    var result = Facet.program(vp_source, fp_source);
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
// value between 0 and 1, returns the nearest value;

// box function reconstruction

Shade.Utils.choose = function(lst) {
    var new_lst = _.toArray(lst);
    return function(v) {
        var vals_exp = Shade.array(new_lst);
        v = Shade.clamp(v, 0, new_lst.length-1).floor().as_int();
        return vals_exp.at(v);
    };
};
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
            throw "only dimension-1 attribute buffers are supported";
        if (_.isUndefined(data.array))
            throw "Shade.Utils.fit on attribute buffers requires keep_array:true in options";
        data = data.array;
    }

    var min = _.min(data), max = _.max(data);
    return Shade.Utils.linear(min, max, 0, 1);
};

// replicates something like an opengl light. 
// Fairly bare-bones for now (only diffuse, no attenuation)
Shade.gl_light = function(opts)
{
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
Shade.cosh = function(v)
{
    return Shade.exp(v).add(v.neg().exp()).div(2);
};
Shade.Exp.cosh = function() { return Shade.cosh(this); };
Shade.sinh = function(v)
{
    return Shade.exp(v).sub(v.neg().exp()).div(2);
};
Shade.Exp.sinh = function() { return Shade.sinh(this); };
Shade.tanh = Shade(function(v)
{
    return v.sinh().div(v.cosh());
});
Shade.Exp.tanh = function() { return Shade.tanh(this); };
(function() {

var logical_operator_binexp = function(exp1, exp2, operator_name, constant_evaluator,
                                       parent_is_unconditional)
{
    parent_is_unconditional = parent_is_unconditional ||
        function (i) { return true; };
    return Shade._create_concrete_value_exp({
        parents: [exp1, exp2],
        type: Shade.Types.bool_t,
        expression_type: "operator" + operator_name,
        value: function() {
            return "(" + this.parents[0].evaluate() + " " + operator_name + " " +
                this.parents[1].evaluate() + ")";
        },
        constant_value: Shade.memoize_on_field("_constant_value", function() {
            return constant_evaluator(this);
        }),
        parent_is_unconditional: parent_is_unconditional
    });
};

var lift_binfun_to_evaluator = function(binfun) {
    return function(exp) {
        var exp1 = exp.parents[0], exp2 = exp.parents[1];
        return binfun(exp1.constant_value(), exp2.constant_value());
    };
};

var logical_operator_exp = function(operator_name, binary_evaluator,
                                    parent_is_unconditional)
{
    return function() {
        if (arguments.length === 0) 
            throw ("operator " + operator_name 
                   + " requires at least 1 parameter");
        if (arguments.length === 1) return Shade(arguments[0]).as_bool();
        var first = Shade(arguments[0]);
        if (!first.type.equals(Shade.Types.bool_t))
            throw ("operator " + operator_name + 
                   " requires booleans, got argument 1 as " +
                   arguments[0].type.repr() + " instead.");
        var current_result = first;
        for (var i=1; i<arguments.length; ++i) {
            var next = Shade(arguments[i]);
            if (!next.type.equals(Shade.Types.bool_t))
                throw ("operator " + operator_name + 
                       " requires booleans, got argument " + (i+1) +
                       " as " + next.type.repr() + " instead.");
            current_result = logical_operator_binexp(
                current_result, next,
                operator_name, binary_evaluator,
                parent_is_unconditional);
        }
        return current_result;
    };
};

Shade.or = logical_operator_exp(
    "||", lift_binfun_to_evaluator(function(a, b) { return a || b; }),
    function(i) { return i === 0; }
);

Shade.Exp.or = function(other)
{
    return Shade.or(this, other);
};

Shade.and = logical_operator_exp(
    "&&", lift_binfun_to_evaluator(function(a, b) { return a && b; }),
    function(i) { return i === 0; }
);

Shade.Exp.and = function(other)
{
    return Shade.and(this, other);
};

Shade.xor = logical_operator_exp(
    "^^", lift_binfun_to_evaluator(function(a, b) { return ~~(a ^ b); }));
Shade.Exp.xor = function(other)
{
    return Shade.xor(this, other);
};

Shade.not = Shade(function(exp)
{
    if (!exp.type.equals(Shade.Types.bool_t)) {
        throw "logical_not requires bool expression";
    }
    return Shade._create_concrete_value_exp({
        parents: [exp],
        type: Shade.Types.bool_t,
        expression_type: "operator!",
        value: function() {
            return "(!" + this.parents[0].evaluate() + ")";
        },
        constant_value: Shade.memoize_on_field("_constant_value", function() {
            return !this.parents[0].constant_value();
        })
    });
});

Shade.Exp.not = function() { return Shade.not(this); };

var comparison_operator_exp = function(operator_name, type_checker, binary_evaluator)
{
    return Shade(function(first, second) {
        type_checker(first.type, second.type);

        return logical_operator_binexp(
            first, second, operator_name, binary_evaluator);
    });
};

var inequality_type_checker = function(name) {
    return function(t1, t2) {
        if (!(t1.equals(Shade.Types.float_t) && 
              t2.equals(Shade.Types.float_t)) &&
            !(t1.equals(Shade.Types.int_t) && 
              t2.equals(Shade.Types.int_t)))
            throw ("operator" + name + 
                   " requires two ints or two floats, got " +
                   t1.repr() + " and " + t2.repr() +
                   " instead.");
    };
};

var equality_type_checker = function(name) {
    return function(t1, t2) {
        if (!t1.equals(t2))
            throw ("operator" + name +
                   " requires same types, got " +
                   t1.repr() + " and " + t2.repr() +
                   " instead.");
        if (t1.is_array() && !t1.is_vec() && !t1.is_mat())
            throw ("operator" + name +
                   " does not support arrays");
    };
};

Shade.lt = comparison_operator_exp("<", inequality_type_checker("<"),
    lift_binfun_to_evaluator(function(a, b) { return a < b; }));
Shade.Exp.lt = function(other) { return Shade.lt(this, other); };

Shade.le = comparison_operator_exp("<=", inequality_type_checker("<="),
    lift_binfun_to_evaluator(function(a, b) { return a <= b; }));
Shade.Exp.le = function(other) { return Shade.le(this, other); };

Shade.gt = comparison_operator_exp(">", inequality_type_checker(">"),
    lift_binfun_to_evaluator(function(a, b) { return a > b; }));
Shade.Exp.gt = function(other) { return Shade.gt(this, other); };

Shade.ge = comparison_operator_exp(">=", inequality_type_checker(">="),
    lift_binfun_to_evaluator(function(a, b) { return a >= b; }));
Shade.Exp.ge = function(other) { return Shade.ge(this, other); };

Shade.eq = comparison_operator_exp("==", equality_type_checker("=="),
    lift_binfun_to_evaluator(function(a, b) { 
        if (facet_typeOf(a) === 'number' ||
            facet_typeOf(a) === 'boolean')
            return a === b;
        if (facet_typeOf(a) === 'array')
            return _.all(_.map(_.zip(a, b),
                               function(v) { return v[0] === v[1]; }),
                         function (x) { return x; });
        if (facet_constant_type(a) === 'vector') {
            return vec.equal(a, b);
        }
        if (facet_constant_type(a) === 'matrix') {
            return mat.equal(a, b);
        }
        throw "internal error: unrecognized type " + facet_typeOf(a) + 
            " " + facet_constant_type(a);
    }));
Shade.Exp.eq = function(other) { return Shade.eq(this, other); };

Shade.ne = comparison_operator_exp("!=", equality_type_checker("!="),
    lift_binfun_to_evaluator(function(a, b) { 
        if (facet_typeOf(a) === 'number' ||
            facet_typeOf(a) === 'boolean')
            return a !== b;
        if (facet_typeOf(a) === 'array')
            return _.any(_.map(_.zip(a, b),
                               function(v) { return v[0] !== v[1]; } ),
                         function (x) { return x; });
        throw "internal error: unrecognized type " + facet_typeOf(a) + 
            " " + facet_constant_type(a);
    }));
Shade.Exp.ne = function(other) { return Shade.ne(this, other); };

// component-wise comparisons are defined on builtins.js

})();
Shade.ifelse = function(condition, if_true, if_false)
{
    condition = Shade.make(condition);
    if_true = Shade.make(if_true);
    if_false = Shade.make(if_false);

    if (!if_true.type.equals(if_false.type))
        throw "ifelse return expressions must have same types";
    if (!condition.type.equals(condition.type))
        throw "ifelse condition must be of type bool";

    return Shade._create_concrete_value_exp( {
        parents: [condition, if_true, if_false],
        type: if_true.type,
        expression_type: "ifelse",
        // FIXME: works around Chrome Bug ID 103053
        _must_be_function_call: true,
        value: function() {
            return "(" + this.parents[0].evaluate() + "?"
                + this.parents[1].evaluate() + ":"
                + this.parents[2].evaluate() + ")";
        },
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
        is_constant: function() {
            if (!this.parents[0].is_constant()) {
                // if condition is not constant, 
                // then expression is only constant if sides always
                // evaluate to same values.
                if (this.parents[1].is_constant() && 
                    this.parents[2].is_constant()) {
                    var v1 = this.parents[1].constant_value();
                    var v2 = this.parents[2].constant_value();
                    return this.type.constant_equal(v1, v2);
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
                    return this.type.element_type(i).constant_equal(v1, v2);
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
            throw "expected vec3, got " + t.type.repr() + "instead";
        }
        return from_vec3(t);
    } else if (arguments.length === 2) {
        var x = arguments[0], y = arguments[1];
        if (!x.type.equals(Shade.Types.float_t)) {
            throw "expected float, got " + x.type.repr() + "instead";
        }
        if (!y.type.equals(Shade.Types.float_t)) {
            throw "expected float, got " + y.type.repr() + "instead";
        }
        return from_vec3(Shade.vec(x, y, 0));
    } else if (arguments.length === 3) {
        var x = arguments[0], y = arguments[1], z = arguments[2];
        if (!x.type.equals(Shade.Types.float_t)) {
            throw "expected float, got " + x.type.repr() + "instead";
        }
        if (!y.type.equals(Shade.Types.float_t)) {
            throw "expected float, got " + y.type.repr() + "instead";
        }
        if (!z.type.equals(Shade.Types.float_t)) {
            throw "expected float, got " + z.type.repr() + "instead";
        }
        return from_vec3(Shade.vec(x, y, z));
    } else
        throw "expected either 1, 2 or 3 parameters";
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
Bad: Breaks the model in Facet programs where we don't care much about
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
    exp = Shade.make(exp);
    condition = Shade.make(condition);

    var result = Shade._create_concrete_exp({
        is_constant: Shade.memoize_on_field("_is_constant", function() {
            var cond = _.all(this.parents, function(v) {
                return v.is_constant();
            });
            return (cond && !this.parents[0].constant_value());
        }),
        _must_be_function_call: true,
        type: exp.type,
        expression_type: "discard_if",
        parents: [condition, exp],
        parent_is_unconditional: function(i) {
            return i === 0;
        },
        compile: function(ctx) {
            ctx.strings.push(exp.type.repr(), this.glsl_name, "(void) {\n",
                             "    if (",this.parents[0].evaluate(),") discard;\n",
                             "    return ", this.parents[1].evaluate(), ";\n}\n");
        },
        constant_value: function() {
            return exp.constant_value();
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
        throw "alpha parameter must be float";
    if (color.type.equals(Shade.Types.vec4)) {
        return Shade.vec(color.swizzle("rgb"), alpha);
    }
    if (color.type.equals(Shade.Types.vec3)) {
        return Shade.vec(color, alpha);
    }
    throw "color parameter must be vec3 or vec4";
};

Shade.Exp.alpha = function(alpha)
{
    return Shade.Colors.alpha(this, alpha);
};
(function() {

function compose(g, f)
{
    if (_.isUndefined(f) || _.isUndefined(g))
        throw "Undefined!";
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
            throw "internal error";
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
        throw "Undefined!";
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
                throw "create with 1 parameter requires a vec3";
        } else if (arguments.length === 3) {
            vec = Shade.vec(arguments[0], arguments[1], arguments[2]);
            if (!vec.type.equals(Shade.Types.vec3))
                throw "create with 3 parameter requires 3 floats";
        } else
            throw "create requires either 1 vec3 or 3 floats";
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

Shade.Scale.linear = function(opts)
{
    opts = _.defaults(opts || {}, {
        domain: [0, 1],
        range: [0, 1]
    });

    //////////////////////////////////////////////////////////////////////////
    // typechecking

    // that condition is written awkwardly so it catches
    // opts.domain === undefined as well.
    if (!(opts.domain.length >= 2)) { 
        throw "Shade.Scale.linear requires arrays of length at least 2";
    }
    if (opts.domain.length !== opts.range.length) {
        throw "Shade.Scale.linear requires domain and range to be arrays of the same length";
    }

    opts.domain = _.map(opts.domain, Shade.make);
    opts.range = _.map(opts.range, Shade.make);

    var domain_types = _.map(opts.domain, function(v) { return v.type; });
    var range_types =  _.map(opts.range,  function(v) { return v.type; });
    var allowable_types = [
        Shade.Types.float_t,
        Shade.Types.vec2,
        Shade.Types.vec3,
        Shade.Types.vec4
    ];
    // if (!(domain_types[0].equals(Shade.Types.float_t)))
    //     throw "Shade.Scale.linear requires domain type to be float";
    if (!(_.any(allowable_types, function(v) { return v.equals(domain_types[0]); })))
        throw "Shade.Scale.linear requires domain type to be one of {float, vec2, vec3, vec4}";
    if (!(_.all(domain_types, function(v) { return v.equals(domain_types[0]); })))
        throw "Shade.Scale.linear requires domain elements to have the same type";
    if (!(_.any(allowable_types, function(v) { return v.equals(range_types[0]); })))
        throw "Shade.Scale.linear requires range type to be one of {float, vec2, vec3, vec4}";
    if (!(_.all(range_types, function(v) { return v.equals(range_types[0]); })))
        throw "Shade.Scale.linear requires range elements to have the same type";

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
        throw "Shade.Scale.linear unimplemented polylinear, sorry!";
    }
};
Facet.Marks = {};
//////////////////////////////////////////////////////////////////////////
// This is like a poor man's instancing/geometry shader. I need a
// general API for it.

Facet.Marks.aligned_rects = function(opts)
{
    opts = _.defaults(opts || {}, {
        mode: Facet.DrawingMode.standard,
        z: function() { return 0; }
    });
    if (!opts.elements) throw "elements is a required field";
    if (!opts.left)     throw "left is a required field";
    if (!opts.right)    throw "right is a required field";
    if (!opts.top)      throw "top is a required field";
    if (!opts.bottom)   throw "bottom is a required field";
    if (!opts.color)    throw "color is a required field";

    var vertex_index = Facet.attribute_buffer({ 
        vertex_array: _.range(opts.elements * 6), 
        item_size: 1
    });
    var primitive_index = Shade.div(vertex_index, 6).floor();
    var vertex_in_primitive = Shade.mod(vertex_index, 6).floor();

    // aif == apply_if_function
    var aif = function(f, params) {
        if (facet_typeOf(f) === 'function')
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

    return Facet.bake({
        type: "triangles",
        elements: vertex_index
    }, {
        position: Shade.vec(vertex_map.at(vertex_in_primitive), z),
        color: color,
        pick_id: opts.pick_id,
        mode: opts.mode
    });
};
Facet.Marks.lines = function(opts)
{
    opts = _.defaults(opts || {}, {
        mode: Facet.DrawingMode.standard,
        z: function() { return 0; }
    });

    if (_.isUndefined(opts.elements)) throw "elements is a required field";
    if (_.isUndefined(opts.color))    throw "color is a required field";
    if (_.isUndefined(opts.position) && 
        (_.isUndefined(opts.x) || _.isUndefined(opts.y))) {
        throw "either position or x and y are required fields";
    }

    var vertex_index        = Facet.attribute_buffer({
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
    return Facet.bake({
        type: "lines",
        elements: vertex_index
    }, appearance);
};
Facet.Marks.dots = function(opts)
{
    opts = _.defaults(opts, {
        fill_color: Shade.vec(0,0,0,1),
        stroke_color: Shade.vec(0,0,0,1),
        point_diameter: 5,
        stroke_width: 2,
        mode: Facet.DrawingMode.over_with_depth,
        alpha: true,
        plain: false
    });

    if (!opts.position)
        throw "missing required parameter 'position'";
    if (!opts.elements)
        throw "missing required parameter 'elements'";

    var S = Shade;

    var fill_color     = Shade(opts.fill_color);
    var stroke_color   = Shade(opts.stroke_color);
    var point_diameter = Shade(opts.point_diameter);
    var stroke_width   = Shade(opts.stroke_width).add(1);
    var use_alpha      = Shade(opts.alpha);
    opts.plain = Shade(opts.plain);
    
    var model_opts = {
        type: "points",
        vertex: opts.position,
        elements: opts.elements
    };

    var model = Facet.model(model_opts);

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

    var result = Facet.bake(model, {
        position: gl_Position,
        point_size: point_diameter,
        color: opts.plain.ifelse(plain_fill_color, alpha_fill_color),
        mode: opts.mode,
        pick_id: opts.pick_id
    });

    /* We pass the gl_Position attribute explicitly because some other
     call might want to explicitly use the same position of the dots marks.

     This is the exact use case of dot-and-line graph drawing.
     */
    result.gl_Position = gl_Position;
    return result;
};
Facet.Marks.scatterplot = function(opts)
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
    return Facet.Marks.dots({
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

    return Facet.model({
        type: "triangles",
        uv: [uv, 2],
        elements: elements,
        vertex: function(min, max) {
            var xf = this.uv.mul(max.sub(min)).add(min);
            return Facet.Scale.Geo.mercator_to_spherical(xf.at(0), xf.at(1));
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

Facet.Marks.globe = function(opts)
{
    opts = _.defaults(opts || {}, {
        longitude_center: -98,
        latitude_center: 38,
        zoom: 3,
        resolution_bias: 0,
        patch_size: 10
    });
    var model = Shade.parameter("mat4");
    var patch = spherical_mercator_patch(opts.patch_size);
    var cache_size = 64; // cache size must be (2^n)^2
    var tile_size = 256;
    var tiles_per_line  = 1 << (~~Math.round(Math.log(Math.sqrt(cache_size))/Math.log(2)));
    var super_tile_size = tile_size * tiles_per_line;

    var ctx = Facet._globals.ctx;
    var texture = Facet.texture({
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
    var mvp = opts.view_proj(model);

    var xformed_patch = patch.uv 
    // These two lines work around the texture seams on the texture atlas
        .mul((tile_size-1.0)/tile_size)
        .add(0.5/tile_size)
    //
        .add(Shade.vec(offset_x, offset_y))
        .mul(texture_scale)
    ;

    var sphere_batch = Facet.bake(patch, {
        gl_Position: mvp(v),
        gl_FragColor: Shade.texture2D(sampler, xformed_patch).discard_if(model.mul(v).z().lt(0)),
        mode: Facet.DrawingMode.pass
    });

    function inertia_tick() {
        var f = function() {
            Facet.Scene.invalidate();
            result.longitude_center += move_vec[0] * inertia;
            result.latitude_center  += move_vec[1] * inertia;
            result.latitude_center  = Math.max(Math.min(80, result.latitude_center), -80);
            result.update_model_matrix();
            if (inertia > 0.01)
                window.requestAnimFrame(f, result.canvas);
            inertia *= 0.95;
        };
        f();
    }

    if (facet_typeOf(opts.zoom) === "number") {
        opts.zoom = Shade.parameter("float", opts.zoom);
    } else if (Facet.is_shade_expression(opts.zoom) !== "parameter") {
        throw "zoom must be either a number or a parameter";
    }

    var result = {
        tiles: tiles,
        queue: [],
        current_osm_zoom: 3,
        longitude_center: opts.longitude_center,
        latitude_center: opts.latitude_center,
        zoom: opts.zoom,
        model_matrix: model,
        mvp: mvp,
        lat_lon_position: function(lat, lon) {
            return mvp(Facet.Scale.Geo.latlong_to_spherical(lat, lon));
        },
        resolution_bias: opts.resolution_bias,
        update_model_matrix: function() {
            while (this.longitude_center < 0)
                this.longitude_center += 360;
            while (this.longitude_center > 360)
                this.longitude_center -= 360;
            var r1 = Facet.rotation(this.latitude_center * (Math.PI/180), [ 1, 0, 0]);
            var r2 = Facet.rotation(this.longitude_center * (Math.PI/180), [ 0,-1, 0]);
            this.model_matrix.set(mat4.product(r1, r2));
        },
        mousedown: function(event) {
            prev[0] = event.offsetX;
            prev[1] = event.offsetY;
            inertia = 0;
            Facet.Scene.invalidate();
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
                Facet.Scene.invalidate();
            }
            if (event.which & 1 && event.shiftKey) {
                zooming = true;
                var new_zoom = this.zoom.get() * (1.0 + (event.offsetY - prev[1]) / 240);
                this.zoom.set(Math.max(new_zoom, 0.5));
                Facet.Scene.invalidate();
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
            var now = new Date().getTime();
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
            var now = new Date().getTime();
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
                    throw "die";
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
                    Facet.Scene.invalidate();
                };
            };
            Facet.load_image_into_texture({
                texture: tiles[id].texture,
                src: "http://tile.openstreetmap.org/"+zoom+"/"+x+"/"+y+".png",
                crossOrigin: "anonymous",
                x_offset: tiles[id].offset_x * tile_size,
                y_offset: tiles[id].offset_y * tile_size,
                onload: f(x, y, zoom, id)
            });
        },
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
    result.init();

    return result;
};
Facet.Marks.polygon = function(opts)
{
    opts = _.defaults(opts, {
        fill_color: Shade.vec(0,0,0,1),
        mode: Facet.DrawingMode.over_with_depth,
   });

    if (!opts.x)
        throw "missing required parameter 'x'";
    if (!opts.y)
        throw "missing required parameter 'y'";
    if (!opts.elements)
        throw "missing required parameter 'elements'";



    function to_opengl(x) { return (x * 2) - 1; }
    var position = [], elements;

	for(var i=0;i<opts.x.length;i++){
       position.push(to_opengl(opts.x[i])); 
       position.push(to_opengl(opts.y[i]));
	}

	return polygon_model = Facet.Models.polygon(
		position,
		opts.style,
		opts.fill_color,
		opts.mode
	);

};
Facet.Models = {};
Facet.Models.flat_cube = function() {
    return Facet.model({
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
Facet.Models.mesh = function(u_secs, v_secs) {
    var verts = [];
    var elements = [];
    if (_.isUndefined(v_secs)) v_secs = u_secs;
    if (v_secs <= 0) throw "v_secs must be positive";
    if (u_secs <= 0) throw "u_secs must be positive";
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

    var uv_attr = Shade(Facet.attribute_buffer({
        vertex_array: verts, 
        item_size: 2
    }));
    return Facet.model({
        type: "triangle_strip",
        tex_coord: uv_attr,
        vertex: uv_attr.mul(2).sub(1),
        elements: Facet.element_buffer(elements)
    });
};
Facet.Models.sphere = function(lat_secs, long_secs) {
    var verts = [];
    var elements = [];
    if (_.isUndefined(long_secs)) long_secs = lat_secs;
    if (lat_secs <= 0) throw "lat_secs must be positive";
    if (long_secs <= 0) throw "long_secs must be positive";
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
    var uv_attr = Facet.attribute_buffer({ vertex_array: verts, item_size: 2});
    phi = S.sub(S.mul(Math.PI, S.swizzle(uv_attr, "r")), Math.PI/2);
    theta = S.mul(2 * Math.PI, S.swizzle(uv_attr, "g"));
    var cosphi = S.cos(phi);
    return Facet.model({
        type: "triangles",
        elements: Facet.element_buffer(elements),
        vertex: S.vec(S.sin(theta).mul(cosphi),
                      S.sin(phi),
                      S.cos(theta).mul(cosphi), 1)
    });
};
Facet.Models.square = function() {
    var uv = Shade(Facet.attribute_buffer({
        vertex_array: [0, 0, 1, 0, 0, 1, 1, 1], 
        item_size: 2
    }));
    return Facet.model({
        type: "triangles",
        elements: Facet.element_buffer([0, 1, 2, 1, 3, 2]),
        vertex: uv,
        tex_coord: uv
    });
};
Facet.Models.teapot = function()
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

    var mesh = Facet.Mesh.indexed(coords, elements);
    mesh.make_normals();
    return mesh.model;
};
Facet.Models.polygon = function(poly,style,vertexColor) {

var CW = 1, CCW = 0;

function point_2d(x, y) {
	this.x = (typeof x == "undefined") ? 0 : x;
	this.y = (typeof y == "undefined") ? 0 : y;
}


function getRotation(polyList){
var z = 0, current, next, prev, j, numpts;

numpts = polyList.length;

//check that the linked list contains points
for(var j=0;j<numpts;j++)
	if(polyList[j].next > 0)
		break;
if(j === numpts)
	return -1;

first = j;
for(var i=0;i<polyList.length;i++){
	current = polyList[j];
	next = polyList[current.next];
	prev = polyList[current.prev];
	z += ((current.point.x - prev.point.x) * (next.point.y - current.point.y));
	z -= ((current.point.y - prev.point.y) * (next.point.x - current.point.x));
	j = polyList[j].next;
	if(j === first)
		break;
}
if(z > 0)
	return CCW;
else
	return CW;
}


function hidePolyListElement(polyList,indx){

polyList[polyList[indx].prev].next = polyList[indx].next;
polyList[polyList[indx].next].prev = polyList[indx].prev;
polyList[indx].next = -1;
polyList[indx].prev = -1;
}


//adjust linked list pointers and remove element from array
function hideElement(list,val){

for(var i=0;i<list.length;i++){

	if((list[i].val === val) && (list[i].next >= 0)){
		list[list[i].prev].next = list[i].next;
		list[list[i].next].prev = list[i].prev;
		return i;
	}
}
return -1;
}


function removeElement(list,val){
var indx;

indx = hideElement(list,val);
if(indx >= 0){
	list[indx].next = -1;
	list[indx].prev = -1;
}
}

function addElement(list,val){
var i;
		element = new Object();
		if(list.length === 0){
			element.prev = 0;
			element.next = 0;
		}
		else {
			for(i=list.length - 1;i>=0;i--)
				if(list[i].next >= 0)
					break;
			if(i === -1){
				element.prev = i;
				element.next = i;
			}
			else {
				element.prev = i;
				element.next = list[i].next;
				list[list[i].next].prev = list.length;
				list[i].next = list.length;
			}
		}
		element.val = val;
		list.push(element);
}

function isElementInList(list,val){
var i;

if(list.length === 0)
	return false;
	
for(i=0;i<list.length;i++){
	if((list[i].val === val) && list[i].prev >= 0)
		return true;
}

return false;
}


/*
  pt1 is the first point for comparison
  pt2 is the second point for comparison
  pt3 is a point on the line used for comparison
  m and b are the parameters of the line used for comparison
  
  determine if the two points are on the same side of the line
*/

function isSameSide(pt1,pt2,pt3,m,b){
if(!isFinite(m)){
	if((pt1.x < pt3.x) && (pt2.x < pt3.x))
		return true;
	else if((pt1.x > pt3.x) && (pt2.x > pt3.x))
		return true;
}
else {	
	if((pt1.y < ((m*pt1.x) + b)) && (pt2.y < ((m*pt2.x) + b)))
			return true;
	else if((pt1.y > ((m*pt1.x) + b)) && (pt2.y > ((m*pt2.x) + b)))
			return true;
}
return false;

}




function angleType(polyList,indx,rotation){
var next,prev,current,angle,angleN,angleP,degree;
var count;
var isEar;


current = polyList[indx];
next = polyList[current.next];
prev = polyList[current.prev];


if(rotation === CCW){
	angleN = Math.atan2((next.point.y - current.point.y),(next.point.x - current.point.x));
	angleP = Math.atan2((prev.point.y - current.point.y),(prev.point.x - current.point.x));
	angle = angleP - angleN;
}
else{
	angleN = Math.atan2((next.point.y - current.point.y),(next.point.x - current.point.x));
	angleP = Math.atan2((prev.point.y - current.point.y),(prev.point.x - current.point.x));
	angle = angleN - angleP;
}

degree = angle * (180/Math.PI);
if(degree < 0)
	degree += 360;

if(degree < 180){
	polyList[indx].isReflex = false;
	isEar = true;
	next = polyList[current.next];
	prev = polyList[current.prev];
	//determine if this vertex is an ear tip
	for(var i=0;i<polyList.length;i++){
		if(polyList[i].next < 0)
			continue;
		//exclude vertices that cannot be in the interior of the acute angle
		if(polyList[i] === current || polyList[i] === next || polyList[i] === prev)
		continue;

		//if any vertex falls within the triangle then it is not an ear
		if(isSameSide(current.point,polyList[i].point,next.point,current.diag.edge.m,current.diag.edge.b) &&
			isSameSide(next.point,polyList[i].point,prev.point,prev.edge.m,prev.edge.b) &&
			isSameSide(prev.point,polyList[i].point,current.point,current.edge.m,current.edge.b)){
				isEar = false;
				break;
			}	
	}
	polyList[indx].isEar = isEar;
}
else {
	polyList[indx].isReflex = true;
	polyList[indx].isEar = false;
}

}


function getLineParams(vertx1,vertx2,shift){
var edge = new Object(),mid = new point_2d();
var deltaY,deltaX,cx,cy,rayStart,rayEnd;
var m,b,displacement = .000001;

rayStart = new point_2d(vertx1.point.x,vertx1.point.y);
if(typeof shift == "undefined")
	shift = 0;

//change position of the point where the ray ends
if(shift > 0){
	m = vertx2.m;
	b = vertx2.b;
	cx = vertx2.point.x - (shift * displacement);
	cy = (m * cx) + b;
	rayEnd = new point_2d(cx,cy);
}
else
	rayEnd = new point_2d(vertx2.point.x,vertx2.point.y);

deltaX = rayEnd.x - rayStart.x;
deltaY = rayEnd.y - rayStart.y;
cx = rayStart.x;
cy = rayStart.y;

if(deltaX === 0.){
	if(deltaY === 0.){ //single point
		edge.m = Number.NaN;
		edge.b = Number.NaN;
	}
	else if(deltaY < 0.){ //verticle line
		edge.m = Number.NEGATIVE_INFINITY;
		edge.b = Number.NaN;
	}
	else { //verticle line
		edge.m = Number.POSITIVE_INFINITY;
		edge.b = Number.NaN;
	}
	mid.x = cx;
	mid.y = cy + (deltaY/2.);
}
else if(deltaY === 0.){ //horizontal line
	edge.m = 0.;
	edge.b = cy;
	mid.x = cx + (deltaX/2.);
	mid.y = cy
}
else { //arbitrary slope
	edge.m = deltaY/deltaX;
	edge.b = cy -(edge.m * cx);
	mid.x = cx + (deltaX/2.);
	mid.y = cy + (deltaY/2.)
}
edge.point = mid;

return edge;
}

/*
 *
 *	get the line parameters (slope m and y intercept b)
 *	for each edge and the line that closes the triange
 *	defined by a vertex and its previous and next vertices
 *
 */
function getListParams(polyList,indx){

var prev,next,current,prevElmt,nextElmt;
var point = {};
var edge = {point:{}};
var diag = {point:{}};
	current = polyList[indx];
	prev = polyList[indx].prev;
	next = polyList[indx].next;
	prevElmt = polyList[prev];
	nextElmt = polyList[next];

	//get edge slope, y-intersect and midpoint coordinates
	edge = getLineParams(current,nextElmt);
	current.edge = {};
	current.edge.m = edge.m;
	current.edge.b = edge.b;
	current.edge.point = new point_2d();
	current.edge.point.x = edge.point.x;
	current.edge.point.y = edge.point.y;

	//get diagnal slope, y-intersect and midpoint coordinates
	current.diag = {};
	current.diag.edge = getLineParams(prevElmt,nextElmt);;
}

function triangulate(poly){
var polyList = new Array();
var reflex = new Array();
var concave = new Array();
var earTip = new Array();
var triangles = new Array();
var currentEar,tPrev,tNext,triangle,prev,next,aType,vertxCount;	

//create linked list
for(var i=0;i<poly.length;i++){
	var polyListItem = {};
	polyListItem.point = new point_2d(poly[i].x,poly[i].y);
	if(i === 0)
		polyListItem.prev = poly.length - 1;
	else
		polyListItem.prev = i-1;

	if(i === (poly.length -1))
		polyListItem.next = 0;
	else
		polyListItem.next = i + 1;

	polyList.push(polyListItem);
}


rotation = getRotation(polyList);


//assign vertex edges and diagnals
for(var i=0;i<polyList.length;i++)
	getListParams(polyList,i);

for(var i=0;i<polyList.length;i++){
	angleType(polyList,i,rotation);
	if(polyList[i].isReflex){
		addElement(reflex,i);
	}
	else {
		addElement(concave,i);
		if(polyList[i].isEar){
			element = new Object;
			addElement(earTip,i);
		}
	}
}
//the polygon, reflex, concave and ear tip structures are initialize at this point

vertxCount = polyList.length;
while(vertxCount >= 3){
	for(var i=0;i<earTip.length;i++)
		if(earTip[i].next >= 0)
			break;
	if(i === earTip.length)
		break;
	currentEar = earTip[i];
	tPrev = polyList[currentEar.val].prev;
	tNext = polyList[currentEar.val].next;
	triangle = [tPrev,currentEar.val,tNext];
	triangles.push(triangle);
	removeElement(earTip,currentEar.val);
	removeElement(concave,currentEar.val);
	hidePolyListElement(polyList,currentEar.val);
	getListParams(polyList,tPrev);
	aType = angleType(polyList,tPrev,rotation);
	if(polyList[tPrev].isReflex){
		if(!isElementInList(reflex,tPrev))
			addElement(reflex,tPrev);
		if(isElementInList(concave,tPrev))
			removeElement(concave,tPrev);
		if(isElementInList(earTip,tPrev))
			removeElement(earTip,tPrev);
	}
	else {
		if(!isElementInList(concave,tPrev))
			addElement(concave,tPrev);
		if(isElementInList(reflex,tPrev))
			removeElement(reflex,tPrev);
		if(polyList[tPrev].isEar){
			if(!isElementInList(earTip,tPrev))
				addElement(earTip,tPrev);
		}
		else{
			if(isElementInList(earTip,tPrev))
				removeElement(earTip,tPrev);
		}
	}
	getListParams(polyList,tNext);
	aType = angleType(polyList,tNext,rotation);
	if(polyList[tNext].isReflex){
		if(!isElementInList(reflex,tNext))
			addElement(reflex,tNext);
		if(isElementInList(concave,tNext))
			removeElement(concave,tNext);
		if(isElementInList(earTip,tNext))
			removeElement(earTip,tNext);
	}
	else {
		if(!isElementInList(concave,tNext))
			addElement(concave,tNext);
		if(isElementInList(reflex,tNext))
			removeElement(reflex,tNext);
		if(polyList[tNext].isEar){
			if(!isElementInList(earTip,tNext))
				addElement(earTip,tNext);
		}
		else{
			if(isElementInList(earTip,tNext))
				removeElement(earTip,tNext);
		}
	}
	vertxCount--;
}
return triangles;

}

if (! _.isUndefined(poly)){

	var triangles = [];
    var verts = [];
    var elements = [];

	if (_.isUndefined(style))
		style = "line_loop";

	if(style === "triangles" || style === "triangles_loop" || style === "triangles_strip"){
		// get an array of arrays containing the triangulation of the polygon
		// every element of indx represents an array of three indices of the polygon
		// the points of polygon corresponding to the indices define a triangle
		triangles = triangulate(poly);

		// convert the array of triangle index arrays to a single array of indices
		for(var i=0 ;i<triangles.length;i++){
			for(var j=0;j<3;j++){
				elements.push(triangles[i][j]);
			}
		}
	}
	else {
		for(var i=0;i<poly.length;i++){
			elements.push(i);
		}
	}
	// extract the x and y coordinates of the polygon
	for(var i=0;i<poly.length;i++){
		verts.push(poly[i].x);
		verts.push(poly[i].y);
		
	}
	var uv = Shade(Facet.attribute_buffer({vertex_array:verts, item_size:2}));

	if (! _.isUndefined(vertexColor)){
		// if an array of color values is provided, they will be assigned to the
		// polygon vertices in a round-robin fashion
		
		return Facet.model({
			type: style,
        	elements: Facet.element_buffer(elements),
        	vertex: uv,
			color: vertexColor
    	});
	} else {
    	return Facet.model({
        	type: style,
        	elements: Facet.element_buffer(elements),
        	vertex: uv
		});
	}

} else
throw "poly is a required parameter";
};

Facet.Mesh = {};
Facet.Mesh.indexed = function(vertices, elements)
{
    vertices = vertices.slice();
    elements = elements.slice();
    
    var model = Facet.model({
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
Facet.Scene = {};
Facet.Scene.add = function(obj)
{
    var scene = Facet._globals.ctx._facet_globals.scene;

    scene.push(obj);
    Facet.Scene.invalidate();
};
Facet.Scene.remove = function(obj)
{
    var scene = Facet._globals.ctx._facet_globals.scene;

    var i = scene.indexOf(obj);

    if (i === -1) {
        return undefined;
    } else {
        return scene.splice(i, 1)[0];
    }
    Facet.Scene.invalidate();
};
Facet.Scene.render = function()
{
    var scene = Facet._globals.ctx._facet_globals.scene;
    for (var i=0; i<scene.length; ++i) {
        scene[i].draw();
    }
};
Facet.Scene.invalidate = function()
{
    if (!Facet._globals.ctx._facet_globals.dirty) {
        Facet._globals.ctx._facet_globals.dirty = true;
        var this_ctx = Facet._globals.ctx;
        function draw_it() {
            Facet.set_context(this_ctx);
            this_ctx.display();
            this_ctx._facet_globals.dirty = false;
        }
        window.requestAnimFrame(draw_it, this_ctx);
    }
};
