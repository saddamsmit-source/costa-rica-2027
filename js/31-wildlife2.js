/* =====================================================================
   v7.0 · Wildlife 2.0
   Soortgegevens uit js/30-wildlife-data.js (iNaturalist-waarnemingen, foto's
   met licentie, teksten op basis van Wikipedia). Bestaande opslag blijft:
   state.v43Observations (gezien/foto per plek), state.v44Log (notities).
   Nieuw per plek-record: n (aantal), loc.manual (plek aangepast).
   ===================================================================== */
const WL2_FAM={Trochilidae:'Kolibries',Ramphastidae:'Toekans & papegaaien',Psittacidae:'Toekans & papegaaien',Trogonidae:'Trogons, motmots & ijsvogels',Momotidae:'Trogons, motmots & ijsvogels',Alcedinidae:'Trogons, motmots & ijsvogels',Galbulidae:'Trogons, motmots & ijsvogels',Bucconidae:'Trogons, motmots & ijsvogels',Capitonidae:'Trogons, motmots & ijsvogels',Semnornithidae:'Trogons, motmots & ijsvogels',
 Accipitridae:'Roofvogels & uilen',Cathartidae:'Roofvogels & uilen',Falconidae:'Roofvogels & uilen',Pandionidae:'Roofvogels & uilen',Strigidae:'Roofvogels & uilen',Tytonidae:'Roofvogels & uilen',Nyctibiidae:'Roofvogels & uilen',Caprimulgidae:'Roofvogels & uilen',
 Ardeidae:'Reigers & watervogels',Threskiornithidae:'Reigers & watervogels',Ciconiidae:'Reigers & watervogels',Anhingidae:'Reigers & watervogels',Phalacrocoracidae:'Reigers & watervogels',Jacanidae:'Reigers & watervogels',Rallidae:'Reigers & watervogels',Aramidae:'Reigers & watervogels',Heliornithidae:'Reigers & watervogels',Anatidae:'Reigers & watervogels',Podicipedidae:'Reigers & watervogels',Eurypygidae:'Reigers & watervogels',Cinclidae:'Reigers & watervogels',
 Pelecanidae:'Kust & zee',Fregatidae:'Kust & zee',Sulidae:'Kust & zee',Laridae:'Kust & zee',Scolopacidae:'Kust & zee',Charadriidae:'Kust & zee',Recurvirostridae:'Kust & zee',Burhinidae:'Kust & zee',Haematopodidae:'Kust & zee'};
