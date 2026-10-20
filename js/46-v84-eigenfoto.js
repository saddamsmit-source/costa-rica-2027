/* =====================================================================
   v8.4 · Eigen foto's per soort + Reisverhaal
   v8.6: per soort per dag eigen foto's en 1 eigen video (max. 5 s, omgezet naar ≤1080p zonder geluid).
   v8.7: per soort per dag max. 3 foto's; per dag max. 5 sfeerfoto's (kind:'mood', in Overzicht van de dag);
         scherpte per foto (sharp) en voorkeursster op video's voor de automatische keuze in de reisvideo.
   - Per soort één favoriete foto (wordt de soortfoto in de app en staat in het reisverhaal).
   - Foto's staan in een aparte IndexedDB-database (cr27-eigen-fotos); CR27_V2 blijft ongewijzigd.
     Verkleind naar maximaal 1600 px (JPEG ±0,84) om opslag te sparen.
   - Foto-back-up: zip met de JPEG's + fotos.json; terugzetten voegt samen (verwijdert niets).
   - Reisverhaal: schermvullende diashow van alle soorten met eigen foto, op volgorde van de reis;
     alle tekst komt uit eigen waarnemingen en notities.
   ===================================================================== */
const V84_DB='cr27-eigen-fotos',V84_MAX=3,V84_VMAX=1,V84_VLEN=5,V84_PX=1600,V84_MOOD=15,V84_STAY=3;
/* list = foto's, vids = video's (zelfde database, kind:'video') */
const V84={list:[],vids:[],moods:[],stays:[],url:{},poster:{},ready:false};
let v84DbP=null;
const v84Req=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
function v84Db(){return v84DbP??=new Promise((res,rej)=>{let r;try{r=indexedDB.open(V84_DB,1)}catch(e){rej(e);return}
  r.onupgradeneeded=()=>{const s=r.result.createObjectStore('photos',{keyPath:'id'});s.createIndex('sp','sp')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function v84Write(fn){const db=await v84Db(),tx=db.transaction('photos','readwrite');fn(tx.objectStore('photos'));
  return new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error||new Error('Opslaan afgebroken'))})}
async function v84Load(){try{const db=await v84Db();const all=await v84Req(db.transaction('photos').objectStore('photos').getAll());
    [...Object.values(V84.url),...Object.values(V84.poster)].forEach(u=>URL.revokeObjectURL(u));V84.url={};V84.poster={};
    all.forEach(p=>{V84.url[p.id]=URL.createObjectURL(p.blob);if(p.poster)V84.poster[p.id]=URL.createObjectURL(p.poster)});
    V84.list=all.filter(p=>!p.kind||p.kind==='photo');V84.vids=all.filter(p=>p.kind==='video');V84.moods=all.filter(p=>p.kind==='mood');V84.stays=all.filter(p=>p.kind==='stay')}catch(e){V84.list=[];V84.vids=[];V84.moods=[];V84.stays=[];V84.err=e.message}
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
  const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.84));if(!blob)throw new Error('Foto kon niet worden verwerkt.');return {blob,w,h,sharp:v84Sharp(c)}}
/* scherpte: variantie van de Laplace-filter op een verkleinde grijswaardenversie (hoger = scherper); alleen om foto's van hetzelfde dier te vergelijken */
function v84Sharp(src){try{const W=320,sw=src.width||src.videoWidth,sh=src.height||src.videoHeight,H=Math.max(8,Math.round(W*sh/sw)),c=document.createElement('canvas');c.width=W;c.height=H;
  const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(src,0,0,W,H);const d=x.getImageData(0,0,W,H).data,g=new Float32Array(W*H);
  for(let i=0;i<W*H;i++)g[i]=.299*d[i*4]+.587*d[i*4+1]+.114*d[i*4+2];let n=0,sum=0,sq=0;
  for(let y=1;y<H-1;y++)for(let x2=1;x2<W-1;x2++){const i=y*W+x2,l=4*g[i]-g[i-1]-g[i+1]-g[i-W]-g[i+W];sum+=l;sq+=l*l;n++}
  return n?Math.round(sq/n-(sum/n)**2):0}catch(e){return 0}}
