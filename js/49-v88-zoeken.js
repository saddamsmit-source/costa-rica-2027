/* =====================================================================
   v8.8 · Zoeken op kenmerken + nieuw Waarneming-venster
   Zoekindex per soort uit de eigen soortgegevens (WL2: herkenning h, leefgebied l, moment m, familie):
   kleuren, grootteklasse, leefgebied en moment. Alles lokaal, geen nieuwe bron.
   - Zoeken (Waarneming, daglijst, "Waar zie ik…") werkt met losse woorden die allemaal moeten kloppen:
     "rode buik", "klein groen", "nacht kikker", "toucan".
   - Waarneming-venster: alle soorten (deze bestemming eerst), filters op groep en kenmerken, tik = soortvenster,
     foto-knop per soort, "Vandaag geregistreerd" en een sfeerfoto-knop.
   ===================================================================== */
const V88_COL=[
  ['rood','#C8322B',w=>w.includes('rood')||/rode$/.test(w)||/(karmijn|scharlaken|vermiljoen)/.test(w)],
  ['oranje','#E8822A',w=>w.includes('oranje')||/^(amber|koper)/.test(w)],
  ['geel','#E2BD2E',w=>w.includes('geel')||/gele$/.test(w)||/^(goud|oker)/.test(w)],
  ['groen','#3E9A4C',w=>w.includes('groen')||w.includes('olijf')],
  ['blauw','#2F6FC0',w=>w.includes('blauw')||/(turquoise|turkoois|azuur)/.test(w)],
  ['paars','#7B4BA8',w=>/(paars|purper|violet)/.test(w)],
  ['roze','#E58BB0',w=>/^roze|roze$/.test(w)],
  ['bruin','#8A5A33',w=>/(bruin|kastanje|roest|kaneel)/.test(w)||/^ross/.test(w)],
  ['grijs','#8E9599',w=>/(grijs|grijze|zilver)/.test(w)],
  ['zwart','#1E1E1E',w=>w.includes('zwart')],
  ['wit','#F2F2EC',w=>/^wit|wit$|witte$|^witte/.test(w)||/(wit)(keel|buik|kop|staart|vleugel|borst|rug)/.test(w)]];
const V88_SIZE=[['klein','Klein','tot 15 cm'],['middel','Middel','15–40 cm'],['groot','Groot','vanaf 40 cm']];
const V88_HAB=[['water','Water & moeras',/(rivier|moeras|meren|meer\b|water|vijver|lagune|kreek|kanaal|oever)/],['kust','Kust & zee',/(kust|strand|zee\b|zeeën|mangrove|getijde)/],
  ['bos','Bos',/(regenwoud|bossen|bos\b|bosrand|woud|kruin)/],['hoog','Hoogland',/(nevelwoud|hoogland|páramo|paramo|bergbos|[12]\.\d{3} m|\b[23]\.\d{3})/],['open','Open & tuinen',/(tuin|open |weide|grasland|akker|veld|savanne|cultuurland|erf)/]];
