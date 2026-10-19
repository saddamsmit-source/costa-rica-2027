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
  const regions=[...new Set(items.map(i=>i.region))];let spN=0,kb=0;
  const segs=[{k:'intro',dur:5,trans:'black',src:first?.photos[0]||'',label:proef?'Proefvideo':'Reisvideo',title:'Costa Rica 2027',
    sub:`${new Date(S[0].date+'T12:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long'})} – ${new Date(V85_LAST+'T12:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'})}`,
    meta:`${items.length} ${items.length===1?'soort':'soorten'} · ${regions.length} ${regions.length===1?'bestemming':'bestemmingen'}`}];
  days.forEach(d=>{const day=S[d.day-1]||S[0],nOwn=d.items.filter(i=>i.own).length,lead=d.items.find(i=>i.own&&i.photos.length)||d.items.find(i=>i.photos.length);
    const regs=[...new Set(d.items.map(i=>i.region))];
    segs.push({k:'day',dur:3.5,trans:'leak',day:d.day,stop:typeof v51Day2Stop==='function'?v51Day2Stop(d.day):0,src:lead?.photos[0]||'',label:`Dag ${d.day} van ${S.length}`,title:regs.join(' · ')||v47Region(day),
      sub:new Date(day.date+'T12:00').toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'}),
      meta:`${d.items.length} ${d.items.length===1?'soort':'soorten'}${nOwn?` · ${nOwn} op eigen foto`:''}`});
    d.items.forEach((it,j)=>{const i=v47Info(it.name),r=wl2(it.name)||{},c=v85Cat(i.cat),time=v85Time(it.when);spN++;
      const base={k:'sp',own:it.own,n:spN,of:items.length,hud:`Dag ${it.day} · ${it.region}`,trans:j===0?'zoom':(spN%2?'push':'fade'),label:c[0],title:i.nl,en:i.nl!==i.en?i.en:'',sci:r.s||'',
        meta:[it.region,new Date((S[it.day-1]||day).date+'T12:00').toLocaleDateString('nl-NL',{weekday:'short',day:'numeric',month:'short'}),time].filter(Boolean).join(' · '),
        credit:it.own?'Eigen foto':(it.photos.length?'Voorbeeldfoto · '+it.credit:'Geen foto')};
      if(!it.photos.length){segs.push({...base,i:kb++,dur:it.note?5:3,src:'',note:it.note});return}
      it.photos.forEach((src,n)=>segs.push({...base,i:kb++,trans:n?'fade':base.trans,src,note:n===0?it.note:'',dur:n===0?(it.own?4:3)+(it.note?2:0):2.5,
        credit:it.own&&it.photos.length>1?`Eigen foto ${n+1} van ${it.photos.length}`:base.credit,cap:!it.own}))})});
  const by={};items.forEach(i=>{const c=v47Info(i.name).cat;by[c]=(by[c]||0)+1});
  const order=['Vogels','Zoogdieren','Reptielen','Amfibieën','Zeeleven'];
  const cats=Object.entries(by).sort((a,b)=>((order.indexOf(a[0])+99)%99)-((order.indexOf(b[0])+99)%99)).map(([c,n])=>`${n} ${v85Cat(c)[n===1?1:2]}`);
  const catN=Object.entries(by).sort((a,b)=>((order.indexOf(a[0])+99)%99)-((order.indexOf(b[0])+99)%99)).map(([c,n])=>({n,label:n===1?v85Cat(c)[0]:(c||'Soorten')}));
  const nOwn=items.filter(i=>i.own).length,last=[...items].reverse().find(i=>i.own&&i.photos.length)||first;
  segs.push({k:'end',dur:7,trans:'leak',cats:catN,src:last?.photos[last.photos.length-1]||'',label:proef?'Einde proefvideo':'Einde',title:'Pura vida',sub:cats.join(' · '),
    meta:`${nOwn} op eigen foto · ${regions.length} ${regions.length===1?'bestemming':'bestemmingen'} · ${S.length} dagen`,
    small:items.some(i=>!i.own)?'Soorten zonder eigen foto: voorbeeldfoto met fotograaf, licentie en bron in beeld.':''});
  return segs}
