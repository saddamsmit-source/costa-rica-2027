/* Regressietest: laadt de app, doorloopt alle schermen, dagen en dagtabs en faalt bij elke JS-fout of ontbrekend onderdeel. */
const {chromium}=require('playwright');const path=require('path');
(async()=>{
  const exe=process.env.CHROME_PATH||undefined;
  const b=await chromium.launch(exe?{executablePath:exe,args:['--headless=new']}:{});
  const p=await b.newPage({viewport:{width:390,height:844}});
  const errs=[];p.on('pageerror',e=>errs.push('JS: '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/net::|ERR_|Failed to load resource|CORS|woff2/.test(m.text()))errs.push('console: '+m.text())});
  p.on('requestfailed',r=>{if(r.url().startsWith('file:')&&!r.url().endsWith('.woff2'))errs.push('ontbreekt: '+r.url())});
  await p.route(/^https?:/,r=>r.abort());
  const fixture={notes:{'7':'Testnotitie dag 7'},bookings:{'7-0':'geboekt','17-0':'geboekt'},costs:{},hotelSelected:{},checks:{},v43Observations:{'resplendent quetzal':{name:'Resplendent quetzal',places:{'San Gerardo de Dota':{seen:true,photo:true}}}},v43Extras:{'Monteverde':['Testuil']},v43Migrated:true,v44Log:{},v48Init:true,v48Pack:{'0-0':true},v49Open:{},gpsTracks:[],v51Rates:{eurusd:1.1176,usdcrc:455.47,date:'12 okt 2026'}};
  await p.addInitScript(f=>{try{if(!localStorage.getItem('CR27_V2'))localStorage.setItem('CR27_V2',JSON.stringify(f))}catch(e){}},fixture);
  await p.goto('file://'+path.resolve(__dirname,'..','index.html'));await p.waitForTimeout(400);
  const comp=await p.evaluate(()=>({note:state.notes['7'],q:!!state.v43Observations['resplendent quetzal']?.places?.['San Gerardo de Dota']?.photo,pack:state.v48Pack['0-0'],book:state.bookings['17-0'],extra:(state.v43Extras.Monteverde||[]).includes('Testuil')}));
  if(comp.note!=='Testnotitie dag 7'||!comp.q||!comp.pack||comp.book!=='geboekt'||!comp.extra)errs.push('back-upcompatibiliteit: '+JSON.stringify(comp));
  await p.evaluate(()=>{tab='days';currentDay=7;daySection='overview';render()});
  if(!(await p.evaluate(()=>document.querySelector('textarea[data-note="7"]')?.value==='Testnotitie dag 7')))errs.push('notitie dag 7 niet zichtbaar na laden');
  const must=async(sel,what)=>{if(!(await p.$(sel)))errs.push('mist '+what+' ('+sel+')')};
  for(const t of ['home','days','map','bookings','hotels','wildlife','budget','settings']){await p.evaluate(t=>{tab=t;render()},t)}
  for(let d=1;d<=23;d++)for(const s of ['overview','activities','wildlife','stay','map']){await p.evaluate(([d,s])=>{tab='days';currentDay=d;daySection=s;render()},[d,s])}
  await p.evaluate(()=>{tab='home';render()});await must('.ds-tiles','home-tegels');await must('.ds-next','volgende dag');
  await p.evaluate(()=>{tab='days';currentDay=7;daySection='overview';render()});await must('.ds-dayhero','dagkop');await must('.ds-timeline','tijdlijn');await must('.ds-tabs','dagtabs');await must('#v52open','snelle waarneming');
  await p.click('#v52open');await must('#v52quick','waarneming-venster');await p.click('#v52close');
  await p.evaluate(()=>{daySection='activities';render()});await must('.ds-act','activiteitkaart');
  await p.evaluate(()=>{document.querySelector('.ds-act').click()});await must('#detailOverlay','detailscherm');await p.evaluate(()=>document.getElementById('detailOverlay').remove());
  await p.evaluate(()=>{daySection='wildlife';render()});await must('.ds-sp','soortrij');await must('#v50q','zoekveld');
  await p.evaluate(()=>document.querySelector('[data-v43-kind="photo"]').click());
  if(!(await p.evaluate(()=>Object.values(state.v43Observations).some(o=>Object.values(o.places).some(x=>x.photo&&x.seen)))))errs.push('registreren foto werkt niet');
  await p.evaluate(()=>document.querySelector('[data-ds-sp-toggle]').click());if(await p.evaluate(()=>document.querySelector('.ds-sp-body').hidden))errs.push('soort uitklappen werkt niet');
  for(const f of ['Vogels','Zeldzaam','Seizoen','Nog niet gezien','Alle']){await p.evaluate(f=>document.querySelector(`[data-v47-filter="${f}"]`)?.click(),f)}
  await p.evaluate(()=>{const q=document.getElementById('v50q');q.value='zzzz';q.dispatchEvent(new Event('input'))});if(await p.evaluate(()=>[...document.querySelectorAll('.ds-sp')].some(c=>c.style.display!=='none')))errs.push('zoeken filtert niet');
  await p.evaluate(()=>{const q=document.getElementById('v50q');q.value='';q.dispatchEvent(new Event('input'))});
  await p.evaluate(()=>{daySection='stay';render()});await must('.ds-hotel','hotelkaart');
  await p.evaluate(()=>{tab='hotels';render()});await must('.ds-hotel','hotelscherm');
  await p.evaluate(()=>{tab='wildlife';render()});await must('#v50gq','reisbreed zoeken');await p.evaluate(()=>{const g=document.getElementById('v50gq');g.value='quetzal';g.dispatchEvent(new Event('input'))});if(!(await p.evaluate(()=>document.getElementById('v50gres').innerText.includes('Quetzal'))))errs.push('reisbreed zoeken vindt quetzal niet');
  await p.evaluate(()=>{tab='days';currentDay=7;daySection='wildlife';render()});
  /* fase D: kaart */
  await p.evaluate(()=>{daySection='map';render()});await must('.v51-svg','kaart');await must('.ds-info','reisinformatie');
  const vb1=await p.evaluate(()=>document.querySelector('.v51-svg').getAttribute('viewBox'));await p.click('#dsMapWide');const vb2=await p.evaluate(()=>document.querySelector('.v51-svg').getAttribute('viewBox'));if(vb1===vb2)errs.push('kaart vergroten werkt niet');await p.click('#dsMapWide');
  await p.evaluate(()=>{tab='map';render()});await must('#gpsStart','gps-opname');if(await p.evaluate(()=>document.querySelectorAll('.ds-leg').length)!==10)errs.push('etappes niet 10');
  await p.evaluate(()=>document.querySelector('.ds-leg[data-v51-day="6"]').click());if(!(await p.evaluate(()=>tab==='days'&&currentDay===6)))errs.push('etappe opent dag niet');
  /* fase D: meer */
  await p.evaluate(()=>{tab='settings';render()});await must('.ds-menurow','meer-menu');
  await p.click('[data-ds-more="backup"]');await must('#v52verify','back-upcontrole');await must('#export','back-up downloaden');await p.click('.ds-back');
  await p.click('[data-ds-more="fx"]');await must('[data-v51-cur="eur"]','valuta');if(!(await p.evaluate(()=>document.querySelector('[data-v51-cur="crc"]').value)))errs.push('valuta rekent niet');
  await p.click('[data-mobile="settings"]');await must('.ds-menurow','meer-menu na navigatie');
  for(const k of ['prac','legend','credits']){await p.evaluate(k=>{dsMore=k;render()},k);await must('.ds-back','subpagina '+k)}
  /* fase D: checklist en budget */
  await p.evaluate(()=>{tab='bookings';v49Seg='paklijst';render()});await must('.v49-segbar','checklist-tabs');
  await p.evaluate(()=>{const c=document.querySelector('[data-v48-pack="1-0"]');c.checked=true;c.dispatchEvent(new Event('change'))});if(!(await p.evaluate(()=>state.v48Pack['1-0'])))errs.push('paklijst afvinken werkt niet');
  await p.evaluate(()=>{v49Seg='boekingen';render();const s=document.querySelector('[data-book]');window._bk=s.dataset.book;s.value='aangevraagd';s.dispatchEvent(new Event('change'))});if(!(await p.evaluate(()=>state.bookings[window._bk]==='aangevraagd')))errs.push('boekingsstatus opslaan werkt niet');
  await p.evaluate(()=>{v49Seg='regelen';render()});await must('.ds-clrow','te-regelen rij');
  await p.evaluate(()=>{tab='budget';render();const i=document.querySelector('[data-cost]');i.value='25';i.dispatchEvent(new Event('change'))});if(!(await p.evaluate(()=>document.querySelector('.ds-bsum-top b').textContent.includes('25'))))errs.push('budget telt niet op');
  const n=await p.evaluate(()=>Object.keys(V47_SP).length);if(n<250)errs.push('te weinig soorten: '+n);
  await b.close();
  if(errs.length){console.error('MISLUKT:\n'+errs.join('\n'));process.exit(1)}console.log('OK: alle schermen, 23 dagen x 5 tabs, '+n+' soorten');
})();
