// [검증 도구] '이미 사라진 세계'의 모든 화면(시작·지도·기억의 조각·구조 놀이 5개·온실 5개·결과·도감·실천·엔딩)을 캡처하고 페이지 오류를 찍는다.
// 준비: 저장소 루트에서 python3 -m http.server 8765
// 실행: node scripts/dev/lw-tour.js <저장할 폴더> [폭=412] [높이=780] [해시, 예: '#embed']
//   예: mkdir -p /tmp/lw && node scripts/dev/lw-tour.js /tmp/lw 360 640     (휴대폰 가로는 780 360, PC 는 1180 700)
//   장면은 window._dbg (start·go·MapScene·Habitat·Memory·GAMES·Ending·Title) 로 바로 연다. 마지막 줄이 'no errors' 면 통과.
const { chromium } = require('playwright');
const out = process.argv[2], W = +(process.argv[3] || 412), H = +(process.argv[4] || 780);
const URL = 'http://127.0.0.1:8765/labs/environment/lost-world.html' + (process.argv[5] || '');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: W < 800, isMobile: W < 800 });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto(URL); await p.waitForTimeout(2800);
  const shot = async n => { await p.screenshot({ path: `${out}/${n}.png` }); };
  await shot('01-title-empty');
  await p.evaluate(() => { newGame(); }); await p.waitForTimeout(500); await shot('01b-newgame');
  await p.evaluate(() => { closeSheet(); const a = _dbg.fresh('초록별', 1); _dbg.ZONES.forEach((z, i) => { if (i < 3) { a.z[z.id].st = 4; a.z[z.id].star = 3 - i % 2; a.met[z.en] = a.met[z.ex] = 1; } }); a.z.turtle.st = 1; const c = _dbg.fresh('바다지킴이', 2); _dbg.SAVES.slots = [a, c]; _dbg.go(_dbg.Title()); }); await p.waitForTimeout(700); await shot('01c-title-slots');
  await p.evaluate(() => { _dbg.start('초록별', 1); _dbg.go(_dbg.MapScene({ intro: true })); }); await p.waitForTimeout(900); await shot('02-map-intro');
  await p.evaluate(() => { while (_dbg.TALK) _dbg.nextLine(); }); await p.waitForTimeout(400); await shot('03-map');
  await p.evaluate(() => { settings(); }); await p.waitForTimeout(400); await shot('03b-settings'); await p.evaluate(() => closeSheet());
  await p.evaluate(() => { _dbg.go(_dbg.Memory('bee')); }); await p.waitForTimeout(4200); await shot('04-memory');
  let i = 5;
  for (const z of ['bee', 'bear', 'spoon', 'turtle', 'polar']) {
    await p.evaluate(z => { const Z = _dbg.ZONES.find(q => q.id === z); _dbg.go(_dbg.GAMES[Z.game](z)); }, z); await p.waitForTimeout(5200); await shot(String(i++).padStart(2, '0') + '-game-' + z);
    await p.evaluate(z => { const S = _dbg.S; S.z[z].st = 3; S.z[z].seen = 1; S.met[z] = 1; _dbg.go(_dbg.Habitat(z)); }, z); await p.waitForTimeout(5200); await shot(String(i++).padStart(2, '0') + '-hab-' + z);
  }
  await p.evaluate(() => { showResult('bear', 2, false, 1, '올무에 걸림', true); }); await p.waitForTimeout(1200); await shot('15a-result'); await p.evaluate(() => closeSheet());
  await p.evaluate(() => { const S = _dbg.S; _dbg.ZONES.forEach((z, k) => { S.z[z.id].st = 4; S.z[z.id].star = 3 - k % 3; S.met[z.en] = 1; S.met[z.ex] = 1; }); S.z.bee.gold = 1; S.z.polar.st = 3; _dbg.go(_dbg.MapScene()); }); await p.waitForTimeout(800); await shot('15-map-late');
  await p.evaluate(() => { openArchive(); }); await p.waitForTimeout(500); await shot('16-archive');
  await p.evaluate(() => { openEntry('dodo'); }); await p.waitForTimeout(400); await shot('17-entry-ex');
  await p.evaluate(() => { openEntry('spoon'); }); await p.waitForTimeout(400); await shot('18-entry-en');
  await p.evaluate(() => { openChecklist(); }); await p.waitForTimeout(400); await shot('19-check');
  await p.evaluate(() => { closeSheet(); zoneSheet(_dbg.ZONES[0]); }); await p.waitForTimeout(400); await shot('19b-zone');
  await p.evaluate(() => { closeSheet(); _dbg.S.z.polar.st = 4; _dbg.go(_dbg.Ending()); }); await p.waitForTimeout(7400); await shot('20-ending');
  await p.evaluate(() => { while (_dbg.TALK) _dbg.nextLine(); }); await p.waitForTimeout(900); await shot('21-ending-done');
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await b.close();
})();
