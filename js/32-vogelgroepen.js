/* =====================================================================
   v7.1 · Vogelgroepen
   Praktische indeling voor reizigers en fotografen (geen taxonomie):
   elke vogel krijgt precies één groep op basis van familie (WL2.f) en orde (WL2.o).
   Alleen metadata: geen extra lijsten, soort-ID's en opslag blijven gelijk.
   Werkt in de dag-wildlife (groepschips + status) en in de soortengids op het
   Wildlife-scherm (groep + regio + status).
   ===================================================================== */
const WG_GROUPS=['Roofvogels','Uilen en nachtzwaluwen','Toekans',"Papegaaien en ara's",'Kolibries','Trogons en quetzals','IJsvogels en motmots','Spechten','Reigers','Watervogels','Kust- en zeevogels','Tangares','Manakins en cotinga\'s','Zangvogels','Overige vogels'];
const WG_FAM={Accipitridae:0,Pandionidae:0,Cathartidae:0,Falconidae:0,
  Strigidae:1,Tytonidae:1,Nyctibiidae:1,Caprimulgidae:1,
  Ramphastidae:2,Psittacidae:3,Trochilidae:4,Trogonidae:5,Alcedinidae:6,Momotidae:6,Picidae:7,Ardeidae:8,
  Anatidae:9,Rallidae:9,Aramidae:9,Heliornithidae:9,Podicipedidae:9,Jacanidae:9,Eurypygidae:9,Anhingidae:9,Phalacrocoracidae:9,Threskiornithidae:9,Ciconiidae:9,
  Scolopacidae:10,Charadriidae:10,Recurvirostridae:10,Burhinidae:10,Haematopodidae:10,Laridae:10,Sulidae:10,Fregatidae:10,Pelecanidae:10,
  Thraupidae:11,Fringillidae:11,Pipridae:12,Cotingidae:12};
const WG_CACHE={};
function wgGroup(name){if(name in WG_CACHE)return WG_CACHE[name];let g='';
  if(v47Info(name).cat==='Vogels'){const r=wl2(name);
    if(r&&r.f in WG_FAM)g=WG_GROUPS[WG_FAM[r.f]];
    else if(r&&r.f==='Cardinalidae'&&/tanager/i.test(name))g='Tangares';
    else if(r&&r.o==='Passeriformes')g='Zangvogels';
    else if(r)g='Overige vogels';
    else g=wl2PrevGroup(name)||'Overige vogels'}
  return WG_CACHE[name]=g}
v50Group=wgGroup;
const WG_SKIP=new Set(['Blue morpho','Tarantula','Tropical reef fish']);
function wgSearchText(name){const i=v47Info(name),r=wl2(name);return (i.nl+' '+i.en+' '+(r?.s||'')).toLowerCase()}

/* status: Alle · Nog niet gezien (nergens op de reis) · Gezien · Op foto */
const WG_STATUS=['Alle','Nog niet gezien','Gezien','Op foto'];
function wgStatusOk(name,status,region){if(status==='Alle')return true;const o=state.v43Observations[v43name(name)],pl=o?.places||{};
  const recs=region?[pl[region]||{}]:Object.values(pl);
  if(status==='Nog niet gezien')return !Object.values(pl).some(v=>v.seen);
  if(status==='Gezien')return recs.some(v=>v.seen);
  return recs.some(v=>v.photo)}
function wgCount(list){const c={};list.forEach(n=>{const g=wgGroup(n);if(g)c[g]=(c[g]||0)+1});return c}
function wgChips(attr,cur,counts,total){return `<div class="ds-filter sub wg-chips" role="toolbar" aria-label="Vogelgroep"><button ${attr}="Alle" class="${cur==='Alle'?'on':''}">Alle <em>${total}</em></button>${WG_GROUPS.filter(g=>counts[g]).map(g=>`<button ${attr}="${esc(g)}" class="${cur===g?'on':''}">${esc(g)} <em>${counts[g]}</em></button>`).join('')}</div>`}
function wgStatusRow(attr,cur){return `<div class="wg-status" role="toolbar" aria-label="Waarnemingen">${WG_STATUS.map(s=>`<button ${attr}="${s}" class="${cur===s?'on':''}">${s}</button>`).join('')}</div>`}

