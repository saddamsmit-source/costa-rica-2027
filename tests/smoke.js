/* Regressietest: laadt de app, doorloopt alle schermen, dagen en dagtabs en faalt bij elke JS-fout of ontbrekend onderdeel. */
const {chromium}=require('playwright');const path=require('path');
(async()=>{
  const exe=process.env.CHROME_PATH||undefined;
  const b=await chromium.launch(exe?{executablePath:exe,args:['--headless=new']}:{});
  const p=await b.newPage({viewport:{width:390,height:844}});
  const errs=[];p.on('pageerror',e=>errs.push('JS: '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/net::|ERR_|Failed to load resource|CORS|woff2/.test(m.text()))errs.push('console: '+m.text())});
  p.on('requestfailed',r=>{if(r.url().startsWith('file:')&&!r.url().endsWith('.woff2')&&!/ABORTED/.test(r.failure()?.errorText||''))errs.push('ontbreekt: '+r.url())});
  await p.route(/^https?:/,r=>r.abort());
  const fixture={notes:{'7':'Testnotitie dag 7'},bookings:{'7-0':'geboekt','17-0':'geboekt'},costs:{},hotelSelected:{},checks:{},v43Observations:{'resplendent quetzal':{name:'Resplendent quetzal',places:{'San Gerardo de Dota':{seen:true,photo:true}}},'whimbrel':{name:'Whimbrel',places:{'Tárcoles':{seen:true}}},'blue-crowned manakin':{name:'Blue-crowned manakin',places:{'Corcovado':{seen:true,n:2}}},"cherrie's tanager":{name:"Cherrie's tanager",places:{'Uvita':{seen:true}}},"passerini's tanager":{name:"Passerini's tanager",places:{'Cahuita':{seen:true}}},'glass frog':{name:'Glass frog',places:{'Monteverde':{seen:true}}},'gray fox':{name:'Gray fox',places:{'San José':{seen:true}}}},v43Extras:{'Monteverde':['Testuil']},v43Migrated:true,v44Log:{},v48Init:true,v48Pack:{'0-0':true},v49Open:{},gpsTracks:[],v51Rates:{eurusd:1.1176,usdcrc:455.47,date:'12 okt 2026'}};
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
  await p.evaluate(()=>document.querySelector('[data-ds-sp-toggle]').click());if(!(await p.$('#wl2Sheet .wl2-body h2')))errs.push('soortvenster opent niet');
  const was=await p.evaluate(()=>document.querySelector('#wl2Sheet [data-wl2-reg="seen"]').classList.contains('on'));await p.evaluate(()=>document.querySelector('#wl2Sheet [data-wl2-reg="seen"]').click());
  if(was===(await p.evaluate(()=>document.querySelector('#wl2Sheet [data-wl2-reg="seen"]').classList.contains('on'))))errs.push('registreren in soortvenster');
  if(was)await p.evaluate(()=>document.querySelector('#wl2Sheet [data-wl2-reg="seen"]').click());if(!(await p.$('#wl2Sheet .wl2-obs')))errs.push('waarneming in soortvenster');
  if(await p.$('#wl2Sheet [data-wl2-zoom]')){await p.click('#wl2Sheet [data-wl2-zoom]');await must('.wl2-zoom img','zoomweergave');await p.click('.wl2-zx')}
  await p.evaluate(()=>wl2Close());
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
  /* v6.3: kaartlagen, noodkaart, dagverslag, zonlicht */
  await p.evaluate(()=>{tab='days';currentDay=7;daySection='map';render()});await must('.dse-chips','kaartlagen');await must('[data-dse-poi="fortuna-waterfall"]','activiteitpin');
  await p.evaluate(()=>document.querySelector('[data-dse-poi="fortuna-waterfall"]').dispatchEvent(new MouseEvent('click',{bubbles:true})));if(await p.evaluate(()=>document.getElementById('dsePop').hidden))errs.push('pin-venster opent niet');
  await p.evaluate(()=>document.querySelector('[data-dse-layer="act"]').click());if(await p.$('[data-dse-poi="fortuna-waterfall"]'))errs.push('laag uitzetten werkt niet');await p.evaluate(()=>document.querySelector('[data-dse-layer="act"]').click());
  await p.evaluate(()=>{tab='home';render()});await must('#dseClock','tijd CR/NL');await p.click('.dse-sosbtn');await must('a[href="tel:911"]','noodkaart 911');await p.click('#dseEmClose');
  await p.evaluate(()=>{tab='days';currentDay=7;daySection='overview';render()});await must('#dseReport','dagverslag');if(!(await p.evaluate(()=>dseReport(S[6]).startsWith('Dag 7'))))errs.push('dagverslag tekst');
  await p.evaluate(()=>{tab='settings';dsMore='';render()});await must('#dseSun','zonlichtstand');
  /* v7.1: vogelgroepen, soortengids, delen, luchtvochtigheid */
  const wgc=await p.evaluate(()=>{const b=Object.keys(V47_SP).filter(n=>v47Info(n).cat==='Vogels'),c={};let bad=0;b.forEach(n=>{const g=wgGroup(n);if(!WG_GROUPS.includes(g))bad++;c[g]=(c[g]||0)+1});return {n:b.length,u:new Set(b).size,sum:Object.values(c).reduce((a,x)=>a+x,0),bad}});
  if(wgc.bad||wgc.sum!==wgc.n||wgc.u!==wgc.n)errs.push('vogelgroepen onvolledig: '+JSON.stringify(wgc));
  await p.evaluate(()=>{tab='wildlife';render()});await must('#wgGuide','soortengids');
  await p.click('[data-wg-cat="Vogels"]');await p.click('[data-wg-group="Roofvogels"]');
  const rr=await p.evaluate(()=>[...document.querySelectorAll('#wgGuide .wg-row')].map(b=>wgGroup(decodeURIComponent(b.dataset.wl2))));if(!rr.length||rr.some(g=>g!=='Roofvogels'))errs.push('groepsfilter roofvogels');
  await p.selectOption('#wgRegion','Corcovado');const rc=await p.evaluate(()=>[...document.querySelectorAll('#wgGuide .wg-row')].every(b=>v47Chance('Corcovado',decodeURIComponent(b.dataset.wl2))>0));if(!rc)errs.push('regiofilter gids');
  await p.click('#wgGuide .wg-row');await must('.wl2-sheet','soortvenster uit gids');await p.evaluate(()=>wl2Close());
  if(!(await p.evaluate(()=>wg.group==='Roofvogels'&&wg.region==='Corcovado')))errs.push('filter blijft niet behouden');
  await p.evaluate(()=>{wg.cat='';wg.group='Alle';wg.region='';render()});
  await p.evaluate(()=>{tab='days';currentDay=17;daySection='wildlife';v47Filter='Vogels';render()});await must('.wg-chips','groepschips dag');await must('[data-wg-dst]','statusfilter dag');
  await p.evaluate(()=>{tab='settings';dsMore='share';render()});await must('#shCopy','deelpagina');
  if(!(await p.evaluate(()=>SHARE_URL==='https://saddamsmit-source.github.io/costa-rica-2027/'&&!JSON.stringify(shPayload()).includes('v43'))))errs.push('deel-URL');
  await p.evaluate(()=>{dsMore='';render()});await must('[data-ds-more="share"]','deelrij in Meer');
  if(!(await p.evaluate(()=>wxUrl({lat:1,lon:1}).includes('relative_humidity_2m_mean')&&WX_CLIM.points[wxLoc(S[9]).key]['02'].mean>0)))errs.push('luchtvochtigheid bron/klimaat');
  await p.evaluate(()=>{tab='days';currentDay=10;daySection='overview';render()});await must('#dsWx .ds-wx-day.clim','klimaatindicatie');
  /* v7.2: Wildlife 2.1 */
  const fs=require('fs');
  const w=await p.evaluate(()=>({meta:WL2_META,keys:Object.keys(WL2),recs:WL2}));
  if(w.meta.v!=='2.1')errs.push('WL2-versie '+w.meta.v);
  const oldKeys=JSON.parse(fs.readFileSync(path.resolve(__dirname,'wl20-keys.json'),'utf8'));const lost=oldKeys.filter(k=>!w.keys.includes(k));if(lost.length)errs.push('sleutels verdwenen: '+lost.join(', '));
  for(const [k,r] of Object.entries(w.recs)){if(r.p)for(const f of [`photos/wl/${r.p}.jpg`,`photos/wl/t/${r.p}.jpg`,`photos/wl/hd/${r.p}.jpg`])if(!fs.existsSync(path.resolve(__dirname,'..',f)))errs.push('foto ontbreekt: '+k+' '+f);
    if(!r.li&&r.p||r.p&&!r.cr)errs.push('licentie/maker ontbreekt: '+k)}
  const SNAKE=['Viperidae','Elapidae','Colubridae','Dipsadidae','Boidae'];const MIM='Kan op een gevaarlijke koraalslang lijken. Raak onbekende slangen niet aan en probeer ze niet op te pakken.';
  for(const [k,r] of Object.entries(w.recs))if(SNAKE.includes(r.f)){if(!r.sf)errs.push('veiligheidstekst ontbreekt: '+k);if(/ongevaarlijk|licht giftig|niet gevaarlijk/i.test((r.h||'')+(r.l||'')+(r.tp||'')))errs.push('misleidende slangtekst: '+k)}
  for(const k of ['Red coffee snake','Forest flame snake','Double-banded coral snake mimic'])if(w.recs[k]?.sf!==MIM)errs.push('koraalslangtekst: '+k);
  for(const [k,r] of Object.entries(w.recs)){const all={...(r.r||{})};if(r.c!=='Vogels'&&(all['San José']||0)>1)errs.push('San José te hoog: '+k);if(r.f==='Felidae'&&Object.values(all).some(t=>t>1))errs.push('katachtige te hoog: '+k)}
  const rk=await p.evaluate(()=>({o:Object.keys(state.v43Observations),life:wl2Life(),lab:DS_CHANCE_TXT[1],f15:V47_FOCUS[15].list,f18:V47_FOCUS[18].list,sj:v47Chance('San José','Gray fox'),wh:v47Chance('Tárcoles','Whimbrel')}));
  for(const k of ['whimbrel','blue-crowned manakin',"cherrie's tanager","passerini's tanager",'glass frog','gray fox'])if(!rk.o.includes(k))errs.push('waarneming verloren: '+k);
  const lc=await p.evaluate(()=>{const names=new Set(wl2Entries().map(e=>e.name));const m=wl2Life().match(/<b class="ds-num">(\d+)<\/b>/);return {seen:names.size,life:m?+m[1]:-1,t:names.has("Cherrie's tanager")&&names.has("Passerini's tanager"),g:names.has('Glass frog')}});
  if(!lc.t||!lc.g||lc.life!==lc.seen-2)errs.push('soortenlijst telt vormen/niet-op-soort: '+JSON.stringify(lc));
  if(rk.lab!=='Zeldzaam')errs.push('kanslabel');if(!rk.f15.includes('Cocos booby')||rk.f15.includes('Brown booby'))errs.push('dagfocus 15');if(rk.f18[0]!=='Panamic sergeant major')errs.push('dagfocus 18');
  if(rk.sj!==1)errs.push('eigen waarneming niet in regiolijst');if(rk.wh<3)errs.push('kans regenwulp Tárcoles');
  const opened=await p.evaluate(()=>{let bad=[];for(const k of Object.keys(WL2)){try{wl2Open(k,'Corcovado');if(!document.querySelector('#wl2Sheet .wl2-body h2'))bad.push(k);wl2Close()}catch(e){bad.push(k+': '+e.message)}}return bad});if(opened.length)errs.push('soortvenster: '+opened.slice(0,5).join(', '));
  await p.evaluate(()=>{wl2Open('Red coffee snake','Cahuita')});if(!(await p.evaluate(()=>document.querySelector('#wl2Sheet .wl21-safe')?.textContent.includes('koraalslang'))))errs.push('veiligheidsblok niet zichtbaar');await p.evaluate(()=>wl2Close());
  await p.evaluate(()=>{tab='wildlife';render();const g=document.getElementById('v50gq');g.value='Three-striped';g.dispatchEvent(new Event('input'))});if(!(await p.evaluate(()=>document.getElementById('v50gres').innerText.length>0&&!!document.querySelector('#v50gres [data-wl2="Three-striped%20warbler"]'))))errs.push('zoeken op oude naam');
  await p.evaluate(()=>{const g=document.getElementById('v50gq');g.value='Kalkoengier';g.dispatchEvent(new Event('input'))});if(!(await p.evaluate(()=>!!document.querySelector('#v50gres [data-wl2="Turkey%20vulture"]'))))errs.push('zoeken op oude Nederlandse naam');
  /* v7.3: namen, tapir, terugknop */
  const nm=await p.evaluate(()=>Object.keys(WL2).filter(k=>WL2[k].nl&&v47Info(k).nl!==WL2[k].nl));if(nm.length)errs.push('oude NL-naam zichtbaar: '+nm.slice(0,5).join(', '));
  for(const [q,k] of [['Zwartsnaveltoekan','Yellow-throated%20toucan'],['Geelkeeltoekan','Yellow-throated%20toucan'],['Roodrugtangare',"Passerini's%20tanager"]]){await p.evaluate(q=>{tab='wildlife';render();const g=document.getElementById('v50gq');g.value=q;g.dispatchEvent(new Event('input'))},q);if(!(await p.evaluate(k=>!!document.querySelector(`#v50gres [data-wl2="${k}"]`),k)))errs.push('zoeken op '+q)}
  if(await p.evaluate(()=>v47Chance('Corcovado',"Baird's tapir"))!==2)errs.push('tapir Corcovado niet Mogelijk');
  await p.evaluate(()=>{tab='home';render()});await p.waitForTimeout(300);await p.evaluate(()=>{tab='days';currentDay=9;daySection='wildlife';render()});
  await p.evaluate(()=>wl2Open('Jabiru','La Fortuna'));await p.evaluate(()=>document.querySelector('#wl2Sheet [data-wl2-zoom]')?.click());await p.waitForTimeout(150);
  await p.goBack({waitUntil:'commit'}).catch(()=>{});await p.waitForTimeout(250);
  let bk=await p.evaluate(()=>({zoom:!!document.querySelector('.wl2-zoom'),sheet:!!document.getElementById('wl2Sheet')}));if(bk.zoom||!bk.sheet)errs.push('terug sluit niet alleen de fotozoom: '+JSON.stringify(bk));
  await p.goBack({waitUntil:'commit'}).catch(()=>{});await p.waitForTimeout(250);
  bk=await p.evaluate(()=>({sheet:!!document.getElementById('wl2Sheet'),tab,day:currentDay,sec:daySection}));if(bk.sheet||bk.tab!=='days'||bk.day!==9||bk.sec!=='wildlife')errs.push('terug sluit soortvenster niet goed: '+JSON.stringify(bk));
  await p.goBack({waitUntil:'commit'}).catch(()=>{});await p.waitForTimeout(250);
  bk=await p.evaluate(()=>({tab,url:location.href}));if(bk.tab!=='home')errs.push('terug gaat niet naar vorig scherm: '+JSON.stringify(bk));
  await p.waitForTimeout(300);await p.evaluate(()=>{tab='days';currentDay=3;daySection='overview';render();wl2Open('Jabiru','La Fortuna')});await p.waitForTimeout(100);await p.evaluate(()=>wl2Close());await p.waitForTimeout(250);
  await p.goBack({waitUntil:'commit'}).catch(()=>{});await p.waitForTimeout(250);if(await p.evaluate(()=>tab==='days'&&currentDay===3))errs.push('sluiten met × laat een lege terugstap achter');
  const n=await p.evaluate(()=>Object.keys(V47_SP).length);if(n<250)errs.push('te weinig soorten: '+n);
  await b.close();
  if(errs.length){console.error('MISLUKT:\n'+errs.join('\n'));process.exit(1)}console.log('OK: alle schermen, 23 dagen x 5 tabs, '+n+' soorten');
})();