/* oudere foto's zonder scherptewaarde: op de achtergrond aanvullen */
async function v84SharpFill(){for(const p of V84.list.concat(V84.moods).filter(p=>p.sharp==null)){try{const b=await createImageBitmap(p.blob);const v=v84Sharp(b);b.close&&b.close();
  await v84Write(st=>st.put({...p,sharp:v}));p.sharp=v}catch(e){}}}

const v84DayOf=(name,day,kind)=>(kind==='video'?V84.vids:V84.list).filter(p=>p.sp===v43name(name)&&p.day===day);
/* foto's toevoegen aan de waarneming van één dag (max. V84_MAX per dag); markeert die dag als gezien en op foto */
async function v84Add(name,region,files,day){day=day||v84DayFor(region);const have=v84DayOf(name,day).length,room=V84_MAX-have;if(room<=0)return {added:0,skipped:files.length};
  const sp=v43name(name),fav0=!v84Of(name).length;let added=0;
  for(const f of [...files].slice(0,room)){const {blob,w,h,sharp}=await v84Shrink(f);
    const rec={id:v84Uid(),sp,name,region,day,kind:'photo',t:new Date().toISOString(),taken:await v84Exif(f),w,h,sharp,blob,fav:fav0&&added===0};
    await v84Write(st=>st.put(rec));added++}
  if(typeof v86SetDay==='function')v86SetDay(name,region,day,'photo',true);else{const r=wl2Rec(name,region);if(!r||!r.photo)v52Set(name,region,'photo',true)}
  await v84Load();return {added,skipped:Math.max(0,files.length-room)}}
/* ---------- eigen video: kies 5 s, omzetten naar ≤1080p H.264 (anders VP9) zonder geluid ---------- */
function v84SeekTo(v,t){if(Math.abs(v.currentTime-t)<.0005&&v.readyState>=2)return Promise.resolve();
  return new Promise(res=>{const done=()=>{clearTimeout(to);v.removeEventListener('seeked',done);res()},to=setTimeout(done,4000);v.addEventListener('seeked',done);v.currentTime=t})}
async function v84VCodec(w,h){if(typeof VideoEncoder==='undefined'||typeof VideoFrame==='undefined')return null;
  for(const [codec,mux] of [['avc1.640028','avc'],['avc1.4d0028','avc'],['avc1.42e028','avc'],['vp09.00.40.08','vp9']]){
    const cfg={codec,width:w,height:h,bitrate:5_000_000,framerate:30,...(mux==='avc'?{avc:{format:'avc'}}:{})};
    try{if((await VideoEncoder.isConfigSupported(cfg)).supported)return {cfg,mux}}catch(e){}}return null}
