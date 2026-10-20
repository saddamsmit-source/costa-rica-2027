/* Regressietest: laadt de app, doorloopt alle schermen, dagen en dagtabs en faalt bij elke JS-fout of ontbrekend onderdeel. */
const {chromium}=require('playwright');const path=require('path');
(async()=>{
  const exe=process.env.CHROME_PATH||undefined;
  const b=await chromium.launch(exe?{executablePath:exe,args:['--headless=new','--allow-file-access-from-files']}:{args:['--allow-file-access-from-files']});
  const p=await b.newPage({viewport:{width:390,height:844}});
  const errs=[];p.on('pageerror',e=>errs.push('JS: '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/net::|ERR_|Failed to load resource|CORS|woff2/.test(m.text()))errs.push('console: '+m.text())});
  p.on('requestfailed',r=>{if(r.url().startsWith('file:')&&!r.url().endsWith('.woff2')&&!/ABORTED/.test(r.failure()?.errorText||''))errs.push('ontbreekt: '+r.url())});
  await p.route(/^https?:/,r=>r.abort());
  /* v7.8: elke getoonde afbeelding vastleggen (verzoeken + img/achtergrond in het scherm) */
  const imgs=new Set();p.on('request',r=>{if(r.resourceType()==='image')imgs.add(r.url())});
  await p.addInitScript(()=>{window.__imgs=new Set();const col=()=>{const a=document.getElementById('app');if(!a)return;a.querySelectorAll('img[src]').forEach(i=>__imgs.add(i.getAttribute('src')));a.querySelectorAll('[style*="url("]').forEach(e=>{for(const m of e.getAttribute('style').matchAll(/url\(['"]?([^'")]+)/g))__imgs.add(m[1])})};
    new MutationObserver(col).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['src','style']})});
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
  await p.evaluate(()=>{tab='map';render()});await must('#gpsStart','gps-opname');if(await p.evaluate(()=>document.querySelectorAll('.ds-leg').length)!==13)errs.push('etappes niet 13');
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
  /* v7.4: verversen houdt het scherm vast */
  await p.waitForTimeout(300);await p.evaluate(()=>{tab='days';currentDay=12;daySection='wildlife';render()});await p.waitForTimeout(300);
  await p.evaluate(()=>scrollTo(0,900));await p.reload();await p.waitForTimeout(500);
  const rl=await p.evaluate(()=>({tab,day:currentDay,sec:daySection,y:Math.round(scrollY)}));if(rl.tab!=='days'||rl.day!==12||rl.sec!=='wildlife')errs.push('verversen gaat terug naar Home: '+JSON.stringify(rl));
  if(rl.y<500)errs.push('scrollpositie niet hersteld na verversen: '+rl.y);
  /* v7.4: kaart met hotels en reistijden */
  const hk=await p.evaluate(()=>{const bad=[];v74Hotels().forEach(o=>{if(!o.x.ll){bad.push(o.h+': geen coördinaten');return}
    const st=V51_STOPS[v51Day2Stop(o.days[0])][0],km=v51Dist(o.x.ll,V51_PT[st]);if(km>25)bad.push(o.h+' '+Math.round(km)+' km van '+st)});
    Object.entries(V74_HOTEL).forEach(([h,o])=>{if(!H.some(([r])=>r===o.r))bad.push(h+': onbekende regio '+o.r)});return bad});
  if(hk.length)errs.push('hotellocaties: '+hk.join('; '));
  await p.evaluate(()=>{tab='days';currentDay=16;daySection='map';render()});
  const hm=await p.evaluate(()=>{const g=document.querySelector('.v74-hotel.on');if(!g)return 'geen hotelpin';g.dispatchEvent(new MouseEvent('click',{bubbles:true}));const t=document.getElementById('dsePop')?.innerText||'';
    return /Cabinas Las Palmeras/.test(t)&&/Dag 16–18/.test(t)&&!!document.querySelector('#dsePop a[href*="8.65726,-83.71165"]')&&[...document.querySelectorAll('.dsm-lbl.hotel')].some(l=>l.textContent==='Cabinas Las Palmeras')?'':'hotelvenster/label: '+t.slice(0,80)});
  if(hm)errs.push(hm);
  await p.evaluate(()=>document.querySelector('#dsePop [data-v74-day]').click());if(!(await p.evaluate(()=>tab==='days'&&currentDay===16&&daySection==='stay')))errs.push('hotelvenster opent dag-tab Hotel niet');
  await p.evaluate(()=>{tab='map';render()});
  const tm=await p.evaluate(()=>{const n=document.querySelectorAll('.v74-time').length;document.querySelector('.v74-time').dispatchEvent(new MouseEvent('click',{bubbles:true}));return {n,pop:document.getElementById('dsePop')?.innerText||'',hotels:document.querySelectorAll('.v74-hotel').length}});
  if(tm.n<9||!/Reistijd/i.test(tm.pop)||!/Dag \d+/.test(tm.pop))errs.push('reistijdlabels: '+JSON.stringify(tm).slice(0,120));
  if(tm.hotels)errs.push('hotels standaard aan op de grote kaart');
  await p.evaluate(()=>document.querySelector('[data-dse-layer="hotel"]').click());await p.evaluate(()=>document.querySelector('[data-dse-layer="time"]').click());
  const tg=await p.evaluate(()=>({h:document.querySelectorAll('.v74-hotel').length,t:document.querySelectorAll('.v74-time').length,st:state.dsLayers.full}));
  if(tg.h<10||tg.t||!tg.st.hotel||tg.st.time)errs.push('laagschakelaars hotels/reistijd: '+JSON.stringify(tg));
  await p.evaluate(()=>{state.dsLayers.full.hotel=false;state.dsLayers.full.time=true;save()});
  const n=await p.evaluate(()=>Object.keys(V47_SP).length);if(n<250)errs.push('te weinig soorten: '+n);
  /* v7.5: compacte dagtab, dag 14, teller, snelheid */
  const cp=await p.evaluate(()=>{tab='days';currentDay=3;daySection='wildlife';v47Filter='Alle';v50Query='';render();const sec=v75Sec(),vis=()=>[...sec.querySelectorAll('.v47-sp')].filter(c=>c.offsetParent).length,all=sec.querySelectorAll('.v47-sp').length,v0=vis();
    const q=document.getElementById('v50q');q.value='zz-geen';q.dispatchEvent(new Event('input'));q.value='';q.dispatchEvent(new Event('input'));const v1=vis();
    document.querySelector('.v75-all').click();const v2=vis();V75_OPEN.clear();return {all,v0,v1,v2}});
  if(!(cp.v0>=10&&cp.v0<=45&&cp.v1===cp.v0&&cp.v2===cp.all))errs.push('compacte wildlifetab: '+JSON.stringify(cp));
  const d14=await p.evaluate(()=>{tab='days';currentDay=14;daySection='wildlife';render();return [...document.querySelectorAll('.v75-morning [data-v43-kind="seen"]')].map(b=>decodeURIComponent(b.dataset.v43Species)+'@'+decodeURIComponent(b.dataset.v43Place))});
  if(!d14.includes('Resplendent quetzal@San Gerardo de Dota'))errs.push('dag 14 quetzal niet bij San Gerardo: '+d14);
  if(!(await p.evaluate(()=>{tab='home';render();return document.getElementById('app').innerText.includes(Object.keys(V47_SP).length+' soorten')})))errs.push('soortenteller Home wijkt af');
  const ms=await p.evaluate(()=>{const keep=JSON.stringify(state.v43Observations);Object.keys(V47_SP).forEach((k,i)=>{const o=state.v43Observations[v43name(k)]??={name:k,places:{}};o.places['Cahuita']??={seen:true,photo:false,t:new Date(Date.now()-i*6e4).toISOString()}});
    tab='wildlife';const t=performance.now();render();const dt=performance.now()-t;state.v43Observations=JSON.parse(keep);return dt});
  if(ms>250)errs.push('Wildlife-pagina traag met 634 waarnemingen: '+Math.round(ms)+' ms');
  /* v7.6.2: bootroute Sierpe → Corcovado-lodge langs rivier en kust */
  const bt=await p.evaluate(()=>{tab='days';currentDay=16;daySection='map';render();const pl=document.querySelector('polyline.dsm-boat');const P=n=>v51XY(V51_PT[n][0],V51_PT[n][1]).map(v=>v.toFixed(1)).join(',');
    const straight=[...document.querySelectorAll('line.dsm-boat')].some(l=>{const a=l.getAttribute('x1')+','+l.getAttribute('y1'),b=l.getAttribute('x2')+','+l.getAttribute('y2');return [a,b].includes(P('Corcovado'))});
    return {pts:pl?pl.getAttribute('points').split(' ').length:0,straight,lodge:v51Dist(V51_PT.Corcovado,[8.65726,-83.71165])}});
  if(bt.pts<20||bt.straight||bt.lodge>0.1)errs.push('bootroute Corcovado: '+JSON.stringify(bt));
  const rd=await p.evaluate(()=>{tab='map';render();const P=n=>v51XY(V51_PT[n][0],V51_PT[n][1]).map(v=>v.toFixed(1)).join(',');const ends=[...document.querySelectorAll('line.dsm-road,line.dsm-boat')].map(l=>[l.getAttribute('x1')+','+l.getAttribute('y1'),l.getAttribute('x2')+','+l.getAttribute('y2')]);
    const has=(a,b)=>ends.some(e=>e.includes(P(a))&&e.includes(P(b)));return {routes:document.querySelectorAll('.v763-route').length,river:!!document.querySelector('.v763-river'),straightSE:has('Sierpe','Esterillos'),straightUS:has('Uvita','Sierpe')}});
  if(rd.routes<3||!rd.river||rd.straightSE||rd.straightUS)errs.push('routes langs weg/rivier: '+JSON.stringify(rd));
  /* v7.7: diashow per dag: 2 sfeerfoto's + 1 dier met grote kans, bestanden aanwezig, automatisch wisselen */
  const ds=await p.evaluate(()=>{const out=[];for(let d=1;d<=21;d++){tab='days';currentDay=d;daySection='overview';render();const sec=document.querySelector('.ds-dayhero.v77'),st=sec&&sec.v77;
    if(!st){out.push({d,err:'geen diashow'});continue}const reg=v47Region(S[d-1]),an=st.slides.filter(x=>x.name).map(x=>x.name);
    out.push({d,n:st.n,srcs:st.slides.map(x=>x.src),animal:an,ch:an[0]?v47Chance(reg,an[0]):0})}
    tab='days';currentDay=5;daySection='overview';render();const st=document.querySelector('.v77').v77,i0=st.i;v77Step();const moved=st.i!==i0&&document.querySelectorAll('.v77-slides i.on').length===1;
    tab='days';currentDay=22;daySection='overview';render();return {out,moved,d22:!!document.querySelector('.v77')}});
  const fsx=require('fs');
  ds.out.forEach(o=>{if(o.err)errs.push('dag '+o.d+': '+o.err);else{if(o.n!==3)errs.push('dag '+o.d+': '+o.n+' foto\'s');if(o.animal.length!==1||o.ch<3)errs.push('dag '+o.d+': dier ontbreekt of kans <3');
    o.srcs.forEach(s=>{if(!fsx.existsSync(path.resolve(__dirname,'..',s.replace(/^\.\//,''))))errs.push('dag '+o.d+': ontbreekt '+s)})}});
  {const all=ds.out.flatMap(o=>o.srcs||[]),dup=all.filter((x,i)=>all.indexOf(x)!==i);if(dup.length)errs.push('foto op meerdere dagen: '+[...new Set(dup)].join(', '))}
  {const sw=fsx.readFileSync(path.resolve(__dirname,'..','sw.js'),'utf8'),miss=[...new Set(ds.out.flatMap(o=>o.srcs||[]))].filter(x=>!sw.includes("'"+x+"'"));if(miss.length)errs.push('diashowfoto niet offline: '+miss.join(', '))}
  if(!ds.moved)errs.push('diashow wisselt niet');if(ds.d22)errs.push('diashow op dag 22 (geen bestemming)');
  /* v7.8: alleen geverifieerde foto's, hotels eerlijk gelabeld, diashow in hoge resolutie */
  {const v=await p.evaluate(async()=>{const bad=[];
    const rej=['act-coconut','act-coyotes','act-frog','act-guanacaste','act-horse','act-nightwalk','act-tapir','act-tattoo','act-toucan','hotel-fleurdelys','hotel-atlantidalodge','hotel-lapaverdelodge','hotel-catarataecolodge','hotel-faroarenal','hotel-ecoarenal','hotel-suenosdelbosque','hotel-rioticosafarilodge','hotel-cabinaslaspalmeras','hotel-hotelvistaballena'];
    rej.forEach(k=>{if(V48_PHOTO[k])bad.push('afgekeurde foto nog aanwezig: '+k)});
    Object.entries(V48_PHOTO).forEach(([k,x])=>{if(x.sfeer)bad.push('sfeerbeeld: '+k)});
    S.forEach(d=>d.activities.forEach(a=>{const k=v48ActKey(a,d);if(k!=='geen'&&!V48_PHOTO[k])bad.push('activiteit zonder geverifieerde foto: '+a.title)}));
    H.flatMap(([r,l])=>l).forEach(h=>{const m=V49_HOTEL_PHOTO[h];if(!m||!V48_PHOTO[m.key])bad.push('hotel zonder geverifieerde omgevingsfoto: '+h);else if(!/^Omgeving/.test(m.what))bad.push('hotellabel: '+h)});
    tab='hotels';render();if(/Sfeerbeeld|vergelijkbare plek/i.test(document.getElementById('app').innerHTML))bad.push('hotelscherm noemt nog sfeerbeeld');
    tab='days';currentDay=2;daySection='stay';render();if(!/niet het hotel zelf/.test(document.getElementById('app').innerHTML))bad.push('hotelkaart zonder label omgeving');
    const srcs=new Set();for(let d=1;d<=21;d++)v77DaySlides(S[d-1]).forEach(x=>srcs.add(x.src));v77HomeSlides().forEach(x=>srcs.add(x.src));
    for(const u of srcs){const im=new Image();im.src=u;try{await im.decode()}catch(e){bad.push('laadt niet: '+u);continue}if(Math.min(im.naturalWidth,im.naturalHeight)<990)bad.push('diashow lage resolutie: '+u+' '+im.naturalWidth+'x'+im.naturalHeight)}
    return bad});
   v.forEach(x=>errs.push(x))}
  /* v8.0: één kansschaal; per dier per plek overal hetzelfde label en gelijk aan de brondata */
  {const basis=JSON.parse(require('fs').readFileSync(path.resolve(__dirname,'..','tools/wl/w21/chance_basis.json'),'utf8'));
   const v=await p.evaluate(basis=>{const bad=[],L={4:'Zeer makkelijk',3:'Makkelijk',2:'Meer kans met gids',1:'Zeldzaam'},OLD=/Zeer kansrijk|Kansrijk|Mogelijk:|Grote kans|Redelijke kans|Kleine kans|Zeer grote kans|uitzonderlijk|Zeldzaam, maar mogelijk|Kansrijkste/;
    const down={'Agami heron|La Fortuna':2,'Nicaraguan seed-finch|La Fortuna':2,'Black-crested coquette|La Fortuna':2,'Lesser ground-cuckoo|Rincón de la Vieja':2,'Double-striped thick-knee|Tárcoles':2};
    for(const [n,regs] of Object.entries(basis))for(const [r,x] of Object.entries(regs)){const want=Math.min(x.t,down[n+'|'+r]||9);if(want>=1&&v47Chance(r,n)!==want)bad.push('kans wijkt af van bron: '+n+' '+r+' '+v47Chance(r,n)+'≠'+want)}
    let cards=0;for(let d=1;d<=21;d++){tab='days';currentDay=d;daySection='wildlife';render();const app=document.getElementById('app');if(OLD.test(app.innerHTML))bad.push('dag '+d+': oude kanswoorden');
      app.querySelectorAll('.ds-sp').forEach(c=>{const b=c.querySelector('[data-v43-kind="seen"]');if(!b)return;const n=decodeURIComponent(b.dataset.v43Species),reg=decodeURIComponent(b.dataset.v43Place),ch=v47Chance(reg,n),dc=c.querySelector('.ds-chance');cards++;
        const lab=c.querySelector('.v80-ch')?.textContent||'',dots=dc?dc.querySelectorAll('i.f').length:0;
        if(ch&&(lab!==L[ch]||dots!==ch))bad.push('dag '+d+' '+n+': kaart '+lab+'/'+dots+' ≠ '+L[ch]);if(!ch&&(lab||dots))bad.push('dag '+d+' '+n+': label zonder gegevens');
        const sh=document.createElement('div');sh.innerHTML=wl2SheetHtml(n,reg);if(OLD.test(sh.innerHTML))bad.push('soortvenster '+n+': oude kanswoorden');
        const here=sh.querySelector('.wl2-where .here small')?.textContent||'',chip=sh.querySelector('.v80-here')?.textContent||'';
        if(ch&&(!here.startsWith(L[ch])||chip!==reg+': '+L[ch]))bad.push('soortvenster '+n+' '+reg+': '+here+' / '+chip+' ≠ '+L[ch]);
        if((c.querySelectorAll('.ds-sp-body .ds-chips span')[0]?.textContent||'')in{'Zeer makkelijk':1,'Makkelijk':1,'Meer kans met gids':1,'Zeldzaam':1}&&c.querySelector('.ds-sp-body .ds-chips span').textContent!==L[ch])bad.push('chip '+n)})}
    if(cards<1500)bad.push('te weinig soortkaarten gecontroleerd: '+cards);
    const W=/\b(zeldzaam|schaars|uitzonderlijk|algemeen|talrijk|moeilijk te zien)\b/i;Object.entries(V47_SP).forEach(([n,x])=>{if(W.test(x[3]||'')&&!/^Zeer zeldzaam; zie je hem/.test(x[3]))bad.push('tip noemt zeldzaamheid: '+n)});
    Object.entries(WL2).forEach(([n,r])=>{if(W.test(r.l||'')||W.test(r.h||''))bad.push('tekst noemt zeldzaamheid: '+n)});
    tab='days';currentDay=9;daySection='wildlife';render();if(document.querySelector('[data-v47-filter="Zeldzaam"]'))bad.push('filter Zeldzaam zonder zeldzame soorten');
    tab='days';currentDay=11;daySection='wildlife';render();const fz=document.querySelector('[data-v47-filter="Zeldzaam"]');if(!fz)bad.push('filter Zeldzaam ontbreekt op dag 11 (glaskikker)');fz?.click();const vis=[...document.querySelectorAll('.ds-sp')].filter(c=>c.style.display!=='none');
    if(!vis.length)bad.push('filter Zeldzaam leeg');vis.forEach(c=>{const b=c.querySelector('[data-v43-kind="seen"]');if(b&&v47Chance(decodeURIComponent(b.dataset.v43Place),decodeURIComponent(b.dataset.v43Species))!==1)bad.push('filter Zeldzaam toont niet-zeldzaam')});
    return {bad:bad.slice(0,15),n:bad.length,cards}},basis);
   if(v.n)errs.push('kansschaal ('+v.n+'): '+v.bad.join('; '));else console.log('kansschaal: '+v.cards+' soortkaarten gecontroleerd')}
  /* v8.0: hoteldiashow: alleen eigen website of gecontroleerde omgeving, 3 foto's, offline terugval */
  {const sw=require('fs').readFileSync(path.resolve(__dirname,'..','sw.js'),'utf8');
   const v=await p.evaluate(async()=>{const bad=[],CDN={'Cabinas Las Palmeras':'webbox.imgix.net','Catarata Ecolodge':'storage.googleapis.com'};
    const hotels=[...new Set(S.flatMap(d=>d.hotel))];
    for(const [h,l] of Object.entries(V80_HPICS)){const dom=V80_HSRC[h]?new URL(V80_HSRC[h].page).hostname.replace(/^www\./,''):'-';
      if(V80_HBOOK[h]&&!(l.slice(0,3).every(x=>x.src==='booking')&&/^https:\/\/www\.booking\.com\/hotel\/cr\//.test(V80_HBOOK[h])))bad.push('Booking-foto\'s niet vooraan: '+h);
      l.forEach(x=>{const u=new URL(x.u);if(u.protocol!=='https:')bad.push('geen https: '+x.u);if(!((x.src==='site'&&(u.hostname.endsWith(dom)||u.hostname===CDN[h]))||(x.src==='booking'&&u.hostname==='cf.bstatic.com'&&V80_HBOOK[h])))bad.push('foto niet van hotelsite of Booking: '+h+' '+u.hostname)})}
    for(const h of hotels){if(!V80_HFILL[h])bad.push('geen diashow: '+h);
      const d=S.find(x=>x.hotel.includes(h));tab='days';currentDay=d.id;daySection='stay';render();await new Promise(r=>setTimeout(r,60));await v80HLoad(h);await new Promise(r=>setTimeout(r,30));
      const el=document.querySelector(`.ds-hotel-img[data-v80h="${CSS.escape(h)}"]`);const st=el&&el.v77;
      if(!st){bad.push('diashow niet gestart: '+h);continue}if(st.n!==3)bad.push(h+': '+st.n+' foto\'s');
      st.slides.forEach(x=>{const m=x.src.match(/photos\/(.+)\.jpg$/);if(!(m&&V48_PHOTO[m[1]])&&!v80HAll().includes(x.src))bad.push(h+': niet-geverifieerde foto '+x.src);if(!/^(Hotel|Omgeving) · /.test(x.label||''))bad.push(h+': label ontbreekt')});
      if(/Sfeerbeeld|vergelijkbare|oorlopig/i.test(el.closest('.ds-hotel').innerHTML))bad.push(h+': oude tekst')}
    tab='hotels';render();if(/oorlopig/.test(document.getElementById('app').innerHTML))bad.push('hotelscherm noemt voorlopig');
    return {bad,all:v80HAll()}});
   v.bad.forEach(x=>errs.push(x));v.all.forEach(u=>{if(!sw.includes('"'+u+'"'))errs.push('hotelfoto niet in service worker: '+u)})}
  /* v8.1: paklijst: nieuwe groepen, oude vinkjes blijven, volgorde */
  {const v=await p.evaluate(()=>{const bad=[];tab='bookings';v49Seg='paklijst';render();const app=document.getElementById('app');
    const names=[...app.querySelectorAll('.ds-acc summary span')].map(e=>e.textContent);
    ['Documenten en geld','Basis','Elektra','Badkamer en verzorging','Medicijnen en EHBO','Schoeisel','Kleding','Handig onderweg'].forEach((n,i)=>{if(names[i]!==n)bad.push('volgorde paklijst: '+names.slice(0,8).join(', '))});
    if(names.length!==V48_PACK.length)bad.push('niet alle groepen zichtbaar');
    if(V48_PACK[0][1][0]!=='Paspoort + kopie (ook als foto op telefoon)')bad.push('bestaande sleutels verschoven');
    const total=V48_PACK.reduce((s,[,i])=>s+i.length,0);if(app.querySelectorAll('[data-v48-pack]').length!==total)bad.push('aantal items');
    const all=V48_PACK.flatMap(g=>g[1]),dup=all.filter((x,i)=>all.indexOf(x)!==i);if(dup.length)bad.push('dubbel: '+dup.join(', '));
    return [...new Set(bad)]});v.forEach(x=>errs.push(x))}
  /* v8.3: etappes op de kaart compleet: alle overnachtingsplekken + dagtrip Manuel Antonio, terugreis via Tárcoles, terugvlucht */
  {const v=await p.evaluate(()=>{const bad=[];tab='map';render();const L=[...document.querySelectorAll('.ds-leg')];
    if(L.length!==13)bad.push('etappes: '+L.length+' in plaats van 13');
    const names=L.map(b=>b.querySelector('b').textContent);['Manuel Antonio','San José (terug via Tárcoles)','Terugvlucht naar Amsterdam'].forEach(n=>{if(!names.some(x=>x.startsWith(n)))bad.push('etappe ontbreekt: '+n)});
    const days=new Set(L.flatMap(b=>{const t=b.querySelector('.ds-leg-body span').textContent.match(/Dag (\d+)(?:–(\d+))?/);if(!t)return [];const a=+t[1],z=+(t[2]||t[1]);return Array.from({length:z-a+1},(_,i)=>a+i)}));
    for(let d=1;d<=S.length;d++)if(!days.has(d))bad.push('dag '+d+' zit in geen etappe');
    L.forEach(b=>{const im=b.querySelector('img');if(!im)bad.push('etappe zonder foto: '+b.querySelector('b').textContent)});
    L.forEach((b,i)=>{const n=b.querySelector('.ds-leg-img em')?.textContent;if(n!==String(i+1))bad.push('etappenummer '+(i+1)+' is '+n)});
    const last=L[L.length-1];last.click();if(!(tab==='days'&&currentDay===22))bad.push('laatste etappe opent dag 22 niet');
    return bad});v.forEach(x=>errs.push(x))}
  /* v7.6: namen, tikdoelen, tekstgrootte, knop bij kaartvenster */
  const nn=await p.evaluate(()=>Object.keys(V47_SP).filter(k=>{const n=v47Info(k).nl;return (!n||n===k)&&!V76_NL_SAME.has(k)&&!V76_NO_NL.has(k)}));if(nn.length)errs.push('soort zonder NL-naam: '+nn.join(', '));
  const ux=await p.evaluate(()=>{const bad=[];for(const [t,d,s] of [['map'],['wildlife'],['days',3,'wildlife'],['days',16,'map'],['days',7,'overview']]){tab=t;if(d){currentDay=d;daySection=s}render();
    document.querySelectorAll('button,a,select,[role=button]').forEach(el=>{const r=el.getBoundingClientRect();if(r.height>2&&r.height<44&&r.width>0&&!el.closest('svg')&&!el.closest('.ds-credits'))bad.push(t+'/'+(d||'')+' '+(el.className.baseVal??el.className)+' '+Math.round(r.height))});
    document.querySelectorAll('#app *').forEach(el=>{if([...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&el.offsetParent&&!el.closest('svg')&&parseFloat(getComputedStyle(el).fontSize)<12)bad.push(t+'/'+(d||'')+' tekst '+el.tagName+'.'+el.className+' in '+el.parentElement.className+' '+getComputedStyle(el).fontSize)})}
    tab='days';currentDay=16;daySection='map';render();document.querySelector('.v74-hotel.on').dispatchEvent(new MouseEvent('click',{bubbles:true}));if(getComputedStyle(document.querySelector('.ds-fab')).pointerEvents!=='none')bad.push('knop Waarneming over kaartvenster');
    return bad});
  if(ux.length)errs.push('leesbaarheid/tikdoelen: '+[...new Set(ux)].slice(0,8).join('; '));
  const mf=JSON.parse(require('fs').readFileSync(path.resolve(__dirname,'..','manifest.webmanifest'),'utf8'));if(!mf.icons.some(i=>i.purpose==='maskable'))errs.push('geen maskable icoon');
  /* v7.8: alles wat in beeld kwam moet een geverifieerde foto zijn */
  {const seen=[...imgs,...(await p.evaluate(()=>[...window.__imgs||[]]))],ok=await p.evaluate(()=>Object.keys(V48_PHOTO));const bad=new Set();
    const hp=await p.evaluate(()=>v80HAll());seen.forEach(u=>{if(/^(data|blob):|\.svg(\?|$)|icon-/.test(u)||hp.includes(u))return;const m=u.match(/photos\/(.+)\.jpg/);if(!m){bad.add(u.replace(/^.*\//,''));return}const k=m[1];
      if(/^wl\//.test(k))return;if(!ok.includes(k))bad.add(k)});
    if(bad.size)errs.push('niet-geverifieerde afbeelding getoond: '+[...bad].join(', '))}
  /* v8.4: eigen foto's per soort (max 3, favoriet), reisverhaal, foto-back-up (zip) heen en terug */
  {const v=await p.evaluate(async()=>{const bad=[];await v84Load();
    const mk=async(c)=>{const cv=document.createElement('canvas');cv.width=2400;cv.height=1600;const g=cv.getContext('2d');g.fillStyle=c;g.fillRect(0,0,2400,1600);const b=await new Promise(r=>cv.toBlob(r,'image/jpeg',.9));return new File([b],'foto.jpg',{type:'image/jpeg',lastModified:Date.parse('2027-02-24T08:15:00')})};
    const fs=[await mk('#a33'),await mk('#3a3'),await mk('#33a'),await mk('#aa3')];
    const r=await v84Add('Scarlet macaw','Corcovado',fs,16);if(r.added!==3||r.skipped!==1)bad.push('maximaal 3 per soort per dag: '+JSON.stringify(r));
    const own=v84Of('Scarlet macaw');if(own.length!==3)bad.push('aantal eigen foto\'s '+own.length);if(own.filter(x=>x.fav).length!==1)bad.push('precies één favoriet');
    if(Math.max(own[0].w,own[0].h)>1600)bad.push('niet verkleind: '+own[0].w+'x'+own[0].h);
    if(!wl2Rec('Scarlet macaw','Corcovado')?.photo)bad.push('waarneming niet op "op foto" gezet');
    if(!/^blob:/.test(wl2Thumb('Scarlet macaw')))bad.push('eigen foto niet als soortfoto');
    v47Filter='Alle';tab='days';currentDay=17;daySection='wildlife';render();if(!document.querySelector('.ds-sp-img.v84-mine'))bad.push('daglijst toont eigen foto niet');
    wl2Open('Scarlet macaw','Corcovado');const sh=document.getElementById('wl2Sheet');if(sh.querySelectorAll('.v84-ph').length!==3)bad.push('soortvenster toont geen 3 eigen foto\'s');if(sh.querySelector('[data-v84-add^="16|"]'))bad.push('toevoegknop dag 16 zichtbaar bij 3 foto\'s');if(!sh.querySelector('[data-v84-add^="17|"]')||!sh.querySelector('[data-v84-vadd^="17|"]'))bad.push('dag 17 (huidige dag) mist foto-/videoknop');
    if(!/Eigen foto/.test(sh.querySelector('.wl2-credit')?.textContent||''))bad.push('bronvermelding niet "Eigen foto"');wl2Close();
    const second=own[1].id;await v84SetFav(second);if(!v84Fav('Scarlet macaw')||v84Fav('Scarlet macaw').id!==second)bad.push('favoriet wisselen');
    await v84Remove(second);if(v84Of('Scarlet macaw').length!==2||!v84Fav('Scarlet macaw'))bad.push('verwijderen favoriet: nieuwe favoriet ontbreekt');
    const st=v84Story();if(st.map(x=>x.k).join(',')!=='intro,place,sp,end')bad.push('reisverhaal: '+st.map(x=>x.k).join(','));
    tab='wildlife';render();const go=document.getElementById('v84go');if(!go)bad.push('knop Afspelen ontbreekt');else{go.click();const pl=document.getElementById('v84Play');if(!pl)bad.push('reisverhaal opent niet');else{
      v84Show(2);if(!/Geelvleugelara|Scarlet/i.test(pl.textContent))bad.push('soortdia toont naam niet');v84Show(99);if(document.getElementById('v84Play'))bad.push('reisverhaal sluit niet na laatste dia')}}
    const zip=await v84Export();const files=await v84Unzip(zip);const names=Object.keys(files);if(!names.includes('fotos.json')||names.filter(n=>n.endsWith('.jpg')).length!==2)bad.push('zip-inhoud: '+names.join(','));
    if(!state.v84LastBackup)bad.push('foto-back-up niet geregistreerd');
    const ids=V84.list.map(p=>p.id);await v84Write(s=>ids.forEach(id=>s.delete(id)));await v84Load();const n=await v84Import(new File([zip],'b.zip'));if(n!==2||V84.list.length!==2)bad.push('terugzetten: '+n);
    if(await v84Import(new File([zip],'b.zip'))!==0)bad.push('dubbel terugzetten voegt dubbelen toe');
    tab='settings';dsMore='backup';render();if(!document.getElementById('v84exp'))bad.push('foto-back-up ontbreekt in Back-up');
    await v84Write(s=>V84.list.forEach(p=>s.delete(p.id)));await v84Load();tab='home';dsMore='';render();
    return bad});v.forEach(x=>errs.push(x))}
  /* v8.4: opnamedatum uit EXIF (niet de bestandsdatum) */
  {await p.evaluate(()=>{const i=document.createElement('input');i.type='file';i.id='v84t';document.body.append(i)});await p.setInputFiles('#v84t',path.resolve(__dirname,'fixtures','exif.jpg'));
   const ex=await p.evaluate(async()=>{const f=document.getElementById('v84t').files[0];const r=await v84Exif(f);document.getElementById('v84t').remove();return r});if(ex!=='2027-02-09T07:42:13')errs.push('EXIF-opnamedatum: '+ex)}
  /* v8.5: reisvideo (plan, opbouw, ontgrendeldatum, echte MP4 maken, scherm) */
  {const v=await p.evaluate(async()=>{const bad=[];
    const mk=async(c)=>{const cv=document.createElement('canvas');cv.width=1600;cv.height=1067;const g=cv.getContext('2d');g.fillStyle=c;g.fillRect(0,0,1600,1067);const b=await new Promise(r=>cv.toBlob(r,'image/jpeg',.9));return new File([b],'foto.jpg',{type:'image/jpeg'})};
    await v84Add('Keel-billed toucan','La Fortuna',[await mk('#c62'),await mk('#2c6')]);
    v52Set('Mantled howler monkey','Cahuita','seen',true);state.v43Observations[v43name('Mantled howler monkey')].places.Cahuita.t='2027-02-09T14:20:00.000Z';
    const plan=v85Plan(),tou=plan.items.find(i=>i.name==='Keel-billed toucan'),how=plan.items.find(i=>i.name==='Mantled howler monkey');
    if(!tou||!tou.own||tou.photos.length!==1)bad.push('reisvideo: eigen foto\'s ontbreken');
    if(!how||how.own||how.day!==2||!/^\.\/photos\/wl\//.test(how.photos[0]||'')||!/^© .+ · .+/.test(how.credit||''))bad.push('reisvideo: voorbeeldfoto met bron of dag ontbreekt: '+JSON.stringify(how));
    const days=plan.days.map(d=>d.day);if(days.join()!==[...days].sort((a,b)=>a-b).join())bad.push('reisvideo: dagen niet op volgorde');
    const segs=v85Segments(plan,true);if(segs[0].k!=='intro'||segs[1].k!=='day'||!/,end(,credits)?(,mosaic)?$/.test(segs.map(s=>s.k).join(',')))bad.push('reisvideo: opbouw '+segs.map(s=>s.k).join(','));
    if(!/Proef/i.test(segs[0].label))bad.push('reisvideo: proefvideo niet gemarkeerd');
    const hs=segs.find(s=>s.k==='sp'&&s.title===v47Info('Mantled howler monkey').nl);if(!hs||!/^Voorbeeldfoto · ©/.test(hs.credit)||!/Zoogdier$/.test(hs.label)||!/Cahuita/.test(hs.meta))bad.push('reisvideo: soortdia voorbeeldfoto '+JSON.stringify(hs));
    if(v85Open(new Date('2027-03-01T23:59:00'))||!v85Open(new Date('2027-03-02T00:00:01')))bad.push('reisvideo: ontgrendeldatum');
    tab='wildlife';render();let go=document.getElementById('v85go');if(!go||!/Reisvideo maken/.test(go.textContent))bad.push('reisvideo: knop Reisvideo maken ontbreekt (altijd beschikbaar)');
    V85.SCALE=.08;
    try{const out=await v85Make({proef:true,disk:false});const head=new Uint8Array(await out.blob.slice(0,8).arrayBuffer());
      if(String.fromCharCode(...head.slice(4,8))!=='ftyp')bad.push('reisvideo: geen MP4');
      const vid=document.createElement('video');vid.muted=true;vid.src=URL.createObjectURL(out.blob);
      const dur=await new Promise(r=>{vid.onloadedmetadata=()=>r(vid.duration);vid.onerror=()=>r(-1);setTimeout(()=>r(-2),8000)});
      if(Math.abs(dur-out.seconds)>.2||vid.videoWidth!==1920||vid.videoHeight!==1080)bad.push(`reisvideo: ${dur}s ${vid.videoWidth}x${vid.videoHeight}, verwacht ${out.seconds}s 1920x1080`);
      go=document.getElementById('v85go');go.click();document.querySelector('#v85Gen [data-v85="go"]')?.click();let t=0;while(!document.querySelector('.v85-vid')&&t++<200)await new Promise(r=>setTimeout(r,100));
      const gen=document.getElementById('v85Gen');if(!document.querySelector('.v85-vid'))bad.push('reisvideo: scherm toont geen video: '+(gen?.textContent||'').slice(0,120));
      else if(!gen.querySelector('a[download$=".mp4"]'))bad.push('reisvideo: downloadknop ontbreekt');
      v85Close();if(document.getElementById('v85Gen'))bad.push('reisvideo: sluiten werkt niet')}
    catch(e){bad.push('reisvideo maken: '+e.message)}
    V85.SCALE=1;await v84Write(s=>V84.list.forEach(x=>s.delete(x.id)));await v84Load();delete state.v43Observations[v43name('Mantled howler monkey')];delete state.v43Observations[v43name('Keel-billed toucan')];save();tab='home';render();
    return bad});v.forEach(x=>errs.push(x))}
  /* v8.6: waarnemingen per dag, foto's/video per dag, video in de reisvideo, back-up met video */
  {const v=await p.evaluate(async()=>{const bad=[];const N='Keel-billed toucan',R='La Fortuna';
    if(v47Region(S[5])!==R||v47Region(S[6])!==R)bad.push('testaanname: dag 6 en 7 La Fortuna');
    const card=()=>[...document.querySelectorAll('[data-v43-species="'+encodeURIComponent(N)+'"][data-v43-kind="seen"]')][0];
    v47Filter='Alle';tab='days';daySection='wildlife';currentDay=6;render();let b=card();if(!b){bad.push('dag 6: toekan niet in daglijst');return bad}
    b.click();const o=()=>state.v43Observations[v43name(N)];if(!o()?.days?.[6]||!o().places[R]?.seen)bad.push('dag 6 aanvinken: '+JSON.stringify(o()));
    currentDay=7;render();b=card();if(b.classList.contains('on'))bad.push('dag 7 toont vinkje van dag 6');b.click();if(!o().days[7]||!o().days[6])bad.push('dag 7 erbij: '+JSON.stringify(o().days));
    currentDay=6;render();card().click();if(o().days[6]||!o().places[R].seen)bad.push('dag 6 uit: bestemming moet gezien blijven (dag 7)');
    if(!/dag 7/.test(card().closest('.v43-species').textContent))bad.push('dag 6 toont niet "dag 7" bij eerder/ook gezien');
    currentDay=7;render();card().click();if(o().places[R].seen||Object.keys(o().days).length)bad.push('dag 7 uit: soort moet niet gezien zijn');
    /* buiten een dag: per bestemming, krijgt een dag */
    tab='wildlife';render();v52Set(N,R,'seen');if(!o().places[R].seen||Object.values(o().days).filter(r=>r.r===R).length!==1)bad.push('Wildlife-pagina: geen dag bij vinkje');
    v52Set(N,R,'seen');if(Object.keys(o().days).length)bad.push('Wildlife-pagina uit: dagen niet weg');
    /* video maken (VP9-mp4 uit de reisvideo-maker, 7 s) en toevoegen aan dag 7 */
    V85.SCALE=1;const segs=[{k:'intro',dur:7,src:'',label:'Test',title:'Testvideo',sub:'',meta:''}];
    const src=await v85Make({segs,proef:true,disk:false});const file=new File([src.blob],'clip.mp4',{type:'video/mp4'});
    const mk=async(c)=>{const cv=document.createElement('canvas');cv.width=1600;cv.height=1067;const g=cv.getContext('2d');g.fillStyle=c;g.fillRect(0,0,1600,1067);const bl=await new Promise(r=>cv.toBlob(r,'image/jpeg',.9));return new File([bl],'f.jpg',{type:'image/jpeg'})};
    v52Set(N,R,'seen');/* eerste waarneming dag 6 (via Wildlife-pagina, dag = eerste dag bestemming) */
    tab='days';currentDay=7;
    try{const rec=await v84AddVideo(N,R,7,file,1);if(rec.kind!=='video'||Math.abs(rec.dur-5)>.05||!rec.poster||!rec.blob.size)bad.push('video toevoegen: '+JSON.stringify({k:rec.kind,d:rec.dur,p:!!rec.poster}));
      const vv=document.createElement('video');vv.muted=true;vv.src=URL.createObjectURL(rec.blob);const dd=await new Promise(r=>{vv.onloadedmetadata=()=>r(vv.duration);vv.onerror=()=>r(-1);setTimeout(()=>r(-2),5000)});if(Math.abs(dd-5)>.1)bad.push('opgeslagen video duurt '+dd);
      let threw=false;try{await v84AddVideo(N,R,7,file,0)}catch(e){threw=true}if(!threw)bad.push('tweede video op dezelfde dag toegestaan')}
    catch(e){bad.push('video toevoegen mislukt: '+e.message)}
    await v84Add(N,R,[await mk('#c62')],7);
    if(!o().days[7]||!o().days[6])bad.push('dagen na media: '+JSON.stringify(o().days));
    wl2Open(N,R);const sh=document.getElementById('wl2Sheet');if(!sh.querySelector('[data-v84-play]'))bad.push('soortvenster toont video niet');if(sh.querySelector('[data-v84-vadd^="7|"]'))bad.push('videoknop dag 7 zichtbaar bij 1 video');
    if(!/dag 7/i.test(sh.querySelector('.wl2-reg .ds-label')?.textContent||''))bad.push('soortvenster in dag-context noemt dag niet');
    sh.querySelector('[data-v84-play]')?.click();if(!document.querySelector('#v84Vid video'))bad.push('video afspelen opent niet');v84VidClose();wl2Close();
    /* reisvideo: dag 6 voorbeeldfoto, dag 7 opnieuw gezien met eigen foto en video */
    const plan=v85Plan(),its=plan.items.filter(i=>i.sp===v43name(N));
    if(its.length!==2||its[0].own||its[0].day!==6||!its[1].repeat||its[1].day!==7||its[1].clips.length!==1)bad.push('plan per waarneming: '+JSON.stringify(its.map(i=>[i.day,i.own,i.repeat,i.clips.length])));
    const sg=v85Segments(plan,true).filter(x=>x.title===v47Info(N).nl);
    if(!sg.some(x=>x.clip&&/^Eigen video/.test(x.credit))||!sg.some(x=>/opnieuw gezien/.test(x.label)))bad.push('segmenten: '+JSON.stringify(sg.map(x=>[x.label,x.credit,!!x.clip])));
    V85.SCALE=.15;try{const out=await v85Make({proef:true,disk:false});if(!out.blob.size)bad.push('reisvideo met eigen video leeg')}catch(e){bad.push('reisvideo met eigen video: '+e.message)}V85.SCALE=1;
    /* back-up met video heen en terug */
    const zip=await v84Export(),fl=Object.keys(await v84Unzip(zip));if(!fl.some(n=>n.endsWith('.mp4'))||!fl.some(n=>n.endsWith('-poster.jpg')))bad.push('zip zonder video: '+fl.join(','));
    const ids=V84.list.concat(V84.vids).map(x=>x.id);await v84Write(st=>ids.forEach(id=>st.delete(id)));await v84Load();
    const n=await v84Import(new File([zip],'b.zip'));if(n!==2||V84.vids.length!==1||!V84.poster[V84.vids[0].id])bad.push('terugzetten met video: '+n);
    await v84Write(st=>V84.list.forEach(x=>st.delete(x.id)));await v84Load();delete state.v43Observations[v43name(N)];save();tab='home';render();
    return bad});v.forEach(x=>errs.push(x))}
  /* v8.7: sfeerfoto's per dag, keuze per dag (15 dieren, 3 video's, 5 sfeerfoto's), beste foto per dier */
  {const v=await p.evaluate(async()=>{const bad=[];
    const mk=async(c,noise)=>{const cv=document.createElement('canvas');cv.width=1200;cv.height=800;const g=cv.getContext('2d');g.fillStyle=c;g.fillRect(0,0,1200,800);
      if(noise)for(let i=0;i<4000;i++){g.fillStyle=i%2?'#000':'#fff';g.fillRect(Math.random()*1200,Math.random()*800,3,3)}const bl=await new Promise(r=>cv.toBlob(r,'image/jpeg',.9));return new File([bl],'f.jpg',{type:'image/jpeg'})};
    /* sfeerfoto's in Overzicht, max. 5 */
    tab='days';currentDay=3;daySection='overview';render();if(!document.querySelector('.v84-mood [data-v84-madd="3"]'))bad.push('sfeerfoto-sectie ontbreekt in Overzicht');
    const fs=[];for(let i=0;i<16;i++)fs.push(await mk('#'+(i%7+3)+'a7'));const rm=await v84AddMood(3,fs);if(rm.added!==15||rm.skipped!==1)bad.push('sfeerfoto\'s max. 15: '+JSON.stringify(rm));
    render();if(document.querySelectorAll('.v84-mood .v84-ph').length!==15||document.querySelector('[data-v84-madd="3"]'))bad.push('sfeerfoto-sectie toont 5 niet of laat nog toevoegen toe');
    /* 17 dieren op dag 8: 15 in de video, zeldzaamste eerst */
    const clipRec=V84.vids[0];if(clipRec){await v84Write(st=>st.delete(clipRec.id));await v84Load()}
    const R=v47Region(S[7]),names=(V47_PLACES[R]||[]).map(x=>x[0]).slice(0,17);tab='days';currentDay=8;daySection='wildlife';
    names.forEach(n=>v52Set(n,R,'seen',true));
    /* beste foto: ster wint; zonder ster de scherpste */
    const A=names[0],B=names[1];await v84Add(A,R,[await mk('#7a8'),await mk('#7a8',true)],8);
    const pa=V84.list.filter(x=>x.sp===v43name(A));const sharp=pa.reduce((a,b)=>(b.sharp>a.sharp?b:a));if(!(pa[0].sharp>=0)||sharp.sharp<=Math.min(...pa.map(x=>x.sharp)))bad.push('scherpte niet gemeten: '+pa.map(x=>x.sharp));
    /* 4 video's op dag 8: 3 in de video, ster gaat voor */
    if(!clipRec)bad.push('testaanname: video uit v8.6-test ontbreekt');
    let plan=v85Plan(),pd=plan.days.find(x=>x.day===8);
    if(!pd||pd.items.length!==15||pd.cut.animals!==2)bad.push('dag 8: '+(pd?pd.items.length+' dieren, '+pd.cut.animals+' eruit':'geen dag'));
    else{const sc=names.map(n=>({n,c:v47Chance(R,n)}));const inV=new Set(pd.items.map(i=>i.sp)),out=sc.filter(x=>!inV.has(v43name(x.n))),inn=sc.filter(x=>inV.has(v43name(x.n)));
      const rank=c=>({1:40,2:25,3:10,4:0}[c]??15);if(out.some(o=>inn.some(i=>rank(i.c)<rank(o.c)&&i.n!==A)))bad.push('keuze niet op zeldzaamheid: '+JSON.stringify(out))}
    {const own=pd.items.filter(i=>i.own).length,ownAll=new Set(V84.list.filter(x=>x.day===8).map(x=>x.sp)).size;if(own!==Math.min(15,ownAll))bad.push('eigen foto\'s niet altijd voorrang: '+own+'/'+ownAll)}
    const itA=pd&&pd.items.find(i=>i.sp===v43name(A));if(!itA||itA.photos[0]!==V84.url[sharp.id])bad.push('scherpste foto niet gekozen: '+JSON.stringify({it:!!itA,sh:pa.map(x=>[x.sharp,x.fav,x.day])}));
    const fav=pa.find(x=>x.id!==sharp.id);await v84SetFav(fav.id);plan=v85Plan();pd=plan.days.find(x=>x.day===8);{const x=pd.items.find(i=>i.sp===v43name(A));if(x?.photos[0]!==V84.url[fav.id])bad.push('ster-foto niet gekozen: '+JSON.stringify({x:!!x,n:pd.items.length,fu:V84.list.filter(p=>p.sp===v43name(A)).map(p=>[p.id===fav.id,p.fav,p.favUser,p.day])}))}
    if(pd.items.filter(i=>i.photos.length>1).length)bad.push('meer dan 1 foto per dier per dag');
    if(clipRec){await v84Write(st=>names.slice(2,6).forEach((n,i)=>st.put({...clipRec,id:'tclip'+i,sp:v43name(n),name:n,region:R,day:8,fav:i===3})));await v84Load();
      pd=v85Plan().days.find(x=>x.day===8);const cl=pd.items.filter(i=>i.clips.length);if(cl.length!==3||pd.cut.clips!==1)bad.push('video\'s per dag: '+cl.length+', eruit '+pd.cut.clips);
      if(!cl.some(i=>i.sp===v43name(names[5])))bad.push('video met ster niet gekozen');
      await v84Write(st=>[0,1,2,3].forEach(i=>st.delete('tclip'+i)));await v84Load()}
    const sg=v85Segments(v85Plan(),true),i3=sg.findIndex(x=>x.k==='day'&&x.day===3),d3=sg.filter(x=>x.hud==='Dag 3 · '+v47Region(S[2])&&(x.k==='collage'||x.k==='mood'));if(i3<0||d3.reduce((n,x)=>n+(x.k==='mood'?1:x.srcs.length),0)!==15||sg[i3+1].k!=='collage'||d3.some(x=>x.srcs&&x.srcs.length>4))bad.push('sfeerfoto\'s dag 3 niet als groepen van max. 4 direct na de dag: '+d3.map(x=>x.k+':'+(x.srcs?.length||1)));
    render();if(!/In de reisvideo/.test(document.querySelector('.v85-daysel')?.textContent||''))bad.push('keuze per dag ontbreekt in Wildlife-tabblad');
    /* back-up met sfeerfoto's */
    const zip=await v84Export(),fl=Object.keys(await v84Unzip(zip));if(fl.filter(n=>/-sfeer-/.test(n)).length!==15)bad.push('zip zonder sfeerfoto\'s');
    await v84Write(st=>V84.list.concat(V84.vids,V84.moods).forEach(x=>st.delete(x.id)));await v84Load();names.forEach(n=>delete state.v43Observations[v43name(n)]);save();tab='home';render();
    return bad});v.forEach(x=>errs.push(x))}
  /* v8.8: zoeken op kenmerken, nieuw Waarneming-venster */
  {const v=await p.evaluate(()=>{const bad=[],T='Keel-billed toucan',Q='Resplendent quetzal',f=v88Feat(T);
    if(!['groen','geel','rood','zwart','oranje'].every(c=>f.colors.has(c))||f.colors.has('blauw')||f.size!=='groot')bad.push('kenmerken toekan: '+[...f.colors]+' '+f.size);
    if(!v88Match(Q,'rode buik')||!v88Match(T,'rode snavel')||v88Match(T,'blauwe')||!v88Match(T,'toucan'))bad.push('zoeken op kenmerken');
    {const g=n=>v88Feat(Object.keys(V47_SP).find(k=>v47Info(k).nl===n)||n);const o=g('Oranjebuiktrogon'),k=g('Kraagplevier'),w=g('Noord-Amerikaanse waterspreeuw');
     if(o.colors.has('rood'))bad.push('"geen rode buik" telt als rood');if(k.colors.has('roze')||k.colors.has('geel'))bad.push('pootkleur telt als hoofdkleur');if(w.colors.has('wit'))bad.push('kleur oogleden telt als hoofdkleur');
     if(!g('Bruinkaporganist').colorsAll.has('groen')||g('Bruinkaporganist').colors.has('groen'))bad.push('vrouwtjeskleur: wel zoekbaar, geen bolletje')}
    const night=Object.keys(V47_SP).filter(n=>v88Match(n,'nacht')).length;if(night<50)bad.push('nachtdieren: '+night);
    v50GlobalSearch('rode buik');const box=document.getElementById('v50gres');if(box&&!/Quetzal/.test(box.textContent))bad.push('"Waar zie ik" vindt quetzal niet op "rode buik"');
    return bad});v.forEach(x=>errs.push(x))}
  {await p.evaluate(()=>{V88.f.q='';tab='days';currentDay=6;daySection='overview';render()});await p.click('#v52open');await p.waitForSelector('#v88q');
   await p.fill('#v88q','rode buik');await p.waitForTimeout(350);
   let r=await p.evaluate(()=>({els:document.querySelector('#v52quick .v88-list').textContent,rows:document.querySelectorAll('#v52quick .v88-row').length}));
   if(!/Quetzal/.test(r.els)||!/Elders in Costa Rica/.test(r.els))errs.push('Waarneming: "rode buik" vindt quetzal (elders) niet');
   await p.fill('#v88q','');await p.waitForTimeout(350);await p.click('#v52quick [data-v88-k]');await p.click('#v52quick [data-v88-col="blauw"]');await p.click('#v52quick [data-v88-grp="Vogels"]');
   r=await p.evaluate(()=>{const l=[...document.querySelectorAll('#v52quick .v88-row')].map(x=>decodeURIComponent(x.dataset.v88));return {n:l.length,bad:l.filter(n=>!v88Feat(n).colorsAll.has('blauw')||v88Feat(n).cat!=='Vogels')}});
   if(!r.n||r.bad.length)errs.push('Waarneming: filter blauw+vogels: '+JSON.stringify(r));
   await p.click('#v52quick [data-v88-reset]');await p.fill('#v88q','toekan');await p.waitForTimeout(350);
   const T=encodeURIComponent('Keel-billed toucan');await p.click(`#v52quick .v88-row[data-v88="${T}"] [data-v88-seen]`);
   r=await p.evaluate(()=>({d:!!state.v43Observations[v43name('Keel-billed toucan')]?.days?.[6],today:document.querySelector('#v52quick .v88-today')?.textContent||''}));
   if(!r.d||!/Zwavelborsttoekan/.test(r.today))errs.push('Waarneming: gezien vandaag/Vandaag geregistreerd: '+JSON.stringify(r));
   await p.setInputFiles(`#v52quick .v88-row[data-v88="${T}"] [data-v88-photo]`,path.resolve(__dirname,'fixtures','exif.jpg'));await p.waitForTimeout(800);
   r=await p.evaluate(()=>V84.list.filter(x=>x.sp===v43name('Keel-billed toucan')&&x.day===6).length);if(r!==1)errs.push('Waarneming: foto via lijst niet toegevoegd: '+r);
   await p.setInputFiles('#v88mood',path.resolve(__dirname,'fixtures','exif.jpg'));await p.waitForTimeout(800);
   r=await p.evaluate(()=>V84.moods.filter(x=>x.day===6).length);if(r!==1)errs.push('Waarneming: sfeerfoto-knop: '+r);
   await p.click(`#v52quick .v88-row[data-v88="${T}"] [data-v88-open]`);await p.waitForSelector('#wl2Sheet');
   r=await p.evaluate(()=>{const s=document.querySelector('#wl2Sheet .wl2-sheet').getBoundingClientRect(),el=document.elementFromPoint(s.left+s.width/2,s.top+40);return !!el&&!!el.closest('#wl2Sheet')});if(!r)errs.push('soortvenster vanuit Waarneming ligt niet bovenop');await p.evaluate(()=>history.back());await p.waitForTimeout(300);
   r=await p.evaluate(()=>({sheet:!!document.getElementById('wl2Sheet'),quick:!!document.getElementById('v52quick')}));if(r.sheet||!r.quick)errs.push('terugknop: eerst soortvenster sluiten, Waarneming blijft open: '+JSON.stringify(r));
   await p.click('#v52close');
   r=await p.evaluate(()=>{tab='days';currentDay=6;daySection='wildlife';v47Filter='Alle';render();const q=document.getElementById('v50q');q.value='nacht';q.dispatchEvent(new Event('input'));
     const vis=[...document.querySelectorAll('.v47-sp')].filter(c=>c.style.display!=='none').map(c=>decodeURIComponent(c.querySelector('[data-wl2]')?.dataset.wl2||''));q.value='';q.dispatchEvent(new Event('input'));v50Query='';return {n:vis.length,bad:vis.filter(n=>n&&!v88Match(n,'nacht'))}});
   if(!r.n||r.bad.length)errs.push('daglijst: zoeken op "nacht": '+JSON.stringify(r));
   await p.evaluate(async()=>{await v84Write(st=>V84.list.concat(V84.vids,V84.moods).forEach(x=>st.delete(x.id)));await v84Load();delete state.v43Observations[v43name('Keel-billed toucan')];save();V88.f.q='';tab='home';render()})}
  /* v8.9: reisvideo op Home, controle per dag, einde reis, bevestiging */
  {const v=await p.evaluate(async()=>{const bad=[];const keepEnd=v89Ended;delete state.v89Made;v52Set('Mantled howler monkey','Cahuita','seen',true);
    tab='home';render();const card=document.querySelector('.v89-card');if(!card)return ['Home: kaart Reisvideo ontbreekt'];
    if(!/Reisvideo maken/.test(document.getElementById('v89go')?.textContent||''))bad.push('Home: knop Reisvideo maken niet altijd beschikbaar');if(/Beschikbaar vanaf/.test(card.textContent))bad.push('Home: nog een datumslot zichtbaar');
    if(!new RegExp('0 van '+S.length+' dagen compleet').test(card.textContent))bad.push('Home: telling dagen compleet');
    if(v89Ended(new Date(S[S.length-1].date+'T00:00:01'))!==true||v89Ended(new Date(S[S.length-2].date+'T23:59:00'))!==false)bad.push('einde reis volgt de laatste reisdag niet');
    /* dag 9 compleet maken met 5 sfeer, 15 dieren met foto, 3 video's */
    const cv=document.createElement('canvas');cv.width=320;cv.height=200;const bl=await new Promise(r=>cv.toBlob(r,'image/jpeg'));const R=v47Region(S[8]),names=(V47_PLACES[R]||[]).map(x=>x[0]).slice(0,15);
    const recs=[];for(let i=0;i<5;i++)recs.push({id:'t89m'+i,sp:'',name:'',region:R,day:9,kind:'mood',t:'2027-02-16T10:00:00Z',taken:'',w:320,h:200,blob:bl,fav:false});
    names.forEach((n,i)=>recs.push({id:'t89p'+i,sp:v43name(n),name:n,region:R,day:9,kind:'photo',t:'2027-02-16T10:00:00Z',taken:'',w:320,h:200,blob:bl,fav:false}));
    for(let i=0;i<3;i++)recs.push({id:'t89v'+i,sp:v43name(names[i]),name:names[i],region:R,day:9,kind:'video',t:'2027-02-16T10:00:00Z',taken:'',w:320,h:200,dur:1,blob:bl,poster:bl,fav:false});
    await v84Write(st=>recs.forEach(r=>st.put(r)));await v84Load();
    if(!v89Day(9).ok||v89Day(10).ok)bad.push('dag compleet: '+JSON.stringify([v89Day(9),v89Day(10)]));
    recs.slice(0,1).forEach(()=>{});await v84Write(st=>st.delete('t89m0'));await v84Load();if(v89Day(9).ok)bad.push('dag 9 met 4 sfeerfoto\'s telt als compleet');
    await v84Write(st=>st.delete('t89v0'));await v84Write(st=>[...recs.filter(r=>r.kind==='video').map(r=>r.id)].forEach(id=>st.delete(id)));await v84Load();
    /* einde reis: banner bovenaan, knop Reisvideo maken, waarschuwing bij onvolledige dagen, bevestiging */
    v89Ended=()=>true;render();if(!/Jullie reis zit erop/.test(document.querySelector('.v89-card')?.textContent||''))bad.push('einde reis: herinnering ontbreekt');
    if(!/Reisvideo maken/.test(document.getElementById('v89go')?.textContent||''))bad.push('einde reis: knop Reisvideo maken ontbreekt');
    let asked='';const keepConfirm=window.confirm;window.confirm=m=>{asked=m;return false};await v89Start();if(!/niet compleet/.test(asked)||document.getElementById('v85Gen'))bad.push('waarschuwing onvolledige dagen');
    window.confirm=()=>true;V85.SCALE=.06;await v89Start();if(!document.querySelector('#v85Gen [data-v85="go"]'))bad.push('keuzevenster ontbreekt');await v85Run({});V85.SCALE=1;window.confirm=keepConfirm;
    if(!state.v89Made||!V89.last)bad.push('bevestiging niet bewaard: '+JSON.stringify(state.v89Made));
    v85Close();tab='home';render();const c2=document.querySelector('.v89-card');if(!/Reisvideo gemaakt op/.test(c2?.textContent||'')||!document.getElementById('v89share')||!/Opnieuw maken/.test(document.getElementById('v89go')?.textContent||''))bad.push('Home na maken: bevestiging/knoppen');
    document.querySelector('[data-v89-day="9"]').click();if(tab!=='days'||currentDay!==9)bad.push('dag in controle opent die dag niet');
    v89Ended=keepEnd;delete state.v89Made;try{URL.revokeObjectURL(V89.last.url)}catch(e){}V89.last=null;
    await v84Write(st=>recs.forEach(r=>st.delete(r.id)));await v84Load();save();tab='home';render();
    return bad});v.forEach(x=>errs.push(x))}
  /* v8.10: variatie, onderwerp in beeld, collage, vertraging, aftiteling en mozaïek */
  {const v=await p.evaluate(async()=>{const bad=[];
    /* onderwerp: scherpe helft rechts, vage helft links → focus rechts */
    const cv=document.createElement('canvas');cv.width=800;cv.height=450;const g=cv.getContext('2d');g.fillStyle='#486';g.fillRect(0,0,800,450);for(let i=0;i<3000;i++){g.fillStyle=i%2?'#000':'#fff';g.fillRect(560+Math.random()*200,120+Math.random()*200,3,3)}
    const f=v85Focus(cv);if(!(f.x>.6&&f.y>.35&&f.y<.65))bad.push('onderwerp niet gevonden: '+JSON.stringify(f));
    /* vertraging: eerste 40% normaal, daarna half zo snel, daarna stilstaand */
    const sg={clip:{dur:5},slow:true};if(Math.abs(v85ClipT(sg,1)-1)>.01||Math.abs(v85ClipT(sg,4)-3)>.01||v85ClipT(sg,20)>4.98)bad.push('vertraging klopt niet');
    /* plan met 12 dieren (eigen foto's, liggend) + 5 sfeerfoto's op dag 6 */
    const bl=await new Promise(r=>cv.toBlob(r,'image/jpeg')),R=v47Region(S[5]),names=(V47_PLACES[R]||[]).map(x=>x[0]).slice(0,12),recs=[];
    names.forEach((n,i)=>recs.push({id:'t10p'+i,sp:v43name(n),name:n,region:R,day:6,kind:'photo',t:'2027-02-13T0'+(i%9)+':00:00Z',taken:'',w:800,h:450,sharp:i,blob:bl,fav:false}));
    for(let i=0;i<5;i++)recs.push({id:'t10m'+i,sp:'',name:'',region:R,day:6,kind:'mood',t:'x',taken:'',w:800,h:450,blob:bl});
    await v84Write(st=>recs.forEach(r=>st.put(r)));await v84Load();
    const segs=v85Segments(v85Plan(),true),sp=segs.filter(x=>x.k==='sp'),lays=sp.map(x=>x.lay),trs=segs.filter(x=>x.hud&&x.k!=='day').map(x=>x.trans);
    if(new Set(lays).size<2)bad.push('opmaak varieert niet: '+lays);
    for(let i=2;i<lays.length;i++)if(lays[i]===lays[i-1]&&lays[i]===lays[i-2])bad.push('3× dezelfde opmaak achter elkaar');
    for(let i=1;i<trs.length;i++)if(trs[i]===trs[i-1]&&trs[i]!=='fade')bad.push('2× dezelfde overgang achter elkaar: '+trs[i]);
    if(new Set(trs).size<3)bad.push('te weinig verschillende overgangen: '+[...new Set(trs)]);
    const col=segs.filter(x=>x.k==='collage'),nm=col.reduce((n,x)=>n+x.srcs.length,0)+segs.filter(x=>x.k==='mood').length+segs.filter(x=>x.k==='pair').reduce((n,x)=>n+x.panels.filter(p=>p.mood).length,0);if(nm!==5||!col.length)bad.push('sfeerfoto\'s in collage/combinatie: '+nm);
    const cr=segs.find(x=>x.k==='credits'),mo=segs.find(x=>x.k==='mosaic');if(!cr||!cr.groups.length||!cr.groups.some(g=>g.names.some(n=>n.own)))bad.push('aftiteling ontbreekt of zonder eigen soorten');if(!mo||mo.srcs.length<4)bad.push('mozaïek ontbreekt');
    V85.SCALE=.08;try{const out=await v85Make({proef:true,disk:false});if(!out.blob.size)bad.push('video v8.10 leeg')}catch(e){bad.push('video v8.10: '+e.message)}V85.SCALE=1;
    await v84Write(st=>recs.forEach(r=>st.delete(r.id)));await v84Load();return bad});v.forEach(x=>errs.push(x))}
  /* v8.11: korte versie en staand formaat */
  {const v=await p.evaluate(async()=>{const bad=[];
    const cv=document.createElement('canvas');cv.width=800;cv.height=450;cv.getContext('2d').fillRect(0,0,10,10);const bl=await new Promise(r=>cv.toBlob(r,'image/jpeg')),recs=[];
    for(const d of [2,4,6,8,10]){const R=v47Region(S[d-1]),names=(V47_PLACES[R]||[]).map(x=>x[0]).slice(0,4);names.forEach((n,i)=>recs.push({id:`t11p${d}${i}`,sp:v43name(n),name:n,region:R,day:d,kind:'photo',t:'x',taken:'',w:800,h:450,blob:bl,fav:false}));
      recs.push({id:'t11m'+d,sp:'',name:'',region:R,day:d,kind:'mood',t:'x',taken:'',w:800,h:450,blob:bl})}
    await v84Write(st=>recs.forEach(r=>st.put(r)));await v84Load();
    const plan=v85Plan(),full=v85Segments(plan,true),short=v85Short(plan,true),spS=short.filter(x=>x.k==='sp');
    if(!short.length||spS.length!==Math.min(20,plan.days.filter(d=>d.items.some(i=>i.still||i.clips.length)).length)||spS.length<5||v85Seconds(short)>=v85Seconds(full)||!['intro','cold'].includes(short[0].k)||!short.some(x=>x.k==='end'))bad.push('korte versie: '+short.map(x=>x.k).join(',')+' '+v85Seconds(short)+'/'+v85Seconds(full));
    if(new Set(spS.map(x=>x.hud.split(' · ')[0])).size!==spS.length)bad.push('korte versie: niet 1 dier per dag');
    V85.SCALE=.05;try{const out=await v85Make({proef:true,disk:false,portrait:true,short:true});const vid=document.createElement('video');vid.muted=true;vid.src=URL.createObjectURL(out.blob);
      await new Promise(r=>{vid.onloadedmetadata=r;vid.onerror=r;setTimeout(r,6000)});if(vid.videoWidth!==1080||vid.videoHeight!==1920)bad.push('staand formaat: '+vid.videoWidth+'x'+vid.videoHeight)}
    catch(e){bad.push('staande korte video: '+e.message)}V85.SCALE=1;
    if(V85.W!==1920||V85.H!==1080)bad.push('formaat niet hersteld na staande video');
    v85Start();if(!document.querySelector('#v85Gen [data-o="short"]')||!document.querySelector('#v85Gen [data-f="port"]'))bad.push('keuze versie/formaat ontbreekt');v85Close();
    if(!document.querySelector)0;v85Start();if(!document.querySelector('#v85Gen [data-f="both"]'))bad.push('keuze "Beide" ontbreekt');v85Close();
    V85.SCALE=.04;await v85Run({short:true,fmt:'both'});V85.SCALE=1;
    if(!v85Out||(v85Out.items||[]).length!==2||!v85Out.items[1].portrait||v85Out.items[0].portrait)bad.push('beide formaten: '+(v85Out?.items||[]).length);
    const dl=[...document.querySelectorAll('#v85Gen a[download]')].map(a=>a.download);if(dl.length!==2||!dl.some(n=>/staand/.test(n))||!dl.some(n=>!/staand/.test(n)))bad.push('twee downloads: '+dl);
    v85Close();if(V85.W!==1920)bad.push('formaat niet hersteld na beide');
    await v84Write(st=>recs.forEach(r=>st.delete(r.id)));await v84Load();return bad});v.forEach(x=>errs.push(x))}
  /* v8.15: 15 sfeerfoto's met label, ons verblijf, combinaties, video's verspreid */
  {const v=await p.evaluate(async()=>{const bad=[];const cv=document.createElement('canvas');cv.width=800;cv.height=450;cv.getContext('2d').fillRect(0,0,10,10);const bl=await new Promise(r=>cv.toBlob(r,'image/jpeg'));
    const R=v47Region(S[5]),names=(V47_PLACES[R]||[]).map(x=>x[0]).slice(0,15),recs=[];
    names.forEach((n,i)=>{recs.push({id:'t15p'+i,sp:v43name(n),name:n,region:R,day:6,kind:'photo',t:'x',taken:`2027-02-13T${String(6+i).padStart(2,'0')}:00:00`,w:800,h:450,sharp:i,blob:bl,fav:false});v52Set(n,R,'seen',true)});
    for(let i=0;i<3;i++)recs.push({id:'t15v'+i,sp:v43name(names[i*4]),name:names[i*4],region:R,day:6,kind:'video',t:'x',taken:'',w:800,h:450,dur:5,start:0,blob:bl,poster:bl,fav:false});
    for(let i=0;i<15;i++)recs.push({id:'t15m'+String(i).padStart(2,'0'),sp:'',name:'',region:R,day:6,kind:'mood',label:i<3?'La Fortuna Waterfall':'',t:'x',taken:`2027-02-13T${String(6+i).padStart(2,'0')}:10:00`,w:800,h:450,blob:bl});
    recs.push({id:'t15s1',sp:'',name:'',region:R,day:6,kind:'stay',label:'',t:'x',taken:'',w:800,h:450,blob:bl},{id:'t15s2',sp:'',name:'',region:R,day:7,kind:'stay',label:'',t:'x',taken:'',w:800,h:450,blob:bl});
    await v84Write(st=>recs.forEach(r=>st.put(r)));await v84Load();state.v815Stay[6]='Testlodge';state.v815Stay[7]='Testlodge';
    if(v815HotelOf(4)!=='Lapa Verde Lodge')bad.push('verblijf dag 4 niet automatisch: '+v815HotelOf(4));
    const segs=v85Segments(v85Plan(),true),d6=segs.filter(x=>x.hud==='Dag 6 · '+R),i6=segs.findIndex(x=>x.k==='day'&&x.day===6);
    const st=segs.filter(x=>x.k==='stay');if(st.length!==1||st[0].title!=='Testlodge'||segs[i6+1]?.k!=='stay')bad.push('verblijf één keer na de dagkaart: '+st.map(x=>x.title));
    const clips=d6.filter(x=>x.clip);if(clips.length!==3||clips.some(x=>x.slow||x.clip.dur>5||x.dur>5.5))bad.push('video\'s: '+clips.map(x=>x.dur));
    for(let i=1;i<d6.length;i++)if(d6[i].clip&&d6[i-1].clip)bad.push('twee video\'s achter elkaar');
    const pairs=d6.filter(x=>x.k==='pair');if(!pairs.length||pairs.some(x=>x.dur<4))bad.push('combinaties ontbreken of te kort');
    const nm=d6.reduce((n,x)=>n+(x.k==='collage'?x.srcs.length:x.k==='mood'?1:x.k==='pair'?x.panels.filter(q=>q.mood).length:0),0);if(nm!==15)bad.push('sfeerfoto\'s in video: '+nm);
    if(d6.some(x=>x.k==='collage'&&(x.srcs.length>4||x.dur<4.2)))bad.push('collage te groot of te kort');
    if(!d6.some(x=>x.title==='La Fortuna Waterfall'||(x.labels||[]).includes('La Fortuna Waterfall')||(x.panels||[]).some(q=>q.title==='La Fortuna Waterfall')))bad.push('label sfeerfoto niet in video');
    const nAnimals=new Set(d6.flatMap(x=>x.k==='pair'?x.panels.filter(q=>!q.mood).map(q=>q.title):x.k==='sp'?[x.title]:[])).size;if(nAnimals!==15)bad.push('dieren in video dag 6: '+nAnimals);
    const full=v85Seconds(d6)+4;if(full>95)bad.push('volle dag te lang: '+full);
    /* Overzicht: 15 sfeerfoto's, label kiezen, verblijf */
    tab='days';currentDay=6;daySection='overview';render();if(document.querySelectorAll('.v84-mood .v84-ph').length!==15||!document.querySelector('.v815-stay [data-v815-name="6"]'))bad.push('Overzicht: sfeer/verblijf');
    document.querySelector('[data-v815-lbl="t15m14"]').click();const lb=document.getElementById('v815Lbl');if(!lb)bad.push('labelvenster opent niet');else{
      const chip=[...lb.querySelectorAll('[data-v815-s]')].find(b=>b.dataset.v815S==='Strand');chip.click();lb.querySelector('.v815-all input').checked=true;lb.querySelector('[data-l="save"]').onclick();await new Promise(r=>setTimeout(r,400));
      const ls=V84.moods.filter(x=>x.day===6).map(x=>x.label);if(ls.filter(l=>l==='Strand').length!==12||ls.filter(l=>l==='La Fortuna Waterfall').length!==3)bad.push('labels: '+ls)}
    V85.SCALE=.04;try{const o=await v85Make({proef:true,disk:false});if(!o.blob.size)bad.push('video leeg');const o2=await v85Make({proef:true,disk:false,portrait:true});if(!o2.blob.size)bad.push('staand leeg')}catch(e){bad.push('video v8.15: '+e.message)}V85.SCALE=1;
    await v84Write(st=>recs.forEach(r=>st.delete(r.id)));await v84Load();names.forEach(n=>delete state.v43Observations[v43name(n)]);delete state.v815Stay[6];delete state.v815Stay[7];save();tab='home';render();return bad});v.forEach(x=>errs.push(x))}
  /* v8.16: ster op foto aan/uit, eigen video vloeiend (opvangen bij afspelen, decoderen in de reisvideo) */
  {const v=await p.evaluate(async()=>{const bad=[];const N='Keel-billed toucan',R='La Fortuna';
    const mk=async(c)=>{const cv=document.createElement('canvas');cv.width=900;cv.height=600;const g=cv.getContext('2d');g.fillStyle=c;g.fillRect(0,0,900,600);const bl=await new Promise(r=>cv.toBlob(r,'image/jpeg',.9));return new File([bl],'f.jpg',{type:'image/jpeg'})};
    await v84Add(N,R,[await mk('#c62'),await mk('#2c6')],6);let ps=V84.list.filter(x=>x.sp===v43name(N));
    wl2Open(N,R);if(document.querySelector('#wl2Sheet [data-v84-fav][aria-pressed="true"]'))bad.push('ster staat automatisch aan');wl2Close();
    await v84SetFav(ps[1].id);if(!V84.list.find(x=>x.id===ps[1].id).favUser)bad.push('ster zetten');
    await v84SetFav(ps[1].id);if(V84.list.some(x=>x.sp===v43name(N)&&x.favUser))bad.push('ster uitzetten werkt niet');
    if(!v84FavUrl(N))bad.push('soortfoto weg na ster uit');
    /* bronvideo met beweging: 4 s, elk beeld een ander vlak */
    V85.SCALE=1;const segs=[{k:'intro',dur:4,src:'',label:'Test',title:'Beweging',sub:'',meta:''}];const src=await v85Make({segs,proef:true,disk:false});
    try{const rec=await v84AddVideo(N,R,6,new File([src.blob],'c.mp4',{type:'video/mp4'}),0);
      if(!(rec.dur>3.9))bad.push('clip duur '+rec.dur);
      const rd=await v85ClipReader({url:V84.url[rec.id]});if(!rd)bad.push('clip niet te decoderen (demux)');
      else{const seen=new Set();let prev=null,changes=0;for(let f=0;f<Math.round(rec.dur*30)-2;f++){await rd.at(f/30);const px=rd.canvas.getContext('2d').getImageData(960,500,1,1).data.join();seen.add(px);if(prev!==null&&px!==prev)changes++;prev=px}
        if(rd.frames<Math.round(rec.dur*30)*.8)bad.push('gedecodeerde beelden: '+rd.frames);rd.close()}
      V85.SCALE=.2;const out=await v85Make({proef:true,disk:false});if(!out.blob.size)bad.push('reisvideo met gedecodeerde clip leeg')}
    catch(e){bad.push('vloeiende video: '+e.message)}V85.SCALE=1;
    await v84Write(st=>V84.list.concat(V84.vids).forEach(x=>st.delete(x.id)));await v84Load();delete state.v43Observations[v43name(N)];save();tab='home';render();return bad});v.forEach(x=>errs.push(x))}
  /* v9: kwaliteit, kleuren gelijktrekken, ritme 0,5 s, openingsscène, hoogtepunt van de dag, bitrate */
  {const v=await p.evaluate(async()=>{const bad=[];if(V85.BR!==8_000_000)bad.push('bitrate '+V85.BR);
    const pic=async(fill,noise,w=1600,h=1000)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');g.fillStyle=fill;g.fillRect(0,0,w,h);if(noise)for(let i=0;i<9000;i++){g.fillStyle=i%2?'#000':'#fff';g.fillRect(Math.random()*w,Math.random()*h,3,3)}return cv};
    if(!v84Qual({sharp:5,lum:.5,w:1600,h:1000}).includes('Onscherp')||!v84Qual({sharp:900,lum:.08,w:1600,h:1000}).includes('Te donker')||!v84Qual({sharp:900,lum:.5,w:640,h:480}).includes('Klein')||v84Qual({sharp:900,lum:.5,w:1600,h:1000}).length)bad.push('kwaliteitsvlaggen');
    const dark=await pic('#2a2622',true),gd=v85Grade(dark),m=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let s=0;for(let i=0;i<d.length;i+=40)s+=d[i]+d[i+1]+d[i+2];return s/(d.length/40)/3};
    if(!(m(gd)>m(dark)+5))bad.push('donkere foto niet lichter: '+m(dark)+' → '+m(gd));
    /* dag 6: 6 dieren met eigen foto, één met onscherpe en scherpe foto */
    const R=v47Region(S[5]),names=(V47_PLACES[R]||[]).map(x=>x[0]).slice(0,6),recs=[];const bl=async c=>await new Promise(r=>c.toBlob(r,'image/jpeg',.85));
    const good=await bl(await pic('#486',true)),soft=await bl(await pic('#486',false));
    names.forEach((n,i)=>{recs.push({id:'t9p'+i,sp:v43name(n),name:n,region:R,day:6,kind:'photo',t:'x',taken:`2027-02-13T0${i+6}:00:00`,w:1600,h:1000,sharp:900,lum:.4,blob:good,fav:false});v52Set(n,R,'seen',true)});
    recs.push({id:'t9soft',sp:v43name(names[0]),name:names[0],region:R,day:6,kind:'photo',t:'y',taken:'',w:1600,h:1000,sharp:5,lum:.4,blob:soft,fav:false});
    await v84Write(st=>recs.forEach(r=>st.put(r)));await v84Load();
    const plan=v85Plan(),it0=plan.items.find(i=>i.sp===v43name(names[0]));if(!it0||it0.photos[0]!==V84.url['t9p0'])bad.push('onscherpe foto gekozen boven scherpe');
    const pd=plan.days.find(d=>d.day===6),hl=pd.items.filter(i=>i.hl);const minC=Math.min(...pd.items.map(i=>i.chance).filter(Boolean));if(hl.length!==1||hl[0].chance!==minC)bad.push('hoogtepunt van de dag: '+hl.map(i=>i.chance)+' min '+minC);
    const segs=v85Segments(plan,true);if(segs[0].k!=='cold'||segs[0].srcs.length<3||segs[1].k!=='intro'||segs[1].trans!=='dip')bad.push('openingsscène: '+segs.slice(0,2).map(x=>x.k+'/'+x.trans));
    const hs=segs.filter(x=>x.k==='sp'&&x.hl&&x.day===6);if(hs.length!==1||!/Hoogtepunt/.test(hs[0].label)||hs[0].dur<4.5)bad.push('hoogtepunt-dia: '+hs.map(x=>x.label+x.dur));
    const off=segs.filter(x=>x.k!=='credits'&&Math.abs(x.dur*2-Math.round(x.dur*2))>1e-9);if(off.length)bad.push('niet op ritme 0,5 s: '+off.map(x=>x.k+':'+x.dur));
    wl2Open(names[0],R);if(!/Onscherp/.test(document.querySelector('#wl2Sheet .v84-own')?.textContent||''))bad.push('waarschuwing Onscherp niet zichtbaar');wl2Close();
    V85.SCALE=.06;try{const o=await v85Make({proef:true,disk:false});if(!o.blob.size)bad.push('video v9 leeg');const o2=await v85Make({proef:true,disk:false,short:true,portrait:true});if(!o2.blob.size)bad.push('korte staande v9 leeg')}catch(e){bad.push('video v9: '+e.message)}V85.SCALE=1;
    await v84Write(st=>recs.forEach(r=>st.delete(r.id)));await v84Load();names.forEach(n=>delete state.v43Observations[v43name(n)]);save();tab='home';render();return bad});v.forEach(x=>errs.push(x))}
  /* v8.14: kleuren en kansschaal samen op de soortkaarten */
  {const r=await p.evaluate(()=>{tab='days';currentDay=6;daySection='wildlife';v47Filter='Alle';render();const cards=[...document.querySelectorAll('.ds-sp')];return {n:cards.length,tags:cards.filter(c=>c.querySelector('.v88-card .v88-dot')).length,chance:cards.filter(c=>c.querySelector('.ds-chance')).length}});
   if(!r.n||r.tags<r.n*.8||!r.chance)errs.push('soortkaarten: kleuren en kansschaal samen: '+JSON.stringify(r))}
  /* v8.6: migratie van oude vinkjes (zonder dagen) met veiligheidskopie */
  {const mp=await (await b.newContext()).newPage();mp.on('pageerror',e=>errs.push('migratie JS: '+e.message));await mp.route(/^https?:/,r=>r.abort());
   await mp.addInitScript(()=>{if(!localStorage.getItem('CR27_V2'))localStorage.setItem('CR27_V2',JSON.stringify({v43Observations:{'jabiru':{name:'Jabiru',places:{'La Fortuna':{seen:true,photo:true,t:'2027-02-14T15:00:00.000Z'},'Tortuguero':{seen:true,photo:false}}}}}))});
   await mp.goto('file://'+path.resolve(__dirname,'..','index.html'));await mp.waitForTimeout(300);
   const m=await mp.evaluate(()=>({days:state.v43Observations.jabiru.days,pre:!!localStorage.getItem('CR27_V86_PRE'),flag:state.v86Days,lf:state.v43Observations.jabiru.places['La Fortuna']}));
   const lf=Object.entries(m.days||{}).find(([,r])=>r.r==='La Fortuna'),tg=Object.entries(m.days||{}).find(([,r])=>r.r==='Tortuguero');
   if(!m.pre||m.flag!==1||!lf||!tg||!lf[1].photo||!m.lf.seen||!m.lf.photo)errs.push('migratie: '+JSON.stringify(m));
   if(lf&&!['6','7'].includes(lf[0]))errs.push('migratie: La Fortuna op dag '+lf[0]);if(tg&&tg[0]!=='4')errs.push('migratie: Tortuguero zonder tijd niet op eerste dag (4) maar '+tg[0]);
   await mp.close()}
  /* v7.5: veilige import van een oude back-up en terugzetten */
  const ip=await (await b.newContext({acceptDownloads:true})).newPage();ip.on('pageerror',e=>errs.push('import JS: '+e.message));ip.on('dialog',d=>d.accept());await ip.route(/^https?:/,r=>r.abort());
  await ip.addInitScript(()=>{if(!localStorage.getItem('CR27_V2'))localStorage.setItem('CR27_V2',JSON.stringify({notes:{'1':'nieuw'},v43Observations:{'jabiru':{name:'Jabiru',places:{'La Fortuna':{seen:true,photo:true,t:'2027-02-14T15:00:00.000Z'}}}}}))});
  await ip.goto('file://'+path.resolve(__dirname,'..','index.html'));await ip.waitForTimeout(300);
  /* v7.6.1: downloaden en controleren werken de back-upstatus bij */
  await ip.evaluate(()=>{delete state.v51LastBackup;delete state.v52Verified;save();tab='settings';dsMore='backup';render()});
  const [dl]=await Promise.all([ip.waitForEvent('download'),ip.click('#export')]);const dlPath=require('os').tmpdir()+'/cr27-dl.json';await dl.saveAs(dlPath);await ip.waitForTimeout(450);
  const st1=await ip.evaluate(()=>({t:!!state.v51LastBackup,txt:document.querySelector('.v51-backup b')?.textContent,warn:document.querySelector('.v51-backup')?.classList.contains('warn')}));
  if(!st1.t||st1.warn||!/vandaag/.test(st1.txt||''))errs.push('download registreert back-up niet: '+JSON.stringify(st1));
  await ip.evaluate(()=>{delete state.v51LastBackup;save();render()});await ip.setInputFiles('#v52verify',dlPath);await ip.waitForTimeout(400);
  const st2=await ip.evaluate(()=>({txt:document.querySelector('.v51-backup b')?.textContent,warn:document.querySelector('.v51-backup')?.classList.contains('warn'),res:document.getElementById('v52vres')?.innerText||'',meer:dsdBackupState().warn}));
  if(st2.warn||st2.meer||!/vandaag/.test(st2.txt||'')||!/compleet/.test(st2.res))errs.push('controle werkt status niet bij: '+JSON.stringify(st2).slice(0,160));
  if(await ip.evaluate(()=>{tab='settings';dsMore='backup';render();document.querySelector('[data-mobile="settings"]').click();return dsMore})!=='')errs.push('Meer-knop gaat niet terug naar Meer');
  await ip.evaluate(()=>{tab='settings';dsMore='backup';render()});
  const bak=require('os').tmpdir()+'/cr27-oud.json';require('fs').writeFileSync(bak,JSON.stringify({format:'CR27_V2',exportedAt:'2026-05-01T10:00:00Z',state:{notes:{'3':'oud'},bookings:{},costs:{},hotelSelected:{},v43Observations:{'jabiru':{name:'Jabiru',places:{'La Fortuna':{seen:false,photo:false}}}}}}));
  await Promise.all([ip.waitForEvent('load',{timeout:15000}),ip.setInputFiles('#import',bak)]);await ip.waitForFunction(()=>document.readyState==='complete'&&typeof state!=='undefined'&&state.notes&&state.notes['3']==='oud'&&!!localStorage.getItem('CR27_V2_voor_import'),null,{timeout:10000}).catch(()=>{});await ip.waitForTimeout(300);
  const im=await ip.evaluate(()=>{let ok=true;try{tab='wildlife';render();tab='days';currentDay=7;daySection='wildlife';render()}catch(e){ok=e.message}
    return {ok,n1:state.notes['1'],n3:state.notes['3'],jab:state.v43Observations.jabiru?.places?.['La Fortuna'],copy:!!localStorage.getItem('CR27_V2_voor_import')}});
  if(im.ok!==true||im.n1!=='nieuw'||im.n3!=='oud'||!im.jab?.seen||!im.jab?.photo||!im.copy)errs.push('veilige import: '+JSON.stringify(im));
  await ip.evaluate(()=>{tab='settings';dsMore='backup';render()});
  if(!(await ip.$('#v75restore')))errs.push('knop terugzetten ontbreekt');else{await Promise.all([ip.waitForEvent('load'),ip.click('#v75restore')]);await ip.waitForTimeout(300);
    const rs=await ip.evaluate(()=>({n3:state.notes['3']??null,n1:state.notes['1'],copy:!!localStorage.getItem('CR27_V2_voor_import')}));if(rs.n3!==null||rs.n1!=='nieuw'||rs.copy)errs.push('terugzetten: '+JSON.stringify(rs))}
  const bad=require('os').tmpdir()+'/cr27-fout.json';require('fs').writeFileSync(bad,'{"format":"iets anders"}');await ip.evaluate(()=>{tab='settings';dsMore='backup';render()});
  const before=await ip.evaluate(()=>localStorage.getItem('CR27_V2'));await ip.setInputFiles('#import',bad);await ip.waitForTimeout(300);
  if(await ip.evaluate(()=>localStorage.getItem('CR27_V2'))!==before)errs.push('ongeldig bestand wijzigt gegevens');
  await b.close();
  if(errs.length){console.error('MISLUKT:\n'+errs.join('\n'));process.exit(1)}console.log('OK: alle schermen, 23 dagen x 5 tabs, '+n+' soorten');
})();
