/* =====================================================================
   v8.0 · Eén kansschaal voor wildlife
   Per dier per plek precies één label, overal dezelfde woorden:
     4 Zeer makkelijk · 3 Makkelijk · 2 Meer kans met gids · 1 Zeldzaam
   - kans 1 (soort komt er wel voor, maar zelden) telt nu overal mee, niet alleen in het soortvenster;
   - doelsoorten zonder gegevens krijgen geen verzonnen "redelijke kans" meer;
   - beschrijvingen zeggen niets meer over hoe vaak een soort voorkomt: dat doet alleen het label;
   - 5 soorten één stap lager: eBird-cijfers komen van vogelaars die er gericht naar zoeken.
   ===================================================================== */
const V80_CH={4:'Zeer makkelijk',3:'Makkelijk',2:'Meer kans met gids',1:'Zeldzaam'};
const V80_CH_UIT={4:'Zie je bijna altijd',3:'Zie je vaak',2:'Lukt vooral met een gids of wat geluk',1:'Alleen met veel geluk'};
Object.assign(DS_CHANCE_TXT,V80_CH);Object.assign(WL21_CHANCE,V80_CH);Object.assign(WL21_CHANCE_SHORT,V80_CH);
for(const k of [1,2,3,4])V47_CHANCE[k][0]=V80_CH[k];

/* 5 soorten: gericht gezocht door vogelaars, voor jullie realistischer met gids (ook vastgelegd in chance_overrides.json) */
const V80_DOWN={'Agami heron':'La Fortuna','Nicaraguan seed-finch':'La Fortuna','Black-crested coquette':'La Fortuna','Lesser ground-cuckoo':'Rincón de la Vieja','Double-striped thick-knee':'Tárcoles'};
for(const [n,reg] of Object.entries(V80_DOWN)){const r=(V47_PLACES[reg]||[]).find(x=>x[0]===n);if(r&&r[1]>2)r[1]=2}

/* kans 1 (r1) overal meetellen */
v47Chance=function(region,name){const r=(V47_PLACES[region]||[]).find(x=>x[0]===name);if(r)return r[1];const w=typeof wl2==='function'?wl2(name):null;return w&&(w.r1||[]).includes(region)?1:0};

/* beschrijvingen zonder uitspraken over hoe vaak een soort voorkomt */
const V80_CLEAN=[
 [/^Zelden gezien, vaker sporen$/,'Meestal zie je alleen sporen'],[/^Zelden gezien, soms /,'Soms '],[/^Zeer zelden gezien; /,''],
 [/^Schuw en (zeldzaam|zelden gezien|moeilijk te zien)/,'Schuw'],[/schuw, snel en moeilijk te zien/,'schuw en snel'],[/zelden gezien door het verborgen leven/,'leeft verborgen'],
 [/^(Zeer )?(Zeldzaam|Uitzonderlijk)( om te zien)? en (\w+)/i,(m,a,b,c,w)=>w[0].toUpperCase()+w.slice(1)],
 [/^(Zeer )?(Zeldzaam|Uitzonderlijk)( om te zien)?[;:,.]\s*/i,''],[/^(Zeer )?(Zeldzaam|Uitzonderlijk)$/i,''],[/[;,]\s*in de hooglanden algemeen/,''],
 [/[;,]\s*(zeldzaam|minder algemeen)( maar mogelijk)?(?=[.;]|$)/g,''],[/;\s*zeldzaam maar mogelijk\s+/,'; '],[/;\s*zeldzaam te zien/,''],
 [/^(plaatselijk |zeer )?algemeen,?\s+/i,''],[/([;,]\s*)(plaatselijk |zeer )?algemeen,?\s+/g,'$1'],[/\s+algemeen(?=[.;]|$)/g,''],
 [/^zeldzaam$/,'']];
