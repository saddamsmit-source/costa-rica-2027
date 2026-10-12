/* ================= v5.0 – stijl richting voorbeeld ================= */
const V50_TAG={'San José':'Hoofdstad tussen bergen en koffieplantages','Cahuita':'Caribische kust, regenwoud en rif','Tortuguero':'Kanalen, regenwoud en waterwildlife','La Fortuna':'Vulkaan, watervallen en warmwaterbronnen','Rincón de la Vieja':'Vulkaan, modderpoelen en droog bos','Monteverde':'Nevelwoud, hangbruggen en kolibries','San Gerardo de Dota':'Bergdorp in het rijk van de quetzal','Uvita':'Regenwoud, rivier en walvissen','Corcovado':'Het meest ongerepte regenwoud','Esterillos':'Rustig strand aan de Pacific','Manuel Antonio':'Apen, luiaards en witte stranden','Tárcoles':'Krokodillen en mangroven'};
const V50_TEXT={
1:'Aankomst in San José, de hoofdstad in een vallei tussen koffieplantages, bergen en vulkanen. Eén nacht om bij te komen.',
2:'Ca. 4,5 uur naar de Caribische kust. Cahuita heeft een Engelstalige, Caribische sfeer; de lodge ligt dicht bij het strand.',
3:'Vrije dag. In Nationaal Park Cahuita wandel je tussen kokospalmen en regenwoud, met brulapen, vlinders en slangen. Puerto Viejo ligt op ca. 20 minuten.',
4:'Ca. 4 uur met de bus naar La Pavona, daarna per boot door rivieren en kanalen naar Tortuguero.',
5:'Vrije dag in Tortuguero. Varen door smalle kanalen en wandelen in het park: kans op vogels, apen, luiaards, kaaimannen en kleine kikkers.',
6:'Per boot terug naar La Pavona en ca. 4 uur met de bus naar La Fortuna, aan de voet van de Arenal (1.633 m).',
7:'Vrije dag rond de Arenal: Caño Negro per boot, een waterval met zwempoel en \'s avonds de thermale bronnen.',
8:'Ca. 4 uur naar het bergachtige gebied rond de vulkaan Rincón de la Vieja, met borrelende modderpoelen en dampende bronnen.',
9:'Vrije dag. Las Pailas: modderpoelen, fumarolen en droog tropisch bos.',
10:'Ca. 3 uur naar het nevelwoud van Monteverde. Het is hier koeler en de nachten kunnen koud zijn.',
11:'Vrije dag in Monteverde: hangbruggen, canopy, koffietour en \'s avonds een nachttour.',
12:'Tweede vrije dag: vroege birdingtour in Curi-Cancha en kolibries spotten.',
13:'Lange reisdag van ca. 6 uur naar San Gerardo de Dota, een bergdorp op ca. 2.000 m en een van de beste plekken voor de quetzal.',
14:'Vroeg op zoek naar de quetzal, daarna ca. 3,5 uur naar Vergel de Punta Mala: een rustig dorp in het regenwoud en een tentenlodge aan de rivier.',
15:'Vrije dag aan de Pacifische kust: whale watching in Marino Ballena en een kokostour.',
16:'Ca. 1 uur naar Sierpe, daarna per boot naar de lodge. Grote bagage blijft achter. Dit is het meest ongerepte deel van het land.',
17:'Corcovado NP: deels per boot, daarna 4–5 uur wandelen met een Engelstalige lokale gids.',
18:'Snorkelen bij Isla del Caño, of rust bij de lodge met korte wandelingen langs apen, toekans, ara\'s en neusbeertjes.',
19:'Ca. 1 uur varen naar Sierpe en ca. 3 uur rijden naar Esterillos: een lang, rustig strand met palmbomen.',
20:'Dagtocht naar Manuel Antonio NP, ca. 1 uur rijden. Klein en populair: apen, luiaards, leguanen en neusbeertjes.',
21:'3–4 uur naar San José, met een stop bij de krokodillenbrug over de Tárcoles.',
22:'Laatste uren in Costa Rica, daarna de terugvlucht naar Amsterdam.',
23:'Aankomst in Amsterdam.'};
const V50_SLOT={'Curi-Cancha vroege birdingtour met gespecialiseerde gids':'Ochtend','Specialistische quetzaltour vroeg in de ochtend':'Ochtend','Vroege kanotocht door smalle kanalen met natuurgids':'Ochtend','Whale watching Marino Ballena':'Ochtend','Nachtwandeling':'Avond','Night walk':'Avond','Thermale bronnen bij Arenal in de avond':'Avond','Strandwandeling bij zonsondergang':'Avond','Tatoeage in Monteverde':'Middag','Rustige vogelobservatie rond Sueños del Bosque':'Middag','Rustige natuur- en vogelobservatie rond lodge':'Middag','Terugvlucht':'Avond'};
const V50_I={
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.7 0-3 1-3 2.2 0 2.8 6 1.5 6 4.4 0 1.3-1.4 2.4-3 2.4-1.2 0-2.3-.6-2.8-1.6M12 6.5v1.5M12 16.5V18"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
 alert:'<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17.5h.01"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 leaf:'<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19 13 11"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 star:'<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z"/>',
 check:'<path d="m5 12 5 5 9-10"/>',
 note:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
 chev:'<path d="m6 9 6 6 6-6"/>'
};
function v50I(k,s){return `<svg viewBox="0 0 24 24" width="${s||16}" height="${s||16}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${V50_I[k]||V46_ICONS[k]||''}</svg>`}
function v50Kind(a){if(a.status==='excluded')return 'excl';if(a.status==='optional'||a.status==='conditional')return 'opt';return a.source==='sawadee'?'saw':'own'}
const V50_KIND={saw:['Sawadee','k-saw'],own:['Onze optie','k-own'],opt:['Optioneel','k-opt'],excl:['Uitgesloten','k-excl']};
function v50LongDate(d){const s=new Date(d.date+'T12:00:00').toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long',year:'numeric'});return s.charAt(0).toUpperCase()+s.slice(1)}

/* ---------- dagscherm ---------- */
dayIcons.stay=V46_SVG(V46_ICONS.bed).replace('width="24" height="24"','width="20" height="20"');
dayIcons.activities=V46_SVG('<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>').replace('width="24" height="24"','width="20" height="20"');
renderDays=function(){
  const d=S[currentDay-1],region=v47Region(d),kinds=new Set(d.activities.map(v50Kind));
  const tag=d.id===22?'Afscheid van Costa Rica':d.id===23?'Terug naar huis':(V50_TAG[region]||'');
  const title=d.id===21?'San José':d.id===20?'Manuel Antonio':d.place.split('/')[0].trim();
  const badges=[kinds.has('saw')?`<span class="v50-badge k-saw">${v50I('leaf',13)}Sawadee</span>`:'',kinds.has('own')?`<span class="v50-badge k-own">${v50I('star',13)}Onze optie</span>`:'',kinds.has('opt')?`<span class="v50-badge k-opt">${v50I('plus',13)}Optioneel</span>`:''].join('');
  const tabs=[['overview','Overzicht'],['activities','Activiteiten'],['wildlife','Wildlife'],['stay','Hotel'],['map','Kaart']];
  return `<div class="v50-day">
  <section class="v50-hero" id="swipeZone" style="background-image:${photoBackground(d)}">
    <div class="v50-hero-top">
      <button class="v50-circle" data-daymove="-1" ${currentDay===1?'disabled':''} aria-label="Vorige dag">${v50I('chev',20).replace('<path','<path transform="rotate(90 12 12)"')}</button>
      <label class="v50-daypick">Dag ${d.id} van 23 ${v50I('chev',14)}<select id="dayPicker" aria-label="Kies reisdag">${S.map(x=>`<option value="${x.id}" ${x.id===d.id?'selected':''}>Dag ${x.id} · ${fmt(x.date)} · ${esc(x.place)}</option>`).join('')}</select></label>
      <button class="v50-circle" data-daymove="1" ${currentDay===23?'disabled':''} aria-label="Volgende dag">${v50I('chev',20).replace('<path','<path transform="rotate(-90 12 12)"')}</button>
    </div>
    <div class="v50-hero-copy">
      <div class="v50-date">${v50LongDate(d)}</div>
      <h2>${esc(title)}</h2>
      ${tag?`<p>${esc(tag)}</p>`:''}
      <div class="v50-badges">${badges}</div>
    </div>
  </section>
  <nav class="v50-tabs" aria-label="Dagonderdelen">${tabs.map(([v,t])=>`<button data-section="${v}" class="${daySection===v?'active':''}"><span>${dayIcons[v]}</span>${t}</button>`).join('')}</nav>
  <section class="v50-panel">${dayContent(d)}</section>
  </div>`};

/* ---------- inhoud per tab ---------- */
function v50Timeline(d){
  const order={Ochtend:0,undefined:1,Middag:2,Avond:3};
  const acts=d.activities.map((a,i)=>({a,i})).filter(x=>x.a.status!=='excluded').sort((x,y)=>(order[V50_SLOT[x.a.title]]??1)-(order[V50_SLOT[y.a.title]]??1)||x.i-y.i);
  return acts.map(({a,i})=>{const k=v50Kind(a),info=V48_ACT[a.title]||{},slot=V50_SLOT[a.title];
    const sub=[info.dur,info.price].filter(Boolean).join(' · ')||a.note||'';
    return `<div class="v50-tl" data-activity="${i}" data-day="${d.id}" role="button" tabindex="0">
      <div class="v50-tl-ico ${V50_KIND[k][1]}">${v46Icon(v46IconKey(a.title),18)}</div>
      <div class="v50-tl-body">${slot?`<small>${slot}</small>`:''}<b>${esc(a.title)}</b>${sub?`<span>${esc(sub)}</span>`:''}</div>
      <span class="v50-pill ${V50_KIND[k][1]}">${V50_KIND[k][0]}</span></div>`}).join('')||'<p class="hint">Geen activiteiten op deze dag.</p>';
}
function v50Know(d){
  const out=[];if(d.flag)out.push(['alert',d.flag]);
  d.activities.forEach(a=>{const x=V48_ACT[a.title];if(x?.book==='online')out.push(['alert',`${a.title}: tickets vooraf online via SINAC.`])});
  if([4,5].includes(d.id))out.push(['coin','Maaltijden in Tortuguero: vast bedrag voor drie maaltijden per dag, ter plekke te betalen.']);
  if([16,17,18].includes(d.id))out.push(['coin','Maaltijden in Corcovado: vast bedrag per dag, ter plekke te betalen. De Corcovado-excursie betaal je aan de lodge.']);
  if(d.id===16)out.push(['info','Waterschoenen aan: je waadt aan land. Neem een kleine tas mee voor 3 nachten.']);
  if([10,11,12,13].includes(d.id))out.push(['info','Neem een warme laag mee: de nachten in het nevelwoud en de bergen kunnen koud zijn.']);
  if(d.tip)out.push(['info',d.tip]);
  return out.length?`<div class="v50-know"><div class="v50-know-h">${v50I('info',18)}Goed om te weten</div><ul>${out.map(([i,t])=>`<li>${v50I(i,15)}<span>${esc(t)}</span></li>`).join('')}</ul></div>`:'';
}
const v50PrevDayContent=dayContent;
dayContent=function(d){
  if(daySection==='overview'){
    const std=d.hotel.find(h=>!V48_HOTEL[h]?.single)||d.hotel[0],alt=d.hotel.filter(h=>h!==std&&!V48_HOTEL[h]?.single).length;
    return `<div class="card v50-card"><div class="v50-h">Dagoverzicht</div><p class="v50-text">${esc(V50_TEXT[d.id]||d.base)}</p>
      <div class="v50-timeline">${v50Timeline(d)}</div></div>
      ${std?`<button class="v50-stay" data-section="stay"><img src="${(V49_HOTEL_PHOTO[std]?'./photos/'+V49_HOTEL_PHOTO[std].key+'.jpg':locationPhoto(d))}" alt=""><span><small>Overnachting</small><b>${esc(std)}</b>${alt?`<em>+${alt} ${alt===1?'alternatief':'alternatieven'}</em>`:''}</span>${v50I('chev',18).replace('<path','<path transform="rotate(-90 12 12)"')}</button>`:''}
      ${v50Know(d)}
      <details class="v49-acc v50-notes" ${state.notes[d.id]?'open':''}><summary><span>${v50I('note',16)} Mijn notities</span>${state.notes[d.id]?'<em>✓</em>':''}</summary><textarea class="field" data-note="${d.id}" placeholder="Waarnemingen, tijden, fotomomenten…">${esc(state.notes[d.id]||'')}</textarea></details>`;
  }
  if(daySection==='activities'){
    const by={saw:[],own:[],opt:[],excl:[]};d.activities.forEach(a=>by[v50Kind(a)].push(a));
    const sec=(k,t,ic)=>by[k].length?`<div class="v50-sec ${V50_KIND[k][1]}"><h3>${v50I(ic,18)}${t}</h3>${by[k].map(visualActivity).join('')}</div>`:'';
    return sec('saw','Sawadee-programma','leaf')+sec('own','Onze toevoegingen','star')+sec('opt','Optionele activiteiten','plus')+sec('excl','Bewust uitgesloten','info')||'<div class="card"><p class="hint">Geen activiteiten.</p></div>';
  }
  if(daySection==='stay'){
    if(!d.hotel.length)return '<div class="card"><p class="hint">Geen overnachting op deze dag.</p></div>';
    const two=d.hotel.some(h=>V48_HOTEL[h]?.single);
    return `<div class="v50-hotels">${d.hotel.map(h=>v48HotelCard(h,d,d.hotel.length)).join('')}</div><p class="hint" style="padding:0 4px">${two?'Met z\'n tweeën slapen jullie in de standaard-lodge; de andere opties zijn voor singlereizigers.':d.hotel.length>1?'Voorlopige alternatieven; Sawadee bevestigt het hotel kort voor vertrek.':'Sawadee-accommodatie.'}</p>`;
  }
  return v50PrevDayContent(d);
};

/* activiteitkaart met meta-regel */
visualActivity=function(a){
  const day=S.find(d=>d.activities.includes(a))||S[currentDay-1],idx=day.activities.indexOf(a),info=V48_ACT[a.title]||{},bk=v48BookOf(a,day,idx),src=v48Photo(v48ActKey(a,day)),k=v50Kind(a);
  const meta=[info.dur?`<span>${v50I('clock',14)}${esc(info.dur)}</span>`:'',info.price?`<span>${v50I('coin',14)}${esc(info.price)}</span>`:'',bk&&V48_BOOK[bk]&&bk!=='nvt'&&bk!=='programma'?`<span class="v50-bk ${V48_BOOK[bk][1]}">${bk==='geboekt'?v50I('check',13):''}${V48_BOOK[bk][0].split(' (')[0]}</span>`:''].join('');
  return `<div class="v50-act ${k==='excl'?'excluded':''}" role="button" tabindex="0" data-activity="${idx}" data-day="${day.id}">
    <div class="v50-thumb">${src?`<img src="${src}" alt="" loading="lazy">`:''}</div>
    <div class="v50-act-body"><b>${esc(a.title)}</b>${a.note?`<p>${esc(a.note)}</p>`:''}${meta?`<div class="v50-meta">${meta}</div>`:''}</div>
    ${v50I('chev',18).replace('<path','<path transform="rotate(-90 12 12)"')}</div>`};

/* ---------- emoji → lijn-iconen ---------- */
const V50_EMOJI=/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B06}\u{2194}-\u{21AA}\u{2300}-\u{23FF}\u{25A0}-\u{25FF}\u{2190}-\u{2193}️]/gu;
function v50Sanitize(root){if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;const keep=/[←→↗›‹·–—✓]/;while((n=w.nextNode())){if(n.parentElement&&/^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION)$/.test(n.parentElement.tagName))continue;const t=n.nodeValue;if(!V50_EMOJI.test(t))continue;V50_EMOJI.lastIndex=0;n.nodeValue=t.replace(V50_EMOJI,m=>keep.test(m)?m:'').replace(/^\s+/,m=>m.includes('\n')?m:' ').replace(/\s{2,}/g,' ')}}
statusName.locked='Vastgezet';
render=function(){
  document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.querySelectorAll('[data-mobile]').forEach(b=>b.classList.toggle('active',b.dataset.mobile===tab));
  $('#app').innerHTML=({home:renderHome,days:renderDays,map:renderMap,bookings:renderBookings,hotels:renderHotels,wildlife:renderWildlife,budget:renderBudget,settings:renderSettings})[tab]();
  bind();v50Sanitize($('#app'));document.body.dataset.tab=tab};
