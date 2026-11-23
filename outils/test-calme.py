#!/usr/bin/env python3
"""Retour au calme et apnée en cohérence : plans, test d'apnée enregistré, tables recalculées, respiration guidée. Pixel 7, FR/EN, clair/sombre."""
import functools, http.server, pathlib, sys, threading
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
CAPT = len(sys.argv) > 1 and pathlib.Path(sys.argv[1])
class Muet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Muet, directory=str(ROOT)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
VERIF = r'''() => { const ok = (x, m) => { if (!x) throw Error(m); }; let n = 0;
  const coh = Object.keys(ROUTINES).filter(k => ROUTINES[k].cat === 'coherence');
  ok(coh.length === 13, 'séances de respiration : ' + coh.length);
  ok([...$('choicesK').children].filter(b => b.dataset.cat === 'coherence').length === 13, 'boutons');
  // 1. chaque séance de respiration se déroule sans phase vide ; les tables gardent leurs temps (durée choisie ignorée)
  for (const k of coh) { ouvrirRoutine(k); const p = planSouf(routine, dureeGlobale); n++;
    ok(p.length && p.every(q => q.sec > 0 && q.label && SOUFFLE_VOIX[q.label]), k + ' phases');
    if (routine.fixeSouf) ok(planSouf(routine, 30).length === p.length, k + ' fixe'); }
  // 2. sans record : base prudente 45 s → CO₂ à 22-23 s
  ouvrirRoutine('coherApneeCO2'); ok(planSouf(routine, 1).filter(q => q.hold).every(q => q.sec === 23 || q.sec === 22), 'CO2 sans record');
  ok($('dureeVal').closest('.reglage').classList.contains('hidden'), 'durée masquée');
  // 3. test d'apnée : 70 s comptées, enregistrées, puis tables recalculées (CO₂ 35 s, O₂ 28 → 46 s)
  ouvrirRoutine('coherApneeTest'); demarrerSouf();
  souf.i = souf.plan.findIndex(q => q.max); afficherSouf(); for (let s = 0; s < 70; s++) ticSouf();
  ok($('time').textContent === '70', 'chrono qui monte'); suivantSouf();
  ok(lireTests().some(x => x.id === 'sfApneeMax' && x.v === 70), 'record noté');
  souf.i = souf.plan.length - 1; suivantSouf(); ok(/70 s/.test($('fSub').textContent), 'message de fin');
  ouvrirRoutine('coherApneeCO2'); ok(planSouf(routine, 1).filter(q => q.hold).every(q => q.sec === 35), 'CO2 recalculée');
  ouvrirRoutine('coherApneeO2'); const o = planSouf(routine, 1).filter(q => q.hold).map(q => q.sec); ok(o[0] === 28 && o[5] === 46, 'O2 ' + o);
  // un essai plus faible le même jour ne remplace pas le meilleur
  noterApnee(40); ok(lireTests().filter(x => x.id === 'sfApneeMax').length === 1 && recordApnee() === 70, 'meilleur du jour gardé');
  // 4. récupération : la respiration de fin est rythmée (inspire au 6e s, expire au 10e)
  ROUTINES.recup = seanceRecup('course'); CONSEILLES.recup = ROUTINES.recup.exercices; ouvrirRoutine('recup');
  ok(liste.some(e => e.id === 'relaxation') && RESP_GUIDE.relaxation, 'relaxation guidée');
  return n; }'''
with sync_playwright() as p:
    browser = p.chromium.launch(args=['--no-sandbox'])
    for lang in ['fr', 'en']:
        for theme in ['light', 'dark']:
            c = browser.new_context(**p.devices['Pixel 7'], color_scheme=theme, reduced_motion='reduce', service_workers='block')
            page = c.new_page(); errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
            page.route('**/*', lambda r: r.fulfill(status=200, content_type='text/javascript', body='') if any(x in r.request.url for x in ['googleapis.com', 'gstatic.com']) else r.continue_())
            page.goto(f'http://127.0.0.1:{srv.server_port}/')
            page.evaluate('''([lang,theme]) => { localStorage.clear(); stocker('langue',lang); stocker('theme',theme==='dark'?'sombre':'clair'); stocker('guideVu', JSON.stringify(GUIDE.map(s => s[0]))); sessionStorage.setItem('guideInstall','1'); }''', [lang, theme])
            page.reload(); page.wait_for_timeout(800)
            n = page.evaluate(VERIF)
            if CAPT:
                t = f'{lang}-{theme}'
                page.evaluate("() => { vueCalme(); }"); page.wait_for_timeout(400)
                page.evaluate("() => vueK('coherence', 'Cohérence cardiaque', 'Choisis ta séance de respiration.')"); page.wait_for_timeout(400)
                page.evaluate("() => scrollTo(0, document.body.scrollHeight)"); page.wait_for_timeout(300); page.screenshot(path=str(CAPT / f'1-liste-{t}.png'))
                page.evaluate("() => ouvrirRoutine('coherApneeCO2')"); page.wait_for_timeout(400); page.screenshot(path=str(CAPT / f'2-apercu-{t}.png'))
                page.evaluate("() => { demarrerSouf(); souf.i = souf.plan.findIndex(q => q.hold); afficherSouf(); pause(); }"); page.wait_for_timeout(600); page.screenshot(path=str(CAPT / f'3-apnee-{t}.png'))
                page.evaluate("() => { souf.i++; afficherSouf(); }"); page.wait_for_timeout(600); page.screenshot(path=str(CAPT / f'4-recup-{t}.png'))
                page.evaluate("() => { terminer(); ouvrirRoutine('coherApneeTest'); demarrerSouf(); souf.i = souf.plan.findIndex(q => q.max); afficherSouf(); for (let s = 0; s < 42; s++) ticSouf(); pause(); }"); page.wait_for_timeout(600); page.screenshot(path=str(CAPT / f'5-test-{t}.png'))
            assert not errors, errors
            print(f'✓ {lang} {theme} : {n} séances vérifiées')
            c.close()
    browser.close()
