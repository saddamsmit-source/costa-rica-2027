/* =====================================================================
   v6.2 · Fase D: Kaart, Checklist, Budget en Meer in de nieuwe stijl
   Alleen uiterlijk en indeling. Zelfde gegevens, opslag en functies;
   alle bestaande id's en data-attributen blijven, zodat de koppelingen werken.
   ===================================================================== */
const DSD_I={
  expand:'<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
  shrink:'<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>',
  mountain:'<path d="m3 20 6-10 4 6 3-4 5 8z"/>',
  ruler:'<path d="M4 17 17 4l3 3L7 20z"/><path d="m8 13 2 2M11 10l2 2M14 7l2 2"/>',
  thermo:'<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/><path d="M12 9v7"/>',
  rain:'<path d="M7 14h10a4 4 0 0 0 .4-7.98A5.5 5.5 0 0 0 6.4 8.2 3 3 0 0 0 7 14z"/><path d="m8 17-1 3M12 17l-1 3M16 17l-1 3"/>',
  cloud:'<path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z"/>',
  download:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  upload:'<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
  shield:'<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
  doc:'<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
  check:'<path d="m5 12 5 5 9-10"/>',
  bag:'<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  ticket:'<path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 0 0 4v2h18v-2a2 2 0 0 1 0-4 2 2 0 0 1 0-4V6H3z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  euro:'<path d="M17 6.5A7 7 0 1 0 17 17.5"/><path d="M4 10h9M4 14h9"/>',
  rec:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
  stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>',
  gpx:'<path d="M4 18c3-6 6 2 9-4s5-6 7-8"/><circle cx="4" cy="18" r="1.5"/><circle cx="20" cy="6" r="1.5"/>',
  target:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'
};
function dsdI(k,s){const p=DSD_I[k];if(!p)return dsI(k,s);return `<svg viewBox="0 0 24 24" width="${s||20}" height="${s||20}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`}
const DSD_DEST={'San José':'dest-sanjose','Cahuita':'dest-cahuita','Tortuguero':'dest-tortuguero','La Fortuna':'dest-fortuna','Rincón de la Vieja':'dest-rincon','Monteverde':'dest-monteverde','San Gerardo de Dota':'dest-sangerardo','Uvita':'dest-uvita','Corcovado':'dest-corcovado','Esterillos':'dest-esterillos'};
function dsdDays(days){return days.length>1?`Dag ${days[0]}–${days[days.length-1]}`:`Dag ${days[0]}`}
function dsdNum(v){return String(v).replace('.',',')}

/* ---------------- kaart (offline SVG, met inzoomen) ---------------- */
let dsMapWide=false;
function dsdBox(fd){
  const M=V51_MAP,P=n=>v51XY(V51_PT[n][0],V51_PT[n][1]),cur=v51Day2Stop(fd),last=V51_STOPS.length-1;
  const names=[V51_STOPS[cur][0]];V51_STOPS[cur][1].forEach(d=>(V51_EXC[d]||[]).forEach(n=>names.push(n)));
  const pts=names.map(P);if(typeof DSE_POI!=='undefined')DSE_POI.forEach(p=>{if(p.acts.some(a=>V51_STOPS[cur][1].includes(a[0])))pts.push(v51XY(p.ll[0],p.ll[1]))});const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  let x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const AR=1.2;let w=Math.max(x1-x0,100)*1.5,h=Math.max(y1-y0,72)*1.5;
  if(w/h<AR)w=h*AR;else h=w/AR;w=Math.min(w,M.W);h=Math.min(h,M.H);
  let cx=(x0+x1)/2,cy=(y0+y1)/2,x=Math.max(0,Math.min(M.W-w,cx-w/2)),y=Math.max(0,Math.min(M.H-h,cy-h/2));
  return [x,y,w,h]}
function dsdPlacer(box,s){const placed=[];
  const hit=(a,b)=>a[0]<b[0]+b[2]&&b[0]<a[0]+a[2]&&a[1]<b[1]+b[3]&&b[1]<a[1]+a[3];
  const inBox=r=>r[0]>=box[0]+2*s&&r[1]>=box[1]+2*s&&r[0]+r[2]<=box[0]+box[2]-2*s&&r[1]+r[3]<=box[1]+box[3]-2*s;
  placed.push([box[0]+box[2]-60*s,box[1],60*s,60*s]);
  return {pin(x,y,r){placed.push([x-r,y-r,2*r,2*r])},
    label(x,y,txt,cls,must){const fs=12*s,pad=6*s,tw=txt.length*fs*.6+pad*2,th=fs+pad*1.3,g=13*s;
      const cands=[[x+g,y-th/2],[x-g-tw,y-th/2],[x-tw/2,y-g-th],[x-tw/2,y+g],[x+g*.6,y-g-th],[x+g*.6,y+g*.6],[x-g*.6-tw,y-g-th],[x-g*.6-tw,y+g*.6]];
      let pick=null;for(const c of cands){const r=[c[0],c[1],tw,th];if(inBox(r)&&!placed.some(q=>hit(r,q))){pick=r;break}}
      if(!pick){if(!must)return '';pick=[cands[0][0],cands[0][1],tw,th];if(!inBox(pick))pick=[cands[1][0],cands[1][1],tw,th]}
      placed.push(pick);const f=v=>v.toFixed(1);
      return `<g class="dsm-lbl ${cls||''}"><rect x="${f(pick[0])}" y="${f(pick[1])}" width="${f(tw)}" height="${f(th)}" rx="${f(th/2)}"/><text x="${f(pick[0]+tw/2)}" y="${f(pick[1]+th/2+fs*.36)}" text-anchor="middle" style="font-size:${f(fs)}px">${esc(txt)}</text></g>`}}}
