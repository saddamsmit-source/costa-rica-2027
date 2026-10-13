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
  const bt=await p.evaluate(()=>{tab='days';currentDay=16;daySection='map';render();const pl=document.querySelector('.v762-boat');const P=n=>v51XY(V51_PT[n][0],V51_PT[n][1]).map(v=>v.toFixed(1)).join(',');
    const straight=[...document.querySelectorAll('line.dsm-boat')].some(l=>{const a=l.getAttribute('x1')+','+l.getAttribute('y1'),b=l.getAttribute('x2')+','+l.getAttribute('y2');return [a,b].includes(P('Corcovado'))});
    return {pts:pl?pl.getAttribute('points').split(' ').length:0,straight,lodge:v51Dist(V51_PT.Corcovado,[8.65726,-83.71165])}});
  if(bt.pts<20||bt.straight||bt.lodge>0.1)errs.push('bootroute Corcovado: '+JSON.stringify(bt));
  /* v7.6: namen, tikdoelen, tekstgrootte, knop bij kaartvenster */
  const nn=await p.evaluate(()=>Object.keys(V47_SP).filter(k=>{const n=v47Info(k).nl;return (!n||n===k)&&!V76_NL_SAME.has(k)&&!V76_NO_NL.has(k)}));if(nn.length)errs.push('soort zonder NL-naam: '+nn.join(', '));
  const ux=await p.evaluate(()=>{const bad=[];for(const [t,d,s] of [['map'],['wildlife'],['days',3,'wildlife'],['days',16,'map'],['days',7,'overview']]){tab=t;if(d){currentDay=d;daySection=s}render();
    document.querySelectorAll('button,a,select,[role=button]').forEach(el=>{const r=el.getBoundingClientRect();if(r.height>2&&r.height<44&&r.width>0&&!el.closest('svg')&&!el.closest('.ds-credits'))bad.push(t+'/'+(d||'')+' '+(el.className.baseVal??el.className)+' '+Math.round(r.height))});
    document.querySelectorAll('#app *').forEach(el=>{if([...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&el.offsetParent&&!el.closest('svg')&&parseFloat(getComputedStyle(el).fontSize)<12)bad.push(t+'/'+(d||'')+' tekst '+el.tagName+'.'+el.className+' in '+el.parentElement.className+' '+getComputedStyle(el).fontSize)})}
    tab='days';currentDay=16;daySection='map';render();document.querySelector('.v74-hotel.on').dispatchEvent(new MouseEvent('click',{bubbles:true}));if(getComputedStyle(document.querySelector('.ds-fab')).pointerEvents!=='none')bad.push('knop Waarneming over kaartvenster');
    return bad});
  if(ux.length)errs.push('leesbaarheid/tikdoelen: '+[...new Set(ux)].slice(0,8).join('; '));
  const mf=JSON.parse(require('fs').readFileSync(path.resolve(__dirname,'..','manifest.webmanifest'),'utf8'));if(!mf.icons.some(i=>i.purpose==='maskable'))errs.push('geen maskable icoon');
  /* v7.5: veilige import van een oude back-up en terugzetten */
  const ip=await b.newPage();ip.on('pageerror',e=>errs.push('import JS: '+e.message));ip.on('dialog',d=>d.accept());await ip.route(/^https?:/,r=>r.abort());
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
  await ip.setInputFiles('#import',bak);await ip.waitForFunction(()=>document.readyState==='complete'&&typeof state!=='undefined'&&state.notes&&state.notes['3']==='oud'&&!!localStorage.getItem('CR27_V2_voor_import'),null,{timeout:10000}).catch(()=>{});await ip.waitForTimeout(300);
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