const WL2_MONTHS=['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
function wl2(name){return typeof WL2!=='undefined'?WL2[name]:null}

/* ---------- gegevens inlezen in de bestaande structuren ---------- */
(function(){if(typeof WL2==='undefined')return;
  const BAD=['Blue morpho','Tarantula','Tropical reef fish'];
  for(const [key,r] of Object.entries(WL2)){
    if(!V47_SP[key])V47_SP[key]=[r.nl||r.en||key,r.c,r.m||'d',''];
    if(r.p){DS_SP_PHOTO[key]='wl/'+r.p;V48_PHOTO['wl/'+r.p]={title:'File:'+(r.s||key)+' · iNaturalist-foto '+r.p,credit:r.cr||'onbekend',license:r.li||'',page:r.u||('https://www.inaturalist.org/photos/'+r.p)}}
    if(r.se&&!V49_SEASON[key])V49_SEASON[key]=r.se;
    for(const [reg,t] of Object.entries(r.r||{})){V47_PLACES[reg]??=[];if(!V47_PLACES[reg].some(x=>x[0]===key))V47_PLACES[reg].push([key,t])}}
  for(const reg of Object.keys(V47_PLACES))V47_PLACES[reg]=V47_PLACES[reg].filter(x=>!BAD.includes(x[0]));
  for(const f of Object.values(V47_FOCUS))f.list=f.list.filter(n=>!BAD.includes(n));
  for(const k of Object.keys(V43_TARGETS))delete V43_TARGETS[k];
  for(const [region,list] of Object.entries(V47_PLACES)){const g={};list.forEach(([n])=>{(g[v47Info(n).cat]??=[]).push(n)});V43_TARGETS[region]=g}})();
const wl2PrevGroup=v50Group;
v50Group=function(name){const r=wl2(name);if(r&&r.c==='Vogels'){if(WL2_FAM[r.f])return WL2_FAM[r.f];if(r.o==='Passeriformes')return 'Tangares & zangvogels';return 'Overige bosvogels'}return wl2PrevGroup(name)};

/* ---------- fotobestanden ---------- */
function wl2Thumb(name){const r=wl2(name);return r&&r.p?`./photos/wl/t/${r.p}.jpg`:(DS_SP_PHOTO[name]?`./photos/${DS_SP_PHOTO[name]}.jpg`:'')}
function wl2Mid(name){const r=wl2(name);return r&&r.p?`./photos/wl/${r.p}.jpg`:(DS_SP_PHOTO[name]?`./photos/${DS_SP_PHOTO[name]}.jpg`:'')}
function wl2Hd(name){const r=wl2(name);return r&&r.p&&r.hd?`./photos/wl/hd/${r.p}.jpg`:wl2Mid(name)}

/* soortrij: kleine foto (snel) en tik opent detailvenster */
const wl2PrevCard=v47Card;
v47Card=function(name,region,focus){let h=wl2PrevCard(name,region,focus);const t=wl2Thumb(name);
  if(t){h=h.replace(/<span class="ds-sp-img">(<img[^>]*>|<span class="ds-sp-ico">[\s\S]*?<\/span>)/,`<span class="ds-sp-img"><img src="${t}" alt="" loading="lazy" decoding="async">`)}
  return h.replace('data-ds-sp-toggle',`data-ds-sp-toggle data-wl2="${encodeURIComponent(name)}" data-wl2-region="${encodeURIComponent(region)}"`)};

/* ---------- doelsoorten vandaag (fotostrip) ---------- */
const wl2PrevSL=speciesList;
speciesList=function(d){let h=wl2PrevSL(d);const focus=(V47_FOCUS[d.id]||{}).list||[],region=v47Region(d);if(!focus.length)return h;
  const top=focus.slice(0,5).map(n=>{const i=v47Info(n),ch=v47Chance(region,n),seen=!!v47Obs(n,region).here.seen,t=wl2Mid(n);
    return `<button class="wl2-target ${seen?'seen':''}" data-wl2="${encodeURIComponent(n)}" data-wl2-region="${encodeURIComponent(region)}"><span class="wl2-target-img">${t?`<img src="${t}" alt="" loading="lazy">`:''}${seen?`<i>${dsI('lock',12).replace(DS_ICON.lock,'<path d="m5 12 5 5 9-10"/>')}</i>`:''}</span><b>${esc(i.nl)}</b><small>${ch?DS_CHANCE_TXT[ch]:'Focus vandaag'}</small></button>`}).join('');
  return h.replace(/(<\/div>\s*)(<section class="ds-card ds-wild-sec v47-focus">|<section class="ds-card ds-wild-sec">|<div class="ds-card"><p class="ds-meta">Niets)/,`$1<section class="wl2-targets"><div class="ds-wild-sech"><span class="ds-label">Doelsoorten vandaag</span><small>${esc((V47_FOCUS[d.id]||{}).label||'')}</small></div><div class="wl2-strip">${top}</div></section>$2`)};

/* ---------- detailvenster ---------- */
function wl2Where(name){const rows=v50WhereList(name),r=wl2(name);(r?.r1||[]).forEach(reg=>{if(!rows.some(x=>x[0]===reg))rows.push([reg,1])});return rows}
function wl2Bars(name,region){const rows=wl2Where(name);if(!rows.length)return '';
  return `<div class="wl2-where">${rows.map(([r,c])=>`<div class="${r===region?'here':''}"><span>${esc(r)}</span><span class="ds-chance c${c}">${[1,2,3,4].map(n=>`<i class="${n<=c?'f':''}"></i>`).join('')}</span><small>${DS_CHANCE_TXT[c]}</small></div>`).join('')}</div>`}
function wl2Season(r){if(!r||!r.mo)return '';const v=r.mo.split('').map(Number);
  return `<div class="wl2-months" aria-label="Waarnemingen in Costa Rica per maand">${v.map((x,i)=>`<div class="${i===1||i===2?'trip':''}"><i style="height:${Math.max(4,x*10)}%"></i><small>${WL2_MONTHS[i][0]}</small></div>`).join('')}</div><p class="wl2-src">Relatief aantal waarnemingen in Costa Rica per maand (iNaturalist). Gemarkeerd: februari en maart.</p>`}
function wl2ObsList(name){const o=state.v43Observations[v43name(name)];if(!o)return '';const log=state.v44Log[v43name(name)]||{};
  return Object.entries(o.places||{}).filter(([,r])=>r.seen).map(([pl,r])=>{const note=log[pl]?.note||'',when=r.t?new Date(r.t).toLocaleString('nl-NL',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'zonder tijd';
    const loc=r.loc?(r.loc.manual?`plek aangepast: ${esc(r.loc.label||'')}`:`GPS ± ${r.loc.acc||'?'} m`):'geen plek';
    return `<div class="wl2-obs" data-wl2-pl="${encodeURIComponent(pl)}"><div class="wl2-obs-h"><b>${esc(pl)}</b><small>${when}${r.photo?' · op foto':''}</small></div>
      <div class="wl2-obs-row"><span class="wl2-loc">${dsI('pin',14)}${loc}</span><span class="wl2-count"><button data-wl2-n="-1" aria-label="Minder">−</button><em class="ds-num">${r.n||1}</em><button data-wl2-n="1" aria-label="Meer">+</button></span></div>
      <div class="wl2-locbtns"><button data-wl2-loc="gps">${dsI('pin',13)}Huidige positie</button><button data-wl2-loc="stop">${dsI('map',13)}Plek van ${esc(pl)}</button></div>
      <textarea data-wl2-note placeholder="Notitie: gedrag, aantal, foto-instellingen…" maxlength="1000">${esc(note)}</textarea></div>`}).join('')}
function wl2SheetHtml(name,region){const i=v47Info(name),r=wl2(name),o=v47Obs(name,region).here,ch=v47Chance(region,name),m=V47_MOMENT[i.moment],season=V49_SEASON[name],ptip=V51_PHOTO[name],mid=wl2Mid(name),enc=encodeURIComponent(name);
  const ph=r&&r.p?V48_PHOTO['wl/'+r.p]:(DS_SP_PHOTO[name]?V48_PHOTO[DS_SP_PHOTO[name]]:null);
  const sec=(t,txt,cls)=>txt?`<div class="wl2-sec ${cls||''}"><h4>${t}</h4><p>${esc(txt)}</p></div>`:'';
  const obs=wl2ObsList(name);
  return `<div class="wl2-photo">${mid?`<button class="wl2-zoombtn" data-wl2-zoom aria-label="Foto vergroten"><img src="${mid}" alt="${esc(i.nl)}"><span>${dsI('search',14)}Tik om in te zoomen</span></button>`:`<div class="wl2-nophoto">${v47Svg(V47_CAT_ICON[i.cat]||V46_ICONS.pin,40)}</div>`}
      <button class="wl2-close" data-wl2-close aria-label="Sluiten">${dsI('plus',22)}</button>${ph?`<span class="wl2-credit">${esc(ph.credit)} · ${esc(ph.license)}</span>`:''}</div>
    <div class="wl2-body">
      <h2>${esc(i.nl)}</h2><p class="wl2-names">${i.nl!==i.en?esc(i.en)+' · ':''}${r&&r.s?`<i>${esc(r.s)}</i>`:''}</p>
      <div class="wl2-tags">${esc(i.cat)}${r&&r.fn?' · '+esc(r.fn):''}</div>
      <div class="wl2-reg"><span class="ds-label">${esc(region)}</span><div><button class="${o.seen?'on':''}" data-wl2-reg="seen">${dsI('lock',18).replace(DS_ICON.lock,'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')}${o.seen?'Gezien':'Gezien?'}</button><button class="${o.photo?'on':''}" data-wl2-reg="photo">${dsI('lock',18).replace(DS_ICON.lock,V46_ICONS.camera)}${o.photo?'Op foto':'Foto?'}</button></div></div>
      <div class="ds-chips">${ch?`<span>${DS_CHANCE_TXT[ch]} hier</span>`:''}${m?`<span>${m[0]}</span>`:''}${season?`<span class="sky">${esc(season)}</span>`:''}</div>
      ${sec('Herkenning',r&&r.h)}${sec('Leefgebied en gedrag',r&&r.l)}${sec('Roep / geluid',r&&r.v,'voice')}${sec('Tip',i.tip)}
      ${ptip?`<div class="ds-ptip">${dsI('lock',16).replace(DS_ICON.lock,V46_ICONS.camera)}<span><b>Fototip</b> ${esc(ptip)}</span></div>`:''}
      ${wl2Where(name).length?`<div class="wl2-sec"><h4>Kans op jullie route</h4>${wl2Bars(name,region)}</div>`:''}
      ${r&&r.mo?`<div class="wl2-sec"><h4>Seizoen</h4>${wl2Season(r)}</div>`:''}
      ${obs?`<div class="wl2-sec"><h4>Mijn waarnemingen</h4>${obs}</div>`:''}
      <p class="wl2-src">${r?`Bronnen: waarnemingen en foto via <a href="https://www.inaturalist.org/taxa/${r.i}" target="_blank" rel="noopener">iNaturalist</a>${r.w?`; tekst bewerkt naar <a href="${esc(r.w)}" target="_blank" rel="noopener">Wikipedia</a> (CC BY-SA)`:''}. Kansen zijn een inschatting op basis van waarnemingen in januari–april, geen garantie.`:'Eigen soort.'}</p>
    </div>`}
let wl2Cur=null;
function wl2Open(name,region){wl2Cur={name,region};let ov=document.getElementById('wl2Sheet');
  if(!ov){ov=document.createElement('div');ov.id='wl2Sheet';ov.className='wl2-overlay';document.body.append(ov);ov.addEventListener('click',e=>{if(e.target===ov)wl2Close()})}
  ov.innerHTML=`<section class="wl2-sheet" role="dialog" aria-modal="true" aria-label="${esc(v47Info(name).nl)}">${wl2SheetHtml(name,region)}</section>`;document.body.classList.add('wl2-lock');wl2BindSheet(ov)}
function wl2Close(){const ov=document.getElementById('wl2Sheet');if(ov)ov.remove();document.body.classList.remove('wl2-lock');if(wl2Cur){wl2Cur=null;const y=scrollY;render();scrollTo(0,y)}}
function wl2Rec(name,pl){const o=state.v43Observations[v43name(name)];return o?.places?.[pl]}
function wl2BindSheet(ov){const {name,region}=wl2Cur;
  ov.querySelector('[data-wl2-close]').onclick=wl2Close;
  const z=ov.querySelector('[data-wl2-zoom]');if(z)z.onclick=()=>wl2Zoom(name);
  ov.querySelectorAll('[data-wl2-reg]').forEach(b=>b.onclick=()=>{v52Set(name,region,b.dataset.wl2Reg);dseTag(name,region);const y=ov.querySelector('.wl2-sheet').scrollTop;wl2Open(name,region);ov.querySelector('.wl2-sheet').scrollTop=y});
  ov.querySelectorAll('.wl2-obs').forEach(box=>{const pl=decodeURIComponent(box.dataset.wl2Pl),rec=wl2Rec(name,pl);if(!rec)return;
    box.querySelectorAll('[data-wl2-n]').forEach(b=>b.onclick=()=>{rec.n=Math.max(1,Math.min(999,(rec.n||1)+Number(b.dataset.wl2N)));save();box.querySelector('.wl2-count em').textContent=rec.n});
    const ta=box.querySelector('[data-wl2-note]');ta.oninput=()=>{const id=v43name(name);state.v44Log[id]??={};const ex=state.v44Log[id][pl]||{};state.v44Log[id][pl]={date:ex.date||(rec.t?rec.t.slice(0,10):''),note:ta.value.slice(0,1000)};save()};
    box.querySelectorAll('[data-wl2-loc]').forEach(b=>b.onclick=()=>{const lab=box.querySelector('.wl2-loc');
      if(b.dataset.wl2Loc==='stop'){const p=V51_PT[pl];if(!p){lab.textContent='Plek onbekend';return}rec.loc={lat:p[0],lon:p[1],acc:null,manual:true,label:p[2]};save();lab.innerHTML=`${dsI('pin',14)}plek aangepast: ${esc(p[2])}`}
      else{if(!navigator.geolocation){lab.textContent='GPS niet beschikbaar';return}lab.textContent='Positie zoeken…';navigator.geolocation.getCurrentPosition(p=>{rec.loc={lat:+p.coords.latitude.toFixed(5),lon:+p.coords.longitude.toFixed(5),acc:Math.round(p.coords.accuracy),manual:true,label:'huidige positie ± '+Math.round(p.coords.accuracy)+' m'};save();lab.innerHTML=`${dsI('pin',14)}plek aangepast: ${esc(rec.loc.label)}`},e=>{lab.textContent=v10Why(e,'gps')},{enableHighAccuracy:true,timeout:20000,maximumAge:0})}})});
}

/* ---------- inzoomen (knijpen, slepen, dubbeltik) ---------- */
function wl2Zoom(name){const hd=wl2Hd(name),mid=wl2Mid(name),ph=V48_PHOTO[DS_SP_PHOTO[name]]||null;
  const z=document.createElement('div');z.className='wl2-zoom';z.innerHTML=`<img alt="${esc(v47Info(name).nl)}" draggable="false"><button class="wl2-zx" aria-label="Sluiten">${dsI('plus',24)}</button><span class="wl2-zh">Knijp of dubbeltik om te zoomen</span>${ph?`<span class="wl2-zc">${esc(ph.credit)} · ${esc(ph.license)}</span>`:''}`;
  document.body.append(z);const img=z.querySelector('img');img.onerror=()=>{if(img.src.indexOf(mid.slice(2))<0)img.src=mid};img.src=hd;
  let s=1,x=0,y=0,pts=new Map(),start=null,lastTap=0;const apply=()=>{img.style.transform=`translate(${x}px,${y}px) scale(${s})`};
  const clamp=()=>{if(s<=1){s=1;x=0;y=0}};
  z.addEventListener('pointerdown',e=>{if(e.target.closest('.wl2-zx'))return;z.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===1){const now=Date.now();if(now-lastTap<300){s=s>1?1:2.5;if(s===1){x=0;y=0}apply();lastTap=0;return}lastTap=now}
    const a=[...pts.values()];start={s,x,y,d:a.length>1?Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y):0,cx:a[0].x,cy:a[0].y}});
  z.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId)||!start)return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});const a=[...pts.values()];
    if(a.length>1&&start.d){s=Math.min(6,Math.max(1,start.s*Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)/start.d))}else if(s>1){x=start.x+(a[0].x-start.cx);y=start.y+(a[0].y-start.cy)}apply()});
  const up=e=>{pts.delete(e.pointerId);clamp();apply();const a=[...pts.values()];start=a.length?{s,x,y,d:0,cx:a[0].x,cy:a[0].y}:null};
  z.addEventListener('pointerup',up);z.addEventListener('pointercancel',up);
  z.addEventListener('wheel',e=>{e.preventDefault();s=Math.min(6,Math.max(1,s*(e.deltaY<0?1.15:0.87)));clamp();apply()},{passive:false});
  z.querySelector('.wl2-zx').onclick=()=>z.remove()}

