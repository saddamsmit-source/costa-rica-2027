/* v4.9 – Wildlife: insecten eruit, zeezoogdieren/schildpadden in hoofdgroepen, seizoen + zeldzaam, extra soorten feb–mrt */
['Blue morpho','Leafcutter ants','Tarantula'].forEach(n=>{delete V47_SP[n]});
for(const r of Object.keys(V47_PLACES))V47_PLACES[r]=V47_PLACES[r].filter(([n])=>V47_SP[n]);
for(const f of Object.values(V47_FOCUS))f.list=f.list.filter(n=>V47_SP[n]);
['Humpback whale','Pantropical spotted dolphin','Common bottlenose dolphin'].forEach(n=>V47_SP[n][1]='Zoogdieren');
['Green sea turtle','Hawksbill sea turtle','Olive ridley sea turtle'].forEach(n=>V47_SP[n][1]='Reptielen');

/* nieuwe soorten: [NL, groep, moment, tip] – NL gelijk aan EN waar geen gangbare Nederlandse naam bestaat */
Object.assign(V47_SP,{
'Black vulture':['Zwarte gier','Vogels','d','Overal boven open land en dorpen.'],
'Turkey vulture':['Kalkoengier','Vogels','d','Rode kop. In maart trekken grote groepen noordwaarts over.'],
'Tropical kingbird':['Tropische koningstiran','Vogels','d','Zit op elektriciteitsdraden langs de weg.'],
'Great-tailed grackle':['Langstaarttroepiaal','Vogels','d','Luidruchtig in dorpen en op pleinen.'],
'Brown jay':['Bruine gaai','Vogels','d','Groepjes met een opvallend "pieuw"-geluid.'],
'Gray-headed chachalaca':['Grijskopchachalaca','Vogels','o','Groepjes in bosranden; luid koor in de ochtend.'],
'Cattle egret':['Koereiger','Vogels','d','Tussen koeien op weilanden.'],
'Palm tanager':['Palmtangare','Vogels','d','Olijfgrijs; algemeen in tuinen en palmen.'],
'Golden-hooded tanager':['Golden-hooded tanager','Vogels','d','Felgekleurd; bosranden en lodgetuinen in het laagland.'],
'Red-legged honeycreeper':['Red-legged honeycreeper','Vogels','d','Mannetje glanzend blauw met rode poten; bij fruit en bloeiende bomen.'],
'Cherrie\'s tanager':['Cherrie\'s tanager','Vogels','d','Pacifische tegenhanger van de Passerini-tangare.'],
'Yellow-headed caracara':['Geelkopcaracara','Vogels','d','Open land; zit soms op vee.'],
'Swallow-tailed kite':['Zwaluwstaartwouw','Vogels','d','Elegante zwart-witte roofvogel met diep gevorkte staart.'],
'Baltimore oriole':['Baltimoretroepiaal','Vogels','d','Oranje-zwart; bij bloeiende bomen.'],
'Tennessee warbler':['Tennessee-zanger','Vogels','d','Klein en groen-grijs; groepjes in bloeiende bomen.'],
'Chestnut-sided warbler':['Roestflankzanger','Vogels','d','In gemengde groepen in bosranden.'],
'Summer tanager':['Zomertangare','Vogels','d','Mannetje helemaal rood.'],
'Yellow warbler':['Gele zanger','Vogels','d','Mangroven en kustbosjes.'],
'Wilson\'s warbler':['Wilsons zanger','Vogels','d','Geel met zwart kapje; algemeen in de hooglanden.'],
'Spotted sandpiper':['Amerikaanse oeverloper','Vogels','w','Wipt met zijn achterlijf op stenen langs rivieren.'],
'Broad-winged hawk':['Breedvleugelbuizerd','Vogels','d','Zit vaak op bosranden; in maart trek.'],
'Rufous-naped wren':['Rufous-naped wren','Vogels','d','Luidruchtig in droog bos; bouwt nesten in acacia\'s.'],
'Hoffmann\'s woodpecker':['Hoffmann\'s woodpecker','Vogels','d','Algemene specht in open, droog bos.'],
'Black-headed trogon':['Zwartkoptrogon','Vogels','d','Geel buikje; droog bos van Guanacaste.'],
'Orange-fronted parakeet':['Oranjevoorhoofdparkiet','Vogels','d','Lawaaierige groepjes in droog bos.'],
'White-fronted parrot':['Witvoorhoofdamazone','Vogels','o','Paren en groepjes vliegen luid over in de ochtend.'],
'Elegant trogon':['Elegante trogon','Vogels','o','Droog bos in het noordwesten; minder algemeen.'],
'Golden-browed chlorophonia':['Golden-browed chlorophonia','Vogels','d','Felgroen-geel juweeltje in nevelwoud; let op maretak.'],
'Black-faced solitaire':['Black-faced solitaire','Vogels','o','Fluitende, metalige zang in nevelwoud; zien is lastiger.'],
'Sooty thrush':['Roetlijster','Vogels','d','Algemeen in de hooglanden; oranje snavel en pootjes.'],
'Collared redstart':['Collared redstart','Vogels','d','Tam en nieuwsgierig; volgt soms wandelaars in de hooglanden.'],
'Black-and-yellow silky-flycatcher':['Black-and-yellow silky-flycatcher','Vogels','d','Boomtoppen in hoge eikenbossen.'],
'Spangle-cheeked tanager':['Spangle-cheeked tanager','Vogels','d','Hooglanden; in gemengde groepen.'],
'Snail kite':['Slakkenwouw','Vogels','w','Jaagt op appelslakken boven moerassen.'],
'Purple gallinule':['Amerikaans purperhoen','Vogels','w','Loopt over drijvende planten; felle kleuren.'],
'Neotropic cormorant':['Bigua-aalscholver','Vogels','w','Algemeen op rivieren en lagunes.'],
'Limpkin':['Koerlan','Vogels','w','Moerassen; luide klagende roep.'],
'Rufescent tiger heron':['Rufescent tiger heron','Vogels','w','Schaduwrijke kanalen; schaarser dan de naaktkeeltijgerroerdomp.'],
'Great green macaw':['Grote soldatenara','Vogels','d','Zeldzaam en bedreigd; soms in Tortuguero. Luid gekrijs.'],
'Sunbittern':['Zonneral','Vogels','w','Langs beekjes en rivieren; opvallend vleugelpatroon in de vlucht.'],
'Turquoise cotinga':['Turquoise cotinga','Vogels','o','Felblauw; boomtoppen in het zuidelijk Pacifisch gebied. Zeldzaam.'],
'Yellow-billed cotinga':['Yellow-billed cotinga','Vogels','o','Bedreigd; wit met gele snavel, mangroven rond Sierpe. Vraag de bootman.'],
'Red-capped manakin':['Roodkopmanakin','Vogels','o','Mannetje doet "moonwalk"-dans op een tak.'],
'Spectacled owl':['Briluil','Vogels','n','Grote uil; soms overdag op een rustplek die de gids kent.'],
'Ornate hawk-eagle':['Sierlijke kuifarend','Vogels','d','Zeldzaam; zweeft boven primair bos van Corcovado.'],
'Black-hooded antshrike':['Black-hooded antshrike','Vogels','d','Algemeen in het onderhout aan de Pacifische kant.'],
'Mangrove swallow':['Mangrovezwaluw','Vogels','w','Laag boven rivieren en mangroven.'],
'Red-tailed squirrel':['Roodstaarteekhoorn','Zoogdieren','d','Algemeen in nevelwoud.'],
'Nine-banded armadillo':['Negenbandig gordeldier','Zoogdieren','n','Scharrelt in de schemer en nacht door de strooisellaag.'],
'Ocelot':['Ocelot','Zoogdieren','n','Zeldzaam om te zien; Corcovado geeft de beste kans.'],
'Tayra':['Tayra','Zoogdieren','d','Grote marterachtige; soms overdag over paden.'],
'Neotropical river otter':['Langstaartotter','Zoogdieren','w','Rivieren en kanalen; zeldzaam maar mogelijk.'],
'Boa constrictor':['Boa constrictor','Reptielen','d','Rust opgerold in bomen of op de grond; gidsen vinden ze.'],
'Fer-de-lance':['Lanspuntslang','Reptielen','n','Zeer giftig. Alleen met gids, nooit benaderen.'],
'Black river turtle':['Black river turtle','Reptielen','w','Zont op stammen in de kanalen.'],
'Green parrot snake':['Green parrot snake','Reptielen','d','Slanke groene slang in struiken; ongevaarlijk.']
});
/* seizoen/zeldzaamheid labels */
const V49_SEASON={
'Resplendent quetzal':'Broedtijd: februari–april is de beste periode',
'Three-wattled bellbird':'Trekt rond maart naar Monteverde om te broeden',
'Humpback whale':'Noordelijke populatie aanwezig dec–apr',
'Jabiru':'Droge seizoen: meer kans',
'Roseate spoonbill':'Droge seizoen: geconcentreerd op ondiep water',
'Swallow-tailed kite':'Terug uit Zuid-Amerika vanaf januari',
'Turkey vulture':'Grote trekgroepen in maart',
'Broad-winged hawk':'Wintergast okt–apr',
'Osprey':'Wintergast okt–apr','Baltimore oriole':'Wintergast okt–apr','Tennessee warbler':'Wintergast okt–apr','Chestnut-sided warbler':'Wintergast okt–apr','Summer tanager':'Wintergast okt–apr','Wilson\'s warbler':'Wintergast okt–apr','Spotted sandpiper':'Wintergast okt–apr','Whimbrel':'Wintergast okt–apr','Yellow warbler':'Wintergast (plus lokale broedvogels in mangroven)'
};
const V49_ADD={
'San José':[['Black vulture',4],['Great-tailed grackle',4],['Tropical kingbird',4],['Baltimore oriole',3],['Tennessee warbler',3],['Palm tanager',3]],
'Cahuita':[['Black vulture',4],['Tropical kingbird',4],['Palm tanager',4],['Golden-hooded tanager',3],['Red-legged honeycreeper',3],['Yellow-throated toucan',3],['Baltimore oriole',3],['Chestnut-sided warbler',3],['Brown jay',3],['Boa constrictor',2],['Fer-de-lance',1],['Nine-banded armadillo',1]],
'Tortuguero':[['Neotropic cormorant',4],['Black vulture',4],['Rufescent tiger heron',2],['Black river turtle',3],['Spotted sandpiper',3],['Great green macaw',1],['Sunbittern',1],['Neotropical river otter',1],['Boa constrictor',1],['Yellow-throated toucan',3]],
'La Fortuna':[['Neotropic cormorant',4],['Snail kite',2],['Purple gallinule',3],['Limpkin',2],['Cattle egret',4],['Gray-headed chachalaca',3],['Brown jay',3],['Golden-hooded tanager',3],['Spotted sandpiper',3],['Neotropical river otter',1]],
'Rincón de la Vieja':[['Rufous-naped wren',4],['Hoffmann\'s woodpecker',4],['Black-headed trogon',3],['Orange-fronted parakeet',3],['White-fronted parrot',3],['Elegant trogon',2],['Brown jay',3],['Swallow-tailed kite',2],['Turkey vulture',4],['Boa constrictor',2]],
'Monteverde':[['Golden-browed chlorophonia',2],['Black-faced solitaire',3],['Red-tailed squirrel',3],['Wilson\'s warbler',3],['Tayra',1],['Swallow-tailed kite',2],['Broad-winged hawk',2]],
'San Gerardo de Dota':[['Sooty thrush',4],['Collared redstart',4],['Black-and-yellow silky-flycatcher',2],['Spangle-cheeked tanager',2],['Wilson\'s warbler',3],['Red-tailed squirrel',3],['Swallow-tailed kite',2]],
'Uvita':[['Cherrie\'s tanager',4],['Black-hooded antshrike',3],['Yellow-headed caracara',3],['Red-legged honeycreeper',3],['Golden-hooded tanager',3],['Spotted sandpiper',3],['Boa constrictor',1]],
'Corcovado':[['Red-capped manakin',2],['Turquoise cotinga',1],['Yellow-billed cotinga',1],['Spectacled owl',1],['Ornate hawk-eagle',1],['Ocelot',1],['Tayra',1],['Cherrie\'s tanager',4],['Boa constrictor',2],['Fer-de-lance',1],['Humpback whale',2],['Pantropical spotted dolphin',3]],
'Esterillos':[['Black vulture',4],['Turkey vulture',4],['Yellow-headed caracara',3],['Spotted sandpiper',3],['Cherrie\'s tanager',3]],
'Manuel Antonio':[['Cherrie\'s tanager',4],['Black-hooded antshrike',3],['Boa constrictor',2],['Green parrot snake',2],['Black vulture',4],['Magnificent frigatebird',4]],
'Tárcoles':[['Mangrove swallow',3],['Yellow warbler',3],['Yellow-billed cotinga',1],['Neotropic cormorant',4],['Spotted sandpiper',3],['Cattle egret',4]]
};
for(const [r,list] of Object.entries(V49_ADD)){V47_PLACES[r]??=[];for(const [n,c] of list)if(V47_SP[n]&&!V47_PLACES[r].some(x=>x[0]===n))V47_PLACES[r].push([n,c])}
/* V43_TARGETS opnieuw opbouwen voor tellers */
(function(){for(const k of Object.keys(V43_TARGETS))delete V43_TARGETS[k];for(const [region,list] of Object.entries(V47_PLACES)){const g={};list.forEach(([n])=>{(g[v47Info(n).cat]??=[]).push(n)});V43_TARGETS[region]=g}})();

