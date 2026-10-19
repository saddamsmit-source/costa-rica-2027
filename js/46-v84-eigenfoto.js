/* =====================================================================
   v8.4 · Eigen foto's per soort + Reisverhaal
   - Per soort maximaal 3 eigen foto's, één favoriet (wordt de soortfoto in de app en staat in het reisverhaal).
   - Foto's staan in een aparte IndexedDB-database (cr27-eigen-fotos); CR27_V2 blijft ongewijzigd.
     Verkleind naar maximaal 1600 px (JPEG ±0,84) om opslag te sparen.
   - Foto-back-up: zip met de JPEG's + fotos.json; terugzetten voegt samen (verwijdert niets).
   - Reisverhaal: schermvullende diashow van alle soorten met eigen foto, op volgorde van de reis;
     alle tekst komt uit eigen waarnemingen en notities.
   ===================================================================== */
const V84_DB='cr27-eigen-fotos',V84_MAX=3,V84_PX=1600;
const V84={list:[],url:{},ready:false};
let v84DbP=null;
const v84Req=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
function v84Db(){return v84DbP??=new Promise((res,rej)=>{let r;try{r=indexedDB.open(V84_DB,1)}catch(e){rej(e);return}
  r.onupgradeneeded=()=>{const s=r.result.createObjectStore('photos',{keyPath:'id'});s.createIndex('sp','sp')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function v84Write(fn){const db=await v84Db(),tx=db.transaction('photos','readwrite');fn(tx.objectStore('photos'));
  return new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error||new Error('Opslaan afgebroken'))})}
async function v84Load(){try{const db=await v84Db();const all=await v84Req(db.transaction('photos').objectStore('photos').getAll());
    Object.values(V84.url).forEach(u=>URL.revokeObjectURL(u));V84.url={};all.forEach(p=>V84.url[p.id]=URL.createObjectURL(p.blob));V84.list=all}catch(e){V84.list=[];V84.err=e.message}
  V84.ready=true}
const v84Of=name=>{const sp=v43name(name);return V84.list.filter(p=>p.sp===sp).sort((a,b)=>(b.fav-a.fav)||a.t.localeCompare(b.t))};
const v84Fav=name=>v84Of(name)[0]||null;
const v84FavUrl=name=>{const f=v84Fav(name);return f?V84.url[f.id]:''};
const v84Uid=()=>(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));
const v84DayFor=region=>{if(tab==='days'&&currentDay&&v47Region(S[currentDay-1])===region)return currentDay;const d=S.find(x=>v47Region(x)===region);return d?d.id:0};

/* opnamedatum uit EXIF (DateTimeOriginal), niet de bestandsdatum: die is bij overzetten vaak de dag van kopiëren */
async function v84Exif(file){try{const b=new DataView(await file.slice(0,262144).arrayBuffer());if(b.byteLength<4||b.getUint16(0)!==0xFFD8)return '';let o=2;
  while(o<b.byteLength-10){const m=b.getUint16(o),len=b.getUint16(o+2);
    if(m===0xFFE1&&b.getUint32(o+4)===0x45786966){const t=o+10,le=b.getUint16(t)===0x4949,g16=x=>b.getUint16(x,le),g32=x=>b.getUint32(x,le);
      const ifd=off=>{const n=g16(t+off),out={};for(let i=0;i<n;i++){const e=t+off+2+i*12;out[g16(e)]=g32(e+8)}return out};
      const rd=off=>{let s='';for(let k=0;k<19;k++)s+=String.fromCharCode(b.getUint8(t+off+k));return s};
      const i0=ifd(g32(t+4));let d='';if(i0[0x8769]){const ex=ifd(i0[0x8769]);if(ex[0x9003])d=rd(ex[0x9003])}if(!d&&i0[0x0132])d=rd(i0[0x0132]);
      const mm=d.match(/(\d{4}):(\d\d):(\d\d) (\d\d):(\d\d):(\d\d)/);return mm?`${mm[1]}-${mm[2]}-${mm[3]}T${mm[4]}:${mm[5]}:${mm[6]}`:''}
    if((m&0xFF00)!==0xFF00)break;o+=2+len}}catch(e){}return ''}
