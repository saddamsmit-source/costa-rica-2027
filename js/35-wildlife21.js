/* =====================================================================
   v7.2 · Wildlife 2.1 – inhoudelijke correcties
   Leest extra velden uit js/30-wildlife-data.js. Soort-ID's (sleutels) en
   de opslag (state.v43Observations, state.v44Log) blijven ongewijzigd.
   Velden: en (actuele Engelse naam), ak (oude namen, voor zoeken),
   sp (soortgroep bij vormen), fm (vorm-label), gen (niet op soort),
   sf (veiligheid), lk (lijkt op), ft (fototip), tp (korte tip),
   au (vaak eerst gehoord), rn (toelichting per regio), vw (zeeleven:
   snorkel/boot/duik), nw (nieuw in 2.1).
   ===================================================================== */
const WL21_CHANCE={4:'Zeer kansrijk',3:'Kansrijk',2:'Mogelijk',1:'Zeldzaam / uitzonderlijk'};
const WL21_CHANCE_SHORT={4:'Zeer kansrijk',3:'Kansrijk',2:'Mogelijk',1:'Zeldzaam'};
Object.assign(DS_CHANCE_TXT,WL21_CHANCE_SHORT);
for(const k of [1,2,3,4])V47_CHANCE[k][0]=WL21_CHANCE_SHORT[k];
const WL21_VIEW={snorkel:'Zichtbaar bij snorkelen',boot:'Vanaf de boot',duik:'Vooral bij duiken',strand:'Vanaf strand of kust'};
const WL21_HIDE=['Blue morpho','Tarantula','Tropical reef fish'];

/* trefkansen: de nieuwe WL2-kansen vervangen de oudere regiolijsten. Eigen waarnemingen
   blijven in de regiolijst staan, ook als de soort daar nu als zeldzaam geldt. */
(function(){if(typeof WL2==='undefined')return;
  const keys=new Set(Object.keys(WL2));
  for(const reg of Object.keys(V47_PLACES))V47_PLACES[reg]=V47_PLACES[reg].filter(([n])=>!keys.has(n));
  for(const [k,r] of Object.entries(WL2))for(const [reg,t] of Object.entries(r.r||{}))(V47_PLACES[reg]??=[]).push([k,t]);
  try{const obs=state.v43Observations||{};
    for(const k of keys){const o=obs[v43name(k)];if(!o||!o.places)continue;
      for(const [reg,p] of Object.entries(o.places))if(p&&p.seen&&V47_PLACES[reg]&&!V47_PLACES[reg].some(x=>x[0]===k))V47_PLACES[reg].push([k,1])}}catch(e){}
  for(const k of Object.keys(V43_TARGETS))delete V43_TARGETS[k];
  for(const [region,list] of Object.entries(V47_PLACES)){const g={};list.forEach(([n])=>{(g[v47Info(n).cat]??=[]).push(n)});V43_TARGETS[region]=g}
  /* dagfocus: Pacifische genten heten nu Cocos booby; snorkeldag met echte rifvissen */
  if(V47_FOCUS[15])V47_FOCUS[15].list=V47_FOCUS[15].list.map(n=>n==='Brown booby'?'Cocos booby':n);
  if(V47_FOCUS[18])V47_FOCUS[18].list=[...new Set(['Panamic sergeant major','Green sea turtle','Moorish idol','King angelfish','Whitetip reef shark',...V47_FOCUS[18].list,'Cortez rainbow wrasse'])].filter(n=>V47_SP[n]||WL2[n])})();

/* namen: actuele Engelse naam tonen, sleutel blijft gelijk */
(function(){if(typeof WL2==='undefined')return;
  for(const [k,r] of Object.entries(WL2)){const s=V47_SP[k];if(!s)continue;
    if(r.nl&&s[0]!==r.nl){r.ak=[...(r.ak||[]),s[0]];s[0]=r.nl}   /* v7.3: gecorrigeerde Nederlandse naam (IOC 15.2) gaat voor de oude app-naam; oude namen staan in r.ak */
    if(r.tp)s[3]=r.tp;
    if(r.ft&&!V51_PHOTO[k])V51_PHOTO[k]=r.ft}})();
