/* =====================================================================
   v8.5 · Reisvideo
   Aan het einde van de reis maakt de app op de telefoon zelf een MP4 (1920×1080, 30 fps, zonder geluid):
   titel → per reisdag een hoofdstuk → per soort de eigen foto's (favoriet eerst) of, als er geen eigen foto is,
   een voorbeeldfoto uit de app met fotograaf, licentie en bron in beeld → afsluiting met totalen.
   - v8.13: altijd beschikbaar (geen datumslot meer); op de laatste reisdag verschijnt een herinnering op Home.
   - Encoderen met WebCodecs (H.264, anders VP9) + mp4-muxer (js/vendor, MIT), offline en sneller dan real time.
     Geen WebCodecs: terugval op MediaRecorder (opnemen in real time).
   - Leest alleen: state.v43Observations, state.v44Log, eigen foto's (v8.4). Schrijft niets in CR27_V2.
   ===================================================================== */
const V85={W:1920,H:1080,FPS:30,BR:8_000_000,FADE:.5,LIB:'js/vendor/mp4-muxer-5.2.2.min.js'};
const V85_FONT="'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',sans-serif";
const V85_CAT={Vogels:['Vogel','vogel','vogels'],Zoogdieren:['Zoogdier','zoogdier','zoogdieren'],Reptielen:['Reptiel','reptiel','reptielen'],'Amfibieën':['Amfibie','amfibie','amfibieën'],Zeeleven:['Zeeleven','zeedier','zeedieren']};
const V85_LAST=S[S.length-1].date;
/* v9.1 · eigen titel en namen (state.v9Video) */
const v85Title=()=>((state.v9Video||{}).title||'').trim()||'Costa Rica 2027';
const v85Names=()=>((state.v9Video||{}).names||'').trim();
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

/* ---------- wat er in de video komt ----------
   v8.7: per dag maximaal 15 dieren (elk 1 foto), 3 eigen video's en 5 sfeerfoto's.
   - Eerst dieren die nog niet eerder in de video stonden; dieren die al eerder getoond zijn alleen als er nog plek is
     (en alleen met eigen foto of video).
   - Bij te veel kiest de app de bijzonderste: zeldzaamheid, eerste keer gezien in de reis, eigen foto/video, notitie, ster.
   - Per dier de foto met ster (door jullie gezet), anders de scherpste; per dag de video's met ster, anders van de hoogst scorende dieren. */
const V85_SEL={animals:15,clips:3,moods:15,stay:3};
const V85_RARE={1:40,2:25,3:10,4:0};
function v85Plan(){const nameOf={};Object.keys(V47_SP).forEach(k=>{nameOf[v43name(k)]??=k});
  const map={},get=(sp,day,region,name)=>map[sp+'|'+day]??={sp,day,region,name,t:'',ph:[],cl:[]};
  Object.entries(state.v43Observations||{}).forEach(([sp,o])=>{const name=nameOf[sp]||o.name||sp,ds=Object.entries(o.days||{});
    if(ds.length)ds.forEach(([d,r])=>{if(S[d-1])get(sp,+d,r.r,name).t=r.t||''});
    else Object.entries(o.places||{}).filter(([,r])=>r.seen).forEach(([R,r])=>{get(sp,v85DayByDate(v85LocalDate(r.t))||v85FirstDay(R),R,name).t=r.t||''})});
  const dayOf=p=>p.day||v85DayByDate(v85LocalDate(p.taken))||v85FirstDay(p.region);
  V84.list.forEach(p=>get(p.sp,dayOf(p),p.region,nameOf[p.sp]||p.name).ph.push(p));
  (V84.vids||[]).forEach(p=>get(p.sp,dayOf(p),p.region,nameOf[p.sp]||p.name).cl.push(p));
  const byDay={},first={},moodBy={};Object.values(map).forEach(s=>{(byDay[s.day]??=[]).push(s);first[s.sp]=Math.min(first[s.sp]??99,s.day)});
  (V84.moods||[]).forEach(p=>(moodBy[dayOf(p)]??=[]).push(p));const stayBy={};(V84.stays||[]).forEach(p=>(stayBy[dayOf(p)]??=[]).push(p));
  const allDays=[...new Set([...Object.keys(byDay),...Object.keys(moodBy),...Object.keys(stayBy)].map(Number))].filter(d=>S[d-1]).sort((a,b)=>a-b);
  const shown=new Set(),notes=new Set(),items=[],days=[];
  allDays.forEach(d=>{
    const cand=(byDay[d]||[]).map(s=>{const own=s.ph.length+s.cl.length>0,note=notes.has(s.sp+'|'+s.region)?'':v85Note(s.sp,s.region);
      /* v9: eigen foto's die allemaal onscherp/donker/klein zijn (zonder ster of video) zakken naar de laatste plek */
      const weak=own&&!s.cl.length&&s.ph.length&&s.ph.every(p=>!p.favUser&&v84Qual(p).length);
      const score=(V85_RARE[v47Chance(s.region,s.name)]??15)+(first[s.sp]===d?30:0)+(own?20:0)+(note?10:0)+(s.ph.some(p=>p.favUser)?15:0)+(s.cl.some(p=>p.fav)?15:0)-(weak?40:0);
      return {s,own,note,score,fresh:!shown.has(s.sp)}});
    /* v8.13: eigen foto/video gaat altijd voor: 1) nieuw met eigen beeld, 2) eerder getoond met eigen beeld, 3) nieuw met voorbeeldfoto */
    const fresh=cand.filter(c=>c.fresh).sort((a,b)=>b.score-a.score),again=cand.filter(c=>!c.fresh&&c.own).sort((a,b)=>b.score-a.score);
    const pick=[...fresh.filter(c=>c.own),...again,...fresh.filter(c=>!c.own)].slice(0,V85_SEL.animals);
    const clips=new Set(pick.filter(c=>c.s.cl.length).sort((a,b)=>(b.s.cl.some(p=>p.fav)-a.s.cl.some(p=>p.fav))||b.score-a.score).slice(0,V85_SEL.clips));
    const dayItems=pick.map(c=>{const s=c.s;shown.add(s.sp);if(c.note)notes.add(s.sp+'|'+s.region);
      const ph=[...s.ph].sort((a,b)=>(!!b.favUser-!!a.favUser)||(v84Qual(a).length-v84Qual(b).length)||((b.sharp||0)-(a.sharp||0))||(b.t||'').localeCompare(a.t||''))[0];
      const cl=clips.has(c)?[...s.cl].sort((a,b)=>b.fav-a.fav)[0]:null;
      const it={own:c.own,repeat:!c.fresh,score:c.score,name:s.name,sp:s.sp,region:s.region,day:d,when:ph?.taken||s.t||ph?.t||'',note:c.note,photos:[],clips:[]};
      /* v8.15: een dier met eigen video krijgt alleen de video (geen losse foto ernaast) */
      if(ph&&!cl){it.photos=[V84.url[ph.id]];it.aspect=ph.w&&ph.h?ph.w/ph.h:0}else if(s.cl.length&&!cl)it.photos=[V84.poster[s.cl[0].id]||''].filter(Boolean);
      if(ph)it.best=V84.url[ph.id];
      if(cl)it.clips=[{url:V84.url[cl.id],start:cl.orig?(cl.start||0):0,dur:Math.min(V84_VLEN,cl.dur||V84_VLEN),poster:V84.poster[cl.id]||'',aspect:cl.w&&cl.h?cl.w/cl.h:16/9}];
      if(!c.own){const ex=v85Example(s.name);it.photos=ex.src?[ex.src]:[];it.credit=ex.credit}
      it.chance=v47Chance(s.region,s.name);it.q=ph&&!cl?v84Qual(ph):[];
      it.still=it.photos[0]||it.best||it.clips[0]?.poster||'';return it}).sort((a,b)=>(v85Ms(a.when)-v85Ms(b.when))||(b.score-a.score));
    /* v9: hoogtepunt van de dag = zeldzaamste dier (laagste kans), bij gelijke kans de hoogste score */
    if(dayItems.length>=2){const hl=[...dayItems].filter(i=>i.chance>0&&(i.still||i.clips.length)).sort((a,b)=>(a.chance-b.chance)||(b.score-a.score))[0];if(hl)hl.hl=true}
    const ms=(moodBy[d]||[]).sort((a,b)=>(v84Qual(a).length-v84Qual(b).length)||(b.sharp||0)-(a.sharp||0)).slice(0,V85_SEL.moods).sort((a,b)=>(a.taken||a.t).localeCompare(b.taken||b.t));
    const nClipAll=cand.filter(c=>c.s.cl.length).length;
    items.push(...dayItems);
    const st=(stayBy[d]||[]).sort((a,b)=>(a.taken||a.t).localeCompare(b.taken||b.t)).slice(0,V85_SEL.stay);
    days.push({day:d,items:dayItems,moods:ms.map(p=>({url:V84.url[p.id],when:p.taken||'',label:p.label||'',aspect:p.w&&p.h?p.w/p.h:1.5})),
      stay:st.length?{name:typeof v815HotelOf==='function'?v815HotelOf(d):'',photos:st.map(p=>V84.url[p.id])}:null,cut:{animals:fresh.length+again.length-pick.length,clips:Math.max(0,nClipAll-clips.size)}})});
  return {items,days,species:new Set(items.map(i=>i.sp)).size}}

/* ---------- segmenten (dia's) met duur in seconden ----------
   v8.10 · variatie: per dier wisselende opmaak (schermvullend, gesplitst, ingelijst), camerabewegingen, aftiteling, mozaïek.
   v8.15 · korter en rustiger:
   - per dag: hoofdstukkaart → ons verblijf (één keer per verblijf) → dieren en sfeer door elkaar;
   - de bijzonderste dieren (max. 4, plus dieren met notitie) los in beeld; de rest gecombineerd: dier + sfeerfoto
     of twee dieren naast elkaar; overige sfeerfoto's in groepen van 3–4;
   - eigen video's (max. 3 per dag, max. 5 s, op ware snelheid) verspreid over de dag, nooit achter elkaar;
   - kijktijd: los ±3 s, combinatie van 2 ±4,4 s, groep van 3–4 ±5 s;
   - rustige overgangen: overvloeien, harde las, af en toe schuiven; dagen via zwart. */
const V85_TR=['fade','cut','push','fade','zoom'];
const V85_T={hl:4.5,solo:3,ex:3,note:2,pair:4.5,col2:4.5,col3:5,col4:5.5,mood:3,stay1:4,stay:5,day:4,clipTail:.4};
const v85Hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
/* gedeelde velden van een soortdia */
function v85SpBase(it,day){const i=v47Info(it.name),r=wl2(it.name)||{},c=v85Cat(i.cat),time=v85Time(it.when);
  return {k:'sp',cat:i.cat,sp:it.sp,day:it.day,own:it.own,repeat:it.repeat,hl:!!it.hl,chance:it.chance||0,hud:`Dag ${it.day} · ${it.region}`,label:it.hl?`Hoogtepunt van de dag · ${c[0]}`:it.repeat?`${c[0]} · opnieuw gezien`:c[0],title:i.nl,en:i.nl!==i.en?i.en:'',sci:r.s||'',
    meta:[it.region,new Date((S[it.day-1]||day||S[0]).date+'T12:00').toLocaleDateString('nl-NL',{weekday:'short',day:'numeric',month:'short'}),time].filter(Boolean).join(' · '),
    credit:it.own?'Eigen foto':(it.photos.length?'Voorbeeldfoto · '+it.credit:'Geen foto')}}
/* paneel voor een combinatie */
const v85PanelSp=it=>{const b=v85SpBase(it);return {cat:b.cat,src:it.photos[0]||it.still||'',title:b.title,sci:b.sci,en:b.en,label:b.label,own:it.own,credit:it.own?'':'Voorbeeldfoto · '+(it.credit||'').split(' · ')[0]}};
const v85PanelMood=(m,region)=>({src:m.url,title:m.label||region,sci:'',label:'Sfeer',own:true,mood:true,credit:''});
/* sfeerfoto's in groepen van 3–4 (rest 1–2 apart) */
function v85Groups(arr){const r=arr.length;if(r<=2)return r?[arr]:[];const g=Math.ceil(r/4),base=Math.floor(r/g),extra=r%g,out=[];let p=0;
  for(let j=0;j<g;j++){const n=base+(j<extra?1:0);out.push(arr.slice(p,p+n));p+=n}return out}
