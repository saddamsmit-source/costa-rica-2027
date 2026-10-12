/* =====================================================================
   v6.1 · Fase C: Activiteiten, Wildlife en Hotel in het design system.
   Functies en opslag blijven gelijk: dezelfde data-attributen voor
   registreren, filters, zoeken, notities en eigen soorten.
   ===================================================================== */

/* ---------- Activiteiten ---------- */
const DS_EFFORT={ /* alleen geverifieerde inspanning */
 'La Fortuna Waterfall':'± 530 treden',
 'Las Pailas natuur- en vulkanische wandeling':'3,5 km lus',
 'Begeleide Corcovado NP-excursie':'4–5 uur wandelen',
 'Cahuita National Park met lokale natuurgids':'pad tot 9 km'
};
const DS_WILD={ /* wat je bij deze activiteit kunt zien */
 'Cahuita National Park met lokale natuurgids':'Luiaards, apen & vogels','Wildlife kijken tijdens boottransfer':'Watervogels & kaaimannen',
 'Vroege kanotocht door smalle kanalen met natuurgids':'Reigers, ijsvogels & kaaimannen','Begeleide regenwoudwandeling':'Apen & kikkers','Nachtwandeling':'Nachtdieren & kikkers',
 'Caño Negro wildlife-boottocht':'Watervogels','Las Pailas natuur- en vulkanische wandeling':'Motmots & neusberen','Korte natuurwandeling bij lodge':'Droogbosvogels',
 'Sky Walk / hangbruggen':'Nevelwoudvogels','Night walk':'Nachtdieren','Curi-Cancha vroege birdingtour met gespecialiseerde gids':'Quetzal & lelklokvogel',
 'Rustige vogelobservatie rond Sueños del Bosque':'Kolibries','Specialistische quetzaltour vroeg in de ochtend':'Quetzal','Rustige natuur- en vogelobservatie rond lodge':'Ara\'s & toekans',
 'Whale watching Marino Ballena':'Bultruggen & dolfijnen','Transfer en boot naar lodge':'Mangrovevogels','Rustige natuurwandeling rond lodge':'Apen, toekans & ara\'s',
 'Begeleide Corcovado NP-excursie':'Tapir, apen & ara\'s','Isla del Caño snorkelexcursie':'Rifvissen & schildpadden','Bezoek Manuel Antonio NP':'Apen & luiaards',
 'Begeleide wildlife-wandeling met natuurgids':'Doodshoofdaapjes & luiaards','Transfer via Tárcoles en krokodillenbrug':'Krokodillen','Tárcoles krokodillenboottocht':'Krokodillen & mangrovevogels'
};
function dsClean(s){return s&&s.replace(/\s*\([^)]*\)/g,'').trim()}
function dsBookPill(a,d,i){const k=v50Kind(a),bk=v48BookOf(a,d,i);
  if(k==='excl')return '<span class="ds-pill neutral">Uitgesloten</span>';
  if(bk==='geboekt')return `<span class="ds-pill ok">${dsI('lock',12)}Geboekt</span>`;
  if(bk==='online')return '<span class="ds-pill warn">Online tickets vooraf</span>';
  if(bk==='zelf')return '<span class="ds-pill warn">Zelf regelen</span>';
  if(bk==='reisbegeleider')return '<span class="ds-pill neutral">Via reisbegeleider</span>';
  return ''}
function dsActCard(a,d){const i=d.activities.indexOf(a),info=V48_ACT[a.title]||{},src=v48Photo(v48ActKey(a,d)),k=v50Kind(a);
  const meta=[info.dur?`<span>${dsI('sun',14).replace(DS_ICON.sun,'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')}${esc(dsClean(info.dur))}</span>`:'',DS_EFFORT[a.title]?`<span>${dsI('route',14)}${esc(DS_EFFORT[a.title])}</span>`:'',DS_WILD[a.title]?`<span>${dsI('binoculars',14)}${esc(DS_WILD[a.title])}</span>`:'',info.price?`<span>${dsI('coin',14)}${esc(dsClean(info.price))}</span>`:''].filter(Boolean).join('');
  return `<button class="ds-act ${k==='excl'?'excl':''}" data-activity="${i}" data-day="${d.id}">
    <span class="ds-act-img">${src?`<img src="${src}" alt="" loading="lazy">`:''}</span>
    <span class="ds-act-body"><b>${esc(a.title)}</b>${a.note?`<span class="ds-act-note">${esc(a.note)}</span>`:''}${meta?`<span class="ds-act-meta">${meta}</span>`:''}${dsBookPill(a,d,i)?`<span class="ds-act-pill">${dsBookPill(a,d,i)}</span>`:''}</span>
    ${dsI('chevR',18)}</button>`}
