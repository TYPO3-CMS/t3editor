!function(a){"object"==typeof exports&&"object"==typeof module?a(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],a):a(CodeMirror)}(function(a){"use strict";a.runMode=function(b,c,d,e){var f=a.getMode(a.defaults,c),g=/MSIE \d/.test(navigator.userAgent),h=g&&(null==document.documentMode||document.documentMode<9);if(d.appendChild){var i=e&&e.tabSize||a.defaults.tabSize,j=d,k=0;j.innerHTML="",d=function(a,b){if("\n"==a)return j.appendChild(document.createTextNode(h?"\r":a)),void(k=0);for(var c="",d=0;;){var e=a.indexOf("\t",d);if(e==-1){c+=a.slice(d),k+=a.length-d;break}k+=e-d,c+=a.slice(d,e);var f=i-k%i;k+=f;for(var g=0;g<f;++g)c+=" ";d=e+1}if(b){var l=j.appendChild(document.createElement("span"));l.className="cm-"+b.replace(/ +/g," cm-"),l.appendChild(document.createTextNode(c))}else j.appendChild(document.createTextNode(c))}}for(var l=a.splitLines(b),m=e&&e.state||a.startState(f),n=0,o=l.length;n<o;++n){n&&d("\n");var p=new a.StringStream(l[n]);for(!p.string&&f.blankLine&&f.blankLine(m);!p.eol();){var q=f.token(p,m);d(p.current(),q,n,p.start,m),p.start=p.pos}}}});