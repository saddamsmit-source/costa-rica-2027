/* v4.7 – Wildlife-database. Kans: 4 zeer groot, 3 groot, 2 redelijk, 1 klein. Moment: o vroege ochtend, d overdag, s schemer, n nacht, w vanaf het water */
const V47_SP={
/* Vogels */
'Resplendent quetzal':['Quetzal','Vogels','o','Feb–mrt is broedseizoen: let op wilde avocadobomen. Gids met telescoop maakt het verschil.'],
'Keel-billed toucan':['Zwavelborsttoekan','Vogels','o','Vaak in hoge, losse boomkruinen. Luister naar het krakende roepen.'],
'Yellow-throated toucan':['Geelkeeltoekan','Vogels','o','Grootste toekan van Costa Rica; roept een herkenbaar "dios-te-dé".'],
'Collared aracari':['Halsbandarassari','Vogels','d','Trekt in groepjes door het bos, vaak bij fruitbomen.'],
'Fiery-billed aracari':['Vuursnavelarassari','Vogels','d','Alleen aan de zuidelijke Pacifische kant. Groepjes in fruitbomen.'],
'Northern emerald-toucanet':['Smaragdtoekan','Vogels','o','Klein en groen, valt weg in het blad. Let op beweging in fruitbomen.'],
'Scarlet macaw':['Geelvleugelara','Vogels','o','Vaak eerst gehoord: luid gekrijs. Paren vliegen laag over bij zonsopkomst.'],
'Turquoise-browed motmot':['Wenkbrauwmotmot','Vogels','d','Zit stil op een tak en zwaait met de staart als een slinger.'],
'Lesson\'s motmot':['Blauwkruinmotmot','Vogels','o','Schaduwrijke bosranden; zit lang stil, goed fotografeerbaar.'],
'Three-wattled bellbird':['Lelklokvogel','Vogels','o','Luid metaalachtig "bonk" over grote afstand. Zien is lastig, horen bijna zeker.'],
'Long-tailed manakin':['Langstaartmanakin','Vogels','o','Mannetjes dansen in duo\'s in het onderhout. Gids kent de plekken.'],
'Orange-bellied trogon':['Oranjebuiktrogon','Vogels','o','Nevelwoud; zit stil op middenhoogte.'],
'Baird\'s trogon':['Bairds trogon','Vogels','o','Bijna endemisch voor de zuidelijke Pacifische kust.'],
'Black guan':['Zwarte guan','Vogels','o','Groot, zwart, blauw gezicht. Loopt vaak rustig over paden in nevelwoud.'],
'Great curassow':['Bruine hokko','Vogels','o','Grote bosvogel die op de grond loopt; in Corcovado opvallend tam.'],
'Crested guan':['Kuifsjakohoen','Vogels','o','Lawaaierige groepjes in de boomkruin.'],
'Black-cheeked ant-tanager':['Zwartwangmiertangare','Vogels','o','Alleen op het Osa-schiereiland. Volgt mierenkolonnes in het onderhout.'],
'Montezuma oropendola':['Montezuma-oropendola','Vogels','d','Hangende nesten in hoge bomen; borrelende zang.'],
'Passerini\'s tanager':['Passerini-tangare','Vogels','d','Zwart met felrode stuit, algemeen aan de Caribische kant.'],
'Blue-gray tanager':['Bisschopstangare','Vogels','d','Algemeen in tuinen en bosranden.'],
'Great kiskadee':['Grote kiskadie','Vogels','d','Geel-zwart-wit, roept zijn eigen naam. Overal.'],
'Clay-colored thrush':['Yigüirro (grauwe lijster)','Vogels','o','Nationale vogel van Costa Rica; zingt vooral in het droge seizoen.'],
'White-throated magpie-jay':['Witkeelekster','Vogels','d','Brutale, luidruchtige groepjes in droog bos. Komt dichtbij.'],
'Crested caracara':['Kuifcaracara','Vogels','d','Open land en weides; vaak langs de weg op een paal.'],
'Laughing falcon':['Lachvalk','Vogels','s','Zit lang stil op een kale tak; luide "lachende" roep in de schemer.'],
'King vulture':['Koningsgier','Vogels','d','Zoek in de lucht vanaf open plekken rond het middaguur.'],
'Roadside hawk':['Wegbuizerd','Vogels','d','Zit laag op palen en takken langs paden.'],
'Osprey':['Visarend','Vogels','w','Wintergast; boven rivieren en kust.'],
'Common black hawk':['Krabbenbuizerd','Vogels','w','Mangroven en kust; eet krabben.'],
'Roseate spoonbill':['Rode lepelaar','Vogels','w','Ondiep water; in het droge seizoen geconcentreerd.'],
'Jabiru':['Jabiru','Vogels','w','Grootste ooievaar van Amerika; Caño Negro is in het droge seizoen dé plek.'],
'Wood stork':['Kaalkopooievaar','Vogels','w','Groepen in ondiepe lagunes.'],
'Anhinga':['Slangenhalsvogel','Vogels','w','Zit met gespreide vleugels te drogen op takken boven water.'],
'Northern jacana':['Jacana','Vogels','w','Loopt over drijvende planten op lange tenen.'],
'Boat-billed heron':['Schuitbekreiger','Vogels','w','Overdag slapend in dichte oevervegetatie; gids weet waar.'],
'Agami heron':['Agamireiger','Vogels','w','Schuw en zeldzaam; in schaduwrijke smalle kanalen. Topwaarneming.'],
'Bare-throated tiger heron':['Naaktkeeltijgerroerdomp','Vogels','w','Staat doodstil op de oever; goed te fotograferen.'],
'Green ibis':['Groene ibis','Vogels','s','Natte bossen en oevers; roept in de schemer.'],
'Great egret':['Grote zilverreiger','Vogels','w','Algemeen langs water.'],
'Yellow-crowned night heron':['Geelkruinkwak','Vogels','w','Mangroven en kust; ook overdag actief.'],
'Sungrebe':['Amerikaanse fuutkoet','Vogels','w','Zwemt laag langs overhangende oevers in smalle kanalen.'],
'Ringed kingfisher':['Amerikaanse reuzenijsvogel','Vogels','w','Grootste ijsvogel; luide ratel boven het water.'],
'Green kingfisher':['Groene ijsvogel','Vogels','w','Klein, laag boven het water op takjes.'],
'Amazon kingfisher':['Amazone-ijsvogel','Vogels','w','Lijkt op groene ijsvogel maar groter.'],
'American pygmy kingfisher':['Dwergijsvogel','Vogels','w','Piepklein; op lage takjes in donkere kanalen.'],
'Nicaraguan grackle':['Nicaraguaanse troepiaal','Vogels','w','Heel klein verspreidingsgebied; Caño Negro is een van de weinige plekken.'],
'Mangrove hummingbird':['Mangrovekolibrie','Vogels','o','Endemisch voor Costa Rica; alleen in Pacifische mangroven.'],
'Fiery-throated hummingbird':['Vuurkeelkolibrie','Vogels','d','Hooglanden; kleuren alleen zichtbaar in direct licht.'],
'Talamanca hummingbird':['Talamancakolibrie','Vogels','d','Grote donkere kolibrie van de hooglanden.'],
'Volcano hummingbird':['Vulkaankolibrie','Vogels','d','Een van de kleinste vogels van het land.'],
'Violet sabrewing':['Violette sabelvleugel','Vogels','d','Grootste kolibrie van Monteverde; dominant bij voederplekken.'],
'Coppery-headed emerald':['Koperkopsmaragdkolibrie','Vogels','d','Endemisch voor Costa Rica.'],
'Purple-throated mountain-gem':['Purperkeelbergjuweel','Vogels','d','Nevelwoud; algemeen bij voederplekken.'],
'Green hermit':['Groene heremietkolibrie','Vogels','d','Lange gebogen snavel; bezoekt heliconia\'s.'],
'Rufous-tailed hummingbird':['Roodstaartamazilia','Vogels','d','Algemeenste kolibrie van het laagland.'],
'Long-tailed silky-flycatcher':['Langstaartzijdevliegenvanger','Vogels','o','Elegante grijsgele vogel; groepjes in boomtoppen in de hooglanden.'],
'Flame-colored tanager':['Vlamtangare','Vogels','o','Fel oranjerood; bosranden in de hooglanden.'],
'Acorn woodpecker':['Eikelspecht','Vogels','d','Eikenbossen; slaat eikels op in gaten in bomen.'],
'Brown pelican':['Bruine pelikaan','Vogels','w','Formaties laag boven de branding.'],
'Magnificent frigatebird':['Amerikaanse fregatvogel','Vogels','w','Zweeft hoog boven de kust zonder vleugelslag.'],
'Brown booby':['Bruine gent','Vogels','w','Op zee, vaak op rotsen en boeien.'],
'Royal tern':['Koningsstern','Vogels','w','Stranden en riviermondingen.'],
'Whimbrel':['Regenwulp','Vogels','d','Wintergast op stranden en wadplaten.'],
/* Zoogdieren */
'Brown-throated three-toed sloth':['Drievingerige luiaard','Zoogdieren','d','Hangt in cecropia-bomen. Gids met telescoop vindt ze sneller dan jij.'],
'Hoffmann\'s two-toed sloth':['Tweevingerige luiaard','Zoogdieren','n','Overdag een bruine bal in de kruin; \'s nachts actiever.'],
'Mantled howler monkey':['Mantelbrulaap','Zoogdieren','o','Brult bij zonsopkomst, kilometers ver te horen.'],
'White-faced capuchin':['Witschouderkapucijnaap','Zoogdieren','d','Nieuwsgierig en snel. Let op je tas en eten.'],
'Central American spider monkey':['Geoffroy-slingeraap','Zoogdieren','o','Hoog in de kruin, slingert met de staart.'],
'Central American squirrel monkey':['Doodshoofdaapje','Zoogdieren','d','Alleen in het zuidwesten. Snelle groepen op lage hoogte.'],
'White-nosed coati':['Witsnuitneusbeer','Zoogdieren','d','Groepen vrouwtjes met jongen scharrelen over de grond.'],
'Central American agouti':['Agoeti','Zoogdieren','d','Knaagdier dat schichtig over de bosbodem rent.'],
'Northern tamandua':['Boommiereneter','Zoogdieren','d','Klimt in bomen op zoek naar mieren- en termietennesten.'],
'Kinkajou':['Kinkajoe (rolstaartbeer)','Zoogdieren','n','Nachtwandeling: oogreflectie hoog in de bomen.'],
'Baird\'s tapir':['Midden-Amerikaanse tapir','Zoogdieren','o','Rust overdag in modderpoelen en beekjes. Sirena geeft de beste kans.'],
'White-lipped peccary':['Witlippekari','Zoogdieren','d','Grote groepen; ruik ze vaak voordat je ze ziet. Afstand houden.'],
'Collared peccary':['Halsbandpekari','Zoogdieren','d','Kleine groepjes op de bosbodem.'],
'Northern raccoon':['Wasbeer','Zoogdieren','s','Op stranden en bij lodges.'],
'Variegated squirrel':['Bonte eekhoorn','Zoogdieren','d','Grote eekhoorn met wisselende kleuren.'],
'Proboscis bat':['Snuitvleermuis','Zoogdieren','w','Rusten overdag in een rijtje op boomstammen boven het water.'],
'Tent-making bat':['Tentvleermuis','Zoogdieren','d','Hangen onder een omgebogen palmblad. Gids weet waar.'],
'Humpback whale':['Bultrug','Zeeleven','w','Noordelijke populatie is er dec–apr. Rustige zee in de ochtend.'],
'Pantropical spotted dolphin':['Slanke dolfijn','Zeeleven','w','Grote groepen die met de boeg meezwemmen.'],
'Common bottlenose dolphin':['Tuimelaar','Zeeleven','w','Kleinere groepen dichter bij de kust.'],
/* Reptielen */
'Spectacled caiman':['Brilkaaiman','Reptielen','w','Ligt op oevers en drijvende stammen.'],
'American crocodile':['Spitssnuitkrokodil','Reptielen','w','Tárcoles heeft een van de dichtste populaties van Midden-Amerika.'],
'Green iguana':['Groene leguaan','Reptielen','d','Zont hoog in bomen boven rivieren.'],
'Black spiny-tailed iguana':['Zwarte leguaan','Reptielen','d','Droog bos en rotsen; zont op warme stenen.'],
'Common basilisk':['Gewone basilisk','Reptielen','d','"Jezus-hagedis": rent over het water.'],
'Green basilisk':['Groene basilisk','Reptielen','w','Felgroen; zit op takken boven kanalen.'],
'Eyelash viper':['Wimperlanspuntslang','Reptielen','d','Giftig. Geel of groen, opgerold op takken. Alleen kijken met gids.'],
'Side-striped palm-pitviper':['Gestreepte palmlanspuntslang','Reptielen','n','Giftig. Groen, nachtwandeling in nevelwoud.'],
'Green sea turtle':['Soepschildpad','Zeeleven','w','Grazen bij de rotsen; rustig zwemmen, niet achterna gaan.'],
'Hawksbill sea turtle':['Karetschildpad','Zeeleven','w','Op het rif; puntige snavel.'],
'Olive ridley sea turtle':['Warana','Zeeleven','w','Drijft soms aan het oppervlak tijdens boottochten.'],
/* Amfibieën */
'Red-eyed tree frog':['Roodoogmakikikker','Amfibieën','n','Nachtwandeling bij water en vijvers.'],
'Strawberry poison dart frog':['Aardbeigifkikker','Amfibieën','d','Rood met blauwe poten ("blue jeans"). Op de bosbodem, vooral na regen.'],
'Green-and-black poison dart frog':['Groen-zwarte gifkikker','Amfibieën','d','Op de bosbodem bij vochtige plekken.'],
'Glass frog':['Glaskikker','Amfibieën','n','Doorzichtige buik; op bladeren boven beekjes.'],
/* Zeeleven */
'Whitetip reef shark':['Witpuntrifhaai','Zeeleven','w','Rust op de bodem onder overhangende rotsen. Ongevaarlijk.'],
'Spotted eagle ray':['Gevlekte adelaarsrog','Zeeleven','w','"Vliegt" door het water in kleine groepen.'],
'Tropical reef fish':['Tropische rifvissen','Zeeleven','w','Scholen bij het rif rond Isla del Caño.'],
/* Insecten */
'Blue morpho':['Blauwe morpho','Insecten','d','Grote metallic-blauwe vlinder; landt zelden met open vleugels.'],
'Leafcutter ants':['Bladsnijdersmieren','Insecten','d','Lange rijen mieren met stukjes blad over het pad.'],
'Tarantula':['Vogelspin','Insecten','n','Nachtwandeling: zit bij de ingang van een hol in de berm.']
};

