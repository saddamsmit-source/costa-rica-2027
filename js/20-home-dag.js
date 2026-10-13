/* =====================================================================
   v6 · Home en Dagoverzicht in het design system (ds-).
   Vervangt de schermopbouw van Home en Dag volledig; data, opslag en
   bestaande functies (waarneming, notities, dagwissel, swipe) blijven gelijk.
   ===================================================================== */
const DS_ICON={
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  chevL:'<path d="m15 6-6 6 6 6"/>',chevR:'<path d="m9 6 6 6-6 6"/>',chevD:'<path d="m6 9 6 6 6-6"/>',
  route:'<path d="M3 17l5-5 4 3 8-9"/><circle cx="3" cy="17" r="1.6"/><circle cx="20" cy="6" r="1.6"/>',
  map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>',
  paw:'<circle cx="7" cy="7" r="1.6"/><circle cx="12" cy="5" r="1.6"/><circle cx="17" cy="7" r="1.6"/><circle cx="20" cy="12" r="1.5"/><path d="M12 11c-3.5 0-5.5 3-5.5 5.5 0 2 2 3.5 5.5 2 3.5 1.5 5.5 0 5.5-2C17.5 14 15.5 11 12 11z"/>',
  bed:'<path d="M3 20V8M3 14h18v6M21 20v-8a3 3 0 0 0-3-3H9v5M7 9V6h5a3 3 0 0 1 3 3"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m15 9-2 5-4 1 2-5 4-1Z"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
  bolt:'<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  leaf:'<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19 13 11"/>',
  star:'<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  alert:'<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17.5h.01"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  coin:'<circle cx="12" cy="12" r="9"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.7 0-3 1-3 2.2 0 2.8 6 1.5 6 4.4 0 1.3-1.4 2.4-3 2.4-1.2 0-2.3-.6-2.8-1.6M12 6.5v1.5M12 16.5V18"/>',
  note:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  sunrise:'<path d="M12 3v3M4.2 8.2l1.4 1.4M19.8 8.2l-1.4 1.4M2 17h2M20 17h2"/><path d="M6 17a6 6 0 0 1 12 0"/><path d="M2 21h20"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  sunset:'<path d="M6 17a6 6 0 0 1 12 0"/><path d="M12 7v3M2 21h20M2 17h3M19 17h3"/><path d="M9 4l3 3 3-3"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  bus:'<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 3v8M16 3v8"/><path d="M6 18v3M18 18v3"/>',
  boat:'<path d="M3 15h18l-2.5 4.5a2 2 0 0 1-1.8 1H7.3a2 2 0 0 1-1.8-1Z"/><path d="M6 15V9h12v6M9 9V5h6v4"/>',
  plane:'<path d="M2 16l20-6-2-2-7 2-5-6H6l3 7-5 1-2-2H1l1 6z"/>',
  binoculars:'<circle cx="6.5" cy="15.5" r="4"/><circle cx="17.5" cy="15.5" r="4"/><path d="M10.5 15.5h3"/><path d="M4 12l2-7h3l1 7M20 12l-2-7h-3l-1 7"/>'
};
function dsI(k,s){return `<svg viewBox="0 0 24 24" width="${s||20}" height="${s||20}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${DS_ICON[k]||''}</svg>`}

