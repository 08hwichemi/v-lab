// [검증 도구] '이미 사라진 세계'를 진짜 입력(터치 탭·끌기)으로 처음부터 엔딩까지 완주한다.
//   · 지도에서 구역을 '한 번 톡' 눌렀을 때 대사가 저절로 넘어가지 않는지(지구구조단에서 겪은 문제)도 같이 본다.
//   · 구간별 걸린 시간·별·실수 수, 페이지 오류를 찍는다. 마지막 줄이 'FAIL 0' 이면 통과. (구조 놀이가 길어져 한 번에 12분쯤)
// 준비: 저장소 루트에서 python3 -m http.server 8765
// 실행: node scripts/dev/lw-play.js [난이도 0|1|2 = 1] [폭=412] [높이=780]
//   놀이 하나만(1~2분): node scripts/dev/lw-play.js 1 412 780 snare   ← pollinate|snare|tide|swim|floe · 완주 대신 그 구조 놀이만 돌리고 결과를 찍는다
//   게임 속 상태는 window._dbg 와 각 장면의 _s (검증용 getter)로 읽고, 조작은 전부 실제 입력으로 한다.
const { chromium } = require('playwright');
const [,, diff = '1', w = '412', h = '780', only = ''] = process.argv;
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

  // ---- 구조 놀이 자동 조작 (진짜 입력). 장면의 _s(검증용 getter)에서 상태를 읽어 판단한다. 하트가 다 떨어지면 '다시 도전'을 눌러 이어 간다 ----
  const B = {};
  const geom = p => p.evaluate(() => { const r = document.getElementById('cv').getBoundingClientRect(); return { ox: r.left, oy: r.top, W: _dbg.W, H: _dbg.H }; });
  const state = p => p.evaluate(() => _dbg.scene && _dbg.scene._s && 'miss' in _dbg.scene._s ? _dbg.scene._s : null);
  // 하트가 다 떨어졌으면 '다시 도전'을 누른다. 세 번 넘게 실패하면 그만둔다
  async function retry(p, st) { st.deaths = (st.deaths || 0) + 1; await p.waitForSelector('#shB:not(.locked-ui) #fAgain', { timeout: 6000 }).catch(() => {}); await p.locator('#fAgain').tap().catch(() => {}); await sleep(700); return st.deaths <= 3; }

  // 바다거북: 마우스를 누른 채 좌우로 끈다. 그물 틈 > 배 피하기 > 가까운 해파리(비닐 옆은 피함)
  B.swim = async (p, onTick) => { const o = await geom(p), st = {}; const yy = o.oy + o.H * .6; await p.mouse.move(o.ox + o.W / 2, yy); await p.mouse.down();
    for (;;) { const s = await state(p); if (!s || s.done) break; if (s.dead) { await p.mouse.up(); if (!(await retry(p, st))) break; await p.mouse.down(); continue; } if (onTick) await onTick(s);
      if (s.ready) { await sleep(40); continue; }
      const bags = s.objs.filter(q => q.t === 'bag'), boats = s.objs.filter(q => q.t === 'boat'), hw = s.u * .5 / s.W; let tx = s.px;
      const safe = (x, dd) => !bags.some(b => Math.abs(b.x - x) < hw * 2.3 && Math.abs(b.dd - dd) < 1.3) && !boats.some(b => Math.abs(b.x - x) < hw * 2.6 && b.dd - dd < 6 && b.dd > -1.5);
      const net = s.nets.filter(n => n.dd > -.2).sort((a, b) => a.dd - b.dd)[0];
      const food = s.objs.filter(q => (q.t === 'jelly' || q.t === 'gold' || q.t === 'ring' || q.t === 'crab') && q.dd > .2 && q.dd < 6.5 && safe(q.x, q.dd) && (!net || q.dd < net.dd - .4 || Math.abs(q.x - net.gx) < net.gw / 2 - hw)).sort((a, b) => (Math.abs(a.x - s.px) * 9 + a.dd) - (Math.abs(b.x - s.px) * 9 + b.dd))[0];
      if (food) tx = food.x;
      if (net && net.dd < 4.2 && (!food || Math.abs(tx - net.gx) > net.gw / 2 - hw * 1.2 || net.dd < 1.6)) tx = net.gx;
      for (const b of [...bags.filter(b => b.dd > -.3 && b.dd < 1.9), ...boats.filter(b => b.dd > -1.6 && b.dd < 5.5)]) if (Math.abs(b.x - tx) < hw * 2.4) tx = b.x + (s.px >= b.x ? 1 : -1) * hw * (b.t === 'boat' ? 3.6 : 2.9);
      if (net && net.dd < 1.2) tx = Math.max(net.gx - net.gw / 2 + hw, Math.min(net.gx + net.gw / 2 - hw, tx));
      tx -= s.cur * .06;                                   // 해류에 밀리는 만큼 미리 버틴다
      await p.mouse.move(o.ox + Math.max(.08, Math.min(.92, tx)) * o.W, yy); await sleep(25); }
    await p.mouse.up(); };

  // 북극곰: 다음 줄의 얼음이 착지 순간 발밑에 올 때 탭. 기름 얼음·쇄빙선은 피하고, 서 있는 얼음이 녹아 가면 서두른다
  B.floe = async (p, onTick) => { const o = await geom(p), st = {};
    for (;;) { const s = await state(p); if (!s || s.done) break; if (s.dead) { if (!(await retry(p, st))) break; continue; } if (onTick) await onTick(s);
      if (s.ready || s.bear.state !== 'on' || !s.next) { await sleep(30); continue; }
      const n = s.next, b = s.bear; let go = false;
      if (n.type === 'safe') go = true;
      else { const urgent = b.melt > .5 || b.idle > s.IDLE * .75 || b.x < 70 || b.x > s.W - 70, T = s.JT + .04;
        const shipOk = !n.ship || (!n.ship.on && n.ship.cd > .8) || (n.ship.on && Math.abs(n.ship.x + n.ship.vx * T - b.x) > n.ship.w / 2 + 70 && Math.sign(n.ship.vx) * (b.x - n.ship.x) < 0);
        const f = n.fl.find(f => !f.gone && (!f.oil || (urgent && b.melt > .75)) && (f.melt == null || f.melt < .5) && Math.abs(f.x + n.dir * n.sp * T - b.x) < f.w / 2 - (urgent ? 10 : 18));
        go = !!f && (shipOk || b.melt > .8); }
      if (go) { await p.touchscreen.tap(o.ox + o.W / 2, o.oy + o.H * .5); await sleep(s.JT * 1000 + 70); } else await sleep(18); } };

  // 꿀벌: 마우스를 누른 채 끈다. 같은 종류 꽃을 먼저, 위험한 것(구름·드론·말벌) 근처는 피하고 가까우면 달아난다
  B.pollinate = async (p, onTick) => { const o = await geom(p), st = {}; await p.mouse.move(o.ox + o.W * .3, o.oy + o.H * .55); await p.mouse.down();
    for (;;) { const s = await state(p); if (!s || s.done) break; if (s.dead) { await p.mouse.up(); if (!(await retry(p, st))) break; await p.mouse.down(); continue; } if (onTick) await onTick(s);
      if (s.ready) { await sleep(40); continue; }
      const b = s.bee, u = s.u, near = (x, y, pad) => s.haz.some(h => Math.hypot(h.x - x, h.y - y) < h.r + pad);
      let tx = b.x, ty = b.y; const danger = s.haz.filter(h => Math.hypot(h.x - b.x, h.y - b.y) < h.r + u * (h.t === 'hornet' ? 2.6 : 1.3));
      if (danger.length && !s.power) { let ax = 0, ay = 0; for (const h of danger) { const d = Math.hypot(b.x - h.x, b.y - h.y) || 1; ax += (b.x - h.x) / d; ay += (b.y - h.y) / d; } const n = Math.hypot(ax, ay) || 1; tx = b.x + ax / n * u * 3; ty = b.y + ay / n * u * 3; if (tx < u || tx > s.W - u) ty += (b.y < s.H * .55 ? -1 : 1) * u * 2; }
      else { const c = [...s.items.map(q => ({ ...q, bonus: u * 4 })), ...s.flowers.map(q => ({ ...q, bonus: q.c === s.pc ? u * 3.2 : 0 }))].filter(q => q.x > u * .6 && q.x < s.W - u * .5 && (s.power || !near(q.x, q.y, u * .9)))
          .sort((a, c2) => (Math.hypot(a.x - b.x, a.y - b.y) - a.bonus) - (Math.hypot(c2.x - b.x, c2.y - b.y) - c2.bonus))[0];
        if (c) { tx = c.x - s.v * u * .1; ty = c.y; } else { tx = s.W * .35; ty = s.H * .55; } }
      await p.mouse.move(o.ox + Math.max(u * .5, Math.min(s.W - u * .5, tx)), o.oy + Math.max(s.H * .2, Math.min(s.H * .86, ty))); await sleep(25); }
    await p.mouse.up(); };

  // 저어새: 선에 가장 가까운 쓰레기부터 마우스로 그어 낸다. 선분 가까이에 먹이가 있으면 방향을 바꾸거나 다음 것으로
  B.tide = async (p, onTick) => { const o = await geom(p), st = {};
    const segFree = (s, a, b) => !s.food.some(f => { const fx = f.x + f.vx * .06, dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy || 1; let t = ((fx - a[0]) * dx + (f.y - a[1]) * dy) / L; t = Math.max(0, Math.min(1, t)); return Math.hypot(fx - (a[0] + t * dx), f.y - (a[1] + t * dy)) < 34; });
    for (;;) { const s = await state(p); if (!s || s.done) break; if (s.dead) { if (!(await retry(p, st))) break; continue; } if (onTick) await onTick(s);
      if (s.ready) { await sleep(40); continue; }
      const targets = [...(s.reed && s.items.length >= 3 ? [{ ...s.reed, r: 24, vx: 0 }] : []), ...s.items.filter(q => q.x < s.W - 6).sort((a, b) => a.x - b.x), ...(s.boss && s.boss.x - s.boss.r < s.W - 10 ? [{ ...s.boss, r: s.boss.r * .5, vx: 0, x: Math.min(s.boss.x, s.W - 20) }] : [])];
      let done = false;
      for (const t of targets) { const x = t.x + (t.vx || 0) * .05, pad = t.r + 12; const cands = [[[x, t.y - pad], [x, t.y + pad]], [[x - pad, t.y], [x + pad, t.y]], [[x - pad * .7, t.y - pad * .7], [x + pad * .7, t.y + pad * .7]]];
        const c = cands.find(c => segFree(s, c[0], c[1])); if (!c) continue;
        await p.mouse.move(o.ox + c[0][0], o.oy + c[0][1]); await p.mouse.down(); await p.mouse.move(o.ox + c[1][0], o.oy + c[1][1], { steps: 2 }); await p.mouse.up(); done = true; break; }
      await sleep(done ? 35 : 50); } };
  // 곰 달리기: 점프 = 왼쪽 탭, 2단 점프 = 공중에서 한 번 더, 미끄러지기 = 오른쪽을 누르고 있기(마우스 누름으로 흉내)
  B.snare = async (p, onTick) => {
    const G = 26, J = 9.2, BW = .27;
    const o = await p.evaluate(() => { const r = document.getElementById('cv').getBoundingClientRect(); return { ox: r.left, oy: r.top, W: _dbg.W, H: _dbg.H }; });
    const jx = o.ox + o.W * .2, sxp = o.ox + o.W * .8, yy = o.oy + o.H * .5;
    let sliding = false, dbl = false, lastJump = 0, n = 0, deaths = 0;
    for (;;) {
      const s = await p.evaluate(() => _dbg.scene && _dbg.scene._s && 'bear' in _dbg.scene._s ? _dbg.scene._s : null);
      if (!s || s.done) break;
      if (s.dead) { deaths++; if (sliding) { await p.mouse.up(); sliding = false; } await p.waitForSelector('#shB:not(.locked-ui) #fAgain', { timeout: 6000 }).catch(() => {}); await p.locator('#fAgain').tap().catch(() => {}); await sleep(700); if (deaths > 3) break; dbl = false; continue; }
      if (onTick) await onTick(s, n++);
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
  };
  const play = { pollinate: () => B.pollinate(p), snare: () => B.snare(p), tide: () => B.tide(p), swim: () => B.swim(p), floe: () => B.floe(p) };
  const zones = await S(() => _dbg.ZONES.map(z => ({ id: z.id, name: z.name, game: z.game, pos: z.pos })));
  if (only) {   // ---- 놀이 하나만 ----
    const z = zones.find(q => q.game === only || q.id === only); if (!z) { console.log('없는 놀이:', only, '· 쓸 수 있는 이름:', zones.map(q => q.game).join(' ')); await b.close(); process.exit(1); }
    await S(([id, g]) => { const s = _dbg.S; s.z[id].st = 2; s.z[id].mem = 1; _dbg.go(_dbg.GAMES[g](id)); }, [z.id, z.game]);
    await waitFor(() => _dbg.scene && _dbg.scene._s && 'miss' in _dbg.scene._s, 8000); const t0 = Date.now(); await sleep(300);
    await play[z.game](); const sec = ((Date.now() - t0) / 1000).toFixed(1);
    const r = await S(() => { const s = _dbg.scene._s; return s && { done: s.done, dead: s.dead, miss: s.miss }; });
    await sleep(1600); const res = await S(() => (document.querySelector('#shB .result') || {}).innerText || '');
    if (process.env.LW_SHOT) await p.screenshot({ path: process.env.LW_SHOT + '/lw-' + z.game + '.png' }).catch(() => {});
    console.log(`${z.name}(${z.game}) 난이도 ${diff} ${w}x${h}: ${sec}s`, JSON.stringify(r), '|', res.replace(/\s+/g, ' ').slice(0, 120));
    if (errs.length) console.log(errs.join('\n')); console.log('FAIL', errs.length + (r && r.done ? 0 : 1));
    await b.close(); process.exit(errs.length || !(r && r.done) ? 1 : 0);
  }
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