const V47_PLACES={
'San José':[['Clay-colored thrush',4],['Great kiskadee',4],['Blue-gray tanager',4],['Rufous-tailed hummingbird',3],['Crested caracara',2]],
'Cahuita':[['Brown-throated three-toed sloth',4],['Hoffmann\'s two-toed sloth',3],['Mantled howler monkey',4],['White-faced capuchin',4],['White-nosed coati',3],['Northern raccoon',3],['Collared aracari',3],['Keel-billed toucan',3],['Montezuma oropendola',4],['Passerini\'s tanager',4],['Green ibis',2],['Eyelash viper',2],['Strawberry poison dart frog',3],['Red-eyed tree frog',2],['Tent-making bat',2],['Green iguana',3],['Blue morpho',3],['Leafcutter ants',4]],
'Tortuguero':[['Spectacled caiman',4],['Mantled howler monkey',4],['Central American spider monkey',3],['White-faced capuchin',3],['Brown-throated three-toed sloth',3],['Proboscis bat',3],['Green basilisk',3],['Green iguana',4],['Boat-billed heron',3],['Agami heron',1],['Bare-throated tiger heron',3],['Sungrebe',2],['Anhinga',4],['Great egret',4],['Ringed kingfisher',4],['Amazon kingfisher',3],['Green kingfisher',3],['American pygmy kingfisher',2],['Keel-billed toucan',3],['Montezuma oropendola',4],['Red-eyed tree frog',3],['Strawberry poison dart frog',3],['Kinkajou',2]],
'La Fortuna':[['Roseate spoonbill',3],['Jabiru',2],['Wood stork',3],['Anhinga',4],['Northern jacana',4],['Nicaraguan grackle',3],['Bare-throated tiger heron',3],['Green kingfisher',3],['Ringed kingfisher',3],['Spectacled caiman',4],['Green iguana',4],['Mantled howler monkey',3],['Keel-billed toucan',3],['Montezuma oropendola',4],['Brown-throated three-toed sloth',2],['White-nosed coati',3],['Red-eyed tree frog',2]],
'Rincón de la Vieja':[['White-throated magpie-jay',4],['Turquoise-browed motmot',3],['Crested caracara',3],['Laughing falcon',2],['Keel-billed toucan',2],['Mantled howler monkey',4],['White-faced capuchin',3],['Central American spider monkey',2],['White-nosed coati',4],['Central American agouti',3],['Variegated squirrel',3],['Black spiny-tailed iguana',3],['Blue morpho',3]],
'Monteverde':[['Resplendent quetzal',2],['Three-wattled bellbird',2],['Long-tailed manakin',2],['Orange-bellied trogon',3],['Northern emerald-toucanet',3],['Black guan',3],['Lesson\'s motmot',3],['Violet sabrewing',4],['Coppery-headed emerald',4],['Purple-throated mountain-gem',4],['Green hermit',3],['White-nosed coati',3],['Central American agouti',4],['Hoffmann\'s two-toed sloth',2],['Kinkajou',2],['Side-striped palm-pitviper',2],['Glass frog',2],['Tarantula',3]],
'San Gerardo de Dota':[['Resplendent quetzal',4],['Fiery-throated hummingbird',4],['Talamanca hummingbird',4],['Volcano hummingbird',3],['Long-tailed silky-flycatcher',3],['Flame-colored tanager',3],['Acorn woodpecker',4],['Black guan',2]],
'Uvita':[['Humpback whale',3],['Pantropical spotted dolphin',3],['Common bottlenose dolphin',2],['Olive ridley sea turtle',2],['Magnificent frigatebird',4],['Brown pelican',4],['Brown booby',3],['Scarlet macaw',3],['Yellow-throated toucan',3],['Fiery-billed aracari',3],['Baird\'s trogon',2],['Mantled howler monkey',3],['White-faced capuchin',3],['Brown-throated three-toed sloth',2],['Green iguana',3]],
'Corcovado':[['Scarlet macaw',4],['Baird\'s tapir',3],['Central American spider monkey',4],['Central American squirrel monkey',3],['Mantled howler monkey',4],['White-faced capuchin',4],['White-nosed coati',4],['Collared peccary',3],['White-lipped peccary',2],['Northern tamandua',2],['Central American agouti',4],['Great curassow',3],['Crested guan',3],['Black-cheeked ant-tanager',3],['Baird\'s trogon',3],['Fiery-billed aracari',3],['Yellow-throated toucan',3],['King vulture',2],['Spectacled caiman',3],['American crocodile',2],['Green-and-black poison dart frog',3],['Boat-billed heron',2],['Common black hawk',3],['Green sea turtle',3],['Hawksbill sea turtle',2],['Whitetip reef shark',3],['Spotted eagle ray',2],['Tropical reef fish',4]],
'Esterillos':[['Brown pelican',4],['Magnificent frigatebird',4],['Osprey',3],['Royal tern',3],['Whimbrel',3],['Great egret',3],['Scarlet macaw',2],['Green iguana',3]],
'Manuel Antonio':[['Central American squirrel monkey',3],['White-faced capuchin',4],['Mantled howler monkey',4],['Brown-throated three-toed sloth',4],['Hoffmann\'s two-toed sloth',3],['White-nosed coati',3],['Northern raccoon',4],['Fiery-billed aracari',3],['Yellow-throated toucan',2],['Green iguana',4],['Common basilisk',3],['Green-and-black poison dart frog',2],['Tent-making bat',2],['Brown pelican',4]],
'Tárcoles':[['American crocodile',4],['Scarlet macaw',3],['Roseate spoonbill',3],['Wood stork',3],['Boat-billed heron',3],['Yellow-crowned night heron',3],['Mangrove hummingbird',2],['Common black hawk',3],['Osprey',3],['Ringed kingfisher',3],['Green iguana',3]]
};

