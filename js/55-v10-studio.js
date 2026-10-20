/* =====================================================================
   v10 · Video Studio: alle reisvideo-onderdelen op één plek, in de volgorde
   inhoud → controle → personalisatie → voorbeeld → maken → resultaat.
   - Bundelt wat er al was (voortgang per dag, kwaliteitslabels, titel/namen, dagvoorbeeld, keuze versie/formaat,
     opslaan/delen). Geen technische instellingen.
   - Controle stelt voor, de gebruiker beslist: er wordt nooit iets verwijderd.
   - Bereikbaar via Home (kaart Reisvideo), Wildlife en Meer.
   ===================================================================== */
const V10_STUDIO={opt:{short:false,fmt:'land'},showAll:false};
/* dagstrip: per dag hoe ver de dag is (leeg / deels / compleet) */
function v10DayLevel(x){if(x.ok)return 'ok';return x.moods+x.animals+x.clips>0?'part':'none'}
/* wat aandacht vraagt (alleen meldingen, geen automatische acties) */
function v10Checks(plan,segs){const out=[],days=v89Days(),today=v85Iso(new Date()),past=days.filter(x=>S[x.d-1].date<=today);
  const own=new Set([...V84.list,...V84.vids,...V84.moods,...V84.stays].map(p=>p.day));
  const empty=(past.length?past:[]).filter(x=>!own.has(x.d));
  if(empty.length)out.push({k:'empty',t:`${empty.length} ${empty.length===1?'dag':'dagen'} zonder eigen foto's of video's`,s:'Die dagen tonen alleen de hoofdstukkaart en de namen van wat jullie zagen.',days:empty.map(x=>x.d)});
  const weak=[...V84.list,...V84.moods,...V84.stays].filter(p=>v84Qual(p).length);
  if(weak.length)out.push({k:'quality',t:`${weak.length} ${weak.length===1?'foto':"foto's"} met een kwaliteitslabel`,s:'Komen alleen als laatste keus in de video. Geef een ster als je er toch een wilt.',items:weak.slice(0,12)});
  const dups=typeof v10DupGroups==='function'?v10DupGroups():[];
  if(dups.length)out.push({k:'dup',t:`${dups.length} ${dups.length===1?'groep':'groepen'} foto's die sterk op elkaar lijken`,s:'In de video komt per groep alleen de beste (scherpste of met ster). De andere blijven gewoon bewaard.',groups:dups.slice(0,8)});
  const dayDur={};let cur=0;segs.forEach(sg=>{if(sg.k==='day')cur=sg.day;else if(['end','credits','mosaic','best'].includes(sg.k))cur=0;if(cur)dayDur[cur]=(dayDur[cur]||0)+sg.dur});
  const vals=Object.values(dayDur);if(vals.length>=3){const avg=vals.reduce((a,b)=>a+b,0)/vals.length,long=Object.entries(dayDur).filter(([,v])=>v>avg*2.5&&v>60);
    if(long.length)out.push({k:'long',t:`${long.length} ${long.length===1?'dag is':'dagen zijn'} veel langer dan gemiddeld`,s:`Gemiddeld ${v85Dur(avg)} per dag; ${long.map(([d,v])=>`dag ${d}: ${v85Dur(v)}`).join(', ')}. Minder sfeerfoto's of dieren op die dag maakt de video evenwichtiger.`,days:long.map(([d])=>+d)})}
  return out}
