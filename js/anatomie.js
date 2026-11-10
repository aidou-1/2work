/* ============ SCHÉMA ANATOMIQUE DU MUSCLE DU JOUR ============
   Planche anatomique de face et de dos (ou visage pour les muscles de la tête).
   Chaque forme = liste [dx, y, …] relative à l'axe du corps, lissée en courbe (Catmull-Rom) et dessinée des deux côtés.
   REG[clé] = [vue F/B/H, options ("p" profond = pointillés, caché sur la planche ; "u" = un seul côté), formes…] ; l'ordre = ordre de dessin. */
const SIL = [[0, 8, 10, 10, 17, 18, 19, 32, 18, 44, 14, 54, 8, 60, 0, 62], [18, 33, 22, 34, 22, 44, 18, 46],
  [0, 56, 8, 58, 10, 66, 16, 73, 30, 77, 42, 79, 50, 84, 55, 94, 55, 108, 50, 116, 42, 114, 40, 128, 37, 146, 34, 160, 36, 174, 39, 192, 38, 212, 24, 216, 8, 214, 0, 216],
  [42, 106, 52, 96, 58, 112, 61, 132, 62, 150, 57, 158, 50, 156, 46, 138, 42, 122], [50, 150, 61, 145, 66, 160, 69, 180, 68, 204, 61, 206, 57, 190, 52, 170],
  [59, 202, 68, 201, 74, 212, 76, 226, 73, 242, 67, 249, 62, 245, 59, 232, 57, 216], [70, 207, 75, 212, 79, 222, 77, 227, 73, 224],
  [3, 206, 20, 198, 38, 198, 39, 222, 35, 250, 30, 276, 27, 296, 9, 298, 8, 278, 5, 250, 3, 226], [8, 292, 26, 292, 29, 314, 27, 338, 22, 360, 21, 376, 12, 376, 10, 360, 6, 338, 5, 316],
  [10, 372, 22, 372, 24, 384, 26, 396, 9, 398, 8, 386]];