/* ---------- Wildlife-scherm: soortenlijst, logboek, export, hoge resolutie ---------- */
function wl2Entries(){const out=[];for(const [id,o] of Object.entries(state.v43Observations||{}))for(const [pl,r] of Object.entries(o.places||{}))if(r.seen){const note=state.v44Log?.[id]?.[pl]?.note||'';out.push({name:o.name,pl,r,note})}return out.sort((a,b)=>(b.r.t||'').localeCompare(a.r.t||''))}
function wl2Life(){const seen=new Set(wl2Entries().map(e=>e.name)),cats=['Vogels','Zoogdieren','Reptielen','Amfibieën','Zeeleven'];
  const tot=c=>Object.values(V47_SP).filter(x=>x[1]===c).length,got=c=>[...seen].filter(n=>v47Info(n).cat===c).length;
  const regs=Object.keys(V47_PLACES).map(r=>[r,wl2Entries().filter(e=>e.pl===r).length]).filter(x=>x[1]);
  return `<div class="ds-card wl2-life"><div class="wl2-life-h"><div><span class="ds-label">Mijn soortenlijst</span><b class="ds-num">${seen.size}</b><small>soorten gezien</small></div><button class="ds-chipbtn" id="wl2Export">${dsdI('download',15)}Exporteer</button></div>
    ${cats.map(c=>{const t=tot(c),g=got(c);return t?`<div class="wl2-lrow"><span>${c}</span><div class="ds-bar"><i style="width:${Math.round(100*g/t)}%"></i></div><em class="ds-num">${g}/${t}</em></div>`:''}).join('')}
    ${regs.length?`<div class="wl2-regs">${regs.map(([r,n])=>`<span>${esc(r)} <b class="ds-num">${n}</b></span>`).join('')}</div>`:''}</div>`}