/* n elementen gelijkmatig uit een lijst kiezen (indexen) */
const v85Spread=(len,n)=>{const out=new Set();for(let k=0;k<n;k++)out.add(Math.min(len-1,Math.floor((k+.5)*len/n)));return out};
function v85Segments(plan,proef){const {items,days}=plan;if(!items.length&&!days.some(d=>d.moods.length||d.stay))return [];
  const first=items.find(i=>i.own&&i.still)||items.find(i=>i.still),nSp=plan.species??new Set(items.map(i=>i.sp)).size,firstMood=days.find(d=>d.moods.length)?.moods[0]?.url||days.find(d=>d.stay)?.stay.photos[0]||'';
  const regions=[...new Set(items.map(i=>i.region).concat(days.filter(d=>d.moods.length||d.stay).map(d=>v47Region(S[d.day-1]))))];let spN=0,kb=0,lastTr='',lays=[],nCol=0;const stays=new Set();
  const pickTr=key=>{let t=V85_TR[v85Hash(key)%V85_TR.length];if(t===lastTr&&t!=='fade')t=V85_TR[(V85_TR.indexOf(t)+1)%V85_TR.length];lastTr=t;return t};
  /* opmaak: eigen liggende foto vooral schermvullend, staand gesplitst of ingelijst; nooit drie keer hetzelfde achter elkaar */
  const pickLay=(it,key)=>{let opts;if(!it.own)opts=['frame','split'];else if(it.aspect&&it.aspect<1.1)opts=['split','frame','split'];else opts=['full','full','split','full','frame'];
    let l=opts[v85Hash(key)%opts.length];if(lays.length>=2&&lays[lays.length-1]===l&&lays[lays.length-2]===l)l=opts.find(x=>x!==l)||l;lays.push(l);return l};
  const segs=[{k:'intro',dur:5,trans:'black',src:firstMood||first?.still||'',label:proef?'Proefvideo':v85Names()?`Een reis van ${v85Names()}`:'Reisvideo',title:v85Title(),
    sub:`${new Date(S[0].date+'T12:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long'})} – ${new Date(V85_LAST+'T12:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'})}`,
    meta:`${nSp} ${nSp===1?'soort':'soorten'} · ${regions.length} ${regions.length===1?'bestemming':'bestemmingen'}`}];
  days.forEach(d=>{const day=S[d.day-1]||S[0],region=v47Region(day),hud=`Dag ${d.day} · ${region}`,nOwn=d.items.filter(i=>i.own).length;
    const lead=d.moods[0]?{still:d.moods[0].url}:(d.items.find(i=>i.own&&i.still)||d.items.find(i=>i.still)||(d.stay?{still:d.stay.photos[0]}:null));
    const regs=[...new Set(d.items.map(i=>i.region))],nNew=d.items.filter(i=>!i.repeat).length,nRep=d.items.length-nNew;
    const stayKey=d.stay?(d.stay.name||'#'+d.day).toLowerCase():'',showStay=d.stay&&!stays.has(stayKey);if(showStay)stays.add(stayKey);
    segs.push({k:'day',dur:V85_T.day,trans:'dip',day:d.day,of:S.length,stop:typeof v51Day2Stop==='function'?v51Day2Stop(d.day):0,src:lead?.still||'',label:`Dag ${d.day} van ${S.length}`,title:regs.join(' · ')||region,
      sub:new Date(day.date+'T12:00').toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'}),stay:d.stay?.name||'',
      meta:[nNew?`${nNew} ${nNew===1?'nieuwe soort':'nieuwe soorten'}`:'',nRep?`${nRep} opnieuw gezien`:'',nOwn?`${nOwn} met eigen foto of video`:''].filter(Boolean).join(' · ')||'Sfeer van de dag'});
    if(showStay){const ph=d.stay.photos;segs.push({k:'stay',i:kb++,dur:ph.length>1?V85_T.stay:V85_T.stay1,trans:'fade',src:ph[0],srcs:ph.length>1?ph:null,lay:ph.length===2?'duo':'hero',hud,label:'Ons verblijf',title:d.stay.name||'Ons verblijf',meta:region})}
    /* ---- indeling van de dag ---- */
    const clipIts=d.items.filter(i=>i.clips.length),rest=d.items.filter(i=>!i.clips.length);
    const rank=[...rest].sort((a,b)=>(b.own-a.own)||((b.score||0)-(a.score||0)));
    const solo=new Set(rest.length<=5?rest:[...rank.slice(0,4),...rest.filter(i=>i.note||i.hl)]);
    const pairable=rest.filter(i=>!solo.has(i)),moods=[...d.moods];
    const nAm=Math.min(pairable.length,moods.length>=3?Math.floor(moods.length/3):moods.length);
    const amAt=v85Spread(pairable.length,nAm),moodFor=v85Spread(moods.length,nAm),amMoods=moods.filter((_,j)=>moodFor.has(j)),colMoods=moods.filter((_,j)=>!moodFor.has(j));
    const units=[];let mi=0,wait=null;
    rest.forEach(it=>{if(solo.has(it)){units.push({t:v85Ms(it.when),k:'solo',it});return}
      const pi=pairable.indexOf(it);if(amAt.has(pi)){units.push({t:v85Ms(it.when),k:'am',it,m:amMoods[mi++]});return}
      if(wait){units.push({t:v85Ms(wait.when),k:'aa',a:wait,b:it});wait=null}else wait=it});
    if(wait)units.push({t:v85Ms(wait.when),k:'solo',it:wait});
    units.sort((a,b)=>a.t-b.t);
    /* sfeergroepen gelijkmatig ertussen, de eerste direct na de hoofdstukkaart */
    const groups=v85Groups(colMoods),body=[...units];groups.forEach((g,j)=>body.splice(Math.round(j*(units.length+j)/Math.max(1,groups.length))+0,0,{k:'col',g}));
    /* eigen video's verspreid: op ±1/4, 1/2, 3/4 van de dag */
    const cs=[...clipIts].sort((a,b)=>v85Ms(a.when)-v85Ms(b.when));
    const L0=body.length;cs.forEach((it,k)=>{const at=Math.max(Math.min(1,L0),Math.round((k+1)*L0/(cs.length+1)))+k;body.splice(Math.min(body.length,at),0,{k:'clip',it})});
    for(let j=1;j<body.length;j++)if(body[j].k==='clip'&&body[j-1].k==='clip'){const nx=body.findIndex((u,q)=>q>j&&u.k!=='clip');if(nx>0){const [u]=body.splice(nx,1);body.splice(j,0,u)}}
    body.forEach(u=>{
      if(u.k==='col'){const g=u.g,labels=g.map(m=>m.label),same=labels[0]&&labels.every(l=>l===labels[0]);
        if(g.length===1){segs.push({k:'mood',i:kb++,dur:V85_T.mood,trans:pickTr('m'+kb),src:g[0].url,hud,label:'Sfeer',title:g[0].label||region,meta:g[0].label?region:'',credit:'Eigen foto'});return}
        const lay=g.length===2?'duo':g.length===4?'quad':['trio','hero'][nCol%2];nCol++;
        segs.push({k:'collage',i:kb++,lay,srcs:g.map(m=>m.url),labels:same?[]:labels,dur:g.length===2?V85_T.col2:g.length===3?V85_T.col3:V85_T.col4,trans:pickTr('c'+kb),hud,label:'Sfeer',title:same?labels[0]:region,meta:same?region:''});return}
      if(u.k==='am'||u.k==='aa'){if(u.k==='aa'){if(!u.a.repeat)spN++;if(!u.b.repeat)spN++}else if(!u.it.repeat)spN++;
        const panels=u.k==='am'?(v85Hash(u.it.sp)%2?[v85PanelSp(u.it),v85PanelMood(u.m,region)]:[v85PanelMood(u.m,region),v85PanelSp(u.it)]):[v85PanelSp(u.a),v85PanelSp(u.b)];
        segs.push({k:'pair',i:kb++,dur:V85_T.pair,trans:pickTr('p'+kb),hud,n:spN,of:nSp,panels,srcs:panels.map(p=>p.src)});return}
      const it=u.it,key=it.sp+'|'+it.day;if(!it.repeat)spN++;const base={...v85SpBase(it,day),n:it.repeat?0:spN,of:nSp,trans:pickTr(key),i:kb++,note:it.note};
      if(u.k==='clip'){const cl=it.clips[0],d0=Math.max(1,Math.min(V84_VLEN,cl.dur));
        segs.push({...base,src:'',clip:cl,slow:false,freezeAt:null,lay:cl.aspect>=1.2?'full':'frame',dur:d0+V85_T.clipTail+(it.note?V85_T.note:0),credit:'Eigen video',cap:false});return}
      if(!it.photos[0]){segs.push({...base,lay:'frame',dur:it.note?5:3,src:''});return}
      segs.push({...base,src:it.photos[0],clip:null,lay:it.hl?(it.own&&!(it.aspect&&it.aspect<1.1)?'full':'frame'):pickLay(it,key),dur:(it.hl?V85_T.hl:it.own?V85_T.solo:V85_T.ex)+(it.note?V85_T.note:0),cap:!it.own})})});
  const by={};new Map(items.map(i=>[i.sp,i])).forEach(i=>{const c=v47Info(i.name).cat;by[c]=(by[c]||0)+1});
  const order=['Vogels','Zoogdieren','Reptielen','Amfibieën','Zeeleven'],ord=a=>(order.indexOf(a)+99)%99,cs=Object.entries(by).sort((a,b)=>ord(a[0])-ord(b[0]));
  const cats=cs.map(([c,n])=>`${n} ${v85Cat(c)[n===1?1:2]}`),catN=cs.map(([c,n])=>({n,label:n===1?v85Cat(c)[0]:(c||'Soorten')}));
  const nOwn=new Set(items.filter(i=>i.own).map(i=>i.sp)).size,last=[...items].reverse().find(i=>i.own&&i.still)||first;
  segs.push({k:'end',dur:7,trans:'dip',cats:catN,src:last?.photos[0]||last?.still||firstMood,label:proef?'Einde proefvideo':'Einde',title:'Pura vida',sub:cats.join(' · '),
    meta:`${nOwn} met eigen foto of video · ${regions.length} ${regions.length===1?'bestemming':'bestemmingen'} · ${S.length} dagen`});
  /* aftiteling: alle soorten per groep, eigen beeld gemarkeerd; daarna bronnen van voorbeeldfoto's */
  const uniq=[...new Map(items.map(i=>[i.sp,i])).values()];
  if(uniq.length){const groups=cs.map(([c])=>({cat:c,label:v85Cat(c)[2].replace(/^./,x=>x.toUpperCase()),names:uniq.filter(i=>v47Info(i.name).cat===c).map(i=>({nl:v47Info(i.name).nl,own:uniq.some(u=>u.sp===i.sp&&u.own)||items.some(x=>x.sp===i.sp&&x.own)})).sort((a,b)=>a.nl.localeCompare(b.nl,'nl'))}));
    const credits=[...new Set(items.filter(i=>!i.own&&i.credit).map(i=>`${v47Info(i.name).nl} · ${i.credit}`))].sort((a,b)=>a.localeCompare(b,'nl'));
    const height=groups.reduce((h,g)=>h+90+Math.ceil(g.names.length/3)*50,0)+(credits.length?110+credits.length*34:0)+260;
    const by=v85Names();segs.push({k:'credits',dur:Math.min(32,Math.max(8,(height+(by?160:0)+V85.H)/150)),trans:'fade',groups,credits,height:height+(by?160:0),by,src:'',proef});
    const tiles=[...new Map(items.filter(i=>i.still).map(i=>[i.sp,i])).values()].sort((a,b)=>(b.own-a.own)||((b.score||0)-(a.score||0))).slice(0,60).map(i=>i.own?i.still:(typeof wl2Thumb==='function'&&wl2Thumb(i.name))||i.still);
    if(tiles.length>=4)segs.push({k:'mosaic',dur:6,trans:'fade',srcs:tiles,title:v85Title(),sub:v85Names()?`${segs[0].sub} · ${v85Names()}`:segs[0].sub})}
  /* v9 · openingsscène: 4–6 beste eigen beelden in snelle wissels vóór de titel (hoogtepunten eerst) */
  const cold=v85ColdSrcs(items);if(cold.length>=3){segs.unshift({k:'cold',dur:cold.length*.5,srcs:cold,trans:'black'});segs[1].trans='dip'}
  return v85Grid(segs)}
function v85ColdSrcs(items){const own=items.filter(i=>i.own&&(i.photos[0]||i.best)&&!(i.q||[]).length);const seen=new Set(),out=[];
  [...own].sort((a,b)=>(!!b.hl-!!a.hl)||((b.score||0)-(a.score||0))).forEach(i=>{if(out.length<6&&!seen.has(i.sp)){seen.add(i.sp);out.push(i.photos[0]||i.best)}});return out}
/* v9 · vaste montageritmiek: alle duren op een raster van 0,5 s (eigen video's naar boven afgerond) */
function v85Grid(segs){segs.forEach(x=>{if(x.k==='credits')return;x.dur=x.clip?Math.ceil(x.dur*2-1e-6)/2:Math.max(.5,Math.round(x.dur*2)/2)});return segs}
/* v8.11 · korte versie (±60–90 s): per dag het bijzonderste dier (eigen beeld voorrang), max. 20 dieren,
   één sfeercollage na de titel, max. 3 eigen video's (kort), slot met tellers en mozaïek */