/* Focus per dag: soorten gekoppeld aan de activiteiten van die dag */
const V47_FOCUS={
2:{label:'Onderweg naar de Caribische kust',list:['Keel-billed toucan','Montezuma oropendola','Mantled howler monkey']},
3:{label:'Cahuita National Park met natuurgids',list:['Brown-throated three-toed sloth','Mantled howler monkey','White-faced capuchin','Eyelash viper','Collared aracari','Strawberry poison dart frog']},
4:{label:'Boottransfer La Pavona → Tortuguero',list:['Spectacled caiman','Anhinga','Ringed kingfisher','Green iguana','Great egret']},
5:{label:'Kanotocht, regenwoudwandeling en nachtwandeling',list:['Boat-billed heron','Agami heron','Sungrebe','American pygmy kingfisher','Proboscis bat','Green basilisk','Central American spider monkey','Red-eyed tree frog']},
6:{label:'Boot terug naar La Pavona',list:['Spectacled caiman','Anhinga','Bare-throated tiger heron']},
7:{label:'Caño Negro boottocht',list:['Roseate spoonbill','Jabiru','Nicaraguan grackle','Northern jacana','Wood stork','Anhinga','Spectacled caiman']},
8:{label:'Aankomst in droog tropisch bos',list:['White-throated magpie-jay','Crested caracara','White-nosed coati']},
9:{label:'Las Pailas en Oropéndola-waterval',list:['Turquoise-browed motmot','White-nosed coati','Mantled howler monkey','White-faced capuchin','Black spiny-tailed iguana','Blue morpho']},
10:{label:'Aankomst Monteverde',list:['Violet sabrewing','Coppery-headed emerald','Purple-throated mountain-gem']},
11:{label:'Sky Walk, canopy en night walk',list:['Orange-bellied trogon','Northern emerald-toucanet','Black guan','Kinkajou','Hoffmann\'s two-toed sloth','Side-striped palm-pitviper','Tarantula','Glass frog']},
12:{label:'Curi-Cancha birdingtour',list:['Resplendent quetzal','Three-wattled bellbird','Long-tailed manakin','Lesson\'s motmot','Orange-bellied trogon','Central American agouti']},
13:{label:'Vogelobservatie rond Sueños del Bosque',list:['Fiery-throated hummingbird','Talamanca hummingbird','Volcano hummingbird','Long-tailed silky-flycatcher','Acorn woodpecker']},
14:{label:'Quetzaltour en aankomst aan de Pacifische kust',list:['Resplendent quetzal','Flame-colored tanager','Scarlet macaw','Yellow-throated toucan','Fiery-billed aracari']},
15:{label:'Whale watching Marino Ballena',list:['Humpback whale','Pantropical spotted dolphin','Common bottlenose dolphin','Olive ridley sea turtle','Brown booby','Magnificent frigatebird']},
16:{label:'Boot door de Sierpe-mangroven',list:['Common black hawk','Boat-billed heron','American crocodile','Scarlet macaw']},
17:{label:'Corcovado NP met gids',list:['Baird\'s tapir','Scarlet macaw','Central American spider monkey','Central American squirrel monkey','White-lipped peccary','Great curassow','Black-cheeked ant-tanager','Northern tamandua']},
18:{label:'Snorkelen bij Isla del Caño',list:['Green sea turtle','Hawksbill sea turtle','Whitetip reef shark','Spotted eagle ray','Tropical reef fish','Pantropical spotted dolphin']},
19:{label:'Strand Esterillos',list:['Brown pelican','Magnificent frigatebird','Whimbrel','Royal tern']},
20:{label:'Manuel Antonio NP met natuurgids',list:['Central American squirrel monkey','Brown-throated three-toed sloth','White-faced capuchin','Fiery-billed aracari','Common basilisk','Green iguana']},
21:{label:'Tárcoles krokodillenbrug en boottocht',list:['American crocodile','Scarlet macaw','Roseate spoonbill','Boat-billed heron','Mangrove hummingbird']}
};