/* kaart: seizoenslabel + 'zeldzaam'-filter */
const v49PrevCard=v47Card;
v47Card=function(name,region,focus){let html=v49PrevCard(name,region,focus);const s=V49_SEASON[name],rare=v47Chance(region,name)===1;
  const extra=(s?`<span class="v49-season">${v47Svg(V47_MOMENT.o[1],13)}${esc(s)}</span>`:'')+(rare?'<span class="v49-rare">Zeldzaam, maar mogelijk</span>':'');
  return extra?html.replace('<div class="v47-meta">','<div class="v47-meta">'+extra):html};
const v49PrevSpeciesList=speciesList;
speciesList=function(d){
  const f=v47Filter;
  if(f==='Zeldzaam'||f==='Seizoen'){const {region,base,extras}=v47RegionNames(d),focus=(V47_FOCUS[d.id]||{}).list||[];
    const all=[...new Set([...focus,...base,...extras])];
    const list=all.filter(n=>f==='Zeldzaam'?v47Chance(region,n)===1:!!V49_SEASON[n]);
    const full=v49PrevSpeciesList(d),i=full.indexOf('v47-filter'),j=full.indexOf('</div>\n  </div>',i)+'</div>\n  </div>'.length,k=full.indexOf('<div class="card"><div class="v43-add">');
    const head=full.slice(0,j),tail=k>=0?full.slice(k):'';
    return head+`<div class="card"><div class="v47-focus-h"><span>${f==='Zeldzaam'?'Zeldzaam, maar mogelijk':'Seizoensgebonden in feb–mrt'}</span><small>${list.length} soorten</small></div>${list.map(n=>v47Card(n,region,focus.includes(n))).join('')||'<p class="hint">Geen soorten in dit filter.</p>'}</div>`+tail}
  return v49PrevSpeciesList(d)};
