/* =====================================================================
   v6.3 · Kaartlagen (activiteiten, parken, waarnemingen), afstand via GPS,
   waarneming met locatie, noodkaart, dagverslag voor Polarsteps,
   zonlichtstand en tijd Costa Rica / Nederland.
   Coördinaten: Wikipedia-infobox (parken, waterval, Puerto Viejo, Curi-Cancha)
   en birdingplaces.eu (krokodillenbrug). Bij benadering, voor een schematische kaart.
   ===================================================================== */
/* kind: park | reserve | act ; acts: [dag, activiteitindex] */
const DSE_POI=[
 {id:'cahuita-np',n:'Cahuita National Park',k:'park',ll:[9.72917,-82.825],acts:[[3,0]],note:'Ingang Kelly Creek ligt net ten zuiden van Cahuita.'},
 {id:'puertoviejo',n:'Puerto Viejo',k:'act',ll:[9.65833,-82.75278],acts:[[3,1]]},
 {id:'tortuguero-np',n:'Tortuguero National Park',k:'park',ll:[10.54111,-83.50222],acts:[[5,0]]},
 {id:'canonegro',n:'Caño Negro',k:'reserve',ll:[10.8775,-84.7675],acts:[[7,0]]},
 {id:'fortuna-waterfall',n:'La Fortuna Waterfall',k:'act',ll:[10.4481,-84.6683],acts:[[7,2]]},
 {id:'arenal-np',n:'Arenal Volcano NP',k:'park',ll:[10.46139,-84.73944],acts:[]},
 {id:'rincon-np',n:'Rincón de la Vieja NP',k:'park',ll:[10.83,-85.32389],acts:[[9,0],[9,1]],note:'Punt is de vulkaan. Las Pailas en de Oropéndola-waterval liggen aan de zuidkant van het park, bij de parkingang.'},
 {id:'monteverde-res',n:'Monteverde Reserve',k:'reserve',ll:[10.3025,-84.79556],acts:[]},
 {id:'curicancha',n:'Curi-Cancha',k:'reserve',ll:[10.3064,-84.802],acts:[[12,0]],note:'Ingang ca. 1 km vóór het Monteverde-reservaat.'},
 {id:'quetzales-np',n:'Los Quetzales NP',k:'park',ll:[9.58611,-83.90722],acts:[]},
 {id:'ballena-np',n:'Marino Ballena NP',k:'park',ll:[9.155872,-83.754732],acts:[[15,0]]},
 {id:'corcovado-np',n:'Corcovado NP',k:'park',ll:[8.55,-83.58333],acts:[[17,0]]},
 {id:'cano',n:'Isla del Caño',k:'reserve',ll:[8.715,-83.885],acts:[[18,0]]},
 {id:'manuel-np',n:'Manuel Antonio NP',k:'park',ll:[9.37556,-84.13583],acts:[[20,0],[20,1]]},
 {id:'carara-np',n:'Carara NP',k:'park',ll:[9.74722,-84.62778],acts:[]},
 {id:'tarcoles',n:'Krokodillenbrug Tárcoles',k:'act',ll:[9.80214,-84.60716],acts:[[21,0],[21,1]]}
];
const DSE_KINDTXT={park:'Nationaal park',reserve:'Natuurreservaat',act:'Activiteit',obs:'Jouw waarneming'};
state.dsLayers??={day:{act:true,park:true,obs:true},full:{act:false,park:false,obs:true}};
state.dsObsGeo??=true;
function dseMode(){return tab==='days'&&!dsMapWide?'day':'full'}
function dseKindOf(p){const a=p.acts[0];if(!a)return 'park';const act=S[a[0]-1]?.activities[a[1]];return act?v50Kind(act):'saw'}

/* waarnemingen met locatie, gegroepeerd per ca. 100 m */
function dseObsGroups(){const g={};
  Object.values(state.v43Observations||{}).forEach(o=>Object.entries(o.places||{}).forEach(([pl,r])=>{if(!r.seen||!r.loc)return;const k=r.loc.lat.toFixed(3)+','+r.loc.lon.toFixed(3);(g[k]??={lat:r.loc.lat,lon:r.loc.lon,items:[]}).items.push({name:o.name,place:pl,photo:r.photo,t:r.t})}));
  return Object.entries(g).map(([k,v])=>({id:'obs:'+k,...v}))}