const V47_CHANCE={4:['Zeer grote kans','c4'],3:['Grote kans','c3'],2:['Redelijke kans','c2'],1:['Kleine kans','c1']};
const V47_MOMENT={
  o:['Vroege ochtend','<path d="M12 3v3M4.2 8.2l1.4 1.4M19.8 8.2l-1.4 1.4M2 17h2M20 17h2"/><path d="M6 17a6 6 0 0 1 12 0"/><path d="M2 21h20"/>'],
  d:['Overdag','<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'],
  s:['Schemer','<path d="M6 17a6 6 0 0 1 12 0"/><path d="M12 7v3M2 21h20M2 17h3M19 17h3"/><path d="M9 4l3 3 3-3"/>'],
  n:['Nacht','<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'],
  w:['Vanaf het water','<path d="M2 12c2 0 2-1.5 4-1.5S8 12 10 12s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><path d="M2 17c2 0 2-1.5 4-1.5S8 17 10 17s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/>']
};
const V47_CAT_ICON={
  'Vogels':V46_ICONS.bird,
  'Zoogdieren':'<circle cx="7" cy="6" r="1.6"/><circle cx="12" cy="4" r="1.6"/><circle cx="17" cy="6" r="1.6"/><circle cx="19.5" cy="11" r="1.5"/><path d="M12 11c-3.5 0-6 3.2-6 6 0 2.2 2.5 3.4 6 2 3.5 1.4 6 .2 6-2 0-2.8-2.5-6-6-6z"/>',
  'Reptielen':'<path d="M4 18c2-2 4-1 6-3s1-5 4-6 5 1 6-1"/><path d="M18 6c1.5-1 3-.5 3 1s-1.5 2-3 1"/><path d="M8 16l-2 3M12 13l2 3M6 12l-2-1M14 9l1-3"/>',
  'Amfibieën':'<path d="M5 14c0-4 3-7 7-7s7 3 7 7c0 2-1.5 4-7 4s-7-2-7-4z"/><circle cx="8.5" cy="7.5" r="2"/><circle cx="15.5" cy="7.5" r="2"/><path d="M5 18l-2 2M19 18l2 2"/>',
  'Zeeleven':'<path d="M2 12c3-4 7-5 11-4 3 .7 5 2.5 7 4-2 1.5-4 3.3-7 4-4 1-8 0-11-4z"/><path d="M20 12l2-3v6z"/><circle cx="7.5" cy="11" r=".8"/>',
  'Insecten':'<path d="M12 6v14"/><path d="M12 9C9 4 3 4 3 8s4 6 9 4"/><path d="M12 9c3-5 9-5 9-1s-4 6-9 4"/><path d="M12 13c-3 0-6 2-5 5s4 1 5-2M12 13c3 0 6 2 5 5s-4 1-5-2"/><path d="M10 4l2 2 2-2"/>'
};
let v47Filter='Alle';