async function v84Shrink(file){let src;
  try{src=await createImageBitmap(file,{imageOrientation:'from-image'})}
  catch(e){src=await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error('Dit bestand is geen leesbare foto.'));im.src=URL.createObjectURL(file)})}
  const w0=src.width,h0=src.height,s=Math.min(1,V84_PX/Math.max(w0,h0)),w=Math.round(w0*s),h=Math.round(h0*s);
  const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(src,0,0,w,h);
  const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.84));if(!blob)throw new Error('Foto kon niet worden verwerkt.');return {blob,w,h}}

async function v84Add(name,region,files){const have=v84Of(name).length,room=V84_MAX-have;if(room<=0)return {added:0,skipped:files.length};
  const sp=v43name(name),day=v84DayFor(region);let added=0;
  for(const f of [...files].slice(0,room)){const {blob,w,h}=await v84Shrink(f);
    const rec={id:v84Uid(),sp,name,region,day,t:new Date().toISOString(),taken:await v84Exif(f),w,h,blob,fav:have+added===0};
    await v84Write(st=>st.put(rec));added++}
  const r=wl2Rec(name,region);if(!r||!r.photo)v52Set(name,region,'photo',true);
  await v84Load();return {added,skipped:Math.max(0,files.length-room)}}
async function v84SetFav(id){const p=V84.list.find(x=>x.id===id);if(!p)return;const sibs=V84.list.filter(x=>x.sp===p.sp);
  await v84Write(st=>sibs.forEach(x=>st.put({...x,fav:x.id===id})));await v84Load()}
async function v84Remove(id){const p=V84.list.find(x=>x.id===id);if(!p)return;await v84Write(st=>st.delete(id));
  const rest=V84.list.filter(x=>x.sp===p.sp&&x.id!==id);if(p.fav&&rest.length)await v84Write(st=>st.put({...rest[0],fav:true}));await v84Load()}

/* ---------- soortvenster: eigen foto's ---------- */
function v84SheetBlock(name){const own=v84Of(name);
  return `<div class="v84-own"><div class="v84-h"><b>Eigen foto's</b><small>${own.length} van ${V84_MAX}${own.length?' · ster = favoriet':''}</small></div>
    ${own.length?`<div class="v84-grid">${own.map(p=>`<div class="v84-ph ${p.fav?'fav':''}"><img src="${V84.url[p.id]}" alt="Eigen foto ${esc(v47Info(name).nl)}"><button class="v84-star" data-v84-fav="${p.id}" aria-label="${p.fav?'Favoriet':'Maak favoriet'}" aria-pressed="${p.fav}">${dsI('star',16)}</button><button class="v84-del" data-v84-del="${p.id}" aria-label="Foto verwijderen">${dsI('plus',16)}</button></div>`).join('')}</div>`:''}
    ${own.length<V84_MAX?`<label class="ds-btn secondary v84-add">${dsI('plus',18)}Eigen foto toevoegen<input type="file" accept="image/*" ${own.length<V84_MAX-1?'multiple':''} hidden data-v84-add></label>`:''}
    <p class="v84-msg ds-meta" aria-live="polite"></p></div>`}
{const prev=wl2SheetHtml;wl2SheetHtml=function(name,region){let h=prev(name,region);if(!V84.ready)return h;
  if(v84Fav(name))h=h.replace(/<span class="wl2-credit">[^<]*<\/span>/,'<span class="wl2-credit">Eigen foto</span>');
  return h.replace(/(<div class="wl2-reg">[\s\S]*?<\/div><\/div>)/,`$1${v84SheetBlock(name)}`)}}
{const prev=wl2BindSheet;wl2BindSheet=function(ov){prev(ov);const {name,region}=wl2Cur||{};if(!name)return;
  const msg=ov.querySelector('.v84-msg'),again=()=>{const y=ov.querySelector('.wl2-sheet').scrollTop;wl2Open(name,region);ov.querySelector('.wl2-sheet').scrollTop=y};
  const inp=ov.querySelector('[data-v84-add]');if(inp)inp.onchange=async()=>{const fs=[...inp.files];inp.value='';if(!fs.length)return;msg.textContent='Foto verwerken…';
    try{const r=await v84Add(name,region,fs);again();const m=document.querySelector('#wl2Sheet .v84-msg');if(m&&r.skipped)m.textContent=`${r.skipped} foto${r.skipped>1?"'s":''} niet toegevoegd: maximaal ${V84_MAX} per soort.`}
    catch(e){msg.textContent=/quota/i.test(e.name+e.message)?'De opslag op deze telefoon is vol. Maak een foto-back-up en verwijder oude foto’s.':'Toevoegen mislukt: '+e.message}};
  ov.querySelectorAll('[data-v84-fav]').forEach(b=>b.onclick=async()=>{await v84SetFav(b.dataset.v84Fav);again()});
  ov.querySelectorAll('[data-v84-del]').forEach(b=>b.onclick=async()=>{if(!confirm('Deze eigen foto verwijderen? Dit kan niet ongedaan worden gemaakt, tenzij hij in een foto-back-up staat.'))return;await v84Remove(b.dataset.v84Del);again()})}}

