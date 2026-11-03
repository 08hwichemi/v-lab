// 실험 썸네일 캡처 (Playwright 필요)
//   사용: 저장소 루트에서  python3 -m http.server 8765  를 띄운 뒤
//         node scripts/thumbs.js earth/elnino chemistry/lewis-dot ...
//   결과: assets/img/thumbs/<id>/0.png  (944×522, 뷰포트 1180 폭의 왼쪽 위)
//   시작 모달이 있는 실험은 아래 PREP 에 닫는 동작을 추가한다.
const { chromium } = require('playwright');
const fs = require('fs');

const PREP = {
  'chemistry/lewis-dot': p => p.click('#helpClose').catch(() => {}),
  'chemistry/vsepr-lab': p => p.evaluate(() => { const m = document.getElementById('modal'); if (m) m.style.display = 'none'; }),
  'chemistry/metal-ionization': p => p.evaluate(() => { document.querySelectorAll('#help, .modal').forEach(o => o.classList.remove('on')); }),
  'chemistry/chemical-cell': async p => { await p.click('[data-pickmode="daniel"]'); await p.click('[data-study="free"]'); await p.click('#startBtn'); },
  'earth/constellation': async p => { await p.click('#goBtn'); await p.waitForTimeout(1200); await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.classList.remove('show')); }); },
};

(async () => {
  const files = process.argv.slice(2);
  if (!files.length) { console.log('usage: node scripts/thumbs.js <subject>/<id> ...'); process.exit(1); }
  const b = await chromium.launch();
  for (const file of files) {
    const id = file.split('/')[1];
    const p = await b.newPage({ viewport: { width: 1180, height: 760 } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(`http://127.0.0.1:8765/labs/${file}.html#embed`); await p.waitForTimeout(1500);
    if (PREP[file]) { try { await PREP[file](p); } catch (e) { errs.push('prep: ' + e.message); } await p.waitForTimeout(500); }
    fs.mkdirSync(`assets/img/thumbs/${id}`, { recursive: true });
    await p.screenshot({ path: `assets/img/thumbs/${id}/0.png`, clip: { x: 0, y: 0, width: 944, height: 522 } });
    console.log(id, errs.length ? errs : 'ok');
    await p.close();
  }
  await b.close();
})();
