/* =====================================================================
   v10 · Alles bewaren: één back-up voor gegevens én eigen foto's/video's
   - Eén zip: gegevens.json (zelfde formaat als de gewone back-up, CR27_V2) + fotos.json + de foto's en video's.
   - Terugzetten herkent zelf .zip (alles) of .json (alleen gegevens) en voegt samen: er wordt niets gewist;
     eerst een veiligheidskopie van de gegevens (bestaand mechanisme v7.5).
   - Zip en terugzetten werken met verwijzingen naar de bestanden (Blob), niet met kopieën in het geheugen:
     ook een back-up van honderden MB past zo op een telefoon. De oude losse knoppen staan onder "Meer opties".
   ===================================================================== */
/* CRC32 in stukken van 4 MB (geen kopie van het hele bestand) */
async function v10Crc(blob){let c=0xFFFFFFFF;for(let o=0;o<blob.size;o+=4<<20){const b=new Uint8Array(await blob.slice(o,o+(4<<20)).arrayBuffer());for(let i=0;i<b.length;i++)c=V84_CRC[(c^b[i])&255]^(c>>>8)}return (c^0xFFFFFFFF)>>>0}
/* zelfde zip-indeling als v8.4 (ongecomprimeerd), maar de bestanden zelf blijven Blob-verwijzingen */
v84Zip=async function(files,onProg){const parts=[],cen=[];let off=0,done=0;const enc=new TextEncoder(),total=files.reduce((s,f)=>s+f.blob.size,0)||1;
  for(const f of files){const name=enc.encode(f.name),size=f.blob.size,crc=await v10Crc(f.blob);
    const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint32(14,crc,true);lh.setUint32(18,size,true);lh.setUint32(22,size,true);lh.setUint16(26,name.length,true);
    parts.push(lh,name,f.blob);
    const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint32(16,crc,true);ch.setUint32(20,size,true);ch.setUint32(24,size,true);ch.setUint16(28,name.length,true);ch.setUint32(42,off,true);
    cen.push(ch,name);off+=30+name.length+size;done+=size;onProg&&onProg(done/total)}
  const cs=cen.reduce((s,x)=>s+x.byteLength,0),end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cs,true);end.setUint32(16,off,true);
  return new Blob([...parts,...cen,end],{type:'application/zip'})};
/* uitpakken via de centrale map: elk bestand wordt een Blob-plak van de zip (geen kopie) */
async function v10Unzip(blob){const tail=Math.min(blob.size,65557),tb=new DataView(await blob.slice(blob.size-tail).arrayBuffer());let e=-1;
  for(let i=tail-22;i>=0;i--)if(tb.getUint32(i,true)===0x06054b50){e=i;break}if(e<0)throw new Error('Dit bestand is geen back-up van deze app.');
  const n=tb.getUint16(e+10,true),csz=tb.getUint32(e+12,true),cof=tb.getUint32(e+16,true),cd=new DataView(await blob.slice(cof,cof+csz).arrayBuffer()),dec=new TextDecoder(),out={};let p=0;
  for(let k=0;k<n;k++){if(cd.getUint32(p,true)!==0x02014b50)throw new Error('Deze back-up is beschadigd.');const meth=cd.getUint16(p+10,true),size=cd.getUint32(p+24,true),nl=cd.getUint16(p+28,true),xl=cd.getUint16(p+30,true),cl=cd.getUint16(p+32,true),lo=cd.getUint32(p+42,true);
    const name=dec.decode(new Uint8Array(cd.buffer,cd.byteOffset+p+46,nl));if(meth!==0)throw new Error('Dit is geen back-up van deze app.');
    const lh=new DataView(await blob.slice(lo,lo+30).arrayBuffer()),start=lo+30+lh.getUint16(26,true)+lh.getUint16(28,true);out[name]=blob.slice(start,start+size);p+=46+nl+xl+cl}
  return out}
