!function(a){"object"==typeof exports&&"object"==typeof module?a(require("../../lib/codemirror"),require("../htmlmixed/htmlmixed")):"function"==typeof define&&define.amd?define(["../../lib/codemirror","../htmlmixed/htmlmixed"],a):a(CodeMirror)}(function(a){"use strict";var b=["template","literal","msg","fallbackmsg","let","if","elseif","else","switch","case","default","foreach","ifempty","for","call","param","deltemplate","delcall","log"];a.defineMode("soy",function(c){function d(a){return a[a.length-1]}function e(a,b,c){if(a.sol()){for(var e=0;e<b.indent&&a.eat(/\s/);e++);if(e)return null}var f=a.string,g=c.exec(f.substr(a.pos));g&&(a.string=f.substr(0,a.pos+g.index));var h=a.hideFirstChars(b.indent,function(){var c=d(b.localStates);return c.mode.token(a,c.state)});return a.string=f,h}function f(a,b){for(;a;){if(a.element===b)return!0;a=a.next}return!1}function g(a,b){return{element:b,next:a}}function h(a,b,c){return f(a,b)?"variable-2":c?"variable":"variable-2 error"}function i(a){a.scopes&&(a.variables=a.scopes.element,a.scopes=a.scopes.next)}var j=a.getMode(c,"text/plain"),k={html:a.getMode(c,{name:"text/html",multilineTagIndentFactor:2,multilineTagIndentPastTag:!1}),attributes:j,text:j,uri:j,css:a.getMode(c,"text/css"),js:a.getMode(c,{name:"text/javascript",statementIndent:2*c.indentUnit})};return{startState:function(){return{kind:[],kindTag:[],soyState:[],templates:null,variables:g(null,"ij"),scopes:null,indent:0,quoteKind:null,localStates:[{mode:k.html,state:a.startState(k.html)}]}},copyState:function(b){return{tag:b.tag,kind:b.kind.concat([]),kindTag:b.kindTag.concat([]),soyState:b.soyState.concat([]),templates:b.templates,variables:b.variables,scopes:b.scopes,indent:b.indent,quoteKind:b.quoteKind,localStates:b.localStates.map(function(b){return{mode:b.mode,state:a.copyState(b.mode,b.state)}})}},token:function(f,j){var l;switch(d(j.soyState)){case"comment":if(f.match(/^.*?\*\//)?j.soyState.pop():f.skipToEnd(),!j.scopes)for(var l,m=/@param\??\s+(\S+)/g,n=f.current();l=m.exec(n);)j.variables=g(j.variables,l[1]);return"comment";case"templ-def":return(l=f.match(/^\.?([\w]+(?!\.[\w]+)*)/))?(j.templates=g(j.templates,l[1]),j.scopes=g(j.scopes,j.variables),j.soyState.pop(),"def"):(f.next(),null);case"templ-ref":return(l=f.match(/^\.?([\w]+)/))?(j.soyState.pop(),"."==l[0][0]?h(j.templates,l[1],!0):"variable"):(f.next(),null);case"param-def":return(l=f.match(/^\w+/))?(j.variables=g(j.variables,l[0]),j.soyState.pop(),j.soyState.push("param-type"),"def"):(f.next(),null);case"param-type":return"}"==f.peek()?(j.soyState.pop(),null):f.eatWhile(/^[\w]+/)?"variable-3":(f.next(),null);case"var-def":return(l=f.match(/^\$([\w]+)/))?(j.variables=g(j.variables,l[1]),j.soyState.pop(),"def"):(f.next(),null);case"tag":if(f.match(/^\/?}/))return"/template"==j.tag||"/deltemplate"==j.tag?(i(j),j.variables=g(null,"ij"),j.indent=0):("/for"!=j.tag&&"/foreach"!=j.tag||i(j),j.indent-=c.indentUnit*("/}"==f.current()||b.indexOf(j.tag)==-1?2:1)),j.soyState.pop(),"keyword";if(f.match(/^([\w?]+)(?==)/)){if("kind"==f.current()&&(l=f.match(/^="([^"]+)/,!1))){var o=l[1];j.kind.push(o),j.kindTag.push(j.tag);var p=k[o]||k.html,q=d(j.localStates);q.mode.indent&&(j.indent+=q.mode.indent(q.state,"")),j.localStates.push({mode:p,state:a.startState(p)})}return"attribute"}return(l=f.match(/^["']/))?(j.soyState.push("string"),j.quoteKind=l,"string"):(l=f.match(/^\$([\w]+)/))?h(j.variables,l[1]):(l=f.match(/^\w+/))?/^(?:as|and|or|not|in)$/.test(l[0])?"keyword":null:(f.next(),null);case"literal":return f.match(/^(?=\{\/literal})/)?(j.indent-=c.indentUnit,j.soyState.pop(),this.token(f,j)):e(f,j,/\{\/literal}/);case"string":var l=f.match(/^.*?(["']|\\[\s\S])/);return l?l[1]==j.quoteKind&&(j.quoteKind=null,j.soyState.pop()):f.skipToEnd(),"string"}if(f.match(/^\/\*/))return j.soyState.push("comment"),j.scopes||(j.variables=g(null,"ij")),"comment";if(f.match(f.sol()?/^\s*\/\/.*/:/^\s+\/\/.*/))return j.scopes||(j.variables=g(null,"ij")),"comment";if(f.match(/^\{literal}/))return j.indent+=c.indentUnit,j.soyState.push("literal"),"keyword";if(l=f.match(/^\{([\/@\\]?\w+\??)(?=[\s\}])/)){if("/switch"!=l[1]&&(j.indent+=(/^(\/|(else|elseif|ifempty|case|fallbackmsg|default)$)/.test(l[1])&&"switch"!=j.tag?1:2)*c.indentUnit),j.tag=l[1],j.tag=="/"+d(j.kindTag)){j.kind.pop(),j.kindTag.pop(),j.localStates.pop();var q=d(j.localStates);q.mode.indent&&(j.indent-=q.mode.indent(q.state,""))}return j.soyState.push("tag"),"template"==j.tag||"deltemplate"==j.tag?j.soyState.push("templ-def"):"call"==j.tag||"delcall"==j.tag?j.soyState.push("templ-ref"):"let"==j.tag?j.soyState.push("var-def"):"for"==j.tag||"foreach"==j.tag?(j.scopes=g(j.scopes,j.variables),j.soyState.push("var-def")):"namespace"==j.tag?j.scopes||(j.variables=g(null,"ij")):j.tag.match(/^@(?:param\??|inject)/)&&j.soyState.push("param-def"),"keyword"}return f.eat("{")?(j.tag="print",j.indent+=2*c.indentUnit,j.soyState.push("tag"),"keyword"):e(f,j,/\{|\s+\/\/|\/\*/)},indent:function(b,e){var f=b.indent,g=d(b.soyState);if("comment"==g)return a.Pass;if("literal"==g)/^\{\/literal}/.test(e)&&(f-=c.indentUnit);else{if(/^\s*\{\/(template|deltemplate)\b/.test(e))return 0;/^\{(\/|(fallbackmsg|elseif|else|ifempty)\b)/.test(e)&&(f-=c.indentUnit),"switch"!=b.tag&&/^\{(case|default)\b/.test(e)&&(f-=c.indentUnit),/^\{\/switch\b/.test(e)&&(f-=c.indentUnit)}var h=d(b.localStates);return f&&h.mode.indent&&(f+=h.mode.indent(h.state,e)),f},innerMode:function(a){return a.soyState.length&&"literal"!=d(a.soyState)?null:d(a.localStates)},electricInput:/^\s*\{(\/|\/template|\/deltemplate|\/switch|fallbackmsg|elseif|else|case|default|ifempty|\/literal\})$/,lineComment:"//",blockCommentStart:"/*",blockCommentEnd:"*/",blockCommentContinue:" * ",useInnerComments:!1,fold:"indent"}},"htmlmixed"),a.registerHelper("hintWords","soy",b.concat(["delpackage","namespace","alias","print","css","debugger"])),a.defineMIME("text/x-soy","soy")});