// [검증 도구] 지구구조단의 액션 게임(ARC.run 으로 도는 것)을 자동으로 해 보고 화면을 캡처한다.
// 준비: 저장소 루트에서 python3 -m http.server 8765
// 게임 이름: catch belt chase cross drop lamps coral tide edna summit river dust wind plant methane farm dig shadow (무전 퀴즈는 정답을 진짜 클릭으로 누른다 · bad 는 오답)
// 실행: node scripts/dev/er-arcade.js <게임 이름> <저장할 경로 앞머리> [폭=412] [높이=780] [난이도 0~2=1] [bot|idle|bad]
//   bot = 잘하는 자동 조작(끝까지 가서 별 수 출력), idle = 가만히 두기, bad = 일부러 틀리기(실패 화면 확인)
//   예: mkdir -p /tmp/er && node scripts/dev/er-arcade.js catch /tmp/er/c 412 780 1 bot
// 마지막 줄에 결과(별·다친 횟수·오류)가 나온다. 장면 값은 #game._dbg.s (게임마다 _s getter) 로 읽는다.
const { chromium } = require('playwright');
const [,, game = 'catch', out = '/tmp/er-arc', w = '412', h = '780', diff = '1', mode = 'bot'] = process.argv;
const WHERE = { catch: [1, 0], belt: [2, 2], chase: [4, 2], river: [1, 1], dust: [2, 0], wind: [2, 1], plant: [3, 0], methane: [3, 1], farm: [4, 1], dig: [5, 1], shadow: [5, 2], cross: [0, 0], drop: [0, 1], lamps: [0, 2], coral: [1, 2], tide: [3, 2], edna: [4, 0], summit: [5, 0] };
(async () => {
  const b = await chromium.launch();
  const touch = +w < 700;
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PE ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('C ' + m.text()); });
  await p.goto('http://127.0.0.1:8765/lab.html?id=earth-rescue-corps'); await p.waitForTimeout(3000);
  const fr = () => p.frames().find(f => /labs\/environment/.test(f.url()));
  await fr().evaluate(d => {
    const s = fresh(); s.name = '녹색별'; s.diff = d; s.promoted = 5; s.read = { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 };
    ISLANDS.forEach((I, i) => I.missions.forEach((m, j) => { if (i < 5) s.stars[i + '-' + j] = 2; }));
    SAVES.slots = [s]; SAVES.cur = 0; S = s; persist();
  }, +diff);
  await p.reload(); await p.waitForTimeout(3000);
  const ev = (f, a) => fr().evaluate(f, a);
  const [mi, mj] = WHERE[game];
  await ev(([i, j]) => { SAVES.cur = 0; S = SAVES.slots[0]; S.mute = true; play(i, j); }, [mi, mj]);
  await p.waitForTimeout(700);
  let n = 0; const shot = async tag => p.screenshot({ path: `${out}-${String(n++).padStart(2, '0')}-${tag}.png` });
  const sh = await ev(() => ({ sh: document.documentElement.scrollHeight, vh: innerHeight, arc: (() => { const r = document.querySelector('#arc').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; })() }));
  console.log('배치:', JSON.stringify(sh), sh.sh > sh.vh + 2 ? '★스크롤' : '');
  await shot('cover');
  await ev(() => document.querySelector('#game')._dbg.start());
  const fe = await fr().frameElement();
  const base = async () => { const fb = await fe.boundingBox(); const r = await ev(() => { const r = document.querySelector('#acv').getBoundingClientRect(); return [r.left, r.top]; }); return [fb.x + r[0], fb.y + r[1]]; };
  const [ox, oy] = await base();
  await fe.focus().catch(() => {}); await ev(() => window.focus());   // 키 입력이 게임(iframe)으로 가게
  const t0 = Date.now(); let lastShot = 0, res = null;
  const BOT = {
    // 가까운 플라스틱으로 가되 생물에게서 멀어진다. 그물이 차면 바지선으로.
    catch: async s => {
      const { u, bx, by, objs, load, CAP, nodes, n } = s; let tx = bx, ty = by, best = 1e9;
      const ani = objs.filter(o => ['fish', 'jel', 'tur', 'dol'].includes(o.k) && !o.free);
      const barge = objs.find(o => o.k === 'barge' && o.y > 0);
      if (barge && load >= 4) { tx = barge.x + (barge.x < 100 ? u : -u); ty = barge.y; }
      else for (const o of objs) { if ((o.k !== 'pl' && o.k !== 'gnet' && o.k !== 'mag' && o.k !== 'buoy') || o.y < 20 || o.y > by + 3 * u) continue; if (ani.some(a => Math.hypot(a.x - o.x, a.y - o.y) < 1.5 * u)) continue; const d = Math.hypot(o.x - bx, (o.y - by) * 1.3); if (d < best) { best = d; tx = o.x; ty = o.y + u * .6; } }
      // 피하기: 수거선과 그물 마디에서 가까운 생물의 반대쪽으로
      let ax = 0, ay = 0;
      for (const o of ani) { const pts = [[bx, by]].concat(nodes.slice(1, n + 1).filter((_, i) => i % 3 === 0).map(q => [q.x, q.y])); for (const [qx, qy] of pts) { const dx = qx - o.x, dy = qy - (o.y + (o.k === 'dol' ? 0 : u)), d = Math.hypot(dx, dy); const R = (o.k === 'dol' ? 3 : 2.3) * u; if (o.k === 'dol' ? Math.abs(dx) < 1.3 * u : d < R) { ax += (dx >= 0 ? 1 : -1) * (o.k === 'dol' ? 3 : (R - d) / R * 2.5); if (o.k !== 'dol') ay += (dy >= 0 ? 1 : -1) * (R - d) / R; } } }
      if (ax || ay) { tx = bx + ax * 1.6 * u; ty = by + ay * 1.2 * u; }
      await p.mouse.move(ox + tx, oy + ty, { steps: 2 });
    },
    belt: async s => { if (!s.front) return; const b = mode === 'bad' ? (s.front.b === 'pl' ? 'can' : 'pl') : s.front.b; if (s.ready) await p.keyboard.press(String(s.bins.indexOf(b) + 1)); },
    chase: async s => { const want = mode === 'bad' ? s.lane : s.safe; if (want < s.lane) await p.keyboard.press('ArrowLeft'); else if (want > s.lane) await p.keyboard.press('ArrowRight'); },
    cross: async s => { for (const c of s.go) await p.keyboard.press(String(c + 1)); },
    drop: async s => { if (s.tap) await p.keyboard.press(' '); },
    lamps: async s => { const q = mode === 'bad' ? s.decoy : s.hot; if (q) await p.mouse.click(ox + q.x, oy + q.y); },
    coral: async s => { const j = s.job; if (!j) return; await p.mouse.move(ox + j.fx, oy + j.fy); await p.mouse.down(); await p.mouse.move(ox + j.bx, oy + j.by, { steps: 5 }); await p.mouse.up(); },
    tide: async s => { for (const l of s.need) await p.keyboard.press(String(l + 1)); },
    edna: async s => { const q = mode === 'bad' ? s.badAt : s.tapAt; if (q) await p.mouse.click(ox + q.x, oy + q.y); },
    summit: async s => { const go = mode === 'bad' ? true : s.safe; if (go && !held) { held = true; await p.keyboard.down(' '); } else if (!go && held) { held = false; await p.keyboard.up(' '); } },
    river: async s => { const w = mode === 'bad' ? 1 - s.want : s.want; if (w !== s.lane) await p.keyboard.press(w ? 'ArrowRight' : 'ArrowLeft'); },
    dust: async s => { await p.mouse.move(ox + s.want, oy + s.y); },
    wind: async s => { if (s.busy || s.round === lastRound || mode === 'bad') return; lastRound = s.round; await p.mouse.move(ox + s.pts[0][0], oy + s.pts[0][1]); await p.mouse.down(); for (const q of s.pts) await p.mouse.move(ox + q[0], oy + q[1], { steps: 3 }); await p.mouse.up(); },
    plant: async s => { for (const i of s.tap) await p.keyboard.press(String(i + 1)); },
    methane: async s => { await p.mouse.move(ox + s.want, oy + s.y); },
    farm: async s => { if (s.pest) await p.mouse.click(ox + s.pest.x, oy + s.pest.y); else if (mode === 'bad') await p.keyboard.press(' '); else await ev(() => { const d = document.querySelector('#game')._dbg; if (d.s.tap) d.sc.key(' ', true); }); },
    dig: async s => { if (s.hold) { if (held) { held = false; await p.mouse.up(); } return; } const a = Date.now() / 90, r = s.R * (.15 + .85 * ((Date.now() / 700) % 1)); await p.mouse.move(ox + s.fx + Math.cos(a) * r, oy + s.fy + Math.sin(a) * r, { steps: 3 }); if (!held) { held = true; await p.mouse.down(); } },
    shadow: async s => { await p.mouse.move(ox + s.want.x, oy + s.want.y, { steps: 2 }); },
  };
  let held = false, lastRound = -1;
  while (Date.now() - t0 < 170000) {
    const q = await ev(bad => { const m = document.querySelector('.modal.qz'); if (!m) return null; const K = document.querySelector('#game')._dbg.K, btn = m.querySelector('.mact button');
      const el = !btn.hidden ? btn : m.classList.contains('locked') ? null : [...m.querySelectorAll('.opt')].find(o => (+o.dataset.k === K.q.q.a) !== bad); if (!el) return 'wait'; const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, mode === 'bad').catch(() => null);
    const card = q ? null : await ev(() => { const b = document.querySelector('.modal:not(.qz) .mact button'); if (!b) return null; const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }).catch(() => null);
    if (card) { if (held) { held = false; await p.mouse.up(); } const fb = await fe.boundingBox(); await p.waitForTimeout(250); await p.mouse.click(fb.x + card[0], fb.y + card[1]); await p.waitForTimeout(200); continue; }
    if (q) { if (held) { held = false; await p.keyboard.up(' '); } if (q !== 'wait') { const fb = await fe.boundingBox(); await p.mouse.click(fb.x + q[0], fb.y + q[1]); } await p.waitForTimeout(200); continue; }
    const st = await ev(() => { const d = document.querySelector('#game') && document.querySelector('#game')._dbg; if (!d) return null; const K = d.K; return { done: K.done, dead: K.dead, hp: K.hp, hits: K.hits, score: K.score, best: K.best, ready: K.ready, s: d.s }; }).catch(() => null);
    if (!st) { res = 'screen changed'; break; }
    if (st.done || st.dead) { res = st; break; }
    if (mode !== 'idle' && st.ready <= 0 && st.s) await BOT[game](st.s);
    if (Date.now() - lastShot > 6000) { lastShot = Date.now(); await shot('t' + Math.round((Date.now() - t0) / 1000)); }
    await p.waitForTimeout(game === 'catch' ? 40 : 60);
  }
  if (res && res.s) { const s = res.s; delete res.s; res.t = s.t; res.got = s.got; res.tot = s.tot; res.hitLog = s.hitLog; }
  await p.waitForTimeout(1200); await shot('end');
  await p.waitForTimeout(2600); await shot('after');
  const scr = await ev(() => (document.querySelector('.bigstars') ? '별 ' + document.querySelectorAll('.bigstars .bs:not(.off)').length : document.querySelector('#game h2, #game h3') ? document.querySelector('#game h2, #game h3').textContent : '?'));
  console.log('결과:', JSON.stringify(res), '| 화면:', scr, '| 걸린 시간', Math.round((Date.now() - t0) / 1000) + '초', '| errors:', errs.length ? errs : 0);
  await b.close();
})();
