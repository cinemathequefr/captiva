!function(){"use strict";const t=1647002017096,n=`cache${t}`,e=["/client/client.76f3fec6.js","/client/inject_styles.5607aec6.js","/client/index.8cdf3d3a.js","/client/about.6fe39559.js","/client/films.13c7e76a.js","/client/Form.8fa0dbd2.js","/client/login.d1f1819f.js"].concat(["/service-worker-index.html","/favicon.ico","/fonts/ibm-plex-mono-v6-latin-ext_latin-300.woff","/fonts/ibm-plex-mono-v6-latin-ext_latin-300.woff2","/fonts/ibm-plex-mono-v6-latin-ext_latin-500.woff","/fonts/ibm-plex-mono-v6-latin-ext_latin-500.woff2","/fonts/ibm-plex-mono-v6-latin-ext_latin-600.woff","/fonts/ibm-plex-mono-v6-latin-ext_latin-600.woff2","/fonts/ibm-plex-mono-v6-latin-ext_latin-700.woff","/fonts/ibm-plex-mono-v6-latin-ext_latin-700.woff2","/fonts/ibm-plex-mono-v6-latin-ext_latin-regular.woff","/fonts/ibm-plex-mono-v6-latin-ext_latin-regular.woff2","/fonts/ibm-plex-sans-v8-latin-ext_latin-300.woff","/fonts/ibm-plex-sans-v8-latin-ext_latin-300.woff2","/fonts/ibm-plex-sans-v8-latin-ext_latin-300italic.woff","/fonts/ibm-plex-sans-v8-latin-ext_latin-300italic.woff2","/fonts/ibm-plex-sans-v8-latin-ext_latin-600.woff","/fonts/ibm-plex-sans-v8-latin-ext_latin-600.woff2","/fonts/ibm-plex-sans-v8-latin-ext_latin-600italic.woff","/fonts/ibm-plex-sans-v8-latin-ext_latin-600italic.woff2","/fonts/ibm-plex-sans-v8-latin-ext_latin-italic.woff","/fonts/ibm-plex-sans-v8-latin-ext_latin-italic.woff2","/fonts/ibm-plex-sans-v8-latin-ext_latin-regular.woff","/fonts/ibm-plex-sans-v8-latin-ext_latin-regular.woff2","/fonts.css","/global.css","/manifest.json"]),i=new Set(e);self.addEventListener("install",(t=>{t.waitUntil(caches.open(n).then((t=>t.addAll(e))).then((()=>{self.skipWaiting()})))})),self.addEventListener("activate",(t=>{t.waitUntil(caches.keys().then((async t=>{for(const e of t)e!==n&&await caches.delete(e);self.clients.claim()})))})),self.addEventListener("fetch",(n=>{if("GET"!==n.request.method||n.request.headers.has("range"))return;const e=new URL(n.request.url),a=e.protocol.startsWith("http"),l=e.hostname===self.location.hostname&&e.port!==self.location.port,s=e.host===self.location.host&&i.has(e.pathname),o="only-if-cached"===n.request.cache&&!s;!a||l||o||n.respondWith((async()=>s&&await caches.match(n.request)||async function(n){const e=await caches.open(`offline${t}`);try{const t=await fetch(n);return e.put(n,t.clone()),t}catch(t){const i=await e.match(n);if(i)return i;throw t}}(n.request))())}))}();
