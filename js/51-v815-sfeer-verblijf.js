/* =====================================================================
   v8.15 · Sfeerfoto's met label en "Ons verblijf"
   - Per dag max. 15 sfeerfoto's (V84_MOOD). Elke sfeerfoto kan een label krijgen (bijv. "Tortuguero Nationaal Park",
     "Strand"): keuze uit de activiteiten van die dag, vaste keuzes of zelf typen. Het label staat in de foto-record
     (IndexedDB, veld label) en verschijnt als titel in de reisvideo. Zonder label: de regio van die dag.
   - Per dag max. 3 foto's van het hotel of de lodge (kind:'stay'). De naam per dag staat in state.v815Stay[dag];
     zonder eigen naam: het hotel dat bij Hotels is gekozen, of de enige optie van die dag.
   ===================================================================== */
const V815_FIXED=['Nationaal park','Regenwoud','Strand','Vulkaan','Waterval','Rivier','Onderweg','Eten','Wij'];
state.v815Stay??={};
/* hotel van een dag: eigen naam > keuze bij Hotels > enige optie */
function v815HotelOf(day){const d=S[day-1];if(!d)return '';const own=(state.v815Stay||{})[day];if(own)return own;
  const i=H.findIndex(([,opts])=>opts.some(x=>(d.hotel||[]).includes(x))),sel=i>=0?(state.hotelSelected||{})[i]:'';
  return sel||((d.hotel||[]).length===1?d.hotel[0]:'')}
/* labelsuggesties: activiteiten van de dag (zonder transfers en uitgesloten), daarna vaste keuzes */
function v815Sugg(day){const d=S[day-1];if(!d)return V815_FIXED;
  const acts=(d.activities||[]).filter(a=>a.status!=='excluded'&&!/transfer/i.test(a.title)).map(a=>a.title.replace(/\s*\([^)]*\)\s*$/,'').trim());
  return [...new Set([...acts,v47Region(d),...V815_FIXED])]}
async function v815SetLabel(ids,label){const set=new Set(ids),recs=V84.moods.filter(p=>set.has(p.id));if(!recs.length)return;
  await v84Write(st=>recs.forEach(p=>st.put({...p,label:label.trim().slice(0,60)})));await v84Load()}

/* ---------- Overzicht: sfeerfoto's met label ---------- */
v84MoodBlock=function(d){const ms=V84.moods.filter(p=>p.day===d.id).sort((a,b)=>(a.taken||a.t).localeCompare(b.taken||b.t));
  return `<div class="ds-card v84-mood"><div class="v84-h"><b>Sfeerfoto's</b><small>${ms.length} van ${V84_MOOD} · tik op een foto voor een label</small></div>
    ${ms.length?`<div class="v84-grid">${ms.map(p=>`<div class="v84-ph v815-ph"><button class="v815-pick" data-v815-lbl="${p.id}" aria-label="Label kiezen${p.label?': '+esc(p.label):''}"><img src="${V84.url[p.id]}" alt="Sfeerfoto dag ${d.id}" loading="lazy"><span class="v815-tag ${p.label?'':'empty'}">${p.label?esc(p.label):'+ label'}</span></button><button class="v84-del" data-v84-mdel="${p.id}" aria-label="Sfeerfoto verwijderen">${dsI('plus',16)}</button></div>`).join('')}</div>`:'<p class="ds-meta">Landschap, park, strand, onderweg: wat deze dag typeert. Geef ze een label, dan staat de naam in de video.</p>'}
    ${ms.length<V84_MOOD?`<label class="ds-btn secondary v84-add">${dsI('plus',18)}Sfeerfoto toevoegen<input type="file" accept="image/*" multiple hidden data-v84-madd="${d.id}"></label>`:''}<p class="ds-meta v84-mmsg" aria-live="polite"></p></div>${v815StayBlock(d)}`};

/* ---------- Overzicht: ons verblijf ---------- */
function v815StayBlock(d){const ps=V84.stays.filter(p=>p.day===d.id),name=v815HotelOf(d.id),opts=d.hotel||[];
  if(!opts.length&&!ps.length)return '';
  return `<div class="ds-card v815-stay"><div class="v84-h"><b>Ons verblijf</b><small>${ps.length} van ${V84_STAY} foto's · komt in de reisvideo</small></div>
    <label class="v815-name"><span class="ds-meta">Naam</span><input class="field" list="v815hl${d.id}" data-v815-name="${d.id}" value="${esc(name)}" placeholder="${opts.length>1?'Kies of typ de naam':'Naam hotel of lodge'}" maxlength="60"></label>
    <datalist id="v815hl${d.id}">${opts.map(x=>`<option value="${esc(x)}">`).join('')}</datalist>
    ${ps.length?`<div class="v84-grid">${ps.map(p=>`<div class="v84-ph"><img src="${V84.url[p.id]}" alt="Verblijf dag ${d.id}" loading="lazy"><button class="v84-del" data-v84-mdel="${p.id}" aria-label="Foto verwijderen">${dsI('plus',16)}</button></div>`).join('')}</div>`:''}
    ${ps.length<V84_STAY?`<label class="ds-btn secondary v84-add">${dsI('plus',18)}Foto van het verblijf<input type="file" accept="image/*" multiple hidden data-v815-sadd="${d.id}"></label>`:''}
    <p class="ds-meta">Zelfde verblijf meerdere nachten? Het komt één keer in de video, op de eerste dag met foto's.</p><p class="ds-meta v815-smsg" aria-live="polite"></p></div>`}

