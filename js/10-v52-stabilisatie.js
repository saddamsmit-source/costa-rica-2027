/* ================= v5.2 – stabilisatie: duidelijke labels, back-upcontrole, snelle waarneming ================= */
/* kaartlabels */
v51Legend=function(){return `<div class="v51-legend"><span><i class="l-road"></i>Weg (schematisch)</span><span><i class="l-boat"></i>Boot</span><span><i class="l-exc"></i>Excursie</span><span><i class="l-me"></i>Jij</span></div><p class="v52-note">${v50I('info',14)}Schematische routekaart: rechte lijnen tussen bestemmingen, geen wegen. Navigeren doe je via Google Maps of Waze (vraagt internet).</p>`};
v51GpsBox=function(){const s=v51Watch!==null;return `<div class="v51-gps"><button id="v51gps" class="${s?'on':''}">${v50I('pin',16)}${s?'Live positie aan':'Toon mijn positie'}</button><span id="v51gpsinfo">${v51Pos?`${v51Pos.lat.toFixed(4)}, ${v51Pos.lon.toFixed(4)} · ±${Math.round(v51Pos.acc)} m`:'GPS, werkt zonder internet'}</span></div><p class="v52-gpsnote">Alleen terwijl de app open is en het scherm aan staat. Bij vergrendelen of wisselen van app stopt de browser met updaten.</p>`};

/* valuta: koers expliciet indicatief */
function v52RateAge(){const r=state.v51Rates;if(r.savedAt)return Math.floor((Date.now()-new Date(r.savedAt))/864e5);return Math.floor((Date.now()-new Date('2026-10-12T12:00:00'))/864e5)}
const v52PrevFx=v51Fx;
v51Fx=function(){const a=v52RateAge();return v52PrevFx().replace('<div class="v51-fxrow">',`<div class="v52-rate ${a>30?'old':''}">${v50I(a>30?'alert':'info',15)}<span>Indicatieve koers van ${esc(state.v51Rates.date)} (${a===0?'vandaag':a+' dagen oud'}). Geen live bank- of wisselkantoorprijs; ter plaatse rekenen pinautomaten en winkels hun eigen koers.</span></div><div class="v51-fxrow">`)};

/* back-up: downloaden + controleren */
function v52BackupCard(){const a=v51BackupAge(),v=state.v52Verified,warn=a===null||a>14;
  return `<div class="card v51-backup ${warn?'warn':''}">${v50I(warn?'alert':'check',20)}<div style="flex:1"><b>${a===null?'Nog geen back-up gedownload':a===0?'Back-up gedownload: vandaag':`Laatste download: ${a} ${a===1?'dag':'dagen'} geleden`}</b>
  <span>${v?`Laatst gecontroleerd: ${new Date(v.at).toLocaleDateString('nl-NL')} · ${v.summary}`:'Nog geen back-upbestand gecontroleerd. Een download bewijst niet dat het bestand goed is opgeslagen.'}</span>
  <label class="v52-verify">${v50I('check',15)}Controleer back-upbestand<input type="file" id="v52verify" accept="application/json,.json"></label><div id="v52vres"></div></div></div>`}
function v52Count(s){const obs=Object.values(s.v43Observations||{}).filter(o=>Object.values(o.places||{}).some(p=>p.seen||p.photo)).length;
  return {notes:Object.values(s.notes||{}).filter(Boolean).length,obs,pack:Object.values(s.v48Pack||{}).filter(Boolean).length,booked:Object.values(s.bookings||{}).filter(x=>x==='geboekt').length,tracks:(s.gpsTracks||[]).length,logs:Object.values(s.v44Log||{}).reduce((n,p)=>n+Object.values(p).filter(r=>r.note).length,0)}}
function v52Verify(file){const out=document.getElementById('v52vres');const rd=new FileReader();
  rd.onload=()=>{let j;try{j=JSON.parse(rd.result)}catch(e){out.innerHTML='<p class="v52-bad">Dit is geen leesbaar JSON-bestand.</p>';return}
    if(!j||j.format!=='CR27_V2'||typeof j.state!=='object'){out.innerHTML='<p class="v52-bad">Geen geldige Costa Rica 2027-back-up (formaat ontbreekt).</p>';return}
    const f=v52Count(j.state),c=v52Count(state),keys=[['notes','dagnotities'],['obs','soorten geregistreerd'],['logs','waarnemingsnotities'],['pack','paklijst afgevinkt'],['booked','geboekt'],['tracks','GPS-routes']];
    const rows=keys.map(([k,l])=>`<tr><td>${l}</td><td>${f[k]}</td><td>${c[k]}</td><td>${f[k]>=c[k]?'✓':'<b>ouder</b>'}</td></tr>`).join('');
    const ok=keys.every(([k])=>f[k]>=c[k]);
    out.innerHTML=`<p class="${ok?'v52-good':'v52-bad'}">${ok?'Back-up is leesbaar en compleet ten opzichte van de app.':'Back-up is leesbaar, maar ouder dan je huidige gegevens. Download een nieuwe.'} Gemaakt: ${j.exportedAt?new Date(j.exportedAt).toLocaleString('nl-NL'):'onbekend'}.</p><table class="v52-tbl"><tr><th></th><th>Bestand</th><th>App</th><th></th></tr>${rows}</table><p class="hint">Er is niets overschreven.</p>`;
    state.v52Verified={at:new Date().toISOString(),summary:ok?'compleet':'ouder dan de app'};save()};
  rd.readAsText(file)}
