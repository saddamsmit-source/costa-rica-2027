/* v4.6 – Dagoverzicht met activiteiten + hotel, iconen per activiteitstype */
const V46_SVG=p=>`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const V46_ICONS={
  plane:'<path d="M2 16l20-6-2-2-7 2-5-6H6l3 7-5 1-2-2H1l1 6z"/><path d="M3 21h18"/>',
  landing:'<path d="M2 13l18 5 1.5-2.5L15 13 13 5h-2l.5 7L6 11 4.5 8H3l-1 5z"/><path d="M3 21h18"/>',
  bus:'<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 3v8M16 3v8"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/><path d="M6 18v3M18 18v3"/>',
  boat:'<path d="M3 15h18l-2.5 4.5a2 2 0 0 1-1.8 1H7.3a2 2 0 0 1-1.8-1Z"/><path d="M6 15V9h12v6M9 9V5h6v4"/><path d="M2 22c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1"/>',
  canoe:'<path d="M2 14c3 3 17 3 20 0"/><path d="M5 15.5c4 1 10 1 14 0"/><path d="M14 4l-6 15"/><path d="M14.5 2.5l1.5.6-1 2.6-1.5-.6z"/><path d="M2 20c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1"/>',
  hike:'<circle cx="13" cy="4" r="2"/><path d="M11 22l2-7 3 3v4"/><path d="M8 11l3-4 4 3 3 1"/><path d="M11 7l-2 7"/><path d="M19 9v13"/>',
  binoculars:'<circle cx="6.5" cy="15.5" r="4"/><circle cx="17.5" cy="15.5" r="4"/><path d="M10.5 15.5h3"/><path d="M4 12l2-7h3l1 7M20 12l-2-7h-3l-1 7"/>',
  bird:'<path d="M16 7h.01"/><path d="M3.5 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.5-2L2 20"/><path d="M20 7l2 .5-2 .5"/><path d="M10 18v3M14 17.5V21"/>',
  night:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/><path d="M17 3v2M16 4h2M20.5 7.5v1.5M19.75 8.25h1.5"/>',
  hotspring:'<path d="M3 17c0 2.2 4 4 9 4s9-1.8 9-4"/><path d="M3 17c0-2.2 4-4 9-4s9 1.8 9 4"/><path d="M8 3c-1 1.5 1 2.5 0 4.5M12 2c-1 1.5 1 3 0 5M16 3c-1 1.5 1 2.5 0 4.5"/>',
  waterfall:'<path d="M3 4h7v4M21 4h-7v4"/><path d="M10 8v10M12 8v12M14 8v10"/><path d="M4 20c2 0 3-2 5-2M20 20c-2 0-3-2-5-2"/><path d="M3 22h18"/>',
  volcano:'<path d="M2 21l6-11h8l6 11z"/><path d="M8 10l2 3 2-2 2 2 2-3"/><path d="M10 6c0-2 1-3 2-3s2 1 2 3M12 3V1"/>',
  bridge:'<path d="M2 8c5 6 15 6 20 0"/><path d="M2 8v8M22 8v8"/><path d="M6 11.5V16M10 13v3M14 13v3M18 11.5V16"/><path d="M2 16h20"/>',
  zipline:'<path d="M2 4l20 6"/><path d="M13 7l-1 4"/><circle cx="11.5" cy="13" r="1.6"/><path d="M11.5 14.6v4l-2.5 3M11.5 18.6l2.5 2.4M9 16l2.5-.5 2.5 1"/>',
  coffee:'<path d="M4 10h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 3c-.8 1.2.8 2 0 3.5M12 3c-.8 1.2.8 2 0 3.5"/><path d="M3 22h15"/>',
  cacao:'<path d="M12 2c4 2 6 6 6 10s-2 8-6 10c-4-2-6-6-6-10s2-8 6-10z"/><path d="M12 2v20M8.5 6.5c1.5 1 5.5 1 7 0M7 12h10M8.5 17.5c1.5-1 5.5-1 7 0"/>',
  town:'<path d="M3 21V10l5-4 5 4v11"/><path d="M13 21V13h8v8"/><path d="M7 21v-5h2v5M16 16h2M8 11h.01"/><path d="M2 21h20"/>',
  whale:'<path d="M3 13c0 4 4 6 9 6 6 0 9-4 9-8 0-1-.5-2-1.5-2.5L22 6l-3 .5C18 5 16 5 15 6l-1 2c-2-1-5-1-7 0-2 1-4 3-4 5z"/><path d="M7 14h.01"/><path d="M4 22c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1"/>',
  palm:'<path d="M13 8c0 5 .5 9 2 14"/><path d="M13 8C9 5 5 6 3 9c3-1 6-1 10-1z"/><path d="M13 8c4-3 8-2 9 1-3-1-6-1-9-1z"/><path d="M13 8c-1-4-4-6-7-6 2 2 4 4 7 6z"/><path d="M13 8c2-4 5-5 7-4-2 1-4 2-7 4z"/><circle cx="11" cy="10.5" r="1"/><path d="M9 22h10"/>',
  snorkel:'<rect x="2" y="8" width="15" height="8" rx="3"/><path d="M9.5 8v8"/><path d="M20 3v11a4 4 0 0 1-4 4h-1"/><path d="M2 20c2 0 2-1 4-1s2 1 4 1"/>',
  sunset:'<path d="M5 16a7 7 0 0 1 14 0"/><path d="M12 3v3M4.2 8.2l1.4 1.4M19.8 8.2l-1.4 1.4M1 16h2M21 16h2"/><path d="M2 20h20M6 23h12"/>',
  camera:'<path d="M3 8a2 2 0 0 1 2-2h2.5l1.5-2h6l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="4"/>',
  crocodile:'<path d="M2 13h10l2-2h6l2 2-2 1h-4l-1 2H8l-2-2H2z"/><path d="M15.5 11.5h.01"/><path d="M5 13l1-1.5L7 13l1-1.5L9 13"/><path d="M2 19c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1"/>',
  forest:'<path d="M8 3l5 8H3z"/><path d="M8 8l6 9H2z"/><path d="M8 17v4"/><path d="M17 6l4 7h-8z"/><path d="M17 13v8"/><path d="M2 21h20"/>',
  horse:'<path d="M5 21l1-6c-1-1-2-3-1-5l3-3V3l2 2 4 1c3 1 5 3 5 6v1l-2 1-2-2-3 1 1 4 1 4"/><path d="M11 9h.01"/>',
  swim:'<circle cx="16" cy="6" r="2"/><path d="M3 14l5-4 3 2 4-3"/><path d="M2 18c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1"/>',
  tattoo:'<path d="M14 3l7 7"/><path d="M17.5 6.5l-9 9-3 1 1-3 9-9"/><path d="M5.5 16.5L2 22"/><path d="M15 12l2 2"/>',
  bed:'<path d="M3 20V8M3 14h18v6M21 20v-8a3 3 0 0 0-3-3H9v5M7 9V6h5a3 3 0 0 1 3 3"/>',
  pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>'
};
/* volgorde telt: meest specifieke term eerst */
const V46_RULES=[
  [/terugvlucht|vlucht/i,'plane'],[/aankomst amsterdam/i,'landing'],[/aankomst en transfer/i,'plane'],
  [/krokodil|tárcoles|tarcoles/i,'crocodile'],[/whale|walvis/i,'whale'],[/snorkel|isla del caño/i,'snorkel'],
  [/wildlife kijken/i,'binoculars'],[/kano|canoe/i,'canoe'],[/caño negro|boottocht|boot|boat/i,'boat'],
  [/quetzal|birding|vogel/i,'bird'],[/nachtwandeling|night walk/i,'night'],
  [/thermale|bronnen|hot spring/i,'hotspring'],[/waterval|waterfall/i,'waterfall'],
  [/pailas|vulkan|volcano/i,'volcano'],[/sky walk|hangbrug/i,'bridge'],[/canopy|zipline/i,'zipline'],
  [/koffie|coffee/i,'coffee'],[/cacao|bri bri/i,'cacao'],[/kokos/i,'palm'],[/tatoe/i,'tattoo'],
  [/paard/i,'horse'],[/poza|zwem/i,'swim'],[/zonsondergang|strandwandeling/i,'sunset'],
  [/fotografie/i,'camera'],[/wildlife/i,'binoculars'],[/natuurgids|corcovado|manuel antonio|np\b|national park/i,'forest'],
  [/wandeling|wandel/i,'hike'],[/puerto viejo|santa elena|verkennen|bezoeken/i,'town'],
  [/transfer/i,'bus']
];
function v46IconKey(title){for(const [re,k] of V46_RULES)if(re.test(title))return k;return 'pin'}
function v46Icon(key,size){return V46_SVG(V46_ICONS[key]||V46_ICONS.pin).replace('width="24" height="24"',`width="${size||24}" height="${size||24}"`)}

visualActivity=function(a){
  const day=S.find(d=>d.activities.includes(a))||S[currentDay-1];
  const idx=day.activities.indexOf(a),group=statusGroup(a);
  return `<div class="v46-act ${group} ${a.status==='excluded'?'excluded':''}" role="button" tabindex="0" data-activity="${idx}" data-day="${day.id}">
    <div class="v46-ico">${v46Icon(v46IconKey(a.title),28)}</div>
    <div class="v46-copy"><div class="actname">${esc(a.title)}</div>
      <div class="acttags">${pill(sourceName[a.source],a.source)}${pill(statusName[a.status],a.status)}</div>
      ${a.note?`<div class="note">${esc(a.note)}</div>`:''}</div>
    <span class="v46-chev" aria-hidden="true">›</span></div>`};

function v46SpeciesCount(d){try{return new Set(v43Rows(d).flatMap(g=>g.names.map(v43name))).size}catch(e){return d.wildlife.length}}

const v46PrevDayContent=dayContent;
dayContent=function(d){
  if(daySection!=='overview')return v46PrevDayContent(d);
  const saw=d.activities.filter(a=>statusGroup(a)==='saw'),
        ext=d.activities.filter(a=>statusGroup(a)==='extra'),
        opt=d.activities.filter(a=>statusGroup(a)==='option'),
        locked=d.activities.filter(a=>a.status==='locked').length;
  const grp=(cls,title,list)=>list.length?`<div class="v46-group ${cls}"><h4><i></i>${title}</h4>${list.map(visualActivity).join('')}</div>`:'';
  const hotelIco=v46Icon('bed',22);
  return `
  <div class="card">
    <div class="v46-base">${v46Icon(v46IconKey(d.base),20)}<div>${esc(d.base)}</div></div>
    <div class="v46-stats">
      <div class="v46-stat"><b>${d.activities.filter(a=>a.status!=='excluded').length}</b><span>activiteiten</span></div>
      <div class="v46-stat"><b>${locked}</b><span>vastgezet</span></div>
      <div class="v46-stat"><b>${d.hotel.length}</b><span>hotelopties</span></div>
      <div class="v46-stat"><b>${v46SpeciesCount(d)}</b><span>doelsoorten</span></div>
    </div>
  </div>
  <div class="card">
    <div class="v46-h">${v46Icon('pin',20)}Activiteiten</div>
    ${grp('saw','Sawadee-programma',saw)}${grp('extra','Onze toevoegingen',ext)}${grp('option','Optioneel / als tijd over',opt)}
    ${d.activities.length?'':'<p class="hint">Geen activiteiten voor deze dag.</p>'}
  </div>
  <div class="card">
    <div class="v46-h">${hotelIco}Accommodatie</div>
    ${v48HotelsBlock(d)}
  </div>
  ${d.tip?`<div class="card"><div class="v46-tip">${v46Icon('camera',20)}<div><b>Tip</b><br>${esc(d.tip)}</div></div></div>`:''}
  ${d.flag?`<div class="warning">⚠️ ${esc(d.flag)}</div>`:''}`;
};