const v85Seconds=segs=>segs.reduce((s,x)=>s+x.dur,0);
const v85Dur=sec=>{const m=Math.floor(sec/60),s=Math.round(sec%60);return m?`${m}:${v85Pad(s)} min`:`${s} s`};

/* ---------- tekenen ---------- */
/* v8.5.1: grafische laag met animaties (tekst die inschuift, letters die opkomen, glazen naamkaart, routekaart per dag,
   tellers aan het eind), afwisselende overgangen en Ken Burns-bewegingen, vuurvliegjes en vignet. */
const V85_C={leaf:'#1F8A4C',mint:'#9BE6AE',sun:'#F2C46B',deep:'#06160F'};
const v85Clamp=x=>x<0?0:x>1?1:x;
const v85E=x=>1-Math.pow(1-v85Clamp(x),3);
const v85At=(t,a,d)=>v85Clamp((t-a)/d);
function v85Font(ctx,size,weight,italic){ctx.font=`${italic?'italic ':''}${weight||400} ${size}px ${V85_FONT}`}
function v85Fit(ctx,t,maxW){if(!maxW||ctx.measureText(t).width<=maxW)return t;let s=t;while(s.length>1&&ctx.measureText(s+'…').width>maxW)s=s.slice(0,-1);return s.trimEnd()+'…'}
const v85Sp=(ctx,px)=>{if('letterSpacing' in ctx)ctx.letterSpacing=px+'px'};
/* tekst met in-animatie: k=0..1 (vervagen + omhoog schuiven) */
function v85Txt(ctx,t,x,y,o){if(!t)return 0;const k=o.k??1;if(k<=0)return 0;v85Font(ctx,o.size,o.weight,o.italic);v85Sp(ctx,o.spacing||0);ctx.textAlign=o.align||'left';
  const s=v85Fit(ctx,o.upper?t.toUpperCase():t,o.maxW),w=ctx.measureText(s).width;ctx.save();ctx.globalAlpha*=v85E(k);ctx.fillStyle=o.color||'#fff';
  if(o.shadow){ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=12;ctx.shadowOffsetY=2}ctx.fillText(s,x,y+(1-v85E(k))*(o.rise??26));ctx.restore();v85Sp(ctx,0);return w}
/* letters komen één voor één op */
function v85Letters(ctx,t,x,y,o,time,start){v85Font(ctx,o.size,o.weight);v85Sp(ctx,o.spacing||0);const s=v85Fit(ctx,t,o.maxW),W=ctx.measureText(s).width;
  let x0=o.align==='center'?x-W/2:x;ctx.textAlign='left';ctx.save();ctx.fillStyle=o.color||'#fff';
  for(let i=0;i<s.length;i++){const k=v85E(v85At(time,start+i*(o.stagger||.035),.45));if(k<=0)break;const px=x0+ctx.measureText(s.slice(0,i)).width;
    ctx.globalAlpha=k;ctx.fillText(s[i],px,y+(1-k)*(o.rise||46))}
  ctx.restore();v85Sp(ctx,0);return W}
function v85Wrap(ctx,t,maxW,lines){const words=t.split(/\s+/),out=[];let cur='';
  for(const w of words){const nx=cur?cur+' '+w:w;if(ctx.measureText(nx).width>maxW&&cur){out.push(cur);cur=w}else cur=nx}if(cur)out.push(cur);
  if(out.length>lines){out.length=lines;out[lines-1]=v85Fit(ctx,out[lines-1]+'…',maxW)}return out}
function v85Round(ctx,x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h)}
function v85Blur(img){const c=document.createElement('canvas');c.width=64;c.height=36;const x=c.getContext('2d'),r=Math.max(64/img.width,36/img.height);
  x.drawImage(img,(64-img.width*r)/2,(36-img.height*r)/2,img.width*r,img.height*r);return c}
