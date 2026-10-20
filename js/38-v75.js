/* =====================================================================
   v7.5 · Laatste verbeteringen vóór vertrek
   1. Veilige import: samenvoegen in plaats van vervangen, automatische
      veiligheidskopie, terugzetten mogelijk; oude back-ups breken niets meer.
   2. Persistente opslag: browser vragen de gegevens niet zelf op te ruimen.
   3. Updatemelding zodra een nieuwe versie klaarstaat.
   4. Compacte wildlifetab per dag: kansrijkste soorten eerst, rest achter een knop.
   5. Snellere Wildlife-pagina (naamnormalisatie en datumopmaak gecachet).
   6. Soortenteller op Home gelijk aan de Wildlife-pagina.
   7. Dag 14: ochtendsoorten van de quetzaltour tellen bij San Gerardo.
   Opslagstructuur (CR27_V2) en soortsleutels blijven ongewijzigd.
   ===================================================================== */

/* ---------- 5. snelheid ---------- */
{const prev=v43name,cache=new Map();
  v43name=function(n){let r=cache.get(n);if(r===undefined){r=prev(n);cache.set(n,r)}return r}}
const V75_FMT={key:new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Costa_Rica'}),day:new Intl.DateTimeFormat('nl-NL',{weekday:'long',day:'numeric',month:'long'}),time:new Intl.DateTimeFormat('nl-NL',{hour:'2-digit',minute:'2-digit'})};
wl2Log=function(){const e=wl2Entries();if(!e.length)return '<div class="ds-card"><p class="ds-meta">Nog geen waarnemingen. Tik bij een soort op Gezien; tijd, plek en aantal komen dan hier.</p></div>';
  const by={};e.forEach(x=>{const k=x.r.t?V75_FMT.key.format(new Date(x.r.t)):'zonder datum';(by[k]??=[]).push(x)});
  return Object.entries(by).map(([day,list])=>`<div class="ds-card wl2-logday"><div class="wl2-logh"><b>${day==='zonder datum'?'Zonder datum':V75_FMT.day.format(new Date(day+'T12:00:00'))}</b><em class="ds-num">${list.length}</em></div>
    ${list.map(x=>{const t=wl2Thumb(x.name);return `<button class="wl2-logrow" data-wl2="${encodeURIComponent(x.name)}" data-wl2-region="${encodeURIComponent(x.pl)}"><span class="wl2-logimg">${t?`<img src="${t}" alt="" loading="lazy">`:''}</span><span><b>${esc(v47Info(x.name).nl)}${(x.r.n||1)>1?` <em class="ds-num">× ${x.r.n}</em>`:''}</b><small>${esc(x.pl)}${x.r.t?' · '+V75_FMT.time.format(new Date(x.r.t)):''}${x.r.photo?' · op foto':''}${x.r.loc?' · plek':''}</small>${x.note?`<span class="wl2-lognote">${esc(x.note)}</span>`:''}</span>${dsI('chevR',16)}</button>`}).join('')}</div>`).join('')};

/* ---------- 1. veilige import ---------- */
const V75_COPY='CR27_V2_voor_import';
const v75Obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
/* back-up wint bij verschillen; wat alleen op deze telefoon staat blijft bewaard */
function v75Merge(cur,bak){if(!v75Obj(cur)||!v75Obj(bak))return bak===undefined?cur:bak;const out={...cur};
  for(const k of Object.keys(bak))out[k]=v75Obj(cur[k])&&v75Obj(bak[k])?v75Merge(cur[k],bak[k]):bak[k];return out}
function v75MergeState(cur,bak){const m=v75Merge(cur,bak);
  /* een waarneming gaat nooit terug van gezien/op foto naar niet gezien; tijd en plek blijven */
  for(const [id,o] of Object.entries(cur.v43Observations||{}))for(const [pl,r] of Object.entries(o.places||{})){const t=m.v43Observations?.[id]?.places?.[pl];if(!t)continue;
    if(r.seen)t.seen=true;if(r.photo)t.photo=true;if(r.t&&!t.t)t.t=r.t;if(r.loc&&!t.loc)t.loc=r.loc}
  return m}
const v75Seen=s=>Object.values(s?.v43Observations||{}).reduce((a,o)=>a+(Object.values(o.places||{}).some(r=>r.seen)?1:0),0);
const v75When=t=>{const d=new Date(t);return isNaN(d)?'onbekende datum':d.toLocaleString('nl-NL',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})};
async function v75Import(file,o={}){let v;
  try{v=JSON.parse(await file.text())}catch(e){alert('Dit bestand is geen leesbare back-up.');return}
  if(!v75Obj(v)||v.format!=='CR27_V2'||!v75Obj(v.state)){alert('Dit is geen back-up van deze app.');return}
  if(!o.yes&&!await v10Confirm({title:`Back-up van ${v75When(v.exportedAt)} terugzetten?`,text:'De back-up wordt samengevoegd met wat nu op deze telefoon staat; er gaat niets verloren. Eerst wordt een veiligheidskopie gemaakt, die je via Meer › Back-up en herstel kunt terugzetten.',ok:'Terugzetten'}))return;
  try{localStorage.setItem(V75_COPY,JSON.stringify({at:new Date().toISOString(),state}))}
  catch(e){if(!await v10Confirm({title:'Geen ruimte voor een veiligheidskopie',text:'De opslag is te vol om eerst een kopie te maken. Toch terugzetten? De back-up wordt samengevoegd; er wordt niets gewist.',ok:'Toch terugzetten'}))return}
  const before=v75Seen(state);state=v75MergeState(state,v.state);save();v75Persist();
  v10Flash(`Back-up teruggezet. Soorten gezien: ${v75Seen(state)} (was ${before})${o.extra||''}.`);setTimeout(()=>location.reload(),300)}
