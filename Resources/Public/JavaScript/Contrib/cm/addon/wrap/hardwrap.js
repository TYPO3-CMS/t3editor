!function(r){"object"==typeof exports&&"object"==typeof module?r(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],r):r(CodeMirror)}((function(r){"use strict";var t=r.Pos;function e(r,t,e){for(var n=e.paragraphStart||r.getHelper(t,"paragraphStart"),o=t.line,a=r.firstLine();o>a;--o){var i=r.getLine(o);if(n&&n.test(i))break;if(!/\S/.test(i)){++o;break}}for(var f=e.paragraphEnd||r.getHelper(t,"paragraphEnd"),l=t.line+1,h=r.lastLine();l<=h;++l){i=r.getLine(l);if(f&&f.test(i)){++l;break}if(!/\S/.test(i))break}return{from:o,to:l}}function n(r,t,e,n,o){for(var a=t;a<r.length&&" "==r.charAt(a);)a++;for(;a>0&&!e.test(r.slice(a-1,a+1));--a);if(0==a&&!o)for(a=t+1;a<r.length-1&&!e.test(r.slice(a-1,a+1));++a);for(var i=!0;;i=!1){var f=a;if(n)for(;" "==r.charAt(f-1);)--f;if(0!=f||!i)return{from:f,to:a};a=t}}function o(e,o,a,i){o=e.clipPos(o),a=e.clipPos(a);var f=i.column||80,l=i.wrapOn||/\s\S|-[^\.\d]/,h=!1!==i.forceBreak,s=!1!==i.killTrailingSpace,c=[],g="",p=o.line,m=e.getRange(o,a,!1);if(!m.length)return null;var u=m[0].match(/^[ \t]*/)[0];u.length>=f&&(f=u.length+1);for(var v=0;v<m.length;++v){var d=m[v],b=g.length,x=0;g&&d&&!l.test(g.charAt(g.length-1)+d.charAt(0))&&(g+=" ",x=1);var k="";if(v&&(k=d.match(/^\s*/)[0],d=d.slice(k.length)),g+=d,v){var S=g.length>f&&u==k&&n(g,f,l,s,h);S&&S.from==b&&S.to==b+x?(g=u+d,++p):c.push({text:[x?" ":""],from:t(p,b),to:t(p+1,k.length)})}for(;g.length>f;){var E=n(g,f,l,s,h);if(E.from==E.to&&!h)break;c.push({text:["",u],from:t(p,E.from),to:t(p,E.to)}),g=u+g.slice(E.to),++p}}return c.length&&e.operation((function(){for(var t=0;t<c.length;++t){var n=c[t];(n.text||r.cmpPos(n.from,n.to))&&e.replaceRange(n.text,n.from,n.to)}})),c.length?{from:c[0].from,to:r.changeEnd(c[c.length-1])}:null}r.defineExtension("wrapParagraph",(function(r,n){n=n||{},r||(r=this.getCursor());var a=e(this,r,n);return o(this,t(a.from,0),t(a.to-1),n)})),r.commands.wrapLines=function(r){r.operation((function(){for(var n=r.listSelections(),a=r.lastLine()+1,i=n.length-1;i>=0;i--){var f,l=n[i];if(l.empty()){var h=e(r,l.head,{});f={from:t(h.from,0),to:t(h.to-1)}}else f={from:l.from(),to:l.to()};f.to.line>=a||(a=f.from.line,o(r,f.from,f.to,{}))}}))},r.defineExtension("wrapRange",(function(r,t,e){return o(this,r,t,e||{})})),r.defineExtension("wrapParagraphsInRange",(function(r,n,a){a=a||{};for(var i=this,f=[],l=r.line;l<=n.line;){var h=e(i,t(l,0),a);f.push(h),l=h.to}var s=!1;return f.length&&i.operation((function(){for(var r=f.length-1;r>=0;--r)s=s||o(i,t(f[r].from,0),t(f[r].to-1),a)})),s}))}));