/* ---------- eigen favoriet overal als soortfoto ---------- */
{const pT=wl2Thumb,pM=wl2Mid,pH=wl2Hd;wl2Thumb=n=>v84FavUrl(n)||pT(n);wl2Mid=n=>v84FavUrl(n)||pM(n);wl2Hd=n=>v84FavUrl(n)||pH(n)}
{const prev=v47Card;v47Card=function(name,region,focus){const h=prev(name,region,focus),u=v84FavUrl(name);if(!u)return h;
  return h.replace(/<span class="ds-sp-img">(?:<img [^>]*>|<span class="ds-sp-ico">[\s\S]*?<\/span>)/,`<span class="ds-sp-img v84-mine"><img src="${u}" alt="" loading="lazy">`)}}

/* ---------- reisverhaal ---------- */
function v84Story(){const favs=[...new Set(V84.list.map(p=>p.sp))].map(sp=>V84.list.filter(p=>p.sp===sp).sort((a,b)=>b.fav-a.fav)[0]);
  favs.sort((a,b)=>(a.day-b.day)||(a.taken||a.t).localeCompare(b.taken||b.t));if(!favs.length)return [];
  const seen=Object.values(state.v43Observations||{}).filter(o=>Object.values(o.places||{}).some(r=>r.seen)).length;
  const out=[{k:'intro',src:V84.url[favs[0].id],title:'Costa Rica 2027',sub:'Ons wildlife-verhaal',meta:`${fmt(S[0].date)} – ${fmt(S[S.length-1].date)} · ${favs.length} ${favs.length===1?'soort':'soorten'} op eigen foto`}];
  let cur=null;favs.forEach(p=>{if(p.region!==cur){cur=p.region;const grp=favs.filter(x=>x.region===cur),days=[...new Set(S.filter(d=>v47Region(d)===cur).map(d=>d.id))];
      out.push({k:'place',src:V84.url[p.id],title:cur,sub:days.length?(days.length>1?`Dag ${days[0]}–${days[days.length-1]}`:`Dag ${days[0]}`)+' · '+fmt(S[days[0]-1].date):'',meta:`${grp.length} ${grp.length===1?'soort':'soorten'}`})}
    const i=v47Info(p.name),r=wl2(p.name)||{},obs=wl2Rec(p.name,p.region)||{},note=state.v44Log?.[p.sp]?.[p.region]?.note||'';
    const when=p.taken?new Date(p.taken):(obs.t?new Date(obs.t):null);
    out.push({k:'sp',src:V84.url[p.id],title:i.nl,sub:[i.nl!==i.en?i.en:'',r.s||''].filter(Boolean).join(' · '),meta:[p.day?'Dag '+p.day:'',p.region,when&&!isNaN(when)?when.toLocaleString('nl-NL',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''].filter(Boolean).join(' · '),note})});
  out.push({k:'end',src:V84.url[favs[favs.length-1].id],title:'Pura vida',sub:`${seen} ${seen===1?'soort':'soorten'} gezien · ${favs.length} op eigen foto`,meta:`${[...new Set(favs.map(p=>p.region))].length} bestemmingen · ${S.length} dagen`});
  return out}
let v84P=null;
function v84Slide(s){return `<div class="v84-slide ${s.k}">${s.k==='sp'?`<img class="v84-bg" src="${s.src}" alt="">`:''}<img class="v84-fg" src="${s.src}" alt=""><div class="v84-cap">${s.k==='sp'?'':`<span class="ds-label">${s.k==='place'?'Bestemming':s.k==='end'?'Einde':'Reisverhaal'}</span>`}<h2>${esc(s.title)}</h2>${s.sub?`<p class="v84-sub">${esc(s.sub)}</p>`:''}${s.meta?`<p class="v84-meta">${esc(s.meta)}</p>`:''}${s.note?`<p class="v84-note">“${esc(s.note)}”</p>`:''}</div></div>`}
function v84Play(){const slides=v84Story();if(!slides.length)return;v84Close();
  const el=document.createElement('div');el.id='v84Play';el.className='v84-play';el.setAttribute('role','dialog');el.setAttribute('aria-label','Reisverhaal');
  el.innerHTML=`<div class="v84-stage"></div><div class="v84-bar"><i></i></div><div class="v84-ctl"><button data-v84-c="prev" aria-label="Vorige">${dsI('chevL',22)}</button><button data-v84-c="pause" aria-label="Pauze">${'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 5v14M15 5v14"/></svg>'}</button><button data-v84-c="next" aria-label="Volgende">${dsI('chevR',22)}</button><button data-v84-c="close" aria-label="Sluiten">${dsI('plus',22)}</button></div>`;
  document.body.append(el);document.body.classList.add('wl2-lock');
  v84P={el,slides,i:0,paused:false,timer:null};v84Show(0);
  try{el.requestFullscreen&&el.requestFullscreen().catch(()=>{})}catch(e){}
  el.querySelectorAll('[data-v84-c]').forEach(b=>b.onclick=e=>{e.stopPropagation();const c=b.dataset.v84C;if(c==='close')v84Close();else if(c==='pause')v84Pause();else v84Show(v84P.i+(c==='next'?1:-1))});
  el.querySelector('.v84-stage').onclick=e=>{const x=e.clientX/innerWidth;v84Show(v84P.i+(x<.33?-1:1))};
  document.addEventListener('keydown',v84Key)}
function v84Key(e){if(!v84P)return;if(e.key==='ArrowRight')v84Show(v84P.i+1);else if(e.key==='ArrowLeft')v84Show(v84P.i-1);else if(e.key===' '){e.preventDefault();v84Pause()}else if(e.key==='Escape')v84Close()}
function v84Show(i){const P=v84P;if(!P)return;if(i>=P.slides.length){v84Close();return}i=Math.max(0,i);P.i=i;const s=P.slides[i];
  P.el.querySelector('.v84-stage').innerHTML=v84Slide(s);P.el.querySelector('.v84-bar i').style.width=Math.round(100*(i+1)/P.slides.length)+'%';
  const nx=P.slides[i+1];if(nx){const im=new Image();im.src=nx.src}
  clearTimeout(P.timer);if(!P.paused)P.timer=setTimeout(()=>v84Show(P.i+1),s.k==='sp'?(s.note?7000:5000):3500)}
function v84Pause(){const P=v84P;if(!P)return;P.paused=!P.paused;P.el.classList.toggle('paused',P.paused);const b=P.el.querySelector('[data-v84-c="pause"]');b.setAttribute('aria-label',P.paused?'Afspelen':'Pauze');
  b.innerHTML=P.paused?'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5l11 7-11 7z"/></svg>':'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 5v14M15 5v14"/></svg>';
  clearTimeout(P.timer);if(!P.paused)v84Show(P.i)}
function v84Close(){if(v84P){clearTimeout(v84P.timer);v84P=null}document.removeEventListener('keydown',v84Key);const el=document.getElementById('v84Play');if(el){el.remove();document.body.classList.remove('wl2-lock')}
  try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}}