const v50PrevOpen=openActivity;
openActivity=function(day,idx){v50PrevOpen(day,idx);v50Sanitize(document.getElementById('detailOverlay'))};
const v50PrevBind=bindExtras;
bindExtras=function(){v50PrevBind();document.querySelectorAll('.v50-tl[data-activity]').forEach(el=>el.onclick=()=>openActivity(Number(el.dataset.day),Number(el.dataset.activity)))};

/* ================= v5.0 – uitgebreide vogellijst, groepen, zoeken ================= */
Object.assign(V47_SP,{
/* Caribisch laagland */
'Chestnut-headed oropendola':['Chestnut-headed oropendola','Vogels','d','Kleiner dan de Montezuma-oropendola; hangende nesten in kolonies.'],
'Black-cheeked woodpecker':['Zwartwangspecht','Vogels','d','Algemeen in het Caribisch laagland; geel voorhoofd.'],
'Crimson-collared tanager':['Crimson-collared tanager','Vogels','d','Zwart met vuurrode kraag; bosranden aan de Caribische kant.'],
'Red-lored parrot':['Roodteugelamazone','Vogels','o','Paren vliegen luid over bij zonsopkomst.'],
'Mealy parrot':['Mealy amazone','Vogels','o','Grootste amazone; groepen in hoge bomen.'],
'Olive-throated parakeet':['Olive-throated parakeet','Vogels','d','Lawaaierige groepjes aan de Caribische kust.'],
'White-collared manakin':['Witkraagmanakin','Vogels','o','Mannetjes knallen met hun vleugels in het onderhout.'],
'Bananaquit':['Suikerdief','Vogels','d','Klein, geel-zwart; bij bloemen en suikerwater.'],
'Buff-throated saltator':['Buff-throated saltator','Vogels','d','Algemeen in bosranden en tuinen.'],
'Long-billed hermit':['Langsnavelheremietkolibrie','Vogels','d','Lange gebogen snavel; bij heliconia\'s in het laagland.'],
'Crowned woodnymph':['Crowned woodnymph','Vogels','d','Groen-violette kolibrie in het onderhout van laaglandbos.'],
'Black-cowled oriole':['Black-cowled oriole','Vogels','d','Zwart met geel; in bananen- en palmbomen.'],
'Snowy cotinga':['Snowy cotinga','Vogels','d','Zeldzaam; spierwit, hoog in bomen langs de Caribische kust.'],
'Little blue heron':['Kleine blauwe reiger','Vogels','w','Algemeen langs kanalen en kust.'],
'Snowy egret':['Amerikaanse kleine zilverreiger','Vogels','w','Gele "sloffen" aan zwarte poten.'],
'Tricolored heron':['Witbuikreiger','Vogels','w','Ondiep water en mangroven.'],
'Green heron':['Groene reiger','Vogels','w','Zit laag op takken boven het water.'],
'Gray-cowled wood-rail':['Gray-cowled wood-rail','Vogels','w','Loopt schichtig langs modderige oevers.'],
'Slaty-tailed trogon':['Slaty-tailed trogon','Vogels','d','Grote trogon met oranjerode snavel; laaglandbos.'],
'Rufous-tailed jacamar':['Roodstaartglansvogel','Vogels','d','Zit stil op een tak en vangt vlinders; glanst metaalgroen.'],
'White-necked puffbird':['Witnek-baardvogel','Vogels','d','Zit doodstil hoog op een kale tak.'],
'Great potoo':['Grote potoe','Vogels','n','Overdag gecamoufleerd als afgebroken tak; gids kent de plek.'],
'Pale-billed woodpecker':['Pale-billed woodpecker','Vogels','d','Grote specht met rode kop; hard roffelen.'],
'Lineated woodpecker':['Lineated woodpecker','Vogels','d','Grote specht met rode kuif.'],
'Gray hawk':['Grijze buizerd','Vogels','d','Algemeen langs bosranden.'],
'Bat falcon':['Vleermuisvalk','Vogels','s','Zit op hoge kale takken; jaagt in de schemer.'],
'White hawk':['Witte buizerd','Vogels','d','Wit met zwarte vleugelrand; boven bos.'],
/* Caño Negro & Arenal */
'Black-bellied whistling-duck':['Zwartbuikfluiteend','Vogels','w','Groepen op lagunes; fluitend geluid.'],
'Muscovy duck':['Muskuseend (wild)','Vogels','w','Wilde vorm; schuw, vliegt op bij de boot.'],
'Blue-winged teal':['Blauwvleugeltaling','Vogels','w','Wintergast; groepen in ondiep water.'],
'Least grebe':['Dwergfuut','Vogels','w','Klein; duikt in rustige lagunes.'],
'White ibis':['Witte ibis','Vogels','w','Groepen op modderplaten en weilanden.'],
'Pinnated bittern':['Pinnated bittern','Vogels','w','Zeldzaam; tussen riet en hoog gras in Caño Negro.'],
'Nicaraguan seed-finch':['Nicaraguan seed-finch','Vogels','d','Zeldzaam; enorme roze snavel. Caño Negro is een van de weinige plekken.'],
'Green-breasted mango':['Groenborstmango','Vogels','d','Kolibrie van open land en tuinen.'],
'Black-crowned tityra':['Black-crowned tityra','Vogels','d','Wit-grijs met zwarte kap; hoog in bomen.'],
'Emerald tanager':['Smaragdtangare','Vogels','d','Felgroen met zwarte vlekjes; voetheuvels rond de Arenal.'],
'Silver-throated tanager':['Zilverkeeltangare','Vogels','d','Geel met zilveren keel; algemeen in voetheuvels en nevelwoud.'],
'Bay-headed tanager':['Roodkoptangare','Vogels','d','Bontgekleurd; in gemengde groepen.'],
'Speckled tanager':['Speckled tanager','Vogels','d','Gespikkeld; voetheuvels bij Arenal.'],
'Snowcap':['Snowcap','Vogels','d','Zeldzame minikolibrie met witte kruin; voetheuvels Caribische helling.'],
'Black-crested coquette':['Black-crested coquette','Vogels','d','Zeldzaam; piepklein met kuif; bij bloeiende verbena.'],
'Bare-necked umbrellabird':['Bare-necked umbrellabird','Vogels','o','Zeldzaam en bedreigd; voetheuvels rond Arenal.'],
'Keel-billed motmot':['Keel-billed motmot','Vogels','o','Zeldzaam; bosranden rond de Arenal.'],
'Broad-billed motmot':['Broad-billed motmot','Vogels','d','Kleinere motmot van het laaglandbos.'],
'Rufous motmot':['Rufous motmot','Vogels','d','Grote roestbruine motmot; voetheuvels.'],
/* Guanacaste droog bos */
'Inca dove':['Incaduif','Vogels','d','Klein, geschubd; overal in droog gebied.'],
'White-winged dove':['Witvleugeltreurduif','Vogels','d','Algemeen in open droog land.'],
'Groove-billed ani':['Groefsnavelani','Vogels','d','Zwarte groepjes in struiken en weides.'],
'Streak-backed oriole':['Streak-backed oriole','Vogels','d','Oranje met gestreepte rug; droog bos.'],
'Banded wren':['Banded wren','Vogels','d','Luide zanger van droog bos.'],
'Stripe-headed sparrow':['Stripe-headed sparrow','Vogels','d','Groepjes op de grond in droog bos.'],
'Blue-black grassquit':['Blue-black grassquit','Vogels','d','Mannetje springt zingend op vanaf een stengel.'],
'Pacific screech-owl':['Pacific screech-owl','Vogels','n','Kleine uil van droog bos; gidsen kennen roestplekken.'],
'Ferruginous pygmy-owl':['Roestbruine dwerguil','Vogels','d','Ook overdag actief; ritmisch fluiten.'],
'Lesser ground-cuckoo':['Lesser ground-cuckoo','Vogels','d','Zeldzaam en schuw; loopt over de bosbodem.'],
'Thicket tinamou':['Thicket tinamou','Vogels','s','Vooral gehoord: fluitende roep in de schemer.'],
'Yellow-naped parrot':['Geelnekamazone','Vogels','o','Bedreigd; zeldzaam maar mogelijk in Guanacaste.'],
'Crested bobwhite':['Kuifkwartel','Vogels','o','Groepjes langs bosranden en weides.'],
/* Monteverde */
'Prong-billed barbet':['Prong-billed barbet','Vogels','d','Nevelwoud-specialiteit; duetten als een toeter.'],
'Slate-throated redstart':['Slate-throated redstart','Vogels','d','Waaiert met zijn staart in het onderhout.'],
'Common chlorospingus':['Common chlorospingus','Vogels','d','Een van de algemeenste vogels van het nevelwoud.'],
'Ruddy treerunner':['Ruddy treerunner','Vogels','d','Klimt als een boomkruiper langs mossige takken.'],
'Spotted barbtail':['Spotted barbtail','Vogels','d','Klein en gespikkeld; mossige stammen.'],
'Gray-breasted wood-wren':['Gray-breasted wood-wren','Vogels','d','Vooral gehoord: heldere fluittonen in het onderhout.'],
'Three-striped warbler':['Three-striped warbler','Vogels','d','Groepjes laag in het nevelwoud.'],
'Stripe-tailed hummingbird':['Stripe-tailed hummingbird','Vogels','d','Kolibrie van het nevelwoud.'],
'Green-crowned brilliant':['Groenkruinbriljantkolibrie','Vogels','d','Grote, glanzend groene kolibrie bij voederplekken.'],
'Magenta-throated woodstar':['Magenta-throated woodstar','Vogels','d','Piepklein; zweeft als een hommel.'],
'Lesser violetear':['Kleine violetoorkolibrie','Vogels','d','Algemeen in de hooglanden; violette oorvlek.'],
'Collared trogon':['Halsbandtrogon','Vogels','d','Rood buikje met witte band; middelhoog in het bos.'],
'Azure-hooded jay':['Azure-hooded jay','Vogels','d','Prachtige blauwe gaai; minder algemeen.'],
'Brown-billed scythebill':['Brown-billed scythebill','Vogels','d','Zeldzaam; extreem lange gebogen snavel.'],
'Black-breasted wood-quail':['Black-breasted wood-quail','Vogels','o','Zeldzaam; groepjes op de bosbodem, vooral gehoord.'],
'Highland tinamou':['Highland tinamou','Vogels','s','Vooral gehoord in de schemer.'],
'Mottled owl':['Gevlekte bosuil','Vogels','n','Nachtwandeling: kans op deze middelgrote uil.'],
'Bare-shanked screech-owl':['Bare-shanked screech-owl','Vogels','n','Uiltje van het nevelwoud; zeldzaam te zien.'],
/* San Gerardo hooglanden */
'Flame-throated warbler':['Flame-throated warbler','Vogels','d','Oranje keel; boomtoppen in hoge eikenbossen.'],
'Yellow-thighed brushfinch':['Yellow-thighed brushfinch','Vogels','d','Gele "dijen"; algemeen in bosranden.'],
'Large-footed finch':['Large-footed finch','Vogels','d','Krabt in de strooisellaag als een kip.'],
'Black-capped flycatcher':['Black-capped flycatcher','Vogels','d','Klein; zit op lage takjes langs paden.'],
'Ruddy-capped nightingale-thrush':['Ruddy-capped nightingale-thrush','Vogels','o','Schuw; prachtige zang in de vroege ochtend.'],
'Black-billed nightingale-thrush':['Black-billed nightingale-thrush','Vogels','d','Tam; scharrelt rond lodges.'],
'Mountain thrush':['Bergmerel','Vogels','d','Bruin, algemeen in de hooglanden.'],
'Torrent tyrannulet':['Torrent tyrannulet','Vogels','w','Op stenen in de snelstromende Savegre.'],
'American dipper':['Amerikaanse waterspreeuw','Vogels','w','Duikt in de snelstromende Savegre-rivier.'],
'Gray-tailed mountain-gem':['Gray-tailed mountain-gem','Vogels','d','Hooglandkolibrie met witte keel.'],
'Scintillant hummingbird':['Scintillant hummingbird','Vogels','d','Een van de kleinste vogels van Costa Rica.'],
'Ochraceous pewee':['Ochraceous pewee','Vogels','d','Zeldzaam; zit op een uitkijkpost in eikenbos.'],
'Spotted wood-quail':['Spotted wood-quail','Vogels','o','Zeldzaam; groepjes op de bosbodem.'],
'Buffy-crowned wood-partridge':['Buffy-crowned wood-partridge','Vogels','o','Zeldzaam; soms bij lodges in San Gerardo.'],
'Band-tailed pigeon':['Bandstaartduif','Vogels','d','Groepen in eikenbossen.'],
'Elegant euphonia':['Elegant euphonia','Vogels','d','Blauw kapje; bij maretak en fruit.'],
'Yellow-bellied siskin':['Yellow-bellied siskin','Vogels','d','Zwart-geel sijsje in de hooglanden.'],
'Red-tailed hawk':['Roodstaartbuizerd','Vogels','d','Cirkelt boven open plekken in de bergen.'],
'Dusky nightjar':['Dusky nightjar','Vogels','n','Zeldzaam; nachtzwaluw van de hooglanden.'],
/* Zuidelijk Pacifisch & Osa */
'Orange-collared manakin':['Oranjekraagmanakin','Vogels','o','Mannetjes knallen met hun vleugels in het onderhout.'],
'Blue-crowned manakin':['Blauwkruinmanakin','Vogels','o','Klein, zwart met blauwe kruin.'],
'Riverside wren':['Riverside wren','Vogels','d','Luide zang langs beken in het zuidwesten.'],
'Bright-rumped attila':['Bright-rumped attila','Vogels','d','Vooral gehoord: luide, oplopende roep.'],
'Charming hummingbird':['Charming hummingbird','Vogels','d','Kolibrie van het zuidelijk Pacifisch laagland.'],
'Golden-naped woodpecker':['Golden-naped woodpecker','Vogels','d','Specht met gouden nek; zuidelijk Pacifisch gebied.'],
'Masked tityra':['Maskertityra','Vogels','d','Wit met rood rond het oog; hoog in bomen.'],
'Smooth-billed ani':['Gladsnavelani','Vogels','d','Zwarte groepjes in weides in het zuiden.'],
'White-crowned parrot':['Witkruinpapegaai','Vogels','o','Groepjes vliegen luid over.'],
'Orange-chinned parakeet':['Oranjekinparkiet','Vogels','d','Kleine groene parkiet; groepjes in bomen.'],
'Brown-hooded parrot':['Bruinkappapegaai','Vogels','d','Kleine papegaai van het laaglandbos.'],
'Black-throated trogon':['Zwartkeeltrogon','Vogels','d','Geel buikje; middelhoog in het bos.'],
'White-crested coquette':['White-crested coquette','Vogels','d','Zeldzaam; minikolibrie bij bloeiende bomen.'],
'Long-billed starthroat':['Langsnavelsterkeel','Vogels','d','Kolibrie met lange rechte snavel.'],
'Purple-crowned fairy':['Purple-crowned fairy','Vogels','d','Wit van onder, elegant; laaglandbos.'],
'Bicolored antbird':['Bicolored antbird','Vogels','d','Volgt zwermen legermieren met de gids.'],
'Rufous piha':['Rufous piha','Vogels','d','Vooral gehoord in primair bos.'],
'Marbled wood-quail':['Marbled wood-quail','Vogels','o','Zeldzaam; groepjes op de bosbodem van Corcovado.'],
'Great tinamou':['Grote tinamoe','Vogels','s','Vooral gehoord: diepe fluittonen in de schemer.'],
'Crane hawk':['Kraanhavik','Vogels','d','Zeldzaam; lange rode poten, zoekt in holtes.'],
/* Centraal Pacifisch & Tárcoles */
'Laughing gull':['Lachmeeuw','Vogels','w','Wintergast langs de kust.'],
'Sanderling':['Drieteenstrandloper','Vogels','w','Rent heen en weer met de golven.'],
'Semipalmated plover':['Amerikaanse bontbekplevier','Vogels','w','Wintergast op stranden en wadplaten.'],
'Willet':['Willet','Vogels','w','Grote steltloper op stranden en riviermondingen.'],
'Wilson\'s plover':['Wilsons plevier','Vogels','w','Stranden en riviermondingen.'],
'Black-necked stilt':['Amerikaanse steltkluut','Vogels','w','Lange rode poten; ondiep water bij Tárcoles.'],
'Collared plover':['Halsbandplevier','Vogels','w','Klein; op zandbanken in rivieren.'],
'Double-striped thick-knee':['Double-striped thick-knee','Vogels','s','Zeldzaam; open droog land rond Tárcoles, actief in de schemer.'],
'Panama flycatcher':['Panama flycatcher','Vogels','d','Mangrovespecialiteit.'],
'Mangrove vireo':['Mangrove vireo','Vogels','d','Klein; mangroven langs de Pacifische kust.'],
'Painted bunting':['Purpergors','Vogels','d','Zeldzame wintergast; bontgekleurd mannetje.']
});
Object.assign(V49_SEASON,{'Blue-winged teal':'Wintergast okt–apr','Laughing gull':'Wintergast okt–apr','Sanderling':'Wintergast okt–apr','Semipalmated plover':'Wintergast okt–apr','Willet':'Wintergast okt–apr','Painted bunting':'Wintergast okt–apr','Red-tailed hawk':'Ook trekkers uit Noord-Amerika okt–apr'});
const V50_ADD={
'Cahuita':[['Chestnut-headed oropendola',3],['Black-cheeked woodpecker',3],['Crimson-collared tanager',2],['Red-lored parrot',3],['Mealy parrot',2],['Olive-throated parakeet',3],['White-collared manakin',3],['Bananaquit',3],['Buff-throated saltator',3],['Long-billed hermit',3],['Crowned woodnymph',2],['Black-cowled oriole',2],['Gray hawk',3],['Bat falcon',2],['Rufous-tailed jacamar',2],['Pale-billed woodpecker',2],['Little blue heron',3],['Green heron',3],['Great potoo',1],['White hawk',1],['Snowy cotinga',1]],
'Tortuguero':[['Little blue heron',4],['Snowy egret',3],['Tricolored heron',3],['Green heron',3],['Gray-cowled wood-rail',2],['Slaty-tailed trogon',2],['Rufous-tailed jacamar',2],['White-necked puffbird',1],['Great potoo',1],['Chestnut-headed oropendola',3],['Red-lored parrot',3],['Mealy parrot',2],['Black-cheeked woodpecker',3],['Bat falcon',2],['Snowy cotinga',1],['Pale-billed woodpecker',2],['Lineated woodpecker',2]],
'La Fortuna':[['Black-bellied whistling-duck',4],['Muscovy duck',2],['Blue-winged teal',3],['Least grebe',2],['White ibis',3],['Little blue heron',3],['Green heron',3],['Pinnated bittern',1],['Nicaraguan seed-finch',1],['Green-breasted mango',2],['Black-crowned tityra',2],['Emerald tanager',2],['Silver-throated tanager',3],['Bay-headed tanager',2],['Speckled tanager',2],['Snowcap',1],['Black-crested coquette',1],['Bare-necked umbrellabird',1],['Keel-billed motmot',1],['Broad-billed motmot',2],['Rufous motmot',2],['Crested guan',2],['Collared aracari',3],['Gray hawk',3]],
'Rincón de la Vieja':[['Inca dove',4],['White-winged dove',4],['Groove-billed ani',4],['Streak-backed oriole',3],['Banded wren',3],['Stripe-headed sparrow',3],['Blue-black grassquit',3],['Pacific screech-owl',1],['Ferruginous pygmy-owl',2],['Lesser ground-cuckoo',1],['Thicket tinamou',2],['Yellow-naped parrot',1],['Crested bobwhite',2],['Long-tailed manakin',2],['Lesson\'s motmot',2],['Gray hawk',3],['Lineated woodpecker',2]],
'Monteverde':[['Prong-billed barbet',3],['Slate-throated redstart',3],['Common chlorospingus',4],['Silver-throated tanager',3],['Ruddy treerunner',3],['Spotted barbtail',2],['Gray-breasted wood-wren',4],['Three-striped warbler',3],['Stripe-tailed hummingbird',3],['Green-crowned brilliant',3],['Magenta-throated woodstar',2],['Lesser violetear',3],['Collared trogon',2],['Azure-hooded jay',2],['Brown-billed scythebill',1],['Black-breasted wood-quail',1],['Highland tinamou',1],['Mottled owl',1],['Bare-shanked screech-owl',1],['Keel-billed toucan',2],['Ornate hawk-eagle',1],['Golden-browed chlorophonia',2]],
'San Gerardo de Dota':[['Flame-throated warbler',3],['Yellow-thighed brushfinch',3],['Large-footed finch',2],['Black-capped flycatcher',3],['Ruddy-capped nightingale-thrush',2],['Black-billed nightingale-thrush',3],['Mountain thrush',3],['Torrent tyrannulet',3],['American dipper',2],['Gray-tailed mountain-gem',3],['Scintillant hummingbird',2],['Lesser violetear',3],['Ochraceous pewee',1],['Spotted wood-quail',1],['Buffy-crowned wood-partridge',1],['Band-tailed pigeon',3],['Golden-browed chlorophonia',2],['Elegant euphonia',2],['Yellow-bellied siskin',2],['Red-tailed hawk',2],['Dusky nightjar',1],['Collared trogon',2],['Northern emerald-toucanet',2]],
'Uvita':[['Orange-collared manakin',3],['Riverside wren',3],['Bright-rumped attila',2],['Charming hummingbird',2],['Golden-naped woodpecker',3],['Masked tityra',3],['Smooth-billed ani',3],['White-crowned parrot',3],['Orange-chinned parakeet',3],['Mealy parrot',2],['Gray hawk',3],['Bat falcon',2],['Long-billed hermit',2],['Bananaquit',3],['Buff-throated saltator',3],['Laughing gull',3]],
'Corcovado':[['Rufous-tailed jacamar',3],['Golden-naped woodpecker',3],['Black-throated trogon',3],['Slaty-tailed trogon',3],['Blue-crowned manakin',3],['Orange-collared manakin',3],['White-crested coquette',1],['Long-billed starthroat',2],['Purple-crowned fairy',2],['Bicolored antbird',2],['Rufous piha',2],['Red-lored parrot',3],['Mealy parrot',3],['White-crowned parrot',3],['Brown-hooded parrot',2],['Marbled wood-quail',1],['Great tinamou',2],['Crane hawk',1],['White hawk',2],['Riverside wren',3],['Masked tityra',2],['Bat falcon',2],['Long-billed hermit',3],['Brown booby',3],['Brown pelican',4],['Magnificent frigatebird',4]],
'Esterillos':[['Laughing gull',3],['Sanderling',3],['Semipalmated plover',3],['Willet',3],['Wilson\'s plover',2],['Groove-billed ani',3],['Smooth-billed ani',2],['Scarlet macaw',2],['Orange-chinned parakeet',3],['Gray hawk',3]],
'Manuel Antonio':[['Lesson\'s motmot',2],['Riverside wren',3],['Orange-collared manakin',2],['Golden-naped woodpecker',2],['Gray-headed chachalaca',3],['Masked tityra',2],['Orange-chinned parakeet',3],['Laughing gull',3],['Bananaquit',3],['Yellow-headed caracara',3]],
'Tárcoles':[['Black-necked stilt',3],['White ibis',3],['Collared plover',2],['Double-striped thick-knee',1],['Panama flycatcher',2],['Mangrove vireo',2],['Turquoise-browed motmot',2],['Painted bunting',1],['Willet',3],['Laughing gull',3],['Snowy egret',3],['Little blue heron',3],['Bare-throated tiger heron',3],['Groove-billed ani',3]],
'San José':[['Inca dove',3],['White-winged dove',3],['Blue-gray tanager',4],['Lesser violetear',2]]
};
for(const [r,list] of Object.entries(V50_ADD)){V47_PLACES[r]??=[];for(const [n,c] of list)if(V47_SP[n]&&!V47_PLACES[r].some(x=>x[0]===n))V47_PLACES[r].push([n,c])}
(function(){for(const k of Object.keys(V43_TARGETS))delete V43_TARGETS[k];for(const [region,list] of Object.entries(V47_PLACES)){const g={};list.forEach(([n])=>{(g[v47Info(n).cat]??=[]).push(n)});V43_TARGETS[region]=g}})();