function wl2Log(){const e=wl2Entries();if(!e.length)return '<div class="ds-card"><p class="ds-meta">Nog geen waarnemingen. Tik bij een soort op Gezien; tijd, plek en aantal komen dan hier.</p></div>';
  const by={};e.forEach(x=>{const k=x.r.t?new Date(x.r.t).toLocaleDateString('sv-SE',{timeZone:'America/Costa_Rica'}):'zonder datum';(by[k]??=[]).push(x)});
  return Object.entries(by).map(([day,list])=>`<div class="ds-card wl2-logday"><div class="wl2-logh"><b>${day==='zonder datum'?'Zonder datum':new Date(day+'T12:00:00').toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'})}</b><em class="ds-num">${list.length}</em></div>
    ${list.map(x=>{const t=wl2Thumb(x.name);return `<button class="wl2-logrow" data-wl2="${encodeURIComponent(x.name)}" data-wl2-region="${encodeURIComponent(x.pl)}"><span class="wl2-logimg">${t?`<img src="${t}" alt="" loading="lazy">`:''}</span><span><b>${esc(v47Info(x.name).nl)}${(x.r.n||1)>1?` <em class="ds-num">× ${x.r.n}</em>`:''}</b><small>${esc(x.pl)}${x.r.t?' · '+new Date(x.r.t).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'}):''}${x.r.photo?' · op foto':''}${x.r.loc?' · plek':''}</small>${x.note?`<span class="wl2-lognote">${esc(x.note)}</span>`:''}</span>${dsI('chevR',16)}</button>`}).join('')}</div>`).join('')}
function wl2Csv(){const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  const rows=[['datum','tijd','nederlands','engels','wetenschappelijk','groep','plek','aantal','op foto','breedtegraad','lengtegraad','nauwkeurigheid (m)','notitie']];
  wl2Entries().forEach(x=>{const r=wl2(x.name)||{},t=x.r.t?new Date(x.r.t):null;rows.push([t?t.toLocaleDateString('sv-SE',{timeZone:'America/Costa_Rica'}):'',t?t.toLocaleTimeString('nl-NL',{timeZone:'America/Costa_Rica',hour:'2-digit',minute:'2-digit'}):'',v47Info(x.name).nl,v47Info(x.name).en,r.s||'',v47Info(x.name).cat,x.pl,x.r.n||1,x.r.photo?'ja':'nee',x.r.loc?.lat??'',x.r.loc?.lon??'',x.r.loc?.acc??'',x.note])});
  const blob=new Blob(['﻿'+rows.map(r=>r.map(q).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Costa_Rica_2027_soortenlijst.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
/* hoge resolutie downloaden naar een eigen cache (blijft bij app-updates) */
const WL2_HD_CACHE='cr27-wl-hd-1';
function wl2HdList(){return typeof WL2==='undefined'?[]:[...new Set(Object.values(WL2).filter(r=>r.p&&r.hd).map(r=>`./photos/wl/hd/${r.p}.jpg`))]}
let wl2HdBusy=false;
async function wl2HdCount(){try{const c=await caches.open(WL2_HD_CACHE);return (await c.keys()).length}catch(e){return 0}}
function wl2HdCard(){const n=wl2HdList().length,mb=typeof WL2_META!=='undefined'?WL2_META.hdMB:null;
  return `<div class="ds-card wl2-hd" id="wl2Hd"><div class="wl2-hd-h"><i>${dsdI('download',20)}</i><div><b>Foto's in hoge resolutie</b><small id="wl2HdState">${n} foto's${mb?' · ca. '+mb+' MB':''} · voor inzoomen zonder internet</small></div></div>
  <div class="ds-bar" id="wl2HdBar" hidden><i style="width:0%"></i></div><div class="wl2-hd-btns"><button class="ds-btn primary" id="wl2HdGo">${dsdI('download',16)}Downloaden</button><button class="ds-btn secondary" id="wl2HdDel" hidden>Verwijderen</button></div>
  <p class="ds-meta" id="wl2Off" style="margin:8px 0 0"></p><p class="ds-meta" style="margin:6px 0 0">Doe dit thuis op wifi. Zonder download zie je offline de standaardfoto; inzoomen werkt dan minder scherp.</p></div>`}
async function wl2HdRefresh(){const st=document.getElementById('wl2HdState');if(!st)return;const off=document.getElementById('wl2Off');if(off){const n=await wl2OfflineCount(),t=wl2FileList().length;off.textContent=n>=t?`Alle soortfoto's staan offline op deze telefoon.`:`Standaardfoto's offline: ${n} van ${t} bestanden (wordt automatisch aangevuld met internet).`}const n=wl2HdList().length,have=await wl2HdCount();
  if(have>=n&&n){st.textContent=`Alle ${n} foto's staan op deze telefoon`;document.getElementById('wl2HdGo').hidden=true;document.getElementById('wl2HdDel').hidden=false}
  else if(have){st.textContent=`${have} van ${n} foto's gedownload`;document.getElementById('wl2HdDel').hidden=false}}
async function wl2HdDownload(){if(wl2HdBusy)return;wl2HdBusy=true;const list=wl2HdList(),bar=document.getElementById('wl2HdBar'),st=document.getElementById('wl2HdState'),go=document.getElementById('wl2HdGo');
  try{const c=await caches.open(WL2_HD_CACHE);let done=0,fail=0;if(bar)bar.hidden=false;if(go)go.disabled=true;
    const queue=[...list];const worker=async()=>{while(queue.length){const u=queue.shift();try{if(!(await c.match(u))){const r=await fetch(u,{cache:'no-store'});if(r.ok)await c.put(u,r);else fail++}}catch(e){fail++}done++;const b=document.querySelector('#wl2HdBar i'),s=document.getElementById('wl2HdState');if(b)b.style.width=Math.round(100*done/list.length)+'%';if(s)s.textContent=`${done} van ${list.length}…`}};
    await Promise.all([worker(),worker(),worker(),worker()]);
    const s=document.getElementById('wl2HdState');if(s)s.textContent=fail?`${list.length-fail} van ${list.length} gelukt; probeer de rest opnieuw`:`Alle ${list.length} foto's staan op deze telefoon`}
  catch(e){if(st)st.textContent=v10Why(e,'download')}
  wl2HdBusy=false;const g=document.getElementById('wl2HdGo');if(g)g.disabled=false;wl2HdRefresh()}
const wl2PrevWild=renderWildlife;
renderWildlife=function(){let h=wl2PrevWild();
  h=h.replace(/<div class="ds-section-title">Per reisdag<\/div>/,`${wl2Life()}<div class="ds-section-title">Per reisdag</div>`);
  h=h.replace(/<div class="ds-section-title">Logboek<\/div><div class="ds-card">[\s\S]*?<\/div>\s*<\/div>\s*$/,`<div class="ds-section-title">Logboek</div>${wl2Log()}${wl2HdCard()}</div>`);
  return h};
v50GlobalSearch=function(v){const box=document.getElementById('v50gres');if(!box)return;const q=v.trim().toLowerCase();if(q.length<2){box.innerHTML='';return}
  const reg=v47Region(S[(v48TripDay()||currentDay)-1]);
  const hits=Object.keys(V47_SP).filter(n=>{const i=v47Info(n),r=wl2(n);return (i.nl+' '+i.en+' '+i.cat+' '+v50Group(n)+' '+(r?.s||'')).toLowerCase().includes(q)}).slice(0,40);
  box.innerHTML=hits.length?hits.map(n=>{const i=v47Info(n),w=wl2Where(n),t=wl2Thumb(n);return `<button class="ds-gres wl2-gres" data-wl2="${encodeURIComponent(n)}" data-wl2-region="${encodeURIComponent(w[0]?w[0][0]:reg)}"><span class="wl2-logimg">${t?`<img src="${t}" alt="" loading="lazy">`:''}</span><span><b>${esc(i.nl)}</b>${i.nl!==i.en?`<em>${esc(i.en)}</em>`:''}<span class="ds-chips">${w.slice(0,5).map(([r,c])=>`<span class="c${c}">${esc(r)}</span>`).join('')||'<span>niet op de route verwacht</span>'}</span></span></button>`}).join(''):'<p class="ds-meta" style="margin-top:10px">Geen soort gevonden.</p>';
  wl2BindOpeners(box)};

/* ---------- soortfoto's offline: op de achtergrond aanvullen (eigen cache, blijft bij updates) ---------- */
const WL2_CACHE='cr27-wl-1';
function wl2FileList(){if(typeof WL2==='undefined')return [];const ids=[...new Set(Object.values(WL2).filter(r=>r.p).map(r=>r.p))];return ids.flatMap(p=>[`./photos/wl/t/${p}.jpg`,`./photos/wl/${p}.jpg`])}
let wl2PrefetchRun=false;
async function wl2Prefetch(){if(wl2PrefetchRun||!('caches' in window)||!navigator.onLine||!location.protocol.startsWith('http'))return;wl2PrefetchRun=true;
  try{const c=await caches.open(WL2_CACHE),have=new Set((await c.keys()).map(r=>new URL(r.url).pathname)),todo=wl2FileList().filter(u=>!have.has(new URL(u,location.href).pathname));
    const worker=async()=>{while(todo.length&&navigator.onLine){const u=todo.shift();try{const r=await fetch(u);if(r.ok)await c.put(u,r)}catch(e){}}};
    await Promise.all([worker(),worker(),worker()])}catch(e){}
  wl2PrefetchRun=false}
async function wl2OfflineCount(){try{const c=await caches.open(WL2_CACHE);return (await c.keys()).length}catch(e){return 0}}
(window.requestIdleCallback||setTimeout)(()=>wl2Prefetch(),{timeout:4000});
window.addEventListener('online',()=>wl2Prefetch());

/* ---------- koppelingen ---------- */
function wl2BindOpeners(root){(root||document).querySelectorAll('[data-wl2]').forEach(b=>b.onclick=e=>{e.preventDefault();wl2Open(decodeURIComponent(b.dataset.wl2),decodeURIComponent(b.dataset.wl2Region||''))})}
const wl2PrevBind=bindExtras;
bindExtras=function(){wl2PrevBind();wl2BindOpeners();
  const ex=document.getElementById('wl2Export');if(ex)ex.onclick=wl2Csv;
  const go=document.getElementById('wl2HdGo');if(go){go.onclick=wl2HdDownload;wl2HdRefresh()}
  const del=document.getElementById('wl2HdDel');if(del)del.onclick=async()=>{if(!await v10Confirm({title:'Foto\'s in hoge resolutie verwijderen?',text:'Dit maakt ruimte vrij op deze telefoon. Je kunt ze later opnieuw downloaden, liefst via wifi.',ok:'Verwijderen',danger:true}))return;try{await caches.delete(WL2_HD_CACHE)}catch(e){}render()}};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const z=document.querySelector('.wl2-zoom');if(z)z.remove();else if(document.getElementById('wl2Sheet'))wl2Close()}});
render();