const V88_MOM={o:'Ochtend',d:'Overdag',s:'Schemer',n:'Nacht',w:'Vanaf water'};
/* zoekwoorden die op een kenmerk wijzen */
const V88_ALIAS={rood:['c','rood'],rode:['c','rood'],red:['c','rood'],oranje:['c','oranje'],orange:['c','oranje'],geel:['c','geel'],gele:['c','geel'],yellow:['c','geel'],
  groen:['c','groen'],groene:['c','groen'],green:['c','groen'],blauw:['c','blauw'],blauwe:['c','blauw'],blue:['c','blauw'],paars:['c','paars'],paarse:['c','paars'],purper:['c','paars'],purple:['c','paars'],
  roze:['c','roze'],pink:['c','roze'],bruin:['c','bruin'],bruine:['c','bruin'],brown:['c','bruin'],grijs:['c','grijs'],grijze:['c','grijs'],grey:['c','grijs'],gray:['c','grijs'],
  zwart:['c','zwart'],zwarte:['c','zwart'],black:['c','zwart'],wit:['c','wit'],witte:['c','wit'],white:['c','wit'],
  klein:['s','klein'],kleine:['s','klein'],small:['s','klein'],middel:['s','middel'],groot:['s','groot'],grote:['s','groot'],large:['s','groot'],big:['s','groot'],
  water:['h','water'],rivier:['h','water'],moeras:['h','water'],kust:['h','kust'],strand:['h','kust'],zee:['h','kust'],mangrove:['h','kust'],bos:['h','bos'],regenwoud:['h','bos'],
  nevelwoud:['h','hoog'],hoogland:['h','hoog'],berg:['h','hoog'],bergen:['h','hoog'],tuin:['h','open'],open:['h','open'],
  nacht:['m','n'],nachts:['m','n'],nachtdier:['m','n'],night:['m','n'],ochtend:['m','o'],schemer:['m','s']};
const v88Norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const V88={idx:new Map(),f:{q:'',grp:'Alle',col:new Set(),size:'',hab:new Set(),mom:'',sort:'kans',open:false,limit:60}};
function v88Feat(name){let x=V88.idx.get(name);if(x)return x;const i=v47Info(name),r=(typeof wl2==='function'&&wl2(name))||{};
  const desc=v88Norm([r.h,r.l,i.tip].filter(Boolean).join(' ')),words=v88Norm(r.h||i.tip||'').split(/[^a-z]+/).filter(Boolean);
  /* v8.14 · kleuren uit de herkenningstekst: "geen X" telt niet; kleuren van poten, oogring en oogleden tellen niet;
     de bolletjes tonen alleen het hoofdkleed (zinsdelen over vrouwtjes/jongen niet), zoeken gebruikt alle kleuren */
  const v88Cols=(txt,primary)=>{const out=new Set(),t=v88Norm(txt).replace(/\(?\bgeen\s+[a-z-]+\)?/g,' ');
    for(const cl of t.split(/[;.]/)){if(primary&&/\b(vrouw|vrouwtje|juvenie|juveniel|onvolwassen|jong|jongen|winterkleed|niet-broed|eclips)/.test(cl))continue;
      const ws=cl.split(/[^a-z-]+/).filter(Boolean);const MIN=/^(poten|pootjes|tenen|oogring|oogleden|iris)$/;ws.forEach((w,i)=>{if(MIN.test(ws[i+1]||'')||(/^(tot|of|en)$/.test(ws[i+1]||'')&&MIN.test(ws[i+3]||'')))return;V88_COL.forEach(([c,,f])=>{if(f(w))out.add(c)})})}
    return out};
  const colorsAll=v88Cols(r.h||i.tip||'',false),colorsMain=v88Cols(r.h||i.tip||'',true),colors=colorsMain.size?colorsMain:colorsAll;
  const m=(r.h||'').match(/(\d+(?:,\d+)?)\s*(?:[–-]\s*(\d+(?:,\d+)?))?\s*cm/),cm=m?(parseFloat(m[1].replace(',','.'))+parseFloat((m[2]||m[1]).replace(',','.')))/2:0;
  const size=cm?(cm<15?'klein':cm<40?'middel':'groot'):'';
  const hab=new Set(V88_HAB.filter(([,,re])=>re.test(desc)).map(h=>h[0]));
  const grp=typeof v50Group==='function'?v50Group(name):'';
  const txt=v88Norm([name,i.nl,i.en,r.s,(r.ak||[]).join(' '),r.fm,i.cat,grp].filter(Boolean).join(' '));
  x={name,nl:i.nl,en:i.en,cat:i.cat,grp,txt,desc,colors,colorsAll,size,cm,hab,mom:r.m||i.moment||''};V88.idx.set(name,x);return x}
