/* =====================================================================
   v8.5 · Reisvideo
   Aan het einde van de reis maakt de app op de telefoon zelf een MP4 (1920×1080, 30 fps, zonder geluid):
   titel → per reisdag een hoofdstuk → per soort de eigen foto's (favoriet eerst) of, als er geen eigen foto is,
   een voorbeeldfoto uit de app met fotograaf, licentie en bron in beeld → afsluiting met totalen.
   - Beschikbaar vanaf 00:00 op de laatste reisdag; daarvoor alleen een proefvideo (met "Proefvideo" in beeld).
   - Encoderen met WebCodecs (H.264, anders VP9) + mp4-muxer (js/vendor, MIT), offline en sneller dan real time.
     Geen WebCodecs: terugval op MediaRecorder (opnemen in real time).
   - Leest alleen: state.v43Observations, state.v44Log, eigen foto's (v8.4). Schrijft niets in CR27_V2.
   ===================================================================== */
const V85={W:1920,H:1080,FPS:30,BR:3_500_000,FADE:.5,LIB:'js/vendor/mp4-muxer-5.2.2.min.js'};
const V85_FONT="'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',sans-serif";
const V85_CAT={Vogels:['Vogel','vogel','vogels'],Zoogdieren:['Zoogdier','zoogdier','zoogdieren'],Reptielen:['Reptiel','reptiel','reptielen'],'Amfibieën':['Amfibie','amfibie','amfibieën'],Zeeleven:['Zeeleven','zeedier','zeedieren']};
const V85_LAST=S[S.length-1].date;
const v85Pad=n=>String(n).padStart(2,'0');
const v85Iso=d=>`${d.getFullYear()}-${v85Pad(d.getMonth()+1)}-${v85Pad(d.getDate())}`;
/* lokale datum van een tijdstempel: EXIF-tijd is al lokaal (zonder zone), r.t is UTC */
const v85LocalDate=t=>{if(!t)return '';if(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d$/.test(t))return t.slice(0,10);const d=new Date(t);return isNaN(d)?'':v85Iso(d)};
const v85Ms=t=>{const d=new Date(t);return isNaN(d)?Infinity:d.getTime()};
const v85Time=t=>{if(!t)return '';const d=new Date(t);return isNaN(d)?'':`${v85Pad(d.getHours())}:${v85Pad(d.getMinutes())}`};
const v85Open=(now=new Date())=>v85Iso(now)>=V85_LAST;
const v85DayByDate=iso=>{if(!iso)return 0;const d=S.find(x=>x.date===iso);return d?d.id:0};
const v85FirstDay=region=>{const d=S.find(x=>v47Region(x)===region);return d?d.id:1};
const v85Cat=cat=>V85_CAT[cat]||[cat||'Soort',String(cat||'soort').toLowerCase(),String(cat||'soorten').toLowerCase()];
const v85Note=(sp,region)=>(state.v44Log?.[sp]?.[region]?.note||'').trim();
function v85Example(name){const r=wl2(name);let src='',ph=null;
  if(r&&r.p){src=r.hd?`./photos/wl/hd/${r.p}.jpg`:`./photos/wl/${r.p}.jpg`;ph=V48_PHOTO['wl/'+r.p]}
  else if(DS_SP_PHOTO[name]){src=`./photos/${DS_SP_PHOTO[name]}.jpg`;ph=V48_PHOTO[DS_SP_PHOTO[name]]}
  return {src,credit:ph?['© '+ph.credit,ph.license,/inaturalist/i.test(ph.page||ph.title||'')?'iNaturalist':'Wikimedia Commons'].filter(Boolean).join(' · '):''}}