/* ---------------- Home ---------------- */
const DS_HOME_HERO={src:'./photos/hero-home.jpg',credit:''};
Object.assign(V48_PHOTO,{'hero-home':{title:'File:Keel-billed toucan in Costa Rica 01.jpg',credit:'Bernard Gagnon',license:'CC0',page:'https://commons.wikimedia.org/wiki/File:Keel-billed_toucan_in_Costa_Rica_01.jpg'}});
renderHome=function(){
  const td=v48TripDay(),togo=v48DaysToGo(),d=td?S[td-1]:S[Math.min(currentDay,22)];
  const tiles=[['route','Route','23 dagen','days'],['map','Kaart','Route & locaties','map'],['paw','Wildlife','284 soorten','wildlife'],['bed','Hotels','Sawadee-lijst','hotels'],['compass','Excursies','Te regelen','bookings'],['gear','Praktisch','Valuta & info','settings']];
  const saw=d.activities.filter(a=>v50Kind(a)==='saw').length,extra=d.activities.filter(a=>['own','opt'].includes(v50Kind(a))).length;
  const a=v51BackupAge(),needBackup=a===null?(togo<=30):a>14;
  const chip=td?`<span class="ds-glass-chip accent">${dsI('cal',15)}Reisdag ${td} van 23</span>`:togo>0?`<span class="ds-glass-chip accent">${dsI('cal',15)}Nog ${togo} dagen</span>`:'';
  return `<div class="ds-home ds-bleed">
  <section class="ds-hero" style="background-image:url('${DS_HOME_HERO.src}')">
    <div class="ds-hero-top"><button class="ds-iconbtn glass" data-goto="settings" aria-label="Meer">${dsI('menu',21)}</button><button class="ds-iconbtn glass" data-goto="wildlife" aria-label="Zoek soorten">${dsI('search',21)}</button></div>
    <h1 class="ds-display">Costa Rica 2027</h1>
    <div class="ds-hero-sub">8 feb – 2 mrt 2027</div>
    <div class="ds-hero-line">23 dagen · Sawadee + onze extra's</div>
    <div class="ds-hero-chips">${chip}<span class="ds-glass-chip">${dsI('lock',15)}Route vastgezet</span></div>
    ${DS_HOME_HERO.credit?`<span class="ds-photo-credit">${esc(DS_HOME_HERO.credit)}</span>`:''}
  </section>
  <div class="ds-tiles">${tiles.map(([i,t,s,g])=>`<button class="ds-tile" data-goto="${g}"><i>${dsI(i,22)}</i><b>${t}</b><small>${s}</small></button>`).join('')}</div>
  <div class="ds-home-body">
    <div class="ds-section-title">${td?'Vandaag':'Volgende dag'}</div>
    <button class="ds-next" data-dsday="${d.id}"><img src="${locationPhoto(d)}" alt=""><span class="ds-next-body"><span class="ds-label">Dag ${d.id} · ${new Date(d.date+'T12:00:00').toLocaleDateString('nl-NL',{weekday:'short',day:'numeric',month:'short'})}</span><b>${esc(d.place.split('/')[0].trim())}</b><span>${esc(d.id===22?'Afscheid van Costa Rica':d.id===23?'Terug naar huis':(V50_TAG[v47Region(d)]||d.base))}</span><span class="ds-next-chips">${saw?`<em class="saw">Sawadee</em>`:''}${extra?`<em>+${extra} ${extra===1?'optie':'opties'}</em>`:''}</span></span>${dsI('chevR',20)}</button>
    ${needBackup?`<button class="ds-home-note" data-goto="settings">${dsI('alert',16)}${a===null?'Nog geen back-up van je gegevens':'Back-up is '+a+' dagen oud'} · maak er een</button>`:''}
  </div></div>`};

