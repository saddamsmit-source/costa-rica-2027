/* =====================================================================
   v10.5 · Pins op de kaart
   Een pin is een plek die je zelf vastlegt (bijvoorbeeld een activiteit buiten de vaste route):
   huidige GPS-positie of een tik op de kaart, met titel, notitie en dag.
   - Opslag: state.v105Pins = { [id]: {id, day, t, lat, lon, acc?, title, note} }. Een object met vaste ID's,
     zodat "Alles bewaren" en het samenvoegen bij herstellen per pin werken (geen verlies bij een oudere back-up).
   - De pin hoort bij een dag; vanuit de pin ga je naar de dagpagina met je foto's, sfeerbeelden en notities.
   - Laag, knoppen en venster hangen in 24-kaart-extra.js (dseLayer, dsdGps, dsePop) aan deze module.
   Raakt geen bestaande gegevens aan; alleen nieuwe sleutels (v105Pins, dsLayers.*.pin).
   ===================================================================== */
state.v105Pins??={};
state.dsLayers.day.pin??=true;state.dsLayers.full.pin??=true;
const V105={placing:false,max:{title:80,note:600}};
const v105Uid=()=>'pin'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const v105List=()=>Object.values(state.v105Pins).filter(p=>p&&isFinite(p.lat)&&isFinite(p.lon)).sort((a,b)=>(a.t||'').localeCompare(b.t||''));
/* kaartpunt (viewBox-eenheden) ↔ coördinaat; omgekeerd van v51XY */
const v105LL=(x,y)=>[V51_MAP.LAT1-y/V51_MAP.sx,x/(V51_MAP.k*V51_MAP.sx)+V51_MAP.LON0];
const v105Inside=(lat,lon)=>{const [x,y]=v51XY(lat,lon);return x>=0&&y>=0&&x<=V51_MAP.W&&y<=V51_MAP.H};
function v105DefaultDay(){if(tab==='days'&&currentDay)return currentDay;return (typeof v48TripDay==='function'&&v48TripDay())||1}
const v105Fmt=(iso)=>{const d=new Date(iso);return isNaN(d)?'':d.toLocaleString('nl-NL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})};

/* ---------- opslaan, bewerken, verwijderen ---------- */
function v105Save(p){const id=p.id||v105Uid(),old=state.v105Pins[id]||{};
  const rec={...old,...p,id,title:String(p.title||'').trim().slice(0,V105.max.title),note:String(p.note||'').trim().slice(0,V105.max.note),day:Math.min(S.length,Math.max(1,+p.day||1)),t:old.t||p.t||new Date().toISOString()};
  state.v105Pins[id]=rec;save();return rec}
function v105Remove(id){const rec=state.v105Pins[id];if(!rec)return;delete state.v105Pins[id];save();
  const redo=()=>{if(document.querySelector('.ds-mapbox'))dseRedrawMap();else render()};redo();
  v10Toast('Pin verwijderd',{action:'Ongedaan maken',onAction:()=>{state.v105Pins[id]=rec;save();redo();v10Toast('Teruggezet')}})}

/* ---------- laag op de kaart (aangeroepen vanuit dseLayer) ---------- */
function v105Layer(f,s,pins,curDays){let top='';
  v105List().forEach(p=>{if(!v105Inside(p.lat,p.lon))return;const [x,y]=v51XY(p.lat,p.lon),r=7.6*s,cy=y-r*1.4,on=curDays.includes(p.day);
    top+=`<g class="dse-poi pin${on?' on':''}" data-dse-poi="pin:${esc(p.id)}" role="button" aria-label="Pin ${esc(p.title)}"><path d="M${f(x)},${f(y)}L${f(x-r*.74)},${f(cy+r*.68)}A${f(r)},${f(r)} 0 1 1 ${f(x+r*.74)},${f(cy+r*.68)}Z"/><circle class="dot" cx="${f(x)}" cy="${f(cy)}" r="${f(r*.38)}"/></g>`;
    pins.push({x,y:cy,r:r+3*s,label:'',cls:'pin'})});
  return top}

/* ---------- venster bij een tik op een pin ---------- */
function v105Go(day,sec){tab='days';currentDay=+day;daySection=sec;render();scrollTo({top:0,behavior:'instant'})}
function v105Pop(id){const box=document.getElementById('dsePop'),p=state.v105Pins[id.slice(4)];if(!box||!p)return;
  const d=S[p.day-1],n=k=>V84[k].filter(x=>x.day===p.day).length,own=n('list')+n('vids'),mood=n('moods'),note=(state.notes[p.day]||'').trim(),ll=p.lat.toFixed(5)+','+p.lon.toFixed(5);
  box.innerHTML=`<div class="dse-pop-h"><span class="dse-k pin">Pin</span><button class="dse-x" aria-label="Sluiten">${dsI('plus',18)}</button></div><b>${esc(p.title)}</b>
    <p class="v105-meta">Dag ${p.day}${d?' · '+esc(new Date(d.date+'T12:00:00').toLocaleDateString('nl-NL',{weekday:'short',day:'numeric',month:'short'})):''}</p>${p.t?`<p class="v105-meta">Vastgelegd ${esc(v105Fmt(p.t))}</p>`:''}
    ${p.note?`<p class="v105-note">${esc(p.note)}</p>`:''}
    <button class="dse-act" data-v105-go="${p.day}|overview"><span>Dag ${p.day} · foto's, sfeer en notities${own+mood?` (${own+mood})`:''}${note?' · dagnotitie':''}</span>${dsI('chevR',16)}</button>
    ${own?`<button class="dse-act" data-v105-go="${p.day}|wildlife"><span>Dag ${p.day} · wildlife met eigen foto's en video's (${own})</span>${dsI('chevR',16)}</button>`:''}
    <div class="v105-acts"><button class="ds-btn secondary" data-v105-edit="${esc(p.id)}">Bewerken</button><button class="ds-btn danger" data-v105-del="${esc(p.id)}">Verwijderen</button></div>
    <div class="v74-links"><a class="dse-maps" href="https://www.google.com/maps/search/?api=1&query=${ll}" target="_blank" rel="noopener">${dsI('pin',14)}Google Maps</a><a class="dse-maps" href="https://waze.com/ul?ll=${ll}&navigate=yes" target="_blank" rel="noopener">${dsI('pin',14)}Waze</a></div>`;
  box.hidden=false;box.querySelector('.dse-x').onclick=()=>{box.hidden=true};
  box.querySelectorAll('[data-v105-go]').forEach(b=>b.onclick=()=>{const[dd,sec]=b.dataset.v105Go.split('|');v105Go(dd,sec)});
  box.querySelector('[data-v105-edit]').onclick=()=>v105Form({id:p.id});
  box.querySelector('[data-v105-del]').onclick=()=>{box.hidden=true;v105Remove(p.id)}}

/* ---------- formulier ---------- */
function v105Form(o){document.getElementById('v105Sheet')?.remove();
  const old=o.id?state.v105Pins[o.id]:null,lat=old?old.lat:o.lat,lon=old?old.lon:o.lon,acc=old?old.acc:o.acc;if(!isFinite(lat)||!isFinite(lon))return;
  const day=old?old.day:(o.day||v105DefaultDay()),el=document.createElement('div');el.id='v105Sheet';el.className='v105-sheet';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label',old?'Pin bewerken':'Nieuwe pin');
  el.innerHTML=`<form class="v105-box" novalidate><h3>${old?'Pin bewerken':'Nieuwe pin'}</h3>
    <p class="v105-where">${dsI('pin',14)}<span>${lat.toFixed(5)}, ${lon.toFixed(5)}${acc?` · ±${Math.round(acc)} m`:''}</span></p>
    <label>Titel<input name="title" maxlength="${V105.max.title}" autocomplete="off" placeholder="Bijvoorbeeld: koffieplantage"></label>
    <label>Notitie<textarea name="note" rows="3" maxlength="${V105.max.note}" placeholder="Wat deden we hier? (optioneel)"></textarea></label>
    <label>Dag<select name="day">${S.map(d=>`<option value="${d.id}"${d.id===day?' selected':''}>Dag ${d.id} · ${esc(new Date(d.date+'T12:00:00').toLocaleDateString('nl-NL',{weekday:'short',day:'numeric',month:'short'}))} · ${esc(d.base)}</option>`).join('')}</select></label>
    <p class="v105-err" role="alert" hidden>Geef de pin een titel.</p>
    <div class="v105-btns"><button type="button" class="ds-btn secondary" data-v105-x>Annuleren</button><button type="submit" class="ds-btn primary">Bewaren</button></div></form>`;
  const f=el.querySelector('form');f.title.value=old?old.title:'';f.note.value=old?old.note||'':'';
  const close=()=>{el.classList.add('out');setTimeout(()=>el.remove(),150)};
  el.querySelector('[data-v105-x]').onclick=close;el.onclick=e=>{if(e.target===el)close()};
  f.onsubmit=e=>{e.preventDefault();const t=f.title.value.trim();if(!t){el.querySelector('.v105-err').hidden=false;f.title.focus();return}
    const rec=v105Save({id:old?.id,lat,lon,acc,title:t,note:f.note.value,day:+f.day.value});close();
    document.getElementById('dsePop')?.setAttribute('hidden','');
    if(document.querySelector('.ds-mapbox'))dseRedrawMap();
    v10Toast(old?'Pin bijgewerkt':`Pin bewaard bij dag ${rec.day}`)};
  document.body.append(el);f.title.focus()}

/* ---------- pin plaatsen: huidige positie of tik op de kaart ---------- */
function v105Place(lat,lon,acc){if(!v105Inside(lat,lon)){v10Toast('Deze plek ligt buiten de kaart van Costa Rica. Kies "Pin op kaart" of probeer het op reis.',{kind:'warn',ms:6000});return}
  v105Form({lat:+lat.toFixed(5),lon:+lon.toFixed(5),acc})}
function v105Here(){if(v51Pos){v105Place(v51Pos.lat,v51Pos.lon,v51Pos.acc);return}
  if(!navigator.geolocation){v10Toast('Locatie is op dit apparaat niet beschikbaar. Gebruik "Pin op kaart".',{kind:'warn'});return}
  v10Toast('Positie bepalen…',{ms:2500});
  navigator.geolocation.getCurrentPosition(p=>v105Place(p.coords.latitude,p.coords.longitude,p.coords.accuracy),e=>v10Fail(e,'gps'),{enableHighAccuracy:true,maximumAge:0,timeout:20000})}
function v105Sync(){document.querySelectorAll('[data-v105-map]').forEach(b=>{b.classList.toggle('live',V105.placing);b.setAttribute('aria-pressed',String(V105.placing))});
  document.querySelectorAll('.ds-mapbox').forEach(b=>b.classList.toggle('v105-placing',V105.placing))}
function v105Mode(on){V105.placing=on;v105Sync();if(on)v10Toast('Tik op de kaart waar de pin moet komen',{ms:4000})}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-v105-here],[data-v105-map]');
  if(b){e.preventDefault();if(b.dataset.v105Here!==undefined){v105Mode(false);v105Here()}else v105Mode(!V105.placing);return}
  if(!V105.placing)return;const svg=e.target.closest('.ds-mapbox svg');if(!svg){return}
  if(e.target.closest('[data-dse-poi]'))return;
  e.preventDefault();e.stopPropagation();
  const m=svg.getScreenCTM();if(!m)return;const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(m.inverse()),[lat,lon]=v105LL(q.x,q.y);
  v105Mode(false);v105Place(lat,lon)},true);