async function v75Restore(){let c;try{c=JSON.parse(localStorage.getItem(V75_COPY))}catch(e){}if(!c||!v75Obj(c.state))return;
  if(!await v10Confirm({title:'Terug naar vóór de import?',text:`De app gaat terug naar de toestand van ${v75When(c.at)}. Wat je daarna hebt aangepast, gaat verloren.`,ok:'Terugzetten',danger:true}))return;
  try{localStorage.setItem('CR27_V2',JSON.stringify(c.state));localStorage.removeItem(V75_COPY)}catch(e){v10Fail(e,'restore');return}setTimeout(()=>location.reload(),300)}

/* ---------- 2. persistente opslag ---------- */
let v75Persisted=null;
async function v75Persist(){try{if(!navigator.storage||!navigator.storage.persist)return;v75Persisted=await navigator.storage.persisted()||await navigator.storage.persist()}catch(e){}}
v75Persist();

/* Back-uppagina: opslagstatus en veiligheidskopie */
{const prev=DSD_MORE.backup;DSD_MORE.backup=()=>{let c=null;try{c=JSON.parse(localStorage.getItem(V75_COPY))}catch(e){}
  const pers=v75Persisted===true?'Beschermd: de browser ruimt je gegevens niet zelf op.':v75Persisted===false?'Niet beschermd: de browser mag je gegevens opruimen als de telefoon vol raakt. Zet de app op je beginscherm en maak regelmatig een back-up.':'Bescherming van de opslag is in deze browser niet beschikbaar. Maak regelmatig een back-up.';
  const card=`<div class="ds-card v75-store"><b>Opslag</b><p class="ds-meta">${pers}</p>${c?`<div class="v75-copy"><span><b>Veiligheidskopie</b><small>Gemaakt op ${esc(v75When(c.at))}, vlak vóór de laatste import · ${v75Seen(c.state)} soorten gezien</small></span><button class="ds-btn secondary" id="v75restore">Terugzetten</button></div>`:''}</div>`;
  return prev().replace(/<\/div>\s*$/,card+'</div>')}}