/* filterknoppen aanvullen */
const v49PrevSL2=speciesList;
speciesList=function(d){let h=v49PrevSL2(d);return h.replace(/(<button data-v47-filter="Nog niet gezien"[^>]*>Nog niet gezien<\/button>)/,`$1<button data-v47-filter="Seizoen" class="${v47Filter==='Seizoen'?'on':''}">Seizoen</button><button data-v47-filter="Zeldzaam" class="${v47Filter==='Zeldzaam'?'on':''}">Zeldzaam</button>`)};

/* v4.9 – Checklist in tabbladen */
let v49Seg='regelen';
const v49PrevRenderBookings=renderBookings;
renderBookings=function(){
  const full=v49PrevRenderBookings();
  const iPack=full.indexOf('<div class="card"><div class="v46-h">',10),iOrig=full.indexOf('<div class="card"><h2>Excursies');
  const regelen=full.slice(0,iPack),orig=iOrig>=0?full.slice(iOrig):'';
  /* paklijst als uitklapbare groepen */
  const pack=V48_PACK.map(([g,items],gi)=>{const done=items.filter((_,ii)=>state.v48Pack[gi+'-'+ii]).length;
    return `<details class="v49-acc" ${state.v49Open?.[gi]?'open':''} data-v49-acc="${gi}"><summary><span>${esc(g)}</span><em class="${done===items.length?'full':''}">${done}/${items.length}</em></summary>
    ${items.map((it,ii)=>{const id=gi+'-'+ii,on=!!state.v48Pack[id];return `<label class="v48-pack ${on?'on':''}"><input type="checkbox" data-v48-pack="${id}" ${on?'checked':''}><span>${esc(it)}</span></label>`}).join('')}</details>`}).join('');
  const total=V48_PACK.reduce((s,[,i])=>s+i.length,0),done=Object.values(state.v48Pack).filter(Boolean).length;
  const todo=v48Costs().filter(r=>['online','zelf'].includes(r.bk)).length,booked=bookingActs.filter(a=>state.bookings[a.id]==='geboekt').length;
  const segs=[['regelen','Te regelen',todo],['paklijst','Paklijst',`${done}/${total}`],['boekingen','Boekingen',`${booked}/${bookingActs.length}`]];
  const body=v49Seg==='regelen'?regelen:v49Seg==='paklijst'?`<div class="card"><div class="v46-h">${v46Icon('camera',20)}Paklijst</div><div class="v49-progress"><i style="width:${Math.round(100*done/total)}%"></i></div>${pack}</div>`:orig;
  return `<div class="v49-segbar">${segs.map(([k,t,c])=>`<button data-v49-seg="${k}" class="${v49Seg===k?'on':''}">${t}<small>${c}</small></button>`).join('')}</div>${body}`};