function v85Short(plan,proef){const full=v85Segments(plan,proef);if(!full.length)return [];
  const intro={...full.find(x=>x.k==='intro'),dur:3.5},cold=full.find(x=>x.k==='cold'),end=full.find(x=>x.k==='end'),mosaic=full.find(x=>x.k==='mosaic');
  let picks=plan.days.map(d=>[...d.items].filter(i=>i.still||i.clips.length).sort((a,b)=>(b.own-a.own)||((b.score||0)-(a.score||0)))[0]).filter(Boolean);
  if(picks.length>20)picks=[...picks].sort((a,b)=>(b.own-a.own)||((b.score||0)-(a.score||0))).slice(0,20).sort((a,b)=>a.day-b.day);
  const ms=plan.days.filter(d=>d.moods.length).map(d=>d.moods[0]).slice(0,3),moods=ms.map(m=>m.url);
  const out=cold?[cold,intro]:[intro];if(moods.length>=2)out.push({k:'collage',i:0,lay:moods.length===3?'trio':'duo',srcs:moods,labels:ms.map(m=>m.label),dur:4,trans:'fade',hud:'',label:'Sfeer',title:'Costa Rica',meta:''});
  let clips=0,n=0;const tr=['fade','cut','push','fade'];
  picks.forEach((it,j)=>{const src=it.photos[0]||it.still;if(!src&&!it.clips.length)return;n++;
    const base={...v85SpBase(it),n,of:picks.length,i:j,note:'',dur:3.2,trans:tr[j%tr.length],src,lay:it.own&&!(it.aspect&&it.aspect<1.1)?'full':'frame',cap:!it.own};
    if(it.clips.length&&clips<3){clips++;const cl=it.clips[0],d0=Math.min(3,Math.max(1,cl.dur));out.push({...base,clip:{...cl,dur:d0},src:'',slow:false,freezeAt:null,lay:cl.aspect>=1.2?'full':'frame',dur:d0+.4,credit:'Eigen video'})}
    else if(src)out.push(base)});
  if(end)out.push({...end,dur:5});if(mosaic)out.push({...mosaic,dur:4.5});
  for(let i=1;i<out.length;i++)if(out[i].trans===out[i-1].trans&&out[i].trans!=='fade'&&out[i].k==='sp')out[i].trans='fade';
  return v85Grid(out)}
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
function v85Txt(ctx,t,x,y,o){if(!t)return 0;const k=o.k??1;if(k<=0)return 0;if(o.shrink&&o.maxW){v85Font(ctx,o.size,o.weight,o.italic);const w0=ctx.measureText(t).width;if(w0>o.maxW)o={...o,size:Math.max(Math.floor(o.size*.55),Math.floor(o.size*o.maxW/w0))}}v85Font(ctx,o.size,o.weight,o.italic);v85Sp(ctx,o.spacing||0);ctx.textAlign=o.align||'left';
  const s=v85Fit(ctx,o.upper?t.toUpperCase():t,o.maxW),w=ctx.measureText(s).width;ctx.save();ctx.globalAlpha*=v85E(k);ctx.fillStyle=o.color||'#fff';
  if(o.shadow){ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=12;ctx.shadowOffsetY=2}ctx.fillText(s,x,y+(1-v85E(k))*(o.rise??26));ctx.restore();v85Sp(ctx,0);return w}
/* letters komen één voor één op */
function v85Letters(ctx,t,x,y,o,time,start){if(o.maxW){v85Font(ctx,o.size,o.weight);v85Sp(ctx,o.spacing||0);const w0=ctx.measureText(t).width;if(w0>o.maxW)o={...o,size:Math.max(Math.floor(o.size*.5),Math.floor(o.size*o.maxW/w0))}}v85Font(ctx,o.size,o.weight);v85Sp(ctx,o.spacing||0);const s=v85Fit(ctx,t,o.maxW),W=ctx.measureText(s).width;
  let x0=o.align==='center'?x-W/2:x;ctx.textAlign='left';ctx.save();ctx.fillStyle=o.color||'#fff';
  for(let i=0;i<s.length;i++){const k=v85E(v85At(time,start+i*(o.stagger||.035),.45));if(k<=0)break;const px=x0+ctx.measureText(s.slice(0,i)).width;
    ctx.globalAlpha=k;ctx.fillText(s[i],px,y+(1-k)*(o.rise||46))}
  ctx.restore();v85Sp(ctx,0);return W}
function v85Wrap(ctx,t,maxW,lines){const words=t.split(/\s+/),out=[];let cur='';
  for(const w of words){const nx=cur?cur+' '+w:w;if(ctx.measureText(nx).width>maxW&&cur){out.push(cur);cur=w}else cur=nx}if(cur)out.push(cur);
  if(out.length>lines){out.length=lines;out[lines-1]=v85Fit(ctx,out[lines-1]+'…',maxW)}return out}
function v85Round(ctx,x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h)}
/* afmetingen: foto (width/height) of video (videoWidth/videoHeight) */
const v85IW=img=>img.videoWidth||img.width,v85IH=img=>img.videoHeight||img.height;
function v85Blur(img){const c=document.createElement('canvas');c.width=64;c.height=36;const x=c.getContext('2d'),iw=v85IW(img),ih=v85IH(img),r=Math.max(64/iw,36/ih);
  x.drawImage(img,(64-iw*r)/2,(36-ih*r)/2,iw*r,ih*r);return c}
/* gedeelde lagen, één keer gemaakt */
let v85FX=null;
function v85Fx(){if(v85FX&&v85FX.w===V85.W&&v85FX.h===V85.H)return v85FX;const {W,H}=V85;
  const vig=document.createElement('canvas');vig.width=W;vig.height=H;const v=vig.getContext('2d'),g=v.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*1.05);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');v.fillStyle=g;v.fillRect(0,0,W,H);
  const glow=document.createElement('canvas');glow.width=glow.height=64;const o=glow.getContext('2d'),rg=o.createRadialGradient(32,32,0,32,32,32);
  rg.addColorStop(0,'rgba(255,246,190,1)');rg.addColorStop(.25,'rgba(230,240,150,.55)');rg.addColorStop(1,'rgba(160,230,140,0)');o.fillStyle=rg;o.fillRect(0,0,64,64);
  let map=null;try{if(typeof V51_MAP!=='undefined')map=new Path2D(V51_MAP.CRI)}catch(e){}
  return v85FX={vig,glow,map,w:W,h:H}}
/* vignet en voortgangslijn bovenin (geen filmkorrel: kost bitrate en wordt blokkerig) */
function v85Post(ctx,n,total){const {W,H}=V85,fx=v85Fx();ctx.drawImage(fx.vig,0,0);
  ctx.fillStyle='rgba(155,230,174,.55)';ctx.fillRect(0,0,W*(n+1)/total,3)}
/* vuurvliegjes */
function v85Flies(ctx,t,n,alpha){const {W,H}=V85,fx=v85Fx();ctx.save();
  for(let i=0;i<n;i++){const a=(Math.sin(i*12.9898)*43758.5453)%1,b=(Math.sin(i*78.233)*12543.21)%1,ra=Math.abs(a),rb=Math.abs(b);
    const x=(ra*W+Math.sin(t*.6+i)*40+t*(12+rb*18))%W,y=H-((rb*H+t*(20+ra*30))%H),s=10+ra*26,fl=.35+.65*Math.abs(Math.sin(t*(1.3+rb)+i));
    ctx.globalAlpha=alpha*fl;ctx.drawImage(fx.glow,x-s/2,y-s/2,s,s)}ctx.restore()}