/* ---------- dag-wildlife: groepschips met aantallen + statusfilter ---------- */
let wgDayStatus='Alle';
const wgPrevCard=v47Card;
v47Card=function(name,region,focus){const h=wgPrevCard(name,region,focus),o=state.v43Observations[v43name(name)],pl=o?.places||{},here=pl[region]||{};
  const st=(Object.values(pl).some(v=>v.seen)?'a':'')+(here.seen?'s':'')+(here.photo?'p':'');
  return h.replace(/data-search="([^"]*)"/,(m,s)=>`data-search="${esc(wgSearchText(name))} ${s}" data-wg-st="${st}"`)};
const wgPrevSL=speciesList;
speciesList=function(d){let h=wgPrevSL(d);if(v47Filter!=='Vogels')return h;
  const {base,extras}=v47RegionNames(d),focus=(V47_FOCUS[d.id]||{}).list||[];
  const birds=[...new Set([...focus,...base,...extras])].filter(n=>v47Info(n).cat==='Vogels');
  if(v50BirdGroup!=='Alle'&&!birds.some(n=>wgGroup(n)===v50BirdGroup))v50BirdGroup='Alle';
  return h.replace(/<div class="ds-filter sub">[\s\S]*?<\/div>/,wgChips('data-v50-group',v50BirdGroup,wgCount(birds),birds.length)+wgStatusRow('data-wg-dst',wgDayStatus))};
const wgPrevApply=v50ApplyFilter;
v50ApplyFilter=function(){wgPrevApply();if(v47Filter!=='Vogels'||wgDayStatus==='Alle')return;
  const need={'Nog niet gezien':st=>!st.includes('a'),'Gezien':st=>st.includes('s'),'Op foto':st=>st.includes('p')}[wgDayStatus];
  document.querySelectorAll('.v47-sp').forEach(c=>{if(c.style.display!=='none'&&!need(c.dataset.wgSt||''))c.style.display='none'});
  document.querySelectorAll('.v47-cat-h').forEach(h=>{let n=h.nextElementSibling,any=false;while(n&&!n.classList.contains('v47-cat-h')){if(n.classList.contains('v47-sp')&&n.style.display!=='none')any=true;n=n.nextElementSibling}h.style.display=any?'':'none'});
  document.querySelectorAll('.v47-focus').forEach(c=>{c.style.display=[...c.querySelectorAll('.v47-sp')].some(x=>x.style.display!=='none')?'':'none'})};

/* ---------- Wildlife-scherm: soortengids ---------- */
const WG_CATS=['Vogels','Zoogdieren','Reptielen','Amfibieën','Zeeleven'];
const wg={cat:'',group:'Alle',region:'',status:'Alle',all:false};
function wgRegions(){return [...new Set(S.map(d=>v47Region(d)))].filter(r=>V47_PLACES[r]&&V47_PLACES[r].length)}
function wgDefaultRegion(name){if(wg.region)return wg.region;const w=wl2Where(name);return w[0]?w[0][0]:v47Region(S[(v48TripDay()||currentDay)-1])}
function wgBase(){const inReg=wg.region?new Set((V47_PLACES[wg.region]||[]).map(x=>x[0])):null;
  return Object.keys(V47_SP).filter(n=>!WG_SKIP.has(n)&&(!inReg||inReg.has(n))&&wgStatusOk(n,wg.status,wg.region))}
function wgRow(n){const i=v47Info(n),t=wl2Thumb(n),o=state.v43Observations[v43name(n)],pl=Object.values(o?.places||{}),seen=pl.some(v=>v.seen),photo=pl.some(v=>v.photo),ch=wg.region?v47Chance(wg.region,n):0;
  return `<button class="wg-row" data-wl2="${encodeURIComponent(n)}" data-wl2-region="${encodeURIComponent(wgDefaultRegion(n))}"><span class="wg-img">${t?`<img src="${t}" alt="" loading="lazy" decoding="async">`:''}</span><span class="wg-txt"><b>${esc(i.nl)}</b><small>${i.nl!==i.en?esc(i.en)+' · ':''}${esc(wgGroup(n)||i.cat)}</small>${ch?`<span class="ds-chance c${ch}">${[1,2,3,4].map(k=>`<i class="${k<=ch?'f':''}"></i>`).join('')}</span>`:''}</span><span class="wg-st">${seen?`<i class="on" title="Gezien">${dsI('lock',14).replace(DS_ICON.lock,'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')}</i>`:''}${photo?`<i class="on" title="Op foto">${dsI('lock',14).replace(DS_ICON.lock,V46_ICONS.camera)}</i>`:''}</span></button>`}