/* laag-hook voor dsMapSvg */
function dseLayer(fd,zoom,box,s,cur){
  const L=state.dsLayers[dseMode()],f=v=>v.toFixed(1),pins=[],curDays=cur>=0?V51_STOPS[cur][1]:[];let svg='',top='';
  if(L.park||L.act)DSE_POI.forEach(p=>{const isPark=p.k!=='act';if(isPark?!L.park:!L.act)return;
    let[x,y]=v51XY(p.ll[0],p.ll[1]);const r=(isPark?8:7.5)*s;
    /* schematisch: pin die onder een stop zou vallen iets opzij zetten */
    V51_STOPS.slice(0,-1).forEach(([st])=>{const[sx,sy]=v51XY(V51_PT[st][0],V51_PT[st][1]),dx=x-sx,dy=y-sy,dd=Math.hypot(dx,dy),min=(15+12)*s;if(dd<min){x=sx;y=sy+min}});
    if(isPark){svg+=`<g class="dse-poi park" data-dse-poi="${p.id}" role="button" aria-label="${esc(p.n)}"><rect x="${f(x-r)}" y="${f(y-r)}" width="${f(2*r)}" height="${f(2*r)}" rx="${f(r*.45)}"/><path d="M${f(x)},${f(y-r*.62)}L${f(x+r*.55)},${f(y+r*.3)}H${f(x-r*.55)}Z M${f(x)},${f(y+r*.3)}V${f(y+r*.62)}" /></g>`}
    else{const k=dseKindOf(p);svg+=`<g class="dse-poi act ${k}" data-dse-poi="${p.id}" role="button" aria-label="${esc(p.n)}"><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/><circle class="dot" cx="${f(x)}" cy="${f(y)}" r="${f(r*.36)}"/></g>`}
    const near=cur>=0&&(p.acts.some(a=>curDays.includes(a[0]))||(isPark&&v51Dist(p.ll,V51_PT[V51_STOPS[cur][0]])<35));
    pins.push({x,y,r:r+4*s,label:near?p.n:'',cls:isPark?'park':'act',must:p.acts.some(a=>curDays.includes(a[0]))})});
  if(L.obs)dseObsGroups().forEach(o=>{const[x,y]=v51XY(o.lat,o.lon),r=6.5*s;
    top+=`<g class="dse-poi obs" data-dse-poi="${o.id}" role="button" aria-label="Waarneming"><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/><circle class="dot" cx="${f(x)}" cy="${f(y)}" r="${f(r*.38)}"/></g>`;pins.push({x,y,r:r+2*s})});
  return {svg,top,pins,hideExc:!!L.act}}

/* laagknoppen + legenda */
function dseChips(){const m=dseMode(),L=state.dsLayers[m],n=dseObsGroups().reduce((a,g)=>a+g.items.length,0);
  const c=(k,t,extra)=>`<button class="dse-chip ${k} ${L[k]?'on':''}" data-dse-layer="${k}" aria-pressed="${!!L[k]}"><i></i>${t}${extra||''}</button>`;
  return `<div class="dse-chips" role="group" aria-label="Kaartlagen">${c('act','Activiteiten')}${c('park','Parken')}${c('obs','Gezien',n?` <em class="ds-num">${n}</em>`:'')}</div>`}
dsdLegend=function(){const L=state.dsLayers[dseMode()];return `<div class="ds-maplegend"><span><i class="l-road"></i>Route</span><span><i class="l-boat"></i>Boot</span>${L.act?'':'<span><i class="l-exc"></i>Excursie</span>'}<span><i class="l-me"></i>Jij</span></div>`};
const dsePrevMapBox=dsdMapBox;
dsdMapBox=function(fd,zoomable){return dseChips()+dsePrevMapBox(fd,zoomable).replace(/<\/div>$/,'<div class="dse-pop" id="dsePop" hidden></div></div>')};

