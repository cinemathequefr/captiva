import{a2 as t,S as e,i as n,s,c as a,e as o,b as r,f as i,d as c,l,o as u,a1 as p,u as h,p as f,q as d,t as m,r as g,a3 as b,a4 as $,w}from"./client.dc2493fd.js";let y;t.subscribe((t=>{y=t}));const C=new AbortController;async function x({method:t,path:e,data:n}){const s={method:t,headers:{}};let a,o="";n&&(s.headers["Content-Type"]="application/json",s.headers["Cache-Control"]="no-store","GET"===t?o=`?${function(t){var e=[];for(var n in t)t.hasOwnProperty(n)&&e.push(encodeURIComponent(n)+"="+encodeURIComponent(t[n]));return e.join("&")}(n)}`:s.body=JSON.stringify(n)),y&&(s.headers.Authorization=`Bearer ${y}`);try{let t=await function(t,e,{signal:n,...s}={}){const a=new AbortController,o=fetch(t,{signal:a.signal,...s});n&&n.addEventListener("abort",(()=>a.abort()));const r=setTimeout((()=>a.abort()),e);return o.finally((()=>clearTimeout(r)))}(`https://api.cnmtq.fr/${e}${o}`,1e4,{signal:C.signal,...s}),n=t.headers.get("content-type");if(a=n&&-1!==n.indexOf("application/json")?await t.json():await t.text(),!1===t.ok)throw"string"==typeof a?{status:t.status,message:a,success:t.ok}:a;return a}catch(t){if("The operation was aborted. "===t.message||"NetworkError when attempting to fetch resource."===t.message)throw new Error("Le serveur ne répond pas.");throw t}}function T(t,e){return x({method:"GET",path:t,data:e})}function E(t,e){return x({method:"POST",path:t,data:e})}function j(t,e){return x({method:"PUT",path:t,data:e})}function v(t){let e,n,s,b;const w=t[4].default,y=a(w,t,t[3],null);return{c(){e=o("form"),y&&y.c()},l(t){e=r(t,"FORM",{});var n=i(e);y&&y.l(n),n.forEach(c)},m(a,o){l(a,e,o),y&&y.m(e,null),t[5](e),n=!0,s||(b=u(e,"submit",p((function(){$(t[0])&&t[0].apply(this,arguments)}))),s=!0)},p(e,[s]){t=e,y&&y.p&&(!n||8&s)&&h(y,w,t,t[3],n?d(w,t[3],s,null):f(t[3]),null)},i(t){n||(m(y,t),n=!0)},o(t){g(y,t),n=!1},d(n){n&&c(e),y&&y.d(n),t[5](null),s=!1,b()}}}function O(t,e,n){let s,{$$slots:a={},$$scope:o}=e,{options:r}=e,{submit:i}=e;return r=Object.assign({textareaFitContent:!1},r),b((async()=>{if(!0===r.textareaFitContent){let e=s.querySelectorAll("textarea");for(let n=0;n<e.length;n++){let a=e[n];t(a),a.addEventListener("input",(()=>t(a)))}function t(t){t.scrollHeight>t.offsetHeight&&(t.style.height=`${t.scrollHeight+2}px`)}}})),t.$$set=t=>{"options"in t&&n(2,r=t.options),"submit"in t&&n(0,i=t.submit),"$$scope"in t&&n(3,o=t.$$scope)},[i,s,r,o,a,function(t){w[t?"unshift":"push"]((()=>{s=t,n(1,s)}))}]}class A extends e{constructor(t){super(),n(this,t,O,v,s,{options:2,submit:0})}}export{A as F,E as a,T as g,j as p};
