/* ================= v5.3 – hotels: één per plek (Sawadee-lijst leidend), foto's i.p.v. iconen ================= */
/* CENTRALE HOTELLIJST — hier de definitieve Sawadee-lijst invullen vlak voor vertrek */
const V53_HOTELS={
 'San José':'Fleur de Lys',
 'Cahuita':'Atlantida Lodge',
 'Tortuguero':'Lapa Verde Lodge',
 'La Fortuna':'Catarata Ecolodge',
 'Rincón de la Vieja':'Cañon de la Vieja Lodge',
 'Monteverde':'Hotel Los Cipreses',
 'San Gerardo de Dota':'Sueños del Bosque',
 'Vergel de Punta Mala / Uvita':'Rio Tico Safari Lodge',
 'Corcovado':'Cabinas Las Palmeras',
 'Esterillos':'Hotel Playa Bejuco'
};
const V53_DEFINITIEF=true; /* v8.0: hotels gelden als vast; wijzigt Sawadee iets, dan passen we de lijst aan */
(function(){
  H.forEach(e=>{const pick=V53_HOTELS[e[0]];if(pick)e[1]=[pick]});
  S.forEach(d=>{if(!d.hotel.length)return;const k=V53_REGION_OF(d);if(V53_HOTELS[k])d.hotel=[V53_HOTELS[k]]});
})();
function V53_REGION_OF(d){const p=d.place.toLowerCase();if(p.includes('vergel')||p.includes('uvita'))return 'Vergel de Punta Mala / Uvita';if(p.includes('corcovado'))return 'Corcovado';if(p.includes('manuel'))return 'Esterillos';for(const k of Object.keys(V53_HOTELS))if(p.includes(k.toLowerCase()))return k;return v43place(d.place)}
const V53_STATUS=()=>V53_DEFINITIEF?'Accommodatie volgens Sawadee':'Voorlopig: eerste hotel van de Sawadee-lijst · definitief volgt vlak voor vertrek';

/* hotelkaart: label */
const v53PrevHotelCard=v48HotelCard;
v48HotelCard=function(h,d,n){return v53PrevHotelCard(h,d,1).replace(/<small>(Standaard voor 2 personen|Alleen voor singlereizigers|Een van de Sawadee-opties|Sawadee-accommodatie)<\/small>/,`<small>${V53_STATUS()}</small>`)};
function v48HotelsBlock(d){return d.hotel.length?d.hotel.map(h=>v48HotelCard(h,d,1)).join(''):'<p class="hint">Geen overnachting gepland.</p>'}

/* tijdlijn met foto's */
v50Timeline=function(d){
  const order={Ochtend:0,Middag:2,Avond:3};
  const acts=d.activities.map((a,i)=>({a,i})).filter(x=>x.a.status!=='excluded').sort((x,y)=>(order[V50_SLOT[x.a.title]]??1)-(order[V50_SLOT[y.a.title]]??1)||x.i-y.i);
  return acts.map(({a,i})=>{const k=v50Kind(a),info=V48_ACT[a.title]||{},slot=V50_SLOT[a.title],src=v48Photo(v48ActKey(a,d));
    const sub=[info.dur,info.price].filter(Boolean).join(' · ')||a.note||'';
    return `<div class="v50-tl v53-tl" data-activity="${i}" data-day="${d.id}" role="button" tabindex="0">
      <div class="v53-tl-img ${V50_KIND[k][1]}">${src?`<img src="${src}" alt="" loading="lazy">`:v46Icon(v46IconKey(a.title),18)}</div>
      <div class="v50-tl-body">${slot?`<small>${slot}</small>`:''}<b>${esc(a.title)}</b>${sub?`<span>${esc(sub)}</span>`:''}</div>
      <span class="v50-pill ${V50_KIND[k][1]}">${V50_KIND[k][0]}</span></div>`}).join('')||'<p class="hint">Geen activiteiten op deze dag.</p>'};

/* dag-tab Hotel: tekst */
const v53PrevDC=dayContent;
dayContent=function(d){let h=v53PrevDC(d);if(daySection==='stay')h=h.replace(/<p class="hint" style="padding:0 4px">[^<]*<\/p>/,`<p class="hint" style="padding:0 4px">${V53_STATUS()}.</p>`);return h};

/* Hotels-scherm met fotokaarten */
renderHotels=function(){
  const rows=H.map(([region,list])=>{const days=S.filter(d=>d.hotel.includes(list[0])).map(d=>d.id),d0=S[(days[0]||1)-1];if(!list[0])return '';
    return `<div class="v53-hrow"><div class="v53-hdays">Dag ${days.every((x,i)=>!i||x===days[i-1]+1)&&days.length>1?days[0]+'–'+days[days.length-1]:days.join(' en ')} · ${days.length} ${days.length===1?'nacht':'nachten'} · ${esc(region)}</div>${v48HotelCard(list[0],d0,1)}</div>`}).join('');
  return `<div class="card"><div class="v50-h">Accommodaties</div><p class="hint" style="margin:0">${V53_STATUS()}. Foto's zijn sfeerbeelden van een vergelijkbare plek, niet van het hotel zelf.</p></div><div class="v50-hotels v53-hlist">${rows}</div>`};
Object.assign(V48_PHOTO,{"act-cacao": {"title": "File:Cacao fruit in Côte d'Ivoire (11).JPG", "credit": "Hanay", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Cacao_fruit_in_C%C3%B4te_d%27Ivoire_(11).JPG", "sfeer": true}, "act-oropendola": {"title": "File:Waterfall.Llanos de Cortes. Cañas. Costa Rica.JPG", "credit": "Rodtico21", "license": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:Waterfall.Llanos_de_Cortes._Ca%C3%B1as._Costa_Rica.JPG", "sfeer": true}, "act-coyotes": {"title": "File:Rio Celeste Costa Rica 01.jpg", "credit": "Julián Monge-Nájera", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Rio_Celeste_Costa_Rica_01.jpg", "sfeer": true}, "act-tattoo": {"title": "File:Italian-tattoo-artist-at-work.jpg", "credit": "Technopop.tattoo", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Italian-tattoo-artist-at-work.jpg", "sfeer": true}});
Object.assign(V48_ACT_PHOTO,{"Bri Bri-gemeenschap, cacao en traditionele lunch": "act-cacao", "Oropéndola-waterval": "act-oropendola", "Poza Los Coyotes": "act-coyotes", "Tatoeage in Monteverde": "act-tattoo"});
['act-coffee','act-coconut','act-guanacaste','act-horse','act-jungle-frog','act-nightwalk','act-sjo'].forEach(k=>{if(V48_PHOTO[k])V48_PHOTO[k].sfeer=true});
const v53PrevOpen=openActivity;
openActivity=function(day,idx){v53PrevOpen(day,idx);const d=S[day-1],a=d.activities[idx],k=v48ActKey(a,d),cap=document.querySelector('#detailOverlay figcaption');if(cap&&V48_PHOTO[k]?.sfeer)cap.textContent='Sfeerbeeld · '+cap.textContent};

render();