/* ---------- wat er in de video komt ---------- */
function v85Plan(){const nameOf={};Object.keys(V47_SP).forEach(k=>{nameOf[v43name(k)]??=k});
  const items=[],own=new Set();
  [...new Set(V84.list.map(p=>p.sp))].forEach(sp=>{const ps=V84.list.filter(p=>p.sp===sp).sort((a,b)=>(b.fav-a.fav)||(a.taken||a.t).localeCompare(b.taken||b.t)),f=ps[0];
    const name=nameOf[sp]||f.name,when=f.taken||'';own.add(sp);
    items.push({own:true,name,sp,region:f.region,day:v85DayByDate(v85LocalDate(when))||f.day||v85FirstDay(f.region),when,photos:ps.map(p=>V84.url[p.id]),note:v85Note(sp,f.region)})});
  Object.entries(state.v43Observations||{}).forEach(([sp,o])=>{if(own.has(sp))return;
    const seen=Object.entries(o.places||{}).filter(([,r])=>r.seen).sort((a,b)=>v85Ms(a[1].t)-v85Ms(b[1].t));if(!seen.length)return;
    const [region,r]=seen[0],name=nameOf[sp]||o.name||sp,ex=v85Example(name);
    items.push({own:false,name,sp,region,day:v85DayByDate(v85LocalDate(r.t))||v85FirstDay(region),when:r.t||'',photos:ex.src?[ex.src]:[],credit:ex.credit,note:v85Note(sp,region)})});
  items.sort((a,b)=>(a.day-b.day)||(v85Ms(a.when)-v85Ms(b.when))||(b.own-a.own));
  const days=[];items.forEach(it=>{let d=days[days.length-1];if(!d||d.day!==it.day){d={day:it.day,items:[]};days.push(d)}d.items.push(it)});
  return {items,days}}

/* ---------- segmenten (dia's) met duur in seconden ---------- */
function v85Segments(plan,proef){const {items,days}=plan;if(!items.length)return [];
  const first=items.find(i=>i.own&&i.photos.length)||items.find(i=>i.photos.length);
  const regions=[...new Set(items.map(i=>i.region))];
  const segs=[{k:'intro',dur:4,src:first?.photos[0]||'',label:proef?'Proefvideo':'Reisvideo',title:'Costa Rica 2027',
    sub:`${new Date(S[0].date+'T12:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long'})} – ${new Date(V85_LAST+'T12:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'})}`,
    meta:`${items.length} ${items.length===1?'soort':'soorten'} · ${regions.length} ${regions.length===1?'bestemming':'bestemmingen'}`}];
  days.forEach(d=>{const day=S[d.day-1]||S[0],nOwn=d.items.filter(i=>i.own).length,lead=d.items.find(i=>i.own&&i.photos.length)||d.items.find(i=>i.photos.length);
    const regs=[...new Set(d.items.map(i=>i.region))];
    segs.push({k:'day',dur:3,src:lead?.photos[0]||'',label:'Dag '+d.day,title:regs.join(' · ')||v47Region(day),
      sub:new Date(day.date+'T12:00').toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'}),
      meta:`${d.items.length} ${d.items.length===1?'soort':'soorten'}${nOwn?` · ${nOwn} op eigen foto`:''}`});
    d.items.forEach(it=>{const i=v47Info(it.name),r=wl2(it.name)||{},c=v85Cat(i.cat),time=v85Time(it.when);
      const base={k:'sp',own:it.own,label:c[0],title:i.nl,en:i.nl!==i.en?i.en:'',sci:r.s||'',
        meta:[it.region,new Date((S[it.day-1]||day).date+'T12:00').toLocaleDateString('nl-NL',{weekday:'short',day:'numeric',month:'short'}),time].filter(Boolean).join(' · '),
        credit:it.own?'Eigen foto':(it.photos.length?'Voorbeeldfoto · '+it.credit:'Geen foto')};
      if(!it.photos.length){segs.push({...base,dur:it.note?5:3,src:'',note:it.note});return}
      it.photos.forEach((src,n)=>segs.push({...base,src,note:n===0?it.note:'',dur:n===0?(it.own?4:3)+(it.note?2:0):2.5,
        credit:it.own&&it.photos.length>1?`Eigen foto ${n+1} van ${it.photos.length}`:base.credit,cap:!it.own}))})});
  const by={};items.forEach(i=>{const c=v47Info(i.name).cat;by[c]=(by[c]||0)+1});
  const order=['Vogels','Zoogdieren','Reptielen','Amfibieën','Zeeleven'];
  const cats=Object.entries(by).sort((a,b)=>((order.indexOf(a[0])+99)%99)-((order.indexOf(b[0])+99)%99)).map(([c,n])=>`${n} ${v85Cat(c)[n===1?1:2]}`);
  const nOwn=items.filter(i=>i.own).length,last=[...items].reverse().find(i=>i.own&&i.photos.length)||first;
  segs.push({k:'end',dur:5,src:last?.photos[last.photos.length-1]||'',label:proef?'Einde proefvideo':'Einde',title:'Pura vida',sub:cats.join(' · '),
    meta:`${nOwn} op eigen foto · ${regions.length} ${regions.length===1?'bestemming':'bestemmingen'} · ${S.length} dagen`,
    small:items.some(i=>!i.own)?'Soorten zonder eigen foto: voorbeeldfoto met fotograaf, licentie en bron in beeld.':''});
  return segs}
