function t(){}const e=t=>t;function n(t,e){for(const n in e)t[n]=e[n];return t}function r(t){return t()}function o(){return Object.create(null)}function s(t){t.forEach(r)}function i(t){return"function"==typeof t}function c(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function a(e,...n){if(null==e)return t;const r=e.subscribe(...n);return r.unsubscribe?()=>r.unsubscribe():r}function l(t){let e;return a(t,(t=>e=t))(),e}function u(t,e,n){t.$$.on_destroy.push(a(e,n))}function f(t,e,n,r){if(t){const o=d(t,e,n,r);return t[0](o)}}function d(t,e,r,o){return t[1]&&o?n(r.ctx.slice(),t[1](o(e))):r.ctx}function h(t,e,n,r){if(t[2]&&r){const o=t[2](r(n));if(void 0===e.dirty)return o;if("object"==typeof o){const t=[],n=Math.max(e.dirty.length,o.length);for(let r=0;r<n;r+=1)t[r]=e.dirty[r]|o[r];return t}return e.dirty|o}return e.dirty}function p(t,e,n,r,o,s){if(o){const i=d(e,n,r,s);t.p(i,o)}}function m(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let t=0;t<n;t++)e[t]=-1;return e}return-1}function g(t){return null==t?"":t}function $(t,e,n){return t.set(n),e}const _="undefined"!=typeof window;let v=_?()=>window.performance.now():()=>Date.now(),y=_?t=>requestAnimationFrame(t):t;const b=new Set;function w(t){b.forEach((e=>{e.c(t)||(b.delete(e),e.f())})),0!==b.size&&y(w)}function E(t){let e;return 0===b.size&&y(w),{promise:new Promise((n=>{b.add(e={c:t,f:n})})),abort(){b.delete(e)}}}let x=!1;function S(t,e,n,r){for(;t<e;){const o=t+(e-t>>1);n(o)<=r?t=o+1:e=o}return t}function k(t){if(!t)return document;const e=t.getRootNode?t.getRootNode():t.ownerDocument;return e&&e.host?e:t.ownerDocument}function N(t){const e=C("style");return function(t,e){!function(t,e){t.appendChild(e)}(t.head||t,e)}(k(t),e),e}function I(t,e){if(x){for(!function(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if("HEAD"===t.nodeName){const t=[];for(let n=0;n<e.length;n++){const r=e[n];void 0!==r.claim_order&&t.push(r)}e=t}const n=new Int32Array(e.length+1),r=new Int32Array(e.length);n[0]=-1;let o=0;for(let t=0;t<e.length;t++){const s=e[t].claim_order,i=(o>0&&e[n[o]].claim_order<=s?o+1:S(1,o,(t=>e[n[t]].claim_order),s))-1;r[t]=n[i]+1;const c=i+1;n[c]=t,o=Math.max(c,o)}const s=[],i=[];let c=e.length-1;for(let t=n[o]+1;0!=t;t=r[t-1]){for(s.push(e[t-1]);c>=t;c--)i.push(e[c]);c--}for(;c>=0;c--)i.push(e[c]);s.reverse(),i.sort(((t,e)=>t.claim_order-e.claim_order));for(let e=0,n=0;e<i.length;e++){for(;n<s.length&&i[e].claim_order>=s[n].claim_order;)n++;const r=n<s.length?s[n]:null;t.insertBefore(i[e],r)}}(t),(void 0===t.actual_end_child||null!==t.actual_end_child&&t.actual_end_child.parentElement!==t)&&(t.actual_end_child=t.firstChild);null!==t.actual_end_child&&void 0===t.actual_end_child.claim_order;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?void 0===e.claim_order&&e.parentNode===t||t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else e.parentNode===t&&null===e.nextSibling||t.appendChild(e)}function A(t,e,n){x&&!n?I(t,e):e.parentNode===t&&e.nextSibling==n||t.insertBefore(e,n||null)}function P(t){t.parentNode.removeChild(t)}function R(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function C(t){return document.createElement(t)}function L(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function O(t){return document.createTextNode(t)}function j(){return O(" ")}function T(){return O("")}function U(t,e,n,r){return t.addEventListener(e,n,r),()=>t.removeEventListener(e,n,r)}function q(t){return function(e){return e.preventDefault(),t.call(this,e)}}function J(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function D(t){return Array.from(t.childNodes)}function z(t,e,n,r,o=!1){!function(t){void 0===t.claim_info&&(t.claim_info={last_index:0,total_claimed:0})}(t);const s=(()=>{for(let r=t.claim_info.last_index;r<t.length;r++){const s=t[r];if(e(s)){const e=n(s);return void 0===e?t.splice(r,1):t[r]=e,o||(t.claim_info.last_index=r),s}}for(let r=t.claim_info.last_index-1;r>=0;r--){const s=t[r];if(e(s)){const e=n(s);return void 0===e?t.splice(r,1):t[r]=e,o?void 0===e&&t.claim_info.last_index--:t.claim_info.last_index=r,s}}return r()})();return s.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,s}function B(t,e,n,r){return z(t,(t=>t.nodeName===e),(t=>{const e=[];for(let r=0;r<t.attributes.length;r++){const o=t.attributes[r];n[o.name]||e.push(o.name)}e.forEach((e=>t.removeAttribute(e)))}),(()=>r(e)))}function V(t,e,n){return B(t,e,n,C)}function M(t,e,n){return B(t,e,n,L)}function F(t,e){return z(t,(t=>3===t.nodeType),(t=>{const n=""+e;if(t.data.startsWith(n)){if(t.data.length!==n.length)return t.splitText(n.length)}else t.data=n}),(()=>O(e)),!0)}function K(t){return F(t," ")}function H(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function W(t,e){t.value=null==e?"":e}function Y(t,e,n,r){t.style.setProperty(e,n,r?"important":"")}function G(t,e,n){t.classList[n?"add":"remove"](e)}function X(t,e,n=!1){const r=document.createEvent("CustomEvent");return r.initCustomEvent(t,n,!1,e),r}function Q(t,e=document.body){return Array.from(e.querySelectorAll(t))}const Z=new Set;let tt,et=0;function nt(t,e,n,r,o,s,i,c=0){const a=16.666/r;let l="{\n";for(let t=0;t<=1;t+=a){const r=e+(n-e)*s(t);l+=100*t+`%{${i(r,1-r)}}\n`}const u=l+`100% {${i(n,1-n)}}\n}`,f=`__svelte_${function(t){let e=5381,n=t.length;for(;n--;)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}(u)}_${c}`,d=k(t);Z.add(d);const h=d.__svelte_stylesheet||(d.__svelte_stylesheet=N(t).sheet),p=d.__svelte_rules||(d.__svelte_rules={});p[f]||(p[f]=!0,h.insertRule(`@keyframes ${f} ${u}`,h.cssRules.length));const m=t.style.animation||"";return t.style.animation=`${m?`${m}, `:""}${f} ${r}ms linear ${o}ms 1 both`,et+=1,f}function rt(t,e){const n=(t.style.animation||"").split(", "),r=n.filter(e?t=>t.indexOf(e)<0:t=>-1===t.indexOf("__svelte")),o=n.length-r.length;o&&(t.style.animation=r.join(", "),et-=o,et||y((()=>{et||(Z.forEach((t=>{const e=t.__svelte_stylesheet;let n=e.cssRules.length;for(;n--;)e.deleteRule(n);t.__svelte_rules={}})),Z.clear())})))}function ot(t){tt=t}function st(){if(!tt)throw new Error("Function called outside component initialization");return tt}function it(t){st().$$.on_mount.push(t)}function ct(t){st().$$.on_destroy.push(t)}function at(){const t=st();return(e,n)=>{const r=t.$$.callbacks[e];if(r){const o=X(e,n);r.slice().forEach((e=>{e.call(t,o)}))}}}const lt=[],ut=[],ft=[],dt=[],ht=Promise.resolve();let pt=!1;function mt(t){ft.push(t)}function gt(t){dt.push(t)}let $t=!1;const _t=new Set;function vt(){if(!$t){$t=!0;do{for(let t=0;t<lt.length;t+=1){const e=lt[t];ot(e),yt(e.$$)}for(ot(null),lt.length=0;ut.length;)ut.pop()();for(let t=0;t<ft.length;t+=1){const e=ft[t];_t.has(e)||(_t.add(e),e())}ft.length=0}while(lt.length);for(;dt.length;)dt.pop()();pt=!1,$t=!1,_t.clear()}}function yt(t){if(null!==t.fragment){t.update(),s(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(mt)}}let bt;function wt(){return bt||(bt=Promise.resolve(),bt.then((()=>{bt=null}))),bt}function Et(t,e,n){t.dispatchEvent(X(`${e?"intro":"outro"}${n}`))}const xt=new Set;let St;function kt(){St={r:0,c:[],p:St}}function Nt(){St.r||s(St.c),St=St.p}function It(t,e){t&&t.i&&(xt.delete(t),t.i(e))}function At(t,e,n,r){if(t&&t.o){if(xt.has(t))return;xt.add(t),St.c.push((()=>{xt.delete(t),r&&(n&&t.d(1),r())})),t.o(e)}}const Pt={duration:0};function Rt(n,r,o){let s,c,a=r(n,o),l=!1,u=0;function f(){s&&rt(n,s)}function d(){const{delay:r=0,duration:o=300,easing:i=e,tick:d=t,css:h}=a||Pt;h&&(s=nt(n,0,1,o,r,i,h,u++)),d(0,1);const p=v()+r,m=p+o;c&&c.abort(),l=!0,mt((()=>Et(n,!0,"start"))),c=E((t=>{if(l){if(t>=m)return d(1,0),Et(n,!0,"end"),f(),l=!1;if(t>=p){const e=i((t-p)/o);d(e,1-e)}}return l}))}let h=!1;return{start(){h||(h=!0,rt(n),i(a)?(a=a(),wt().then(d)):d())},invalidate(){h=!1},end(){l&&(f(),l=!1)}}}function Ct(n,r,o){let c,a=r(n,o),l=!0;const u=St;function f(){const{delay:r=0,duration:o=300,easing:i=e,tick:f=t,css:d}=a||Pt;d&&(c=nt(n,1,0,o,r,i,d));const h=v()+r,p=h+o;mt((()=>Et(n,!1,"start"))),E((t=>{if(l){if(t>=p)return f(0,1),Et(n,!1,"end"),--u.r||s(u.c),!1;if(t>=h){const e=i((t-h)/o);f(1-e,e)}}return l}))}return u.r+=1,i(a)?wt().then((()=>{a=a(),f()})):f(),{end(t){t&&a.tick&&a.tick(1,0),l&&(c&&rt(n,c),l=!1)}}}function Lt(t,e){const n=e.token={};function r(t,r,o,s){if(e.token!==n)return;e.resolved=s;let i=e.ctx;void 0!==o&&(i=i.slice(),i[o]=s);const c=t&&(e.current=t)(i);let a=!1;e.block&&(e.blocks?e.blocks.forEach(((t,n)=>{n!==r&&t&&(kt(),At(t,1,1,(()=>{e.blocks[n]===t&&(e.blocks[n]=null)})),Nt())})):e.block.d(1),c.c(),It(c,1),c.m(e.mount(),e.anchor),a=!0),e.block=c,e.blocks&&(e.blocks[r]=c),a&&vt()}if((o=t)&&"object"==typeof o&&"function"==typeof o.then){const n=st();if(t.then((t=>{ot(n),r(e.then,1,e.value,t),ot(null)}),(t=>{if(ot(n),r(e.catch,2,e.error,t),ot(null),!e.hasCatch)throw t})),e.current!==e.pending)return r(e.pending,0),!0}else{if(e.current!==e.then)return r(e.then,1,e.value,t),!0;e.resolved=t}var o}function Ot(t,e,n){const r=e.slice(),{resolved:o}=t;t.current===t.then&&(r[t.value]=o),t.current===t.catch&&(r[t.error]=o),t.block.p(r,n)}function jt(t,e){const n={},r={},o={$$scope:1};let s=t.length;for(;s--;){const i=t[s],c=e[s];if(c){for(const t in i)t in c||(r[t]=1);for(const t in c)o[t]||(n[t]=c[t],o[t]=1);t[s]=c}else for(const t in i)o[t]=1}for(const t in r)t in n||(n[t]=void 0);return n}function Tt(t){return"object"==typeof t&&null!==t?t:{}}function Ut(t,e,n){const r=t.$$.props[e];void 0!==r&&(t.$$.bound[r]=n,n(t.$$.ctx[r]))}function qt(t){t&&t.c()}function Jt(t,e){t&&t.l(e)}function Dt(t,e,n,o){const{fragment:c,on_mount:a,on_destroy:l,after_update:u}=t.$$;c&&c.m(e,n),o||mt((()=>{const e=a.map(r).filter(i);l?l.push(...e):s(e),t.$$.on_mount=[]})),u.forEach(mt)}function zt(t,e){const n=t.$$;null!==n.fragment&&(s(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Bt(t,e){-1===t.$$.dirty[0]&&(lt.push(t),pt||(pt=!0,ht.then(vt)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function Vt(e,n,r,i,c,a,l,u=[-1]){const f=tt;ot(e);const d=e.$$={fragment:null,ctx:null,props:a,update:t,not_equal:c,bound:o(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(n.context||(f?f.$$.context:[])),callbacks:o(),dirty:u,skip_bound:!1,root:n.target||f.$$.root};l&&l(d.root);let h=!1;if(d.ctx=r?r(e,n.props||{},((t,n,...r)=>{const o=r.length?r[0]:n;return d.ctx&&c(d.ctx[t],d.ctx[t]=o)&&(!d.skip_bound&&d.bound[t]&&d.bound[t](o),h&&Bt(e,t)),n})):[],d.update(),h=!0,s(d.before_update),d.fragment=!!i&&i(d.ctx),n.target){if(n.hydrate){x=!0;const t=D(n.target);d.fragment&&d.fragment.l(t),t.forEach(P)}else d.fragment&&d.fragment.c();n.intro&&It(e.$$.fragment),Dt(e,n.target,n.anchor,n.customElement),x=!1,vt()}ot(f)}class Mt{$destroy(){zt(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const Ft=[];function Kt(e,n=t){let r;const o=new Set;function s(t){if(c(e,t)&&(e=t,r)){const t=!Ft.length;for(const t of o)t[1](),Ft.push(t,e);if(t){for(let t=0;t<Ft.length;t+=2)Ft[t][0](Ft[t+1]);Ft.length=0}}}return{set:s,update:function(t){s(t(e))},subscribe:function(i,c=t){const a=[i,c];return o.add(a),1===o.size&&(r=n(s)||t),i(e),()=>{o.delete(a),0===o.size&&(r(),r=null)}}}}const Ht={};var Wt=function(e){function n(t,e,n){return{subscribe:r(t,e,n).subscribe}}function r(n,r,o=t){e&&(e.getItem(n)&&(r=JSON.parse(e.getItem(n))),e.setItem(n,JSON.stringify(r)));const s=Kt(r,o?function(t){return o((function(r){return e&&e.setItem(n,JSON.stringify(r)),t(r)}))}:void 0);function i(t){e&&e.setItem(n,JSON.stringify(t)),s.set(t)}return{set:i,update:function(t){i(t(l(s)))},subscribe:function(e,n=t){return s.subscribe(e,n)}}}return{readable:n,writable:r,derived:function(r,o,c,a){const l=!Array.isArray(o),u=l?[o]:o;return e&&e.getItem(r)&&(a=JSON.parse(e.getItem(r))),n(r,a,(e=>{let n=!1;const r=[];let o=0,a=t;const f=()=>{if(o)return;a();const n=l?r[0]:r;if(c.length<2)e(c(n));else{const r=c(n,e);a=i(r)?r:t}},d=u.map(((t,e)=>t.subscribe((t=>{r[e]=t,o&=~(1<<e),n&&f()}),(()=>{o|=1<<e}))));return n=!0,f(),function(){s(d),a()}}))},get:l}}("undefined"!=typeof window?window.sessionStorage:void 0);const Yt=(0,Wt.writable)("token","");function Gt(t){this.message=t}Gt.prototype=new Error,Gt.prototype.name="InvalidCharacterError";var Xt="undefined"!=typeof window&&window.atob&&window.atob.bind(window)||function(t){var e=String(t).replace(/=+$/,"");if(e.length%4==1)throw new Gt("'atob' failed: The string to be decoded is not correctly encoded.");for(var n,r,o=0,s=0,i="";r=e.charAt(s++);~r&&(n=o%4?64*n+r:r,o++%4)?i+=String.fromCharCode(255&n>>(-2*o&6)):0)r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(r);return i};function Qt(t){var e=t.replace(/-/g,"+").replace(/_/g,"/");switch(e.length%4){case 0:break;case 2:e+="==";break;case 3:e+="=";break;default:throw"Illegal base64url string!"}try{return function(t){return decodeURIComponent(Xt(t).replace(/(.)/g,(function(t,e){var n=e.charCodeAt(0).toString(16).toUpperCase();return n.length<2&&(n="0"+n),"%"+n})))}(e)}catch(t){return Xt(e)}}function Zt(t){this.message=t}function te(t,e){if("string"!=typeof t)throw new Zt("Invalid token specified");var n=!0===(e=e||{}).header?0:1;try{return JSON.parse(Qt(t.split(".")[n]))}catch(t){throw new Zt("Invalid token specified: "+t.message)}}function ee(t){let e,n,r,o,s,i,c,a,l;return{c(){e=C("div"),n=O(t[0]),r=j(),o=C("ul"),s=C("li"),i=C("span"),c=O("Log out"),this.h()},l(a){e=V(a,"DIV",{class:!0});var l=D(e);n=F(l,t[0]),l.forEach(P),r=K(a),o=V(a,"UL",{});var u=D(o);s=V(u,"LI",{});var f=D(s);i=V(f,"SPAN",{class:!0});var d=D(i);c=F(d,"Log out"),d.forEach(P),f.forEach(P),u.forEach(P),this.h()},h(){J(e,"class","username svelte-17w0406"),J(i,"class","link")},m(u,f){A(u,e,f),I(e,n),A(u,r,f),A(u,o,f),I(o,s),I(s,i),I(i,c),a||(l=U(i,"click",t[2]),a=!0)},p(t,e){1&e&&H(n,t[0])},d(t){t&&P(e),t&&P(r),t&&P(o),a=!1,l()}}}function ne(e){let n,r,o,s;return{c(){n=C("ul"),r=C("li"),o=C("a"),s=O("Log in"),this.h()},l(t){n=V(t,"UL",{});var e=D(n);r=V(e,"LI",{});var i=D(r);o=V(i,"A",{href:!0});var c=D(o);s=F(c,"Log in"),c.forEach(P),i.forEach(P),e.forEach(P),this.h()},h(){J(o,"href","login")},m(t,e){A(t,n,e),I(n,r),I(r,o),I(o,s)},p:t,d(t){t&&P(n)}}}function re(e){let n;function r(t,e){return!1===t[1]?ne:ee}let o=r(e),s=o(e);return{c(){s.c(),n=T()},l(t){s.l(t),n=T()},m(t,e){s.m(t,e),A(t,n,e)},p(t,[e]){o===(o=r(t))&&s?s.p(t,e):(s.d(1),s=o(t),s&&(s.c(),s.m(n.parentNode,n)))},i:t,o:t,d(t){s.d(t),t&&P(n)}}}function oe(t,e,n){let r,o,s;return u(t,Yt,(t=>n(3,r=t))),t.$$.update=()=>{9&t.$$.dirty&&(Yt.set(r),n(0,o=r?te(r).data.username:null),n(1,s=null!==o))},[o,s,function(){$(Yt,r="",r),Fe("login")},r]}Zt.prototype=new Error,Zt.prototype.name="InvalidTokenError";class se extends Mt{constructor(t){super(),Vt(this,t,oe,re,c,{})}}function ie(t){let e,n,r;return{c(){e=C("li"),n=C("a"),r=O("Films"),this.h()},l(t){e=V(t,"LI",{});var o=D(e);n=V(o,"A",{href:!0});var s=D(n);r=F(s,"Films"),s.forEach(P),o.forEach(P),this.h()},h(){J(n,"href","films")},m(t,o){A(t,e,o),I(e,n),I(n,r)},d(t){t&&P(e)}}}function ce(t){let e,n,r,o,s,i,c,a=""!==t[0]&&ie();return i=new se({}),{c(){e=C("nav"),n=C("div"),r=C("ul"),a&&a.c(),o=j(),s=C("div"),qt(i.$$.fragment),this.h()},l(t){e=V(t,"NAV",{class:!0});var c=D(e);n=V(c,"DIV",{class:!0});var l=D(n);r=V(l,"UL",{});var u=D(r);a&&a.l(u),u.forEach(P),l.forEach(P),o=K(c),s=V(c,"DIV",{class:!0});var f=D(s);Jt(i.$$.fragment,f),f.forEach(P),c.forEach(P),this.h()},h(){J(n,"class","left svelte-1qvzxsm"),J(s,"class","right svelte-1qvzxsm"),J(e,"class","svelte-1qvzxsm")},m(t,l){A(t,e,l),I(e,n),I(n,r),a&&a.m(r,null),I(e,o),I(e,s),Dt(i,s,null),c=!0},p(t,[e]){""!==t[0]?a||(a=ie(),a.c(),a.m(r,null)):a&&(a.d(1),a=null)},i(t){c||(It(i.$$.fragment,t),c=!0)},o(t){At(i.$$.fragment,t),c=!1},d(t){t&&P(e),a&&a.d(),zt(i)}}}function ae(t,e,n){let r;return u(t,Yt,(t=>n(0,r=t))),t.$$.update=()=>{1&t.$$.dirty&&Yt.set(r)},[r]}class le extends Mt{constructor(t){super(),Vt(this,t,ae,ce,c,{})}}function ue(t){let e,n,r,o;e=new le({props:{segment:t[0]}});const s=t[3].default,i=f(s,t,t[2],null);return{c(){qt(e.$$.fragment),n=j(),r=C("main"),i&&i.c(),this.h()},l(t){Jt(e.$$.fragment,t),n=K(t),r=V(t,"MAIN",{class:!0});var o=D(r);i&&i.l(o),o.forEach(P),this.h()},h(){J(r,"class","svelte-1mwzoim")},m(t,s){Dt(e,t,s),A(t,n,s),A(t,r,s),i&&i.m(r,null),o=!0},p(t,[n]){const r={};1&n&&(r.segment=t[0]),e.$set(r),i&&i.p&&(!o||4&n)&&p(i,s,t,t[2],o?h(s,t[2],n,null):m(t[2]),null)},i(t){o||(It(e.$$.fragment,t),It(i,t),o=!0)},o(t){At(e.$$.fragment,t),At(i,t),o=!1},d(t){zt(e,t),t&&P(n),t&&P(r),i&&i.d(t)}}}function fe(t,e,n){let r;u(t,Yt,(t=>n(1,r=t)));let{$$slots:o={},$$scope:s}=e,{segment:i}=e;return t.$$set=t=>{"segment"in t&&n(0,i=t.segment),"$$scope"in t&&n(2,s=t.$$scope)},t.$$.update=()=>{2&t.$$.dirty&&(Yt.set(r),r&&te(r).data.username)},[i,r,s,o]}class de extends Mt{constructor(t){super(),Vt(this,t,fe,ue,c,{segment:0})}}function he(t){let e,n,r=t[1].stack+"";return{c(){e=C("pre"),n=O(r)},l(t){e=V(t,"PRE",{});var o=D(e);n=F(o,r),o.forEach(P)},m(t,r){A(t,e,r),I(e,n)},p(t,e){2&e&&r!==(r=t[1].stack+"")&&H(n,r)},d(t){t&&P(e)}}}function pe(e){let n,r,o,s,i,c,a,l,u,f=e[1].message+"";document.title=n=e[0];let d=e[2]&&e[1].stack&&he(e);return{c(){r=j(),o=C("h1"),s=O(e[0]),i=j(),c=C("p"),a=O(f),l=j(),d&&d.c(),u=T(),this.h()},l(t){Q('[data-svelte="svelte-1o9r2ue"]',document.head).forEach(P),r=K(t),o=V(t,"H1",{class:!0});var n=D(o);s=F(n,e[0]),n.forEach(P),i=K(t),c=V(t,"P",{class:!0});var h=D(c);a=F(h,f),h.forEach(P),l=K(t),d&&d.l(t),u=T(),this.h()},h(){J(o,"class","svelte-8od9u6"),J(c,"class","svelte-8od9u6")},m(t,e){A(t,r,e),A(t,o,e),I(o,s),A(t,i,e),A(t,c,e),I(c,a),A(t,l,e),d&&d.m(t,e),A(t,u,e)},p(t,[e]){1&e&&n!==(n=t[0])&&(document.title=n),1&e&&H(s,t[0]),2&e&&f!==(f=t[1].message+"")&&H(a,f),t[2]&&t[1].stack?d?d.p(t,e):(d=he(t),d.c(),d.m(u.parentNode,u)):d&&(d.d(1),d=null)},i:t,o:t,d(t){t&&P(r),t&&P(o),t&&P(i),t&&P(c),t&&P(l),d&&d.d(t),t&&P(u)}}}function me(t,e,n){let{status:r}=e,{error:o}=e;return t.$$set=t=>{"status"in t&&n(0,r=t.status),"error"in t&&n(1,o=t.error)},[r,o,false]}class ge extends Mt{constructor(t){super(),Vt(this,t,me,pe,c,{status:0,error:1})}}function $e(t){let e,r,o;const s=[t[4].props];var i=t[4].component;function c(t){let e={};for(let t=0;t<s.length;t+=1)e=n(e,s[t]);return{props:e}}return i&&(e=new i(c())),{c(){e&&qt(e.$$.fragment),r=T()},l(t){e&&Jt(e.$$.fragment,t),r=T()},m(t,n){e&&Dt(e,t,n),A(t,r,n),o=!0},p(t,n){const o=16&n?jt(s,[Tt(t[4].props)]):{};if(i!==(i=t[4].component)){if(e){kt();const t=e;At(t.$$.fragment,1,0,(()=>{zt(t,1)})),Nt()}i?(e=new i(c()),qt(e.$$.fragment),It(e.$$.fragment,1),Dt(e,r.parentNode,r)):e=null}else i&&e.$set(o)},i(t){o||(e&&It(e.$$.fragment,t),o=!0)},o(t){e&&At(e.$$.fragment,t),o=!1},d(t){t&&P(r),e&&zt(e,t)}}}function _e(t){let e,n;return e=new ge({props:{error:t[0],status:t[1]}}),{c(){qt(e.$$.fragment)},l(t){Jt(e.$$.fragment,t)},m(t,r){Dt(e,t,r),n=!0},p(t,n){const r={};1&n&&(r.error=t[0]),2&n&&(r.status=t[1]),e.$set(r)},i(t){n||(It(e.$$.fragment,t),n=!0)},o(t){At(e.$$.fragment,t),n=!1},d(t){zt(e,t)}}}function ve(t){let e,n,r,o;const s=[_e,$e],i=[];function c(t,e){return t[0]?0:1}return e=c(t),n=i[e]=s[e](t),{c(){n.c(),r=T()},l(t){n.l(t),r=T()},m(t,n){i[e].m(t,n),A(t,r,n),o=!0},p(t,o){let a=e;e=c(t),e===a?i[e].p(t,o):(kt(),At(i[a],1,1,(()=>{i[a]=null})),Nt(),n=i[e],n?n.p(t,o):(n=i[e]=s[e](t),n.c()),It(n,1),n.m(r.parentNode,r))},i(t){o||(It(n),o=!0)},o(t){At(n),o=!1},d(t){i[e].d(t),t&&P(r)}}}function ye(t){let e,r;const o=[{segment:t[2][0]},t[3].props];let s={$$slots:{default:[ve]},$$scope:{ctx:t}};for(let t=0;t<o.length;t+=1)s=n(s,o[t]);return e=new de({props:s}),{c(){qt(e.$$.fragment)},l(t){Jt(e.$$.fragment,t)},m(t,n){Dt(e,t,n),r=!0},p(t,[n]){const r=12&n?jt(o,[4&n&&{segment:t[2][0]},8&n&&Tt(t[3].props)]):{};147&n&&(r.$$scope={dirty:n,ctx:t}),e.$set(r)},i(t){r||(It(e.$$.fragment,t),r=!0)},o(t){At(e.$$.fragment,t),r=!1},d(t){zt(e,t)}}}function be(t,e,n){let{stores:r}=e,{error:o}=e,{status:s}=e,{segments:i}=e,{level0:c}=e,{level1:a=null}=e,{notify:l}=e;var u,f,d;return u=l,st().$$.after_update.push(u),f=Ht,d=r,st().$$.context.set(f,d),t.$$set=t=>{"stores"in t&&n(5,r=t.stores),"error"in t&&n(0,o=t.error),"status"in t&&n(1,s=t.status),"segments"in t&&n(2,i=t.segments),"level0"in t&&n(3,c=t.level0),"level1"in t&&n(4,a=t.level1),"notify"in t&&n(6,l=t.notify)},[o,s,i,c,a,r,l]}class we extends Mt{constructor(t){super(),Vt(this,t,be,ye,c,{stores:5,error:0,status:1,segments:2,level0:3,level1:4,notify:6})}}const Ee=[],xe=[{js:()=>Promise.all([import("./index.bc3737e9.js"),__inject_styles(["client-0771450f.css"])]).then((function(t){return t[0]}))},{js:()=>Promise.all([import("./about.d7ac8c74.js"),__inject_styles(["client-0771450f.css"])]).then((function(t){return t[0]}))},{js:()=>Promise.all([import("./films.0aeb89da.js"),__inject_styles(["client-0771450f.css","Form-c99807d5.css","films-bf69cefe.css"])]).then((function(t){return t[0]}))},{js:()=>Promise.all([import("./login.3cbd90c8.js"),__inject_styles(["client-0771450f.css","Form-c99807d5.css","login-2b9db354.css"])]).then((function(t){return t[0]}))}],Se=[{pattern:/^\/$/,parts:[{i:0}]},{pattern:/^\/about\/?$/,parts:[{i:1}]},{pattern:/^\/films\/?$/,parts:[{i:2}]},{pattern:/^\/login\/?$/,parts:[{i:3}]}];
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function ke(t,e,n,r){return new(n||(n=Promise))((function(o,s){function i(t){try{a(r.next(t))}catch(t){s(t)}}function c(t){try{a(r.throw(t))}catch(t){s(t)}}function a(t){var e;t.done?o(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(i,c)}a((r=r.apply(t,e||[])).next())}))}function Ne(t){for(;t&&"A"!==t.nodeName.toUpperCase();)t=t.parentNode;return t}let Ie,Ae=1;const Pe="undefined"!=typeof history?history:{pushState:()=>{},replaceState:()=>{},scrollRestoration:"auto"},Re={};let Ce,Le;function Oe(t){const e=Object.create(null);return t.length>0&&t.slice(1).split("&").forEach((t=>{const[,n,r=""]=/([^=]*)(?:=(.*))?/.exec(decodeURIComponent(t.replace(/\+/g," ")));"string"==typeof e[n]&&(e[n]=[e[n]]),"object"==typeof e[n]?e[n].push(r):e[n]=r})),e}function je(t){if(t.origin!==location.origin)return null;if(!t.pathname.startsWith(Ce))return null;let e=t.pathname.slice(Ce.length);if(""===e&&(e="/"),!Ee.some((t=>t.test(e))))for(let n=0;n<Se.length;n+=1){const r=Se[n],o=r.pattern.exec(e);if(o){const n=Oe(t.search),s=r.parts[r.parts.length-1],i=s.params?s.params(o):{},c={host:location.host,path:e,query:n,params:i};return{href:t.href,route:r,match:o,page:c}}}}function Te(t){if(1!==function(t){return null===t.which?t.button:t.which}(t))return;if(t.metaKey||t.ctrlKey||t.shiftKey||t.altKey)return;if(t.defaultPrevented)return;const e=Ne(t.target);if(!e)return;if(!e.href)return;const n="object"==typeof e.href&&"SVGAnimatedString"===e.href.constructor.name,r=String(n?e.href.baseVal:e.href);if(r===location.href)return void(location.hash||t.preventDefault());if(e.hasAttribute("download")||"external"===e.getAttribute("rel"))return;if(n?e.target.baseVal:e.target)return;const o=new URL(r);if(o.pathname===location.pathname&&o.search===location.search)return;const s=je(o);if(s){Je(s,null,e.hasAttribute("sapper:noscroll"),o.hash),t.preventDefault(),Pe.pushState({id:Ie},"",o.href)}}function Ue(){return{x:pageXOffset,y:pageYOffset}}function qe(t){if(Re[Ie]=Ue(),t.state){const e=je(new URL(location.href));e?Je(e,t.state.id):location.href=location.href}else!function(t){Ae=t}(Ae+1),function(t){Ie=t}(Ae),Pe.replaceState({id:Ie},"",location.href)}function Je(t,e,n,r){return ke(this,void 0,void 0,(function*(){const o=!!e;if(o)Ie=e;else{const t=Ue();Re[Ie]=t,Ie=e=++Ae,Re[Ie]=n?t:{x:0,y:0}}if(yield Le(t),document.activeElement&&document.activeElement instanceof HTMLElement&&document.activeElement.blur(),!n){let t,n=Re[e];r&&(t=document.getElementById(r.slice(1)),t&&(n={x:0,y:t.getBoundingClientRect().top+scrollY})),Re[Ie]=n,o||t?scrollTo(n.x,n.y):scrollTo(0,0)}}))}function De(t){let e=t.baseURI;if(!e){const n=t.getElementsByTagName("base");e=n.length?n[0].href:t.URL}return e}let ze,Be=null;function Ve(t){const e=Ne(t.target);e&&"prefetch"===e.rel&&function(t){const e=je(new URL(t,De(document)));if(e)Be&&t===Be.href||(Be={href:t,promise:cn(e)}),Be.promise}(e.href)}function Me(t){clearTimeout(ze),ze=setTimeout((()=>{Ve(t)}),20)}function Fe(t,e={noscroll:!1,replaceState:!1}){const n=je(new URL(t,De(document)));return n?(Pe[e.replaceState?"replaceState":"pushState"]({id:Ie},"",t),Je(n,null,e.noscroll)):(location.href=t,new Promise((()=>{})))}const Ke="undefined"!=typeof __SAPPER__&&__SAPPER__;let He,We,Ye,Ge=!1,Xe=[],Qe="{}";const Ze={page:function(t){const e=Kt(t);let n=!0;return{notify:function(){n=!0,e.update((t=>t))},set:function(t){n=!1,e.set(t)},subscribe:function(t){let r;return e.subscribe((e=>{(void 0===r||n&&e!==r)&&t(r=e)}))}}}({}),preloading:Kt(null),session:Kt(Ke&&Ke.session)};let tn,en,nn;function rn(t,e){const{error:n}=t;return Object.assign({error:n},e)}function on(t){return ke(this,void 0,void 0,(function*(){He&&Ze.preloading.set(!0);const e=function(t){return Be&&Be.href===t.href?Be.promise:cn(t)}(t),n=We={},r=yield e,{redirect:o}=r;if(n===We)if(o)yield Fe(o.location,{replaceState:!0});else{const{props:e,branch:n}=r;yield sn(n,e,rn(e,t.page))}}))}function sn(t,e,n){return ke(this,void 0,void 0,(function*(){Ze.page.set(n),Ze.preloading.set(!1),He?He.$set(e):(e.stores={page:{subscribe:Ze.page.subscribe},preloading:{subscribe:Ze.preloading.subscribe},session:Ze.session},e.level0={props:yield Ye},e.notify=Ze.page.notify,He=new we({target:nn,props:e,hydrate:!0})),Xe=t,Qe=JSON.stringify(n.query),Ge=!0,en=!1}))}function cn(t){return ke(this,void 0,void 0,(function*(){const{route:e,page:n}=t,r=n.path.split("/").filter(Boolean);let o=null;const s={error:null,status:200,segments:[r[0]]},i={fetch:(t,e)=>fetch(t,e),redirect:(t,e)=>{if(o&&(o.statusCode!==t||o.location!==e))throw new Error("Conflicting redirects");o={statusCode:t,location:e}},error:(t,e)=>{s.error="string"==typeof e?new Error(e):e,s.status=t}};if(!Ye){const t=()=>({});Ye=Ke.preloaded[0]||t.call(i,{host:n.host,path:n.path,query:n.query,params:{}},tn)}let c,a=1;try{const o=JSON.stringify(n.query),l=e.pattern.exec(n.path);let u=!1;c=yield Promise.all(e.parts.map(((e,c)=>ke(this,void 0,void 0,(function*(){const f=r[c];if(function(t,e,n,r){if(r!==Qe)return!0;const o=Xe[t];return!!o&&(e!==o.segment||!(!o.match||JSON.stringify(o.match.slice(1,t+2))===JSON.stringify(n.slice(1,t+2)))||void 0)}(c,f,l,o)&&(u=!0),s.segments[a]=r[c+1],!e)return{segment:f};const d=a++;if(!en&&!u&&Xe[c]&&Xe[c].part===e.i)return Xe[c];u=!1;const{default:h,preload:p}=yield xe[e.i].js();let m;return m=Ge||!Ke.preloaded[c+1]?p?yield p.call(i,{host:n.host,path:n.path,query:n.query,params:e.params?e.params(t.match):{}},tn):{}:Ke.preloaded[c+1],s[`level${d}`]={component:h,props:m,segment:f,match:l,part:e.i}})))))}catch(t){s.error=t,s.status=500,c=[]}return{redirect:o,props:s,branch:c}}))}var an,ln,un;Ze.session.subscribe((t=>ke(void 0,void 0,void 0,(function*(){if(tn=t,!Ge)return;en=!0;const e=je(new URL(location.href)),n=We={},{redirect:r,props:o,branch:s}=yield cn(e);n===We&&(r?yield Fe(r.location,{replaceState:!0}):yield sn(s,o,rn(o,e.page)))})))),an={target:document.querySelector("#sapper")},ln=an.target,nn=ln,un=Ke.baseUrl,Ce=un,Le=on,"scrollRestoration"in Pe&&(Pe.scrollRestoration="manual"),addEventListener("beforeunload",(()=>{Pe.scrollRestoration="auto"})),addEventListener("load",(()=>{Pe.scrollRestoration="manual"})),addEventListener("click",Te),addEventListener("popstate",qe),addEventListener("touchstart",Ve),addEventListener("mousemove",Me),Ke.error?Promise.resolve().then((()=>function(){const{host:t,pathname:e,search:n}=location,{session:r,preloaded:o,status:s,error:i}=Ke;Ye||(Ye=o&&o[0]);const c={error:i,status:s,session:r,level0:{props:Ye},level1:{props:{status:s,error:i},component:ge},segments:o},a=Oe(n);sn([],c,{host:t,path:e,query:a,params:{},error:i})}())):Promise.resolve().then((()=>{const{hash:t,href:e}=location;Pe.replaceState({id:Ae},"",e);const n=je(new URL(location.href));if(n)return Je(n,Ae,!0,t)}));export{Tt as $,Ot as A,It as B,At as C,zt as D,$ as E,q as F,H as G,G as H,kt as I,Nt as J,R as K,T as L,g as M,p as N,m as O,h as P,mt as Q,Rt as R,Mt as S,Ct as T,s as U,at as V,ct as W,f as X,n as Y,Ut as Z,jt as _,j as a,gt as a0,Yt as a1,i as a2,it as a3,Fe as a4,W as a5,V as b,K as c,P as d,C as e,D as f,F as g,A as h,Vt as i,I as j,L as k,M as l,J as m,t as n,Y as o,U as p,Q as q,u as r,c as s,O as t,ut as u,Lt as v,Kt as w,qt as x,Jt as y,Dt as z};

import __inject_styles from './inject_styles.5607aec6.js';