function v47Region(d){if(d.id===21)return 'Tárcoles';const p=(d.place||'').toLowerCase();if(p.includes('manuel'))return 'Manuel Antonio';return v43place(d.place)}
function v47Info(name){const s=V47_SP[name];return s?{en:name,nl:s[0],cat:s[1],moment:s[2],tip:s[3]}:{en:name,nl:name,cat:'Zelf toegevoegd',moment:'',tip:''}}
function v47Chance(region,name){const r=(V47_PLACES[region]||[]).find(x=>x[0]===name);return r?r[1]:0}
function v47Obs(name,region){const o=state.v43Observations[v43name(name)];return {here:o?.places?.[region]||{},other:Object.entries(o?.places||{}).filter(([p,v])=>p!==region&&(v.seen||v.photo)).map(([p])=>p)}}
function v47Svg(inner,size){return `<svg viewBox="0 0 24 24" width="${size||20}" height="${size||20}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`}

function v47Card(name,region,focus){
  const i=v47Info(name),ch=v47Chance(region,name)||(focus?2:0),o=v47Obs(name,region),seen=!!o.here.seen,photo=!!o.here.photo,m=V47_MOMENT[i.moment];
  const enc=encodeURIComponent(name),pl=encodeURIComponent(region);
  return `<div class="v43-species v47-sp ${seen?'is-seen':''}" data-v47-cat="${esc(i.cat)}">
    <div class="v47-top">
      <div class="v47-ico cat-${esc(i.cat).toLowerCase().replace(/[^a-z]/g,'')}">${v47Svg(V47_CAT_ICON[i.cat]||V46_ICONS.pin,24)}</div>
      <div class="v47-names"><strong>${esc(i.nl)}</strong>${i.nl!==i.en?`<em>${esc(i.en)}</em>`:''}</div>
      ${ch?`<span class="v47-chance ${V47_CHANCE[ch][1]}">${V47_CHANCE[ch][0]}</span>`:''}
    </div>
    <div class="v47-meta">${m?`<span class="v47-moment">${v47Svg(m[1],14)}${m[0]}</span>`:''}${o.other.length?`<span class="v47-prev">✓ Eerder gezien: ${esc(o.other.join(', '))}</span>`:''}</div>
    ${i.tip?`<div class="v47-tip">${esc(i.tip)}</div>`:''}
    <div class="v43-buttons">
      <button class="${seen?'on':''}" data-v43-species="${enc}" data-v43-kind="seen" data-v43-place="${pl}">${v47Svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',16)} ${seen?'Gezien':'Gezien?'}</button>
      <button class="${photo?'on':''}" data-v43-species="${enc}" data-v43-kind="photo" data-v43-place="${pl}">${v47Svg(V46_ICONS.camera,16)} ${photo?'Op foto':'Foto?'}</button>
    </div></div>`}