state.v49Open??={};
const v49PrevBind=bindExtras;
bindExtras=function(){v49PrevBind();
  document.querySelectorAll('[data-v49-seg]').forEach(b=>b.onclick=()=>{v49Seg=b.dataset.v49Seg;render();window.scrollTo({top:0,behavior:'instant'})});
  document.querySelectorAll('[data-v49-acc]').forEach(d=>d.ontoggle=()=>{state.v49Open[d.dataset.v49Acc]=d.open;save()});
  document.querySelectorAll('[data-v48-pack]').forEach(c=>c.addEventListener('change',()=>{const acc=c.closest('details');if(!acc)return;const boxes=[...acc.querySelectorAll('input')],n=boxes.filter(x=>x.checked).length;const em=acc.querySelector('summary em');em.textContent=n+'/'+boxes.length;em.classList.toggle('full',n===boxes.length)}));
};

/* v4.9 hotelfoto's: vergelijkbare plekken (geen vrije foto's van de hotels zelf beschikbaar) */
Object.assign(V48_PHOTO,{"hotel-fleurdelys": {"title": "File:Casa de Joaquín Tinoco en Barrio Amón.JPG", "credit": "Lex.mercurio", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Casa_de_Joaqu%C3%ADn_Tinoco_en_Barrio_Am%C3%B3n.JPG"}, "hotel-atlantidalodge": {"title": "File:Hospedaje en Selva Bananito, Costa Rica.jpg", "credit": "Luciajimena1990", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Hospedaje_en_Selva_Bananito,_Costa_Rica.jpg"}, "hotel-lapaverdelodge": {"title": "File:Laguna Lodge - Flickr - S. Rae (2).jpg", "credit": "S. Rae from Scotland, UK", "license": "CC BY 2.0", "page": "https://commons.wikimedia.org/wiki/File:Laguna_Lodge_-_Flickr_-_S._Rae_(2).jpg"}, "hotel-catarataecolodge": {"title": "File:Cabin - Hotel Arenal Paraiso - Flickr - S. Rae.jpg", "credit": "S. Rae from Scotland, UK", "license": "CC BY 2.0", "page": "https://commons.wikimedia.org/wiki/File:Cabin_-_Hotel_Arenal_Paraiso_-_Flickr_-_S._Rae.jpg"}, "hotel-faroarenal": {"title": "File:Cabin - Hotel Arenal Paraiso - Flickr - S. Rae (1).jpg", "credit": "S. Rae from Scotland, UK", "license": "CC BY 2.0", "page": "https://commons.wikimedia.org/wiki/File:Cabin_-_Hotel_Arenal_Paraiso_-_Flickr_-_S._Rae_(1).jpg"}, "hotel-ecoarenal": {"title": "File:Arenal Observatory Lodge - panoramio.jpg", "credit": "Erick Hidalgo", "license": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File:Arenal_Observatory_Lodge_-_panoramio.jpg"}, "hotel-canondelaviejalodge": {"title": "File:A Guanacaste view.jpg", "credit": "Tizianok", "license": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:A_Guanacaste_view.jpg"}, "hotel-hotelloscipreses": {"title": "File:Monteverdeskyline01.jpg", "credit": "Fran Devinney", "license": "CC BY 2.0", "page": "https://commons.wikimedia.org/wiki/File:Monteverdeskyline01.jpg"}, "hotel-clarodeluna": {"title": "File:Monteverde sunset over the Gulf of Nicoya.jpg", "credit": "Steve Knight", "license": "CC BY 4.0", "page": "https://commons.wikimedia.org/wiki/File:Monteverde_sunset_over_the_Gulf_of_Nicoya.jpg"}, "hotel-suenosdelbosque": {"title": "File:Neil på Dantica lodge Savegre-0729 - Flickr - Ragnhild & Neil Crawford.jpg", "credit": "Ragnhild&amp;Neil Crawford from Sweden", "license": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:Neil_p%C3%A5_Dantica_lodge_Savegre-0729_-_Flickr_-_Ragnhild_%26_Neil_Crawford.jpg"}, "hotel-rioticosafarilodge": {"title": "File:Jungle Safari Tents .jpg", "credit": "PLTRON", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Jungle_Safari_Tents_.jpg"}, "hotel-villasriomar": {"title": "File:Atardecer En Dominical (147159179).jpeg", "credit": "Esteban Saborío H", "license": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File:Atardecer_En_Dominical_(147159179).jpeg"}, "hotel-hotelvistaballena": {"title": "File:Parque Maritimo Ballena - panoramio.jpg", "credit": "Federico Mata", "license": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File:Parque_Maritimo_Ballena_-_panoramio.jpg"}, "hotel-cabinaslaspalmeras": {"title": "File:San Pedrillo.JPG", "credit": "Cephas", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:San_Pedrillo.JPG"}, "hotel-hotelplayabejuco": {"title": "File:Playa Bejuco Puntarenas Costa Rica 4806.JPG", "credit": "Jorge Antonio Leoni de León", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Playa_Bejuco_Puntarenas_Costa_Rica_4806.JPG"}, "hotel-hotelcostapacifica": {"title": "File:Atardecer en playa Esterillos, Costa Rica.jpg", "credit": "MariaAngela Picado", "license": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:Atardecer_en_playa_Esterillos,_Costa_Rica.jpg"}});
const V49_HOTEL_PHOTO={"Fleur de Lys": {"key": "hotel-fleurdelys", "what": "historisch Victoriaans huis in Barrio Amón, San José"}, "Atlantida Lodge": {"key": "hotel-atlantidalodge", "what": "lodge in Cahuita"}, "Lapa Verde Lodge": {"key": "hotel-lapaverdelodge", "what": "Laguna Lodge, Tortuguero"}, "Catarata Ecolodge": {"key": "hotel-catarataecolodge", "what": "cabin bij Arenal"}, "Faro Arenal": {"key": "hotel-faroarenal", "what": "houten cabin bij Arenal"}, "Eco Arenal": {"key": "hotel-ecoarenal", "what": "lodgetuin met uitzicht op de Arenal"}, "Cañon de la Vieja Lodge": {"key": "hotel-canondelaviejalodge", "what": "uitzicht vanaf een lodge in Guanacaste"}, "Rinconcito Lodge": {"key": "hotel-canondelaviejalodge", "what": "uitzicht vanaf een lodge in Guanacaste"}, "Hotel Los Cipreses": {"key": "hotel-hotelloscipreses", "what": "centrum van Santa Elena/Monteverde"}, "Claro de Luna": {"key": "hotel-clarodeluna", "what": "uitzicht vanaf Monteverde over de Golf van Nicoya"}, "Sueños del Bosque": {"key": "hotel-suenosdelbosque", "what": "lodge in de Savegre-vallei"}, "Rio Tico Safari Lodge": {"key": "hotel-rioticosafarilodge", "what": "vergelijkbare safaritent"}, "Villas Rio Mar": {"key": "hotel-villasriomar", "what": "kust bij Dominical"}, "Hotel Vista Ballena": {"key": "hotel-hotelvistaballena", "what": "Costa Ballena"}, "Cabinas Las Palmeras": {"key": "hotel-cabinaslaspalmeras", "what": "lodge San Pedrillo, Corcovado"}, "Hotel Playa Bejuco": {"key": "hotel-hotelplayabejuco", "what": "Playa Bejuco"}, "Hotel Costa Pacifica": {"key": "hotel-hotelcostapacifica", "what": "Playa Esterillos"}};
const v49PrevHotelCard=v48HotelCard;
v48HotelCard=function(h,d,n){let html=v49PrevHotelCard(h,d,n);const m=V49_HOTEL_PHOTO[h];if(!m)return html;
  return html.replace(/<img src="[^"]*" alt="" loading="lazy">/,`<figure class="v49-hfig"><img src="./photos/${m.key}.jpg" alt="Sfeerbeeld: ${esc(m.what)}" loading="lazy"><figcaption>Sfeerbeeld</figcaption></figure>`).replace('<a class="v48-link"',`<small class="v49-hnote">Foto: ${esc(m.what)} (vergelijkbare plek)</small><a class="v48-link"`)};

render();
