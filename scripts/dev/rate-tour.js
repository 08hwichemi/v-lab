// 반응 속도 실험 3종(유효 충돌·반응 차수·반응 속도 요인) 안쪽 화면 캡처
// 쓰는 법: node scripts/dev/rate-tour.js <결과 폴더> [포트=8765] [해시='#embed']
// PC(1180×800)·휴대폰(412×780)으로 각 실험의 주요 화면을 찍고 pageerror·가로 넘침을 출력한다.
const {chromium}=require('playwright');
const out=process.argv[2], port=process.argv[3]||8765, hash=process.argv[4]===undefined?'#embed':process.argv[4];
(async()=>{
  const b=await chromium.launch();
  for(const [w,h,m] of [[1180,800,0],[412,780,1]]){
    const c=await b.newContext({viewport:{width:w,height:h},hasTouch:!!m,isMobile:!!m,deviceScaleFactor:1});
    const p=await c.newPage(); const errs=[];
    p.on('pageerror',e=>errs.push(String(e))); p.on('console',x=>{if(x.type()==='error')errs.push(x.text())});
    const shot=async n=>{await p.waitForTimeout(500);await p.screenshot({path:`${out}/${n}-${w}.png`});
      const sw=await p.evaluate(()=>document.documentElement.scrollWidth); if(sw>w){const who=await p.evaluate(W=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>W+1&&e.offsetParent).slice(0,4).map(e=>e.tagName+'#'+e.id+'.'+e.className),w);console.log('가로 넘침',n,w,sw,who.join(' | '));}};
    const go=async f=>{await p.goto('about:blank');await p.goto(`http://localhost:${port}/labs/chemistry/${f}.html${hash}`);await p.waitForTimeout(900);};
    const tap=async s=>{const e=p.locator(s).first(); if(await e.count()&&await e.isVisible()){await e.click();await p.waitForTimeout(300);return true;} return false;};
    // 유효 충돌
    for(const mode of ['observe','practice','time']){
      await go('effective-collision-lab'); await tap(`.mode[data-mode=${mode}]`); if(mode==='observe')await shot('ec-0home');
      await tap('#startBtn'); await p.waitForTimeout(600); await shot('ec-1'+mode+'-modal');
      await tap('#mbox .btn.pri')||await tap('#mbox .btn'); await p.waitForTimeout(mode==='time'?4500:1500); await shot('ec-2'+mode);
      if(m){await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await shot('ec-3'+mode+'-side');}
    }
    await go('effective-collision-lab'); await tap('#rankBtn'); await shot('ec-4rank'); await go('effective-collision-lab'); await tap('#howBtn'); await shot('ec-5how');
    // 반응 차수
    await go('reaction-order-mission'); await shot('ro-0select'); await tap('.rx-card'); await p.waitForTimeout(500); await tap('.modal-bg.show .btn.primary'); await shot('ro-1mission');
    await p.evaluate(()=>window.scrollTo(0,700)); await shot('ro-2mission-b'); await p.evaluate(()=>window.scrollTo(0,1500)); await shot('ro-3mission-c');
    await p.evaluate(()=>window.scrollTo(0,0)); await tap('.tab-btn[data-tab=concept]'); await shot('ro-4concept');
    // 반응 속도 요인
    await go('reaction-rate-factors'); await tap('.modal-bg.show .btn.primary'); await tap('#simStart, .sim-btns .btn.primary'); await p.waitForTimeout(2500); await shot('rf-0temp');
    const mb=p.locator('.mode-btn'); const n=await mb.count();
    for(let i=1;i<n;i++){await mb.nth(i).click();await p.waitForTimeout(300);await tap('.sim-btns .btn.primary');await p.waitForTimeout(1500);await shot('rf-'+i+'mode');}
    await p.evaluate(()=>window.scrollTo(0,900)); await shot('rf-5lower');
    await p.evaluate(()=>window.scrollTo(0,0)); await tap('.tab-btn[data-tab=concept]'); await shot('rf-6concept');
    const cn=p.locator('.cnav button'); const k=await cn.count(); for(let i=1;i<k;i++){await cn.nth(i).evaluate(e=>e.click());await shot('rf-7concept'+i);}
    console.log(w,'오류',errs.length?errs:'없음'); await c.close();
  }
  await b.close();
})();
