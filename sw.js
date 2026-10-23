/* 2 WORK · service worker : l'appli fonctionne hors ligne.
   - Coquille (page, polices, icônes) : mise en cache à l'installation ; la page est servie « réseau d'abord » pour recevoir les mises à jour.
   - Vidéos : cache séparé « 2work-videos », rempli à la demande depuis Réglages → « Vidéos hors ligne », conservé entre les versions.
   Changer V à chaque mise en ligne d'une nouvelle version. */
const V = "2work-v2026-10-23e", VIDEOS = "2work-videos";
const COQUILLE = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./icons/favicon-64.png", "./icons/logo.png", "./icons/qr.png",
  ...["barlow-latin-400", "barlow-latin-500", "barlow-latin-600", "barlow-latin-700", "barlow-condensed-latin-600", "barlow-condensed-latin-700", "barlow-condensed-latin-800"].map(f => `./fonts/${f}-normal.woff2`)];
self.addEventListener("install", e => e.waitUntil(caches.open(V).then(c => c.addAll(COQUILLE)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(l => Promise.all(l.filter(n => n !== V && n !== VIDEOS).map(n => caches.delete(n)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  if (u.pathname.endsWith(".mp4")) return e.respondWith(video(r));
  if (r.mode === "navigate" || u.pathname.endsWith("/index.html"))
    return e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put("./index.html", c)); } return res; }).catch(() => caches.match("./index.html")));
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok && res.type === "basic") { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; })));
});
async function video(r) {   // vidéo en cache : réponse partielle (206) pour Safari, qui lit les vidéos par morceaux
  const m = await (await caches.open(VIDEOS)).match(r.url);
  if (!m) return fetch(r);
  const plage = r.headers.get("range");
  if (!plage) return m;
  const buf = await m.arrayBuffer(), p = /bytes=(\d*)-(\d*)/.exec(plage) || [], deb = +p[1] || 0, fin = p[2] ? Math.min(+p[2], buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(deb, fin + 1), { status: 206, headers: { "Content-Type": "video/mp4", "Content-Range": `bytes ${deb}-${fin}/${buf.byteLength}`, "Content-Length": String(fin - deb + 1), "Accept-Ranges": "bytes" } });
}