/* vogelgroepen */
const V50_GROUPS=[
 ['Kolibries',/hummingbird|hermit|sabrewing|coppery-headed|mountain-gem|brilliant|woodstar|violetear|coquette|starthroat|fairy|mango|woodnymph|snowcap/i],
 ['Toekans & papegaaien',/toucan|aracari|toucanet|macaw|parrot|parakeet|amazon/i],
 ['Trogons, motmots & ijsvogels',/trogon|quetzal|motmot|kingfisher|jacamar|puffbird|barbet/i],
 ['Roofvogels & uilen',/hawk|kite|vulture|caracara|falcon|osprey|eagle|owl|potoo|nightjar/i],
 ['Reigers & watervogels',/heron|egret|ibis|stork|spoonbill|jabiru|anhinga|cormorant|jacana|gallinule|limpkin|sungrebe|duck|teal|grebe|bittern|rail|sunbittern|dipper|tyrannulet/i],
 ['Kust & zee',/pelican|frigatebird|booby|tern|gull|sandpiper|whimbrel|willet|plover|sanderling|stilt|thick-knee/i],
 ['Tangares & zangvogels',/tanager|warbler|honeycreeper|euphonia|chlorophonia|saltator|bananaquit|redstart|oriole|grackle|chlorospingus|finch|siskin|grassquit|sparrow|bunting|oropendola|thrush|wren|solitaire|manakin|cotinga|jay|flycatcher|kingbird|kiskadee|vireo|swallow|tityra|attila|piha|antbird|antshrike|ant-tanager|umbrellabird|treerunner|barbtail|scythebill|silky|bellbird|pewee|kiskadee/i]
];
function v50Group(name){if(v47Info(name).cat!=='Vogels')return '';for(const [g,re] of V50_GROUPS)if(re.test(name))return g;return 'Overige bosvogels'}
let v50BirdGroup='Alle',v50Query='';

