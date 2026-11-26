// [검증 도구] 지구구조단 11번 메탄몬 턴제 배틀을 끝까지 돌리고 연출 장면을 캡처한다.
// 준비: 저장소 루트에서 python3 -m http.server 8765   실행: node scripts/dev/er-battle.js <저장할 경로 앞머리> [폭=412] [높이=780]
const { chromium } = require('playwright');
const [,, out = '/tmp/er-battle', w = '412', h = '780'] = process.argv;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://127.0.0.1:8765/lab.html?id=earth-rescue-corps'); await p.waitForTimeout(3000);
  const fr = () => p.frames().find(f => /labs\/environment/.test(f.url())); const ev = (f, a) => fr().evaluate(f, a);
  await ev(() => { const s = fresh(); s.name = '휘쌤'; s.mute = true; s.promoted = 3; s.items.push('p_kkachi'); SAVES.slots = [s]; SAVES.cur = 0; S = s; persist(); play(3, 1); });
  let n = 0; const shot = t => p.screenshot({ path: `${out}-${String(n++).padStart(2, '0')}-${t}.png` });
  await p.waitForTimeout(700); await shot('enter'); await p.waitForTimeout(1800);
  const sh = await ev(() => [document.documentElement.scrollHeight, innerHeight]); console.log('높이', sh.join('/'), sh[0] > sh[1] + 2 ? '★스크롤' : '');
  const order = [1, 0, 2, 3, 1, 0, 1, 3, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0];
  for (const k of order) {
    const st = await ev(() => document.querySelector('#game') && document.querySelector('#game')._dbg && document.querySelector('#game')._dbg.state); if (!st || st.over) break;
    const kk = st.moves[k] > 0 ? k : 0; await ev(k => document.querySelector('#game')._dbg.use(k), kk);
    await p.waitForTimeout(550); if (n < 9) await shot('fx' + kk);
    for (let i = 0; i < 80; i++) { const q = await ev(() => { const o = document.querySelector('#tb .opt.right, #tb .opt:not([disabled])'); const d = document.querySelector('#game')._dbg; if (o && !o.disabled) { const all = [...document.querySelectorAll('#tb .opt')]; all[0].click(); } return d ? d.state : null; }).catch(() => null); if (!q || !q.busy || q.over) break; if (i === 12 && n < 12) await shot('turn'); await p.waitForTimeout(150); }
  }
  await p.waitForTimeout(3200); await shot('end');
  console.log('끝 화면:', await ev(() => document.querySelector('.bigstars') ? '별 ' + document.querySelectorAll('.bigstars .bs:not(.off)').length : (document.querySelector('#game h2') || {}).textContent || '진행 중'), '| errors:', errs.length ? errs : 0);
  await b.close();
})();