async function v84Clip(file,start,len,onProg){const url=URL.createObjectURL(file),v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.src=url;
  try{await new Promise((res,rej)=>{v.onloadeddata=res;v.onerror=()=>rej(new Error('Deze video kan op dit toestel niet worden gelezen.'))});
    const D=isFinite(v.duration)?v.duration:V84_VLEN;start=Math.max(0,Math.min(start||0,Math.max(0,D-.2)));len=Math.max(.2,Math.min(len||V84_VLEN,V84_VLEN,D-start));
    const vw=v.videoWidth,vh=v.videoHeight,s=Math.min(1,1920/Math.max(vw,vh),1080/Math.min(vw,vh)),w=Math.round(vw*s/2)*2,h=Math.round(vh*s/2)*2;
    const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{alpha:false});
    const poster=()=>{const pc=document.createElement('canvas'),ps=Math.min(1,1280/Math.max(w,h));pc.width=Math.round(w*ps);pc.height=Math.round(h*ps);pc.getContext('2d').drawImage(c,0,0,pc.width,pc.height);return new Promise(r=>pc.toBlob(r,'image/jpeg',.85))};
    const codec=await v84VCodec(w,h);
    if(!codec){if(file.size>60*1048576)throw new Error('Deze video is te groot voor dit toestel (max. 60 MB). Kort hem eerst in.');
      await v84SeekTo(v,start);x.drawImage(v,0,0,w,h);return {blob:file,w,h,dur:len,start,orig:true,poster:await poster()}}
    await v85LoadLib();const tgt=new Mp4Muxer.ArrayBufferTarget(),mux=new Mp4Muxer.Muxer({target:tgt,video:{codec:codec.mux,width:w,height:h,frameRate:30},fastStart:'in-memory'});
    let err=null,pb=null;const enc=new VideoEncoder({output:(ch,m)=>{try{mux.addVideoChunk(ch,m)}catch(e){err=e}},error:e=>{err=e}});enc.configure(codec.cfg);
    const N=Math.max(1,Math.round(len*30));
    try{for(let f=0;f<N;f++){await v84SeekTo(v,start+f/30);x.drawImage(v,0,0,w,h);if(f===0)pb=await poster();
        const vf=new VideoFrame(c,{timestamp:Math.round(f*1e6/30),duration:Math.round(1e6/30)});enc.encode(vf,{keyFrame:f%30===0});vf.close();if(err)throw err;
        while(enc.encodeQueueSize>4)await new Promise(r=>setTimeout(r,2));onProg&&onProg((f+1)/N)}
      await enc.flush();if(err)throw err;mux.finalize()}finally{try{enc.close()}catch(e){}}
    return {blob:new Blob([tgt.buffer],{type:'video/mp4'}),w,h,dur:N/30,start:0,orig:false,poster:pb}}
  finally{URL.revokeObjectURL(url);v.removeAttribute('src');try{v.load()}catch(e){}}}
async function v84AddVideo(name,region,day,file,start,onProg){if(v84DayOf(name,day,'video').length>=V84_VMAX)throw new Error(`Maximaal ${V84_VMAX} video per soort per dag.`);
  const c=await v84Clip(file,start,V84_VLEN,onProg);
  const rec={id:v84Uid(),sp:v43name(name),name,region,day,kind:'video',t:new Date().toISOString(),taken:'',w:c.w,h:c.h,dur:c.dur,start:c.start,orig:c.orig,blob:c.blob,poster:c.poster,fav:false};
  await v84Write(st=>st.put(rec));if(typeof v86SetDay==='function')v86SetDay(name,region,day,'seen',true);else v52Set(name,region,'seen',true);
  await v84Load();return rec}
async function v84SetFav(id){const p=V84.list.find(x=>x.id===id);if(!p)return;const sibs=V84.list.filter(x=>x.sp===p.sp);
  await v84Write(st=>sibs.forEach(x=>st.put({...x,fav:x.id===id,favUser:x.id===id})));await v84Load()}
async function v84Remove(id){const vd=V84.vids.find(x=>x.id===id)||V84.moods.find(x=>x.id===id)||V84.stays.find(x=>x.id===id);if(vd){await v84Write(st=>st.delete(id));await v84Load();return}
  const p=V84.list.find(x=>x.id===id);if(!p)return;await v84Write(st=>st.delete(id));
  const rest=V84.list.filter(x=>x.sp===p.sp&&x.id!==id);if(p.fav&&rest.length)await v84Write(st=>st.put({...rest[0],fav:true}));await v84Load()}