/* ---------- 3. updatemelding ---------- */
if('serviceWorker' in navigator){const had=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had)v75Toast()});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')navigator.serviceWorker.getRegistration().then(r=>r&&r.update()).catch(()=>{})})}
function v75Toast(){if(document.getElementById('v75upd'))return;const t=document.createElement('div');t.id='v75upd';t.className='v75-upd';t.setAttribute('role','status');
  t.innerHTML='<span>Nieuwe versie van de app staat klaar.</span><button>Nu laden</button>';t.querySelector('button').onclick=()=>location.reload();document.body.append(t)}

/* ---------- 4. compacte wildlifetab per dag ---------- */
const V75_OPEN=new Set();
const v75Sec=()=>[...document.querySelectorAll('.ds-wild-sec')].find(s=>!s.classList.contains('v47-focus'));
function v75Compact(){if(tab!=='days'||daySection!=='wildlife')return;const sec=v75Sec();if(!sec||sec.dataset.v75)return;sec.dataset.v75='1';let total=0,hid=0;
  sec.querySelectorAll('.v47-cat-h').forEach(h=>{const cards=[];let e=h.nextElementSibling;while(e&&!e.classList.contains('v47-cat-h')){if(e.classList.contains('v47-sp'))cards.push(e);e=e.nextElementSibling}
    const own=/^Zelf toegevoegd/.test(h.textContent);let keep=0;
    cards.forEach(c=>{total++;const ch=+(((c.querySelector('.ds-chance')||{}).className||'').match(/\bc(\d)\b/)||[0,0])[1];
      if(own||(ch>=3&&keep<8)||keep<3)keep++;else{c.classList.add('v75-x');hid++}});
    if(!keep)h.classList.add('v75-xh')});
  if(!hid)return;
  const sub=sec.querySelector('.ds-wild-sech small');if(sub)sub.textContent=`Kansrijkste eerst · ${total-hid} van ${total}`;
  const b=document.createElement('button');b.className='ds-btn secondary v75-all';b.innerHTML=`Toon alle ${total} soorten in deze regio`;
  b.onclick=()=>{V75_OPEN.add(currentDay);v75Toggle()};sec.append(b);v75Toggle()}
function v75Toggle(){const sec=v75Sec();if(!sec||!sec.dataset.v75)return;const active=!!v50Query.trim()||v47Filter!=='Alle';sec.classList.toggle('v75-c',!active&&!V75_OPEN.has(currentDay))}
{const prev=v50ApplyFilter;v50ApplyFilter=function(){prev();v75Toggle()}}

/* ---------- 7. dag 14: ochtend in San Gerardo ---------- */
const V75_MORNING={14:{region:'San Gerardo de Dota',label:'Ochtend · quetzaltour in San Gerardo'}};
{const prev=speciesList;speciesList=function(d){const m=V75_MORNING[d.id],F=V47_FOCUS[d.id];if(!m||!F)return prev(d);
  const reg=v47Region(d),orig=F.list,morning=orig.filter(n=>(v47Chance(m.region,n)||0)>(v47Chance(reg,n)||0));if(!morning.length)return prev(d);
  let h;F.list=orig.filter(n=>!morning.includes(n));try{h=prev(d)}finally{F.list=orig}
  const sec=`<section class="ds-card ds-wild-sec v47-focus v75-morning"><div class="ds-wild-sech"><span class="ds-label">${esc(m.label)}</span><small>Gezien telt bij San Gerardo</small></div>${morning.map(n=>v47Card(n,m.region,true)).join('')}</section>`;
  return h.replace(/<section class="(wl2-targets|ds-card ds-wild-sec)/,sec+'$&')}}

/* ---------- 6. teller op Home ---------- */
{const prev=renderHome;renderHome=function(){return prev().replace('284 soorten',`${Object.keys(V47_SP).length} soorten`)}}

/* ---------- koppelingen ---------- */
{const prev=bind;bind=function(){prev();
  const inp=document.getElementById('import');
  if(inp&&!inp.dataset.v75){const c=inp.cloneNode(true);c.dataset.v75='1';inp.replaceWith(c);c.addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';if(f)v75Import(f)})}
  const r=document.getElementById('v75restore');if(r)r.onclick=v75Restore;
  v75Compact()}}
