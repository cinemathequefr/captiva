!function(){"use strict";const t=1697703792663,n=`cache${t}`,e=["/client/client.129939aa.js","/client/inject_styles.5607aec6.js","/client/index.e99dda68.js","/client/films.39765a2c.js","/client/Form.5184e6cc.js","/client/login.c3366687.js"].concat(["/service-worker-index.html","/android-chrome-192x192.png","/android-chrome-256x256.png","/apple-touch-icon.png","/browserconfig.xml","/favicon-16x16.png","/favicon-32x32.png","/favicon.ico","/fonts/ibm-plex-mono-v6-latin-ext_latin-300.woff","/fonts/ibm-plex-mono-v6-latin-ext_latin-300.woff2","/fonts/ibm-plex-mono-v6-latin-ext_latin-500.woff","/fonts/ibm-plex-mono-v6-latin-ext_latin-500.woff2","/fonts/ibm-plex-mono-v6-latin-ext_latin-600.woff","/fonts/ibm-plex-mono-v6-latin-ext_latin-600.woff2","/fonts/ibm-plex-mono-v6-latin-ext_latin-700.woff","/fonts/ibm-plex-mono-v6-latin-ext_latin-700.woff2","/fonts/ibm-plex-mono-v6-latin-ext_latin-regular.woff","/fonts/ibm-plex-mono-v6-latin-ext_latin-regular.woff2","/fonts/ibm-plex-sans-v8-latin-ext_latin-300.woff","/fonts/ibm-plex-sans-v8-latin-ext_latin-300.woff2","/fonts/ibm-plex-sans-v8-latin-ext_latin-300italic.woff","/fonts/ibm-plex-sans-v8-latin-ext_latin-300italic.woff2","/fonts/ibm-plex-sans-v8-latin-ext_latin-600.woff","/fonts/ibm-plex-sans-v8-latin-ext_latin-600.woff2","/fonts/ibm-plex-sans-v8-latin-ext_latin-600italic.woff","/fonts/ibm-plex-sans-v8-latin-ext_latin-600italic.woff2","/fonts/ibm-plex-sans-v8-latin-ext_latin-italic.woff","/fonts/ibm-plex-sans-v8-latin-ext_latin-italic.woff2","/fonts/ibm-plex-sans-v8-latin-ext_latin-regular.woff","/fonts/ibm-plex-sans-v8-latin-ext_latin-regular.woff2","/fonts.css","/global.css","/manifest.json","/mstile-150x150.png","/safari-pinned-tab.svg","/site.webmanifest"]),i=new Set(e);self.addEventListener("install",(t=>{t.waitUntil(caches.open(n).then((t=>t.addAll(e))).then((()=>{self.skipWaiting()})))})),self.addEventListener("activate",(t=>{t.waitUntil(caches.keys().then((async t=>{for(const e of t)e!==n&&await caches.delete(e);self.clients.claim()})))})),self.addEventListener("fetch",(n=>{if("GET"!==n.request.method||n.request.headers.has("range"))return;const e=new URL(n.request.url),a=e.protocol.startsWith("http"),l=e.hostname===self.location.hostname&&e.port!==self.location.port,o=e.host===self.location.host&&i.has(e.pathname),s="only-if-cached"===n.request.cache&&!o;!a||l||s||n.respondWith((async()=>o&&await caches.match(n.request)||async function(n){const e=await caches.open(`offline${t}`);try{const t=await fetch(n);return e.put(n,t.clone()),t}catch(t){const i=await e.match(n);if(i)return i;throw t}}(n.request))())}))}();