/* bestandenlijst van de eigen media (zelfde namen en fotos.json als v8.4, zodat oude en nieuwe back-ups uitwisselbaar zijn) */
function v10MediaFiles(){const all=V84.list.concat(V84.vids,V84.moods,V84.stays),files=[],meta=[];
  all.forEach(p=>{const base=`${String(p.day||0).padStart(2,'0')}-${p.kind==='mood'?'sfeer':p.kind==='stay'?'verblijf':v84Slug(v47Info(p.name).nl)}-${p.id.slice(0,6)}`,vid=p.kind==='video',ext=vid?(/mp4/.test(p.blob.type)||!p.orig?'mp4':(p.blob.type.split('/')[1]||'mov')):'jpg';
    const {blob,poster,...m}=p;files.push({name:`${base}.${ext}`,blob});const row={...m,file:`${base}.${ext}`,species:p.name,name:undefined,type:blob.type||''};
    if(vid&&poster){files.push({name:`${base}-poster.jpg`,blob:poster});row.posterFile=`${base}-poster.jpg`}meta.push(row)});
  return {files,meta,count:all.length,photos:all.filter(p=>p.kind!=='video').length,videos:all.filter(p=>p.kind==='video').length}}
/* foto's en video's uit een uitgepakte back-up toevoegen (samenvoegen: wat er al is blijft staan) */
async function v10ImportMedia(files){const j=files['fotos.json'];if(!j)return 0;const meta=JSON.parse(await j.text());if(meta.format!=='CR27_FOTOS')throw new Error('Dit is geen back-up van deze app.');
  const have=new Set(V84.list.concat(V84.vids,V84.moods,V84.stays).map(p=>p.id)),recs=[];
  for(const m of meta.photos){if(have.has(m.id)||!files[m.file])continue;const {file:f,species,posterFile,type,...rest}=m,vid=rest.kind==='video';
    const rec={kind:'photo',...rest,name:species,blob:new Blob([files[m.file]],{type:type||(vid?'video/mp4':'image/jpeg')})};if(vid&&posterFile&&files[posterFile])rec.poster=new Blob([files[posterFile]],{type:'image/jpeg'});recs.push(rec)}
  for(let i=0;i<recs.length;i+=40){const part=recs.slice(i,i+40);await v84Write(st=>part.forEach(r=>st.put(r)))}
  await v84Load();return recs.length}
v84Import=async function(file){return v10ImportMedia(await v10Unzip(file))};

function v10Download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},8000)}
/* één knop: alles bewaren */
async function v10BackupAll(onMsg){const say=t=>onMsg&&onMsg(t);const m=v10MediaFiles(),now=new Date().toISOString();
  const data=new Blob([JSON.stringify({format:'CR27_V2',exportedAt:now,state},null,2)],{type:'application/json'});
  const fotos=new Blob([JSON.stringify({format:'CR27_FOTOS',version:2,exportedAt:now,photos:m.meta},null,1)],{type:'application/json'});
  say(m.count?`Back-up maken… ${m.count} foto's en video's`:'Back-up maken…');
  const zip=await v84Zip([{name:'gegevens.json',blob:data},{name:'fotos.json',blob:fotos},...m.files],f=>say(`Back-up maken… ${Math.round(f*100)}%`));
  const name=`costa-rica-2027-back-up-${now.slice(0,10)}.zip`,file=new File([zip],name,{type:'application/zip'});
  state.v51LastBackup=now;state.v84LastBackup=now;state.v10FullBackup={at:now,photos:m.photos,videos:m.videos,mb:Math.round(zip.size/1048576*10)/10};save();
  try{if(navigator.canShare&&navigator.canShare({files:[file]})&&/iPhone|iPad|Android/i.test(navigator.userAgent)){await navigator.share({files:[file],title:'Back-up Costa Rica 2027'});return {zip,shared:true}}}catch(e){if(e&&e.name==='AbortError')return {zip,cancelled:true}}
  v10Download(zip,name);return {zip}}
