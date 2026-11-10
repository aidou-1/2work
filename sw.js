/* 2 WORK · service worker : l'appli fonctionne hors ligne.
   - Coquille (page, polices, icônes) : mise en cache à l'installation ; la page est servie « réseau d'abord » pour recevoir les mises à jour.
   - Vidéos : cache séparé « 2work-videos », rempli à la demande depuis Réglages → « Vidéos hors ligne », conservé entre les versions.
   - Vignettes des listes (vignettes/*.webp) : cache « 2work-vignettes », rempli au fil de l'affichage, conservé entre les versions.
   Changer V à chaque mise en ligne d'une nouvelle version. */
const V = "2work-v2026-11-10e", VIDEOS = "2work-videos", VIGNETTES = "2work-vignettes", ETAT = "2work-etat";
const COQUILLE = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./icons/favicon-64.png", "./icons/logo.png", "./icons/qr.png", "./consignes.js", "./fonds/chaud.webp", "./fonds/vert.webp", "./fonds/bleu.webp",
  ...["barlow-latin-400", "barlow-latin-500", "barlow-latin-600", "barlow-latin-700", "barlow-condensed-latin-600", "barlow-condensed-latin-700", "barlow-condensed-latin-800"].map(f => `./fonts/${f}-normal.woff2`)];
self.addEventListener("install", e => e.waitUntil(caches.open(V).then(c => c.addAll(COQUILLE)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(l => Promise.all(l.filter(n => ![V, VIDEOS, VIGNETTES, ETAT].includes(n)).map(n => caches.delete(n)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  if (u.pathname.endsWith(".mp4")) return e.respondWith(video(r));
  const cache = u.pathname.includes("/vignettes/") ? VIGNETTES : V;
  if (r.mode === "navigate" || u.pathname.endsWith("/index.html"))
    return e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put("./index.html", c)); } return res; }).catch(() => caches.match("./index.html")));
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok && res.type === "basic") { const c = res.clone(); caches.open(cache).then(x => x.put(r, c)); } return res; })));
});
async function video(r) {   // vidéo en cache : réponse partielle (206) pour Safari, qui lit les vidéos par morceaux
  const m = await (await caches.open(VIDEOS)).match(r.url);
  if (!m) return fetch(r);
  const plage = r.headers.get("range");
  if (!plage) return m;
  const buf = await m.arrayBuffer(), p = /bytes=(\d*)-(\d*)/.exec(plage) || [], deb = +p[1] || 0, fin = p[2] ? Math.min(+p[2], buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(deb, fin + 1), { status: 206, headers: { "Content-Type": "video/mp4", "Content-Range": `bytes ${deb}-${fin}/${buf.byteLength}`, "Content-Length": String(fin - deb + 1), "Accept-Ranges": "bytes" } });
}
/* Rappels : la page dépose « rappel.json » dans le cache ETAT (planning, heure, séance faite ou non). Sur Android, appli installée,
   le navigateur réveille ce service worker quelques fois par jour (Periodic Background Sync) : il notifie si une séance prévue est due. */
self.addEventListener("periodicsync", e => { if (e.tag === "rappel") e.waitUntil(rappel()); });
async function rappel() {
  const c = await caches.open(ETAT), url = new URL("rappel.json", self.registration.scope).href, m = await c.match(url); if (!m) return;
  const R = await m.json(), d = new Date(), p2 = n => String(n).padStart(2, "0"), j = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`, hm = `${p2(d.getHours())}:${p2(d.getMinutes())}`, t = R.jours[(d.getDay() + 6) % 7];
  if (!R.actif || R.fait === j) return;
  const opt = (body, cle, data) => ({ body, icon: "icons/icon-192.png", badge: "icons/icon-192.png", tag: "2work-" + cle + "-" + j, data });
  if (t && R.envoye !== j && hm >= R.heure) { await self.registration.showNotification(R.titre, opt(t, "rappelEnvoye", "./?go=semaine")); R.envoye = j; }
  else if (R.serie > 0 && R.envoyeSerie !== j && hm >= "20:00") { await self.registration.showNotification(R.msgSerie[0], opt(R.msgSerie[1], "rappelSerie", "./")); R.envoyeSerie = j; }   // la série se termine ce soir
  else return;
  await c.put(url, new Response(JSON.stringify(R)));
}
self.addEventListener("notificationclick", e => { e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then(l => l.length ? l[0].focus() : self.clients.openWindow(e.notification.data || "./"))); });