/* pin-venster */
function dsePop(id){const box=document.getElementById('dsePop');if(!box)return;let h='';
  if(id.startsWith('obs:')){const g=dseObsGroups().find(x=>x.id===id);if(!g)return;
    h=`<div class="dse-pop-h"><span class="dse-k obs">${DSE_KINDTXT.obs}</span><button class="dse-x" aria-label="Sluiten">${dsI('plus',18)}</button></div><b>${g.items.length===1?esc(v47Info(g.items[0].name).nl):g.items.length+' soorten op deze plek'}</b>
    ${g.items.length===1?`<p>${g.items[0].photo?'Gezien en gefotografeerd':'Gezien'}${g.items[0].t?' · '+new Date(g.items[0].t).toLocaleString('nl-NL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''}</p>`:`<ul class="dse-list">${g.items.map(i=>`<li>${esc(v47Info(i.name).nl)}${i.photo?' · op foto':''}${i.t?` <small>${new Date(i.t).toLocaleString('nl-NL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</small>`:''}</li>`).join('')}</ul>`}`}
  else{const p=DSE_POI.find(x=>x.id===id);if(!p)return;
    h=`<div class="dse-pop-h"><span class="dse-k ${p.k}">${DSE_KINDTXT[p.k]}</span><button class="dse-x" aria-label="Sluiten">${dsI('plus',18)}</button></div><b>${esc(p.n)}</b>${p.note?`<p>${esc(p.note)}</p>`:''}
    ${p.acts.map(([d,i])=>{const a=S[d-1].activities[i];return `<button class="dse-act" data-dse-act="${d}|${i}"><span>Dag ${d} · ${esc(a.title)}</span>${dsI('chevR',16)}</button>`}).join('')||'<p>Geen activiteit gepland; ligt langs de route.</p>'}
    <a class="dse-maps" href="https://www.google.com/maps/search/?api=1&query=${p.ll[0]},${p.ll[1]}" target="_blank" rel="noopener">${dsI('pin',14)}Open in Google Maps</a>`}
  box.innerHTML=h;box.hidden=false;
  box.querySelector('.dse-x').onclick=()=>{box.hidden=true};
  box.querySelectorAll('[data-dse-act]').forEach(b=>b.onclick=()=>{const[d,i]=b.dataset.dseAct.split('|').map(Number);openActivity(d,i)})}
function dseBindMap(){
  document.querySelectorAll('[data-dse-poi]').forEach(g=>g.onclick=e=>{e.stopPropagation();dsePop(g.dataset.dsePoi)});
  document.querySelectorAll('[data-dse-layer]').forEach(b=>b.onclick=()=>{const L=state.dsLayers[dseMode()],k=b.dataset.dseLayer;L[k]=!L[k];save();dseRedrawMap()})}
function dseRedrawMap(){const box=document.querySelector('.ds-mapbox');if(!box)return;const chips=document.querySelector('.dse-chips'),zoomable=!!box.querySelector('#dsMapWide'),fd=tab==='days'?currentDay:(v48TripDay()||0);
  const tmp=document.createElement('div');tmp.innerHTML=dsdMapBox(fd,zoomable);chips?.remove();box.replaceWith(...tmp.childNodes);
  const lg=document.querySelector('.ds-maplegend');if(lg){const t=document.createElement('div');t.innerHTML=dsdLegend();lg.replaceWith(t.firstElementChild)}
  v51BindStops();dsdBindWide();dseBindMap()}
/* vergroten/verkleinen: lagen en legenda meenemen */
dsdBindWide=function(){const w=document.getElementById('dsMapWide');if(w)w.onclick=()=>{dsMapWide=!dsMapWide;dseRedrawMap()}};

/* ---------------- GPS: afstand naar de bestemming ---------------- */
function dseTarget(){const d=tab==='days'?currentDay:(v48TripDay()||0);if(!d)return null;const st=V51_STOPS[v51Day2Stop(d)][0];return V51_PT[st]}
function dseGpsText(){if(!v51Pos)return '';const t=dseTarget(),acc=`±${Math.round(v51Pos.acc)} m`;if(!t)return `${v51Pos.lat.toFixed(4)}, ${v51Pos.lon.toFixed(4)} · ${acc}`;
  const km=v51Dist([v51Pos.lat,v51Pos.lon],t);return km<2?`Je bent bij ${t[2]} · ${acc}`:`Nog ± ${km<20?km.toFixed(1).replace('.',','):Math.round(km)} km hemelsbreed naar ${t[2]} · ${acc}`}
