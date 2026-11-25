// [검증 도구] 지구구조단의 액션 게임(ARC.run 으로 도는 것)을 자동으로 해 보고 화면을 캡처한다.
// 준비: 저장소 루트에서 python3 -m http.server 8765
// 실행: node scripts/dev/er-arcade.js <catch|belt|chase> <저장할 경로 앞머리> [폭=412] [높이=780] [난이도 0~2=1] [bot|idle|bad]
//   bot = 잘하는 자동 조작(끝까지 가서 별 수 출력), idle = 가만히 두기, bad = 일부러 틀리기(실패 화면 확인)
//   예: mkdir -p /tmp/er && node scripts/dev/er-arcade.js catch /tmp/er/c 412 780 1 bot
// 마지막 줄에 결과(별·다친 횟수·오류)가 나온다. 장면 값은 #game._dbg.s (게임마다 _s getter) 로 읽는다.
const { chromium } = require('playwright');
const [,, game = 'catch', out = '/tmp/er-arc', w = '412', h = '780', diff = '1', mode = 'bot'] = process.argv;
const WHERE = { catch: [1, 0], belt: [2, 2], chase: [4, 2] };
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
  };
  while (Date.now() - t0 < 150000) {
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
