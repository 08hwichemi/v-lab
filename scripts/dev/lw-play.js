// [검증 도구] '이미 사라진 세계'를 진짜 입력(터치 탭·끌기)으로 처음부터 엔딩까지 완주한다.
//   · 지도에서 구역을 '한 번 톡' 눌렀을 때 대사가 저절로 넘어가지 않는지(지구구조단에서 겪은 문제)도 같이 본다.
//   · 구간별 걸린 시간·별·실수 수, 페이지 오류를 찍는다. 마지막 줄이 'FAIL 0' 이면 통과.
// 준비: 저장소 루트에서 python3 -m http.server 8765
// 실행: node scripts/dev/lw-play.js [난이도 0|1|2 = 1] [폭=412] [높이=780]
//   게임 속 상태는 window._dbg 와 각 장면의 _s (검증용 getter)로 읽고, 조작은 전부 실제 입력으로 한다.
const { chromium } = require('playwright');
const [,, diff = '1', w = '412', h = '780'] = process.argv;
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = [], fails = [], rows = [];
  p.on('pageerror', e => errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('C ' + m.text()); });
  await p.goto('http://127.0.0.1:8765/labs/environment/lost-world.html'); await sleep(2500);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await sleep(2500);
  const st = () => p.evaluate(() => { const r = document.getElementById('cv').getBoundingClientRect(); return { ox: r.left, oy: r.top, W: _dbg.W, H: _dbg.H }; });
  const S = (fn, arg) => p.evaluate(fn, arg);
  const tap = async (x, y) => { const o = await st(); await p.touchscreen.tap(o.ox + x, o.oy + y); };
  const talking = () => S(() => !!_dbg.TALK);
  // 대사를 끝까지 넘긴다 (잠금이 풀린 뒤에 진짜 탭)
  const talkThrough = async (max = 20) => { for (let i = 0; i < max; i++) { if (!(await talking())) { await sleep(250); if (!(await talking())) return; } await p.waitForSelector('#talk:not(.wait)', { timeout: 5000 }).catch(() => {}); await p.locator('#talk').tap().catch(() => {}); await sleep(120); } };
  const waitFor = async (fn, ms = 20000, arg) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(fn, arg)) return true; await sleep(100); } return false; };

  // ---- 시작 화면: 새로 시작 ----
  await p.locator('#bNew').tap(); await sleep(400);
  await p.locator('#nick').fill('검증'); await p.locator(`#shB .diff[data-d="${diff}"]`).tap(); await p.locator('#nGo').tap(); await sleep(900);
  if (!(await talking())) fails.push('시작 안내 대사가 안 뜸');
  await talkThrough();

  const play = {
    async pollinate() { const o = await st(); await p.mouse.move(o.ox + o.W / 2, o.oy + o.H * .6); await p.mouse.down();
      for (let i = 0; i < 900; i++) { const s = await S(() => { const q = _dbg.scene._s; return q && { done: q.done, bx: q.bx, by: q.by, buds: q.buds.filter(b => !b.open).map(b => [b.x, b.y]), clouds: q.clouds.map(c => [c.x, c.y, c.r, c.vx]) }; });
        if (!s || s.done) break; let best = null, bd = 1e9;
        for (const [x, y] of s.buds) { const danger = s.clouds.some(c => Math.hypot(c[0] + c[3] * .5 - x, c[1] - (y - 18)) < c[2] + 46); const d = Math.hypot(x - s.bx, y - 6 - s.by) + (danger ? 600 : 0); if (d < bd) { bd = d; best = [x, y - 6]; } }
        let [tx, ty] = best || [s.bx, s.by];
        for (const c of s.clouds) { if (Math.hypot(c[0] - s.bx, c[1] - (s.by - 15)) < c[2] + 60) { ty = c[1] > s.by - 15 ? Math.max(o.H * .3, c[1] - c[2] - 90) : Math.min(o.H * .95, c[1] + c[2] + 90); tx = s.bx; } }
        await p.mouse.move(o.ox + tx, o.oy + ty); await sleep(60); }
      await p.mouse.up(); },
    // 곰 달리기: 점프 = 왼쪽 탭, 2단 점프 = 공중에서 한 번 더, 미끄러지기 = 오른쪽을 누르고 있기(마우스 누름으로 흉내).
    //   장면의 _s 에서 앞의 장애물(objs: 올무·덫·통나무·바위·차·굴러오는 통나무·수로 pit·낮은 가지 branch)·발판(plats)·꿀과 큰 곰 기운(items)을 읽어 판단한다.
    //   하트가 다 떨어지면 '다시 도전'을 눌러 이어 간다
    async snare() {
    const G = 26, J = 9.2, BW = .27;
    const o = await p.evaluate(() => { const r = document.getElementById('cv').getBoundingClientRect(); return { ox: r.left, oy: r.top, W: _dbg.W, H: _dbg.H }; });
    const jx = o.ox + o.W * .2, sxp = o.ox + o.W * .8, yy = o.oy + o.H * .5;
    let sliding = false, dbl = false, lastJump = 0, deaths = 0;
    for (;;) {
      const s = await p.evaluate(() => _dbg.scene && _dbg.scene._s && 'bear' in _dbg.scene._s ? _dbg.scene._s : null);
      if (!s || s.done) break;
      if (s.dead) { deaths++; await p.waitForSelector('#shB:not(.locked-ui) #fAgain', { timeout: 6000 }).catch(() => {}); await p.locator('#fAgain').tap().catch(() => {}); await sleep(600); if (deaths > 3) break; sliding = false; dbl = false; continue; }
      if (s.ready) { await sleep(40); continue; }
      const v = s.v, b = s.bear, now = Date.now();
      const onPlat = s.plats.find(q => q.d0 <= .3 && q.d1 >= -.3 && Math.abs(b.y - q.h) < .08);
      const under = x => s.plats.some(q => x >= q.d0 - .3 && x <= q.d1 + .4);
      // 미끄러지기
      const br = s.objs.find(q => q.t === 'branch' && q.dx + q.w / 2 + BW > -.05);
      const wantSlide = !!br && br.dx - br.w / 2 - BW <= v * .14 && !onPlat;
      if (wantSlide !== sliding) { sliding = wantSlide; if (sliding) { await p.mouse.move(sxp, yy); await p.mouse.down(); } else await p.mouse.up(); }
      // 점프
      let jump = false;
      if (dbl && !b.onG && b.airN === 1 && b.yv <= 1.2) { jump = true; dbl = false; }
      else if (b.onG && !wantSlide && now - lastJump > 120) {
        const np = s.plats.find(q => q.h > b.y + .3 && q.h - b.y <= 1.45 && q.d0 <= 1.25 && q.d0 > -.6 && q.d1 > 2);   // 한 층 위 발판(땅→1층, 1층→2층)
        const it = (s.items || []).find(q => (q.t === 'honey' || q.t === 'paw') && q.dx > .2 && q.dx <= v * .2 + .1 && q.y > .9 && q.y - b.y < 1.7);   // 꿀·큰 곰 기운은 뛰어서 먹는다
        if (np || it) jump = true;
        else { const gs = s.objs.filter(q => q.t !== 'branch' && q.dx + q.w / 2 + BW > 0 && !(onPlat && under(q.dx))).sort((a, c) => a.dx - c.dx);
          if (gs[0]) { const f = gs[0], vr = v + (f.vx || 0); let last = f, hmax = f.h; for (const q of gs.slice(1)) { if (q.dx - q.w / 2 - (last.dx + last.w / 2) < 1.5 * v / 3.3) { last = q; hmax = Math.max(hmax, q.h); } else break; }
            const d = f.dx - f.w / 2 - BW, e = last.dx + last.w / 2 + BW, hh = hmax + .14, disc = Math.sqrt(Math.max(0, J * J - 2 * G * hh)), tUp = (J - disc) / G, avail = 2 * disc / G, need = (e - d) / vr;
            if (d / vr <= tUp + .06) { jump = true; dbl = need > avail - .07 || hmax > .9; if (dbl && d / vr > .08) { /* 2단 점프는 조금 일찍 */ } } } }
      }
      if (jump) { lastJump = now; await p.touchscreen.tap(jx, yy); }
      await sleep(10);
    }
    if (sliding) await p.mouse.up();
    },
    async tide() { for (let i = 0; i < 900; i++) { const s = await S(() => { const q = _dbg.scene._s; return q && { done: q.done, tr: q.tr.filter(t => !t.c).map(t => [t.x, t.y]) }; }); if (!s || s.done) break; const o = await st();
        const t = s.tr.filter(a => a[0] < o.W - 10).sort((a, c) => a[0] - c[0])[0];
        if (t) { await p.mouse.move(o.ox + t[0] + 14, o.oy + t[1] - 26); await p.mouse.down(); await p.mouse.move(o.ox + t[0] - 22, o.oy + t[1] + 26, { steps: 3 }); await p.mouse.up(); } await sleep(70); } },
    async swim() { const o = await st(); await p.mouse.move(o.ox + o.W / 2, o.oy + o.H * .6); await p.mouse.down();
      for (let i = 0; i < 1500; i++) { if (await talking()) { await p.mouse.up(); await talkThrough(); await p.mouse.down(); }
        const s = await S(() => { const q = _dbg.scene._s; return q && { done: q.done, px: q.px, ty: q.ty, obj: q.obj.map(o => [o.k, o.x, o.y]) }; }); if (!s || s.done) break;
        const ahead = s.obj.filter(a => a[2] < s.ty + 10).sort((a, c) => c[2] - a[2]); let tx = s.px; const j = ahead.find(a => a[0] === 'jelly'); if (j) tx = j[1];
        for (const a of ahead) if (a[0] === 'bag' && s.ty - a[2] < 190 && Math.abs(a[1] - tx) < 58) tx = a[1] + (tx >= a[1] ? 64 : -64);
        tx = Math.max(20, Math.min(o.W - 20, tx)); await p.mouse.move(o.ox + tx, o.oy + o.H * .6); await sleep(50); }
      await p.mouse.up(); },
    async floe() { for (let i = 0; i < 2500; i++) { const s = await S(() => { const q = _dbg.scene._s; return q && { done: q.done, top: q.top, bear: q.bear, rows: q.rows.map(r => ({ dir: r.dir, sp: r.sp, fl: r.fl.map(f => [f.x, f.w]) })) }; }); if (!s || s.done) break; const o = await st();
        const br = s.bear; if (!(br.j > 0) && !br.swim && br.r < s.top) { const nr = br.r + 1; let ok = nr === s.top;
          if (!ok) { const row = s.rows[nr - 1], cur = br.r > 0 ? s.rows[br.r - 1] : null; ok = row.fl.some(f => Math.abs(f[0] + row.dir * row.sp * .45 - br.x) < f[1] / 2 - 16); }
          if (ok) await tap(o.W / 2, o.H * .5); }
        await sleep(45); } },
  };
  const zones = await S(() => _dbg.ZONES.map(z => ({ id: z.id, name: z.name, game: z.game, pos: z.pos })));
  for (const z of zones) {
    const row = { 구역: z.name }; let t0 = Date.now(); const o = await st();
    // (1) 지도에서 한 번 톡 — 대사가 그 탭으로 넘어가면 안 된다
    await waitFor(() => _dbg.scene && _dbg.scene._map && !_dbg.TALK, 15000); await sleep(600);
    await tap(z.pos[0] * o.W, z.pos[1] * o.H); await sleep(750);
    const tk = await S(() => _dbg.TALK ? _dbg.TALK.i : -1);
    if (tk !== 0) fails.push(`${z.name}: 지도 탭 뒤 첫 대사가 남아 있지 않음 (i=${tk})`);
    await talkThrough();
    // (2) 기억의 조각
    t0 = Date.now();
    for (let i = 0; i < 600; i++) { const s = await S(() => { const q = _dbg.scene._s; return q && q.shd ? { done: q.done, shd: q.shd.filter(s => s.life > .3).map(s => [s.x, s.y]) } : null; }); if (!s || s.done) break; if (s.shd[0]) await tap(s.shd[0][0], s.shd[0][1]); await sleep(110); }
    row.기억 = ((Date.now() - t0) / 1000).toFixed(0) + 's'; await sleep(1100); await talkThrough();
    // (3) 구조 놀이
    if (!(await waitFor(() => _dbg.scene && _dbg.scene._s && 'miss' in _dbg.scene._s, 8000))) { fails.push(z.name + ': 구조 놀이로 안 넘어감 — ' + await S(() => JSON.stringify({ talk: !!_dbg.TALK, map: !!_dbg.scene._map, s: _dbg.scene._s ? Object.keys(_dbg.scene._s) : null, st: _dbg.S.z }))); break; }
    t0 = Date.now(); await sleep(300);
    await play[z.game](); row.구조 = ((Date.now() - t0) / 1000).toFixed(0) + 's';
    if (!(await waitFor(() => !document.getElementById('sheet').hidden && document.getElementById('rGo'), 6000))) fails.push(z.name + ': 결과 창이 안 뜸');
    row.실수 = await S(() => _dbg.scene._s.miss); row.별 = await S(z => _dbg.S.z[z].star, z.id);
    await p.waitForSelector('#shB:not(.locked-ui)', { timeout: 5000 }).catch(() => {}); await p.locator('#rGo').tap(); await sleep(400); await talkThrough();
    // (4) 생명의 온실
    if (!(await waitFor(() => _dbg.scene && _dbg.scene._hab, 6000))) { fails.push(z.name + ': 온실로 안 넘어감'); break; }
    t0 = Date.now(); let lastPet = 0;
    for (let i = 0; i < 4000; i++) { if (await talking()) break; const s = await S(() => _dbg.scene._hab ? _dbg.scene._s : null); if (!s || s.grown) break;
      if (s.hz[0]) await tap(s.hz[0].x, s.hz[0].y);
      else { const sp = s.spots.find(q => !q.on); const src = s.src.find(q => q.type === 'level' && q.v < 66); const rg = s.src.find(q => q.type === 'range');
        if (sp && s.seeds > 0) await tap(sp.x, sp.y);
        else if (src) await tap(src.x, src.y);
        else if (rg && ((rg.v > 29.7 && !s.h.shade) || (rg.v < 28.3 && s.h.shade))) await tap(rg.x, rg.y);
        else if (Date.now() - lastPet > 1100) { lastPet = Date.now(); await tap(s.an.x, s.an.y); } }
      await sleep(140); }
    row.온실 = ((Date.now() - t0) / 1000).toFixed(0) + 's';
    await waitFor(() => !!_dbg.TALK, 4000); await talkThrough();
    await p.waitForSelector('#act:not([hidden]):not([disabled])', { timeout: 6000 }).catch(() => fails.push(z.name + ': 자연으로 보내기 버튼이 안 뜸'));
    { const bb = await p.locator('#act').boundingBox(); if (bb) await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); }   // 버튼이 위아래로 흔들려서 locator.tap() 은 '멈출 때까지' 기다리다 실패한다
    await sleep(600);
    if (await S(z => _dbg.S.z[z].st, z.id) !== 4) fails.push(z.name + ': 보내기 뒤 상태가 4 가 아님');
    await waitFor(() => !!_dbg.TALK, 7000); await talkThrough(); rows.push(row);
  }
  // ---- 엔딩 ----
  const ended = await waitFor(() => { if (_dbg.TALK) return false; return _dbg.S && _dbg.S.ended; }, 1, 0) || (async () => { for (let i = 0; i < 300; i++) { if (await talking()) await talkThrough(); if (await S(() => _dbg.S && _dbg.S.ended)) return true; await sleep(200); } return false; })();
  if (!(await ended)) fails.push('엔딩이 끝나지 않음');
  await p.waitForSelector('#tBtns:not(.locked-ui) #bEnd', { timeout: 5000 }).catch(() => fails.push('엔딩의 지도로 돌아가기 버튼이 안 뜸'));
  if (process.env.LW_SHOT) await p.screenshot({ path: process.env.LW_SHOT + '/lw-ending.png' }).catch(() => {});   // LW_SHOT=폴더 를 주면 엔딩 화면을 남긴다
  // ---- 다시 열기: 시작 화면에 완주 기록이 남아 있어야 한다 ----
  await p.reload(); await sleep(2500);
  const slot = await S(() => (document.querySelector('.slot .sinfo') || {}).textContent || ''); if (!/완주/.test(slot)) fails.push('다시 열었을 때 완주 기록이 안 보임: ' + slot);
  console.table(rows); console.log('별 합계', rows.reduce((a, r) => a + (r.별 || 0), 0), '/ 15');
  if (errs.length) console.log(errs.join('\n')); fails.forEach(f => console.log('  - ' + f));
  console.log('FAIL', fails.length + errs.length);
  await b.close(); process.exit(fails.length + errs.length ? 1 : 0);
})();
