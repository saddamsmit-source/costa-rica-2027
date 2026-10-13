/* =====================================================================
   v7.7 · Diashow bovenaan elke dag (en Home)
   Per bestemming 3 foto's: 2 sfeerfoto's van de plek + 1 typisch dier met
   grote kans daar (kans 3–4 in de trefkansen; meestal ook focus van die dag).
   Wisselt automatisch elke 6 s met een overgang van 1,2 s; vegen tussen dagen
   blijft werken. Pauzeert buiten beeld, op de achtergrond en bij "minder beweging".
   Dierenfoto's: de gecontroleerde Wildlife-foto's (photos/wl/hd), met bron in de
   fotoverantwoording. Sfeerfoto's: Wikimedia Commons, vrije licentie (V77_SCENE).
   ===================================================================== */
const V77_SCENE={"Cahuita": {"key": "dia-cahuita"}, "Tortuguero": {"key": "dia-tortuguero"}, "La Fortuna": {"key": "dia-fortuna"}, "Rincón de la Vieja": {"key": "dia-rincon"}, "Monteverde": {"key": "dia-monteverde"}, "San Gerardo de Dota": {"key": "dia-sangerardo"}, "Uvita": {"key": "dia-uvita"}, "Corcovado": {"key": "dia-corcovado"}, "Esterillos": {"key": "dia-esterillos"}, "Manuel Antonio": {"key": "dia-manuel"}, "Tárcoles": {"key": "dia-tarcoles"}, "San José": {"key": "dia-sanjose"}}; /* regio → tweede sfeerfoto (Wikimedia Commons, gecontroleerd op plek) */
Object.assign(V48_PHOTO,{"dia-cahuita": {"title": "File:View of Cahuita National Park, CR (9901357883).jpg", "credit": "Pavel Kirillov from St.Petersburg, Russia", "license": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:View_of_Cahuita_National_Park,_CR_(9901357883).jpg"}, "dia-tortuguero": {"title": "File:Tortuguero, Costa Rica.jpg", "credit": "John Menard from Phoenix, USA", "license": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:Tortuguero,_Costa_Rica.jpg"}, "dia-fortuna": {"title": "File:Arenal Volcano, Costa Rica.jpg", "credit": "Central Intelligence Agency", "license": "Public domain", "page": "https://commons.wikimedia.org/wiki/File:Arenal_Volcano,_Costa_Rica.jpg"}, "dia-rincon": {"title": "File:Rincón de la Vieja National Park 27798.jpg", "credit": "Panegyrics of Granovetter", "license": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:Rinc%C3%B3n_de_la_Vieja_National_Park_27798.jpg"}, "dia-monteverde": {"title": "File:2006-08-08 Hanging Bridges in Monteverde.jpg", "credit": "Matthias Bethke", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:2006-08-08_Hanging_Bridges_in_Monteverde.jpg"}, "dia-sangerardo": {"title": "File:San Gerardo de Dota 5.jpg", "credit": "MongeNajera", "license": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:San_Gerardo_de_Dota_5.jpg"}, "dia-uvita": {"title": "File:Parque Maritimo Ballena - panoramio.jpg", "credit": "Federico Mata", "license": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File:Parque_Maritimo_Ballena_-_panoramio.jpg"}, "dia-corcovado": {"title": "File:Corcovado National Park, Costa RIca 02.jpg", "credit": "Bernard Gagnon", "license": "CC0", "page": "https://commons.wikimedia.org/wiki/File:Corcovado_National_Park,_Costa_RIca_02.jpg"}, "dia-esterillos": {"title": "File:Atardecer en playa Esterillos, Costa Rica 1.jpg", "credit": "MariaAngela Picado", "license": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:Atardecer_en_playa_Esterillos,_Costa_Rica_1.jpg"}, "dia-manuel": {"title": "File:Beach at Manuel Antonio Park - panoramio (1).jpg", "credit": "Mark Cowell", "license": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File:Beach_at_Manuel_Antonio_Park_-_panoramio_(1).jpg"}, "dia-tarcoles": {"title": "File:Río Grande de Tárcoles en Puente Lagunilla-Tárcoles 2024-07-10.jpg", "credit": "Rubýñ", "license": "CC0", "page": "https://commons.wikimedia.org/wiki/File:R%C3%ADo_Grande_de_T%C3%A1rcoles_en_Puente_Lagunilla-T%C3%A1rcoles_2024-07-10.jpg"}, "dia-sanjose": {"title": "File:Edificio Metalico. Escuela Buenaventura Corrales. San Jose. Costa Rica.JPG", "credit": "Rodtico21", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:Edificio_Metalico._Escuela_Buenaventura_Corrales._San_Jose._Costa_Rica.JPG"}});
const V77_ANIMAL={
 'San José':{n:'Clay-colored thrush',p:'3772811'},
 'Cahuita':{n:'Keel-billed toucan',p:'2964195'},
 'Tortuguero':{n:'Spectacled caiman',p:'717577514'},
 'La Fortuna':{n:'Jabiru',p:'215472273'},
 'Rincón de la Vieja':{n:'White-throated magpie-jay',p:'491792'},
 'Monteverde':{n:'Northern emerald-toucanet',p:'1961793'},
 'San Gerardo de Dota':{n:'Resplendent quetzal',p:'177163816',pos:'50% 30%'},
 'Uvita':{n:'Humpback whale',p:'255461843'},
 'Corcovado':{n:'Scarlet macaw',p:'233350330',pos:'35% 50%'},
 'Esterillos':{n:'Brown pelican',p:'74013719'},
 'Manuel Antonio':{n:'Brown-throated three-toed sloth',p:'670559580',pos:'50% 35%'},
 'Tárcoles':{n:'Roseate spoonbill',p:'2069153',pos:'60% 45%'}}; /* eerste Tárcoles-foto toont al een krokodil */
const V77_MS=6000;
function v77Slides(region,first){const out=[{src:first}];const sc=V77_SCENE[region];if(sc)out.push({src:'./photos/'+sc.key+'.jpg',pos:sc.pos});
  const a=V77_ANIMAL[region];if(a&&v47Chance(region,a.n)>=3)out.push({src:'./photos/wl/hd/'+a.p+'.jpg',pos:a.pos,label:v47Info(a.n).nl,name:a.n});return out}
function v77HomeSlides(){const r=['La Fortuna','Monteverde','Tortuguero','Corcovado','Manuel Antonio'];
  return [{src:DS_HOME_HERO.src},...r.map(x=>({src:v48Photo(V48_REGION_PHOTO[x])})),...['San Gerardo de Dota','Uvita'].map(x=>{const a=V77_ANIMAL[x];return {src:'./photos/wl/hd/'+a.p+'.jpg',pos:a.pos,label:v47Info(a.n).nl}})].filter(s=>s.src)}
const v77Pos={};let v77Timer=null,v77Visible=true;
const v77Reduce=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
function v77Mount(sec,key,slides){if(!sec||slides.length<2||sec.dataset.v77)return;sec.dataset.v77='1';sec.classList.add('v77');
  const i0=(v77Pos[key]||0)%slides.length;
  const wrap=document.createElement('div');wrap.className='v77-slides';wrap.setAttribute('aria-hidden','true');
  wrap.innerHTML=slides.map((s,i)=>`<i class="${i===i0?'on':''}" style="background-image:url('${s.src}');${s.pos?`background-position:${s.pos}`:''}"></i>`).join('');
  sec.prepend(wrap);
  const dots=document.createElement('div');dots.className='v77-dots';dots.setAttribute('aria-hidden','true');dots.innerHTML=slides.map((s,i)=>`<b class="${i===i0?'on':''}"></b>`).join('');sec.append(dots);
  const lab=document.createElement('div');lab.className='v77-lab';sec.append(lab);
  const setLab=i=>{const s=slides[i];lab.textContent=s.label||'';lab.classList.toggle('on',!!s.label)};setLab(i0);
  sec.v77={key,n:slides.length,i:i0,slides,setLab};
  /* volgende foto vooraf laden */
  slides.forEach(s=>{const im=new Image();im.decoding='async';im.src=s.src})}
function v77Step(){if(document.hidden||!v77Visible||v77Reduce())return;
  document.querySelectorAll('.v77').forEach(sec=>{const st=sec.v77;if(!st)return;const r=sec.getBoundingClientRect();if(r.bottom<=0||r.top>=innerHeight)return;
    const n=(st.i+1)%st.n,L=sec.querySelectorAll('.v77-slides i'),D=sec.querySelectorAll('.v77-dots b');
    L[st.i].classList.remove('on');L[n].classList.add('on');D[st.i]?.classList.remove('on');D[n]?.classList.add('on');st.i=n;v77Pos[st.key]=n;st.setLab(n)})}
function v77Start(){if(!v77Timer)v77Timer=setInterval(v77Step,V77_MS)}
document.addEventListener('visibilitychange',()=>{v77Visible=!document.hidden});
{const prev=bind;bind=function(){prev();
  if(tab==='days'){const d=S[currentDay-1],reg=v47Region(d),first=locationPhoto(d);if(d.id<22)v77Mount(document.querySelector('.ds-dayhero'),'d'+reg,v77Slides(reg,first))}
  if(tab==='home')v77Mount(document.querySelector('.ds-hero'),'home',v77HomeSlides());
  if(document.querySelector('.v77'))v77Start()}}
