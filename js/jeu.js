/* ============ MOTIVATION : niveaux, défis de la semaine, bilan hebdomadaire, courbes et records ============
   Tout se calcule à partir de l'historique : aucune donnée nouvelle à stocker, donc rien à perdre ni à migrer.
   Expérience (XP) : 10 points par séance + ses minutes × l'intensité de son type, + 50 par défi de semaine réussi (+ 50 si les trois le sont).
   Défis : trois par semaine (volume, intensité, récupération), tirés selon le numéro de la semaine, donc identiques pour tout le monde. */
const lundiDe = (j = jourCle()) => { const d = new Date(j + "T12:00"); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return jourCle(d); };
const decaler = (j, n) => { const d = new Date(j + "T12:00"); d.setDate(d.getDate() + n); return jourCle(d); };
const numSemaine = l => Math.round(new Date(l + "T12:00") / 6048e5);
const estCardio = x => x.m === "tabata" || x.tb || x.ef !== undefined || x.k === "combat";
const xpSeance = x => 10 + Math.round(x.s / 60 * ({ tabata: 3, seance: 2, salle: 2 }[x.m] || 1));
const minDe = l => Math.round(l.reduce((t, x) => t + x.s, 0) / 60);
const DEFIS_SEM = [   // trois familles ; [texte FR, EN, cible, mesure sur les séances de la semaine]
  [["3 séances cette semaine", "3 workouts this week", 3, l => l.length], ["4 séances cette semaine", "4 workouts this week", 4, l => l.length], ["60 minutes d’entraînement", "60 minutes of training", 60, minDe], ["90 minutes d’entraînement", "90 minutes of training", 90, minDe], ["3 jours actifs différents", "3 different active days", 3, l => new Set(l.map(x => x.j)).size]],
  [["2 séances de cardio ou Tabata", "2 cardio or Tabata sessions", 2, l => l.filter(estCardio).length], ["2 séances de renfo ou de salle", "2 strength or gym sessions", 2, l => l.filter(x => ["seance", "salle"].includes(x.m) && !estCardio(x)).length], ["2 défis du jour", "2 daily challenges", 2, l => l.filter(x => x.k === "defi").length]],
  [["15 minutes de mobilité ou d’étirements", "15 minutes of mobility or stretching", 15, l => minDe(l.filter(x => ["calme", "souffle", "echauffement"].includes(x.m)))], ["2 retours au calme", "2 cool-downs", 2, l => l.filter(x => ["calme", "souffle"].includes(x.m)).length]]];
function defisSemaine(l = lundiDe(), h = lireHist()) {
  const fin = decaler(l, 6), sem = h.filter(x => x.j >= l && x.j <= fin), n = numSemaine(l);
  return DEFIS_SEM.map((f, k) => { const [fr, en, cible, mes] = f[(n + k) % f.length], v = Math.min(cible, mes(sem)); return { fr, en, cible, v, ok: v >= cible }; });
}
function xpTotal(h = lireHist()) {
  const sems = [...new Set(h.map(x => lundiDe(x.j)))];
  return h.reduce((t, x) => t + xpSeance(x), 0) + sems.reduce((t, l) => { const n = defisSemaine(l, h).filter(d => d.ok).length; return t + n * 50 + (n === 3 ? 50 : 0); }, 0);
}
const RANGS = [["Débutant", "Beginner"], ["Régulier", "Regular"], ["Motivé", "Motivated"], ["Sportif", "Sporty"], ["Athlète", "Athlete"], ["Compétiteur", "Competitor"], ["Expert", "Expert"], ["Élite", "Elite"], ["Champion", "Champion"], ["Légende", "Legend"]];
const seuilXp = n => 75 * n * (n - 1);   // XP nécessaires pour atteindre le niveau n : 0, 150, 450, 900, 1500…
function niveauXp(xp = xpTotal()) { let n = 1; while (seuilXp(n + 1) <= xp) n++; const a = seuilXp(n), b = seuilXp(n + 1); return { n, xp, nom: L(...RANGS[Math.min(n, RANGS.length) - 1]), dans: xp - a, pour: b - a, pct: Math.round((xp - a) / (b - a) * 100) }; }
const barreXp = N => `<div class="vita-barre vb-xp" role="progressbar" aria-valuenow="${N.pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(3, N.pct)}%"></i></div>`;
const listeDefis = D => `<ul class="defis-sem">${D.map(d => `<li class="${d.ok ? "ok" : ""}"><span>${d.ok ? "✓" : "○"} ${L(d.fr, d.en)}</span><b>${d.v}/${d.cible}</b><i style="--p:${d.v / d.cible * 100}%"></i></li>`).join("")}</ul>`;

