// [검증 도구] 지구구조단 액션 게임 세 개를 진짜 터치(CDP)로 눌러 본다: 컨베이어 통 누르기 · 추격 줄 바꾸기 · 수거선 끌기.
// 준비: 저장소 루트에서 python3 -m http.server 8765   실행: node scripts/dev/er-arcade-touch.js   (세 줄 모두 "통과"면 됨)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 412, height: 780 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const cdp = await ctx.newCDPSession(p);
  await p.goto('http://127.0.0.1:8765/lab.html?id=earth-rescue-corps'); await p.waitForTimeout(3000);
  const fr = () => p.frames().find(f => /labs\/environment/.test(f.url()));
  await fr().evaluate(() => { const s = fresh(); s.name = '녹색별'; s.mute = true; s.promoted = 5; SAVES.slots = [s]; SAVES.cur = 0; S = s; persist(); });
  await p.reload(); await p.waitForTimeout(3000);
  const ev = (f, a) => fr().evaluate(f, a);
  const fe = await fr().frameElement();
  const org = async () => { const fb = await fe.boundingBox(); const r = await ev(() => { const r = document.querySelector('#acv').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }); return [fb.x + r[0], fb.y + r[1], r[2], r[3]]; };
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  const tap = async (x, y) => { await touch('touchStart', x, y); await p.waitForTimeout(40); await touch('touchEnd'); };
  const open = async (i, j) => { await ev(([i, j]) => { SAVES.cur = 0; S = SAVES.slots[0]; play(i, j); }, [i, j]); await p.waitForTimeout(600); const fb = await fe.boundingBox(); const r = await ev(() => { const r = document.querySelector('#cgo').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); await tap(fb.x + r[0], fb.y + r[1]); await p.waitForTimeout(2200); };
  // 1) 컨베이어: 시작 버튼을 진짜 탭으로 → 통 탭
  await open(2, 2); let [ox, oy, w, h] = await org(); let ok = 0;
  for (let k = 0; k < 6; k++) { const s = await ev(() => document.querySelector('#game')._dbg.s); if (s.front) { const i = s.bins.indexOf(s.front.b); await tap(ox + 8 + (i + .5) * (w - 16) / 4, oy + h - 50); ok++; } await p.waitForTimeout(500); }
  const s1 = await ev(() => { const d = document.querySelector('#game')._dbg; return { sorted: d.s.sorted, hits: d.K.hits, score: d.K.score }; });
  console.log('컨베이어 터치:', JSON.stringify(s1), s1.sorted >= 5 && s1.hits === 0 ? '통과' : '★실패');
  // 2) 추격: 왼쪽 탭 → 줄 0, 오른쪽 탭 두 번 → 줄 2
  await open(4, 2); [ox, oy, w, h] = await org();
  await tap(ox + w * .2, oy + h * .6); await p.waitForTimeout(150); const l0 = await ev(() => document.querySelector('#game')._dbg.s.lane);
  await tap(ox + w * .8, oy + h * .6); await p.waitForTimeout(150); await tap(ox + w * .8, oy + h * .6); await p.waitForTimeout(150); const l2 = await ev(() => document.querySelector('#game')._dbg.s.lane);
  console.log('추격 터치: 줄', l0, '→', l2, l0 === 0 && l2 === 2 ? '통과' : '★실패');
  // 3) 수거: 끌기 → 수거선이 손가락 위쪽으로 따라옴
  await open(1, 0); [ox, oy, w, h] = await org();
  await touch('touchStart', ox + w * .5, oy + h * .7); for (let i = 0; i <= 10; i++) { await touch('touchMove', ox + w * (.5 - .03 * i), oy + h * (.7 - .02 * i)); await p.waitForTimeout(30); } await p.waitForTimeout(400);
  const s3 = await ev(() => { const s = document.querySelector('#game')._dbg.s; return [Math.round(s.bx), Math.round(s.by), Math.round(s.u)]; }); await touch('touchEnd');
  const want = [w * .2, h * .5 - 1.25 * s3[2]];
  console.log('수거 끌기: 수거선', s3.slice(0, 2), '목표', want.map(Math.round), Math.abs(s3[0] - want[0]) < 12 && Math.abs(s3[1] - want[1]) < 12 ? '통과' : '★실패', '| 스크롤', await ev(() => scrollY), '| errors', errs.length ? errs : 0);
  await b.close();
})();