/* ---------- soortvenster: eigen foto's en video per waarnemingsdag ---------- */
const V84_VICO='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/></svg>';
const v84Sec=s=>`0:${String(Math.round(s)).padStart(2,'0')}`;
function v84SheetBlock(name,region){const sp=v43name(name),o=state.v43Observations[sp],ctx=typeof v86Ctx==='function'?v86Ctx(region):0,all=V84.list.concat(V84.vids).filter(p=>p.sp===sp);
  const days=new Set(Object.keys(o?.days||{}).map(Number));all.forEach(p=>p.day&&days.add(p.day));if(ctx)days.add(ctx);if(!days.size)days.add(v84DayFor(region));
  const rows=[...days].filter(d=>S[d-1]).sort((a,b)=>a-b).map(d=>{const reg=o?.days?.[d]?.r||all.find(p=>p.day===d)?.region||(d===ctx?region:v47Region(S[d-1]));
    const ph=V84.list.filter(p=>p.sp===sp&&p.day===d).sort((a,b)=>(b.fav-a.fav)||a.t.localeCompare(b.t)),vs=V84.vids.filter(p=>p.sp===sp&&p.day===d),key=`${d}|${encodeURIComponent(reg)}`;
    return `<div class="v84-day ${d===ctx?'cur':''}"><div class="v84-dh"><b>Dag ${d} · ${esc(reg)}</b><small>${fmt(S[d-1].date)}${o?.days?.[d]?' · gezien':''}</small></div>
      ${ph.length||vs.length?`<div class="v84-grid">${ph.map(p=>`<div class="v84-ph ${p.fav?'fav':''}"><img src="${V84.url[p.id]}" alt="Eigen foto ${esc(v47Info(name).nl)}"><button class="v84-star" data-v84-fav="${p.id}" aria-label="${p.fav?'Favoriet':'Maak favoriet'}" aria-pressed="${p.fav}">${dsI('star',16)}</button><button class="v84-del" data-v84-del="${p.id}" aria-label="Foto verwijderen">${dsI('plus',16)}</button></div>`).join('')}${vs.map(p=>`<div class="v84-ph vid ${p.fav?'fav':''}"><button class="v84-vplay" data-v84-play="${p.id}" aria-label="Video afspelen">${V84.poster[p.id]?`<img src="${V84.poster[p.id]}" alt="">`:''}<span>${'<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5l11 7-11 7z"/></svg>'}${v84Sec(p.dur||0)}</span></button><button class="v84-star" data-v84-vfav="${p.id}" aria-label="${p.fav?'Voorkeur voor de reisvideo':'Voorkeur geven in de reisvideo'}" aria-pressed="${!!p.fav}">${dsI('star',16)}</button><button class="v84-del" data-v84-del="${p.id}" aria-label="Video verwijderen">${dsI('plus',16)}</button></div>`).join('')}</div>`:''}
      ${ph.length<V84_MAX||vs.length<V84_VMAX?`<div class="v84-adds">${ph.length<V84_MAX?`<label class="ds-btn secondary v84-add">${dsI('plus',18)}Foto<small>${ph.length}/${V84_MAX}</small><input type="file" accept="image/*" ${V84_MAX-ph.length>1?'multiple':''} hidden data-v84-add="${key}"></label>`:''}${vs.length<V84_VMAX?`<label class="ds-btn secondary v84-add">${V84_VICO}Video<small>max ${V84_VLEN} s</small><input type="file" accept="video/*" hidden data-v84-vadd="${key}"></label>`:''}</div>`:''}</div>`}).join('');
  return `<div class="v84-own"><div class="v84-h"><b>Eigen foto's en video</b><small>per dag ${V84_MAX} foto's en ${V84_VMAX} video · ster = voorkeur</small></div>${rows}<p class="v84-msg ds-meta" aria-live="polite"></p></div>`}
{const prev=wl2SheetHtml;wl2SheetHtml=function(name,region){let h=prev(name,region);if(!V84.ready)return h;
  if(v84Fav(name))h=h.replace(/<span class="wl2-credit">[^<]*<\/span>/,'<span class="wl2-credit">Eigen foto</span>');
  return h.replace(/(<div class="wl2-reg">[\s\S]*?<\/div><\/div>)/,`$1${v84SheetBlock(name,region)}`)}}
{const prev=wl2BindSheet;wl2BindSheet=function(ov){prev(ov);const {name,region}=wl2Cur||{};if(!name)return;
  const msg=ov.querySelector('.v84-msg'),again=()=>{const y=ov.querySelector('.wl2-sheet').scrollTop;wl2Open(name,region);ov.querySelector('.wl2-sheet').scrollTop=y};
  ov.querySelectorAll('[data-v84-add]').forEach(inp=>inp.onchange=async()=>{const fs=[...inp.files];inp.value='';if(!fs.length)return;const [d,r]=inp.dataset.v84Add.split('|');msg.textContent='Foto verwerken…';
    try{const res=await v84Add(name,decodeURIComponent(r),fs,+d);again();const m=document.querySelector('#wl2Sheet .v84-msg');if(m&&res.skipped)m.textContent=`${res.skipped} foto${res.skipped>1?"'s":''} niet toegevoegd: maximaal ${V84_MAX} per soort per dag.`}
    catch(e){msg.textContent=/quota/i.test(e.name+e.message)?'De opslag op deze telefoon is vol. Maak een foto-back-up en verwijder oude foto’s.':'Toevoegen mislukt: '+e.message}});
  ov.querySelectorAll('[data-v84-vadd]').forEach(inp=>inp.onchange=()=>{const f=inp.files[0];inp.value='';if(!f)return;const [d,r]=inp.dataset.v84Vadd.split('|');v84TrimOpen(name,decodeURIComponent(r),+d,f,again)});
  ov.querySelectorAll('[data-v84-play]').forEach(b=>b.onclick=()=>v84VidOpen(b.dataset.v84Play));
  ov.querySelectorAll('[data-v84-fav]').forEach(b=>b.onclick=async()=>{await v84SetFav(b.dataset.v84Fav);again()});
  ov.querySelectorAll('[data-v84-vfav]').forEach(b=>b.onclick=async()=>{const p=V84.vids.find(x=>x.id===b.dataset.v84Vfav);if(!p)return;await v84Write(st=>st.put({...p,fav:!p.fav}));await v84Load();again()});
  ov.querySelectorAll('[data-v84-del]').forEach(b=>b.onclick=async()=>{if(!confirm('Verwijderen? Dit kan niet ongedaan worden gemaakt, tenzij het in een foto-back-up staat.'))return;await v84Remove(b.dataset.v84Del);again()})}}