/* elk zoekwoord moet kloppen: naam, kenmerk-woord of beschrijving */
function v88Match(name,q){const toks=v88Norm(q).split(/[\s,]+/).filter(t=>t.length>1);if(!toks.length)return true;const f=v88Feat(name);
  return toks.every(t=>{if(f.txt.includes(t))return true;const a=V88_ALIAS[t];
    if(a){if(a[0]==='c')return f.colorsAll.has(a[1]);if(a[0]==='s')return f.size===a[1];if(a[0]==='h')return f.hab.has(a[1]);if(a[0]==='m')return f.mom===a[1]}
    return t.length>=3&&f.desc.includes(t)})}
function v88Pass(name,F){const f=v88Feat(name);if(F.grp!=='Alle'&&f.cat!==F.grp)return false;
  for(const c of F.col)if(!f.colorsAll.has(c))return false;if(F.size&&f.size!==F.size)return false;
  for(const h of F.hab)if(!f.hab.has(h))return false;if(F.mom&&f.mom!==F.mom)return false;return v88Match(name,F.q)}
/* korte kenmerkregel onder een naam */
function v88Tags(name,extra){const f=v88Feat(name);
  return `<span class="v88-tags">${V88_COL.filter(c=>f.colors.has(c[0])).map(c=>`<i class="v88-dot" style="background:${c[1]}" title="${c[0]}"></i>`).join('')}${f.cm?`<small>${Math.round(f.cm)} cm</small>`:''}${extra||''}</span>`}

/* ---------- Waarneming-venster ---------- */
function v88List(day,region){const F=V88.f,here=new Map((V47_PLACES[region]||[]).map(([n,c])=>[n,c||0]));
  const {base,extras}=v47RegionNames(S[day-1]),focus=(V47_FOCUS[day]||{}).list||[];[...focus,...base,...extras].forEach(n=>{if(!here.has(n))here.set(n,typeof v47Chance==='function'?v47Chance(region,n)||2:2)});
  const all=Object.keys(V47_SP).filter(n=>!(typeof WL21_HIDE!=='undefined'&&WL21_HIDE.includes(n)));
  const hit=all.filter(n=>v88Pass(n,F)),cmp=(a,b)=>F.sort==='az'?v47Info(a).nl.localeCompare(v47Info(b).nl,'nl'):((here.get(b)||0)-(here.get(a)||0))||v47Info(a).nl.localeCompare(v47Info(b).nl,'nl');
  return {here:hit.filter(n=>here.has(n)).sort(cmp),other:hit.filter(n=>!here.has(n)).sort(cmp)}}
function v88Row(n,day,region,away){const o=state.v43Observations[v43name(n)],seen=!!o?.days?.[day],nm=(V84.list||[]).filter(p=>p.sp===v43name(n)&&p.day===day).length+(V84.vids||[]).filter(p=>p.sp===v43name(n)&&p.day===day).length;
  const i=v47Info(n),t=typeof wl2Thumb==='function'?wl2Thumb(n):'',where=away&&typeof wl2Where==='function'?wl2Where(n)[0]:null,enc=encodeURIComponent(n);
  return `<div class="v88-row ${seen?'seen':''}" data-v88="${enc}"><button class="v88-main" data-v88-open aria-label="${esc(i.nl)}: soortvenster openen"><span class="v88-img">${t?`<img src="${t}" alt="" loading="lazy">`:''}</span><span class="v88-txt"><b>${esc(i.nl)}</b><em>${i.nl!==i.en?esc(i.en)+' · ':''}${esc(v88Feat(n).grp||i.cat)}</em>${v88Tags(n,where?`<small class="v88-away">meestal ${esc(where[0])}</small>`:nm?`<small class="v88-nm">${nm} eigen</small>`:'')}</span></button>
    <button class="v88-seen ${seen?'on':''}" data-v88-seen aria-pressed="${seen}" aria-label="${seen?'Gezien vandaag':'Markeer als gezien vandaag'}">${dsI('lock',18).replace(DS_ICON.lock,'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')}</button>
    <label class="v88-cam" aria-label="Foto toevoegen">${dsI('lock',18).replace(DS_ICON.lock,V46_ICONS.camera)}<input type="file" accept="image/*" multiple hidden data-v88-photo></label></div>`}