const v85Seconds=segs=>segs.reduce((s,x)=>s+x.dur,0);
const v85Dur=sec=>{const m=Math.floor(sec/60),s=Math.round(sec%60);return m?`${m}:${v85Pad(s)} min`:`${s} s`};

/* ---------- tekenen ---------- */
function v85Font(ctx,size,weight,italic){ctx.font=`${italic?'italic ':''}${weight||400} ${size}px ${V85_FONT}`}
function v85Fit(ctx,t,maxW){if(!maxW||ctx.measureText(t).width<=maxW)return t;let s=t;while(s.length>1&&ctx.measureText(s+'…').width>maxW)s=s.slice(0,-1);return s.trimEnd()+'…'}
function v85Txt(ctx,t,x,y,o){if(!t)return 0;v85Font(ctx,o.size,o.weight,o.italic);ctx.fillStyle=o.color||'#fff';ctx.textAlign=o.align||'left';
  const sp='letterSpacing' in ctx;if(sp)ctx.letterSpacing=(o.spacing||0)+'px';const s=v85Fit(ctx,o.upper?t.toUpperCase():t,o.maxW);ctx.fillText(s,x,y);const w=ctx.measureText(s).width;if(sp)ctx.letterSpacing='0px';return w}
function v85Wrap(ctx,t,maxW,lines){const words=t.split(/\s+/),out=[];let cur='';
  for(const w of words){const nx=cur?cur+' '+w:w;if(ctx.measureText(nx).width>maxW&&cur){out.push(cur);cur=w}else cur=nx}if(cur)out.push(cur);
  if(out.length>lines){out.length=lines;out[lines-1]=v85Fit(ctx,out[lines-1]+'…',maxW)}return out}
function v85Blur(img){const c=document.createElement('canvas');c.width=64;c.height=36;const x=c.getContext('2d'),r=Math.max(64/img.width,36/img.height);
  x.drawImage(img,(64-img.width*r)/2,(36-img.height*r)/2,img.width*r,img.height*r);return c}
