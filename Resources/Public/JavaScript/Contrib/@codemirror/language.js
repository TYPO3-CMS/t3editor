import{NodeProp,IterMode,Tree,TreeFragment,Parser,NodeType,NodeSet}from"@lezer/common";import{StateEffect,StateField,Facet,EditorState,countColumn,combineConfig,RangeSet,RangeSetBuilder,Prec}from"@codemirror/state";import{ViewPlugin,logException,EditorView,Decoration,WidgetType,gutter,GutterMarker}from"@codemirror/view";import{tags,tagHighlighter,highlightTree,styleTags}from"@lezer/highlight";import{StyleModule}from"style-mod";var _a;const languageDataProp=new NodeProp;function defineLanguageFacet(t){return Facet.define({combine:t?e=>e.concat(t):void 0})}const sublanguageProp=new NodeProp;class Language{constructor(t,e,n=[],r=""){this.data=t,this.name=r,EditorState.prototype.hasOwnProperty("tree")||Object.defineProperty(EditorState.prototype,"tree",{get(){return syntaxTree(this)}}),this.parser=e,this.extension=[language.of(this),EditorState.languageData.of(((t,e,n)=>{let r=topNodeAt(t,e,n),i=r.type.prop(languageDataProp);if(!i)return[];let o=t.facet(i),s=r.type.prop(sublanguageProp);if(s){let i=r.resolve(e-r.from,n);for(let e of s)if(e.test(i,t)){let n=t.facet(e.facet);return"replace"==e.type?n:n.concat(o)}}return o}))].concat(n)}isActiveAt(t,e,n=-1){return topNodeAt(t,e,n).type.prop(languageDataProp)==this.data}findRegions(t){let e=t.facet(language);if((null==e?void 0:e.data)==this.data)return[{from:0,to:t.doc.length}];if(!e||!e.allowsNesting)return[];let n=[],r=(t,e)=>{if(t.prop(languageDataProp)==this.data)return void n.push({from:e,to:e+t.length});let i=t.prop(NodeProp.mounted);if(i){if(i.tree.prop(languageDataProp)==this.data){if(i.overlay)for(let t of i.overlay)n.push({from:t.from+e,to:t.to+e});else n.push({from:e,to:e+t.length});return}if(i.overlay){let t=n.length;if(r(i.tree,i.overlay[0].from+e),n.length>t)return}}for(let n=0;n<t.children.length;n++){let i=t.children[n];i instanceof Tree&&r(i,t.positions[n]+e)}};return r(syntaxTree(t),0),n}get allowsNesting(){return!0}}function topNodeAt(t,e,n){let r=t.facet(language),i=syntaxTree(t).topNode;if(!r||r.allowsNesting)for(let t=i;t;t=t.enter(e,n,IterMode.ExcludeBuffers))t.type.isTop&&(i=t);return i}Language.setState=StateEffect.define();class LRLanguage extends Language{constructor(t,e,n){super(t,e,[],n),this.parser=e}static define(t){let e=defineLanguageFacet(t.languageData);return new LRLanguage(e,t.parser.configure({props:[languageDataProp.add((t=>t.isTop?e:void 0))]}),t.name)}configure(t,e){return new LRLanguage(this.data,this.parser.configure(t),e||this.name)}get allowsNesting(){return this.parser.hasWrappers()}}function syntaxTree(t){let e=t.field(Language.state,!1);return e?e.tree:Tree.empty}function ensureSyntaxTree(t,e,n=50){var r;let i=null===(r=t.field(Language.state,!1))||void 0===r?void 0:r.context;if(!i)return null;let o=i.viewport;i.updateViewport({from:0,to:e});let s=i.isDone(e)||i.work(n,e)?i.tree:null;return i.updateViewport(o),s}function syntaxTreeAvailable(t,e=t.doc.length){var n;return(null===(n=t.field(Language.state,!1))||void 0===n?void 0:n.context.isDone(e))||!1}function forceParsing(t,e=t.viewport.to,n=100){let r=ensureSyntaxTree(t.state,e,n);return r!=syntaxTree(t.state)&&t.dispatch({}),!!r}function syntaxParserRunning(t){var e;return(null===(e=t.plugin(parseWorker))||void 0===e?void 0:e.isWorking())||!1}class DocInput{constructor(t){this.doc=t,this.cursorPos=0,this.string="",this.cursor=t.iter()}get length(){return this.doc.length}syncTo(t){return this.string=this.cursor.next(t-this.cursorPos).value,this.cursorPos=t+this.string.length,this.cursorPos-this.string.length}chunk(t){return this.syncTo(t),this.string}get lineChunks(){return!0}read(t,e){let n=this.cursorPos-this.string.length;return t<n||e>=this.cursorPos?this.doc.sliceString(t,e):this.string.slice(t-n,e-n)}}let currentContext=null;class ParseContext{constructor(t,e,n=[],r,i,o,s,a){this.parser=t,this.state=e,this.fragments=n,this.tree=r,this.treeLen=i,this.viewport=o,this.skipped=s,this.scheduleOn=a,this.parse=null,this.tempSkipped=[]}static create(t,e,n){return new ParseContext(t,e,[],Tree.empty,0,n,[],null)}startParse(){return this.parser.startParse(new DocInput(this.state.doc),this.fragments)}work(t,e){return null!=e&&e>=this.state.doc.length&&(e=void 0),this.tree!=Tree.empty&&this.isDone(null!=e?e:this.state.doc.length)?(this.takeTree(),!0):this.withContext((()=>{var n;if("number"==typeof t){let e=Date.now()+t;t=()=>Date.now()>e}for(this.parse||(this.parse=this.startParse()),null!=e&&(null==this.parse.stoppedAt||this.parse.stoppedAt>e)&&e<this.state.doc.length&&this.parse.stopAt(e);;){let r=this.parse.advance();if(r){if(this.fragments=this.withoutTempSkipped(TreeFragment.addTree(r,this.fragments,null!=this.parse.stoppedAt)),this.treeLen=null!==(n=this.parse.stoppedAt)&&void 0!==n?n:this.state.doc.length,this.tree=r,this.parse=null,!(this.treeLen<(null!=e?e:this.state.doc.length)))return!0;this.parse=this.startParse()}if(t())return!1}}))}takeTree(){let t,e;this.parse&&(t=this.parse.parsedPos)>=this.treeLen&&((null==this.parse.stoppedAt||this.parse.stoppedAt>t)&&this.parse.stopAt(t),this.withContext((()=>{for(;!(e=this.parse.advance()););})),this.treeLen=t,this.tree=e,this.fragments=this.withoutTempSkipped(TreeFragment.addTree(this.tree,this.fragments,!0)),this.parse=null)}withContext(t){let e=currentContext;currentContext=this;try{return t()}finally{currentContext=e}}withoutTempSkipped(t){for(let e;e=this.tempSkipped.pop();)t=cutFragments(t,e.from,e.to);return t}changes(t,e){let{fragments:n,tree:r,treeLen:i,viewport:o,skipped:s}=this;if(this.takeTree(),!t.empty){let e=[];if(t.iterChangedRanges(((t,n,r,i)=>e.push({fromA:t,toA:n,fromB:r,toB:i}))),n=TreeFragment.applyChanges(n,e),r=Tree.empty,i=0,o={from:t.mapPos(o.from,-1),to:t.mapPos(o.to,1)},this.skipped.length){s=[];for(let e of this.skipped){let n=t.mapPos(e.from,1),r=t.mapPos(e.to,-1);n<r&&s.push({from:n,to:r})}}}return new ParseContext(this.parser,e,n,r,i,o,s,this.scheduleOn)}updateViewport(t){if(this.viewport.from==t.from&&this.viewport.to==t.to)return!1;this.viewport=t;let e=this.skipped.length;for(let e=0;e<this.skipped.length;e++){let{from:n,to:r}=this.skipped[e];n<t.to&&r>t.from&&(this.fragments=cutFragments(this.fragments,n,r),this.skipped.splice(e--,1))}return!(this.skipped.length>=e)&&(this.reset(),!0)}reset(){this.parse&&(this.takeTree(),this.parse=null)}skipUntilInView(t,e){this.skipped.push({from:t,to:e})}static getSkippingParser(t){return new class extends Parser{createParse(e,n,r){let i=r[0].from,o=r[r.length-1].to;return{parsedPos:i,advance(){let e=currentContext;if(e){for(let t of r)e.tempSkipped.push(t);t&&(e.scheduleOn=e.scheduleOn?Promise.all([e.scheduleOn,t]):t)}return this.parsedPos=o,new Tree(NodeType.none,[],[],o-i)},stoppedAt:null,stopAt(){}}}}}isDone(t){t=Math.min(t,this.state.doc.length);let e=this.fragments;return this.treeLen>=t&&e.length&&0==e[0].from&&e[0].to>=t}static get(){return currentContext}}function cutFragments(t,e,n){return TreeFragment.applyChanges(t,[{fromA:e,toA:n,fromB:e,toB:n}])}class LanguageState{constructor(t){this.context=t,this.tree=t.tree}apply(t){if(!t.docChanged&&this.tree==this.context.tree)return this;let e=this.context.changes(t.changes,t.state),n=this.context.treeLen==t.startState.doc.length?void 0:Math.max(t.changes.mapPos(this.context.treeLen),e.viewport.to);return e.work(20,n)||e.takeTree(),new LanguageState(e)}static init(t){let e=Math.min(3e3,t.doc.length),n=ParseContext.create(t.facet(language).parser,t,{from:0,to:e});return n.work(20,e)||n.takeTree(),new LanguageState(n)}}Language.state=StateField.define({create:LanguageState.init,update(t,e){for(let t of e.effects)if(t.is(Language.setState))return t.value;return e.startState.facet(language)!=e.state.facet(language)?LanguageState.init(e.state):t.apply(e)}});let requestIdle=t=>{let e=setTimeout((()=>t()),500);return()=>clearTimeout(e)};"undefined"!=typeof requestIdleCallback&&(requestIdle=t=>{let e=-1,n=setTimeout((()=>{e=requestIdleCallback(t,{timeout:400})}),100);return()=>e<0?clearTimeout(n):cancelIdleCallback(e)});const isInputPending="undefined"!=typeof navigator&&(null===(_a=navigator.scheduling)||void 0===_a?void 0:_a.isInputPending)?()=>navigator.scheduling.isInputPending():null,parseWorker=ViewPlugin.fromClass(class{constructor(t){this.view=t,this.working=null,this.workScheduled=0,this.chunkEnd=-1,this.chunkBudget=-1,this.work=this.work.bind(this),this.scheduleWork()}update(t){let e=this.view.state.field(Language.state).context;(e.updateViewport(t.view.viewport)||this.view.viewport.to>e.treeLen)&&this.scheduleWork(),t.docChanged&&(this.view.hasFocus&&(this.chunkBudget+=50),this.scheduleWork()),this.checkAsyncSchedule(e)}scheduleWork(){if(this.working)return;let{state:t}=this.view,e=t.field(Language.state);e.tree==e.context.tree&&e.context.isDone(t.doc.length)||(this.working=requestIdle(this.work))}work(t){this.working=null;let e=Date.now();if(this.chunkEnd<e&&(this.chunkEnd<0||this.view.hasFocus)&&(this.chunkEnd=e+3e4,this.chunkBudget=3e3),this.chunkBudget<=0)return;let{state:n,viewport:{to:r}}=this.view,i=n.field(Language.state);if(i.tree==i.context.tree&&i.context.isDone(r+1e5))return;let o=Date.now()+Math.min(this.chunkBudget,100,t&&!isInputPending?Math.max(25,t.timeRemaining()-5):1e9),s=i.context.treeLen<r&&n.doc.length>r+1e3,a=i.context.work((()=>isInputPending&&isInputPending()||Date.now()>o),r+(s?0:1e5));this.chunkBudget-=Date.now()-e,(a||this.chunkBudget<=0)&&(i.context.takeTree(),this.view.dispatch({effects:Language.setState.of(new LanguageState(i.context))})),this.chunkBudget>0&&(!a||s)&&this.scheduleWork(),this.checkAsyncSchedule(i.context)}checkAsyncSchedule(t){t.scheduleOn&&(this.workScheduled++,t.scheduleOn.then((()=>this.scheduleWork())).catch((t=>logException(this.view.state,t))).then((()=>this.workScheduled--)),t.scheduleOn=null)}destroy(){this.working&&this.working()}isWorking(){return!!(this.working||this.workScheduled>0)}},{eventHandlers:{focus(){this.scheduleWork()}}}),language=Facet.define({combine:t=>t.length?t[0]:null,enables:t=>[Language.state,parseWorker,EditorView.contentAttributes.compute([t],(e=>{let n=e.facet(t);return n&&n.name?{"data-language":n.name}:{}}))]});class LanguageSupport{constructor(t,e=[]){this.language=t,this.support=e,this.extension=[t,e]}}class LanguageDescription{constructor(t,e,n,r,i,o){this.name=t,this.alias=e,this.extensions=n,this.filename=r,this.loadFunc=i,this.support=o,this.loading=null}load(){return this.loading||(this.loading=this.loadFunc().then((t=>this.support=t),(t=>{throw this.loading=null,t})))}static of(t){let{load:e,support:n}=t;if(!e){if(!n)throw new RangeError("Must pass either 'load' or 'support' to LanguageDescription.of");e=()=>Promise.resolve(n)}return new LanguageDescription(t.name,(t.alias||[]).concat(t.name).map((t=>t.toLowerCase())),t.extensions||[],t.filename,e,n)}static matchFilename(t,e){for(let n of t)if(n.filename&&n.filename.test(e))return n;let n=/\.([^.]+)$/.exec(e);if(n)for(let e of t)if(e.extensions.indexOf(n[1])>-1)return e;return null}static matchLanguageName(t,e,n=!0){e=e.toLowerCase();for(let n of t)if(n.alias.some((t=>t==e)))return n;if(n)for(let n of t)for(let t of n.alias){let r=e.indexOf(t);if(r>-1&&(t.length>2||!/\w/.test(e[r-1])&&!/\w/.test(e[r+t.length])))return n}return null}}const indentService=Facet.define(),indentUnit=Facet.define({combine:t=>{if(!t.length)return"  ";let e=t[0];if(!e||/\S/.test(e)||Array.from(e).some((t=>t!=e[0])))throw new Error("Invalid indent unit: "+JSON.stringify(t[0]));return e}});function getIndentUnit(t){let e=t.facet(indentUnit);return 9==e.charCodeAt(0)?t.tabSize*e.length:e.length}function indentString(t,e){let n="",r=t.tabSize,i=t.facet(indentUnit)[0];if("\t"==i){for(;e>=r;)n+="\t",e-=r;i=" "}for(let t=0;t<e;t++)n+=i;return n}function getIndentation(t,e){t instanceof EditorState&&(t=new IndentContext(t));for(let n of t.state.facet(indentService)){let r=n(t,e);if(void 0!==r)return r}let n=syntaxTree(t.state);return n?syntaxIndentation(t,n,e):null}function indentRange(t,e,n){let r=Object.create(null),i=new IndentContext(t,{overrideIndentation:t=>{var e;return null!==(e=r[t])&&void 0!==e?e:-1}}),o=[];for(let s=e;s<=n;){let e=t.doc.lineAt(s);s=e.to+1;let n=getIndentation(i,e.from);if(null==n)continue;/\S/.test(e.text)||(n=0);let a=/^\s*/.exec(e.text)[0],l=indentString(t,n);a!=l&&(r[e.from]=n,o.push({from:e.from,to:e.from+a.length,insert:l}))}return t.changes(o)}class IndentContext{constructor(t,e={}){this.state=t,this.options=e,this.unit=getIndentUnit(t)}lineAt(t,e=1){let n=this.state.doc.lineAt(t),{simulateBreak:r,simulateDoubleBreak:i}=this.options;return null!=r&&r>=n.from&&r<=n.to?i&&r==t?{text:"",from:t}:(e<0?r<t:r<=t)?{text:n.text.slice(r-n.from),from:r}:{text:n.text.slice(0,r-n.from),from:n.from}:n}textAfterPos(t,e=1){if(this.options.simulateDoubleBreak&&t==this.options.simulateBreak)return"";let{text:n,from:r}=this.lineAt(t,e);return n.slice(t-r,Math.min(n.length,t+100-r))}column(t,e=1){let{text:n,from:r}=this.lineAt(t,e),i=this.countColumn(n,t-r),o=this.options.overrideIndentation?this.options.overrideIndentation(r):-1;return o>-1&&(i+=o-this.countColumn(n,n.search(/\S|$/))),i}countColumn(t,e=t.length){return countColumn(t,this.state.tabSize,e)}lineIndent(t,e=1){let{text:n,from:r}=this.lineAt(t,e),i=this.options.overrideIndentation;if(i){let t=i(r);if(t>-1)return t}return this.countColumn(n,n.search(/\S|$/))}get simulatedBreak(){return this.options.simulateBreak||null}}const indentNodeProp=new NodeProp;function syntaxIndentation(t,e,n){return indentFrom(e.resolveInner(n).enterUnfinishedNodesBefore(n),n,t)}function ignoreClosed(t){return t.pos==t.options.simulateBreak&&t.options.simulateDoubleBreak}function indentStrategy(t){let e=t.type.prop(indentNodeProp);if(e)return e;let n,r=t.firstChild;if(r&&(n=r.type.prop(NodeProp.closedBy))){let e=t.lastChild,r=e&&n.indexOf(e.name)>-1;return t=>delimitedStrategy(t,!0,1,void 0,r&&!ignoreClosed(t)?e.from:void 0)}return null==t.parent?topIndent:null}function indentFrom(t,e,n){for(;t;t=t.parent){let r=indentStrategy(t);if(r)return r(TreeIndentContext.create(n,e,t))}return null}function topIndent(){return 0}class TreeIndentContext extends IndentContext{constructor(t,e,n){super(t.state,t.options),this.base=t,this.pos=e,this.node=n}static create(t,e,n){return new TreeIndentContext(t,e,n)}get textAfter(){return this.textAfterPos(this.pos)}get baseIndent(){let t=this.state.doc.lineAt(this.node.from);for(;;){let e=this.node.resolve(t.from);for(;e.parent&&e.parent.from==e.from;)e=e.parent;if(isParent(e,this.node))break;t=this.state.doc.lineAt(e.from)}return this.lineIndent(t.from)}continue(){let t=this.node.parent;return t?indentFrom(t,this.pos,this.base):0}}function isParent(t,e){for(let n=e;n;n=n.parent)if(t==n)return!0;return!1}function bracketedAligned(t){let e=t.node,n=e.childAfter(e.from),r=e.lastChild;if(!n)return null;let i=t.options.simulateBreak,o=t.state.doc.lineAt(n.from),s=null==i||i<=o.from?o.to:Math.min(o.to,i);for(let t=n.to;;){let i=e.childAfter(t);if(!i||i==r)return null;if(!i.type.isSkipped)return i.from<s?n:null;t=i.to}}function delimitedIndent({closing:t,align:e=!0,units:n=1}){return r=>delimitedStrategy(r,e,n,t)}function delimitedStrategy(t,e,n,r,i){let o=t.textAfter,s=o.match(/^\s*/)[0].length,a=r&&o.slice(s,s+r.length)==r||i==t.pos+s,l=e?bracketedAligned(t):null;return l?a?t.column(l.from):t.column(l.to):t.baseIndent+(a?0:t.unit*n)}const flatIndent=t=>t.baseIndent;function continuedIndent({except:t,units:e=1}={}){return n=>{let r=t&&t.test(n.textAfter);return n.baseIndent+(r?0:e*n.unit)}}const DontIndentBeyond=200;function indentOnInput(){return EditorState.transactionFilter.of((t=>{if(!t.docChanged||!t.isUserEvent("input.type")&&!t.isUserEvent("input.complete"))return t;let e=t.startState.languageDataAt("indentOnInput",t.startState.selection.main.head);if(!e.length)return t;let n=t.newDoc,{head:r}=t.newSelection.main,i=n.lineAt(r);if(r>i.from+200)return t;let o=n.sliceString(i.from,r);if(!e.some((t=>t.test(o))))return t;let{state:s}=t,a=-1,l=[];for(let{head:t}of s.selection.ranges){let e=s.doc.lineAt(t);if(e.from==a)continue;a=e.from;let n=getIndentation(s,e.from);if(null==n)continue;let r=/^\s*/.exec(e.text)[0],i=indentString(s,n);r!=i&&l.push({from:e.from,to:e.from+r.length,insert:i})}return l.length?[t,{changes:l,sequential:!0}]:t}))}const foldService=Facet.define(),foldNodeProp=new NodeProp;function foldInside(t){let e=t.firstChild,n=t.lastChild;return e&&e.to<n.from?{from:e.to,to:n.type.isError?t.to:n.from}:null}function syntaxFolding(t,e,n){let r=syntaxTree(t);if(r.length<n)return null;let i=null;for(let o=r.resolveInner(n,1);o;o=o.parent){if(o.to<=n||o.from>n)continue;if(i&&o.from<e)break;let s=o.type.prop(foldNodeProp);if(s&&(o.to<r.length-50||r.length==t.doc.length||!isUnfinished(o))){let r=s(o,t);r&&r.from<=n&&r.from>=e&&r.to>n&&(i=r)}}return i}function isUnfinished(t){let e=t.lastChild;return e&&e.to==t.to&&e.type.isError}function foldable(t,e,n){for(let r of t.facet(foldService)){let i=r(t,e,n);if(i)return i}return syntaxFolding(t,e,n)}function mapRange(t,e){let n=e.mapPos(t.from,1),r=e.mapPos(t.to,-1);return n>=r?void 0:{from:n,to:r}}const foldEffect=StateEffect.define({map:mapRange}),unfoldEffect=StateEffect.define({map:mapRange});function selectedLines(t){let e=[];for(let{head:n}of t.state.selection.ranges)e.some((t=>t.from<=n&&t.to>=n))||e.push(t.lineBlockAt(n));return e}const foldState=StateField.define({create:()=>Decoration.none,update(t,e){t=t.map(e.changes);for(let n of e.effects)n.is(foldEffect)&&!foldExists(t,n.value.from,n.value.to)?t=t.update({add:[foldWidget.range(n.value.from,n.value.to)]}):n.is(unfoldEffect)&&(t=t.update({filter:(t,e)=>n.value.from!=t||n.value.to!=e,filterFrom:n.value.from,filterTo:n.value.to}));if(e.selection){let n=!1,{head:r}=e.selection.main;t.between(r,r,((t,e)=>{t<r&&e>r&&(n=!0)})),n&&(t=t.update({filterFrom:r,filterTo:r,filter:(t,e)=>e<=r||t>=r}))}return t},provide:t=>EditorView.decorations.from(t),toJSON(t,e){let n=[];return t.between(0,e.doc.length,((t,e)=>{n.push(t,e)})),n},fromJSON(t){if(!Array.isArray(t)||t.length%2)throw new RangeError("Invalid JSON for fold state");let e=[];for(let n=0;n<t.length;){let r=t[n++],i=t[n++];if("number"!=typeof r||"number"!=typeof i)throw new RangeError("Invalid JSON for fold state");e.push(foldWidget.range(r,i))}return Decoration.set(e,!0)}});function foldedRanges(t){return t.field(foldState,!1)||RangeSet.empty}function findFold(t,e,n){var r;let i=null;return null===(r=t.field(foldState,!1))||void 0===r||r.between(e,n,((t,e)=>{(!i||i.from>t)&&(i={from:t,to:e})})),i}function foldExists(t,e,n){let r=!1;return t.between(e,e,((t,i)=>{t==e&&i==n&&(r=!0)})),r}function maybeEnable(t,e){return t.field(foldState,!1)?e:e.concat(StateEffect.appendConfig.of(codeFolding()))}const foldCode=t=>{for(let e of selectedLines(t)){let n=foldable(t.state,e.from,e.to);if(n)return t.dispatch({effects:maybeEnable(t.state,[foldEffect.of(n),announceFold(t,n)])}),!0}return!1},unfoldCode=t=>{if(!t.state.field(foldState,!1))return!1;let e=[];for(let n of selectedLines(t)){let r=findFold(t.state,n.from,n.to);r&&e.push(unfoldEffect.of(r),announceFold(t,r,!1))}return e.length&&t.dispatch({effects:e}),e.length>0};function announceFold(t,e,n=!0){let r=t.state.doc.lineAt(e.from).number,i=t.state.doc.lineAt(e.to).number;return EditorView.announce.of(`${t.state.phrase(n?"Folded lines":"Unfolded lines")} ${r} ${t.state.phrase("to")} ${i}.`)}const foldAll=t=>{let{state:e}=t,n=[];for(let r=0;r<e.doc.length;){let i=t.lineBlockAt(r),o=foldable(e,i.from,i.to);o&&n.push(foldEffect.of(o)),r=(o?t.lineBlockAt(o.to):i).to+1}return n.length&&t.dispatch({effects:maybeEnable(t.state,n)}),!!n.length},unfoldAll=t=>{let e=t.state.field(foldState,!1);if(!e||!e.size)return!1;let n=[];return e.between(0,t.state.doc.length,((t,e)=>{n.push(unfoldEffect.of({from:t,to:e}))})),t.dispatch({effects:n}),!0};function foldableContainer(t,e){for(let n=e;;){let r=foldable(t.state,n.from,n.to);if(r&&r.to>e.from)return r;if(!n.from)return null;n=t.lineBlockAt(n.from-1)}}const toggleFold=t=>{let e=[];for(let n of selectedLines(t)){let r=findFold(t.state,n.from,n.to);if(r)e.push(unfoldEffect.of(r),announceFold(t,r,!1));else{let r=foldableContainer(t,n);r&&e.push(foldEffect.of(r),announceFold(t,r))}}return e.length>0&&t.dispatch({effects:maybeEnable(t.state,e)}),!!e.length},foldKeymap=[{key:"Ctrl-Shift-[",mac:"Cmd-Alt-[",run:foldCode},{key:"Ctrl-Shift-]",mac:"Cmd-Alt-]",run:unfoldCode},{key:"Ctrl-Alt-[",run:foldAll},{key:"Ctrl-Alt-]",run:unfoldAll}],defaultConfig={placeholderDOM:null,placeholderText:"…"},foldConfig=Facet.define({combine:t=>combineConfig(t,defaultConfig)});function codeFolding(t){let e=[foldState,baseTheme$1];return t&&e.push(foldConfig.of(t)),e}const foldWidget=Decoration.replace({widget:new class extends WidgetType{toDOM(t){let{state:e}=t,n=e.facet(foldConfig),r=e=>{let n=t.lineBlockAt(t.posAtDOM(e.target)),r=findFold(t.state,n.from,n.to);r&&t.dispatch({effects:unfoldEffect.of(r)}),e.preventDefault()};if(n.placeholderDOM)return n.placeholderDOM(t,r);let i=document.createElement("span");return i.textContent=n.placeholderText,i.setAttribute("aria-label",e.phrase("folded code")),i.title=e.phrase("unfold"),i.className="cm-foldPlaceholder",i.onclick=r,i}}}),foldGutterDefaults={openText:"⌄",closedText:"›",markerDOM:null,domEventHandlers:{},foldingChanged:()=>!1};class FoldMarker extends GutterMarker{constructor(t,e){super(),this.config=t,this.open=e}eq(t){return this.config==t.config&&this.open==t.open}toDOM(t){if(this.config.markerDOM)return this.config.markerDOM(this.open);let e=document.createElement("span");return e.textContent=this.open?this.config.openText:this.config.closedText,e.title=t.state.phrase(this.open?"Fold line":"Unfold line"),e}}function foldGutter(t={}){let e=Object.assign(Object.assign({},foldGutterDefaults),t),n=new FoldMarker(e,!0),r=new FoldMarker(e,!1),i=ViewPlugin.fromClass(class{constructor(t){this.from=t.viewport.from,this.markers=this.buildMarkers(t)}update(t){(t.docChanged||t.viewportChanged||t.startState.facet(language)!=t.state.facet(language)||t.startState.field(foldState,!1)!=t.state.field(foldState,!1)||syntaxTree(t.startState)!=syntaxTree(t.state)||e.foldingChanged(t))&&(this.markers=this.buildMarkers(t.view))}buildMarkers(t){let e=new RangeSetBuilder;for(let i of t.viewportLineBlocks){let o=findFold(t.state,i.from,i.to)?r:foldable(t.state,i.from,i.to)?n:null;o&&e.add(i.from,i.from,o)}return e.finish()}}),{domEventHandlers:o}=e;return[i,gutter({class:"cm-foldGutter",markers(t){var e;return(null===(e=t.plugin(i))||void 0===e?void 0:e.markers)||RangeSet.empty},initialSpacer:()=>new FoldMarker(e,!1),domEventHandlers:Object.assign(Object.assign({},o),{click:(t,e,n)=>{if(o.click&&o.click(t,e,n))return!0;let r=findFold(t.state,e.from,e.to);if(r)return t.dispatch({effects:unfoldEffect.of(r)}),!0;let i=foldable(t.state,e.from,e.to);return!!i&&(t.dispatch({effects:foldEffect.of(i)}),!0)}})}),codeFolding()]}const baseTheme$1=EditorView.baseTheme({".cm-foldPlaceholder":{backgroundColor:"#eee",border:"1px solid #ddd",color:"#888",borderRadius:".2em",margin:"0 1px",padding:"0 1px",cursor:"pointer"},".cm-foldGutter span":{padding:"0 1px",cursor:"pointer"}});class HighlightStyle{constructor(t,e){let n;function r(t){let e=StyleModule.newName();return(n||(n=Object.create(null)))["."+e]=t,e}this.specs=t;const i="string"==typeof e.all?e.all:e.all?r(e.all):void 0,o=e.scope;this.scope=o instanceof Language?t=>t.prop(languageDataProp)==o.data:o?t=>t==o:void 0,this.style=tagHighlighter(t.map((t=>({tag:t.tag,class:t.class||r(Object.assign({},t,{tag:null}))}))),{all:i}).style,this.module=n?new StyleModule(n):null,this.themeType=e.themeType}static define(t,e){return new HighlightStyle(t,e||{})}}const highlighterFacet=Facet.define(),fallbackHighlighter=Facet.define({combine:t=>t.length?[t[0]]:null});function getHighlighters(t){let e=t.facet(highlighterFacet);return e.length?e:t.facet(fallbackHighlighter)}function syntaxHighlighting(t,e){let n,r=[treeHighlighter];return t instanceof HighlightStyle&&(t.module&&r.push(EditorView.styleModule.of(t.module)),n=t.themeType),(null==e?void 0:e.fallback)?r.push(fallbackHighlighter.of(t)):n?r.push(highlighterFacet.computeN([EditorView.darkTheme],(e=>e.facet(EditorView.darkTheme)==("dark"==n)?[t]:[]))):r.push(highlighterFacet.of(t)),r}function highlightingFor(t,e,n){let r=getHighlighters(t),i=null;if(r)for(let t of r)if(!t.scope||n&&t.scope(n)){let n=t.style(e);n&&(i=i?i+" "+n:n)}return i}class TreeHighlighter{constructor(t){this.markCache=Object.create(null),this.tree=syntaxTree(t.state),this.decorations=this.buildDeco(t,getHighlighters(t.state))}update(t){let e=syntaxTree(t.state),n=getHighlighters(t.state),r=n!=getHighlighters(t.startState);e.length<t.view.viewport.to&&!r&&e.type==this.tree.type?this.decorations=this.decorations.map(t.changes):(e!=this.tree||t.viewportChanged||r)&&(this.tree=e,this.decorations=this.buildDeco(t.view,n))}buildDeco(t,e){if(!e||!this.tree.length)return Decoration.none;let n=new RangeSetBuilder;for(let{from:r,to:i}of t.visibleRanges)highlightTree(this.tree,e,((t,e,r)=>{n.add(t,e,this.markCache[r]||(this.markCache[r]=Decoration.mark({class:r})))}),r,i);return n.finish()}}const treeHighlighter=Prec.high(ViewPlugin.fromClass(TreeHighlighter,{decorations:t=>t.decorations})),defaultHighlightStyle=HighlightStyle.define([{tag:tags.meta,color:"#404740"},{tag:tags.link,textDecoration:"underline"},{tag:tags.heading,textDecoration:"underline",fontWeight:"bold"},{tag:tags.emphasis,fontStyle:"italic"},{tag:tags.strong,fontWeight:"bold"},{tag:tags.strikethrough,textDecoration:"line-through"},{tag:tags.keyword,color:"#708"},{tag:[tags.atom,tags.bool,tags.url,tags.contentSeparator,tags.labelName],color:"#219"},{tag:[tags.literal,tags.inserted],color:"#164"},{tag:[tags.string,tags.deleted],color:"#a11"},{tag:[tags.regexp,tags.escape,tags.special(tags.string)],color:"#e40"},{tag:tags.definition(tags.variableName),color:"#00f"},{tag:tags.local(tags.variableName),color:"#30a"},{tag:[tags.typeName,tags.namespace],color:"#085"},{tag:tags.className,color:"#167"},{tag:[tags.special(tags.variableName),tags.macroName],color:"#256"},{tag:tags.definition(tags.propertyName),color:"#00c"},{tag:tags.comment,color:"#940"},{tag:tags.invalid,color:"#f00"}]),baseTheme=EditorView.baseTheme({"&.cm-focused .cm-matchingBracket":{backgroundColor:"#328c8252"},"&.cm-focused .cm-nonmatchingBracket":{backgroundColor:"#bb555544"}}),DefaultScanDist=1e4,DefaultBrackets="()[]{}",bracketMatchingConfig=Facet.define({combine:t=>combineConfig(t,{afterCursor:!0,brackets:"()[]{}",maxScanDistance:1e4,renderMatch:defaultRenderMatch})}),matchingMark=Decoration.mark({class:"cm-matchingBracket"}),nonmatchingMark=Decoration.mark({class:"cm-nonmatchingBracket"});function defaultRenderMatch(t){let e=[],n=t.matched?matchingMark:nonmatchingMark;return e.push(n.range(t.start.from,t.start.to)),t.end&&e.push(n.range(t.end.from,t.end.to)),e}const bracketMatchingState=StateField.define({create:()=>Decoration.none,update(t,e){if(!e.docChanged&&!e.selection)return t;let n=[],r=e.state.facet(bracketMatchingConfig);for(let t of e.state.selection.ranges){if(!t.empty)continue;let i=matchBrackets(e.state,t.head,-1,r)||t.head>0&&matchBrackets(e.state,t.head-1,1,r)||r.afterCursor&&(matchBrackets(e.state,t.head,1,r)||t.head<e.state.doc.length&&matchBrackets(e.state,t.head+1,-1,r));i&&(n=n.concat(r.renderMatch(i,e.state)))}return Decoration.set(n,!0)},provide:t=>EditorView.decorations.from(t)}),bracketMatchingUnique=[bracketMatchingState,baseTheme];function bracketMatching(t={}){return[bracketMatchingConfig.of(t),bracketMatchingUnique]}const bracketMatchingHandle=new NodeProp;function matchingNodes(t,e,n){let r=t.prop(e<0?NodeProp.openedBy:NodeProp.closedBy);if(r)return r;if(1==t.name.length){let r=n.indexOf(t.name);if(r>-1&&r%2==(e<0?1:0))return[n[r+e]]}return null}function findHandle(t){let e=t.type.prop(bracketMatchingHandle);return e?e(t.node):t}function matchBrackets(t,e,n,r={}){let i=r.maxScanDistance||1e4,o=r.brackets||"()[]{}",s=syntaxTree(t),a=s.resolveInner(e,n);for(let r=a;r;r=r.parent){let i=matchingNodes(r.type,n,o);if(i&&r.from<r.to){let s=findHandle(r);if(s&&(n>0?e>=s.from&&e<s.to:e>s.from&&e<=s.to))return matchMarkedBrackets(t,e,n,r,s,i,o)}}return matchPlainBrackets(t,e,n,s,a.type,i,o)}function matchMarkedBrackets(t,e,n,r,i,o,s){let a=r.parent,l={from:i.from,to:i.to},h=0,d=null==a?void 0:a.cursor();if(d&&(n<0?d.childBefore(r.from):d.childAfter(r.to)))do{if(n<0?d.to<=r.from:d.from>=r.to){if(0==h&&o.indexOf(d.type.name)>-1&&d.from<d.to){let t=findHandle(d);return{start:l,end:t?{from:t.from,to:t.to}:void 0,matched:!0}}if(matchingNodes(d.type,n,s))h++;else if(matchingNodes(d.type,-n,s)){if(0==h){let t=findHandle(d);return{start:l,end:t&&t.from<t.to?{from:t.from,to:t.to}:void 0,matched:!1}}h--}}}while(n<0?d.prevSibling():d.nextSibling());return{start:l,matched:!1}}function matchPlainBrackets(t,e,n,r,i,o,s){let a=n<0?t.sliceDoc(e-1,e):t.sliceDoc(e,e+1),l=s.indexOf(a);if(l<0||l%2==0!=n>0)return null;let h={from:n<0?e-1:e,to:n>0?e+1:e},d=t.doc.iterRange(e,n>0?t.doc.length:0),u=0;for(let t=0;!d.next().done&&t<=o;){let o=d.value;n<0&&(t+=o.length);let a=e+t*n;for(let t=n>0?0:o.length-1,e=n>0?o.length:-1;t!=e;t+=n){let e=s.indexOf(o[t]);if(!(e<0||r.resolveInner(a+t,1).type!=i))if(e%2==0==n>0)u++;else{if(1==u)return{start:h,end:{from:a+t,to:a+t+1},matched:e>>1==l>>1};u--}}n>0&&(t+=o.length)}return d.done?{start:h,matched:!1}:null}function countCol(t,e,n,r=0,i=0){null==e&&-1==(e=t.search(/[^\s\u00a0]/))&&(e=t.length);let o=i;for(let i=r;i<e;i++)9==t.charCodeAt(i)?o+=n-o%n:o++;return o}class StringStream{constructor(t,e,n,r){this.string=t,this.tabSize=e,this.indentUnit=n,this.overrideIndent=r,this.pos=0,this.start=0,this.lastColumnPos=0,this.lastColumnValue=0}eol(){return this.pos>=this.string.length}sol(){return 0==this.pos}peek(){return this.string.charAt(this.pos)||void 0}next(){if(this.pos<this.string.length)return this.string.charAt(this.pos++)}eat(t){let e,n=this.string.charAt(this.pos);if(e="string"==typeof t?n==t:n&&(t instanceof RegExp?t.test(n):t(n)),e)return++this.pos,n}eatWhile(t){let e=this.pos;for(;this.eat(t););return this.pos>e}eatSpace(){let t=this.pos;for(;/[\s\u00a0]/.test(this.string.charAt(this.pos));)++this.pos;return this.pos>t}skipToEnd(){this.pos=this.string.length}skipTo(t){let e=this.string.indexOf(t,this.pos);if(e>-1)return this.pos=e,!0}backUp(t){this.pos-=t}column(){return this.lastColumnPos<this.start&&(this.lastColumnValue=countCol(this.string,this.start,this.tabSize,this.lastColumnPos,this.lastColumnValue),this.lastColumnPos=this.start),this.lastColumnValue}indentation(){var t;return null!==(t=this.overrideIndent)&&void 0!==t?t:countCol(this.string,null,this.tabSize)}match(t,e,n){if("string"==typeof t){let r=t=>n?t.toLowerCase():t;return r(this.string.substr(this.pos,t.length))==r(t)?(!1!==e&&(this.pos+=t.length),!0):null}{let n=this.string.slice(this.pos).match(t);return n&&n.index>0?null:(n&&!1!==e&&(this.pos+=n[0].length),n)}}current(){return this.string.slice(this.start,this.pos)}}function fullParser(t){return{name:t.name||"",token:t.token,blankLine:t.blankLine||(()=>{}),startState:t.startState||(()=>!0),copyState:t.copyState||defaultCopyState,indent:t.indent||(()=>null),languageData:t.languageData||{},tokenTable:t.tokenTable||noTokens}}function defaultCopyState(t){if("object"!=typeof t)return t;let e={};for(let n in t){let r=t[n];e[n]=r instanceof Array?r.slice():r}return e}const IndentedFrom=new WeakMap;class StreamLanguage extends Language{constructor(t){let e,n=defineLanguageFacet(t.languageData),r=fullParser(t);super(n,new class extends Parser{createParse(t,n,r){return new Parse(e,t,n,r)}},[indentService.of(((t,e)=>this.getIndent(t,e)))],t.name),this.topNode=docID(n),e=this,this.streamParser=r,this.stateAfter=new NodeProp({perNode:!0}),this.tokenTable=t.tokenTable?new TokenTable(r.tokenTable):defaultTokenTable}static define(t){return new StreamLanguage(t)}getIndent(t,e){let n,r=syntaxTree(t.state),i=r.resolve(e);for(;i&&i.type!=this.topNode;)i=i.parent;if(!i)return null;let{overrideIndentation:o}=t.options;o&&(n=IndentedFrom.get(t.state),null!=n&&n<e-1e4&&(n=void 0));let s,a,l=findState(this,r,0,i.from,null!=n?n:e);if(l?(a=l.state,s=l.pos+1):(a=this.streamParser.startState(t.unit),s=0),e-s>1e4)return null;for(;s<e;){let n=t.state.doc.lineAt(s),r=Math.min(e,n.to);if(n.length){let e=o?o(n.from):-1,i=new StringStream(n.text,t.state.tabSize,t.unit,e<0?void 0:e);for(;i.pos<r-n.from;)readToken(this.streamParser.token,i,a)}else this.streamParser.blankLine(a,t.unit);if(r==e)break;s=n.to+1}let h=t.lineAt(e);return o&&null==n&&IndentedFrom.set(t.state,h.from),this.streamParser.indent(a,/^\s*(.*)/.exec(h.text)[1],t)}get allowsNesting(){return!1}}function findState(t,e,n,r,i){let o=n>=r&&n+e.length<=i&&e.prop(t.stateAfter);if(o)return{state:t.streamParser.copyState(o),pos:n+e.length};for(let o=e.children.length-1;o>=0;o--){let s=e.children[o],a=n+e.positions[o],l=s instanceof Tree&&a<i&&findState(t,s,a,r,i);if(l)return l}return null}function cutTree(t,e,n,r,i){if(i&&n<=0&&r>=e.length)return e;i||e.type!=t.topNode||(i=!0);for(let o=e.children.length-1;o>=0;o--){let s,a=e.positions[o],l=e.children[o];if(a<r&&l instanceof Tree){if(!(s=cutTree(t,l,n-a,r-a,i)))break;return i?new Tree(e.type,e.children.slice(0,o).concat(s),e.positions.slice(0,o+1),a+s.length):s}}return null}function findStartInFragments(t,e,n,r){for(let r of e){let e,i=r.from+(r.openStart?25:0),o=r.to-(r.openEnd?25:0),s=i<=n&&o>n&&findState(t,r.tree,0-r.offset,n,o);if(s&&(e=cutTree(t,r.tree,n+r.offset,s.pos+r.offset,!1)))return{state:s.state,tree:e}}return{state:t.streamParser.startState(r?getIndentUnit(r):4),tree:Tree.empty}}class Parse{constructor(t,e,n,r){this.lang=t,this.input=e,this.fragments=n,this.ranges=r,this.stoppedAt=null,this.chunks=[],this.chunkPos=[],this.chunk=[],this.chunkReused=void 0,this.rangeIndex=0,this.to=r[r.length-1].to;let i=ParseContext.get(),o=r[0].from,{state:s,tree:a}=findStartInFragments(t,n,o,null==i?void 0:i.state);this.state=s,this.parsedPos=this.chunkStart=o+a.length;for(let t=0;t<a.children.length;t++)this.chunks.push(a.children[t]),this.chunkPos.push(a.positions[t]);i&&this.parsedPos<i.viewport.from-1e5&&(this.state=this.lang.streamParser.startState(getIndentUnit(i.state)),i.skipUntilInView(this.parsedPos,i.viewport.from),this.parsedPos=i.viewport.from),this.moveRangeIndex()}advance(){let t=ParseContext.get(),e=null==this.stoppedAt?this.to:Math.min(this.to,this.stoppedAt),n=Math.min(e,this.chunkStart+2048);for(t&&(n=Math.min(n,t.viewport.to));this.parsedPos<n;)this.parseLine(t);return this.chunkStart<this.parsedPos&&this.finishChunk(),this.parsedPos>=e?this.finish():t&&this.parsedPos>=t.viewport.to?(t.skipUntilInView(this.parsedPos,e),this.finish()):null}stopAt(t){this.stoppedAt=t}lineAfter(t){let e=this.input.chunk(t);if(this.input.lineChunks)"\n"==e&&(e="");else{let t=e.indexOf("\n");t>-1&&(e=e.slice(0,t))}return t+e.length<=this.to?e:e.slice(0,this.to-t)}nextLine(){let t=this.parsedPos,e=this.lineAfter(t),n=t+e.length;for(let t=this.rangeIndex;;){let r=this.ranges[t].to;if(r>=n)break;if(e=e.slice(0,r-(n-e.length)),t++,t==this.ranges.length)break;let i=this.ranges[t].from,o=this.lineAfter(i);e+=o,n=i+o.length}return{line:e,end:n}}skipGapsTo(t,e,n){for(;;){let r=this.ranges[this.rangeIndex].to,i=t+e;if(n>0?r>i:r>=i)break;e+=this.ranges[++this.rangeIndex].from-r}return e}moveRangeIndex(){for(;this.ranges[this.rangeIndex].to<this.parsedPos;)this.rangeIndex++}emitToken(t,e,n,r,i){if(this.ranges.length>1){e+=i=this.skipGapsTo(e,i,1);let t=this.chunk.length;n+=i=this.skipGapsTo(n,i,-1),r+=this.chunk.length-t}return this.chunk.push(t,e,n,r),i}parseLine(t){let{line:e,end:n}=this.nextLine(),r=0,{streamParser:i}=this.lang,o=new StringStream(e,t?t.state.tabSize:4,t?getIndentUnit(t.state):2);if(o.eol())i.blankLine(this.state,o.indentUnit);else for(;!o.eol();){let t=readToken(i.token,o,this.state);if(t&&(r=this.emitToken(this.lang.tokenTable.resolve(t),this.parsedPos+o.start,this.parsedPos+o.pos,4,r)),o.start>1e4)break}this.parsedPos=n,this.moveRangeIndex(),this.parsedPos<this.to&&this.parsedPos++}finishChunk(){let t=Tree.build({buffer:this.chunk,start:this.chunkStart,length:this.parsedPos-this.chunkStart,nodeSet,topID:0,maxBufferLength:2048,reused:this.chunkReused});t=new Tree(t.type,t.children,t.positions,t.length,[[this.lang.stateAfter,this.lang.streamParser.copyState(this.state)]]),this.chunks.push(t),this.chunkPos.push(this.chunkStart-this.ranges[0].from),this.chunk=[],this.chunkReused=void 0,this.chunkStart=this.parsedPos}finish(){return new Tree(this.lang.topNode,this.chunks,this.chunkPos,this.parsedPos-this.ranges[0].from).balance()}}function readToken(t,e,n){e.start=e.pos;for(let r=0;r<10;r++){let r=t(e,n);if(e.pos>e.start)return r}throw new Error("Stream parser failed to advance stream.")}const noTokens=Object.create(null),typeArray=[NodeType.none],nodeSet=new NodeSet(typeArray),warned=[],defaultTable=Object.create(null);for(let[t,e]of[["variable","variableName"],["variable-2","variableName.special"],["string-2","string.special"],["def","variableName.definition"],["tag","tagName"],["attribute","attributeName"],["type","typeName"],["builtin","variableName.standard"],["qualifier","modifier"],["error","invalid"],["header","heading"],["property","propertyName"]])defaultTable[t]=createTokenType(noTokens,e);class TokenTable{constructor(t){this.extra=t,this.table=Object.assign(Object.create(null),defaultTable)}resolve(t){return t?this.table[t]||(this.table[t]=createTokenType(this.extra,t)):0}}const defaultTokenTable=new TokenTable(noTokens);function warnForPart(t,e){warned.indexOf(t)>-1||(warned.push(t),console.warn(e))}function createTokenType(t,e){let n=null;for(let r of e.split(".")){let e=t[r]||tags[r];e?"function"==typeof e?n?n=e(n):warnForPart(r,`Modifier ${r} used at start of tag`):n?warnForPart(r,`Tag ${r} used as modifier`):n=e:warnForPart(r,`Unknown highlighting tag ${r}`)}if(!n)return 0;let r=e.replace(/ /g,"_"),i=NodeType.define({id:typeArray.length,name:r,props:[styleTags({[r]:n})]});return typeArray.push(i),i.id}function docID(t){let e=NodeType.define({id:typeArray.length,name:"Document",props:[languageDataProp.add((()=>t))]});return typeArray.push(e),e}export{HighlightStyle,IndentContext,LRLanguage,Language,LanguageDescription,LanguageSupport,ParseContext,StreamLanguage,StringStream,TreeIndentContext,bracketMatching,bracketMatchingHandle,codeFolding,continuedIndent,defaultHighlightStyle,defineLanguageFacet,delimitedIndent,ensureSyntaxTree,flatIndent,foldAll,foldCode,foldEffect,foldGutter,foldInside,foldKeymap,foldNodeProp,foldService,foldState,foldable,foldedRanges,forceParsing,getIndentUnit,getIndentation,highlightingFor,indentNodeProp,indentOnInput,indentRange,indentService,indentString,indentUnit,language,languageDataProp,matchBrackets,sublanguageProp,syntaxHighlighting,syntaxParserRunning,syntaxTree,syntaxTreeAvailable,toggleFold,unfoldAll,unfoldCode,unfoldEffect};