/* --- Bilan de la semaine : chiffres, comparaison avec la semaine d'avant, carte à partager --- */
function statsSemaine(l = lundiDe(), h = lireHist()) {
  const de = L0 => h.filter(x => x.j >= L0 && x.j <= decaler(L0, 6)), s = de(l), p = de(decaler(l, -7)), ef = s.filter(x => x.ef !== undefined).map(x => x.ef);
  return { l, s, n: s.length, min: minDe(s), jours: new Set(s.map(x => x.j)).size, xp: s.reduce((t, x) => t + xpSeance(x), 0), charge: s.reduce((t, x) => t + xpSeance(x) - 10, 0), ef: ef.length ? Math.max(...ef) : null, defis: defisSemaine(l, h), minPrec: minDe(p), nPrec: p.length };
}
function carteSemaine(S) {
  const c = document.createElement("canvas"); c.width = 1080; c.height = 1920; const x = c.getContext("2d"), T1 = "'Barlow Condensed', Arial Narrow, sans-serif", T2 = "Barlow, Arial, sans-serif", N = niveauXp(), sr = series(lireHist());
  const g = x.createLinearGradient(0, 0, 1080, 1920); g.addColorStop(0, "#F97316"); g.addColorStop(.55, "#C2410C"); g.addColorStop(1, "#1C1210"); x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
  x.fillStyle = "rgba(255,255,255,.09)"; [[920, 260, 330], [100, 1240, 250], [980, 1660, 190]].forEach(([u, v, r]) => { x.beginPath(); x.arc(u, v, r, 0, 7); x.fill(); });
  x.fillStyle = "#fff"; x.textAlign = "center"; x.font = `800 72px ${T1}`; x.fillText("2 WORK", 540, 170);
  x.font = `800 120px ${T1}`; x.fillText(L("MA SEMAINE", "MY WEEK"), 540, 400); x.font = `600 44px ${T2}`; x.globalAlpha = .85; x.fillText(dateCourte(S.l) + " – " + dateCourte(decaler(S.l, 6)), 540, 480); x.globalAlpha = 1;
  [[S.min, L("minutes", "minutes")], [S.n, L(S.n > 1 ? "séances" : "séance", S.n > 1 ? "workouts" : "workout")], [S.jours, L(S.jours > 1 ? "jours actifs" : "jour actif", S.jours > 1 ? "active days" : "active day")], [sr.cur, L(sr.cur > 1 ? "jours d’affilée" : "jour d’affilée", "day streak")]].forEach(([v, t], k) => {
    const cx = k % 2 ? 790 : 290, cy = 720 + Math.floor(k / 2) * 330;
    x.fillStyle = "rgba(255,255,255,.15)"; x.beginPath(); x.roundRect ? x.roundRect(cx - 230, cy - 140, 460, 280, 44) : x.rect(cx - 230, cy - 140, 460, 280); x.fill();
    x.fillStyle = "#fff"; x.font = `800 150px ${T1}`; x.fillText(v, cx, cy + 40); x.font = `600 40px ${T2}`; x.fillText(t, cx, cy + 100); });
  x.font = `800 76px ${T1}`; x.fillText(L("NIVEAU", "LEVEL") + " " + N.n + " · " + N.nom.toUpperCase(), 540, 1370);
  x.textAlign = "left"; x.font = `600 40px ${T2}`; S.defis.forEach((d, k) => { x.globalAlpha = d.ok ? 1 : .6; x.fillText((d.ok ? "✓  " : "○  ") + L(d.fr, d.en), 150, 1490 + k * 66); });
  x.globalAlpha = 1; x.textAlign = "center"; x.font = `500 36px ${T2}`; x.fillText("aidou-1.github.io/2work", 540, 1850);
  return c;
}
function ouvrirBilan(l = lundiDe(), retourVers = () => ecran("menu")) {
  const S = statsSemaine(l), d = S.min - S.minPrec, fait = S.defis.filter(x => x.ok).length; stocker("bilanVu", l);
  outil(L("Ma semaine", "My week"), dateCourte(l) + " – " + dateCourte(decaler(l, 6)), !S.n ? `<p class="vide">${L("Aucune séance cette semaine pour l’instant : 5 minutes suffisent pour lancer la machine.", "No workout this week yet: 5 minutes is enough to get going.")}</p>` :
    `<div class="kpis">${[[S.min, L("minutes", "minutes"), "#10B981"], [S.n, L("séances", "workouts"), "#2F5BFF"], [S.jours + "/7", L("jours actifs", "active days"), "#F59E0B"], ["+" + (S.xp + fait * 50 + (fait === 3 ? 50 : 0)), "XP", "#E11D48"]].map(([v, t, c]) => `<div class="kpi" style="--c:${c}"><b>${v}</b><span>${t}</span></div>`).join("")}</div>
     <div class="carte"><h2>${L("Par rapport à la semaine d’avant", "Compared with the week before")}</h2><p>${!S.nPrec ? L("Pas de séance la semaine d’avant : tu repars sur de bonnes bases.", "No workout the week before: you are off to a fresh start.") : d > 0 ? L(`${d} minutes de plus (${S.minPrec} → ${S.min}). Belle progression !`, `${d} more minutes (${S.minPrec} → ${S.min}). Nice progress!`) : d < 0 ? L(`${-d} minutes de moins (${S.minPrec} → ${S.min}). Une semaine plus légère fait aussi partie de l’entraînement.`, `${-d} fewer minutes (${S.minPrec} → ${S.min}). A lighter week is part of training too.`) : L("Exactement le même volume : la régularité paie.", "Exactly the same volume: consistency pays off.")}${S.ef !== null ? " " + L(`Effort ressenti le plus haut : ${S.ef}/10.`, `Highest perceived effort: ${S.ef}/10.`) : ""}</p></div>
     <div class="carte"><h2>${L("Défis de la semaine", "Weekly challenges")} · ${fait}/3</h2>${listeDefis(S.defis)}</div>
     <button class="primary" id="bilanPartage">📸 ${L("Partager ma semaine", "Share my week")}</button><div id="shAide"></div>`, retourVers);
  if ($("bilanPartage")) $("bilanPartage").onclick = () => carteSemaine(S).toBlob(b => envoyer(b, "2work-semaine.jpg", "image/jpeg").then(r => { if (r === "telecharge") zoneAide().innerHTML = `<p class="sh-ok">${L("Image enregistrée dans tes téléchargements.", "Image saved to your downloads.")}</p>`; }), "image/jpeg", .92);
}

