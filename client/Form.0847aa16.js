import{a1 as t,S as e,i as n,s,X as a,e as o,b as r,f as i,d as l,h as c,p as u,F as p,a2 as h,N as f,O as d,P as m,B as g,C as b,a3 as $,u as w}from"./client.00624928.js";let y;t.subscribe((t=>{y=t}));const x=new AbortController;async function C({method:t,path:e,data:n}){const s={method:t,headers:{}};let a,o="";n&&(s.headers["Content-Type"]="application/json","GET"===t?o=`?${function(t){var e=[];for(var n in t)t.hasOwnProperty(n)&&e.push(encodeURIComponent(n)+"="+encodeURIComponent(t[n]));return e.join("&")}(n)}`:s.body=JSON.stringify(n)),y&&(s.headers.Authorization=`Bearer ${y}`);try{let t=await function(t,e,{signal:n,...s}={}){const a=new AbortController,o=fetch(t,{signal:a.signal,...s});n&&n.addEventListener("abort",(()=>a.abort()));const r=setTimeout((()=>a.abort()),e);return o.finally((()=>clearTimeout(r)))}(`https://api.cnmtq.fr/${e}${o}`,1e4,{signal:x.signal,...s}),n=t.headers.get("content-type");if(a=n&&-1!==n.indexOf("application/json")?await t.json():await t.text(),!1===t.ok)throw"string"==typeof a?{status:t.status,message:a,success:t.ok}:a;return a}catch(t){if("The operation was aborted. "===t.message||"NetworkError when attempting to fetch resource."===t.message)throw new Error("Le serveur ne répond pas.");throw t}}function T(t,e){return C({method:"GET",path:t,data:e})}function E(t,e){return C({method:"POST",path:t,data:e})}function O(t,e){return C({method:"PUT",path:t,data:e})}function j(t){let e,n,s,$;const w=t[4].default,y=a(w,t,t[3],null);return{c(){e=o("form"),y&&y.c()},l(t){e=r(t,"FORM",{});var n=i(e);y&&y.l(n),n.forEach(l)},m(a,o){c(a,e,o),y&&y.m(e,null),t[5](e),n=!0,s||($=u(e,"submit",p((function(){h(t[0])&&t[0].apply(this,arguments)}))),s=!0)},p(e,[s]){t=e,y&&y.p&&(!n||8&s)&&f(y,w,t,t[3],n?m(w,t[3],s,null):d(t[3]),null)},i(t){n||(g(y,t),n=!0)},o(t){b(y,t),n=!1},d(n){n&&l(e),y&&y.d(n),t[5](null),s=!1,$()}}}function v(t,e,n){let s,{$$slots:a={},$$scope:o}=e,{options:r}=e,{submit:i}=e;return r=Object.assign({textareaFitContent:!1},r),$((async()=>{if(!0===r.textareaFitContent){let e=s.querySelectorAll("textarea");for(let n=0;n<e.length;n++){let s=e[n];t(s),s.addEventListener("input",(()=>t(s)))}function t(t){t.scrollHeight>t.offsetHeight&&(t.style.height=`${t.scrollHeight+2}px`)}}})),t.$$set=t=>{"options"in t&&n(2,r=t.options),"submit"in t&&n(0,i=t.submit),"$$scope"in t&&n(3,o=t.$$scope)},[i,s,r,o,a,function(t){w[t?"unshift":"push"]((()=>{s=t,n(1,s)}))}]}class F extends e{constructor(t){super(),n(this,t,v,j,s,{options:2,submit:0})}}export{F,E as a,T as g,O as p};