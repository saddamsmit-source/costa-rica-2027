/* =====================================================================
   v8.1 · Paklijst uitgebreid: wat minimaal vanuit Nederland mee moet
   Bestaande items en hun vinkjes blijven staan (sleutels groep-item ongewijzigd);
   nieuwe groepen komen achteraan in V48_PACK en worden in een logische volgorde getoond.
   Bronnen: ANWB Costa Rica (reisdocumenten, praktisch ter plaatse): 120 V, stekker type A/B,
   geen visum tot 180 dagen, bewijs van vertrek op verzoek, DTP en hepatitis A aanbevolen.
   ===================================================================== */
V48_PACK[0][0]='Basis';
const V81_NEW=[
 ['Documenten en geld',['Reisverzekering: polisnummer en alarmnummer (telefoon én papier)','Vluchtgegevens en retourticket offline (douane kan om bewijs van vertrek vragen)','Sawadee-reisbescheiden en vouchers offline','Noodnummer Sawadee opgeslagen (staat in de reisbescheiden)','Tweede betaalkaart (Visa of Mastercard), apart bewaard','Pinpas op "wereld" gezet in de bankapp','Vaccinatieboekje (DTP en hepatitis A aanbevolen)']],
 ['Elektra',['Tweede verloopstekker type A/B (één per persoon)','Laders: controleer "100–240 V" (Costa Rica heeft 120 V)','USB-C-lader met meerdere poorten','Klein NL-stekkerblok achter de verloopstekker (alleen voor laders 100–240 V)','Powerbank (handbagage, max. 100 Wh)','Camera-acculader en kabels','Kaartlezer en externe SSD voor foto-back-up','Laptop of tablet + lader (optioneel)','Föhn of stijltang alleen als die 120 V aankan']],
 ['Badkamer en verzorging',['Tandenborstel, tandpasta, floss','Deodorant','Shampoo en douchegel (liefst biologisch afbreekbaar)','After-sun of aloë vera','Lippenbalsem met SPF','Zonnebril','Scheerspullen','Nagelknipper en pincet (ruimbagage)','Kam of borstel, elastiekjes','Zakdoekjes en wc-papier voor onderweg','Handgel','Sneldrogende microvezelhanddoek','Reiswasmiddel en waslijntje','Bril of lenzen + reserve']],
 ['Medicijnen en EHBO',['Eigen medicijnen + Engelstalig medicijnpaspoort (handbagage)','Paracetamol of ibuprofen','ORS (zakjes tegen uitdroging)','Loperamide (diarree)','Antihistamine en verkoelende crème voor muggenbulten','Pleisters en blarenpleisters','Desinfectiemiddel (jodium)','Tekentang','Middel tegen reisziekte (boottochten)','Waterzuiveringstabletten of filterfles (kraanwater niet overal drinkbaar)']],
 ['Schoeisel',['Stevige, waterdichte wandelschoenen (ingelopen)','Trekkingsandalen voor rivier en strand','Slippers voor douche en lodge','Extra sokken (merino of sneldrogend)']],
 ['Kleding',['Sneldrogende T-shirts','Lichte lange broek','Lange mouwen in lichte kleur (muggen)','Korte broek','Zwemkleding','Zonnehoed of pet','Ondergoed','Warme slaapkleding (San Gerardo is \'s nachts koud)','Pakzakken of ziplocks voor natte kleding']],
 ['Handig onderweg',['Dagrugzak 20–30 L met regenhoes','Verrekijker (bijv. 8×42)','Ziplockzakken voor telefoon en papieren','Oordopjes en slaapmasker','Nekkussen voor de vlucht','Pen (formulieren bij aankomst)','Bagageslotje (TSA)']]
];
V81_NEW.forEach(g=>{if(!V48_PACK.some(x=>x[0]===g[0]))V48_PACK.push(g)});
/* weergavevolgorde: eerst wat altijd mee moet, dan per bestemming */
const V81_ORDER=()=>{const idx=n=>V48_PACK.findIndex(g=>g[0]===n);return ['Documenten en geld','Basis','Elektra','Badkamer en verzorging','Medicijnen en EHBO','Schoeisel','Kleding','Handig onderweg','Camera'].map(idx).filter(i=>i>=0).concat(V48_PACK.map((_,i)=>i)).filter((v,i,a)=>a.indexOf(v)===i)};
{const prev=dsdPack;dsdPack=function(){const h=prev(),box=document.createElement('div');box.innerHTML=h;const accs=box.querySelector('.ds-accs');if(!accs)return h;
  const by={};accs.querySelectorAll('[data-v49-acc]').forEach(e=>by[e.dataset.v49Acc]=e);accs.innerHTML='';V81_ORDER().forEach(i=>{if(by[i])accs.append(by[i])});
  return box.innerHTML.replace('<div class="ds-card ds-accs">','<p class="ds-meta v81-hint">Eerst wat altijd mee moet vanuit Nederland, daarna per bestemming.</p><div class="ds-card ds-accs">')}}