function v84StoryCard(){const n=new Set(V84.list.map(p=>p.sp)).size;
  return `<div class="ds-section-title">Reisverhaal</div><div class="ds-card v84-story"><div><b>${n?`${n} ${n===1?'soort':'soorten'} met eigen foto`:'Nog geen eigen foto’s'}</b><p class="ds-meta">${n?'Diashow van jullie eigen foto’s op volgorde van de reis, met naam, moment en je notitie. Laat zien op tv via AirPlay of Chromecast.':'Voeg in een soortvenster je eigen foto toe; daarna verschijnt hier jullie reisverhaal.'}</p></div>${n?`<button class="ds-btn primary" id="v84go">${'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5l11 7-11 7z"/></svg>'}Afspelen</button>`:''}</div>`}
{const prev=renderWildlife;renderWildlife=function(){const h=prev();
  return h.includes('<div class="ds-section-title">Logboek</div>')?h.replace('<div class="ds-section-title">Logboek</div>',v84StoryCard()+'<div class="ds-section-title">Logboek</div>'):h}}

/* ---------- foto-back-up (zip, ongecomprimeerd) ---------- */
const V84_CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const v84Crc=b=>{let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=V84_CRC[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0};
async function v84Zip(files){const parts=[],cen=[];let off=0;const enc=new TextEncoder();
  for(const f of files){const name=enc.encode(f.name),data=new Uint8Array(await f.blob.arrayBuffer()),crc=v84Crc(data);
    const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint32(14,crc,true);lh.setUint32(18,data.length,true);lh.setUint32(22,data.length,true);lh.setUint16(26,name.length,true);
    parts.push(lh,name,data);
    const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint32(16,crc,true);ch.setUint32(20,data.length,true);ch.setUint32(24,data.length,true);ch.setUint16(28,name.length,true);ch.setUint32(42,off,true);
    cen.push(ch,name);off+=30+name.length+data.length}
  const cs=cen.reduce((s,x)=>s+x.byteLength,0),end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cs,true);end.setUint32(16,off,true);
  return new Blob([...parts,...cen,end],{type:'application/zip'})}
