/* Regressietest: laadt de app, doorloopt alle schermen, dagen en dagtabs en faalt bij elke JS-fout of ontbrekend onderdeel. */
const {chromium}=require('playwright');const path=require('path');
(async()=>{
  const exe=process.env.CHROME_PATH||undefined;
  const b=await chromium.launch(exe?{executablePath:exe,args:['--headless=new']}:{});
  const p=await b.newPage({viewport:{width:390,height:844}});
  const errs=[];p.on('pageerror',e=>errs.push('JS: '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/net::|ERR_|Failed to load resource/.test(m.text()))errs.push('console: '+m.text())});
  p.on('requestfailed',r=>{if(r.url().startsWith('file:'))errs.push('ontbreekt: '+r.url())});
  await p.route(/^https?:/,r=>r.abort());
  await p.goto('file://'+path.resolve(__dirname,'..','index.html'));await p.waitForTimeout(400);
  const must=async(sel,what)=>{if(!(await p.$(sel)))errs.push('mist '+what+' ('+sel+')')};
  for(const t of ['home','days','map','bookings','hotels','wildlife','budget','settings']){await p.evaluate(t=>{tab=t;render()},t)}
  for(let d=1;d<=23;d++)for(const s of ['overview','activities','wildlife','stay','map']){await p.evaluate(([d,s])=>{tab='days';currentDay=d;daySection=s;render()},[d,s])}
  await p.evaluate(()=>{tab='home';render()});await must('.home-tiles','home-tegels');
  await p.evaluate(()=>{tab='days';currentDay=7;daySection='overview';render()});await must('.v50-hero','dagkop');await must('.v50-timeline','tijdlijn');await must('#v52open','snelle waarneming');
  await p.click('#v52open');await must('#v52quick','waarneming-venster');await p.click('#v52close');
  await p.evaluate(()=>{daySection='activities';render()});await must('.v50-act','activiteitkaart');
  await p.evaluate(()=>{document.querySelector('.v50-act').click()});await must('#detailOverlay','detailscherm');await p.evaluate(()=>document.getElementById('detailOverlay').remove());
  await p.evaluate(()=>{daySection='wildlife';render()});await must('.v47-sp','soortkaart');await must('#v50q','zoekveld');
  await p.evaluate(()=>{daySection='map';render()});await must('.v51-svg','kaart');
  await p.evaluate(()=>{tab='settings';render()});await must('#v52verify','back-upcontrole');await must('[data-v51-cur="eur"]','valuta');
  await p.evaluate(()=>{tab='bookings';render()});await must('.v49-segbar','checklist-tabs');
  const n=await p.evaluate(()=>Object.keys(V47_SP).length);if(n<250)errs.push('te weinig soorten: '+n);
  await b.close();
  if(errs.length){console.error('MISLUKT:\n'+errs.join('\n'));process.exit(1)}console.log('OK: alle schermen, 23 dagen x 5 tabs, '+n+' soorten');
})();