function dsActivities(d){const by={saw:[],own:[],opt:[],excl:[]};d.activities.forEach(a=>by[v50Kind(a)].push(a));
  const sec=(k,t,ic,cls)=>by[k].length?`<section class="ds-sec ${cls}"><h3>${dsI(ic,18)}<span>${t}</span><em>${by[k].length}</em></h3>${by[k].map(a=>dsActCard(a,d)).join('')}</section>`:'';
  const html=sec('saw','Sawadee-programma','leaf','saw')+sec('own','Onze toevoegingen','star','own')+sec('opt','Optionele activiteiten','plus','opt')+sec('excl','Bewust uitgesloten','info','excl');
  return html||'<div class="ds-card"><p class="ds-meta">Geen activiteiten op deze dag.</p></div>'}

/* ---------- Hotels ---------- */
function dsHotelCard(h,d,nightsLabel){const x=V48_HOTEL[h]||{},m=V49_HOTEL_PHOTO[h],src=m?'./photos/'+m.key+'.jpg':locationPhoto(d),q=encodeURIComponent(h+' '+d.place.split('/')[0].trim()+' Costa Rica');
  return `<article class="ds-hotel">
    <div class="ds-hotel-img" style="background-image:url('${src}')">${m?'<span class="ds-hotel-tag">Sfeerbeeld</span>':''}</div>
    <div class="ds-hotel-body">
      <div class="ds-hotel-top"><h3>${esc(h)}</h3>${V53_DEFINITIEF?'<span class="ds-pill ok">Definitief</span>':'<span class="ds-pill neutral">Voorlopig</span>'}</div>
      ${nightsLabel?`<div class="ds-meta">${nightsLabel}</div>`:''}
      ${x.d?`<p>${esc(x.d)}</p>`:''}
      ${x.f?`<div class="ds-chips">${x.f.map(f=>`<span>${esc(f)}</span>`).join('')}</div>`:''}
      ${x.warn?`<div class="ds-hotel-warn">${dsI('alert',16)}<span>${esc(x.warn)}</span></div>`:''}
      ${m?`<p class="ds-hotel-photo">Foto: ${esc(m.what)}, een vergelijkbare plek.</p>`:''}
      <a class="ds-btn secondary ds-hotel-link" href="https://www.google.com/search?q=${q}" target="_blank" rel="noopener">${dsI('search',18)}Bekijk hotel</a>
    </div></article>`}
function dsNights(h){const days=S.filter(d=>d.hotel.includes(h)).map(d=>d.id);if(!days.length)return '';const run=days.every((x,i)=>!i||x===days[i-1]+1);return `Dag ${run&&days.length>1?days[0]+'–'+days[days.length-1]:days.join(' en ')} · ${days.length} ${days.length===1?'nacht':'nachten'}`}
function dsStay(d){if(!d.hotel.length)return '<div class="ds-card"><p class="ds-meta">Geen overnachting op deze dag.</p></div>';
  return d.hotel.map(h=>dsHotelCard(h,d,dsNights(h))).join('')+`<p class="ds-note">${V53_DEFINITIEF?'Definitief volgens Sawadee.':'Voorlopig: eerste hotel van de Sawadee-lijst. Definitief volgt vlak voor vertrek.'}</p>`}
renderHotels=function(){
  const rows=H.map(([region,list])=>{const h=list[0];if(!h)return '';const d0=S.find(d=>d.hotel.includes(h))||S[0];return `<div class="ds-hrow"><div class="ds-label">${esc(region)}</div>${dsHotelCard(h,d0,dsNights(h))}</div>`}).join('');
  return `<div class="ds-page"><div class="ds-pagehead"><h1 class="ds-title">Accommodaties</h1><p class="ds-meta">${V53_DEFINITIEF?'Definitief volgens Sawadee.':'Voorlopig: eerste hotel van de Sawadee-lijst · definitief volgt vlak voor vertrek.'} Foto's zijn sfeerbeelden.</p></div>${rows}</div>`};