function v85Draw(ctx,seg,res,t){const {W,H}=V85,p=seg.dur?Math.min(1,t/seg.dur):0,img=res.img;
  ctx.globalAlpha=1;ctx.fillStyle='#0b1d16';ctx.fillRect(0,0,W,H);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(seg.k==='sp'){
    if(img){ctx.drawImage(res.blur,-40,-40,W+80,H+80);ctx.fillStyle='rgba(0,0,0,.42)';ctx.fillRect(0,0,W,H);
      let r=Math.min(W/img.width,H/img.height);if(seg.cap)r=Math.min(r,1.3);r*=1+.05*p;
      const w=img.width*r,h=img.height*r;ctx.drawImage(img,(W-w)/2,(H-h)/2,w,h)}
    else{const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#123528');g.addColorStop(1,'#06140f');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
    const g=ctx.createLinearGradient(0,H*.42,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.55,'rgba(0,0,0,.62)');g.addColorStop(1,'rgba(0,0,0,.86)');ctx.fillStyle=g;ctx.fillRect(0,H*.42,W,H*.58);
    const X=110,maxW=W-2*X;v85Font(ctx,30,500,true);const note=seg.note?v85Wrap(ctx,`“${seg.note}”`,1350,2):[];
    let y=H-96-note.length*44-(seg.meta?50:0)-(seg.en||seg.sci?52:0)-92;
    v85Txt(ctx,seg.label,X,y,{size:26,weight:700,color:'#9BE6AE',spacing:5,upper:true});y+=92;
    v85Txt(ctx,seg.title,X,y,{size:80,weight:800,maxW});
    if(seg.en||seg.sci){y+=52;const w=v85Txt(ctx,seg.en,X,y,{size:34,weight:500,color:'rgba(255,255,255,.92)',maxW:maxW*.55});
      v85Txt(ctx,(seg.en?' · ':'')+seg.sci,X+w,y,{size:34,weight:500,italic:true,color:'rgba(255,255,255,.92)',maxW:maxW-w})}
    if(seg.meta){y+=50;v85Txt(ctx,seg.meta,X,y,{size:30,weight:500,color:'rgba(255,255,255,.8)',maxW})}
    note.forEach(l=>{y+=44;v85Txt(ctx,l,X,y,{size:30,weight:500,italic:true,color:'#fff'})});
    v85Txt(ctx,seg.credit,W-56,H-40,{size:22,weight:500,color:'rgba(255,255,255,.72)',align:'right',maxW:W*.6});
    return}
  if(img){const r=Math.max(W/img.width,H/img.height)*(1.04+.06*p),w=img.width*r,h=img.height*r;ctx.drawImage(img,(W-w)/2,(H-h)/2,w,h)}
  ctx.fillStyle=img?'rgba(4,14,10,.6)':'#0b1d16';ctx.fillRect(0,0,W,H);
  const big=seg.k==='day'?118:132,cy=H/2-(seg.k==='day'?40:30);
  v85Txt(ctx,seg.label,W/2,cy-big*.85,{size:32,weight:700,color:'#9BE6AE',spacing:7,upper:true,align:'center'});
  v85Txt(ctx,seg.title,W/2,cy+big*.35,{size:big,weight:800,align:'center',maxW:W-220});
  v85Txt(ctx,seg.sub,W/2,cy+big*.35+78,{size:42,weight:600,align:'center',color:'rgba(255,255,255,.95)',maxW:W-220});
  v85Txt(ctx,seg.meta,W/2,cy+big*.35+138,{size:34,weight:500,align:'center',color:'rgba(255,255,255,.8)',maxW:W-220});
  if(seg.small)v85Txt(ctx,seg.small,W/2,H-60,{size:24,weight:500,align:'center',color:'rgba(255,255,255,.65)',maxW:W-220})}

async function v85Img(src){if(!src)return null;const im=new Image();im.decoding='async';im.src=src;try{await im.decode()}catch(e){return null}
  try{return await createImageBitmap(im)}catch(e){return im}}
async function v85Res(seg){const img=await v85Img(seg.src);return {img,blur:img?v85Blur(img):null}}
const v85Free=res=>{try{res?.img?.close&&res.img.close()}catch(e){}};

/* ---------- uitvoer ---------- */
function v85LoadLib(){if(typeof Mp4Muxer!=='undefined')return Promise.resolve();
  return new Promise((res,rej)=>{const s=document.createElement('script');s.src=V85.LIB;s.onload=()=>res();s.onerror=()=>rej(new Error('Video-onderdeel kon niet worden geladen.'));document.head.append(s)})}
async function v85Codec(){if(typeof VideoEncoder==='undefined'||typeof VideoFrame==='undefined')return null;
  const base={width:V85.W,height:V85.H,bitrate:V85.BR,framerate:V85.FPS};
  for(const [codec,mux] of [['avc1.640028','avc'],['avc1.4d0028','avc'],['avc1.42e028','avc'],['vp09.00.40.08','vp9']]){
    const cfg={...base,codec,...(mux==='avc'?{avc:{format:'avc'}}:{})};
    try{if((await VideoEncoder.isConfigSupported(cfg)).supported)return {cfg,mux}}catch(e){}}return null}
/* uitvoer in delen: groot deel als Blob (kan naar schijf), het begin blijft bewerkbaar voor de index (moov);
   ongeschreven ruimte (gereserveerd 'free'-blok) wordt met nullen gevuld, net als in een bestand */
function v85Sink(){const segs=[],HEAD=8<<20;
  return {write(data,pos){let covered=0;
      for(const s of segs){const a=Math.max(pos,s.pos),b=Math.min(pos+data.length,s.pos+s.len);if(a>=b)continue;
        if(!s.u)throw new Error('Video-index kon niet worden geschreven.');s.u.set(data.subarray(a-pos,b-pos),a-s.pos);covered+=b-a}
      if(covered===data.length)return;if(covered)throw new Error('Video-index kon niet worden geschreven.');
      segs.push(pos<HEAD?{pos,len:data.length,u:data.slice()}:{pos,len:data.length,b:new Blob([data])})},
    blob(type){segs.sort((a,b)=>a.pos-b.pos);let p=0;const parts=[];
      for(const s of segs){if(s.pos<p)throw new Error('Video is onvolledig.');if(s.pos>p)parts.push(new Uint8Array(s.pos-p));parts.push(s.u||s.b);p=s.pos+s.len}
      return new Blob(parts,{type})}}}
async function v85Target(useDisk){
  if(useDisk!==false)try{const root=await navigator.storage.getDirectory(),fh=await root.getFileHandle('reisvideo.mp4',{create:true});
    if(fh.createWritable){const ws=await fh.createWritable();return {target:new Mp4Muxer.FileSystemWritableFileStreamTarget(ws,{chunkSize:4<<20}),done:async()=>{await ws.close();return await fh.getFile()},cleanup:()=>root.removeEntry('reisvideo.mp4').catch(()=>{}),disk:true}}}catch(e){}
  const sink=v85Sink();return {target:new Mp4Muxer.StreamTarget({onData:(d,p)=>sink.write(d,p),chunked:true,chunkSize:4<<20}),done:async()=>sink.blob('video/mp4'),disk:false}}

/* maakt de video; prog(fractie) voor de voortgang; job.cancel=true breekt af */
async function v85Make(opts={}){const job=opts.job||{},prog=opts.onProgress||(()=>{}),proef=opts.proef??!v85Open();
  const segs=opts.segs||v85Segments(v85Plan(),proef);if(!segs.length)throw new Error('Nog niets om te tonen.');
  const {W,H,FPS}=V85,scale=opts.scale||V85.SCALE||1;segs.forEach(s=>s.frames=Math.max(2,Math.round(s.dur*scale*FPS)));
  const total=segs.reduce((n,s)=>n+s.frames,0),fade=Math.round(V85.FADE*FPS);
  try{await document.fonts.load(`800 80px ${V85_FONT}`);await document.fonts.load(`500 30px ${V85_FONT}`)}catch(e){}
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d',{alpha:false});
  const prev=document.createElement('canvas');prev.width=W;prev.height=H;const pctx=prev.getContext('2d',{alpha:false});
  const work=document.createElement('canvas');work.width=W;work.height=H;const wctx=work.getContext('2d',{alpha:false});
  const frame=(seg,res,f)=>{if(f<fade&&seg!==segs[0]){v85Draw(wctx,seg,res,f/FPS/scale);ctx.globalAlpha=1;ctx.drawImage(prev,0,0);ctx.globalAlpha=(f+1)/(fade+1);ctx.drawImage(work,0,0);ctx.globalAlpha=1}
    else v85Draw(ctx,seg,res,f/FPS/scale)};
  const codec=opts.forceRecorder?null:await v85Codec();
  if(!codec)return v85Record(segs,{cv,ctx,pctx,frame,total,prog,job});
  await v85LoadLib();const tgt=await v85Target(opts.disk);let err=null,done=0;
  const muxer=new Mp4Muxer.Muxer({target:tgt.target,video:{codec:codec.mux,width:W,height:H,frameRate:FPS},fastStart:{expectedVideoChunks:total}});
  const enc=new VideoEncoder({output:(c,m)=>{try{muxer.addVideoChunk(c,m)}catch(e){err=e}},error:e=>{err=e}});enc.configure(codec.cfg);
  let next=v85Res(segs[0]),n=0;const t0=performance.now();
  try{for(let i=0;i<segs.length;i++){const seg=segs[i],res=await next;next=i+1<segs.length?v85Res(segs[i+1]):null;
      for(let f=0;f<seg.frames;f++,n++){if(job.cancel)throw new Error('Geannuleerd');if(err)throw err;
        frame(seg,res,f);const vf=new VideoFrame(cv,{timestamp:Math.round(n*1e6/FPS),duration:Math.round(1e6/FPS)});enc.encode(vf,{keyFrame:n%(FPS*2)===0});vf.close();
        while(enc.encodeQueueSize>6){await new Promise(r=>setTimeout(r,2));if(err)throw err}
        if(n%10===0){prog(n/total,performance.now()-t0);await new Promise(r=>setTimeout(r,0))}}
      pctx.drawImage(cv,0,0);v85Free(res)}
    await enc.flush();if(err)throw err;muxer.finalize();const blob=await tgt.done();done=1;prog(1,performance.now()-t0);
    return {blob:blob.type?blob:new Blob([blob],{type:'video/mp4'}),type:'video/mp4',ext:'mp4',seconds:total/FPS,frames:total,codec:codec.cfg.codec,disk:tgt.disk,cleanup:tgt.cleanup,ms:performance.now()-t0}}
  finally{try{if(enc.state!=='closed')enc.close()}catch(e){}if(!done&&tgt.disk)try{await tgt.done();await tgt.cleanup()}catch(e){}}}
/* terugval: real time opnemen van het canvas */
async function v85Record(segs,{cv,pctx,frame,total,prog,job}){if(typeof MediaRecorder==='undefined'||!cv.captureStream)throw new Error('Deze browser kan geen video maken. Werk iOS of Chrome bij.');
  const type=['video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9','video/webm'].find(t=>MediaRecorder.isTypeSupported(t))||'';
  const stream=cv.captureStream(V85.FPS),rec=new MediaRecorder(stream,{...(type?{mimeType:type}:{}),videoBitsPerSecond:V85.BR}),parts=[];
  rec.ondataavailable=e=>{if(e.data.size)parts.push(e.data)};const stopped=new Promise(r=>rec.onstop=r);
  const res=new Map(),get=i=>{if(!res.has(i)){res.set(i,{img:null,blur:null});v85Res(segs[i]).then(r=>{if(res.has(i))res.set(i,r)})}return res.get(i)};
  res.set(0,await v85Res(segs[0]));frame(segs[0],res.get(0),0);rec.start(1000);
  const starts=[];let acc=0;segs.forEach(s=>{starts.push(acc);acc+=s.frames});
  const t0=performance.now();let i=0;
  await new Promise((ok,fail)=>{const tick=()=>{if(job.cancel){fail(new Error('Geannuleerd'));return}
      const n=Math.floor((performance.now()-t0)/1000*V85.FPS);if(n>=total){ok();return}
      while(i+1<segs.length&&n>=starts[i+1]){pctx.drawImage(cv,0,0);v85Free(res.get(i));res.set(i,null);i++}
      if(i+1<segs.length)get(i+1);frame(segs[i],get(i),n-starts[i]);prog(n/total,performance.now()-t0);requestAnimationFrame(tick)};requestAnimationFrame(tick)})
    .catch(e=>{try{rec.stop()}catch(x){}stream.getTracks().forEach(t=>t.stop());throw e});
  rec.stop();await stopped;stream.getTracks().forEach(t=>t.stop());const mime=(rec.mimeType||type||'video/webm').split(';')[0];
  return {blob:new Blob(parts,{type:mime}),type:mime,ext:mime.includes('mp4')?'mp4':'webm',seconds:total/V85.FPS,frames:total,codec:'MediaRecorder',ms:performance.now()-t0}}

/* ---------- scherm ---------- */
let v85Job=null,v85Out=null;
function v85Card(){const plan=v85Plan(),segs=v85Segments(plan,!v85Open()),n=plan.items.length,nOwn=plan.items.filter(i=>i.own).length,open=v85Open();
  const last=new Date(V85_LAST+'T12:00').toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'});
  const what=n?`${n} ${n===1?'soort':'soorten'} · ${nOwn} op eigen foto${n-nOwn?` · ${n-nOwn} met voorbeeldfoto`:''} · ca. ${v85Dur(v85Seconds(segs))}`:'Nog niets geregistreerd. Markeer soorten als gezien of voeg eigen foto’s toe.';
  return `<div class="ds-card v85-card"><div><b>Reisvideo</b><p class="ds-meta">${open?'Video van de hele reis, dag voor dag, met naam, groep, plek en moment bij elke soort. Wordt op deze telefoon gemaakt, zonder internet.':`Beschikbaar vanaf ${last} (laatste reisdag). Tot die tijd kun je een proefvideo maken.`}</p><p class="ds-meta v85-what">${what}</p></div>
    ${n?`<button class="ds-btn ${open?'primary':'secondary'}" id="v85go">${'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/></svg>'}${open?'Reisvideo maken':'Proefvideo maken'}</button>`:''}</div>`}
{const prev=renderWildlife;renderWildlife=function(){const h=prev();const at='<div class="ds-section-title">Logboek</div>';
  return h.includes(at)?h.replace(at,v85Card()+at):h}}
function v85Close(){if(v85Job)v85Job.cancel=true;const el=document.getElementById('v85Gen');if(el){el.remove();document.body.classList.remove('wl2-lock')}
  if(v85Out){URL.revokeObjectURL(v85Out.url);try{v85Out.out.cleanup?.()}catch(e){}v85Out=null}try{v85Job?.lock?.release()}catch(e){}v85Job=null}
async function v85Start(){v85Close();const proef=!v85Open(),job={cancel:false};v85Job=job;
  const el=document.createElement('div');el.id='v85Gen';el.className='v85-gen';el.setAttribute('role','dialog');el.setAttribute('aria-label',proef?'Proefvideo maken':'Reisvideo maken');
  el.innerHTML=`<div class="v85-box"><span class="ds-label">${proef?'Proefvideo':'Reisvideo'}</span><h3>Video maken…</h3><div class="v85-bar"><i></i></div><p class="v85-st ds-meta" aria-live="polite">Voorbereiden</p><p class="ds-meta">Houd de app open en het scherm aan.</p><div class="v85-btns"><button class="ds-btn secondary" data-v85="close">Annuleren</button></div></div>`;
  document.body.append(el);document.body.classList.add('wl2-lock');el.querySelector('[data-v85="close"]').onclick=v85Close;
  try{job.lock=await navigator.wakeLock?.request('screen')}catch(e){}
  const bar=el.querySelector('.v85-bar i'),st=el.querySelector('.v85-st');
  try{const out=await v85Make({proef,job,onProgress:(f,ms)=>{bar.style.width=Math.round(f*100)+'%';const left=f>.04?ms/f*(1-f)/1000:0;st.textContent=`${Math.round(f*100)}%${left?` · nog ca. ${left<60?Math.max(5,Math.round(left/5)*5)+' s':Math.round(left/60)+' min'}`:''}`}});
    if(job.cancel||v85Job!==job)return;try{job.lock?.release()}catch(e){}
    const url=URL.createObjectURL(out.blob),name=`costa-rica-2027-${proef?'proefvideo':'reisvideo'}.${out.ext}`,file=new File([out.blob],name,{type:out.type});v85Out={url,file,out};
    const mb=(out.blob.size/1048576).toFixed(out.blob.size<1048576*10?1:0),canShare=!!(navigator.canShare&&navigator.canShare({files:[file]}));
    el.querySelector('.v85-box').innerHTML=`<span class="ds-label">${proef?'Proefvideo':'Reisvideo'} klaar</span><video class="v85-vid" src="${url}" controls playsinline preload="metadata"></video>
      <p class="ds-meta">${out.ext.toUpperCase()} · 1920×1080 · ${v85Dur(out.seconds)} · ${mb} MB</p>
      <div class="v85-btns">${canShare?`<button class="ds-btn primary" data-v85="share">${dsdI('download',18)}Opslaan of delen</button>`:''}<a class="ds-btn ${canShare?'secondary':'primary'}" href="${url}" download="${name}">${canShare?'Downloaden':dsdI('download',18)+'Downloaden'}</a><button class="ds-btn secondary" data-v85="close">Sluiten</button></div>
      <p class="ds-meta">Kies bij "Opslaan of delen" voor "Bewaar video" om hem in Foto’s te zetten.</p>`;
    el.querySelectorAll('[data-v85="close"]').forEach(b=>b.onclick=v85Close);
    const sh=el.querySelector('[data-v85="share"]');if(sh)sh.onclick=async()=>{try{await navigator.share({files:[file],title:'Costa Rica 2027'})}catch(e){}}}
  catch(e){if(job.cancel)return;try{job.lock?.release()}catch(x){}
    st.textContent='Video maken mislukt: '+e.message;el.querySelector('h3').textContent='Niet gelukt';el.querySelector('[data-v85="close"]').textContent='Sluiten'}}
{const prev=bind;bind=function(){prev();const g=document.getElementById('v85go');if(g)g.onclick=v85Start}}