/* --- Carte du menu : niveau, barre d'XP, défis de la semaine ; le dimanche soir et le lundi, le bilan de la semaine écoulée --- */
function majJeu() {
  const Z = $("jeuCarte"); if (!Z) return; const N = niveauXp(), d = new Date(), j = d.getDay(), E = document.querySelector("#menu .entete");
  const lb = j === 1 ? decaler(lundiDe(), -7) : j === 0 && d.getHours() >= 17 ? lundiDe() : "", aBilan = lb && lire("bilanVu") !== lb && statsSemaine(lb).n;
  if (!$("nivBadge")) { E.insertAdjacentHTML("beforeend", `<button class="niv-badge" id="nivBadge"></button>`); $("nivBadge").onclick = ouvrirNiveau; }
  $("nivBadge").setAttribute("aria-label", L("Niveau", "Level") + " " + N.n + " · " + N.nom); $("nivBadge").style.setProperty("--p", N.pct + "%"); $("nivBadge").innerHTML = `<b>${N.n}</b><small>${L("Niv.", "Lvl")}</small>`;
  Z.innerHTML = aBilan ? `<button class="jeu-bilan" id="jeuBilan">📊 ${L("Ton bilan de la semaine est prêt", "Your weekly summary is ready")} ›</button>` : "";
  if ($("jeuBilan")) $("jeuBilan").onclick = () => ouvrirBilan(lb);
}
/* Écran du niveau : avancement, ce que rapporte chaque type de séance, défis en cours, et récompenses offertes tous les 3 niveaux (js/moi.js) */
function ouvrirNiveau() {
  const N = niveauXp(), D = defisSemaine(), R = ARTICLES.filter(x => x[4] < 0).sort((a, b) => b[4] - a[4]), FAM = { tee: ["Tenue", "Outfit"], acc: ["Accessoire", "Accessory"], mur: ["Mur du home gym", "Home gym wall"], sol: ["Sol du home gym", "Home gym floor"], obj: ["Objet du home gym", "Home gym item"] };
  const gain = (min, f) => 10 + min * f, ligne = (t, x) => `<li><span>${t}</span><b>+${x} XP</b></li>`;
  outil(L("Niveau", "Level") + " " + N.n + " · " + N.nom, L("Chaque séance te fait gagner des points d’expérience (XP). Ils font monter ton niveau et servent à acheter tenues et décors dans l’onglet Moi.", "Every workout earns experience points (XP). They raise your level and buy outfits and decor in the Me tab."),
    `<div class="carte niv-carte"><div class="niv-tete"><b class="xp-rond">${N.n}</b><span><strong>${N.dans} / ${N.pour} XP</strong>${barreXp(N)}<small>${L("Encore", "Another")} ${N.pour - N.dans} XP ${L("pour le niveau", "to reach level")} ${N.n + 1}${N.n < RANGS.length ? " · " + L(...RANGS[N.n]) : ""}</small></span><b class="xp-rond suivant">${N.n + 1}</b></div>
       <p class="sh-aide">${L("Total gagné", "Total earned")} : ${N.xp} XP · ${L("à dépenser", "to spend")} : ${solde()} XP. ${L("Dépenser des XP ne fait jamais baisser ton niveau.", "Spending XP never lowers your level.")}</p></div>
     <div class="carte"><h2>${L("Ce que tu vas gagner", "What you will earn")}</h2><ul class="carnet ef-liste records">
       ${ligne(L("Échauffement ou étirements · 10 min", "Warm-up or stretching · 10 min"), gain(10, 1))}${ligne(L("Renfo, salle ou cardio · 20 min", "Strength, gym or cardio · 20 min"), gain(20, 2))}${ligne(L("Renfo, salle ou cardio · 30 min", "Strength, gym or cardio · 30 min"), gain(30, 2))}${ligne(L("Tabata · 8 min", "Tabata · 8 min"), gain(8, 3))}${ligne(L("Chaque défi de la semaine réussi", "Each weekly challenge completed"), 50)}${ligne(L("Bonus si les trois défis sont réussis", "Bonus when all three challenges are done"), 50)}</ul>
       <p class="sh-aide">${L("Règle : 10 XP par séance, plus ses minutes × 1 (échauffement, récupération), × 2 (renfo, salle, cardio) ou × 3 (Tabata).", "Rule: 10 XP per workout, plus its minutes × 1 (warm-up, recovery), × 2 (strength, gym, cardio) or × 3 (Tabata).")}</p></div>
     <div class="carte"><h2>${L("Défis de la semaine", "Weekly challenges")} · ${D.filter(d => d.ok).length}/3</h2>${listeDefis(D)}</div>
     <h2 class="sec">${L("Récompenses de palier", "Milestone rewards")}</h2><div class="carte"><ul class="paliers">${R.map(x => { const n = -x[4], ok = N.n >= n, c = typeof x[5] === "string" && x[5][0] === "#" ? x[5] : x[6] && x[6][0] === "#" ? x[6] : "#F5B301";
       return `<li class="${ok ? "ok" : ""}"><b class="xp-rond${ok ? "" : " verrou"}">${n}</b><i style="--c:${c}"></i><span><strong>${L(x[2], x[3])}</strong><small>${L(...FAM[x[1]])} · ${ok ? L("débloqué, à retrouver dans Moi", "unlocked, find it in Me") : L("dans", "in") + " " + (n - N.n) + " " + L(n - N.n > 1 ? "niveaux" : "niveau", n - N.n > 1 ? "levels" : "level")}</small></span></li>`; }).join("")}</ul>
       <button class="toggle contour" id="nivMoi">${L("Ouvrir ma boutique", "Open my shop")}</button></div>`, () => ecran("menu"));
  $("nivMoi").onclick = () => { essai = ""; ouvrirMoi(); };
}