function v80Clean(t){if(!t)return t;const parts=t.split(/(?<=\.)\s+/).map(s=>{let x=s.trim(),dot=/\.$/.test(x);x=x.replace(/\.$/,'');for(const [re,to] of V80_CLEAN)x=x.replace(re,to);x=x.trim().replace(/^[;,:]\s*/,'');return x?(x[0].toUpperCase()+x.slice(1)+(dot?'.':'')):''});return parts.filter(Boolean).join(' ')}
Object.values(V47_SP).forEach(s=>{if(s[3])s[3]=v80Clean(s[3])});
if(typeof WL2!=='undefined')Object.values(WL2).forEach(r=>{if(r.l)r.l=v80Clean(r.l);if(r.h)r.h=v80Clean(r.h)});

/* daglijst: label in woorden naast de bolletjes, geen dubbel "zeldzaam" */
{const prev=v47Card;v47Card=function(name,region,focus){const ch=v47Chance(region,name);let h=prev(name,region,focus);
  h=h.replace(/<span class="ds-chance c\d"[^>]*>(?:<i[^>]*><\/i>){4}(?:<small>zeldzaam<\/small>)?/,ch?`<span class="ds-chance c${ch}" aria-label="${V80_CH[ch]}"><span class="v80-dots">${[1,2,3,4].map(n=>`<i class="${n<=ch?'f':''}"></i>`).join('')}</span><b class="v80-ch">${V80_CH[ch]}</b>`:'<span class="ds-chance v80-none">');
  if(!ch)h=h.replace(/<span class="ds-chance v80-none">(?:<small class="sz">seizoen<\/small>)?<\/span>/,m=>m.includes('seizoen')?'<span class="ds-chance"><small class="sz">seizoen</small></span>':'');
  h=h.replace(/(<div class="ds-chips">)<span>(Zeer makkelijk|Makkelijk|Meer kans met gids|Zeldzaam|Redelijke kans|Grote kans|Zeer grote kans|Kleine kans)<\/span>/,`$1${ch?`<span>${V80_CH[ch]}</span>`:''}`);
  return h}}

/* soortvenster: legenda als vaste uitleg, geen lopende zin */
const V80_LEGEND=`<div class="v80-legend" role="note"><b>Wat betekent het label?</b>${[4,3,2,1].map(c=>`<div><span class="ds-chance c${c}">${[1,2,3,4].map(n=>`<i class="${n<=c?'f':''}"></i>`).join('')}</span><span><b>${V80_CH[c]}</b><small>${V80_CH_UIT[c]}</small></span></div>`).join('')}</div>`;
{const prev=wl2Bars;wl2Bars=function(name,region){let h=prev(name,region);if(!h)return h;
  h=h.replace(/<small>Zeldzaam \/ uitzonderlijk/g,'<small>Zeldzaam').replace(/<p class="wl2-src wl21-legend">[\s\S]*?<\/p>/,'');
  return h+V80_LEGEND}}
{const prev=wl2SheetHtml;wl2SheetHtml=function(name,region){let h=prev(name,region);const ch=v47Chance(region,name);
  h=h.replace(/<span>(Zeer makkelijk|Makkelijk|Meer kans met gids|Zeldzaam) hier<\/span>/,'');
  if(ch)h=h.replace(/(<div class="ds-chips">)/,`$1<span class="v80-here c${ch}">${esc(region)}: ${V80_CH[ch]}</span>`);
  return h.replace(/Kansen zijn een kwalitatieve inschatting voor jullie excursie in februari \(([^)]*)\)/,"Labels zijn een inschatting voor jullie excursie in februari ($1)")}}

/* doelsoorten vandaag: zonder gegevens geen label verzinnen */
{const prev=speciesList;speciesList=function(d){return prev(d).replace(/<small>Focus vandaag<\/small>/g,'<small>Doelsoort</small>')}}
{const prev=v75Compact;v75Compact=function(){prev();const s=v75Sec()?.querySelector('.ds-wild-sech small');if(s)s.textContent=s.textContent.replace('Kansrijkste eerst','Makkelijkste eerst')}}
/* filter Zeldzaam alleen tonen als er in deze lijst zeldzame soorten staan */
{const prev=bind;bind=function(){prev();const f=document.querySelector('[data-v47-filter="Zeldzaam"]');if(f&&!document.querySelector('.ds-sp .ds-chance.c1'))f.remove()}}
