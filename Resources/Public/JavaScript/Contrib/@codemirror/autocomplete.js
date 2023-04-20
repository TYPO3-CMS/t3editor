import{Annotation,EditorSelection,codePointAt,codePointSize,fromCodePoint,Facet,combineConfig,StateEffect,StateField,Prec,Text,MapMode,RangeValue,RangeSet,CharCategory}from"@codemirror/state";import{logException,Direction,showTooltip,EditorView,ViewPlugin,getTooltip,Decoration,WidgetType,keymap}from"@codemirror/view";import{syntaxTree,indentUnit}from"@codemirror/language";class CompletionContext{constructor(e,t,o){this.state=e,this.pos=t,this.explicit=o,this.abortListeners=[]}tokenBefore(e){let t=syntaxTree(this.state).resolveInner(this.pos,-1);for(;t&&e.indexOf(t.name)<0;)t=t.parent;return t?{from:t.from,to:this.pos,text:this.state.sliceDoc(t.from,this.pos),type:t.type}:null}matchBefore(e){let t=this.state.doc.lineAt(this.pos),o=Math.max(t.from,this.pos-250),n=t.text.slice(o-t.from,this.pos-t.from),i=n.search(ensureAnchor(e,!1));return i<0?null:{from:o+i,to:this.pos,text:n.slice(i)}}get aborted(){return null==this.abortListeners}addEventListener(e,t){"abort"==e&&this.abortListeners&&this.abortListeners.push(t)}}function toSet(e){let t=Object.keys(e).join(""),o=/\w/.test(t);return o&&(t=t.replace(/\w/g,"")),`[${o?"\\w":""}${t.replace(/[^\w\s]/g,"\\$&")}]`}function prefixMatch(e){let t=Object.create(null),o=Object.create(null);for(let{label:n}of e){t[n[0]]=!0;for(let e=1;e<n.length;e++)o[n[e]]=!0}let n=toSet(t)+toSet(o)+"*$";return[new RegExp("^"+n),new RegExp(n)]}function completeFromList(e){let t=e.map((e=>"string"==typeof e?{label:e}:e)),[o,n]=t.every((e=>/^\w+$/.test(e.label)))?[/\w*$/,/\w+$/]:prefixMatch(t);return e=>{let i=e.matchBefore(n);return i||e.explicit?{from:i?i.from:e.pos,options:t,validFor:o}:null}}function ifIn(e,t){return o=>{for(let n=syntaxTree(o.state).resolveInner(o.pos,-1);n;n=n.parent){if(e.indexOf(n.name)>-1)return t(o);if(n.type.isTop)break}return null}}function ifNotIn(e,t){return o=>{for(let t=syntaxTree(o.state).resolveInner(o.pos,-1);t;t=t.parent){if(e.indexOf(t.name)>-1)return null;if(t.type.isTop)break}return t(o)}}class Option{constructor(e,t,o){this.completion=e,this.source=t,this.match=o}}function cur(e){return e.selection.main.head}function ensureAnchor(e,t){var o;let{source:n}=e,i=t&&"^"!=n[0],s="$"!=n[n.length-1];return i||s?new RegExp(`${i?"^":""}(?:${n})${s?"$":""}`,null!==(o=e.flags)&&void 0!==o?o:e.ignoreCase?"i":""):e}const pickedCompletion=Annotation.define();function insertCompletionText(e,t,o,n){return Object.assign(Object.assign({},e.changeByRange((i=>{if(i==e.selection.main)return{changes:{from:o,to:n,insert:t},range:EditorSelection.cursor(o+t.length)};let s=n-o;return!i.empty||s&&e.sliceDoc(i.from-s,i.from)!=e.sliceDoc(o,n)?{range:i}:{changes:{from:i.from-s,to:i.from,insert:t},range:EditorSelection.cursor(i.from-s+t.length)}}))),{userEvent:"input.complete"})}function applyCompletion(e,t){const o=t.completion.apply||t.completion.label;let n=t.source;"string"==typeof o?e.dispatch(Object.assign(Object.assign({},insertCompletionText(e.state,o,n.from,n.to)),{annotations:pickedCompletion.of(t.completion)})):o(e,t.completion,n.from,n.to)}const SourceCache=new WeakMap;function asSource(e){if(!Array.isArray(e))return e;let t=SourceCache.get(e);return t||SourceCache.set(e,t=completeFromList(e)),t}class FuzzyMatcher{constructor(e){this.pattern=e,this.chars=[],this.folded=[],this.any=[],this.precise=[],this.byWord=[];for(let t=0;t<e.length;){let o=codePointAt(e,t),n=codePointSize(o);this.chars.push(o);let i=e.slice(t,t+n),s=i.toUpperCase();this.folded.push(codePointAt(s==i?i.toLowerCase():s,0)),t+=n}this.astral=e.length!=this.chars.length}match(e){if(0==this.pattern.length)return[0];if(e.length<this.pattern.length)return null;let{chars:t,folded:o,any:n,precise:i,byWord:s}=this;if(1==t.length){let n=codePointAt(e,0),i=codePointSize(n),s=i==e.length?0:-100;if(n==t[0]);else{if(n!=o[0])return null;s+=-200}return[s,0,i]}let l=e.indexOf(this.pattern);if(0==l)return[e.length==this.pattern.length?0:-100,0,this.pattern.length];let r=t.length,c=0;if(l<0){for(let i=0,s=Math.min(e.length,200);i<s&&c<r;){let s=codePointAt(e,i);s!=t[c]&&s!=o[c]||(n[c++]=i),i+=codePointSize(s)}if(c<r)return null}let a=0,p=0,d=!1,f=0,h=-1,u=-1,m=/[a-z]/.test(e),g=!0;for(let n=0,c=Math.min(e.length,200),v=0;n<c&&p<r;){let c=codePointAt(e,n);l<0&&(a<r&&c==t[a]&&(i[a++]=n),f<r&&(c==t[f]||c==o[f]?(0==f&&(h=n),u=n+1,f++):f=0));let C,S=c<255?c>=48&&c<=57||c>=97&&c<=122?2:c>=65&&c<=90?1:0:(C=fromCodePoint(c))!=C.toLowerCase()?1:C!=C.toUpperCase()?2:0;(!n||1==S&&m||0==v&&0!=S)&&(t[p]==c||o[p]==c&&(d=!0)?s[p++]=n:s.length&&(g=!1)),v=S,n+=codePointSize(c)}return p==r&&0==s[0]&&g?this.result((d?-200:0)-100,s,e):f==r&&0==h?[-200-e.length+(u==e.length?0:-100),0,u]:l>-1?[-700-e.length,l,l+this.pattern.length]:f==r?[-900-e.length,h,u]:p==r?this.result((d?-200:0)-100-700+(g?0:-1100),s,e):2==t.length?null:this.result((n[0]?-700:0)-200-1100,n,e)}result(e,t,o){let n=[e-o.length],i=1;for(let e of t){let t=e+(this.astral?codePointSize(codePointAt(o,e)):1);i>1&&n[i-1]==e?n[i-1]=t:(n[i++]=e,n[i++]=t)}return n}}const completionConfig=Facet.define({combine:e=>combineConfig(e,{activateOnTyping:!0,selectOnOpen:!0,override:null,closeOnBlur:!0,maxRenderedOptions:100,defaultKeymap:!0,tooltipClass:()=>"",optionClass:()=>"",aboveCursor:!1,icons:!0,addToOptions:[],compareCompletions:(e,t)=>e.label.localeCompare(t.label),interactionDelay:75},{defaultKeymap:(e,t)=>e&&t,closeOnBlur:(e,t)=>e&&t,icons:(e,t)=>e&&t,tooltipClass:(e,t)=>o=>joinClass(e(o),t(o)),optionClass:(e,t)=>o=>joinClass(e(o),t(o)),addToOptions:(e,t)=>e.concat(t)})});function joinClass(e,t){return e?t?e+" "+t:e:t}function optionContent(e){let t=e.addToOptions.slice();return e.icons&&t.push({render(e){let t=document.createElement("div");return t.classList.add("cm-completionIcon"),e.type&&t.classList.add(...e.type.split(/\s+/g).map((e=>"cm-completionIcon-"+e))),t.setAttribute("aria-hidden","true"),t},position:20}),t.push({render(e,t,o){let n=document.createElement("span");n.className="cm-completionLabel";let{label:i}=e,s=0;for(let e=1;e<o.length;){let t=o[e++],l=o[e++];t>s&&n.appendChild(document.createTextNode(i.slice(s,t)));let r=n.appendChild(document.createElement("span"));r.appendChild(document.createTextNode(i.slice(t,l))),r.className="cm-completionMatchedText",s=l}return s<i.length&&n.appendChild(document.createTextNode(i.slice(s))),n},position:50},{render(e){if(!e.detail)return null;let t=document.createElement("span");return t.className="cm-completionDetail",t.textContent=e.detail,t},position:80}),t.sort(((e,t)=>e.position-t.position)).map((e=>e.render))}function rangeAroundSelected(e,t,o){if(e<=o)return{from:0,to:e};if(t<0&&(t=0),t<=e>>1){let e=Math.floor(t/o);return{from:e*o,to:(e+1)*o}}let n=Math.floor((e-t)/o);return{from:e-(n+1)*o,to:e-n*o}}class CompletionTooltip{constructor(e,t){this.view=e,this.stateField=t,this.info=null,this.placeInfo={read:()=>this.measureInfo(),write:e=>this.positionInfo(e),key:this},this.space=null,this.currentClass="";let o=e.state.field(t),{options:n,selected:i}=o.open,s=e.state.facet(completionConfig);this.optionContent=optionContent(s),this.optionClass=s.optionClass,this.tooltipClass=s.tooltipClass,this.range=rangeAroundSelected(n.length,i,s.maxRenderedOptions),this.dom=document.createElement("div"),this.dom.className="cm-tooltip-autocomplete",this.updateTooltipClass(e.state),this.dom.addEventListener("mousedown",(t=>{for(let o,i=t.target;i&&i!=this.dom;i=i.parentNode)if("LI"==i.nodeName&&(o=/-(\d+)$/.exec(i.id))&&+o[1]<n.length)return applyCompletion(e,n[+o[1]]),void t.preventDefault()})),this.list=this.dom.appendChild(this.createListBox(n,o.id,this.range)),this.list.addEventListener("scroll",(()=>{this.info&&this.view.requestMeasure(this.placeInfo)}))}mount(){this.updateSel()}update(e){var t,o,n;let i=e.state.field(this.stateField),s=e.startState.field(this.stateField);this.updateTooltipClass(e.state),i!=s&&(this.updateSel(),(null===(t=i.open)||void 0===t?void 0:t.disabled)!=(null===(o=s.open)||void 0===o?void 0:o.disabled)&&this.dom.classList.toggle("cm-tooltip-autocomplete-disabled",!!(null===(n=i.open)||void 0===n?void 0:n.disabled)))}updateTooltipClass(e){let t=this.tooltipClass(e);if(t!=this.currentClass){for(let e of this.currentClass.split(" "))e&&this.dom.classList.remove(e);for(let e of t.split(" "))e&&this.dom.classList.add(e);this.currentClass=t}}positioned(e){this.space=e,this.info&&this.view.requestMeasure(this.placeInfo)}updateSel(){let e=this.view.state.field(this.stateField),t=e.open;if((t.selected>-1&&t.selected<this.range.from||t.selected>=this.range.to)&&(this.range=rangeAroundSelected(t.options.length,t.selected,this.view.state.facet(completionConfig).maxRenderedOptions),this.list.remove(),this.list=this.dom.appendChild(this.createListBox(t.options,e.id,this.range)),this.list.addEventListener("scroll",(()=>{this.info&&this.view.requestMeasure(this.placeInfo)}))),this.updateSelectedOption(t.selected)){this.info&&(this.info.remove(),this.info=null);let{completion:o}=t.options[t.selected],{info:n}=o;if(!n)return;let i="string"==typeof n?document.createTextNode(n):n(o);if(!i)return;"then"in i?i.then((t=>{t&&this.view.state.field(this.stateField,!1)==e&&this.addInfoPane(t)})).catch((e=>logException(this.view.state,e,"completion info"))):this.addInfoPane(i)}}addInfoPane(e){let t=this.info=document.createElement("div");t.className="cm-tooltip cm-completionInfo",t.appendChild(e),this.dom.appendChild(t),this.view.requestMeasure(this.placeInfo)}updateSelectedOption(e){let t=null;for(let o=this.list.firstChild,n=this.range.from;o;o=o.nextSibling,n++)n==e?o.hasAttribute("aria-selected")||(o.setAttribute("aria-selected","true"),t=o):o.hasAttribute("aria-selected")&&o.removeAttribute("aria-selected");return t&&scrollIntoView(this.list,t),t}measureInfo(){let e=this.dom.querySelector("[aria-selected]");if(!e||!this.info)return null;let t=this.dom.getBoundingClientRect(),o=this.info.getBoundingClientRect(),n=e.getBoundingClientRect(),i=this.space;if(!i){let e=this.dom.ownerDocument.defaultView||window;i={left:0,top:0,right:e.innerWidth,bottom:e.innerHeight}}if(n.top>Math.min(i.bottom,t.bottom)-10||n.bottom<Math.max(i.top,t.top)+10)return null;let s,l=this.view.textDirection==Direction.RTL,r=l,c=!1,a="",p="",d=t.left-i.left,f=i.right-t.right;if(r&&d<Math.min(o.width,f)?r=!1:!r&&f<Math.min(o.width,d)&&(r=!0),o.width<=(r?d:f))a=Math.max(i.top,Math.min(n.top,i.bottom-o.height))-t.top+"px",s=Math.min(400,r?d:f)+"px";else{c=!0,s=Math.min(400,(l?t.right:i.right-t.left)-30)+"px";let e=i.bottom-t.bottom;e>=o.height||e>t.top?a=n.bottom-t.top+"px":p=t.bottom-n.top+"px"}return{top:a,bottom:p,maxWidth:s,class:c?l?"left-narrow":"right-narrow":r?"left":"right"}}positionInfo(e){this.info&&(e?(this.info.style.top=e.top,this.info.style.bottom=e.bottom,this.info.style.maxWidth=e.maxWidth,this.info.className="cm-tooltip cm-completionInfo cm-completionInfo-"+e.class):this.info.style.top="-1e6px")}createListBox(e,t,o){const n=document.createElement("ul");n.id=t,n.setAttribute("role","listbox"),n.setAttribute("aria-expanded","true"),n.setAttribute("aria-label",this.view.state.phrase("Completions"));for(let i=o.from;i<o.to;i++){let{completion:o,match:s}=e[i];const l=n.appendChild(document.createElement("li"));l.id=t+"-"+i,l.setAttribute("role","option");let r=this.optionClass(o);r&&(l.className=r);for(let e of this.optionContent){let t=e(o,this.view.state,s);t&&l.appendChild(t)}}return o.from&&n.classList.add("cm-completionListIncompleteTop"),o.to<e.length&&n.classList.add("cm-completionListIncompleteBottom"),n}}function completionTooltip(e){return t=>new CompletionTooltip(t,e)}function scrollIntoView(e,t){let o=e.getBoundingClientRect(),n=t.getBoundingClientRect();n.top<o.top?e.scrollTop-=o.top-n.top:n.bottom>o.bottom&&(e.scrollTop+=n.bottom-o.bottom)}function score(e){return 100*(e.boost||0)+(e.apply?10:0)+(e.info?5:0)+(e.type?1:0)}function sortOptions(e,t){let o=[],n=0;for(let i of e)if(i.hasResult())if(!1===i.result.filter){let e=i.result.getMatch;for(let t of i.result.options){let s=[1e9-n++];if(e)for(let o of e(t))s.push(o);o.push(new Option(t,i,s))}}else{let e,n=new FuzzyMatcher(t.sliceDoc(i.from,i.to));for(let t of i.result.options)(e=n.match(t.label))&&(null!=t.boost&&(e[0]+=t.boost),o.push(new Option(t,i,e)))}let i=[],s=null,l=t.facet(completionConfig).compareCompletions;for(let e of o.sort(((e,t)=>t.match[0]-e.match[0]||l(e.completion,t.completion))))!s||s.label!=e.completion.label||s.detail!=e.completion.detail||null!=s.type&&null!=e.completion.type&&s.type!=e.completion.type||s.apply!=e.completion.apply?i.push(e):score(e.completion)>score(s)&&(i[i.length-1]=e),s=e.completion;return i}class CompletionDialog{constructor(e,t,o,n,i,s){this.options=e,this.attrs=t,this.tooltip=o,this.timestamp=n,this.selected=i,this.disabled=s}setSelected(e,t){return e==this.selected||e>=this.options.length?this:new CompletionDialog(this.options,makeAttrs(t,e),this.tooltip,this.timestamp,e,this.disabled)}static build(e,t,o,n,i){let s=sortOptions(e,t);if(!s.length)return n&&e.some((e=>1==e.state))?new CompletionDialog(n.options,n.attrs,n.tooltip,n.timestamp,n.selected,!0):null;let l=t.facet(completionConfig).selectOnOpen?0:-1;if(n&&n.selected!=l&&-1!=n.selected){let e=n.options[n.selected].completion;for(let t=0;t<s.length;t++)if(s[t].completion==e){l=t;break}}return new CompletionDialog(s,makeAttrs(o,l),{pos:e.reduce(((e,t)=>t.hasResult()?Math.min(e,t.from):e),1e8),create:completionTooltip(completionState),above:i.aboveCursor},n?n.timestamp:Date.now(),l,!1)}map(e){return new CompletionDialog(this.options,this.attrs,Object.assign(Object.assign({},this.tooltip),{pos:e.mapPos(this.tooltip.pos)}),this.timestamp,this.selected,this.disabled)}}class CompletionState{constructor(e,t,o){this.active=e,this.id=t,this.open=o}static start(){return new CompletionState(none,"cm-ac-"+Math.floor(2e6*Math.random()).toString(36),null)}update(e){let{state:t}=e,o=t.facet(completionConfig),n=(o.override||t.languageDataAt("autocomplete",cur(t)).map(asSource)).map((t=>(this.active.find((e=>e.source==t))||new ActiveSource(t,this.active.some((e=>0!=e.state))?1:0)).update(e,o)));n.length==this.active.length&&n.every(((e,t)=>e==this.active[t]))&&(n=this.active);let i=this.open;i&&e.docChanged&&(i=i.map(e.changes)),e.selection||n.some((t=>t.hasResult()&&e.changes.touchesRange(t.from,t.to)))||!sameResults(n,this.active)?i=CompletionDialog.build(n,t,this.id,i,o):i&&i.disabled&&!n.some((e=>1==e.state))&&(i=null),!i&&n.every((e=>1!=e.state))&&n.some((e=>e.hasResult()))&&(n=n.map((e=>e.hasResult()?new ActiveSource(e.source,0):e)));for(let t of e.effects)t.is(setSelectedEffect)&&(i=i&&i.setSelected(t.value,this.id));return n==this.active&&i==this.open?this:new CompletionState(n,this.id,i)}get tooltip(){return this.open?this.open.tooltip:null}get attrs(){return this.open?this.open.attrs:baseAttrs}}function sameResults(e,t){if(e==t)return!0;for(let o=0,n=0;;){for(;o<e.length&&!e[o].hasResult;)o++;for(;n<t.length&&!t[n].hasResult;)n++;let i=o==e.length,s=n==t.length;if(i||s)return i==s;if(e[o++].result!=t[n++].result)return!1}}const baseAttrs={"aria-autocomplete":"list"};function makeAttrs(e,t){let o={"aria-autocomplete":"list","aria-haspopup":"listbox","aria-controls":e};return t>-1&&(o["aria-activedescendant"]=e+"-"+t),o}const none=[];function getUserEvent(e){return e.isUserEvent("input.type")?"input":e.isUserEvent("delete.backward")?"delete":null}class ActiveSource{constructor(e,t,o=-1){this.source=e,this.state=t,this.explicitPos=o}hasResult(){return!1}update(e,t){let o=getUserEvent(e),n=this;o?n=n.handleUserEvent(e,o,t):e.docChanged?n=n.handleChange(e):e.selection&&0!=n.state&&(n=new ActiveSource(n.source,0));for(let t of e.effects)if(t.is(startCompletionEffect))n=new ActiveSource(n.source,1,t.value?cur(e.state):-1);else if(t.is(closeCompletionEffect))n=new ActiveSource(n.source,0);else if(t.is(setActiveEffect))for(let e of t.value)e.source==n.source&&(n=e);return n}handleUserEvent(e,t,o){return"delete"!=t&&o.activateOnTyping?new ActiveSource(this.source,1):this.map(e.changes)}handleChange(e){return e.changes.touchesRange(cur(e.startState))?new ActiveSource(this.source,0):this.map(e.changes)}map(e){return e.empty||this.explicitPos<0?this:new ActiveSource(this.source,this.state,e.mapPos(this.explicitPos))}}class ActiveResult extends ActiveSource{constructor(e,t,o,n,i){super(e,2,t),this.result=o,this.from=n,this.to=i}hasResult(){return!0}handleUserEvent(e,t,o){var n;let i=e.changes.mapPos(this.from),s=e.changes.mapPos(this.to,1),l=cur(e.state);if((this.explicitPos<0?l<=i:l<this.from)||l>s||"delete"==t&&cur(e.startState)==this.from)return new ActiveSource(this.source,"input"==t&&o.activateOnTyping?1:0);let r,c=this.explicitPos<0?-1:e.changes.mapPos(this.explicitPos);return checkValid(this.result.validFor,e.state,i,s)?new ActiveResult(this.source,c,this.result,i,s):this.result.update&&(r=this.result.update(this.result,i,s,new CompletionContext(e.state,l,c>=0)))?new ActiveResult(this.source,c,r,r.from,null!==(n=r.to)&&void 0!==n?n:cur(e.state)):new ActiveSource(this.source,1,c)}handleChange(e){return e.changes.touchesRange(this.from,this.to)?new ActiveSource(this.source,0):this.map(e.changes)}map(e){return e.empty?this:new ActiveResult(this.source,this.explicitPos<0?-1:e.mapPos(this.explicitPos),this.result,e.mapPos(this.from),e.mapPos(this.to,1))}}function checkValid(e,t,o,n){if(!e)return!1;let i=t.sliceDoc(o,n);return"function"==typeof e?e(i,o,n,t):ensureAnchor(e,!0).test(i)}const startCompletionEffect=StateEffect.define(),closeCompletionEffect=StateEffect.define(),setActiveEffect=StateEffect.define({map:(e,t)=>e.map((e=>e.map(t)))}),setSelectedEffect=StateEffect.define(),completionState=StateField.define({create:()=>CompletionState.start(),update:(e,t)=>e.update(t),provide:e=>[showTooltip.from(e,(e=>e.tooltip)),EditorView.contentAttributes.from(e,(e=>e.attrs))]});function moveCompletionSelection(e,t="option"){return o=>{let n=o.state.field(completionState,!1);if(!n||!n.open||n.open.disabled||Date.now()-n.open.timestamp<o.state.facet(completionConfig).interactionDelay)return!1;let i,s=1;"page"==t&&(i=getTooltip(o,n.open.tooltip))&&(s=Math.max(2,Math.floor(i.dom.offsetHeight/i.dom.querySelector("li").offsetHeight)-1));let{length:l}=n.open.options,r=n.open.selected>-1?n.open.selected+s*(e?1:-1):e?0:l-1;return r<0?r="page"==t?0:l-1:r>=l&&(r="page"==t?l-1:0),o.dispatch({effects:setSelectedEffect.of(r)}),!0}}const acceptCompletion=e=>{let t=e.state.field(completionState,!1);return!(e.state.readOnly||!t||!t.open||t.open.selected<0||Date.now()-t.open.timestamp<e.state.facet(completionConfig).interactionDelay)&&(t.open.disabled||applyCompletion(e,t.open.options[t.open.selected]),!0)},startCompletion=e=>!!e.state.field(completionState,!1)&&(e.dispatch({effects:startCompletionEffect.of(!0)}),!0),closeCompletion=e=>{let t=e.state.field(completionState,!1);return!(!t||!t.active.some((e=>0!=e.state)))&&(e.dispatch({effects:closeCompletionEffect.of(null)}),!0)};class RunningQuery{constructor(e,t){this.active=e,this.context=t,this.time=Date.now(),this.updates=[],this.done=void 0}}const DebounceTime=50,MaxUpdateCount=50,MinAbortTime=1e3,completionPlugin=ViewPlugin.fromClass(class{constructor(e){this.view=e,this.debounceUpdate=-1,this.running=[],this.debounceAccept=-1,this.composing=0;for(let t of e.state.field(completionState).active)1==t.state&&this.startQuery(t)}update(e){let t=e.state.field(completionState);if(!e.selectionSet&&!e.docChanged&&e.startState.field(completionState)==t)return;let o=e.transactions.some((e=>(e.selection||e.docChanged)&&!getUserEvent(e)));for(let t=0;t<this.running.length;t++){let n=this.running[t];if(o||n.updates.length+e.transactions.length>50&&Date.now()-n.time>1e3){for(let e of n.context.abortListeners)try{e()}catch(e){logException(this.view.state,e)}n.context.abortListeners=null,this.running.splice(t--,1)}else n.updates.push(...e.transactions)}if(this.debounceUpdate>-1&&clearTimeout(this.debounceUpdate),this.debounceUpdate=t.active.some((e=>1==e.state&&!this.running.some((t=>t.active.source==e.source))))?setTimeout((()=>this.startUpdate()),50):-1,0!=this.composing)for(let t of e.transactions)"input"==getUserEvent(t)?this.composing=2:2==this.composing&&t.selection&&(this.composing=3)}startUpdate(){this.debounceUpdate=-1;let{state:e}=this.view,t=e.field(completionState);for(let e of t.active)1!=e.state||this.running.some((t=>t.active.source==e.source))||this.startQuery(e)}startQuery(e){let{state:t}=this.view,o=cur(t),n=new CompletionContext(t,o,e.explicitPos==o),i=new RunningQuery(e,n);this.running.push(i),Promise.resolve(e.source(n)).then((e=>{i.context.aborted||(i.done=e||null,this.scheduleAccept())}),(e=>{this.view.dispatch({effects:closeCompletionEffect.of(null)}),logException(this.view.state,e)}))}scheduleAccept(){this.running.every((e=>void 0!==e.done))?this.accept():this.debounceAccept<0&&(this.debounceAccept=setTimeout((()=>this.accept()),50))}accept(){var e;this.debounceAccept>-1&&clearTimeout(this.debounceAccept),this.debounceAccept=-1;let t=[],o=this.view.state.facet(completionConfig);for(let n=0;n<this.running.length;n++){let i=this.running[n];if(void 0===i.done)continue;if(this.running.splice(n--,1),i.done){let n=new ActiveResult(i.active.source,i.active.explicitPos,i.done,i.done.from,null!==(e=i.done.to)&&void 0!==e?e:cur(i.updates.length?i.updates[0].startState:this.view.state));for(let e of i.updates)n=n.update(e,o);if(n.hasResult()){t.push(n);continue}}let s=this.view.state.field(completionState).active.find((e=>e.source==i.active.source));if(s&&1==s.state)if(null==i.done){let e=new ActiveSource(i.active.source,0);for(let t of i.updates)e=e.update(t,o);1!=e.state&&t.push(e)}else this.startQuery(s)}t.length&&this.view.dispatch({effects:setActiveEffect.of(t)})}},{eventHandlers:{blur(){let e=this.view.state.field(completionState,!1);e&&e.tooltip&&this.view.state.facet(completionConfig).closeOnBlur&&this.view.dispatch({effects:closeCompletionEffect.of(null)})},compositionstart(){this.composing=1},compositionend(){3==this.composing&&setTimeout((()=>this.view.dispatch({effects:startCompletionEffect.of(!1)})),20),this.composing=0}}}),baseTheme=EditorView.baseTheme({".cm-tooltip.cm-tooltip-autocomplete":{"& > ul":{fontFamily:"monospace",whiteSpace:"nowrap",overflow:"hidden auto",maxWidth_fallback:"700px",maxWidth:"min(700px, 95vw)",minWidth:"250px",maxHeight:"10em",height:"100%",listStyle:"none",margin:0,padding:0,"& > li":{overflowX:"hidden",textOverflow:"ellipsis",cursor:"pointer",padding:"1px 3px",lineHeight:1.2}}},"&light .cm-tooltip-autocomplete ul li[aria-selected]":{background:"#17c",color:"white"},"&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]":{background:"#777"},"&dark .cm-tooltip-autocomplete ul li[aria-selected]":{background:"#347",color:"white"},"&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]":{background:"#444"},".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after":{content:'"···"',opacity:.5,display:"block",textAlign:"center"},".cm-tooltip.cm-completionInfo":{position:"absolute",padding:"3px 9px",width:"max-content",maxWidth:"400px",boxSizing:"border-box"},".cm-completionInfo.cm-completionInfo-left":{right:"100%"},".cm-completionInfo.cm-completionInfo-right":{left:"100%"},".cm-completionInfo.cm-completionInfo-left-narrow":{right:"30px"},".cm-completionInfo.cm-completionInfo-right-narrow":{left:"30px"},"&light .cm-snippetField":{backgroundColor:"#00000022"},"&dark .cm-snippetField":{backgroundColor:"#ffffff22"},".cm-snippetFieldPosition":{verticalAlign:"text-top",width:0,height:"1.15em",display:"inline-block",margin:"0 -0.7px -.7em",borderLeft:"1.4px dotted #888"},".cm-completionMatchedText":{textDecoration:"underline"},".cm-completionDetail":{marginLeft:"0.5em",fontStyle:"italic"},".cm-completionIcon":{fontSize:"90%",width:".8em",display:"inline-block",textAlign:"center",paddingRight:".6em",opacity:"0.6",boxSizing:"content-box"},".cm-completionIcon-function, .cm-completionIcon-method":{"&:after":{content:"'ƒ'"}},".cm-completionIcon-class":{"&:after":{content:"'○'"}},".cm-completionIcon-interface":{"&:after":{content:"'◌'"}},".cm-completionIcon-variable":{"&:after":{content:"'𝑥'"}},".cm-completionIcon-constant":{"&:after":{content:"'𝐶'"}},".cm-completionIcon-type":{"&:after":{content:"'𝑡'"}},".cm-completionIcon-enum":{"&:after":{content:"'∪'"}},".cm-completionIcon-property":{"&:after":{content:"'□'"}},".cm-completionIcon-keyword":{"&:after":{content:"'🔑︎'"}},".cm-completionIcon-namespace":{"&:after":{content:"'▢'"}},".cm-completionIcon-text":{"&:after":{content:"'abc'",fontSize:"50%",verticalAlign:"middle"}}});class FieldPos{constructor(e,t,o,n){this.field=e,this.line=t,this.from=o,this.to=n}}class FieldRange{constructor(e,t,o){this.field=e,this.from=t,this.to=o}map(e){let t=e.mapPos(this.from,-1,MapMode.TrackDel),o=e.mapPos(this.to,1,MapMode.TrackDel);return null==t||null==o?null:new FieldRange(this.field,t,o)}}class Snippet{constructor(e,t){this.lines=e,this.fieldPositions=t}instantiate(e,t){let o=[],n=[t],i=e.doc.lineAt(t),s=/^\s*/.exec(i.text)[0];for(let i of this.lines){if(o.length){let o=s,l=/^\t*/.exec(i)[0].length;for(let t=0;t<l;t++)o+=e.facet(indentUnit);n.push(t+o.length-l),i=o+i.slice(l)}o.push(i),t+=i.length+1}let l=this.fieldPositions.map((e=>new FieldRange(e.field,n[e.line]+e.from,n[e.line]+e.to)));return{text:o,ranges:l}}static parse(e){let t,o=[],n=[],i=[];for(let s of e.split(/\r\n?|\n/)){for(;t=/[#$]\{(?:(\d+)(?::([^}]*))?|([^}]*))\}/.exec(s);){let e=t[1]?+t[1]:null,l=t[2]||t[3]||"",r=-1;for(let t=0;t<o.length;t++)(null!=e?o[t].seq==e:l&&o[t].name==l)&&(r=t);if(r<0){let t=0;for(;t<o.length&&(null==e||null!=o[t].seq&&o[t].seq<e);)t++;o.splice(t,0,{seq:e,name:l}),r=t;for(let e of i)e.field>=r&&e.field++}i.push(new FieldPos(r,n.length,t.index,t.index+l.length)),s=s.slice(0,t.index)+l+s.slice(t.index+t[0].length)}for(let e;e=/\\([{}])/.exec(s);){s=s.slice(0,e.index)+e[1]+s.slice(e.index+e[0].length);for(let t of i)t.line==n.length&&t.from>e.index&&(t.from--,t.to--)}n.push(s)}return new Snippet(n,i)}}let fieldMarker=Decoration.widget({widget:new class extends WidgetType{toDOM(){let e=document.createElement("span");return e.className="cm-snippetFieldPosition",e}ignoreEvent(){return!1}}}),fieldRange=Decoration.mark({class:"cm-snippetField"});class ActiveSnippet{constructor(e,t){this.ranges=e,this.active=t,this.deco=Decoration.set(e.map((e=>(e.from==e.to?fieldMarker:fieldRange).range(e.from,e.to))))}map(e){let t=[];for(let o of this.ranges){let n=o.map(e);if(!n)return null;t.push(n)}return new ActiveSnippet(t,this.active)}selectionInsideField(e){return e.ranges.every((e=>this.ranges.some((t=>t.field==this.active&&t.from<=e.from&&t.to>=e.to))))}}const setActive=StateEffect.define({map:(e,t)=>e&&e.map(t)}),moveToField=StateEffect.define(),snippetState=StateField.define({create:()=>null,update(e,t){for(let o of t.effects){if(o.is(setActive))return o.value;if(o.is(moveToField)&&e)return new ActiveSnippet(e.ranges,o.value)}return e&&t.docChanged&&(e=e.map(t.changes)),e&&t.selection&&!e.selectionInsideField(t.selection)&&(e=null),e},provide:e=>EditorView.decorations.from(e,(e=>e?e.deco:Decoration.none))});function fieldSelection(e,t){return EditorSelection.create(e.filter((e=>e.field==t)).map((e=>EditorSelection.range(e.from,e.to))))}function snippet(e){let t=Snippet.parse(e);return(e,o,n,i)=>{let{text:s,ranges:l}=t.instantiate(e.state,n),r={changes:{from:n,to:i,insert:Text.of(s)},scrollIntoView:!0,annotations:pickedCompletion.of(o)};if(l.length&&(r.selection=fieldSelection(l,0)),l.length>1){let t=new ActiveSnippet(l,0),o=r.effects=[setActive.of(t)];void 0===e.state.field(snippetState,!1)&&o.push(StateEffect.appendConfig.of([snippetState,addSnippetKeymap,snippetPointerHandler,baseTheme]))}e.dispatch(e.state.update(r))}}function moveField(e){return({state:t,dispatch:o})=>{let n=t.field(snippetState,!1);if(!n||e<0&&0==n.active)return!1;let i=n.active+e,s=e>0&&!n.ranges.some((t=>t.field==i+e));return o(t.update({selection:fieldSelection(n.ranges,i),effects:setActive.of(s?null:new ActiveSnippet(n.ranges,i))})),!0}}const clearSnippet=({state:e,dispatch:t})=>!!e.field(snippetState,!1)&&(t(e.update({effects:setActive.of(null)})),!0),nextSnippetField=moveField(1),prevSnippetField=moveField(-1),defaultSnippetKeymap=[{key:"Tab",run:nextSnippetField,shift:prevSnippetField},{key:"Escape",run:clearSnippet}],snippetKeymap=Facet.define({combine:e=>e.length?e[0]:defaultSnippetKeymap}),addSnippetKeymap=Prec.highest(keymap.compute([snippetKeymap],(e=>e.facet(snippetKeymap))));function snippetCompletion(e,t){return Object.assign(Object.assign({},t),{apply:snippet(e)})}const snippetPointerHandler=EditorView.domEventHandlers({mousedown(e,t){let o,n=t.state.field(snippetState,!1);if(!n||null==(o=t.posAtCoords({x:e.clientX,y:e.clientY})))return!1;let i=n.ranges.find((e=>e.from<=o&&e.to>=o));return!(!i||i.field==n.active)&&(t.dispatch({selection:fieldSelection(n.ranges,i.field),effects:setActive.of(n.ranges.some((e=>e.field>i.field))?new ActiveSnippet(n.ranges,i.field):null)}),!0)}});function wordRE(e){let t=e.replace(/[\\[.+*?(){|^$]/g,"\\$&");try{return new RegExp(`[\\p{Alphabetic}\\p{Number}_${t}]+`,"ug")}catch(e){return new RegExp(`[w${t}]`,"g")}}function mapRE(e,t){return new RegExp(t(e.source),e.unicode?"u":"")}const wordCaches=Object.create(null);function wordCache(e){return wordCaches[e]||(wordCaches[e]=new WeakMap)}function storeWords(e,t,o,n,i){for(let s=e.iterLines(),l=0;!s.next().done;){let e,{value:r}=s;for(t.lastIndex=0;e=t.exec(r);)if(!n[e[0]]&&l+e.index!=i&&(o.push({type:"text",label:e[0]}),n[e[0]]=!0,o.length>=2e3))return;l+=r.length+1}}function collectWords(e,t,o,n,i){let s=e.length>=1e3,l=s&&t.get(e);if(l)return l;let r=[],c=Object.create(null);if(e.children){let s=0;for(let l of e.children){if(l.length>=1e3)for(let e of collectWords(l,t,o,n-s,i-s))c[e.label]||(c[e.label]=!0,r.push(e));else storeWords(l,o,r,c,i-s);s+=l.length+1}}else storeWords(e,o,r,c,i);return s&&r.length<2e3&&t.set(e,r),r}const completeAnyWord=e=>{let t=e.state.languageDataAt("wordChars",e.pos).join(""),o=wordRE(t),n=e.matchBefore(mapRE(o,(e=>e+"$")));if(!n&&!e.explicit)return null;let i=n?n.from:e.pos;return{from:i,options:collectWords(e.state.doc,wordCache(t),o,5e4,i),validFor:mapRE(o,(e=>"^"+e))}},defaults={brackets:["(","[","{","'",'"'],before:")]}:;>",stringPrefixes:[]},closeBracketEffect=StateEffect.define({map(e,t){let o=t.mapPos(e,-1,MapMode.TrackAfter);return null==o?void 0:o}}),skipBracketEffect=StateEffect.define({map:(e,t)=>t.mapPos(e)}),closedBracket=new class extends RangeValue{};closedBracket.startSide=1,closedBracket.endSide=-1;const bracketState=StateField.define({create:()=>RangeSet.empty,update(e,t){if(t.selection){let o=t.state.doc.lineAt(t.selection.main.head).from,n=t.startState.doc.lineAt(t.startState.selection.main.head).from;o!=t.changes.mapPos(n,-1)&&(e=RangeSet.empty)}e=e.map(t.changes);for(let o of t.effects)o.is(closeBracketEffect)?e=e.update({add:[closedBracket.range(o.value,o.value+1)]}):o.is(skipBracketEffect)&&(e=e.update({filter:e=>e!=o.value}));return e}});function closeBrackets(){return[inputHandler,bracketState]}const definedClosing="()[]{}<>";function closing(e){for(let t=0;t<definedClosing.length;t+=2)if(definedClosing.charCodeAt(t)==e)return definedClosing.charAt(t+1);return fromCodePoint(e<128?e:e+1)}function config(e,t){return e.languageDataAt("closeBrackets",t)[0]||defaults}const android="object"==typeof navigator&&/Android\b/.test(navigator.userAgent),inputHandler=EditorView.inputHandler.of(((e,t,o,n)=>{if((android?e.composing:e.compositionStarted)||e.state.readOnly)return!1;let i=e.state.selection.main;if(n.length>2||2==n.length&&1==codePointSize(codePointAt(n,0))||t!=i.from||o!=i.to)return!1;let s=insertBracket(e.state,n);return!!s&&(e.dispatch(s),!0)})),deleteBracketPair=({state:e,dispatch:t})=>{if(e.readOnly)return!1;let o=config(e,e.selection.main.head).brackets||defaults.brackets,n=null,i=e.changeByRange((t=>{if(t.empty){let n=prevChar(e.doc,t.head);for(let i of o)if(i==n&&nextChar(e.doc,t.head)==closing(codePointAt(i,0)))return{changes:{from:t.head-i.length,to:t.head+i.length},range:EditorSelection.cursor(t.head-i.length)}}return{range:n=t}}));return n||t(e.update(i,{scrollIntoView:!0,userEvent:"delete.backward"})),!n},closeBracketsKeymap=[{key:"Backspace",run:deleteBracketPair}];function insertBracket(e,t){let o=config(e,e.selection.main.head),n=o.brackets||defaults.brackets;for(let i of n){let s=closing(codePointAt(i,0));if(t==i)return s==i?handleSame(e,i,n.indexOf(i+i+i)>-1,o):handleOpen(e,i,s,o.before||defaults.before);if(t==s&&closedBracketAt(e,e.selection.main.from))return handleClose(e,i,s)}return null}function closedBracketAt(e,t){let o=!1;return e.field(bracketState).between(0,e.doc.length,(e=>{e==t&&(o=!0)})),o}function nextChar(e,t){let o=e.sliceString(t,t+2);return o.slice(0,codePointSize(codePointAt(o,0)))}function prevChar(e,t){let o=e.sliceString(t-2,t);return codePointSize(codePointAt(o,0))==o.length?o:o.slice(1)}function handleOpen(e,t,o,n){let i=null,s=e.changeByRange((s=>{if(!s.empty)return{changes:[{insert:t,from:s.from},{insert:o,from:s.to}],effects:closeBracketEffect.of(s.to+t.length),range:EditorSelection.range(s.anchor+t.length,s.head+t.length)};let l=nextChar(e.doc,s.head);return!l||/\s/.test(l)||n.indexOf(l)>-1?{changes:{insert:t+o,from:s.head},effects:closeBracketEffect.of(s.head+t.length),range:EditorSelection.cursor(s.head+t.length)}:{range:i=s}}));return i?null:e.update(s,{scrollIntoView:!0,userEvent:"input.type"})}function handleClose(e,t,o){let n=null,i=e.selection.ranges.map((t=>t.empty&&nextChar(e.doc,t.head)==o?EditorSelection.cursor(t.head+o.length):n=t));return n?null:e.update({selection:EditorSelection.create(i,e.selection.mainIndex),scrollIntoView:!0,effects:e.selection.ranges.map((({from:e})=>skipBracketEffect.of(e)))})}function handleSame(e,t,o,n){let i=n.stringPrefixes||defaults.stringPrefixes,s=null,l=e.changeByRange((n=>{if(!n.empty)return{changes:[{insert:t,from:n.from},{insert:t,from:n.to}],effects:closeBracketEffect.of(n.to+t.length),range:EditorSelection.range(n.anchor+t.length,n.head+t.length)};let l,r=n.head,c=nextChar(e.doc,r);if(c==t){if(nodeStart(e,r))return{changes:{insert:t+t,from:r},effects:closeBracketEffect.of(r+t.length),range:EditorSelection.cursor(r+t.length)};if(closedBracketAt(e,r)){let n=o&&e.sliceDoc(r,r+3*t.length)==t+t+t;return{range:EditorSelection.cursor(r+t.length*(n?3:1)),effects:skipBracketEffect.of(r)}}}else{if(o&&e.sliceDoc(r-2*t.length,r)==t+t&&(l=canStartStringAt(e,r-2*t.length,i))>-1&&nodeStart(e,l))return{changes:{insert:t+t+t+t,from:r},effects:closeBracketEffect.of(r+t.length),range:EditorSelection.cursor(r+t.length)};if(e.charCategorizer(r)(c)!=CharCategory.Word&&canStartStringAt(e,r,i)>-1&&!probablyInString(e,r,t,i))return{changes:{insert:t+t,from:r},effects:closeBracketEffect.of(r+t.length),range:EditorSelection.cursor(r+t.length)}}return{range:s=n}}));return s?null:e.update(l,{scrollIntoView:!0,userEvent:"input.type"})}function nodeStart(e,t){let o=syntaxTree(e).resolveInner(t+1);return o.parent&&o.from==t}function probablyInString(e,t,o,n){let i=syntaxTree(e).resolveInner(t,-1),s=n.reduce(((e,t)=>Math.max(e,t.length)),0);for(let l=0;l<5;l++){let l=e.sliceDoc(i.from,Math.min(i.to,i.from+o.length+s)),r=l.indexOf(o);if(!r||r>-1&&n.indexOf(l.slice(0,r))>-1){let t=i.firstChild;for(;t&&t.from==i.from&&t.to-t.from>o.length+r;){if(e.sliceDoc(t.to-o.length,t.to)==o)return!1;t=t.firstChild}return!0}let c=i.to==t&&i.parent;if(!c)break;i=c}return!1}function canStartStringAt(e,t,o){let n=e.charCategorizer(t);if(n(e.sliceDoc(t-1,t))!=CharCategory.Word)return t;for(let i of o){let o=t-i.length;if(e.sliceDoc(o,t)==i&&n(e.sliceDoc(o-1,o))!=CharCategory.Word)return o}return-1}function autocompletion(e={}){return[completionState,completionConfig.of(e),completionPlugin,completionKeymapExt,baseTheme]}const completionKeymap=[{key:"Ctrl-Space",run:startCompletion},{key:"Escape",run:closeCompletion},{key:"ArrowDown",run:moveCompletionSelection(!0)},{key:"ArrowUp",run:moveCompletionSelection(!1)},{key:"PageDown",run:moveCompletionSelection(!0,"page")},{key:"PageUp",run:moveCompletionSelection(!1,"page")},{key:"Enter",run:acceptCompletion}],completionKeymapExt=Prec.highest(keymap.computeN([completionConfig],(e=>e.facet(completionConfig).defaultKeymap?[completionKeymap]:[])));function completionStatus(e){let t=e.field(completionState,!1);return t&&t.active.some((e=>1==e.state))?"pending":t&&t.active.some((e=>0!=e.state))?"active":null}const completionArrayCache=new WeakMap;function currentCompletions(e){var t;let o=null===(t=e.field(completionState,!1))||void 0===t?void 0:t.open;if(!o||o.disabled)return[];let n=completionArrayCache.get(o.options);return n||completionArrayCache.set(o.options,n=o.options.map((e=>e.completion))),n}function selectedCompletion(e){var t;let o=null===(t=e.field(completionState,!1))||void 0===t?void 0:t.open;return o&&!o.disabled&&o.selected>=0?o.options[o.selected].completion:null}function selectedCompletionIndex(e){var t;let o=null===(t=e.field(completionState,!1))||void 0===t?void 0:t.open;return o&&!o.disabled&&o.selected>=0?o.selected:null}function setSelectedCompletion(e){return setSelectedEffect.of(e)}export{CompletionContext,acceptCompletion,autocompletion,clearSnippet,closeBrackets,closeBracketsKeymap,closeCompletion,completeAnyWord,completeFromList,completionKeymap,completionStatus,currentCompletions,deleteBracketPair,ifIn,ifNotIn,insertBracket,insertCompletionText,moveCompletionSelection,nextSnippetField,pickedCompletion,prevSnippetField,selectedCompletion,selectedCompletionIndex,setSelectedCompletion,snippet,snippetCompletion,snippetKeymap,startCompletion};