const REG = {
  // ——— face ———
  couAv: ["F", "", [0, 62, 5, 62, 6, 76, 0, 78]], couProf: ["F", "p", [0, 60, 4, 60, 4, 80, 0, 80]], scal: ["F", "", [9, 63, 12, 63, 19, 76, 13, 77]],
  scm: ["F", "", [12, 49, 15, 53, 8, 70, 4, 79, 1, 78, 3, 71, 9, 58]], trapAv: ["F", "@25", [10, 64, 14, 68, 28, 75, 40, 79, 30, 80, 18, 78, 11, 72]],
  delt: ["F", "", [28, 80, 39, 78, 49, 82, 55, 92, 56, 104, 53, 116, 48, 126, 45, 114, 41, 100, 34, 88]],
  pec: ["F", "@-12", [2, 82, 14, 80, 28, 83, 37, 92, 43, 104, 42, 111, 34, 119, 22, 125, 10, 125, 2, 121]],
  subcl: ["F", "p", [6, 78, 26, 80, 26, 83, 6, 82]], petitPec: ["F", "p", [16, 96, 34, 92, 24, 116, 17, 114]],
  dentele: ["F", "", [34, 114, 41, 114, 40, 120, 33, 121], [33, 123, 40, 122, 39, 129, 32, 130], [32, 132, 39, 131, 37, 139, 31, 139]],
  cotes: ["F", "p", [8, 108, 32, 111, 32, 114, 8, 111], [10, 127, 31, 130, 31, 133, 10, 130], [10, 137, 33, 140, 33, 143, 10, 140]],
  diaph: ["F", "p", [0, 128, 14, 124, 28, 130, 34, 142, 30, 146, 16, 138, 0, 136]],
  coeur: ["F", "pu", [2, 100, 8, 96, 16, 100, 18, 110, 12, 120, 6, 124, 0, 118, -3, 108, -2, 100]],
  obl: ["F", "@116", [15, 128, 29, 128, 36, 140, 37, 156, 36, 170, 31, 182, 22, 196, 16, 198, 15, 180, 16, 160]],
  abdos: ["F", "@90", [2, 126, 12, 126, 13, 140, 2, 141], [2, 144, 13, 143, 14, 158, 2, 159], [2, 162, 14, 161, 14, 176, 2, 177], [2, 180, 13, 179, 11, 196, 6, 206, 2, 207]],
  pyramidal: ["F", "", [1, 195, 5, 194, 2, 206, 1, 207]], transv: ["F", "p", [2, 128, 34, 140, 36, 170, 24, 198, 4, 200]],
  psoas: ["F", "p", [3, 150, 8, 150, 13, 176, 20, 200, 22, 212, 17, 214, 12, 196, 6, 176, 3, 164]], iliaque: ["F", "p", [12, 166, 26, 170, 30, 182, 22, 204, 16, 200, 12, 184]],
  bassin: ["F", "p", [0, 200, 12, 201, 17, 206, 12, 212, 0, 214]],
  coraco: ["F", "", [42, 108, 46, 108, 48, 124, 44, 126]], biceps: ["F", "", [45, 112, 51, 106, 56, 116, 59, 132, 59, 146, 56, 154, 52, 150, 48, 136, 45, 124]],
  brachial: ["F", "", [57, 128, 61, 134, 62, 148, 59, 152, 57, 140], [47, 138, 50, 142, 51, 153, 48, 153]],
  flechP: ["F", "", [51, 152, 58, 150, 63, 166, 64, 186, 63, 203, 59, 204, 56, 188, 52, 170]], pronat: ["F", "", [51, 150, 55, 149, 64, 165, 63, 172, 59, 169]],
  palm: ["F", "", [55, 162, 57, 161, 62, 200, 61, 202]], flechDoigts: ["F", "p", [53, 160, 60, 160, 63, 200, 59, 202]],
  brRad: ["F", "", [58, 144, 64, 144, 68, 160, 69, 178, 67, 198, 64, 201, 63, 182, 60, 162]],
  hypo: ["F", "", [58, 208, 62, 207, 63, 224, 60, 228, 58, 218]], pouce: ["F", "", [66, 207, 71, 208, 74, 218, 70, 224, 66, 220]], main: ["F", "p", [61, 213, 67, 213, 68, 226, 62, 228]],
  pectine: ["F", "", [10, 202, 17, 201, 19, 212, 12, 216]], addL: ["F", "", [4, 208, 12, 205, 19, 214, 18, 236, 13, 252, 8, 250, 5, 232]],
  gracile: ["F", "", [3, 212, 6, 212, 9, 244, 10, 282, 8, 286, 5, 256, 3, 232]],
  droitFem: ["F", "", [19, 200, 27, 198, 31, 214, 31, 246, 27, 272, 21, 282, 17, 268, 16, 240, 17, 214]],
  vasteLat: ["F", "", [30, 204, 38, 206, 39, 224, 37, 246, 33, 268, 28, 286, 25, 286, 29, 262, 32, 236, 32, 216]], vasteMed: ["F", "", [11, 244, 18, 254, 21, 272, 19, 290, 13, 290, 9, 276, 9, 256]],
  sartorius: ["F", "", [28, 182, 31, 185, 26, 212, 18, 246, 13, 272, 12, 294, 9, 294, 9, 272, 14, 244, 23, 210]], tfl: ["F", "", [29, 180, 35, 184, 38, 200, 35, 206, 31, 196]],
  gastroAv: ["F", "", [7, 300, 12, 302, 12, 324, 9, 338, 6, 332, 5, 316]], solAv: ["F", "", [7, 336, 11, 334, 12, 352, 11, 364, 9, 362, 8, 348]],
  fib: ["F", "", [23, 300, 28, 306, 28, 330, 25, 352, 22, 364, 21, 350, 24, 328]], tibAnt: ["F", "", [16, 300, 23, 300, 25, 318, 23, 344, 19, 366, 16, 370, 16, 348, 16, 322]],
  extOrt: ["F", "", [23, 320, 25, 322, 22, 358, 20, 362, 21, 340]], piedAv: ["F", "", [12, 378, 20, 378, 22, 388, 13, 390]],
  // ——— dos ———
  couB: ["B", "", [0, 54, 7, 55, 10, 68, 0, 72]], sousOcc: ["B", "p", [0, 50, 9, 50, 9, 55, 0, 56]], elev: ["B", "p", [8, 58, 12, 60, 24, 84, 20, 86]],
  trap: ["B", "@0", [0, 60, 4, 60, 10, 68, 24, 76, 40, 82, 34, 88, 25, 96, 21, 110, 14, 128, 6, 144, 0, 152]],
  supra: ["B", "p", [14, 84, 30, 82, 34, 88, 18, 92]], subscap: ["B", "p", [18, 94, 38, 98, 36, 116, 24, 120]], rhomb: ["B", "p", [3, 88, 16, 92, 22, 118, 8, 126, 3, 120]],
  infra: ["B", "@-25", [19, 98, 33, 92, 40, 100, 39, 112, 31, 118, 21, 116]], pRond: ["B", "", [37, 104, 43, 108, 42, 114, 36, 113]], gRond: ["B", "", [30, 118, 40, 114, 46, 118, 44, 125, 34, 126]],
  dorsal: ["B", "@-56", [12, 132, 22, 120, 34, 124, 44, 120, 46, 126, 40, 140, 38, 158, 35, 172, 24, 177, 13, 172, 10, 150]],
  erect: ["B", "@90", [2, 138, 9, 138, 12, 168, 11, 192, 6, 200, 2, 198]], multif: ["B", "p", [1, 170, 5, 170, 6, 198, 1, 200]], carre: ["B", "p", [8, 160, 20, 162, 22, 176, 10, 178]],
  oblB: ["B", "", [36, 158, 39, 164, 37, 178, 33, 176]],
  moyFess: ["B", "@60", [16, 178, 34, 176, 38, 188, 37, 200, 26, 198, 18, 190]], petitFess: ["B", "p", [20, 182, 34, 182, 35, 196, 24, 194]],
  fess: ["B", "@43", [2, 188, 14, 184, 28, 190, 38, 200, 39, 222, 31, 232, 16, 235, 6, 231, 2, 217]], pirif: ["B", "p", [5, 200, 31, 204, 31, 208, 6, 207]],
  gAdd: ["B", "", [4, 226, 10, 228, 10, 252, 6, 264, 4, 250]], semiM: ["B", "", [7, 250, 11, 250, 13, 286, 9, 292, 7, 272]],
  semiT: ["B", "", [9, 232, 21, 234, 22, 262, 19, 284, 14, 296, 11, 294, 11, 266, 9, 250]], bFem: ["B", "", [21, 232, 34, 232, 37, 250, 33, 272, 27, 292, 22, 294, 22, 270, 21, 252]],
  poplite: ["B", "p", [12, 290, 22, 293, 20, 302, 12, 300]],
  soleaire: ["B", "", [6, 328, 10, 344, 14, 350, 20, 346, 26, 332, 26, 346, 22, 362, 19, 372, 13, 372, 8, 360]],
  gastroM: ["B", "", [6, 296, 16, 296, 18, 320, 16, 342, 10, 348, 5, 326]], gastroL: ["B", "", [17, 296, 27, 298, 29, 316, 26, 336, 20, 346, 17, 326]],
  plantaire: ["B", "p", [20, 292, 22, 294, 14, 344, 13, 343]], jambeProf: ["B", "p", [12, 312, 18, 312, 17, 360, 14, 362]],
  deltB: ["B", "", [28, 82, 40, 80, 50, 86, 55, 98, 54, 112, 49, 124, 45, 112, 40, 100, 32, 92]],
  triceps: ["B", "", [48, 106, 56, 106, 61, 124, 61, 140, 56, 146, 51, 128], [42, 112, 49, 110, 54, 130, 55, 146, 51, 153, 46, 140, 42, 126], [52, 142, 58, 141, 60, 151, 54, 154]],
  ancone: ["B", "", [55, 150, 60, 151, 61, 160, 57, 160]], ulnaireB: ["B", "", [50, 154, 56, 155, 60, 188, 60, 203, 56, 202, 53, 178]],
  extDoigts: ["B", "", [55, 158, 62, 158, 65, 194, 62, 203, 58, 188]], extPoig: ["B", "", [60, 148, 65, 148, 68, 166, 69, 194, 66, 201, 64, 180, 61, 162]],
  supin: ["B", "p", [56, 154, 61, 154, 62, 164, 58, 164]], mainDos: ["B", "", [60, 212, 70, 212, 71, 228, 62, 230]],
  // ——— visage ———
  frontal: ["H", "@90", [2, 22, 20, 20, 38, 28, 44, 44, 40, 60, 30, 64, 18, 64, 6, 62, 2, 60]], temporal: ["H", "", [42, 34, 50, 46, 52, 62, 49, 76, 44, 80, 42, 66, 40, 50]],
  platysma: ["H", "", [20, 138, 38, 124, 44, 150, 66, 200, 44, 204, 24, 168]], couAvH: ["H", "", [0, 174, 7, 175, 8, 198, 0, 200]],
  scmH: ["H", "", [42, 100, 48, 104, 32, 150, 18, 196, 8, 198, 10, 190, 26, 146]],
  digas: ["H", "", [6, 140, 12, 139, 22, 146, 18, 150, 8, 148], [22, 145, 40, 118, 44, 121, 26, 150]], larynx: ["H", "", [0, 150, 7, 152, 8, 164, 5, 174, 0, 176]],
  masseter: ["H", "@80", [34, 94, 43, 96, 45, 112, 40, 126, 33, 124, 31, 108]], zygo: ["H", "", [35, 86, 39, 89, 22, 118, 18, 116]],
  yeux: ["H", "", [20, 66, 32, 70, 36, 78, 32, 87, 20, 90, 8, 87, 4, 78, 8, 70]], bouche: ["H", "", [0, 110, 10, 111, 17, 116, 17, 124, 10, 129, 0, 130]],
  bucc: ["H", "p", [18, 108, 32, 104, 34, 118, 22, 124, 16, 118]], ptery: ["H", "p", [30, 96, 38, 98, 38, 110, 30, 108]], langue: ["H", "p", [0, 118, 8, 119, 8, 123, 0, 124]],
  oculo: ["H", "p", [20, 72, 28, 74, 29, 78, 28, 82, 20, 84, 12, 82, 11, 78, 12, 74]], cil: ["H", "p", [20, 76, 22, 78, 20, 80, 18, 78]], oreille: ["H", "p", [52, 82, 55, 84, 52, 87, 50, 84]]
};
const TETE = [[0, 10, 22, 13, 40, 24, 48, 44, 50, 70, 48, 92, 42, 116, 28, 134, 12, 142, 0, 144], [48, 70, 55, 68, 58, 80, 55, 96, 49, 100], [0, 130, 28, 128, 34, 170, 70, 196, 74, 210, 0, 210]];
const LOC = { grandFessier: "fess", moyenFessier: "moyFess", quadriceps: "droitFem vasteLat vasteMed", ischios: "bFem semiT semiM", tricepsSural: "gastroM gastroL soleaire gastroAv solAv",
  tibialAnt: "tibAnt", adducteurs: "addL pectine gracile gAdd", psoas: "psoas", grandDroit: "abdos", transverse: "transv", obliques: "obl oblB", erecteurs: "erect", grandDorsal: "dorsal",
  trapeze: "trap trapAv", rhomboides: "rhomb", dentele: "dentele", pectoral: "pec", deltoide: "delt deltB", coiffe: "supra infra pRond subscap", biceps: "biceps", brachial: "brachial",
  triceps: "triceps", extPoignet: "extPoig", diaphragme: "diaph", scm: "scm", flechisseursCou: "couProf", piriforme: "pirif", planchPelvien: "bassin", tfl: "tfl", piedIntrinseque: "piedAv",
  droitFemoral: "droitFem", vasteMedial: "vasteMed", vasteLateral: "vasteLat", soleaire: "soleaire solAv", gastrocnemien: "gastroM gastroL gastroAv", bicepsFemoral: "bFem",
  semiTendineux: "semiT", semiMembraneux: "semiM", grandAdducteur: "gAdd", longAdducteur: "addL", pectine: "pectine", petitFessier: "petitFess", sartorius: "sartorius", gracile: "gracile",
  poplite: "poplite", tibialPost: "jambeProf", fibulaires: "fib", longFlechOrteils: "jambeProf", longFlechHallux: "jambeProf", longExtOrteils: "extOrt", abducteurHallux: "piedAv",
  plantaireGrele: "plantaire", pelviTroch: "pirif", iliaque: "iliaque", psoasMineur: "psoas", pyramidal: "pyramidal", carreLombes: "carre", multifides: "multif", intercostaux: "cotes",
  scalenes: "scal", splenius: "couB", semiEpineuxTete: "couB", sousOccipitaux: "sousOcc", elevateurScap: "elev", grandRond: "gRond", petitPectoral: "petitPec", subclavier: "subcl",
  supraEpineux: "supra", infraEpineux: "infra", petitRond: "pRond", subscapulaire: "subscap", coracoBrachial: "coraco", ancone: "ancone", brachioRadial: "brRad", supinateur: "supin",
  pronateurs: "pronat", flechPoignet: "flechP ulnaireB", longPalmaire: "palm", flechDoigts: "flechDoigts", extDoigts: "extDoigts", thenar: "pouce", hypothenar: "hypo",
  interosseux: "mainDos main", masseter: "masseter", temporal: "temporal", pterygoidien: "ptery", digastrique: "digas", langue: "langue", larynx: "larynx", oculomoteurs: "oculo",
  ciliaire: "cil", orbiculaireOeil: "yeux", zygomatique: "zygo", orbiculaireBouche: "bouche", buccinateur: "bucc", frontal: "frontal", platysma: "platysma", stapedien: "oreille",
  myocarde: "coeur", arrecteurs: "peau" };