async function v84Unzip(blob){const buf=new Uint8Array(await blob.arrayBuffer()),dv=new DataView(buf.buffer),dec=new TextDecoder(),out={};let p=0;
  while(p+30<=buf.length&&dv.getUint32(p,true)===0x04034b50){const method=dv.getUint16(p+8,true),size=dv.getUint32(p+18,true),nl=dv.getUint16(p+26,true),xl=dv.getUint16(p+28,true);
    const name=dec.decode(buf.subarray(p+30,p+30+nl)),start=p+30+nl+xl;if(method!==0)throw new Error('Dit is geen foto-back-up van deze app.');out[name]=buf.slice(start,start+size);p=start+size}
  return out}
const v84Slug=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
async function v84Export(){if(!V84.list.length)return;const files=V84.list.map(p=>({...p,name:`${String(p.day||0).padStart(2,'0')}-${v84Slug(v47Info(p.name).nl)}-${p.id.slice(0,6)}.jpg`}));
  const meta=files.map(({blob,...m})=>({...m,file:m.name,name:undefined,species:V84.list.find(x=>x.id===m.id).name}));
  const json={format:'CR27_FOTOS',version:1,exportedAt:new Date().toISOString(),photos:meta};
  const zip=await v84Zip([...files.map(f=>({name:f.name,blob:f.blob})),{name:'fotos.json',blob:new Blob([JSON.stringify(json,null,1)])}]);
  const a=document.createElement('a');a.href=URL.createObjectURL(zip);a.download=`costa-rica-2027-eigen-fotos-${new Date().toISOString().slice(0,10)}.zip`;document.body.append(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);state.v84LastBackup=new Date().toISOString();save();return zip}
