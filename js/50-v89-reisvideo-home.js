/* =====================================================================
   v8.9 · Reisvideo op Home: voortgang, controle per dag, herinnering aan het einde van de reis, bevestiging
   - Einde reis = de laatste datum in de reisdata (S), niet een vaste datum: werkt voor elke reis.
   - Per dag compleet als er V89_REQ.mood sfeerfoto's, V89_REQ.animals dieren met eigen foto en V89_REQ.clips eigen video's zijn.
     Onvolledige dagen geven een waarschuwing; de video kan toch gemaakt worden.
   - Na het maken: state.v89Made {at, seconds, proef}; de video zelf blijft alleen in het geheugen tot herladen.
   ===================================================================== */
const V89_REQ={mood:5,animals:15,clips:3};
const V89={last:null};
function v89Day(d){const moods=(V84.moods||[]).filter(p=>p.day===d).length,animals=new Set((V84.list||[]).filter(p=>p.day===d).map(p=>p.sp)).size,clips=(V84.vids||[]).filter(p=>p.day===d).length;
  const ok=moods>=V89_REQ.mood&&animals>=V89_REQ.animals&&clips>=V89_REQ.clips;return {d,moods,animals,clips,ok}}
const v89Days=()=>S.map(x=>v89Day(x.id));
function v89Ended(now=new Date()){return v85Open(now)}
function v89Check(){const days=v89Days(),miss=days.filter(x=>!x.ok);
  return `<details class="v89-check"><summary>Controle per dag <span>${days.length-miss.length} van ${days.length} compleet</span></summary>
    <p class="ds-meta">Per dag nodig: ${V89_REQ.mood} sfeerfoto's, ${V89_REQ.animals} dieren met eigen foto en ${V89_REQ.clips} eigen video's.</p>
    <ul>${days.map(x=>`<li><button class="v89-day ${x.ok?'ok':''}" data-v89-day="${x.d}"><b>Dag ${x.d}</b><span>${esc(v47Region(S[x.d-1]))}</span>
      <i class="v89-cnt"><em class="${x.moods>=V89_REQ.mood?'f':''}">${x.moods}/${V89_REQ.mood} sfeer</em><em class="${x.animals>=V89_REQ.animals?'f':''}">${Math.min(x.animals,99)}/${V89_REQ.animals} dieren</em><em class="${x.clips>=V89_REQ.clips?'f':''}">${x.clips}/${V89_REQ.clips} video</em></i></button></li>`).join('')}</ul></details>`}
function v89Card(){if(typeof v85Plan!=='function')return '';const ended=v89Ended(),plan=v85Plan(),segs=v85Segments(plan,false),days=v89Days(),done=days.filter(x=>x.ok).length;
  const nPh=(V84.list||[]).length,nV=(V84.vids||[]).length,nM=(V84.moods||[]).length,made=state.v89Made,last=new Date(V85_LAST+'T12:00').toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'});
  const madeTxt=made&&!made.proef?`<p class="v89-made">${dsI('lock',16).replace(DS_ICON.lock,'<path d="m5 12 5 5 9-10"/>')}Reisvideo gemaakt op ${new Date(made.at).toLocaleString('nl-NL',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})} · ${v85Dur(made.seconds)}${made.short?' · kort':''}${made.both?' · 16:9 en 9:16':made.portrait?' · staand':''}</p>`:'';
  const keep=V89.last&&(!made||made.at===V89.last.at);
  return `<div class="ds-card v89-card ${ended?'end':''}">
    ${ended&&!(made&&!made.proef)?`<div class="v89-banner"><b>Jullie reis zit erop</b><span>Maak nu de reisvideo.</span></div>`:''}
    <div class="v89-head"><b>Reisvideo</b><small>${ended?'Klaar om te maken':'Altijd te maken, ook tussendoor'}</small></div>
    <div class="v89-prog"><i style="width:${Math.round(100*done/days.length)}%"></i></div>
    <p class="v89-stats"><b>${done} van ${days.length} dagen compleet</b> · ${plan.species} dieren · ${nPh} eigen foto's · ${nV} video's · ${nM} sfeerfoto's${segs.length?` · ca. ${v85Dur(v85Seconds(segs))}`:''}</p>
    ${madeTxt}
    ${!segs.length?'<p class="ds-meta v89-empty">Voor de video: vink bij een dag een paar dieren aan (Wildlife) of voeg een eigen foto of sfeerfoto toe. Daarna verschijnt hier de knop.</p>':''}<div class="v89-btns">${segs.length?`<button class="ds-btn primary" id="v89go">${made&&!made.proef?'Opnieuw maken':'Reisvideo maken'}</button>`:''}${keep?`<button class="ds-btn secondary" id="v89share">Opslaan of delen</button>`:''}</div>
    ${made&&!made.proef&&!keep?'<p class="ds-meta">De video staat niet meer in de app. Bewaar hem na het maken direct in Foto’s.</p>':''}
    ${v89Check()}</div>`}