function dsMapSvg(fd,zoom){
  const M=V51_MAP,P=n=>v51XY(V51_PT[n][0],V51_PT[n][1]),cur=fd?v51Day2Stop(fd):-1;
  const box=zoom&&fd?dsdBox(fd):[0,0,M.W,M.H],s=zoom&&fd?box[2]/330:1.15,f=v=>v.toFixed(1);
  const legs=V51_LEGS.map(([a,b,m])=>{const[x1,y1]=P(a),[x2,y2]=P(b);return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="${m==='boot'?'dsm-boat':'dsm-road'}" vector-effect="non-scaling-stroke"/>`}).join('');
  const tracks=(state.gpsTracks||[]).map(t=>{const pts=(t.points||[]).map(p=>Array.isArray(p)?p:[p.lat,p.lon]).filter(p=>p[0]&&p[1]).map(p=>v51XY(p[0],p[1]).map(f).join(','));return pts.length>1?`<polyline points="${pts.join(' ')}" class="dsm-track" vector-effect="non-scaling-stroke"/>`:''}).join('');
  const last=V51_STOPS.length-1,on0=cur===last?0:cur,inb=(x,y)=>x>box[0]&&x<box[0]+box[2]&&y>box[1]&&y<box[1]+box[3];
  const curDays=cur>=0?V51_STOPS[cur][1]:[];
  const excs=Object.entries(V51_EXC).flatMap(([d,list])=>list.map(n=>({n,on:curDays.includes(+d)})));
  const X=typeof dseLayer==='function'?dseLayer(fd,zoom,box,s,cur):{svg:'',pins:[],hideExc:false};
  const exc=X.hideExc?'':excs.map(({n,on})=>{const[x,y]=P(n);return `<g class="dsm-exc ${on?'on':''}"><circle cx="${f(x)}" cy="${f(y)}" r="${f((on?7:5)*s)}"/></g>`}).join('');
  const stopList=V51_STOPS.slice(0,-1).map(([r,days],i)=>({r,days,i,on:i===on0,xy:P(r)}));
  const stops=stopList.map(({r,days,i,on,xy:[x,y]})=>{const R=(on?14:10.5)*s;
    return `<g class="dsm-stop v51-stop ${on?'on':''}" data-v51-day="${days[0]}" role="button" aria-label="${esc(V51_PT[r][2])}, ${dsdDays(days)}"><circle cx="${f(x)}" cy="${f(y)}" r="${f(R)}"/><text x="${f(x)}" y="${f(y+R*.36)}" style="font-size:${f((on?12.5:10.5)*s)}px">${i+1}</text></g>`}).join('');
  let labels='';
  if(zoom){const pl=dsdPlacer(box,s);stopList.forEach(({on,xy:[x,y]})=>pl.pin(x,y,(on?15:11.5)*s));if(!X.hideExc)excs.forEach(({n,on})=>{if(on){const[x,y]=P(n);pl.pin(x,y,8*s)}});X.pins.forEach(o=>pl.pin(o.x,o.y,o.r));
    const cs=stopList.find(o=>o.on);if(cs)labels+=pl.label(cs.xy[0],cs.xy[1],V51_PT[cs.r][2],'on',true);
    if(!X.hideExc)excs.filter(o=>o.on).forEach(({n})=>{const[x,y]=P(n);labels+=pl.label(x,y,V51_PT[n][2],'exc',true)});
    X.pins.filter(o=>o.label&&inb(o.x,o.y)).sort((a,b)=>(b.must?1:0)-(a.must?1:0)).forEach(o=>{labels+=pl.label(o.x,o.y,o.label,o.cls,false)});
    stopList.filter(o=>!o.on&&inb(...o.xy)).forEach(o=>{labels+=pl.label(o.xy[0],o.xy[1],V51_PT[o.r][2],'',false)})}
  else labels=stopList.map(({r,on,xy:[x,y]})=>{const left=['Cahuita','Tortuguero','Esterillos','Corcovado'].includes(r);
    return `<text class="dsm-name ${on?'on':''}" x="${f(x+(left?-17:17))}" y="${f(y+6)}" text-anchor="${left?'end':'start'}">${esc(V51_PT[r][2])}</text>`}).join('');
  const sjo=P('SJO'),a=7*s;
  const me=v51Pos?(()=>{const[x,y]=v51XY(v51Pos.lat,v51Pos.lon);return x>-20&&x<M.W+20&&y>-20&&y<M.H+20?`<g class="dsm-me v51-me"><circle cx="${f(x)}" cy="${f(y)}" r="${f(16*s)}" class="pulse"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(7*s)}"/></g>`:''})():'';
  const deco=zoom?'':`<text x="70" y="40" class="dsm-cty">NICARAGUA</text><text x="${M.W-90}" y="${M.H-24}" class="dsm-cty">PANAMA</text><text x="${M.W-120}" y="120" class="dsm-sea-lbl">Caribische Zee</text><text x="40" y="${M.H-60}" class="dsm-sea-lbl">Grote Oceaan</text>`;
  return `<svg class="v51-svg dsm ${zoom?'zoom':'full'}" viewBox="${box.map(f).join(' ')}" role="img" aria-label="${zoom?'Kaart rond '+esc(V51_PT[V51_STOPS[cur][0]][2]):'Routekaart Costa Rica'}" preserveAspectRatio="xMidYMid slice">
    <rect x="-50" y="-50" width="${M.W+100}" height="${M.H+100}" class="dsm-sea"/>
    <path d="${M.NIC}" class="dsm-nb" vector-effect="non-scaling-stroke"/><path d="${M.PAN}" class="dsm-nb" vector-effect="non-scaling-stroke"/><path d="${M.CRI}" class="dsm-land" vector-effect="non-scaling-stroke"/>
    ${deco}${tracks}${legs}<path class="dsm-air" vector-effect="non-scaling-stroke" d="M${f(sjo[0]-a)},${f(sjo[1])}h${f(2*a)}M${f(sjo[0])},${f(sjo[1]-a)}v${f(2*a)}"/>${exc}${X.svg}${stops}${labels}${X.top||''}${me}
  </svg>`}
/* GPS-updates en bestaande aanroepen tekenen voortaan deze kaart */
v51Svg=function(fd){return dsMapSvg(fd,tab==='days'&&!dsMapWide)};
function dsdGps(){const on=v51Watch!==null;
  return `<div class="ds-gps"><button id="v51gps" class="ds-chipbtn ${on?'live':''}">${dsdI('target',16)}${on?'Live positie aan':'Toon mijn positie'}</button><span id="v51gpsinfo" class="ds-num">${v51Pos?`${v51Pos.lat.toFixed(4)}, ${v51Pos.lon.toFixed(4)} · ±${Math.round(v51Pos.acc)} m`:''}</span></div>`}
function dsdLegend(){return `<div class="ds-maplegend"><span><i class="l-road"></i>Route</span><span><i class="l-boat"></i>Boot</span><span><i class="l-exc"></i>Excursie</span><span><i class="l-me"></i>Jij</span></div>`}
function dsdMapHint(extra){return `<p class="ds-maphint">${dsI('info',14)}<span>${extra||''}Schematisch: rechte lijnen, geen wegen. Je positie werkt zonder internet, alleen met de app open en het scherm aan.</span></p>`}
function dsdMapBox(fd,zoomable){return `<div class="ds-mapbox ${zoomable&&!dsMapWide?'zoom':'full'}">${dsMapSvg(fd,zoomable&&!dsMapWide)}${zoomable?`<button class="ds-mapexp" id="dsMapWide" aria-label="${dsMapWide?'Inzoomen op deze plek':'Hele route tonen'}">${dsdI(dsMapWide?'shrink':'expand',18)}</button>`:''}</div>`}

/* reisinformatie als iconenlijst (referentie) */
function dsdInfo(d){
  const si=v51Day2Stop(d.id),stop=V51_STOPS[si][0],pt=V51_PT[stop],prev=si>0&&V51_STOPS[si][1][0]===d.id?V51_STOPS[si-1][0]:null;
  const tr=V51_TRAVEL[d.id],km=prev?Math.round(v51Dist(V51_PT[prev],pt)):null,reg=v47Region(d),clim=V51_CLIM[reg]||V51_CLIM[stop],sun=v51Sun(pt[0],pt[1],d.date);
  const row=(ic,t,v,sm)=>`<div class="ds-irow"><i>${ic}</i><div><b>${t}</b><span>${v}</span>${sm?`<small>${sm}</small>`:''}</div></div>`;
  const rows=[row(dsI(tr?.m==='boat'?'boat':tr?.m==='plane'?'plane':'bus',20),'Reistijd',tr?esc(tr.t):'Geen transfer vandaag',tr?'Volgens de Sawadee-reisroute':'')];
  if(km)rows.push(row(dsdI('ruler',20),'Afstand',`± ${km} km hemelsbreed vanaf ${esc(V51_PT[prev][2])}`,'Over de weg is het verder'));
  rows.push(row(dsdI('mountain',20),'Hoogte',esc(V51_ELEV[reg]||V51_ELEV[stop]||'onbekend'),''));
  if(clim&&clim.hi!=null){
    rows.push(row(dsdI('thermo',20),'Temperatuur in februari',`${dsdNum(clim.lo)}–${dsdNum(clim.hi)} °C gemiddeld`,''));
    rows.push(row(dsdI('rain',20),'Regen in februari',`${dsdNum(clim.mm)} mm${clim.dd!=null?' · ca. '+dsdNum(clim.dd)+' regendagen':''}`,clim.src?esc(clim.src):''));
  }else if(clim)rows.push(row(dsdI('cloud',20),'Klimaat in februari',esc(clim.txt),clim.src?esc(clim.src):''));
  rows.push(row(dsI('sunrise',20),'Zon op / onder',`<span class="ds-num">${sun.rise} / ${sun.set}</span>`,'Berekend voor '+esc(pt[2])+', lokale tijd'));
  return `<div class="ds-card ds-info"><h3 class="ds-title" style="font-size:18px">Reisinformatie</h3>${rows.join('')}</div>`}

/* dag → kaart */
const dsdPrevDC=dayContent;
dayContent=function(d){
  if(daySection!=='map')return dsdPrevDC(d);
  const si=v51Day2Stop(d.id),pt=V51_PT[V51_STOPS[si][0]],q=encodeURIComponent(pt[2]+', Costa Rica');
  return `<div class="ds-card ds-mapcard">
    <div class="ds-maphead"><h3 class="ds-title" style="font-size:18px">Locatie & kaart</h3><a class="ds-chipbtn" href="https://www.google.com/maps/search/?api=1&query=${pt[0]},${pt[1]}" target="_blank" rel="noopener">${dsI('pin',15)}Open in Maps</a></div>
    ${dsdMapBox(d.id,true)}
    <div class="ds-maptools">${dsdGps()}${dsdLegend()}</div>${dsdMapHint()}</div>
  <div class="ds-card ds-navcard"><h3 class="ds-head">Navigeer naar ${esc(pt[2])}</h3><p class="ds-meta">Vraagt internet. Voor de lodge zelf: zoek op de hotelnaam.</p>
    <div class="ds-navbtns"><a class="ds-btn primary" href="https://www.google.com/maps/dir/?api=1&destination=${pt[0]},${pt[1]}" target="_blank" rel="noopener">${dsI('pin',16)}Google Maps</a><a class="ds-btn secondary" href="https://waze.com/ul?ll=${pt[0]},${pt[1]}&navigate=yes" target="_blank" rel="noopener">${dsI('compass',16)}Waze</a><a class="ds-btn secondary" href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">${dsI('search',16)}Zoek</a></div></div>
  ${dsdInfo(d)}`};

/* kaart-scherm */
renderMap=function(){const td=v48TripDay(),cur=td?v51Day2Stop(td):-1;
  const legs=V51_STOPS.slice(0,-1).map(([r,days],i)=>{const d0=S[days[0]-1],prev=i?V51_STOPS[i-1][0]:null,km=prev?Math.round(v51Dist(V51_PT[prev],V51_PT[r])):0,tr=V51_TRAVEL[days[0]],img=DSD_DEST[r];
    const sub=[tr?esc(tr.t):'',km?'± '+km+' km hemelsbreed':''].filter(Boolean).join(' · ');
    return `<button class="ds-leg ${i===cur?'now':''}" data-v51-day="${days[0]}"><span class="ds-leg-img">${img?`<img src="./photos/${img}.jpg" alt="" loading="lazy">`:''}<em>${i+1}</em></span><span class="ds-leg-body"><b>${esc(V51_PT[r][2])}${i===cur?'<i class="ds-pill ok">Nu</i>':''}</b><span>${dsdDays(days)} · ${fmt(d0.date)}</span>${sub?`<small>${sub}</small>`:''}</span>${dsI('chevR',18)}</button>`}).join('');
  const on=gpsWatch!==null;
  return `<div class="ds-page">
  <div class="ds-pagehead"><h1 class="ds-title">Route</h1><p class="ds-meta">23 dagen · 10 bestemmingen · 8 februari – 2 maart 2027</p></div>
  <div class="ds-card ds-mapcard">${dsdMapBox(td||0,false)}<div class="ds-maptools">${dsdGps()}${dsdLegend()}</div>${dsdMapHint('Tik een genummerde stop om die dag te openen. ')}</div>
  <h2 class="ds-section-title">Etappes</h2>
  <div class="ds-card ds-legs">${legs}</div>
  <h2 class="ds-section-title">GPS-route opnemen</h2>
  <div class="ds-card ds-gpsrec">
    <div class="ds-gpsstat ${on?'live':''}"><i>${dsdI('gpx',20)}</i><div><b id="gpsStatus">${on?`GPS actief · ${gpsPoints.length} meetpunten`:'GPS niet actief'}</b><span>${state.gpsTracks.length} opgeslagen ${state.gpsTracks.length===1?'route':'routes'} · zichtbaar als groene lijn</span></div></div>
    <div class="ds-gpsbtns"><button class="ds-btn primary" id="gpsStart">${dsdI('rec',16)}Start</button><button class="ds-btn secondary" id="gpsStop">${dsdI('stop',16)}Stop en bewaar</button><button class="ds-btn secondary" id="gpsExport">${dsdI('download',16)}GPX</button></div>
    <details class="ds-more"><summary>${dsI('info',15)}Hoe betrouwbaar is dit?</summary><p>Opnemen werkt alleen terwijl de app open is. Bij schermvergrendeling, wisselen van app of energiebesparing kan de opname stoppen; dit is geen achtergrondtracker. Routes blijven lokaal in je browser en in je JSON-back-up. Voor een volledige rit met vergrendeld scherm gebruik je beter een aparte GPS-tracker.</p></details>
  </div></div>`};

/* ---------------- checklist ---------------- */
const DSD_BK={online:['warn','ticket','Vooraf online tickets kopen','Parktickets via SINAC, alleen online en met creditcard.'],zelf:['own','user','Zelf regelen','Niet in het programma; reserveren of ter plaatse regelen.'],reisbegeleider:['opt','compass','Ter plaatse via de reisbegeleider','Aanmelden en betalen tijdens de reis.'],lodge:['opt','bed','Ter plaatse bij de lodge',''],geboekt:['ok','check','Al geboekt','']};
function dsdChecklist(){
  const rows=v48Costs().filter(r=>r.bk!=='programma');
  const secs=Object.keys(DSD_BK).map(k=>{const r=rows.filter(x=>x.bk===k);if(!r.length)return '';const [cls,ic,t,sub]=DSD_BK[k];
    return `<div class="ds-card ds-cl">
      <div class="ds-cl-h"><i class="${cls}">${dsdI(ic,18)}</i><div><b>${t}</b>${sub?`<small>${sub}</small>`:''}</div><em class="ds-num">${r.length}</em></div>
      ${r.map(({d,a,i,x})=>`<button class="v48-row ds-clrow" data-activity="${i}" data-day="${d.id}"><span><b>${esc(a.title)}</b><small>Dag ${d.id} · ${fmt(d.date)}${x.price?' · '+esc(x.price):''}</small></span>${dsI('chevR',16)}</button>`).join('')}
    </div>`}).join('');
  return `<div class="ds-note">${dsI('info',16)}<span>Maaltijden in Tortuguero (dag 4–6) en Corcovado (dag 16–19) betaal je ter plaatse als vast bedrag per dag. De Corcovado-excursie betaal je aan de lodge.</span></div>${secs}`}
function dsdPack(){
  const total=V48_PACK.reduce((s,[,i])=>s+i.length,0),done=Object.values(state.v48Pack).filter(Boolean).length;
  const groups=V48_PACK.map(([g,items],gi)=>{const n=items.filter((_,ii)=>state.v48Pack[gi+'-'+ii]).length;
    return `<details class="v49-acc ds-acc" ${state.v49Open?.[gi]?'open':''} data-v49-acc="${gi}"><summary><span>${esc(g)}</span><em class="${n===items.length?'full':''}">${n}/${items.length}</em>${dsI('chevD',18)}</summary>
    <div class="ds-acc-body">${items.map((it,ii)=>{const id=gi+'-'+ii,on=!!state.v48Pack[id];return `<label class="v48-pack ds-check ${on?'on':''}"><input type="checkbox" data-v48-pack="${id}" ${on?'checked':''}><i>${dsdI('check',14)}</i><span>${esc(it)}</span></label>`}).join('')}</div></details>`}).join('');
  return `<div class="ds-card ds-progress"><div><b class="ds-num">${done} van ${total}</b><span>ingepakt</span></div><div class="ds-bar"><i style="width:${Math.round(100*done/total)}%"></i></div></div><div class="ds-card ds-accs">${groups}</div>`}
const DSD_BOOKOPT=[['open','Nog niet geboekt / controleren'],['aangevraagd','Aangevraagd'],['geboekt','Geboekt / bevestigd'],['terplekke','Ter plaatse regelen'],['nvt','Geen boeking nodig']];
const DSD_ST={locked:'ok',optional:'opt',conditional:'warn',planned:'neutral',excluded:'neutral'};
function dsdBookings(){
  const done=bookingActs.filter(a=>state.bookings[a.id]==='geboekt').length;
  return `<div class="ds-card ds-progress"><div><b class="ds-num">${done} van ${bookingActs.length}</b><span>geboekt</span></div><div class="ds-bar"><i style="width:${Math.round(100*done/bookingActs.length)}%"></i></div>
    <p class="ds-meta" style="margin:10px 0 0">Vastgezet betekent dat we de activiteit willen doen. Kies pas Geboekt nadat de aanbieder de reservering heeft bevestigd.</p></div>
  <label class="ds-select"><span class="ds-label">Toon</span><select id="bookfilter"><option value="all">Alle bronnen</option><option value="sawadee">Alleen Sawadee</option><option value="extra">Alleen eigen toevoegingen</option></select></label>
  <div id="bookingList" class="ds-card ds-books">${bookingActs.map(a=>{const v=state.bookings[a.id]||'open';
    return `<article class="booking ds-book" data-source="${a.source}"><div class="ds-book-top"><b>${esc(a.title)}</b><span class="ds-pill ${a.source==='sawadee'?'saw':'own'}">${esc(sourceName[a.source])}</span></div>
    <small>Dag ${a.day} · ${fmt(a.date)} · ${esc(a.place)} · <span class="ds-st ${DSD_ST[a.status]||'neutral'}">${esc(statusName[a.status]||'')}</span></small>${a.note?`<p class="ds-meta">${esc(a.note)}</p>`:''}
    <label class="ds-bookstate ${v}"><span class="sr">Werkelijke boekingsstatus</span><select data-book="${a.id}">${DSD_BOOKOPT.map(([k,t])=>`<option value="${k}" ${v===k?'selected':''}>${t}</option>`).join('')}</select>${dsI('chevD',16)}</label></article>`}).join('')}</div>`}
renderBookings=function(){
  const todo=v48Costs().filter(r=>['online','zelf'].includes(r.bk)).length,total=V48_PACK.reduce((s,[,i])=>s+i.length,0),done=Object.values(state.v48Pack).filter(Boolean).length,booked=bookingActs.filter(a=>state.bookings[a.id]==='geboekt').length;
  const segs=[['regelen','Te regelen',todo],['paklijst','Paklijst',`${done}/${total}`],['boekingen','Boekingen',`${booked}/${bookingActs.length}`]];
  const body=v49Seg==='paklijst'?dsdPack():v49Seg==='boekingen'?dsdBookings():dsdChecklist();
  return `<div class="ds-page"><div class="ds-pagehead"><h1 class="ds-title">Checklist</h1><p class="ds-meta">Wat nog geregeld moet worden, de paklijst en je boekingen</p></div>
  <div class="v49-segbar ds-seg" role="tablist">${segs.map(([k,t,c])=>`<button role="tab" aria-selected="${v49Seg===k}" data-v49-seg="${k}" class="${v49Seg===k?'on':''}">${t}<small class="ds-num">${c}</small></button>`).join('')}</div>${body}</div>`};

/* ---------------- budget ---------------- */
renderBudget=function(){
  const total=Object.values(state.costs).reduce((s,v)=>s+(Number(v)||0),0),filled=bookingActs.filter(a=>state.costs[a.id]!==undefined&&state.costs[a.id]!=='').length,pct=Math.min(100,Math.round(100*total/1800));
  const groups=V51_STOPS.map(([r,days],i)=>{const acts=bookingActs.filter(a=>v51Day2Stop(a.day)===i);if(!acts.length)return '';const sub=acts.reduce((s,a)=>s+(Number(state.costs[a.id])||0),0);
    return `<div class="ds-card ds-budget"><div class="ds-budget-h"><b>${esc(V51_PT[r][2])}</b><span class="ds-meta">${dsdDays(days)}</span><em class="ds-num">${sub?'€ '+sub.toLocaleString('nl-NL'):'–'}</em></div>
    ${acts.map(a=>{const p=V48_ACT[a.title]?.price;return `<div class="ds-brow"><div><b>${esc(a.title)}</b><small>${esc(sourceName[a.source])} · ${fmt(a.date)}${p?' · '+esc(p):''}</small></div><label class="ds-eur"><span>€</span><input class="field costinput" type="number" inputmode="decimal" min="0" step="0.01" data-cost="${a.id}" value="${esc(state.costs[a.id]??'')}" placeholder="–" aria-label="Totaal in euro voor ${esc(a.title)}"></label></div>`}).join('')}</div>`}).join('');
  return `<div class="ds-page"><div class="ds-pagehead"><h1 class="ds-title">Budget</h1><p class="ds-meta">Totaalbedragen in euro voor twee personen</p></div>
  <div class="ds-card ds-bsum"><div class="ds-bsum-top"><div><span class="ds-label">Ingevuld</span><b class="ds-num">€ ${total.toLocaleString('nl-NL')}</b></div><div><span class="ds-label">Reserve</span><b class="ds-num">€ 1.800</b><small>€ 900 p.p.</small></div></div>
    <div class="ds-bar ${total>1800?'over':''}"><i style="width:${pct}%"></i></div><p class="ds-meta" style="margin:8px 0 0"><span class="ds-num">${filled} van ${bookingActs.length}</span> onderdelen ingevuld. Leeg is onbekend, niet € 0. Geen automatische omrekening van dollars.</p></div>
  ${groups}
  <p class="ds-meta" style="margin:4px 4px 0">Tatoeage, eventuele transfers, fooien en lokale bijkomende kosten apart controleren. Prijsindicaties komen uit de reisinformatie per activiteit.</p></div>`};

/* ---------------- meer: menu met subpagina's ---------------- */
let dsMore='';
function dsdBackupState(){const a=v51BackupAge();return {a,warn:a===null||a>14,txt:a===null?'Nog geen back-up gedownload':a===0?'Back-up gedownload: vandaag':`Laatste back-up: ${a} ${a===1?'dag':'dagen'} geleden`}}
function dsdMenuRow(ic,t,sub,attr){return `<button class="ds-menurow" ${attr}><i>${ic}</i><span><b>${t}</b><small>${sub}</small></span>${dsI('chevR',18)}</button>`}
function dsdSub(title,body){return `<div class="ds-page ds-subpage"><button class="ds-back" data-ds-more="">${dsI('chevL',18)}Meer</button><div class="ds-pagehead"><h1 class="ds-title">${title}</h1></div>${body}</div>`}
const DSD_MORE={
  fx:()=>dsdSub('Valuta omrekenen',`<div class="ds-fx">${v51Fx()}</div>`),
  prac:()=>dsdSub('Praktische informatie',`<div class="ds-card ds-prac">${V48_PRACTICAL.map(([t,v,s])=>`<div class="ds-pracrow"><b>${esc(t)}</b><span>${esc(v)}</span>${s?`<small>${esc(s)}</small>`:''}</div>`).join('')}</div><p class="ds-meta" style="margin:10px 4px 0">Gecontroleerd in oktober 2026. Check het reisadvies kort voor vertrek opnieuw.</p>`),
  backup:()=>dsdSub('Back-up en herstel',`<div class="ds-bk">${v52BackupCard()}</div>
    <div class="ds-card ds-bkact"><p class="ds-meta" style="margin:0 0 12px">Notities, afvinklijsten, waarnemingen, boekingsstatus en kosten staan alleen in deze browser en worden niet gesynchroniseerd. Download daarom regelmatig een back-up.</p>
    <div class="ds-bkbtns"><button class="ds-btn primary" id="export">${dsdI('download',18)}Downloaden</button><label class="ds-btn secondary" for="import">${dsdI('upload',18)}Importeren</label><input id="import" type="file" accept="application/json,.json" class="hidden"></div>
    <p class="ds-meta" style="margin:12px 0 0">Bij een nieuwe appversie kun je de back-up opnieuw importeren. Route en activiteiten zitten in de app zelf.</p></div>`),
  legend:()=>dsdSub('Uitleg labels',`<div class="ds-card ds-legendcard">
    <div><span class="ds-pill saw">Sawadee</span><p>Activiteit of transfer uit het officiële groepsreisprogramma, of een optionele excursie die Sawadee noemt. Dit betekent niet automatisch inbegrepen of gereserveerd.</p></div>
    <div><span class="ds-pill own">Zelf toegevoegd</span><p>Onze aanvullingen, zoals extra vogelgidsen, whale watching en snorkelen.</p></div>
    <div><span class="ds-pill ok">${dsI('lock',12)}Vastgezet</span><p>Planningsbesluit; niet hetzelfde als een reservering.</p></div>
    <div><span class="ds-pill opt">Als tijd over</span><p>Bewust flexibel, geen verplicht onderdeel.</p></div>
    <div><span class="ds-pill warn">Voorwaardelijk</span><p>Alleen als groepsschema, weer of omstandigheden dit toelaten.</p></div>
    <p class="ds-meta">Tijden die alleen ter plekke beoordeeld kunnen worden blijven bewust open. De vastgezette route wordt niet automatisch gewijzigd.</p></div>`),
  credits:()=>dsdSub('Fotoverantwoording',`<div class="ds-card ds-credits"><p class="ds-meta" style="margin:0 0 10px">Foto's van Wikimedia Commons, gebruikt onder de vermelde vrije licentie. Sfeerbeelden tonen een vergelijkbare plek.</p><ul>${Object.entries(V48_PHOTO).map(([k,p])=>`<li><a href="${esc(p.page)}" target="_blank" rel="noopener">${esc(p.title.replace(/^File:/,''))}</a><small>${esc(p.credit)} · ${esc(p.license)}</small></li>`).join('')}</ul></div>`)
};
renderSettings=function(){
  if(DSD_MORE[dsMore])return DSD_MORE[dsMore]();
  const b=dsdBackupState(),r=state.v51Rates;
  return `<div class="ds-page"><div class="ds-pagehead"><h1 class="ds-title">Meer</h1><p class="ds-meta">Hulpmiddelen, gegevens en uitleg</p></div>
  <button class="ds-bkstat ${b.warn?'warn':''}" data-ds-more="backup"><i>${b.warn?dsI('alert',20):dsdI('shield',20)}</i><span><b>${b.txt}</b><small>${b.warn?'Je gegevens staan alleen op deze telefoon. Maak nu een back-up.':'Tik om een nieuwe te maken of te controleren.'}</small></span>${dsI('chevR',18)}</button>
  <div class="ds-label ds-menulbl">Reis</div><div class="ds-card ds-menu">
    ${dsdMenuRow(dsI('bed',20),'Accommodaties','Hotel per bestemming','data-goto="hotels"')}
    ${dsdMenuRow(dsI('paw',20),'Wildlife','Zoeken over de hele reis en logboek','data-goto="wildlife"')}
    ${dsdMenuRow(dsdI('euro',20),'Budget','Kosten per activiteit tegenover de reserve','data-goto="budget"')}</div>
  <div class="ds-label ds-menulbl">Onderweg</div><div class="ds-card ds-menu">
    ${dsdMenuRow(dsI('coin',20),'Valuta omrekenen',`EUR, USD en colón · koers ${esc(r.date)}`,'data-ds-more="fx"')}
    ${dsdMenuRow(dsdI('doc',20),'Praktische informatie','Paspoort, noodnummers, geld, stroom en meer','data-ds-more="prac"')}</div>
  <div class="ds-label ds-menulbl">Gegevens en uitleg</div><div class="ds-card ds-menu">
    ${dsdMenuRow(dsdI('download',20),'Back-up en herstel','Downloaden, controleren en importeren','data-ds-more="backup"')}
    ${dsdMenuRow(dsdI('tag',20),'Uitleg labels','Sawadee, zelf toegevoegd, vastgezet','data-ds-more="legend"')}
    ${dsdMenuRow(dsdI('camera',20),"Fotoverantwoording",`${Object.keys(V48_PHOTO).length} foto's met bron en licentie`,'data-ds-more="credits"')}
    <a class="ds-menurow" href="${DATA.meta.sourceUrl}" target="_blank" rel="noopener"><i>${dsdI('ext',20)}</i><span><b>Officiële Sawadee-reisroute</b><small>Uitgebreide route op sawadee.nl</small></span>${dsI('chevR',18)}</a></div>
  </div>`};
/* navigatie naar Meer: altijd het menu, behalve de back-upmelding op Home */
document.addEventListener('click',e=>{const el=e.target.closest('[data-goto="settings"],[data-mobile="settings"],[data-tab="settings"]');if(el)dsMore=el.classList.contains('ds-home-note')?'backup':''},true);

/* ---------------- koppelingen ---------------- */
function dsdBindWide(){const w=document.getElementById('dsMapWide');if(w)w.onclick=()=>{dsMapWide=!dsMapWide;const box=w.closest('.ds-mapbox'),tmp=document.createElement('div');tmp.innerHTML=dsdMapBox(currentDay,true);box.replaceWith(tmp.firstElementChild);v51BindStops();dsdBindWide()}}
const dsdPrevBind=bindExtras;
bindExtras=function(){dsdPrevBind();
  dsdBindWide();
  document.querySelectorAll('[data-ds-more]').forEach(b=>b.onclick=()=>{dsMore=b.dataset.dsMore;render();window.scrollTo({top:0,behavior:'instant'})});
  document.querySelectorAll('.ds-bookstate select').forEach(s=>s.addEventListener('change',()=>{s.parentElement.className='ds-bookstate '+s.value}));
  document.querySelectorAll('.ds-check input').forEach(c=>c.addEventListener('change',()=>c.closest('.ds-check').classList.toggle('on',c.checked)));
  document.querySelectorAll('.ds-acc[data-v49-acc] input').forEach(c=>c.addEventListener('change',()=>{const done=Object.values(state.v48Pack).filter(Boolean).length,total=V48_PACK.reduce((s,[,i])=>s+i.length,0);const p=document.querySelector('.ds-progress b'),bar=document.querySelector('.ds-progress .ds-bar i'),seg=document.querySelector('[data-v49-seg="paklijst"] small');if(p)p.textContent=done+' van '+total;if(bar)bar.style.width=Math.round(100*done/total)+'%';if(seg)seg.textContent=done+'/'+total}));
};
render();