async function v84Import(file){const files=await v84Unzip(file),j=files['fotos.json'];if(!j)throw new Error('fotos.json ontbreekt: dit is geen foto-back-up van deze app.');
  const meta=JSON.parse(new TextDecoder().decode(j));if(meta.format!=='CR27_FOTOS')throw new Error('Dit is geen foto-back-up van deze app.');
  const have=new Set(V84.list.map(p=>p.id));let n=0;
  await v84Write(st=>meta.photos.forEach(m=>{if(have.has(m.id)||!files[m.file])return;const {file:f,species,...rest}=m;st.put({...rest,name:species,blob:new Blob([files[m.file]],{type:'image/jpeg'})});n++}));
  await v84Load();return n}
function v84BackupCard(){const n=V84.list.length,mb=V84.list.reduce((s,p)=>s+(p.blob?.size||0),0)/1048576,last=state.v84LastBackup,newer=n&&(!last||V84.list.some(p=>p.t>last));
  return `<div class="ds-card v84-bk ${newer?'warn':''}"><b>Eigen foto's</b><p class="ds-meta">${n?`${n} foto${n===1?'':"'s"} · ${mb.toFixed(1)} MB op deze telefoon. `:'Nog geen eigen foto’s. '}${last?`Laatste foto-back-up: ${v75When(last)}.`:'Nog geen foto-back-up gemaakt.'}${newer?' Er zijn foto’s die nog niet in een foto-back-up staan.':''}</p>
    <p class="ds-meta">De gewone back-up bevat geen foto’s. Bewaar de foto-back-up (zip) ook buiten deze telefoon.</p>
    <div class="ds-bkbtns">${n?`<button class="ds-btn primary" id="v84exp">${dsdI('download',18)}Foto-back-up (zip)</button>`:''}<label class="ds-btn secondary">Foto-back-up terugzetten<input type="file" accept=".zip,application/zip" hidden id="v84imp"></label></div><p class="ds-meta v84-bkmsg" aria-live="polite"></p></div>`}
{const prev=DSD_MORE.backup;DSD_MORE.backup=()=>prev().replace(/<\/div>\s*$/,v84BackupCard()+'</div>')}
{const prev=bind;bind=function(){prev();const g=document.getElementById('v84go');if(g)g.onclick=v84Play;
  const ex=document.getElementById('v84exp'),msg=()=>document.querySelector('.v84-bkmsg');if(ex)ex.onclick=async()=>{ex.disabled=true;try{await v84Export();render()}catch(e){const m=msg();if(m)m.textContent='Foto-back-up mislukt: '+e.message}ex.disabled=false};
  const im=document.getElementById('v84imp');if(im)im.onchange=async()=>{const f=im.files[0];im.value='';if(!f)return;try{const n=await v84Import(f);render();const m=msg();if(m)m.textContent=n?`${n} foto${n===1?'':"'s"} teruggezet.`:'Alle foto’s uit deze back-up stonden er al.'}catch(e){const m=msg();if(m)m.textContent='Terugzetten mislukt: '+e.message}}}}
/* laden na opstarten; daarna opnieuw tekenen zodat eigen foto's zichtbaar zijn */
v84Load().then(()=>{if(V84.list.length)render()});