/* kaart krijgt zoek- en groepsdata */
const v50PrevCard=v47Card;
v47Card=function(name,region,focus){const i=v47Info(name);return v50PrevCard(name,region,focus).replace('<div class="v43-species v47-sp',`<div data-search="${esc((i.nl+' '+i.en).toLowerCase())}" data-group="${esc(v50Group(name))}" class="v43-species v47-sp`)};

/* zoekveld + vogelgroep-chips in de dag-wildlife */
const v50PrevSL=speciesList;
speciesList=function(d){let h=v50PrevSL(d);
  const {base,extras}=v47RegionNames(d),focus=(V47_FOCUS[d.id]||{}).list||[],all=[...new Set([...focus,...base,...extras])];
  const groups=['Alle',...new Set(all.map(v50Group).filter(Boolean))];
  const search=`<div class="v50-search">${v50I('list',16).replace(V50_I.list,'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>')}<input id="v50q" type="search" placeholder="Zoek soort (NL of Engels)" value="${esc(v50Query)}" autocomplete="off"></div>`;
  const chips=v47Filter==='Vogels'?`<div class="v47-filter v50-groups">${groups.map(g=>`<button data-v50-group="${esc(g)}" class="${v50BirdGroup===g?'on':''}">${esc(g)}</button>`).join('')}</div>`:'';
  return h.replace(/(<div class="v47-filter">[\s\S]*?<\/div>)/,`${search}$1${chips}`)};