function smChemin(p, cx, s = 1) {   // courbe fermée lissée passant par tous les points
  const P = []; for (let i = 0; i < p.length; i += 2) P.push([cx + s * p[i], p[i + 1]]);
  const n = P.length, f = v => v.toFixed(1); let d = `M${f(P[0][0])} ${f(P[0][1])}`;
  for (let i = 0; i < n; i++) {
    const a = P[(i - 1 + n) % n], b = P[i], c = P[(i + 1) % n], e = P[(i + 2) % n];
    d += `C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)} ${f(c[1] - (e[1] - b[1]) / 6)} ${f(c[0])} ${f(c[1])}`;
  }
  return d + "Z";
}
const smAngle = (p, s, a) => {   // orientation des fibres : imposée (@angle dans REG) ou axe principal de la forme
  if (a != null) return s < 0 ? 180 - a : a;
  let mx = 0, my = 0, xx = 0, yy = 0, xy = 0; const n = p.length / 2;
  for (let i = 0; i < p.length; i += 2) { mx += s * p[i] / n; my += p[i + 1] / n; }
  for (let i = 0; i < p.length; i += 2) { const dx = s * p[i] - mx, dy = p[i + 1] - my; xx += dx * dx; yy += dy * dy; xy += dx * dy; }
  return Math.atan2(2 * xy, xx - yy) * 90 / Math.PI;
};
const smPath = (p, cx, s, fib) => { const d = smChemin(p, cx, s); return `<path d="${d}"/>` + (fib === false ? "" : `<path class="sm-f" d="${d}" fill="url(#smF${(Math.round(smAngle(p, s, fib) / 15) % 12 + 12) % 12})"/>`); };
const smFormes = (l, cx, uni, fib = false) => l.map(p => {   // une moitié qui part et revient sur l'axe = forme entière symétrique
  if (!p[0] && !p[p.length - 2] && !uni) { const r = []; for (let i = p.length - 4; i > 0; i -= 2) r.push(-p[i], p[i + 1]); return smPath(p.concat(r), cx, 1, fib); }
  return smPath(p, cx, 1, fib) + (uni ? "" : smPath(p, cx, -1, fib));
}).join("");
const smLignes = (l, cx) => l.map(p => [1, -1].map(s => "M" + p.map((v, i) => i % 2 ? v : (cx + s * v).toFixed(1)).join(" ")).join("")).join("");
// tendons, os et aponévroses visibles (ivoire) · séparations des faisceaux, doigts, orteils et traits du visage
const TEND = { F: [[0, 80, 2.4, 81, 2.2, 121, 0, 123], [3, 78, 18, 76, 34, 77, 34, 79.6, 18, 79, 3, 81], [13, 284, 21, 284, 23, 292, 20, 299, 14, 299, 11, 292],
    [15, 298, 19, 298, 19, 306, 15, 306], [13, 308, 15.5, 306, 15.5, 362, 13.5, 364], [34, 214, 37, 216, 33, 250, 30, 284, 28, 286, 30, 250], [58, 199, 65, 198, 65, 203, 58, 204], [14, 366, 21, 365, 21, 369, 14, 370]],
  B: [[10, 93, 24, 90, 38, 86, 39, 88.6, 24, 92.6, 10, 95.6], [54, 150, 58, 150, 58, 154, 54, 154], [13, 350, 17, 350, 16.5, 376, 13.5, 376],
    [34, 228, 37, 232, 33, 260, 30, 288, 28, 288, 30, 258], [11, 378, 19, 378, 20, 386, 10, 386], [59, 203, 66, 202, 66, 207, 59, 208]].concat(Array.from({ length: 20 }, (_, k) => [0, 63 + k * 7, 1.6, 64.4 + k * 7, 0, 65.8 + k * 7]))
};
const APO = { B: [[8, 166, 20, 174, 18, 186, 8, 196, 3, 194, 3, 174]], F: [[0, 124, 1.4, 124, 1.4, 206, 0, 206]] };   // aponévroses (fascia thoraco-lombaire, ligne blanche)
const DIV = { F: [[38, 81, 44, 100, 48, 123], [3, 92, 16, 90, 30, 92, 38, 98], [51, 113, 53, 130, 55, 149], [28, 130, 30, 138], [32, 139, 34, 147], [35, 150, 36, 158], [24, 206, 24, 250, 22, 272],
    [61, 235, 61.5, 247], [64.5, 237, 65, 249], [68, 236, 68.5, 246], [13, 391, 13, 397], [16, 391, 16, 398], [19, 391, 19, 398], [22, 390, 22, 396]],
  B: [[40, 83, 46, 100, 49, 122], [4, 100, 22, 97], [6, 126, 16, 112], [62, 235, 62.5, 247], [65.5, 237, 66, 249], [69, 236, 69.5, 246], [11.5, 296, 11.5, 344]] };