dsdGps=function(){const on=v51Watch!==null;return `<div class="ds-gps"><button id="v51gps" class="ds-chipbtn ${on?'live':''}">${dsdI('target',16)}${on?'Live positie aan':'Toon mijn positie'}</button><span id="v51gpsinfo" class="ds-num">${esc(dseGpsText())}</span></div>`};
v51StartGps=function(){if(!navigator.geolocation){alert('GPS niet beschikbaar op dit apparaat');return}
  if(v51Watch!==null){navigator.geolocation.clearWatch(v51Watch);v51Watch=null;render();return}
  v51Watch=navigator.geolocation.watchPosition(p=>{v51Pos={lat:p.coords.latitude,lon:p.coords.longitude,acc:p.coords.accuracy};if(document.querySelector('.ds-mapbox'))dseRedrawMap();else{const svg=document.querySelector('.v51-svg');if(svg){const w=document.createElement('div');w.innerHTML=v51Svg(tab==='days'?currentDay:(v48TripDay()||0));svg.replaceWith(w.firstElementChild);v51BindStops()}}const i=document.getElementById('v51gpsinfo');if(i)i.textContent=dseGpsText()},
    e=>{alert('Geen GPS-positie: '+e.message);navigator.geolocation.clearWatch(v51Watch);v51Watch=null;render()},{enableHighAccuracy:true,maximumAge:10000,timeout:30000});render()};

/* ---------------- waarneming krijgt tijd en locatie ---------------- */
function dseTag(name,place){const r=state.v43Observations[v43name(name)]?.places?.[place];if(!r)return;
  if(!r.seen){if(r.loc||r.t){delete r.loc;delete r.t;save()}return}
  if(!r.t)r.t=new Date().toISOString();
  if(!r.loc&&state.dsObsGeo){if(v51Pos)r.loc={lat:+v51Pos.lat.toFixed(5),lon:+v51Pos.lon.toFixed(5),acc:Math.round(v51Pos.acc)};
    else if(navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>{if(r.seen&&!r.loc){r.loc={lat:+p.coords.latitude.toFixed(5),lon:+p.coords.longitude.toFixed(5),acc:Math.round(p.coords.accuracy)};save()}},()=>{},{enableHighAccuracy:true,maximumAge:60000,timeout:20000})}
  save()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-v43-species],[data-v52]');if(!b)return;
  if(b.dataset.v43Species)dseTag(decodeURIComponent(b.dataset.v43Species),decodeURIComponent(b.dataset.v43Place));
  else{const[,enc]=b.dataset.v52.split('|');dseTag(decodeURIComponent(enc),v47RegionNames(S[currentDay-1]).region)}});

/* nieuwe soort via 'Niet gevonden? Voeg toe' krijgt ook tijd en locatie */
document.addEventListener('click',e=>{if(!e.target.closest('#v52add'))return;const q=document.getElementById('v52q'),name=q&&q.value.trim();if(!name)return;const region=v47RegionNames(S[currentDay-1]).region;setTimeout(()=>dseTag(name,region),0)},true);

/* ---------------- tijd Costa Rica / Nederland ---------------- */
function dseClock(){const o={hour:'2-digit',minute:'2-digit'},n=new Date();
  return `<span>${dsI('sun',15)}<b>Costa Rica</b> <span class="ds-num">${n.toLocaleTimeString('nl-NL',{...o,timeZone:'America/Costa_Rica'})}</span></span><span><b>Nederland</b> <span class="ds-num">${n.toLocaleTimeString('nl-NL',{...o,timeZone:'Europe/Amsterdam'})}</span></span>`}
setInterval(()=>{const c=document.getElementById('dseClock');if(c)c.innerHTML=dseClock()},30000);

