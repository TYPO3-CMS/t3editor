!function(a){"object"==typeof exports&&"object"==typeof module?a(require("../lib/codemirror"),require("../addon/search/searchcursor"),require("../addon/edit/matchbrackets")):"function"==typeof define&&define.amd?define(["../lib/codemirror","../addon/search/searchcursor","../addon/edit/matchbrackets"],a):a(CodeMirror)}(function(a){"use strict";function b(b,c,d){if(d<0&&0==c.ch)return b.clipPos(n(c.line-1));var e=b.getLine(c.line);if(d>0&&c.ch>=e.length)return b.clipPos(n(c.line+1,0));for(var f,g="start",h=c.ch,i=d<0?0:e.length,j=0;h!=i;h+=d,j++){var k=e.charAt(d<0?h-1:h),l="_"!=k&&a.isWordChar(k)?"w":"o";if("w"==l&&k.toUpperCase()==k&&(l="W"),"start"==g)"o"!=l&&(g="in",f=l);else if("in"==g&&f!=l){if("w"==f&&"W"==l&&d<0&&h--,"W"==f&&"w"==l&&d>0){f="w";continue}break}}return n(c.line,h)}function c(a,c){a.extendSelectionsBy(function(d){return a.display.shift||a.doc.extend||d.empty()?b(a.doc,d.head,c):c<0?d.from():d.to()})}function d(b,c){return b.isReadOnly()?a.Pass:(b.operation(function(){for(var a=b.listSelections().length,d=[],e=-1,f=0;f<a;f++){var g=b.listSelections()[f].head;if(!(g.line<=e)){var h=n(g.line+(c?0:1),0);b.replaceRange("\n",h,null,"+insertLine"),b.indentLine(h.line,null,!0),d.push({head:h,anchor:h}),e=g.line+1}}b.setSelections(d)}),void b.execCommand("indentAuto"))}function e(b,c){for(var d=c.ch,e=d,f=b.getLine(c.line);d&&a.isWordChar(f.charAt(d-1));)--d;for(;e<f.length&&a.isWordChar(f.charAt(e));)++e;return{from:n(c.line,d),to:n(c.line,e),word:f.slice(d,e)}}function f(a,b){for(var c=a.listSelections(),d=[],e=0;e<c.length;e++){var f=c[e],g=a.findPosV(f.anchor,b,"line",f.anchor.goalColumn),h=a.findPosV(f.head,b,"line",f.head.goalColumn);g.goalColumn=null!=f.anchor.goalColumn?f.anchor.goalColumn:a.cursorCoords(f.anchor,"div").left,h.goalColumn=null!=f.head.goalColumn?f.head.goalColumn:a.cursorCoords(f.head,"div").left;var i={anchor:g,head:h};d.push(f),d.push(i)}a.setSelections(d)}function g(a,b,c){for(var d=0;d<a.length;d++)if(a[d].from()==b&&a[d].to()==c)return!0;return!1}function h(b){for(var c=b.listSelections(),d=[],e=0;e<c.length;e++){var f=c[e],g=f.head,h=b.scanForBracket(g,-1);if(!h)return!1;for(;;){var i=b.scanForBracket(g,1);if(!i)return!1;if(i.ch==o.charAt(o.indexOf(h.ch)+1)){var j=n(h.pos.line,h.pos.ch+1);if(0!=a.cmpPos(j,f.from())||0!=a.cmpPos(i.pos,f.to())){d.push({anchor:j,head:i.pos});break}if(h=b.scanForBracket(h.pos,-1),!h)return!1}g=n(i.pos.line,i.pos.ch+1)}}return b.setSelections(d),!0}function i(b,c){if(b.isReadOnly())return a.Pass;for(var d,e=b.listSelections(),f=[],g=0;g<e.length;g++){var h=e[g];if(!h.empty()){for(var i=h.from().line,j=h.to().line;g<e.length-1&&e[g+1].from().line==j;)j=e[++g].to().line;e[g].to().ch||j--,f.push(i,j)}}f.length?d=!0:f.push(b.firstLine(),b.lastLine()),b.operation(function(){for(var a=[],e=0;e<f.length;e+=2){var g=f[e],h=f[e+1],i=n(g,0),j=n(h),k=b.getRange(i,j,!1);c?k.sort():k.sort(function(a,b){var c=a.toUpperCase(),d=b.toUpperCase();return c!=d&&(a=c,b=d),a<b?-1:a==b?0:1}),b.replaceRange(k,i,j),d&&a.push({anchor:i,head:n(h+1,0)})}d&&b.setSelections(a,0)})}function j(b,c){b.operation(function(){for(var d=b.listSelections(),f=[],g=[],h=0;h<d.length;h++){var i=d[h];i.empty()?(f.push(h),g.push("")):g.push(c(b.getRange(i.from(),i.to())))}b.replaceSelections(g,"around","case");for(var j,h=f.length-1;h>=0;h--){var i=d[f[h]];if(!(j&&a.cmpPos(i.head,j)>0)){var k=e(b,i.head);j=k.from,b.replaceRange(c(k.word),k.from,k.to)}}})}function k(b){var c=b.getCursor("from"),d=b.getCursor("to");if(0==a.cmpPos(c,d)){var f=e(b,c);if(!f.word)return;c=f.from,d=f.to}return{from:c,to:d,query:b.getRange(c,d),word:f}}function l(a,b){var c=k(a);if(c){var d=c.query,e=a.getSearchCursor(d,b?c.to:c.from);(b?e.findNext():e.findPrevious())?a.setSelection(e.from(),e.to()):(e=a.getSearchCursor(d,b?n(a.firstLine(),0):a.clipPos(n(a.lastLine()))),(b?e.findNext():e.findPrevious())?a.setSelection(e.from(),e.to()):c.word&&a.setSelection(c.from,c.to))}}var m=a.commands,n=a.Pos;m.goSubwordLeft=function(a){c(a,-1)},m.goSubwordRight=function(a){c(a,1)},m.scrollLineUp=function(a){var b=a.getScrollInfo();if(!a.somethingSelected()){var c=a.lineAtHeight(b.top+b.clientHeight,"local");a.getCursor().line>=c&&a.execCommand("goLineUp")}a.scrollTo(null,b.top-a.defaultTextHeight())},m.scrollLineDown=function(a){var b=a.getScrollInfo();if(!a.somethingSelected()){var c=a.lineAtHeight(b.top,"local")+1;a.getCursor().line<=c&&a.execCommand("goLineDown")}a.scrollTo(null,b.top+a.defaultTextHeight())},m.splitSelectionByLine=function(a){for(var b=a.listSelections(),c=[],d=0;d<b.length;d++)for(var e=b[d].from(),f=b[d].to(),g=e.line;g<=f.line;++g)f.line>e.line&&g==f.line&&0==f.ch||c.push({anchor:g==e.line?e:n(g,0),head:g==f.line?f:n(g)});a.setSelections(c,0)},m.singleSelectionTop=function(a){var b=a.listSelections()[0];a.setSelection(b.anchor,b.head,{scroll:!1})},m.selectLine=function(a){for(var b=a.listSelections(),c=[],d=0;d<b.length;d++){var e=b[d];c.push({anchor:n(e.from().line,0),head:n(e.to().line+1,0)})}a.setSelections(c)},m.insertLineAfter=function(a){return d(a,!1)},m.insertLineBefore=function(a){return d(a,!0)},m.selectNextOccurrence=function(b){var c=b.getCursor("from"),d=b.getCursor("to"),f=b.state.sublimeFindFullWord==b.doc.sel;if(0==a.cmpPos(c,d)){var h=e(b,c);if(!h.word)return;b.setSelection(h.from,h.to),f=!0}else{var i=b.getRange(c,d),j=f?new RegExp("\\b"+i+"\\b"):i,k=b.getSearchCursor(j,d),l=k.findNext();if(l||(k=b.getSearchCursor(j,n(b.firstLine(),0)),l=k.findNext()),!l||g(b.listSelections(),k.from(),k.to()))return a.Pass;b.addSelection(k.from(),k.to())}f&&(b.state.sublimeFindFullWord=b.doc.sel)},m.addCursorToPrevLine=function(a){f(a,-1)},m.addCursorToNextLine=function(a){f(a,1)};var o="(){}[]";m.selectScope=function(a){h(a)||a.execCommand("selectAll")},m.selectBetweenBrackets=function(b){if(!h(b))return a.Pass},m.goToBracket=function(b){b.extendSelectionsBy(function(c){var d=b.scanForBracket(c.head,1);if(d&&0!=a.cmpPos(d.pos,c.head))return d.pos;var e=b.scanForBracket(c.head,-1);return e&&n(e.pos.line,e.pos.ch+1)||c.head})},m.swapLineUp=function(b){if(b.isReadOnly())return a.Pass;for(var c=b.listSelections(),d=[],e=b.firstLine()-1,f=[],g=0;g<c.length;g++){var h=c[g],i=h.from().line-1,j=h.to().line;f.push({anchor:n(h.anchor.line-1,h.anchor.ch),head:n(h.head.line-1,h.head.ch)}),0!=h.to().ch||h.empty()||--j,i>e?d.push(i,j):d.length&&(d[d.length-1]=j),e=j}b.operation(function(){for(var a=0;a<d.length;a+=2){var c=d[a],e=d[a+1],g=b.getLine(c);b.replaceRange("",n(c,0),n(c+1,0),"+swapLine"),e>b.lastLine()?b.replaceRange("\n"+g,n(b.lastLine()),null,"+swapLine"):b.replaceRange(g+"\n",n(e,0),null,"+swapLine")}b.setSelections(f),b.scrollIntoView()})},m.swapLineDown=function(b){if(b.isReadOnly())return a.Pass;for(var c=b.listSelections(),d=[],e=b.lastLine()+1,f=c.length-1;f>=0;f--){var g=c[f],h=g.to().line+1,i=g.from().line;0!=g.to().ch||g.empty()||h--,h<e?d.push(h,i):d.length&&(d[d.length-1]=i),e=i}b.operation(function(){for(var a=d.length-2;a>=0;a-=2){var c=d[a],e=d[a+1],f=b.getLine(c);c==b.lastLine()?b.replaceRange("",n(c-1),n(c),"+swapLine"):b.replaceRange("",n(c,0),n(c+1,0),"+swapLine"),b.replaceRange(f+"\n",n(e,0),null,"+swapLine")}b.scrollIntoView()})},m.toggleCommentIndented=function(a){a.toggleComment({indent:!0})},m.joinLines=function(a){for(var b=a.listSelections(),c=[],d=0;d<b.length;d++){for(var e=b[d],f=e.from(),g=f.line,h=e.to().line;d<b.length-1&&b[d+1].from().line==h;)h=b[++d].to().line;c.push({start:g,end:h,anchor:!e.empty()&&f})}a.operation(function(){for(var b=0,d=[],e=0;e<c.length;e++){for(var f,g=c[e],h=g.anchor&&n(g.anchor.line-b,g.anchor.ch),i=g.start;i<=g.end;i++){var j=i-b;i==g.end&&(f=n(j,a.getLine(j).length+1)),j<a.lastLine()&&(a.replaceRange(" ",n(j),n(j+1,/^\s*/.exec(a.getLine(j+1))[0].length)),++b)}d.push({anchor:h||f,head:f})}a.setSelections(d,0)})},m.duplicateLine=function(a){a.operation(function(){for(var b=a.listSelections().length,c=0;c<b;c++){var d=a.listSelections()[c];d.empty()?a.replaceRange(a.getLine(d.head.line)+"\n",n(d.head.line,0)):a.replaceRange(a.getRange(d.from(),d.to()),d.from())}a.scrollIntoView()})},m.sortLines=function(a){i(a,!0)},m.sortLinesInsensitive=function(a){i(a,!1)},m.nextBookmark=function(a){var b=a.state.sublimeBookmarks;if(b)for(;b.length;){var c=b.shift(),d=c.find();if(d)return b.push(c),a.setSelection(d.from,d.to)}},m.prevBookmark=function(a){var b=a.state.sublimeBookmarks;if(b)for(;b.length;){b.unshift(b.pop());var c=b[b.length-1].find();if(c)return a.setSelection(c.from,c.to);b.pop()}},m.toggleBookmark=function(a){for(var b=a.listSelections(),c=a.state.sublimeBookmarks||(a.state.sublimeBookmarks=[]),d=0;d<b.length;d++){for(var e=b[d].from(),f=b[d].to(),g=b[d].empty()?a.findMarksAt(e):a.findMarks(e,f),h=0;h<g.length;h++)if(g[h].sublimeBookmark){g[h].clear();for(var i=0;i<c.length;i++)c[i]==g[h]&&c.splice(i--,1);break}h==g.length&&c.push(a.markText(e,f,{sublimeBookmark:!0,clearWhenEmpty:!1}))}},m.clearBookmarks=function(a){var b=a.state.sublimeBookmarks;if(b)for(var c=0;c<b.length;c++)b[c].clear();b.length=0},m.selectBookmarks=function(a){var b=a.state.sublimeBookmarks,c=[];if(b)for(var d=0;d<b.length;d++){var e=b[d].find();e?c.push({anchor:e.from,head:e.to}):b.splice(d--,0)}c.length&&a.setSelections(c,0)},m.smartBackspace=function(b){return b.somethingSelected()?a.Pass:void b.operation(function(){for(var c=b.listSelections(),d=b.getOption("indentUnit"),e=c.length-1;e>=0;e--){var f=c[e].head,g=b.getRange({line:f.line,ch:0},f),h=a.countColumn(g,null,b.getOption("tabSize")),i=b.findPosH(f,-1,"char",!1);if(g&&!/\S/.test(g)&&h%d==0){var j=new n(f.line,a.findColumn(g,h-d,d));j.ch!=f.ch&&(i=j)}b.replaceRange("",i,f,"+delete")}})},m.delLineRight=function(a){a.operation(function(){for(var b=a.listSelections(),c=b.length-1;c>=0;c--)a.replaceRange("",b[c].anchor,n(b[c].to().line),"+delete");a.scrollIntoView()})},m.upcaseAtCursor=function(a){j(a,function(a){return a.toUpperCase()})},m.downcaseAtCursor=function(a){j(a,function(a){return a.toLowerCase()})},m.setSublimeMark=function(a){a.state.sublimeMark&&a.state.sublimeMark.clear(),a.state.sublimeMark=a.setBookmark(a.getCursor())},m.selectToSublimeMark=function(a){var b=a.state.sublimeMark&&a.state.sublimeMark.find();b&&a.setSelection(a.getCursor(),b)},m.deleteToSublimeMark=function(b){var c=b.state.sublimeMark&&b.state.sublimeMark.find();if(c){var d=b.getCursor(),e=c;if(a.cmpPos(d,e)>0){var f=e;e=d,d=f}b.state.sublimeKilled=b.getRange(d,e),b.replaceRange("",d,e)}},m.swapWithSublimeMark=function(a){var b=a.state.sublimeMark&&a.state.sublimeMark.find();b&&(a.state.sublimeMark.clear(),a.state.sublimeMark=a.setBookmark(a.getCursor()),a.setCursor(b))},m.sublimeYank=function(a){null!=a.state.sublimeKilled&&a.replaceSelection(a.state.sublimeKilled,null,"paste")},m.showInCenter=function(a){var b=a.cursorCoords(null,"local");a.scrollTo(null,(b.top+b.bottom)/2-a.getScrollInfo().clientHeight/2)},m.findUnder=function(a){l(a,!0)},m.findUnderPrevious=function(a){l(a,!1)},m.findAllUnder=function(a){var b=k(a);if(b){for(var c=a.getSearchCursor(b.query),d=[],e=-1;c.findNext();)d.push({anchor:c.from(),head:c.to()}),c.from().line<=b.from.line&&c.from().ch<=b.from.ch&&e++;a.setSelections(d,e)}};var p=a.keyMap;p.macSublime={"Cmd-Left":"goLineStartSmart","Shift-Tab":"indentLess","Shift-Ctrl-K":"deleteLine","Alt-Q":"wrapLines","Ctrl-Left":"goSubwordLeft","Ctrl-Right":"goSubwordRight","Ctrl-Alt-Up":"scrollLineUp","Ctrl-Alt-Down":"scrollLineDown","Cmd-L":"selectLine","Shift-Cmd-L":"splitSelectionByLine",Esc:"singleSelectionTop","Cmd-Enter":"insertLineAfter","Shift-Cmd-Enter":"insertLineBefore","Cmd-D":"selectNextOccurrence","Shift-Cmd-Space":"selectScope","Shift-Cmd-M":"selectBetweenBrackets","Cmd-M":"goToBracket","Cmd-Ctrl-Up":"swapLineUp","Cmd-Ctrl-Down":"swapLineDown","Cmd-/":"toggleCommentIndented","Cmd-J":"joinLines","Shift-Cmd-D":"duplicateLine",F9:"sortLines","Cmd-F9":"sortLinesInsensitive",F2:"nextBookmark","Shift-F2":"prevBookmark","Cmd-F2":"toggleBookmark","Shift-Cmd-F2":"clearBookmarks","Alt-F2":"selectBookmarks",Backspace:"smartBackspace","Cmd-K Cmd-K":"delLineRight","Cmd-K Cmd-U":"upcaseAtCursor","Cmd-K Cmd-L":"downcaseAtCursor","Cmd-K Cmd-Space":"setSublimeMark","Cmd-K Cmd-A":"selectToSublimeMark","Cmd-K Cmd-W":"deleteToSublimeMark","Cmd-K Cmd-X":"swapWithSublimeMark","Cmd-K Cmd-Y":"sublimeYank","Cmd-K Cmd-C":"showInCenter","Cmd-K Cmd-G":"clearBookmarks","Cmd-K Cmd-Backspace":"delLineLeft","Cmd-K Cmd-0":"unfoldAll","Cmd-K Cmd-J":"unfoldAll","Ctrl-Shift-Up":"addCursorToPrevLine","Ctrl-Shift-Down":"addCursorToNextLine","Cmd-F3":"findUnder","Shift-Cmd-F3":"findUnderPrevious","Alt-F3":"findAllUnder","Shift-Cmd-[":"fold","Shift-Cmd-]":"unfold","Cmd-I":"findIncremental","Shift-Cmd-I":"findIncrementalReverse","Cmd-H":"replace",F3:"findNext","Shift-F3":"findPrev",fallthrough:"macDefault"},a.normalizeKeyMap(p.macSublime),p.pcSublime={"Shift-Tab":"indentLess","Shift-Ctrl-K":"deleteLine","Alt-Q":"wrapLines","Ctrl-T":"transposeChars","Alt-Left":"goSubwordLeft","Alt-Right":"goSubwordRight","Ctrl-Up":"scrollLineUp","Ctrl-Down":"scrollLineDown","Ctrl-L":"selectLine","Shift-Ctrl-L":"splitSelectionByLine",Esc:"singleSelectionTop","Ctrl-Enter":"insertLineAfter","Shift-Ctrl-Enter":"insertLineBefore","Ctrl-D":"selectNextOccurrence","Shift-Ctrl-Space":"selectScope","Shift-Ctrl-M":"selectBetweenBrackets","Ctrl-M":"goToBracket","Shift-Ctrl-Up":"swapLineUp","Shift-Ctrl-Down":"swapLineDown","Ctrl-/":"toggleCommentIndented","Ctrl-J":"joinLines","Shift-Ctrl-D":"duplicateLine",F9:"sortLines","Ctrl-F9":"sortLinesInsensitive",F2:"nextBookmark","Shift-F2":"prevBookmark","Ctrl-F2":"toggleBookmark","Shift-Ctrl-F2":"clearBookmarks","Alt-F2":"selectBookmarks",Backspace:"smartBackspace","Ctrl-K Ctrl-K":"delLineRight","Ctrl-K Ctrl-U":"upcaseAtCursor","Ctrl-K Ctrl-L":"downcaseAtCursor","Ctrl-K Ctrl-Space":"setSublimeMark","Ctrl-K Ctrl-A":"selectToSublimeMark","Ctrl-K Ctrl-W":"deleteToSublimeMark","Ctrl-K Ctrl-X":"swapWithSublimeMark","Ctrl-K Ctrl-Y":"sublimeYank","Ctrl-K Ctrl-C":"showInCenter","Ctrl-K Ctrl-G":"clearBookmarks","Ctrl-K Ctrl-Backspace":"delLineLeft","Ctrl-K Ctrl-0":"unfoldAll","Ctrl-K Ctrl-J":"unfoldAll","Ctrl-Alt-Up":"addCursorToPrevLine","Ctrl-Alt-Down":"addCursorToNextLine","Ctrl-F3":"findUnder","Shift-Ctrl-F3":"findUnderPrevious","Alt-F3":"findAllUnder","Shift-Ctrl-[":"fold","Shift-Ctrl-]":"unfold","Ctrl-I":"findIncremental","Shift-Ctrl-I":"findIncrementalReverse","Ctrl-H":"replace",F3:"findNext","Shift-F3":"findPrev",fallthrough:"pcDefault"},a.normalizeKeyMap(p.pcSublime);var q=p.default==p.macDefault;p.sublime=q?p.macSublime:p.pcSublime});