const VISAGE = [[4, 26.5, 8, 25.5, 12, 26.5], [5, 31, 8, 30.2, 11, 31], [1.2, 34, 2.2, 40, 0.6, 41.5], [0.5, 48, 4, 47.4, 5.5, 46.6], [19, 36, 20.5, 39, 19.5, 43]];
const SM_DEFS = `<defs><radialGradient id="smG" cx=".36" cy=".26" r=".9"><stop offset="0" class="sm-g0"/><stop offset=".45" class="sm-g1"/><stop offset="1" class="sm-g2"/></radialGradient><radialGradient id="smH" cx=".36" cy=".26" r=".9"><stop offset="0" stop-color="#FFE3A8"/><stop offset=".45" stop-color="#FB923C"/><stop offset="1" stop-color="#DC2626"/></radialGradient>${Array.from({ length: 12 }, (_, k) => `<pattern id="smF${k}" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(${k * 15})"><path class="sm-fl" d="M0 1.1H2.2"/></pattern>`).join("")}</defs>`;
function schemaMuscle(id) {
  const cles = (LOC[id] || "").split(" ").filter(k => REG[k]), peau = LOC[id] === "peau", tete = cles.some(k => REG[k][0] === "H");
  const profond = cles.length && cles.every(k => REG[k][1].includes("p"));
  const fib = k => { const m = REG[k][1].match(/@(-?\d+)/); return m ? +m[1] : null; }, uni = k => REG[k][1].includes("u");
  const planche = (v, cx) => Object.keys(REG).filter(k => REG[k][0] === v && !REG[k][1].includes("p")).map(k => smFormes(REG[k].slice(2), cx, uni(k), fib(k))).join("");
  const cible = (v, cx) => cles.filter(k => REG[k][0] === v).map(k => REG[k][1].includes("p") ? `<g class="sm-prof">${smFormes(REG[k].slice(2), cx, uni(k))}</g>` : `<g class="sm-hl">${smFormes(REG[k].slice(2), cx, uni(k), fib(k))}</g>`).join("");
  const peauG = (l, cx) => `<g class="sm-sil">${smFormes(l, cx)}</g>`;
  // loupe : gros plan sur le muscle quand il est petit sur la planche (un seul côté s'il ne touche pas l'axe du corps)
  const cadre = v => { let a = 1e9, b = -1e9, c = 1e9, d = -1e9, axe = false;
    cles.filter(k => REG[k][0] === v).forEach(k => REG[k].slice(2).forEach(p => { for (let i = 0; i < p.length; i += 2) { a = Math.min(a, p[i]); b = Math.max(b, p[i]); c = Math.min(c, p[i + 1]); d = Math.max(d, p[i + 1]); } if (!uni(k) && Math.min(...p.filter((_, i) => !(i % 2))) <= 3) axe = true; }));
    return b < a ? null : { x0: axe ? -b : a, x1: b, y0: c, y1: d }; };
  const vz = cadre("F") ? "F" : "B", K = !tete && !peau && cadre(vz), tz = K && Math.max(K.x1 - K.x0, K.y1 - K.y0, 36) + 26;
  const loupe = K && tz < 150 ? `<div class="sm-loupe"><svg class="sm-zoom" viewBox="${((vz === "F" ? 85 : 255) + (K.x0 + K.x1) / 2 - tz / 2).toFixed(1)} ${((K.y0 + K.y1) / 2 - tz / 2).toFixed(1)} ${tz} ${tz}" aria-hidden="true"><use href="#smV${vz}"/></svg><span>${ico("loupe")} ${L("Gros plan", "Close-up")} · ${vz === "F" ? L("vue de face", "front view") : L("vue de dos", "back view")}</span></div>` : "";
  let svg;
  if (tete) {
    const cx = 120;
    svg = `<svg viewBox="0 0 240 212" class="schema-muscle sm-tete" role="img">${SM_DEFS}${peauG(TETE, cx)}<g class="sm-m">${planche("H", cx)}</g>
      <g class="sm-trait"><path d="M${cx - 30} 66q10-5 20 0M${cx + 10} 66q10-5 20 0M${cx} 84q-2 12-6 20q6 4 12 0q-4-8-6-20M${cx - 12} 120q12 4 24 0"/></g>
      <g class="sm-oeil"><ellipse cx="${cx - 20}" cy="78" rx="8" ry="4.5"/><ellipse cx="${cx + 20}" cy="78" rx="8" ry="4.5"/></g><g class="sm-iris"><circle cx="${cx - 20}" cy="78" r="2.6"/><circle cx="${cx + 20}" cy="78" r="2.6"/></g>
      ${cible("H", cx)}</svg>`;
  } else svg = `<svg viewBox="0 0 340 412" class="schema-muscle" role="img">${SM_DEFS}
    ${[["F", 85], ["B", 255]].map(([v, cx]) => `<g id="smV${v}"><ellipse class="sm-ombre" cx="${cx}" cy="399" rx="40" ry="4.5"/>` + peauG(SIL, cx) + `<g class="sm-m">${planche(v, cx)}</g><g class="sm-apo">${smFormes(APO[v], cx)}</g><g class="sm-t">${smFormes(TEND[v], cx)}</g><path class="sm-div" d="${smLignes(DIV[v], cx) + (v === "F" ? smLignes(VISAGE, cx) : "")}"/>` + cible(v, cx) + (peau ? `<g class="sm-peau">${smFormes(SIL, cx)}</g>` : "") + "</g>").join("")}
    <text x="85" y="410" text-anchor="middle">${L("Face", "Front")}</text><text x="255" y="410" text-anchor="middle">${L("Dos", "Back")}</text></svg>`;
  return `<div class="schema-carte" onclick="this.classList.toggle('plein')">${svg}${loupe}<p>${peau ? L("Présents dans toute la peau, à la base de chaque poil.", "Found throughout the skin, at the base of every hair.") : profond ? L("🔍 Muscle profond : il se trouve sous d’autres muscles (zone en pointillés).", "🔍 Deep muscle: it lies beneath other muscles (dotted area).") : L("Le muscle est surligné.", "The muscle is highlighted.")}${tete ? " · " + L("Vue de face du visage", "Front view of the face") : ""} · <b>${L("Touche pour agrandir", "Tap to enlarge")}</b></p></div>`;
}