function wgGuide(){const base=wgBase(),cc={};base.forEach(n=>{const c=v47Info(n).cat;cc[c]=(cc[c]||0)+1});
  const catChips=`<div class="ds-filter" role="toolbar" aria-label="Diergroep">${WG_CATS.map(c=>`<button data-wg-cat="${esc(c)}" class="${wg.cat===c?'on':''}">${esc(c)} <em>${cc[c]||0}</em></button>`).join('')}</div>`;
  let body='',groupRow='';
  if(wg.cat){const inCat=base.filter(n=>v47Info(n).cat===wg.cat);let list=inCat;
    if(wg.cat==='Vogels'){const counts=wgCount(inCat);if(wg.group!=='Alle'&&!counts[wg.group])wg.group='Alle';groupRow=wgChips('data-wg-group',wg.group,counts,inCat.length);if(wg.group!=='Alle')list=inCat.filter(n=>wgGroup(n)===wg.group)}
    const sorted=list.map(n=>[n,wg.region?v47Chance(wg.region,n):0,v47Info(n).nl]).sort((a,b)=>b[1]-a[1]||a[2].localeCompare(b[2],'nl')).map(x=>x[0]);
    const shown=wg.all?sorted:sorted.slice(0,60);
    body=`<div class="wg-res"><div class="wg-resh"><b>${sorted.length} ${sorted.length===1?'soort':'soorten'}</b><small>${wg.region?'kans in '+esc(wg.region):'hele reis'}</small></div>${shown.map(wgRow).join('')||'<p class="ds-meta">Geen soorten in deze combinatie.</p>'}${sorted.length>shown.length?`<button class="ds-btn secondary wg-more" data-wg-all>Toon alle ${sorted.length}</button>`:''}</div>`}
  return `<div class="ds-card wg-guide" id="wgGuide"><div class="wg-head"><span class="ds-label">Soortengids</span><small>Tik een soort voor foto's, uitleg en registratie</small></div>${catChips}${groupRow}
    <div class="wg-sel"><label><span class="sr">Regio</span><select id="wgRegion"><option value="">Hele reis</option>${wgRegions().map(r=>`<option ${wg.region===r?'selected':''}>${esc(r)}</option>`).join('')}</select></label>${wgStatusRow('data-wg-status',wg.status)}</div>${body}</div>`}
const wgPrevWild=renderWildlife;
renderWildlife=function(){const h=wgPrevWild();return h.includes('<div class="ds-card wl2-life">')?h.replace('<div class="ds-card wl2-life">',wgGuide()+'<div class="ds-card wl2-life">'):h.replace(/(<div class="ds-section-title">Per reisdag<\/div>)/,`${wgGuide()}$1`)};
function wgRefresh(){const g=document.getElementById('wgGuide');if(!g)return render();const tmp=document.createElement('div');tmp.innerHTML=wgGuide();g.replaceWith(tmp.firstElementChild);wgBind()}
function wgBind(){const g=document.getElementById('wgGuide');if(!g)return;
  g.querySelectorAll('[data-wg-cat]').forEach(b=>b.onclick=()=>{wg.cat=wg.cat===b.dataset.wgCat?'':b.dataset.wgCat;wg.group='Alle';wg.all=false;wgRefresh()});
  g.querySelectorAll('[data-wg-group]').forEach(b=>b.onclick=()=>{wg.group=b.dataset.wgGroup;wg.all=false;wgRefresh()});
  g.querySelectorAll('[data-wg-status]').forEach(b=>b.onclick=()=>{wg.status=b.dataset.wgStatus;wgRefresh()});
  const s=g.querySelector('#wgRegion');if(s)s.onchange=()=>{wg.region=s.value;wgRefresh()};
  const m=g.querySelector('[data-wg-all]');if(m)m.onclick=()=>{wg.all=true;wgRefresh()};
  wl2BindOpeners(g)}
const wgPrevBind=bindExtras;
bindExtras=function(){wgPrevBind();wgBind();
  document.querySelectorAll('[data-wg-dst]').forEach(b=>b.onclick=()=>{wgDayStatus=b.dataset.wgDst;document.querySelectorAll('[data-wg-dst]').forEach(x=>x.classList.toggle('on',x===b));v50ApplyFilter()});
  document.querySelectorAll('[data-v47-filter]').forEach(b=>{const f=b.onclick;b.onclick=()=>{wgDayStatus='Alle';f&&f()}})};
render();
