!function(e){"object"==typeof exports&&"object"==typeof module?e(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],e):e(CodeMirror)}((function(e){function t(e,t,i,n){this.cm=e,this.node=t,this.options=i,this.height=n,this.cleared=!1}function i(e,t){for(var i=t.nextSibling;i;i=i.nextSibling)if(i==e.getWrapperElement())return!0;return!1}e.defineExtension("addPanel",(function(e,n){n=n||{},this.state.panels||function(e){var t=e.getWrapperElement(),i=window.getComputedStyle?window.getComputedStyle(t):t.currentStyle,n=parseInt(i.height),r=e.state.panels={setHeight:t.style.height,panels:[],wrapper:document.createElement("div")};t.parentNode.insertBefore(r.wrapper,t);var o=e.hasFocus();r.wrapper.appendChild(t),o&&e.focus();e._setSize=e.setSize,null!=n&&(e.setSize=function(t,i){if(i||(i=r.wrapper.offsetHeight),r.setHeight=i,"number"!=typeof i){var o=/^(\d+\.?\d*)px$/.exec(i);o?i=Number(o[1]):(r.wrapper.style.height=i,i=r.wrapper.offsetHeight)}var s=i-r.panels.map((function(e){return e.node.getBoundingClientRect().height})).reduce((function(e,t){return e+t}),0);e._setSize(t,s),n=i})}(this);var r=this.state.panels,o=r.wrapper,s=this.getWrapperElement(),a=n.replace instanceof t&&!n.replace.cleared;n.after instanceof t&&!n.after.cleared?o.insertBefore(e,n.before.node.nextSibling):n.before instanceof t&&!n.before.cleared?o.insertBefore(e,n.before.node):a?(o.insertBefore(e,n.replace.node),n.replace.clear(!0)):"bottom"==n.position?o.appendChild(e):"before-bottom"==n.position?o.insertBefore(e,s.nextSibling):"after-top"==n.position?o.insertBefore(e,s):o.insertBefore(e,o.firstChild);var p=n&&n.height||e.offsetHeight,l=new t(this,e,n,p);return r.panels.push(l),this.setSize(),n.stable&&i(this,e)&&this.scrollTo(null,this.getScrollInfo().top+p),l})),t.prototype.clear=function(e){if(!this.cleared){this.cleared=!0;var t=this.cm.state.panels;t.panels.splice(t.panels.indexOf(this),1),this.cm.setSize(),this.options.stable&&i(this.cm,this.node)&&this.cm.scrollTo(null,this.cm.getScrollInfo().top-this.height),t.wrapper.removeChild(this.node),0!=t.panels.length||e||function(e){var t=e.state.panels;e.state.panels=null;var i=e.getWrapperElement();t.wrapper.parentNode.replaceChild(i,t.wrapper),i.style.height=t.setHeight,e.setSize=e._setSize,e.setSize()}(this.cm)}},t.prototype.changed=function(){this.height=this.node.getBoundingClientRect().height,this.cm.setSize()}}));