/* video kiezen: 5 seconden met een schuif, daarna omzetten */
function v84TrimClose(){const el=document.getElementById('v84Trim');if(el){const v=el.querySelector('video');if(v){v.pause();URL.revokeObjectURL(v.src)}el.remove()}}
function v84TrimOpen(name,region,day,file,after){v84TrimClose();const el=document.createElement('div');el.id='v84Trim';el.className='v85-gen';el.setAttribute('role','dialog');el.setAttribute('aria-label','Video kiezen');
  el.innerHTML=`<div class="v85-box"><span class="ds-label">${esc(v47Info(name).nl)} · dag ${day}</span><h3>Kies ${V84_VLEN} seconden</h3><video class="v85-vid" playsinline muted preload="auto"></video>
    <input type="range" class="v84-range" min="0" max="0" step="0.1" value="0" aria-label="Startpunt"><p class="ds-meta v84-tinfo">Video laden…</p><div class="v85-bar" hidden><i></i></div>
    <div class="v85-btns"><button class="ds-btn primary" data-t="save" disabled>Bewaren</button><button class="ds-btn secondary" data-t="close">Annuleren</button></div></div>`;
  document.body.append(el);const v=el.querySelector('video'),rg=el.querySelector('.v84-range'),info=el.querySelector('.v84-tinfo'),save=el.querySelector('[data-t="save"]');let D=0;
  v.src=URL.createObjectURL(file);const show=()=>{const s=+rg.value;info.textContent=D>V84_VLEN?`${(Math.min(V84_VLEN,D-s)).toFixed(1).replace('.',',')} s vanaf ${v84Sec(s)} · totaal ${v84Sec(D)}`:`Hele video (${D.toFixed(1).replace('.',',')} s)`};
  v.onloadedmetadata=()=>{D=isFinite(v.duration)?v.duration:0;rg.max=String(Math.max(0,D-V84_VLEN));rg.hidden=D<=V84_VLEN;show();save.disabled=false;v.play().catch(()=>{})};
  v.onerror=()=>{info.textContent='Deze video kan op dit toestel niet worden gelezen.'};
  v.ontimeupdate=()=>{const s=+rg.value;if(v.currentTime>=s+V84_VLEN||v.currentTime<s-.3){v.currentTime=s}};
  rg.oninput=()=>{v.currentTime=+rg.value;show()};
  el.querySelector('[data-t="close"]').onclick=v84TrimClose;
  save.onclick=async()=>{save.disabled=true;rg.disabled=true;v.pause();const bar=el.querySelector('.v85-bar');bar.hidden=false;info.textContent='Video omzetten…';
    try{await v84AddVideo(name,region,day,file,+rg.value,f=>{bar.firstElementChild.style.width=Math.round(f*100)+'%'});v84TrimClose();after&&after()}
    catch(e){info.textContent='Bewaren mislukt: '+(/quota/i.test(e.name+e.message)?'de opslag op deze telefoon is vol.':e.message);save.disabled=false;rg.disabled=false}}}