/* ============ CARNET DE CHARGES (séances de salle) ============
   En fin de séance : charge et répétitions de la dernière série pour chaque exercice de travail.
   Clé "charges" : [{ j: date, id, kg, r: reps, s: séries, m: méthode }]. Force estimée (1RM) par la formule d'Epley : kg × (1 + reps / 30). */
const lireCharges = () => lireJSON("charges", []);
const rm1 = (kg, r) => Math.round(kg * (1 + r / 30));
function exosCharges() {   // exercices de travail de la séance (hors échauffement et retour au calme), sans doublon
  if (routine.gym) return [...new Set(routine.plan.filter(q => q.serie || q.presc && !q.lab.includes(L("Séries d’approche", "Warm-up sets"))).map(q => q.id))];
  if (routine.salle) return [...new Set(ids)];
  return [];
}
function formCharges() {
  const ex = exosCharges(); if (!ex.length) return "";
  const h = lireCharges();
  return `<div class="carnet"><h3>🏋️ ${L("Note tes charges", "Log your weights")}</h3><p>${L("Charge et répétitions de ta dernière série : l’appli suit ta progression et estime ta force maximale.", "Weight and reps of your last set: the app tracks your progress and estimates your max strength.")}</p>
    ${ex.map(id => { const d = h.filter(x => x.id === id).pop(), q = (routine.plan || []).find(x => x.id === id && x.presc && x.serie);
      const reps = q ? parseInt(q.presc, 10) || "" : ""; return `<div class="carnet-ligne" data-id="${id}"><span>${EXERCICES[id].nom}${d ? `<small>${L("Dernière fois", "Last time")} : ${d.kg} kg × ${d.r}</small>` : ""}</span>
      <label><input type="number" inputmode="decimal" min="0" max="500" step="0.5" placeholder="${d ? d.kg : "kg"}" class="ck"><i>kg</i></label><label><input type="number" inputmode="numeric" min="1" max="100" value="${reps}" class="cr"><i>reps</i></label></div>`; }).join("")}
    <button class="primary" id="ckOk">${L("Enregistrer mes charges", "Save my weights")}</button><div id="ckRes"></div></div>`;
}
function brancherCharges() {
  if (!$("ckOk")) return;
  $("ckOk").onclick = () => {
    const h = lireCharges(), res = [];
    document.querySelectorAll(".carnet-ligne").forEach(l => { const id = l.dataset.id, kg = parseFloat(l.querySelector(".ck").value), r = parseInt(l.querySelector(".cr").value, 10);
      if (!(kg > 0 && r > 0)) return;
      const avant = Math.max(0, ...h.filter(x => x.id === id).map(x => rm1(x.kg, x.r))), now = rm1(kg, r);
      h.push({ j: jourCle(), id, kg, r, s: (routine.plan || []).filter(q => q.id === id && q.serie).length || cycles, m: routine.gym ? methodeCourante : "libre" });
      const rc = repsCible((routine.plan || []).find(q => q.id === id && q.serie)), plus = kg < 20 ? 1 : 2.5;
      const sug = rc ? r >= rc[1] ? ` <span class="sug">📈 ${L("Prochaine fois", "Next time")} : ${kg + plus} kg</span>` : r < rc[0] ? ` <span class="sug">${L(`Garde ${kg} kg jusqu’à ${rc[0]} reps`, `Keep ${kg} kg until ${rc[0]} reps`)}</span>` : "" : "";
      res.push(`<li><b>${EXERCICES[id].nom}</b> : ${kg} kg × ${r} · ${L("force max estimée", "estimated max")} ${now} kg${avant && now > avant ? ` <em>🏆 ${L("record", "record")} (+${now - avant} kg)</em>` : ""}${sug}</li>`); });
    if (!res.length) { $("ckRes").innerHTML = `<p class="vide">${L("Renseigne au moins une charge.", "Enter at least one weight.")}</p>`; return; }
    stocker("charges", JSON.stringify(h.slice(-2000)));
    $("ckOk").remove(); $("ckRes").innerHTML = `<ul class="carnet-res">${res.join("")}</ul><p class="aide">${L("Retrouve tes courbes dans « Mes progrès ».", "Find your charts in “My progress”.")}</p>`;
    bip(880, 120, .12, "sine"); bip(1175, 160, .12, "sine", .12);
  };
}
function sectionCharges() {   // analyses pour « Mes progrès »
  const h = lireCharges(); if (!h.length) return "";
  const par = {}; h.forEach(x => (par[x.id] = par[x.id] || []).push(x));
  const cartes = Object.entries(par).filter(([id]) => EXERCICES[id]).sort((a, b) => b[1].length - a[1].length).map(([id, l]) => {
    const v = l.map(x => rm1(x.kg, x.r)), der = l[l.length - 1], best = Math.max(...v), prem = v[0], gain = v[v.length - 1] - prem;
    const pts = v.slice(-12), mn = Math.min(...pts), mx = Math.max(...pts), W = 120, H = 34;
    const xy = pts.map((p, i) => [pts.length > 1 ? i / (pts.length - 1) * W : W / 2, H - 4 - (mx > mn ? (p - mn) / (mx - mn) : .5) * (H - 8)]);
    const spark = `<svg viewBox="0 0 ${W} ${H}" class="spark"><polyline points="${xy.map(p => p.map(n => n.toFixed(1)).join(",")).join(" ")}"/>${xy.map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i === xy.length - 1 ? 3 : 1.8}"/>`).join("")}</svg>`;
    return `<div class="charge-carte"><div><b>${EXERCICES[id].nom}</b><small>${L("Dernière", "Last")} : ${der.kg} kg × ${der.r} · ${l.length} ${L(l.length > 1 ? "séances" : "séance", l.length > 1 ? "sessions" : "session")}</small>
      <small>${L("Force max estimée", "Estimated max")} : <b>${best} kg</b>${l.length > 1 ? ` · <span class="${gain >= 0 ? "plus" : "moins"}">${gain >= 0 ? "+" : ""}${gain} kg ${L("depuis le début", "since the start")}</span>` : ""}</small></div>${spark}</div>`; }).join("");
  const vol = h.filter(x => x.j >= jourCle(new Date(Date.now() - 30 * 864e5))).reduce((s, x) => s + x.kg * x.r * (x.s || 1), 0);
  return `<h2 class="sec">${L("Mes charges", "My weights")}</h2><div class="carte"><p class="aide" style="margin-bottom:8px">${L("Volume soulevé sur 30 jours", "Volume lifted over 30 days")} : <b>${Math.round(vol).toLocaleString(L("fr-FR", "en-GB"))} kg</b> · ${L("force max estimée avec la formule d’Epley (kg × (1 + reps ÷ 30)).", "estimated max uses the Epley formula (kg × (1 + reps ÷ 30)).")}</p>${cartes}</div>`;
}

