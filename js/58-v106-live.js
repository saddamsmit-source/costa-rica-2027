/* =====================================================================
   v10.6 · Live volgen
   Eén schakelaar: toont je positie op de kaart én neemt je route op, terwijl de app open is.
   - Opslag: state.gpsTracks (bestaand): [{id, day:'JJJJ-MM-DD', points:[[lat,lon,tijd(s),nauwkeurigheid]…], live:1}].
     Compact (±35 B per punt) en gefilterd (nauwkeurigheid ≤ 50 m, ≥ 15 m verder of ≥ 60 s later), max 4.000 punten per stuk,
     zodat 23 dagen ruim binnen de opslag van de telefoon blijven. Oudere routes ({lat,lon,time}) blijven leesbaar.
   - Scherm aan: Screen Wake Lock waar de browser dat kent (Android Chrome). Een webapp kan GPS niet op de achtergrond volgen;
     staat het scherm uit of wisselt de app, dan stopt de opname en begint daarna een nieuw stuk (geen rechte lijn over het gat).
   - iPhone: melding dat live volgen daar niet betrouwbaar werkt (scherm op slot = opname stopt).
   - Sloot de app terwijl live volgen aan stond, dan vraagt de app bij de volgende start of je wilt hervatten.
   ===================================================================== */
const V106={on:false,watch:null,lock:null,cur:null,last:null,lastSave:0,unsaved:0,hiddenAt:0,max:4000,minM:15,minS:60,maxAcc:50,gapS:120};
state.gpsTracks??=[];
const v106Ios=(ua=navigator.userAgent,pf=navigator.platform,tp=navigator.maxTouchPoints)=>/iP(hone|ad|od)/.test(ua)||(pf==='MacIntel'&&tp>1);
const v106Day=(ms=Date.now())=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Costa_Rica'}).format(new Date(ms));
const v106Pt=p=>Array.isArray(p)?{lat:p[0],lon:p[1],t:p[2]||0,acc:p[3]||0}:{lat:p.lat,lon:p.lon,t:p.time?Math.round(Date.parse(p.time)/1000):0,acc:p.accuracy||0};
const v106Uid=()=>'trk'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);

/* ---------- statistiek van een dag (afstand, duur) ---------- */
function v106Stats(day=v106Day()){let km=0,t0=0,t1=0,n=0;
  (state.gpsTracks||[]).filter(t=>t.day===day).forEach(t=>{let prev=null;(t.points||[]).map(v106Pt).forEach(p=>{if(!isFinite(p.lat)||!isFinite(p.lon))return;n++;if(p.t){t0=t0?Math.min(t0,p.t):p.t;t1=Math.max(t1,p.t)}
    if(prev)km+=v51Dist([prev.lat,prev.lon],[p.lat,p.lon]);prev=p})});
  return {km,sec:t0&&t1?t1-t0:0,n}}
function v106Text(){const s=v106Stats(),h=Math.floor(s.sec/3600),m=Math.round(s.sec%3600/60),d=s.km<10?s.km.toFixed(1).replace('.',','):String(Math.round(s.km));
  return `${d} km${s.sec>=60?` · ${h?h+' u ':''}${m} min`:''}`}

/* ---------- opname ---------- */
function v106Persist(force){const now=Date.now();if(!force&&V106.unsaved<10&&now-V106.lastSave<30000)return true;
  try{localStorage.setItem(storeKey,JSON.stringify(state));V106.lastSave=now;V106.unsaved=0;return true}catch(e){v106Stop(true);v10Fail(e,'gps');return false}}
function v106Segment(){const t={id:v106Uid(),day:v106Day(),points:[],live:1};state.gpsTracks.push(t);V106.cur=t;V106.last=null;return t}
function v106Record(c){const acc=c.accuracy||0,tms=c.timestamp||Date.now();if(acc>V106.maxAcc)return false;
  const lat=+c.latitude.toFixed(5),lon=+c.longitude.toFixed(5),ts=Math.round(tms/1000);
  if(!V106.cur||V106.cur.day!==v106Day(tms))v106Segment();
  const L=V106.last;if(L){const dt=ts-L[2],dm=v51Dist([L[0],L[1]],[lat,lon])*1000;if(dt<2)return false;if(dm<V106.minM&&dt<V106.minS)return false;if(dt>0&&dm/dt>55&&acc>20)return false}
  if(V106.cur.points.length>=V106.max){v10Toast('De route van vandaag is vol (4.000 punten). Maak een GPX-export of start later opnieuw.',{kind:'warn',ms:7000});v106Stop(true);return false}
  const p=[lat,lon,ts,Math.round(acc)];V106.cur.points.push(p);V106.last=p;V106.unsaved++;return true}