function v47RegionNames(d){
  const region=v47Region(d),base=(V47_PLACES[region]||[]).map(x=>x[0]);
  const extras=[...new Set([...(state.v43Extras[region]||[]),...(state.v43Extras[v43place(d.place)]||[])])];
  return {region,base,extras};
}

speciesList=function(d){
  const {region,base,extras}=v47RegionNames(d),focusDef=V47_FOCUS[d.id],focus=focusDef?focusDef.list:[];
  const rest=base.filter(n=>!focus.includes(n)).sort((a,b)=>v47Chance(region,b)-v47Chance(region,a));
  const all=[...new Set([...focus,...base,...extras])];
  const seenHere=all.filter(n=>v47Obs(n,region).here.seen).length,photoHere=all.filter(n=>v47Obs(n,region).here.photo).length,st=v43Stats();
  const cats=['Alle',...new Set(all.map(n=>v47Info(n).cat)),'Nog niet gezien'];
  const pass=n=>v47Filter==='Alle'||(v47Filter==='Nog niet gezien'?!v47Obs(n,region).here.seen&&!v47Obs(n,region).other.length:v47Info(n).cat===v47Filter);
  const byCat={};rest.filter(pass).forEach(n=>{(byCat[v47Info(n).cat]??=[]).push(n)});
  const order=['Vogels','Zoogdieren','Reptielen','Amfibieën','Zeeleven','Insecten'];
  const focusShown=focus.filter(pass),extrasShown=extras.filter(n=>!focus.includes(n)&&!base.includes(n)).filter(pass);
  if(!all.length)return `<div class="card"><div class="v46-h">${v47Svg(V47_CAT_ICON.Vogels,20)}Wildlife</div><p class="hint">Reisdag zonder wildlife-focus.</p></div>`;
  return `
  <div class="card v47-head">
    <div class="v46-h">${v47Svg(V47_CAT_ICON.Vogels,20)}Wildlife · ${esc(region)}</div>
    <div class="v46-stats">
      <div class="v46-stat"><b>${all.length}</b><span>doelsoorten</span></div>
      <div class="v46-stat"><b>${seenHere}</b><span>gezien hier</span></div>
      <div class="v46-stat"><b>${photoHere}</b><span>op foto hier</span></div>
      <div class="v46-stat"><b>${st.seen}</b><span>reis totaal</span></div>
    </div>
    <div class="v47-filter">${cats.map(c=>`<button data-v47-filter="${esc(c)}" class="${v47Filter===c?'on':''}">${esc(c)}</button>`).join('')}</div>
  </div>
  ${focusShown.length?`<div class="card v47-focus"><div class="v47-focus-h"><span>Focus vandaag</span><small>${esc(focusDef.label)}</small></div>${focusShown.map(n=>v47Card(n,region,true)).join('')}</div>`:''}
  ${Object.keys(byCat).length||extrasShown.length?`<div class="card"><div class="v47-focus-h"><span>Meer in deze regio</span><small>Gesorteerd op kans</small></div>
    ${order.filter(c=>byCat[c]).map(c=>`<h4 class="v47-cat-h">${esc(c)} · ${byCat[c].length}</h4>${byCat[c].map(n=>v47Card(n,region,false)).join('')}`).join('')}
    ${extrasShown.length?`<h4 class="v47-cat-h">Zelf toegevoegd · ${extrasShown.length}</h4>${extrasShown.map(n=>v47Card(n,region,false)).join('')}`:''}
  </div>`:''}
  ${!focusShown.length&&!Object.keys(byCat).length&&!extrasShown.length?'<div class="card"><p class="hint">Niets in dit filter.</p></div>':''}
  <div class="card"><div class="v43-add"><input id="v43NewSpecies" maxlength="90" placeholder="Eigen waarneming toevoegen" aria-label="Nieuwe soort"><button id="v43AddSpecies">+ Toevoegen</button></div>
  <p class="hint" style="margin:10px 0 0">Kansen zijn een inschatting voor februari–maart met gids, geen garantie. Gebruik Merlin Bird ID voor determinatie op geluid.</p></div>`;
};