/* gedeelde lagen, één keer gemaakt */
let v85FX=null;
function v85Fx(){if(v85FX)return v85FX;const {W,H}=V85;
  const vig=document.createElement('canvas');vig.width=W;vig.height=H;const v=vig.getContext('2d'),g=v.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*1.05);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');v.fillStyle=g;v.fillRect(0,0,W,H);
  const glow=document.createElement('canvas');glow.width=glow.height=64;const o=glow.getContext('2d'),rg=o.createRadialGradient(32,32,0,32,32,32);
  rg.addColorStop(0,'rgba(255,246,190,1)');rg.addColorStop(.25,'rgba(230,240,150,.55)');rg.addColorStop(1,'rgba(160,230,140,0)');o.fillStyle=rg;o.fillRect(0,0,64,64);
  let map=null;try{if(typeof V51_MAP!=='undefined')map=new Path2D(V51_MAP.CRI)}catch(e){}
  return v85FX={vig,glow,map}}
/* vignet en voortgangslijn bovenin (geen filmkorrel: kost bitrate en wordt blokkerig) */
function v85Post(ctx,n,total){const {W,H}=V85,fx=v85Fx();ctx.drawImage(fx.vig,0,0);
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(0,0,W,5);ctx.fillStyle=V85_C.mint;ctx.fillRect(0,0,W*(n+1)/total,5)}
/* vuurvliegjes */
function v85Flies(ctx,t,n,alpha){const {W,H}=V85,fx=v85Fx();ctx.save();
  for(let i=0;i<n;i++){const a=(Math.sin(i*12.9898)*43758.5453)%1,b=(Math.sin(i*78.233)*12543.21)%1,ra=Math.abs(a),rb=Math.abs(b);
    const x=(ra*W+Math.sin(t*.6+i)*40+t*(12+rb*18))%W,y=H-((rb*H+t*(20+ra*30))%H),s=10+ra*26,fl=.35+.65*Math.abs(Math.sin(t*(1.3+rb)+i));
    ctx.globalAlpha=alpha*fl;ctx.drawImage(fx.glow,x-s/2,y-s/2,s,s)}ctx.restore()}
/* foto: cover of contain met beweging */
function v85Cover(ctx,img,z,dx,dy){const {W,H}=V85,r=Math.max(W/img.width,H/img.height)*z,w=img.width*r,h=img.height*r;ctx.drawImage(img,(W-w)/2+dx,(H-h)/2+dy,w,h)}
function v85Moves(i,p){const m=i%4,e=p;return m===0?{z:1+.07*e,dx:0,dy:0}:m===1?{z:1.07-.07*e,dx:0,dy:0}:m===2?{z:1.05,dx:-36+72*e,dy:0}:{z:1.05,dx:36-72*e,dy:-10+20*e}}
/* routekaart van Costa Rica (v5.1-kaartdata): gereisde route tot de huidige stop, laatste stuk groeit, huidige stop pulseert */
function v85Map(ctx,x,y,h,t,cur,o={}){const fx=v85Fx();if(!fx.map||typeof v51XY!=='function')return;const s=h/V51_MAP.H,P=r=>{const p=V51_PT[r];if(!p)return null;const [a,b]=v51XY(p[0],p[1]);return [x+a*s,y+b*s]};
  const k=v85E(v85At(t,o.start||0,.6));ctx.save();ctx.globalAlpha=k;ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='rgba(255,255,255,.07)';ctx.fill(fx.map);ctx.lineWidth=2.2/s;ctx.strokeStyle='rgba(155,230,174,.65)';ctx.stroke(fx.map);ctx.restore();
  const pts=V51_STOPS.slice(0,cur+1).map(z=>P(z[0])).filter(Boolean);if(!pts.length)return;
  const grow=o.all?v85At(t,(o.start||0)+.3,1.8)*(pts.length-1):(pts.length-1)-1+v85E(v85At(t,(o.start||0)+.35,1.1));
  ctx.save();ctx.globalAlpha=k;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++){const f=Math.min(1,grow-(i-1));if(f<=0)break;ctx.lineTo(pts[i-1][0]+(pts[i][0]-pts[i-1][0])*f,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*f)}
  ctx.strokeStyle='rgba(155,230,174,.25)';ctx.lineWidth=16;ctx.stroke();ctx.strokeStyle=V85_C.mint;ctx.lineWidth=5;ctx.stroke();
  pts.forEach((p,i)=>{if(i>grow+.001&&!(i===0))return;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p[0],p[1],i===pts.length-1&&!o.all?9:6,0,Math.PI*2);ctx.fill()});
  if(!o.all&&grow>=pts.length-1.001){const p=pts[pts.length-1],ph=(t*1.1)%1;ctx.strokeStyle=V85_C.mint;ctx.lineWidth=3;ctx.globalAlpha=k*(1-ph);ctx.beginPath();ctx.arc(p[0],p[1],12+ph*34,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=k;const lbl=V51_PT[V51_STOPS[cur][0]]?.[2]||V51_STOPS[cur][0];v85Txt(ctx,lbl,p[0]+(p[0]>x+h*.6?-24:24),p[1]+10,{size:30,weight:700,align:p[0]>x+h*.6?'right':'left',k:v85At(t,(o.start||0)+1.2,.4),rise:10})}
  ctx.restore()}
