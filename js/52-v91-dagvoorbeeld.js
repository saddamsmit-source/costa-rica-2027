/* =====================================================================
   v9.1 · Dagvoorbeeld: één dag van de reisvideo direct afspelen in de app, zonder eerst de hele video te maken.
   - Zelfde opbouw en vormgeving als de echte video (v85Segments + v85Draw), liggend 16:9.
   - Overgangen als eenvoudige overvloeier; eigen video's spelen als <video> mee. Er wordt niets opgeslagen.
   ===================================================================== */
let v9P=null;
function v9DaySegs(day){const all=v85Segments(v85Plan(),false),i0=all.findIndex(s=>s.k==='day'&&s.day===day);if(i0<0)return [];
  let i1=all.findIndex((s,j)=>j>i0&&['day','end','credits','mosaic'].includes(s.k));if(i1<0)i1=all.length;return all.slice(i0,i1)}
function v9PrevClose(){if(v9P){v9P.stop=true;try{v9P.res.forEach(r=>r&&v85Free(r))}catch(e){}v9P=null}const el=document.getElementById('v9Prev');if(el){el.remove();document.body.classList.remove('wl2-lock')}}
/* v10: day=0 + 'opening' = openingsscène, titel en de eerste hoofdstukkaart */
async function v9PrevOpen(day,mode){v9PrevClose();let segs;if(mode==='opening'){const all=v85Segments(v85Plan(),false),i=all.findIndex(s=>s.k==='day');segs=all.slice(0,i>=0?i+1:Math.min(3,all.length))}else segs=v9DaySegs(day);if(!segs.length)return;
  const el=document.createElement('div');el.id='v9Prev';el.className='v85-gen v9-prev';el.setAttribute('role','dialog');el.setAttribute('aria-label','Voorbeeld dag '+day);
  el.innerHTML=`<div class="v85-box"><span class="ds-label">Voorbeeld · ${mode==='opening'?'opening':'dag '+day} · ca. ${v85Dur(v85Seconds(segs))}</span><canvas class="v9-cv" width="${V85.W}" height="${V85.H}"></canvas><div class="v85-bar"><i></i></div>
    <p class="ds-meta v9-st" aria-live="polite">Laden…</p><div class="v85-btns"><button class="ds-btn secondary" data-v9="again" hidden>Opnieuw</button><button class="ds-btn secondary" data-v9="close">Sluiten</button></div></div>`;
  document.body.append(el);document.body.classList.add('wl2-lock');el.querySelector('[data-v9="close"]').onclick=v9PrevClose;el.querySelector('[data-v9="again"]').onclick=()=>v9PrevOpen(day,mode);
  const cv=el.querySelector('canvas'),ctx=cv.getContext('2d',{alpha:false}),prev=document.createElement('canvas');prev.width=cv.width;prev.height=cv.height;const pctx=prev.getContext('2d');
  const P=v9P={stop:false,res:new Map()};try{await document.fonts.load(`800 80px ${V85_FONT}`)}catch(e){}await v85LoadIcons();
  const get=i=>{if(!P.res.has(i))P.res.set(i,v85Res(segs[i],true));return P.res.get(i)};
  const total=v85Seconds(segs),starts=[];let acc=0;segs.forEach(s=>{starts.push(acc);acc+=s.dur});
  await get(0);if(P.stop)return;const st=el.querySelector('.v9-st'),bar=el.querySelector('.v85-bar i');st.textContent='Ruwe weergave: overgangen vereenvoudigd.';
  let i=-1,t0=performance.now(),cur=null;
  const tick=async()=>{if(P.stop||v9P!==P)return;const T=(performance.now()-t0)/1000;if(T>=total){st.textContent=mode==='opening'?'Einde van de opening.':'Einde van dag '+day+'.';el.querySelector('[data-v9="again"]').hidden=false;return}
    let j=i<0?0:i;while(j+1<segs.length&&T>=starts[j+1])j++;
    if(j!==i){if(i>=0){pctx.drawImage(cv,0,0);const old=P.res.get(i);P.res.delete(i);old?.then(r=>v85Free(r))}i=j;cur=await get(i);if(P.stop)return;if(i+1<segs.length)get(i+1);
      if(cur.vid){try{cur.vid.currentTime=segs[i].clip.start||0;cur.vid.play().catch(()=>{})}catch(e){}}}
    const t=T-starts[i];v85Draw(ctx,segs[i],cur,t);const tr=segs[i].trans;if(i>0&&tr!=='cut'&&t<.5){ctx.globalAlpha=1-t/.5;ctx.drawImage(prev,0,0);ctx.globalAlpha=1}
    bar.style.width=Math.round(100*T/total)+'%';requestAnimationFrame(tick)};
  requestAnimationFrame(tick)}
/* knop in Overzicht (onder sfeer en verblijf) en in "In de reisvideo" op het Wildlife-tabblad van de dag */
function v9PrevBtn(day){return `<button class="ds-btn secondary v9-prevbtn" data-v9-prev="${day}">${'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5l11 7-11 7z"/></svg>'}Voorbeeld van deze dag in de reisvideo</button>`}
{const prev=v84MoodBlock;v84MoodBlock=function(d){const h=prev(d);let has=false;try{has=v9DaySegs(d.id).length>1}catch(e){}return has?h+v9PrevBtn(d.id):h}}
{const prev=v85DayCard;v85DayCard=function(d){const h=prev(d);return h?h.replace(/<\/details>$/,`${v9PrevBtn(d.id)}</details>`):h}}
{const prev=bind;bind=function(){prev();document.querySelectorAll('[data-v9-prev]').forEach(b=>b.onclick=e=>{e.preventDefault();v9PrevOpen(+b.dataset.v9Prev)})}}
