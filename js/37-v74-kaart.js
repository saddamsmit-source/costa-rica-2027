/* =====================================================================
   v7.4 · Kaart: hotels en reistijden
   Hotels: pin op de echte locatie (niet verschoven zoals de overige pins).
   Coördinaten: OpenStreetMap (Nominatim/Overpass, stap s74hotels/s74hotels2),
   steeds gecontroleerd met een tweede bron (adres of beschrijving van het hotel,
   of een tweede kaartbron). Hotels zonder geverifieerde locatie krijgen geen pin.
   Reistijden: Sawadee-reistijden uit V51_TRAVEL, als label op het routedeel.
   Raakt geen opgeslagen gegevens aan; alleen nieuwe laagschakelaars in state.dsLayers.
   ===================================================================== */
const V74_HOTEL={
 'Fleur de Lys':{r:'San José',ll:[9.93176,-84.07272],w:'Calle 13 tussen Avenida 2 en 6, centrum van San José.'},
 'Atlantida Lodge':{r:'Cahuita',ll:[9.74025,-82.84938],w:'Aan de weg naar Playa Negra, naast het sportveld, ca. 1 km van het centrum van Cahuita.'},
 'Lapa Verde Lodge':{r:'Tortuguero',ll:[10.56272,-83.51977],w:'Lapa Verde Caribbean Paradise Eco-Lodge: tussen Cerro Tortuguero en het hoofdkanaal, tegenover de Laguna Penitencia, ten noorden van het dorp.'},
 'Catarata Ecolodge':{r:'La Fortuna',ll:[10.45419,-84.66165],w:'In La Catarata, ca. 2,5 km van het centrum van La Fortuna, vlak bij de La Fortuna-waterval.'},
 'Faro Arenal':{r:'La Fortuna',ll:null,w:'Locatie nog niet met twee bronnen bevestigd.'},
 'Eco Arenal':{r:'La Fortuna',ll:[10.48366,-84.63294],w:'Ca. 2 km ten noorden van La Fortuna.'},
 'Cañon de la Vieja Lodge':{r:'Rincón de la Vieja',ll:[10.67796,-85.4563],w:'Bij Curubandé, aan de weg naar Rincón de la Vieja.'},
 'Rinconcito Lodge':{r:'Rincón de la Vieja',ll:[10.73286,-85.30103],w:'San Jorge, aan de oostkant van het park (sector Santa María).'},
 'Hotel Los Cipreses':{r:'Monteverde',ll:[10.32215,-84.82373],w:'Calle 6 in Santa Elena, op loopafstand van het centrum.'},
 'Claro de Luna':{r:'Monteverde',ll:[10.31636,-84.82715],w:'Santa Elena, aan de rand van het centrum.'},
 'Sueños del Bosque':{r:'San Gerardo de Dota',ll:[9.54836,-83.80909],w:'In de Savegre-vallei, aan de weg door San Gerardo.'},
 'Rio Tico Safari Lodge':{r:'Vergel de Punta Mala / Uvita',ll:[9.08149,-83.61971],w:'Punta Mala Arriba, ca. 4 km landinwaarts van Vergel de Punta Mala, aan de rivier.'},
 'Villas Rio Mar':{r:'Vergel de Punta Mala / Uvita',ll:[9.26346,-83.86028],w:'Dominical, aan de rivier.'},
 'Hotel Vista Ballena':{r:'Vergel de Punta Mala / Uvita',ll:null,w:'Op een heuvel boven Uvita; exacte locatie nog niet bevestigd.'},
 'Cabinas Las Palmeras':{r:'Corcovado',ll:[8.65726,-83.71165],w:'Ter plekke bekend als Poor Man\'s Paradise: aan Playa Rincón op het schiereiland Osa, alleen per boot bereikbaar.'},
 'Hotel Playa Bejuco':{r:'Esterillos',ll:[9.5195,-84.43499],w:'Aan Playa Bejuco, ten oosten van Esterillos.'},
 'Hotel Costa Pacifica':{r:'Esterillos',ll:[9.53148,-84.49824],w:'Esterillos Oeste, vlak bij het strand.'}
};
/* reistijd per routedeel: legs = indexen in V51_LEGS; label op het midden van die delen */
const V74_TIME=[
 {legs:[0],t:'4,5 u',d:2},{legs:[1],t:'4 u',d:4},{legs:[4],t:'4 u',d:6},{legs:[5],t:'4 u',d:8},{legs:[6],t:'3 u',d:10},
 {legs:[7],t:'6 u',d:13},{legs:[8],t:'3,5 u',d:14},{legs:[9],t:'1 u',d:16},{legs:[10],t:'1 u',d:19,boat:1},{legs:[12],t:'3 u',d:19},{legs:[13,14],t:'3–4 u',d:21}];