function v50ApplyFilter(){
  const q=v50Query.trim().toLowerCase();
  document.querySelectorAll('.v47-sp').forEach(c=>{const okQ=!q||c.dataset.search.includes(q),okG=v47Filter!=='Vogels'||v50BirdGroup==='Alle'||c.dataset.group===v50BirdGroup;c.style.display=okQ&&okG?'':'none'});
  document.querySelectorAll('.v47-cat-h').forEach(h=>{let n=h.nextElementSibling,any=false;while(n&&!n.classList.contains('v47-cat-h')){if(n.classList.contains('v47-sp')&&n.style.display!=='none')any=true;n=n.nextElementSibling}h.style.display=any?'':'none'});
  document.querySelectorAll('.v47-focus').forEach(c=>{c.style.display=[...c.querySelectorAll('.v47-sp')].some(x=>x.style.display!=='none')?'':'none'});
}
const v50PrevBind2=bindExtras;
bindExtras=function(){v50PrevBind2();
  const q=document.getElementById('v50q');if(q){q.oninput=()=>{v50Query=q.value;v50ApplyFilter()};}
  document.querySelectorAll('[data-v50-group]').forEach(b=>b.onclick=()=>{v50BirdGroup=b.dataset.v50Group;render()});
  document.querySelectorAll('[data-v47-filter]').forEach(b=>{const f=b.onclick;b.onclick=()=>{v50BirdGroup='Alle';f&&f()}});
  if(document.querySelector('.v47-sp'))v50ApplyFilter();
  const g=document.getElementById('v50gq');if(g)g.oninput=()=>v50GlobalSearch(g.value);
};