/* ---------------- noodkaart ---------------- */
state.dsEmergency??={ins:'',insTel:'',policy:'',home:'',homeTel:''};
function dseTel(n){return 'tel:'+String(n).replace(/[^\d+]/g,'')}
function dseEmergencyHtml(edit){const e=state.dsEmergency,td=v48TripDay(),d=S[(td||Math.min(currentDay,21))-1],hotel=d.hotel[0];
  const row=(ic,t,sub,href,cls)=>`<a class="dse-er ${cls||''}" href="${href}" ${href.startsWith('http')?'target="_blank" rel="noopener"':''}><i>${ic}</i><span><b>${t}</b><small>${sub}</small></span></a>`;
  const own=edit?`<div class="dse-edit">
      <label>Reisverzekering<input data-dse-em="ins" value="${esc(e.ins)}" placeholder="Naam maatschappij"></label>
      <label>Alarmnummer verzekering<input data-dse-em="insTel" value="${esc(e.insTel)}" inputmode="tel" placeholder="+31 …"></label>
      <label>Polisnummer<input data-dse-em="policy" value="${esc(e.policy)}" placeholder="Optioneel"></label>
      <label>Contact thuis<input data-dse-em="home" value="${esc(e.home)}" placeholder="Naam"></label>
      <label>Telefoon contact thuis<input data-dse-em="homeTel" value="${esc(e.homeTel)}" inputmode="tel" placeholder="+31 …"></label>
      <button class="ds-btn primary" id="dseEmSave">Bewaren</button></div>`
    :`${e.insTel?row(dsdI('shield',20),esc(e.ins||'Reisverzekering')+' · alarmcentrale',esc(e.insTel)+(e.policy?' · polis '+esc(e.policy):''),dseTel(e.insTel)):''}
      ${e.homeTel?row(dsdI('user',20),esc(e.home||'Contact thuis'),esc(e.homeTel),dseTel(e.homeTel)):''}
      <button class="dse-editbtn" id="dseEmEdit">${dsI('note',15)}${e.insTel||e.homeTel?'Gegevens wijzigen':'Verzekering en contact thuis invullen'}</button>`;
  return `<div class="dse-sheet-h"><b>Noodkaart</b><button class="dse-x" id="dseEmClose" aria-label="Sluiten">${dsI('plus',20)}</button></div>
    ${row(dsI('alert',22),'Alarmnummer 911','Politie, ambulance, brandweer','tel:911','sos')}
    ${row(dsI('pin',20),'Nederlandse ambassade, 24/7','+31 247 247 247','tel:+31247247247')}
    ${row(dsI('leaf',20),'Sawadee WhatsApp, 24/7','020-627 51 29 · antwoord tijdens kantooruren','https://wa.me/31206275129')}
    ${row(dsI('leaf',20),'Sawadee kantoor','020-420 22 20 · 10:00–17:30 Nederlandse tijd','tel:+31204202220')}
    ${hotel?row(dsI('bed',20),'Hotel '+(td?'vandaag':'dag '+d.id)+': '+esc(hotel),'Adres opzoeken (internet)','https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(hotel+', '+v47Region(d)+', Costa Rica')):''}
    <div class="ds-label" style="margin:14px 2px 6px">Eigen gegevens</div>${own}
    <p class="dse-foot">Werkt zonder internet. Bellen gaat via je telefoon; buitenlandse nummers met +31.</p>`}
function dseEmergency(edit){let ov=document.getElementById('dseEm');if(!ov){ov=document.createElement('div');ov.id='dseEm';ov.className='dse-overlay';document.body.append(ov);ov.onclick=e=>{if(e.target===ov)ov.remove()}}
  ov.innerHTML=`<section class="dse-sheet" role="dialog" aria-modal="true" aria-label="Noodkaart">${dseEmergencyHtml(edit)}</section>`;
  ov.querySelector('#dseEmClose').onclick=()=>ov.remove();
  const ed=ov.querySelector('#dseEmEdit');if(ed)ed.onclick=()=>dseEmergency(true);
  const sv=ov.querySelector('#dseEmSave');if(sv)sv.onclick=()=>{ov.querySelectorAll('[data-dse-em]').forEach(i=>state.dsEmergency[i.dataset.dseEm]=i.value.trim().slice(0,80));save();dseEmergency(false)}}

/* ---------------- dagverslag voor Polarsteps ---------------- */
function dseReport(d){const region=v47Region(d),date=new Date(d.date+'T12:00:00').toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const acts=d.activities.filter(a=>a.status!=='excluded').map(a=>a.title);
  const day=[],all=[];Object.values(state.v43Observations||{}).forEach(o=>{const r=o.places?.[region];if(!r?.seen)return;const it={n:v47Info(o.name).nl+(r.photo?' (foto)':'')};all.push(it);if(r.t&&new Date(r.t).toLocaleDateString('sv-SE',{timeZone:'America/Costa_Rica'})===d.date)day.push(it)});
  const note=(state.notes[d.id]||'').trim();
  return [`Dag ${d.id} · ${date} · ${d.place}`,acts.length?`Op het programma: ${acts.join('; ')}`:'',day.length?`Vandaag gezien: ${day.map(x=>x.n).join(', ')}`:all.length?`Gezien in ${region}: ${all.map(x=>x.n).join(', ')}`:'',note?`Mijn notities: ${note}`:''].filter(Boolean).join('\n')}
