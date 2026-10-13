/* =====================================================================
   v7.7 · Diashow bovenaan elke dag (en Home)
   Per bestemming 3 foto's: 2 sfeerfoto's van de plek + 1 typisch dier met
   grote kans daar (kans 3–4 in de trefkansen; meestal ook focus van die dag).
   Wisselt automatisch elke 6 s met een overgang van 1,2 s; vegen tussen dagen
   blijft werken. Pauzeert buiten beeld, op de achtergrond en bij "minder beweging".
   Dierenfoto's: de gecontroleerde Wildlife-foto's (photos/wl/hd), met bron in de
   fotoverantwoording. Sfeerfoto's: Wikimedia Commons, vrije licentie (V77_SCENE).
   ===================================================================== */
const V77_SCENE={}; /* regio → {key, pos} tweede sfeerfoto; gevuld in v77-scenes */
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
 'Tárcoles':{n:'American crocodile',p:'18256537'}};
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
  sec.prepend(wrap);sec.style.backgroundImage='none';
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