/* ---------------- Dag ---------------- */
const DS_SLOTS=[['Ochtend','sunrise'],['Overdag','sun'],['Middag','sun'],['Avond','moon']];
function dsSlotOf(a){return V50_SLOT[a.title]||'Overdag'}
renderDays=function(){
  const d=S[currentDay-1],region=v47Region(d),kinds=new Set(d.activities.filter(a=>a.status!=='excluded').map(v50Kind));
  const tag=d.id===22?'Afscheid van Costa Rica':d.id===23?'Terug naar huis':(V50_TAG[region]||'');
  const title=d.id===21?'San José':d.id===20?'Manuel Antonio':d.place.split('/')[0].trim();
  const badges=[kinds.has('saw')?`<span class="ds-badge saw">${dsI('leaf',14)}Sawadee</span>`:'',kinds.has('own')?`<span class="ds-badge own">${dsI('star',14)}Onze optie</span>`:'',kinds.has('opt')?`<span class="ds-badge opt">${dsI('plus',14)}Optioneel</span>`:''].join('');
  const tabs=[['overview','Overzicht','cal'],['activities','Activiteiten','bolt'],['wildlife','Wildlife','paw'],['stay','Hotel','bed'],['map','Kaart','pin']];
  return `<div class="ds-day ds-bleed">
  <section class="ds-dayhero" id="swipeZone" style="background-image:url('${locationPhoto(d)}')">
    <div class="ds-dayhero-top">
      <button class="ds-iconbtn" data-daymove="-1" ${currentDay===1?'disabled':''} aria-label="Vorige dag">${dsI('chevL',21)}</button>
      <label class="ds-daypick">Dag ${d.id} van 23 ${dsI('chevD',15)}<select id="dayPicker" aria-label="Kies reisdag">${S.map(x=>`<option value="${x.id}" ${x.id===d.id?'selected':''}>Dag ${x.id} · ${fmt(x.date)} · ${esc(x.place)}</option>`).join('')}</select></label>
      <button class="ds-iconbtn" data-daymove="1" ${currentDay===23?'disabled':''} aria-label="Volgende dag">${dsI('chevR',21)}</button>
    </div>
    <div class="ds-daydate">${v50LongDate(d)}</div>
    <h2 class="ds-display">${esc(title)}</h2>
    ${tag?`<p class="ds-daytag">${esc(tag)}</p>`:''}
    <div class="ds-badges">${badges}</div>
  </section>
  <nav class="ds-tabs" aria-label="Dagonderdelen">${tabs.map(([v,t,i])=>`<button data-section="${v}" class="${daySection===v?'active':''}" ${daySection===v?'aria-current="page"':''}>${dsI(i,22)}${t}</button>`).join('')}</nav>
  <section class="ds-panel">${dayContent(d)}</section>
  </div>
  <button class="ds-fab" id="v52open" aria-label="Waarneming registreren">${dsI('binoculars',21)}Waarneming</button>`};

function dsOverview(d){
  const tr=V51_TRAVEL[d.id],stopPt=V51_PT[V51_STOPS[v51Day2Stop(d.id)][0]],sun=v51Sun(stopPt[0],stopPt[1],d.date);
  const fixed=d.activities.filter(a=>a.status!=='excluded'&&(v50Kind(a)==='saw'||a.status==='locked')).length,opt=d.activities.filter(a=>v50Kind(a)==='opt').length;
  const todo=d.activities.filter((a,i)=>a.status!=='excluded'&&['online','zelf'].includes(v48BookOf(a,d,i))).length;
  const m=tr&&tr.t.match(/(\d+(?:[,–-]\d+)?\s*(?:uur|min))/),trShort=!tr?'Geen':tr.m==='plane'?'Vlucht':m?m[1].replace('uur','u'):'—';
  const brief=`<div class="ds-brief ds-num"><div>${dsI(tr?.m==='boat'?'boat':tr?.m==='plane'?'plane':'bus',17)}<b>${esc(trShort)}</b><small>reistijd</small></div><div>${dsI('lock',17)}<b>${fixed}</b><small>vast</small></div><div>${dsI('plus',17)}<b>${opt}</b><small>optioneel</small></div><div class="${todo?'warn':''}">${dsI('alert',17)}<b>${todo}</b><small>te regelen</small></div></div>`;
  const acts=d.activities.map((a,i)=>({a,i})).filter(x=>x.a.status!=='excluded');
  const slots=DS_SLOTS.map(([s,ic])=>{const list=acts.filter(x=>dsSlotOf(x.a)===s);if(!list.length)return '';
    return `<div class="ds-slot"><div class="ds-slot-h"><i>${dsI(ic,14)}</i><span class="ds-label">${s}</span></div>${list.map(({a,i})=>{const k=v50Kind(a),info=V48_ACT[a.title]||{},bk=v48BookOf(a,d,i),src=v48Photo(v48ActKey(a,d));
      const clean=s=>s&&s.replace(/\s*\([^)]*\)/g,'').trim();const sub=[clean(info.dur),clean(info.price)].filter(Boolean).join(' · ')||a.note||'';
      const pill=bk==='geboekt'?'<span class="ds-pill ok">Geboekt</span>':bk==='online'?'<span class="ds-pill warn">Online tickets</span>':`<span class="ds-pill ${k==='saw'?'saw':k==='own'?'own':'opt'}">${V50_KIND[k][0]}</span>`;
      return `<button class="ds-tl" data-activity="${i}" data-day="${d.id}">${src?`<img src="${src}" alt="" loading="lazy">`:`<span class="ds-tl-ph"></span>`}<span class="ds-tl-body"><b>${esc(a.title)}</b>${sub?`<span>${esc(sub)}</span>`:''}</span>${pill}</button>`}).join('')}</div>`}).join('');
  const hotel=d.hotel[0];
  const know=dsKnow(d);
  return `<div class="ds-card ds-overview"><h3 class="ds-title">Dagoverzicht</h3><p class="ds-lede">${esc(V50_TEXT[d.id]||d.base)}</p>${brief}<div class="ds-sun ds-num">${dsI('sunrise',15)}Zon op ${sun.rise}<span aria-hidden="true">·</span>${dsI('sunset',15)}onder ${sun.set}</div>
    <div class="ds-timeline">${slots||'<p class="ds-meta" style="margin-top:12px">Geen activiteiten op deze dag.</p>'}</div></div>
  ${hotel?`<button class="ds-stay" data-section="stay"><img src="${V49_HOTEL_PHOTO[hotel]?'./photos/'+V49_HOTEL_PHOTO[hotel].key+'.jpg':locationPhoto(d)}" alt=""><span><span class="ds-label">Overnachting</span><b>${esc(hotel)}</b><small>${esc(d.place)}</small></span>${dsI('chevR',20)}</button>`:''}
  ${know}
  <details class="ds-notes" ${state.notes[d.id]?'open':''}><summary>${dsI('note',18)}Mijn notities${state.notes[d.id]?'<em>opgeslagen</em>':''}</summary><textarea data-note="${d.id}" placeholder="Waarnemingen, tijden, fotomomenten…" aria-label="Notities dag ${d.id}">${esc(state.notes[d.id]||'')}</textarea></details>`}