/* vergrote, vage achtergrond één keer per dia maken (opschalen per frame is duur) */
function v85BlurBig(res){const {W,H}=V85;if(!res.big&&res.blur){const c=document.createElement('canvas');c.width=W+120;c.height=H+80;const x=c.getContext('2d',{alpha:false});x.imageSmoothingQuality='high';x.drawImage(res.blur,0,0,W+120,H+80);res.big=c}return res.big}
function v85Bg(ctx,res,t,dark){const {W,H}=V85;
  if(res.img){ctx.drawImage(v85BlurBig(res),-60-Math.min(60,t*6),-40);ctx.globalAlpha=.55;v85Cover(ctx,res.img,1.08+.03*t/5,0,0);ctx.globalAlpha=1}
  else{const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#143a2b');g.addColorStop(1,V85_C.deep);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
  const g=ctx.createLinearGradient(0,0,W,0);g.addColorStop(0,`rgba(4,16,11,${dark})`);g.addColorStop(1,`rgba(4,16,11,${dark*.7})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
/* HUD: merk linksboven, teller rechtsboven */
function v85Hud(ctx,seg,t){const {W}=V85,k=v85At(t,.15,.5);if(k<=0)return;
  v85Txt(ctx,'Costa Rica 2027',64,74,{size:22,weight:800,spacing:6,upper:true,color:'rgba(255,255,255,.9)',k,rise:10});
  ctx.save();ctx.globalAlpha=v85E(k);ctx.fillStyle=V85_C.mint;ctx.fillRect(64,90,60*v85E(k),3);ctx.restore();
  if(seg.hud)v85Txt(ctx,seg.hud,64,128,{size:22,weight:600,spacing:3,upper:true,color:'rgba(255,255,255,.75)',k:v85At(t,.3,.5),rise:10});
  if(seg.n){const cx=W-110,cy=92,R=34;ctx.save();ctx.globalAlpha=v85E(k);ctx.lineWidth=5;ctx.strokeStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle=V85_C.mint;ctx.lineCap='round';ctx.beginPath();ctx.arc(cx,cy,R,-Math.PI/2,-Math.PI/2+Math.PI*2*seg.n/seg.of*v85E(v85At(t,.2,.8)));ctx.stroke();ctx.restore();
    v85Txt(ctx,String(seg.n),cx,cy+10,{size:28,weight:800,align:'center',k,rise:0});v85Txt(ctx,`van ${seg.of}`,cx,cy+R+34,{size:18,weight:600,align:'center',color:'rgba(255,255,255,.7)',k,rise:0})}}
function v85Draw(ctx,seg,res,t){const {W,H}=V85,p=seg.dur?Math.min(1,t/seg.dur):0,img=res.img;
  ctx.globalAlpha=1;ctx.fillStyle=V85_C.deep;ctx.fillRect(0,0,W,H);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(seg.k==='sp'){
    if(img&&!res.bgc){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d',{alpha:false});x.imageSmoothingQuality='high';x.drawImage(res.blur,-80,-50,W+160,H+100);x.fillStyle='rgba(2,10,7,.5)';x.fillRect(0,0,W,H);res.bgc=c}
    if(img){const mv=v85Moves(seg.i||0,v85E(p*.9+.1));ctx.drawImage(res.bgc,0,0);
      let r=Math.min(W/img.width,H/img.height);if(seg.cap)r=Math.min(r,1.3);r*=mv.z;const w=img.width*r,h=img.height*r,x=(W-w)/2+mv.dx,y=(H-h)/2+mv.dy;
      const full=w>=W-4&&h>=H-4;ctx.save();if(!full){ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=60;ctx.shadowOffsetY=18;v85Round(ctx,x,y,w,h,18);ctx.fillStyle='#000';ctx.fill();ctx.shadowColor='transparent';ctx.clip()}
      ctx.drawImage(img,x,y,w,h);ctx.restore();
      if(!full){ctx.save();v85Round(ctx,x,y,w,h,18);ctx.lineWidth=2;ctx.strokeStyle='rgba(255,255,255,.18)';ctx.stroke();ctx.restore()}}
    else v85Bg(ctx,res,t,.2);
    const g=ctx.createLinearGradient(0,H*.5,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.6)');ctx.fillStyle=g;ctx.fillRect(0,H*.5,W,H*.5);
    const tg=ctx.createLinearGradient(0,0,0,220);tg.addColorStop(0,'rgba(0,0,0,.55)');tg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=tg;ctx.fillRect(0,0,W,220);
    v85Hud(ctx,seg,t);
    /* glazen naamkaart */
    const X=96,pad=44;v85Font(ctx,30,500,true);const note=seg.note?v85Wrap(ctx,`“${seg.note}”`,1180,2):[];
    v85Font(ctx,78,800);const tw=Math.min(ctx.measureText(seg.title).width,1300);v85Font(ctx,32,500);const sw=ctx.measureText((seg.en?seg.en+' · ':'')+seg.sci).width;v85Font(ctx,28,500);const mw=ctx.measureText(seg.meta||'').width;
    const pw=Math.min(W-2*X,Math.max(tw,sw,mw,note.length?1180:0)+pad*2+12),ph=pad+44+78+(seg.en||seg.sci?48:0)+(seg.meta?44:0)+note.length*42+pad-6;
    const k=v85E(v85At(t,.1,.55)),py=H-80-ph+(1-k)*40;
    if(k>0){ctx.save();ctx.globalAlpha=k;v85Round(ctx,X,py,pw,ph,22);ctx.save();ctx.clip();if(res.bgc)ctx.drawImage(res.bgc,0,0);ctx.fillStyle='rgba(6,24,17,.62)';ctx.fillRect(X,py,pw,ph);ctx.restore();
      ctx.lineWidth=1.5;ctx.strokeStyle='rgba(255,255,255,.14)';ctx.stroke();ctx.fillStyle=V85_C.mint;ctx.fillRect(X,py+22,6,(ph-44)*v85E(v85At(t,.3,.6)));ctx.restore()}
    let y=py+pad+8;const tx=X+pad+12;
    /* groep als label-pil */
    {const kk=v85At(t,.25,.4);if(kk>0){v85Font(ctx,22,800);v85Sp(ctx,4);const lw=ctx.measureText(seg.label.toUpperCase()).width;v85Sp(ctx,0);ctx.save();ctx.globalAlpha=v85E(kk);v85Round(ctx,tx,y-6,lw+30,38,19);ctx.fillStyle=V85_C.leaf;ctx.fill();ctx.restore();
      v85Txt(ctx,seg.label,tx+15,y+21,{size:22,weight:800,spacing:4,upper:true,k:kk,rise:0,shadow:false})}}
    y+=44+70;v85Txt(ctx,seg.title,tx,y,{size:78,weight:800,maxW:1300,k:v85At(t,.35,.5)});
    if(seg.en||seg.sci){y+=48;const kk=v85At(t,.5,.5),w=v85Txt(ctx,seg.en,tx,y,{size:32,weight:500,color:'rgba(255,255,255,.92)',maxW:700,k:kk});
      v85Txt(ctx,(seg.en?' · ':'')+seg.sci,tx+w,y,{size:32,weight:500,italic:true,color:V85_C.mint,maxW:W-2*X-w,k:kk})}
    if(seg.meta){y+=44;v85Txt(ctx,seg.meta,tx,y,{size:28,weight:500,color:'rgba(255,255,255,.78)',maxW:W-2*X-2*pad,k:v85At(t,.62,.5)})}
    note.forEach((l,i)=>{y+=42;v85Txt(ctx,l,tx,y,{size:30,weight:500,italic:true,color:'#fff',k:v85At(t,.8+i*.12,.5)})});
    v85Txt(ctx,seg.credit,W-56,H-34,{size:20,weight:500,color:'rgba(255,255,255,.7)',align:'right',maxW:W*.55,k:v85At(t,.6,.5),rise:0});
    return}
  if(seg.k==='day'){v85Bg(ctx,res,t,.78);
    const mapH=820,mx=W-mapH*(V51_MAP?.W||600)/(V51_MAP?.H||575)-90,my=(H-mapH)/2+20;v85Map(ctx,mx,my,mapH,t,seg.stop??0,{start:.1});
    const X=130,cy=H/2;
    v85Txt(ctx,seg.label,X,cy-150,{size:30,weight:800,spacing:8,upper:true,color:V85_C.mint,k:v85At(t,.1,.5)});
    const tw=v85Letters(ctx,seg.title,X,cy-30,{size:seg.title.length>16?86:110,weight:800,maxW:mx-X-40},t,.25);
    ctx.fillStyle=V85_C.mint;ctx.fillRect(X,cy+12,Math.min(tw,420)*v85E(v85At(t,.6,.7)),5);
    v85Txt(ctx,seg.sub,X,cy+80,{size:42,weight:600,color:'rgba(255,255,255,.95)',k:v85At(t,.7,.5),maxW:mx-X-40});
    v85Txt(ctx,seg.meta,X,cy+136,{size:32,weight:500,color:'rgba(255,255,255,.75)',k:v85At(t,.85,.5),maxW:mx-X-40});
    return}
  /* intro en einde */
  if(img){ctx.drawImage(v85BlurBig(res),-60,-40);v85Cover(ctx,img,1.04+.08*p,0,0)}
  ctx.fillStyle=seg.k==='end'?'rgba(4,16,11,.78)':'rgba(4,16,11,.62)';ctx.fillRect(0,0,W,H);v85Flies(ctx,t+(seg.k==='end'?40:0),46,.85);
  if(seg.k==='intro'){const cy=H/2;
    v85Txt(ctx,seg.label,W/2,cy-150,{size:32,weight:800,spacing:10,upper:true,color:V85_C.mint,align:'center',k:v85At(t,.2,.6)});
    v85Letters(ctx,seg.title,W/2,cy-10,{size:150,weight:800,align:'center',maxW:W-200,stagger:.05,rise:60},t,.4);
    const lw=520*v85E(v85At(t,1.1,.8));ctx.fillStyle=V85_C.mint;ctx.fillRect(W/2-lw/2,cy+38,lw,5);
    v85Txt(ctx,seg.sub,W/2,cy+120,{size:44,weight:600,align:'center',k:v85At(t,1.4,.6)});
    v85Txt(ctx,seg.meta,W/2,cy+180,{size:32,weight:500,align:'center',color:'rgba(255,255,255,.78)',k:v85At(t,1.6,.6)});
    return}
  /* einde: titel, tellers per groep en de hele route */
  const mapH=760,mx=W-mapH*(V51_MAP?.W||600)/(V51_MAP?.H||575)-80,my=(H-mapH)/2;v85Map(ctx,mx,my,mapH,t,V51_STOPS.length-1,{start:.2,all:true});
  const X=130;v85Txt(ctx,seg.label,X,250,{size:30,weight:800,spacing:8,upper:true,color:V85_C.mint,k:v85At(t,.1,.5)});
  v85Letters(ctx,seg.title,X,380,{size:140,weight:800,stagger:.06,rise:60},t,.3);
  (seg.cats||[]).forEach((c,i)=>{const kk=v85At(t,.9+i*.15,.5),bx=X+(i%3)*250,by=470+Math.floor(i/3)*170;if(kk<=0)return;ctx.save();ctx.globalAlpha=v85E(kk);v85Round(ctx,bx,by+(1-v85E(kk))*30,226,146,20);ctx.fillStyle='rgba(255,255,255,.08)';ctx.fill();ctx.strokeStyle='rgba(155,230,174,.35)';ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
    const val=Math.round(c.n*v85E(v85At(t,1+i*.15,1.4)));v85Txt(ctx,String(val),bx+24,by+76+(1-v85E(kk))*30,{size:64,weight:800,k:kk,rise:0});v85Txt(ctx,c.label,bx+26,by+118+(1-v85E(kk))*30,{size:24,weight:600,color:V85_C.mint,k:kk,rise:0})});
  const rows=Math.ceil((seg.cats||[]).length/3);v85Txt(ctx,seg.meta,X,470+rows*170+40,{size:32,weight:500,color:'rgba(255,255,255,.85)',k:v85At(t,1.6,.6),maxW:mx-X-20});
  if(seg.small)v85Txt(ctx,seg.small,X,H-70,{size:22,weight:500,color:'rgba(255,255,255,.6)',k:v85At(t,2,.6),rise:0,maxW:W-260})}

async function v85Img(src){if(!src)return null;const im=new Image();im.decoding='async';im.src=src;try{await im.decode()}catch(e){return null}
  try{return await createImageBitmap(im)}catch(e){return im}}
async function v85Res(seg){const img=await v85Img(seg.src);return {img,blur:img?v85Blur(img):null}}
const v85Free=res=>{try{res?.img?.close&&res.img.close()}catch(e){}if(res){res.bgc=null;res.big=null}};

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
  const total=segs.reduce((n,s)=>n+s.frames,0);
  try{await document.fonts.load(`800 80px ${V85_FONT}`);await document.fonts.load(`500 30px ${V85_FONT}`)}catch(e){}
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d',{alpha:false});
  const prev=document.createElement('canvas');prev.width=W;prev.height=H;const pctx=prev.getContext('2d',{alpha:false});
  const work=document.createElement('canvas');work.width=W;work.height=H;const wctx=work.getContext('2d',{alpha:false});
  segs.forEach((s,i)=>s.idx=i);const last=segs.length-1;
  /* overgangen: zwart in, schuiven, inzoomen, overvloeien, lichtflits; daarna vignet, korrel en voortgang */
  const frame=(seg,res,f,n)=>{const t=f/FPS/scale,tr=seg.idx===0?'black':(seg.trans||'fade'),T=Math.max(1,Math.min(seg.frames-1,Math.round((tr==='push'?.55:tr==='leak'?.8:.6)*FPS*Math.min(1,scale))));
    if(seg.idx>0&&f<T){const k=v85E((f+1)/(T+1));v85Draw(wctx,seg,res,t);
      if(tr==='push'){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.drawImage(prev,-W*k,0);ctx.drawImage(work,W*(1-k),0)}
      else{ctx.drawImage(prev,0,0);ctx.globalAlpha=k;if(tr==='zoom'){const z=1.1-.1*k;ctx.drawImage(work,(W-W*z)/2,(H-H*z)/2,W*z,H*z)}else ctx.drawImage(work,0,0);ctx.globalAlpha=1}
      if(tr==='leak'){const a=Math.sin(Math.PI*k),cx=W*(.15+.7*k),g=ctx.createRadialGradient(cx,H*.4,0,cx,H*.4,W*.7);g.addColorStop(0,`rgba(255,214,140,${.6*a})`);g.addColorStop(.45,`rgba(255,150,70,${.22*a})`);g.addColorStop(1,'rgba(255,120,60,0)');
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore()}}
    else{v85Draw(ctx,seg,res,t);pctx.drawImage(cv,0,0)}
    if(seg.idx===0&&f<T){ctx.fillStyle=`rgba(0,0,0,${1-v85E((f+1)/(T+1))})`;ctx.fillRect(0,0,W,H)}
    const endF=Math.round(FPS*.9*Math.min(1,scale));if(seg.idx===last&&seg.frames-f<=endF){ctx.fillStyle=`rgba(0,0,0,${1-(seg.frames-f-1)/endF})`;ctx.fillRect(0,0,W,H)}
    v85Post(ctx,n,total)};
  const codec=opts.forceRecorder?null:await v85Codec();
  if(!codec)return v85Record(segs,{cv,ctx,pctx,frame,total,prog,job});
  await v85LoadLib();const tgt=await v85Target(opts.disk);let err=null,done=0;
  const muxer=new Mp4Muxer.Muxer({target:tgt.target,video:{codec:codec.mux,width:W,height:H,frameRate:FPS},fastStart:{expectedVideoChunks:total}});
  const enc=new VideoEncoder({output:(c,m)=>{try{muxer.addVideoChunk(c,m)}catch(e){err=e}},error:e=>{err=e}});enc.configure(codec.cfg);
  let next=v85Res(segs[0]),n=0;const t0=performance.now();
  try{for(let i=0;i<segs.length;i++){const seg=segs[i],res=await next;next=i+1<segs.length?v85Res(segs[i+1]):null;
      for(let f=0;f<seg.frames;f++,n++){if(job.cancel)throw new Error('Geannuleerd');if(err)throw err;
        frame(seg,res,f,n);const vf=new VideoFrame(cv,{timestamp:Math.round(n*1e6/FPS),duration:Math.round(1e6/FPS)});enc.encode(vf,{keyFrame:n%(FPS*2)===0});vf.close();
        while(enc.encodeQueueSize>6){await new Promise(r=>setTimeout(r,2));if(err)throw err}
        if(n%10===0){prog(n/total,performance.now()-t0);await new Promise(r=>setTimeout(r,0))}}
      v85Free(res)}
    await enc.flush();if(err)throw err;muxer.finalize();const blob=await tgt.done();done=1;prog(1,performance.now()-t0);
    return {blob:blob.type?blob:new Blob([blob],{type:'video/mp4'}),type:'video/mp4',ext:'mp4',seconds:total/FPS,frames:total,codec:codec.cfg.codec,disk:tgt.disk,cleanup:tgt.cleanup,ms:performance.now()-t0}}
  finally{try{if(enc.state!=='closed')enc.close()}catch(e){}if(!done&&tgt.disk)try{await tgt.done();await tgt.cleanup()}catch(e){}}}
/* terugval: real time opnemen van het canvas */
async function v85Record(segs,{cv,pctx,frame,total,prog,job}){if(typeof MediaRecorder==='undefined'||!cv.captureStream)throw new Error('Deze browser kan geen video maken. Werk iOS of Chrome bij.');
  const type=['video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9','video/webm'].find(t=>MediaRecorder.isTypeSupported(t))||'';
  const stream=cv.captureStream(V85.FPS),rec=new MediaRecorder(stream,{...(type?{mimeType:type}:{}),videoBitsPerSecond:V85.BR}),parts=[];
  rec.ondataavailable=e=>{if(e.data.size)parts.push(e.data)};const stopped=new Promise(r=>rec.onstop=r);
  const res=new Map(),get=i=>{if(!res.has(i)){res.set(i,{img:null,blur:null});v85Res(segs[i]).then(r=>{if(res.has(i))res.set(i,r)})}return res.get(i)};
  res.set(0,await v85Res(segs[0]));frame(segs[0],res.get(0),0,0);rec.start(1000);
  const starts=[];let acc=0;segs.forEach(s=>{starts.push(acc);acc+=s.frames});
  const t0=performance.now();let i=0;
  await new Promise((ok,fail)=>{const tick=()=>{if(job.cancel){fail(new Error('Geannuleerd'));return}
      const n=Math.floor((performance.now()-t0)/1000*V85.FPS);if(n>=total){ok();return}
      while(i+1<segs.length&&n>=starts[i+1]){v85Free(res.get(i));res.set(i,null);i++}
      if(i+1<segs.length)get(i+1);frame(segs[i],get(i),n-starts[i],n);prog(n/total,performance.now()-t0);requestAnimationFrame(tick)};requestAnimationFrame(tick)})
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