/* terugzetten: .zip (alles) of .json (alleen gegevens) */
async function v10RestoreAny(file,onMsg){const say=t=>onMsg&&onMsg(t);
  if(/\.json$/i.test(file.name)||/json/.test(file.type))return v75Import(file);
  say('Back-up lezen…');const files=await v10Unzip(file),hasData=!!files['gegevens.json'],hasMedia=!!files['fotos.json'];if(!hasData&&!hasMedia)throw new Error('Dit is geen back-up van deze app.');
  let when='';if(hasData){try{const v=JSON.parse(await files['gegevens.json'].text());when=v.exportedAt}catch(e){throw new Error('Deze back-up is beschadigd: de gegevens zijn niet leesbaar.')}}
  const nMedia=hasMedia?(JSON.parse(await files['fotos.json'].text()).photos||[]).length:0;
  if(!await v10Confirm({title:`Back-up${when?' van '+v75When(when):''} terugzetten?`,text:`${hasData?'Gegevens, waarnemingen en notities':''}${hasData&&nMedia?' en ':''}${nMedia?nMedia+" foto's en video's":''} worden samengevoegd met wat nu op deze telefoon staat. Er gaat niets verloren; eerst wordt een veiligheidskopie gemaakt.`,ok:'Terugzetten'}))return {cancelled:true};
  let n=0;if(hasMedia){say("Foto's en video's terugzetten…");n=await v10ImportMedia(files)}
  if(hasData){await v75Import(new File([files['gegevens.json']],'gegevens.json',{type:'application/json'}),{yes:true,extra:n?` · ${n} foto's en video's teruggezet`:''});return {media:n,data:true}}
  render();v10Toast(n?`${n} foto's en video's teruggezet.`:'Alles uit deze back-up stond er al.');return {media:n}}

/* ---------- Back-up-pagina: één hoofdactie, details onder "Meer opties" ---------- */
function v10BackupAge(){const t=state.v10FullBackup?.at;if(!t)return null;return Math.floor((Date.now()-new Date(t))/864e5)}
function v10NewSince(){const t=state.v10FullBackup?.at||'';return V84.list.concat(V84.vids,V84.moods,V84.stays).filter(p=>!t||p.t>t).length}
function v10HasData(){return Object.keys(state.v43Observations||{}).length||Object.values(state.notes||{}).some(Boolean)||V84.list.length+V84.vids.length+V84.moods.length+V84.stays.length}
function v10BackupCard(){const a=v10BackupAge(),f=state.v10FullBackup,nw=v10NewSince(),m=v10MediaFiles(),warn=a===null||nw>0||a>7;
  const st=a===null?'Nog geen volledige back-up gemaakt':a===0?'Laatste back-up: vandaag':`Laatste back-up: ${a} ${a===1?'dag':'dagen'} geleden`;
  return `<div class="ds-card v10-bk ${warn?'warn':''}"><b>${st}</b>
    <p class="ds-meta">${f?`${f.photos} foto's en ${f.videos} video's · ${f.mb} MB. `:''}${nw?`${nw} ${nw===1?'nieuwe foto of video':"nieuwe foto's en video's"} nog niet bewaard. `:''}Eén bestand met je gegevens, waarnemingen, notities, foto's en video's (nu ${m.photos} foto's, ${m.videos} video's).</p>
    <div class="ds-bkbtns"><button class="ds-btn primary" id="v10bk">${dsdI('download',18)}Back-up maken</button><label class="ds-btn secondary">${dsdI('upload',18)}Back-up terugzetten<input type="file" id="v10rs" accept=".zip,.json,application/zip,application/json" hidden></label></div>
    <p class="ds-meta v10-bkmsg" aria-live="polite"></p>
    <p class="ds-meta">Bewaar het bestand buiten deze telefoon, bijvoorbeeld in iCloud Drive of op een computer. Zonder back-up ben je alles kwijt als de telefoon kwijtraakt.</p></div>`}
function v10StoreCard(){let c=null;try{c=JSON.parse(localStorage.getItem(V75_COPY))}catch(e){}
  const pers=v75Persisted===true?'Beschermd: de browser ruimt je gegevens niet zelf op.':v75Persisted===false?'Niet beschermd: de browser mag je gegevens opruimen als de telefoon vol raakt. Zet de app op je beginscherm en maak regelmatig een back-up.':'Maak regelmatig een back-up; deze browser meldt niet of de opslag beschermd is.';
  return `<div class="ds-card v75-store"><b>Opslag op deze telefoon</b><p class="ds-meta">${pers}</p><p class="ds-meta v10-free"></p>${c?`<div class="v75-copy"><span><b>Veiligheidskopie</b><small>Gemaakt op ${esc(v75When(c.at))}, vlak vóór de laatste import · ${v75Seen(c.state)} soorten gezien</small></span><button class="ds-btn secondary" id="v75restore">Terugzetten</button></div>`:''}</div>`}