/* --- Fin de séance : XP gagnés, passage de niveau, défis qui viennent d'être réussis --- */
function blocGain() {
  const h = lireHist(), av = h.slice(0, -1), A = niveauXp(xpTotal(av)), B = niveauXp(xpTotal(h)), l = lundiDe(), dA = defisSemaine(l, av), neufs = defisSemaine(l, h).filter((d, k) => d.ok && !dA[k].ok);
  if (B.n > A.n) setTimeout(() => { confettis(); [784, 1047, 1319, 1568].forEach((f, i) => bip(f, 200, .14, "triangle", i * .12)); }, 2200);
  return `<div class="nouveau-trophee gain-xp"><b class="xp-rond">${B.n}</b><div><small>+${B.xp - A.xp} XP${B.n > A.n ? " · " + L("niveau supérieur !", "level up!") : ""}</small><b>${L("Niveau", "Level")} ${B.n} · ${B.nom}</b>${barreXp(B)}</div></div>`
    + ARTICLES.filter(x => -x[4] > A.n && -x[4] <= B.n).map(x => `<div class="nouveau-trophee"><b class="xp-rond ok">🎁</b><div><small>${L("Récompense de palier débloquée", "Milestone reward unlocked")}</small><b>${L(x[2], x[3])}</b><span>${L("À retrouver dans l’onglet Moi", "Find it in the Me tab")}</span></div></div>`).join("")
    + neufs.map(d => `<div class="nouveau-trophee"><b class="xp-rond ok">✓</b><div><small>${L("Défi de la semaine réussi · +50 XP", "Weekly challenge done · +50 XP")}</small><b>${L(d.fr, d.en)}</b></div></div>`).join("");
}

