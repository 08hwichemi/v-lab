// 반응 차수 찾기 실험실: 실제 반응 9개 + 가상 반응을 표 값만 읽어 정답까지 자동으로 푼다 (PC·휴대폰)
// 쓰는 법: node scripts/dev/ro-solve.js <캡처 폴더> [포트=8765]
const { chromium } = require('playwright');
const URL='http://localhost:'+(process.argv[3]||8765)+'/labs/chemistry/reaction-order-mission.html';
const OUT=process.argv[2];
async function solve(page, id, mobile, log){
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.click(`.rx-card[data-id="${id}"]`);
  const n=await page.evaluate(()=>M.R.re.length);
  const setConc=async(i,c)=>{ await page.click(`#concCtl .seg[data-i="${i}"] button[data-c="${c}"]`); };
  await page.click('#runExp'); await page.waitForTimeout(1000);
  for(let i=0;i<n;i++){
    for(let j=0;j<n;j++) await setConc(j, j===i?0.2:0.1);
    await page.click('#runExp'); await page.waitForTimeout(1000);
  }
  // read table as student (unfold)
  const fold=await page.$('#dataTable tr.fold-row'); if(fold) await fold.click();
  const rows=await page.$$eval('#dataTable tbody tr[data-i]',trs=>trs.map(tr=>[...tr.children].map(td=>td.textContent)));
  const parse=s=>{ const m=/^([\d.]+)(?: × 10(-?\d+))?$/.exec(s.replace('−','-')); return m?parseFloat(m[1])*Math.pow(10,m[2]?+m[2]:0):NaN; };
  const v=rows.map(r=>parse(r[n+1]));
  if(v.some(isNaN)) log.push(`${id}: 표 파싱 NaN ${JSON.stringify(rows)}`);
  const orders=[]; for(let i=0;i<n;i++) orders.push(Math.round(Math.log2(v[i+1]/v[0])));
  const total=orders.reduce((a,b)=>a+b,0);
  const k=v[0]/Math.pow(0.1,total);
  const truth=await page.evaluate(()=>({o:M.orders,k:M.k}));
  if(JSON.stringify(truth.o)!==JSON.stringify(orders)) log.push(`${id}: 차수 추정 불일치 ${orders} vs ${truth.o} v=${v}`);
  // build terms
  let t=0;
  for(let i=0;i<n;i++){ if(orders[i]===0) continue;
    await page.click('#addTerm');
    await page.selectOption(`#termList select[data-t="${t}"]`, String(i));
    await page.click(`#termList .seg[data-t="${t}"] button[data-o="${orders[i]}"]`); t++; }
  const e=Math.floor(Math.log10(k)); const m=(k/Math.pow(10,e)).toFixed(1);
  await page.fill('#kMant', m); await page.fill('#kExp', String(e)); await page.selectOption('#kUnit', String(total));
  await page.click('#checkAns'); await page.waitForTimeout(200);
  const res=await page.evaluate(()=>({solved:!!M.solved,fb:document.querySelector('#ansFeedback').innerText,law:document.querySelector('#rateLawPreview').innerText,toast:document.querySelector('#toast')&&document.querySelector('#toast').className}));
  if(!res.solved) log.push(`${id}: 정답 입력인데 미해결 o=${orders} true=${truth.o} k=${m}e${e} trueK=${truth.k} fb=${res.fb}`);
  const txt=await page.evaluate(()=>document.body.innerText);
  if(/NaN|undefined|Infinity/.test(txt)) log.push(`${id}: NaN/undefined 표시`);
  await page.screenshot({path:`${OUT}/${mobile?'m':'p'}-${id}.png`,fullPage:true});
  await page.click(mobile?'#mBack':'#mBack'); await page.click('#backOk');
  return {id,orders,truth,m,e,law:res.law.replace(/\n/g,' | ')};
}
(async()=>{
  const b=await chromium.launch();
  for(const mobile of [false,true]){
    const ctx=await b.newContext(mobile?{viewport:{width:412,height:780},hasTouch:true,isMobile:true,deviceScaleFactor:1}:{viewport:{width:1180,height:800}});
    const page=await ctx.newPage(); const errs=[]; const log=[];
    page.on('pageerror',e=>errs.push('pageerror '+e.message)); page.on('console',m=>{ if(m.type()==='error') errs.push('console '+m.text()); });
    await page.goto(URL); await page.waitForTimeout(500);
    await page.screenshot({path:`${OUT}/${mobile?'m':'p'}-select.png`,fullPage:true});
    const ids=['r1','r2','r3','r4','r5','r6','r7','r8','r9','v1','v2','v3','v1','v2','v3','v1','v3'];
    for(const id of ids){ try{ const r=await solve(page,id,mobile,log); console.log(mobile?'M':'P',JSON.stringify(r)); }catch(e){ log.push(`${id}: 예외 ${e.message.split('\n')[0]}`); await page.screenshot({path:`${OUT}/err-${mobile?'m':'p'}-${id}.png`}); await page.goto(URL); } }
    const done=await page.$$eval('.rx-card.done',x=>x.length);
    console.log(mobile?'MOBILE':'PC','done cards',done,'errs',errs,'log',log);
    await ctx.close();
  }
  await b.close();
})();
