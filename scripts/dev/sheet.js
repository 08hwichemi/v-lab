// [검증 도구] 폴더 안의 PNG 여러 장을 한 장으로 모은다(한눈 보기). 스크린샷을 한 장씩 열어 보는 것보다 훨씬 가볍다.
// 실행: node scripts/dev/sheet.js <폴더> <결과.png> <열 수> <한 칸 폭(px)> [파일 이름 앞부분...]
//   예) node scripts/dev/sheet.js /tmp/shots /tmp/shots/all.png 6 300        ← 휴대폰 화면은 6열·300px 쯤이면 글자가 읽힌다
//       node scripts/dev/sheet.js /tmp/shots /tmp/out.png 4 420 map hab       ← 이름이 map·hab 으로 시작하는 것만
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dir, out, cols = '6', tw = '300', ...only] = process.argv.slice(2);
  if (!dir || !out) { console.log('사용: node scripts/dev/sheet.js <폴더> <결과.png> <열 수> <한 칸 폭> [이름 앞부분...]'); process.exit(1); }
  let files = fs.readdirSync(dir).filter(f => f.endsWith('.png') && path.resolve(dir, f) !== path.resolve(out)).sort();
  if (only.length) files = files.filter(f => only.some(o => f.startsWith(o)));
  const html = `<body style="margin:0;background:#333;display:grid;grid-template-columns:repeat(${cols},${tw}px);gap:6px;padding:6px;width:max-content;font:12px sans-serif;color:#fff">` +
    files.map(f => `<div><div style="padding:2px 0">${f}</div><img style="width:100%;display:block" src="data:image/png;base64,${fs.readFileSync(path.join(dir, f)).toString('base64')}"></div>`).join('') + '</body>';
  const b = await chromium.launch(); const p = await b.newPage(); await p.setContent(html); await p.waitForTimeout(400);
  await (await p.$('body')).screenshot({ path: out }); await b.close(); console.log(files.length + '장 →', out);
})();
