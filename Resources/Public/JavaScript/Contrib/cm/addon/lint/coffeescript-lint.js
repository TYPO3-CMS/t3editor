!function(a){"object"==typeof exports&&"object"==typeof module?a(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],a):a(CodeMirror)}(function(a){"use strict";a.registerHelper("lint","coffeescript",function(b){var c=[];if(!window.coffeelint)return window.console&&window.console.error("Error: window.coffeelint not defined, CodeMirror CoffeeScript linting cannot run."),c;var d=function(b){var d=b.lineNumber;c.push({from:a.Pos(d-1,0),to:a.Pos(d,0),severity:b.level,message:b.message})};try{for(var e=coffeelint.lint(b),f=0;f<e.length;f++)d(e[f])}catch(b){c.push({from:a.Pos(b.location.first_line,0),to:a.Pos(b.location.last_line,b.location.last_column),severity:"error",message:b.message})}return c})});