/* Home: na het einde bovenaan, anders onder het eerste blok */
{const prev=renderHome;renderHome=function(){const h=prev(),card=v89Card();if(!card)return h;const body='<div class="ds-home-body">',t='<div class="ds-section-title">';
  if(v89Ended()&&h.includes(body))return h.replace(body,body+card);
  const i1=h.indexOf(t),i2=i1>=0?h.indexOf(t,i1+t.length):-1;return i2>0?h.slice(0,i2)+card+h.slice(i2):h.includes(body)?h.replace(body,body+card):h+card}}
/* starten met controle; na afloop bevestiging bewaren */
async function v89Start(){const miss=v89Days().filter(x=>!x.ok);
  if(v89Ended()&&miss.length&&!confirm(`${miss.length} ${miss.length===1?'dag is':'dagen zijn'} niet compleet (${miss.slice(0,6).map(x=>'dag '+x.d).join(', ')}${miss.length>6?' …':''}).\n\nToch de reisvideo maken? Je kunt hem later opnieuw maken.`))return;
  await v85Start()}
{const prev=v85Run;v85Run=async function(opt){if(V89.last){(V89.last.items||[V89.last]).forEach(x=>{try{URL.revokeObjectURL(x.url)}catch(e){}});V89.last=null}await prev(opt);if(v85Out&&v85Out.out){const proef=false;state.v89Made={at:new Date().toISOString(),seconds:Math.round(v85Out.out.seconds),proef,short:!!opt?.short,portrait:opt?.fmt==='port',both:opt?.fmt==='both'};save();
    V89.last={at:state.v89Made.at,file:v85Out.file,url:v85Out.url,items:(v85Out.items||[v85Out]).map(x=>({file:x.file,url:x.url}))}}}}
/* de video blijft in het geheugen zolang de app open is, zodat "Opslaan of delen" op Home werkt */
{const prev=v85Close;v85Close=function(){if(v85Out&&V89.last&&v85Out.url===V89.last.url){const el=document.getElementById('v85Gen');if(v85Job)v85Job.cancel=true;if(el){el.remove();document.body.classList.remove('wl2-lock')}v85Out=null;v85Job=null;if(tab==='home')render();return}
  return prev()}}
async function v89Share(){const l=V89.last;if(!l)return;const its=l.items||[l],files=its.map(x=>x.file);try{if(navigator.canShare&&navigator.canShare({files})){await navigator.share({files,title:'Costa Rica 2027'});return}}catch(e){if(e&&e.name==='AbortError')return}
  its.forEach(x=>{const a=document.createElement('a');a.href=x.url;a.download=x.file.name;document.body.append(a);a.click();a.remove()})}
{const prev=bind;bind=function(){prev();const g=document.getElementById('v89go');if(g)g.onclick=v89Start;const s=document.getElementById('v89share');if(s)s.onclick=v89Share;
  document.querySelectorAll('[data-v89-day]').forEach(b=>b.onclick=()=>{currentDay=+b.dataset.v89Day;tab='days';daySection='overview';render();scrollTo({top:0,behavior:'instant'})})}}
/* ook de knop op de Wildlife-pagina loopt via de controle */
{const prev=bind;bind=function(){prev();const g=document.getElementById('v85go');if(g)g.onclick=v89Start}}