state.dsLayers.day.hotel??=true;state.dsLayers.day.time??=true;
state.dsLayers.full.hotel??=false;state.dsLayers.full.time??=true;

/* actieve hotels (volgen V53_HOTELS en later de definitieve lijst) */
function v74Hotels(){const seen=[];S.forEach(d=>d.hotel.forEach(h=>{if(!seen.includes(h))seen.push(h)}));
  return seen.map(h=>({h,days:S.filter(d=>d.hotel.includes(h)).map(d=>d.id),x:V74_HOTEL[h]||{}}))}
function v74TimePos(o,fr){const P=n=>v51XY(V51_PT[n][0],V51_PT[n][1]);
  const segs=o.legs.map(i=>{const[a,b]=V51_LEGS[i];return [P(a),P(b)]}),len=segs.map(([p,q])=>Math.hypot(q[0]-p[0],q[1]-p[1])),tot=len.reduce((a,b)=>a+b,0);
  let at=tot*fr;for(let i=0;i<segs.length;i++){if(at<=len[i]){const[p,q]=segs[i],f=len[i]?at/len[i]:0;return [p[0]+(q[0]-p[0])*f,p[1]+(q[1]-p[1])*f,tot]}at-=len[i]}
  return [...segs[0][0],tot]}
/* reistijdlabels plaatsen: midden van het routedeel, of iets verschoven als een stop, plaatsnaam of ander label in de weg zit */
function v74TimeLabels(zoom,s,hotelPts){const P=n=>v51XY(V51_PT[n][0],V51_PT[n][1]),hit=(a,b)=>a[0]<b[0]+b[2]&&b[0]<a[0]+a[2]&&a[1]<b[1]+b[3]&&b[1]<a[1]+a[3];
  const obs=[];V51_STOPS.slice(0,-1).forEach(([r],i)=>{const[x,y]=P(r),R=13*s;obs.push([x-R,y-R,2*R,2*R]);
    if(!zoom){const left=['Cahuita','Tortuguero','Esterillos','Corcovado'].includes(r),fs=18,w=V51_PT[r][2].length*fs*.53;obs.push([left?x-17-w:x+17,y+6-fs*.85,w,fs*1.1])}});
  hotelPts.forEach(([x,y,r])=>obs.push([x-r,y-r,2*r,2*r]));
  return V74_TIME.map((o,i)=>{const fs=(zoom?10.5:11)*s,w=o.t.length*fs*.56+fs*1.6,h=fs*1.55;let pick=null,tot=0;
    const[ax,ay]=v74TimePos(o,.45),[bx,by]=v74TimePos(o,.55),dl=Math.hypot(bx-ax,by-ay)||1,nx=-(by-ay)/dl,ny=(bx-ax)/dl,off=h*.5+Math.abs(nx)*w*.5+2*s;
    out:for(const d of [0,1,-1])for(const fr of [.5,.4,.6,.3,.7,.22,.78,.15,.85]){const[x0,y0,t]=v74TimePos(o,fr),x=x0+nx*off*d,y=y0+ny*off*d,r=[x-w/2,y-h/2,w,h];tot=t;if(!obs.some(q=>hit(r,q))){pick=[x,y];break out}}
    if(!pick){if(!zoom&&tot<60)return null;const[x,y]=v74TimePos(o,.5);pick=[x,y]}
    obs.push([pick[0]-w/2,pick[1]-h/2,w,h]);return {i,o,x:pick[0],y:pick[1],w,h,fs}}).filter(Boolean)}

