!function(a){"object"==typeof exports&&"object"==typeof module?a(require("../../lib/codemirror"),require("../clike/clike")):"function"==typeof define&&define.amd?define(["../../lib/codemirror","../clike/clike"],a):a(CodeMirror)}(function(a){"use strict";function b(a){for(var b={},c=0;c<a.length;++c)b[a[c]]=!0;return b}function c(a){(a.interpolationStack||(a.interpolationStack=[])).push(a.tokenize)}function d(a){return(a.interpolationStack||(a.interpolationStack=[])).pop()}function e(a){return a.interpolationStack?a.interpolationStack.length:0}function f(a,b,d,e){function f(b,d){for(var f=!1;!b.eol();){if(!e&&!f&&"$"==b.peek())return c(d),d.tokenize=g,"string";var i=b.next();if(i==a&&!f&&(!h||b.match(a+a))){d.tokenize=null;break}f=!e&&!f&&"\\"==i}return"string"}var h=!1;if(b.eat(a)){if(!b.eat(a))return"string";h=!0}return d.tokenize=f,f(b,d)}function g(a,b){return a.eat("$"),a.eat("{")?b.tokenize=null:b.tokenize=h,null}function h(a,b){return a.eatWhile(/[\w_]/),b.tokenize=d(b),"variable"}function i(a){return function(b,c){for(var d;d=b.next();){if("*"==d&&b.eat("/")){if(1==a){c.tokenize=null;break}return c.tokenize=i(a-1),c.tokenize(b,c)}if("/"==d&&b.eat("*"))return c.tokenize=i(a+1),c.tokenize(b,c)}return"comment"}}var j="this super static final const abstract class extends external factory implements get native operator set typedef with enum throw rethrow assert break case continue default in return new deferred async await covariant try catch finally do else for if switch while import library export part of show hide is as".split(" "),k="try catch finally do else for if switch while".split(" "),l="true false null".split(" "),m="void bool num int double dynamic var String".split(" ");a.defineMIME("application/dart",{name:"clike",keywords:b(j),blockKeywords:b(k),builtin:b(m),atoms:b(l),hooks:{"@":function(a){return a.eatWhile(/[\w\$_\.]/),"meta"},"'":function(a,b){return f("'",a,b,!1)},'"':function(a,b){return f('"',a,b,!1)},r:function(a,b){var c=a.peek();return("'"==c||'"'==c)&&f(a.next(),a,b,!0)},"}":function(a,b){return e(b)>0&&(b.tokenize=d(b),null)},"/":function(a,b){return!!a.eat("*")&&(b.tokenize=i(1),b.tokenize(a,b))}}}),a.registerHelper("hintWords","application/dart",j.concat(l).concat(m)),a.defineMode("dart",function(b){return a.getMode(b,"application/dart")},"clike")});