/* ---------- Wildlife: soortrijen ---------- */
const DS_SP_PHOTO={ /* naam → fotobestand (alleen prioriteitssoorten) */
 'Resplendent quetzal':'act-quetzal','Yellow-throated toucan':'act-toucan','Scarlet macaw':'act-macaw','Humpback whale':'act-whale',"Baird's tapir":'act-tapir',
 'Red-eyed tree frog':'act-frog','Central American squirrel monkey':'act-squirrelmonkey','Kinkajou':'act-nightwalk','Fiery-throated hummingbird':'act-hummingbird',
 'Brown-throated three-toed sloth':'act-cahuita-np','Spectacled caiman':'act-caiman','American crocodile':'dest-tarcoles'
};
/* Soortfoto's fase C: Wikimedia Commons, vierkant bijgesneden (240 px); bron en licentie per foto */
Object.assign(V48_PHOTO,{"sp-ramphastos-sulfuratus": {"title": "File:Ramphastos sulfuratus 2.jpg", "credit": "Franz Xaver", "license": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Ramphastos_sulfuratus_2.jpg"}, "sp-pteroglossus-torquatus": {"title": "File:Pteroglossus torquatus Costa Rica.jpg", "credit": "LG Nyqvist", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Pteroglossus_torquatus_Costa_Rica.jpg"}, "sp-pteroglossus-frantzii": {"title": "File:Fiery-billed Aracari (46556040571).jpg", "credit": "Becky Matsubara from El Sobrante, California", "license": "CC BY 2.0", "page": "https://commons.wikimedia.org/wiki/File:Fiery-billed_Aracari_(46556040571).jpg"}, "sp-ara-ambiguus": {"title": "File:Ara ambiguus 398202068 (cropped).jpg", "credit": "David McCorquodale", "license": "CC BY 4.0", "page": "https://commons.wikimedia.org/wiki/File:Ara_ambiguus_398202068_(cropped).jpg"}, "sp-eumomota-superciliosa": {"title": "File:Eumomota superciliosa 182519032.jpg", "credit": "Andrew Hrycyna", "license": "CC BY 4.0", "page": "https://commons.wikimedia.org/wiki/File:Eumomota_superciliosa_182519032.jpg"}, "sp-procnias-tricarunculatus": {"title": "File:Procnias tricarunculatus Monteverde 03.jpg", "credit": "Cephas", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Procnias_tricarunculatus_Monteverde_03.jpg"}, "sp-chiroxiphia-linearis": {"title": "File:Long-tailed Mankin (Chiroxiphia linearis).jpg", "credit": "Sean Graesser", "license": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Long-tailed_Mankin_(Chiroxiphia_linearis).jpg"}, "sp-trogon-aurantiiventris": {"title": "File:Orange bellied Trogon. Trogon aurantiiventris - Flickr - gailhampshire.jpg", "credit": "gailhampshire from Cradley, Malvern, U.K", "license": "CC BY 2.0", "page": "https://commons.wikimedia.org/wiki/File:Orange_bellied_Trogon._Trogon_aurantiiventris_-_Flickr_-_gailhampshire.jpg"}, "sp-aulacorhynchus-prasinus": {"title": "File:Aulacorhynchus prasinus caeruleogularis SaGeRi 01.jpg", "credit": "Cephas", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Aulacorhynchus_prasinus_caeruleogularis_SaGeRi_01.jpg"}, "sp-campylopterus-hemileucurus": {"title": "File:Fandanguero Morado, Violet Sabrewing, Campylopterus hemileucurus (11703081214) (cropped).jpg", "credit": "Amado Demesa from DF, México", "license": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:Fandanguero_Morado,_Violet_Sabrewing,_Campylopterus_hemileucurus_(11703081214)_(cropped).jpg"}, "sp-cochlearius-cochlearius": {"title": "File:Boat-billed Heron (Cochlearius cochlearius) immature ... (52431171547).jpg", "credit": "Bernard DUPONT from FRANCE", "license": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:Boat-billed_Heron_(Cochlearius_cochlearius)_immature_..._(52431171547).jpg"}, "sp-agamia-agami": {"title": "File:Agami Heron (Agamia agami) (7222553616).jpg", "credit": "Dominic Sherony", "license": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:Agami_Heron_(Agamia_agami)_(7222553616).jpg"}, "sp-tigrisoma-mexicanum": {"title": "File:Tigrisoma mexicanum 2.jpg", "credit": "Hans Hillewaert", "license": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Tigrisoma_mexicanum_2.jpg"}, "sp-platalea-ajaja": {"title": "File:Roseate spoonbill, Tárcoles river, Costa Rica, December 2014.jpg", "credit": "Kpts44", "license": "CC0", "page": "https://commons.wikimedia.org/wiki/File:Roseate_spoonbill,_T%C3%A1rcoles_river,_Costa_Rica,_December_2014.jpg"}, "sp-jabiru-mycteria": {"title": "File:Jabiru (Jabiru mycteria) 2.JPG", "credit": "Charles J. Sharp", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Jabiru_(Jabiru_mycteria)_2.JPG"}, "sp-anhinga-anhinga": {"title": "File:Anhinga preening (81463).jpg", "credit": "Rhododendrites", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Anhinga_preening_(81463).jpg"}, "sp-megaceryle-torquata": {"title": "File:Ringed Kingfisher (Megaceryle torquata), Esquinas Rainforest Lodge, Costa Rica (3978420702).jpg", "credit": "Frank Vassen from Brussels, Belgium", "license": "CC BY 2.0", "page": "https://commons.wikimedia.org/wiki/File:Ringed_Kingfisher_(Megaceryle_torquata),_Esquinas_Rainforest_Lodge,_Costa_Rica_(3978420702).jpg"}, "sp-chloroceryle-aenea": {"title": "File:026 American pygmy kingfisher in Encontro das Águas State Park Photo by Giles Laurent.jpg", "credit": "Giles Laurent", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:026_American_pygmy_kingfisher_in_Encontro_das_%C3%81guas_State_Park_Photo_by_Giles_Laurent.jpg"}, "sp-sarcoramphus-papa": {"title": "File:Sarcoramphus papa, Le Selva, Costa Rica 1.jpg", "credit": "Don Faulkner", "license": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:Sarcoramphus_papa,_Le_Selva,_Costa_Rica_1.jpg"}, "sp-herpetotheres-cachinnans": {"title": "File:Herpetotheres cachinnans - Pedro Henrique Maloso Ramos - 416304213.jpeg", "credit": "Pedro Henrique Maloso Ramos", "license": "CC BY 4.0", "page": "https://commons.wikimedia.org/wiki/File:Herpetotheres_cachinnans_-_Pedro_Henrique_Maloso_Ramos_-_416304213.jpeg"}, "sp-calocitta-formosa": {"title": "File:Calocitta formosa -Costa Rica-8.jpg", "credit": "davebrenner", "license": "CC BY 2.0", "page": "https://commons.wikimedia.org/wiki/File:Calocitta_formosa_-Costa_Rica-8.jpg"}, "sp-choloepus-hoffmanni": {"title": "File:Choloepus hoffmanni (Puerto Viejo, CR) crop.jpg", "credit": "Geoff Gallice", "license": "CC BY 2.0", "page": "https://commons.wikimedia.org/wiki/File:Choloepus_hoffmanni_(Puerto_Viejo,_CR)_crop.jpg"}, "sp-alouatta-palliata": {"title": "File:Mantled howler Alouatta palliata Costa Rica 8756.jpg", "credit": "Paul Harrison", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Mantled_howler_Alouatta_palliata_Costa_Rica_8756.jpg"}, "sp-cebus-imitator": {"title": "File:Cebus imitator 241891289.jpg", "credit": "steve b", "license": "CC0", "page": "https://commons.wikimedia.org/wiki/File:Cebus_imitator_241891289.jpg"}, "sp-ateles-geoffroyi": {"title": "File:Ateles geoffroyi 210986563.jpg", "credit": "Thomas Hirsch", "license": "CC0", "page": "https://commons.wikimedia.org/wiki/File:Ateles_geoffroyi_210986563.jpg"}, "sp-nasua-narica": {"title": "File:Nasua narica CR.JPG", "credit": "Cephas", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Nasua_narica_CR.JPG"}, "sp-tamandua-mexicana": {"title": "File:Tamandua mexicana 296789947.jpg", "credit": "Daniel S. Katz", "license": "CC BY 4.0", "page": "https://commons.wikimedia.org/wiki/File:Tamandua_mexicana_296789947.jpg"}, "sp-iguana-iguana": {"title": "File:Green iguana (81503).jpg", "credit": "Rhododendrites", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Green_iguana_(81503).jpg"}, "sp-basiliscus-basiliscus": {"title": "File:Male Basiliscus basiliscus, Costa Rica.JPG", "credit": "C. Horwitz, uploaded with help of her husband Steven G. Johnson", "license": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Male_Basiliscus_basiliscus,_Costa_Rica.JPG"}, "sp-bothriechis-schlegelii": {"title": "File:Bothriechis nigroadspersus (La Selva Biological Station).jpg", "credit": "Geoff Gallice", "license": "CC BY 2.0", "page": "https://commons.wikimedia.org/wiki/File:Bothriechis_nigroadspersus_(La_Selva_Biological_Station).jpg"}, "sp-oophaga-pumilio": {"title": "File:Oophaga pumilio 5908380.jpg", "credit": "Vijay Barve", "license": "CC BY 4.0", "page": "https://commons.wikimedia.org/wiki/File:Oophaga_pumilio_5908380.jpg"}, "sp-dendrobates-auratus": {"title": "File:Black and green poison dart frog (Dendrobates auratu) juvenile.jpg", "credit": "Charles J. Sharp", "license": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Black_and_green_poison_dart_frog_(Dendrobates_auratu)_juvenile.jpg"}, "sp-chelonia-mydas": {"title": "File:Chelonia mydas is going for the air edit.jpg", "credit": "Brocken Inaglory", "license": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Chelonia_mydas_is_going_for_the_air_edit.jpg"}, "sp-triaenodon-obesus": {"title": "File:Tiburón de arrecife de punta blanca (Triaenodon obesus), Nosy Tanikely, Madagascar, 2025-09-19, DD 110.jpg", "credit": "Diego Delso", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Tibur%C3%B3n_de_arrecife_de_punta_blanca_(Triaenodon_obesus),_Nosy_Tanikely,_Madagascar,_2025-09-19,_DD_110.jpg"}, "sp-tursiops-dolphin": {"title": "File:Anim2621 (34367882350).jpg", "credit": "NOAA Photo Library", "license": "CC BY 2.0", "page": "https://commons.wikimedia.org/wiki/File:Anim2621_(34367882350).jpg"}, "sp-ardea-alba": {"title": "File:Great egret Ardea alba Costa Rica 7676.jpg", "credit": "ImagePerson", "license": "CC BY 4.0", "page": "https://commons.wikimedia.org/wiki/File:Great_egret_Ardea_alba_Costa_Rica_7676.jpg"}});
Object.assign(DS_SP_PHOTO,{"Keel-billed toucan": "sp-ramphastos-sulfuratus", "Collared aracari": "sp-pteroglossus-torquatus", "Fiery-billed aracari": "sp-pteroglossus-frantzii", "Great green macaw": "sp-ara-ambiguus", "Turquoise-browed motmot": "sp-eumomota-superciliosa", "Three-wattled bellbird": "sp-procnias-tricarunculatus", "Long-tailed manakin": "sp-chiroxiphia-linearis", "Orange-bellied trogon": "sp-trogon-aurantiiventris", "Northern emerald-toucanet": "sp-aulacorhynchus-prasinus", "Violet sabrewing": "sp-campylopterus-hemileucurus", "Boat-billed heron": "sp-cochlearius-cochlearius", "Agami heron": "sp-agamia-agami", "Bare-throated tiger heron": "sp-tigrisoma-mexicanum", "Roseate spoonbill": "sp-platalea-ajaja", "Jabiru": "sp-jabiru-mycteria", "Anhinga": "sp-anhinga-anhinga", "Ringed kingfisher": "sp-megaceryle-torquata", "American pygmy kingfisher": "sp-chloroceryle-aenea", "King vulture": "sp-sarcoramphus-papa", "Laughing falcon": "sp-herpetotheres-cachinnans", "White-throated magpie-jay": "sp-calocitta-formosa", "Hoffmann's two-toed sloth": "sp-choloepus-hoffmanni", "Mantled howler monkey": "sp-alouatta-palliata", "White-faced capuchin": "sp-cebus-imitator", "Central American spider monkey": "sp-ateles-geoffroyi", "White-nosed coati": "sp-nasua-narica", "Northern tamandua": "sp-tamandua-mexicana", "Green iguana": "sp-iguana-iguana", "Common basilisk": "sp-basiliscus-basiliscus", "Eyelash viper": "sp-bothriechis-schlegelii", "Strawberry poison dart frog": "sp-oophaga-pumilio", "Green-and-black poison dart frog": "sp-dendrobates-auratus", "Green sea turtle": "sp-chelonia-mydas", "Whitetip reef shark": "sp-triaenodon-obesus", "Pantropical spotted dolphin": "sp-tursiops-dolphin", "Great egret": "sp-ardea-alba"});
const DS_CHANCE_TXT={4:'Zeer grote kans',3:'Grote kans',2:'Redelijke kans',1:'Kleine kans'};
v47Card=function(name,region,focus){
  const i=v47Info(name),ch=v47Chance(region,name)||(focus?2:0),o=v47Obs(name,region),seen=!!o.here.seen,photo=!!o.here.photo,m=V47_MOMENT[i.moment],sp=DS_SP_PHOTO[name],season=V49_SEASON[name],rare=ch===1,ptip=V51_PHOTO[name];
  const enc=encodeURIComponent(name),pl=encodeURIComponent(region);
  const img=sp&&V48_PHOTO[sp]?`<img src="./photos/${sp}.jpg" alt="" loading="lazy">`:`<span class="ds-sp-ico">${v47Svg(V47_CAT_ICON[i.cat]||V46_ICONS.pin,22)}</span>`;
  return `<div class="v43-species v47-sp ds-sp ${seen?'seen':''}" data-search="${esc((i.nl+' '+i.en+' '+i.cat).toLowerCase())}" data-group="${esc(v50Group(name))}" data-v47-cat="${esc(i.cat)}">
    <div class="ds-sp-row">
      <button class="ds-sp-main" data-ds-sp-toggle aria-expanded="false">
        <span class="ds-sp-img">${img}${seen?`<span class="ds-sp-seen">${dsI('lock',10).replace(DS_ICON.lock,'<path d="m5 12 5 5 9-10"/>')}</span>`:''}</span>
        <span class="ds-sp-txt"><b>${esc(i.nl)}</b><em>${i.nl!==i.en?esc(i.en)+' · ':''}${m?m[0].toLowerCase():esc(i.cat)}</em>
        ${ch?`<span class="ds-chance c${ch}" aria-label="${DS_CHANCE_TXT[ch]}">${[1,2,3,4].map(n=>`<i class="${n<=ch?'f':''}"></i>`).join('')}${rare?'<small>zeldzaam</small>':''}${season?'<small class="sz">seizoen</small>':''}</span>`:''}</span>
      </button>
      <span class="ds-sp-reg">
        <button class="${seen?'on':''}" data-v43-species="${enc}" data-v43-kind="seen" data-v43-place="${pl}" aria-label="${seen?'Gezien':'Markeer als gezien'}">${dsI('lock',18).replace(DS_ICON.lock,'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')}</button>
        <button class="${photo?'on':''}" data-v43-species="${enc}" data-v43-kind="photo" data-v43-place="${pl}" aria-label="${photo?'Op foto':'Markeer als gefotografeerd'}">${dsI('lock',18).replace(DS_ICON.lock,V46_ICONS.camera)}</button>
      </span>
    </div>
    <div class="ds-sp-body" hidden>
      <div class="ds-chips">${ch?`<span>${DS_CHANCE_TXT[ch]}</span>`:''}${m?`<span>${m[0]}</span>`:''}${season?`<span class="sky">${esc(season)}</span>`:''}${o.other.length?`<span class="leaf">Eerder gezien: ${esc(o.other.join(', '))}</span>`:''}</div>
      ${i.tip?`<p>${esc(i.tip)}</p>`:''}
      ${ptip?`<div class="ds-ptip">${dsI('lock',16).replace(DS_ICON.lock,V46_ICONS.camera)}<span><b>Fototip</b> ${esc(ptip)}</span></div>`:''}
    </div>
  </div>`};

speciesList=function(d){
  const {region,base,extras}=v47RegionNames(d),focusDef=V47_FOCUS[d.id],focus=focusDef?focusDef.list:[];
  const all=[...new Set([...focus,...base,...extras])];
  if(!all.length)return '<div class="ds-card"><p class="ds-meta">Reisdag zonder wildlife-focus.</p></div>';
  const f=v47Filter,seenHere=all.filter(n=>v47Obs(n,region).here.seen).length,photoHere=all.filter(n=>v47Obs(n,region).here.photo).length,st=v43Stats();
  const pass=n=>f==='Alle'?true:f==='Nog niet gezien'?!v47Obs(n,region).here.seen&&!v47Obs(n,region).other.length:f==='Zeldzaam'?v47Chance(region,n)===1:f==='Seizoen'?!!V49_SEASON[n]:v47Info(n).cat===f;
  const order=['Vogels','Zoogdieren','Reptielen','Amfibieën','Zeeleven'];
  const cats=['Alle',...order.filter(c=>all.some(n=>v47Info(n).cat===c)),'Nog niet gezien','Seizoen','Zeldzaam'];
  const groups=['Alle',...new Set(all.map(v50Group).filter(Boolean))];
  const focusShown=focus.filter(pass);
  const rest=[...base.filter(n=>!focus.includes(n)),...extras.filter(n=>!focus.includes(n)&&!base.includes(n))].filter(pass).sort((a,b)=>v47Chance(region,b)-v47Chance(region,a));
  const byCat={};rest.forEach(n=>{const c=extras.includes(n)&&!base.includes(n)?'Zelf toegevoegd':v47Info(n).cat;(byCat[c]??=[]).push(n)});
  return `<div class="ds-card ds-wild-head">
    <div class="ds-wild-title"><h3 class="ds-title">Wildlife</h3><span class="ds-meta">${esc(region)}</span></div>
    <div class="ds-stats ds-num"><div><b>${all.length}</b><small>doelsoorten</small></div><div><b>${seenHere}</b><small>gezien hier</small></div><div><b>${photoHere}</b><small>op foto</small></div><div><b>${st.seen}</b><small>reis totaal</small></div></div>
    <label class="ds-search">${dsI('search',18)}<input id="v50q" type="search" placeholder="Zoek soort, NL of Engels" value="${esc(v50Query)}" autocomplete="off" enterkeyhint="search"></label>
    <div class="ds-filter" role="toolbar" aria-label="Filter">${cats.map(c=>`<button data-v47-filter="${esc(c)}" class="${f===c?'on':''}">${esc(c)}</button>`).join('')}</div>
    ${f==='Vogels'?`<div class="ds-filter sub">${groups.map(g=>`<button data-v50-group="${esc(g)}" class="${v50BirdGroup===g?'on':''}">${esc(g)}</button>`).join('')}</div>`:''}
  </div>
  ${focusShown.length?`<section class="ds-card ds-wild-sec v47-focus"><div class="ds-wild-sech"><span class="ds-label">Focus vandaag</span><small>${esc(focusDef.label)}</small></div>${focusShown.map(n=>v47Card(n,region,true)).join('')}</section>`:''}
  ${Object.keys(byCat).length?`<section class="ds-card ds-wild-sec"><div class="ds-wild-sech"><span class="ds-label">Meer in deze regio</span><small>Gesorteerd op kans</small></div>${[...order,'Zelf toegevoegd'].filter(c=>byCat[c]).map(c=>`<h4 class="v47-cat-h ds-cat-h">${esc(c)} <em>${byCat[c].length}</em></h4>${byCat[c].map(n=>v47Card(n,region,false)).join('')}`).join('')}</section>`:''}
  ${!focusShown.length&&!Object.keys(byCat).length?'<div class="ds-card"><p class="ds-meta">Niets in dit filter.</p></div>':''}
  <div class="ds-card ds-addsp"><div class="ds-addrow"><input id="v43NewSpecies" maxlength="90" placeholder="Eigen soort toevoegen" aria-label="Nieuwe soort"><button id="v43AddSpecies" class="ds-btn primary">Toevoegen</button></div>
  <p class="ds-meta" style="margin:10px 0 0">Kansen zijn een inschatting voor februari–maart met gids, geen garantie. Merlin Bird ID helpt bij determinatie op geluid.</p></div>`};

/* wildlife-overzichtsscherm */
renderWildlife=function(){
  let birds=0,mammals=0,other=0;for(const o of Object.values(state.v43Observations||{})){if(!Object.values(o.places||{}).some(v=>v.seen||v.photo))continue;const c=v44Category(o.name);if(c==='Vogels')birds++;else if(c==='Zoogdieren')mammals++;else other++}
  const st=v43Stats(),logs=[];for(const [id,places] of Object.entries(state.v44Log||{}))for(const [place,rec] of Object.entries(places))if(rec.note)logs.push({name:state.v43Observations[id]?.name||id,place,note:rec.note,date:rec.date||''});logs.sort((a,b)=>b.date.localeCompare(a.date));
  const total=Object.keys(V47_SP).length;
  const days=S.filter(d=>V47_FOCUS[d.id]).map(d=>`<button class="ds-wday" data-dsday-w="${d.id}"><img src="${locationPhoto(d)}" alt=""><span><span class="ds-label">Dag ${d.id} · ${esc(v47Region(d))}</span><b>${esc(V47_FOCUS[d.id].label)}</b><small>${V47_FOCUS[d.id].list.slice(0,4).map(n=>esc(v47Info(n).nl)).join(', ')}</small></span>${dsI('chevR',18)}</button>`).join('');
  return `<div class="ds-page">
    <div class="ds-pagehead"><h1 class="ds-title">Wildlife</h1><p class="ds-meta">${total} soorten, waarvan ${Object.values(V47_SP).filter(x=>x[1]==='Vogels').length} vogels</p></div>
    <div class="ds-card"><div class="ds-stats ds-num"><div><b>${st.seen}</b><small>soorten gezien</small></div><div><b>${st.photo}</b><small>op foto</small></div><div><b>${birds}</b><small>vogels</small></div><div><b>${mammals}</b><small>zoogdieren</small></div></div>
      <label class="ds-search">${dsI('search',18)}<input id="v50gq" type="search" placeholder="Waar zie ik… bijv. quetzal, luiaard" autocomplete="off" enterkeyhint="search"></label><div id="v50gres"></div></div>
    <div class="ds-section-title">Per reisdag</div>${days}
    <div class="ds-section-title">Logboek</div><div class="ds-card">${logs.length?logs.map(x=>`<div class="ds-log"><b>${esc(v47Info(x.name).nl)}</b><small>${esc(x.place)}${x.date?' · '+esc(x.date):''}</small><p>${esc(x.note)}</p></div>`).join(''):'<p class="ds-meta">Nog geen waarnemingsnotities. Open een soort bij een dag en voeg een notitie toe.</p>'}</div>
  </div>`};
v50GlobalSearch=function(v){const box=document.getElementById('v50gres');if(!box)return;const q=v.trim().toLowerCase();if(q.length<2){box.innerHTML='';return}
  const hits=Object.keys(V47_SP).filter(n=>{const i=v47Info(n);return (i.nl+' '+i.en+' '+i.cat+' '+v50Group(n)).toLowerCase().includes(q)}).slice(0,30);
  box.innerHTML=hits.length?hits.map(n=>{const i=v47Info(n),w=v50WhereList(n);return `<div class="ds-gres"><b>${esc(i.nl)}</b>${i.nl!==i.en?`<em>${esc(i.en)}</em>`:''}<div class="ds-chips">${w.map(([r,c])=>`<span class="c${c}">${esc(r)}</span>`).join('')||'<span>alleen als dagfocus</span>'}</div></div>`}).join(''):'<p class="ds-meta" style="margin-top:10px">Geen soort gevonden.</p>'};

/* ---------- dagtabs koppelen ---------- */
const dsCPrevDC=dayContent;
dayContent=function(d){if(daySection==='activities')return dsActivities(d);if(daySection==='stay')return dsStay(d);return dsCPrevDC(d)};

/* ---------- binding ---------- */
const dsCPrevBind=bindExtras;
bindExtras=function(){dsCPrevBind();
  document.querySelectorAll('.ds-act[data-activity]').forEach(el=>el.onclick=()=>openActivity(Number(el.dataset.day),Number(el.dataset.activity)));
  document.querySelectorAll('.ds-sp').forEach(card=>{const body=card.querySelector('.ds-sp-body'),log=card.querySelector('.v44-log');if(log&&body&&log.parentElement!==body)body.append(log);
    const t=card.querySelector('[data-ds-sp-toggle]');if(t)t.onclick=()=>{const open=body.hidden;body.hidden=!open;t.setAttribute('aria-expanded',String(open));card.classList.toggle('open',open)}});
  document.querySelectorAll('[data-dsday-w]').forEach(el=>el.onclick=()=>{currentDay=Number(el.dataset.dsdayW);daySection='wildlife';v47Filter='Alle';tab='days';render();window.scrollTo({top:0,behavior:'instant'})});
};
render();
/* detailblad: titel bovenaan, daarna foto en feiten */
const dsCPrevOpen=openActivity;
openActivity=function(day,idx){dsCPrevOpen(day,idx);const sheet=document.querySelector('#detailOverlay .detail-sheet');if(!sheet)return;const block=sheet.querySelector('.v48-detail'),h2=sheet.querySelector('h2');if(block&&h2){const meta=h2.nextElementSibling;(meta&&meta.tagName==='P'?meta:h2).after(block)}};