/* ---------- labelvenster ---------- */
function v815LblClose(){const el=document.getElementById('v815Lbl');if(el){el.remove();document.body.classList.remove('wl2-lock')}}
function v815LblOpen(id){const p=V84.moods.find(x=>x.id===id);if(!p)return;v815LblClose();
  const others=V84.moods.filter(x=>x.day===p.day&&x.id!==id&&!x.label).length;
  const el=document.createElement('div');el.id='v815Lbl';el.className='v85-gen';el.setAttribute('role','dialog');el.setAttribute('aria-label','Label sfeerfoto');
  el.innerHTML=`<div class="v85-box v815-box"><img class="v815-prev" src="${V84.url[id]}" alt=""><span class="ds-label">Dag ${p.day} · ${esc(v47Region(S[p.day-1]))}</span><h3>Wat is dit?</h3>
    <div class="v815-chips">${v815Sugg(p.day).map(s=>`<button type="button" class="v815-chip ${s===p.label?'on':''}" data-v815-s="${esc(s)}">${esc(s)}</button>`).join('')}</div>
    <input class="field v815-in" maxlength="60" placeholder="Of typ zelf, bijv. Playa Uvita" value="${esc(p.label||'')}" aria-label="Label">
    ${others?`<label class="v815-all"><input type="checkbox"> Ook voor de ${others} andere sfeerfoto${others===1?'':"'s"} van deze dag zonder label</label>`:''}
    <div class="v85-btns"><button class="ds-btn primary" data-l="save">Bewaren</button>${p.label?'<button class="ds-btn secondary" data-l="clear">Label wissen</button>':''}<button class="ds-btn secondary" data-l="close">Annuleren</button></div></div>`;
  document.body.append(el);document.body.classList.add('wl2-lock');const inp=el.querySelector('.v815-in');
  el.querySelectorAll('[data-v815-s]').forEach(b=>b.onclick=()=>{inp.value=b.dataset.v815S;el.querySelectorAll('.v815-chip').forEach(c=>c.classList.toggle('on',c===b))});
  const done=async lbl=>{const all=el.querySelector('.v815-all input')?.checked,ids=[id,...(all?V84.moods.filter(x=>x.day===p.day&&x.id!==id&&!x.label).map(x=>x.id):[])];
    await v815SetLabel(ids,lbl);v815LblClose();const y=scrollY;render();scrollTo(0,y)};
  el.querySelector('[data-l="save"]').onclick=()=>done(inp.value);el.querySelector('[data-l="clear"]')?.addEventListener('click',()=>done(''));
  el.querySelector('[data-l="close"]').onclick=v815LblClose;el.onclick=e=>{if(e.target===el)v815LblClose()}}

{const prev=bind;bind=function(){prev();
  document.querySelectorAll('[data-v815-lbl]').forEach(b=>b.onclick=()=>v815LblOpen(b.dataset.v815Lbl));
  document.querySelectorAll('[data-v815-name]').forEach(inp=>inp.onchange=()=>{const d=+inp.dataset.v815Name,v=inp.value.trim().slice(0,60);if(v)state.v815Stay[d]=v;else delete state.v815Stay[d];save()});
  document.querySelectorAll('[data-v815-sadd]').forEach(inp=>inp.onchange=async()=>{const fs=[...inp.files];inp.value='';if(!fs.length)return;const m=document.querySelector('.v815-smsg');if(m)m.textContent='Foto verwerken…';
    try{const r=await v84AddMood(+inp.dataset.v815Sadd,fs,'stay');const y=scrollY;render();scrollTo(0,y);const m2=document.querySelector('.v815-smsg');if(m2&&r.skipped)m2.textContent=`${r.skipped} niet toegevoegd: maximaal ${V84_STAY} foto's van het verblijf per dag.`}
    catch(e){const m2=document.querySelector('.v815-smsg');if(m2)m2.textContent='Toevoegen mislukt: '+e.message}})}}