function v88Today(day){const ids=Object.entries(state.v43Observations||{}).filter(([,o])=>o.days?.[day]).map(([id,o])=>o.name||id);
  if(!ids.length)return '';return `<div class="v88-today"><div class="ds-label">Vandaag geregistreerd · ${ids.length}</div><div class="v88-chips">${ids.map(n=>{const id=v43name(n),k=(V84.list||[]).filter(p=>p.sp===id&&p.day===day).length+(V84.vids||[]).filter(p=>p.sp===id&&p.day===day).length;
    return `<button data-v88-today="${encodeURIComponent(n)}">${esc(v47Info(n).nl)}${k?` <small>${k}</small>`:''}</button>`}).join('')}</div></div>`}
function v88Filters(){const F=V88.f,n=F.col.size+(F.size?1:0)+F.hab.size+(F.mom?1:0),grps=['Alle','Vogels','Zoogdieren','Reptielen','Amfibieën','Zeeleven'];
  return `<div class="v88-grp">${grps.map(g=>`<button data-v88-grp="${esc(g)}" class="${F.grp===g?'on':''}">${esc(g)}</button>`).join('')}</div>
   <div class="v88-bar"><button class="v88-kbtn ${F.open?'on':''}" data-v88-k aria-expanded="${F.open}">Kenmerken${n?` · ${n}`:''}</button><button data-v88-sort>${F.sort==='az'?'A–Z':'Makkelijkst eerst'}</button>${n||F.q?'<button data-v88-reset>Wissen</button>':''}</div>
   ${F.open?`<div class="v88-kpanel"><div class="ds-label">Kleur</div><div class="v88-cols">${V88_COL.map(([c,hex])=>`<button data-v88-col="${c}" class="${F.col.has(c)?'on':''}" aria-pressed="${F.col.has(c)}"><i style="background:${hex}"></i>${c}</button>`).join('')}</div>
     <div class="ds-label">Grootte</div><div class="v88-opts">${V88_SIZE.map(([k,l,s])=>`<button data-v88-size="${k}" class="${F.size===k?'on':''}">${l} <small>${s}</small></button>`).join('')}</div>
     <div class="ds-label">Leefgebied</div><div class="v88-opts">${V88_HAB.map(([k,l])=>`<button data-v88-hab="${k}" class="${F.hab.has(k)?'on':''}">${l}</button>`).join('')}</div>
     <div class="ds-label">Moment</div><div class="v88-opts">${Object.entries(V88_MOM).map(([k,l])=>`<button data-v88-mom="${k}" class="${F.mom===k?'on':''}">${l}</button>`).join('')}</div></div>`:''}`}
function v88Results(day,region){const {here,other}=v88List(day,region),F=V88.f,lim=F.limit,h=here.slice(0,lim),o=other.slice(0,Math.max(0,lim-h.length));
  const q=F.q.trim();
  return `${h.length?`<div class="ds-label v88-sec">Bij ${esc(region)} · ${here.length}</div>${h.map(n=>v88Row(n,day,region)).join('')}`:''}
    ${o.length?`<div class="ds-label v88-sec">Elders in Costa Rica · ${other.length}</div>${o.map(n=>v88Row(n,day,region,true)).join('')}`:''}
    ${here.length+other.length>lim?`<button class="ds-btn secondary v88-more" data-v88-more>Toon meer (${here.length+other.length-lim})</button>`:''}
    ${!here.length&&!other.length?`<p class="ds-meta v88-none">Geen soort gevonden${q?` voor "${esc(q)}"`:''}.</p>`:''}
    ${q.length>1?`<button class="ds-btn secondary v88-addown" data-v88-add>${dsI('plus',18)}"${esc(q)}" toevoegen als eigen soort</button>`:''}`}
