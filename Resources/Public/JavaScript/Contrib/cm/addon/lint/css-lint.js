!function(e){"object"==typeof exports&&"object"==typeof module?e(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],e):e(CodeMirror)}((function(e){"use strict";e.registerHelper("lint","css",(function(o,r){var n=[];if(!window.CSSLint)return window.console&&window.console.error("Error: window.CSSLint not defined, CodeMirror CSS linting cannot run."),n;for(var i=CSSLint.verify(o,r).messages,t=null,s=0;s<i.length;s++){var c=(t=i[s]).line-1,d=t.line-1,f=t.col-1,l=t.col;n.push({from:e.Pos(c,f),to:e.Pos(d,l),message:t.message,severity:t.type})}return n}))}));