/* laag: hotels + reistijden bovenop de bestaande lagen */
const v74PrevLayer=dseLayer;
dseLayer=function(fd,zoom,box,s,cur){const X=v74PrevLayer(fd,zoom,box,s,cur),L=state.dsLayers[dseMode()],f=v=>v.toFixed(1);
  const curDays=cur>=0?V51_STOPS[cur][1]:[];let svg='',top='';
  const hs=L.hotel?v74Hotels().filter(o=>o.x.ll).map(o=>{const[x,y]=v51XY(o.x.ll[0],o.x.ll[1]);return {...o,x,y,on:o.days.some(d=>curDays.includes(d))}}):[],hr=(zoom?8.5:6.5)*s;
  if(L.time)v74TimeLabels(zoom,s,hs.map(o=>[o.x,o.y,hr])).forEach(({i,o,x,y,w,h,fs})=>{
    svg+=`<g class="v74-time${o.boat?' boat':''}" data-dse-poi="time:${i}" role="button" aria-label="Reistijd ${esc(o.t)}"><rect x="${f(x-w/2)}" y="${f(y-h/2)}" width="${f(w)}" height="${f(h)}" rx="${f(h/2)}"/><text x="${f(x)}" y="${f(y+fs*.36)}" text-anchor="middle" style="font-size:${f(fs)}px">${esc(o.t)}</text></g>`;
    X.pins.push({x,y,r:w/2})});
  hs.forEach(({h,x,y,on})=>{const r=hr,k=r*1.15/12;
    top+=`<g class="dse-poi v74-hotel${on?' on':''}" data-dse-poi="hotel:${esc(h)}" role="button" aria-label="Hotel ${esc(h)}"><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/><g transform="translate(${f(x-12*k)} ${f(y-12*k)}) scale(${k.toFixed(3)})"><path class="bed" d="M3 19V7M3 14h18v5M21 14v-2.5A2.5 2.5 0 0 0 18.5 9H10v5M6.5 11.5a1.6 1.6 0 1 0 0-.01"/></g></g>`;
    X.pins.push({x,y,r:r+3*s,label:zoom&&on?h:'',cls:'hotel',must:on})});
  X.svg+=svg;X.top=(X.top||'')+top;return X};

/* hotelnaam van de huidige stop altijd tonen (labelplaatsing behandelt hem als verplicht) */
const v74PrevPlacer=dsdPlacer;
dsdPlacer=function(box,s){const pl=v74PrevPlacer(box,s),lab=pl.label;pl.label=(x,y,t,cls,must)=>lab(x,y,t,cls,must||cls==='hotel');return pl};

/* ingezoomde dagkaart: hotel van deze stop altijd in beeld */
const v74PrevBox=dsdBox;
dsdBox=function(fd){const b=v74PrevBox(fd);if(!state.dsLayers.day.hotel)return b;const M=V51_MAP,cur=v51Day2Stop(fd),days=V51_STOPS[cur][1];
  const pts=v74Hotels().filter(o=>o.x.ll&&o.days.some(d=>days.includes(d))).map(o=>v51XY(o.x.ll[0],o.x.ll[1]));if(!pts.length)return b;
  let[x0,y0,w,h]=b,x1=x0+w,y1=y0+h;const m=Math.max(w,h)*.12;
  pts.forEach(([x,y])=>{x0=Math.min(x0,x-m);y0=Math.min(y0,y-m);x1=Math.max(x1,x+m);y1=Math.max(y1,y+m)});
  if(x0===b[0]&&y0===b[1]&&x1===b[0]+b[2]&&y1===b[1]+b[3])return b;
  const AR=b[2]/b[3];w=x1-x0;h=y1-y0;if(w/h<AR)w=h*AR;else h=w/AR;w=Math.min(w,M.W);h=Math.min(h,M.H);
  const cx=(x0+x1)/2,cy=(y0+y1)/2;return [Math.max(0,Math.min(M.W-w,cx-w/2)),Math.max(0,Math.min(M.H-h,cy-h/2)),w,h]};