/* alleen "geen toestemming" stopt de opname; een kort signaalverlies (tunnel, bos) niet */
function v106OnErr(e){if(e&&e.code===1){v106Stop(true);v10Fail(e,'gps');return}
  const i=document.getElementById('v51gpsinfo');if(i)i.textContent='Even geen GPS-signaal…'}
function v106OnPos(p){const c=p.coords;v51Pos={lat:c.latitude,lon:c.longitude,acc:c.accuracy};
  const added=v106Record({latitude:c.latitude,longitude:c.longitude,accuracy:c.accuracy,timestamp:p.timestamp});if(added&&!v106Persist())return;
  if(document.querySelector('.ds-mapbox'))dseRedrawMap();
  const i=document.getElementById('v51gpsinfo');if(i)i.textContent=dseGpsText();v106Paint()}

/* ---------- scherm aan houden ---------- */
async function v106Lock(){if(!V106.on||!('wakeLock' in navigator)||V106.lock)return;try{V106.lock=await navigator.wakeLock.request('screen');V106.lock.addEventListener('release',()=>{V106.lock=null})}catch(e){V106.lock=null}}
function v106Unlock(){try{V106.lock&&V106.lock.release()}catch(e){}V106.lock=null}

/* ---------- aan / uit ---------- */
function v106Start(){if(V106.on)return;
  if(!navigator.geolocation){v10Toast('GPS is op dit apparaat niet beschikbaar.',{kind:'warn'});return}
  V106.on=true;state.v106Live={on:true,since:new Date().toISOString()};v106Segment();v106Persist(true);
  V106.watch=navigator.geolocation.watchPosition(v106OnPos,v106OnErr,{enableHighAccuracy:true,maximumAge:5000,timeout:30000});
  v106Lock();
  v10Toast(v106Ios()?'Live volgen aan. Op iPhone stopt de opname zodra het scherm op slot gaat.':('wakeLock' in navigator?'Live volgen aan. Het scherm blijft aan zolang de app open is.':'Live volgen aan. Houd het scherm aan en de app open.'),{ms:5000});
  v106Paint();if(document.querySelector('.ds-mapbox'))dseRedrawMap()}
function v106Stop(silent){if(V106.watch!==null){navigator.geolocation.clearWatch(V106.watch);V106.watch=null}
  v106Unlock();const was=V106.on;V106.on=false;state.v106Live={on:false};
  if(V106.cur&&!V106.cur.points.length)state.gpsTracks=state.gpsTracks.filter(t=>t!==V106.cur);
  V106.cur=null;V106.last=null;try{localStorage.setItem(storeKey,JSON.stringify(state))}catch(e){}
  v106Paint();if(was&&!silent)v10Toast(`Route bewaard · ${v106Text()}`);if(document.querySelector('.ds-mapbox'))dseRedrawMap()}
function v106Toggle(){V106.on?v106Stop():v106Start()}

/* ---------- scherm uit of app gewisseld: nieuw stuk, geen rechte lijn over het gat ---------- */
function v106Resume(){if(!V106.on)return;v106Lock();const gap=V106.last?Date.now()/1000-V106.last[2]:0;
  if(gap>V106.gapS){v106Segment();v10Toast('De opname was onderbroken omdat het scherm uit stond of de app gewisseld werd. Houd het scherm aan voor een doorlopende route.',{kind:'warn',ms:7000})}}
document.addEventListener('visibilitychange',()=>{if(document.hidden){V106.hiddenAt=Date.now();if(V106.on)v106Persist(true)}else v106Resume()});
addEventListener('pagehide',()=>{if(V106.on)v106Persist(true)});

/* ---------- knoppen en meldingen bijwerken ---------- */
function v106Paint(){document.querySelectorAll('#v51gps,[data-v106-toggle]').forEach(b=>{b.classList.toggle('live',V106.on);b.setAttribute('aria-pressed',String(V106.on));const l=b.querySelector('.v106-lbl');if(l)l.textContent=V106.on?'Live volgen aan':'Live volgen'});
  document.querySelectorAll('[data-v106-stat]').forEach(e=>e.textContent=V106.on?'Live volgen aan · '+v106Text():(v106Stats().n?'Vandaag · '+v106Text():'Live volgen staat uit'))}
const v106Note=()=>v106Ios()?'Op iPhone werkt live volgen niet betrouwbaar: de opname stopt zodra het scherm op slot gaat. Op Android werkt het met de app open en het scherm aan.':'Werkt terwijl de app open is en het scherm aan staat; een webapp kan GPS niet op de achtergrond volgen. Zet je scherm uit, dan stopt de opname en begint daarna een nieuw stuk.';

/* ---------- na een sluiting terwijl live volgen aan stond ---------- */
setTimeout(()=>{if(state.v106Live&&state.v106Live.on&&!V106.on){state.v106Live={on:false};
  v10Toast('Live volgen stond aan toen de app sloot.',{action:'Hervatten',onAction:()=>v106Start(),ms:10000})}},1200);