function dsKnow(d){
  const out=[];if(d.flag)out.push(['alert',d.flag,1]);
  d.activities.forEach(a=>{if(V48_ACT[a.title]?.book==='online'&&a.status!=='excluded')out.push(['alert',`${a.title}: tickets vooraf online via SINAC.`,1])});
  if([4,5].includes(d.id))out.push(['coin','Maaltijden in Tortuguero: vast bedrag voor drie maaltijden per dag, ter plekke te betalen.']);
  if([16,17,18].includes(d.id))out.push(['coin','Maaltijden in Corcovado: vast bedrag per dag, ter plekke te betalen. De Corcovado-excursie betaal je aan de lodge.']);
  if(d.id===16)out.push(['info','Waterschoenen aan: je waadt aan land. Neem een kleine tas mee voor 3 nachten.']);
  if([10,11,12,13].includes(d.id))out.push(['info','Neem een warme laag mee: de nachten in het nevelwoud en de bergen kunnen koud zijn.']);
  if(d.tip)out.push(['info',d.tip]);
  return out.length?`<div class="ds-know"><div class="ds-know-h">${dsI('info',19)}Goed om te weten</div><ul>${out.map(([i,t,w])=>`<li class="${w?'warn':''}">${dsI(i,16)}<span>${esc(t)}</span></li>`).join('')}</ul></div>`:''}
const dsPrevDayContent=dayContent;
dayContent=function(d){return daySection==='overview'?dsOverview(d):dsPrevDayContent(d)};

/* ---------------- binding ---------------- */
const dsPrevBind=bindExtras;
bindExtras=function(){dsPrevBind();
  document.querySelectorAll('.ds-tl[data-activity]').forEach(el=>el.onclick=()=>openActivity(Number(el.dataset.day),Number(el.dataset.activity)));
  document.querySelectorAll('[data-dsday]').forEach(el=>el.onclick=()=>{currentDay=Number(el.dataset.dsday);daySection='overview';tab='days';render();window.scrollTo({top:0,behavior:'instant'})});
  const fab=document.getElementById('v52open');if(fab)fab.onclick=v52QuickOpen;
  document.body.classList.toggle('ds-has-fab',tab==='days');
};
render();