/* foto: cover of contain met beweging */
function v85Cover(ctx,img,z,dx,dy){const {W,H}=V85,r=Math.max(W/v85IW(img),H/v85IH(img))*z,w=v85IW(img)*r,h=v85IH(img)*r;ctx.drawImage(img,(W-w)/2+dx,(H-h)/2+dy,w,h)}
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
/* v9.1 · kaart: eerst heel Costa Rica met de route tot hier, daarna zoomt de camera in op de huidige stop */
function v85MapZoom(ctx,x,y,h,t,cur,o={}){if(typeof V51_MAP==='undefined'||typeof v51XY!=='function'){v85Map(ctx,x,y,h,t,cur,o);return}
  const w=h*V51_MAP.W/V51_MAP.H,s=h/V51_MAP.H,pt=V51_PT[V51_STOPS[cur]?.[0]];if(!pt){v85Map(ctx,x,y,h,t,cur,o);return}
  const [a,b]=v51XY(pt[0],pt[1]),Sx=x+a*s,Sy=y+b*s,e=v85E(v85At(t,(o.start||0)+1.1,1.5)),z=1+1.15*e,Bx=x+w/2,By=y+h/2,Cx=Sx+(Bx-Sx)*e,Cy=Sy+(By-Sy)*e;
  /* in een eigen laag tekenen en de randen zacht laten weglopen (geen harde uitsnede) */
  const M=60,bw=Math.round(w+2*M),bh=Math.round(h+2*M);let L=v85MapZoom.L;if(!L||L.width!==bw||L.height!==bh){L=v85MapZoom.L=document.createElement('canvas');L.width=bw;L.height=bh}
  const lx=L.getContext('2d');lx.setTransform(1,0,0,1,0,0);lx.globalCompositeOperation='source-over';lx.clearRect(0,0,bw,bh);lx.translate(M-x,M-y);v85Map(lx,Cx-(Sx-x)*z,Cy-(Sy-y)*z,h*z,t,cur,o);lx.setTransform(1,0,0,1,0,0);
  if(e>0){lx.globalCompositeOperation='destination-in';const g=lx.createRadialGradient(bw/2,bh/2,Math.min(bw,bh)*(.5-.18*e),bw/2,bh/2,Math.max(bw,bh)*(.75-.2*e));g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');lx.fillStyle=g;lx.fillRect(0,0,bw,bh);lx.globalCompositeOperation='source-over'}
  ctx.drawImage(L,x-M,y-M)}
/* vergrote, vage achtergrond één keer per dia maken (opschalen per frame is duur) */
function v85BlurBig(res){const {W,H}=V85;if(!res.big&&res.blur){const c=document.createElement('canvas');c.width=W+120;c.height=H+80;const x=c.getContext('2d',{alpha:false});x.imageSmoothingQuality='high';x.drawImage(res.blur,0,0,W+120,H+80);res.big=c}return res.big}
function v85Bg(ctx,res,t,dark){const {W,H}=V85;
  if(res.img){ctx.drawImage(v85BlurBig(res),-60-Math.min(60,t*6),-40);ctx.globalAlpha=.55;v85Cover(ctx,res.img,1.08+.03*t/5,0,0);ctx.globalAlpha=1}
  else{const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#143a2b');g.addColorStop(1,V85_C.deep);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
  const g=ctx.createLinearGradient(0,0,W,0);g.addColorStop(0,`rgba(4,16,11,${dark})`);g.addColorStop(1,`rgba(4,16,11,${dark*.7})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
/* v8.15 · letterbox (alleen liggend): smalle zwarte balken boven en onder; merk, dag en teller staan in de bovenste balk */
const v85LB=()=>v85P()?0:54;
function v85Bars(ctx){const b=v85LB();if(!b)return;ctx.fillStyle='#000';ctx.fillRect(0,0,V85.W,b);ctx.fillRect(0,V85.H-b,V85.W,b)}
/* HUD: merk en dag links, teller rechts */
function v85Hud(ctx,seg,t){const {W}=V85,k=v85At(t,.15,.5);if(k<=0)return;const y=v85LB()?Math.round(v85LB()/2)+8:70;
  v85Font(ctx,20,800);v85Sp(ctx,6);const bw=Math.min(W*.4,ctx.measureText(v85Title().toUpperCase()).width);v85Sp(ctx,0);
  v85Txt(ctx,v85Title(),64,y,{size:20,weight:800,spacing:6,upper:true,maxW:W*.4,color:'rgba(255,255,255,.92)',k,rise:0,shadow:!v85LB()});
  const cnt=seg.n?`${seg.n} / ${seg.of}`:'';v85Font(ctx,22,700);const cw=cnt?ctx.measureText(cnt).width+40:0;
  if(seg.hud){ctx.save();ctx.globalAlpha=v85E(k)*.45;ctx.fillStyle='#fff';ctx.fillRect(64+bw+20,y-17,1.5,22);ctx.restore();
    v85Txt(ctx,seg.hud,64+bw+42,y,{size:20,weight:600,spacing:3,upper:true,color:'rgba(255,255,255,.72)',k,rise:0,maxW:W-64-bw-42-64-cw,shadow:!v85LB()})}
  if(cnt)v85Txt(ctx,cnt,W-64,y,{size:22,weight:700,align:'right',color:'rgba(255,255,255,.85)',k,rise:0,shadow:!v85LB()})}
/* onderschrift (lower third): lijntje, groep, naam, wetenschappelijke naam, plek en moment, notitie.
   o.size = titelgrootte (rest schaalt mee), o.bottom = onderkant, o.x/o.maxW = kader, o.right = rechts uitlijnen */
function v85Lower(ctx,seg,t,o={}){const {W,H}=V85,P=v85P(),ts=o.size??(P?64:74),f=ts/74,X=o.x??(P?72:110),maxW=o.maxW??(P?W-2*X:Math.min(1150,W*.62)),right=!!o.right,ax=right?(o.x!=null?X+maxW:W-X):X,al=right?'right':'left';
  v85Font(ctx,Math.round(30*f),500,true);const note=seg.note?v85Wrap(ctx,`“${seg.note}”`,maxW,P?3:2):[];
  const sub=!!(seg.sci||seg.en),hasMeta=!!seg.meta,lh=Math.round(42*f),hl=!!seg.hl&&seg.chance>0,acc=seg.hl?V85_C.sun:V85_C.mint;
  const h=Math.round(30*f)+ts+(sub?lh:0)+(hasMeta?lh:0)+(hl?lh:0)+note.length*lh;let y=(o.bottom??(H-v85LB()-(P?170:64)))-h;
  const k0=v85E(v85At(t,.05,.6));if(k0>0){ctx.save();ctx.fillStyle=acc;const lw=Math.round((seg.hl?110:64)*f)*k0;ctx.fillRect(right?ax-lw:ax,y-Math.round(8*f),lw,Math.max(3,Math.round(4*f)));ctx.restore()}
  y+=Math.round(26*f);const ico=seg.cat&&V85_ICO[seg.cat+'|'+(seg.hl?'s':'m')],isz=Math.round(34*f),ik=v85E(v85At(t,.15,.5));let lx=ax;
  if(ico&&ik>0){v85Font(ctx,Math.round(21*f),800);v85Sp(ctx,Math.round(5*f));const lw0=Math.min(maxW,ctx.measureText(String(seg.label||'').toUpperCase()).width);v85Sp(ctx,0);
    const ix=right?ax-lw0-isz-Math.round(10*f):ax;ctx.save();ctx.globalAlpha=ik;ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=10;ctx.drawImage(ico,ix,y-isz+Math.round(6*f),isz,isz);ctx.restore();if(!right)lx=ax+isz+Math.round(10*f)}
  if(seg.label)v85Txt(ctx,seg.label,lx,y,{size:Math.round(21*f),weight:800,spacing:Math.round(5*f),upper:true,color:acc,align:al,k:v85At(t,.15,.5),rise:10,shadow:true,maxW:maxW-(ico?isz+10:0)});
  y+=Math.round(ts*.98);v85Txt(ctx,seg.title,ax,y,{size:ts,weight:800,align:al,maxW,shrink:true,k:v85At(t,.25,.5),rise:18,shadow:true});
  if(sub){y+=lh;const kk=v85At(t,.4,.5),sz=Math.round(30*f);
    if(right){const w=v85Txt(ctx,seg.en,ax,y,{size:sz,weight:500,align:'right',color:'rgba(255,255,255,.9)',k:kk,shadow:true,maxW:maxW*.5});v85Txt(ctx,seg.sci+(seg.en?' · ':''),ax-w,y,{size:sz,weight:500,italic:true,align:'right',color:V85_C.mint,k:kk,shadow:true,maxW:maxW-w})}
    else{const w=v85Txt(ctx,seg.sci,ax,y,{size:sz,weight:500,italic:true,color:V85_C.mint,k:kk,shadow:true,maxW:maxW*.6});v85Txt(ctx,(seg.sci?' · ':'')+seg.en,ax+w,y,{size:sz,weight:500,color:'rgba(255,255,255,.9)',k:kk,shadow:true,maxW:maxW-w})}}
  if(hasMeta){y+=lh;v85Txt(ctx,seg.meta,ax,y,{size:Math.round(26*f),weight:500,align:al,color:'rgba(255,255,255,.78)',k:v85At(t,.5,.5),shadow:true,maxW})}
  /* v9 · hoogtepunt: kansschaal (4 streepjes, gevuld tot de kans) met het label uit de app */
  if(hl){y+=lh;const kk=v85E(v85At(t,.6,.5)),bw=Math.round(30*f),bh=Math.max(5,Math.round(8*f)),gap=Math.round(6*f),tot=4*bw+3*gap,x0=right?ax-tot:ax;
    ctx.save();ctx.globalAlpha=kk;for(let i=0;i<4;i++){v85Round(ctx,x0+i*(bw+gap),y-bh-Math.round(6*f),bw,bh,bh/2);ctx.fillStyle=i<seg.chance?V85_C.sun:'rgba(255,255,255,.25)';ctx.fill()}ctx.restore();
    const lbl=(typeof V80_CH!=='undefined'&&V80_CH[seg.chance])||'';v85Txt(ctx,lbl,right?x0-Math.round(16*f):x0+tot+Math.round(16*f),y,{size:Math.round(26*f),weight:700,align:al,color:V85_C.sun,k:kk,rise:0,shadow:true})}
  note.forEach((l,i)=>{y+=lh;v85Txt(ctx,l,ax,y,{size:Math.round(30*f),weight:500,italic:true,align:al,k:v85At(t,.7+i*.12,.5),shadow:true})})}
function v85Credit(ctx,txt,t){if(!txt)return;const {W,H}=V85,lb=v85LB();v85Txt(ctx,txt,W-64,lb?H-lb/2+7:H-34,{size:lb?18:20,weight:500,color:'rgba(255,255,255,.62)',align:'right',maxW:W*.55,k:v85At(t,.6,.5),rise:0,shadow:!lb})}
/* v9.1 · pictogram per groep (zelfde lijniconen als in de app), één keer als beeld geladen */
const V85_ICO={};
async function v85LoadIcons(){if(typeof V47_CAT_ICON==='undefined')return;for(const [c,svg] of Object.entries(V47_CAT_ICON))for(const [k,col] of [['m',V85_C.mint],['s',V85_C.sun]]){const key=c+'|'+k;if(V85_ICO[key])continue;
  const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="96" height="96" fill="none" stroke="${col}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`);
  try{await im.decode();V85_ICO[key]=im}catch(e){}}}
function v85Shade(ctx,x,y,w,h,from=.45,a=.7){const g=ctx.createLinearGradient(0,y+h*from,0,y+h);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${a})`);ctx.fillStyle=g;ctx.fillRect(x,y+h*from,w,h*(1-from))}
/* ---------- v8.10: onderwerp, kleurlook, camerabewegingen ---------- */
/* onderwerp vinden: waar de foto het scherpst is (bij wildlife: het dier; de achtergrond is vaag) */
function v85Focus(img){try{const w=96,iw=v85IW(img),ih=v85IH(img),h=Math.max(8,Math.round(w*ih/iw)),c=document.createElement('canvas');c.width=w;c.height=h;
  const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,w,h);const d=x.getImageData(0,0,w,h).data,g=new Float32Array(w*h),e=new Float32Array(w*h);
  for(let i=0;i<w*h;i++)g[i]=.299*d[i*4]+.587*d[i*4+1]+.114*d[i*4+2];
  for(let y=1;y<h-1;y++)for(let xx=1;xx<w-1;xx++){const i=y*w+xx;e[i]=Math.abs(4*g[i]-g[i-1]-g[i+1]-g[i-w]-g[i+w])}
  const th=Array.from(e).sort((a,b)=>a-b)[Math.floor(w*h*.88)];let sw=0,sx=0,sy=0;
  for(let y=1;y<h-1;y++)for(let xx=1;xx<w-1;xx++){const v=e[y*w+xx]-th;if(v>0){sw+=v;sx+=v*xx;sy+=v*y}}
  if(!sw)return {x:.5,y:.45};const fx=sx/sw/w,fy=sy/sw/h;return {x:.5+(fx-.5)*.85,y:Math.min(.47,.48+(fy-.48)*.85)}}catch(e){return {x:.5,y:.45}}}
/* beeld vult een vlak; het onderwerp komt op een derde-lijn in plaats van precies in het midden */
function v85CoverAt(ctx,img,rx,ry,rw,rh,z,f,sh){const iw=v85IW(img),ih=v85IH(img),r=Math.max(rw/iw,rh/ih)*z,w=iw*r,h=ih*r;
  const tx=rx+rw*(.5+(f.x-.5)*.4)+(sh?.x||0),ty=ry+rh*(.5+(f.y-.5)*.4)+(sh?.y||0);
  const x=Math.min(rx,Math.max(rx+rw-w,tx-f.x*w)),y=Math.min(ry,Math.max(ry+rh-h,ty-f.y*h));ctx.drawImage(img,x,y,w,h)}
/* camerabewegingen naar het onderwerp: inzoomen, uitzoomen, pannen, omhoog */
function v85Cam(i,p){switch(i%4){case 0:return {z:1+.14*p,shift:{x:0,y:0}};case 1:return {z:1.15-.13*p,shift:{x:0,y:0}};
  case 2:return {z:1.12,shift:{x:-110+170*p,y:0}};default:return {z:1.1+.06*p,shift:{x:0,y:70-100*p}}}}
/* vaste kleurlook: warm, iets meer contrast, koele randen */
function v85Look(ctx,x=0,y=0,w=V85.W,h=V85.H){ctx.save();ctx.globalCompositeOperation='soft-light';ctx.fillStyle='rgba(255,186,118,.30)';ctx.fillRect(x,y,w,h);
  const g=ctx.createRadialGradient(x+w/2,y+h/2,Math.min(w,h)*.3,x+w/2,y+h/2,Math.max(w,h)*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,40,32,.6)');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);ctx.restore()}
function v85BgCache(res,dark){const {W,H}=V85;if(!res.bgc&&res.blur){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d',{alpha:false});x.imageSmoothingQuality='high';x.drawImage(res.blur,-80,-50,W+160,H+100);x.fillStyle=`rgba(2,10,7,${dark})`;x.fillRect(0,0,W,H);res.bgc=c}return res.bgc}
function v85ClipT(seg,t){const d=Math.max(.05,seg.clip.dur);let c=t;if(seg.slow){const a=d*.4;c=t<a?t:a+(t-a)/2}return Math.min(c,d-.03)}
const v85P=()=>V85.H>V85.W;
function v85Rects(lay,A){const W=A?A.w:V85.W,H=A?A.h:V85.H,ox=A?A.x:0,oy=A?A.y:0;return v85Rects0(lay,W,H).map(r=>({...r,x:r.x+ox,y:r.y+oy}))}
function v85Rects0(lay,W,H){const G=10;if(v85P()){if(lay==='duo')return [{x:0,y:0,w:W,h:H/2-G/2},{x:0,y:H/2+G/2,w:W,h:H/2-G/2}];
    if(lay==='trio'){const h=(H-2*G)/3;return [0,1,2].map(i=>({x:0,y:i*(h+G),w:W,h}))}
    if(lay==='hero'){const h1=Math.round(H*.6),w=(W-G)/2;return [{x:0,y:0,w:W,h:h1},{x:0,y:h1+G,w,h:H-h1-G},{x:w+G,y:h1+G,w,h:H-h1-G}]}}if(lay==='duo')return [{x:0,y:0,w:W/2-G/2,h:H},{x:W/2+G/2,y:0,w:W/2-G/2,h:H}];
  if(lay==='trio'){const w=(W-2*G)/3;return [0,1,2].map(i=>({x:i*(w+G),y:0,w,h:H}))}
  if(lay==='hero'){const w1=Math.round(W*.6);return [{x:0,y:0,w:w1,h:H},{x:w1+G,y:0,w:W-w1-G,h:H/2-G/2},{x:w1+G,y:H/2+G/2,w:W-w1-G,h:H/2-G/2}]}
  const w=(W-G)/2,h=(H-G)/2;return [{x:0,y:0,w,h},{x:w+G,y:0,w,h},{x:0,y:h+G,w,h},{x:w+G,y:h+G,w,h}]}
function v85Pill(ctx,txt,x,y,t,st){const kk=v85At(t,st,.4);if(kk<=0)return 0;v85Font(ctx,22,800);v85Sp(ctx,4);const lw=ctx.measureText(txt.toUpperCase()).width;v85Sp(ctx,0);
  ctx.save();ctx.globalAlpha=v85E(kk);v85Round(ctx,x,y-6,lw+30,38,19);ctx.fillStyle=V85_C.leaf;ctx.fill();ctx.restore();v85Txt(ctx,txt,x+15,y+21,{size:22,weight:800,spacing:4,upper:true,k:kk,rise:0});return lw+30}
/* gesplitste opmaak: tekst groot links, beeld rechts */
function v85SplitText(ctx,seg,t){const {W,H}=V85,X=110,maxW=Math.round(W*.4)-170;let y=H*.3;{const k0=v85E(v85At(t,.05,.6));ctx.fillStyle=V85_C.mint;ctx.fillRect(X,y-8,64*k0,4);v85Txt(ctx,seg.label,X,y+26,{size:21,weight:800,spacing:5,upper:true,color:V85_C.mint,k:v85At(t,.15,.5),rise:10})}y+=110;
  v85Font(ctx,84,800);const tl=v85Wrap(ctx,seg.title,maxW,2);tl.forEach((l,i)=>{v85Txt(ctx,l,X,y,{size:84,weight:800,k:v85At(t,.3+i*.1,.5),maxW});y+=92});
  if(seg.en)v85Txt(ctx,seg.en,X,y+6,{size:32,weight:500,color:'rgba(255,255,255,.92)',k:v85At(t,.5,.5),maxW});if(seg.en)y+=46;
  if(seg.sci){v85Txt(ctx,seg.sci,X,y+6,{size:32,weight:500,italic:true,color:V85_C.mint,k:v85At(t,.55,.5),maxW});y+=46}
  ctx.fillStyle=V85_C.mint;ctx.fillRect(X,y+14,Math.min(maxW,180)*v85E(v85At(t,.6,.6)),4);y+=62;
  if(seg.meta){v85Font(ctx,28,500);v85Wrap(ctx,seg.meta,maxW,2).forEach((l,i)=>{v85Txt(ctx,l,X,y,{size:28,weight:500,color:'rgba(255,255,255,.78)',k:v85At(t,.7,.5)});y+=40})}
  if(seg.note){y+=14;v85Font(ctx,30,500,true);v85Wrap(ctx,`“${seg.note}”`,maxW,4).forEach((l,i)=>{v85Txt(ctx,l,X,y,{size:30,weight:500,italic:true,k:v85At(t,.85+i*.1,.5)});y+=42})}}
function v85Draw(ctx,seg,res,t){const {W,H}=V85,p=seg.dur?Math.min(1,t/seg.dur):0,img=res.img;
  ctx.globalAlpha=1;ctx.fillStyle=V85_C.deep;ctx.fillRect(0,0,W,H);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(seg.k==='cold'){const imgs=res.imgs||[],n=Math.max(1,imgs.length),sl=seg.dur/n,j=Math.min(n-1,Math.floor(t/sl)),im=imgs[j],q=(t-j*sl)/sl;res.foci??=[];
    if(im){const f0=res.foci[j]??=v85Focus(im);v85CoverAt(ctx,im,0,0,W,H,1.06-.05*q,{x:f0.x,y:Math.min(f0.y,.42)},null);v85Look(ctx)}v85Bars(ctx);return}
  if(seg.k==='sp'){let lay=img?(seg.lay||'frame'):'frame';if(v85P()&&lay==='split')lay=seg.own?'full':'frame';const f=img?(res.focus??=(seg.clip?{x:.5,y:.45}:v85Focus(img))):{x:.5,y:.45},cam=v85Cam(seg.i||0,v85E(p*.9+.1));
    const frz=seg.clip&&seg.freezeAt!=null&&t>=seg.freezeAt,punch=frz?1+.035*v85E(v85At(t,seg.freezeAt,.5)):1;
    if(img&&lay==='full'){v85CoverAt(ctx,img,0,0,W,H,(seg.clip?1+(cam.z-1)*.35:cam.z)*punch,f,seg.clip?null:cam.shift);v85Look(ctx)}
    else if(img&&lay==='split'){ctx.drawImage(v85BgCache(res,.62),0,0);const sx=Math.round(W*.4);ctx.save();ctx.beginPath();ctx.rect(sx,0,W-sx,H);ctx.clip();
      v85CoverAt(ctx,img,sx,0,W-sx,H,cam.z*punch,f,{x:cam.shift.x*.5,y:cam.shift.y*.5});v85Look(ctx,sx,0,W-sx,H);ctx.restore();
      const eg=ctx.createLinearGradient(sx,0,sx+180,0);eg.addColorStop(0,'rgba(4,16,11,.85)');eg.addColorStop(1,'rgba(4,16,11,0)');ctx.fillStyle=eg;ctx.fillRect(sx,0,180,H)}
    else if(img){const mv=v85Moves(seg.i||0,v85E(p*.9+.1));ctx.drawImage(v85BgCache(res,.5),0,0);
      const lb=v85LB();let r=Math.min((W-(lb?160:0))/v85IW(img),(H-2*lb-(lb?60:0))/v85IH(img));if(seg.cap)r=Math.min(r,1.3);r*=(seg.clip?1+(mv.z-1)*.5:mv.z)*punch;const w=v85IW(img)*r,h=v85IH(img)*r,x=(W-w)/2+mv.dx,y=(H-h)/2+mv.dy;
      ctx.save();ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=60;ctx.shadowOffsetY=18;v85Round(ctx,x,y,w,h,18);ctx.fillStyle='#000';ctx.fill();ctx.shadowColor='transparent';ctx.clip();ctx.drawImage(img,x,y,w,h);v85Look(ctx,x,y,w,h);ctx.restore();
      ctx.save();v85Round(ctx,x,y,w,h,18);ctx.lineWidth=2;ctx.strokeStyle='rgba(255,255,255,.18)';ctx.stroke();ctx.restore()}
    else v85Bg(ctx,res,t,.2);
    if(frz){const fa=1-v85At(t,seg.freezeAt,.3);if(fa>0){ctx.fillStyle=`rgba(255,255,255,${.5*fa})`;ctx.fillRect(0,0,W,H)}}
    if(lay!=='split')v85Shade(ctx,0,0,W,H,.45,.68);
    if(!v85LB()){const tg=ctx.createLinearGradient(0,0,0,220);tg.addColorStop(0,'rgba(0,0,0,.5)');tg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=tg;ctx.fillRect(0,0,W,220)}
    v85Bars(ctx);v85Hud(ctx,seg,t);
    if(lay==='split')v85SplitText(ctx,seg,t);else v85Lower(ctx,seg,t,{right:lay==='full'&&f.x<.42});
    v85Credit(ctx,seg.credit,t);
    return}
  if(seg.k==='pair'){ctx.fillStyle='#050d0a';ctx.fillRect(0,0,W,H);const imgs=res.imgs||[],P=v85P(),lb=v85LB();res.foci??=[];
    v85Rects('duo',{x:0,y:lb,w:W,h:H-2*lb}).forEach((r,j)=>{const im=imgs[j],pn=seg.panels[j];const k=v85E(v85At(t,.22*j,.6));if(k<=0||!pn)return;
      const off=P?{x:0,y:(1-k)*(j?70:-70)}:{x:(1-k)*(j?90:-90),y:0};ctx.save();ctx.beginPath();ctx.rect(r.x,r.y,r.w,r.h);ctx.clip();ctx.globalAlpha=k;
      if(im){v85CoverAt(ctx,im,r.x+off.x,r.y+off.y,r.w,r.h,1.03+.06*p,res.foci[j]??=v85Focus(im),{x:(j?-1:1)*16*p,y:0});v85Look(ctx,r.x,r.y,r.w,r.h)}
      else{ctx.fillStyle='#143a2b';ctx.fillRect(r.x,r.y,r.w,r.h)}
      v85Shade(ctx,r.x,r.y,r.w,r.h,.5,.75);ctx.restore();
      v85Lower(ctx,pn,t-.3-.22*j,{x:r.x+(P?56:48),maxW:r.w-(P?112:96),bottom:r.y+r.h-(P?48:44),size:P?56:50});
      if(pn.credit)v85Txt(ctx,pn.credit,r.x+r.w-20,r.y+r.h-16,{size:15,weight:500,align:'right',color:'rgba(255,255,255,.6)',maxW:r.w*.6,k:v85At(t,.8,.4),rise:0})});
    v85Bars(ctx);if(!lb){const tg=ctx.createLinearGradient(0,0,0,200);tg.addColorStop(0,'rgba(0,0,0,.5)');tg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=tg;ctx.fillRect(0,0,W,200)}v85Hud(ctx,seg,t);return}
  if(seg.k==='stay'&&seg.srcs||seg.k==='collage'){ctx.fillStyle='#050d0a';ctx.fillRect(0,0,W,H);const imgs=res.imgs||[],lb=v85LB(),labels=seg.labels||[];res.foci??=[];
    v85Rects(seg.lay,{x:0,y:lb,w:W,h:H-2*lb}).forEach((r,j)=>{const im=imgs[j];if(!im)return;const k=v85E(v85At(t,.16*j,.7)),dir=j%2?1:-1;
      const off=seg.lay==='trio'?{x:0,y:dir*(1-k)*H*.3}:seg.lay==='duo'?{x:dir*(1-k)*W*.2,y:0}:{x:(1-k)*(j%2?70:-70),y:(1-k)*(j<2?-50:50)};
      ctx.save();ctx.beginPath();ctx.rect(r.x,r.y,r.w,r.h);ctx.clip();ctx.globalAlpha=k;v85CoverAt(ctx,im,r.x+off.x,r.y+off.y,r.w,r.h,1.03+.06*p,res.foci[j]??=v85Focus(im),{x:(j%2?-1:1)*18*p,y:0});v85Look(ctx,r.x,r.y,r.w,r.h);
      if(labels[j]){v85Shade(ctx,r.x,r.y,r.w,r.h,.62,.7);ctx.restore();v85Txt(ctx,labels[j],r.x+30,r.y+r.h-28,{size:28,weight:700,color:'#fff',maxW:r.w-56,k:v85At(t,.5+.16*j,.5),rise:8,shadow:true})}else ctx.restore()});
    const lbl=!labels.some(Boolean);if(lbl){v85Shade(ctx,0,0,W,H,.55,.7);v85Lower(ctx,{label:seg.label,title:seg.title,meta:seg.meta},t-.4,{size:v85P()?60:64})}
    v85Bars(ctx);v85Hud(ctx,seg,t);return}
  if(seg.k==='collage'){ctx.fillStyle='#050d0a';ctx.fillRect(0,0,W,H);const imgs=res.imgs||[];res.foci??=[];
    v85Rects(seg.lay).forEach((r,j)=>{const im=imgs[j];if(!im)return;const k=v85E(v85At(t,.14*j,.7)),dir=j%2?1:-1;
      const off=seg.lay==='trio'?{x:0,y:dir*(1-k)*H*.55}:seg.lay==='duo'?{x:dir*(1-k)*W*.45,y:0}:{x:(1-k)*(j%2?90:-90),y:(1-k)*(j<2?-70:70)};
      ctx.save();ctx.globalAlpha=k;ctx.beginPath();ctx.rect(r.x+off.x,r.y+off.y,r.w,r.h);ctx.clip();v85CoverAt(ctx,im,r.x+off.x,r.y+off.y,r.w,r.h,1.03+.07*p,res.foci[j]??=v85Focus(im),{x:(j%2?-1:1)*24*p,y:0});ctx.restore()});
    v85Look(ctx);const tg=ctx.createLinearGradient(0,0,0,220);tg.addColorStop(0,'rgba(0,0,0,.5)');tg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=tg;ctx.fillRect(0,0,W,220);
    const bg=ctx.createLinearGradient(0,H-220,0,H);bg.addColorStop(0,'rgba(0,0,0,0)');bg.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=bg;ctx.fillRect(0,H-220,W,220);
    v85Hud(ctx,seg,t);v85Pill(ctx,seg.label,96,H-112,t,.3);return}
  if(seg.k==='credits'){const g0=ctx.createLinearGradient(0,0,W,H);g0.addColorStop(0,'#0c2a1f');g0.addColorStop(1,V85_C.deep);ctx.fillStyle=g0;ctx.fillRect(0,0,W,H);v85Flies(ctx,t+80,28,.5);
    const speed=(seg.height+H)/seg.dur;let y=H+90-t*speed;
    v85Txt(ctx,'Gezien op deze reis',W/2,y,{size:56,weight:800,align:'center',rise:0});y+=110;
    seg.groups.forEach(g=>{if(y>-80&&y<H+80)v85Txt(ctx,`${g.label} · ${g.names.length}`,W/2,y,{size:28,weight:800,spacing:6,upper:true,color:V85_C.mint,align:'center',rise:0});y+=60;
      g.names.forEach((nm,i)=>{const row=Math.floor(i/3),yy=y+row*50,cols=Math.min(3,g.names.length-row*3);if(yy<-60||yy>H+60)return;v85Txt(ctx,nm.nl,W/2+(i%3-(cols-1)/2)*(v85P()?330:560),yy,{size:v85P()?26:32,weight:nm.own?700:400,align:'center',color:nm.own?'#fff':'rgba(255,255,255,.66)',rise:0,maxW:v85P()?310:520})});
      y+=Math.ceil(g.names.length/3)*50+30});
    if(seg.credits.length){y+=40;if(y>-80&&y<H+80)v85Txt(ctx,"Voorbeeldfoto's",W/2,y,{size:28,weight:800,spacing:6,upper:true,color:V85_C.mint,align:'center',rise:0});y+=60;
      seg.credits.forEach(c=>{if(y>-40&&y<H+40)v85Txt(ctx,c,W/2,y,{size:22,weight:500,align:'center',color:'rgba(255,255,255,.62)',rise:0,maxW:W-240});y+=34})}
    if(seg.by){y+=60;if(y>-80&&y<H+80){v85Txt(ctx,'Gefilmd en gefotografeerd door',W/2,y,{size:28,weight:800,spacing:6,upper:true,color:V85_C.mint,align:'center',rise:0});v85Txt(ctx,seg.by,W/2,y+64,{size:44,weight:700,align:'center',rise:0,maxW:W-200})}}
    const ft=ctx.createLinearGradient(0,0,0,200);ft.addColorStop(0,'rgba(6,22,15,1)');ft.addColorStop(1,'rgba(6,22,15,0)');ctx.fillStyle=ft;ctx.fillRect(0,0,W,200);
    const fb=ctx.createLinearGradient(0,H-200,0,H);fb.addColorStop(0,'rgba(6,22,15,0)');fb.addColorStop(1,'rgba(6,22,15,1)');ctx.fillStyle=fb;ctx.fillRect(0,H-200,W,200);
    v85Txt(ctx,'Vet: met eigen foto of video',W/2,H-40,{size:20,weight:500,align:'center',color:'rgba(255,255,255,.55)',rise:0});return}
  if(seg.k==='mosaic'){ctx.fillStyle='#050d0a';ctx.fillRect(0,0,W,H);const src=res.imgs||[],n=src.length,cols=Math.max(1,Math.ceil(Math.sqrt(n*W/H))),rows=Math.ceil(n/cols),tw=W/cols,th=H/rows,ims=n?Array.from({length:cols*rows},(_,i)=>src[i%n]):[];
    ims.forEach((im,i)=>{const c=i%cols,r=Math.floor(i/cols),dist=Math.hypot(c+.5-cols/2,r+.5-rows/2)/Math.hypot(cols/2,rows/2),k=v85E(v85At(t,dist*1.3,.6));if(k<=0)return;
      ctx.save();ctx.globalAlpha=k;ctx.beginPath();ctx.rect(c*tw+2,r*th+2,tw-4,th-4);ctx.clip();v85CoverAt(ctx,im,c*tw,r*th,tw,th,1.15-.12*k,{x:.5,y:.45});ctx.restore()});
    v85Look(ctx);const dk=v85E(v85At(t,2,1));ctx.fillStyle=`rgba(4,16,11,${.55*dk})`;ctx.fillRect(0,0,W,H);
    v85Letters(ctx,seg.title,W/2,H/2+20,{size:140,weight:800,align:'center',stagger:.05,rise:50,maxW:W-140},t,2.2);v85Txt(ctx,seg.sub,W/2,H/2+110,{size:40,weight:600,align:'center',k:v85At(t,3,.6)});return}
  if(seg.k==='mood'||seg.k==='stay'){const mv=v85Moves(seg.i||0,v85E(p*.9+.1));
    if(img){if(Math.abs(Math.log((v85IW(img)/v85IH(img))/(W/H)))<.45){v85CoverAt(ctx,img,0,0,W,H,mv.z+.04,res.focus??=v85Focus(img),{x:mv.dx,y:mv.dy});v85Look(ctx)}
      else{if(!res.bgc){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d',{alpha:false});x.imageSmoothingQuality='high';x.drawImage(res.blur,-80,-50,W+160,H+100);x.fillStyle='rgba(2,10,7,.45)';x.fillRect(0,0,W,H);res.bgc=c}
        ctx.drawImage(res.bgc,0,0);const lb=v85LB(),r=Math.min((W-(lb?160:0))/v85IW(img),(H-2*lb-(lb?60:0))/v85IH(img))*mv.z,w=v85IW(img)*r,h=v85IH(img)*r,x=(W-w)/2+mv.dx,y=(H-h)/2+mv.dy;
        ctx.save();ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=60;ctx.shadowOffsetY=18;v85Round(ctx,x,y,w,h,18);ctx.fillStyle='#000';ctx.fill();ctx.shadowColor='transparent';ctx.clip();ctx.drawImage(img,x,y,w,h);ctx.restore()}}
    else v85Bg(ctx,res,t,.2);
    const tg=ctx.createLinearGradient(0,0,0,220);tg.addColorStop(0,'rgba(0,0,0,.5)');tg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=tg;ctx.fillRect(0,0,W,220);
    v85Shade(ctx,0,0,W,H,.5,.65);
    v85Bars(ctx);v85Hud(ctx,seg,t);v85Lower(ctx,{label:seg.label,title:seg.title||'',meta:seg.meta},t,{size:v85P()?60:66});return}
  /* v8.15 · hoofdstukkaart: groot dagnummer, regio, datum, overnachting, kaart met de route tot hier */
  if(seg.k==='day'){v85Bg(ctx,res,t,.8);
    const P=v85P(),ar=(V51_MAP?.W||600)/(V51_MAP?.H||575),mapH=P?Math.round(H*.36):780,mx=P?Math.round((W-mapH*ar)/2):W-mapH*ar-110,my=P?Math.round(H*.56):(H-mapH)/2+10;v85MapZoom(ctx,mx,my,mapH,t,seg.stop??0,{start:.3});
    const X=P?84:150,tmax=P?W-2*X:mx-X-60,top=P?Math.round(H*.13):Math.round(H*.2);
    /* groot dagnummer met "van 23" ernaast */
    const num=v85Pad(seg.day),nk=v85At(t,.1,.6);v85Font(ctx,P?200:230,800);const nw=ctx.measureText(num).width,ny=top+(P?170:196);
    v85Txt(ctx,num,X,ny,{size:P?200:230,weight:800,color:V85_C.mint,k:nk,rise:30});
    v85Txt(ctx,'Dag',X+nw+28,ny-(P?112:130),{size:P?26:28,weight:800,spacing:8,upper:true,color:'rgba(255,255,255,.9)',k:v85At(t,.3,.5),rise:10});
    v85Txt(ctx,`van ${seg.of||S.length}`,X+nw+28,ny-(P?70:82),{size:P?26:28,weight:600,color:'rgba(255,255,255,.6)',k:v85At(t,.38,.5),rise:10});
    let y=ny+(P?110:120);const tw=v85Letters(ctx,seg.title,X,y,{size:seg.title.length>18?(P?64:78):(P?80:96),weight:800,maxW:tmax},t,.45);
    ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(X,y+28,tmax*v85E(v85At(t,.7,.8)),1.5);ctx.fillStyle=V85_C.mint;ctx.fillRect(X,y+27,Math.min(tw,140)*v85E(v85At(t,.7,.6)),4);
    y+=86;v85Txt(ctx,seg.sub,X,y,{size:P?36:40,weight:600,color:'rgba(255,255,255,.95)',k:v85At(t,.85,.5),maxW:tmax});
    if(seg.stay){y+=P?54:58;const kk=v85At(t,1,.5),w=v85Txt(ctx,'Overnachting',X,y,{size:P?22:24,weight:800,spacing:4,upper:true,color:V85_C.mint,k:kk,rise:10});v85Txt(ctx,seg.stay,X+w+18,y,{size:P?30:32,weight:600,color:'#fff',k:kk,rise:10,maxW:tmax-w-18})}
    y+=P?52:56;v85Txt(ctx,seg.meta,X,y,{size:P?26:28,weight:500,color:'rgba(255,255,255,.7)',k:v85At(t,1.15,.5),maxW:tmax});
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
  const P=v85P(),ar=(V51_MAP?.W||600)/(V51_MAP?.H||575),mapH=P?Math.round(H*.34):760,mx=P?Math.round((W-mapH*ar)/2):W-mapH*ar-80,my=P?H-mapH-170:(H-mapH)/2;v85Map(ctx,mx,my,mapH,t,V51_STOPS.length-1,{start:.2,all:true});
  const X=P?90:130;v85Txt(ctx,seg.label,X,250,{size:30,weight:800,spacing:8,upper:true,color:V85_C.mint,k:v85At(t,.1,.5)});
  v85Letters(ctx,seg.title,X,380,{size:140,weight:800,stagger:.06,rise:60},t,.3);
  (seg.cats||[]).forEach((c,i)=>{const kk=v85At(t,.9+i*.15,.5),bx=X+(i%3)*250,by=470+Math.floor(i/3)*170;if(kk<=0)return;ctx.save();ctx.globalAlpha=v85E(kk);v85Round(ctx,bx,by+(1-v85E(kk))*30,226,146,20);ctx.fillStyle='rgba(255,255,255,.08)';ctx.fill();ctx.strokeStyle='rgba(155,230,174,.35)';ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
    const val=Math.round(c.n*v85E(v85At(t,1+i*.15,1.4)));v85Txt(ctx,String(val),bx+24,by+76+(1-v85E(kk))*30,{size:64,weight:800,k:kk,rise:0});v85Txt(ctx,c.label,bx+26,by+118+(1-v85E(kk))*30,{size:24,weight:600,color:V85_C.mint,k:kk,rise:0})});
  const rows=Math.ceil((seg.cats||[]).length/3);v85Txt(ctx,seg.meta,X,470+rows*170+40,{size:32,weight:500,color:'rgba(255,255,255,.85)',k:v85At(t,1.6,.6),maxW:P?W-180:mx-X-20,shrink:true});
  if(seg.small)v85Txt(ctx,seg.small,X,H-70,{size:22,weight:500,color:'rgba(255,255,255,.6)',k:v85At(t,2,.6),rise:0,maxW:W-260})}

async function v85Img(src){if(!src)return null;const im=new Image();im.decoding='async';im.src=src;try{await im.decode()}catch(e){return null}
  try{return await createImageBitmap(im)}catch(e){return im}}
/* v8.16 · eigen video vloeiend: het MP4-bestand uitlezen (demux) en beeld voor beeld decoderen met VideoDecoder.
   Zoeken per beeld in een <video> komt op de iPhone vaak op een naburig beeld uit (haperen); dat blijft alleen de terugval. */
function v85Demux(buf){try{const dv=new DataView(buf),u8=new Uint8Array(buf),E=buf.byteLength;
  const boxes=(s0,e0)=>{const out=[];let q=s0;while(q+8<=e0){let size=dv.getUint32(q),h=8;const type=String.fromCharCode(u8[q+4],u8[q+5],u8[q+6],u8[q+7]);
      if(size===1){size=Number(dv.getBigUint64(q+8));h=16}else if(size===0)size=e0-q;if(size<8)break;out.push({type,d:q+h,e:Math.min(e0,q+size)});q+=size}return out};
  const f=(l,t)=>l.find(b=>b.type===t),moov=f(boxes(0,E),'moov');if(!moov)return null;
  for(const trak of boxes(moov.d,moov.e).filter(b=>b.type==='trak')){const mdia=f(boxes(trak.d,trak.e),'mdia');if(!mdia)continue;const mb=boxes(mdia.d,mdia.e),hd=f(mb,'hdlr');
    if(!hd||String.fromCharCode(u8[hd.d+8],u8[hd.d+9],u8[hd.d+10],u8[hd.d+11])!=='vide')continue;
    const mdhd=f(mb,'mdhd'),ts=dv.getUint32(mdhd.d+(u8[mdhd.d]?20:12)),minf=f(mb,'minf'),stbl=f(boxes(minf.d,minf.e),'stbl'),sb=boxes(stbl.d,stbl.e);
    const stsd=f(sb,'stsd'),en=boxes(stsd.d+8,stsd.e)[0],w=dv.getUint16(en.d+24),h=dv.getUint16(en.d+26),sub=boxes(en.d+78,en.e);let codec='',desc;
    if(en.type==='avc1'||en.type==='avc3'){const c=f(sub,'avcC');if(!c)return null;desc=u8.slice(c.d,c.e);codec='avc1.'+[1,2,3].map(i=>desc[i].toString(16).padStart(2,'0')).join('')}
    else if(en.type==='vp09'){const c=f(sub,'vpcC');if(!c)return null;const b=c.d+4,pd=x=>String(x).padStart(2,'0');codec=`vp09.${pd(u8[b])}.${pd(u8[b+1])}.${pd(u8[b+2]>>4)}`}
    else return null;
    const tbl=(t,fn)=>{const b=f(sb,t);if(!b)return null;const n=dv.getUint32(b.d+4),o=[];for(let i=0;i<n;i++)o.push(fn(b.d+8,i));return o};
    const stszB=f(sb,'stsz'),fix=dv.getUint32(stszB.d+4),cnt=dv.getUint32(stszB.d+8),sizes=[];for(let i=0;i<cnt;i++)sizes.push(fix||dv.getUint32(stszB.d+12+i*4));
    const co=tbl('stco',(b,i)=>dv.getUint32(b+i*4))||tbl('co64',(b,i)=>Number(dv.getBigUint64(b+i*8))),stsc=tbl('stsc',(b,i)=>[dv.getUint32(b+i*12),dv.getUint32(b+i*12+4)]);
    const stts=tbl('stts',(b,i)=>[dv.getUint32(b+i*8),dv.getUint32(b+i*8+4)]),ctts=tbl('ctts',(b,i)=>[dv.getUint32(b+i*8),dv.getInt32(b+i*8+4)]),stss=tbl('stss',(b,i)=>dv.getUint32(b+i*4));
    const offs=[];for(let ci=0,si=0;ci<co.length;ci++){let per=0;for(const [first,n] of stsc)if(first<=ci+1)per=n;let o=co[ci];for(let k=0;k<per&&si<cnt;k++,si++){offs.push(o);o+=sizes[si]}}
    const dts=[],dur=[];let t=0;for(const [n,d] of stts)for(let k=0;k<n;k++){dts.push(t);dur.push(d);t+=d}
    const cto=[];if(ctts)for(const [n,o] of ctts)for(let k=0;k<n;k++)cto.push(o);const key=stss?new Set(stss.map(x=>x-1)):null;
    const samples=sizes.map((size,i)=>({off:offs[i],size,ts:((dts[i]||0)+(cto[i]||0))/ts,dur:(dur[i]||0)/ts,key:key?key.has(i):true})).filter(x=>x.off!=null&&x.off+x.size<=E);
    return samples.length?{codec,desc,w,h,samples}:null}}catch(e){}return null}
async function v85ClipReader(cl){if(typeof VideoDecoder==='undefined'||!cl?.url)return null;try{const buf=await (await fetch(cl.url)).arrayBuffer(),mp=v85Demux(buf);if(!mp)return null;
  const cfg={codec:mp.codec,codedWidth:mp.w,codedHeight:mp.h,...(mp.desc?{description:mp.desc}:{})};if(!(await VideoDecoder.isConfigSupported(cfg)).supported)return null;
  const c=document.createElement('canvas');c.width=mp.w;c.height=mp.h;const x=c.getContext('2d',{alpha:false}),q=[];let err=null,i=0,flushed=false,shown=-1;
  const dec=new VideoDecoder({output:fr=>q.push(fr),error:e=>{err=e}});dec.configure(cfg);const S0=mp.samples,last=Math.max(...S0.map(s=>s.ts));
  const feed=upto=>{while(i<S0.length&&S0[i].ts<=upto){const s=S0[i++];dec.decode(new EncodedVideoChunk({type:s.key?'key':'delta',timestamp:Math.round(s.ts*1e6),duration:Math.round(s.dur*1e6),data:new Uint8Array(buf,s.off,s.size)}))}};
  const rd={canvas:c,videoWidth:mp.w,videoHeight:mp.h,frames:0,
    async at(t){t=Math.min(t,last);feed(t+.25);let guard=0;
      while(!err&&!(q.length&&q[q.length-1].timestamp/1e6>=t-.001)){if(i>=S0.length&&!flushed){flushed=true;await dec.flush().catch(()=>{});continue}if(flushed&&dec.decodeQueueSize===0)break;await new Promise(r=>setTimeout(r,1));if(++guard>3000)break}
      if(err)throw err;let pick=null;while(q.length&&q[0].timestamp/1e6<=t+.001){if(pick)pick.close();pick=q.shift()}
      if(pick){if(pick.timestamp!==shown){x.drawImage(pick,0,0,mp.w,mp.h);shown=pick.timestamp;rd.frames++}pick.close()}},
    close(){try{dec.close()}catch(e){}q.forEach(fr=>{try{fr.close()}catch(e){}});q.length=0}};
  await rd.at(0);return rd}catch(e){return null}}
/* eigen video als <video>-element (terugval en real-time opname) */
async function v85Vid(cl){const v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.src=cl.url;
  try{await new Promise((res,rej)=>{v.onloadeddata=res;v.onerror=rej;setTimeout(rej,8000)});await v84SeekTo(v,cl.start||0);return v}catch(e){v.removeAttribute('src');return null}}
/* kleine versie voor het mozaïek (geheugen sparen) */
async function v85Thumb(src){const im=await v85Img(src);if(!im)return null;const s=Math.min(1,320/Math.min(v85IW(im),v85IH(im))),c=document.createElement('canvas');c.width=Math.max(1,Math.round(v85IW(im)*s));c.height=Math.max(1,Math.round(v85IH(im)*s));
  c.getContext('2d').drawImage(im,0,0,c.width,c.height);try{im.close&&im.close()}catch(e){}return c}
/* v9 · kleuren gelijktrekken per foto: zwart- en witpunt (deels), helderheid naar een vast midden, witbalans (grijswereld, max. ±8%).
   Mild en begrensd, zodat camera's en voorbeeldfoto's als één geheel ogen; eigen video's blijven zoals ze zijn. */
function v85Grade(img){try{if(!img)return img;const w=v85IW(img),h=v85IH(img);if(!w||!h)return img;
  const sc=document.createElement('canvas');sc.width=96;sc.height=Math.max(8,Math.round(96*h/w));const sx=sc.getContext('2d',{willReadFrequently:true});sx.drawImage(img,0,0,sc.width,sc.height);const d=sx.getImageData(0,0,sc.width,sc.height).data;
  const hist=new Uint32Array(256);let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4){hist[Math.round(.299*d[i]+.587*d[i+1]+.114*d[i+2])]++;r+=d[i];g+=d[i+1];b+=d[i+2];n++}
  const pct=q=>{let a=0;for(let k=0;k<256;k++){a+=hist[k];if(a>=q*n)return k}return 255};const lo=pct(.005),hi=pct(.995),med=pct(.5);
  const black=Math.min(lo,28)*.75,white=255-(255-Math.max(hi,205))*.75,m0=Math.min(.98,Math.max(.02,(med-black)/(white-black)));
  let gm=Math.log(.45)/Math.log(m0);gm=Math.min(1.3,Math.max(.75,gm));gm=1+(gm-1)*.6;const avg=(r+g+b)/3,wb=[r,g,b].map(v=>Math.min(1.08,Math.max(.92,1+(avg/Math.max(1,v)-1)*.35)));
  if(Math.abs(gm-1)<.02&&black<2&&white>253&&wb.every(x=>Math.abs(x-1)<.01))return img;
  const lut=[0,1,2].map(ch=>{const L=new Uint8ClampedArray(256);for(let v=0;v<256;v++){const t=Math.min(1,Math.max(0,(v*wb[ch]-black)/(white-black)));L[v]=Math.round(255*Math.pow(t,gm))}return L});
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);const id=x.getImageData(0,0,w,h),p=id.data;
  for(let i=0;i<p.length;i+=4){p[i]=lut[0][p[i]];p[i+1]=lut[1][p[i+1]];p[i+2]=lut[2][p[i+2]]}x.putImageData(id,0,0);c.graded={gm,black,white,wb};try{img.close&&img.close()}catch(e){}return c}catch(e){return img}}
const v85ImgG=async src=>v85Grade(await v85Img(src));
async function v85Res(seg,rt){if(seg.k==='mosaic'){const imgs=[];for(const s of seg.srcs){const c=await v85Thumb(s);if(c)imgs.push(c)}return {imgs,img:null,blur:null}}
  if(seg.srcs){const imgs=await Promise.all(seg.srcs.map(v85ImgG)),f0=imgs.find(Boolean);return {imgs,img:null,blur:f0?v85Blur(f0):null}}
  if(seg.clip){if(!rt){const rd=await v85ClipReader(seg.clip);if(rd){if(seg.clip.start)await rd.at(seg.clip.start);return {img:rd.canvas,rd,blur:v85Blur(rd.canvas)}}}
    const v=await v85Vid(seg.clip);return {img:v,vid:v,blur:v?v85Blur(v):null}}
  const img=await v85ImgG(seg.src);return {img,blur:img?v85Blur(img):null}}
const v85Free=res=>{try{res?.img?.close&&res.img.close()}catch(e){}try{(res?.imgs||[]).forEach(i=>i&&i.close&&i.close())}catch(e){}if(res?.rd)res.rd.close();if(res?.vid){try{res.vid.pause();res.vid.removeAttribute('src');res.vid.load()}catch(e){}}if(res){res.bgc=null;res.big=null}};

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
async function v85Target(useDisk,fname='reisvideo.mp4'){
  if(useDisk!==false)try{const root=await navigator.storage.getDirectory(),fh=await root.getFileHandle(fname,{create:true});
    if(fh.createWritable){const ws=await fh.createWritable();return {target:new Mp4Muxer.FileSystemWritableFileStreamTarget(ws,{chunkSize:4<<20}),done:async()=>{await ws.close();return await fh.getFile()},cleanup:()=>root.removeEntry(fname).catch(()=>{}),disk:true}}}catch(e){}
  const sink=v85Sink();return {target:new Mp4Muxer.StreamTarget({onData:(d,p)=>sink.write(d,p),chunked:true,chunkSize:4<<20}),done:async()=>sink.blob('video/mp4'),disk:false}}

/* maakt de video; prog(fractie) voor de voortgang; job.cancel=true breekt af */
/* v8.11: staand formaat (1080×1920) en korte versie; afmetingen alleen tijdens het maken omzetten */
async function v85Make(opts={}){const keep=[V85.W,V85.H];if(opts.portrait){V85.W=1080;V85.H=1920}
  try{return await v85MakeCore(opts)}finally{V85.W=keep[0];V85.H=keep[1]}}
async function v85MakeCore(opts={}){const job=opts.job||{},prog=opts.onProgress||(()=>{}),proef=opts.proef??false;
  const segs=opts.segs||(opts.short?v85Short(v85Plan(),proef):v85Segments(v85Plan(),proef));if(!segs.length)throw new Error('Nog niets om te tonen.');
  const {W,H,FPS}=V85,scale=opts.scale||V85.SCALE||1;segs.forEach(s=>s.frames=Math.max(2,Math.round(s.dur*scale*FPS)));
  const total=segs.reduce((n,s)=>n+s.frames,0);
  try{await document.fonts.load(`800 80px ${V85_FONT}`);await document.fonts.load(`500 30px ${V85_FONT}`)}catch(e){}await v85LoadIcons();
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d',{alpha:false});
  const prev=document.createElement('canvas');prev.width=W;prev.height=H;const pctx=prev.getContext('2d',{alpha:false});
  const work=document.createElement('canvas');work.width=W;work.height=H;const wctx=work.getContext('2d',{alpha:false});
  segs.forEach((s,i)=>s.idx=i);const last=segs.length-1;
  /* overgangen: zwart in, schuiven, inzoomen, overvloeien, lichtflits; daarna vignet, korrel en voortgang */
  const frame=(seg,res,f,n)=>{const t=f/FPS/scale,tr=seg.idx===0?'black':(seg.trans||'fade'),T=tr==='cut'?0:Math.max(1,Math.min(seg.frames-1,Math.round((tr==='dip'?1:.5)*FPS*Math.min(1,scale))));
    if(seg.idx>0&&f<T){const k=v85E((f+1)/(T+1));v85Draw(wctx,seg,res,t);
      if(tr==='dip'){if(k<.5){ctx.drawImage(prev,0,0);ctx.fillStyle=`rgba(0,0,0,${k*2})`}else{ctx.drawImage(work,0,0);ctx.fillStyle=`rgba(0,0,0,${(1-k)*2})`}ctx.fillRect(0,0,W,H)}
      else if(tr==='push'){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.drawImage(prev,-W*k,0);ctx.drawImage(work,W*(1-k),0)}
      else if(tr==='iris'){const R=k*Math.hypot(W,H)/2;ctx.drawImage(prev,0,0);ctx.save();ctx.beginPath();ctx.arc(W/2,H/2,R,0,Math.PI*2);ctx.clip();ctx.drawImage(work,0,0);ctx.restore();
        ctx.save();ctx.strokeStyle=`rgba(155,230,174,${.7*(1-k)})`;ctx.lineWidth=6;ctx.beginPath();ctx.arc(W/2,H/2,R,0,Math.PI*2);ctx.stroke();ctx.restore()}
      else if(tr==='wipe'){const x=-H*.45+(W+H*.9)*k;ctx.drawImage(prev,0,0);ctx.save();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(x+H*.45,0);ctx.lineTo(x-H*.45,H);ctx.lineTo(0,H);ctx.closePath();ctx.clip();ctx.drawImage(work,0,0);ctx.restore();
        ctx.save();ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+H*.45,0);ctx.lineTo(x-H*.45,H);ctx.stroke();ctx.restore()}
      else if(tr==='slideup'){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1-k*.6;ctx.drawImage(prev,0,-H*.25*k);ctx.globalAlpha=1;ctx.drawImage(work,0,H*(1-k))}
      else{ctx.drawImage(prev,0,0);ctx.globalAlpha=k;if(tr==='zoom'){const z=1.1-.1*k;ctx.drawImage(work,(W-W*z)/2,(H-H*z)/2,W*z,H*z)}else ctx.drawImage(work,0,0);ctx.globalAlpha=1}
      if(tr==='leak'){const a=Math.sin(Math.PI*k),cx=W*(.15+.7*k),g=ctx.createRadialGradient(cx,H*.4,0,cx,H*.4,W*.7);g.addColorStop(0,`rgba(255,214,140,${.6*a})`);g.addColorStop(.45,`rgba(255,150,70,${.22*a})`);g.addColorStop(1,'rgba(255,120,60,0)');
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore()}}
    else{v85Draw(ctx,seg,res,t);pctx.drawImage(cv,0,0)}
    if(seg.idx===0&&f<T){ctx.fillStyle=`rgba(0,0,0,${1-v85E((f+1)/(T+1))})`;ctx.fillRect(0,0,W,H)}
    const endF=Math.round(FPS*.9*Math.min(1,scale));if(seg.idx===last&&seg.frames-f<=endF){ctx.fillStyle=`rgba(0,0,0,${1-(seg.frames-f-1)/endF})`;ctx.fillRect(0,0,W,H)}
    v85Post(ctx,n,total)};
  const codec=opts.forceRecorder?null:await v85Codec();
  if(!codec)return v85Record(segs,{cv,ctx,pctx,frame,total,prog,job});
  await v85LoadLib();const tgt=await v85Target(opts.disk,opts.portrait?'reisvideo-9x16.mp4':'reisvideo-16x9.mp4');let err=null,done=0;
  const muxer=new Mp4Muxer.Muxer({target:tgt.target,video:{codec:codec.mux,width:W,height:H,frameRate:FPS},fastStart:{expectedVideoChunks:total}});
  const enc=new VideoEncoder({output:(c,m)=>{try{muxer.addVideoChunk(c,m)}catch(e){err=e}},error:e=>{err=e}});enc.configure(codec.cfg);
  let next=v85Res(segs[0]),n=0;const t0=performance.now();
  try{for(let i=0;i<segs.length;i++){const seg=segs[i],res=await next;next=i+1<segs.length?v85Res(segs[i+1]):null;
      for(let f=0;f<seg.frames;f++,n++){if(job.cancel)throw new Error('Geannuleerd');if(err)throw err;
        if(res.rd)await res.rd.at((seg.clip.start||0)+v85ClipT(seg,f/FPS/scale));else if(res.vid)await v84SeekTo(res.vid,seg.clip.start+v85ClipT(seg,f/FPS/scale));
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
  const res=new Map(),get=i=>{if(!res.has(i)){res.set(i,{img:null,blur:null});v85Res(segs[i],true).then(r=>{if(res.has(i))res.set(i,r)})}return res.get(i)};
  res.set(0,await v85Res(segs[0],true));frame(segs[0],res.get(0),0,0);rec.start(1000);
  const starts=[];let acc=0;segs.forEach(s=>{starts.push(acc);acc+=s.frames});
  const t0=performance.now();let i=0;
  await new Promise((ok,fail)=>{const tick=()=>{if(job.cancel){fail(new Error('Geannuleerd'));return}
      const n=Math.floor((performance.now()-t0)/1000*V85.FPS);if(n>=total){ok();return}
      while(i+1<segs.length&&n>=starts[i+1]){v85Free(res.get(i));res.set(i,null);i++}
      if(i+1<segs.length)get(i+1);const rr=get(i);if(rr.vid&&rr.vid.paused&&!rr.started){rr.started=1;rr.vid.currentTime=segs[i].clip.start;rr.vid.play().catch(()=>{})}frame(segs[i],rr,n-starts[i],n);prog(n/total,performance.now()-t0);requestAnimationFrame(tick)};requestAnimationFrame(tick)})
    .catch(e=>{try{rec.stop()}catch(x){}stream.getTracks().forEach(t=>t.stop());throw e});
  rec.stop();await stopped;stream.getTracks().forEach(t=>t.stop());const mime=(rec.mimeType||type||'video/webm').split(';')[0];
  return {blob:new Blob(parts,{type:mime}),type:mime,ext:mime.includes('mp4')?'mp4':'webm',seconds:total/V85.FPS,frames:total,codec:'MediaRecorder',ms:performance.now()-t0}}

/* ---------- scherm ---------- */
let v85Job=null,v85Out=null;
function v85Card(){const plan=v85Plan(),segs=v85Segments(plan,!v85Open()),n=plan.species,nOwn=new Set(plan.items.filter(i=>i.own).map(i=>i.sp)).size,open=true;
  const last=new Date(V85_LAST+'T12:00').toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'});
  const nm=plan.days.reduce((a,d)=>a+d.moods.length,0);
  const what=segs.length?[n?`${n} ${n===1?'soort':'soorten'} · ${nOwn} met eigen foto of video${n-nOwn?` · ${n-nOwn} met voorbeeldfoto`:''}`:'',nm?`${nm} sfeerfoto${nm===1?'':"'s"}`:'',`ca. ${v85Dur(v85Seconds(segs))}`].filter(Boolean).join(' · '):'Nog niets geregistreerd. Markeer soorten als gezien of voeg eigen foto’s of sfeerfoto’s toe.';
  return `<div class="ds-card v85-card"><div><b>Reisvideo</b><p class="ds-meta">${open?'Video van de hele reis, dag voor dag, met naam, groep, plek en moment bij elke soort. Wordt op deze telefoon gemaakt, zonder internet.':`Beschikbaar vanaf ${last} (laatste reisdag). Tot die tijd kun je een proefvideo maken.`}</p><p class="ds-meta v85-what">${what}</p></div>
    ${segs.length?`<button class="ds-btn ${open?'primary':'secondary'}" id="v85go">${'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/></svg>'}${open?'Reisvideo maken':'Proefvideo maken'}</button>`:''}</div>`}
/* per dag in het Wildlife-tabblad: wat de app voor de reisvideo kiest */
function v85DayCard(d){let pd;try{pd=v85Plan().days.find(x=>x.day===d.id)}catch(e){return ''}if(!pd)return '';
  const nc=pd.items.filter(i=>i.clips.length).length,tag=i=>i.clips.length?'video':i.repeat?'opnieuw':i.own?'eigen foto':'voorbeeldfoto';
  return `<details class="ds-card v85-daysel"><summary><b>In de reisvideo</b><span>${pd.items.length} ${pd.items.length===1?'dier':'dieren'} · ${nc} video${nc===1?'':"'s"} · ${pd.moods.length} sfeerfoto${pd.moods.length===1?'':"'s"}</span></summary>
    <ol>${pd.items.map(i=>`<li>${esc(v47Info(i.name).nl)} <small>${tag(i)}</small></li>`).join('')}</ol>
    ${pd.cut.animals||pd.cut.clips?`<p class="ds-meta">Niet in de video: ${[pd.cut.animals?`${pd.cut.animals} ${pd.cut.animals===1?'dier':'dieren'}`:'',pd.cut.clips?`${pd.cut.clips} video${pd.cut.clips===1?'':"'s"}`:''].filter(Boolean).join(' en ')}.</p>`:''}
    <p class="ds-meta">Per dag max. ${V85_SEL.animals} dieren (1 foto per dier), ${V85_SEL.clips} video's (max. ${V84_VLEN} s) en ${V85_SEL.moods} sfeerfoto's. De bijzonderste dieren komen los in beeld, de rest samen met een ander dier of een sfeerfoto. Bij meer kiest de app de bijzonderste; met de ster in het soortvenster geef je voorrang.</p></details>`}
{const prev=dayContent;dayContent=function(d){const h=prev(d);return daySection==='wildlife'?v85DayCard(d)+h:h}}
{const prev=renderWildlife;renderWildlife=function(){const h=prev();const at='<div class="ds-section-title">Logboek</div>';
  return h.includes(at)?h.replace(at,v85Card()+at):h}}
function v85Close(){if(v85Job)v85Job.cancel=true;const el=document.getElementById('v85Gen');if(el){el.remove();document.body.classList.remove('wl2-lock')}
  if(v85Out){(v85Out.items||[v85Out]).forEach(x=>{try{URL.revokeObjectURL(x.url)}catch(e){}try{x.out.cleanup?.()}catch(e){}});v85Out=null}try{v85Job?.lock?.release()}catch(e){}v85Job=null}
/* eerst kiezen: volledige of korte versie, liggend of staand */
const V85_OPT={short:false,fmt:'land'};
function v85Start(){v85Close();const proef=false,plan=v85Plan(),el=document.createElement('div');el.id='v85Gen';el.className='v85-gen';el.setAttribute('role','dialog');el.setAttribute('aria-label','Video kiezen');
  const len=sh=>{try{return v85Dur(v85Seconds(sh?v85Short(plan,proef):v85Segments(plan,proef)))}catch(e){return ''}},lf=len(false),ls=len(true);
  const draw=()=>{const vv=state.v9Video||{};el.innerHTML=`<div class="v85-box"><span class="ds-label">${proef?'Proefvideo':'Reisvideo'}</span><h3>Welke video?</h3>
    <div class="v9-titel"><label><span class="ds-meta">Titel</span><input class="field" data-v9v="title" maxlength="40" value="${esc(vv.title||'')}" placeholder="Costa Rica 2027"></label><label><span class="ds-meta">Namen (in de opening en aftiteling)</span><input class="field" data-v9v="names" maxlength="60" value="${esc(vv.names||'')}" placeholder="Bijv. Kevin &amp; …"></label></div>
    <div class="v85-opt" role="radiogroup" aria-label="Versie"><button data-o="full" aria-pressed="${!V85_OPT.short}" class="${V85_OPT.short?'':'on'}"><b>Volledig</b><small>alle dagen · ca. ${lf}</small></button><button data-o="short" aria-pressed="${V85_OPT.short}" class="${V85_OPT.short?'on':''}"><b>Kort</b><small>hoogtepunten · ca. ${ls}</small></button></div>
    <div class="v85-opt three" role="radiogroup" aria-label="Formaat">${[['land','Liggend 16:9','tv, laptop'],['port','Staand 9:16','telefoon, status'],['both','Beide','16:9 én 9:16']].map(([k,l,sub])=>`<button data-f="${k}" aria-pressed="${V85_OPT.fmt===k}" class="${V85_OPT.fmt===k?'on':''}"><b>${l}</b><small>${sub}</small></button>`).join('')}</div>
    <div class="v85-btns"><button class="ds-btn primary" data-v85="go">Video maken</button><button class="ds-btn secondary" data-v85="close">Annuleren</button></div></div>`;
    el.querySelectorAll('[data-v9v]').forEach(inp=>inp.oninput=()=>{state.v9Video={...(state.v9Video||{}),[inp.dataset.v9v]:inp.value.slice(0,60)};save()});
    el.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{V85_OPT.short=b.dataset.o==='short';draw()});el.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{V85_OPT.fmt=b.dataset.f;draw()});
    el.querySelector('[data-v85="close"]').onclick=v85Close;el.querySelector('[data-v85="go"]').onclick=()=>{el.remove();v85Run({...V85_OPT})}};
  draw();document.body.append(el);document.body.classList.add('wl2-lock')}
async function v85Run(opt={}){v85Close();const proef=false,job={cancel:false};v85Job=job;
  const fmts=opt.fmt==='both'?['land','port']:[opt.fmt==='port'||opt.portrait?'port':'land'];
  const el=document.createElement('div');el.id='v85Gen';el.className='v85-gen';el.setAttribute('role','dialog');el.setAttribute('aria-label',proef?'Proefvideo maken':'Reisvideo maken');
  el.innerHTML=`<div class="v85-box"><span class="ds-label">${proef?'Proefvideo':'Reisvideo'}</span><h3>Video maken…</h3><div class="v85-bar"><i></i></div><p class="v85-st ds-meta" aria-live="polite">Voorbereiden</p><p class="ds-meta">Houd de app open en het scherm aan.</p><div class="v85-btns"><button class="ds-btn secondary" data-v85="close">Annuleren</button></div></div>`;
  document.body.append(el);document.body.classList.add('wl2-lock');el.querySelector('[data-v85="close"]').onclick=v85Close;
  try{job.lock=await navigator.wakeLock?.request('screen')}catch(e){}
  const bar=el.querySelector('.v85-bar i'),st=el.querySelector('.v85-st'),items=[];
  try{for(let i=0;i<fmts.length;i++){const portrait=fmts[i]==='port',lbl=fmts.length>1?(portrait?'9:16 · ':'16:9 · '):'';
      const out=await v85Make({proef,job,short:!!opt.short,portrait,onProgress:(f,ms)=>{const g=(i+f)/fmts.length;bar.style.width=Math.round(g*100)+'%';const left=f>.04?ms/f*(1-f)/1000:0;
        st.textContent=`${lbl}${Math.round(f*100)}%${left?` · nog ca. ${left<60?Math.max(5,Math.round(left/5)*5)+' s':Math.round(left/60)+' min'}`:''}`}});
      if(job.cancel||v85Job!==job)return;
      const name=`costa-rica-2027-${proef?'proefvideo':'reisvideo'}${opt.short?'-kort':''}${portrait?'-staand':''}.${out.ext}`,file=new File([out.blob],name,{type:out.type});
      items.push({url:URL.createObjectURL(out.blob),file,out,portrait})}
    try{job.lock?.release()}catch(e){}
    v85Out={...items[0],items};const files=items.map(x=>x.file),canShare=!!(navigator.canShare&&navigator.canShare({files}));
    el.querySelector('.v85-box').innerHTML=`<span class="ds-label">${proef?'Proefvideo':'Reisvideo'} klaar</span><video class="v85-vid ${items[0].portrait?'port':''}" src="${items[0].url}" controls playsinline preload="metadata"></video>
      ${items.map((x,i)=>{const mb=(x.out.blob.size/1048576).toFixed(x.out.blob.size<1048576*10?1:0);return `<div class="v85-file"><div><b>${x.portrait?'Staand 9:16':'Liggend 16:9'}</b><small>${x.out.ext.toUpperCase()} · ${x.portrait?'1080×1920':'1920×1080'} · ${v85Dur(x.out.seconds)} · ${mb} MB</small></div>
        <div class="v85-btns">${canShare?`<button class="ds-btn primary" data-v85-share="${i}">${dsdI('download',18)}Opslaan of delen</button>`:''}<a class="ds-btn ${canShare?'secondary':'primary'}" href="${x.url}" download="${x.file.name}">Downloaden</a></div></div>`}).join('')}
      ${items.length>1&&canShare?`<button class="ds-btn secondary" data-v85-share="all">Beide tegelijk opslaan of delen</button>`:''}
      <div class="v85-btns"><button class="ds-btn secondary" data-v85="close">Sluiten</button></div>
      <p class="ds-meta">Kies bij "Opslaan of delen" voor "Bewaar video" om hem in Foto’s te zetten.</p>`;
    el.querySelectorAll('[data-v85="close"]').forEach(b=>b.onclick=v85Close);
    el.querySelectorAll('[data-v85-share]').forEach(b=>b.onclick=async()=>{const k=b.dataset.v85Share,fs=k==='all'?files:[files[+k]];try{await navigator.share({files:fs,title:'Costa Rica 2027'})}catch(e){}})}
  catch(e){if(job.cancel)return;try{job.lock?.release()}catch(x){}items.forEach(x=>{try{URL.revokeObjectURL(x.url)}catch(e){}});
    st.textContent='Video maken mislukt: '+e.message;el.querySelector('h3').textContent='Niet gelukt';el.querySelector('[data-v85="close"]').textContent='Sluiten'}}
{const prev=bind;bind=function(){prev();const g=document.getElementById('v85go');if(g)g.onclick=v85Start}}
