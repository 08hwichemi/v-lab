// 실험 썸네일 캡처 (Playwright 필요)
//   사용: 저장소 루트에서  python3 -m http.server 8765  를 띄운 뒤
//         node scripts/thumbs.js earth/elnino chemistry/lewis-dot ...
//         한 파일에 실험이 여럿이면  physics/mechanics-energy:0 physics/mechanics-energy:1 ...  (#exp=N 으로 열어 N.png 저장)
//   결과: assets/img/thumbs/<id>/0.png  (944×522, 뷰포트 1180 폭의 왼쪽 위)
//   시작 모달이 있는 실험은 아래 PREP 에 닫는 동작을 추가한다.
const { chromium } = require('playwright');
const fs = require('fs');

const PREP = {
  'chemistry/lewis-dot': p => p.click('#helpClose').catch(() => {}),
  'chemistry/vsepr-lab': p => p.evaluate(() => { const m = document.getElementById('modal'); if (m) m.style.display = 'none'; }),
  'chemistry/metal-ionization': p => p.evaluate(() => { document.querySelectorAll('#help, .modal').forEach(o => o.classList.remove('on')); }),
  'chemistry/molarity-lab': async p => {   // 보호구·진행 방식 고르고 입장 → NaCl 용액 만들기의 실험대 화면까지 가서 저울에 시약을 조금 올려 둔 모습
    await p.click('#g-coat'); await p.click('#g-gloves'); await p.click('#g-goggles'); await p.click('#m-strict'); await p.click('#startBtn'); await p.waitForTimeout(2600);
    await p.evaluate(() => { startPrep(0); S.job.calc.step = 99; S.job.flask = S.job.m.V; S.job.stage = 'lab'; render(); });
    await p.waitForTimeout(400);
    await p.evaluate(() => { const s = document.querySelector('.scenebox'); if (s) { document.querySelector('main').style.paddingBottom = '400px'; s.scrollIntoView({ block: 'start' }); window.scrollBy(0, -66); } });
  },
  'chemistry/buffer-solution-lab': async p => {   // 안내 닫고 ① pH 비교에서 HCl 6 mL 넣은 모습
    await p.click('#modalClose').catch(() => {}); await p.click('#cmpAdd1'); await p.click('#cmpAdd5'); await p.waitForTimeout(1600);
  },
  'chemistry/effective-collision-lab': async p => {   // 연습 모드로 들어가 안내를 닫은 모습
    await p.click('.mode[data-mode=practice]'); await p.click('#startBtn'); await p.waitForTimeout(600); await p.click('#mbox [data-close]').catch(() => {}); await p.waitForTimeout(1500);
  },
  'chemistry/reaction-rate-factors': async p => {   // 온도 실험을 몇 초 돌린 모습
    await p.click('#simPlay'); await p.waitForTimeout(5000);
  },
  'chemistry/reaction-order-mission': async p => {   // 첫 실제 반응을 골라 농도를 바꿔 두 번 실험한 모습
    await p.click('.rx-card[data-id="r1"]'); await p.waitForTimeout(400); await p.click('.modal-bg.show [data-close]').catch(() => {});
    await p.click('#runExp'); await p.waitForTimeout(1500); await p.click('#concCtl .seg[data-i="0"] button[data-c="0.2"]'); await p.click('#runExp'); await p.waitForTimeout(2500);
  },
  'environment/earth-rescue-corps': async p => {   // 글꼴을 기다린 뒤, 진행 중인 연구원 상태를 만들어 연구실 화면을 잘라 낼 폭에 맞춤
    await p.waitForTimeout(2600);
    await p.evaluate(() => { const s = fresh(); s.name = '초록별'; s.promoted = 3; s.read = { 0: 1, 1: 1, 2: 1, 3: 1 }; ISLANDS.forEach((I, i) => I.missions.forEach((m, j) => { if (i < 3) { s.stars[i + '-' + j] = 3; if (!s.items.includes(m.reward)) s.items.push(m.reward); } })); SAVES.slots = [s]; SAVES.cur = 0; S = s; const a = document.getElementById('app'); a.style.maxWidth = '912px'; a.style.margin = '0'; office(); });
    await p.waitForTimeout(900);
  },
  'environment/lost-world': async p => {   // 구역 세 곳을 되살리고 네 번째 친구를 온실에서 돌보는 중인 지도. 잘라 낼 크기(944×522)에 게임판을 맞춤
    await p.waitForTimeout(1500);
    await p.evaluate(() => { const a = document.getElementById('app'); a.style.maxWidth = '944px'; a.style.margin = '0'; a.style.height = '522px';
      const s = _dbg.start('초록별', 1); _dbg.ZONES.forEach((z, i) => { if (i < 3) { s.z[z.id].st = 4; s.z[z.id].star = 3; s.met[z.en] = s.met[z.ex] = 1; } }); s.z.turtle.st = 3; s.z.turtle.star = 2; s.z.turtle.told = 1; s.seeds = 24; _dbg.go(_dbg.MapScene()); });
    await p.waitForTimeout(1200);
  },
  'chemistry/chemical-cell': async p => { await p.click('[data-pickmode="daniel"]'); await p.click('[data-study="free"]'); await p.click('#startBtn'); },
  'physics/mechanics-energy': async p => {   // 실험 동작 한 번 실행하고 시뮬레이션 화면이 맨 위에 오도록 스크롤
    await p.evaluate(() => { const set = (id, v) => { const n = document.querySelector('.lab:not([hidden]) ' + id); if (n) { n.value = v; n.dispatchEvent(new Event('change')); } }; set('#s-v-n', '7.7'); set('#p-v-n', '30'); set('#p-a-n', '60'); });
    await p.evaluate(() => { const b = document.querySelector('.lab:not([hidden]) .btn.primary'); if (b) b.click(); });
    await p.waitForTimeout(2200);
    await p.evaluate(() => { document.querySelector('.lab:not([hidden]) .stage').scrollIntoView({ block: 'start' }); window.scrollBy(0, -14); });
  },
  'physics/wave-reflection': async p => {   // 파동을 보내 반사파·투과파가 보이는 순간에 멈추고 (가) 그림이 맨 위에 오도록
    await p.click('#send'); await p.waitForTimeout(2500); await p.click('#pause');
    await p.evaluate(() => { document.getElementById('cvA').closest('.card').scrollIntoView({ block: 'start' }); window.scrollBy(0, -12); });
  },
  'earth/constellation': async p => { await p.click('#goBtn'); await p.waitForTimeout(1200); await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.classList.remove('show')); }); },
};

(async () => {
  const files = process.argv.slice(2);
  if (!files.length) { console.log('usage: node scripts/thumbs.js <subject>/<id> ...'); process.exit(1); }
  const b = await chromium.launch();
  for (const arg of files) {
    const [file, n] = arg.split(':');
    const id = file.split('/')[1], out = n || '0';
    const p = await b.newPage({ viewport: { width: 1180, height: 760 } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(`http://127.0.0.1:8765/labs/${file}.html#${n != null ? `exp=${n}&` : ''}embed`); await p.waitForTimeout(1500);
    if (PREP[file]) { try { await PREP[file](p); } catch (e) { errs.push('prep: ' + e.message); } await p.waitForTimeout(500); }
    fs.mkdirSync(`assets/img/thumbs/${id}`, { recursive: true });
    await p.screenshot({ path: `assets/img/thumbs/${id}/${out}.png`, clip: { x: 0, y: 0, width: 944, height: 522 } });
    console.log(id + '/' + out, errs.length ? errs : 'ok');
    await p.close();
  }
  await b.close();
})();