/* laagknoppen */
const v74PrevChips=dseChips;
dseChips=function(){const L=state.dsLayers[dseMode()],c=(k,t)=>`<button class="dse-chip ${k} ${L[k]?'on':''}" data-dse-layer="${k}" aria-pressed="${!!L[k]}"><i></i>${t}</button>`;
  const miss=L.hotel?v74Hotels().filter(o=>!o.x.ll).map(o=>o.h):[];
  return v74PrevChips().replace(/<\/div>$/,`${c('hotel','Hotels')}${c('time','Reistijd')}</div>`)+(miss.length?`<p class="v74-miss">Geen pin: ${miss.map(esc).join(', ')} (locatie nog niet bevestigd).</p>`:'')};

/* pin-venster */
const v74PrevPop=dsePop;
dsePop=function(id){if(!id.startsWith('hotel:')&&!id.startsWith('time:'))return v74PrevPop(id);
  const box=document.getElementById('dsePop');if(!box)return;const x=`<button class="dse-x" aria-label="Sluiten">${dsI('plus',18)}</button>`;let h='';
  if(id.startsWith('time:')){const o=V74_TIME[+id.slice(5)];if(!o)return;const d=S[o.d-1],tr=V51_TRAVEL[o.d];
    const from=V51_PT[V51_LEGS[o.legs[0]][0]][2],to=V51_PT[V51_LEGS[o.legs[o.legs.length-1]][1]][2];
    h=`<div class="dse-pop-h"><span class="dse-k v74t">Reistijd</span>${x}</div><b>${esc(from)} → ${esc(to)}</b><p>Dag ${o.d} · ${esc(tr?tr.t:o.t)}. Reistijd volgens Sawadee; pauzes en verkeer kunnen het langer maken.</p>
      <button class="dse-act" data-v74-day="${o.d}|overview"><span>Dag ${o.d} · ${esc(d.base)}</span>${dsI('chevR',16)}</button>`}
  else{const name=id.slice(6),info=V74_HOTEL[name]||{},days=S.filter(d=>d.hotel.includes(name)).map(d=>d.id),txt=(V48_HOTEL[name]||{}).d||'';if(!info.ll)return;
    const alts=Object.entries(V74_HOTEL).filter(([n,o])=>o.r===info.r&&n!==name).map(([n])=>n),ll=info.ll.join(',');
    h=`<div class="dse-pop-h"><span class="dse-k v74h">Hotel · ${V53_DEFINITIEF?'definitief':'voorlopig'}</span>${x}</div><b>${esc(name)}</b>
      <p class="v74-hn">${esc(dsNights(name))}</p>${txt?`<p>${esc(txt)}</p>`:''}<p class="v74-where">${dsI('pin',14)}<span>${esc(info.w)}</span></p>
      ${V53_DEFINITIEF?'':`<p class="v74-st">Eerste hotel van de Sawadee-lijst; definitief volgt vlak voor vertrek.${alts.length?' Andere opties: '+alts.map(esc).join(', ')+'.':''}</p>`}
      ${days.length?`<button class="dse-act" data-v74-day="${days[0]}|stay"><span>Dag ${days[0]} · hotelinformatie</span>${dsI('chevR',16)}</button>`:''}
      <div class="v74-links"><a class="dse-maps" href="https://www.google.com/maps/search/?api=1&query=${ll}" target="_blank" rel="noopener">${dsI('pin',14)}Google Maps</a><a class="dse-maps" href="https://waze.com/ul?ll=${ll}&navigate=yes" target="_blank" rel="noopener">${dsI('pin',14)}Waze</a></div>`}
  box.innerHTML=h;box.hidden=false;box.querySelector('.dse-x').onclick=()=>{box.hidden=true};
  box.querySelectorAll('[data-v74-day]').forEach(b=>b.onclick=()=>{const[d,sec]=b.dataset.v74Day.split('|');tab='days';currentDay=+d;daySection=sec;render();scrollTo({top:0,behavior:'instant'})})};