/* --- Mes progrès : niveau, défis, charge des 8 dernières semaines, effort ressenti, records --- */
function blocsJeu() {
  const h = lireHist(), N = niveauXp(), l = lundiDe(), D = defisSemaine(l, h), sr = series(h);
  const sems = Array.from({ length: 8 }, (_, k) => statsSemaine(decaler(l, (k - 7) * 7), h)), mx = Math.max(60, ...sems.map(s => s.charge)), moy = Math.round(sems.slice(0, 7).reduce((t, s) => t + s.charge, 0) / 7);
  const ef = h.filter(x => x.ef !== undefined).slice(-12), pts = ef.map((x, k) => [10 + k * (280 / Math.max(1, ef.length - 1)), 92 - x.ef * 8.4]);
  const parSem = {}; h.forEach(x => { const k = lundiDe(x.j); (parSem[k] = parSem[k] || []).push(x); });
  const mSem = Object.values(parSem), vma = lireTests().filter(x => x.id === "navette"), rec = [[h.length ? Math.round(Math.max(...h.map(x => x.s)) / 60) + " min" : "", L("Séance la plus longue", "Longest workout")], [mSem.length ? Math.max(...mSem.map(minDe)) + " min" : "", L("Meilleure semaine", "Best week")], [mSem.length ? Math.max(...mSem.map(s => s.length)) : "", L("Séances en une semaine", "Workouts in a week")],
    [sr.best ? sr.best + L(" j", " d") : "", L("Meilleure série", "Best streak")], [h.some(x => x.fcMax) ? Math.max(...h.map(x => x.fcMax || 0)) + " bpm" : "", L("Fréquence cardiaque max", "Max heart rate")], [vma && vma.length ? Math.max(...vma.map(t => t.v)) + " km/h" : "", L("Meilleure VMA estimée", "Best estimated top aerobic speed")]].filter(r => r[0] !== "");
  return `<div id="jeuBloc" class="carte jeu-carte"><h2>${L("Niveau", "Level")} ${N.n} · ${N.nom}</h2>${barreXp(N)}<p class="sh-aide">${N.dans} / ${N.pour} XP · ${L("encore", "another")} ${N.pour - N.dans} XP ${L("pour le niveau", "to reach level")} ${N.n + 1}. ${L("Chaque séance rapporte 10 XP, plus ses minutes multipliées par son intensité.", "Each workout earns 10 XP, plus its minutes multiplied by its intensity.")}</p>
      <p class="joker">🛡️ ${sr.joker ? L("Joker de la semaine utilisé : ta série a survécu à un jour sans séance.", "This week’s joker is used: your streak survived a day without a workout.") : L("Joker de la semaine disponible : un jour sans séance ne cassera pas ta série.", "This week’s joker is available: one day without a workout will not break your streak.")}</p></div>
    <div class="carte"><h2>${L("Défis de la semaine", "Weekly challenges")} · ${D.filter(d => d.ok).length}/3</h2>${listeDefis(D)}<button class="toggle contour" id="voirBilan">${L("Voir le bilan de ma semaine", "See my weekly summary")}</button></div>
    <div class="carte"><h2>${L("Charge d’entraînement · 8 semaines", "Training load · 8 weeks")}</h2><div class="barres b8">${sems.map((s, k) => `<div class="${k === 7 ? "auj" : ""}"><b>${s.charge || ""}</b><i style="--h:${s.charge / mx * 100}%;--k:${k}"></i>${dateCourte(s.l).replace(/\D+$/, "").trim()}</div>`).join("")}</div>
      <p class="sh-aide">${L("Charge = minutes × intensité de la séance. Moyenne des 7 semaines précédentes : ", "Load = minutes × session intensity. Average of the 7 previous weeks: ")}${moy}. ${moy && sems[7].charge > moy * 1.5 ? L("Cette semaine est nettement au-dessus : prévois une journée de récupération.", "This week is well above it: plan a recovery day.") : ""}</p></div>
    ${ef.length > 1 ? `<div class="carte"><h2>${L("Effort ressenti · séances cardio", "Perceived effort · cardio sessions")}</h2><svg class="courbe" viewBox="0 0 300 100" role="img" aria-label="${L("Effort ressenti des dernières séances", "Perceived effort of recent sessions")} : ${ef.map(x => x.ef).join(", ")}">
      ${[0, 5, 10].map(v => `<line x1="10" x2="290" y1="${92 - v * 8.4}" y2="${92 - v * 8.4}"/><text x="0" y="${95 - v * 8.4}">${v}</text>`).join("")}<polyline points="${pts.map(p => p.join(",")).join(" ")}"/>${pts.map((p, k) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5"><title>${dateCourte(ef[k].j)} · ${ef[k].ef}/10</title></circle>`).join("")}</svg>
      <p class="sh-aide">${L("Moyenne", "Average")} : ${(ef.reduce((t, x) => t + x.ef, 0) / ef.length).toFixed(1)}/10 ${L("sur", "over")} ${ef.length} ${L("séances", "sessions")}.</p></div>` : ""}
    ${rec.length ? `<div class="carte"><h2>${L("Records personnels", "Personal records")}</h2><ul class="carnet ef-liste records">${rec.map(([v, t]) => `<li><span>${t}</span><b>${v}</b></li>`).join("")}</ul></div>` : ""}`;
}