async function dseShare(d,btn){const txt=dseReport(d);let ok=false;
  try{if(navigator.share){await navigator.share({title:'Dag '+d.id,text:txt});ok=true}}catch(e){if(e.name==='AbortError')return}
  if(!ok){try{await navigator.clipboard.writeText(txt);ok=true}catch(e){const t=document.createElement('textarea');t.value=txt;document.body.append(t);t.select();try{ok=document.execCommand('copy')}catch(_){}t.remove()}}
  if(btn){const s=btn.querySelector('small');if(s)s.textContent=ok?'Gekopieerd of gedeeld':'Kopiëren lukte niet';}}
const dsePrevDC=dayContent;
dayContent=function(d){const h=dsePrevDC(d);if(daySection!=='overview')return h;
  return h+`<button class="dse-report" id="dseReport" data-day="${d.id}"><i>${dsdI('doc',20)}</i><span><b>Dagverslag voor Polarsteps</b><small>Programma, gezien en notities als steekwoorden kopiëren</small></span>${dsdI('ext',18)}</button>`};

/* ---------------- zonlichtstand (per toestel) ---------------- */
function dseUi(){try{return JSON.parse(localStorage.getItem('CR27_UI'))||{}}catch(e){return {}}}
function dseSetUi(k,v){const u=dseUi();u[k]=v;try{localStorage.setItem('CR27_UI',JSON.stringify(u))}catch(e){}}
document.body.classList.toggle('ds-sunmode',!!dseUi().sun);

/* ---------------- Home: tijd + noodkaart ---------------- */
const dsePrevHome=renderHome;
renderHome=function(){return dsePrevHome().replace('<div class="ds-home-body">',`<div class="ds-home-body"><div class="dse-homebar"><div class="dse-clock" id="dseClock">${dseClock()}</div><button class="dse-sosbtn" data-dse-sos>${dsI('alert',16)}Noodkaart</button></div>`)};

/* ---------------- Meer: noodkaart + instellingen ---------------- */
const dsePrevSettings=renderSettings;
renderSettings=function(){let h=dsePrevSettings();if(dsMore)return h;
  const sw=(id,t,sub,on)=>`<label class="ds-menurow dse-switch"><i>${id==='dseSun'?dsI('sun',20):dsI('pin',20)}</i><span><b>${t}</b><small>${sub}</small></span><input type="checkbox" id="${id}" ${on?'checked':''}><em aria-hidden="true"></em></label>`;
  h=h.replace('<div class="ds-label ds-menulbl">Onderweg</div><div class="ds-card ds-menu">',`<div class="ds-label ds-menulbl">Onderweg</div><div class="ds-card ds-menu"><button class="ds-menurow" data-dse-sos><i class="sos">${dsI('alert',20)}</i><span><b>Noodkaart</b><small>911, ambassade, Sawadee, hotel en verzekering</small></span>${dsI('chevR',18)}</button>`);
  return h.replace(/<\/div>\s*$/,`<div class="ds-label ds-menulbl">Instellingen op deze telefoon</div><div class="ds-card ds-menu">${sw('dseSun','Zonlichtstand','Meer contrast voor buiten in de zon',!!dseUi().sun)}${sw('dseGeo','Locatie bij waarneming','Bewaart waar je een soort zag, voor de kaart',!!state.dsObsGeo)}</div></div>`)};

/* ---------------- koppelingen ---------------- */
const dsePrevBind=bindExtras;
bindExtras=function(){dsePrevBind();dseBindMap();dsdBindWide();
  document.querySelectorAll('[data-dse-sos]').forEach(b=>b.onclick=()=>dseEmergency(false));
  const r=document.getElementById('dseReport');if(r)r.onclick=()=>dseShare(S[Number(r.dataset.day)-1],r);
  const sun=document.getElementById('dseSun');if(sun)sun.onchange=()=>{dseSetUi('sun',sun.checked);document.body.classList.toggle('ds-sunmode',sun.checked)};
  const geo=document.getElementById('dseGeo');if(geo)geo.onchange=()=>{state.dsObsGeo=geo.checked;save()}};
render();