/* tellers en reisbrede lijsten laten aansluiten op de nieuwe data */
v46SpeciesCount=function(d){const {base,extras}=v47RegionNames(d),f=(V47_FOCUS[d.id]||{}).list||[];return new Set([...f,...base,...extras]).size};
(function(){
  for(const k of Object.keys(V43_TARGETS))delete V43_TARGETS[k];
  for(const [region,list] of Object.entries(V47_PLACES)){const g={};list.forEach(([n])=>{(g[v47Info(n).cat]??=[]).push(n)});V43_TARGETS[region]=g}
  for(const d of S){const f=V47_FOCUS[d.id];if(f)d.wildlife=f.list.map(n=>v47Info(n).nl)}
})();

const v47PrevBind=bindExtras;
bindExtras=function(){
  v47PrevBind();
  document.querySelectorAll('[data-v47-filter]').forEach(b=>b.onclick=()=>{v47Filter=b.dataset.v47Filter;render()});
  const add=document.getElementById('v43AddSpecies');
  if(add&&tab==='days'&&daySection==='wildlife')add.onclick=()=>{const input=document.getElementById('v43NewSpecies'),name=input.value.trim(),d=S[currentDay-1],region=v47Region(d);if(!name)return;state.v43Extras[region]??=[];const {base,extras}=v47RegionNames(d);if(![...base,...extras].some(n=>v43name(n)===v43name(name)))state.v43Extras[region].push(name);save();render()};
};
const v47PrevDayMove=dayMove;
dayMove=function(n){v47Filter='Alle';v47PrevDayMove(n)};
