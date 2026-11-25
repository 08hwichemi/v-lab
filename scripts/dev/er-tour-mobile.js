// [검증 도구] 지구구조단을 휴대폰 크기 뷰어로 열어 모든 화면을 캡처하고, 스크롤·넘침·줄바꿈을 잰다.
// 준비: 저장소 루트에서 python3 -m http.server 8765
// 실행: node scripts/dev/er-tour-mobile.js <저장할 경로 앞머리> [폭=412] [높이=780] [ui|play]
//   예: mkdir -p /tmp/er && node scripts/dev/er-tour-mobile.js /tmp/er/a 360 640
const { chromium } = require('playwright');
const [,, out, w = '412', h = '780', only = ''] = process.argv;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PE ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('C ' + m.text()); });
  await p.goto('http://127.0.0.1:8765/lab.html?id=earth-rescue-corps'); await p.waitForTimeout(3500);
  const fr = () => p.frames().find(f => /labs\/environment/.test(f.url()));
  await fr().evaluate(() => {
    const s = fresh(); s.name = '녹색별'; s.promoted = 5; s.read = { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 };
    ISLANDS.forEach((I, i) => I.missions.forEach((m, j) => { if (i < 5) { s.stars[i + '-' + j] = 2; if (!s.items.includes(m.reward)) s.items.push(m.reward); } }));
    SAVES.slots = [s]; SAVES.cur = 0; S = s; persist();
  });
  await p.reload(); await p.waitForTimeout(3500);
  const rep = [];
  const meas = async name => {
    const m = await fr().evaluate(() => {
      const de = document.documentElement, vw = innerWidth, vh = innerHeight;
      const over = [];
      document.querySelectorAll('#app *, .modal *').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && (r.right > vw + 1 || r.left < -1)) over.push((e.className || e.tagName) + '@' + Math.round(r.left) + '~' + Math.round(r.right)); });
      // 줄이 넘어간 버튼 줄 찾기
      const wraps = [];
      document.querySelectorAll('#app *, .modal *').forEach(e => { const cs = getComputedStyle(e); if (cs.display.includes('flex') && cs.flexWrap === 'wrap' && e.children.length > 1) { const tops = new Set([...e.children].filter(c => c.offsetWidth).map(c => Math.round(c.getBoundingClientRect().top / 6))); if (tops.size > 1) wraps.push((e.className || e.tagName) + ':' + tops.size + '줄'); } });
      return { vw, vh, sh: de.scrollHeight, over: over.slice(0, 6), wraps };
    });
    rep.push(`${name}: 높이 ${m.sh}/${m.vh}${m.sh > m.vh + 2 ? ' ★스크롤' : ''}${m.over.length ? ' 넘침 ' + m.over.join(', ') : ''}${m.wraps.length ? ' 줄바꿈 ' + m.wraps.join(', ') : ''}`);
  };
  const shot = async name => { await meas(name); await p.screenshot({ path: `${out}-${name}.png` }); };
  const ev = (f, a) => fr().evaluate(f, a);
  if (!only || only === 'ui') {
    await shot('00-title');
    await ev(() => { SAVES.cur = 0; S = SAVES.slots[0]; office(); }); await p.waitForTimeout(700); await shot('01-office');
    await ev(() => settings()); await p.waitForTimeout(500); await shot('01b-settings');
    await ev(() => { document.querySelectorAll('.modal').forEach(m => m.remove()); map(); }); await p.waitForTimeout(900); await shot('02-map');
    await ev(() => island(0)); await p.waitForTimeout(600); await shot('03-island');
    await ev(() => mLetter(0, 0)); await p.waitForTimeout(500); await shot('04-letter');
    await ev(() => brief(0, 0)); await p.waitForTimeout(500); await shot('05-brief');
    await ev(() => result(0, 0, 3)); await p.waitForTimeout(900); await shot('06-result');
    await ev(() => archive()); await p.waitForTimeout(600); await shot('07-archive');
    await ev(() => mail()); await p.waitForTimeout(600); await shot('08-mail');
    await ev(() => create()); await p.waitForTimeout(600); await shot('09-create');
    await ev(() => { SAVES.cur = 0; S = SAVES.slots[0]; });
  }
  if (!only || only === 'play') {
    await ev(() => { SAVES.cur = 0; S = SAVES.slots[0]; });
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) {
      await ev(([i, j]) => play(i, j), [i, j]); await p.waitForTimeout(900);
      const clicked = await ev(() => { const c = document.querySelector('#game .cover button, #game .start button, #game button.primary, .modal button.primary'); if (c) { const t = c.textContent; c.click(); return t; } return null; });
      await p.waitForTimeout(1300);
      await shot(`g${i}${j}`);
    }
  }
  console.log(rep.join('\n')); console.log('errors:', errs);
  await b.close();
})();