function v88Draw(){const ov=document.getElementById('v52quick');if(!ov)return;const day=+ov.dataset.day,region=ov.dataset.region;
  ov.querySelector('.v88-tbox').innerHTML=v88Today(day);ov.querySelector('.v88-fbox').innerHTML=v88Filters();ov.querySelector('.v88-list').innerHTML=v88Results(day,region);v88Bind(ov)}
function v88Msg(t){const m=document.querySelector('#v52quick .v88-msg');if(m){m.textContent=t;clearTimeout(v88Msg.t);v88Msg.t=setTimeout(()=>{m.textContent=''},4000)}}
v52QuickOpen=function(){const day=currentDay||v48TripDay()||1,d=S[day-1],region=v47Region(d);document.getElementById('v52quick')?.remove();V88.f.limit=60;
  const ov=document.createElement('div');ov.className='detail-overlay';ov.id='v52quick';ov.dataset.day=day;ov.dataset.region=region;
  ov.innerHTML=`<section class="detail-sheet v52-sheet v88-sheet" role="dialog" aria-modal="true" aria-label="Waarneming registreren">
    <div class="v52-sheethead v88-head"><div><b>Waarneming</b><small>Dag ${day} · ${esc(region)}</small></div>
      <label class="ds-btn secondary v88-moodbtn">${dsI('lock',18).replace(DS_ICON.lock,V46_ICONS.camera)}Sfeerfoto<input type="file" accept="image/*" multiple hidden id="v88mood"></label>
      <button id="v52close" aria-label="Sluiten">✕</button></div>
    <p class="v88-msg ds-meta" aria-live="polite"></p><div class="v88-tbox"></div>
    <label class="ds-search v88-search">${dsI('search',18)}<input id="v88q" type="search" placeholder="Naam of kenmerk, bijv. rode buik, klein groen" autocomplete="off" enterkeyhint="search" value="${esc(V88.f.q)}"></label>
    <div class="v88-fbox"></div><div class="v88-list"></div></section>`;
  document.body.append(ov);const close=()=>{ov.remove();render()};ov.querySelector('#v52close').onclick=close;ov.onclick=e=>{if(e.target===ov)close()};
  const q=ov.querySelector('#v88q');let tm;q.oninput=()=>{clearTimeout(tm);tm=setTimeout(()=>{V88.f.q=q.value;V88.f.limit=60;ov.querySelector('.v88-list').innerHTML=v88Results(day,region);ov.querySelector('.v88-fbox').innerHTML=v88Filters();v88Bind(ov)},150)};
  ov.querySelector('#v88mood').onchange=async e=>{const fs=[...e.target.files];e.target.value='';if(!fs.length)return;v88Msg('Foto verwerken…');
    try{const r=await v84AddMood(day,fs);v88Msg(r.added?`${r.added} sfeerfoto${r.added===1?'':"'s"} toegevoegd aan dag ${day}${r.skipped?`; ${r.skipped} niet (max. ${V84_MOOD} per dag)`:''}.`:`Al ${V84_MOOD} sfeerfoto's op dag ${day}.`)}catch(x){v88Msg('Toevoegen mislukt: '+x.message)}};
  v88Draw();setTimeout(()=>{if(matchMedia('(pointer:fine)').matches)q.focus()},50)};