/* reisbreed zoeken op het Wildlife-scherm */
function v50WhereList(name){return Object.entries(V47_PLACES).map(([r,l])=>{const x=l.find(y=>y[0]===name);return x?[r,x[1]]:null}).filter(Boolean).sort((a,b)=>b[1]-a[1])}
function v50GlobalSearch(v){const box=document.getElementById('v50gres');if(!box)return;const q=v.trim().toLowerCase();if(q.length<2){box.innerHTML='<p class="hint">Typ minimaal 2 letters, bijvoorbeeld "quetzal", "luiaard" of "kolibrie".</p>';return}
  const hits=Object.keys(V47_SP).filter(n=>{const i=v47Info(n);return (i.nl+' '+i.en+' '+i.cat+' '+v50Group(n)).toLowerCase().includes(q)}).slice(0,40);
  box.innerHTML=hits.length?hits.map(n=>{const i=v47Info(n),w=v50WhereList(n);return `<div class="v50-gres"><b>${esc(i.nl)}</b>${i.nl!==i.en?`<em>${esc(i.en)}</em>`:''}<small>${esc(i.cat)}${v50Group(n)?' · '+esc(v50Group(n)):''}</small><div>${w.map(([r,c])=>`<span class="v47-chance ${V47_CHANCE[c][1]}">${esc(r)}</span>`).join('')||'<span class="hint">alleen als dagfocus</span>'}</div></div>`}).join(''):'<p class="hint">Geen soort gevonden.</p>'}
const v50PrevRW=renderWildlife;
renderWildlife=function(){const total=Object.keys(V47_SP).length,birds=Object.values(V47_SP).filter(x=>x[1]==='Vogels').length;
  return `<div class="card"><div class="v46-h">${v47Svg(V47_CAT_ICON.Vogels,20)}Zoek in alle ${total} soorten</div><p class="hint" style="margin:0 0 8px">${birds} vogels, plus zoogdieren, reptielen, amfibieën en zeeleven. Kleur = kans per gebied.</p><div class="v50-search"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="v50gq" type="search" placeholder="Bijv. quetzal, luiaard, kolibrie" autocomplete="off"></div><div id="v50gres"><p class="hint">Typ minimaal 2 letters, bijvoorbeeld "quetzal", "luiaard" of "kolibrie".</p></div></div>`+v50PrevRW().replace(/<div class="card"><h2>[^<]*Reisbrede wildlife-teller<\/h2>[\s\S]*?<\/p><\/div>/,'')};

render();
