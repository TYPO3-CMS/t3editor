!function(t){"object"==typeof exports&&"object"==typeof module?t(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],t):t(CodeMirror)}(function(t){"use strict";var r=t.Pos;function e(t,r,e){for(var n=e.paragraphStart||t.getHelper(r,"paragraphStart"),o=r.line,a=t.firstLine();o>a;--o){var i=t.getLine(o);if(n&&n.test(i))break;if(!/\S/.test(i)){++o;break}}for(var f=e.paragraphEnd||t.getHelper(r,"paragraphEnd"),l=r.line+1,h=t.lastLine();l<=h;++l){i=t.getLine(l);if(f&&f.test(i)){++l;break}if(!/\S/.test(i))break}return{from:o,to:l}}function n(t,r,e,n){for(var o=r;o<t.length&&" "==t.charAt(o);)o++;for(;o>0&&!e.test(t.slice(o-1,o+1));--o);for(var a=!0;;a=!1){var i=o;if(n)for(;" "==t.charAt(i-1);)--i;if(0!=i||!a)return{from:i,to:o};o=r}}function o(e,o,a,i){o=e.clipPos(o),a=e.clipPos(a);var f=i.column||80,l=i.wrapOn||/\s\S|-[^\.\d]/,h=!1!==i.killTrailingSpace,s=[],c="",g=o.line,p=e.getRange(o,a,!1);if(!p.length)return null;var u=p[0].match(/^[ \t]*/)[0];u.length>=f&&(f=u.length+1);for(var m=0;m<p.length;++m){var v=p[m],d=c.length,b=0;c&&v&&!l.test(c.charAt(c.length-1)+v.charAt(0))&&(c+=" ",b=1);var x="";if(m&&(x=v.match(/^\s*/)[0],v=v.slice(x.length)),c+=v,m){var S=c.length>f&&u==x&&n(c,f,l,h);S&&S.from==d&&S.to==d+b?(c=u+v,++g):s.push({text:[b?" ":""],from:r(g,d),to:r(g+1,x.length)})}for(;c.length>f;){var E=n(c,f,l,h);s.push({text:["",u],from:r(g,E.from),to:r(g,E.to)}),c=u+c.slice(E.to),++g}}return s.length&&e.operation(function(){for(var r=0;r<s.length;++r){var n=s[r];(n.text||t.cmpPos(n.from,n.to))&&e.replaceRange(n.text,n.from,n.to)}}),s.length?{from:s[0].from,to:t.changeEnd(s[s.length-1])}:null}t.defineExtension("wrapParagraph",function(t,n){n=n||{},t||(t=this.getCursor());var a=e(this,t,n);return o(this,r(a.from,0),r(a.to-1),n)}),t.commands.wrapLines=function(t){t.operation(function(){for(var n=t.listSelections(),a=t.lastLine()+1,i=n.length-1;i>=0;i--){var f,l=n[i];if(l.empty()){var h=e(t,l.head,{});f={from:r(h.from,0),to:r(h.to-1)}}else f={from:l.from(),to:l.to()};f.to.line>=a||(a=f.from.line,o(t,f.from,f.to,{}))}})},t.defineExtension("wrapRange",function(t,r,e){return o(this,t,r,e||{})}),t.defineExtension("wrapParagraphsInRange",function(t,n,a){a=a||{};for(var i=this,f=[],l=t.line;l<=n.line;){var h=e(i,r(l,0),a);f.push(h),l=h.to}var s=!1;return f.length&&i.operation(function(){for(var t=f.length-1;t>=0;--t)s=s||o(i,r(f[t].from,0),r(f[t].to-1),a)}),s})});