renderSettings=function(){return v52BackupCard()+v51Fx()+v51PrevSettings()};

/* snelle waarneming vanaf het dagoverzicht */
function v52QuickOpen(){const d=S[currentDay-1],{region,base,extras}=v47RegionNames(d),focus=(V47_FOCUS[d.id]||{}).list||[];
  const list=[...new Set([...focus,...base,...extras])];
  const ov=document.createElement('div');ov.className='detail-overlay';ov.id='v52quick';
  ov.innerHTML=`<section class="detail-sheet v52-sheet" role="dialog" aria-modal="true" aria-label="Waarneming registreren"><div class="v52-sheethead"><b>Waarneming · ${esc(region)}</b><button id="v52close" aria-label="Sluiten">✕</button></div>
  <div class="v50-search"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="v52q" type="search" placeholder="Zoek soort (NL of Engels)" autocomplete="off"></div>
  <div id="v52list">${list.map(n=>v52Row(n,region)).join('')}</div>
  <div class="v52-new" id="v52new" hidden><span>Niet gevonden?</span><button id="v52add">+ Voeg "<i></i>" toe en markeer als gezien</button></div></section>`;
  document.body.append(ov);
  const q=ov.querySelector('#v52q');q.focus();
  q.oninput=()=>{const v=q.value.trim().toLowerCase();let n=0;ov.querySelectorAll('.v52-row').forEach(r=>{const ok=!v||r.dataset.s.includes(v);r.style.display=ok?'':'none';if(ok)n++});const nw=ov.querySelector('#v52new');nw.hidden=!(v.length>1&&n===0);nw.querySelector('i').textContent=q.value.trim()};
  ov.querySelector('#v52add').onclick=()=>{const name=q.value.trim();if(!name)return;state.v43Extras[region]??=[];if(!state.v43Extras[region].some(x=>v43name(x)===v43name(name)))state.v43Extras[region].push(name);v52Set(name,region,'seen',true);ov.remove();render()};
  ov.querySelector('#v52close').onclick=()=>{ov.remove();render()};ov.onclick=e=>{if(e.target===ov){ov.remove();render()}};
  ov.querySelectorAll('[data-v52]').forEach(b=>b.onclick=()=>{const [kind,enc]=b.dataset.v52.split('|'),name=decodeURIComponent(enc),rec=v52Set(name,region,kind);const row=b.closest('.v52-row');row.querySelector('[data-v52^="seen"]').classList.toggle('on',rec.seen);row.querySelector('[data-v52^="photo"]').classList.toggle('on',rec.photo)});
}
function v52Row(n,region){const i=v47Info(n),h=v47Obs(n,region).here;return `<div class="v52-row" data-s="${esc((i.nl+' '+i.en).toLowerCase())}"><div><b>${esc(i.nl)}</b>${i.nl!==i.en?`<small>${esc(i.en)}</small>`:''}</div><button data-v52="seen|${encodeURIComponent(n)}" class="${h.seen?'on':''}">Gezien</button><button data-v52="photo|${encodeURIComponent(n)}" class="${h.photo?'on':''}">Foto</button></div>`}
function v52Set(name,place,kind,force){const id=v43name(name);state.v43Observations[id]??={name,places:{}};const o=state.v43Observations[id];o.places[place]??={seen:false,photo:false};const r=o.places[place];
  if(kind==='photo'){r.photo=force??!r.photo;if(r.photo)r.seen=true}else{r.seen=force??!r.seen;if(!r.seen)r.photo=false}save();return r}
const v52PrevDC=dayContent;
dayContent=function(d){const h=v52PrevDC(d);if(daySection!=='overview')return h;const {region}=v47RegionNames(d),n=Object.values(state.v43Observations).filter(o=>o.places?.[region]?.seen).length;
  return h.replace('<button class="v50-stay"',`<button class="v52-quickbtn" id="v52open">${V46_SVG(V46_ICONS.binoculars).replace('width="24" height="24"','width="20" height="20"')}<span><b>Waarneming registreren</b><small>${n?n+' soorten gezien in '+esc(region):'Gezien of gefotografeerd? Eén tik.'}</small></span>${v50I('plus',18)}</button><button class="v50-stay"`)};
const v52PrevBind=bindExtras;
bindExtras=function(){v52PrevBind();const o=document.getElementById('v52open');if(o)o.onclick=v52QuickOpen;const v=document.getElementById('v52verify');if(v)v.onchange=()=>v.files[0]&&v52Verify(v.files[0]);
  const rs=document.getElementById('v51rsave');if(rs){const f=rs.onclick;rs.onclick=()=>{f&&f();state.v51Rates.savedAt=new Date().toISOString();save();render()}}};

render();