/* schatting van de verwerkingstijd: liggend ±0,8–1,6× de videolengte op een recente iPhone (niet gemeten op een toestel) */
function v10Estimate(sec,n){const lo=Math.max(1,Math.round(sec*.8*n/60)),hi=Math.max(lo+1,Math.round(sec*1.6*n/60));return `${lo}–${hi} min`}
function v10Studio(){let plan,segs,short;try{plan=v85Plan();segs=v85Segments(plan,false);short=v85Short(plan,false)}catch(e){plan={items:[],days:[],species:0};segs=[];short=[]}
  const days=v89Days(),done=days.filter(x=>x.ok).length,vv=state.v9Video||{},O=V10_STUDIO.opt,checks=v10Checks(plan,segs),made=state.v89Made,last=V89.last;
  const nPh=V84.list.length,nV=V84.vids.length,nM=V84.moods.length,nS=V84.stays.length,len=v85Seconds(O.short?short:segs),nF=O.fmt==='both'?2:1;
  const job=state.v10VideoJob;
  const item=(p)=>`<button class="v10-thumb" data-v10-open="${p.day}" aria-label="Dag ${p.day} openen"><img src="${V84.url[p.id]}" alt="" loading="lazy"><small>Dag ${p.day}</small></button>`;
  return dsdSub('Video Studio',`
  ${job?`<div class="ds-card v10-bk warn"><b>De vorige video is niet afgemaakt</b><p class="ds-meta">Gestart op ${esc(v75When(job.at))}. Waarschijnlijk werd de app gesloten of ging het scherm uit. Maak hem opnieuw en houd de app open.</p></div>`:''}
  <section class="ds-card v10-st"><div class="v10-sth"><span class="v10-n">1</span><b>Inhoud</b></div>
    <div class="ds-stats ds-num v10-stats"><div><b>${plan.species}</b><small>dieren</small></div><div><b>${nPh+nM+nS}</b><small>eigen foto's</small></div><div><b>${nV}</b><small>video's</small></div><div><b>${done}/${days.length}</b><small>dagen compleet</small></div></div>
    <div class="v10-strip" role="list" aria-label="Dagen">${days.map(x=>`<button role="listitem" class="v10-dot ${v10DayLevel(x)}" data-v10-open="${x.d}" title="Dag ${x.d}: ${x.moods} sfeer · ${x.animals} dieren · ${x.clips} video">${x.d}</button>`).join('')}</div>
    <p class="ds-meta v10-legend"><span><i class="v10-dot ok"></i>compleet</span><span><i class="v10-dot part"></i>deels</span><span><i class="v10-dot none"></i>nog niets</span></p><p class="ds-meta">Tik op een dag om foto's toe te voegen.</p></section>
  <section class="ds-card v10-st"><div class="v10-sth"><span class="v10-n">2</span><b>Controle</b></div>
    ${checks.length?checks.map(c=>`<div class="v10-chk ${c.k}"><b>${esc(c.t)}</b><p class="ds-meta">${esc(c.s)}</p>
      ${c.days?`<div class="v10-days">${c.days.slice(0,23).map(d=>`<button class="ds-chip" data-v10-open="${d}">Dag ${d}</button>`).join('')}</div>`:''}
      ${c.items?`<div class="v10-thumbs">${c.items.map(item).join('')}</div>`:''}
      ${c.groups?c.groups.map(g=>`<div class="v10-dup"><div class="v10-thumbs">${g.items.map(p=>`<span class="v10-thumb ${p.id===g.best.id?'best':''}"><img src="${V84.url[p.id]}" alt="" loading="lazy">${p.id===g.best.id?'<small>In de video</small>':''}</span>`).join('')}</div>
        <label class="v10-keep"><input type="checkbox" data-v10-dupall="${g.key}" ${g.all?'checked':''}> Toch allemaal in de video</label></div>`).join(''):''}</div>`).join(''):'<p class="ds-meta v10-allgood">Alles ziet er goed uit.</p>'}</section>
  <section class="ds-card v10-st"><div class="v10-sth"><span class="v10-n">3</span><b>Titel en namen</b></div>
    <div class="v9-titel"><label><span class="ds-meta">Titel</span><input class="field" data-v9v="title" maxlength="40" value="${esc(vv.title||'')}" placeholder="Costa Rica 2027"></label><label><span class="ds-meta">Namen (in de opening en aftiteling)</span><input class="field" data-v9v="names" maxlength="60" value="${esc(vv.names||'')}" placeholder="Bijv. Kevin &amp; …"></label></div></section>
  <section class="ds-card v10-st"><div class="v10-sth"><span class="v10-n">4</span><b>Voorbeeld</b></div>
    ${segs.length?`<div class="v10-prev"><button class="ds-btn secondary" id="v10prevOpen">${'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5l11 7-11 7z"/></svg>'}Opening bekijken</button>
      <div class="v10-prevday"><select class="field" id="v10prevDay" aria-label="Dag">${plan.days.map(d=>`<option value="${d.day}">Dag ${d.day} · ${esc(v47Region(S[d.day-1]))}</option>`).join('')}</select><button class="ds-btn secondary" id="v10prevDayGo">Bekijken</button></div></div>
      <p class="ds-meta">Snelle weergave in de app, zonder iets op te slaan.</p>`:'<p class="ds-meta">Voeg eerst foto\'s toe of vink dieren aan bij een dag.</p>'}</section>
  <section class="ds-card v10-st"><div class="v10-sth"><span class="v10-n">5</span><b>Maken</b></div>
    <div class="v85-opt" role="radiogroup" aria-label="Versie"><button data-v10o="full" aria-pressed="${!O.short}" class="${O.short?'':'on'}"><b>Volledig</b><small>alle dagen · ${v85Dur(v85Seconds(segs))}</small></button><button data-v10o="short" aria-pressed="${O.short}" class="${O.short?'on':''}"><b>Kort</b><small>hoogtepunten · ${v85Dur(v85Seconds(short))}</small></button></div>
    <div class="v85-opt three" role="radiogroup" aria-label="Formaat">${[['land','Liggend 16:9','tv, laptop'],['port','Staand 9:16','telefoon'],['both','Beide','16:9 én 9:16']].map(([k,l,sub])=>`<button data-v10f="${k}" aria-pressed="${O.fmt===k}" class="${O.fmt===k?'on':''}"><b>${l}</b><small>${sub}</small></button>`).join('')}</div>
    ${segs.length?`<p class="ds-meta">Maken duurt naar schatting ${v10Estimate(len,nF)} op een recente iPhone. Houd de app open en het scherm aan.</p><button class="ds-btn primary v10-make" id="v10make">${made&&!made.proef?'Opnieuw maken':'Video maken'}</button>`:'<p class="ds-meta">Nog niets om te tonen.</p>'}</section>
  <section class="ds-card v10-st"><div class="v10-sth"><span class="v10-n">6</span><b>Resultaat</b></div>
    ${last?`<p class="ds-meta">Gemaakt op ${new Date(last.at).toLocaleString('nl-NL',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}${made?` · ${v85Dur(made.seconds)}`:''}.</p>
      <div class="ds-bkbtns"><button class="ds-btn secondary" id="v10watch">Bekijken</button><button class="ds-btn primary" id="v10share">Opslaan of delen</button></div><p class="ds-meta">Kies bij "Opslaan of delen" voor "Bewaar video" om hem in Foto's te zetten.</p>`
      :made?`<p class="ds-meta">Laatst gemaakt op ${new Date(made.at).toLocaleString('nl-NL',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}. De video staat niet meer in de app; maak hem opnieuw als je hem nog niet in Foto's had bewaard.</p>`:'<p class="ds-meta">Nog geen video gemaakt.</p>'}</section>`)}
DSD_MORE.studio=v10Studio;
function v10OpenStudio(){tab='settings';dsMore='studio';render();scrollTo(0,0)}
/* video maken vanuit de studio: eerst waarschuwing bij onvolledige dagen (na de reis), daarna direct maken */
async function v10Make(){const miss=v89Days().filter(x=>!x.ok);
  if(v89Ended()&&miss.length&&!await v10Confirm({title:'Toch de reisvideo maken?',text:`${miss.length} ${miss.length===1?'dag is':'dagen zijn'} nog niet compleet. Je kunt de video later opnieuw maken.`,ok:'Video maken'}))return;
  await v85Run({...V10_STUDIO.opt})}
/* onderbroken video: vlag bij start, weg bij klaar of annuleren */
{const prev=v85Run;v85Run=async function(opt){state.v10VideoJob={at:new Date().toISOString(),opt};save();try{return await prev(opt)}finally{delete state.v10VideoJob;save()}}}
function v10Watch(){const l=V89.last;if(!l)return;const it=(l.items||[l])[0];const el=document.createElement('div');el.id='v84Vid';el.className='v85-gen';el.setAttribute('role','dialog');el.setAttribute('aria-label','Reisvideo bekijken');
  el.innerHTML=`<div class="v85-box"><video class="v85-vid" src="${it.url}" controls autoplay playsinline></video><div class="v85-btns"><button class="ds-btn secondary" data-t="close">Sluiten</button></div></div>`;
  document.body.append(el);el.querySelector('[data-t="close"]').onclick=()=>el.remove();el.onclick=e=>{if(e.target===el)el.remove()}}
{const prev=bind;bind=function(){prev();if(!(tab==='settings'&&dsMore==='studio'))return;
  document.querySelectorAll('[data-v10-open]').forEach(b=>b.onclick=()=>{currentDay=+b.dataset.v10Open;tab='days';daySection='overview';render();scrollTo(0,0)});
  document.querySelectorAll('[data-v10o]').forEach(b=>b.onclick=()=>{V10_STUDIO.opt.short=b.dataset.v10o==='short';const y=scrollY;render();scrollTo(0,y)});
  document.querySelectorAll('[data-v10f]').forEach(b=>b.onclick=()=>{V10_STUDIO.opt.fmt=b.dataset.v10f;const y=scrollY;render();scrollTo(0,y)});
  document.querySelectorAll('[data-v9v]').forEach(inp=>inp.oninput=()=>{state.v9Video={...(state.v9Video||{}),[inp.dataset.v9v]:inp.value.slice(0,60)};save()});
  document.querySelectorAll('[data-v10dupall]').forEach(c=>c.onchange=()=>{state.v10DupAll??={};if(c.checked)state.v10DupAll[c.dataset.v10dupall]=1;else delete state.v10DupAll[c.dataset.v10dupall];save();const y=scrollY;render();scrollTo(0,y)});
  const po=document.getElementById('v10prevOpen');if(po)po.onclick=()=>v9PrevOpen(0,'opening');
  const pd=document.getElementById('v10prevDayGo');if(pd)pd.onclick=()=>v9PrevOpen(+document.getElementById('v10prevDay').value);
  const mk=document.getElementById('v10make');if(mk)mk.onclick=v10Make;
  const w=document.getElementById('v10watch');if(w)w.onclick=v10Watch;const sh=document.getElementById('v10share');if(sh)sh.onclick=v89Share}}
/* ingangen: Home-kaart, Wildlife-pagina en Meer leiden naar de studio */
{const prev=bind;bind=function(){prev();const g=document.getElementById('v89go');if(g)g.onclick=v10OpenStudio;const w=document.getElementById('v85go');if(w)w.onclick=v10OpenStudio}}