const wl21PrevInfo=v47Info;
v47Info=function(name){const i=wl21PrevInfo(name),r=wl2(name);if(r&&r.en)i.en=r.en;return i};
function wl21Search(name){const r=wl2(name)||{};return [name,r.nl||'',r.en||'',(r.ak||[]).join(' '),r.s||'',r.fm||''].join(' ').toLowerCase()}
const wl21PrevCard=v47Card;
v47Card=function(name,region,focus){let h=wl21PrevCard(name,region,focus);const r=wl2(name);if(!r)return h;
  h=h.replace(/data-search="([^"]*)"/,(m,a)=>`data-search="${a} ${esc(wl21Search(name))}"`);
  if(r.au)h=h.replace(/(<span class="ds-sp-txt"><b>[^<]*<\/b><em>)/,`$1vaak eerst gehoord · `);
  return h};

/* soortvenster: veiligheid, lijkt op, gehoord, regio-toelichting, zichtbaarheid zeeleven */
function wl21Extra(name){const r=wl2(name);if(!r)return '';
  return `${r.sf?`<div class="wl21-safe" role="note">${dsI('lock',16).replace(DS_ICON.lock,'<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/>')}<span>${esc(r.sf)}</span></div>`:''}
    ${r.lk?`<div class="wl2-sec"><h4>Lijkt op</h4><p>${esc(r.lk)}</p></div>`:''}`}
const wl21PrevSheet=wl2SheetHtml;
wl2SheetHtml=function(name,region){let h=wl21PrevSheet(name,region);const r=wl2(name);if(!r)return h;
  const chips=[];if(r.au)chips.push('<span class="sky">Vaak eerst gehoord</span>');if(r.vw)chips.push(`<span>${esc(WL21_VIEW[r.vw]||r.vw)}</span>`);if(r.fm)chips.push(`<span>${esc(r.fm)}</span>`);if(r.gen)chips.push('<span>Niet op soort</span>');
  if(chips.length)h=h.replace(/(<div class="ds-chips">)/,`$1${chips.join('')}`);
  h=h.replace(/(<div class="wl2-sec ?"><h4>Herkenning<\/h4>)/,`${wl21Extra(name)}$1`);
  if(!/<h4>Herkenning<\/h4>/.test(h))h=h.replace(/(<div class="wl2-sec ?"><h4>Leefgebied)/,`${wl21Extra(name)}$1`);
  h=h.replace(/Kansen zijn een inschatting op basis van waarnemingen in januari–april, geen garantie\./,'Kansen zijn een kwalitatieve inschatting voor jullie excursie in februari (verspreiding, leefgebied, activiteitstijd, vindbaarheid en waarnemingen in jan–apr; opvangcentra en kikkertuinen tellen niet mee). Geen garantie.');
  return h};
const wl21PrevBars=wl2Bars;
wl2Bars=function(name,region){let h=wl21PrevBars(name,region);const r=wl2(name);
  h=h.replace(/<small>Zeldzaam<\/small>/g,'<small>Zeldzaam / uitzonderlijk</small>');
  if(r&&r.rn)for(const [reg,t] of Object.entries(r.rn))h=h.replace(new RegExp(`(<span>${reg.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}</span>[\\s\\S]*?<small>[^<]*)(</small>)`),`$1 · ${esc(t)}$2`);
  return h?h+'<p class="wl2-src wl21-legend">Zeer kansrijk: meestal gezien tijdens de excursie · Kansrijk: vaak · Mogelijk: met wat geluk of een goede gids · Zeldzaam / uitzonderlijk: alleen met veel geluk.</p>':h};