function v88Bind(ov){const day=+ov.dataset.day,region=ov.dataset.region,F=V88.f,redraw=()=>v88Draw();
  ov.querySelectorAll('[data-v88-grp]').forEach(b=>b.onclick=()=>{F.grp=b.dataset.v88Grp;F.limit=60;redraw()});
  ov.querySelector('[data-v88-k]')?.addEventListener('click',()=>{F.open=!F.open;redraw()});
  ov.querySelector('[data-v88-sort]')?.addEventListener('click',()=>{F.sort=F.sort==='az'?'kans':'az';redraw()});
  ov.querySelector('[data-v88-reset]')?.addEventListener('click',()=>{F.q='';F.col.clear();F.size='';F.hab.clear();F.mom='';F.grp='Alle';ov.querySelector('#v88q').value='';redraw()});
  ov.querySelectorAll('[data-v88-col]').forEach(b=>b.onclick=()=>{const c=b.dataset.v88Col;F.col.has(c)?F.col.delete(c):F.col.add(c);F.limit=60;redraw()});
  ov.querySelectorAll('[data-v88-size]').forEach(b=>b.onclick=()=>{F.size=F.size===b.dataset.v88Size?'':b.dataset.v88Size;redraw()});
  ov.querySelectorAll('[data-v88-hab]').forEach(b=>b.onclick=()=>{const h=b.dataset.v88Hab;F.hab.has(h)?F.hab.delete(h):F.hab.add(h);redraw()});
  ov.querySelectorAll('[data-v88-mom]').forEach(b=>b.onclick=()=>{F.mom=F.mom===b.dataset.v88Mom?'':b.dataset.v88Mom;redraw()});
  ov.querySelector('[data-v88-more]')?.addEventListener('click',()=>{F.limit+=60;redraw()});
  ov.querySelector('[data-v88-add]')?.addEventListener('click',()=>{const name=F.q.trim();if(!name||name.length>90)return;state.v43Extras[region]??=[];if(!state.v43Extras[region].some(x=>v43name(x)===v43name(name)))state.v43Extras[region].push(name);
    v86SetDay(name,region,day,'seen',true);if(typeof dseTag==='function')dseTag(name,region);F.q='';ov.querySelector('#v88q').value='';v88Msg(`"${name}" toegevoegd en gezien op dag ${day}.`);redraw()});
  ov.querySelectorAll('[data-v88-today]').forEach(b=>b.onclick=()=>wl2Open(decodeURIComponent(b.dataset.v88Today),region));
  ov.querySelectorAll('.v88-row').forEach(row=>{const n=decodeURIComponent(row.dataset.v88);
    row.querySelector('[data-v88-open]').onclick=()=>wl2Open(n,region);
    row.querySelector('[data-v88-seen]').onclick=()=>{const r=v86SetDay(n,region,day,'seen');if(typeof dseTag==='function')dseTag(n,region);v88Msg(r.seen?`${v47Info(n).nl}: gezien op dag ${day}.`:`${v47Info(n).nl}: vinkje dag ${day} weg.`);
      const y=ov.querySelector('.v88-sheet').scrollTop;redraw();ov.querySelector('.v88-sheet').scrollTop=y};
    row.querySelector('[data-v88-photo]').onchange=async e=>{const fs=[...e.target.files];e.target.value='';if(!fs.length)return;v88Msg('Foto verwerken…');
      try{const r=await v84Add(n,region,fs,day);v88Msg(r.added?`${r.added} foto${r.added===1?'':"'s"} toegevoegd aan ${v47Info(n).nl} (dag ${day})${r.skipped?`; ${r.skipped} niet (max. ${V84_MAX} per dag)`:''}.`:`${v47Info(n).nl} heeft al ${V84_MAX} foto's op dag ${day}.`);
        const y=ov.querySelector('.v88-sheet').scrollTop;redraw();ov.querySelector('.v88-sheet').scrollTop=y}catch(x){v88Msg('Toevoegen mislukt: '+x.message)}}})}
/* na het soortvenster de lijst bijwerken */
{const prev=wl2Close;wl2Close=function(){const r=prev.apply(this,arguments);if(document.getElementById('v52quick'))v88Draw();return r}}