DSD_MORE.backup=()=>dsdSub('Back-up en herstel',`${v10BackupCard()}${v10StoreCard()}
  <details class="ds-card v10-more"><summary><b>Meer opties</b><small>Alleen gegevens, alleen foto's, back-upbestand controleren</small></summary>
    <div class="ds-bk">${v52BackupCard()}</div>
    <div class="v10-sub"><b>Alleen gegevens</b><p class="ds-meta">Notities, afvinklijsten, waarnemingen, boekingsstatus en kosten, zonder foto's (klein bestand).</p>
      <div class="ds-bkbtns"><button class="ds-btn secondary" id="export">${dsdI('download',18)}Gegevens bewaren</button><label class="ds-btn secondary" for="import">${dsdI('upload',18)}Gegevens terugzetten</label><input id="import" type="file" accept="application/json,.json" class="hidden"></div></div>
    ${v84BackupCard().replace('Foto-back-up (zip)',"Foto's bewaren").replace('Foto-back-up terugzetten',"Foto's terugzetten")}
  </details>`);
/* vrije ruimte (schatting van de browser) en waarschuwing onder 500 MB */
async function v10Free(){try{const e=await navigator.storage.estimate();return {free:Math.max(0,(e.quota||0)-(e.usage||0)),used:e.usage||0}}catch(x){return null}}
{const prev=bind;bind=function(){prev();
  const bk=document.getElementById('v10bk'),rs=document.getElementById('v10rs'),msg=()=>document.querySelector('.v10-bkmsg');
  if(bk)bk.onclick=async()=>{bk.disabled=true;try{const r=await v10BackupAll(t=>{const m=msg();if(m)m.textContent=t});if(!r.cancelled){const y=scrollY;render();scrollTo(0,y);v10Toast(r.shared?'Back-up klaar. Kies "Bewaar in Bestanden".':'Back-up gedownload. Bewaar hem buiten deze telefoon.')}else{const m=msg();if(m)m.textContent=''}}catch(e){const m=msg();if(m)m.textContent=v10Why(e,'fotobackup')}bk.disabled=false};
  if(rs)rs.onchange=async()=>{const f=rs.files[0];rs.value='';if(!f)return;try{await v10RestoreAny(f,t=>{const m=msg();if(m)m.textContent=t})}catch(e){const m=msg();if(m)m.textContent=v10Why(e,'backup')}};
  const fr=document.querySelector('.v10-free');if(fr)v10Free().then(s=>{if(!s||!s.free)return;const gb=s.free/1073741824;const low=gb<.5&&s.used>s.free;fr.textContent=`Ruimte voor de app volgens de browser: nog ${gb>=10?Math.round(gb):gb.toFixed(1).replace('.',',')} GB.${low?' Bijna vol: maak een back-up en verwijder oude video\'s.':''}`;if(low)fr.classList.add('v10-low')})}}
/* Home: herinnering als er iets nieuws niet bewaard is (na een reisdag met nieuwe foto's, of nooit een back-up) */
function v10HomeBackup(){if(!v10HasData())return '';const a=v10BackupAge(),nw=v10NewSince();if(a!==null&&!nw&&a<7)return '';
  return `<div class="ds-card v10-homebk"><div><b>${a===null?'Nog geen back-up':`${nw} ${nw===1?'nieuwe foto of video':"nieuwe foto's en video's"} nog niet bewaard`}</b><p class="ds-meta">${a===null?'Alles staat alleen op deze telefoon.':'Maak een back-up en bewaar hem buiten deze telefoon.'}</p></div><button class="ds-btn primary" data-ds-goto-backup>Back-up maken</button></div>`}
{const prev=renderHome;renderHome=function(){const h=prev(),c=v10HomeBackup(),body='<div class="ds-home-body">';return c&&h.includes(body)?h.replace(body,body+c):h}}
{const prev=bind;bind=function(){prev();document.querySelectorAll('[data-ds-goto-backup]').forEach(b=>b.onclick=()=>{tab='settings';dsMore='backup';render();scrollTo(0,0)})}}
