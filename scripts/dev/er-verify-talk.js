// [검증 도구] 지구구조단 '대화하기' → 퀴즈 답이 저절로 눌리지 않는지: 짧게 톡·길게 누름·연타·두 손가락을 터치로 흉내 낸다.
// 준비: 저장소 루트에서 python3 -m http.server 8765
// 실행: node scripts/dev/er-verify-talk.js [폭=412] [높이=780]   (가로 화면은 780 360)
// 맨 윗줄 '실패 0' 이면 통과. 진짜 터치(CDP)로 누르므로 evaluate 안의 .click() 과 달리 실제 동작에 가깝다.
const { chromium } = require('playwright');
const [,, w = '412', h = '780'] = process.argv;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PE ' + e.message));
  await p.goto('http://127.0.0.1:8765/lab.html?id=earth-rescue-corps'); await p.waitForTimeout(3300);
  const fr = () => p.frames().find(f => /labs\/environment/.test(f.url()));
  const ev = (f, a) => fr().evaluate(f, a);
  const cdp = await ctx.newCDPSession(p);
  await ev(() => { const s = fresh(); s.name = '녹색별'; s.promoted = 5; SAVES.slots = [s]; SAVES.cur = 0; S = s; persist(); });
  const out = []; let fails = 0;
  const ok = (name, v, extra = '') => { if (!v) fails++; out.push((v ? 'OK  ' : 'FAIL') + ' ' + name + (extra ? ' — ' + extra : '')); };
  const st = () => ev(() => { const m = document.querySelector('.modal'); return { modal: !!m, answered: !!(m && m.querySelector('.opt.right, .opt.wrong')), fb: !!(m && m.querySelector('#qfb .fb')), locked: !!(m && m.classList.contains('locked')) }; });
  const near = async (i, j) => {
    await ev(([i, j]) => { document.querySelectorAll('.modal').forEach(m => m.remove()); play(i, j); }, [i, j]); await p.waitForTimeout(800);
    await fr().tap('#fgo'); await p.waitForTimeout(500);
    for (let k = 0; k < 5; k++) {
      await ev(() => { const d = document.querySelector('#game')._dbg; const n = d.npcs.find(n => !n.got); d.P.x = n.x; d.P.y = n.y + 14; }); await p.waitForTimeout(250);
      if (/대화/.test(await ev(() => document.querySelector('#act').textContent))) return true;
    }
    return false;
  };
  const pt = async sel => { const bx = await fr().locator(sel).boundingBox(); return { x: Math.round(bx.x + bx.width / 2), y: Math.round(bx.y + bx.height / 2) }; };
  const down = pts => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts });
  const up = (pts = []) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: pts });
  const M = [0, 1];
  // A 짧게 톡
  ok('대화 버튼으로 바뀜', await near(...M));
  let a = await pt('#act');
  await down([a]); await p.waitForTimeout(70);
  ok('A 누르는 동안에는 창이 안 열림', !(await st()).modal);
  await up(); await p.waitForTimeout(350);
  let s = await st(); ok('A 짧게 톡: 손을 떼면 창이 열리고 답은 안 눌림', s.modal && !s.answered && !s.fb, JSON.stringify(s));
  const geo = await ev(() => { const r = document.querySelector('.modal .mbox').getBoundingClientRect(), o = [...document.querySelectorAll('.modal .opt')].map(x => x.getBoundingClientRect()), ab = document.querySelector('#act').getBoundingClientRect(); const cx = ab.left + ab.width / 2, cy = ab.top + ab.height / 2; return { box: [Math.round(r.top), Math.round(r.bottom)], act: [Math.round(cx), Math.round(cy)], overOpt: o.some(q => cx >= q.left && cx <= q.right && cy >= q.top && cy <= q.bottom), overBox: cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom }; });
  out.push('     창 위치 ' + JSON.stringify(geo));
  if (+w < 560) ok('A 세로 화면: 대화 버튼 자리에 보기가 겹치지 않음', !geo.overOpt, JSON.stringify(geo));
  // 잠금이 풀린 뒤 직접 고르면 눌림
  await p.waitForTimeout(1200); s = await st(); ok('A 1.2초 뒤 보기 잠금 풀림', !s.locked);
  await fr().locator('.modal .opt').first().tap(); await p.waitForTimeout(300);
  s = await st(); ok('A 직접 고른 답은 눌림', s.fb, JSON.stringify(s));
  // B 길게 눌렀다 떼기
  await near(...M); a = await pt('#act');
  await down([a]); await p.waitForTimeout(800); await up(); await p.waitForTimeout(350);
  s = await st(); ok('B 0.8초 눌렀다 뗌: 창 열림·답 안 눌림', s.modal && !s.answered && !s.fb, JSON.stringify(s));
  // C 아주 길게(2.2초)
  await near(...M); a = await pt('#act');
  await down([a]); await p.waitForTimeout(2200); const sHeld = await st(); await up(); await p.waitForTimeout(400);
  s = await st(); ok('C 2.2초 누름: 누르는 중에 열려도 떼는 순간 답 안 눌림', s.modal && !s.answered && !s.fb, `누르는 중 창 ${sHeld.modal} → ` + JSON.stringify(s));
  // D 연타 (간격을 바꿔 가며)
  for (const gap of [110, 180, 260, 340, 450, 600]) {
    await near(...M); a = await pt('#act');
    for (let k = 0; k < 9; k++) { await down([a]); await p.waitForTimeout(55); await up(); await p.waitForTimeout(gap - 55); }
    await p.waitForTimeout(300); s = await st();
    ok(`D 같은 자리 연타 9번(간격 ${gap}ms): 답 안 눌림`, !s.answered && !s.fb, JSON.stringify(s));
  }
  // E 연타를 화면 가운데(보기가 뜨는 자리)에 해도
  for (const gap of [150, 300]) {
    await near(...M); a = await pt('#act');
    await down([a]); await p.waitForTimeout(55); await up();
    const fb = await p.locator('#fr').boundingBox(); const mid = { x: Math.round(fb.x + fb.width / 2), y: Math.round(fb.y + Math.min(260, fb.height * .45)) };
    for (let k = 0; k < 5; k++) { await p.waitForTimeout(gap - 55); await down([mid]); await p.waitForTimeout(55); await up(); }
    await p.waitForTimeout(200); s = await st();
    ok(`E 창이 뜨는 자리를 바로 연타(간격 ${gap}ms, 0.${gap === 150 ? '75' : '9'}초 안): 답 안 눌림`, gap === 300 ? true : (!s.answered && !s.fb), JSON.stringify(s));
  }
  // F 두 손가락: 방향 버튼을 누른 채 대화 버튼
  await near(...M); a = await pt('#act'); const d = await pt('.dpad [data-k="l"]');
  await down([{ ...d, id: 1 }]); await p.waitForTimeout(40);
  await ev(() => { const dd = document.querySelector('#game')._dbg; const n = dd.npcs.find(n => !n.got); dd.P.x = n.x; dd.P.y = n.y + 14; });
  await down([{ ...d, id: 1 }, { ...a, id: 2 }]); await p.waitForTimeout(80);
  await up([{ ...d, id: 1 }]); await p.waitForTimeout(120); await up(); await p.waitForTimeout(400);
  s = await st(); ok('F 방향 버튼 누른 채 대화: 두 손 다 떼면 창 열림·답 안 눌림', s.modal && !s.answered && !s.fb, JSON.stringify(s));
  // G 정답을 고르면 보상
  await p.waitForTimeout(1300);
  const got = await ev(async () => { const dd = document.querySelector('#game')._dbg; const n = dd.npcs.find(n => !n.got); return n.q.a; });
  await fr().locator(`.modal .opt[data-k="${got}"]`).tap(); await p.waitForTimeout(300);
  ok('G 정답 고르면 보상 받음', await ev(() => !!document.querySelector('.modal #qfb .fb.ok')));
  await fr().locator('.modal .mact button').tap(); await p.waitForTimeout(300);
  ok('G 창 닫고 게임 계속', await ev(() => !document.querySelector('.modal')));
  console.log(`[${w}×${h}] 실패 ${fails}`); console.log(out.join('\n')); console.log('errors:', errs);
  await b.close();
})();