function v84VidClose(){const el=document.getElementById('v84Vid');if(el)el.remove()}
function v84VidOpen(id){const p=V84.vids.find(x=>x.id===id);if(!p)return;v84VidClose();const el=document.createElement('div');el.id='v84Vid';el.className='v85-gen';el.setAttribute('role','dialog');el.setAttribute('aria-label','Eigen video');
  el.innerHTML=`<div class="v85-box"><video class="v85-vid" src="${V84.url[id]}" ${p.orig?`data-start="${p.start||0}"`:''} controls autoplay playsinline muted></video><div class="v85-btns"><button class="ds-btn secondary" data-t="close">Sluiten</button></div></div>`;
  document.body.append(el);const v=el.querySelector('video');if(p.orig){v.onloadedmetadata=()=>{v.currentTime=p.start||0};v.ontimeupdate=()=>{if(v.currentTime>(p.start||0)+p.dur)v.currentTime=p.start||0}}
  el.querySelector('[data-t="close"]').onclick=v84VidClose;el.onclick=e=>{if(e.target===el)v84VidClose()}}

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
/* ---------- sfeerfoto's per dag (Overzicht) ---------- */
/* v8.15: max. 15 sfeerfoto's per dag (met label) en max. 3 foto's van het verblijf (kind:'stay') */
async function v84AddMood(day,files,kind='mood'){const stay=kind==='stay',have=(stay?V84.stays:V84.moods).filter(p=>p.day===day).length,room=(stay?V84_STAY:V84_MOOD)-have;if(room<=0)return {added:0,skipped:files.length};
  const region=v47Region(S[day-1]);let added=0;
  for(const f of [...files].slice(0,room)){const {blob,w,h,sharp}=await v84Shrink(f),taken=await v84Exif(f);
    await v84Write(st=>st.put({id:v84Uid(),sp:'',name:'',region,day,kind:stay?'stay':'mood',label:'',t:new Date().toISOString(),taken,w,h,sharp,blob,fav:false}));added++}
  await v84Load();return {added,skipped:Math.max(0,files.length-room)}}