/* ---------- daglijst: zoeken op kenmerken ---------- */
{const prev=v50ApplyFilter;v50ApplyFilter=function(){const q=v50Query.trim();if(!q)return prev();const keep=v50Query;v50Query='';prev();v50Query=keep;
  document.querySelectorAll('.v47-sp').forEach(c=>{if(c.style.display==='none')return;const b=c.querySelector('[data-wl2]'),n=b?decodeURIComponent(b.dataset.wl2):'';
    const ok=n?v88Match(n,q):c.dataset.search.includes(q.toLowerCase());if(!ok)c.style.display='none'});
  document.querySelectorAll('.v47-cat-h').forEach(h=>{let n=h.nextElementSibling,any=false;while(n&&!n.classList.contains('v47-cat-h')){if(n.classList.contains('v47-sp')&&n.style.display!=='none')any=true;n=n.nextElementSibling}h.style.display=any?'':'none'});
  document.querySelectorAll('.v47-focus').forEach(c=>{c.style.display=[...c.querySelectorAll('.v47-sp')].some(x=>x.style.display!=='none')?'':'none'})}}

/* ---------- "Waar zie ik…" (Wildlife): zoeken op naam en kenmerken ---------- */
v50GlobalSearch=function(v){const box=document.getElementById('v50gres');if(!box)return;const q=v.trim();if(q.length<2){box.innerHTML='';return}
  const reg=v47Region(S[(v48TripDay()||currentDay||1)-1]),qn=v88Norm(q);
  const hits=Object.keys(V47_SP).filter(n=>!(typeof WL21_HIDE!=='undefined'&&WL21_HIDE.includes(n))&&v88Match(n,q))
    .map(n=>({n,name:v88Feat(n).txt.includes(qn)?0:1,w:wl2Where(n)})).sort((a,b)=>(a.name-b.name)||((b.w[0]?.[1]||0)-(a.w[0]?.[1]||0))).slice(0,40);
  box.innerHTML=hits.length?hits.map(({n,w})=>{const i=v47Info(n),t=wl2Thumb(n);return `<button class="ds-gres wl2-gres" data-wl2="${encodeURIComponent(n)}" data-wl2-region="${encodeURIComponent(w[0]?w[0][0]:reg)}"><span class="wl2-logimg">${t?`<img src="${t}" alt="" loading="lazy">`:''}</span><span><b>${esc(i.nl)}</b>${i.nl!==i.en?`<em>${esc(i.en)}</em>`:''}${v88Tags(n)}<span class="ds-chips">${w.slice(0,5).map(([r,c])=>`<span class="c${c}">${esc(r)}</span>`).join('')||'<span>niet op de route verwacht</span>'}</span></span></button>`}).join('')
    :`<p class="ds-meta" style="margin-top:10px">Geen soort gevonden. Zoek op naam of kenmerk, bijv. "rode buik" of "klein groen".</p>`;
  wl2BindOpeners(box)};
/* zoekvelden: laten zien dat kenmerken werken */
{const prev=dayContent;dayContent=function(d){return prev(d).replace('placeholder="Zoek soort, NL of Engels"','placeholder="Naam of kenmerk, bijv. rood, nacht"')}}
{const prev=renderWildlife;renderWildlife=function(){return prev().replace(/placeholder="Waar zie ik…[^"]*"/,'placeholder="Waar zie ik… naam of kenmerk, bijv. rode buik"')}}
/* v8.14: kleuren en lengte ook op de soortkaarten in de daglijst en op de Wildlife-pagina, naast de kansschaal */
{const prev=v47Card;v47Card=function(name,region,focus){const h=prev(name,region,focus);
  return h.replace(/(<span class="ds-sp-txt"><b>[\s\S]*?<\/b><em>[\s\S]*?<\/em>)/,`$1${v88Tags(name).replace('class="v88-tags"','class="v88-tags v88-card"')}`)}}