/* soortenlijst: vormen en niet-op-soort tellen niet dubbel */
function wl21Sid(name){const r=wl2(name);return r?(r.sp||name):name}
function wl21Countable(name){const r=wl2(name);return !WL21_HIDE.includes(name)&&!(r&&r.gen)}
wl2Life=function(){const seenNames=new Set(wl2Entries().map(e=>e.name)),cats=['Vogels','Zoogdieren','Reptielen','Amfibieën','Zeeleven'];
  const uniq=list=>new Set(list.filter(wl21Countable).map(wl21Sid));
  const seen=uniq([...seenNames]);
  const tot=c=>uniq(Object.keys(V47_SP).filter(n=>V47_SP[n][1]===c)).size,got=c=>uniq([...seenNames].filter(n=>v47Info(n).cat===c)).size;
  const regs=Object.keys(V47_PLACES).map(r=>[r,wl2Entries().filter(e=>e.pl===r).length]).filter(x=>x[1]);
  return `<div class="ds-card wl2-life"><div class="wl2-life-h"><div><span class="ds-label">Mijn soortenlijst</span><b class="ds-num">${seen.size}</b><small>soorten gezien</small></div><button class="ds-chipbtn" id="wl2Export">${dsdI('download',15)}Exporteer</button></div>
    ${cats.map(c=>{const t=tot(c),g=got(c);return t?`<div class="wl2-lrow"><span>${c}</span><div class="ds-bar"><i style="width:${Math.round(100*g/t)}%"></i></div><em class="ds-num">${g}/${t}</em></div>`:''}).join('')}
    ${regs.length?`<div class="wl2-regs">${regs.map(([r,n])=>`<span>${esc(r)} <b class="ds-num">${n}</b></span>`).join('')}</div>`:''}</div>`};

/* zoeken op oude en nieuwe namen */
const wl21PrevGS=v50GlobalSearch;
v50GlobalSearch=function(v){const q=v.trim().toLowerCase();wl21PrevGS(v);const box=document.getElementById('v50gres');if(!box||q.length<2)return;
  const shown=new Set([...box.querySelectorAll('[data-wl2]')].map(b=>decodeURIComponent(b.dataset.wl2)));
  const extra=Object.keys(V47_SP).filter(n=>!shown.has(n)&&!WL21_HIDE.includes(n)&&wl21Search(n).includes(q)).slice(0,20);
  if(!extra.length)return;if(!shown.size)box.innerHTML='';
  const reg=v47Region(S[(v48TripDay()||currentDay)-1]);
  box.insertAdjacentHTML('beforeend',extra.map(n=>{const i=v47Info(n),w=wl2Where(n),t=wl2Thumb(n);return `<button class="ds-gres wl2-gres" data-wl2="${encodeURIComponent(n)}" data-wl2-region="${encodeURIComponent(w[0]?w[0][0]:reg)}"><span class="wl2-logimg">${t?`<img src="${t}" alt="" loading="lazy">`:''}</span><span><b>${esc(i.nl)}</b>${i.nl!==i.en?`<em>${esc(i.en)}</em>`:''}<span class="ds-chips">${w.slice(0,5).map(([r,c])=>`<span class="c${c}">${esc(r)}</span>`).join('')||'<span>niet op de route verwacht</span>'}</span></span></button>`}).join(''));
  wl2BindOpeners(box)};

/* offline: alleen bestanden tellen die de huidige gids gebruikt; nieuwe foto's melden */
wl2OfflineCount=async function(){try{const c=await caches.open(WL2_CACHE),have=new Set((await c.keys()).map(r=>new URL(r.url).pathname));return wl2FileList().filter(u=>have.has(new URL(u,location.href).pathname)).length}catch(e){return 0}};
wl2HdCount=async function(){try{const c=await caches.open(WL2_HD_CACHE),have=new Set((await c.keys()).map(r=>new URL(r.url).pathname));return wl2HdList().filter(u=>have.has(new URL(u,location.href).pathname)).length}catch(e){return 0}};
async function wl21PhotoState(name){const r=wl2(name);if(!r||!r.p||!('caches' in window)||!location.protocol.startsWith('http'))return;
  try{const c=await caches.open(WL2_CACHE);if(await c.match(`./photos/wl/${r.p}.jpg`))return;
    const box=document.querySelector('#wl2Sheet .wl2-photo');if(box&&!box.querySelector('.wl21-off'))box.insertAdjacentHTML('beforeend',`<span class="wl21-off">${navigator.onLine?'Foto wordt nog offline opgeslagen':'Foto nog niet offline beschikbaar'}</span>`)}catch(e){}}
const wl21PrevOpen=wl2Open;
wl2Open=function(name,region){wl21PrevOpen(name,region);wl21PhotoState(name)};
render();