function v84MoodBlock(d){const ms=V84.moods.filter(p=>p.day===d.id).sort((a,b)=>(a.taken||a.t).localeCompare(b.taken||b.t));
  return `<div class="ds-card v84-mood"><div class="v84-h"><b>Sfeerfoto's</b><small>${ms.length} van ${V84_MOOD} · komen in de reisvideo</small></div>
    ${ms.length?`<div class="v84-grid">${ms.map(p=>`<div class="v84-ph"><img src="${V84.url[p.id]}" alt="Sfeerfoto dag ${d.id}" loading="lazy"><button class="v84-del" data-v84-mdel="${p.id}" aria-label="Sfeerfoto verwijderen">${dsI('plus',16)}</button></div>`).join('')}</div>`:'<p class="ds-meta">Landschap, lodge, onderweg: wat deze dag typeert.</p>'}
    ${ms.length<V84_MOOD?`<label class="ds-btn secondary v84-add">${dsI('plus',18)}Sfeerfoto toevoegen<input type="file" accept="image/*" multiple hidden data-v84-madd="${d.id}"></label>`:''}<p class="ds-meta v84-mmsg" aria-live="polite"></p></div>`}
{const prev=dayContent;dayContent=function(d){const h=prev(d);return daySection==='overview'&&V84.ready?v84MoodBlock(d)+h:h}}
/* back-up v2: foto's (.jpg) en video's (.mp4 + poster) met fotos.json; v1 (alleen foto's) blijft terug te zetten */
async function v84Export(){const all=V84.list.concat(V84.vids,V84.moods,V84.stays);if(!all.length)return;const files=[],meta=[];
  all.forEach(p=>{const base=`${String(p.day||0).padStart(2,'0')}-${p.kind==='mood'?'sfeer':p.kind==='stay'?'verblijf':v84Slug(v47Info(p.name).nl)}-${p.id.slice(0,6)}`,vid=p.kind==='video',ext=vid?(/mp4/.test(p.blob.type)||!p.orig?'mp4':(p.blob.type.split('/')[1]||'mov')):'jpg';
    const {blob,poster,...m}=p;files.push({name:`${base}.${ext}`,blob});const row={...m,file:`${base}.${ext}`,species:p.name,name:undefined,type:blob.type||''};
    if(vid&&poster){files.push({name:`${base}-poster.jpg`,blob:poster});row.posterFile=`${base}-poster.jpg`}meta.push(row)});
  const json={format:'CR27_FOTOS',version:2,exportedAt:new Date().toISOString(),photos:meta};
  const zip=await v84Zip([...files,{name:'fotos.json',blob:new Blob([JSON.stringify(json,null,1)])}]);
  const a=document.createElement('a');a.href=URL.createObjectURL(zip);a.download=`costa-rica-2027-eigen-fotos-${new Date().toISOString().slice(0,10)}.zip`;document.body.append(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);state.v84LastBackup=new Date().toISOString();save();return zip}
async function v84Import(file){const files=await v84Unzip(file),j=files['fotos.json'];if(!j)throw new Error('fotos.json ontbreekt: dit is geen foto-back-up van deze app.');
  const meta=JSON.parse(new TextDecoder().decode(j));if(meta.format!=='CR27_FOTOS')throw new Error('Dit is geen foto-back-up van deze app.');
  const have=new Set(V84.list.concat(V84.vids,V84.moods,V84.stays).map(p=>p.id));let n=0;
  await v84Write(st=>meta.photos.forEach(m=>{if(have.has(m.id)||!files[m.file])return;const {file:f,species,posterFile,type,...rest}=m,vid=rest.kind==='video';
    const rec={kind:'photo',...rest,name:species,blob:new Blob([files[m.file]],{type:type||(vid?'video/mp4':'image/jpeg')})};if(vid&&posterFile&&files[posterFile])rec.poster=new Blob([files[posterFile]],{type:'image/jpeg'});st.put(rec);n++}));
  await v84Load();return n}
function v84BackupCard(){const all=V84.list.concat(V84.vids,V84.moods,V84.stays),n=V84.list.length+V84.moods.length+V84.stays.length,nv=V84.vids.length,mb=all.reduce((s,p)=>s+(p.blob?.size||0)+(p.poster?.size||0),0)/1048576,last=state.v84LastBackup,newer=all.length&&(!last||all.some(p=>p.t>last));
  const what=[n?`${n} foto${n===1?'':"'s"}`:'',nv?`${nv} video${nv===1?'':"'s"}`:''].filter(Boolean).join(' en ');
  return `<div class="ds-card v84-bk ${newer?'warn':''}"><b>Eigen foto's en video's</b><p class="ds-meta">${all.length?`${what} · ${mb.toFixed(1)} MB op deze telefoon. `:'Nog geen eigen foto’s of video’s. '}${last?`Laatste foto-back-up: ${v75When(last)}.`:'Nog geen foto-back-up gemaakt.'}${newer?' Er zijn foto’s of video’s die nog niet in een foto-back-up staan.':''}</p>
    <p class="ds-meta">De gewone back-up bevat geen foto’s en video’s. Bewaar de foto-back-up (zip) ook buiten deze telefoon.</p>
    <div class="ds-bkbtns">${all.length?`<button class="ds-btn primary" id="v84exp">${dsdI('download',18)}Foto-back-up (zip)</button>`:''}<label class="ds-btn secondary">Foto-back-up terugzetten<input type="file" accept=".zip,application/zip" hidden id="v84imp"></label></div><p class="ds-meta v84-bkmsg" aria-live="polite"></p></div>`}
{const prev=DSD_MORE.backup;DSD_MORE.backup=()=>prev().replace(/<\/div>\s*$/,v84BackupCard()+'</div>')}
{const prev=bind;bind=function(){prev();const g=document.getElementById('v84go');if(g)g.onclick=v84Play;
  document.querySelectorAll('[data-v84-madd]').forEach(inp=>inp.onchange=async()=>{const fs=[...inp.files];inp.value='';if(!fs.length)return;const m=document.querySelector('.v84-mmsg');if(m)m.textContent='Foto verwerken…';
    try{const r=await v84AddMood(+inp.dataset.v84Madd,fs);const y=scrollY;render();scrollTo(0,y);const m2=document.querySelector('.v84-mmsg');if(m2&&r.skipped)m2.textContent=`${r.skipped} niet toegevoegd: maximaal ${V84_MOOD} sfeerfoto's per dag.`}
    catch(e){const m2=document.querySelector('.v84-mmsg');if(m2)m2.textContent='Toevoegen mislukt: '+e.message}});
  document.querySelectorAll('[data-v84-mdel]').forEach(b=>b.onclick=async()=>{if(!confirm('Sfeerfoto verwijderen?'))return;await v84Remove(b.dataset.v84Mdel);const y=scrollY;render();scrollTo(0,y)});
  const ex=document.getElementById('v84exp'),msg=()=>document.querySelector('.v84-bkmsg');if(ex)ex.onclick=async()=>{ex.disabled=true;try{await v84Export();render()}catch(e){const m=msg();if(m)m.textContent='Foto-back-up mislukt: '+e.message}ex.disabled=false};
  const im=document.getElementById('v84imp');if(im)im.onchange=async()=>{const f=im.files[0];im.value='';if(!f)return;try{const n=await v84Import(f);render();const m=msg();if(m)m.textContent=n?`${n} bestand${n===1?'':'en'} teruggezet.`:'Alles uit deze back-up stond er al.'}catch(e){const m=msg();if(m)m.textContent='Terugzetten mislukt: '+e.message}}}}
/* laden na opstarten; daarna opnieuw tekenen zodat eigen foto's zichtbaar zijn */
v84Load().then(()=>{if(V84.list.length||V84.vids.length||V84.moods.length||V84.stays.length)render();setTimeout(v84SharpFill,4000)});
